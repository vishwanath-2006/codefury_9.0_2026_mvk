-- =====================================================================
-- FinLabs Step 6 Migration Script: Complete Onboarding & Profile Persistence Schema
-- =====================================================================

-- 1. Upgrade public.profiles table to include onboarding personal details
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dependents integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income_stability text;

-- 2. Upgrade public.financial_profiles table to ensure all typed fields exist
CREATE TABLE IF NOT EXISTS public.financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed boolean DEFAULT true,

  -- Step 1: Personal & Identity
  full_name text,
  age integer,
  employment_status text,
  occupation text,
  dependents integer DEFAULT 0,
  income_stability text,

  -- Step 2: Cash Flow, Savings & Debt
  monthly_income numeric DEFAULT 0,
  other_income numeric DEFAULT 0,
  monthly_essential_expenses numeric DEFAULT 0,
  monthly_discretionary_expenses numeric DEFAULT 0,
  monthly_expenses numeric DEFAULT 0,
  current_savings numeric DEFAULT 0,
  emergency_fund numeric DEFAULT 0,
  monthly_savings numeric DEFAULT 0,
  has_debt boolean DEFAULT false,
  total_debt numeric DEFAULT 0,
  monthly_debt_payments numeric DEFAULT 0,
  debt_type text DEFAULT 'N/A',

  -- Step 3: Investments, Insurance & Risk Profile
  goals jsonb DEFAULT '[]'::jsonb,
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

-- Ensure any missing columns exist if table was previously created
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS investment_experience text;
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS has_health_insurance boolean DEFAULT false;
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS has_life_insurance boolean DEFAULT false;

-- 3. Create public.financial_goals Table for Multiple Relational User Goals
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name text NOT NULL,
  category text DEFAULT 'General',
  target_amount numeric DEFAULT 0,
  current_saved numeric DEFAULT 0,
  target_year text,
  priority text DEFAULT 'Medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create public.onboarding_responses Table to Preserve Raw Onboarding Answers
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT onboarding_responses_user_id_key UNIQUE (user_id)
);

-- 5. Row Level Security (RLS) Enablement Across All Schema Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- 6. Row Level Security (RLS) Policies

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR auth.uid() = user_id);

-- Financial Profiles Policies
DROP POLICY IF EXISTS "profiles_fin_select_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_select_own" ON public.financial_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_fin_insert_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_insert_own" ON public.financial_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_fin_update_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_update_own" ON public.financial_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_fin_delete_own" ON public.financial_profiles;
CREATE POLICY "profiles_fin_delete_own" ON public.financial_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Financial Goals Policies
DROP POLICY IF EXISTS "goals_select_own" ON public.financial_goals;
CREATE POLICY "goals_select_own" ON public.financial_goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_insert_own" ON public.financial_goals;
CREATE POLICY "goals_insert_own" ON public.financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_update_own" ON public.financial_goals;
CREATE POLICY "goals_update_own" ON public.financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_delete_own" ON public.financial_goals;
CREATE POLICY "goals_delete_own" ON public.financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Onboarding Responses Policies
DROP POLICY IF EXISTS "responses_select_own" ON public.onboarding_responses;
CREATE POLICY "responses_select_own" ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "responses_insert_own" ON public.onboarding_responses;
CREATE POLICY "responses_insert_own" ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "responses_update_own" ON public.onboarding_responses;
CREATE POLICY "responses_update_own" ON public.onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "responses_delete_own" ON public.onboarding_responses;
CREATE POLICY "responses_delete_own" ON public.onboarding_responses FOR DELETE
  USING (auth.uid() = user_id);
