import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import { Wallet, TrendingUp, PiggyBank, Activity, Target, PieChart, Sparkles, ArrowRight, Settings2 } from 'lucide-react';
import OnboardingEntryModal from '../components/onboarding/OnboardingEntryModal';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { formData, healthScore, riskProfile, isOnboarded } = useOnboarding();

  // Entry Modal Prompt State (Onboard vs Overview)
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    const isCompleted = localStorage.getItem('finlabs_onboarding_completed') === 'true';
    const isDismissedInSession = sessionStorage.getItem('finlabs_entry_modal_dismissed') === 'true';

    if (!isCompleted && !isDismissedInSession) {
      setShowEntryModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('finlabs_entry_modal_dismissed', 'true');
    setShowEntryModal(false);
  };

  const handleStartOnboarding = () => {
    sessionStorage.setItem('finlabs_entry_modal_dismissed', 'true');
    setShowEntryModal(false);
    navigate('/onboarding');
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Dynamic User Name & Avatar
  const googleName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
  const userName = formData.fullName || googleName || 'FinLabs Investor';
  const avatarUrl = formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Dynamic Income, Expenses & Savings Calculations
  const primaryIncome = Number(formData.primaryMonthlyIncome || 0);
  const secondaryIncome = Number(formData.secondaryMonthlyIncome || 0);
  const totalIncome = (primaryIncome + secondaryIncome) || 75000;

  const essentialExp = Number(formData.essentialExpenses || 0);
  const discretionaryExp = Number(formData.discretionaryExpenses || 0);
  const totalExpenses = (essentialExp + discretionaryExp) || 45000;

  const totalEmis = Number(formData.totalEmiOutflow || 0);
  const monthlySavings = Math.max(0, totalIncome - totalExpenses - totalEmis);
  const savingsRatePct = Math.round((monthlySavings / (totalIncome || 1)) * 100);
  const emiRatioPct = Math.round((totalEmis / (totalIncome || 1)) * 100);

  // Dynamic Health Metric Pillars
  const dynamicHealthMetrics = [
    {
      metric: 'Savings Rate',
      score: `${savingsRatePct}%`,
      target: '25%',
      status: savingsRatePct >= 25 ? 'Excellent' : savingsRatePct >= 15 ? 'Good' : 'Needs Attention',
      description: `Saving ₹${monthlySavings.toLocaleString('en-IN')} of ₹${totalIncome.toLocaleString('en-IN')} income.`,
    },
    {
      metric: 'Emergency Fund',
      score: formData.monthsCovered || '3–6 Months',
      target: '6.0 Months',
      status: formData.monthsCovered === '6+ Months' ? 'Excellent' : formData.monthsCovered === '3–6 Months' ? 'Good' : 'Needs Attention',
      description: `₹${Number(formData.emergencyFundAmount || 150000).toLocaleString('en-IN')} accumulated buffer.`,
    },
    {
      metric: 'Debt-to-Income',
      score: `${emiRatioPct}%`,
      target: '< 30%',
      status: emiRatioPct <= 15 ? 'Excellent' : emiRatioPct <= 30 ? 'Good' : 'Needs Attention',
      description: emiRatioPct > 0 ? `₹${totalEmis.toLocaleString('en-IN')} monthly debt outflow` : 'Zero active loan obligations',
    },
    {
      metric: 'Diversification',
      score: `${Math.min(100, Math.max(25, (formData.assetClasses || []).filter(a => a !== 'None yet').length * 25))} / 100`,
      target: '80 / 100',
      status: (formData.assetClasses || []).length >= 3 ? 'Good' : 'Moderate',
      description: `Across ${(formData.assetClasses || []).filter(a => a !== 'None yet').join(', ') || '1 asset class'}`,
    },
  ];

  // Dynamic Portfolio Allocation
  const rawTotalPortfolio = Number(formData.totalInvestmentValue || 350000);
  const activeAssets = (formData.assetClasses || []).filter(a => a !== 'None yet');

  const assetColors = {
    'Mutual Funds / SIPs': '#10b981',
    'Direct Equity / Stocks': '#6366f1',
    'Fixed Deposits / Recurring Deposits': '#f59e0b',
    'Digital / Physical Gold': '#eab308',
    'Crypto / Alternative Assets': '#ec4899',
  };

  const dynamicAllocation = activeAssets.length > 0
    ? activeAssets.map((asset, idx) => {
        const pct = Math.round(100 / activeAssets.length);
        const val = Math.round((rawTotalPortfolio * pct) / 100);
        return {
          name: asset,
          value: val,
          percentage: pct,
          color: assetColors[asset] || ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899'][idx % 5],
        };
      })
    : [
        { name: 'Mutual Funds (SIP)', value: Math.round(rawTotalPortfolio * 0.6), percentage: 60, color: '#10b981' },
        { name: 'Direct Equity Stocks', value: Math.round(rawTotalPortfolio * 0.4), percentage: 40, color: '#6366f1' },
      ];

  // Dynamic Goal Progress
  const goalTitle = formData.primaryMilestone || 'Down Payment for House';
  const targetCorpus = Number(formData.targetGoalAmount || 1500000);
  const timeframeYears = Number(formData.targetTimeframeYears || 5);
  const monthlySip = Number(formData.monthlyCommitmentAmount || 15000);
  const projectedAccumulated = Math.min(targetCorpus, monthlySip * 12 * (timeframeYears * 0.4));
  const goalProgressPct = Math.min(100, Math.max(15, Math.round((projectedAccumulated / targetCorpus) * 100)));

  return (
    <div className="space-y-6 animate-in fade-in duration-150 relative">
      {/* ENTRY MODAL PROMPT */}
      <OnboardingEntryModal
        isOpen={showEntryModal}
        onClose={handleCloseModal}
        onStartOnboarding={handleStartOnboarding}
      />

      {/* GLOBAL ONBOARDING REMINDER BANNER (Overview Mode Only) */}
      {!isOnboarded && <PlatformOverviewBanner />}

      {/* HEADER WITH USER PROFILE AVATAR & BLUEPRINT ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-500/20 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Good day, {userName} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isOnboarded ? (
                <>Risk Profile: <span className="font-bold text-emerald-500">{riskProfile} Investor</span> — FinLabs Blueprint Active</>
              ) : (
                <span className="font-bold text-amber-500 font-mono uppercase">Platform Overview Mode Active</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-500 transition shadow-sm self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4 text-emerald-500" />
          <span>{isOnboarded ? 'Edit Wealth Blueprint' : 'Unlock Live Wealth Blueprint'}</span>
        </button>
      </div>

      {/* OVERVIEW MODE VS LIVE MODE CONTENT */}
      {!isOnboarded ? (
        <FeatureOverviewCard
          moduleName="Wealth Intelligence Dashboard"
          subtitle="Consolidates cash flows, debt obligation metrics, emergency reserves, and portfolio allocations into a real-time Financial Health Score (0-100)."
          capabilities={[
            'Computes real-time Savings Rate % and Net Investable Cash Surplus.',
            'Evaluates Debt-to-Income (EMI) ratios to safeguard monthly liquidity.',
            'Projects Goal Accumulation timelines based on automated SIP contributions.',
            'Generates rule-based AI recommendations tailored to your risk profile.'
          ]}
          whyItMatters={[
            'Unmonitored cash flow drawdowns reduce long-term wealth compounding by over 24%.',
            'Maintaining a Debt-to-Income ratio below 30% ensures financial resiliency against market volatility.',
            'Automating recurring SIP contributions aligns your daily spend with your primary milestone.'
          ]}
          ctaLabel="Unlock Your Live Dashboard"
          stepTarget="/onboarding"
        >
          {/* Mock Dashboard Visual for Blur Overlay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-3xl">
            <StatCard title="Financial Health" value="74 / 100" icon={Activity} change="Strong Index" changeType="positive" description="Calculated FinLabs Score" />
            <StatCard title="Monthly Cash Inflow" value="₹75,000" icon={Wallet} change="Stable" changeType="neutral" description="Net Take-Home Inflow" />
            <StatCard title="Monthly Savings Surplus" value="₹30,000" icon={PiggyBank} change="40% Savings Rate" changeType="positive" description="Investable Monthly Cash" />
            <StatCard title="Portfolio Value" value="₹3,50,000" icon={TrendingUp} change="2 Asset Classes" changeType="positive" description="Consolidated Holdings" />
          </div>
        </FeatureOverviewCard>
      ) : (
        /* PERSONALIZED LIVE MODE CONTENT */
        <>
          {/* ROW 1: DYNAMIC KEY METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Financial Health"
              value={`${healthScore} / 100`}
              icon={Activity}
              change={healthScore >= 70 ? 'Strong Index' : healthScore >= 50 ? 'Moderate Index' : 'Needs Optimization'}
              changeType={healthScore >= 60 ? 'positive' : 'neutral'}
              description="Calculated FinLabs Score"
            />

            <StatCard
              title="Monthly Cash Inflow"
              value={formatINR(totalIncome)}
              icon={Wallet}
              change={formData.incomeStability || 'Predictable'}
              changeType="neutral"
              description="Net Take-Home Inflow"
            />

            <StatCard
              title="Monthly Savings Surplus"
              value={formatINR(monthlySavings)}
              icon={PiggyBank}
              change={`${savingsRatePct}% Savings Rate`}
              changeType={savingsRatePct >= 20 ? 'positive' : 'neutral'}
              description="Investable Monthly Cash"
            />

            <StatCard
              title="Portfolio Value"
              value={formatINR(rawTotalPortfolio)}
              icon={TrendingUp}
              change={`${activeAssets.length || 2} Active Asset Classes`}
              changeType="positive"
              description="Consolidated Holdings"
            />
          </div>

          {/* ROW 2: DYNAMIC FINANCIAL HEALTH SUMMARY */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Financial Health Summary
                </CardTitle>
                <CardDescription>Real-time status calculated from your baseline cash flow & debt data</CardDescription>
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
                {dynamicHealthMetrics.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{item.metric}</p>
                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{item.score}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ROW 3 & ROW 4: DYNAMIC GOALS SUMMARY & PORTFOLIO SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GOALS SUMMARY */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-emerald-500" />
                      Primary Milestone: {goalTitle}
                    </CardTitle>
                    <CardDescription>Accumulation progress toward target horizon</CardDescription>
                  </div>
                  <button
                    onClick={() => navigate('/goals')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all goals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {goalTitle}
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Target: {timeframeYears} Years
                      </span>
                    </div>

                    <ProgressIndicator value={goalProgressPct} max={100} color="emerald" />

                    <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-0.5 font-mono">
                      <span>Monthly Contribution: ₹{monthlySip.toLocaleString('en-IN')}</span>
                      <span>Target Corpus: ₹{targetCorpus.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* PORTFOLIO SUMMARY */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <PieChart className="w-4 h-4 text-indigo-500" />
                      Consolidated Portfolio Breakdown
                    </CardTitle>
                    <CardDescription>Asset allocation across your selected asset classes</CardDescription>
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
                    {dynamicAllocation.map((item, idx) => (
                      <div
                        key={idx}
                        className="h-full transition-all duration-300"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    {dynamicAllocation.map((item, idx) => (
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

          {/* ROW 5: TAILORED FINLABS INSIGHT */}
          <Card className="bg-gradient-to-r from-slate-900 to-slate-950 text-white border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="brand" className="text-[10px]">Tailored Recommendation</Badge>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {savingsRatePct >= 20 ? 'Optimal Growth Horizon' : 'Surplus Boost Opportunity'}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                    {savingsRatePct >= 20 ? 'SIP Step-Up Optimization' : 'Savings Surplus Acceleration'}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {savingsRatePct >= 20
                      ? `Your current savings surplus of ₹${monthlySavings.toLocaleString('en-IN')}/mo (${savingsRatePct}%) gives you strong leverage. Increasing your monthly goal allocation by ₹2,000 accelerates your ${goalTitle} goal timeline by 14 months.`
                      : `Your current savings rate is ${savingsRatePct}%. Trimming lifestyle expenses by ₹3,000/mo will elevate your Financial Health Score to 80+.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/tools/suitability')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shrink-0"
              >
                <span>View suitability</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
