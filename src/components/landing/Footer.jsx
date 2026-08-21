import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Fin<span className="text-emerald-500">Labs</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Financial intelligence made simple. Personal financial health diagnostics, goal planning, and investment suitability insights.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link to="/dashboard" className="hover:text-emerald-500 transition">Dashboard</Link>
            <Link to="/financial-health" className="hover:text-emerald-500 transition">Financial Health</Link>
            <Link to="/goals" className="hover:text-emerald-500 transition">Goal Planner</Link>
            <Link to="/investments/mutual-funds" className="hover:text-emerald-500 transition">Mutual Funds</Link>
            <Link to="/tools/sip-calculator" className="hover:text-emerald-500 transition">SIP Calculator</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} FinLabs Inc. All rights reserved.</p>
          <p className="text-[11px] text-slate-500">
            Financial intelligence platform for informational & planning purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
