import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { PieChart, TrendingUp, TrendingDown, LineChart, ShieldCheck, Lock, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { mockUserSummary, mockPortfolioAllocation } from '../mock/finlabsMockData';

export default function PortfolioPage() {
  const [syncing, setSyncing] = useState(false);
  const [holdings, setHoldings] = useState(null);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  // Broker Credentials Inputs
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [pin, setPin] = useState('');
  const [totpSecret, setTotpSecret] = useState('');

  const syncHoldings = async (useDemo = false) => {
    setSyncing(true);
    setError(null);
    try {
      const response = await fetch('/api/broker/angelone/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: useDemo ? 'demo' : apiKey || undefined,
          clientId: useDemo ? 'demo' : clientId || undefined,
          pin: useDemo ? 'demo' : pin || undefined,
          totpSecret: useDemo ? 'demo' : totpSecret || undefined,
          demo: useDemo
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `HTTP error ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success') {
        setHoldings(resJson.holdings || []);
        setSource(resJson.source);
      } else {
        throw new Error(resJson.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Broker sync failed:', err);
      setError(err.message || 'Unable to connect to integration service.');
    } finally {
      setSyncing(false);
    }
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Integrated Portfolio Workspace"
        subtitle="Unified view of your mutual funds, equity holdings, debt instruments, and net worth trajectory."
        tag="Asset Management"
      />

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Worth"
          value={formatINR(mockUserSummary.portfolioValue)}
          icon={TrendingUp}
          change="+12.4% Overall CAGR"
          changeType="positive"
          description="3 asset classes"
        />

        <StatCard
          title="Mutual Funds (SIP)"
          value={formatINR(mockPortfolioAllocation[0].value)}
          icon={PieChart}
          change="55% Allocation"
          changeType="positive"
          description="Core growth engine"
        />

        <StatCard
          title="Direct Equity Stocks"
          value={formatINR(mockPortfolioAllocation[1].value)}
          icon={LineChart}
          change="30% Allocation"
          changeType="neutral"
          description="Alpha growth holdings"
        />
      </div>

      {/* Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Asset Class Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 bg-slate-100 dark:bg-slate-800">
            {mockPortfolioAllocation.map((item, idx) => (
              <div
                key={idx}
                className="h-full transition-all"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockPortfolioAllocation.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mb-1">{formatINR(item.value)}</p>
                <Badge variant="neutral">{item.percentage}% of total portfolio</Badge>
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
              Connect to your Angel One demat account to sync equity holdings in real-time.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 transition"
            >
              Credentials Config
            </button>
            <button
              disabled={syncing}
              onClick={() => syncHoldings(false)}
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
                  <span>Sync Holdings</span>
                </>
              )}
            </button>
            <button
              disabled={syncing}
              onClick={() => syncHoldings(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 text-xs font-bold transition"
            >
              Load Demo Holdings
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Credentials Config Fields */}
          {showConfig && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">API Key</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter SmartAPI Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-250/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-emerald-500 focus:outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Client ID</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Client ID (e.g. K12345)"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-250/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-emerald-500 focus:outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">MPIN</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter 4-Digit MPIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-250/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-emerald-500 focus:outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">TOTP Secret Key</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="TOTP Secret Key"
                    value={totpSecret}
                    onChange={(e) => setTotpSecret(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-250/60 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-emerald-500 focus:outline-none transition font-semibold"
                  />
                </div>
              </div>
              <p className="sm:col-span-2 lg:col-span-4 text-[10px] text-slate-400 font-semibold mt-1">
                * Note: If fields are left blank, the API routes will fall back to environment secrets, or run in mock mode.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Sync Failed:</span> {error}
              </div>
            </div>
          )}

          {/* Sync Result Table */}
          {holdings ? (
            holdings.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-semibold text-slate-500">
                    Source: <span className="font-extrabold text-emerald-500 uppercase">{source}</span>
                  </span>
                  <span className="font-bold font-mono text-slate-400">
                    Synced {holdings.length} Positions
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-150/40 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="py-2.5">Symbol</th>
                        <th className="py-2.5 text-right">Qty</th>
                        <th className="py-2.5 text-right">Avg Price</th>
                        <th className="py-2.5 text-right">LTP</th>
                        <th className="py-2.5 text-right">Invested Value</th>
                        <th className="py-2.5 text-right">Current Value</th>
                        <th className="py-2.5 text-right text-center">P&L (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-semibold">
                      {holdings.map((h, idx) => {
                        const isProfit = h.pnl >= 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                            <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{h.symbol}</td>
                            <td className="py-3 text-right font-mono">{h.quantity}</td>
                            <td className="py-3 text-right font-mono">₹{h.averagePrice.toFixed(2)}</td>
                            <td className="py-3 text-right font-mono">₹{h.ltp.toFixed(2)}</td>
                            <td className="py-3 text-right font-mono">₹{h.investedValue.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-right font-mono text-slate-800 dark:text-slate-100">₹{h.currentValue.toLocaleString('en-IN')}</td>
                            <td className="py-3 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${isProfit ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{isProfit ? '+' : ''}{h.pnl.toLocaleString('en-IN')} ({h.pnlPercentage.toFixed(2)}%)</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total Synced Portfolio Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800/40 text-center font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Total Invested</span>
                    <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
                      ₹{holdings.reduce((sum, h) => sum + h.investedValue, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Current Value</span>
                    <span className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                      ₹{holdings.reduce((sum, h) => sum + h.currentValue, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Total Return</span>
                    <span className={`font-extrabold text-sm ${holdings.reduce((sum, h) => sum + h.pnl, 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ₹{holdings.reduce((sum, h) => sum + h.pnl, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Return (%)</span>
                    <span className={`font-extrabold text-sm ${holdings.reduce((sum, h) => sum + h.pnl, 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {((holdings.reduce((sum, h) => sum + h.pnl, 0) / (holdings.reduce((sum, h) => sum + h.investedValue, 0) || 1)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400 font-medium py-6">
                Login successful, but no active holdings were found in this account.
              </p>
            )
          ) : (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/10">
              <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 font-medium max-w-sm leading-relaxed">
                Your portfolio holds no synced broker assets. Connect your Angel One account to populate live holdings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
