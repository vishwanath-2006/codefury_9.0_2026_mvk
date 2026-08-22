import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  GitCompare,
  Search,
  Plus,
  X,
  Sparkles,
  Scale,
  RefreshCw,
  Info,
  AlertCircle,
  TrendingUp,
  LineChart
} from 'lucide-react';
import {
  searchAllInvestments,
  loadUnifiedComparison,
  generateKeyDifferences
} from '../services/comparisonService';
import MultiAssetLineChart from '../components/comparison/MultiAssetLineChart';
import ComparisonBarChart from '../components/comparison/ComparisonBarChart';

export default function InvestmentComparisonPage() {
  // Asset filter for search
  const [filterType, setFilterType] = useState('all'); // 'all' | 'stocks' | 'mf' | 'ipos'

  // Selected investments (Default: 1 stock + 1 mutual fund for cross-asset clarity)
  const [selectedItems, setSelectedItems] = useState([
    { type: 'stock', key: 'TCS', name: 'Tata Consultancy Services' },
    { type: 'mf', key: 'mf-parag-parikh', name: 'Parag Parikh Flexi Cap Fund' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('1Y'); // '1M' | '6M' | '1Y'
  const [analyticsCategory, setAnalyticsCategory] = useState('returns'); // 'returns' | 'valuation'
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxWarning, setMaxWarning] = useState(false);

  // Load comparison data whenever selectedItems change
  const loadData = async () => {
    if (selectedItems.length < 2) {
      setComparisonData([]);
      return;
    }

    setLoading(true);
    try {
      const data = await loadUnifiedComparison(selectedItems);
      setComparisonData(data);
    } catch (e) {
      console.error('Comparison load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedItems]);

  // Autocomplete search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const all = searchAllInvestments(searchQuery, filterType);
    return all.filter((res) => !selectedItems.some((s) => s.key === res.key));
  }, [searchQuery, filterType, selectedItems]);

  const handleAddItem = (item) => {
    if (selectedItems.length >= 5) {
      setMaxWarning(true);
      setTimeout(() => setMaxWarning(false), 3000);
      return;
    }
    setSelectedItems((prev) => [...prev, { type: item.type, key: item.key, name: item.name, rawItem: item.rawItem }]);
    setSearchQuery('');
  };

  const handleRemoveItem = (keyToRemove) => {
    setSelectedItems((prev) => prev.filter((i) => i.key !== keyToRemove));
  };

  // Generate 2–3 concise takeaway points
  const keyDifferences = useMemo(() => {
    return generateKeyDifferences(comparisonData);
  }, [comparisonData]);

  // Visual dot color gradient mapping based on existing risk data:
  // 🟢 Green = Low risk | 🟡 Yellow = Moderate risk | 🟠 Orange = High risk | 🔴 Red = Very High risk
  const getRiskDotClass = (risk) => {
    const r = (risk || '').toLowerCase();
    if (r.includes('low') && !r.includes('moderate')) return 'bg-emerald-500 shadow-xs shadow-emerald-500/50';
    if (r.includes('low to moderate') || (r.includes('moderate') && !r.includes('high'))) return 'bg-amber-400 shadow-xs shadow-amber-400/50';
    if (r.includes('moderately high') || r.includes('moderate to high') || (r.includes('high') && !r.includes('very'))) return 'bg-orange-500 shadow-xs shadow-orange-500/50';
    if (r.includes('very high')) return 'bg-rose-500 shadow-xs shadow-rose-500/50';
    return 'bg-orange-500 shadow-xs shadow-orange-500/50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto pb-16">
      {/* 1. Header */}
      <PageHeader
        title="Investment Comparison"
        subtitle="Compare investments by risk, returns, cost, and suitability."
        tag="Smart Compare"
      />

      {/* 2. Asset Type Filter & Search Bar */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3.5">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'all' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setFilterType('stocks')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'stocks' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Stocks
            </button>
            <button
              onClick={() => setFilterType('mf')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'mf' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Mutual Funds
            </button>
            <button
              onClick={() => setFilterType('ipos')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'ipos' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              IPOs
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading || selectedItems.length < 2}
            className="text-xs text-slate-500 hover:text-emerald-500 font-semibold flex items-center gap-1.5 transition disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search investments by name or symbol (e.g. TCS, Parag Parikh, Premier Energies)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  onClick={() => handleAddItem(res)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={res.badgeVariant} className="text-[10px] uppercase">
                      {res.badge}
                    </Badge>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{res.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2 font-mono">({res.symbol})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {res.priceDisplay}
                    </span>
                    <button
                      type="button"
                      className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold transition text-[11px] flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Investment Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Selected ({selectedItems.length}/5):</span>
            {selectedItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold"
              >
                <span>{item.name}</span>
                <button
                  onClick={() => handleRemoveItem(item.key)}
                  className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {selectedItems.length < 2 && (
            <span className="text-amber-500 font-medium">Select at least 2 investments</span>
          )}
        </div>
      </Card>

      {/* Max Warning Alert */}
      {maxWarning && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Maximum 5 investments allowed for a clean side-by-side comparison.</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-10 text-center space-y-2 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Comparing selected investments...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && selectedItems.length < 2 && (
        <div className="p-10 text-center space-y-2 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <GitCompare className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Select Investments</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose any combination of Stocks, Mutual Funds, or IPOs above to compare risk, returns, cost, and liquidity.
          </p>
        </div>
      )}

      {/* MAIN COMPACT COMPARISON */}
      {!loading && comparisonData.length >= 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 3. Quick Comparison Table (8 core factors) */}
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Quick Comparison</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Very High</span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 min-w-[150px]">Factor</th>
                    {comparisonData.map((item) => (
                      <th key={item.id} className="p-3.5 min-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400 block mt-0.5">{item.typeBadge}</span>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {/* 1. Risk Profile Row (with colored indicator dot) */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Risk Profile</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full inline-block shrink-0 ${getRiskDotClass(item.risk)}`}
                            title={`Risk Level: ${item.risk}`}
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.risk}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 2. 1-Year Return / Expected Gain Row (with subtle risk dot) */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">1-Year Return / Gain</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5">
                        <div className="flex items-center gap-2 font-mono font-bold text-emerald-500 text-sm">
                          <span>{item.returnDisplay}</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 opacity-80 ${getRiskDotClass(item.risk)}`}
                            title={`Associated Risk: ${item.risk}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 3. Cost & Expenses */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Cost & Expenses</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {item.cost}
                      </td>
                    ))}
                  </tr>

                  {/* 4. Liquidity */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Liquidity</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                        {item.liquidity}
                      </td>
                    ))}
                  </tr>

                  {/* 5. Diversification */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Diversification</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 text-slate-700 dark:text-slate-300">
                        {item.diversification}
                      </td>
                    ))}
                  </tr>

                  {/* 6. Minimum Investment */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Minimum Entry</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {item.minInvestment}
                      </td>
                    ))}
                  </tr>

                  {/* 7. Recommended Horizon */}
                  <tr>
                    <td className="p-3.5 font-semibold text-slate-500">Recommended Horizon</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                        {item.horizon}
                      </td>
                    ))}
                  </tr>

                  {/* 8. Best Suited For */}
                  <tr className="bg-slate-50/50 dark:bg-slate-950/40">
                    <td className="p-3.5 font-semibold text-slate-500">Best Suited For</td>
                    {comparisonData.map((item) => (
                      <td key={item.id} className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.suitability}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* 4. Relative Normalized Performance Graph (Baseline = 100) */}
          <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Relative Normalized Performance
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Normalized to Base = 100 at start of period for fair multi-asset performance comparison.
                </p>
              </div>

              {/* Timeframe Filter Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {['1M', '6M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeFilter(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      timeFilter === tf
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Single Compact Canvas Line Chart */}
            <MultiAssetLineChart items={comparisonData} timeFilter={timeFilter} />
          </Card>

          {/* 5. Visual Analytics Breakdown (In-place Returns / Valuation toggle) */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Visual Analytics Breakdown
              </h3>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAnalyticsCategory('returns')}
                  className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                    analyticsCategory === 'returns'
                      ? 'bg-emerald-500 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Returns
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsCategory('valuation')}
                  className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                    analyticsCategory === 'valuation'
                      ? 'bg-emerald-500 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Valuation
                </button>
              </div>
            </div>

            {/* In-place content switcher */}
            {analyticsCategory === 'returns' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                <ComparisonBarChart
                  title="1-Month Return (%)"
                  subtitle="Short-term price momentum"
                  data={comparisonData}
                  metricKey="return1M"
                  unit="%"
                  isReturn={true}
                />
                <ComparisonBarChart
                  title="6-Month Return (%)"
                  subtitle="Medium-term trend"
                  data={comparisonData}
                  metricKey="return6M"
                  unit="%"
                  isReturn={true}
                />
                <ComparisonBarChart
                  title="1-Year Return (%)"
                  subtitle="Annualized performance"
                  data={comparisonData}
                  metricKey="return1Y"
                  unit="%"
                  isReturn={true}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                <ComparisonBarChart
                  title="Valuation Multiple / Cost"
                  subtitle="P/E for Stocks, TER for Funds, GMP for IPOs"
                  data={comparisonData}
                  metricKey="valuationDisplay"
                  theme="indigo"
                />
                <ComparisonBarChart
                  title="1-Year Growth / Premium (%)"
                  subtitle="Comparative baseline yield"
                  data={comparisonData}
                  metricKey="return1Y"
                  unit="%"
                  isReturn={true}
                />
                <ComparisonBarChart
                  title="Minimum Investment Entry"
                  subtitle="Capital entry requirement"
                  data={comparisonData}
                  metricKey="minInvestment"
                  theme="teal"
                />
              </div>
            )}
          </div>

          {/* 6. Risk Spectrum & 1-Year Return / Yield (Side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Spectrum Visual */}
            <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Risk Spectrum
                  </h4>
                  <span className="text-[11px] text-slate-500">Conservative → Aggressive</span>
                </div>

                {/* Horizontal Spectrum Bar */}
                <div className="relative my-6">
                  <div className="w-full h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-rose-500 opacity-85 shadow-xs" />

                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-semibold">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Low</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Moderate</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> High</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Very High</span>
                  </div>
                </div>
              </div>

              {/* Pinpoint list with colored risk dots */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {comparisonData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${getRiskDotClass(item.risk)}`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-500 shrink-0 ml-2">{item.risk} Risk</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Return Comparison Bar Visual */}
            <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1-Year Return / Yield
                  </h4>
                  <span className="text-[11px] text-slate-500">Historical / Estimated</span>
                </div>

                <div className="space-y-3 my-2">
                  {comparisonData.map((item) => {
                    const maxReturn = Math.max(...comparisonData.map((d) => d.return1Y || 1), 10);
                    const widthPct = Math.min(100, Math.max(12, (item.return1Y / maxReturn) * 100));

                    return (
                      <div key={item.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${getRiskDotClass(item.risk)}`} />
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-500 shrink-0 ml-2">{item.returnDisplay}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Returns based on 1-year historical CAGR or estimated IPO listing premium.
              </p>
            </Card>
          </div>

          {/* 7. Key Differences Summary (2–3 bullet points) */}
          {keyDifferences.length > 0 && (
            <Card className="p-4 sm:p-5 bg-emerald-500/5 dark:bg-slate-900/60 border border-emerald-500/20 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Key Differences at a Glance</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
                {keyDifferences.map((diff, idx) => (
                  <li key={idx} className="font-medium">
                    {diff}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* 8. Regulatory Disclaimer */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center text-center pt-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Comparison is for informational purposes only and is not investment advice.</span>
          </div>
        </div>
      )}
    </div>
  );
}
