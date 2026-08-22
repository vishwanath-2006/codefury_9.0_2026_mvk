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
 * AUTHORITATIVE SINGLE SOURCE OF TRUTH RESOLVER
 * RULE 1: If authenticated user has a saved completed financial_profiles record in Supabase -> USE IT.
 * RULE 2: If user does NOT have a saved completed profile -> USE initialOnboardingData fallback.
 */
export async function getNormalizedFinancialProfile(userId) {
  const raw = await getFinancialProfile(userId);

  if (raw && (raw.onboarding_completed || raw.monthly_income != null || raw.monthlyIncome != null)) {
    const monthlyIncome = Number(raw.monthly_income ?? raw.monthlyIncome) || 50000;
    const monthlyEssentialExpenses = Number(raw.monthly_essential_expenses ?? raw.monthlyEssentialExpenses) || 25000;
    const monthlyDiscretionaryExpenses = Number(raw.monthly_discretionary_expenses ?? raw.monthlyDiscretionaryExpenses) || 10000;
    const monthlyExpenses = Number(raw.monthly_expenses ?? raw.monthlyExpenses) || (monthlyEssentialExpenses + monthlyDiscretionaryExpenses);
    const monthlyDebtPayments = Number(raw.monthly_debt_payments ?? raw.monthlyDebtPayments) || 0;
    const emergencyFund = Number(raw.emergency_fund ?? raw.emergencyFund) || 100000;
    const currentSavings = Number(raw.current_savings ?? raw.currentSavings) || 150000;
    const riskProfile = raw.risk_tolerance || raw.riskTolerance || 'Moderate';
    const onboardingCompleted = Boolean(raw.onboarding_completed || raw.onboardingCompleted);

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyEssentialExpenses,
      monthlyDiscretionaryExpenses,
      monthlyDebtPayments,
      emergencyFund,
      currentSavings,
      riskProfile,
      goals: raw.goals || initialOnboardingData.goals,
      onboardingCompleted,
      raw
    };
  }

  // Baseline Fallback: Use initialOnboardingData
  const fallbackIncome = Number(initialOnboardingData.monthlyIncome) || 50000;
  const fallbackEssential = Number(initialOnboardingData.monthlyEssentialExpenses) || 25000;
  const fallbackDiscretionary = Number(initialOnboardingData.monthlyDiscretionaryExpenses) || 10000;
  const fallbackExpenses = fallbackEssential + fallbackDiscretionary; // 35000

  return {
    monthlyIncome: fallbackIncome,
    monthlyExpenses: fallbackExpenses,
    monthlyEssentialExpenses: fallbackEssential,
    monthlyDiscretionaryExpenses: fallbackDiscretionary,
    monthlyDebtPayments: 0,
    emergencyFund: Number(initialOnboardingData.emergencyFund) || 100000,
    currentSavings: Number(initialOnboardingData.currentSavings) || 150000,
    riskProfile: initialOnboardingData.riskTolerance || 'Moderate',
    goals: initialOnboardingData.goals,
    onboardingCompleted: false,
    raw: null
  };
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
    has_debt: Boolean(formData.hasDebt),
    total_debt: Number(formData.totalDebt) || 0,
    monthly_debt_payments: Number(formData.monthlyDebtPayments) || 0,

    // Step 3: Risk & Preferences
    investment_experience: expEnum,
    has_health_insurance: Boolean(formData.hasHealthInsurance),
    has_life_insurance: Boolean(formData.hasLifeInsurance),
    time_horizon: formData.timeHorizon || '5–10 years',
    risk_tolerance: formData.riskTolerance || 'Moderate',

    updated_at: new Date().toISOString()
  };

  try {
    // 1. Update profiles table full_name
    if (userId && formData.fullName) {
      await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: formData.fullName, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    }

    // 2. Upsert financial_profiles
    const { data: finData, error: finErr } = await supabase
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (finErr) {
      console.warn('Upsert financial profile notice:', finErr.message);
    }

    // 3. Upsert relational financial_goals
    if (userId && Array.isArray(formData.goals)) {
      const goalsPayload = formData.goals.map((g) => ({
        user_id: userId,
        goal_name: g.title || g.goal_name || 'Financial Goal',
        category: g.category || 'General',
        target_amount: Number(g.targetAmount || g.target_amount) || 0,
        current_saved: Number(g.currentAmount || g.current_saved) || 0,
        target_year: String(g.deadline || g.target_year || '2027'),
        priority: g.priority || 'Medium'
      }));

      const { error: goalsErr } = await supabase
        .from('financial_goals')
        .upsert(goalsPayload, { onConflict: 'user_id, goal_name' });

      if (goalsErr) {
        console.warn('Upsert goals notice:', goalsErr.message);
      }
    }

    // Save to local storage as fallback
    try {
      localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(formData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // Calculate and persist updated score
    const diagnostic = calculateFinancialHealthScore({
      monthlyIncome: payload.monthly_income,
      monthlyExpenses: payload.monthly_expenses,
      monthlyEssentialExpenses: payload.monthly_essential_expenses,
      emergencyFund: payload.emergency_fund,
      monthlyDebtPayments: payload.monthly_debt_payments,
      goals: formData.goals || [],
      portfolioAllocation: [],
      safetyData: {
        hasHealthInsurance: payload.has_health_insurance,
        hasLifeInsurance: payload.has_life_insurance
      }
    });

    if (userId) {
      await saveFinancialHealthScore(userId, diagnostic);
    }

    return {
      formData,
      healthScore: diagnostic.overallScore,
      riskProfile: formData.riskTolerance || 'Moderate',
      completedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error saving financial profile:', err);
    throw err;
  }
}

export function getSavedOnboardingProfile() {
  try {
    const stored = localStorage.getItem('finlabs_dev_onboarding_profile');
    if (stored) {
      const formData = JSON.parse(stored);
      const diagnostic = calculateFinancialHealthScore({
        monthlyIncome: Number(formData.monthlyIncome) || 50000,
        monthlyExpenses: (Number(formData.monthlyEssentialExpenses) || 25000) + (Number(formData.monthlyDiscretionaryExpenses) || 10000),
        monthlyEssentialExpenses: Number(formData.monthlyEssentialExpenses) || 25000,
        emergencyFund: Number(formData.emergencyFund) || 100000,
        monthlyDebtPayments: Number(formData.monthlyDebtPayments) || 0,
        goals: formData.goals || [],
        portfolioAllocation: [],
        safetyData: {
          hasHealthInsurance: Boolean(formData.hasHealthInsurance),
          hasLifeInsurance: Boolean(formData.hasLifeInsurance)
        }
      });

      return {
        formData,
        healthScore: diagnostic.overallScore,
        riskProfile: formData.riskTolerance || 'Moderate',
        completedAt: new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn('LocalStorage load error:', e);
  }

  return {
    formData: initialOnboardingData,
    healthScore: 74,
    riskProfile: 'Moderate',
    completedAt: null
  };
}

export const saveOnboardingProfile = saveFinancialProfile;
