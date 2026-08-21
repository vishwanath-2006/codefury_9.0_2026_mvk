import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Star, ArrowUpRight, TrendingUp, Info } from 'lucide-react';
import { searchSchemes, getSchemeDetails, calculateReturns } from '../services/mfService';
import MutualFundDetailModal from '../components/ui/MutualFundDetailModal';

const POPULAR_FUNDS = [
  {
    schemeCode: 122639,
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Growth',
    category: 'Flexi Cap',
    suitability: 'High Risk Matching',
    risk: 'Very High',
    minSip: 1000,
    rating: 5,
    cagr3Yr: '18.45%'
  },
  {
    schemeCode: 120847,
    schemeName: 'Quant Small Cap Fund - Direct Growth',
    category: 'Small Cap',
    suitability: 'High Risk Matching',
    risk: 'Very High',
    minSip: 500,
    rating: 5,
    cagr3Yr: '28.12%'
  },
  {
    schemeCode: 119063,
    schemeName: 'HDFC Index Fund - Nifty 50 Plan - Direct Growth',
    category: 'Large Cap Index',
    suitability: 'Moderate Risk Matching',
    risk: 'Above Average',
    minSip: 100,
    rating: 4,
    cagr3Yr: '14.20%'
  },
  {
    schemeCode: 119777,
    schemeName: 'SBI Bluechip Fund - Direct Growth',
    category: 'Large Cap Index',
    suitability: 'Moderate Risk Matching',
    risk: 'Above Average',
    minSip: 500,
    rating: 4,
    cagr3Yr: '13.92%'
  }
];

export default function MutualFundsPage() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularFundsWithLiveData, setPopularFundsWithLiveData] = useState(POPULAR_FUNDS);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Modal tracking
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Large Cap Index', 'Flexi Cap', 'Small Cap', 'Debt'];

  // Load actual live returns for popular funds on mount
  useEffect(() => {
    async function loadPopularLiveReturns() {
      try {
        const updated = await Promise.all(
          POPULAR_FUNDS.map(async (fund) => {
            try {
              const details = await getSchemeDetails(fund.schemeCode);
              const returns = calculateReturns(details);
              return {
                ...fund,
                cagr3Yr: returns.return3Yr
              };
            } catch (err) {
              console.error(`Failed to load live return for popular fund ${fund.schemeCode}:`, err);
              return fund;
            }
          })
        );
        setPopularFundsWithLiveData(updated);
      } catch (err) {
        console.error('Failed to load popular funds live returns:', err);
      }
    }

    loadPopularLiveReturns();
  }, []);

  // Debounced live searching
  useEffect(() => {
    if (search.trim().length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchSchemes(search);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400); // 400ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Determine what list to show in grid
  const getDisplayFunds = () => {
    if (search.trim().length >= 3) {
      return searchResults.map((item) => {
        // Enforce category labeling based on search result name keywords
        let category = 'Flexi Cap';
        if (item.schemeName.toLowerCase().includes('index') || item.schemeName.toLowerCase().includes('nifty') || item.schemeName.toLowerCase().includes('sensex')) {
          category = 'Large Cap Index';
        } else if (item.schemeName.toLowerCase().includes('small')) {
          category = 'Small Cap';
        } else if (item.schemeName.toLowerCase().includes('debt') || item.schemeName.toLowerCase().includes('gilt') || item.schemeName.toLowerCase().includes('liquid')) {
          category = 'Debt';
        }
        
        return {
          schemeCode: item.schemeCode,
          schemeName: item.schemeName,
          category,
          suitability: category === 'Small Cap' ? 'High Risk Matching' : 'Moderate Risk Matching',
          risk: category === 'Small Cap' ? 'Very High' : 'Above Average',
          minSip: 500,
          rating: 4,
          cagr3Yr: 'Live NAV'
        };
      });
    }

    // Filter popular default list
    return popularFundsWithLiveData.filter((fund) => {
      return categoryFilter === 'All' || fund.category === categoryFilter;
    });
  };

  const displayFunds = getDisplayFunds();

  const handleOpenFund = (scheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedScheme(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Mutual Funds & SIP Screener"
        subtitle="Explore top-performing index, equity, hybrid, and debt funds with personalized risk matching."
        tag="Investments"
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Type query to search live (e.g. Parag, SBI)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories filters only make sense when not live searching */}
        {search.trim().length < 3 && (
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
        )}
      </div>

      {/* Loading state for search */}
      {searchLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
          <p className="text-xs text-slate-400 font-mono">Searching Indian Mutual Fund API...</p>
        </div>
      ) : (
        <>
          {displayFunds.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto">
              <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No mutual funds found</p>
              <p className="text-xs text-slate-500">Try searching for other terms like 'SBI', 'Nifty', or 'HDFC'</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayFunds.map((fund) => (
                <Card
                  key={fund.schemeCode}
                  hover
                  className="p-5 flex flex-col justify-between cursor-pointer select-none active:scale-[0.99] transition-transform"
                  onClick={() => handleOpenFund(fund)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="max-w-[75%]">
                        <Badge variant="neutral" className="mb-1 text-[9px]">{fund.category}</Badge>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">{fund.schemeName}</h3>
                      </div>
                      <Badge variant="brand" className="text-[9px] font-bold shrink-0">{fund.suitability}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">3Y CAGR</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{fund.cagr3Yr}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">Min SIP</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">₹{fund.minSip}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">Risk Rating</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{fund.risk}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {fund.rating} / 5 Rating
                    </span>
                    <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right" onClick={(e) => { e.stopPropagation(); handleOpenFund(fund); }}>
                      Fund Analytics
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Mutual Fund Details and Charting Modal */}
      <MutualFundDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schemeCode={selectedScheme?.schemeCode}
        schemeName={selectedScheme?.schemeName}
      />
    </div>
  );
}
