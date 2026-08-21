import React from 'react';
import { Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { mockSuitabilityInsights } from '../../mock/finlabsMockData';

export default function SuitabilityInsightsWidget() {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Recent Suitability & Intelligence Insights
          </CardTitle>
          <CardDescription>Algorithmic match evaluations based on your financial health & risk profile</CardDescription>
        </div>
        <button
          onClick={() => navigate('/tools/suitability')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View Full Engine →
        </button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockSuitabilityInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                    {getIcon(insight.type)}
                    <span className="truncate">{insight.title}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {insight.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Impact</span>
                <Badge variant={insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'}>
                  {insight.impact}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
