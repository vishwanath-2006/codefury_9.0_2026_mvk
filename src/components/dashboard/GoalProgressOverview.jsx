import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import ProgressIndicator from '../ui/ProgressIndicator';
import Badge from '../ui/Badge';
import { mockGoals } from '../../mock/finlabsMockData';
import { useNavigate } from 'react-router-dom';

export default function GoalProgressOverview() {
  const navigate = useNavigate();
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Active Financial Goals
          </CardTitle>
          <CardDescription>Multi-horizon goal trajectories & accumulation progress</CardDescription>
        </div>
        <button
          onClick={() => navigate('/goals')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View All ({mockGoals.length}) →
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {mockGoals.map((goal) => (
          <div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{goal.title}</h4>
                  <Badge variant="neutral" className="text-[10px]">{goal.category}</Badge>
                </div>
                <p className="text-[11px] text-slate-400">Target Deadline: {goal.deadline}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatINR(goal.currentAmount)}
                </span>
                <span className="text-xs text-slate-400 block font-mono">of {formatINR(goal.targetAmount)}</span>
              </div>
            </div>

            <ProgressIndicator value={goal.progressPct} max={100} color={goal.progressPct > 70 ? 'emerald' : 'sky'} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
