import React from 'react';
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import { mockUserSummary, mockHealthBreakdown } from '../../mock/finlabsMockData';

export default function HealthScoreCard() {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Score Summary */}
        <div className="flex items-center gap-6">
          {/* Radial/Ring Score Representation */}
          <div className="relative w-24 h-24 rounded-full border-4 border-emerald-500/20 bg-slate-800/80 flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {mockUserSummary.financialHealthScore}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                {mockUserSummary.healthStatus} Health
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Updated today</span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">Financial Health Index</h3>
            <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
              {mockUserSummary.healthMessage}
            </p>
          </div>
        </div>

        {/* Right CTA Link */}
        <Link
          to="/financial-health"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shrink-0"
        >
          <span>Full Health Diagnostic</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
        {mockHealthBreakdown.map((item, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{item.metric}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold font-mono text-white">{item.score}</span>
              <span className="text-[10px] text-slate-400">Target: {item.target}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
