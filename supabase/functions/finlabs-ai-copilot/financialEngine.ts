/**
 * Server-side Deterministic Financial Calculation Engine for Supabase Edge Function
 */

export function computeEmergencyStatus(emergencyFund: number | null, totalExpenses: number | null, recommendedMonths = 6) {
  const fund = Number(emergencyFund);
  const expenses = Number(totalExpenses);

  if (isNaN(expenses) || expenses <= 0 || isNaN(fund)) {
    return {
      emergencyMonths: null,
      recommendedMonths,
      targetReserveINR: null,
      emergencyGapINR: null,
      status: "Unavailable"
    };
  }

  const emergencyMonths = Number((fund / expenses).toFixed(1));
  const targetReserve = expenses * recommendedMonths;
  const emergencyGapINR = Math.max(0, targetReserve - fund);

  let status = "Adequate";
  if (emergencyMonths < 3) {
    status = "Critically Underfunded";
  } else if (emergencyMonths < recommendedMonths) {
    status = "Underfunded";
  } else if (emergencyMonths > 12) {
    status = "Overfunded";
  }

  return {
    emergencyMonths,
    recommendedMonths,
    targetReserveINR: targetReserve,
    emergencyGapINR,
    status
  };
}

export function computeCashFlowMetrics(monthlyIncome: number | null, otherIncome = 0, totalExpenses: number | null, monthlyDebtPayments = 0) {
  const inc = Number(monthlyIncome);
  const oth = Number(otherIncome) || 0;
  const exp = Number(totalExpenses) || 0;
  const debt = Number(monthlyDebtPayments) || 0;

  if (isNaN(inc) || inc <= 0) {
    return {
      totalMonthlyIncome: null,
      monthlySurplus: null,
      savingsRatePct: null,
      dtiRatioPct: null
    };
  }

  const totalMonthlyIncome = inc + oth;
  const monthlySurplus = Math.max(0, totalMonthlyIncome - exp - debt);

  let savingsRatePct = null;
  if (totalMonthlyIncome > 0) {
    savingsRatePct = Math.max(0, Math.round((monthlySurplus / totalMonthlyIncome) * 100));
  }

  const dtiRatioPct = totalMonthlyIncome > 0 ? Math.round((debt / totalMonthlyIncome) * 100) : 0;

  return {
    totalMonthlyIncome,
    monthlySurplus,
    savingsRatePct,
    dtiRatioPct
  };
}

export function computeGoalBreakdown(goals: any[], currentYear = new Date().getFullYear()) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return [];
  }

  return goals.map((goal) => {
    const goalName = goal.goal_name || goal.title || goal.goalName || "Financial Goal";
    const targetAmount = Number(goal.target_amount || goal.targetAmount) || 0;
    const currentSaved = Number(goal.current_saved || goal.currentAmount) || 0;
    const targetYear = Number(goal.target_year || goal.deadline) || (currentYear + 3);
    const priority = goal.priority || "Medium";

    const remainingAmount = Math.max(0, targetAmount - currentSaved);
    const progressPct = targetAmount > 0 ? Math.min(100, Math.round((currentSaved / targetAmount) * 100)) : 0;

    const yearsRemaining = Math.max(1, targetYear - currentYear);
    const monthsRemaining = yearsRemaining * 12;
    const requiredMonthlyAmount = Math.round(remainingAmount / monthsRemaining);

    const isEmergencyGoal = goalName.toLowerCase().includes("emergency") || goalName.toLowerCase().includes("reserve");

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

export function computeWaterfallAllocation(monthlySurplus: number | null, emergencyStatus: any, goalsBreakdown: any[]) {
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

  const isUnderfunded = emergencyStatus?.status === "Critically Underfunded" || emergencyStatus?.status === "Underfunded";
  const emergencyGoal = goalsBreakdown.find((g) => g.isEmergencyGoal);
  const otherGoals = goalsBreakdown.filter((g) => !g.isEmergencyGoal);

  // Priority 1 — Emergency Reserve First
  let emergencyAllocation = 0;
  if (isUnderfunded) {
    const requiredEmergencyMonthly = emergencyGoal ? emergencyGoal.requiredMonthlyAmount : Math.round(surplus * 0.5);
    emergencyAllocation = Math.min(surplus, requiredEmergencyMonthly > 0 ? requiredEmergencyMonthly : Math.round(surplus * 0.5));
  }

  // Priority 2 — Other Active Goals
  const surplusAfterEmergency = Math.max(0, surplus - emergencyAllocation);
  const totalOtherGoalsRequiredMonthly = otherGoals.reduce((sum, g) => sum + (g.requiredMonthlyAmount || 0), 0);
  const otherGoalAllocation = Math.min(surplusAfterEmergency, totalOtherGoalsRequiredMonthly);

  // Priority 3 — Mutual Funds (ONLY remaining surplus)
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

export function computeHealthDiagnosticSummary(healthScoreRecord: any) {
  if (!healthScoreRecord || healthScoreRecord.overall_score == null) {
    return {
      overallScore: null,
      strongestAreas: [],
      weakestAreas: [],
      potentialBottlenecks: []
    };
  }

  return {
    overallScore: Number(healthScoreRecord.overall_score),
    strongestAreas: ["Savings Rate", "Debt Management"],
    weakestAreas: ["Emergency Reserve"],
    potentialBottlenecks: ["Emergency Reserve Fund coverage under 6 months"]
  };
}
