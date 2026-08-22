import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, LineChart, TrendingUp, TrendingDown, RefreshCw, Landmark, Landmark as SectorIcon, Globe, Info } from 'lucide-react';
import LightweightChart from '../components/ui/LightweightChart';

// Quick Switch Tickers List
const WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Oil & Gas / Energy', mcap: '20,15,400 Cr', pe: '24.5', price: 2980.50 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Automotive / EV', mcap: '3,85,600 Cr', pe: '15.2', price: 1012.20 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking / Finance', mcap: '12,65,100 Cr', pe: '18.4', price: 1665.00 },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT Services / Tech', mcap: '7,41,200 Cr', pe: '26.8', price: 1840.10 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking / Finance', mcap: '7,35,400 Cr', pe: '9.8', price: 824.50 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services / Tech', mcap: '15,08,100 Cr', pe: '31.2', price: 4120.25 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking / Finance', mcap: '8,05,300 Cr', pe: '17.8', price: 1150.30 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG / Conglomerate', mcap: '6,10,400 Cr', pe: '28.1', price: 490.40 }
];

// Seedable pseudo-random helper for deterministic trends
const getSeedRandom = (seedString) => {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
};

// Generates daily pricing data compatible with LightweightChart format
const generateStockHistory = (symbol, currentPrice) => {
  const history = [];
  const rand = getSeedRandom(symbol + "_history_v2");
  let price = currentPrice;
  const today = new Date();
  
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Skip weekends
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    const dayStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    
    // Walk price backward
    const change = (rand() - 0.47) * 0.018; // Slight backward downward drift
    price = price * (1 - change);
    
    history.push({
      date: dayStr,
      nav: Number(price.toFixed(2))
    });
  }
  
  return history.reverse();
};

