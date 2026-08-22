import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Menu, Sun, Moon, Search, Sparkles, LogOut, Loader2, ArrowRight, Zap } from 'lucide-react';
import Badge from '../ui/Badge';
import { searchSchemes } from '../../services/mfService';

const SEARCHABLE_PAGES = [
  { name: 'SIP & Wealth Simulator', path: '/tools/sip-calculator', category: 'Tools / Calculators' },
  { name: 'Investment Comparison Matrix', path: '/tools/investment-comparison', category: 'Tools / Calculators' },
  { name: 'Risk Suitability Profiler', path: '/tools/suitability', category: 'Tools / Calculators' },
  { name: 'Mutual Funds & SIP Screener', path: '/investments/mutual-funds', category: 'Investment Products' },
  { name: 'Stocks Allocation Screener', path: '/investments/stocks', category: 'Investment Products' },
  { name: 'IPO Opportunities Center', path: '/investments/ipos', category: 'Investment Products' },
  { name: 'Expenses & Budget Tracker', path: '/expenses', category: 'Personal Finance' },
  { name: 'Financial Goals Planner', path: '/goals', category: 'Personal Finance' },
  { name: 'Asset Allocation Portfolio', path: '/portfolio', category: 'Personal Finance' },
  { name: 'Financial Health Diagnostics', path: '/financial-health', category: 'Personal Finance' },
  { name: 'SmartWealth AI Agent Chat', path: '/ai', category: 'AI Intelligence' },
  { name: 'Edit Profile & Settings', path: '/profile', category: 'Settings' }
];

export default function Header({ onOpenSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, logout, isDevTestMode, disableDevTestMode } = useAuth();
  const { formData } = useOnboarding();
  const navigate = useNavigate();

  // Search Engine States
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mfResults, setMfResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults([]);
      setMfResults([]);
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);

    // Filter local navigation pages
    const pageMatches = SEARCHABLE_PAGES.filter(
      (item) => item.name.toLowerCase().includes(trimmed) || item.category.toLowerCase().includes(trimmed)
    );
    setSearchResults(pageMatches);

    // Search live Mutual Funds via mfService if length >= 3
    if (trimmed.length >= 3) {
      setLoading(true);
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

          // Filter out regular, dividend, idcw, legacy, payout, and discontinued schemes
          const filtered = (results || []).filter(item => {
            const name = item.schemeName.toLowerCase();
            const isGrowth = name.includes('growth');
            const isObsoleteOrRegular = name.includes('regular') || name.includes('dividend') || name.includes('idcw') || name.includes('payout') || name.includes('reinvestment') || name.includes('legacy') || name.includes('discontinued') || name.includes('suspended') || name.includes('fmp') || name.includes('institutional') || name.includes('premium') || name.includes('retail');
            return isGrowth && !isObsoleteOrRegular;
          });

          // Prioritize active "Direct Plan - Growth" or "Growth" schemes
          const sorted = filtered.sort((a, b) => {
            const aName = a.schemeName.toLowerCase();
            const bName = b.schemeName.toLowerCase();
            const aDG = aName.includes('direct') && aName.includes('growth');
            const bDG = bName.includes('direct') && bName.includes('growth');
            if (aDG && !bDG) return -1;
            if (!aDG && bDG) return 1;
            return 0;
          });

          setMfResults(sorted.slice(0, 5)); // top 5 schemes
        } catch (err) {
          console.error('Header search error:', err);
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setMfResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleSelectPage = (path) => {
    setShowDropdown(false);
    setQuery('');
    navigate(path);
  };

  const handleSelectMF = (schemeCode, schemeName) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/investments/mutual-funds?selectCode=${schemeCode}&selectName=${encodeURIComponent(schemeName)}`);
  };

  const getInitials = (name) => {
    if (!name) return 'FL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || formData?.fullName || user?.user_metadata?.full_name || 'FinLabs User';
  const displayEmail = user?.email || 'authenticated.user@finlabs.io';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-48 sm:w-80" ref={dropdownRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
              placeholder="Search apps, funds (e.g. Parag, SBI)..."
              className="w-full bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs rounded-xl pl-9 pr-8 py-2 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition"
            />
            {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
          </div>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              {/* App Pages Matches */}
              {searchResults.length > 0 && (
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 mb-1.5">Navigation Features</span>
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleSelectPage(item.path)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mutual Funds Live Matches */}
              {mfResults.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 mb-1.5">Mutual Funds (Live AMFI)</span>
                  <div className="space-y-1">
                    {mfResults.map((fund) => (
                      <button
                        key={fund.schemeCode}
                        onClick={() => handleSelectMF(fund.schemeCode, fund.schemeName)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <span className="truncate pr-2">{fund.schemeName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && mfResults.length === 0 && !loading && (
                <div className="py-4 text-center text-xs text-slate-400 font-mono">
                  No matching apps or schemes found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dev Test Mode Badge */}
        {isDevTestMode && (
          <button
            onClick={() => {
              disableDevTestMode();
              navigate('/login');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 transition"
            title="Dev Test Mode Active. Click to exit."
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>DEV TEST MODE</span>
          </button>
        )}

        {/* Glowing Animated Border Onboarding Button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="relative group p-[2px] rounded-xl overflow-hidden shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-transform active:scale-95 shrink-0"
          title="Complete your 2-minute FinLabs financial onboarding"
        >
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#10b981_0%,#06b6d4_25%,#6366f1_50%,#ec4899_75%,#10b981_100%)] opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-slate-950 dark:bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase group-hover:bg-slate-900/90 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>COMPLETE ONBOARDING</span>
          </span>
        </button>

        <Badge variant="brand" className="hidden sm:inline-flex gap-1 text-[10px]">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          FinLabs v1.0
        </Badge>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
            {getInitials(displayName)}
          </div>
          <div className="hidden sm:block text-left text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 block leading-none">{displayName}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px] block mt-0.5">{displayEmail}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
