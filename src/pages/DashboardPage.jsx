import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import BenchmarkFooterBanner from '../components/common/BenchmarkFooterBanner';
import { Wallet, TrendingUp, PiggyBank, Activity, Target, PieChart, Sparkles, ArrowRight, Settings2 } from 'lucide-react';
import OnboardingEntryModal from '../components/onboarding/OnboardingEntryModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { formData, userProfile, healthScore, riskProfile, isOnboarded } = useOnboarding();

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
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  // Dynamic User Name & Avatar
  const googleName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
  const userName = isOnboarded ? (formData.fullName || googleName || 'FinLabs Investor') : 'Alex (Sample Early Career Profile)';
  const avatarUrl = isOnboarded ? (formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url) : null;

  // Onboarded vs Benchmark Data Mapping
  const totalIncome = isOnboarded ? userProfile.monthlyIncome : 75000;
  const totalExpenses = isOnboarded ? (userProfile.essentialExpenses + userProfile.discretionaryExpenses) : 45000;
  const totalEmis = isOnboarded ? userProfile.totalMonthlyEmis : 0;
  const monthlySavings = Math.max(0, totalIncome - totalExpenses - totalEmis);
  const savingsRatePct = Math.round((monthlySavings / (totalIncome || 1)) * 100);
  const emiRatioPct = Math.round((totalEmis / (totalIncome || 1)) * 100);

  const netWorthValue = isOnboarded ? userProfile.totalPortfolioNetWorth : 350000;
  const currentHealthScore = isOnboarded ? healthScore : 72;

  const dynamicHealthMetrics = [
    {
      metric: 'Savings Rate',
      score: `${savingsRatePct}%`,
      target: '25%',
      status: savingsRatePct >= 25 ? 'Excellent' : 'Good',
      description: `Saving ${formatINR(monthlySavings)} of ${formatINR(totalIncome)} income.`,
    },
    {
      metric: 'Emergency Fund',
      score: isOnboarded ? `${Math.round((userProfile.emergencyFundAmount / (userProfile.essentialExpenses || 1)) * 10) / 10} Mos` : '6.0 Months',
      target: '6.0 Months',
      status: 'Excellent',
      description: `${formatINR(isOnboarded ? userProfile.emergencyFundAmount : 180000)} liquid buffer.`,
    },
    {
      metric: 'Debt-to-Income',
      score: `${emiRatioPct}%`,
      target: '< 30%',
      status: 'Excellent',
      description: emiRatioPct > 0 ? `${formatINR(totalEmis)} monthly debt outflow` : 'Zero active loan obligations',
    },
    {
      metric: 'Diversification',
      score: '75 / 100',
      target: '80 / 100',
      status: 'Good',
      description: 'Distributed across Equities, Debt & Gold',
    },
  ];

  const benchmarkAllocation = isOnboarded
    ? [
        { name: 'Equity Mutual Funds', value: userProfile.portfolio.mutualFunds, percentage: Math.round((userProfile.portfolio.mutualFunds / netWorthValue) * 100) || 50, color: '#10b981' },
        { name: 'Direct Equities / Stocks', value: userProfile.portfolio.stocks, percentage: Math.round((userProfile.portfolio.stocks / netWorthValue) * 100) || 30, color: '#6366f1' },
        { name: 'Fixed Income / FDs', value: userProfile.portfolio.fixedDeposits, percentage: Math.round((userProfile.portfolio.fixedDeposits / netWorthValue) * 100) || 10, color: '#f59e0b' },
        { name: 'Gold Reserves', value: userProfile.portfolio.gold, percentage: Math.round((userProfile.portfolio.gold / netWorthValue) * 100) || 10, color: '#eab308' },
      ].filter(item => item.value > 0 || item.percentage > 0)
    : [
        { name: 'Equity Mutual Funds', value: 210000, percentage: 60, color: '#10b981' },
        { name: 'Fixed Deposits & Debt', value: 87500, percentage: 25, color: '#6366f1' },
        { name: 'Gold Reserves', value: 52500, percentage: 15, color: '#eab308' },
      ];

  const goalTitle = isOnboarded ? userProfile.primaryGoal.name : 'Home Down Payment';
  const targetCorpus = isOnboarded ? userProfile.primaryGoal.targetAmount : 1500000;
  const timeframeYears = isOnboarded ? userProfile.primaryGoal.timeframeYears : 5;
  const monthlySip = isOnboarded ? userProfile.primaryGoal.monthlyCommitmentAmount : 15000;
  const goalProgressPct = isOnboarded
    ? Math.min(100, Math.round((userProfile.primaryGoal.accumulatedAmount / targetCorpus) * 100))
    : 35;

  return (
    <div className="space-y-6 animate-in fade-in duration-150 relative">
      {/* ENTRY MODAL PROMPT */}
      <OnboardingEntryModal
        isOpen={showEntryModal}
        onClose={handleCloseModal}
        onStartOnboarding={handleStartOnboarding}
      />

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
                <span className="font-bold text-indigo-500 font-mono">Sample Early Career Benchmark (₹75k/mo Baseline)</span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-500 transition shadow-sm self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4 text-emerald-500" />
          <span>{isOnboarded ? 'Edit Wealth Blueprint' : 'Complete Onboarding to Customize'}</span>
        </button>
      </div>

      {/* ROW 1: KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Financial Health"
          value={`${currentHealthScore} / 100`}
          icon={Activity}
          change={currentHealthScore >= 70 ? 'Strong Baseline' : 'Good Baseline'}
          changeType="positive"
          description={isOnboarded ? 'Personalized FinLabs Score' : 'National Peer Benchmark'}
        />

        <StatCard
          title="Monthly Cash Inflow"
          value={formatINR(totalIncome)}
          icon={Wallet}
          change="Predictable Inflow"
          changeType="neutral"
          description="Net Take-Home Inflow"
        />

        <StatCard
          title="Monthly Savings Surplus"
          value={formatINR(monthlySavings)}
          icon={PiggyBank}
          change={`${savingsRatePct}% Savings Rate`}
          changeType="positive"
          description="Investable Monthly Cash"
        />

        <StatCard
          title="Portfolio Value"
          value={formatINR(netWorthValue)}
          icon={TrendingUp}
          change={`${benchmarkAllocation.length} Asset Classes`}
          changeType="positive"
          description="Consolidated Net Holdings"
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
            <CardDescription>{isOnboarded ? 'Calculated from your personalized financial profile' : 'Standard 28-year-old professional peer benchmarks'}</CardDescription>
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

      {/* ROW 3 & ROW 4: GOALS & PORTFOLIO */}
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
                <span>View goals</span>
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
                  <span>Monthly SIP: {formatINR(monthlySip)}</span>
                  <span>Target Corpus: {formatINR(targetCorpus)}</span>
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
                <CardDescription>Asset allocation across selected asset classes</CardDescription>
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
                {benchmarkAllocation.map((item, idx) => (
                  <div
                    key={idx}
                    className="h-full transition-all duration-300"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                {benchmarkAllocation.map((item, idx) => (
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
                <Badge variant="brand" className="text-[10px]">Financial Engine Insight</Badge>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Optimal Growth Horizon
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                SIP Step-Up & Compounding Strategy
              </h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {isOnboarded
                  ? `Your current savings surplus of ${formatINR(monthlySavings)}/mo (${savingsRatePct}%) gives you strong leverage. Increasing your monthly goal allocation by ₹2,000 accelerates your ${goalTitle} timeline by 14 months.`
                  : `In the early career benchmark (₹75k/mo baseline), allocating 20% to equity SIPs accelerates long-term compounding by 18% over traditional FDs.`}
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

      {/* SUBTLE BENCHMARK FOOTER CTA (Non-Onboarded Only) */}
      {!isOnboarded && (
        <BenchmarkFooterBanner message="Currently displaying the Early Career Benchmark. Complete onboarding to map your own assets." />
      )}
    </div>
  );
}
