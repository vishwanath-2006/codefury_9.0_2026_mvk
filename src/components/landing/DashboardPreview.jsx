import React from 'react';
import { TrendingUp, ShieldCheck, PieChart, Activity, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

export default function DashboardPreview() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-900/90 dark:bg-slate-900 border border-slate-700/60 shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden backdrop-blur-xl">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mock Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs font-mono text-slate-400 ml-2">app.finlabs.io/dashboard</span>
        </div>
        <Badge variant="brand" className="text-[10px]">LIVE DEMO PREVIEW</Badge>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Health Score */}
        <Card className="bg-slate-800/80 border-slate-700/80 text-white p-4">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Score</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">74</span>
            <span className="text-xs text-slate-400">/ 100 (Strong)</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-400 h-full rounded-full w-[74%]" />
          </div>
        </Card>

        {/* Card 2: Net Worth */}
        <Card className="bg-slate-800/80 border-slate-700/80 text-white p-4">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Portfolio Value</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-white">₹4,82,500</span>
            <span className="text-xs font-semibold text-emerald-400">+12.4%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Across 3 asset classes</p>
        </Card>

        {/* Card 3: Suitability Alert */}
        <Card className="bg-slate-800/80 border-slate-700/80 text-white p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Insight</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            Increasing SIP by ₹2,000/mo reaches your 2028 Downpayment goal 14 months earlier.
          </p>
        </Card>
      </div>

      {/* Mock Bottom Activity Row */}
      <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Risk Assessment: <strong>Moderately Aggressive</strong> (Optimal Horizon)</span>
        </div>
        <span className="text-emerald-400 font-mono font-semibold hover:underline cursor-pointer">View Suitability Report →</span>
      </div>
    </div>
  );
}
