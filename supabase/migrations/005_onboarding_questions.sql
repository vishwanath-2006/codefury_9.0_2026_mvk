-- =====================================================================
-- SQL Script: Create and Populate Onboarding Questions Table in Supabase
-- =====================================================================

-- 1. Create Onboarding Questions Table
CREATE TABLE IF NOT EXISTS public.onboarding_questions (
    id SERIAL PRIMARY KEY,
    step INT NOT NULL,
    field_key VARCHAR(100) NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    options JSONB DEFAULT NULL,
    helper_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS select policy so any user can fetch the questions
DROP POLICY IF EXISTS "Allow public read access" ON public.onboarding_questions;
CREATE POLICY "Allow public read access" 
ON public.onboarding_questions FOR SELECT 
TO public 
USING (true);

-- 4. Populate questions data
INSERT INTO public.onboarding_questions (step, field_key, question_text, category, input_type, options, helper_text) 
VALUES
  (
    1, 
    'fullName', 
    'Full Name', 
    'Identity', 
    'text', 
    NULL, 
    'Your official name'
  ),
  (
    1, 
    'age', 
    'Age', 
    'Identity', 
    'number', 
    NULL, 
    'Minimum age is 18 years'
  ),
  (
    1, 
    'employmentStatus', 
    'Employment Status', 
    'Identity', 
    'select', 
    '["Employed", "Self-Employed", "Business", "Student", "Retired"]'::jsonb, 
    'Primary employment status'
  ),
  (
    1, 
    'occupation', 
    'Occupation / Industry', 
    'Identity', 
    'text', 
    NULL, 
    'Industry or work role description'
  ),
  (
    1, 
    'dependents', 
    'Financial Dependents', 
    'Identity', 
    'stepper', 
    '["0", "1", "2", "3", "4+"]'::jsonb, 
    'Number of family members relying on your income'
  ),
  (
    1, 
    'incomeStability', 
    'Income Stability', 
    'Identity', 
    'select', 
    '["Stable", "Mostly stable", "Variable", "Highly variable"]'::jsonb, 
    'Consistency of monthly cash inflows'
  ),
  (
    2, 
    'monthlyIncome', 
    'Monthly Take-Home Income (₹)', 
    'Cash Flow', 
    'number', 
    NULL, 
    'Primary take-home pay after tax & deductions'
  ),
  (
    2, 
    'otherIncome', 
    'Other Monthly Income (₹)', 
    'Cash Flow', 
    'number', 
    NULL, 
    'Dividends, side hustles, rental income'
  ),
  (
    2, 
    'monthlyEssentialExpenses', 
    'Essential Monthly Expenses (₹)', 
    'Expenses', 
    'number', 
    NULL, 
    'Rent, groceries, utility payments'
  ),
  (
    2, 
    'monthlyDiscretionaryExpenses', 
    'Discretionary Expenses (₹)', 
    'Expenses', 
    'number', 
    NULL, 
    'Lifestyle spending, dining out, subscriptions'
  ),
  (
    2, 
    'currentSavings', 
    'Current Total Savings (₹)', 
    'Savings', 
    'number', 
    NULL, 
    'Liquid reserves in savings/current accounts'
  ),
  (
    2, 
    'emergencyFund', 
    'Emergency Reserve (₹)', 
    'Savings', 
    'number', 
    NULL, 
    'Balances kept specifically for contingencies'
  ),
  (
    2, 
    'monthlySavings', 
    'Monthly Savings Target (₹)', 
    'Savings', 
    'number', 
    NULL, 
    'Recurring amount saved or invested every month'
  ),
  (
    2, 
    'hasDebt', 
    'Do you currently have active debt?', 
    'Debt', 
    'boolean', 
    '["No", "Yes"]'::jsonb, 
    'Credit cards, personal loans, or EMIs'
  ),
  (
    2, 
    'totalDebt', 
    'Total Outstanding Debt (₹)', 
    'Debt', 
    'number', 
    NULL, 
    'Outstanding liabilities (Home, Car, Personal)'
  ),
  (
    2, 
    'monthlyDebtPayments', 
    'Monthly Debt Payment / EMI (₹)', 
    'Debt', 
    'number', 
    NULL, 
    'Total sum paid as loan EMIs'
  ),
  (
    2, 
    'debtType', 
    'Primary Debt Type', 
    'Debt', 
    'select', 
    '["Education", "Home", "Vehicle", "Personal", "Credit Card", "Other"]'::jsonb, 
    'Largest source of liability'
  ),
  (
    3, 
    'goals', 
    'Add Active Financial Goals', 
    'Goals', 
    'list', 
    NULL, 
    'Targets, target amounts, current amount, and deadlines'
  ),
  (
    3, 
    'hasInvestments', 
    'Do you currently invest?', 
    'Investments', 
    'boolean', 
    '["No", "Yes"]'::jsonb, 
    'Active equity, index, or debt footprint'
  ),
  (
    3, 
    'investmentCategories', 
    'Select Active Investment Categories', 
    'Investments', 
    'multi-select', 
    '["Mutual Funds", "Stocks", "Fixed Deposits", "Gold", "Bonds", "Real Estate", "Other"]'::jsonb, 
    'Asset classes you own'
  ),
  (
    3, 
    'investmentExperience', 
    'Investment Experience Level', 
    'Investments', 
    'select', 
    '["Beginner", "Some experience", "Experienced"]'::jsonb, 
    'Time elapsed since starting investing'
  ),
  (
    3, 
    'timeHorizon', 
    'How long do you plan to keep investments?', 
    'Risk Profile', 
    'select', 
    '["<1 year", "1–3 years", "3–5 years", "5–10 years"]'::jsonb, 
    'Planned holding period'
  ),
  (
    3, 
    'riskResponseFall20', 
    'Imagine your investment falls 20%. What would you do?', 
    'Risk Profile', 
    'select', 
    '["Invest more", "Hold", "Sell some", "Sell immediately"]'::jsonb, 
    'Behavioral volatility reaction'
  ),
  (
    3, 
    'riskTolerance', 
    'How comfortable are you with volatility?', 
    'Risk Profile', 
    'select', 
    '["Low", "Moderate", "High"]'::jsonb, 
    'Risk appetite score'
  ),
  (
    3, 
    'hasHealthInsurance', 
    'Do you have Health Insurance?', 
    'Insurance', 
    'boolean', 
    '["No", "Yes"]'::jsonb, 
    'Medical coverage'
  ),
  (
    3, 
    'hasLifeInsurance', 
    'Do you have Term / Life Insurance?', 
    'Insurance', 
    'boolean', 
    '["No", "Yes"]'::jsonb, 
    'Life coverage'
  )
ON CONFLICT (field_key) 
DO UPDATE SET 
    step = EXCLUDED.step,
    question_text = EXCLUDED.question_text,
    category = EXCLUDED.category,
    input_type = EXCLUDED.input_type,
    options = EXCLUDED.options,
    helper_text = EXCLUDED.helper_text;
