import { supabase } from '../lib/supabaseClient';
import { getFinancialProfile } from './onboardingService';
import { getFinancialHealthDiagnostic } from './financialHealth/adapter';
import {
  createFinancialAnalysis,
  computeCashFlowMetrics,
  computeEmergencyStatus,
  computeGoalBreakdown,
  computeHealthDiagnosticSummary
} from './aiFinancialEngine';

/**
 * Builds a structured financial context object for the authenticated user
 */
export async function buildUserFinancialContext(userId, fallbackProfile = null) {
  if (!userId) {
    return {
      isAuthenticated: false,
      fullName: fallbackProfile?.full_name || null,
      monthlyIncome: null,
      totalExpenses: null,
      monthlySurplus: null,
      currentSavings: null,
      emergencyFund: null,
      emergencyMonths: null,
      savingsRatePct: null,
      hasDebt: null,
      totalDebt: null,
      monthlyDebtPayments: null,
      debtToIncomeRatio: null,
      goals: [],
      investmentExperience: null,
      riskTolerance: null,
      timeHorizon: null,
      hasHealthInsurance: null,
      hasLifeInsurance: null,
      overallHealthScore: null,
      healthDiagnostic: null,
      financialAnalysis: null
    };
  }

  try {
    // 1. Fetch user profile from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // 2. Fetch financial profile
    const finProfile = await getFinancialProfile(userId);

    // 3. Fetch financial health diagnostic
    let diagnostic = null;
    try {
      diagnostic = await getFinancialHealthDiagnostic(userId);
    } catch (e) {
      console.info('Diagnostic fetch notice:', e);
    }

    const fullName = profile?.full_name || fallbackProfile?.full_name || null;
    const monthlyIncome = finProfile?.monthly_income != null ? Number(finProfile.monthly_income) : null;
    const otherIncome = finProfile?.other_income != null ? Number(finProfile.other_income) : 0;
    const totalIncome = monthlyIncome != null ? monthlyIncome + otherIncome : null;

    const monthlyEssential = finProfile?.monthly_essential_expenses != null ? Number(finProfile.monthly_essential_expenses) : null;
    const monthlyDiscretionary = finProfile?.monthly_discretionary_expenses != null ? Number(finProfile.monthly_discretionary_expenses) : null;
    const totalExpenses = finProfile?.monthly_expenses != null ? Number(finProfile.monthly_expenses) : (monthlyEssential != null && monthlyDiscretionary != null ? monthlyEssential + monthlyDiscretionary : null);

    const monthlySurplus = totalIncome != null && totalExpenses != null ? totalIncome - totalExpenses : null;
    const currentSavings = finProfile?.current_savings != null ? Number(finProfile.current_savings) : null;
    const emergencyFund = finProfile?.emergency_fund != null ? Number(finProfile.emergency_fund) : null;

    let emergencyMonths = null;
    if (emergencyFund != null && totalExpenses != null && totalExpenses > 0) {
      emergencyMonths = (emergencyFund / totalExpenses).toFixed(1);
    }

    let savingsRatePct = null;
    if (monthlySurplus != null && totalIncome != null && totalIncome > 0) {
      savingsRatePct = Math.max(0, Math.round((monthlySurplus / totalIncome) * 100));
    }

    const hasDebt = finProfile?.has_debt != null ? Boolean(finProfile.has_debt) : null;
    const totalDebt = finProfile?.total_debt != null ? Number(finProfile.total_debt) : null;
    const monthlyDebtPayments = finProfile?.monthly_debt_payments != null ? Number(finProfile.monthly_debt_payments) : null;

    let debtToIncomeRatio = null;
    if (monthlyDebtPayments != null && totalIncome != null && totalIncome > 0) {
      debtToIncomeRatio = Math.round((monthlyDebtPayments / totalIncome) * 100);
    }

    const rawGoals = Array.isArray(finProfile?.goals) ? finProfile.goals : [];
    const goalsBreakdown = computeGoalBreakdown(rawGoals);
    const overallHealthScore = diagnostic?.overallScore ?? null;

    const baseContext = {
      isAuthenticated: true,
      fullName,
      email: profile?.email || null,
      age: finProfile?.age ?? null,
      employmentStatus: finProfile?.employment_status ?? null,
      occupation: finProfile?.occupation ?? null,
      dependents: finProfile?.dependents ?? null,
      monthlyIncome: totalIncome,
      totalExpenses,
      monthlySurplus,
      currentSavings,
      emergencyFund,
      emergencyMonths,
      savingsRatePct,
      hasDebt,
      totalDebt,
      monthlyDebtPayments,
      debtToIncomeRatio,
      goals: rawGoals,
      goalsBreakdown,
      investmentCategories: finProfile?.investment_categories || [],
      investmentExperience: finProfile?.investment_experience ?? null,
      riskTolerance: finProfile?.risk_tolerance ?? null,
      timeHorizon: finProfile?.time_horizon ?? null,
      hasHealthInsurance: finProfile?.has_health_insurance ?? null,
      hasLifeInsurance: finProfile?.has_life_insurance ?? null,
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
      monthlyIncome: null,
      totalExpenses: null,
      monthlySurplus: null,
      currentSavings: null,
      emergencyFund: null,
      emergencyMonths: null,
      savingsRatePct: null,
      hasDebt: null,
      totalDebt: null,
      monthlyDebtPayments: null,
      debtToIncomeRatio: null,
      goals: [],
      goalsBreakdown: [],
      investmentExperience: null,
      riskTolerance: null,
      timeHorizon: null,
      hasHealthInsurance: null,
      hasLifeInsurance: null,
      overallHealthScore: null,
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
export async function generateAiResponse(query, userId, fallbackProfile = null) {
  const ctx = await buildUserFinancialContext(userId, fallbackProfile);
  const qLower = query.toLowerCase();

  // Try calling Supabase Edge Function with JWT Bearer Token
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/finlabs-ai-copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const edgeResult = await response.json();
        if (edgeResult?.answer) {
          return edgeResult.answer;
        }
        if (edgeResult?.response) {
          return edgeResult.response;
        }
      }
    }
  } catch (e) {
    console.info('Edge function direct call fallback notice:', e.message);
  }

  // Dynamic Contextual Financial Guidance Engine using user's real numbers
  const nameGreeting = ctx.fullName ? ctx.fullName.split(' ')[0] : 'there';

  if (qLower.includes('score') || qLower.includes('health')) {
    if (ctx.overallHealthScore != null) {
      let breakdown = `Your current FinLabs Health Score is **${ctx.overallHealthScore}/100**.`;
      if (ctx.savingsRatePct != null) {
        breakdown += ` Your savings rate is **${ctx.savingsRatePct}%**.`;
      }
      if (ctx.emergencyMonths != null) {
        breakdown += ` Your emergency reserve covers **${ctx.emergencyMonths} months** of expenses.`;
      }
      if (ctx.hasDebt && ctx.totalDebt != null) {
        breakdown += ` Outstanding debt is ${formatINR(ctx.totalDebt)}.`;
      } else if (ctx.hasDebt === false) {
        breakdown += ` You are currently debt-free!`;
      }
      return breakdown;
    }
    return `Hi ${nameGreeting}, your financial profile shows an active baseline. Complete all onboarding questions in Step 1 to compute your precise score.`;
  }

  if (qLower.includes('earn') || qLower.includes('income')) {
    if (ctx.monthlyIncome != null) {
      return `You earn **${formatINR(ctx.monthlyIncome)}** every month. Your monthly expenses are ${formatINR(ctx.totalExpenses)}, leaving a net recurring surplus of ${formatINR(ctx.monthlySurplus)}.`;
    }
    return `Hi ${nameGreeting}, your monthly income details are currently unavailable in your profile.`;
  }

  if (qLower.includes('save') || qLower.includes('surplus')) {
    if (ctx.monthlySurplus != null) {
      return `You save **${formatINR(ctx.monthlySurplus)}** every month (${ctx.savingsRatePct || 0}% savings rate) out of ${formatINR(ctx.monthlyIncome)} total monthly income.`;
    }
    return `Hi ${nameGreeting}, enter your income and expense figures in Onboarding to calculate your exact monthly surplus.`;
  }

  if (qLower.includes('goal') || qLower.includes('downpayment') || qLower.includes('reach')) {
    if (ctx.goalsBreakdown && ctx.goalsBreakdown.length > 0) {
      const primaryGoal = ctx.goalsBreakdown[0];
      return `Your primary goal **${primaryGoal.goalName}** has a target of ${formatINR(primaryGoal.targetAmount)} by ${primaryGoal.targetYear}. You have currently saved ${formatINR(primaryGoal.currentSaved)} (${primaryGoal.remainingAmount > 0 ? `${formatINR(primaryGoal.remainingAmount)} remaining` : 'Goal achieved!'}). Required monthly investment is **${formatINR(primaryGoal.requiredMonthlyAmount)}/month**.`;
    }
    return `Hi ${nameGreeting}, you haven't added any specific financial goals yet. You can add goals under Onboarding Step 3 or Profile to track progress!`;
  }

  if (qLower.includes('risk') || qLower.includes('category') || qLower.includes('suit')) {
    const risk = ctx.riskTolerance || 'Moderate';
    const horizon = ctx.timeHorizon || '3–5 years';
    return `Based on your **${risk}** risk tolerance and **${horizon}** investment time horizon, a balanced portfolio of Large Cap Index Funds and Flexi Cap Mutual Funds provides optimal growth with controlled volatility.`;
  }

  if (qLower.includes('summary') || qLower.includes('overview') || qLower.includes('complete')) {
    if (ctx.monthlyIncome != null && ctx.overallHealthScore != null) {
      return `Hi ${nameGreeting}, your complete financial profile summary:\n- **Monthly Income**: ${formatINR(ctx.monthlyIncome)}\n- **Monthly Expenses**: ${formatINR(ctx.totalExpenses)}\n- **Monthly Recurring Savings**: ${formatINR(ctx.monthlySurplus)} (${ctx.savingsRatePct}% savings rate)\n- **Financial Health Score**: ${ctx.overallHealthScore}/100\n- **Risk Profile**: ${ctx.riskTolerance || 'Moderate'} (${ctx.timeHorizon || '3-5 years'})`;
    }
  }

  return `Hi ${nameGreeting}! I am your FinLabs AI Financial Copilot. I analyze your real profile, savings, debt, and financial health score to help you achieve your goals. What would you like to explore today?`;
}
