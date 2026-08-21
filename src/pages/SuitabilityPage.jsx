import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { mockSuitabilityInsights } from '../mock/finlabsMockData';

export default function SuitabilityPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Personalized Suitability Engine"
        subtitle="Algorithmic risk evaluation matching your profile with ideal asset allocations."
        tag="Intelligence"
      />

      <div className="space-y-4">
        {mockSuitabilityInsights.map((insight) => (
          <Card key={insight.id} hover className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}>
                    {insight.type === 'positive' ? 'Opportunity' : insight.type === 'warning' ? 'Alert' : 'Notice'}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">Impact: {insight.impact}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{insight.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-3xl">
                  {insight.description}
                </p>
              </div>

              <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shrink-0 self-start sm:self-center">
                Apply Guidance
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
