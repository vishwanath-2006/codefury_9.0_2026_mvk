import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import MutualFundDetailModal from '../components/ui/MutualFundDetailModal';
import {
  Search,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import {
  getAllSchemes,
  filterAndPaginateSchemes
} from '../services/mfService';

export default function MutualFundsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data & Search States
  const [allMasterSchemes, setAllMasterSchemes] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [errorMaster, setErrorMaster] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Modal tracking state
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Large Cap Index', 'Flexi Cap', 'Small Cap', 'Debt'];

  // Load complete master scheme list (37,000+ schemes) on mount
  useEffect(() => {
    let mounted = true;

    async function loadDataset() {
      try {
        setLoadingMaster(true);
        setErrorMaster(null);
        const data = await getAllSchemes();
        if (mounted) {
          setAllMasterSchemes(data || []);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading master mutual funds dataset:', err);
          setErrorMaster('Unable to load master mutual fund registry from AMFI/MFAPI. Please check your network connection.');
        }
      } finally {
        if (mounted) {
          setLoadingMaster(false);
        }
      }
    }

    loadDataset();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle URL search param pre-filling if coming from AI suggestions or other pages
  useEffect(() => {
    const queryParam = searchParams.get('q');
    const categoryParam = searchParams.get('category');
    const schemeCodeParam = searchParams.get('code');

    if (queryParam) setSearch(queryParam);
    if (categoryParam && categories.includes(categoryParam)) setCategoryFilter(categoryParam);

    if (schemeCodeParam) {
      handleOpenSchemeModal({ schemeCode: Number(schemeCodeParam), schemeName: queryParam || 'Selected Mutual Fund' });
    }
  }, [searchParams]);

  // Reset page when search or category filter changes
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  // Memoized filter and pagination across 37,000+ schemes
  const paginatedResult = useMemo(() => {
    if (!allMasterSchemes || allMasterSchemes.length === 0) {
      return { items: [], totalCount: 0, totalPages: 0, hasMore: false };
    }
    return filterAndPaginateSchemes(allMasterSchemes, {
      query: search,
      category: categoryFilter,
      page,
      pageSize: 12
    });
  }, [allMasterSchemes, search, categoryFilter, page]);

  const handleOpenSchemeModal = (scheme) => {
    setSelectedScheme(scheme);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedScheme(null);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-7xl mx-auto">
      <PageHeader
        title="Mutual Funds & SIP Screener"
        subtitle={`Explore ${allMasterSchemes.length > 0 ? allMasterSchemes.length.toLocaleString('en-IN') : '37,000+'} Indian mutual fund schemes with live AMFI data and personalized risk matching.`}
        tag="Investments"
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96 relative">
          <Input
            icon={Search}
            placeholder="Search by scheme or fund house (e.g. Parag, SBI, Quant, Bluechip, Flexi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Master State */}
      {loadingMaster && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Loading All India Mutual Funds Registry...</p>
            <p className="text-xs text-slate-400 font-mono">Indexing 37,000+ schemes from AMFI/MFAPI</p>
          </div>
        </div>
      )}

      {/* Error Master State */}
      {errorMaster && !loadingMaster && (
        <Card className="p-6 border-rose-500/20 bg-rose-500/5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{errorMaster}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Schemes Grid */}
      {!loadingMaster && !errorMaster && paginatedResult.items.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>
              Showing {paginatedResult.items.length} of {paginatedResult.totalCount.toLocaleString('en-IN')} matching schemes
            </span>
            <span>Page {page} of {paginatedResult.totalPages}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedResult.items.map((fund) => (
              <Card key={fund.schemeCode} hover className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge variant="neutral" className="text-[10px]">{fund.category}</Badge>
                        <span className="text-[10px] text-slate-400 font-mono">{fund.fundHouse}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2" title={fund.name}>
                        {fund.name}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Scheme Code</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">#{fund.schemeCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Min SIP</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">₹{fund.minSip}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Risk Rating</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{fund.risk}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {fund.isDirect ? 'Direct Growth' : 'Reg Growth'}
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
            ))}
          </div>

          {/* Load More Pagination Button */}
          {paginatedResult.hasMore && (
            <div className="pt-4 flex flex-col items-center justify-center gap-2">
              <Button
                variant="outline"
                size="md"
                icon={ChevronDown}
                onClick={handleLoadMore}
                className="font-bold px-8"
              >
                Load More Funds ({paginatedResult.totalCount - paginatedResult.items.length} remaining)
              </Button>
              <span className="text-[11px] text-slate-400 font-mono">
                Showing {paginatedResult.items.length} of {paginatedResult.totalCount.toLocaleString()} funds
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loadingMaster && !errorMaster && paginatedResult.items.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Mutual Funds Match Search"
          description={`No schemes match "${search}" under category "${categoryFilter}". Try searching for SBI, Parag, Quant, Bluechip, or Small Cap.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
              }}
            >
              Reset Search & Filters
            </Button>
          }
        />
      )}

      {/* Dynamic Fund Analytics Modal */}
      <MutualFundDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        schemeCode={selectedScheme?.schemeCode}
        schemeName={selectedScheme?.schemeName}
      />
    </div>
  );
}
