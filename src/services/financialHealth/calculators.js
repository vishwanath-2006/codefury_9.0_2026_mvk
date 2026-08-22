import { COMPONENT_MAX_SCORES, COMPONENT_STATUS, THRESHOLDS } from './constants';

/**
 * 1. SAVINGS RATE CALCULATOR (20 points max)
 * Formula: ((Monthly Income - Monthly Expenses) / Monthly Income) * 100
 */
export function calculateSavingsRateScore(monthlyIncome, monthlyExpenses) {
  if (monthlyIncome === undefined || monthlyIncome === null || monthlyIncome <= 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.SAVINGS_RATE,
      valuePct: 0,
      status: COMPONENT_STATUS.NEEDS_ATTENTION,
      explanation: 'Monthly income data required to calculate savings rate.',
      isAvailable: false,
    };
  }

  const expenses = Math.max(0, monthlyExpenses || 0);
  const netSavings = monthlyIncome - expenses;
  const savingsRatePct = Math.max(0, (netSavings / monthlyIncome) * 100);

  if (netSavings <= 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.SAVINGS_RATE,
      valuePct: 0,
      status: COMPONENT_STATUS.NEEDS_ATTENTION,
      explanation: 'Monthly expenses equal or exceed monthly income.',
      isAvailable: true,
    };
  }

  let score = 0;
  let status = COMPONENT_STATUS.NEEDS_ATTENTION;

  for (const tier of THRESHOLDS.SAVINGS_RATE) {
    if (savingsRatePct <= tier.maxPct) {
      score = tier.score;
      status = tier.status;
      break;
    }
  }

  return {
    score: Math.min(COMPONENT_MAX_SCORES.SAVINGS_RATE, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.SAVINGS_RATE,
    valuePct: Math.round(savingsRatePct * 10) / 10,
    status,
    explanation: `You save ${Math.round(savingsRatePct)}% of your monthly income.`,
    isAvailable: true,
  };
}

/**
 * 2. EMERGENCY FUND CALCULATOR (20 points max)
 * Formula: Emergency Fund Reserve / Monthly Essential Expenses
 */
export function calculateEmergencyFundScore(emergencyFund, monthlyEssentialExpenses, monthlyExpenses) {
  const fund = Math.max(0, emergencyFund || 0);
  const baseExpenses = monthlyExpenses || monthlyEssentialExpenses;
  const fallbackUsed = !monthlyExpenses && Boolean(monthlyEssentialExpenses);

  if (!baseExpenses || baseExpenses <= 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.EMERGENCY_FUND,
      monthsCovered: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Expense data needed to calculate emergency buffer.',
      fallbackUsed: false,
      isAvailable: false,
    };
  }

  const monthsCovered = Math.max(0, fund / baseExpenses);
  let score = 0;
  let status = COMPONENT_STATUS.NEEDS_ATTENTION;

  for (const tier of THRESHOLDS.EMERGENCY_FUND_MONTHS) {
    if (monthsCovered <= tier.maxMonths) {
      score = tier.score;
      status = tier.status;
      break;
    }
  }

  return {
    score: Math.min(COMPONENT_MAX_SCORES.EMERGENCY_FUND, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.EMERGENCY_FUND,
    monthsCovered: Math.round(monthsCovered * 10) / 10,
    status,
    explanation: `Your emergency reserve covers ${Math.round(monthsCovered * 10) / 10} months of expenses.`,
    fallbackUsed,
    isAvailable: true,
  };
}

/**
 * 3. DEBT MANAGEMENT CALCULATOR (20 points max)
 * Formula: (Monthly Debt Payments / Monthly Income) * 100
 */
export function calculateDebtScore(monthlyDebtPayments, monthlyIncome) {
  if (monthlyDebtPayments === undefined || monthlyDebtPayments === null) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.DEBT_MANAGEMENT,
      dtiRatioPct: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Debt information not provided.',
      isAvailable: false,
    };
  }

  if (!monthlyIncome || monthlyIncome <= 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.DEBT_MANAGEMENT,
      dtiRatioPct: 0,
      status: COMPONENT_STATUS.NEEDS_ATTENTION,
      explanation: 'Income data required to calculate Debt-to-Income ratio.',
      isAvailable: false,
    };
  }

  const debt = Math.max(0, monthlyDebtPayments);
  const dtiPct = (debt / monthlyIncome) * 100;

  let score = 0;
  let status = COMPONENT_STATUS.NEEDS_ATTENTION;

  for (const tier of THRESHOLDS.DEBT_TO_INCOME_PCT) {
    if (dtiPct <= tier.maxDti) {
      score = tier.score;
      status = tier.status;
      break;
    }
  }

  return {
    score: Math.min(COMPONENT_MAX_SCORES.DEBT_MANAGEMENT, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.DEBT_MANAGEMENT,
    dtiRatioPct: Math.round(dtiPct * 10) / 10,
    status,
    explanation: `Debt payments constitute ${Math.round(dtiPct)}% of monthly income.`,
    isAvailable: true,
  };
}

/**
 * 4. GOAL READINESS CALCULATOR (15 points max)
 */
