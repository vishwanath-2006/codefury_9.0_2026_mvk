import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Gauge, Scale } from 'lucide-react';

const dockItems = [
  {
    name: 'Market Dashboard',
    path: '/dashboard',
    icon: TrendingUp,
    description: 'Real-time equity action & screening'
  },
  {
    name: 'Personal Overview',
    path: '/overview',
    icon: LayoutDashboard,
    description: 'Financial health & net worth summary'
  },
  {
    name: 'Risk Profiler',
    path: '/tools/risk-profiler',
    icon: Gauge,
    description: 'Goal urgency & risk score calculator'
  },
  {
    name: 'Investment Comparison',
    path: '/tools/investment-comparison',
    icon: Scale,
    description: 'Asset performance & CAGR simulator'
  }
];

export default function FloatingBottomDock() {
  const location = useLocation();

  return (
    <nav
      aria-label="Quick Access Dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-emerald-500/25 shadow-2xl shadow-emerald-950/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <div key={item.name} className="relative group flex flex-col items-center">
            {/* Hover Tooltip */}
            <div className="group-hover:opacity-100 opacity-0 pointer-events-none transition-all duration-200 absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900/95 text-slate-100 text-[11px] font-extrabold border border-slate-700/80 whitespace-nowrap shadow-xl flex items-center gap-1.5">
              <span>{item.name}</span>
            </div>

            {/* Dock Item Button */}
            <NavLink
              to={item.path}
              title={item.name}
              className={`w-11 h-11 rounded-full flex items-center justify-center relative transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25 hover:scale-110 hover:text-emerald-300 hover:shadow-md hover:shadow-emerald-500/20'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />

              {/* Active Route Indicator Pulse Dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}
