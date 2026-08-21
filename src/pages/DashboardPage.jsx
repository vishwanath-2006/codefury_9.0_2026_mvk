import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import { Wallet, TrendingUp, PiggyBank, Activity, Target, PieChart, Sparkles, ArrowRight, Settings2 } from 'lucide-react';
import {
  mockUserSummary,
  mockHealthMetrics,
  mockTopGoals,
  mockPortfolioAllocation,
  mockPrimaryInsight
} from '../mock/finlabsMockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { formData, healthScore, riskProfile } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const authUserName = profile?.full_name || user?.user_metadata?.full_name;
  const userName = formData.fullName || authUserName || 'SmartWealth Investor';

  const totalIncome = (Number(formData.primaryMonthlyIncome || 0) + Number(formData.secondaryMonthlyIncome || 0)) || mockUserSummary.monthlyIncome;
  const totalExpenses = (Number(formData.essentialExpenses || 0) + Number(formData.discretionaryExpenses || 0));
  const totalEmis = Number(formData.totalEmiOutflow || 0);
  const monthlySavings = Math.max(0, totalIncome - totalExpenses - totalEmis) || mockUserSummary.monthlySavings;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER WITH ONBOARDING RE-VISIT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={`Good day, ${userName} 👋`}
          subtitle={`Risk Profile: ${riskProfile} Investor — Blueprint Active`}
          tag="SmartWealth AI"
        />

        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-500 transition shadow-sm self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4 text-emerald-500" />
          <span>Edit Wealth Blueprint</span>
        </button>
      </div>

      {/* ROW 1: KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Financial Health"
          value={`${healthScore} / 100`}
          icon={Activity}
          change={healthScore >= 70 ? 'Strong Baseline' : healthScore >= 50 ? 'Moderate Baseline' : 'Needs Optimization'}
          changeType={healthScore >= 60 ? 'positive' : 'neutral'}
          description="Calculated Index"
        />

        <StatCard
          title="Monthly Income"
          value={formatINR(totalIncome)}
          icon={Wallet}
          change={formData.incomeStability || 'Verified Inflow'}
          changeType="neutral"
          description="Net Monthly Cash Inflow"
        />

        <StatCard
          title="Monthly Savings Surplus"
          value={formatINR(monthlySavings)}
          icon={PiggyBank}
          change={`${Math.round((monthlySavings / (totalIncome || 1)) * 100)}% Savings Rate`}
          changeType="positive"
          description="Investable surplus"
        />

        <StatCard
          title="Portfolio Value"
          value={formatINR(Number(formData.totalInvestmentValue) || mockUserSummary.portfolioValue)}
          icon={TrendingUp}
          change={`${(formData.assetClasses || []).filter(a => a !== 'None yet').length || 3} Asset Classes`}
          changeType="positive"
          description="Consolidated Holdings"
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
                  Primary Goal ({formData.primaryMilestone || 'House Downpayment'})
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
              <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formData.primaryMilestone || 'Down Payment for House'}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Target: {formData.targetTimeframeYears || 5} Years
                  </span>
                </div>
                <ProgressIndicator value={35} max={100} color="emerald" />
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5 font-mono">
                  <span>Monthly Contribution: ₹{Number(formData.monthlyCommitmentAmount || 15000).toLocaleString('en-IN')}</span>
                  <span>Target: ₹{Number(formData.targetGoalAmount || 1500000).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {mockTopGoals.slice(0, 2).map((goal) => (
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
