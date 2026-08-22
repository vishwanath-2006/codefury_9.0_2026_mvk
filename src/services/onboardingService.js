import { supabase } from '../lib/supabaseClient';
import { calculateFinancialHealthScore } from './financialHealth/engine';
import { saveFinancialHealthScore } from './financialHealth/adapter';

/**
 * Returns a clean, blank onboarding data structure for fresh users.
 * Never pre-fills demo or other users' financial data.
 */
export const createEmptyOnboardingData = (user = null, profile = null) => ({
  user_id: user?.id || null,
  fullName: profile?.full_name || user?.user_metadata?.full_name || '',
  email: user?.email || '',
  emailVerified: false,
  selfiePhoto: '',
  selfieVerified: false,
  panNumber: '',
  panVerified: false,
  kycStatus: 'Unverified',
  taxStatus: 'Resident Individual',
  age: '',
  employmentStatus: 'Employed',
  occupation: '',
  dependents: '0',
  incomeStability: 'Stable',
  monthlyIncome: '',
  otherIncome: '',
  monthlyEssentialExpenses: '',
  monthlyDiscretionaryExpenses: '',
  currentSavings: '',
  emergencyFund: '',
  monthlySavings: '',
  aaConnected: false,
  connectedBankName: '',
  hasDebt: false,
  totalDebt: '',
  monthlyDebtPayments: '',
  debtType: 'Home',
  creditCardsHeld: '0',
  creditCardRolloverBalance: '0',
  goals: [],
  hasInvestments: false,
  investmentCategories: [],
  investmentExperience: '',
  portfolioMutualFunds: '',
  portfolioStocks: '',
  portfolioFd: '',
  portfolioGold: '',
  externalPlatforms: [],
  hasHealthInsurance: false,
  hasLifeInsurance: false,
  hasEmergencyFund: false,
  timeHorizon: '5–10 years',
  riskResponseFall20: 'Hold',
  investmentPriority: 'Balanced growth',
  riskTolerance: 'Moderate'
});

export const initialOnboardingData = createEmptyOnboardingData();

/**
 * Returns a user-isolated LocalStorage key.
 * Strictly requires an authenticated user ID.
 */
