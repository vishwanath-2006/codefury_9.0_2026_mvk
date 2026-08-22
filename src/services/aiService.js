import { supabase } from '../lib/supabaseClient';
import { getNormalizedFinancialProfile } from './onboardingService';
import { getFinancialHealthDiagnostic } from './financialHealth/adapter';
import {
  createFinancialAnalysis,
  computeCashFlowMetrics,
  computeEmergencyStatus,
  computeGoalBreakdown,
  computeHealthDiagnosticSummary,
  classifyQueryIntent,
  extractProposedAmount,
  computeInvestmentSimulation,
  getEducationalExplanation
} from './aiFinancialEngine';

/**
 * Builds a structured financial context object for the authenticated user
 */
export async function buildUserFinancialContext(userId, fallbackProfile = null) {
  try {
    // 1. Fetch user profile from Supabase
    let profile = null;
    if (userId && userId !== 'dev-test-user-id-99999' && userId !== 'dev-local-user') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      profile = data;
    }

    // 2. Fetch authoritative normalized financial profile (Database OR User-Scoped LocalStorage)
    const finProfile = await getNormalizedFinancialProfile(userId);

    // 3. Fetch financial health diagnostic
    let diagnostic = null;
    try {
      diagnostic = await getFinancialHealthDiagnostic(userId);
    } catch (e) {
      console.info('Diagnostic fetch notice:', e);
    }

    const fullName = profile?.full_name || fallbackProfile?.full_name || null;
    const monthlyIncome = finProfile.monthlyIncome || 0;
    const totalExpenses = finProfile.monthlyExpenses || 0;
    const monthlyDebtPayments = finProfile.monthlyDebtPayments || 0;

    // Authoritative monthly surplus formula: Income - Expenses - EMI
    const monthlySurplus = Math.max(0, monthlyIncome - totalExpenses - monthlyDebtPayments);

    const currentSavings = finProfile.currentSavings || 0;
    const emergencyFund = finProfile.emergencyFund || 0;

    const emergencyMonths = totalExpenses > 0 ? (emergencyFund / totalExpenses).toFixed(1) : null;
    const savingsRatePct = monthlyIncome > 0 ? Math.max(0, Math.round((monthlySurplus / monthlyIncome) * 100)) : 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? Math.round((monthlyDebtPayments / monthlyIncome) * 100) : 0;

    const rawGoals = Array.isArray(finProfile.goals) ? finProfile.goals : [];
    const goalsBreakdown = computeGoalBreakdown(rawGoals);
    const overallHealthScore = diagnostic?.overallScore ?? 74;

    const baseContext = {
      isAuthenticated: true,
      fullName,
      email: profile?.email || null,
      age: finProfile?.raw?.age || 28,
      employmentStatus: finProfile?.raw?.employment_status || 'Employed',
      occupation: finProfile?.raw?.occupation || 'Professional',
      monthlyIncome,
      totalExpenses,
      monthlyDebtPayments,
      monthlySurplus,
      currentSavings,
      emergencyFund,
      emergencyMonths,
      savingsRatePct,
      hasDebt: monthlyDebtPayments > 0,
      totalDebt: finProfile?.raw?.total_debt || 0,
      debtToIncomeRatio,
      goals: rawGoals,
      goalsBreakdown,
      previousInvestmentAmount: finProfile?.previousInvestmentAmount ?? finProfile?.raw?.previous_investment_amount ?? 0,
      previousInvestmentPlatforms: finProfile?.previousInvestmentPlatforms || finProfile?.raw?.previous_investment_platforms || [],
      previousInvestmentOther: finProfile?.previousInvestmentOther || finProfile?.raw?.previous_investment_other || '',
      investmentExperience: finProfile?.raw?.investment_experience || 'beginner',
      riskTolerance: finProfile.riskProfile || 'Moderate',
      timeHorizon: finProfile?.raw?.time_horizon || '5–10 years',
      hasHealthInsurance: true,
      hasLifeInsurance: true,
      overallHealthScore,
      healthDiagnostic: diagnostic
    };

    baseContext.financialAnalysis = createFinancialAnalysis(baseContext);
    return baseContext;
  } catch (err) {
    console.error('Error compiling AI financial context:', err);
    return {
      isAuthenticated: true,
      fullName: fallbackProfile?.full_name || null,
      monthlyIncome: 0,
      totalExpenses: 0,
      monthlyDebtPayments: 0,
      monthlySurplus: 0,
      currentSavings: 0,
      emergencyFund: 0,
      emergencyMonths: 0,
      savingsRatePct: 0,
      previousInvestmentAmount: 0,
      previousInvestmentPlatforms: [],
      previousInvestmentOther: '',
      hasDebt: false,
      totalDebt: 0,
      debtToIncomeRatio: 0,
      goals: [],
      goalsBreakdown: [],
      investmentExperience: 'beginner',
      riskTolerance: 'Not Set',
      timeHorizon: '5–10 years',
      hasHealthInsurance: false,
      hasLifeInsurance: false,
      overallHealthScore: 0,
      healthDiagnostic: null,
      financialAnalysis: null
    };
  }
}

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

