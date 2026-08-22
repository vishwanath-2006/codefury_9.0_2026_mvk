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
  investmentExperience: 'Some experience',
  hasHealthInsurance: true,
  hasLifeInsurance: true,
  hasEmergencyFund: true,
  timeHorizon: '5–10 years',
  riskResponseFall20: 'Hold',
  investmentPriority: 'Balanced growth',
  riskTolerance: 'Moderate'
};

/**
 * Universal UserFinancialProfile normalizer with guaranteed NaN fallbacks
 */
export function getUserFinancialProfile(raw) {
  const d = raw || {};
  
  const primaryIncome = Number(d.primaryMonthlyIncome ?? d.monthlyIncome ?? 75000) || 75000;
  const secondaryIncome = Number(d.secondaryMonthlyIncome ?? d.otherIncome ?? 0) || 0;
  const monthlyIncome = primaryIncome + secondaryIncome || 75000;

  const essentialExpenses = Number(d.essentialExpenses ?? d.monthlyEssentialExpenses ?? 30000) || 30000;
  const discretionaryExpenses = Number(d.discretionaryExpenses ?? d.monthlyDiscretionaryExpenses ?? 15000) || 15000;
  const totalMonthlyEmis = Number(d.totalEmiOutflow ?? d.monthlyDebtPayments ?? 0) || 0;

  const bankSavings = Number(d.bankSavings ?? d.currentSavings ?? 150000) || 150000;
  const emergencyFundAmount = Number(d.emergencyFundAmount ?? d.emergencyFund ?? 150000) || 150000;

  const rawTotalValue = Number(d.totalInvestmentValue ?? d.portfolioValue ?? 350000) || 350000;
  const assetClasses = Array.isArray(d.assetClasses) && d.assetClasses.length > 0
    ? d.assetClasses
    : (Array.isArray(d.investmentCategories) && d.investmentCategories.length > 0 ? d.investmentCategories : ['Mutual Funds / SIPs', 'Direct Equity / Stocks']);

  const isMF = assetClasses.some(a => a.includes('Mutual Funds'));
  const isStocks = assetClasses.some(a => a.includes('Stocks') || a.includes('Equity'));
  const isFD = assetClasses.some(a => a.includes('Fixed') || a.includes('FD'));
  const isGold = assetClasses.some(a => a.includes('Gold'));

  const portfolio = {
    mutualFunds: isMF ? Math.round(rawTotalValue * 0.5) : 0,
    stocks: isStocks ? Math.round(rawTotalValue * 0.3) : 0,
    fixedDeposits: isFD ? Math.round(rawTotalValue * 0.1) : 0,
    gold: isGold ? Math.round(rawTotalValue * 0.1) : 0,
    cashBuffer: bankSavings,
  };

  const totalPortfolioNetWorth = (portfolio.mutualFunds + portfolio.stocks + portfolio.fixedDeposits + portfolio.gold + portfolio.cashBuffer) || rawTotalValue || 1;

  const riskToleranceStr = String(d.riskTolerance || d.marketCorrectionReaction || 'Moderate').toLowerCase();
  const riskScore = (riskToleranceStr.includes('conservative') || riskToleranceStr.includes('option a')) ? 1 : (riskToleranceStr.includes('aggressive') || riskToleranceStr.includes('option c')) ? 3 : 2;

  const primaryGoalName = d.primaryMilestone || (d.goals && d.goals[0]?.title) || 'Home Down Payment';
  const targetAmount = Number(d.targetGoalAmount || (d.goals && d.goals[0]?.targetAmount) || 1500000) || 1500000;
  const timeframeYears = Number(d.targetTimeframeYears || 5) || 5;
  const accumulatedAmount = Number((d.goals && d.goals[0]?.currentAmount) || Math.round(targetAmount * 0.3)) || Math.round(targetAmount * 0.3);

  const targetDateObj = new Date();
  targetDateObj.setFullYear(targetDateObj.getFullYear() + timeframeYears);
  const targetDate = targetDateObj.toISOString().split('T')[0];

  const netMonthlySurplus = Math.max(0, monthlyIncome - essentialExpenses - discretionaryExpenses - totalMonthlyEmis);

  return {
    fullName: d.fullName || d.full_name || 'FinLabs Investor',
    age: Number(d.age || 28) || 28,
    occupation: d.occupation || 'Software Engineer',
    cityTier: d.cityTier || 'Tier 1 Metro',

    monthlyIncome,
    secondaryIncome,
    essentialExpenses,
    discretionaryExpenses,
    netMonthlySurplus,

    hasCreditCard: Boolean(d.hasCreditCards ?? d.has_debt),
    activeCardsCount: Number(d.cardCount ? parseInt(d.cardCount) : 1) || 1,
    totalMonthlyEmis,
    outstandingDebt: Number(d.unpaidBalance ?? d.totalDebt ?? 0) || 0,

    bankSavings,
    emergencyFundAmount,
    hasHealthInsurance: d.hasHealthInsurance ?? true,
    hasLifeInsurance: d.hasLifeInsurance ?? true,

    portfolio,
    totalPortfolioNetWorth,
    riskScore, // 1, 2, 3
    riskProfileLabel: riskScore === 1 ? 'Conservative' : riskScore === 3 ? 'Aggressive' : 'Moderate',
    primaryGoal: {
      name: primaryGoalName,
      category: 'Real Estate',
      accumulatedAmount,
      targetAmount,
      targetDate,
      timeframeYears,
      monthlyCommitmentAmount: Number(d.monthlyCommitmentAmount || 15000) || 15000,
    }
  };
}