export const getStorageKey = (userId) => {
  if (!userId || userId === 'dev-test-user-id-99999' || userId === 'dev-local-user') {
    return null;
  }
  return `finlabs_onboarding_profile_${userId}`;
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
 * Universal UserFinancialProfile normalizer
 */
export function getUserFinancialProfile(raw) {
  const d = raw || {};

  const primaryIncome = Number(d.primaryMonthlyIncome ?? d.monthlyIncome ?? 0) || 0;
  const secondaryIncome = Number(d.secondaryMonthlyIncome ?? d.otherIncome ?? 0) || 0;
  const totalIncome = primaryIncome + secondaryIncome;

  const essentialExpenses = Number(d.essentialExpenses ?? d.monthlyEssentialExpenses ?? 0) || 0;
  const discretionaryExpenses = Number(d.discretionaryExpenses ?? d.monthlyDiscretionaryExpenses ?? 0) || 0;
  const totalMonthlyEmis = Number(d.totalEmiOutflow ?? d.monthlyDebtPayments ?? 0) || 0;

  const bankSavings = Number(d.bankSavings ?? d.currentSavings ?? 0) || 0;
  const emergencyFundAmount = Number(d.emergencyFundAmount ?? d.emergencyFund ?? 0) || 0;

  const rawTotalValue = Number(d.totalInvestmentValue ?? d.portfolioValue ?? (bankSavings + emergencyFundAmount)) || 0;
  const assetClasses = Array.isArray(d.assetClasses) && d.assetClasses.length > 0
    ? d.assetClasses
    : (Array.isArray(d.investmentCategories) && d.investmentCategories.length > 0 ? d.investmentCategories : ['Mutual Funds / SIPs', 'Direct Equity / Stocks']);

  const isMF = assetClasses.some(a => a.includes('Mutual Funds'));
  const isStocks = assetClasses.some(a => a.includes('Stocks') || a.includes('Equity'));
  const isFD = assetClasses.some(a => a.includes('Fixed') || a.includes('FD'));
  const isGold = assetClasses.some(a => a.includes('Gold'));

  const mfVal = Number(d.portfolioMutualFunds ?? 0);
  const stockVal = Number(d.portfolioStocks ?? 0);
  const fdVal = Number(d.portfolioFDs ?? 0);
  const goldVal = Number(d.portfolioGold ?? 0);

  const breakdownSum = mfVal + stockVal + fdVal + goldVal;

  const portfolio = {
    mutualFunds: breakdownSum > 0 ? mfVal : (isMF ? Math.round(rawTotalValue * 0.55) : 0),
    stocks: breakdownSum > 0 ? stockVal : (isStocks ? Math.round(rawTotalValue * 0.30) : 0),
    fixedDeposits: breakdownSum > 0 ? fdVal : (isFD ? Math.round(rawTotalValue * 0.15) : 0),
    gold: breakdownSum > 0 ? goldVal : (isGold ? Math.round(rawTotalValue * 0.05) : 0),
    cashBuffer: bankSavings,
  };

  const activeAssetClassesCount = [portfolio.mutualFunds, portfolio.stocks, portfolio.fixedDeposits, portfolio.gold].filter(v => v > 0).length || 1;
  const totalPortfolioNetWorth = (portfolio.mutualFunds + portfolio.stocks + portfolio.fixedDeposits + portfolio.gold + portfolio.cashBuffer) || rawTotalValue || 0;

  // 1. Net Monthly Surplus & Savings Rate
  const totalOutflows = essentialExpenses + discretionaryExpenses + totalMonthlyEmis;
  const netMonthlySurplus = Math.max(0, totalIncome - totalOutflows);
  const savingsRate = totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(((netMonthlySurplus / totalIncome) * 100) * 10) / 10)) : 0;

  // 2. Emergency Fund Runway (Months)
  const totalEmergencyReserves = emergencyFundAmount + bankSavings;
  const monthlyFixedNeeds = essentialExpenses + totalMonthlyEmis;
  const emergencyRunwayMonths = monthlyFixedNeeds > 0 ? Math.round((totalEmergencyReserves / monthlyFixedNeeds) * 10) / 10 : 0;

  // 3. Debt-to-Income Ratio (DTI %)
  const dtiRatio = totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(((totalMonthlyEmis / totalIncome) * 100) * 10) / 10)) : 0;

  // 4. Primary Goal & Required Goal SIP
  const primaryGoalName = d.primaryMilestone || (d.goals && d.goals[0]?.title) || (d.goals && d.goals[0]?.goal_name) || 'Financial Goal';
  const targetAmount = Number(d.targetGoalAmount || (d.goals && d.goals[0]?.targetAmount) || (d.goals && d.goals[0]?.target_amount) || 0) || 0;
  const timeframeYears = Number(d.targetTimeframeYears || 5) || 5;
  const accumulatedAmount = Number((d.goals && d.goals[0]?.currentAmount) || (d.goals && d.goals[0]?.current_saved) || 0) || 0;

  const n = Math.max(1, timeframeYears * 12);
  const r = 0.01;
  const requiredGoalSip = targetAmount > 0 ? Math.round((targetAmount * r) / ((1 + r) * (Math.pow(1 + r, n) - 1))) : 0;
  const committedGoalSip = Number(d.monthlyCommitmentAmount || requiredGoalSip || 0) || 0;

  // 5. Risk Profile Mapping
  const riskToleranceStr = String(d.riskTolerance || d.risk_tolerance || 'Moderate').toLowerCase();
  const riskScore = (riskToleranceStr.includes('conservative') || riskToleranceStr.includes('option a')) ? 1 : (riskToleranceStr.includes('aggressive') || riskToleranceStr.includes('option c')) ? 3 : 2;
  const riskProfileLabel = riskScore === 1 ? 'Conservative' : riskScore === 3 ? 'Aggressive' : 'Moderate';

  // 6. Financial Health Score (0-100 Weighted Matrix)
  const savingsPts = Math.min(25, Math.round((savingsRate / 30) * 25));
  const emergencyPts = emergencyRunwayMonths >= 6 ? 25 : emergencyRunwayMonths >= 3 ? 15 : 5;
  const debtPts = dtiRatio === 0 ? 20 : dtiRatio <= 20 ? 15 : dtiRatio > 40 ? 5 : 10;
  const investmentPts = activeAssetClassesCount >= 2 ? 15 : activeAssetClassesCount === 1 ? 8 : 0;
  const goalPts = committedGoalSip <= netMonthlySurplus ? 15 : 5;
  const weightedHealthScore = Math.min(100, savingsPts + emergencyPts + debtPts + investmentPts + goalPts);

  // 7. Suitability Ranking (0-100 per Category)
  let sipSuitabilityScore = 85;
  if (timeframeYears >= 3) sipSuitabilityScore += 10;
  if (timeframeYears < 1) sipSuitabilityScore -= 15;
  sipSuitabilityScore = Math.min(99, Math.max(30, sipSuitabilityScore));

  let stockSuitabilityScore = 50;
  if (riskScore === 3) stockSuitabilityScore += 30;
  if (riskScore === 1) stockSuitabilityScore = 25;
  stockSuitabilityScore = Math.min(95, Math.max(20, stockSuitabilityScore));

  let fixedSuitabilityScore = riskScore === 1 ? 85 : 45;

  let ipoSuitabilityScore = 30;
  if (riskScore === 3 && emergencyRunwayMonths >= 6) ipoSuitabilityScore += 35;

  const targetDateObj = new Date();
  targetDateObj.setFullYear(targetDateObj.getFullYear() + timeframeYears);
  const targetDate = targetDateObj.toISOString().split('T')[0];

  return {
    fullName: d.fullName || d.full_name || 'FinLabs Investor',
    age: Number(d.age || 28) || 28,
    occupation: d.occupation || 'Professional',
    cityTier: d.cityTier || 'Tier 1 Metro',

    monthlyIncome: totalIncome,
    primaryIncome,
    secondaryIncome,
    essentialExpenses,
    discretionaryExpenses,
    netMonthlySurplus,
    savingsRate,

    emergencyReserves: totalEmergencyReserves,
    emergencyRunwayMonths,

    hasCreditCard: Boolean(d.hasCreditCards ?? d.has_debt),
    activeCardsCount: Number(d.cardCount ? parseInt(d.cardCount) : 1) || 1,
    totalMonthlyEmis,
    dtiRatio,
    outstandingDebt: Number(d.unpaidBalance ?? d.totalDebt ?? d.total_debt ?? 0) || 0,

    bankSavings,
    emergencyFundAmount,
    hasHealthInsurance: d.hasHealthInsurance ?? d.has_health_insurance ?? true,
    hasLifeInsurance: d.hasLifeInsurance ?? d.has_life_insurance ?? true,

    portfolio,
    totalPortfolioNetWorth,
    riskScore,
    riskProfileLabel,
    weightedHealthScore,

    suitability: {
      sipScore: sipSuitabilityScore,
      stockScore: stockSuitabilityScore,
      fixedScore: fixedSuitabilityScore,
      ipoScore: ipoSuitabilityScore,
    },

    primaryGoal: {
      name: primaryGoalName,
      category: 'General',
      accumulatedAmount,
      targetAmount,
      targetDate,
      timeframeYears,
      requiredGoalSip,
      committedGoalSip,
      monthlyCommitmentAmount: committedGoalSip,
    }
  };
}

