import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Menu, Sun, Moon, Search, Sparkles, LogOut, Loader2, ArrowRight } from 'lucide-react';
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
  const { user, profile, logout } = useAuth();
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

  // Filter routes and query live Mutual Funds
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setMfResults([]);
      setLoading(false);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Local routes matching
    const filteredPages = SEARCHABLE_PAGES.filter(page =>
      page.name.toLowerCase().includes(cleanQuery) ||
      page.category.toLowerCase().includes(cleanQuery)
    );
    setSearchResults(filteredPages);

    // 2. Live Mutual Fund API matching (minimum 3 chars)
    if (cleanQuery.length >= 3) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const mfs = await searchSchemes(cleanQuery);
          
          // Prioritize active direct growth schemes
          const sorted = [...(mfs || [])].sort((a, b) => {
            const aName = a.schemeName.toLowerCase();
            const bName = b.schemeName.toLowerCase();
            const aDG = aName.includes('direct') && aName.includes('growth');
            const bDG = bName.includes('direct') && bName.includes('growth');
            if (aDG && !bDG) return -1;
            if (!aDG && bDG) return 1;
            return 0;
          });
          
          setMfResults(sorted.slice(0, 5)); // Show top 5 suggestions
        } catch (err) {
          console.error('Header global search failed:', err);
        } finally {
          setLoading(false);
        }
      }, 350);

      return () => clearTimeout(timer);
    } else {
      setMfResults([]);
    }
  }, [query]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSelectPage = (path) => {
    navigate(path);
    setQuery('');
    setShowDropdown(false);
  };

  const handleSelectMF = (schemeCode, schemeName) => {
    navigate(`/investments/mutual-funds?selectCode=${schemeCode}&selectName=${encodeURIComponent(schemeName)}`);
    setQuery('');
    setShowDropdown(false);
  };

  const displayName = formData.fullName || profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'FinLabs User';
  const avatarUrl = formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="sticky top-0 z-35 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 transition-colors">
      
      {/* Left Menu Drawer & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Engine */}
        <div ref={dropdownRef} className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search goals, funds, stocks, calculators..."
            value={query}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
          />

          {/* Search Dropdown Panel */}
          {showDropdown && (query.trim().length >= 2) && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-2xl overflow-hidden z-50 text-xs text-slate-900 dark:text-slate-100 max-h-96 overflow-y-auto no-scrollbar">
              
              {/* Pages & Features Matches */}
              {searchResults.length > 0 && (
                <div className="p-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pages & Tools</div>
                  {searchResults.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSelectPage(item.path)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex justify-between items-center transition"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-mono">{item.category}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Live Mutual Funds Matches */}
              <div className="p-2">
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Mutual Funds (Live)</span>
                  {loading && <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />}
                </div>

                {mfResults.length > 0 ? (
                  <div className="space-y-0.5">
                    {mfResults.map((item) => (
                      <button
                        key={item.schemeCode}
                        onClick={() => handleSelectMF(item.schemeCode, item.schemeName)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-start gap-1.5 group transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 truncate transition-colors">
                            {item.schemeName}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">Code: {item.schemeCode}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="px-2.5 py-2 text-slate-500 dark:text-slate-400 italic">
                      {query.trim().length >= 3 ? 'No funds matching query' : 'Type 3+ characters to search live'}
                    </div>
                  )
                )}
              </div>

              {/* No matches fallback */}
              {searchResults.length === 0 && mfResults.length === 0 && !loading && (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  No matching tools or mutual funds found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge variant="brand" className="hidden sm:inline-flex gap-1 text-[10px]">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          FinLabs v1.0
        </Badge>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Light/Dark Mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            title="View Profile"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-semibold max-w-[120px] truncate text-slate-800 dark:text-slate-200">
              {displayName}
            </span>
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
