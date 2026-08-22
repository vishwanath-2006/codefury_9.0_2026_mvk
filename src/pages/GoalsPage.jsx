import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import { Target, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function GoalsPage() {
  const { formData, isOnboarded } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const milestoneTitle = formData.primaryMilestone || 'Down Payment for House';
  const targetCorpus = Number(formData.targetGoalAmount || 1500000);
  const timeframeYears = Number(formData.targetTimeframeYears || 5);
  const monthlySip = Number(formData.monthlyCommitmentAmount || 15000);

  const projectedAccumulated = Math.min(targetCorpus, monthlySip * 12 * (timeframeYears * 0.4));
  const progressPct = Math.min(100, Math.max(15, Math.round((projectedAccumulated / targetCorpus) * 100)));

  const activeGoals = [
    {
      id: 'g1',
      title: milestoneTitle,
      category: 'Primary Milestone',
      currentAmount: projectedAccumulated,
      targetAmount: targetCorpus,
      deadline: `${new Date().getFullYear() + timeframeYears}`,
      progressPct: progressPct,
      monthlyContribution: monthlySip,
    },
    {
      id: 'g2',
      title: 'Emergency Safety Buffer',
      category: 'Liquidity Shield',
      currentAmount: Number(formData.emergencyFundAmount || 150000),
      targetAmount: Number(formData.essentialExpenses || 25000) * 6 || 150000,
      deadline: 'Immediate',
      progressPct: 85,
      monthlyContribution: Math.round(monthlySip * 0.25),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Global Overview Mode Banner */}
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="Financial Goal Planner"
        subtitle="Set, track, and simulate multi-horizon goals with dynamic SIP calculation projections."
        tag="Planning"
      >
        <Button variant="primary" size="sm" icon={Plus}>
          Add New Goal
        </Button>
      </PageHeader>

      {!isOnboarded ? (
        <FeatureOverviewCard
          moduleName="Multi-Horizon Goal Planner"
          subtitle="Simulates timeline horizons and recurring monthly SIP requirements to achieve your major life milestones (housing, education, retirement, emergency cushion)."
          capabilities={[
            'Computes required monthly SIP contribution based on targeted inflation rate.',
            'Tracks real-time progress bars across liquid emergency funds and long-term goals.',
            'Adjusts asset allocation recommendations based on years to goal maturity.'
          ]}
          whyItMatters={[
            'Unplanned goals lead to high-interest emergency borrowing when milestones arrive.',
            'Compounding works exponentially over time — starting a 5-year goal 12 months earlier reduces required SIP by 18%.',
            'Categorizing goals into short-term liquid vs. long-term equity shields capital from market volatility.'
          ]}
          ctaLabel="Set Goals in Onboarding"
          stepTarget="/onboarding"
        >
          {/* Mock Goal Cards Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-900 rounded-3xl text-white">
            <div className="p-4 bg-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-emerald-400">House Down Payment</span>
                <span className="font-mono">45% Progress</span>
              </div>
              <div className="h-2 bg-emerald-500 rounded-full w-1/2"></div>
              <div className="flex justify-between text-xs font-mono">
                <span>Target: ₹15,000,000</span>
                <span>SIP: ₹15,000/mo</span>
              </div>
            </div>
            <div className="p-4 bg-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-teal-400">Emergency Reserve</span>
                <span className="font-mono">80% Progress</span>
              </div>
              <div className="h-2 bg-teal-500 rounded-full w-4/5"></div>
              <div className="flex justify-between text-xs font-mono">
                <span>Target: ₹200,000</span>
                <span>Buffer: 6 Months</span>
              </div>
            </div>
          </div>
        </FeatureOverviewCard>
      ) : (
        /* LIVE GOALS MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGoals.map((goal) => (
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

                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accumulated</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(goal.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Corpus</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(goal.targetAmount)}</span>
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
      )}
    </div>
  );
}