/**
 * Fetch financial profile, relational goals, and responses for authenticated user.
 * Strictly isolated by userId.
 */
export async function getFinancialProfile(userId) {
  if (!userId || userId === 'dev-test-user-id-99999' || userId === 'dev-local-user') {
    return null;
  }

  try {
    // 1. Fetch main financial_profile for the specific authenticated user ID
    const { data: finData, error: finErr } = await supabase
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (finErr && finErr.code !== 'PGRST116') {
      console.warn('Fetch financial profile notice:', finErr.message);
    }

    // Strict runtime guard: ensure returned record matches the authenticated user ID
    if (finData && finData.user_id && finData.user_id !== userId) {
      console.error('Security violation: profile record user_id does not match authenticated user.');
      return null;
    }

    // 2. Fetch relational financial_goals for this user
    const { data: goalsData } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId);

    if (finData) {
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
      } else {
        finData.goals = [];
      }
      return finData;
    }

    // 3. User-isolated LocalStorage fallback (ONLY for this user's unique key)
    const userStorageKey = getStorageKey(userId);
    if (userStorageKey) {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user_id && parsed.user_id !== userId) {
          localStorage.removeItem(userStorageKey);
          return null;
        }
        return parsed;
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching complete financial profile:', err);
    return null;
  }
}

