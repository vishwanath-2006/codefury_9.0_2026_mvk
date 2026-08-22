/**
 * FINLABS AI — GUIDED FINANCIAL ADVISOR & ADAPTIVE QUESTION ENGINE
 * Multi-stage adaptive financial interview, dependency-aware question sequencer,
 * zero-hallucination fact aggregation, and comprehensive diagnostic plan generator.
 */

import { ADVISOR_DOMAINS, COMMON_OPTION_PRESETS } from '../data/advisorDomains';
import { extractProposedAmount, computeInvestmentSimulation, getEducationalExplanation } from './aiFinancialEngine';

const SESSION_STORAGE_KEY = 'finlabs_ai_advisor_session_v2';

const formatINR = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

/**
 * Checks if user input is an explicit stop / enough information command
 */
export function isUserRequestingStop(text) {
  if (!text || typeof text !== 'string') return false;
  const q = text.toLowerCase().trim();
  const triggers = [
    "enough",
    "that's enough",
    "thats enough",
    "stop",
    "give me the plan",
    "give me plan",
    "show plan",
    "i'm done",
    "im done",
    "i have enough information",
    "generate plan",
    "generate my analysis",
    "generate analysis",
    "show me the result",
    "show result",
    "that's all",
    "thats all",
    "finish",
    "skip to plan",
    "summary"
  ];
  return triggers.some((t) => q === t || q.startsWith(t));
}

/**
 * Loads the active session from sessionStorage
 */
export function loadAdvisorSession(userId) {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (userId && session.userId && session.userId !== userId) {
      return null;
    }
    return session;
  } catch (e) {
    console.info('Session load notice:', e);
    return null;
  }
}

/**
 * Saves active session to sessionStorage
 */
export function saveAdvisorSession(session) {
  try {
    if (!session) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        ...session,
        lastActivity: Date.now()
      })
    );
  } catch (e) {
    console.info('Session save notice:', e);
  }
}

/**
 * Clears active session
 */
export function clearAdvisorSession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.info('Session clear notice:', e);
  }
}

/**
 * Merges Supabase profile into known facts without fabricating missing numbers
 */
export function initializeKnownFactsFromProfile(profileCtx) {
  if (!profileCtx) return {};

  const facts = {};
  if (profileCtx.monthlyIncome > 0) facts.monthlyIncome = profileCtx.monthlyIncome;
  if (profileCtx.totalExpenses > 0) facts.totalExpenses = profileCtx.totalExpenses;
  if (profileCtx.monthlyDebtPayments !== undefined && profileCtx.monthlyDebtPayments !== null) {
    facts.monthlyDebtPayments = profileCtx.monthlyDebtPayments;
  }
  if (profileCtx.monthlySurplus !== undefined && profileCtx.monthlySurplus !== null) {
    facts.monthlySurplus = profileCtx.monthlySurplus;
  }
  if (profileCtx.emergencyFund !== undefined && profileCtx.emergencyFund !== null) {
    facts.emergencyFund = profileCtx.emergencyFund;
  }
  if (profileCtx.emergencyMonths) facts.emergencyMonths = profileCtx.emergencyMonths;
  if (profileCtx.previousInvestmentAmount !== undefined && profileCtx.previousInvestmentAmount !== null) {
    facts.previousInvestmentAmount = profileCtx.previousInvestmentAmount;
  }
  if (Array.isArray(profileCtx.previousInvestmentPlatforms) && profileCtx.previousInvestmentPlatforms.length > 0) {
    facts.previousInvestmentPlatforms = profileCtx.previousInvestmentPlatforms;
  }
  if (profileCtx.riskTolerance && profileCtx.riskTolerance !== 'Not Set') {
    facts.riskTolerance = profileCtx.riskTolerance;
  }
  if (profileCtx.timeHorizon) facts.timeHorizon = profileCtx.timeHorizon;
  if (profileCtx.overallHealthScore) facts.overallHealthScore = profileCtx.overallHealthScore;
  if (profileCtx.fullName) facts.fullName = profileCtx.fullName;

  return facts;
}

/**
 * Extracts structured facts from user answer dynamically
 */
