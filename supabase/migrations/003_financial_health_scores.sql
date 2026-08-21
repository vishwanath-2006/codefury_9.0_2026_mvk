-- =====================================================================
-- FinLabs Step 3 Migration Script: Financial Health Scores Persistence
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.financial_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  savings_score integer NOT NULL CHECK (savings_score >= 0 AND savings_score <= 20),
  emergency_fund_score integer NOT NULL CHECK (emergency_fund_score >= 0 AND emergency_fund_score <= 20),
  debt_score integer NOT NULL CHECK (debt_score >= 0 AND debt_score <= 20),
  goal_score integer NOT NULL CHECK (goal_score >= 0 AND goal_score <= 15),
  diversification_score integer NOT NULL CHECK (diversification_score >= 0 AND diversification_score <= 15),
  financial_safety_score integer NOT NULL CHECK (financial_safety_score >= 0 AND financial_safety_score <= 10),
  data_completeness integer NOT NULL CHECK (data_completeness >= 0 AND data_completeness <= 100),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT financial_health_scores_user_id_key UNIQUE (user_id)
);

-- RLS Enablement
ALTER TABLE public.financial_health_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view, insert, or update their own score records
DROP POLICY IF EXISTS "scores_select_own" ON public.financial_health_scores;
CREATE POLICY "scores_select_own" ON public.financial_health_scores FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_insert_own" ON public.financial_health_scores;
CREATE POLICY "scores_insert_own" ON public.financial_health_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update_own" ON public.financial_health_scores;
CREATE POLICY "scores_update_own" ON public.financial_health_scores FOR UPDATE
  USING (auth.uid() = user_id);
