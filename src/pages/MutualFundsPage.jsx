import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import MutualFundDetailModal from '../components/ui/MutualFundDetailModal';
import {
  Search,
  TrendingUp,
  Star,
  ArrowUpRight,
  Calculator,
  Shield,
  PieChart,
  Activity,
  Sparkles,
  Info,
  Loader2,
  X
} from 'lucide-react';
import { searchSchemes, getSchemeDetails, calculateReturns } from '../services/mfService';
import { mockMutualFunds } from '../mock/finlabsMockData';
import { useOnboarding } from '../context/OnboardingContext';

function getRiskSuitabilityBadge(userRiskScore, fundRisk) {
  const riskStr = (fundRisk || '').toLowerCase();
  const isHighRisk = riskStr.includes('very high') || riskStr.includes('small cap') || riskStr.includes('high');

  if (userRiskScore === 1 && isHighRisk) {
    return { label: 'Low Suitability (High Volatility)', bg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20' };
  }
  if (userRiskScore === 3 && (isHighRisk || riskStr.includes('equity'))) {
    return { label: 'High Growth Match', bg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' };
  }
  return { label: 'Optimal Match (Balanced)', bg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
}

function formatMFDateToDisplay(dateStr) {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[2];
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${day}-${months[monthIdx]}-${year}`;
  }
  return dateStr;
}

const POPULAR_FUNDS = [
  {
    schemeCode: 122639,
    id: "pp_flexicap",
    name: "Parag Parikh Flexi Cap Fund - Direct Growth",
    fundHouse: "PPFAS Mutual Fund",
    category: "Flexi Cap",
    rating: 5,
    nav: "₹90.74",
    cagr1Yr: "22.8%",
    cagr3Yr: "18.45%",
    cagr5Yr: "21.5%",
    minSip: 1000,
    risk: "Very High",
    expenseRatio: "0.58%",
    aum: "₹62,100 Cr",
    exitLoad: "2% if redeemed within 365 days",
    sharpeRatio: "1.48",
    suitability: "High Risk Matching",
    sectors: [
      { name: "Financial Services", pct: 28.4 },
      { name: "IT & US Tech Titans", pct: 19.2 },
      { name: "Automobile", pct: 12.1 },
      { name: "Capital Goods", pct: 8.9 },
      { name: "FMCG", pct: 7.5 }
    ]
  },
  {
    schemeCode: 120847,
    id: "quant_smallcap",
    name: "Quant Small Cap Fund - Direct Growth",
    fundHouse: "Quant Mutual Fund",
    category: "Small Cap",
    rating: 5,
    nav: "₹250.45",
    cagr1Yr: "34.2%",
    cagr3Yr: "28.12%",
    cagr5Yr: "31.2%",
    minSip: 500,
    risk: "Very High",
    expenseRatio: "0.77%",
    aum: "₹21,400 Cr",
    exitLoad: "1% if redeemed within 15 days",
    sharpeRatio: "1.62",
    suitability: "High Risk Matching",
    sectors: [
      { name: "Energy & Power", pct: 19.8 },
      { name: "Financial Services", pct: 17.4 },
      { name: "Metals & Mining", pct: 15.1 },
      { name: "Healthcare", pct: 12.6 },
      { name: "Infrastructure", pct: 10.2 }
    ]
  },
  {
    schemeCode: 119018,
    id: "hdfc_top100",
    name: "HDFC Top 100 Fund - Direct Growth",
    fundHouse: "HDFC Mutual Fund",
    category: "Large Cap Index",
    rating: 4,
    nav: "₹125.40",
    cagr1Yr: "19.5%",
    cagr3Yr: "15.40%",
    cagr5Yr: "16.8%",
    minSip: 500,
    risk: "Above Average",
    expenseRatio: "0.45%",
    aum: "₹34,250 Cr",
    exitLoad: "1% if redeemed within 30 days",
    sharpeRatio: "1.32",
    suitability: "Moderate Risk Matching",
    sectors: [
      { name: "Financial Services", pct: 32.4 },
      { name: "Information Technology", pct: 13.8 },
      { name: "Energy & Power", pct: 12.5 },
      { name: "Consumer Goods", pct: 8.9 },
      { name: "Automobile & Auto", pct: 7.2 }
    ]
  }
];

export default function MutualFundsPage() {
  const { userProfile } = useOnboarding();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchLoading, setSearchLoading] = useState(false);
  const [liveApiResults, setLiveApiResults] = useState([]);

  // Modal tracking
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Large Cap Index', 'Flexi Cap', 'Small Cap', 'Debt'];
  const [searchParams, setSearchParams] = useSearchParams();

  // Watch URL params for auto-open (e.g. from global header search)
  useEffect(() => {
    const selectCode = searchParams.get('selectCode');
    const selectName = searchParams.get('selectName');
    if (selectCode) {
      setSelectedScheme({
        schemeCode: Number(selectCode),
        schemeName: selectName ? decodeURIComponent(selectName) : 'Mutual Fund Details'
      });
      setIsModalOpen(true);

      const newParams = new URLSearchParams(searchParams);
      newParams.delete('selectCode');
      newParams.delete('selectName');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Live MFapi search effect with active status parallel verification check
  useEffect(() => {
    const trimmed = search.trim().toLowerCase();
    if (trimmed.length < 3) {
      setLiveApiResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        let results = [];
        const popularAMCs = ['sbi', 'hdfc', 'axis', 'quant', 'icici', 'nippon', 'kotak', 'tata', 'mirae', 'uti', 'dsp', 'ppfas', 'parag'];
        
        if (popularAMCs.includes(trimmed)) {
          const subQueries = [
            `${trimmed} direct growth`,
            `${trimmed} small`,
            `${trimmed} blue`,
            `${trimmed} flexi`
          ];
          const queryResList = await Promise.all(
            subQueries.map(q => searchSchemes(q).catch(() => []))
          );
          const seen = new Set();
          for (const list of queryResList) {
            for (const item of list) {
              if (!seen.has(item.schemeCode)) {
                seen.add(item.schemeCode);
                results.push(item);
              }
            }
          }
        } else {
          results = await searchSchemes(trimmed);
        }
        
        const filtered = (results || []).filter(item => {
          const name = item.schemeName.toLowerCase();
          const isGrowth = name.includes('growth');
          const isObsoleteOrRegular = name.includes('regular') || name.includes('dividend') || name.includes('idcw') || name.includes('payout') || name.includes('reinvestment') || name.includes('legacy') || name.includes('discontinued') || name.includes('suspended') || name.includes('fmp') || name.includes('institutional') || name.includes('premium') || name.includes('retail');
          return isGrowth && !isObsoleteOrRegular;
        });

        const sorted = filtered.sort((a, b) => {
          const aName = a.schemeName.toLowerCase();
          const bName = b.schemeName.toLowerCase();
          const aDG = aName.includes('direct') && aName.includes('growth');
          const bDG = bName.includes('direct') && bName.includes('growth');
          if (aDG && !bDG) return -1;
          if (!aDG && bDG) return 1;
          return 0;
        });

        const topCandidates = sorted.slice(0, 5);
        const activeResults = [];

        await Promise.all(
          topCandidates.map(async (item) => {
            try {
              const latestRes = await fetch(`https://api.mfapi.in/mf/${item.schemeCode}/latest`);
              if (!latestRes.ok) return;
              const latestJson = await latestRes.json();
              const latestItem = latestJson?.data?.[0];
              if (!latestItem || !latestItem.date || !latestItem.nav || Number(latestItem.nav) <= 0) return;
              
              const parseDateParts = latestItem.date.split('-');
              const latestDate = new Date(Number(parseDateParts[2]), Number(parseDateParts[1]) - 1, Number(parseDateParts[0]));
              const diffDays = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
              
              if (diffDays <= 30) {
                let category = 'Flexi Cap';
                const lowerName = item.schemeName.toLowerCase();
                if (lowerName.includes('index') || lowerName.includes('nifty') || lowerName.includes('sensex')) {
                  category = 'Large Cap Index';
                } else if (lowerName.includes('small')) {
                  category = 'Small Cap';
                } else if (lowerName.includes('debt') || lowerName.includes('gilt') || lowerName.includes('liquid')) {
                  category = 'Debt';
                }

                activeResults.push({
                  schemeCode: item.schemeCode,
                  schemeName: item.schemeName,
                  category,
                  suitability: category === 'Small Cap' ? 'High Risk Matching' : 'Moderate Risk Matching',
                  risk: category === 'Small Cap' ? 'Very High' : 'Above Average',
                  minSip: 500,
                  rating: 4,
                  cagr3Yr: 'Live NAV',
                  nav: Number(latestItem.nav).toFixed(2),
                  navDate: formatMFDateToDisplay(latestItem.date)
                });
              }
            } catch (err) {
              console.warn('Fuzzy check latest NAV failed for:', item.schemeCode, err);
            }
          })
        );

        setLiveApiResults(activeResults);
      } catch (err) {
        console.error('Live MF search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const filterLocalFunds = (funds, query, category) => {
    const trimmed = query.trim().toLowerCase();

    return funds.filter((fund) => {
      const matchesCategory =
        category === 'All' ||
        fund.category.toLowerCase().includes(category.toLowerCase());

      if (!matchesCategory) return false;
      if (!trimmed) return true;

      const searchableText = `${fund.name} ${fund.category} ${fund.fundHouse || ''} ${fund.risk || ''}`.toLowerCase();
      const tokens = trimmed.split(/\s+/).filter(Boolean);

      return tokens.every((token) => {
        if (searchableText.includes(token)) return true;
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

  const filteredLocalFunds = filterLocalFunds(POPULAR_FUNDS, search, categoryFilter);

  const handleOpenSchemeModal = (scheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScheme(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-7xl mx-auto">
      <PageHeader
        title="Mutual Funds & SIP Screener"
        subtitle="Explore top-performing index, equity, hybrid, and debt funds with personalized risk matching."
        tag="Investments"
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96 relative">
          <Input
            icon={Search}
            placeholder="Search by name, fund house (e.g. Parag, SBI, Quant, Bluechip, Flexi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchLoading && (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
          )}
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

      {/* Popular / Curated Funds Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Featured & Popular Schemes
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredLocalFunds.length} Funds
          </span>
        </div>

        {filteredLocalFunds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocalFunds.map((fund) => {
              const matchBadge = getRiskSuitabilityBadge(userProfile.riskScore, fund.risk);
              return (
                <Card key={fund.id} hover className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="neutral" className="text-[10px]">{fund.category}</Badge>
                          <span className="text-[10px] text-slate-400 font-mono">{fund.fundHouse}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">{fund.name}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${matchBadge.bg}`}>
                        {matchBadge.label}
                      </span>
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
                      onClick={() => handleOpenSchemeModal({ schemeCode: fund.schemeCode, schemeName: fund.name })}
                    >
                      Fund Analytics
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : liveApiResults.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Mutual Funds Found"
            description={`No mutual funds match "${search}". Try searching for SBI, Parag, Quant, Bluechip, or Small Cap.`}
            action={
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategoryFilter('All'); }}>
                Reset Search
              </Button>
            }
          />
        ) : null}
      </div>

      {/* Live AMFI Search Results Section */}
      {liveApiResults.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Live AMFI Search Results ({liveApiResults.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveApiResults.map((item) => (
              <div
                key={item.schemeCode}
                onClick={() => handleOpenSchemeModal({ schemeCode: item.schemeCode, schemeName: item.schemeName })}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold block">CODE: {item.schemeCode}</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition line-clamp-1">
                    {item.schemeName}
                  </h4>
                  {item.nav && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      NAV: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{item.nav}</span> {item.navDate && `(as of ${item.navDate})`}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="xs" icon={ArrowUpRight}>
                  Analytics
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Fund Analytics Modal */}
      {selectedScheme && (
        <MutualFundDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          schemeCode={selectedScheme.schemeCode}
          schemeName={selectedScheme.schemeName}
        />
      )}
    </div>
  );
}
