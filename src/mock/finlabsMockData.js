export const mockUserSummary = {
  monthlyIncome: 50000,
  monthlyExpenses: 35000,
  monthlySurplus: 15000,
  currentSavings: 150000,
  emergencyFund: 100000,
  totalDebt: 0,
  monthlyDebtPayments: 0,
};

export const mockHealthMetrics = {
  overallScore: 74,
  statusLabel: "Good Financial Baseline",
  savingsRatePct: "30%",
  emergencyFundMonths: "4.0 Months",
  debtToIncomeRatio: "0%",
  monthlySurplus: "₹15,000 / mo",
};

export const mockHealthBreakdown = [
  { metric: "Savings Rate", score: 85, weight: "25%", status: "Optimal" },
  { metric: "Emergency Reserves", score: 70, weight: "25%", status: "Moderate Buffer" },
  { metric: "Debt Burden", score: 100, weight: "20%", status: "Zero Debt" },
  { metric: "Insurance Protection", score: 80, weight: "15%", status: "Covered" },
  { metric: "Goal Progress", score: 65, weight: "15%", status: "On Track" },
];

export const mockTopGoals = [
  { id: "g1", title: "Emergency Reserve Fund", category: "Safety", targetAmount: 200000, currentAmount: 100000, deadline: "2026-12-31", priority: "High" },
  { id: "g2", title: "Home Downpayment", category: "Real Estate", targetAmount: 1000000, currentAmount: 300000, deadline: "2028-06-30", priority: "High" },
];

export const mockPortfolioAllocation = [
  { name: "Equity Mutual Funds", pct: 45, color: "#10b981" },
  { name: "Direct Equities", pct: 25, color: "#3b82f6" },
  { name: "Fixed Income / FDs", pct: 18, color: "#f59e0b" },
  { name: "Gold Reserves", pct: 7, color: "#eab308" },
  { name: "Cash Buffer", pct: 5, color: "#64748b" },
];

export const mockPrimaryInsight = {
  title: "Optimize Surplus Allocation into SIP",
  description: "Your monthly surplus is ₹15,000. Allocating ₹10,000 into Nifty 50 Index Fund could generate ₹18.5 Lakhs over 7 years.",
  action: "Explore SIP Screener",
  category: "Investments",
  priority: "High",
};

export const mockExpensesBreakdown = [
  { category: "Housing", amount: 22000, pct: "63%" },
  { category: "Food & Household", amount: 8500, pct: "24%" },
  { category: "Utilities", amount: 3200, pct: "9%" },
  { category: "Subscriptions", amount: 1499, pct: "4%" },
];

export const mockSuitabilityInsights = [
  { title: "Risk Appetite Match", status: "Balanced Growth", pct: "92%" },
  { title: "Time Horizon Alignment", status: "5-10 Years", pct: "96%" },
  { title: "Liquidity Requirement", status: "Moderate Reserve", pct: "88%" },
];

export const modulePlaceholders = {
  title: "FinLabs Module Initialized",
  subtitle: "Component container ready.",
};

export const mockFinancialHealthHistory = [
  { date: "Jan 2026", score: 68 },
  { date: "Feb 2026", score: 71 },
  { date: "Mar 2026", score: 74 },
];

export const mockExpenses = [
  { id: "e1", title: "House Rent & Maintenance", category: "Housing", amount: 22000, date: "2026-08-01", type: "Essential" },
  { id: "e2", title: "Organic Groceries & Supplies", category: "Food & Household", amount: 8500, date: "2026-08-03", type: "Essential" },
  { id: "e3", title: "Electricity & Fiber Internet", category: "Utilities", amount: 3200, date: "2026-08-05", type: "Essential" },
  { id: "e4", title: "Weekend Dining & Outing", category: "Entertainment", amount: 4800, date: "2026-08-10", type: "Discretionary" },
  { id: "e5", title: "Fuel & Cab Fares", category: "Transport", amount: 4200, date: "2026-08-12", type: "Essential" },
  { id: "e6", title: "Streaming & Cloud Subscriptions", category: "Subscriptions", amount: 1499, date: "2026-08-15", type: "Discretionary" },
];

export const mockGoals = [
  { id: "g1", title: "Emergency Reserve Fund", category: "Safety", targetAmount: 200000, currentAmount: 100000, deadline: "2026-12-31", priority: "High" },
  { id: "g2", title: "Home Downpayment", category: "Real Estate", targetAmount: 1000000, currentAmount: 300000, deadline: "2028-06-30", priority: "High" },
  { id: "g3", title: "EV SUV Upgrade", category: "Vehicle", targetAmount: 400000, currentAmount: 80000, deadline: "2027-03-31", priority: "Medium" },
  { id: "g4", title: "Europe Vacation", category: "Travel", targetAmount: 250000, currentAmount: 45000, deadline: "2027-09-30", priority: "Low" },
];

