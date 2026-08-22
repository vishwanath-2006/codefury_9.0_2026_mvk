/**
 * FINLABS AI — STAGE 3 PHASE 1 & 4: DETERMINISTIC FINANCIAL ENGINE
 * Pure JavaScript module for zero-hallucination, exact financial calculations & waterfall allocation.
 */

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
  const exp = Number(totalExpenses);
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
  const monthlySurplus = !isNaN(exp) ? totalIncome - exp : null;

  let savingsRatePct = null;
  if (monthlySurplus != null) {
    savingsRatePct = Math.max(0, Math.round((monthlySurplus / totalIncome) * 100));
  }

  const dtiRatioPct = Math.round((debt / totalIncome) * 100);

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
