import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { mockUserSummary, mockHealthMetrics, mockStrengthsAndWeaknesses } from '../mock/finlabsMockData';

export default function FinancialHealthPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Financial Health Diagnostic"
        subtitle="In-depth breakdown of liquidity, solvency, savings velocity, and risk resilience score."
        tag="Core Intelligence"
      />

      {/* Hero Diagnostic Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full border-4 border-emerald-500/30 bg-slate-800/80 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                {mockUserSummary.financialHealthScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                  {mockUserSummary.healthStatus} Status
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Updated today</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Financial Health Index</h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                {mockUserSummary.healthMessage}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Diagnostic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockHealthMetrics.map((item, idx) => (
          <Card key={idx} hover>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.metric}</span>
                <h4 className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-0.5">{item.score}</h4>
              </div>
              <Badge variant={item.status === 'Excellent' || item.status === 'Good' ? 'success' : 'warning'}>
                {item.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{item.description}</p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500">
              <span>Recommended Target</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.target}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Financial Baseline Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockStrengthsAndWeaknesses.strengths.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{str}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actionable Improvement Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockStrengthsAndWeaknesses.improvements.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
