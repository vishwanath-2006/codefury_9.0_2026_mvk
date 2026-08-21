import { supabase } from '../lib/supabaseClient';
import { calculateFinancialHealthScore } from './financialHealth/engine';
import { saveFinancialHealthScore } from './financialHealth/adapter';

export const initialOnboardingData = {
  fullName: '',
  age: '28',
  employmentStatus: 'Employed',
  occupation: 'Software Engineer',
  dependents: '0',
  incomeStability: 'Stable',
  monthlyIncome: '50000',
  otherIncome: '0',
  monthlyEssentialExpenses: '25000',
  monthlyDiscretionaryExpenses: '10000',
  currentSavings: '150000',
  emergencyFund: '100000',
  monthlySavings: '15000',
  hasDebt: false,
  totalDebt: '0',
  monthlyDebtPayments: '0',
  debtType: 'Home',
  goals: [
    { id: 'g1', title: 'Emergency Reserve Fund', targetAmount: 200000, currentAmount: 100000, deadline: '2026', priority: 'High' },
    { id: 'g2', title: 'Home Downpayment', targetAmount: 1000000, currentAmount: 300000, deadline: '2028', priority: 'Medium' }
  ],
  hasInvestments: true,
  investmentCategories: ['Mutual Funds', 'Stocks'],
  investmentExperience: 'some_experience',
  hasHealthInsurance: true,
  hasLifeInsurance: true,
  hasEmergencyFund: true,
  timeHorizon: '5–10 years',
  riskResponseFall20: 'Hold',
  investmentPriority: 'Balanced growth',
  riskTolerance: 'Moderate'
};

/**
 * Normalizes investment experience strings to supported enums: 'beginner', 'some_experience', 'experienced'
 */

export function normalizeInvestmentExperience(exp) {
  if (!exp) return 'beginner';
  const lower = String(exp).toLowerCase();
  if (lower.includes('beginner') || lower.includes('new')) return 'beginner';
  if (lower.includes('some')) return 'some_experience';
  if (lower.includes('experienced')) return 'experienced';
  return exp;
}

/**
 * Fetch financial profile, relational goals, and responses for authenticated user
 */
export async function getFinancialProfile(userId) {
  if (!userId || userId === 'dev-test-user-id-99999' || userId === 'dev-local-user') {
    try {
      const stored = localStorage.getItem('finlabs_dev_onboarding_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage parse error:', e);
    }
    return null;
  }

  try {
    // 1. Fetch main financial_profile
    const { data: finData, error: finErr } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finErr && finErr.code !== 'PGRST116') {
      console.warn('Fetch financial profile notice:', finErr.message);
    }

    // 2. Fetch relational financial_goals
    const { data: goalsData } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (finData) {
      // Map relational goals if present
      if (goalsData && goalsData.length > 0) {
        finData.goals = goalsData.map((g) => ({
          id: g.id,
          title: g.goal_name,
          category: g.category || 'General',
          targetAmount: Number(g.target_amount) || 0,
          currentAmount: Number(g.current_saved) || 0,
          deadline: g.target_year || '2027',
          priority: g.priority || 'Medium'
        }));
      }
      return finData;
    }

    // 3. Fallback check for local storage
    const stored = localStorage.getItem('finlabs_dev_onboarding_profile');
    if (stored) return JSON.parse(stored);
    return null;
  } catch (err) {
    console.error('Error fetching complete financial profile:', err);
    return null;
  }
}

/**
 * Save / update 3-step onboarding questionnaire data into Supabase across tables:
 * - public.profiles
 * - public.financial_profiles
 * - public.financial_goals
 * - public.onboarding_responses
 */
