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
 * Priority order:
 * 1. CALCULATION_SIMULATION
 * 2. PROFILE_QUESTIONS
 * 3. INVESTMENT_RECOMMENDATIONS
 * 4. GENERAL_EDUCATION
 * 5. UNRELATED
 */
export function classifyQueryIntent(query) {
  if (!query || typeof query !== 'string') return 'UNRELATED';
  const q = query.toLowerCase().trim();

  // 1. Priority 1: CALCULATION_SIMULATION
  const isSimulationOrCalculation =
    q.includes('what happens') ||
    q.includes('what if') ||
    q.includes('how much is left') ||
    q.includes('how much remains') ||
    q.includes('calculate my') ||
    q.includes('calculation') ||
    q.includes('surplus if') ||
    q.includes('if i invest') ||
    q.includes('if i save') ||
    q.includes('if i spend') ||
    q.includes('if i increase') ||
    q.includes('if i pay') ||
    q.includes('remaining surplus') ||
    q.includes('exact calculation') ||
    (q.includes('surplus') && (q.includes('invest') || /\d+/.test(q)));

  if (isSimulationOrCalculation) {
    return 'CALCULATION_SIMULATION';
  }

  // 2. Priority 2: PROFILE_QUESTIONS (Must explicitly ask about personal data via "my", "i", "me")
  const isPersonalProfileQuery =
    q.includes('my score') ||
    q.includes('my health score') ||
    q.includes('my financial health') ||
    q.includes('my income') ||
    q.includes('how much do i earn') ||
    q.includes('my expenses') ||
    q.includes('how much do i spend') ||
    q.includes('my emergency fund') ||
    q.includes('my reserve') ||
    q.includes('how many months of emergency') ||
    q.includes('my goals') ||
    q.includes('my goal') ||
    q.includes('my debt') ||
    q.includes('my emi') ||
    q.includes('my loan') ||
    q.includes('my savings') ||
    q.includes('how much do i save') ||
    q.includes('my surplus') ||
    q.includes('my monthly surplus') ||
    q.includes('my action plan') ||
    q.includes('my summary') ||
    q.includes('my financial summary') ||
    q.includes('my profile');

  if (isPersonalProfileQuery) {
    return 'PROFILE_QUESTIONS';
  }

  // 3. Priority 3: INVESTMENT_RECOMMENDATIONS (Explicit scheme recommendation requests)
  const isRecommendation =
    (q.includes('which') && (q.includes('fund') || q.includes('stock') || q.includes('scheme') || q.includes('invest in'))) ||
    (q.includes('recommend') && (q.includes('fund') || q.includes('scheme') || q.includes('portfolio') || q.includes('stock') || q.includes('sip'))) ||
    (q.includes('suggest') && (q.includes('fund') || q.includes('scheme') || q.includes('stock') || q.includes('sip'))) ||
    (q.includes('best') && (q.includes('fund') || q.includes('scheme') || q.includes('mutual fund') || q.includes('sip'))) ||
    (q.includes('top') && (q.includes('fund') || q.includes('scheme') || q.includes('direct growth'))) ||
    q.includes('match my risk profile') ||
    q.includes('where should i invest');

  if (isRecommendation) {
    return 'INVESTMENT_RECOMMENDATIONS';
  }

  // 4. Priority 4: GENERAL_EDUCATION (Conceptual/educational questions about financial terms)
  const isEducationalConcept =
    q.includes('what is') ||
    q.includes('what are') ||
    q.includes('explain') ||
    q.includes('how does') ||
    q.includes('how do') ||
    q.includes('difference between') ||
    q.includes('meaning of') ||
    q.includes('define') ||
    q.includes('cagr') ||
    q.includes('dti') ||
    q.includes('nav') ||
    q.includes('index fund') ||
    q.includes('active vs passive') ||
    q.includes('passive fund') ||
    q.includes('active fund') ||
    q.includes('expense ratio') ||
    q.includes('compound interest') ||
    q.includes('compounding') ||
    q.includes('sip vs') ||
    q.includes('lump sum') ||
    q.includes('inflation') ||
    q.includes('asset allocation');

  if (isEducationalConcept) {
    return 'GENERAL_EDUCATION';
  }

  // 5. General Financial Queries
  const financeKeywords = [
    'money', 'finance', 'bank', 'tax', 'budget', 'salary', 'expense', 'saving', 'loan', 'asset', 'wealth', 'stock', 'fund', 'equity', 'debt', 'invest'
  ];
  if (financeKeywords.some((k) => q.includes(k))) {
    return 'GENERAL_EDUCATION';
  }

  return 'UNRELATED';
}

