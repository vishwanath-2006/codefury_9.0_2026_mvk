import React, { useState, useEffect } from 'react';
import { getSchemeDetails, calculateReturns, isSchemeObsolete } from '../../services/mfService';
import LightweightChart from './LightweightChart';
import SipCalculator from './SipCalculator';
import { X, Calendar, Activity, Info, BarChart3 } from 'lucide-react';
import Badge from './Badge';

export default function MutualFundDetailModal({ isOpen, onClose, schemeCode, schemeName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schemeDetails, setSchemeDetails] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [timeFilter, setTimeFilter] = useState('1Y');

  // Load details dynamically when schemeCode is provided and modal is open
  useEffect(() => {
    if (!isOpen || !schemeCode) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const details = await getSchemeDetails(schemeCode);
        
        // Block discontinued / legacy schemes
        if (isSchemeObsolete(details)) {
          setError('This mutual fund scheme has been suspended or discontinued (no active NAV reported in the last 30 days).');
          setLoading(false);
          return;
        }

        setSchemeDetails(details);
        
        const returns = calculateReturns(details);
        setPerformance(returns);
      } catch (err) {
        console.error('Failed to load mutual fund details:', err);
        setError('Unable to retrieve details for this mutual fund. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, schemeCode]);

  if (!isOpen) return null;

  // Extract expected rate for calculator (defaults to 12% if calculation isn't ready or fails)
  const getExpectedRate = () => {
    if (!performance || performance.return3Yr === 'N/A') return 12;
    const cleanVal = parseFloat(performance.return3Yr);
    return isNaN(cleanVal) ? 12 : cleanVal;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none overflow-y-auto">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 z-10 text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-[85%]">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant="brand" className="text-[10px] uppercase">
                {schemeDetails?.meta?.scheme_category || 'Mutual Fund'}
              </Badge>
              <Badge variant="neutral" className="text-[10px]">
                {schemeDetails?.meta?.scheme_type || 'Open Ended'}
              </Badge>
            </div>
            <h3 className="text-lg font-bold leading-snug">{schemeName || schemeDetails?.meta?.scheme_name}</h3>
            {schemeDetails?.meta?.fund_house && (
              <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">
                Fund House: {schemeDetails.meta.fund_house}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
              <p className="text-xs text-slate-400 font-mono">Fetching latest NAV historical trends...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <Info className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-500 mb-1">{error}</p>
              <button 
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-100 hover:underline"
              >
                Close Window
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Top Section: Metrics & NAV Chart */}
              <div className="space-y-4">
                
                {/* Metrics Summary Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150/40 dark:border-slate-800/40 text-xs">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">Latest NAV</span>
                    <span className="font-mono font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      ₹{schemeDetails?.data?.[0]?.nav || '0.00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">1Y Return</span>
                    <span className={`font-mono font-bold text-sm ${performance?.return1Yr.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {performance?.return1Yr || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">3Y CAGR</span>
                    <span className={`font-mono font-bold text-sm ${performance?.return3Yr.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {performance?.return3Yr || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* NAV Chart Container */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      NAV Performance Trend
                    </span>

                    {/* Chart Filter Selector */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 text-[10px] font-bold">
                      {['1M', '6M', '1Y', 'ALL'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setTimeFilter(filter)}
                          className={`px-2 py-1 rounded-md transition ${
                            timeFilter === filter
                              ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xs'
                              : 'text-slate-400 hover:text-slate-100'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-slate-200/40 dark:border-slate-800/40 p-2">
                    <LightweightChart data={schemeDetails?.data} timeFilter={timeFilter} />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Embedded SIP Simulator */}
              <div className="space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Simulation Wealth Widget</h4>
                </div>
                
                <SipCalculator initialExpectedRate={getExpectedRate()} />
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
