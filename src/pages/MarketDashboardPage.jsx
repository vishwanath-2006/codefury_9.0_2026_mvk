import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { TrendingUp, LineChart, Rocket, ArrowUpRight, ShieldCheck, Sparkles, PieChart } from 'lucide-react';
import { mockIpos } from '../mock/finlabsMockData';

export default function MarketDashboardPage() {
  const navigate = useNavigate();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const topFunds = [
    { name: "Parag Parikh Flexi Cap Fund", house: "PPFAS", cagr: "22.8%", type: "Flexi Cap", minSip: 1000 },
    { name: "Quant Small Cap Fund", house: "Quant MF", cagr: "34.2%", type: "Small Cap", minSip: 500 },
    { name: "Mirae Asset Large Cap Fund", house: "Mirae Asset", cagr: "18.5%", type: "Large Cap", minSip: 1000 },
  ];

  const topStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2980.50, change: "+1.8%", sector: "Energy" },
    { symbol: "TATAMOTORS", name: "Tata Motors", price: 1012.20, change: "+3.2%", sector: "Automotive" },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1665.00, change: "+0.9%", sector: "Banking" },
    { symbol: "INFY", name: "Infosys Limited", price: 1840.10, change: "+2.1%", sector: "IT Tech" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150 py-2">
      <PageHeader
        title="Market Analysis & Investment Dashboard"
        subtitle="Live Indian market trends, top mutual fund screeners, equity price action, and IPO radars."
        tag="Market Center"
      />

      {/* INDICES STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">NIFTY 50</span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">24,541.10</span>
          </div>
          <Badge variant="success" className="font-mono text-xs">+152.20 (+0.62%)</Badge>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">SENSEX</span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">80,512.80</span>
          </div>
          <Badge variant="success" className="font-mono text-xs">+512.40 (+0.64%)</Badge>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">BANK NIFTY</span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">52,240.50</span>
          </div>
          <Badge variant="success" className="font-mono text-xs">+280.10 (+0.54%)</Badge>
        </div>
      </div>

      {/* TOP TRENDING MUTUAL FUNDS & STOCKS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MUTUAL FUNDS CARD */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Top Mutual Fund Opportunities
                </CardTitle>
                <CardDescription>Highest 3Y CAGR compounding funds across top fund houses</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowUpRight}
                onClick={() => navigate('/investments/mutual-funds')}
              >
                Explore Screener
              </Button>
            </CardHeader>

            <div className="space-y-3">
              {topFunds.map((fund, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-xs">
                  <div>
                    <Badge variant="neutral" className="mb-1 text-[9px]">{fund.type}</Badge>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{fund.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{fund.house}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-extrabold text-emerald-500 block">+{fund.cagr}</span>
                    <span className="text-[10px] text-slate-400">Min SIP: ₹{fund.minSip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* STOCKS CARD */}
        <Card className="flex flex-col justify-between p-5">
          <div>
            <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-500" />
                  Trending Equities & Blue-Chips
                </CardTitle>
                <CardDescription>Real-time price action & sector leaders</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowUpRight}
                onClick={() => navigate('/investments/stocks')}
              >
                Stock Screener
              </Button>
            </CardHeader>

            <div className="space-y-3">
              {topStocks.map((stock, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{stock.symbol}</span>
                    <h4 className="font-medium text-slate-500 text-[11px]">{stock.name}</h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">₹{stock.price}</span>
                    <span className="text-[10px] font-bold text-emerald-500">{stock.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* IPO RADAR & MARKET TOOLS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-500" />
                Active & Upcoming IPO Radar
              </CardTitle>
              <CardDescription>Track subscription dates & Grey Market Premium (GMP) yields</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => navigate('/investments/ipos')}
            >
              All IPOs
            </Button>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockIpos.slice(0, 2).map((ipo) => (
              <div key={ipo.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <Badge variant={ipo.status === 'Open Now' ? 'success' : 'info'}>{ipo.status}</Badge>
                  <Badge variant="purple" className="font-mono text-xs">{ipo.gmpPct} GMP</Badge>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{ipo.company}</h4>
                <div className="space-y-1 font-mono text-[11px] text-slate-500 pt-1">
                  <div className="flex justify-between"><span>Price Band:</span> <span className="text-slate-800 dark:text-slate-200 font-bold">{ipo.priceBand}</span></div>
                  <div className="flex justify-between"><span>Dates:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{ipo.dates}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* MARKET CALCULATOR BANNER */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 flex flex-col justify-between border-slate-800">
          <div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-8 h-8 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-white mb-1">Interactive Wealth Simulators</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test compounding math using live CAGR return historical backcasts across stocks and SIPs.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/tools/sip-calculator')}
            className="bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 w-full justify-center text-xs font-bold mt-6"
          >
            Open SIP Calculator →
          </Button>
        </Card>
      </div>
    </div>
  );
}
