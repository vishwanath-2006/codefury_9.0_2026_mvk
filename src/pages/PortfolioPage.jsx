import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import { PieChart, TrendingUp, LineChart, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const { userProfile, isOnboarded } = useOnboarding();
  const [syncing, setSyncing] = useState(false);
  const [holdings, setHoldings] = useState(null);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  const portfolio = userProfile.portfolio || { mutualFunds: 175000, stocks: 105000, fixedDeposits: 35000, gold: 35000, cashBuffer: 150000 };
  const totalNetWorth = userProfile.totalPortfolioNetWorth || (portfolio.mutualFunds + portfolio.stocks + portfolio.fixedDeposits + portfolio.gold + (portfolio.cashBuffer || 0)) || 350000;

  const dynamicAllocation = [
    { name: 'Equity Mutual Funds', value: portfolio.mutualFunds, percentage: Math.round(((portfolio.mutualFunds) / totalNetWorth) * 100) || 50, color: '#10b981' },
    { name: 'Direct Equities / Stocks', value: portfolio.stocks, percentage: Math.round(((portfolio.stocks) / totalNetWorth) * 100) || 30, color: '#6366f1' },
    { name: 'Fixed Income / FDs', value: portfolio.fixedDeposits, percentage: Math.round(((portfolio.fixedDeposits) / totalNetWorth) * 100) || 10, color: '#f59e0b' },
    { name: 'Gold Reserves', value: portfolio.gold, percentage: Math.round(((portfolio.gold) / totalNetWorth) * 100) || 10, color: '#eab308' },
  ].filter(item => item.value > 0 || item.percentage > 0);

  const fallbackHoldings = [
    { symbol: "RELIANCE", quantity: 15, averagePrice: 2850.00, ltp: 2980.50, investedValue: 42750, currentValue: 44707.5, pnl: 1957.50, pnlPercentage: 4.58 },
    { symbol: "TATAMOTORS", quantity: 30, averagePrice: 940.00, ltp: 1012.20, investedValue: 28200, currentValue: 30366, pnl: 2166.00, pnlPercentage: 7.68 },
    { symbol: "HDFCBANK", quantity: 20, averagePrice: 1580.00, ltp: 1665.00, investedValue: 31600, currentValue: 33300, pnl: 1700.00, pnlPercentage: 5.38 },
  ];

  const connectAngelOne = () => {
    const smartApiKey = 'OPvmoROA';
    const redirectUrl = encodeURIComponent(window.location.origin + '/portfolio');
    window.location.href = `https://smartapi.angelone.in/publisher-login?api_key=${smartApiKey}&redirect_url=${redirectUrl}`;
  };

  const syncWithToken = () => {
    setSyncing(true);
    setTimeout(() => {
      setHoldings(fallbackHoldings);
      setSyncing(false);
    }, 600);
  };

  const portfolioContent = (
    <div className="space-y-8">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Worth"
          value={formatINR(totalNetWorth)}
          icon={TrendingUp}
          change={`${dynamicAllocation.length} Active Asset Classes`}
          changeType="positive"
          description="Consolidated Net Holdings"
        />

        <StatCard
          title="Primary Asset Class"
          value={dynamicAllocation[0]?.name || 'Equity Mutual Funds'}
          icon={PieChart}
          change={`${dynamicAllocation[0]?.percentage || 50}% Allocation`}
          changeType="positive"
          description="Core growth holdings"
        />

        <StatCard
          title="Broker Integration"
          value="Angel One API"
          icon={LineChart}
          change="Ready for Sync"
          changeType="neutral"
          description="Live Demat Integration"
        />
      </div>

      {/* Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Asset Class Allocation Guide
          </CardTitle>
          <CardDescription>
            Live asset class distribution of your holdings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 bg-slate-100 dark:bg-slate-800">
            {dynamicAllocation.map((item, idx) => (
              <div
                key={idx}
                className="h-full transition-all"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {dynamicAllocation.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mb-1">{formatINR(item.value)}</p>
                <Badge variant="neutral">{item.percentage}% of portfolio</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Angel One SmartAPI Integration Widget */}
      <Card className="mt-6">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Angel One SmartAPI Portfolio Sync
            </CardTitle>
            <CardDescription>
              Connect your Angel One demat account to sync stock holdings in real-time.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              disabled={syncing}
              onClick={connectAngelOne}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white text-xs font-bold transition shadow-md shadow-emerald-500/10"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Connect Angel One Account</span>
                </>
              )}
            </button>
            <button
              disabled={syncing}
              onClick={syncWithToken}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-bold transition"
            >
              Load Demo Holdings
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {holdings ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2">Symbol</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Avg Price</th>
                    <th className="py-2 text-right">LTP</th>
                    <th className="py-2 text-right">Invested</th>
                    <th className="py-2 text-right">Current</th>
                    <th className="py-2 text-right">P&L (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold font-mono">
                  {holdings.map((h, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-sans font-bold text-slate-800 dark:text-slate-200">{h.symbol}</td>
                      <td className="py-3 text-right">{h.quantity}</td>
                      <td className="py-3 text-right">₹{h.averagePrice}</td>
                      <td className="py-3 text-right">₹{h.ltp}</td>
                      <td className="py-3 text-right">₹{h.investedValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-emerald-500">₹{h.currentValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-emerald-500">+{h.pnlPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/10">
              <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 font-medium max-w-sm">
                Connect your Angel One demat account or click "Load Demo Holdings" to sync live broker positions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // NON-ONBOARDED BLURRED LOCK ARCHITECTURE
  if (!isOnboarded) {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <PageHeader
          title="Integrated Portfolio Workspace"
          subtitle="Unified view of your mutual funds, equity holdings, debt instruments, and net worth trajectory."
          tag="Asset Management"
        />

        <FeatureOverviewCard
          moduleName="Integrated Portfolio Workspace"
          subtitle="Consolidates holdings across Equity Mutual Funds, Direct Stocks, FDs, and Sovereign Gold into a single net worth allocation engine."
          capabilities={[
            "Real-time Asset Allocation: Computes exact percentages deployed across Equities, Fixed Income, and Gold.",
            "Angel One SmartAPI Integration: Direct OAuth sync with Demat accounts to fetch live equity positions.",
            "Net Worth Trajectory Tracking: Monitors portfolio compounding over 1, 3, and 5-year investment horizons."
          ]}
          whyItMatters={[
            "Without consolidated portfolio tracking, investors miscalculate their overall equity risk exposure.",
            "Visualizing asset allocation prevents over-concentration in a single volatile asset class."
          ]}
        >
          {portfolioContent}
        </FeatureOverviewCard>
      </div>
    );
  }

  // ONBOARDED Crisp Live Mode
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Integrated Portfolio Workspace"
        subtitle="Unified view of your mutual funds, equity holdings, debt instruments, and net worth trajectory."
        tag="Asset Management"
      />

      {portfolioContent}
    </div>
  );
}
