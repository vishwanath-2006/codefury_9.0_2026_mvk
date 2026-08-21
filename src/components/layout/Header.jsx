import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { Menu, Sun, Moon, Search, Sparkles, LogOut } from 'lucide-react';
import Badge from '../ui/Badge';

export default function Header({ onOpenSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { formData } = useOnboarding();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const displayName = formData.fullName || profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'FinLabs User';
  const avatarUrl = formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 flex items-center justify-between px-4 sm:px-6 transition-colors">
      {/* Left Menu Drawer & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search goals, funds, stocks, calculators..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-950 transition"
          />
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