/**
 * Fetch financial profile for authenticated user
 */
export async function getFinancialProfile(userId) {
  if (!userId) {
    try {
      const stored = localStorage.getItem('finlabs_dev_onboarding_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage parse error:', e);
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Fetch financial profile notice:', error.message);
    }

    if (data) return data;

    // Local fallback check
    const stored = localStorage.getItem('finlabs_dev_onboarding_profile');
    if (stored) return JSON.parse(stored);
    return null;
  } catch (err) {
    console.error('Error fetching financial profile:', err);
    return null;
  }
}

/**
 * Save / update 3-step onboarding questionnaire data
 */
export async function saveFinancialProfile(userId, formData) {
  const monthlyEssential = Number(formData.monthlyEssentialExpenses) || 0;
  const monthlyDiscretionary = Number(formData.monthlyDiscretionaryExpenses) || 0;
  const computedMonthlyExpenses = monthlyEssential + monthlyDiscretionary;

  const payload = {
    user_id: userId || 'dev-local-user',
    onboarding_completed: true,

    // Step 1
    full_name: formData.fullName || '',
    age: Number(formData.age) || null,
    employment_status: formData.employmentStatus || 'Employed',
    occupation: formData.occupation || '',
    dependents: Number(formData.dependents) || 0,
    income_stability: formData.incomeStability || 'Stable',

    // Step 2
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

    // Step 3
    goals: Array.isArray(formData.goals) ? formData.goals : [],
    has_investments: Boolean(formData.hasInvestments),
    investment_categories: Array.isArray(formData.investmentCategories) ? formData.investmentCategories : [],
    investment_experience: formData.investmentExperience || 'None',
    has_health_insurance: Boolean(formData.hasHealthInsurance),
    has_life_insurance: Boolean(formData.hasLifeInsurance),
    has_emergency_fund: Boolean(formData.hasEmergencyFund),
    time_horizon: formData.timeHorizon || '3–5 years',
    risk_response_fall_20: formData.riskResponseFall20 || 'Hold',
    investment_priority: formData.investmentPriority || 'Balanced growth',
    risk_tolerance: formData.riskTolerance || 'Moderate',
    updated_at: new Date().toISOString()
  };

  // Always save in localStorage for instant local dev feedback
  localStorage.setItem('finlabs_dev_onboarding_profile', JSON.stringify(payload));

  if (!userId) return payload;

  try {
    // Upsert into Supabase `financial_profiles` table
    const { data, error } = await supabase
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase profile save notice (storing in dev mode fallback):', error.message);
    }

    // Trigger Financial Health Engine score update
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

    return data || payload;
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