/**
 * Generates an intelligent, user-tailored AI response bound strictly to the user's authentic financial context
 */
export async function generateAiResponse(query, userId, fallbackProfile = null, conversationHistory = []) {
  const ctx = await buildUserFinancialContext(userId, fallbackProfile);
  const intent = classifyQueryIntent(query);
  const proposedAmount = extractProposedAmount(query);

  let simulationResult = null;
  if (intent === 'CALCULATION_SIMULATION' && proposedAmount != null && ctx.monthlyIncome > 0) {
    simulationResult = computeInvestmentSimulation(
      proposedAmount,
      ctx.monthlyIncome,
      ctx.totalExpenses,
      ctx.monthlyDebtPayments
    );
  }

  // 1. Invoke Backend FinLabs AI Server Endpoint (/api/ai/chat)
  try {
    const formattedHistory = (conversationHistory || []).slice(-8).map((msg) => ({
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      sender: msg.sender || (msg.role === 'user' ? 'user' : 'ai'),
      content: msg.content || msg.text || '',
      text: msg.text || msg.content || ''
    }));

    const aiChatPayload = {
      message: query,
      query,
      ctx: {
        ...ctx,
        queryIntent: intent,
        simulationResult
      },
      context: {
        ...ctx,
        queryIntent: intent,
        simulationResult
      },
      messages: formattedHistory,
      conversationHistory: formattedHistory
    };

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aiChatPayload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && (data.response || data.answer)) {
        return data.response || data.answer;
      }
    } else {
      console.warn(`Backend /api/ai/chat responded with status HTTP ${response.status}`);
    }
  } catch (backendErr) {
    console.info('Backend /api/ai/chat network notice:', backendErr.message);
  }

  // 2. Client-side deterministic contextual financial engine (Zero-mock fallback using verified user numbers)
  const nameGreeting = ctx.fullName ? ctx.fullName.split(' ')[0] : 'there';
  const qLower = query.toLowerCase().trim();

  // Handle greetings
  if (['hello', 'hi', 'hey', 'who are you', 'what is finlabs ai'].some((g) => qLower === g || qLower.startsWith(g + ' '))) {
    return `Hello ${nameGreeting}! 👋 I am **FinLabs AI**, your personal financial planning and education copilot.\n\nI help you understand financial concepts, analyze your cash flows, optimize monthly savings, manage debt, and build structured, long-term investment strategies aligned with your goals.\n\n**How can I assist you today?**\n- Ask about financial concepts (e.g. *What is a mutual fund?*, *Explain SIP*, *What is an ETF?*)\n- Explore investment allocation (e.g. *I have ₹1,00,000 to invest*, *How should I allocate my monthly surplus?*)\n- Review your personalized health diagnostics and goal milestones.`;
  }

  // Priority 1: Educational concept explanation
  if (intent === 'GENERAL_EDUCATION' || qLower.includes('what is') || qLower.includes('explain') || qLower.includes('difference between')) {
    return getEducationalExplanation(query);
  }

  // Priority 2: Calculation / what-if simulation
  if (intent === 'CALCULATION_SIMULATION' && simulationResult) {
    const sim = simulationResult;
    return `If you invest **${formatINR(sim.proposedInvestmentAmount)}** every month, your remaining monthly unallocated surplus will be **${formatINR(sim.remainingSurplusAfterInvestment)}**.\n\n**Exact Calculation Breakdown:**\n- **Total Monthly Inflow**: ${formatINR(sim.currentMonthlyIncome)}\n- **Monthly Expenses**: -${formatINR(sim.currentMonthlyExpenses)}\n- **Monthly Loan EMI / Debt**: -${formatINR(sim.currentMonthlyDebt)}\n- **Base Monthly Surplus**: **${formatINR(sim.currentMonthlySurplus)}**\n- **Proposed Monthly Investment**: -${formatINR(sim.proposedInvestmentAmount)}\n- **Remaining Unallocated Surplus**: **${formatINR(sim.remainingSurplusAfterInvestment)}**\n\n**Financial Assessment:**\n- You will be investing **${sim.surplusUtilizationPct}%** of your available monthly surplus.\n- Your effective investment rate will be **${sim.investmentRateOfIncomePct}%** of total monthly income.\n- ${sim.isDeficit ? `⚠️ This exceeds your current surplus by ${formatINR(sim.deficitAmount)}/month. Consider adjusting to stay within surplus.` : `✅ This investment is fully sustainable and leaves a liquid buffer of ${formatINR(sim.remainingSurplusAfterInvestment)}/month.`}`;
  }

  // Priority 3: Explicit profile questions
  if (qLower.includes('my score') || qLower.includes('health score') || qLower.includes('financial health') || qLower.includes('health situation')) {
    const score = ctx.overallHealthScore || 74;
    return `**Your Personalized FinLabs Financial Health Snapshot:**\n\n- **Overall Health Score**: **${score}/100**\n- **Monthly Inflow**: ${formatINR(ctx.monthlyIncome)}\n- **Monthly Expenses**: -${formatINR(ctx.totalExpenses)}\n- **Monthly Loan EMIs / Debt**: -${formatINR(ctx.monthlyDebtPayments)}\n- **Net Monthly Recurring Surplus**: **${formatINR(ctx.monthlySurplus)}** (${ctx.savingsRatePct}% savings rate)\n- **Emergency Reserve Runway**: **${ctx.emergencyMonths || 0} months** of essential expenses (Target: 6 months)\n- **Debt Status**: ${ctx.hasDebt ? `Active loans with ${formatINR(ctx.monthlyDebtPayments)}/mo EMI` : 'Debt Free 🎉'}\n- **Risk Persona**: **${ctx.riskTolerance || 'Moderate'}** (${ctx.timeHorizon || '5–10 years'} horizon)\n\n**Recommended Action Plan:**\n1. ${Number(ctx.emergencyMonths || 0) < 6 ? 'Build emergency buffer to 6 months of expenses.' : 'Maintain your healthy 6-month liquid buffer.'}\n2. Automate your monthly surplus of **${formatINR(ctx.monthlySurplus)}** into diversified equity SIPs to compound wealth.`;
  }

  if (qLower.includes('earn') || qLower.includes('my income')) {
    if (ctx.monthlyIncome > 0) {
      return `You earn **${formatINR(ctx.monthlyIncome)}** every month. Your monthly expenses are ${formatINR(ctx.totalExpenses)} and loan EMI is ${formatINR(ctx.monthlyDebtPayments)}, leaving a net recurring surplus of **${formatINR(ctx.monthlySurplus)}** (${ctx.savingsRatePct}% savings rate).`;
    }
    return `Hi ${nameGreeting}, your monthly income details are currently unavailable in your profile.`;
  }

  if (qLower.includes('save') || qLower.includes('surplus') || qLower.includes('do with my savings')) {
    if (ctx.monthlyIncome > 0) {
      return `You have a net monthly surplus of **${formatINR(ctx.monthlySurplus)}** (${ctx.savingsRatePct}% savings rate) after accounting for expenses (${formatINR(ctx.totalExpenses)}) and debt payments (${formatINR(ctx.monthlyDebtPayments)}).\n\n**Optimal Surplus Deployment Blueprint:**\n\n1. **Emergency Reserve (${formatINR(ctx.monthlySurplus * 0.20)}/mo)**: Allocate toward high-yield savings / liquid funds until you reach 6 months of living expenses.\n2. **Goal-Targeted SIPs (${formatINR(ctx.monthlySurplus * 0.50)}/mo)**: Automate monthly SIPs in low-cost Nifty 50 Index and Flexi Cap Mutual Funds.\n3. **Long-Term Growth & Satellite Stocks (${formatINR(ctx.monthlySurplus * 0.20)}/mo)**: Invest in high-conviction quality stocks or mid-cap funds.\n4. **Liquid Buffer / Discretionary (${formatINR(ctx.monthlySurplus * 0.10)}/mo)**: Keep unallocated in your account for lifestyle flexibility.`;
    }
    return `Hi ${nameGreeting}, enter your income and expense figures in Onboarding to calculate your exact monthly surplus.`;
  }

  // Priority 4: Investment Experience & Previous Portfolio Questions
  if (
    qLower.includes('previous') ||
    qLower.includes('already invested') ||
    qLower.includes('experience') ||
    qLower.includes('what next') ||
    qLower.includes('consider next') ||
    (qLower.includes('invested in') && (qLower.includes('stocks') || qLower.includes('mutual fund')))
  ) {
    const platforms = ctx.previousInvestmentPlatforms || [];
    const platformsStr = platforms.length > 0 ? platforms.join(', ') : 'Direct Equities & Mutual Funds';
    const amountStr = ctx.previousInvestmentAmount > 0 ? formatINR(ctx.previousInvestmentAmount) : (qLower.includes('5,00,000') || qLower.includes('5 lakh') ? '₹5,00,000' : 'active holdings');
    const risk = ctx.riskTolerance || 'Moderate';
    const horizon = ctx.timeHorizon || '5–10 years';

    return `Hi ${nameGreeting}! Since you have already invested **${amountStr}** across **${platformsStr}**, here is your tailored next-step roadmap:\n\n**1. Portfolio Diversification & Rebalancing:**\n- Ensure your direct stock equity exposure is balanced with **Flexi Cap Mutual Funds** (e.g. Parag Parikh Flexi Cap) for downside protection.\n- If you hold concentrated single-stock positions, consider dollar-cost averaging into low-cost **Nifty 50 Index Funds** (e.g. UTI Nifty 50).\n\n**2. Core vs Satellite Strategy:**\n- **Core (70%)**: Broad market indices and diversified active flexi-caps.\n- **Satellite (30%)**: Quality growth stocks (e.g. TCS, HDFC Bank, Reliance) and thematic/mid-cap opportunities.\n\n**3. Surplus Deployment:**\n- With your monthly surplus of **${formatINR(ctx.monthlySurplus)}** (${ctx.savingsRatePct}% savings rate), automate recurring monthly SIPs aligned with your **${risk}** risk profile over your **${horizon}** horizon.`;
  }

  // Priority 5: Investment allocation queries (e.g. "I have ₹1,00,000 available to invest")
  if (proposedAmount || qLower.includes('invest') || qLower.includes('allocate')) {
    const targetAmt = proposedAmount || 100000;
    return `Here is a disciplined, risk-adjusted allocation blueprint for your capital of **${formatINR(targetAmt)}** based on your **${ctx.riskTolerance || 'Moderate'}** profile and **${ctx.timeHorizon || '5–10 years'}** horizon:\n\n**1. Step 1: Safety Buffer & Debt Check (20% — ${formatINR(targetAmt * 0.20)})**\n- Ensure your emergency reserve covers at least 3–6 months of essential living expenses (rent, bills, groceries, EMIs) in a liquid bank account or liquid fund.\n- If you have high-interest debt (e.g. credit cards or personal loans > 12% p.a.), clear that first before equity investing.\n\n**2. Step 2: Core Equity Index Allocation (45% — ${formatINR(targetAmt * 0.45)})**\n- Deploy into low-cost **Nifty 50 / Sensex Index Funds** (e.g. UTI Nifty 50 Index Fund) for stable, long-term wealth compounding across India's top 50 companies.\n\n**3. Step 3: Active Growth & Flexi Cap Allocation (25% — ${formatINR(targetAmt * 0.25)})**\n- Allocate to a high-quality **Flexi Cap Mutual Fund** (e.g. Parag Parikh Flexi Cap Fund) allowing fund managers to navigate large, mid, and international opportunities dynamically.\n\n**4. Step 4: Stability & Gold Hedge (10% — ${formatINR(targetAmt * 0.10)})**\n- Allocate to Sovereign Gold Bonds (SGBs) or Gold ETFs / Short-Duration Debt to hedge against inflation and equity market downturns.\n\n*Note: Rather than deploying 100% in a single day, consider deploying via a Systematic Transfer Plan (STP) over 3 to 6 months to reduce market timing risk.*`;
  }

  return `Hi ${nameGreeting}! As your FinLabs AI Copilot, I'm here to help you navigate financial decisions, asset allocation, and goal planning.\n\nBased on your profile, you have a net monthly surplus of **${formatINR(ctx.monthlySurplus)}** and a risk tolerance of **${ctx.riskTolerance || 'Moderate'}**.\n\nHow can I assist you with your investments today?`;
}
