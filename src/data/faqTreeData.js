export const COMPLETE_FINANCIAL_TREE = [
  // ==================== TREE ROOT 1: SIPs & MUTUAL FUNDS ====================
  {
    id: 'root_sip',
    label: '📈 How do I start investing my first ₹5,000 via SIP?',
    answer: 'For first-time investors, starting a monthly Systematic Investment Plan (SIP) in an Index Fund (like Nifty 50) or a Flexi Cap Fund is the most disciplined way to compound wealth without trying to time the market.',
    actionRoute: { label: 'Open SIP Calculator', path: '/tools/sip-calculator' },
    followUps: [
      {
        id: 'sip_diff',
        label: '🤔 What is the difference between SIP and Lumpsum?',
        answer: 'SIP invests a fixed sum periodically (averaging purchase costs across market highs and lows via Rupee Cost Averaging). Lumpsum deploys your total capital at once, exposing you to immediate market timing risk.',
        followUps: [
          {
            id: 'sip_crash',
            label: '📉 What should I do with my SIP when markets crash 20%?',
            answer: 'Never stop your SIP during a crash! When NAVs drop, your fixed monthly installment buys more units at a discounted rate, which supercharges your long-term compounding when the market rebounds.',
            followUps: [
              {
                id: 'sip_stepup',
                label: '🚀 Should I increase my SIP amount every year (Step-Up SIP)?',
                answer: 'Yes! A 10% annual Step-Up SIP aligned with your salary hikes can help you reach your corpus goal nearly 4–5 years earlier compared to a flat SIP.',
                actionRoute: { label: 'Simulate Step-Up SIP', path: '/tools/sip-calculator' },
                followUps: []
              },
              {
                id: 'sip_pause',
                label: '⏸️ Can I pause or skip an SIP installment if money is tight?',
                answer: 'Yes, most AMCs and platforms (Groww, Zerodha) allow you to pause your SIP for 1–3 months without any penalties or folio closures.',
                followUps: []
              }
            ]
          },
          {
            id: 'sip_dates',
            label: '📅 Which calendar date gives the highest SIP returns?',
            answer: 'Historical market data over 20+ years shows zero statistically significant return difference between the 1st, 15th, or 28th of the month. Choose a date 2–3 days after your salary credit for discipline.',
            followUps: []
          }
        ]
      },
      {
        id: 'sip_types',
        label: '🎯 Index Funds vs. Flexi Cap vs. Small Cap: Which one?',
        answer: 'Index funds track the top 50/500 companies with ultra-low expense ratios (<0.2%). Flexi Cap funds dynamically move between large/mid/small caps. Small Cap funds offer higher growth potential but come with high volatility.',
        actionRoute: { label: 'Explore Mutual Funds', path: '/investments/mutual-funds' },
        followUps: [
          {
            id: 'sip_expense',
            label: '🏷️ What is an Expense Ratio and how does it eat returns?',
            answer: 'The expense ratio is the annual percentage fee charged by the fund house. A 1% difference in expense ratio over 20 years can reduce your total ending corpus by up to 20% due to compounding.',
            followUps: [
              {
                id: 'sip_direct',
                label: '⚡ What is Direct Plan vs. Regular Plan in Mutual Funds?',
                answer: 'Direct Plans have zero broker commissions and lower expense ratios (~0.5%–1.0% cheaper), resulting in significantly higher long-term returns compared to Regular plans.',
                followUps: []
              }
            ]
          }
        ]
      }
    ]
  },

  // ==================== TREE ROOT 2: EMERGENCY FUND & CASH ====================
  {
    id: 'root_emergency',
    label: '🛡️ How much Emergency Cash should I keep before investing?',
    answer: 'Maintain 3 to 6 months of mandatory living expenses (Rent + Groceries + EMIs + Utilities) strictly in liquid, risk-free accounts before allocating capital to volatile equity markets.',
    actionRoute: { label: 'Check Emergency Runway', path: '/financial-health' },
    followUps: [
      {
        id: 'emg_where',
        label: '🏦 Where is the best place to park emergency money?',
        answer: 'Split your emergency fund: 50% in a high-yield savings account or sweep-in Auto-FD (instant T+0 access) and 50% in Liquid Mutual Funds / Arbitrage Funds (T+1 access with better tax efficiency).',
        followUps: [
          {
            id: 'emg_arbitrage',
            label: '💡 What is an Arbitrage Fund and why is it tax-efficient?',
            answer: 'Arbitrage funds exploit simultaneous price differences between cash and futures markets. They provide FD-like stability but are taxed under Equity LTCG/STCG rules instead of your income tax slab.',
            followUps: []
          }
        ]
      },
      {
        id: 'emg_cc',
        label: '💳 Can I rely on my credit card limit as my emergency fund?',
        answer: 'Never. Credit card rollover interest rates range from 36% to 42% annually. Relying on credit in an emergency can trigger severe debt spirals.',
        followUps: [
          {
            id: 'emg_dti_fix',
            label: '🚨 How do I clear existing credit card debt fast?',
            answer: 'Use the Debt Avalanche method: pay minimum dues on all cards, then aggressively direct all extra monthly surplus to the card with the highest interest rate.',
            actionRoute: { label: 'View Debt Breakdown', path: '/expenses' },
            followUps: []
          }
        ]
      }
    ]
  },

  // ==================== TREE ROOT 3: DIRECT STOCKS VS FUNDS ====================
  {
    id: 'root_stocks',
    label: '⚖️ Mutual Funds vs Direct Equity: Where will I make more?',
    answer: 'Direct stocks have higher return ceilings but require active financial analysis and high risk tolerance. Mutual funds provide instant diversification across 40–60 companies managed by full-time professionals.',
    actionRoute: { label: 'Open Comparison Studio', path: '/tools/investment-comparison' },
    followUps: [
      {
        id: 'stk_how_many',
        label: '📊 How many individual stocks should a beginner hold?',
        answer: 'A healthy portfolio holds 15 to 25 stocks across at least 4–5 distinct sectors (Banking, IT, FMCG, Pharma, Auto) to eliminate single-company collapse risk.',
        followUps: [
          {
            id: 'stk_pe_ratio',
            label: '🔍 What does P/E Ratio mean and how do I use it?',
            answer: 'P/E (Price-to-Earnings) measures how much investors pay per ₹1 of company profit. A high P/E indicates high growth expectations or overvaluation, while a low P/E may indicate undervaluation or business distress.',
            followUps: []
          }
        ]
      },
      {
        id: 'stk_taxes',
        label: '💸 What are the capital gains taxes (LTCG & STCG) in India?',
        answer: 'Equity held >1 year incurs 12.5% Long-Term Capital Gains (LTCG) tax above the ₹1.25 Lakh exemption limit. Equity sold within 1 year incurs 20% Short-Term Capital Gains (STCG) tax.',
        followUps: []
      }
    ]
  },

  // ==================== TREE ROOT 4: IPOs & LISTING STRATEGIES ====================
  {
    id: 'root_ipo',
    label: '🚀 Should I apply for upcoming IPOs for quick listing gains?',
    answer: 'IPOs can generate quick listing pops, but over 50% of hype-driven IPOs trade below their issue price within 12 months. Focus on profitability, anchor investor backing, and realistic Grey Market Premiums (GMP).',
    actionRoute: { label: 'Open IPO Radar', path: '/investments/ipos' },
    followUps: [
      {
        id: 'ipo_gmp',
        label: '📈 What is Grey Market Premium (GMP) and is it reliable?',
        answer: 'GMP is the unofficial premium at which IPO shares trade in the unorganized market before listing. While a high GMP indicates strong demand, it is unregulated and can fluctuate rapidly on listing day.',
        followUps: []
      },
      {
        id: 'ipo_allotment',
        label: '🎲 How do I increase my chances of IPO share allotment?',
        answer: 'In the retail category, bidding via multiple family PAN accounts (1 lot per account at the cut-off price) increases your statistical chances compared to bidding multiple lots from a single PAN.',
        followUps: []
      }
    ]
  },

  // ==================== TREE ROOT 5: RISK PROFILING & ASSET BALANCING ====================
  {
    id: 'root_risk',
    label: '🎯 How do I know if my investment risk is too high?',
    answer: 'Your risk capacity is determined by your investment timeline and emergency liquidity, not just your emotions. If you need your capital within 3 years, holding >50% in volatile equity exposes you to capital loss.',
    actionRoute: { label: 'Run Risk Profiler', path: '/tools/risk-profiler' },
    followUps: [
      {
        id: 'risk_age_rule',
        label: '👵 What is the classic "100 minus Age" asset allocation rule?',
        answer: 'The rule suggests subtracting your age from 100 to determine your equity allocation (e.g., at age 25: 75% Equity, 25% Debt/Gold). It gradually shields your portfolio as you approach retirement.',
        followUps: []
      },
      {
        id: 'risk_gold',
        label: '🥇 How much Gold should I hold in my portfolio?',
        answer: 'A 5% to 10% allocation to Gold (via Sovereign Gold Bonds or Gold ETFs) acts as an inflation hedge and stabilizes your overall net worth during stock market pullbacks.',
        followUps: []
      }
    ]
  },

  // ==================== TREE ROOT 6: FINANCIAL HEALTH SCORE ====================
  {
    id: 'root_score',
    label: '🏆 Why is my Financial Health Score low and how do I boost it?',
    answer: 'Your Health Score evaluates 6 factors: Savings Rate (20%), Emergency Reserves (20%), Debt Burden (20%), Diversification (15%), Goal Funding (15%), and Insurance Coverage (10%).',
    actionRoute: { label: 'View Health Scorecard', path: '/financial-health' },
    followUps: [
      {
        id: 'score_savings_rate',
        label: '💰 What is a healthy savings rate for my income level?',
        answer: 'Aim for a minimum 20% to 30% savings rate (Monthly Surplus / Total Income). If your savings rate is <15%, audit your discretionary subscriptions and dining costs.',
        followUps: []
      },
      {
        id: 'score_insurance',
        label: '🏥 Why does having Term & Health Insurance increase my score?',
        answer: 'Without pure term and health insurance, a single medical hospitalization can wipe out years of accumulated investment compounding.',
        followUps: []
      }
    ]
  },

  // ==================== TREE ROOT 7: "WHAT SHOULD I DO WITH ₹10,000?" ====================
  {
    id: 'root_extra_cash',
    label: '💵 I have ₹10,000 extra cash this month. Where should it go?',
    answer: 'Follow the 3-tier priority rule: 1) Clear high-interest credit card debt (>18%), 2) Top up emergency reserve if <3 months, 3) Deploy remaining into your primary goal SIP.',
    actionRoute: { label: 'View Goal Progress', path: '/goals' },
    followUps: [
      {
        id: 'extra_debt_vs_sip',
        label: '⚔️ Should I prepay my home/car loan or invest in SIPs?',
        answer: 'If your loan interest is <9% and your equity SIP expected return is ~12–14%, continuing your SIP is mathematically superior due to long-term compounding and tax deductions.',
        followUps: []
      }
    ]
  }
];