export const mockPortfolioSummary = {
  totalWealth: 1540000,
  monthlyChange: "+₹38,200 (+2.5%)",
  assetAllocation: [
    { name: "Equity Mutual Funds", pct: 45, color: "#10b981" },
    { name: "Direct Indian Equities", pct: 25, color: "#3b82f6" },
    { name: "Fixed Income / FDs", pct: 18, color: "#f59e0b" },
    { name: "Gold Reserves", pct: 7, color: "#eab308" },
    { name: "Cash Liquid Buffer", pct: 5, color: "#64748b" },
  ],
};

export const mockAiRecommendations = [
  {
    id: "rec1",
    title: "Optimize Surplus Allocation into SIP",
    description: "Your monthly surplus is ₹15,000. Allocating ₹10,000 into Nifty 50 Index Fund could generate ₹18.5 Lakhs over 7 years.",
    action: "Explore SIP Screener",
    category: "Investments",
    priority: "High",
  },
  {
    id: "rec2",
    title: "Build Emergency Coverage Buffer",
    description: "Your current reserve covers 4.0 months. Reach 6 months (₹2.1 Lakhs) before aggressive small-cap exposure.",
    action: "View Goals",
    category: "Safety",
    priority: "Medium",
  },
  {
    id: "rec3",
    title: "Tax Saving Buffer",
    description: "You have ₹25,000 remaining under ELSS / 80C tax optimization for FY 2026.",
    action: "Save ₹7,800 tax",
    category: "Tax Optimization",
    priority: "Medium",
  },
];

