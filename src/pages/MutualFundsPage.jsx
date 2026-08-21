import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import {
  Search,
  TrendingUp,
  Star,
  ArrowUpRight,
  Calculator,
  Shield,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';
import { mockMutualFunds } from '../mock/finlabsMockData';

export default function MutualFundsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedFund, setSelectedFund] = useState(null);

  // SIP Calculator State inside Fund Analytics Modal
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(5);
  const [sipReturnRate, setSipReturnRate] = useState(15);
  const [navTimeline, setNavTimeline] = useState('3Y');

  const categories = ['All', 'Large Cap Index', 'Flexi Cap', 'Small Cap', 'Debt'];

  // Robust multi-word partial/fuzzy search algorithm
  const filterMutualFunds = (funds, query, category) => {
    const trimmed = query.trim().toLowerCase();

    return funds.filter((fund) => {
      // 1. Category Filter Check
      const matchesCategory =
        category === 'All' ||
        fund.category.toLowerCase().includes(category.toLowerCase());

      if (!matchesCategory) return false;
      if (!trimmed) return true;

      // 2. Aggregate Searchable Text
      const searchableText = `${fund.name} ${fund.category} ${fund.fundHouse || ''} ${fund.risk || ''}`.toLowerCase();

      // Split search query into individual words/tokens
      const tokens = trimmed.split(/\s+/).filter(Boolean);

      // Every token must match somewhere in the searchable text
      return tokens.every((token) => {
        if (searchableText.includes(token)) return true;

        // Alias & Common Keyword Mapping
        if (token === 'ppfas' && searchableText.includes('parag parikh')) return true;
        if (token === 'bluechip' && searchableText.includes('large cap')) return true;
        if (token === 'bchip' && searchableText.includes('bluechip')) return true;
        if (token === 'index' && searchableText.includes('nifty')) return true;
        if (token === 'flexi' && searchableText.includes('flexi cap')) return true;
        if (token === 'small' && searchableText.includes('small cap')) return true;

        return false;
      });
    });
  };

  const filteredFunds = filterMutualFunds(mockMutualFunds, search, categoryFilter);

  const handleOpenAnalytics = (fund) => {
    setSelectedFund(fund);
    setSipAmount(fund.minSip * 10 || 5000);
    setSipYears(5);
    const parsedRate = parseFloat(fund.cagr3Yr) || 15;
    setSipReturnRate(parsedRate);
    setNavTimeline('3Y');
  };

  const handleCloseAnalytics = () => {
    setSelectedFund(null);
  };

  // SIP Future Value Calculation: FV = P × [{(1 + i)^n - 1} / i] × (1 + i)
  const calculateSipReturns = () => {
    const monthlyRate = sipReturnRate / 12 / 100;
    const months = sipYears * 12;
    const totalInvested = sipAmount * months;

    let futureValue = 0;
    if (monthlyRate > 0) {
      futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      futureValue = totalInvested;
    }

    const estimatedReturns = Math.max(0, futureValue - totalInvested);
    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      totalFutureValue: Math.round(futureValue),
    };
  };

  const sipResults = calculateSipReturns();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-7xl mx-auto">
      <PageHeader
        title="Mutual Funds & SIP Screener"
        subtitle="Explore top-performing index, equity, hybrid, and debt funds with personalized risk matching."
        tag="Investments"
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            icon={Search}
            placeholder="Search by name, fund house (e.g. Parag, SBI, Quant, Bluechip, Flexi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Count / Active Filters */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Showing {filteredFunds.length} of {mockMutualFunds.length} Funds</span>
        {search && (
          <button onClick={() => setSearch('')} className="text-emerald-500 hover:underline">
            Clear Search
          </button>
        )}
      </div>

      {/* Funds Grid */}
      {filteredFunds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFunds.map((fund) => (
            <Card key={fund.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="neutral" className="text-[10px]">{fund.category}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono">{fund.fundHouse}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{fund.name}</h3>
                  </div>
                  <Badge variant="brand" className="text-[10px] font-bold shrink-0">{fund.suitability}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">3Y CAGR</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{fund.cagr3Yr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Min SIP</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">₹{fund.minSip}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Risk Rating</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{fund.risk}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {fund.rating} / 5 Rating
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowUpRight}
                  iconPosition="right"
                  onClick={() => handleOpenAnalytics(fund)}
                >
                  Fund Analytics
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No Mutual Funds Found"
          description={`No mutual funds match "${search}". Try searching for SBI, Parag, Quant, Bluechip, or Small Cap.`}
          action={
            <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategoryFilter('All'); }}>
              Reset Filters
            </Button>
          }
        />
      )}

      {/* =========================================================================
          FUND ANALYTICS RESPONSIVE MODAL
         ========================================================================= */}
      {selectedFund && (
        <Modal
          isOpen={Boolean(selectedFund)}
          onClose={handleCloseAnalytics}
          title=""
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="brand" className="text-[10px] font-bold">{selectedFund.suitability}</Badge>
                  <Badge variant="neutral" className="text-[10px]">{selectedFund.category}</Badge>
                  <span className="text-xs text-slate-400 font-mono">{selectedFund.fundHouse}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{selectedFund.name}</h2>
              </div>
              <button
                onClick={handleCloseAnalytics}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Current NAV</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedFund.nav || '₹248.50'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">1Y Return</span>
                <span className="font-mono font-bold text-emerald-500 text-sm">{selectedFund.cagr1Yr || '18.4%'}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-0.5">3Y CAGR</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">{selectedFund.cagr3Yr}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Expense Ratio</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedFund.expenseRatio || '0.58%'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">AUM Fund Size</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedFund.aum || '₹16,450 Cr'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Sharpe Ratio</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedFund.sharpeRatio || '1.24'}</span>
              </div>
            </div>

            {/* Section 2: NAV Performance & Trajectory Graph */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  NAV Growth Trajectory
                </h4>
                <div className="flex gap-1">
                  {['1Y', '3Y', '5Y', 'ALL'].map((tl) => (
                    <button
                      key={tl}
                      onClick={() => setNavTimeline(tl)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        navTimeline === tl
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full h-32 pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,90 Q 80,75 160,60 T 320,35 T 500,10 L 500,100 L 0,100 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M 0,90 Q 80,75 160,60 T 320,35 T 500,10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  <circle cx="500" cy="10" r="4" fill="#10b981" />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                <span>Jan 2024</span>
                <span>Jul 2024</span>
                <span>Jan 2025</span>
                <span>Jul 2025</span>
                <span className="text-emerald-500 font-bold">Current: {selectedFund.nav || '₹248.50'}</span>
              </div>
            </div>

            {/* Section 3: Interactive SIP Calculator Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm text-emerald-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  Interactive SIP Projection Calculator
                </h4>
                <Badge variant="brand" className="text-[10px]">Real-Time Model</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sliders */}
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-300">Monthly SIP Amount</span>
                      <span className="font-mono text-emerald-400">{formatINR(sipAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="100000"
                      step="500"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-300">Investment Horizon</span>
                      <span className="font-mono text-emerald-400">{sipYears} {sipYears === 1 ? 'Year' : 'Years'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={sipYears}
                      onChange={(e) => setSipYears(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-300">Expected Annual Return</span>
                      <span className="font-mono text-emerald-400">{sipReturnRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="0.5"
                      value={sipReturnRate}
                      onChange={(e) => setSipReturnRate(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Projection Output Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Total Invested</span>
                    <span className="font-bold text-white text-sm">{formatINR(sipResults.totalInvested)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Estimated Wealth Gain</span>
                    <span className="font-bold text-emerald-400 text-sm">+{formatINR(sipResults.estimatedReturns)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex justify-between items-center">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase font-sans">Total Future Value</span>
                    <span className="font-extrabold text-emerald-400 text-base">{formatINR(sipResults.totalFutureValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Sector Allocation Breakdown */}
            {selectedFund.sectors && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-emerald-500" />
                  Top Sector Allocations
                </h4>
                <div className="space-y-2 text-xs">
                  {selectedFund.sectors.map((sec) => (
                    <div key={sec.name} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{sec.name}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{sec.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sec.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5: Risk & Exit Load Notice */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Exit Load:</strong> {selectedFund.exitLoad || 'Nil'}
                </span>
              </div>
              <Badge variant="neutral" className="text-[10px] shrink-0">SEBI Regulated</Badge>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
