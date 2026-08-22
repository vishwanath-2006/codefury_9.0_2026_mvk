import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Activity,
  Target,
  PieChart,
  Sparkles,
  ArrowRight,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { formData, userProfile, isOnboarded } = useOnboarding();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSuitabilityCard, setSelectedSuitabilityCard] = useState(null);

  // What-If Simulator Range Slider State
  const defaultSurplus = userProfile.netMonthlySurplus || 20000;
  const [simMonthlyInvestment, setSimMonthlyInvestment] = useState(defaultSurplus);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  const formatLakhs = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return formatINR(val);
  };

  // Dynamic User Name & Avatar
  const googleName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
  const userName = isOnboarded ? (formData.fullName || googleName || 'Manoj') : 'Investor Profile';
  const avatarUrl = isOnboarded ? (formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url) : null;

  // Onboarded Calculation Engine Output
  const netWorthValue = userProfile.totalPortfolioNetWorth || 350000;
  const netSurplus = userProfile.netMonthlySurplus || 20000;
  const runwayMonths = userProfile.emergencyRunwayMonths || 5.0;
  const dti = userProfile.dtiRatio || 0;
  const totalEmis = userProfile.totalMonthlyEmis || 0;
  const healthScore = userProfile.weightedHealthScore || 78;
  const savingsRatePct = userProfile.savingsRate || 28;

  // Section 2: Goal Runway & Annuity
  const primaryGoal = userProfile.primaryGoal || {};
  const goalTitle = primaryGoal.name || 'Home Down Payment';
  const targetCorpus = primaryGoal.targetAmount || 1500000;
  const timeframeYears = primaryGoal.timeframeYears || 5;
  const accumulatedAmount = primaryGoal.accumulatedAmount || 450000;
  const requiredSip = primaryGoal.requiredGoalSip || 15000;
  const committedSip = primaryGoal.committedGoalSip || 15000;
  const sipDiff = committedSip - requiredSip;
  const isOnTrack = sipDiff >= 0;

  const goalProgressPct = Math.min(100, Math.round((accumulatedAmount / (targetCorpus || 1)) * 100)) || 30;

  // Section 3: Portfolio Asset Allocation Donut Data
  const portfolio = userProfile.portfolio || { mutualFunds: 175000, stocks: 105000, fixedDeposits: 35000, gold: 35000, cashBuffer: 150000 };
  const assetAllocation = [
    { name: 'Mutual Funds / SIPs', value: portfolio.mutualFunds, color: '#10b981' },
    { name: 'Direct Equity / Stocks', value: portfolio.stocks, color: '#6366f1' },
    { name: 'Fixed Income / FDs', value: portfolio.fixedDeposits, color: '#f59e0b' },
    { name: 'Gold Reserves', value: portfolio.gold, color: '#eab308' },
    { name: 'Liquid Cash Buffer', value: portfolio.cashBuffer, color: '#06b6d4' },
  ].filter(a => a.value > 0);

  const maxAsset = assetAllocation.reduce((max, item) => (item.value > max.value ? item : max), assetAllocation[0] || { name: 'Equities', value: 0 });
  const maxAssetPct = Math.round((maxAsset.value / (netWorthValue || 1)) * 100);
  const isConcentrated = maxAssetPct > 60;

  // Section 4: Suitability Matrix Data
  const suitability = userProfile.suitability || { sipScore: 92, stockScore: 68, fixedScore: 55, ipoScore: 35 };

  // Section 5: What-If Compounding Curve (12% CAGR)
  const calculateForwardWealth = (monthlyInv, years) => {
    const months = years * 12;
    const r = 0.01;
    return Math.round(monthlyInv * ((Math.pow(1 + r, months) - 1) / r) * (1 + r));
  };

  const wealth3Yr = calculateForwardWealth(simMonthlyInvestment, 3);
  const wealth5Yr = calculateForwardWealth(simMonthlyInvestment, 5);
  const wealth10Yr = calculateForwardWealth(simMonthlyInvestment, 10);

  const dashboardContent = (
    <div className="space-y-6">
      {/* TOP BAR: DYNAMIC USER GREETING & QUICK STAT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex items-center gap-3.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xl shadow-md shadow-emerald-500/20 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Welcome back, {userName}
              </h1>
              <Badge variant="brand" className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {userProfile.occupation || 'Professional'}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                {userProfile.cityTier || 'Tier 1 Metro'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Risk Profile: <span className="font-bold text-emerald-400">{userProfile.riskProfileLabel || 'Moderate'} Investor</span> — Deterministic Engine Active
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition shadow-sm self-start sm:self-auto shrink-0"
        >
          <Settings2 className="w-4 h-4 text-emerald-400" />
          <span>Edit Profile Baseline</span>
        </button>
      </div>

      {/* TOP 4 KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Worth"
          value={formatLakhs(netWorthValue)}
          icon={TrendingUp}
          change={`${assetAllocation.length} Active Asset Classes`}
          changeType="positive"
          description="Liquid + Emergency + Investments"
        />

        <StatCard
          title="Monthly Net Surplus"
          value={formatINR(netSurplus)}
          icon={PiggyBank}
          change={`${savingsRatePct}% Savings Rate`}
          changeType={netSurplus > 0 ? "positive" : "negative"}
          description="Investable Cash After Outflows"
        />

        <StatCard
          title="Emergency Cushion"
          value={`${runwayMonths} Months`}
          icon={ShieldCheck}
          change={runwayMonths >= 6 ? "Safe Buffer (6+ Mos)" : "Low Buffer (<6 Mos)"}
          changeType={runwayMonths >= 6 ? "positive" : "negative"}
          description={`${formatINR(userProfile.emergencyReserves || 300000)} Liquid Reserves`}
        />

        <StatCard
          title="Active Debt Burden"
          value={`${dti}% DTI`}
          icon={Wallet}
          change={totalEmis > 0 ? `${formatINR(totalEmis)}/mo` : 'Zero Active Loans'}
          changeType={dti <= 30 ? "positive" : "negative"}
          description="Monthly EMI Outflow Ratio"
        />
      </div>

      {/* SECTION 1: FINANCIAL HEALTH GAUGE & DIAGNOSTIC ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RADIAL GAUGE CARD */}
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <CardHeader className="p-0 pb-2 mb-2 w-full text-center border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-extrabold flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Financial Health Rating
            </CardTitle>
            <CardDescription>Weighted Score Matrix (0-100)</CardDescription>
          </CardHeader>

          {/* SVG Radial Arc Gauge */}
          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                {healthScore}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Out of 100</span>
              <Badge variant={healthScore >= 75 ? 'success' : 'info'} className="mt-1 text-[9px]">
                {healthScore >= 75 ? 'Strong Baseline' : 'Good Baseline'}
              </Badge>
            </div>
          </div>

          <button
            onClick={() => navigate('/financial-health')}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1 mt-2"
          >
            <span>View 6 Diagnostic Pillars</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        {/* RULE-BASED DIAGNOSTIC ALERT CARDS */}
        <div className="lg:col-span-2 space-y-3.5 flex flex-col justify-center">
          {runwayMonths < 3 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">Critical Emergency Alert</h4>
                <p className="text-xs leading-relaxed font-medium">
                  Emergency reserve is critical at {runwayMonths} months. Prioritize building {formatINR(userProfile.essentialExpenses * 3)} before aggressive equity exposure.
                </p>
              </div>
            </div>
          )}

          {dti > 30 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">High Debt Burden Warning</h4>
                <p className="text-xs leading-relaxed font-medium">
                  High EMI burden of {formatINR(totalEmis)}/mo ({dti}% DTI) is eating into your compounding potential.
                </p>
              </div>
            </div>
          )}

          {savingsRatePct >= 30 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">Healthy Savings Habit</h4>
                <p className="text-xs leading-relaxed font-medium">
                  Saving {savingsRatePct}% of your income! You have {formatINR(netSurplus)}/mo available to deploy into wealth accumulation.
                </p>
              </div>
            </div>
          )}

          {isConcentrated && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">Portfolio Concentration Risk</h4>
                <p className="text-xs leading-relaxed font-medium">
                  Concentration risk detected in {maxAsset.name} ({maxAssetPct}% of total net worth). Consider rebalancing into complementary asset classes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: GOAL RUNWAY & REQUIRED ACTION CARD */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-wider block mb-1">
              Active North Star Milestone
            </span>
            <CardTitle className="text-lg font-extrabold">{goalTitle}</CardTitle>
          </div>
          <Badge variant={isOnTrack ? "success" : "warning"} className="font-mono text-xs">
            {isOnTrack ? `On Track (+${formatINR(sipDiff)})` : `Pace Deficit (-${formatINR(Math.abs(sipDiff))}/mo)`}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5 p-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Accumulated: <strong className="text-emerald-500">{formatINR(accumulatedAmount)}</strong></span>
              <span className="text-slate-500">Target Corpus: <strong className="text-slate-900 dark:text-slate-100">{formatINR(targetCorpus)}</strong> ({timeframeYears} Years)</span>
            </div>
            <ProgressIndicator value={goalProgressPct} max={100} color="emerald" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                To reach your <strong className="text-white">{formatINR(targetCorpus)}</strong> goal in <strong className="text-white">{timeframeYears} years</strong>, you need <strong className="text-emerald-400 font-mono text-sm">{formatINR(requiredSip)}/month</strong>.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Your committed monthly goal SIP: {formatINR(committedSip)}/mo
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/goals')}
              className="bg-emerald-500 hover:bg-emerald-600 shrink-0 text-xs font-extrabold"
            >
              Adjust Goal SIP →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: DYNAMIC ASSET ALLOCATION & ECOSYSTEM BADGES */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Consolidated Asset Allocation & Ecosystem
            </CardTitle>
            <CardDescription>Real portfolio distribution across selected asset categories</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono hidden sm:flex">
            <span>Connected Ecosystem:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Zerodha</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Groww</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Angel One</span>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
            {assetAllocation.map((item, idx) => {
              const pct = Math.round((item.value / (netWorthValue || 1)) * 100);
              return (
                <div
                  key={idx}
                  className="h-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                  title={`${item.name}: ${formatINR(item.value)} (${pct}%)`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {assetAllocation.map((item, idx) => {
              const pct = Math.round((item.value / (netWorthValue || 1)) * 100);
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                  <p className="font-mono font-extrabold text-slate-900 dark:text-slate-100">{formatINR(item.value)}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{pct}% of Net Worth</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: PERSONALIZED INVESTMENT SUITABILITY MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Personalized Investment Suitability Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">Engine Scored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Mutual Funds */}
          <Card className="p-5 flex flex-col justify-between border-t-4 border-t-emerald-500">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Badge variant="brand" className="text-[10px]">Index Mutual Funds & SIPs</Badge>
                <span className="font-mono font-extrabold text-lg text-emerald-500">{suitability.sipScore}/100</span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">SIP & Index Funds</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Core wealth building block matching your {timeframeYears}-year horizon.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSuitabilityCard({
                  title: 'Index Mutual Funds & SIPs',
                  score: suitability.sipScore,
                  points: [
                    `Your ${timeframeYears}-year horizon provides strong runway to compound past short-term market volatility.`,
                    `Your savings surplus of ${formatINR(netSurplus)}/mo easily supports systematic monthly discipline.`
                  ]
                });
                setAiModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why This Match?</span>
            </button>
          </Card>

          {/* Card 2: Direct Stocks */}
          <Card className="p-5 flex flex-col justify-between border-t-4 border-t-indigo-500">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Badge variant="purple" className="text-[10px]">Direct Equity / Stocks</Badge>
                <span className="font-mono font-extrabold text-lg text-indigo-500">{suitability.stockScore}/100</span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">Direct Blue-Chip Stocks</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Growth booster aligned with your {userProfile.riskProfileLabel} risk tolerance.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSuitabilityCard({
                  title: 'Direct Equity / Stocks',
                  score: suitability.stockScore,
                  points: [
                    `Assigned ${userProfile.riskProfileLabel} risk profile allows selective allocation to large-cap blue chips.`,
                    `Maintain maximum 30% allocation to keep overall portfolio volatility within limits.`
                  ]
                });
                setAiModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why This Match?</span>
            </button>
          </Card>

          {/* Card 3: Fixed Income & Gold */}
          <Card className="p-5 flex flex-col justify-between border-t-4 border-t-amber-500">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Badge variant="warning" className="text-[10px]">Fixed Income & Gold</Badge>
                <span className="font-mono font-extrabold text-lg text-amber-500">{suitability.fixedScore}/100</span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">Fixed Deposits & Gold</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Capital preservation cushion protecting your baseline emergency buffer.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSuitabilityCard({
                  title: 'Fixed Income & Gold',
                  score: suitability.fixedScore,
                  points: [
                    `Provides safety shield for your ${runwayMonths} months emergency runway.`,
                    `Prevents distress selling of equity assets during market drawdowns.`
                  ]
                });
                setAiModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why This Match?</span>
            </button>
          </Card>
        </div>
      </div>

      {/* SECTION 5: DYNAMIC WHAT-IF SCENARIO SIMULATOR */}
      <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
              Interactive Compounding Engine
            </span>
            <CardTitle className="text-lg font-extrabold text-white">Dynamic "What-If" Wealth Simulator</CardTitle>
          </div>
          <Badge variant="brand" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            12% CAGR Baseline
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          {/* RANGE SLIDER */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-300 uppercase tracking-wider">Monthly Investment Amount</label>
              <span className="text-xl font-extrabold font-mono text-emerald-400">{formatINR(simMonthlyInvestment)}/mo</span>
            </div>
            <input
              type="range"
              min="1000"
              max={Math.max(50000, Math.round(defaultSurplus * 1.5))}
              step="1000"
              value={simMonthlyInvestment}
              onChange={(e) => setSimMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>₹1,000</span>
              <span>Baseline Surplus: {formatINR(defaultSurplus)}</span>
              <span>{formatINR(Math.round(defaultSurplus * 1.5))}</span>
            </div>
          </div>

          {/* FORWARD COMPOUNDING TRAJECTORY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">In 3 Years</span>
              <p className="text-xl font-extrabold font-mono text-white">{formatLakhs(wealth3Yr)}</p>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">+36 Months Compounding</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">In 5 Years</span>
              <p className="text-xl font-extrabold font-mono text-white">{formatLakhs(wealth5Yr)}</p>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">+60 Months Compounding</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-emerald-300 font-extrabold uppercase">In 10 Years</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-400">{formatLakhs(wealth10Yr)}</p>
              <span className="text-[10px] text-emerald-300 font-mono font-semibold">+120 Months Wealth Engine</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI EXPLANATION MODAL */}
      {aiModalOpen && selectedSuitabilityCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">{selectedSuitabilityCard.title}</h3>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                Score: {selectedSuitabilityCard.score}/100
              </span>
            </div>

            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
              FinLabs Engine Rationale:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-200">
              {selectedSuitabilityCard.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setAiModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition mt-4"
            >
              Close Rationale
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // NON-ONBOARDED BLURRED LOCK ARCHITECTURE
  if (!isOnboarded) {
    return (
      <div className="animate-in fade-in duration-150 py-2">
        <PageHeader
          title="Financial Overview & Capabilities"
          subtitle="Educational preview of the FinLabs central wealth intelligence dashboard."
          tag="Overview Mode"
        />

        <div className="mt-6">
          <FeatureOverviewCard
            moduleName="Financial Overview"
            subtitle="Consolidated high-level view of your net worth, health score, active goals, and monthly surplus."
            capabilities={[
              "Live calculation of net worth & portfolio asset classes",
              "Automated financial health score diagnostic rating",
              "Goal target progress & SIP annuity projections",
              "Real-time cash flow surplus and expense tracking"
            ]}
            whyItMatters={[
              "Having a single dashboard view prevents fragmented wealth tracking across multiple bank accounts & broker apps.",
              "Clear visibility of monthly cash surplus guarantees disciplined automated investing."
            ]}
          >
            {dashboardContent}
          </FeatureOverviewCard>
        </div>
      </div>
    );
  }

  // ONBOARDED Crisp Live Mode
  return (
    <div className="animate-in fade-in duration-150 py-2">
      {dashboardContent}
    </div>
  );
}
