/**
 * FINLABS AI — 8 CORE FINANCIAL ADVISOR DOMAINS
 * Defines guided question strategies, required facts, and dynamic options.
 */

export const ADVISOR_DOMAINS = [
  {
    id: 'my_profile',
    title: 'MY PROFILE',
    icon: '👤',
    tagline: 'Complete Financial Picture',
    description: 'Understand your holistic income, expenses, debt, emergency safety, and wealth readiness.',
    badge: 'Diagnostic',
    targetFacts: [
      'monthlyIncome',
      'totalExpenses',
      'monthlyDebtPayments',
      'emergencyFund',
      'previousInvestmentAmount',
      'riskTolerance',
      'timeHorizon'
    ],
    initialPrompt: "Let's review and complete your full financial profile to create your baseline wealth diagnostic."
  },
  {
    id: 'sip_plan',
    title: 'SIP PLAN',
    icon: '💰',
    tagline: 'Monthly Wealth Compounding',
    description: 'Build or optimize your monthly Systematic Investment Plan (SIP) across index, flexi cap, and debt funds.',
    badge: 'Growth',
    targetFacts: [
      'monthlyIncome',
      'totalExpenses',
      'monthlySurplus',
      'availableSipAmount',
      'sipGoal',
      'timeHorizon',
      'riskTolerance',
      'stepUpPreference'
    ],
    initialPrompt: "Let's build a disciplined, inflation-beating monthly SIP strategy tailored to your savings capacity."
  },
  {
    id: 'investments',
    title: 'INVESTMENTS',
    icon: '📈',
    tagline: 'Capital Deployment & Strategy',
    description: 'Determine how and where to invest lump sum capital, surplus cash, or fresh savings safely.',
    badge: 'Allocation',
    targetFacts: [
      'availableCapital',
      'emergencyFundStatus',
      'riskTolerance',
      'timeHorizon',
      'assetPreferences',
      'existingInvestments'
    ],
    initialPrompt: "Let's structure an optimal, risk-adjusted investment allocation for your available capital."
  },
  {
    id: 'portfolio',
    title: 'PORTFOLIO',
    icon: '📊',
    tagline: 'Asset Allocation & Diversification',
    description: 'Audit your existing holdings, detect sector/stock concentration risks, and rebalance efficiently.',
    badge: 'Risk Audit',
    targetFacts: [
      'previousInvestmentAmount',
      'previousInvestmentPlatforms',
      'stockSharePct',
      'mutualFundSharePct',
      'numberOfStocks',
      'rebalancePreference'
    ],
    initialPrompt: "Let's audit your active portfolio to evaluate diversification, asset weights, and risk caps."
  },
  {
    id: 'financial_health',
    title: 'FINANCIAL HEALTH',
    icon: '🏦',
    tagline: 'Cash Flow, Debt & Runway',
    description: 'Analyze your cash flow stability, debt-to-income ratio, emergency runway, and overall health score.',
    badge: 'Scorecard',
    targetFacts: [
      'monthlyIncome',
      'totalExpenses',
      'monthlyDebtPayments',
      'emergencyFund',
      'hasInsurance'
    ],
    initialPrompt: "Let's analyze your 6 financial health pillars: cash flow, debt, runway, savings, goals, and safety net."
  },
  {
    id: 'financial_goals',
    title: 'FINANCIAL GOALS',
    icon: '🎯',
    tagline: 'Milestone & Target Planning',
    description: 'Plan for specific life goals like buying a home, children’s education, car, dream travel, or retirement.',
    badge: 'Milestones',
    targetFacts: [
      'primaryGoalName',
      'targetGoalAmount',
      'goalTimeYears',
      'currentGoalSavings',
      'monthlyGoalContribution',
      'riskTolerance'
    ],
    initialPrompt: "Let's map out a mathematically sound plan to achieve your key life and financial milestones."
  },
  {
    id: 'stocks',
    title: 'STOCKS',
    icon: '🏢',
    tagline: 'Direct Equity & Risk Analysis',
    description: 'Evaluate individual stock holdings, valuation metrics, position sizing, and single-stock safety limits.',
    badge: 'Equity',
    targetFacts: [
      'stockSymbol',
      'stockHoldingAmount',
      'portfolioSharePct',
      'investmentRationale',
      'timeHorizon'
    ],
    initialPrompt: "Let's review your individual stock holdings, position sizing, and company fundamentals."
  },
  {
    id: 'learning',
    title: 'LEARNING',
    icon: '📚',
    tagline: 'Financial Concepts & Education',
    description: 'Master core financial concepts: Mutual Funds, SIP vs Lump Sum, ETFs, P/E Ratio, Compounding, and Risk.',
    badge: 'Education',
    targetFacts: [
      'learningTopic',
      'experienceLevel'
    ],
    initialPrompt: "Welcome to FinLabs Financial Academy! Which concept would you like to master today?"
  }
];

export const COMMON_OPTION_PRESETS = {
  riskTolerance: ['Conservative (Low Risk)', 'Moderate (Balanced)', 'Aggressive (High Growth)', 'Not Sure'],
  timeHorizon: ['Under 1 Year (Short)', '1–3 Years (Medium)', '3–5 Years (Long)', '5–10+ Years (Wealth Compounding)'],
  goals: ['Wealth Creation', 'House Down Payment', 'Higher Education', 'Retirement Corpus', 'Car Purchase', 'Emergency Safety Net', 'Travel Fund'],
  assetTypes: ['Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits (FD)', 'Gold / SGBs', 'Bonds / Debt', 'Real Estate', 'Crypto'],
  learningTopics: ['Mutual Funds', 'SIP vs Lump Sum', 'ETFs', 'P/E Ratio & Valuation', 'Diversification', 'Compound Interest', 'Index Funds vs Active Funds', 'Emergency Fund Setup'],
  experience: ['Complete Beginner', 'Some Experience (1–3 yrs)', 'Experienced Investor (3+ yrs)'],
  yesNo: ['Yes', 'No', 'Partially'],
  stepUp: ['10% Annual Step-Up', '5% Annual Step-Up', 'Fixed Monthly Amount (No Step-Up)']
};
