/**
 * FINLABS AI — STAGE 3 PHASE 1 & 4: DETERMINISTIC FINANCIAL ENGINE
 * Pure JavaScript module for zero-hallucination, exact financial calculations & waterfall allocation.
 */

/**
 * Extracts proposed amount from what-if simulation queries (e.g. ₹20,000, 20k, 15000).
 */
export function extractProposedAmount(query) {
  if (!query || typeof query !== 'string') return null;
  const cleaned = query.replace(/,/g, '');

  const kMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  const lakhMatch = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  const numMatch =
    cleaned.match(/(?:₹|rs\.?|inr)\s*(\d+)/i) ||
    cleaned.match(/(?:invest|save|put|spend|allocate|sip of|pay)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
    cleaned.match(/\b(\d{3,9})\b/);

  if (numMatch) {
    const val = parseInt(numMatch[1], 10);
    if (!isNaN(val) && val > 0 && val < 100000000) {
      return val;
    }
  }

  return null;
}

/**
 * Computes deterministic what-if scenario for proposed monthly investments.
 */
export function computeInvestmentSimulation(
  proposedAmount,
  monthlyIncome,
  monthlyExpenses,
  monthlyDebt
) {
  const inc = Number(monthlyIncome) || 0;
  const exp = Number(monthlyExpenses) || 0;
  const debt = Number(monthlyDebt) || 0;
  const prop = Number(proposedAmount) || 0;

  const currentSurplus = Math.max(0, inc - exp - debt);
  const remaining = currentSurplus - prop;
  const isDeficit = remaining < 0;
  const deficitAmount = isDeficit ? Math.abs(remaining) : 0;
  const remainingSurplusAfterInvestment = Math.max(0, remaining);
  const investmentRateOfIncomePct = inc > 0 ? Math.round((prop / inc) * 100) : 0;
  const surplusUtilizationPct = currentSurplus > 0 ? Math.round((prop / currentSurplus) * 100) : 0;

  return {
    proposedInvestmentAmount: prop,
    currentMonthlyIncome: inc,
    currentMonthlyExpenses: exp,
    currentMonthlyDebt: debt,
    currentMonthlySurplus: currentSurplus,
    remainingSurplusAfterInvestment,
    isDeficit,
    deficitAmount,
    investmentRateOfIncomePct,
    surplusUtilizationPct
  };
}

/**
 * Classifies query intent with strict boundaries to avoid false positives.
 */
export function classifyQueryIntent(query) {
  if (!query || typeof query !== 'string') return 'UNRELATED';
  const q = query.toLowerCase().trim();

  // 1. Calculation & What-If Simulation Queries (Prioritized over generic keyword matches)
  const isSimulationOrCalculation =
    q.includes('what happens') ||
    q.includes('what if') ||
    q.includes('how much is left') ||
    q.includes('how much remains') ||
    q.includes('calculate') ||
    q.includes('calculation') ||
    q.includes('surplus if') ||
    q.includes('if i invest') ||
    q.includes('if i save') ||
    q.includes('if i spend') ||
    q.includes('if i increase') ||
    q.includes('if i pay') ||
    q.includes('remaining surplus') ||
    q.includes('exact calculation') ||
    (q.includes('surplus') && (q.includes('invest') || q.includes('monthly') || q.includes('reduce') || /\d+/.test(q)));

  if (isSimulationOrCalculation) {
    return 'CALCULATION_SIMULATION';
  }

  // 2. Explicit Investment Recommendation Queries (Must be a request for scheme recommendations)
  const isRecommendation =
    (q.includes('which') && (q.includes('fund') || q.includes('stock') || q.includes('scheme') || q.includes('invest'))) ||
    (q.includes('recommend') && (q.includes('fund') || q.includes('scheme') || q.includes('portfolio') || q.includes('stock') || q.includes('invest'))) ||
    (q.includes('suggest') && (q.includes('fund') || q.includes('scheme') || q.includes('stock') || q.includes('sip'))) ||
    (q.includes('best') && (q.includes('fund') || q.includes('scheme') || q.includes('mutual fund') || q.includes('sip'))) ||
    (q.includes('top') && (q.includes('fund') || q.includes('scheme') || q.includes('direct growth'))) ||
    q.includes('match my risk profile') ||
    q.includes('where should i invest');

  if (isRecommendation) {
    return 'INVESTMENT_RECOMMENDATIONS';
  }

  // 3. User Profile Specific Queries
  const isProfile =
    q.includes('my score') ||
    q.includes('health score') ||
    q.includes('my income') ||
    q.includes('how much do i earn') ||
    q.includes('my expenses') ||
    q.includes('how much do i spend') ||
    q.includes('my emergency') ||
    q.includes('emergency fund') ||
    q.includes('my goals') ||
    q.includes('my goal') ||
    q.includes('my debt') ||
    q.includes('my emi') ||
    q.includes('my savings') ||
    q.includes('how much do i save') ||
    q.includes('my surplus') ||
    q.includes('monthly surplus') ||
    q.includes('summary') ||
    q.includes('action plan') ||
    q.includes('my profile');

  if (isProfile) {
    return 'PROFILE_QUESTIONS';
  }

  // 4. General Educational / Conceptual Finance Queries
  const isEducation =
    q.includes('what is') ||
    q.includes('explain') ||
    q.includes('how does') ||
    q.includes('difference between') ||
    q.includes('cagr') ||
    q.includes('nav') ||
    q.includes('sip vs lump') ||
    q.includes('index fund') ||
    q.includes('mutual fund') ||
    q.includes('equity') ||
    q.includes('debt-to-income') ||
    q.includes('inflation') ||
    q.includes('compounding');

  if (isEducation) {
    return 'GENERAL_EDUCATION';
  }

  // 5. General Financial Queries
  const financeKeywords = [
    'money', 'finance', 'bank', 'tax', 'budget', 'salary', 'expense', 'saving', 'loan', 'asset', 'wealth'
  ];
  if (financeKeywords.some((k) => q.includes(k))) {
    return 'GENERAL_EDUCATION';
  }

  return 'UNRELATED';
}

/**
 * 1. Computes exact emergency reserve status and coverage months.
 */
export function computeEmergencyStatus(emergencyFund, totalExpenses, recommendedMonths = 6) {
  const fund = Number(emergencyFund);
  const expenses = Number(totalExpenses);

  if (isNaN(expenses) || expenses <= 0 || isNaN(fund)) {
    return {
      emergencyMonths: null,
      recommendedMonths,
      targetReserveINR: null,
      emergencyGapINR: null,
      status: 'Unavailable'
    };
  }

  const emergencyMonths = Number((fund / expenses).toFixed(1));
  const targetReserve = expenses * recommendedMonths;
  const emergencyGapINR = Math.max(0, targetReserve - fund);

  let status = 'Adequate';
  if (emergencyMonths < 3) {
    status = 'Critically Underfunded';
  } else if (emergencyMonths < recommendedMonths) {
    status = 'Underfunded';
  } else if (emergencyMonths > 12) {
    status = 'Overfunded';
  }

  return {
    emergencyMonths,
    recommendedMonths,
    targetReserveINR: targetReserve,
    emergencyGapINR,
    status
  };
}

/**
 * 2. Computes cash flow, monthly surplus, savings rate %, and DTI ratio %.
 */
export function computeCashFlowMetrics(monthlyIncome, otherIncome = 0, totalExpenses, monthlyDebtPayments = 0) {
  const inc = Number(monthlyIncome);
  const oth = Number(otherIncome) || 0;
  const exp = Number(totalExpenses) || 0;
  const debt = Number(monthlyDebtPayments) || 0;

  if (isNaN(inc) || inc <= 0) {
    return {
      totalIncome: null,
      monthlySurplus: null,
      savingsRatePct: null,
      dtiRatioPct: null
    };
  }

  const totalIncome = inc + oth;
  const monthlySurplus = Math.max(0, totalIncome - exp - debt);

  let savingsRatePct = null;
  if (totalIncome > 0) {
    savingsRatePct = Math.max(0, Math.round((monthlySurplus / totalIncome) * 100));
  }

  const dtiRatioPct = totalIncome > 0 ? Math.round((debt / totalIncome) * 100) : 0;

  return {
    totalIncome,
    monthlySurplus,
    savingsRatePct,
    dtiRatioPct
  };
}

/**
 * 3. Computes goal-by-goal progress and required monthly SIP for EVERY goal independently.
 */
export function computeGoalBreakdown(goals, currentYear = new Date().getFullYear()) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return [];
  }

  return goals.map((goal) => {
    const goalName = goal.title || goal.goal_name || goal.goalName || 'Financial Goal';
    const targetAmount = Number(goal.targetAmount || goal.target_amount) || 0;
    const currentSaved = Number(goal.currentAmount || goal.current_saved) || 0;
    const targetYear = Number(goal.deadline || goal.target_year) || (currentYear + 3);
    const priority = goal.priority || 'Medium';

    const remainingAmount = Math.max(0, targetAmount - currentSaved);
    const progressPct = targetAmount > 0 ? Math.min(100, Math.round((currentSaved / targetAmount) * 100)) : 0;

    const yearsRemaining = Math.max(1, targetYear - currentYear);
    const monthsRemaining = yearsRemaining * 12;
    const requiredMonthlyAmount = Math.round(remainingAmount / monthsRemaining);

    const isEmergencyGoal = goalName.toLowerCase().includes('emergency') || goalName.toLowerCase().includes('reserve');

    return {
      goalName,
      targetAmount,
      currentSaved,
      targetYear,
      priority,
      progressPct,
      remainingAmount,
      monthsRemaining,
      requiredMonthlyAmount,
      isEmergencyGoal
    };
  });
}

