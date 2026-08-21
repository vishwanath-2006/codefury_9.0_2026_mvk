import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  Wallet,
  Target,
  PieChart,
  TrendingUp,
  LineChart,
  Rocket,
  Calculator,
  GitCompare,
  Sparkles,
  Bot,
  Settings,
  User,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'FinLabs User';
  const displayEmail = user?.email || 'user@finlabs.io';

  const mainNav = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Financial Health', path: '/financial-health', icon: Activity },
    { name: 'Expenses', path: '/expenses', icon: Wallet },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
  ];

  const investmentNav = [
    { name: 'Mutual Funds', path: '/investments/mutual-funds', icon: TrendingUp },
    { name: 'Stocks', path: '/investments/stocks', icon: LineChart },
    { name: 'IPOs', path: '/investments/ipos', icon: Rocket },
  ];

  const toolsNav = [
    { name: 'SIP Calculator', path: '/tools/sip-calculator', icon: Calculator },
    { name: 'Investment Comparison', path: '/tools/investment-comparison', icon: GitCompare },
    { name: 'Suitability', path: '/tools/suitability', icon: Sparkles },
  ];

  const aiNav = [
    { name: 'FinLabs AI', path: '/ai', icon: Bot, badge: 'Copilot' },
  ];

  const bottomNav = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const renderNavGroup = (items) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                {item.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Fin<span className="text-emerald-500">Labs</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
              Main
            </p>
            {renderNavGroup(mainNav)}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
              Investments
            </p>
            {renderNavGroup(investmentNav)}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
              Tools
            </p>
            {renderNavGroup(toolsNav)}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
              AI
            </p>
            {renderNavGroup(aiNav)}
          </div>
        </div>

        {/* Bottom Profile / Settings Group */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {renderNavGroup(bottomNav)}

          <div className="pt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-rose-500 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
