import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Target, Plus, Calendar, TrendingUp } from 'lucide-react';
import { mockTopGoals } from '../mock/finlabsMockData';

export default function GoalsPage() {
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Financial Goal Planner"
        subtitle="Set, track, and simulate multi-horizon goals with dynamic SIP calculation projections."
        tag="Planning"
      >
        <Button variant="primary" size="sm" icon={Plus}>
          Add New Goal
        </Button>
      </PageHeader>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTopGoals.map((goal) => (
          <Card key={goal.id} hover className="flex flex-col justify-between p-5">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant="brand" className="mb-1 text-[10px]">{goal.category}</Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                </div>
                <Badge variant={goal.progressPct > 70 ? 'success' : 'neutral'}>
                  {goal.progressPct}% Achieved
                </Badge>
              </div>

              <div className="my-4">
                <ProgressIndicator value={goal.progressPct} max={100} color={goal.progressPct > 70 ? 'emerald' : 'sky'} />
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accumulated</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatINR(goal.currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Corpus</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{formatINR(goal.targetAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Date</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.deadline}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Monthly Contribution</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(goal.monthlyContribution)}/mo</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