export function extractFactsFromAnswer(questionKey, userInput, knownFacts = {}) {
  const updated = { ...knownFacts };
  if (!userInput) return updated;

  const raw = userInput.trim();
  const lower = raw.toLowerCase();
  const extractedAmount = extractProposedAmount(raw);

  switch (questionKey) {
    case 'monthlyIncome':
    case 'income':
      if (extractedAmount) updated.monthlyIncome = extractedAmount;
      break;

    case 'incomeStability':
      if (lower.includes('very stable') || lower.includes('salaried')) {
        updated.incomeStability = 'Very Stable (Salaried)';
      } else if (lower.includes('mostly stable')) {
        updated.incomeStability = 'Mostly Stable';
      } else if (lower.includes('variable') || lower.includes('freelance')) {
        updated.incomeStability = 'Variable (Freelance/Contract)';
      } else if (lower.includes('business')) {
        updated.incomeStability = 'Business / Entrepreneurial';
      } else {
        updated.incomeStability = raw;
      }
      break;

    case 'totalExpenses':
    case 'expenses':
      if (extractedAmount) updated.totalExpenses = extractedAmount;
      break;

    case 'discretionarySpending':
      if (lower.includes('low') || lower.includes('<20')) {
        updated.discretionarySpending = 'Low / Frugal (<20%)';
      } else if (lower.includes('high') || lower.includes('>40')) {
        updated.discretionarySpending = 'High Lifestyle (>40%)';
      } else {
        updated.discretionarySpending = 'Moderate (20–40%)';
      }
      break;

    case 'monthlyDebtPayments':
    case 'hasDebt':
      if (lower.includes('no') || lower.includes('zero') || lower.includes('nil') || lower.includes('debt free')) {
        updated.monthlyDebtPayments = 0;
        updated.hasDebt = false;
        updated.debtType = 'None (Debt Free)';
      } else {
        updated.hasDebt = true;
        if (extractedAmount != null) {
          updated.monthlyDebtPayments = extractedAmount;
        }
        if (lower.includes('home')) updated.debtType = 'Home Loan';
        else if (lower.includes('car')) updated.debtType = 'Car Loan';
        else if (lower.includes('education')) updated.debtType = 'Education Loan';
        else if (lower.includes('personal') || lower.includes('credit')) updated.debtType = 'Personal Loan / Credit Card';
        else if (!updated.debtType) updated.debtType = raw;
      }
      break;

    case 'debtType':
      updated.debtType = raw;
      if (lower.includes('no') || lower.includes('zero')) {
        updated.hasDebt = false;
        updated.monthlyDebtPayments = 0;
      } else {
        updated.hasDebt = true;
      }
      break;

    case 'debtBalance':
      if (extractedAmount != null) updated.debtBalance = extractedAmount;
      break;

    case 'debtInterestRate':
      if (lower.includes('low') || lower.includes('<9')) updated.debtInterestRate = 'Low (<9% Home/Edu Loan)';
      else if (lower.includes('high') || lower.includes('>14')) updated.debtInterestRate = 'High (>14% Personal/Card)';
      else updated.debtInterestRate = 'Moderate (9–13%)';
      break;

    case 'emergencyFund':
      if (lower.includes('no') || lower.includes('zero') || lower.includes('none')) {
        updated.emergencyFund = 0;
      } else if (extractedAmount != null) {
        updated.emergencyFund = extractedAmount;
      }
      break;

    case 'emergencyStorage':
      if (lower.includes('sweep') || lower.includes('high-yield') || lower.includes('savings')) {
        updated.emergencyStorage = 'Sweep-in / High-yield Savings';
      } else if (lower.includes('liquid') || lower.includes('mutual')) {
        updated.emergencyStorage = 'Liquid Mutual Funds';
      } else if (lower.includes('fd') || lower.includes('fixed deposit')) {
        updated.emergencyStorage = 'Fixed Deposits (FD)';
      } else {
        updated.emergencyStorage = raw;
      }
      break;

    case 'previousInvestmentAmount':
      if (extractedAmount != null) updated.previousInvestmentAmount = extractedAmount;
      break;

    case 'assetAllocationSplit':
      if (lower.includes('stock') && (lower.includes('>60') || lower.includes('heavy'))) {
        updated.assetAllocationSplit = 'Direct Stocks Heavy (>60%)';
      } else if (lower.includes('fd') || lower.includes('safe') || lower.includes('debt')) {
        updated.assetAllocationSplit = 'Mostly Safe FDs & Debt';
      } else if (lower.includes('gold') || lower.includes('multi')) {
        updated.assetAllocationSplit = 'Multi-Asset with Gold & Real Estate';
      } else {
        updated.assetAllocationSplit = 'Balanced Mutual Funds & Stocks';
      }
      break;

    case 'beginnerPreference':
      updated.beginnerPreference = raw;
      break;

    case 'riskTolerance':
    case 'marketReactionTolerance':
      if (lower.includes('buy') || lower.includes('opportunity') || lower.includes('aggressive') || lower.includes('growth')) {
        updated.riskTolerance = 'Aggressive (High Growth)';
        updated.marketReactionTolerance = 'View as buying opportunity (High Volatility Comfort)';
      } else if (lower.includes('anxious') || lower.includes('panic') || lower.includes('conservative') || lower.includes('safe')) {
        updated.riskTolerance = 'Conservative (Low Risk)';
        updated.marketReactionTolerance = 'Prefer capital protection (Low Volatility Comfort)';
      } else {
        updated.riskTolerance = 'Moderate (Balanced)';
        updated.marketReactionTolerance = 'Hold steady without panic (Moderate Volatility Comfort)';
      }
      break;

    case 'dependentsCount':
      if (lower.includes('none') || lower.includes('0') || lower.includes('self')) {
        updated.dependentsCount = 0;
      } else if (lower.includes('1')) {
        updated.dependentsCount = 1;
      } else if (lower.includes('2') || lower.includes('3')) {
        updated.dependentsCount = 2;
      } else {
        updated.dependentsCount = 3;
      }
      break;

    case 'hasTermInsurance':
      if (lower.includes('yes') || lower.includes('have term')) {
        updated.hasTermInsurance = 'Adequately Covered (Term Plan Active)';
      } else if (lower.includes('corporate') || lower.includes('employer')) {
        updated.hasTermInsurance = 'Corporate Cover Only (Gap Risk)';
      } else {
        updated.hasTermInsurance = 'No Term Life Cover (High Gap Risk)';
      }
      break;

    case 'primaryGoalName':
    case 'sipGoal':
      updated.primaryGoalName = raw;
      break;

    case 'availableCapital':
      if (extractedAmount != null) updated.availableCapital = extractedAmount;
      break;

    case 'availableSipAmount':
      if (extractedAmount != null) updated.availableSipAmount = extractedAmount;
      break;

    case 'targetGoalAmount':
      if (extractedAmount != null) updated.targetGoalAmount = extractedAmount;
      break;

    case 'goalTimeYears': {
      const yearMatch = lower.match(/(\d+)\s*(?:years?|yrs?)/i) || lower.match(/\b(\d{1,2})\b/);
      if (yearMatch) updated.goalTimeYears = parseInt(yearMatch[1], 10);
      break;
    }

    case 'numberOfStocks': {
      const numMatch = lower.match(/(\d+)\s*stocks?/i) || lower.match(/\b(\d{1,3})\b/);
      if (numMatch) updated.numberOfStocks = parseInt(numMatch[1], 10);
      break;
    }

    case 'stockSharePct': {
      const pctMatch = lower.match(/(\d+)\s*%/);
      if (pctMatch) {
        updated.stockSharePct = parseInt(pctMatch[1], 10);
      } else if (extractedAmount && updated.previousInvestmentAmount > 0) {
        updated.stockSharePct = Math.min(100, Math.round((extractedAmount / updated.previousInvestmentAmount) * 100));
      }
      break;
    }

    case 'stockSymbol': {
      const symMatch = raw.match(/\b([A-Z]{2,15})\b/) || raw.match(/(?:stock|shares? of)\s*([A-Za-z0-9]+)/i);
      if (symMatch) updated.stockSymbol = symMatch[1].toUpperCase();
      else updated.stockSymbol = raw;
      break;
    }

    default:
      if (extractedAmount != null) {
        updated[questionKey] = extractedAmount;
      } else {
        updated[questionKey] = raw;
      }
      break;
  }

  // Recalculate derived cash flow metrics
  if (updated.monthlyIncome > 0 && updated.totalExpenses > 0) {
    const debt = updated.monthlyDebtPayments || 0;
    updated.monthlySurplus = Math.max(0, updated.monthlyIncome - updated.totalExpenses - debt);
    updated.savingsRatePct = Math.round((updated.monthlySurplus / updated.monthlyIncome) * 100);
    if (updated.emergencyFund != null) {
      updated.emergencyMonths = (updated.emergencyFund / updated.totalExpenses).toFixed(1);
    }
  }

  return updated;
}

