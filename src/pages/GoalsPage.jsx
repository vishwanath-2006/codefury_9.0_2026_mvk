import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import BenchmarkFooterBanner from '../components/common/BenchmarkFooterBanner';
import { Target, Plus } from 'lucide-react';

export default function GoalsPage() {
  const { userProfile, isOnboarded } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  const goal = userProfile.primaryGoal;
  const targetCorpus = goal.targetAmount || 1500000;
  const accumulated = goal.accumulatedAmount || 450000;
  const timeframeYears = goal.timeframeYears || 5;

  const progressPct = Math.min(100, Math.max(0, Math.round((accumulated / targetCorpus) * 100))) || 30;

  const n = Math.max(1, timeframeYears * 12);
  const targetDeficit = Math.max(0, targetCorpus - accumulated);
  const r = 0.01;
  const calculatedSip = Math.round((targetDeficit * r) / (Math.pow(1 + r, n) - 1)) || 15000;

  const activeGoals = isOnboarded
    ? [
        {
          id: 'g1',
          title: goal.name,
          category: goal.category || 'Real Estate',
          currentAmount: accumulated,
          targetAmount: targetCorpus,
          deadline: goal.targetDate,
          progressPct: progressPct,
          monthlyContribution: calculatedSip,
        },
        {
          id: 'g2',
          title: 'Emergency Reserve Buffer',
          category: 'Safety Shield',
          currentAmount: userProfile.emergencyFundAmount,
          targetAmount: userProfile.essentialExpenses * 6,
          deadline: 'Immediate',
          progressPct: Math.min(100, Math.round((userProfile.emergencyFundAmount / (userProfile.essentialExpenses * 6 || 1)) * 100)),
          monthlyContribution: Math.round(calculatedSip * 0.2),
        },
      ]
    : [
        {
          id: 'g_sample1',
          title: 'Emergency Shield Reserve',
          category: 'Liquidity Shield (Benchmark)',
          currentAmount: 120000,
          targetAmount: 200000,
          deadline: '2026-12-31',
          progressPct: 60,
          monthlyContribution: 5000,
        },
        {
          id: 'g_sample2',
          title: 'Home Down Payment Milestone',
          category: 'Real Estate (Benchmark)',
          currentAmount: 350000,
          targetAmount: 1000000,
          deadline: '2028-12-31',
          progressPct: 35,
          monthlyContribution: 12500,
        },
      ];

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

      {/* LIVE / BENCHMARK GOALS MODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeGoals.map((g) => (
          <Card key={g.id} hover className="flex flex-col justify-between p-5">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant="brand" className="mb-1 text-[10px]">{g.category}</Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{g.title}</h3>
                </div>
                <Badge variant={g.progressPct > 70 ? 'success' : 'neutral'}>
                  {g.progressPct}% Achieved
                </Badge>
              </div>

              <div className="my-4">
                <ProgressIndicator value={g.progressPct} max={100} color={g.progressPct > 70 ? 'emerald' : 'sky'} />
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accumulated</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(g.currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Corpus</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(g.targetAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Date</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{g.deadline}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Monthly Contribution (Annuity SIP)</span>
              <span className="font-mono font-bold text-emerald-500">{formatINR(g.monthlyContribution)}/mo</span>
            </div>
          </Card>
        ))}
      </div>

      {/* SUBTLE BENCHMARK FOOTER CTA */}
      {!isOnboarded && (
        <BenchmarkFooterBanner message="Define your own target goals and custom dates." />
      )}
    </div>
  );
}
