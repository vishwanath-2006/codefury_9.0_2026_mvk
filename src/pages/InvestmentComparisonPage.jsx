import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  GitCompare,
  Search,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Building2,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  AlertCircle,
  Activity,
  PieChart,
  Sliders,
  DollarSign,
  Scale
} from 'lucide-react';
import {
  STOCKS_UNIVERSE,
  IPOS_UNIVERSE,
  loadStockComparisonData,
  loadIpoComparisonData,
  getComparisonLeaderCards,
  generateComparisonInsights
} from '../services/comparisonService';
import MultiAssetLineChart from '../components/comparison/MultiAssetLineChart';
import ComparisonBarChart from '../components/comparison/ComparisonBarChart';

export default function InvestmentComparisonPage() {
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks' | 'ipos'

  // Selected tickers / IDs
  const [selectedStocks, setSelectedStocks] = useState(['TCS', 'INFY', 'RELIANCE']);
  const [selectedIpos, setSelectedIpos] = useState(['ipo-1', 'ipo-2', 'ipo-3']);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('1Y'); // '1M' | '6M' | '1Y'
  const [analyticsCategory, setAnalyticsCategory] = useState('returns'); // 'returns' | 'valuation' | 'risk' | 'size' | 'volume'

  // Loaded comparison data & state
  const [comparisonItems, setComparisonItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxWarning, setMaxWarning] = useState(false);

  // Active selections based on tab
  const activeSelectedKeys = activeTab === 'stocks' ? selectedStocks : selectedIpos;

  // Load comparison data whenever active tab or selections change
  const loadComparison = async () => {
    if (activeSelectedKeys.length < 2) {
      setComparisonItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'stocks') {
        const data = await loadStockComparisonData(selectedStocks);
        setComparisonItems(data);
      } else {
        const data = loadIpoComparisonData(selectedIpos);
        setComparisonItems(data);
      }
    } catch (err) {
      console.error('Failed to load comparison data:', err);
      setError('Unable to fetch live market comparison data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [activeTab, selectedStocks, selectedIpos]);

  // Autocomplete search filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    if (activeTab === 'stocks') {
      return STOCKS_UNIVERSE.filter(
        (s) =>
          !selectedStocks.includes(s.symbol) &&
          (s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q))
      );
    } else {
      return IPOS_UNIVERSE.filter(
        (ipo) =>
          !selectedIpos.includes(ipo.id) &&
          !selectedIpos.includes(ipo.symbol) &&
          (ipo.company.toLowerCase().includes(q) ||
            ipo.symbol.toLowerCase().includes(q) ||
            ipo.sector.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, activeTab, selectedStocks, selectedIpos]);

  // Handle adding an item
  const handleAddItem = (item) => {
    if (activeTab === 'stocks') {
      if (selectedStocks.length >= 5) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 3500);
        return;
      }
      if (!selectedStocks.includes(item.symbol)) {
        setSelectedStocks((prev) => [...prev, item.symbol]);
        setSearchQuery('');
      }
    } else {
      if (selectedIpos.length >= 5) {
        setMaxWarning(true);
        setTimeout(() => setMaxWarning(false), 3500);
        return;
      }
      if (!selectedIpos.includes(item.id)) {
        setSelectedIpos((prev) => [...prev, item.id]);
        setSearchQuery('');
      }
    }
  };

  // Handle removing an item
  const handleRemoveItem = (keyToRemove) => {
    if (activeTab === 'stocks') {
      setSelectedStocks((prev) => prev.filter((k) => k !== keyToRemove));
    } else {
      setSelectedIpos((prev) => prev.filter((k) => k !== keyToRemove));
    }
  };

  // Summary leader cards & insights
  const leaderCards = useMemo(() => {
    return getComparisonLeaderCards(activeTab, comparisonItems);
  }, [activeTab, comparisonItems]);

  const insights = useMemo(() => {
    return generateComparisonInsights(activeTab, comparisonItems);
  }, [activeTab, comparisonItems]);

  const formatINR = (val) =>
    val != null
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val)
      : 'N/A';

  // Compute row standouts for subtle neutral highlighting in matrix table
  const rowHighlights = useMemo(() => {
    if (activeTab !== 'stocks' || comparisonItems.length === 0) return {};

    const highest1Y = [...comparisonItems].sort((a, b) => b.return1Y - a.return1Y)[0]?.symbol;
    const lowestPe = [...comparisonItems].filter((i) => i.peRatioNum > 0).sort((a, b) => a.peRatioNum - b.peRatioNum)[0]?.symbol;
    const lowestBeta = [...comparisonItems].sort((a, b) => a.betaNum - b.betaNum)[0]?.symbol;
    const highestMcap = [...comparisonItems].sort((a, b) => b.marketCapNum - a.marketCapNum)[0]?.symbol;

    return { highest1Y, lowestPe, lowestBeta, highestMcap };
  }, [activeTab, comparisonItems]);

  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-16">
      {/* Header */}
      <PageHeader
        title="Investment Comparison Studio"
        subtitle="Professional multi-security comparison platform for Indian equities and IPOs with real-time quotes, valuation metrics, and normalized performance."
        tag="Analytics Platform"
      />

      {/* Mode Selector Tabs & Global Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => {
              setActiveTab('stocks');
              setSearchQuery('');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'stocks'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Direct Equities (NSE)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ipos');
              setSearchQuery('');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ipos'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>IPO Radar</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadComparison}
            disabled={loading || activeSelectedKeys.length < 2}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>Refresh Market Quotes</span>
          </button>
        </div>
      </div>

      {/* Max Selection Alert */}
      {maxWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>You can compare up to 5 investments simultaneously for optimal visual readability.</span>
        </div>
      )}

      {/* Search & Active Selection Studio Bar */}
      <Card className="p-5 space-y-4 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 backdrop-blur-xs shadow-xs">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Search & Select {activeTab === 'stocks' ? 'Stocks' : 'IPOs'} to Compare
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'stocks'
                  ? 'Search securities by company name or ticker (e.g. TCS, Reliance, Infosys, HDFC, Tata Motors)...'
                  : 'Search IPOs by company name, sector, or exchange...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {searchResults.map((item) => (
                <div
                  key={item.symbol || item.id}
                  onClick={() => handleAddItem(item)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{item.symbol}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 dark:text-slate-300 truncate">{item.name || item.company}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sector} · {item.exchange}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.basePrice && (
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₹{item.basePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {item.gmpLabel && (
                      <span className="font-mono font-bold text-purple-400">{item.gmpLabel} GMP</span>
                    )}
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold transition flex items-center gap-1 text-[11px]"
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
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">
              Selected ({activeSelectedKeys.length}/5):
            </span>
            {activeSelectedKeys.map((key) => {
              const matched =
                activeTab === 'stocks'
                  ? STOCKS_UNIVERSE.find((s) => s.symbol === key) || { symbol: key, name: key }
                  : IPOS_UNIVERSE.find((i) => i.id === key || i.symbol === key) || { symbol: key, company: key };

              return (
                <div
                  key={key}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 text-xs font-bold transition group shadow-xs"
                >
                  <span>{matched.symbol || matched.company}</span>
                  <button
                    onClick={() => handleRemoveItem(key)}
                    className="p-0.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {activeSelectedKeys.length < 2 && (
            <span className="text-xs text-amber-500 font-medium">
              Select at least 2 investments to compare
            </span>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Loading market quotes from Angel One SmartAPI...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && activeSelectedKeys.length < 2 && (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <GitCompare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Select Investments to Compare</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add at least 2 {activeTab === 'stocks' ? 'stocks' : 'IPOs'} from the search box above to unlock side-by-side performance charts and valuation metrics.
          </p>
        </div>
      )}

      {/* Main Comparison Body */}
      {!loading && comparisonItems.length >= 2 && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* 1. Comparison Summary Hero Cards */}
          {leaderCards.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Comparison Summary
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Calculated from active cohort
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {leaderCards.map((card, idx) => (
                  <Card
                    key={idx}
                    className="p-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {card.title}
                        </span>
                        <Badge variant="brand" className="text-[10px]">
                          {card.symbol}
                        </Badge>
                      </div>
                      <div className="text-lg font-extrabold font-mono text-slate-900 dark:text-slate-100 mb-1">
                        {card.value}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug pt-2 border-t border-slate-100 dark:border-slate-800">
                      {card.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 2. Selected Securities Overview Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Selected Securities Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {comparisonItems.map((item) => {
                const isPositive = (item.changePct || 0) >= 0;
                return (
                  <Card
                    key={item.symbol || item.id}
                    className="p-4 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {item.symbol}
                        </span>
                        <div className="flex items-center gap-1">
                          {activeTab === 'stocks' && (
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide ${
                                item.isLive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {item.isLive ? 'LIVE ●' : 'BENCHMARK'}
                            </span>
                          )}
                          <Badge variant="default" className="text-[10px]">
                            {item.exchange || 'NSE'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mb-3">{item.name}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                      {activeTab === 'stocks' ? (
                        <>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            {formatINR(item.currentPrice)}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold flex items-center ${
                              isPositive ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {item.changePct}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                            {item.priceBand}
                          </span>
                          <span className="text-xs font-mono font-bold text-purple-400">
                            {item.gmpLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 3. Performance & Relative Benchmarking Chart (Stocks Mode) */}
          {activeTab === 'stocks' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Relative Normalized Performance Chart
                  </h3>
                  <p className="text-xs text-slate-400">
                    All securities normalized to Base = 100 at the start of the timeframe to compare relative capital return.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  {['1M', '6M', '1Y'].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeFilter(tf)}
                      className={`px-3.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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

              {/* Multi-asset Canvas Line Chart */}
              <Card className="p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/70">
                <MultiAssetLineChart items={comparisonItems} timeFilter={timeFilter} />
              </Card>

              {/* 4. Visual Analytics Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Visual Analytics Breakdown
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                    <button
                      onClick={() => setAnalyticsCategory('returns')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        analyticsCategory === 'returns' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Returns
                    </button>
                    <button
                      onClick={() => setAnalyticsCategory('valuation')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        analyticsCategory === 'valuation' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Valuation
                    </button>
                    <button
                      onClick={() => setAnalyticsCategory('risk')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        analyticsCategory === 'risk' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Risk & Volatility
                    </button>
                    <button
                      onClick={() => setAnalyticsCategory('size')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        analyticsCategory === 'size' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Size & Volume
                    </button>
                  </div>
                </div>

                {/* Switchable Analytics View */}
                {analyticsCategory === 'returns' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ComparisonBarChart
                      title="1-Month Return (%)"
                      subtitle="Short-term price momentum"
                      data={comparisonItems}
                      metricKey="return1M"
                      unit="%"
                      isReturn={true}
                    />
                    <ComparisonBarChart
                      title="6-Month Return (%)"
                      subtitle="Medium-term trend"
                      data={comparisonItems}
                      metricKey="return6M"
                      unit="%"
                      isReturn={true}
                    />
                    <ComparisonBarChart
                      title="1-Year Return (%)"
                      subtitle="Annualized performance"
                      data={comparisonItems}
                      metricKey="return1Y"
                      unit="%"
                      isReturn={true}
                    />
                  </div>
                )}

                {analyticsCategory === 'valuation' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComparisonBarChart
                      title="Price-to-Earnings Ratio (P/E)"
                      subtitle="Lower ratio indicates cheaper multiple relative to earnings"
                      data={comparisonItems}
                      metricKey="peRatioNum"
                      unit="x"
                      isReturn={false}
                      theme="indigo"
                    />
                    <ComparisonBarChart
                      title="Price-to-Book Ratio (P/B)"
                      subtitle="Valuation relative to net asset balance sheet value"
                      data={comparisonItems}
                      metricKey="pbRatioNum"
                      unit="x"
                      isReturn={false}
                      theme="teal"
                    />
                  </div>
                )}

                {analyticsCategory === 'risk' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComparisonBarChart
                      title="Beta (Market Sensitivity)"
                      subtitle="Beta < 1.0 indicates lower volatility than Nifty 50 benchmark"
                      data={comparisonItems}
                      metricKey="betaNum"
                      unit=""
                      prefix="β "
                      isReturn={false}
                      theme="amber"
                    />
                    <ComparisonBarChart
                      title="1-Year Return Volatility Spread (%)"
                      subtitle="Annual return variation across selected peers"
                      data={comparisonItems}
                      metricKey="return1Y"
                      unit="%"
                      isReturn={true}
                    />
                  </div>
                )}

                {analyticsCategory === 'size' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ComparisonBarChart
                      title="Market Capitalization (₹ Cr)"
                      subtitle="Total company equity valuation on Indian exchanges"
                      data={comparisonItems}
                      metricKey="marketCapNum"
                      unit=" Cr"
                      prefix="₹"
                      isReturn={false}
                      theme="indigo"
                    />
                    <ComparisonBarChart
                      title="Daily Trading Volume (Shares)"
                      subtitle="Daily market liquidity on National Stock Exchange"
                      data={comparisonItems}
                      metricKey="volumeNum"
                      unit=""
                      isReturn={false}
                      theme="teal"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Charts Section (IPO Mode) */}
          {activeTab === 'ipos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComparisonBarChart
                title="Grey Market Premium (GMP %)"
                subtitle="Expected listing day gain premium based on grey market trades"
                data={comparisonItems}
                metricKey="gmpPct"
                unit="%"
                isReturn={true}
              />
              <ComparisonBarChart
                title="Public Offering Issue Size (₹ Cr)"
                subtitle="Total capital raised in the primary market offering"
                data={comparisonItems}
                metricKey="issueSizeNum"
                unit=" Cr"
                prefix="₹"
                isReturn={false}
                theme="indigo"
              />
            </div>
          )}

          {/* 5. Detailed Comparison Matrix Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Detailed Comparison Matrix
              </h3>
              <span className="text-xs text-slate-400">
                Subtle highlight indicates cohort leader for each metric
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4 min-w-[200px]">Metric / Parameter</th>
                    {comparisonItems.map((item) => (
                      <th key={item.symbol || item.id} className="p-4 min-w-[140px] font-bold text-slate-800 dark:text-slate-200">
                        {item.symbol || item.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {/* STOCKS TABLE ROWS */}
                  {activeTab === 'stocks' && (
                    <>
                      {/* Section: Basic Info */}
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={comparisonItems.length + 1} className="p-3 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                          1. Price & Daily Performance
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Current Market Price (LTP)</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatINR(i.currentPrice)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Day Change (₹ / %)</td>
                        {comparisonItems.map((i) => {
                          const isPos = (i.changePct || 0) >= 0;
                          return (
                            <td key={i.symbol} className={`p-4 font-mono font-bold ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isPos ? '+' : ''}{i.dayChange} ({isPos ? '+' : ''}{i.changePct}%)
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Previous Close</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-slate-700 dark:text-slate-300">
                            {formatINR(i.prevClose)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Day High / Low Range</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-slate-700 dark:text-slate-300">
                            {formatINR(i.dayLow)} – {formatINR(i.dayHigh)}
                          </td>
                        ))}
                      </tr>

                      {/* Section: Valuation Multiples */}
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={comparisonItems.length + 1} className="p-3 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                          2. Valuation & Fundamentals
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Market Capitalization</td>
                        {comparisonItems.map((i) => {
                          const isLead = i.symbol === rowHighlights.highestMcap;
                          return (
                            <td key={i.symbol} className={`p-4 font-mono font-bold ${isLead ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-800 dark:text-slate-200'}`}>
                              {i.marketCap} {isLead && '★'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">P/E Ratio (Price / Earnings)</td>
                        {comparisonItems.map((i) => {
                          const isLead = i.symbol === rowHighlights.lowestPe;
                          return (
                            <td key={i.symbol} className={`p-4 font-mono font-bold ${isLead ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-800 dark:text-slate-200'}`}>
                              {i.peRatio}x {isLead && '★'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">P/B Ratio (Price / Book)</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-slate-700 dark:text-slate-300">
                            {i.pbRatio}x
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Dividend Yield</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {i.divYield}
                          </td>
                        ))}
                      </tr>

                      {/* Section: Historical Performance */}
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={comparisonItems.length + 1} className="p-3 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                          3. Historical Returns
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">1-Month Return</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className={`p-4 font-mono font-bold ${i.return1M >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {i.return1M >= 0 ? '+' : ''}{i.return1M}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">6-Month Return</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className={`p-4 font-mono font-bold ${i.return6M >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {i.return6M >= 0 ? '+' : ''}{i.return6M}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">1-Year Return</td>
                        {comparisonItems.map((i) => {
                          const isLead = i.symbol === rowHighlights.highest1Y;
                          return (
                            <td key={i.symbol} className={`p-4 font-mono font-bold ${isLead ? 'text-emerald-400 bg-emerald-500/5' : i.return1Y >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {i.return1Y >= 0 ? '+' : ''}{i.return1Y}% {isLead && '★'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">52-Week High / Low</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-slate-700 dark:text-slate-300">
                            {formatINR(i.w52Low)} / {formatINR(i.w52High)}
                          </td>
                        ))}
                      </tr>

                      {/* Section: Risk & Volatility */}
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={comparisonItems.length + 1} className="p-3 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[10px]">
                          4. Trading Volume & Volatility
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Beta (Market Volatility)</td>
                        {comparisonItems.map((i) => {
                          const isLead = i.symbol === rowHighlights.lowestBeta;
                          return (
                            <td key={i.symbol} className={`p-4 font-mono font-bold ${isLead ? 'text-teal-400 bg-teal-500/5' : 'text-slate-800 dark:text-slate-200'}`}>
                              {i.beta} {isLead && '★'}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Daily Trading Volume</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 font-mono text-slate-700 dark:text-slate-300">
                            {i.volume} shares
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Sector / Industry</td>
                        {comparisonItems.map((i) => (
                          <td key={i.symbol} className="p-4 text-slate-800 dark:text-slate-200 font-medium">
                            {i.sector}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {/* IPOS TABLE ROWS */}
                  {activeTab === 'ipos' && (
                    <>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">IPO Status</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4">
                            <Badge variant={i.status === 'Open Now' ? 'success' : i.status === 'Upcoming' ? 'purple' : 'info'}>
                              {i.status}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Grey Market Premium (GMP)</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 font-mono font-bold text-purple-400">
                            {i.gmpLabel}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Price Band</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {i.priceBand}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Total Issue Size</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {i.issueSize}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Subscription Demand</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 font-mono text-emerald-500 font-bold">
                            {i.subscription}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Min. Lot Investment</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 font-mono text-slate-800 dark:text-slate-200">
                            {i.minInvestment} ({i.lotSize})
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Subscription Dates</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 text-slate-700 dark:text-slate-300">
                            {i.dates}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Sector / Category</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 text-slate-800 dark:text-slate-200">
                            {i.sector}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-semibold text-slate-500">Suitability Indicator</td>
                        {comparisonItems.map((i) => (
                          <td key={i.id} className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">
                            {i.suitability}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. "What stands out?" Insights Section */}
          {insights.length > 0 && (
            <Card className="p-5 border border-emerald-500/25 bg-slate-900/60 backdrop-blur-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">What stands out?</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {insights.map((ins, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{ins.title}</span>
                      <Badge variant="brand" className="text-[10px]">
                        {ins.badge}
                      </Badge>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{ins.detail}</p>
                  </div>
                ))}
              </div>

              {/* Transparency & Regulatory Disclaimer */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Based on the selected metrics. Data-driven comparison for informational and analytical purposes only. Not investment advice.</span>
                </div>
                <span className="font-mono text-slate-400">
                  Historical normalized trends · Real-time LTP via Angel One
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