/**
 * Returns deterministic educational responses for financial concepts.
 * Never dumps personal financial figures or recommendations.
 */
export function getEducationalExplanation(query) {
  const q = String(query || '').toLowerCase();

  if (q.includes('cagr')) {
    return `**CAGR (Compound Annual Growth Rate)** is the annualized rate of return on an investment over a period longer than one year. It measures the steady compounded growth rate as if the investment grew at a constant rate each year.

**Formula:**
$$\\text{CAGR} = \\left(\\frac{\\text{Ending Value}}{\\text{Beginning Value}}\\right)^{\\frac{1}{n}} - 1$$
*(where $n$ is the number of years).*

**How it works:**
Unlike simple average returns, CAGR smooths out annual market volatility and accounts for the compounding effect of returns over time, making it the industry standard for evaluating mutual funds, stocks, and portfolios.`;
  }

  if (q.includes('dti') || q.includes('debt to income') || q.includes('debt-to-income')) {
    return `**Debt-to-Income (DTI) Ratio** is the percentage of your monthly income that goes toward servicing recurring debt obligations and loan EMIs.

**Formula:**
$$\\text{DTI Ratio} = \\left(\\frac{\\text{Total Monthly Loan EMIs}}{\\text{Total Monthly Income}}\\right) \\times 100$$

**Financial Guidelines:**
- **< 20%**: Excellent debt health.
- **20%–35%**: Manageable and within safe borrowing limits.
- **> 40%**: High debt burden; reduces monthly savings and increases financial risk.`;
  }

  if (q.includes('compound') || q.includes('compounding')) {
    return `**Compound Interest** is the interest calculated on the initial principal plus all accumulated interest from previous periods ("earning interest on interest").

**Formula:**
$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$
*(where $P$ = principal, $r$ = annual interest rate, $n$ = compounding frequency per year, $t$ = time in years).*

**Why it matters:**
Compounding accelerates wealth exponentially over time. Starting investments early—even with smaller amounts via monthly SIPs—allows compounding to multiply capital significantly over 5, 10, or 20-year horizons.`;
  }

  if (q.includes('index fund') || q.includes('active vs passive') || q.includes('passive')) {
    return `**An Index Fund** is a mutual fund or ETF designed to passively replicate the portfolio of a specific market index (such as the Nifty 50 or S&P BSE Sensex).

**Active vs. Passive Funds:**
- **Index / Passive Funds**: Passively mirror the index. They carry ultra-low expense ratios (often 0.1%–0.3%) and eliminate individual fund manager risk.
- **Active Funds**: Managed by professional fund managers aiming to outperform the benchmark by picking stocks, incurring higher expense ratios (0.5%–1.5%).`;
  }

  if (q.includes('expense ratio')) {
    return `**Expense Ratio** is the annual fee charged by mutual funds and Asset Management Companies (AMCs) to operate and manage a fund, expressed as a percentage of your total investment.

**Key Insights:**
- Covers fund management, administrative costs, and regulatory compliance.
- **Direct Plans** have substantially lower expense ratios (often 0.5%–1.0% less) than **Regular Plans** because no distributor commissions are paid, allowing higher net compounded returns over time.`;
  }

  if (q.includes('emergency fund') || q.includes('reserve')) {
    return `**An Emergency Fund** is a liquid cash reserve set aside to cover unexpected emergencies—such as medical crises, urgent home repairs, or temporary job loss—without liquidating long-term investments or incurring high-interest debt.

**Rule of Thumb:**
Financial planners recommend maintaining **3 to 6 months** of essential living expenses (rent, utilities, groceries, EMIs) in safe, liquid accounts such as high-yield savings accounts or liquid funds.`;
  }

  return `Financial education concepts are designed to build long-term wealth through disciplined investing, prudent debt management, and appropriate risk allocation. Let me know if you would like an explanation of specific financial metrics such as CAGR, DTI ratio, Index Funds, Expense Ratios, or Compound Interest.`;
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
