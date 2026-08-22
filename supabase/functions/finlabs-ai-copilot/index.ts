import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import {
  computeEmergencyStatus,
  computeCashFlowMetrics,
  computeGoalBreakdown,
  computeWaterfallAllocation,
  computeHealthDiagnosticSummary,
  classifyQueryIntent,
  extractProposedAmount,
  computeInvestmentSimulation,
  SimulationResult
} from "./financialEngine.ts";
import {
  getTopRecommendedSchemes,
  EnrichedScheme
} from "./mfIntelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, clientContext } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request payload. 'query' parameter is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Verify JWT and authenticate user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid user session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Retrieve authenticated user's private financial data
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: finProfile } = await supabaseAdmin
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: goals } = await supabaseAdmin
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id);

    const { data: healthScore } = await supabaseAdmin
      .from("financial_health_scores")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // 4. Resolve authoritative financial metrics (Database record prioritized, authenticated client fallback if syncing)
    const effectiveIncome = finProfile?.monthly_income != null
      ? Number(finProfile.monthly_income)
      : (clientContext?.monthlyIncome != null ? Number(clientContext.monthlyIncome) : null);

    const effectiveOtherIncome = finProfile?.other_income != null
      ? Number(finProfile.other_income)
      : (clientContext?.otherIncome != null ? Number(clientContext.otherIncome) : 0);

    const effectiveExpenses = finProfile?.monthly_expenses != null
      ? Number(finProfile.monthly_expenses)
      : (clientContext?.totalExpenses != null ? Number(clientContext.totalExpenses) : null);

    const effectiveDebtPayments = finProfile?.monthly_debt_payments != null
      ? Number(finProfile.monthly_debt_payments)
      : (clientContext?.monthlyDebtPayments != null ? Number(clientContext.monthlyDebtPayments) : 0);

    const effectiveEmergencyFund = finProfile?.emergency_fund != null
      ? Number(finProfile.emergency_fund)
      : (clientContext?.emergencyFund != null ? Number(clientContext.emergencyFund) : null);

    const effectiveCurrentSavings = finProfile?.current_savings != null
      ? Number(finProfile.current_savings)
      : (clientContext?.currentSavings != null ? Number(clientContext.currentSavings) : null);

    const effectiveGoals = (Array.isArray(goals) && goals.length > 0)
      ? goals
      : (Array.isArray(clientContext?.goals) ? clientContext.goals : []);

    const effectiveRisk = finProfile?.risk_tolerance || clientContext?.riskTolerance || "Moderate";
    const effectiveHorizon = finProfile?.time_horizon || clientContext?.timeHorizon || "5–10 years";

    // 5. Perform deterministic financial calculations
    const cashFlow = computeCashFlowMetrics(effectiveIncome, effectiveOtherIncome, effectiveExpenses, effectiveDebtPayments);
    const emergency = computeEmergencyStatus(effectiveEmergencyFund, effectiveExpenses);
    const goalBreakdown = computeGoalBreakdown(effectiveGoals);
    const waterfallAllocation = computeWaterfallAllocation(cashFlow.monthlySurplus, emergency, goalBreakdown);
    const diagnosticSummary = computeHealthDiagnosticSummary(healthScore || clientContext?.healthDiagnostic);

    // 6. Query Intent Classification & What-If Simulation
    const intent = classifyQueryIntent(query);
    const proposedAmount = extractProposedAmount(query);

    let simulationResult: SimulationResult | null = null;
    if (intent === "CALCULATION_SIMULATION" && proposedAmount != null && cashFlow.totalMonthlyIncome != null && effectiveExpenses != null) {
      simulationResult = computeInvestmentSimulation(
        proposedAmount,
        cashFlow.totalMonthlyIncome,
        effectiveExpenses,
        effectiveDebtPayments
      );
    }

    // 7. Retrieve Mutual Fund Intelligence ONLY if intent is strictly INVESTMENT_RECOMMENDATIONS
    let recommendedMutualFunds: EnrichedScheme[] = [];
    if (intent === "INVESTMENT_RECOMMENDATIONS") {
      try {
        recommendedMutualFunds = await getTopRecommendedSchemes({
          riskTolerance: effectiveRisk,
          timeHorizon: effectiveHorizon
        });
      } catch (err) {
        console.error("Error retrieving mutual fund recommendations:", err);
      }
    }

    // 8. Build enriched structured financial context
    const financialContext = {
      fullName: profile?.full_name || clientContext?.fullName || user.user_metadata?.full_name || "Investor",
      email: user.email || null,
      age: finProfile?.age ?? clientContext?.age ?? null,
      employmentStatus: finProfile?.employment_status ?? clientContext?.employmentStatus ?? null,
      occupation: finProfile?.occupation ?? clientContext?.occupation ?? null,

      // Query Intent & Deterministic Simulation Context
      queryIntent: intent,
      simulationResult: simulationResult,

      // Deterministic Cash Flow Metrics
      monthlyTakeHomeIncome: effectiveIncome,
      otherMonthlyIncome: effectiveOtherIncome,
      totalMonthlyIncome: cashFlow.totalMonthlyIncome,
      totalMonthlyExpenses: effectiveExpenses,
      monthlyDebtPayments: effectiveDebtPayments,
      monthlyRecurringSavingsSurplus: cashFlow.monthlySurplus,
      savingsRatePct: cashFlow.savingsRatePct,
      dtiRatioPct: cashFlow.dtiRatioPct,

      // Deterministic Emergency Reserve Metrics
      accumulatedLiquidSavingsBalance: effectiveCurrentSavings,
      emergencyFundReserveBalance: effectiveEmergencyFund,
      emergencyMonths: emergency.emergencyMonths,
      emergencyTargetMonths: emergency.recommendedMonths,
      emergencyTargetReserveINR: emergency.targetReserveINR,
      emergencyGapINR: emergency.emergencyGapINR,
      emergencyStatus: emergency.status,

      // True Sequential Waterfall Allocation
      waterfallAllocation: waterfallAllocation,

      // Debt Details
      hasDebt: effectiveDebtPayments > 0 || finProfile?.has_debt === true,
      totalDebtBalance: finProfile?.total_debt ?? clientContext?.totalDebt ?? null,

      // Investment & Risk Profile
      investmentExperience: finProfile?.investment_experience ?? clientContext?.investmentExperience ?? "beginner",
      riskTolerance: effectiveRisk,
      timeHorizon: effectiveHorizon,

      // Deterministic Diagnostic & Goals Breakdown
      overallHealthScore: diagnosticSummary.overallScore ?? clientContext?.overallHealthScore ?? null,
      healthDiagnosticSummary: diagnosticSummary,
      goalsBreakdown: goalBreakdown,

      // Mutual Fund Intelligence Context (Populated only for INVESTMENT_RECOMMENDATIONS)
      recommendedMutualFunds: intent === "INVESTMENT_RECOMMENDATIONS" ? recommendedMutualFunds : []
    };

    // 9. Read GEMINI_API_KEY from Supabase Secrets
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    let generatedAnswer = "";

    if (geminiApiKey) {
      const systemInstruction = `You are FinLabs AI, an expert conversational financial copilot. You are speaking directly to the user based on their authentic private financial data provided below.

AUTHORITATIVE INTENT-BASED DIRECTIVES:
1. QUERY INTENT: The query intent is classified as "${intent}".
2. IF INTENT IS "CALCULATION_SIMULATION":
   - Answer the calculation or what-if scenario directly and mathematically.
   - If the user asks what happens to their surplus if they invest an amount (e.g. ₹${proposedAmount || 20000}), USE the pre-calculated "simulationResult" object:
     * Current Total Monthly Income: ₹${financialContext.totalMonthlyIncome ?? 0}
     * Current Monthly Expenses: ₹${financialContext.totalMonthlyExpenses ?? 0}
     * Current Monthly Debt/EMI: ₹${financialContext.monthlyDebtPayments ?? 0}
     * Current Monthly Surplus before investment: ₹${financialContext.monthlyRecurringSavingsSurplus ?? 0}
     * Proposed Monthly Investment: ₹${simulationResult?.proposedInvestmentAmount ?? proposedAmount ?? 0}
     * Remaining Unallocated Surplus: ₹${simulationResult?.remainingSurplusAfterInvestment ?? 0}
     * Effective Investment Rate: ${simulationResult?.investmentRateOfIncomePct ?? 0}% of monthly income.
   - Show the step-by-step arithmetic clearly.
   - DO NOT list mutual fund schemes or recommend funds when answering a calculation/simulation question.
3. IF INTENT IS "INVESTMENT_RECOMMENDATIONS":
   - Recommend Direct Growth mutual fund schemes matching the user's risk tolerance (${financialContext.riskTolerance}).
   - Use ONLY the schemes in "recommendedMutualFunds".
4. IF INTENT IS "PROFILE_QUESTIONS":
   - Answer the specific profile metric (Health Score, Income, Expenses, Emergency Reserve, Goals) directly using the context.
5. IF INTENT IS "GENERAL_EDUCATION":
   - Explain the concept clearly and educationally.
6. IF INTENT IS "UNRELATED":
   - Politely explain that FinLabs AI is dedicated to personal finance, investments, savings, and wealth planning.

USER'S PRIVATE FINANCIAL CONTEXT:
${JSON.stringify(financialContext, null, 2)}`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

      const geminiRes = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${systemInstruction}\n\nUSER QUESTION: ${query}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const candidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          generatedAnswer = candidateText.trim();
        }
      } else {
        const errText = await geminiRes.text();
        console.error("Gemini API call returned non-200 status:", geminiRes.status, errText);
      }
    }

    // Dynamic deterministic fallback engine using authentic user numbers
    if (!generatedAnswer) {
      const nameGreeting = financialContext.fullName ? financialContext.fullName.split(" ")[0] : "there";
      const formatINR = (val: number | null) =>
        val != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val) : "unavailable";

      const qLower = query.toLowerCase();

      if (intent === "CALCULATION_SIMULATION" && simulationResult) {
        const sim = simulationResult;
        generatedAnswer = `If you invest **${formatINR(sim.proposedInvestmentAmount)}** every month, your remaining monthly unallocated surplus will be **${formatINR(sim.remainingSurplusAfterInvestment)}**.\n\n**Exact Calculation Breakdown:**\n- **Total Monthly Inflow**: ${formatINR(sim.currentMonthlyIncome)}\n- **Monthly Expenses**: -${formatINR(sim.currentMonthlyExpenses)}\n- **Monthly Loan EMI / Debt**: -${formatINR(sim.currentMonthlyDebt)}\n- **Base Monthly Surplus**: **${formatINR(sim.currentMonthlySurplus)}**\n- **Proposed Monthly Investment**: -${formatINR(sim.proposedInvestmentAmount)}\n- **Remaining Unallocated Surplus**: **${formatINR(sim.remainingSurplusAfterInvestment)}**\n\n**Financial Assessment:**\n- You will be investing **${sim.surplusUtilizationPct}%** of your available monthly surplus.\n- Your effective investment rate will be **${sim.investmentRateOfIncomePct}%** of total monthly income.\n- ${sim.isDeficit ? `⚠️ This exceeds your current surplus by ${formatINR(sim.deficitAmount)}/month. Consider adjusting to stay within surplus.` : `✅ This investment is fully sustainable and leaves a liquid buffer of ${formatINR(sim.remainingSurplusAfterInvestment)}/month.`}`;
      } else if (intent === "INVESTMENT_RECOMMENDATIONS" && recommendedMutualFunds.length > 0) {
        let mfSummary = `Based on your **${financialContext.riskTolerance || "Moderate"}** risk profile and **${financialContext.timeHorizon || "3–5 years"}** horizon, here are top matching Direct Growth schemes:\n\n`;
        recommendedMutualFunds.forEach((f, idx) => {
          mfSummary += `${idx + 1}. **${f.schemeName}** (${f.fundHouse}) — NAV: ${f.nav || 'N/A'}${f.cagr3Yr ? `, 3Y CAGR: ${f.cagr3Yr}` : ''}\n`;
        });
        mfSummary += `\n*Note: Mutual fund investments are subject to market risks. Past performance does not guarantee future returns.*`;
        generatedAnswer = mfSummary;
      } else if (qLower.includes("score") || qLower.includes("health")) {
        generatedAnswer = financialContext.overallHealthScore != null
          ? `Your current FinLabs Financial Health Score is **${financialContext.overallHealthScore}/100**. Your savings rate is **${financialContext.savingsRatePct}%** and your emergency fund covers **${financialContext.emergencyMonths} months** of expenses.`
          : `Hi ${nameGreeting}, complete all onboarding steps to calculate your overall health score!`;
      } else if (qLower.includes("emergency")) {
        generatedAnswer = `You currently have **${financialContext.emergencyMonths} months** of emergency fund coverage (${formatINR(financialContext.emergencyFundReserveBalance)} saved vs recommended ${formatINR(financialContext.emergencyTargetReserveINR)} target reserve). Your reserve status is **${financialContext.emergencyStatus}**.`;
      } else if (qLower.includes("earn") || qLower.includes("income")) {
        generatedAnswer = financialContext.totalMonthlyIncome != null
          ? `You earn **${formatINR(financialContext.totalMonthlyIncome)}** every month (${formatINR(financialContext.monthlyTakeHomeIncome)} take-home + ${formatINR(financialContext.otherMonthlyIncome)} other income).`
          : `Hi ${nameGreeting}, your monthly income details are currently unavailable in your profile.`;
      } else if (qLower.includes("goal")) {
        if (financialContext.goalsBreakdown.length > 0) {
          const g = financialContext.goalsBreakdown[0];
          generatedAnswer = `Your primary goal **${g.goalName}** has a target of ${formatINR(g.targetAmount)} by ${g.targetYear} (${g.progressPct}% progress, currently saved ${formatINR(g.currentSaved)}). Required monthly investment is ${formatINR(g.requiredMonthlyAmount)}/month.`;
        } else {
          generatedAnswer = `Hi ${nameGreeting}, you have not added any active financial goals yet. You can add goals in Onboarding or Profile!`;
        }
      } else if (qLower.includes("save") || qLower.includes("surplus")) {
        generatedAnswer = `Your net monthly surplus is **${formatINR(financialContext.monthlyRecurringSavingsSurplus)}** (${financialContext.savingsRatePct}% savings rate).\n\n**Exact Calculation:**\n- Total Monthly Income: ${formatINR(financialContext.totalMonthlyIncome)}\n- Total Monthly Expenses: -${formatINR(financialContext.totalMonthlyExpenses)}\n- Monthly Loan EMI / Debt: -${formatINR(financialContext.monthlyDebtPayments)}\n- **Net Monthly Surplus**: **${formatINR(financialContext.monthlyRecurringSavingsSurplus)}**`;
      } else if (intent === "UNRELATED") {
        generatedAnswer = `I am your FinLabs AI Financial Copilot. I specialize in personal financial planning, cash flow analysis, investment suitability, and goal tracking. How can I help with your financial goals or portfolio today?`;
      } else {
        generatedAnswer = `Hi ${nameGreeting}, your monthly income is ${formatINR(financialContext.totalMonthlyIncome)}, expenses are ${formatINR(financialContext.totalMonthlyExpenses)}, loan EMI is ${formatINR(financialContext.monthlyDebtPayments)}, and net monthly recurring savings surplus is ${formatINR(financialContext.monthlyRecurringSavingsSurplus)}.`;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        answer: generatedAnswer,
        context: financialContext
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("FinLabs AI Copilot error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
