-- =====================================================================
-- CodeFury (codefury_9.0_2026_mvk) - Initial Database Migration Script
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ALL CREATE TABLE Statements
-- ---------------------------------------------------------------------

-- Profiles Table (Linked 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone_number text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Menu Items Table (with category_id + name UNIQUE constraint for idempotent seeding)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  tagline text,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0.00),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_category_name_key UNIQUE (category_id, name)
);

-- Orders Table (user_id is nullable for ON DELETE SET NULL audit preservation)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT 'Guest',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0.00),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  item_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0.00),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0.00)
);

-- ---------------------------------------------------------------------
-- 2. Storage Bucket Provisioning (menu-images)
-- ---------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------
-- 3. Indexes for Query Performance
-- ---------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);

-- ---------------------------------------------------------------------
-- 4. Helper Security Definer Functions for Role Checks
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ---------------------------------------------------------------------
-- 5. Maintenance, Trigger & RPC Functions
-- ---------------------------------------------------------------------

-- Automated updated_at Maintenance Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Automatic Profile Creation Trigger on New Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Role Tampering Guard Trigger Function
CREATE OR REPLACE FUNCTION public.prevent_role_self_modification()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only Administrators can modify user roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Collision-Safe Order Code Generator Function (Format: CF-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := 'CF-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6));
    SELECT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp;

-- Atomic Server-Side Checkout RPC Function (Supports Anonymous Auth & Registered Users)
CREATE OR REPLACE FUNCTION public.create_order_at_checkout(
  p_items jsonb,
  p_customer_name text DEFAULT 'Guest'
)
RETURNS jsonb AS $$
DECLARE
  v_order_id uuid;
  v_order_code text;
  v_total_amount numeric(10,2) := 0.00;
  v_item record;
  v_menu_item record;
  v_subtotal numeric(10,2);
BEGIN
  -- 1. Validate payload
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart items cannot be empty.';
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Active session required (Supabase Anonymous Guest Session or Registered User).';
  END IF;

  -- 2. Generate collision-safe order code
  v_order_code := public.generate_order_code();

  -- 3. Create parent order record with payment_status = 'pending'
  INSERT INTO public.orders (order_code, user_id, customer_name, status, payment_status, total_amount)
  VALUES (v_order_code, auth.uid(), p_customer_name, 'pending', 'pending', 0.00)
  RETURNING id INTO v_order_id;

  -- 4. Process line items atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id uuid, quantity int) LOOP
    IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid item quantity.';
    END IF;

    -- Fetch trusted unit price & name directly from menu_items table
    SELECT name, price, is_available INTO v_menu_item
    FROM public.menu_items WHERE id = v_item.menu_item_id;

    IF NOT FOUND OR NOT v_menu_item.is_available THEN
      RAISE EXCEPTION 'Item unavailable or invalid: %', v_item.menu_item_id;
    END IF;

    -- Calculate trusted line-item subtotal
    v_subtotal := v_menu_item.price * v_item.quantity;
    v_total_amount := v_total_amount + v_subtotal;

    -- Insert line item record
    INSERT INTO public.order_items (order_id, menu_item_id, item_name, unit_price, quantity, subtotal)
    VALUES (v_order_id, v_item.menu_item_id, v_menu_item.name, v_menu_item.price, v_item.quantity, v_subtotal);
  END LOOP;

  -- 5. Update final server-calculated order total
  UPDATE public.orders SET total_amount = v_total_amount WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'total_amount', v_total_amount,
    'status', 'pending',
    'payment_status', 'pending'
  );
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp;

-- Razorpay Order-ID Pre-Binding RPC
CREATE OR REPLACE FUNCTION public.bind_razorpay_order_id(
  p_order_id uuid,
  p_razorpay_order_id text
)
RETURNS boolean AS $$
DECLARE
  v_existing_razorpay_order_id text;
  v_payment_status text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Active session required.';
  END IF;

  IF p_razorpay_order_id IS NULL OR TRIM(p_razorpay_order_id) = '' THEN
    RAISE EXCEPTION 'Invalid Razorpay order ID.';
  END IF;

  SELECT payment_status, razorpay_order_id INTO v_payment_status, v_existing_razorpay_order_id
  FROM public.orders
  WHERE id = p_order_id AND (user_id = auth.uid() OR public.is_staff_or_admin());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or access denied.';
  END IF;

  IF v_payment_status = 'paid' THEN
    RAISE EXCEPTION 'Cannot bind Razorpay order ID to an already paid order.';
  END IF;

  IF v_existing_razorpay_order_id IS NOT NULL AND v_existing_razorpay_order_id <> p_razorpay_order_id THEN
    RAISE EXCEPTION 'Order is already bound to a different Razorpay order ID.';
  END IF;

  UPDATE public.orders
  SET razorpay_order_id = p_razorpay_order_id
  WHERE id = p_order_id AND (user_id = auth.uid() OR public.is_staff_or_admin());

  RETURN true;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public, pg_temp;