export function calculateGoalScore(goals) {
  if (!goals || !Array.isArray(goals) || goals.length === 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.GOAL_READINESS,
      averageProgressPct: 0,
      goalCount: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Goals not configured.',
      isAvailable: false,
    };
  }

  const validGoals = goals.filter((g) => g.targetAmount > 0);
  if (validGoals.length === 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.GOAL_READINESS,
      averageProgressPct: 0,
      goalCount: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Goals not configured.',
      isAvailable: false,
    };
  }

  const totalProgress = validGoals.reduce((sum, g) => {
    const current = Math.max(0, g.currentAmount || 0);
    const progress = Math.min(100, (current / g.targetAmount) * 100);
    return sum + progress;
  }, 0);

  const avgProgressPct = totalProgress / validGoals.length;

  // Scale 0-100% avg progress to 0-15 points
  const score = Math.round((avgProgressPct / 100) * COMPONENT_MAX_SCORES.GOAL_READINESS);
  let status = COMPONENT_STATUS.MODERATE;

  if (avgProgressPct >= 75) status = COMPONENT_STATUS.EXCELLENT;
  else if (avgProgressPct >= 50) status = COMPONENT_STATUS.STRONG;
  else if (avgProgressPct >= 30) status = COMPONENT_STATUS.GOOD;
  else status = COMPONENT_STATUS.NEEDS_ATTENTION;

  return {
    score: Math.min(COMPONENT_MAX_SCORES.GOAL_READINESS, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.GOAL_READINESS,
    averageProgressPct: Math.round(avgProgressPct),
    goalCount: validGoals.length,
    status,
    explanation: `Active goals are on average ${Math.round(avgProgressPct)}% funded.`,
    isAvailable: true,
  };
}

/**
 * 5. INVESTMENT DIVERSIFICATION CALCULATOR (15 points max)
 */
export function calculateDiversificationScore(portfolioAllocation) {
  if (!portfolioAllocation || !Array.isArray(portfolioAllocation) || portfolioAllocation.length === 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.INVESTMENT_DIVERSIFICATION,
      activeClassesCount: 0,
      maxConcentrationPct: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Investment data not available.',
      isAvailable: false,
    };
  }

  const activeClasses = portfolioAllocation.filter((item) => item.percentage > 0);
  if (activeClasses.length === 0) {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.INVESTMENT_DIVERSIFICATION,
      activeClassesCount: 0,
      maxConcentrationPct: 0,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Investment data not available.',
      isAvailable: false,
    };
  }

  const maxConcentrationPct = Math.max(...activeClasses.map((item) => item.percentage));

  let score = 0;
  let status = COMPONENT_STATUS.MODERATE;

  // Base score on number of asset classes
  if (activeClasses.length >= 3) score += 10;
  else if (activeClasses.length === 2) score += 6;
  else score += 3;

  // Concentration check (penalty if single asset class >70%)
  if (maxConcentrationPct <= 60) {
    score += 5;
    status = COMPONENT_STATUS.EXCELLENT;
  } else if (maxConcentrationPct <= 75) {
    score += 3;
    status = COMPONENT_STATUS.GOOD;
  } else {
    score += 1;
    status = COMPONENT_STATUS.MODERATE;
  }

  return {
    score: Math.min(COMPONENT_MAX_SCORES.INVESTMENT_DIVERSIFICATION, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.INVESTMENT_DIVERSIFICATION,
    activeClassesCount: activeClasses.length,
    maxConcentrationPct: Math.round(maxConcentrationPct),
    status,
    explanation: `Assets distributed across ${activeClasses.length} categories (Max concentration: ${Math.round(maxConcentrationPct)}%).`,
    isAvailable: true,
  };
}

/**
 * 6. FINANCIAL SAFETY CALCULATOR (10 points max)
 */
export function calculateSafetyScore(safetyData, emergencyMonths = 0) {
  if (!safetyData || typeof safetyData !== 'object') {
    return {
      score: 0,
      maxScore: COMPONENT_MAX_SCORES.FINANCIAL_SAFETY,
      status: COMPONENT_STATUS.INSUFFICIENT_DATA,
      explanation: 'Safety and insurance data not provided.',
      isAvailable: false,
    };
  }

  let score = 0;
  const factors = [];

  if (safetyData.hasHealthInsurance) {
    score += 4;
    factors.push('Health Insurance');
  }

  if (safetyData.hasLifeInsurance) {
    score += 3;
    factors.push('Life Insurance');
  }

  if (emergencyMonths >= 3) {
    score += 3;
    factors.push('3+ Mo Emergency Reserve');
  }

  let status = COMPONENT_STATUS.MODERATE;
  if (score >= 8) status = COMPONENT_STATUS.EXCELLENT;
  else if (score >= 5) status = COMPONENT_STATUS.GOOD;

  return {
    score: Math.min(COMPONENT_MAX_SCORES.FINANCIAL_SAFETY, Math.max(0, score)),
    maxScore: COMPONENT_MAX_SCORES.FINANCIAL_SAFETY,
    status,
    explanation: factors.length > 0 ? `Covered for: ${factors.join(', ')}.` : 'Basic safety coverage recommended.',
    isAvailable: true,
  };
}
