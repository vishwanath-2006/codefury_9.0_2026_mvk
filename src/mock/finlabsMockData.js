/**
 * FinLabs Mock Data Store
 * Structured for progressive disclosure and future Supabase/Engine integration.
 */

export const mockUserSummary = {
  name: "Alex Dev",
  greeting: "Good morning",
  role: "Investor & Builder",
  financialHealthScore: 74,
  healthStatus: "Good",
  healthMessage: "Your financial health is strong. Increasing your savings rate from 20% to 25% will elevate your score to 85+.",
  monthlyIncome: 40000,
  monthlySavings: 8000,
  monthlyExpenses: 32000,
  portfolioValue: 482500,
  portfolioGrowthPct: +12.4,
  riskProfile: "Moderately Aggressive",
};

export const mockHealthMetrics = [
  { metric: "Savings Rate", score: "20%", target: "25%", status: "Good", description: "You save ₹8,000 of your ₹40,000 income.", impact: "Positive" },
  { metric: "Emergency Fund", score: "4.5 Months", target: "6.0 Months", status: "Moderate", description: "₹1,44,000 accumulated of ₹1,92,000 needed.", impact: "Needs Attention" },
  { metric: "Debt-to-Income", score: "12%", target: "< 30%", status: "Excellent", description: "Low debt obligations relative to income.", impact: "Positive" },
  { metric: "Diversification", score: "68 / 100", target: "80 / 100", status: "Good", description: "Balanced across mutual funds, stocks, and fixed income.", impact: "Positive" },
];

export const mockStrengthsAndWeaknesses = {
  strengths: [
    "Controlled debt-to-income ratio below 15%",
    "Consistent monthly equity SIP contributions",
    "Positive net cash flow margin (+20%)"
  ],
  improvements: [
    "Emergency fund is 1.5 months below the recommended 6-month buffer",
    "Tech sector over-concentration in direct equity holdings",
    "Unutilized ₹25,000 under Section 80C tax savings"
  ]
};

export const mockExpensesBreakdown = {
  totalMonthly: 32000,
  categories: [
    { name: "Housing & Rent", amount: 14000, percentage: 44, color: "#6366f1" },
    { name: "Food & Dining", amount: 6500, percentage: 20, color: "#10b981" },
    { name: "Utilities & Bills", amount: 4000, percentage: 13, color: "#f59e0b" },
    { name: "Transport & Commute", amount: 3500, percentage: 11, color: "#06b6d4" },
    { name: "Entertainment & Subscriptions", amount: 4000, percentage: 12, color: "#ec4899" },
  ],
  recentTrends: [
    { month: "Jan", amount: 31200 },
    { month: "Feb", amount: 33500 },
    { month: "Mar", amount: 32000 },
  ]
};

export const mockTopGoals = [
  {
    id: "g1",
    title: "Emergency Reserve Fund",
    targetAmount: 192000,
    currentAmount: 144000,
    deadline: "Dec 2026",
    category: "Safety",
    progressPct: 75,
    monthlyContribution: 4000,
  },
  {
    id: "g2",
    title: "Home Downpayment",
    targetAmount: 1500000,
    currentAmount: 630000,
    deadline: "Jun 2028",
    category: "Real Estate",
    progressPct: 42,
    monthlyContribution: 12000,
  },
  {
    id: "g3",
    title: "Retirement Corpus 2045",
    targetAmount: 10000000,
    currentAmount: 2800000,
    deadline: "Dec 2045",
    category: "Long Term",
    progressPct: 28,
    monthlyContribution: 8000,
  },
];

export const mockPortfolioAllocation = [
  { name: "Mutual Funds (SIP)", value: 265375, percentage: 55, color: "#10b981" },
  { name: "Direct Equity Stocks", value: 144750, percentage: 30, color: "#6366f1" },
  { name: "Fixed Income & Gold", value: 72375, percentage: 15, color: "#f59e0b" },
];

export const mockPrimaryInsight = {
  title: "Savings Rate Optimization Opportunity",
  description: "Your current savings rate is 20% (₹8,000/mo). Increasing it to 25% (₹10,000/mo) reduces your Home Downpayment goal timeline by 14 months.",
  badge: "Primary Action",
  impact: "+14 Months Earlier",
  actionRoute: "/tools/suitability"
};

export const mockSuitabilityInsights = [
  {
    id: "s1",
    title: "SIP Top-up Opportunity",
    description: "Increasing your equity SIP by ₹2,000/mo aligns perfectly with your 2028 Home Downpayment goal.",
    type: "positive",
    impact: "+₹3.4L projected growth",
  },
  {
    id: "s2",
    title: "Over-allocation Alert",
    description: "You have 42% exposure in tech sector stocks. Consider balancing with index funds.",
    type: "warning",
    impact: "Risk Mitigation",
  },
  {
    id: "s3",
    title: "Tax Saving Buffer",
    description: "You have ₹25,000 remaining under ELSS / 80C tax optimization for FY 2026.",
    type: "info",
    impact: "Save ₹7,800 tax",
  },
];

export const mockMutualFunds = [
  { id: "mf1", name: "Nifty 50 Index Fund Direct-G", category: "Large Cap Index", rating: 5, cagr3Yr: "15.4%", minSip: 500, risk: "Moderate", suitability: "98% Match" },
  { id: "mf2", name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap", rating: 5, cagr3Yr: "18.2%", minSip: 1000, risk: "Moderately High", suitability: "94% Match" },
  { id: "mf3", name: "SBI Small Cap Fund Direct", category: "Small Cap", rating: 4, cagr3Yr: "22.6%", minSip: 500, risk: "High", suitability: "82% Match" },
  { id: "mf4", name: "HDFC Corporate Bond Fund", category: "Debt", rating: 4, cagr3Yr: "7.1%", minSip: 500, risk: "Low", suitability: "90% Match" },
];

export const mockStocks = [
  { id: "st1", ticker: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy & Conglomerate", price: 2940.50, changePct: +1.8, peRatio: 26.4, suitability: "Strong Buy" },
  { id: "st2", ticker: "TCS", name: "Tata Consultancy Services", sector: "IT Services", price: 4120.00, changePct: -0.4, peRatio: 31.2, suitability: "Hold / Accumulate" },
  { id: "st3", ticker: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking & Financials", price: 1680.25, changePct: +2.1, peRatio: 18.5, suitability: "Strong Buy" },
  { id: "st4", ticker: "INFY", name: "Infosys Ltd", sector: "IT Services", price: 1850.75, changePct: +0.9, peRatio: 27.8, suitability: "Neutral" },
];

export const mockIpos = [
  { id: "ipo1", company: "FinTech Spark India Ltd", dates: "Aug 26 - Aug 28, 2026", priceBand: "₹420 - ₹445", issueSize: "₹1,200 Cr", gmpPct: "+32%", status: "Upcoming", suitability: "High Demand" },
  { id: "ipo2", company: "GreenGrid Energy Systems", dates: "Aug 22 - Aug 24, 2026", priceBand: "₹180 - ₹195", issueSize: "₹850 Cr", gmpPct: "+18%", status: "Open Now", suitability: "Moderate Risk" },
];

export const mockAiPrompts = [
  "Which investment category suits my risk profile?",
  "Why is my financial health score 74?",
  "How can I reach my Home Downpayment goal faster?",
  "Explain my portfolio diversification in simple terms.",
  "What is an expense ratio and why does it matter?",
  "Explain SIP step-up vs flat SIP calculation."
];