export default function StocksPage() {
  const [search, setSearch] = useState('');
  const [activeSymbol, setActiveSymbol] = useState('RELIANCE');
  const [timeFilter, setTimeFilter] = useState('1Y');
  
  // Real-time states
  const [activePrice, setActivePrice] = useState(2980.50);
  const [priceSource, setPriceSource] = useState('mock_demo');
  const [loading, setLoading] = useState(false);
  const [simAmount, setSimAmount] = useState('10000');

  // Get active metadata
  const activeStock = WATCHLIST.find(s => s.symbol === activeSymbol) || {
    symbol: activeSymbol,
    name: `${activeSymbol} India Limited`,
    sector: 'Equity / Diversified',
    mcap: '1,50,000 Cr',
    pe: '21.0',
    price: activePrice
  };

  // Fetch live price when symbol changes
  useEffect(() => {
    const fetchStockQuote = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/broker/angelone/stock-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            symbol: activeSymbol,
            demo: false
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        if (data && data.ltp) {
          setActivePrice(data.ltp);
          setPriceSource(data.source);
        } else {
          throw new Error('Invalid quote response');
        }
      } catch (err) {
        console.warn(`Live quote fetch failed for ${activeSymbol}, using deterministic mock:`, err);
        // Fallback to local default price
        const fallback = WATCHLIST.find(s => s.symbol === activeSymbol);
        if (fallback) {
          setActivePrice(fallback.price);
        } else {
          // Compute hashed deterministic price
          const charSum = [...activeSymbol].reduce((acc, c) => acc + c.charCodeAt(0), 0);
          const computedPrice = parseFloat(((charSum * 7) % 3500 + 100).toFixed(2));
          setActivePrice(computedPrice);
        }
        setPriceSource('mock_demo_fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchStockQuote();
  }, [activeSymbol]);

  // Generate history based on resolved price
  const history = generateStockHistory(activeSymbol, activePrice);

  // Autocomplete filtering
  const searchResults = search.trim() === '' ? [] : WATCHLIST.filter(
    s => s.symbol.toLowerCase().includes(search.toLowerCase()) || 
         s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockSelect = (symbol) => {
    setActiveSymbol(symbol);
    setSearch('');
  };

  // Day calculations
  const randMeta = getSeedRandom(activeSymbol + "_metadata_seed");
  const changePct = parseFloat(((randMeta() - 0.46) * 4).toFixed(2));
  const changeVal = parseFloat((activePrice * (changePct / 100)).toFixed(2));
  const isPositive = changePct >= 0;

  const dayLow = parseFloat((activePrice * (1 - (randMeta() * 0.015))).toFixed(2));
  const dayHigh = parseFloat((activePrice * (1 + (randMeta() * 0.015))).toFixed(2));
  const w52Low = parseFloat((activePrice * 0.72).toFixed(2));
  const w52High = parseFloat((activePrice * 1.28).toFixed(2));
  const volume = Math.floor(randMeta() * 4000000 + 500000).toLocaleString('en-IN');

  // Simulation calculations
  const amount = Number(simAmount) || 10000;
  const startPrice = history[0]?.nav || (activePrice * 0.85);
  const simGrowth = activePrice / startPrice;
  const simValue = amount * simGrowth;
  const simProfit = simValue - amount;
  const simRoi = ((simGrowth - 1) * 100).toFixed(2);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <PageHeader
        title="Live Stocks & Market Analytics"
        subtitle="Track Indian blue-chips, analyze live market metrics, and simulate growth yields."
        tag="Market Explorer"
      />

      {/* Indices Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800/40">
        <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">NIFTY 50</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">24,541.10</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-500 bg-emerald-500/5">
            <TrendingUp className="w-3.5 h-3.5" />
            +152.20 (+0.62%)
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">SENSEX</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">80,512.80</span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-500 bg-emerald-500/5">
            <TrendingUp className="w-3.5 h-3.5" />
            +512.40 (+0.64%)
          </span>
        </div>
      </div>

      {/* Search & Watchlist Selector */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Watchlist pills */}
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {WATCHLIST.slice(0, 5).map((w) => (
            <button
              key={w.symbol}
              onClick={() => handleStockSelect(w.symbol)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSymbol === w.symbol
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {w.symbol}
            </button>
          ))}
        </div>

        {/* Search Input Autocomplete */}
        <div className="relative w-full md:max-w-xs order-1 md:order-2">
          <Input
            icon={Search}
            placeholder="Search symbol (e.g. TCS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((res) => (
                <button
                  key={res.symbol}
                  onClick={() => handleStockSelect(res.symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{res.symbol}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{res.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded">
                    {res.sector.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Detail, Metrics & Investment Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Chart & Info */}
        <Card className="lg:col-span-2 space-y-6">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                  {activeStock.symbol}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">NSE Exchange</span>
              </div>
              <CardTitle className="text-base sm:text-lg">{activeStock.name}</CardTitle>
              <CardDescription>{activeStock.sector}</CardDescription>
            </div>

            {/* Price badge */}
            <div className="text-left sm:text-right shrink-0">
              {loading ? (
                <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                    ₹{activePrice.toFixed(2)}
                  </div>
                  <div className="flex sm:justify-end mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
                      isPositive ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'
                    }`}>
                      {isPositive ? '+' : ''}₹{changeVal.toFixed(2)} ({isPositive ? '+' : ''}{changePct}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Range Filters & Canvas Chart */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <LineChart className="w-3.5 h-3.5 text-slate-500" />
                  Historical Trend (Source: <span className="font-mono text-emerald-500 uppercase">{priceSource}</span>)
                </span>
                
                {/* Time range switchers */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-150/40 dark:border-slate-850">
                  {['1M', '6M', '1Y', 'ALL'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wider transition ${
                        timeFilter === filter
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive chart container */}
              <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-150/40 dark:border-slate-800/40">
                <LightweightChart data={history} timeFilter={timeFilter} />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-800/40 font-mono">
              <div>
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Day Low</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">₹{dayLow}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Day High</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">₹{dayHigh}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">52W Low</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">₹{w52Low}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">52W High</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">₹{w52High}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">P/E Ratio</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">{activeStock.pe}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Volume</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">{volume}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 col-span-2">
                <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Market Cap (INR)</span>
                <span className="font-bold text-xs text-slate-850 dark:text-slate-200">{activeStock.mcap}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Column: Simulate Investment Widget */}
        <div className="space-y-6">
          
          {/* Simulation Card */}
          <Card className="flex flex-col justify-between h-full">
            <div>
              <CardHeader>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0 w-8 h-8 flex items-center justify-center mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm">Historical Investment Simulator</CardTitle>
                <CardDescription>
                  Compute the return yields of a baseline wealth commitment in {activeStock.symbol} over the last 1 year.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Input Amount */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulation Investment (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
                    <input
                      type="number"
                      placeholder="10,000"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full pl-7.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs focus:border-emerald-500 focus:outline-none transition font-semibold"
                    />
                  </div>
                </div>

                {/* Return Result */}
                <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Value 1 Year Ago</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Value Today</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{formatINR(simValue)}</span>
                  </div>

                  <hr className="border-slate-200/50 dark:border-slate-800/50" />

                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-500">Return (CAGR)</span>
                    <span className={`font-extrabold text-xs flex items-center gap-1 ${simProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {simProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{simProfit >= 0 ? '+' : ''}{simRoi}%</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-500">Net Profit Yield</span>
                    <span className={`font-extrabold text-xs ${simProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {simProfit >= 0 ? '+' : ''}{formatINR(simProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
            
            {/* Disclaimer */}
            <div className="px-5 pb-5 pt-2 text-[10px] text-slate-400 font-medium leading-relaxed flex gap-1.5 items-start bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-900 rounded-b-3xl">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>
                Historical simulation returns are illustrative, based on a linear random walk price backcast. Not formal investment advice.
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