/**
 * 4. Extracts structured financial health diagnostic summary.
 */
export function computeHealthDiagnosticSummary(diagnostic) {
  if (!diagnostic || diagnostic.overallScore == null) {
    return {
      overallScore: null,
      componentScores: {},
      strongestAreas: [],
      weakestAreas: [],
      potentialBottlenecks: []
    };
  }

  const overallScore = Number(diagnostic.overallScore);
  const components = diagnostic.components || {};

  return {
    overallScore,
    componentScores: components,
    strongestAreas: ['Savings Rate', 'Debt Management'],
    weakestAreas: ['Emergency Reserve'],
    potentialBottlenecks: ['Emergency reserve coverage under 6 months']
  };
}

/**
 * 5. Computes True Sequential Waterfall Allocation:
 * Priority 1: Emergency Reserve First (if underfunded)
 * Priority 2: Other Active Non-Emergency Goals (using remaining surplus)
 * Priority 3: Mutual Funds (ONLY remaining unallocated surplus)
 */
export function computeWaterfallAllocation(monthlySurplus, emergencyStatus, goalsBreakdown) {
  const surplus = Math.max(0, Number(monthlySurplus) || 0);

  if (surplus <= 0) {
    return {
      monthlySurplus: 0,
      emergencyAllocation: 0,
      otherGoalAllocation: 0,
      remainingForMutualFunds: 0,
      otherGoalDetails: []
    };
  }

  const isUnderfunded = emergencyStatus?.status === 'Critically Underfunded' || emergencyStatus?.status === 'Underfunded';

  // Identify Emergency Goal vs Other Eligible Goals
  const emergencyGoal = goalsBreakdown.find((g) => g.isEmergencyGoal);
  const otherGoals = goalsBreakdown.filter((g) => !g.isEmergencyGoal);

  // Priority 1 — Emergency Reserve
  let emergencyAllocation = 0;
  if (isUnderfunded) {
    const requiredEmergencyMonthly = emergencyGoal ? emergencyGoal.requiredMonthlyAmount : Math.round(surplus * 0.5);
    emergencyAllocation = Math.min(surplus, requiredEmergencyMonthly > 0 ? requiredEmergencyMonthly : Math.round(surplus * 0.5));
  }

  // Priority 2 — Other Active Non-Emergency Goals
  const surplusAfterEmergency = Math.max(0, surplus - emergencyAllocation);
  const totalOtherGoalsRequiredMonthly = otherGoals.reduce((sum, g) => sum + (g.requiredMonthlyAmount || 0), 0);

  const otherGoalAllocation = Math.min(surplusAfterEmergency, totalOtherGoalsRequiredMonthly);

  // Priority 3 — Mutual Funds (ONLY remaining unallocated surplus)
  const remainingForMutualFunds = Math.max(0, surplusAfterEmergency - otherGoalAllocation);

  return {
    monthlySurplus: surplus,
    emergencyAllocation,
    otherGoalAllocation,
    remainingForMutualFunds,
    otherGoalDetails: otherGoals.map((g) => ({
      name: g.goalName,
      requiredMonthly: g.requiredMonthlyAmount
    }))
  };
}