-- ---------------------------------------------------------------------
-- 6. Triggers
-- ---------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_prevent_role_self_modification ON public.profiles;
CREATE TRIGGER trg_prevent_role_self_modification
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_modification();

-- ---------------------------------------------------------------------
-- 7. Row Level Security (RLS) Enablement & Policies
-- ---------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

-- Categories RLS Policies (Public Read Active, Staff/Admin Write)
DROP POLICY IF EXISTS "categories_select" ON public.categories;
CREATE POLICY "categories_select" ON public.categories FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "categories_write" ON public.categories;
CREATE POLICY "categories_write" ON public.categories FOR ALL
  USING (public.is_staff_or_admin());

-- Menu Items RLS Policies (Public Read Available, Staff/Admin Write)
DROP POLICY IF EXISTS "menu_items_select" ON public.menu_items;
CREATE POLICY "menu_items_select" ON public.menu_items FOR SELECT
  USING (is_available = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "menu_items_write" ON public.menu_items;
CREATE POLICY "menu_items_write" ON public.menu_items FOR ALL
  USING (public.is_staff_or_admin());

-- Orders RLS Policies
DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select" ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff_or_admin());

-- Direct INSERT on orders denied for clients; forces use of create_order_at_checkout RPC
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_staff" ON public.orders;
CREATE POLICY "orders_insert_staff" ON public.orders FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "orders_update" ON public.orders;
CREATE POLICY "orders_update" ON public.orders FOR UPDATE
  USING (public.is_staff_or_admin());

-- Order Items RLS Policies
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_staff_or_admin())
  ));

-- Storage Bucket Policies (storage.objects)
DROP POLICY IF EXISTS "storage_menu_images_select" ON storage.objects;
CREATE POLICY "storage_menu_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "storage_menu_images_write" ON storage.objects;
CREATE POLICY "storage_menu_images_write" ON storage.objects FOR ALL
  USING (bucket_id = 'menu-images' AND public.is_staff_or_admin());

-- ---------------------------------------------------------------------
-- 8. Realtime Publication Configuration
-- ---------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 9. Explicit Function Permissions (GRANT / REVOKE)
-- ---------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_at_checkout(jsonb, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.bind_razorpay_order_id(uuid, text) TO authenticated, anon;

-- ---------------------------------------------------------------------
-- 10. Initial Seed Data (Categories & Menu Items - Idempotent)
-- ---------------------------------------------------------------------

INSERT INTO public.categories (name, slug, display_order, is_active) VALUES
  ('Fit-Ware 2.0', 'fit-ware-2-0', 1, true),
  ('Chaats.js', 'chaats-js', 2, true),
  ('Liquid Brews', 'liquid-brews', 3, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, tagline, description, price, is_available)
SELECT c.id, 'Nitro Processed Coffee', 'Overclocked Caffeine for 10x productivity', 'Rich dark nitro coffee with creamy foam overlay.', 180.00, true
FROM public.categories c WHERE c.slug = 'liquid-brews'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, tagline, description, price, is_available)
SELECT c.id, 'Bandwidth Berry Soda', 'High-Bandwidth Berry Blend for peak streaming', 'Vibrant berry blend infused with carbonated soda.', 145.00, true
FROM public.categories c WHERE c.slug = 'liquid-brews'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, tagline, description, price, is_available)
SELECT c.id, 'Latency-Free Lemonade', 'Low-Latency Hydration for instant refreshing', 'Refreshing citrus lemonade with fresh mint leaves.', 120.00, true
FROM public.categories c WHERE c.slug = 'liquid-brews'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, tagline, description, price, is_available)
SELECT c.id, 'Kernel-Level Kokum', 'Root-access cooling with deep berry logic', 'Traditional kokum beverage with cooling digestive spices.', 160.00, true
FROM public.categories c WHERE c.slug = 'liquid-brews'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO public.menu_items (category_id, name, tagline, description, price, is_available)
SELECT c.id, 'Tech Chaat Samosa', 'Crispy algorithmic samosa with mint chutney', 'Golden fried potato samosa served with spicy tangy chutneys.', 90.00, true
FROM public.categories c WHERE c.slug = 'chaats-js'
ON CONFLICT (category_id, name) DO NOTHING;
