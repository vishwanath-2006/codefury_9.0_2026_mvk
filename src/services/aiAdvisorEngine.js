/**
 * FINLABS AI — GUIDED FINANCIAL ADVISOR & ADAPTIVE QUESTION ENGINE
 * Orchestrates domain-specific interviews, skips existing facts, tracks session state,
 * and generates structured financial diagnostics & actionable plans.
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
 * Merges Supabase profile into known facts
 */
export function initializeKnownFactsFromProfile(profileCtx) {
  if (!profileCtx) return {};

  const facts = {};
  if (profileCtx.monthlyIncome > 0) facts.monthlyIncome = profileCtx.monthlyIncome;
  if (profileCtx.totalExpenses > 0) facts.totalExpenses = profileCtx.totalExpenses;
  if (profileCtx.monthlyDebtPayments >= 0) facts.monthlyDebtPayments = profileCtx.monthlyDebtPayments;
  if (profileCtx.monthlySurplus >= 0) facts.monthlySurplus = profileCtx.monthlySurplus;
  if (profileCtx.emergencyFund > 0) facts.emergencyFund = profileCtx.emergencyFund;
  if (profileCtx.emergencyMonths) facts.emergencyMonths = profileCtx.emergencyMonths;
  if (profileCtx.previousInvestmentAmount > 0) facts.previousInvestmentAmount = profileCtx.previousInvestmentAmount;
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
 * Extracts facts from user answer dynamically
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

    case 'totalExpenses':
    case 'expenses':
      if (extractedAmount) updated.totalExpenses = extractedAmount;
      break;

    case 'monthlyDebtPayments':
    case 'debt':
      if (lower.includes('no') || lower.includes('zero') || lower.includes('nil') || lower.includes('debt free')) {
        updated.monthlyDebtPayments = 0;
      } else if (extractedAmount != null) {
        updated.monthlyDebtPayments = extractedAmount;
      }
      break;

    case 'emergencyFund':
      if (lower.includes('no') || lower.includes('zero') || lower.includes('none')) {
        updated.emergencyFund = 0;
      } else if (extractedAmount != null) {
        updated.emergencyFund = extractedAmount;
      }
      break;

    case 'availableCapital':
    case 'investmentAmount':
      if (extractedAmount) updated.availableCapital = extractedAmount;
      break;

    case 'availableSipAmount':
      if (extractedAmount) updated.availableSipAmount = extractedAmount;
      break;

    case 'targetGoalAmount':
      if (extractedAmount) updated.targetGoalAmount = extractedAmount;
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
        updated.stockHoldingAmount = extractedAmount;
      }
      break;
    }

    case 'stockSymbol': {
      const symMatch = raw.match(/\b([A-Z]{2,15})\b/) || raw.match(/(?:stock|shares? of)\s*([A-Za-z0-9]+)/i);
      if (symMatch) updated.stockSymbol = symMatch[1].toUpperCase();
      else updated.stockSymbol = raw;
      break;
    }

    case 'riskTolerance': {
      if (lower.includes('low') || lower.includes('conservative') || lower.includes('safe')) {
        updated.riskTolerance = 'Conservative (Low Risk)';
      } else if (lower.includes('high') || lower.includes('aggressive') || lower.includes('growth')) {
        updated.riskTolerance = 'Aggressive (High Growth)';
      } else if (lower.includes('mod') || lower.includes('balan')) {
        updated.riskTolerance = 'Moderate (Balanced)';
      } else {
        updated.riskTolerance = raw;
      }
      break;
    }

    case 'sipGoal':
    case 'primaryGoalName':
      updated.primaryGoalName = raw;
      break;

    case 'learningTopic':
      updated.learningTopic = raw;
      break;

    case 'assetPreferences':
    case 'previousInvestmentPlatforms': {
      const platforms = [];
      if (lower.includes('stock')) platforms.push('Stocks');
      if (lower.includes('mutual fund') || lower.includes('mf')) platforms.push('Mutual Funds');
      if (lower.includes('etf')) platforms.push('ETFs');
      if (lower.includes('fd') || lower.includes('deposit')) platforms.push('Fixed Deposits (FD)');
      if (lower.includes('gold')) platforms.push('Gold / SGBs');
      if (lower.includes('bond') || lower.includes('debt')) platforms.push('Bonds / Debt');
      if (lower.includes('real estate') || lower.includes('property')) platforms.push('Real Estate');
      if (lower.includes('crypto')) platforms.push('Crypto');
      if (platforms.length > 0) {
        updated.previousInvestmentPlatforms = platforms;
      } else {
        updated.previousInvestmentPlatforms = [raw];
      }
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
 * Determines the next adaptive question based on domain & missing facts
 */
export function getNextAdvisorStep(domainId, knownFacts = {}, questionsAsked = []) {
  const domain = ADVISOR_DOMAINS.find((d) => d.id === domainId) || ADVISOR_DOMAINS[0];
  const name = knownFacts.fullName ? knownFacts.fullName.split(' ')[0] : 'there';

  // 1. Domain: MY PROFILE
  if (domainId === 'my_profile') {
    if (!knownFacts.monthlyIncome) {
      return {
        questionKey: 'monthlyIncome',
        questionText: `Hi ${name} 👋 Let's review your complete financial foundation.

What is your approximate **monthly take-home income**?`,
        options: ['₹50,000 / month', '₹80,000 / month', '₹1,00,000 / month', '₹1,50,000 / month', '₹2,00,000+ / month'],
        isEnough: false
      };
    }
    if (!knownFacts.totalExpenses) {
      return {
        questionKey: 'totalExpenses',
        questionText: `I have your monthly income as **${formatINR(knownFacts.monthlyIncome)}**.

Approximately how much are your **total monthly essential expenses** (Rent, utilities, food, groceries)?`,
        options: ['₹25,000 / month', '₹40,000 / month', '₹60,000 / month', '₹80,000 / month'],
        isEnough: false
      };
    }
    if (knownFacts.monthlyDebtPayments === undefined) {
      return {
        questionKey: 'monthlyDebtPayments',
        questionText: `Do you currently have any **monthly loan EMIs or credit debt** (e.g. Home Loan, Car Loan, Personal Loan)?`,
        options: ['No loans (Debt Free 🎉)', '₹10,000 / month', '₹25,000 / month', '₹50,000+ / month'],
        isEnough: false
      };
    }
    if (knownFacts.emergencyFund === undefined) {
      return {
        questionKey: 'emergencyFund',
        questionText: `How much do you currently keep parked in **liquid emergency funds / savings** for unexpected events?`,
        options: ['No emergency reserve yet', '₹50,000', '₹1,50,000 (3 months)', '₹3,00,000+ (6 months)'],
        isEnough: false
      };
    }
    if (!knownFacts.riskTolerance) {
      return {
        questionKey: 'riskTolerance',
        questionText: `How would you describe your **risk appetite** for long-term investing?`,
        options: COMMON_OPTION_PRESETS.riskTolerance,
        isEnough: false
      };
    }
    // All core facts collected
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 2. Domain: SIP PLAN
  if (domainId === 'sip_plan') {
    if (!knownFacts.availableSipAmount && !knownFacts.monthlySurplus) {
      return {
        questionKey: 'availableSipAmount',
        questionText: `How much capital can you comfortably commit to a **monthly SIP** (e.g. ₹5,000, ₹15,000, ₹30,000)?`,
        options: ['₹5,000 / month', '₹10,000 / month', '₹20,000 / month', '₹35,000 / month', '₹50,000+ / month'],
        isEnough: false
      };
    }
    if (!knownFacts.primaryGoalName) {
      const sipAmt = knownFacts.availableSipAmount || knownFacts.monthlySurplus;
      return {
        questionKey: 'primaryGoalName',
        questionText: `Great, we will plan around an installment of **${formatINR(sipAmt)}/month**.

What is the primary **financial goal or milestone** for this SIP?`,
        options: COMMON_OPTION_PRESETS.goals,
        isEnough: false
      };
    }
    if (!knownFacts.timeHorizon) {
      return {
        questionKey: 'timeHorizon',
        questionText: `What is your expected **time horizon** for this SIP goal?`,
        options: COMMON_OPTION_PRESETS.timeHorizon,
        isEnough: false
      };
    }
    if (!knownFacts.riskTolerance) {
      return {
        questionKey: 'riskTolerance',
        questionText: `What fund volatility profile aligns best with your comfort?`,
        options: COMMON_OPTION_PRESETS.riskTolerance,
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 3. Domain: INVESTMENTS
  if (domainId === 'investments') {
    if (!knownFacts.availableCapital) {
      return {
        questionKey: 'availableCapital',
        questionText: `How much **capital** do you currently have available to deploy or allocate?`,
        options: ['₹50,000', '₹1,00,000', '₹2,00,000', '₹5,00,000', '₹10,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.riskTolerance) {
      return {
        questionKey: 'riskTolerance',
        questionText: `Got it, we will allocate **${formatINR(knownFacts.availableCapital)}**.

What is your **risk tolerance** for deploying this capital?`,
        options: COMMON_OPTION_PRESETS.riskTolerance,
        isEnough: false
      };
    }
    if (!knownFacts.timeHorizon) {
      return {
        questionKey: 'timeHorizon',
        questionText: `How long do you plan to stay invested before needing access to these funds?`,
        options: COMMON_OPTION_PRESETS.timeHorizon,
        isEnough: false
      };
    }
    if (!knownFacts.assetPreferences) {
      return {
        questionKey: 'assetPreferences',
        questionText: `Do you have preferred asset classes you wish to focus on?`,
        options: ['Diversified (Index + Flexi Cap + Gold)', 'Direct Stocks + Equity MFs', 'Balanced Low Risk (FD + Debt + Large Cap)', 'Let AI recommend'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 4. Domain: PORTFOLIO
  if (domainId === 'portfolio') {
    if (!knownFacts.previousInvestmentAmount) {
      return {
        questionKey: 'previousInvestmentAmount',
        questionText: `What is the approximate **total current value** of your existing investment portfolio?`,
        options: ['Under ₹1,00,000', '₹2,00,000 – ₹5,00,000', '₹5,00,000 – ₹15,00,000', '₹20,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.previousInvestmentPlatforms) {
      return {
        questionKey: 'previousInvestmentPlatforms',
        questionText: `Your portfolio value is **${formatINR(knownFacts.previousInvestmentAmount)}**.

Which **asset classes** make up this portfolio?`,
        options: ['Direct Stocks & Mutual Funds', 'Purely Mutual Funds & ETFs', 'Stocks, Mutual Funds, Gold & FDs', 'Real Estate & Fixed Income'],
        isEnough: false
      };
    }
    if (knownFacts.stockSharePct === undefined) {
      return {
        questionKey: 'stockSharePct',
        questionText: `Roughly what percentage (or amount) of this portfolio is in **direct individual stocks**?`,
        options: ['0% (All in Mutual Funds/ETFs)', '25% in Direct Stocks', '50% in Direct Stocks', '75%+ heavily in Direct Stocks'],
        isEnough: false
      };
    }
    if (!knownFacts.numberOfStocks && knownFacts.stockSharePct > 0) {
      return {
        questionKey: 'numberOfStocks',
        questionText: `How many **individual company stocks** do you currently hold?`,
        options: ['1–3 stocks (High concentration)', '4–8 stocks (Moderate)', '10–20 stocks (Diversified)', '25+ stocks (Over-diversified)'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 5. Domain: FINANCIAL HEALTH
  if (domainId === 'financial_health') {
    if (!knownFacts.monthlyIncome) {
      return {
        questionKey: 'monthlyIncome',
        questionText: `Let's diagnose your financial health.

What is your net **monthly take-home income**?`,
        options: ['₹40,000', '₹75,000', '₹1,00,000', '₹1,50,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.totalExpenses) {
      return {
        questionKey: 'totalExpenses',
        questionText: `What are your **monthly living expenses** (food, utilities, rent)?`,
        options: ['₹20,000', '₹35,000', '₹50,000', '₹75,000'],
        isEnough: false
      };
    }
    if (knownFacts.monthlyDebtPayments === undefined) {
      return {
        questionKey: 'monthlyDebtPayments',
        questionText: `What is your total **monthly debt / EMI outgo**?`,
        options: ['Zero (Debt Free)', 'Under ₹15,000', '₹25,000 – ₹50,000', 'Over ₹50,000'],
        isEnough: false
      };
    }
    if (knownFacts.emergencyFund === undefined) {
      return {
        questionKey: 'emergencyFund',
        questionText: `How much liquid savings do you have reserved for **emergencies**?`,
        options: ['Zero', '1–2 months of expenses', '3–5 months of expenses', '6+ months fully funded 🎉'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 6. Domain: FINANCIAL GOALS
  if (domainId === 'financial_goals') {
    if (!knownFacts.primaryGoalName) {
      return {
        questionKey: 'primaryGoalName',
        questionText: `Which specific **financial goal** would you like to plan for today?`,
        options: COMMON_OPTION_PRESETS.goals,
        isEnough: false
      };
    }
    if (!knownFacts.targetGoalAmount) {
      return {
        questionKey: 'targetGoalAmount',
        questionText: `What is the estimated **target corpus (₹)** needed for your **${knownFacts.primaryGoalName}**?`,
        options: ['₹5,00,000', '₹15,00,000', '₹30,00,000', '₹50,00,000', '₹1,00,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.goalTimeYears) {
      return {
        questionKey: 'goalTimeYears',
        questionText: `In how many **years** do you need this **${formatINR(knownFacts.targetGoalAmount)}** corpus ready?`,
        options: ['2 Years (Short-Term)', '5 Years (Medium-Term)', '10 Years (Long-Term)', '15–20 Years (Retirement)'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 7. Domain: STOCKS
  if (domainId === 'stocks') {
    if (!knownFacts.stockSymbol) {
      return {
        questionKey: 'stockSymbol',
        questionText: `Which **company or stock ticker** would you like to evaluate (e.g. TCS, HDFCBANK, INFY, RELIANCE)?`,
        options: ['TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'TATAMOTORS', 'ITC'],
        isEnough: false
      };
    }
    if (!knownFacts.stockHoldingAmount) {
      return {
        questionKey: 'stockHoldingAmount',
        questionText: `How much capital do you hold (or plan to invest) in **${knownFacts.stockSymbol}**?`,
        options: ['₹25,000', '₹50,000', '₹1,00,000', '₹2,50,000', '₹5,00,000+'],
        isEnough: false
      };
    }
    if (!knownFacts.timeHorizon) {
      return {
        questionKey: 'timeHorizon',
        questionText: `What is your expected **holding horizon** for **${knownFacts.stockSymbol}**?`,
        options: ['Short Term (< 1 year)', 'Medium Term (1–3 years)', 'Long Term (5+ years compounding)'],
        isEnough: false
      };
    }
    return { questionKey: null, questionText: null, isEnough: true };
  }

  // 8. Domain: LEARNING
  if (domainId === 'learning') {
    if (!knownFacts.learningTopic) {
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
 * Generates structured Final Analysis & Action Plan
 */
export function generateDomainPlan(domainId, knownFacts = {}) {
  const inc = knownFacts.monthlyIncome || 80000;
  const exp = knownFacts.totalExpenses || 35000;
  const debt = knownFacts.monthlyDebtPayments || 0;
  const surplus = Math.max(0, inc - exp - debt);
  const emergency = knownFacts.emergencyFund || 0;
  const emergencyMonths = exp > 0 ? (emergency / exp).toFixed(1) : 0;
  const risk = knownFacts.riskTolerance || 'Moderate (Balanced)';
  const portfolio = knownFacts.previousInvestmentAmount || knownFacts.availableCapital || 200000;

  // 1. MY PROFILE Plan
  if (domainId === 'my_profile' || domainId === 'financial_health') {
    return `### 📊 FINLABS AI COMPREHENSIVE ANALYSIS

**👤 Your Financial Position:**
- **Monthly Inflow**: ${formatINR(inc)}
- **Essential Living Costs**: -${formatINR(exp)}
- **Monthly Debt/EMIs**: -${formatINR(debt)}
- **Net Monthly Surplus**: **${formatINR(surplus)}** (${Math.round((surplus/inc)*100)}% savings rate)
- **Emergency Safety Buffer**: ${formatINR(emergency)} (${emergencyMonths} months runway)
- **Active Investment Footprint**: ${formatINR(portfolio)}
- **Risk Tolerance Profile**: **${risk}**

---

### 🔎 KEY DIAGNOSTIC FINDINGS
1. **Cash Flow Efficiency**: Your ${Math.round((surplus/inc)*100)}% savings rate is strong and generates ${formatINR(surplus)} monthly deployable capital.
2. **Emergency Cushion**: You have ${emergencyMonths} months of living expenses liquid. ${parseFloat(emergencyMonths) < 6 ? 'Target is 6 months to protect against unexpected life shocks.' : 'Your 6-month buffer is fully secured.'}
3. **Debt Load**: Debt-to-income ratio is ${Math.round((debt/inc)*100)}%, which is well within the healthy <30% threshold.

---

### 🎯 RECOMMENDED ACTION PLAN

1. **Step 1 — Secure Emergency Runway**:
   - Maintain at least **${formatINR(exp * 6)}** in high-yield liquid mutual funds or sweep-in FDs.
2. **Step 2 — Automate Core Wealth SIP (${formatINR(surplus * 0.60)}/mo)**:
   - Direct 60% of monthly surplus into low-cost Nifty 50 Index Fund (35%) and Flexi Cap Fund (25%).
3. **Step 3 — Satellite & Growth Allocation (${formatINR(surplus * 0.25)}/mo)**:
   - Allocate 25% into Mid Cap / Active Growth opportunities.
4. **Step 4 — Stability & Gold Hedge (${formatINR(surplus * 0.15)}/mo)**:
   - Allocate 15% into Sovereign Gold Bonds / Gold ETFs.`;
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

  return `### 📊 FINLABS AI PERSONALIZED SUMMARY

Your customized financial roadmap is ready based on your profile inputs and risk preferences.`;
}
