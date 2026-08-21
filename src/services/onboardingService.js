import { supabase } from '../lib/supabaseClient';
import { calculateFinancialHealthScore } from './financialHealth/engine';
import { saveFinancialHealthScore } from './financialHealth/adapter';

/**
 * Fetch financial profile for authenticated user
 */
export async function getFinancialProfile(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Fetch financial profile notice:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Error fetching financial profile:', err);
    return null;
  }
}

/**
 * Save / update 3-step onboarding questionnaire data
 */
export async function saveFinancialProfile(userId, formData) {
  if (!userId) {
    // In local dev test mode without Supabase connection, store in localStorage
    localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(formData));
    return formData;
  }

  const monthlyEssential = Number(formData.monthlyEssentialExpenses) || 0;
  const monthlyDiscretionary = Number(formData.monthlyDiscretionaryExpenses) || 0;
  const computedMonthlyExpenses = monthlyEssential + monthlyDiscretionary;

  const payload = {
    user_id: userId,
    onboarding_completed: true,

    // Step 1
    full_name: formData.fullName || '',
    age: Number(formData.age) || null,
    employment_status: formData.employmentStatus || 'Employed',
    occupation: formData.occupation || '',
    dependents: Number(formData.dependents) || 0,
    monthly_income: Number(formData.monthlyIncome) || 0,
    other_income: Number(formData.otherIncome) || 0,
    income_stability: formData.incomeStability || 'Stable',
    monthly_essential_expenses: monthlyEssential,
    monthly_discretionary_expenses: monthlyDiscretionary,
    monthly_expenses: computedMonthlyExpenses,

    // Step 2
    current_savings: Number(formData.currentSavings) || 0,
    emergency_fund: Number(formData.emergencyFund) || 0,
    monthly_savings: Number(formData.monthlySavings) || 0,
    has_debt: Boolean(formData.hasDebt),
    total_debt: Number(formData.totalDebt) || 0,
    monthly_debt_payments: Number(formData.monthlyDebtPayments) || 0,
    debt_type: formData.debtType || null,
    goals: formData.goals || [],

    // Step 3
    has_investments: Boolean(formData.hasInvestments),
    investment_categories: formData.investmentCategories || [],
    investment_experience: formData.investmentExperience || 'Beginner',
    has_health_insurance: Boolean(formData.hasHealthInsurance),
    has_life_insurance: Boolean(formData.hasLifeInsurance),
    has_emergency_fund: Boolean(formData.hasEmergencyFund),
    time_horizon: formData.timeHorizon || '3–5 years',
    risk_response_fall_20: formData.riskResponseFall20 || 'Hold',
    investment_priority: formData.investmentPriority || 'Balanced growth',
    risk_tolerance: formData.riskTolerance || 'Moderate',

    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase onboarding save notice:', error.message);
      // Fallback to localStorage
      localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(formData));
    }

    // Automatically recalculate and update Financial Health Score
    const engineInput = {
      monthlyIncome: payload.monthly_income,
      monthlyExpenses: payload.monthly_expenses,
      monthlyEssentialExpenses: payload.monthly_essential_expenses,
      emergencyFund: payload.emergency_fund,
      monthlyDebtPayments: payload.has_debt ? payload.monthly_debt_payments : 0,
      goals: payload.goals,
      portfolioAllocation: payload.investment_categories,
      safetyData: {
        hasHealthInsurance: payload.has_health_insurance,
        hasLifeInsurance: payload.has_life_insurance
      }
    };
    const diagnostic = calculateFinancialHealthScore(engineInput);
    await saveFinancialHealthScore(userId, diagnostic);

    return data || payload;
  } catch (err) {
    console.error('Error saving financial profile:', err);
    localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(formData));
    return payload;
  }
}
