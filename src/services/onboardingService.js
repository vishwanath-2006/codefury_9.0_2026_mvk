import { supabase } from '../lib/supabaseClient';

/**
 * Default initial onboarding form state.
 */
export const initialOnboardingData = {
  // Step 1: Baseline Identity & Career
  fullName: '',
  age: 25,
  occupation: 'Salaried Professional',
  cityTier: 'Tier 1 Metro',

  // Step 2: Income & Cash Flow
  primaryMonthlyIncome: 75000,
  secondaryMonthlyIncome: 0,
  incomeStability: 'Highly Predictable',

  // Step 3: Expenses & Burn Rate
  essentialExpenses: 30000,
  discretionaryExpenses: 15000,
  expenseTrackingMethod: 'I track every rupee',

  // Step 4: Liabilities & Credit Profile
  hasCreditCards: true,
  cardCount: '1-2',
  unpaidBalance: 0,
  activeLoans: ['None'],
  totalEmiOutflow: 0,

  // Step 5: Liquidity & Emergency Safety Net
  bankSavings: 150000,
  emergencyFundAmount: 150000,
  monthsCovered: '3–6 Months',

  // Step 6: Existing Investment Portfolio
  assetClasses: ['Mutual Funds / SIPs', 'Direct Equity / Stocks'],
  totalInvestmentValue: 350000,
  primaryPlatforms: ['Zerodha', 'Groww'],

  // Step 7: Behavioral Risk Profile
  investingExperience: '1-3 Years (Intermediate)',
  marketCorrectionReaction: 'Option B', // Option A: Panic (1pt), B: Hold (2pt), C: Invest more (3pt)

  // Step 8: Primary Financial Goal & Launchpad
  primaryMilestone: 'Down Payment for House',
  targetGoalAmount: 1500000,
  targetTimeframeYears: 5,
  monthlyCommitmentAmount: 15000,
};

/**
 * Calculates Financial Health Score (0 - 100) based on financial metrics.
 */
export function calculateFinancialHealthScore(formData) {
  const totalIncome = Number(formData.primaryMonthlyIncome || 0) + Number(formData.secondaryMonthlyIncome || 0);
  const totalExpenses = Number(formData.essentialExpenses || 0) + Number(formData.discretionaryExpenses || 0);
  const emiOutflow = Number(formData.totalEmiOutflow || 0);
  const savings = Math.max(0, totalIncome - totalExpenses - emiOutflow);

  if (totalIncome <= 0) return 50;

  // 1. Savings Rate Score (Max 30 pts)
  const savingsRate = (savings / totalIncome) * 100;
  let savingsRateScore = 0;
  if (savingsRate >= 30) savingsRateScore = 30;
  else if (savingsRate >= 20) savingsRateScore = 24;
  else if (savingsRate >= 10) savingsRateScore = 16;
  else if (savingsRate > 0) savingsRateScore = 8;

  // 2. Emergency Buffer Score (Max 25 pts)
  let emergencyScore = 0;
  if (formData.monthsCovered === '6+ Months') emergencyScore = 25;
  else if (formData.monthsCovered === '3–6 Months') emergencyScore = 20;
  else if (formData.monthsCovered === '1–3 Months') emergencyScore = 12;
  else emergencyScore = 5;

  // 3. Debt-to-Income / EMI Score (Max 25 pts)
  const emiRatio = (emiOutflow / totalIncome) * 100;
  let debtScore = 0;
  if (emiRatio === 0) debtScore = 25;
  else if (emiRatio <= 15) debtScore = 20;
  else if (emiRatio <= 30) debtScore = 14;
  else if (emiRatio <= 50) debtScore = 7;

  // 4. Asset Diversification & Discipline Score (Max 20 pts)
  let disciplineScore = 0;
  const assetCount = (formData.assetClasses || []).filter(a => a !== 'None yet').length;
  disciplineScore += Math.min(12, assetCount * 4);

  if (formData.expenseTrackingMethod === 'I track every rupee') disciplineScore += 8;
  else if (formData.expenseTrackingMethod === 'Rough estimate') disciplineScore += 5;
  else disciplineScore += 2;

  const totalScore = Math.min(100, Math.max(10, Math.round(savingsRateScore + emergencyScore + debtScore + disciplineScore)));
  return totalScore;
}

/**
 * Calculates Risk Profile classification based on Step 7 reaction and experience.
 */
export function calculateRiskProfile(formData) {
  let score = 0;

  // Reaction Score
  if (formData.marketCorrectionReaction === 'Option C' || formData.marketCorrectionReaction?.includes('Option C') || formData.marketCorrectionReaction?.includes('discount')) {
    score += 3;
  } else if (formData.marketCorrectionReaction === 'Option B' || formData.marketCorrectionReaction?.includes('Option B') || formData.marketCorrectionReaction?.includes('Hold')) {
    score += 2;
  } else {
    score += 1;
  }

  // Experience Score
  if (formData.investingExperience === '3+ Years (Active Investor)') {
    score += 2;
  } else if (formData.investingExperience === '1-3 Years (Intermediate)') {
    score += 1;
  }

  if (score >= 4) return 'Aggressive';
  if (score >= 3) return 'Moderate';
  return 'Conservative';
}

/**
 * Saves onboarding data and scores to Supabase or local storage.
 */
export async function saveOnboardingProfile(formData) {
  const healthScore = calculateFinancialHealthScore(formData);
  const riskProfile = calculateRiskProfile(formData);

  const payload = {
    formData,
    healthScore,
    riskProfile,
    completedAt: new Date().toISOString(),
  };

  // Try saving to Supabase if logged in
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName || user.user_metadata?.full_name || 'SmartWealth User',
          onboarding_data: formData,
          financial_health_score: healthScore,
          risk_profile: riskProfile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.warn('Supabase upsert warning, storing locally:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase session not active, fallback to localStorage:', err);
  }

  // Always save to localStorage as reliable state fallback
  localStorage.setItem('smartwealth_onboarding_profile', JSON.stringify(payload));

  return payload;
}

/**
 * Loads saved onboarding profile from localStorage or default.
 */
export function getSavedOnboardingProfile() {
  try {
    const saved = localStorage.getItem('smartwealth_onboarding_profile');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading onboarding profile:', e);
  }

  const defaultData = initialOnboardingData;
  return {
    formData: defaultData,
    healthScore: calculateFinancialHealthScore(defaultData),
    riskProfile: calculateRiskProfile(defaultData),
    completedAt: null,
  };
}