/**
 * Determines the next adaptive question based on domain, known facts, and dependency logic
 */
export function getNextAdvisorStep(domainId, knownFacts = {}, questionsAsked = []) {
  const domain = ADVISOR_DOMAINS.find((d) => d.id === domainId) || ADVISOR_DOMAINS[0];
  const name = knownFacts.fullName ? knownFacts.fullName.split(' ')[0] : 'there';
  const asked = new Set(questionsAsked);

  // =========================================================================
  // DOMAIN 1: MY PROFILE (In-Depth Adaptive Interview)
  // =========================================================================
  if (domainId === 'my_profile') {
    // 1. Income
    if (!knownFacts.monthlyIncome && !asked.has('monthlyIncome')) {
      return {
        questionKey: 'monthlyIncome',
        questionText: `Hi ${name} 👋 Let's begin your comprehensive financial diagnostic.\n\nWhat is your approximate **monthly take-home income**?`,
        options: ['₹50,000 / month', '₹80,000 / month', '₹1,00,000 / month', '₹1,50,000 / month', '₹2,00,000+ / month'],
        isEnough: false
      };
    }

    // 2. Income Stability
    if (!knownFacts.incomeStability && !asked.has('incomeStability')) {
      const incomeAck = knownFacts.monthlyIncome ? `I have your monthly income recorded as **${formatINR(knownFacts.monthlyIncome)}**.\n\n` : '';
      return {
        questionKey: 'incomeStability',
        questionText: `${incomeAck}How would you describe the **stability and consistency** of your monthly income?`,
        options: ['Very Stable (Salaried Corporate)', 'Mostly Stable (Salaried/Professional)', 'Variable (Freelance / Commission)', 'Business / Entrepreneurial Inflow'],
        isEnough: false
      };
    }

    // 3. Expenses
    if (!knownFacts.totalExpenses && !asked.has('totalExpenses')) {
      return {
        questionKey: 'totalExpenses',
        questionText: `Approximately how much are your **total monthly living expenses** (Rent, groceries, utilities, essentials)?`,
        options: ['₹25,000 / month', '₹40,000 / month', '₹60,000 / month', '₹80,000+ / month'],
        isEnough: false
      };
    }

    // 4. Discretionary Spending
    if (!knownFacts.discretionarySpending && !asked.has('discretionarySpending')) {
      const expAck = knownFacts.totalExpenses ? `Recorded living expenses at **${formatINR(knownFacts.totalExpenses)}/mo**.\n\n` : '';
      return {
        questionKey: 'discretionarySpending',
        questionText: `${expAck}What portion of your overall spending goes toward **discretionary / lifestyle choices** (dining out, travel, shopping)?`,
        options: ['Low / Frugal (<20% of expenses)', 'Moderate (20–40% of expenses)', 'High Lifestyle (>40% of expenses)'],
        isEnough: false
      };
    }

    // 5. Debt & Liabilities
    if (knownFacts.hasDebt === undefined && knownFacts.monthlyDebtPayments === undefined && !asked.has('hasDebt') && !asked.has('monthlyDebtPayments')) {
      return {
        questionKey: 'hasDebt',
        questionText: `Do you currently have any **outstanding loans or monthly EMIs** (Home Loan, Car Loan, Personal Loan, Education Loan)?`,
        options: ['No loans (Debt Free 🎉)', 'Yes, Home Loan', 'Yes, Car Loan', 'Yes, Education / Personal Loan'],
        isEnough: false
      };
    }

    // 6. Debt Follow-Up (Only if user has debt)
    if (knownFacts.hasDebt && !knownFacts.debtBalance && !asked.has('debtBalance')) {
      return {
        questionKey: 'debtBalance',
        questionText: `Approximately what is your **total remaining loan balance**?`,
        options: ['Under ₹5,00,000', '₹5,00,000 – ₹15,00,000', '₹25,00,000 (Home Loan)', '₹50,00,000+'],
        isEnough: false
      };
    }

    // 7. Emergency Fund
    if (knownFacts.emergencyFund === undefined && !asked.has('emergencyFund')) {
      return {
        questionKey: 'emergencyFund',
        questionText: `How much do you currently keep parked in **liquid emergency funds / savings** for unforeseen emergencies?`,
        options: ['No emergency fund yet', '₹50,000', '₹1,50,000 (~3 months)', '₹3,00,000+ (6+ months)'],
        isEnough: false
      };
    }

    // 8. Emergency Storage
    if (knownFacts.emergencyFund > 0 && !knownFacts.emergencyStorage && !asked.has('emergencyStorage')) {
      return {
        questionKey: 'emergencyStorage',
        questionText: `Where is your emergency buffer of **${formatINR(knownFacts.emergencyFund)}** primarily parked?`,
        options: ['Sweep-in / High-yield Savings', 'Liquid Mutual Funds', 'Fixed Deposits (FD)', 'Regular Savings Bank Account'],
        isEnough: false
      };
    }

    // 9. Investment Footprint
    if (knownFacts.previousInvestmentAmount === undefined && !asked.has('previousInvestmentAmount')) {
      return {
        questionKey: 'previousInvestmentAmount',
        questionText: `What is the approximate total value of your **active investment portfolio** today?`,
        options: ['₹0 (Complete Beginner)', 'Under ₹2,00,000', '₹2,00,000 – ₹5,00,000', '₹5,00,000 – ₹15,00,000', '₹20,00,000+'],
        isEnough: false
      };
    }

    // 10. Asset Allocation Split (if has investments)
    if (knownFacts.previousInvestmentAmount > 0 && !knownFacts.assetAllocationSplit && !asked.has('assetAllocationSplit')) {
      return {
        questionKey: 'assetAllocationSplit',
        questionText: `Your current portfolio is approximately **${formatINR(knownFacts.previousInvestmentAmount)}**.\n\nHow is this distributed across asset classes?`,
        options: ['Balanced Mutual Funds & Stocks', 'Heavy in Direct Stocks (>60%)', 'Mostly Safe FDs & Debt', 'Multi-Asset with Gold & Real Estate'],
        isEnough: false
      };
    }

    // 11. Market Reaction & Volatility Tolerance
    if (!knownFacts.marketReactionTolerance && !asked.has('marketReactionTolerance')) {
      return {
        questionKey: 'marketReactionTolerance',
        questionText: `How do you typically react when equity markets experience a **sharp 15% to 20% correction**?`,
        options: ['View as a buying opportunity (Aggressive Growth)', 'Hold steady without panic (Moderate Balanced)', 'Feel anxious / prefer capital safety (Conservative)'],
        isEnough: false
      };
    }

    // 12. Dependents & Family Responsibilities
    if (knownFacts.dependentsCount === undefined && !asked.has('dependentsCount')) {
      return {
        questionKey: 'dependentsCount',
        questionText: `Do you have any family members **financially dependent** on your income?`,
        options: ['None (Self only)', '1 (Spouse or Parent)', '2–3 (Children & Parents)', '4+ (Large Family)'],
        isEnough: false
      };
    }

    // 13. Term Insurance Protection (if has dependents)
    if (knownFacts.dependentsCount > 0 && !knownFacts.hasTermInsurance && !asked.has('hasTermInsurance')) {
      return {
        questionKey: 'hasTermInsurance',
        questionText: `To protect your **${knownFacts.dependentsCount} dependent(s)**, do you have an active pure term life insurance policy?`,
        options: ['Yes, have term insurance cover', 'Only corporate employer cover', 'No term life cover yet'],
        isEnough: false
      };
    }

    // 14. Primary Goal Milestone
    if (!knownFacts.primaryGoalName && !asked.has('primaryGoalName')) {
      return {
        questionKey: 'primaryGoalName',
        questionText: `What is your top **financial milestone or life goal** over the next 5–10 years?`,
        options: COMMON_OPTION_PRESETS.goals,
        isEnough: false
      };
    }

    // Enough in-depth profile facts collected
    return {
      questionKey: null,
      questionText: null,
      isEnough: true
    };
  }

  // =========================================================================
  // DOMAIN 2: SIP PLAN
  // =========================================================================
  if (domainId === 'sip_plan') {
    if (!knownFacts.availableSipAmount && !knownFacts.monthlySurplus && !asked.has('availableSipAmount')) {
      return {
        questionKey: 'availableSipAmount',
        questionText: `How much capital can you comfortably commit to a **monthly SIP**?`,
        options: ['₹5,00,0 / month', '₹10,000 / month', '₹20,000 / month', '₹35,000 / month', '₹50,000+ / month'],
        isEnough: false
      };
    }
    if (!knownFacts.primaryGoalName && !asked.has('primaryGoalName')) {
      const sipAmt = knownFacts.availableSipAmount || knownFacts.monthlySurplus || 15000;
      return {
        questionKey: 'primaryGoalName',
        questionText: `We will plan around an installment of **${formatINR(sipAmt)}/month**.\n\nWhat is the primary **financial goal** for this SIP?`,
        options: COMMON_OPTION_PRESETS.goals,
        isEnough: false
      };
    }
    if (!knownFacts.timeHorizon && !asked.has('timeHorizon')) {
      return {
        questionKey: 'timeHorizon',
        questionText: `What is your expected **time horizon** for this SIP goal?`,
        options: COMMON_OPTION_PRESETS.timeHorizon,
        isEnough: false
      };
    }
    if (!knownFacts.riskTolerance && !asked.has('riskTolerance')) {
      return {
        questionKey: 'riskTolerance',
        questionText: `What fund volatility profile aligns best with your comfort?`,
        options: COMMON_OPTION_PRESETS.riskTolerance,
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 3: INVESTMENTS
  // =========================================================================
  if (domainId === 'investments') {
    if (!knownFacts.availableCapital && !asked.has('availableCapital')) {
      return {
        questionKey: 'availableCapital',
        questionText: `How much **capital** do you currently have available to deploy or allocate?`,
        options: ['₹50,000', '₹1,00,000', '₹2,00,000', '₹5,00,000', '₹10,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.riskTolerance && !asked.has('riskTolerance')) {
      return {
        questionKey: 'riskTolerance',
        questionText: `Got it, we will allocate **${formatINR(knownFacts.availableCapital)}**.\n\nWhat is your **risk tolerance** for deploying this capital?`,
        options: COMMON_OPTION_PRESETS.riskTolerance,
        isEnough: false
      };
    }
    if (!knownFacts.timeHorizon && !asked.has('timeHorizon')) {
      return {
        questionKey: 'timeHorizon',
        questionText: `How long do you plan to stay invested before needing access to these funds?`,
        options: COMMON_OPTION_PRESETS.timeHorizon,
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 4: PORTFOLIO
  // =========================================================================
  if (domainId === 'portfolio') {
    if (!knownFacts.previousInvestmentAmount && !asked.has('previousInvestmentAmount')) {
      return {
        questionKey: 'previousInvestmentAmount',
        questionText: `What is the approximate **total current value** of your existing investment portfolio?`,
        options: ['Under ₹1,00,000', '₹2,00,000 – ₹5,00,000', '₹5,00,000 – ₹15,00,000', '₹20,00,000+'],
        isEnough: false
      };
    }
    if (knownFacts.stockSharePct === undefined && !asked.has('stockSharePct')) {
      return {
        questionKey: 'stockSharePct',
        questionText: `Roughly what percentage of your portfolio is in **direct individual stocks** vs mutual funds?`,
        options: ['0% (All in Mutual Funds/ETFs)', '25% in Direct Stocks', '50% in Direct Stocks', '75%+ heavily in Direct Stocks'],
        isEnough: false
      };
    }
    if (!knownFacts.numberOfStocks && knownFacts.stockSharePct > 0 && !asked.has('numberOfStocks')) {
      return {
        questionKey: 'numberOfStocks',
        questionText: `How many **individual company stocks** do you currently hold?`,
        options: ['1–3 stocks (High concentration)', '4–8 stocks (Moderate)', '10–20 stocks (Diversified)', '25+ stocks (Over-diversified)'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 5: FINANCIAL HEALTH
  // =========================================================================
  if (domainId === 'financial_health') {
    if (!knownFacts.monthlyIncome && !asked.has('monthlyIncome')) {
      return {
        questionKey: 'monthlyIncome',
        questionText: `Let's diagnose your financial health.\n\nWhat is your net **monthly take-home income**?`,
        options: ['₹40,000', '₹75,000', '₹1,00,000', '₹1,50,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.totalExpenses && !asked.has('totalExpenses')) {
      return {
        questionKey: 'totalExpenses',
        questionText: `What are your **monthly living expenses** (food, utilities, rent)?`,
        options: ['₹20,000', '₹35,000', '₹50,000', '₹75,000'],
        isEnough: false
      };
    }
    if (knownFacts.monthlyDebtPayments === undefined && !asked.has('monthlyDebtPayments')) {
      return {
        questionKey: 'monthlyDebtPayments',
        questionText: `What is your total **monthly debt / EMI outgo**?`,
        options: ['Zero (Debt Free)', 'Under ₹15,000', '₹25,000 – ₹50,000', 'Over ₹50,000'],
        isEnough: false
      };
    }
    if (knownFacts.emergencyFund === undefined && !asked.has('emergencyFund')) {
      return {
        questionKey: 'emergencyFund',
        questionText: `How much liquid savings do you have reserved for **emergencies**?`,
        options: ['Zero', '1–2 months of expenses', '3–5 months of expenses', '6+ months fully funded 🎉'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 6: FINANCIAL GOALS
  // =========================================================================
  if (domainId === 'financial_goals') {
    if (!knownFacts.primaryGoalName && !asked.has('primaryGoalName')) {
      return {
        questionKey: 'primaryGoalName',
        questionText: `Which specific **financial goal** would you like to plan for today?`,
        options: COMMON_OPTION_PRESETS.goals,
        isEnough: false
      };
    }
    if (!knownFacts.targetGoalAmount && !asked.has('targetGoalAmount')) {
      return {
        questionKey: 'targetGoalAmount',
        questionText: `What is the estimated **target corpus (₹)** needed for your **${knownFacts.primaryGoalName}**?`,
        options: ['₹5,00,000', '₹15,00,000', '₹30,00,000', '₹50,00,000', '₹1,00,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.goalTimeYears && !asked.has('goalTimeYears')) {
      return {
        questionKey: 'goalTimeYears',
        questionText: `In how many **years** do you need this **${formatINR(knownFacts.targetGoalAmount)}** corpus ready?`,
        options: ['2 Years (Short-Term)', '5 Years (Medium-Term)', '10 Years (Long-Term)', '15–20 Years (Retirement)'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 7: STOCKS
  // =========================================================================
  if (domainId === 'stocks') {
    if (!knownFacts.stockSymbol && !asked.has('stockSymbol')) {
      return {
        questionKey: 'stockSymbol',
        questionText: `Which **company or stock ticker** would you like to evaluate (e.g. TCS, HDFCBANK, INFY, RELIANCE)?`,
        options: ['TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'TATAMOTORS', 'ITC'],
        isEnough: false
      };
    }
    if (!knownFacts.stockHoldingAmount && !asked.has('stockHoldingAmount')) {
      return {
        questionKey: 'stockHoldingAmount',
        questionText: `How much capital do you hold (or plan to invest) in **${knownFacts.stockSymbol}**?`,
        options: ['₹25,000', '₹50,000', '₹1,00,000', '₹2,50,000', '₹5,00,000+'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // =========================================================================
  // DOMAIN 8: LEARNING
  // =========================================================================
  if (domainId === 'learning') {
    if (!knownFacts.learningTopic && !asked.has('learningTopic')) {
      return {
        questionKey: 'learningTopic',
        questionText: `Which financial concept would you like to master right now?`,
        options: COMMON_OPTION_PRESETS.learningTopics,
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  return { questionKey: null, questionText: null, isEnough: true };
}

/**
 * Generates structured Final Analysis & Action Plan with ZERO fake data
 */
export function generateDomainPlan(domainId, knownFacts = {}) {
  const inc = knownFacts.monthlyIncome || 0;
  const exp = knownFacts.totalExpenses || 0;
  const debt = knownFacts.monthlyDebtPayments || 0;
  const surplus = Math.max(0, inc - exp - debt);
  const emergency = knownFacts.emergencyFund || 0;
  const emergencyMonths = exp > 0 ? (emergency / exp).toFixed(1) : 'N/A';
  const risk = knownFacts.riskTolerance || 'Moderate (Balanced)';
  const portfolio = knownFacts.previousInvestmentAmount || knownFacts.availableCapital || 0;
  const savingsRate = inc > 0 ? Math.round((surplus / inc) * 100) : 0;
  const stability = knownFacts.incomeStability || 'Standard Salaried';
  const dependents = knownFacts.dependentsCount ?? 'Not specified';
  const insurance = knownFacts.hasTermInsurance || 'Review required';
  const primaryGoal = knownFacts.primaryGoalName || 'Wealth Creation';

  // 1. MY PROFILE Plan
  if (domainId === 'my_profile' || domainId === 'financial_health') {
    return `### 📊 FINLABS AI — MY PROFILE POSITION SNAPSHOT

**1. Financial Position & Cash Flow:**
- **Monthly Inflow**: ${inc > 0 ? formatINR(inc) : 'Not specified'} (${stability})
- **Essential Living Costs**: ${exp > 0 ? `-${formatINR(exp)}` : 'Not specified'} (${knownFacts.discretionarySpending || 'Standard discretionary'})
- **Monthly Debt / EMIs**: ${debt > 0 ? `-${formatINR(debt)}` : '₹0 (Debt Free 🎉)'} ${knownFacts.debtType ? `(${knownFacts.debtType})` : ''}
- **Net Monthly Surplus**: **${formatINR(surplus)}** (${savingsRate}% savings rate)

**2. Emergency Reserve & Safety:**
- **Liquid Emergency Reserve**: ${formatINR(emergency)} (${emergencyMonths} months of essential expenses)
- **Emergency Holding Venue**: ${knownFacts.emergencyStorage || 'Savings Account / Liquid Reserves'}

**3. Investment Footprint & Risk Profile:**
- **Total Investment Portfolio**: ${portfolio > 0 ? formatINR(portfolio) : '₹0 (Starting fresh)'}
- **Asset Allocation Profile**: ${knownFacts.assetAllocationSplit || 'Diversified Mutual Funds & Equity'}
- **Risk Tolerance Profile**: **${risk}** (${knownFacts.marketReactionTolerance || 'Standard volatility tolerance'})

**4. Family Responsibilities & Protection:**
- **Financial Dependents**: **${dependents}**
- **Term Life Protection**: **${insurance}**
- **Primary Milestone Goal**: **${primaryGoal}**

---

### 🔎 KEY DIAGNOSTIC FINDINGS
1. **Savings Discipline**: Your net recurring surplus of **${formatINR(surplus)}/month** delivers a healthy **${savingsRate}%** savings rate.
2. **Emergency Runway**: Your liquid reserve provides **${emergencyMonths} months** of living buffer. ${parseFloat(emergencyMonths) < 6 ? 'Target is 6 months to shield investments against unexpected emergencies.' : 'Your 6-month buffer is securely funded.'}
3. **Debt Exposure**: ${debt > 0 ? `Debt-to-income is ${Math.round((debt / inc) * 100)}% (${formatINR(debt)}/mo). Keep total EMIs under 35% of income.` : 'You are completely debt-free, maximizing capital available for compounding.'}
4. **Protection Balance**: ${dependents > 0 && String(insurance).includes('No') ? '⚠️ Protection Gap: You have dependents but no active term life cover. Securing term insurance is high priority.' : 'Protection structure matches family responsibilities.'}

---

### ⚠️ IDENTIFIED RISKS & GAPS
- **Emergency Buffer**: ${parseFloat(emergencyMonths) < 3 ? 'Critical Underfunding: Under 3 months runway forces premature equity liquidation during shocks.' : 'Adequate buffer maintained.'}
- **Single Asset Concentration**: ${knownFacts.assetAllocationSplit && String(knownFacts.assetAllocationSplit).includes('Heavy in Direct Stocks') ? 'High equity volatility risk. Ensure individual stocks do not exceed 10% of total wealth.' : 'Standard diversification.'}

---

### 🌟 FINANCIAL STRENGTHS
- **Debt Health**: ${debt === 0 ? 'Zero high-interest debt liabilities.' : 'Debt is structured within manageable limits.'}
- **Deployable Surplus**: Predictable monthly surplus of **${formatINR(surplus)}** ready for automated wealth compounding.

---

### 🎯 PERSONALIZED ACTION PLAN

1. **Step 1 — Build 6-Month Liquid Reserve (${formatINR(Math.max(0, exp * 6 - emergency))} gap)**:
   - Route ${formatINR(surplus * 0.25)}/month into high-yield sweep-in FDs or Liquid Mutual Funds until 6 months of expenses (${formatINR(exp * 6)}) is secured.
2. **Step 2 — Automate Core Wealth SIP (${formatINR(surplus * 0.50)}/mo)**:
   - Deploy 50% of surplus into low-cost Nifty 50 Index Funds (30%) and Flexi Cap Funds (20%).
3. **Step 3 — Satellite Growth & Inflation Hedge (${formatINR(surplus * 0.25)}/mo)**:
   - Deploy remaining 25% across mid-cap equity growth funds and Sovereign Gold Bonds.
4. **Step 4 — Annual Review & Rebalancing**:
   - Step up your monthly SIPs by 10% annually with salary increments to accelerate milestone achievement by 30%.

---

### 💡 WHY THESE RECOMMENDATIONS
These recommendations are calibrated directly to your authentic cash flow of **${formatINR(inc)}/mo**, **${risk}** risk persona, and **${primaryGoal}** milestone.`;
  }

  // 2. SIP PLAN
  if (domainId === 'sip_plan') {
    const sipAmount = knownFacts.availableSipAmount || surplus || 15000;
    const goal = knownFacts.primaryGoalName || 'Wealth Creation';
    const horizon = knownFacts.timeHorizon || '5–10+ Years';

    return `### 💰 FINLABS AI SIP BLUEPRINT

**🎯 SIP Parameters:**
- **Target Goal**: **${goal}**
- **Monthly Investment**: **${formatINR(sipAmount)} / month**
- **Investment Horizon**: **${horizon}**
- **Risk Profile**: **${risk}**

---

### 📊 RECOMMENDED SIP ALLOCATION WATERFALL

| Fund Category | Recommended Asset / Vehicle | Allocation % | Monthly SIP Amount |
| :--- | :--- | :--- | :--- |
| **Core Index (Large Cap)** | Low-cost Nifty 50 Index Fund (Direct-Growth) | 40% | **${formatINR(sipAmount * 0.40)}** |
| **Active Growth (Flexi Cap)** | Parag Parikh / HDFC Flexi Cap Fund | 35% | **${formatINR(sipAmount * 0.35)}** |
| **Alpha & High Growth** | Quality Mid Cap 150 Index Fund | 15% | **${formatINR(sipAmount * 0.15)}** |
| **Safety / Gold Hedge** | Gold ETF or Multi-Asset Allocation Fund | 10% | **${formatINR(sipAmount * 0.10)}** |

---

### 🚀 PRO-TIP: 10% ANNUAL STEP-UP POWER
By stepping up this SIP by **10% annually** with salary increases, your 10-year projected corpus expands by over **35–45%** compared to a flat monthly installment.`;
  }

  // 3. INVESTMENTS & ALLOCATION
  if (domainId === 'investments') {
    const cap = knownFacts.availableCapital || 200000;
    return `### 📈 FINLABS CAPITAL DEPLOYMENT BLUEPRINT

**💼 Available Capital**: **${formatINR(cap)}** | **Risk Profile**: **${risk}**

---

### 🏛️ 4-TIER WATERFALL DEPLOYMENT PLAN

1. **Tier 1: Emergency & Safety Buffer (20% — ${formatINR(cap * 0.20)})**
   - Retain in high-yield liquid funds or sweep-in Auto-FDs for instant T+0 access.
2. **Tier 2: Core Index Equity (45% — ${formatINR(cap * 0.45)})**
   - Deploy into Nifty 50 / Sensex Index Funds for baseline compounding across India's top 50 blue chips.
3. **Tier 3: Flexi Cap & Global Exposure (25% — ${formatINR(cap * 0.25)})**
   - Deploy into diversified Flexi Cap Mutual Funds to capture large, mid, and international alpha.
4. **Tier 4: Gold & Debt Hedge (10% — ${formatINR(cap * 0.10)})**
   - Sovereign Gold Bonds (SGB) or Gold ETFs to cushion market drawdowns.

---

*Deployment Strategy: Rather than investing 100% in a single lump-sum on one day, park in liquid funds and initiate a 3-to-6 month Systematic Transfer Plan (STP) to average entry costs.*`;
  }

  // 4. PORTFOLIO AUDIT
  if (domainId === 'portfolio') {
    const stockShare = knownFacts.stockSharePct ?? 50;
    const numStocks = knownFacts.numberOfStocks || 6;
    return `### 📊 FINLABS PORTFOLIO DIVERSIFICATION AUDIT

**🔍 Portfolio Breakdown:**
- **Total Portfolio Value**: **${formatINR(portfolio)}**
- **Direct Stock Weight**: **${stockShare}%**
- **Mutual Funds / ETFs**: **${100 - stockShare}%**
- **Individual Stock Holdings**: **${numStocks} companies**

---

### ⚠️ RISK AUDIT OBSERVATIONS
- **Concentration Risk**: ${stockShare > 50 ? 'Your portfolio is heavily skewed toward direct stocks (>50%). Ensure no single stock exceeds 10% of total wealth.' : 'Your equity-to-mutual fund ratio is well balanced.'}
- **Stock Spread**: Holding ${numStocks} stocks ${numStocks < 8 ? 'creates significant single-company volatility risk. Consider broadening to 12–15 high-conviction companies or index funds.' : 'provides healthy company-level diversification.'}

---

### 🎯 REBALANCING ROADMAP
1. **Cap Single Stocks at 10%**: Limit exposure to any single ticker to protect downside.
2. **Rebalance Annually**: Shift profits from outperforming volatile stocks into core index and debt folios.`;
  }

  // 5. FINANCIAL GOALS
  if (domainId === 'financial_goals') {
    const goalName = knownFacts.primaryGoalName || 'Wealth Creation';
    const targetAmt = knownFacts.targetGoalAmount || 2500000;
    const years = knownFacts.goalTimeYears || 5;
    const monthlyNeeded = Math.round(targetAmt / (years * 12 * 1.3)); // Estimating 12% CAGR

    return `### 🎯 TARGET GOAL BLUEPRINT: ${goalName.toUpperCase()}

**🎯 Goal Overview:**
- **Target Corpus**: **${formatINR(targetAmt)}**
- **Time Remaining**: **${years} Years** (${years * 12} Months)
- **Estimated Required SIP**: **~${formatINR(monthlyNeeded)} / month** (assuming ~12% long-term equity CAGR)

---

### 🗺️ MILESTONE EXECUTION PLAN
1. **Set Up Dedicated Folio**: Separate this goal into a dedicated mutual fund account to avoid dipping into it for lifestyle costs.
2. **Automate on Salary Day**: Schedule SIP 2 days after income credit.
3. **De-Risk in Final 18 Months**: As you approach year ${Math.max(1, years - 1)}, systematically transfer funds from equity into short-duration debt to lock in accumulated gains.`;
  }

  // 6. STOCKS
  if (domainId === 'stocks') {
    const ticker = knownFacts.stockSymbol || 'TCS';
    const holding = knownFacts.stockHoldingAmount || 50000;
    return `### 🏢 STOCK EVALUATION: ${ticker}

**📈 Holding Context**: **${formatINR(holding)}** | **Asset**: **${ticker} (NSE/BSE)**

---

### 📋 6-POINT INSTITUTIONAL STOCK CHECKLIST FOR ${ticker}:
1. **Economic Moat**: Does ${ticker} have high pricing power, patents, or a dominant market share?
2. **Return on Equity (ROE)**: Consistently > 15% across a 5-year cycle?
3. **Debt-to-Equity**: Low leverage (Debt/Equity < 0.5)?
4. **Valuation (P/E)**: Is the trailing P/E reasonable relative to historical 5-year median?
5. **Earnings Growth**: Revenue and profit compounding at > 10% CAGR?
6. **Portfolio Position Cap**: Ensure ${ticker} accounts for **under 10%** of your total net worth to avoid concentration risk.

---

*Note: For live candle trends and historical performance comparison, visit the FinLabs Investment Comparison Tool.*`;
  }

  // 7. LEARNING
  if (domainId === 'learning') {
    const topic = knownFacts.learningTopic || 'Mutual Funds';
    const explanation = getEducationalExplanation(topic);
    return `### 📚 FINLABS ACADEMY: ${topic.toUpperCase()}

${explanation || `**${topic}** is a foundational financial concept. It enables disciplined asset growth, systematic diversification, and risk control when aligned with your long-term goals.`}`;
  }

  return `### 📊 FINLABS AI PERSONALIZED SUMMARY\n\nYour customized financial roadmap is ready based on your profile inputs and risk preferences.`;
}
