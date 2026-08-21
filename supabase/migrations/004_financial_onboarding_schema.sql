-- =====================================================================
-- FinLabs Step 4 Migration Script: Financial Onboarding Profile Schema
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed boolean DEFAULT true,
  
  -- Step 1: Personal & Cash Flow
  full_name text,
  age integer,
  employment_status text,
  occupation text,
  dependents integer DEFAULT 0,
  monthly_income numeric DEFAULT 0,
  other_income numeric DEFAULT 0,
  income_stability text,
  monthly_essential_expenses numeric DEFAULT 0,
  monthly_discretionary_expenses numeric DEFAULT 0,
  monthly_expenses numeric DEFAULT 0,

  -- Step 2: Savings, Debt & Goals
  current_savings numeric DEFAULT 0,
  emergency_fund numeric DEFAULT 0,
  monthly_savings numeric DEFAULT 0,
  has_debt boolean DEFAULT false,
  total_debt numeric DEFAULT 0,
  monthly_debt_payments numeric DEFAULT 0,
  debt_type text,
  goals jsonb DEFAULT '[]'::jsonb,

  -- Step 3: Investments, Safety & Risk Profile
  has_investments boolean DEFAULT false,
  investment_categories jsonb DEFAULT '[]'::jsonb,
  investment_experience text,
  has_health_insurance boolean DEFAULT false,
  has_life_insurance boolean DEFAULT false,
  has_emergency_fund boolean DEFAULT false,
  time_horizon text,
  risk_response_fall_20 text,
  investment_priority text,
  risk_tolerance text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT financial_profiles_user_id_key UNIQUE (user_id)
);

-- RLS Enablement
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view, insert, or update their own financial profile
DROP POLICY IF EXISTS "profiles_fin_select_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_select_own" ON public.financial_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_fin_insert_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_insert_own" ON public.financial_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_fin_update_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_update_own" ON public.financial_profiles FOR UPDATE
  USING (auth.uid() = user_id);
