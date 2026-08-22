export const BOT_ROOT_TREE = [
  {
    id: 'investing',
    title: '📈 Start Investing & SIPs',
    botResponse: 'Starting an automated Systematic Investment Plan (SIP) in an Index or Flexi Cap fund is the best baseline strategy for long-term wealth compounding.',
    appAction: { label: 'Open SIP Simulator', route: '/tools/sip-calculator' },
    options: [
      {
        id: 'sip_vs_lump',
        title: '🤔 SIP vs. Lumpsum',
        botResponse: 'SIP averages market volatility across time (Rupee Cost Averaging). Lumpsum exposes all capital to market timing risk at entry.',
        options: [
          {
            id: 'market_crash',
            title: '📉 What if the market crashes?',
            botResponse: 'During market downturns, your fixed SIP installment purchases more fund units at lower NAVs, accelerating compounding during recovery.',
            options: [
              {
                id: 'step_up',
                title: '🚀 Step-Up SIP strategy',
                botResponse: 'Increasing your monthly SIP by 10% annually in step with salary increments cuts goal achievement time by 30-40%.',
                appAction: { label: 'Simulate Step-Up SIP', route: '/tools/sip-calculator' }
              },
              {
                id: 'pause_sip',
                title: '⏸️ Can I pause SIPs?',
                botResponse: 'Yes. Major platforms allow you to pause deductions for 1-3 months without closing the folio or facing penalties.'
              }
            ]
          },
          {
            id: 'best_date',
            title: '📅 Best day of the month for SIP',
            botResponse: 'Historical data confirms date choice has negligible impact on long-term CAGR. Choose 2-3 days after salary credit for financial discipline.'
          }
        ]
      },
      {
        id: 'fund_selection',
        title: '🎯 Choosing the Right Fund',
        botResponse: 'Index funds match market benchmarks with ultra-low expense ratios (<0.2%). Active funds seek alpha for a higher management fee.',
        appAction: { label: 'Browse Mutual Funds', route: '/investments/mutual-funds' },
        options: [
          {
            id: 'expense_ratio',
            title: '🏷️ Expense Ratio impact',
            botResponse: 'A 1% higher expense ratio compounded over 20 years can reduce final portfolio corpus by up to 20% due to management fees.'
          },
          {
            id: 'direct_vs_regular',
            title: '⚡ Direct vs Regular Funds',
            botResponse: 'Direct funds have 0% distributor commission, resulting in ~1-1.5% higher annual CAGR compared to Regular funds.'
          }
        ]
      }
    ]
  },
  {
    id: 'health_score',
    title: '🏆 Boost Financial Health Score',
    botResponse: 'Your Health Score evaluates 6 factors: Savings Rate (20%), Emergency Buffer (20%), Debt Management (20%), Diversification (15%), Goals (15%), and Insurance (10%).',
    appAction: { label: 'View Health Scorecard', route: '/financial-health' },
    options: [
      {
        id: 'emergency_buffer',
        title: '🛡️ Emergency Fund Setup',
        botResponse: 'Keep 3 to 6 months of mandatory living costs (Rent + EMIs + Utilities) in liquid instruments before investing in equity.',
        options: [
          {
            id: 'where_park',
            title: '🏦 Where to park emergency cash',
            botResponse: 'Split 50% in sweep-in Auto-FDs (T+0 liquidity) and 50% in Liquid/Arbitrage Mutual Funds (better tax efficiency).'
          },
          {
            id: 'runway_calc',
            title: '🧮 Calculating Liquid Runway',
            botResponse: 'Runway (Months) = Total Liquid Cash & Bank Balances / (Essential Living Expenses + Total Monthly Loan EMIs).'
          }
        ]
      },
      {
        id: 'debt_repayment',
        title: '💳 Managing High Debt (DTI)',
        botResponse: 'If monthly EMIs exceed 35% of income, deploy the Debt Avalanche method: pay minimums on all debt and direct surplus to the highest interest rate balance.',
        appAction: { label: 'Check Debt & Expense Ratio', route: '/expenses' },
        options: [
          {
            id: 'avalanche_vs_snowball',
            title: '🏔️ Avalanche vs Snowball Method',
            botResponse: 'Avalanche saves the most money mathematically by tackling highest interest rates first. Snowball pays smallest balances first for psychological wins.'
          }
        ]
      }
    ]
  },
  {
    id: 'extra_cash',
    title: '💵 What to do with ₹10,000 Surplus',
    botResponse: 'Allocate using the 3-tier safety rule: 1) Clear high-interest credit debt, 2) Fill emergency runway to 3+ months, 3) Allocate rest to primary goal SIPs.',
    appAction: { label: 'Check Goal Progress', route: '/goals' },
    options: [
      {
        id: 'goal_priority',
        title: '🎯 Goal Priority Matrix',
        botResponse: 'Prioritize short-term mandatory goals (< 3 yrs) with Fixed Deposits/Arbitrage, and long-term goals (5+ yrs) with Equity Mutual Funds.'
      }
    ]
  },
  {
    id: 'asset_allocation',
    title: '⚖️ Asset Allocation & Risk',
    botResponse: 'Your ideal mix of stocks, mutual funds, gold, and fixed deposits depends on your risk score and investment timeline.',
    appAction: { label: 'Open Risk Profiler', route: '/tools/risk-profiler' },
    options: [
      {
        id: 'rebalancing_rule',
        title: '🔄 Portfolio Rebalancing Trigger',
        botResponse: 'Rebalance once a year or when any asset class deviates by more than 10% from your target PRQ target allocation.'
      },
      {
        id: 'age_rule',
        title: '📊 100 Minus Age Rule',
        botResponse: 'Subtract your age from 100 to find your baseline equity % allocation. (e.g. Age 25 = 75% Equity, 25% Debt/Gold).'
      }
    ]
  }
];
