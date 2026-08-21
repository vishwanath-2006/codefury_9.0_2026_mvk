import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import { Wallet, TrendingUp, PiggyBank, Activity, Target, PieChart, Sparkles, ArrowRight } from 'lucide-react';
import {
  mockUserSummary,
  mockHealthMetrics,
  mockTopGoals,
  mockPortfolioAllocation,
  mockPrimaryInsight
} from '../mock/finlabsMockData';

export default function DashboardPage() {
  const navigate = useNavigate();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER */}
      <PageHeader
        title={`${mockUserSummary.greeting} 👋`}
        subtitle="Here's your financial overview."
        tag="Overview"
      />

      {/* ROW 1: KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Financial Health"
          value={`${mockUserSummary.financialHealthScore} / 100`}
          icon={Activity}
          change={mockUserSummary.healthStatus}
          changeType="positive"
          description="Baseline Index"
        />

        <StatCard
          title="Monthly Income"
          value={formatINR(mockUserSummary.monthlyIncome)}
          icon={Wallet}
          change="Verified Inflow"
          changeType="neutral"
          description="Fixed net cash flow"
        />

        <StatCard
          title="Monthly Savings"
          value={formatINR(mockUserSummary.monthlySavings)}
          icon={PiggyBank}
          change="20% Savings Rate"
          changeType="positive"
          description="Target benchmark >20%"
        />

        <StatCard
          title="Portfolio Value"
          value={formatINR(mockUserSummary.portfolioValue)}
          icon={TrendingUp}
          change="+12.4% Growth"
          changeType="positive"
          description="3 Asset Classes"
        />
      </div>

      {/* ROW 2: FINANCIAL HEALTH SUMMARY */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-emerald-500" />
              Financial Health Summary
            </CardTitle>
            <CardDescription>Compact status of your core financial pillars</CardDescription>
          </div>
          <button
            onClick={() => navigate('/financial-health')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View health diagnostic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mockHealthMetrics.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{item.metric}</p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{item.score}</p>
                <p className="text-[10px] text-slate-400 mt-1">Target: {item.target}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROW 3 & ROW 4: GOALS SUMMARY & PORTFOLIO SUMMARY (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROW 3: GOALS SUMMARY */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Goals Summary
                </CardTitle>
                <CardDescription>Top active goal accumulation progress</CardDescription>
              </div>
              <button
                onClick={() => navigate('/goals')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>

            <CardContent className="space-y-3">
              {mockTopGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{goal.title}</span>
                    <span className="font-mono text-slate-500">{goal.deadline}</span>
                  </div>
                  <ProgressIndicator value={goal.progressPct} max={100} color={goal.progressPct > 70 ? 'emerald' : 'sky'} />
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Current: {formatINR(goal.currentAmount)}</span>
                    <span>Target: {formatINR(goal.targetAmount)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        </Card>

        {/* ROW 4: PORTFOLIO SUMMARY */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  Portfolio Summary
                </CardTitle>
                <CardDescription>Asset allocation across mutual funds, stocks & fixed income</CardDescription>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>

            <CardContent>
              {/* Asset Allocation Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex mb-4 bg-slate-100 dark:bg-slate-800">
                {mockPortfolioAllocation.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all duration-300"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                {mockPortfolioAllocation.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <div className="font-mono">
                      <span className="font-bold">{formatINR(item.value)}</span>
                      <span className="text-slate-400 ml-1.5">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* ROW 5: ONE SMALL FINLABS INSIGHT */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-950 text-white border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand" className="text-[10px]">{mockPrimaryInsight.badge}</Badge>
                <span className="text-[11px] text-emerald-400 font-semibold">{mockPrimaryInsight.impact}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{mockPrimaryInsight.title}</h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{mockPrimaryInsight.description}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/tools/suitability')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shrink-0"
          >
            <span>View insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