/**
 * AUTHORITATIVE SINGLE SOURCE OF TRUTH RESOLVER
 * RULE 1: If authenticated user has a saved completed financial_profiles record -> USE IT.
 * RULE 2: If user does NOT have a saved completed profile -> Return zeroed baseline with onboardingCompleted: false.
 */
export async function getNormalizedFinancialProfile(userId) {
  if (!userId) {
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyEssentialExpenses: 0,
      monthlyDiscretionaryExpenses: 0,
      monthlyDebtPayments: 0,
      emergencyFund: 0,
      currentSavings: 0,
      riskProfile: 'Not Set',
      goals: [],
      onboardingCompleted: false,
      raw: null
    };
  }

  const raw = await getFinancialProfile(userId);

  if (raw && (raw.onboarding_completed || raw.onboardingCompleted || raw.monthly_income != null || raw.monthlyIncome != null)) {
    const monthlyIncome = Number(raw.monthly_income ?? raw.monthlyIncome ?? 0);
    const monthlyEssentialExpenses = Number(raw.monthly_essential_expenses ?? raw.monthlyEssentialExpenses ?? 0);
    const monthlyDiscretionaryExpenses = Number(raw.monthly_discretionary_expenses ?? raw.monthlyDiscretionaryExpenses ?? 0);
    const monthlyExpenses = Number(raw.monthly_expenses ?? raw.monthlyExpenses ?? (monthlyEssentialExpenses + monthlyDiscretionaryExpenses));
    const monthlyDebtPayments = Number(raw.monthly_debt_payments ?? raw.monthlyDebtPayments ?? 0);
    const emergencyFund = Number(raw.emergency_fund ?? raw.emergencyFund ?? 0);
    const currentSavings = Number(raw.current_savings ?? raw.currentSavings ?? 0);
    const riskProfile = raw.risk_tolerance || raw.riskTolerance || 'Moderate';
    const onboardingCompleted = Boolean(raw.onboarding_completed ?? raw.onboardingCompleted ?? false);

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyEssentialExpenses,
      monthlyDiscretionaryExpenses,
      monthlyDebtPayments,
      emergencyFund,
      currentSavings,
      riskProfile,
      goals: raw.goals || [],
      onboardingCompleted,
      raw
    };
  }

  // Baseline for fresh/unsubmitted profile: All zeroes, NO mock defaults
  return {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyEssentialExpenses: 0,
    monthlyDiscretionaryExpenses: 0,
    monthlyDebtPayments: 0,
    emergencyFund: 0,
    currentSavings: 0,
    riskProfile: 'Not Set',
    goals: [],
    onboardingCompleted: false,
    raw: null
  };
}

/**
 * Save / update 3-step onboarding questionnaire data into Supabase across tables:
 * - public.profiles
 * - public.financial_profiles
 * - public.financial_goals
 */