export async function saveFinancialProfile(userId, formData) {
  const monthlyEssential = Number(formData.monthlyEssentialExpenses) || 0;
  const monthlyDiscretionary = Number(formData.monthlyDiscretionaryExpenses) || 0;
  const computedMonthlyExpenses = monthlyEssential + monthlyDiscretionary;
  const expEnum = normalizeInvestmentExperience(formData.investmentExperience);

  const payload = {
    user_id: userId || 'dev-local-user',
    onboarding_completed: true,

    // Step 1: Identity & Personal Details
    full_name: formData.fullName || '',
    age: Number(formData.age) || null,
    employment_status: formData.employmentStatus || 'Employed',
    occupation: formData.occupation || '',
    dependents: Number(formData.dependents) || 0,
    income_stability: formData.incomeStability || 'Stable',

    // Step 2: Cash Flow, Savings & Debt
    monthly_income: Number(formData.monthlyIncome) || 0,
    other_income: Number(formData.otherIncome) || 0,
    monthly_essential_expenses: monthlyEssential,
    monthly_discretionary_expenses: monthlyDiscretionary,
    monthly_expenses: computedMonthlyExpenses,
    current_savings: Number(formData.currentSavings) || 0,
    emergency_fund: Number(formData.emergencyFund) || 0,
    monthly_savings: Number(formData.monthlySavings) || 0,
    has_debt: Boolean(formData.hasDebt),
    total_debt: formData.hasDebt ? Number(formData.totalDebt) || 0 : 0,
    monthly_debt_payments: formData.hasDebt ? Number(formData.monthlyDebtPayments) || 0 : 0,
    debt_type: formData.hasDebt ? formData.debtType || 'N/A' : 'N/A',

    // Step 3: Goals, Investments, Insurance & Risk Profile
    goals: Array.isArray(formData.goals) ? formData.goals : [],
    has_investments: Boolean(formData.hasInvestments),
    investment_categories: Array.isArray(formData.investmentCategories) ? formData.investmentCategories : [],
    investment_experience: expEnum,
    has_health_insurance: Boolean(formData.hasHealthInsurance),
    has_life_insurance: Boolean(formData.hasLifeInsurance),
    has_emergency_fund: Boolean(formData.hasEmergencyFund),
    time_horizon: formData.timeHorizon || '3–5 years',
    risk_response_fall_20: formData.riskResponseFall20 || 'Hold',
    investment_priority: formData.investmentPriority || 'Balanced growth',
    risk_tolerance: formData.riskTolerance || 'Moderate',
    updated_at: new Date().toISOString()
  };

  // Always update local storage for dev mode / instant local fallback
  localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(payload));

  if (!userId || userId === 'dev-test-user-id-99999' || userId === 'dev-local-user') {
    return payload;
  }

  try {
    // 1. Update public.profiles
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        user_id: userId,
        full_name: payload.full_name,
        age: payload.age,
        employment_status: payload.employment_status,
        occupation: payload.occupation,
        dependents: payload.dependents,
        income_stability: payload.income_stability,
        updated_at: payload.updated_at
      }, { onConflict: 'id' });

    // 2. Upsert public.financial_profiles
    const { data: finData, error: finErr } = await supabase
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (finErr) {
      console.warn('Supabase financial profile save notice:', finErr.message);
    }

    // 3. Save Relational Goals into public.financial_goals
    if (Array.isArray(formData.goals)) {
      try {
        await supabase.from('financial_goals').delete().eq('user_id', userId);

        if (formData.goals.length > 0) {
          const goalRows = formData.goals.map((g) => ({
            user_id: userId,
            goal_name: g.title || g.goal_name || 'Financial Goal',
            category: g.category || 'General',
            target_amount: Number(g.targetAmount || g.target_amount) || 0,
            current_saved: Number(g.currentAmount || g.current_saved) || 0,
            target_year: String(g.deadline || g.target_year || '2027'),
            priority: g.priority || 'Medium',
            updated_at: payload.updated_at
          }));

          await supabase.from('financial_goals').insert(goalRows);
        }
      } catch (goalErr) {
        console.warn('Financial goals save notice:', goalErr.message);
      }
    }

    // 4. Save Raw Onboarding Answers into public.onboarding_responses
    try {
      await supabase
        .from('onboarding_responses')
        .upsert({
          user_id: userId,
          raw_responses: formData,
          updated_at: payload.updated_at
        }, { onConflict: 'user_id' });
    } catch (rawErr) {
      console.warn('Onboarding responses save notice:', rawErr.message);
    }

    // 5. Auto-trigger Financial Health Engine score calculation & persistence
    try {
      const healthInput = {
        monthlyIncome: payload.monthly_income + payload.other_income,
        monthlyExpenses: payload.monthly_expenses,
        monthlyEssentialExpenses: payload.monthly_essential_expenses,
        emergencyFund: payload.emergency_fund,
        monthlyDebtPayments: payload.monthly_debt_payments,
        goals: payload.goals,
        investmentCategories: payload.investment_categories,
        hasHealthInsurance: payload.has_health_insurance,
        hasLifeInsurance: payload.has_life_insurance
      };

      const diagnostic = calculateFinancialHealthScore(healthInput);
      await saveFinancialHealthScore(userId, diagnostic);
    } catch (engineErr) {
      console.warn('Financial Health Engine auto-trigger notice:', engineErr.message);
    }

    return finData || payload;
  } catch (err) {
    console.error('Error saving financial profile:', err);
    return payload;
  }
}

/**
 * Backward compatibility helpers for OnboardingContext
 */
export async function saveOnboardingProfile(formData) {
  return await saveFinancialProfile(null, formData);
}

export function getSavedOnboardingProfile() {
  try {
    const saved = localStorage.getItem('finlabs_dev_onboarding_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        formData: parsed,
        healthScore: 78,
        riskProfile: parsed.risk_tolerance || 'Moderate',
        completedAt: parsed.updated_at
      };
    }
  } catch (e) {
    console.error('Error reading onboarding profile:', e);
  }

  return {
    formData: initialOnboardingData,
    healthScore: 75,
    riskProfile: 'Moderate',
    completedAt: null
  };
}
