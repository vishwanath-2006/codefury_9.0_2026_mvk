import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, Activity, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section id="problem" className="py-20 md:py-28 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Noxar Style Display Typography) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> INTELLIGENT DIAGNOSTICS
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-950 dark:text-slate-100">
            How FinLabs helps during practice
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Integrate FinLabs into your monthly loop to validate financial invariants instantly.
          </p>
        </div>

        {/* 2-Column Noxar + Upstox Style Feature Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Upstox Deep Purple Accent Block */}
          <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Chips (Noxar Style) */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-purple-900/80 text-purple-200 text-xs font-mono font-bold border border-purple-500/30">
                  finlabs
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-900/80 text-purple-200 text-xs font-mono font-bold border border-purple-500/30">
                  listens
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/30 text-white text-xs font-mono font-bold border border-purple-400/40">
                  to financial context
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
                Background Cashflow Capture
              </h3>
              <p className="text-purple-200 text-xs sm:text-sm leading-relaxed max-w-md">
                FinLabs monitors your cash flows, income streams, and liabilities in real-time. The moment you input expenses, it automatically updates your surplus bounds.
              </p>
            </div>

            {/* In-Card Interactive Preview Box */}
            <div className="mt-8 p-4 rounded-2xl bg-purple-950/80 border border-purple-500/30 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-purple-300 text-[11px]">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Cashflow Listener
                </span>
                <span className="text-purple-400">Live Diagnostics</span>
              </div>
              <p className="text-purple-100 text-[11px] leading-snug">
                Given monthly income ₹75,000 and total expenses ₹45,000, calculate net surplus margin & emergency fund runway...
              </p>
            </div>
          </div>

          {/* Card 2: Noxar Light/Dark Card */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300">
            <div>
              {/* Chips (Noxar Style) */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                  finlabs
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                  assists
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                  you instantly
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 dark:text-slate-100 mb-3">
                Instant Edge-Case Audits
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Get an instant diagnostic of hidden debt risks, unutilized tax savings, and portfolio concentration warnings.
              </p>
            </div>

            {/* In-Card Interactive Preview Box */}
            <div className="mt-8 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> finlabs assistant
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                  Step 1-4 Audit
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Financial Health Score:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">74 / 100</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Debt Ratio Outflow:</span>
                <span className="text-emerald-500 font-bold">Low (&lt;15%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