export async function saveFinancialProfile(userId, formData) {
  // 1. Verify against authenticated Supabase user session
  let authenticatedUserId = userId;
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      authenticatedUserId = authData.user.id;
    }
  } catch (e) {
    console.warn('Auth check notice:', e);
  }

  if (!authenticatedUserId || authenticatedUserId === 'dev-test-user-id-99999' || authenticatedUserId === 'dev-local-user') {
    throw new Error('Cannot save onboarding profile without an authenticated Supabase user.');
  }

  const monthlyEssential = Number(formData.monthlyEssentialExpenses) || 0;
  const monthlyDiscretionary = Number(formData.monthlyDiscretionaryExpenses) || 0;
  const computedMonthlyExpenses = monthlyEssential + monthlyDiscretionary;
  const expEnum = normalizeInvestmentExperience(formData.investmentExperience);

  const payload = {
    user_id: authenticatedUserId,
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

  const completedFormData = {
    ...formData,
    user_id: authenticatedUserId,
    onboarding_completed: true,
    onboardingCompleted: true
  };

  const userStorageKey = getStorageKey(authenticatedUserId);
  if (userStorageKey) {
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(completedFormData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  try {
    // 1. Update profiles table full_name
    if (formData.fullName) {
      await supabase
        .from('profiles')
        .upsert({ id: authenticatedUserId, full_name: formData.fullName, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    }

    // 2. Upsert financial_profiles into Supabase
    const { data: finData, error: finErr } = await supabase
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (finErr) {
      console.error('Explicit Supabase financial_profiles upsert error:', finErr.message, finErr);
      throw new Error(`Failed to save financial profile to database: ${finErr.message}`);
    }

    // 3. Upsert relational financial_goals
    if (Array.isArray(formData.goals)) {
      const goalsPayload = formData.goals.map((g) => ({
        user_id: authenticatedUserId,
        goal_name: g.title || g.goal_name || 'Financial Goal',
        category: g.category || 'General',
        target_amount: Number(g.targetAmount || g.target_amount) || 0,
        current_saved: Number(g.currentAmount || g.current_saved) || 0,
        target_year: String(g.deadline || g.target_year || '2027'),
        priority: g.priority || 'Medium'
      }));

      if (goalsPayload.length > 0) {
        const { error: goalsErr } = await supabase
          .from('financial_goals')
          .upsert(goalsPayload, { onConflict: 'user_id, goal_name' });

        if (goalsErr) {
          console.warn('Upsert goals notice:', goalsErr.message);
        }
      }
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

    await saveFinancialHealthScore(authenticatedUserId, diagnostic);

    return {
      formData: completedFormData,
      healthScore: diagnostic.overallScore,
      riskProfile: formData.riskTolerance || 'Moderate',
      completedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error in saveFinancialProfile:', err);
    throw err;
  }
}

export function getSavedOnboardingProfile(userId = null) {
  if (!userId || userId === 'dev-test-user-id-99999' || userId === 'dev-local-user') {
    return {
      formData: createEmptyOnboardingData(),
      healthScore: 0,
      riskProfile: 'Not Set',
      completedAt: null
    };
  }

  try {
    const userStorageKey = getStorageKey(userId);
    if (userStorageKey) {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const formData = JSON.parse(stored);
        if (formData.user_id && formData.user_id !== userId) {
          localStorage.removeItem(userStorageKey);
          return {
            formData: createEmptyOnboardingData(),
            healthScore: 0,
            riskProfile: 'Not Set',
            completedAt: null
          };
        }

        const isDone = Boolean(formData.onboarding_completed || formData.onboardingCompleted);

        const diagnostic = calculateFinancialHealthScore({
          monthlyIncome: Number(formData.monthlyIncome) || 0,
          monthlyExpenses: (Number(formData.monthlyEssentialExpenses) || 0) + (Number(formData.monthlyDiscretionaryExpenses) || 0),
          monthlyEssentialExpenses: Number(formData.monthlyEssentialExpenses) || 0,
          emergencyFund: Number(formData.emergencyFund) || 0,
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
          healthScore: isDone ? diagnostic.overallScore : 0,
          riskProfile: formData.riskTolerance || 'Moderate',
          completedAt: isDone ? (formData.updated_at || new Date().toISOString()) : null
        };
      }
    }
  } catch (e) {
    console.warn('LocalStorage load error:', e);
  }

  return {
    formData: createEmptyOnboardingData(),
    healthScore: 0,
    riskProfile: 'Not Set',
    completedAt: null
  };
}

export const saveOnboardingProfile = saveFinancialProfile;
