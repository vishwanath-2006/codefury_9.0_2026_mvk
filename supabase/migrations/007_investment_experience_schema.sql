-- =====================================================================
-- FinLabs Step 7 Migration Script: Investment Experience & Platforms Schema
-- =====================================================================

ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS previous_investment_amount numeric DEFAULT 0;
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS previous_investment_platforms text[] DEFAULT '{}'::text[];
ALTER TABLE public.financial_profiles ADD COLUMN IF NOT EXISTS previous_investment_other text;