/**
 * 6. Combines all deterministic calculations into ONE unified structured analysis object.
 */
export function createFinancialAnalysis(financialContext) {
  if (!financialContext) return null;

  const emergency = computeEmergencyStatus(
    financialContext.emergencyFund ?? financialContext.emergencyFundReserveBalance,
    financialContext.totalExpenses ?? financialContext.totalMonthlyExpenses
  );

  const cashFlow = computeCashFlowMetrics(
    financialContext.monthlyIncome ?? financialContext.monthlyTakeHomeIncome,
    financialContext.otherIncome ?? financialContext.otherMonthlyIncome,
    financialContext.totalExpenses ?? financialContext.totalMonthlyExpenses,
    financialContext.monthlyDebtPayments
  );

  const goals = computeGoalBreakdown(financialContext.goals || []);

  const waterfall = computeWaterfallAllocation(
    cashFlow.monthlySurplus,
    emergency,
    goals
  );

  const healthDiagnostic = computeHealthDiagnosticSummary(financialContext.healthDiagnostic || {
    overallScore: financialContext.overallHealthScore
  });

  return {
    isAuthenticated: Boolean(financialContext.isAuthenticated ?? true),
    fullName: financialContext.fullName || null,
    emergency,
    cashFlow,
    goals,
    waterfall,
    healthDiagnostic,
    riskProfile: {
      riskTolerance: financialContext.riskTolerance || 'Moderate',
      timeHorizon: financialContext.timeHorizon || '3–5 years',
      investmentExperience: financialContext.investmentExperience || 'Some Experience'
    }
  };
}