export const mockMutualFunds = [
  {
    id: "mf1",
    name: "Nifty 50 Index Fund Direct-G",
    fundHouse: "UTI / Index Funds",
    category: "Large Cap Index",
    rating: 5,
    nav: "₹248.50",
    cagr1Yr: "18.4%",
    cagr3Yr: "15.4%",
    cagr5Yr: "16.1%",
    minSip: 500,
    risk: "Moderate",
    expenseRatio: "0.12%",
    aum: "₹16,450 Cr",
    exitLoad: "Nil",
    sharpeRatio: "1.24",
    suitability: "98% Match",
    sectors: [
      { name: "Financial Services", pct: 33.5 },
      { name: "Information Technology", pct: 14.2 },
      { name: "Oil, Gas & Consumable", pct: 11.8 },
      { name: "Consumer Goods", pct: 9.4 },
      { name: "Automobile & Auto", pct: 6.8 },
    ],
    navHistory: [
      { month: "Jan", nav: 210 },
      { month: "Mar", nav: 218 },
      { month: "May", nav: 226 },
      { month: "Jul", nav: 234 },
      { month: "Sep", nav: 240 },
      { month: "Nov", nav: 245 },
      { month: "Current", nav: 248.5 },
    ]
  },
  {
    id: "mf2",
    name: "Parag Parikh Flexi Cap Fund",
    fundHouse: "PPFAS Mutual Fund",
    category: "Flexi Cap",
    rating: 5,
    nav: "₹74.20",
    cagr1Yr: "22.8%",
    cagr3Yr: "18.2%",
    cagr5Yr: "21.5%",
    minSip: 1000,
    risk: "Moderately High",
    expenseRatio: "0.58%",
    aum: "₹62,100 Cr",
    exitLoad: "2% if redeemed within 365 days",
    sharpeRatio: "1.48",
    suitability: "94% Match",
    sectors: [
      { name: "Financial Services", pct: 28.4 },
      { name: "IT & US Tech Titans", pct: 19.2 },
      { name: "Automobile", pct: 12.1 },
      { name: "Capital Goods", pct: 8.9 },
      { name: "FMCG", pct: 7.5 },
    ],
    navHistory: [
      { month: "Jan", nav: 58 },
      { month: "Mar", nav: 61 },
      { month: "May", nav: 65 },
      { month: "Jul", nav: 68 },
      { month: "Sep", nav: 71 },
      { month: "Nov", nav: 73 },
      { month: "Current", nav: 74.2 },
    ]
  },
  {
    id: "mf3",
    name: "SBI Small Cap Fund Direct",
    fundHouse: "SBI Mutual Fund",
    category: "Small Cap",
    rating: 4,
    nav: "₹162.80",
    cagr1Yr: "26.4%",
    cagr3Yr: "22.6%",
    cagr5Yr: "24.1%",
    minSip: 500,
    risk: "High",
    expenseRatio: "0.69%",
    aum: "₹28,900 Cr",
    exitLoad: "1% if redeemed within 1 year",
    sharpeRatio: "1.18",
    suitability: "82% Match",
    sectors: [
      { name: "Capital Goods", pct: 22.1 },
      { name: "Consumer Durables", pct: 16.4 },
      { name: "Chemicals & Materials", pct: 14.8 },
      { name: "Healthcare & Pharma", pct: 11.2 },
      { name: "Textiles", pct: 8.5 },
    ],
    navHistory: [
      { month: "Jan", nav: 120 },
      { month: "Mar", nav: 129 },
      { month: "May", nav: 138 },
      { month: "Jul", nav: 147 },
      { month: "Sep", nav: 154 },
      { month: "Nov", nav: 159 },
      { month: "Current", nav: 162.8 },
    ]
  },
  {
    id: "mf4",
    name: "SBI Bluechip Fund Direct-G",
    fundHouse: "SBI Mutual Fund",
    category: "Large Cap Index",
    rating: 4,
    nav: "₹92.40",
    cagr1Yr: "16.8%",
    cagr3Yr: "14.9%",
    cagr5Yr: "15.8%",
    minSip: 500,
    risk: "Moderate",
    expenseRatio: "0.82%",
    aum: "₹44,200 Cr",
    exitLoad: "1% if redeemed within 1 year",
    sharpeRatio: "1.08",
    suitability: "91% Match",
    sectors: [
      { name: "Financial Services", pct: 36.2 },
      { name: "Automobile", pct: 11.5 },
      { name: "Oil & Gas", pct: 10.4 },
      { name: "IT Services", pct: 9.8 },
      { name: "Construction", pct: 7.6 },
    ],
    navHistory: [
      { month: "Jan", nav: 76 },
      { month: "Mar", nav: 80 },
      { month: "May", nav: 83 },
      { month: "Jul", nav: 86 },
      { month: "Sep", nav: 89 },
      { month: "Nov", nav: 91 },
      { month: "Current", nav: 92.4 },
    ]
  },
  {
    id: "mf5",
    name: "Quant Small Cap Fund Direct-G",
    fundHouse: "Quant Mutual Fund",
    category: "Small Cap",
    rating: 5,
    nav: "₹258.10",
    cagr1Yr: "34.2%",
    cagr3Yr: "28.5%",
    cagr5Yr: "31.2%",
    minSip: 1000,
    risk: "High",
    expenseRatio: "0.77%",
    aum: "₹21,400 Cr",
    exitLoad: "1% if redeemed within 15 days",
    sharpeRatio: "1.62",
    suitability: "86% Match",
    sectors: [
      { name: "Energy & Power", pct: 19.8 },
      { name: "Financial Services", pct: 17.4 },
      { name: "Metals & Mining", pct: 15.1 },
      { name: "Healthcare", pct: 12.6 },
      { name: "Infrastructure", pct: 10.2 },
    ],
    navHistory: [
      { month: "Jan", nav: 180 },
      { month: "Mar", nav: 198 },
      { month: "May", nav: 215 },
      { month: "Jul", nav: 232 },
      { month: "Sep", nav: 246 },
      { month: "Nov", nav: 252 },
      { month: "Current", nav: 258.1 },
    ]
  },
  {
    id: "mf6",
    name: "HDFC Corporate Bond Fund",
    fundHouse: "HDFC Mutual Fund",
    category: "Debt",
    rating: 4,
    nav: "₹29.80",
    cagr1Yr: "7.8%",
    cagr3Yr: "7.1%",
    cagr5Yr: "7.6%",
    minSip: 500,
    risk: "Low",
    expenseRatio: "0.34%",
    aum: "₹27,800 Cr",
    exitLoad: "Nil",
    sharpeRatio: "2.10",
    suitability: "90% Match",
    sectors: [
      { name: "AAA Corporate Bonds", pct: 72.4 },
      { name: "Sovereign G-Secs", pct: 18.2 },
      { name: "Banking Bonds", pct: 6.4 },
      { name: "Cash Reserves", pct: 3.0 },
    ],
    navHistory: [
      { month: "Jan", nav: 27.5 },
      { month: "Mar", nav: 27.9 },
      { month: "May", nav: 28.3 },
      { month: "Jul", nav: 28.8 },
      { month: "Sep", nav: 29.2 },
      { month: "Nov", nav: 29.5 },
      { month: "Current", nav: 29.8 },
    ]
  },
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
