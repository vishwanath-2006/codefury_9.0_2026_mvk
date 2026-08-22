import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Sparkles,
  ArrowRight,
  Sliders,
  HelpCircle,
  BarChart3
} from 'lucide-react';

export default function RiskProfilerPage() {
  const navigate = useNavigate();
  const { userProfile, isOnboarded } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  // User Onboarding Defaults
  const userTimeframeYears = userProfile?.primaryGoal?.timeframeYears || 5;
  const userRiskScore = userProfile?.riskScore || 2; // 1: Conservative, 2: Moderate, 3: Aggressive

  // Interactive Scenario Simulator States
  const [horizonYears, setHorizonYears] = useState(userTimeframeYears);
  const [dipReaction, setDipReaction] = useState(userRiskScore === 1 ? 15 : userRiskScore === 3 ? 90 : 55);
  const [goalUrgencyType, setGoalUrgencyType] = useState(
    userTimeframeYears < 2 ? 'emergency' : userTimeframeYears <= 5 ? 'milestone' : 'wealth'
  );

  // 1. Goal Urgency Vector Score S_goal
  const sGoal = goalUrgencyType === 'emergency' ? 20 : goalUrgencyType === 'milestone' ? 60 : 95;

  // 2. Investment Horizon Vector Score S_horizon
  const sHorizon =
    horizonYears < 1
      ? 10
      : horizonYears <= 3
      ? 35
      : horizonYears <= 5
      ? 65
      : horizonYears <= 10
      ? 85
      : 100;

  // 3. Behavioral Volatility Score S_tolerance
  const sTolerance = dipReaction;

  // 4. Composite Risk Quotient (PRQ: 0-100)
  const prq = Math.round(0.30 * sGoal + 0.35 * sHorizon + 0.35 * sTolerance);

  // 5. Risk Archetype Classification
  const archetype =
    prq <= 35
      ? { label: 'Conservative (Capital Shield)', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' }
      : prq <= 70
      ? { label: 'Moderate (Balanced Compounder)', color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/30' }
      : { label: 'Aggressive (Alpha Accelerator)', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' };

  // Recommended Benchmark Allocation based on Archetype
  const benchmarkAlloc =
    prq <= 35
      ? [
          { name: 'Large Cap Equities', pct: 15, color: '#10b981' },
          { name: 'Mid/Small Cap', pct: 0, color: '#6366f1' },
          { name: 'Fixed Income / FDs', pct: 75, color: '#f59e0b' },
          { name: 'Gold Reserves', pct: 10, color: '#eab308' },
        ]
      : prq <= 70
      ? [
          { name: 'Large Cap Equities', pct: 45, color: '#10b981' },
          { name: 'Mid/Small Cap', pct: 15, color: '#6366f1' },
          { name: 'Fixed Income / FDs', pct: 30, color: '#f59e0b' },
          { name: 'Gold Reserves', pct: 10, color: '#eab308' },
        ]
      : [
          { name: 'Large Cap Equities', pct: 50, color: '#10b981' },
          { name: 'Mid/Small Cap', pct: 35, color: '#6366f1' },
          { name: 'Fixed Income / FDs', pct: 10, color: '#f59e0b' },
          { name: 'Gold Reserves', pct: 5, color: '#eab308' },
        ];

  // User Current Allocation
  const portfolio = userProfile.portfolio || { mutualFunds: 175000, stocks: 105000, fixedDeposits: 35000, gold: 35000, cashBuffer: 150000 };
  const totalNetWorth = userProfile.totalPortfolioNetWorth || 350000;
  const currentEquityValue = portfolio.mutualFunds + portfolio.stocks;
  const actualEquityPct = Math.round((currentEquityValue / (totalNetWorth || 1)) * 100);

  const targetEquityPct = benchmarkAlloc[0].pct + benchmarkAlloc[1].pct;
  const equityDiff = actualEquityPct - targetEquityPct;
  const isDeviated = Math.abs(equityDiff) > 20;

  const profilerContent = (
    <div className="space-y-8">
      {/* SECTION A: PROFILE SUMMARY & DYNAMIC GAUGE CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RADIAL SCORE GAUGE */}
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-slate-900 text-white border-slate-800 shadow-xl">
          <CardHeader className="p-0 pb-2 mb-2 w-full text-center border-b border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Personalized Risk Quotient
            </span>
            <CardTitle className="text-base font-extrabold text-white">PRQ Score</CardTitle>
          </CardHeader>

          {/* SVG Radial Arc Gauge */}
          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400 transition-all duration-700 ease-out"
                strokeDasharray={`${prq}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold font-mono text-white">{prq}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Out of 100</span>
            </div>
          </div>

          <div className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold ${archetype.bg} ${archetype.color}`}>
            {archetype.label}
          </div>
        </Card>

        {/* SUB-SCORE MATRIX (3 PROGRESS BARS) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Risk Vector Sub-Score Breakdown
            </CardTitle>
            <CardDescription>Evaluates Goal Urgency, Investment Horizon Capacity, and Volatility Comfort</CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5">
            {/* Vector 1: Goal Urgency */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">1. Goal Urgency & Capital Priority ($S_{'{goal}'}$)</span>
                <span className="font-mono font-extrabold text-emerald-500">{sGoal} / 100 pts</span>
              </div>
              <ProgressIndicator value={sGoal} max={100} color="emerald" />
              <p className="text-[10px] text-slate-400">
                {goalUrgencyType === 'emergency' ? 'Emergency / Preservation (<2 Yrs)' : goalUrgencyType === 'milestone' ? 'Milestone Target (2-5 Yrs)' : 'Long-term Wealth (5+ Yrs)'}
              </p>
            </div>

            {/* Vector 2: Time Horizon */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">2. Time Horizon Capacity ($S_{'{horizon}'}$)</span>
                <span className="font-mono font-extrabold text-indigo-500">{sHorizon} / 100 pts</span>
              </div>
              <ProgressIndicator value={sHorizon} max={100} color="sky" />
              <p className="text-[10px] text-slate-400">
                {horizonYears} Years Investment Horizon
              </p>
            </div>

            {/* Vector 3: Behavioral Volatility */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">3. Behavioral Volatility Comfort ($S_{'{tolerance}'}$)</span>
                <span className="font-mono font-extrabold text-amber-500">{sTolerance} / 100 pts</span>
              </div>
              <ProgressIndicator value={sTolerance} max={100} color="amber" />
              <p className="text-[10px] text-slate-400">
                {sTolerance <= 25 ? 'Panic/Liquidate in 20% Dip' : sTolerance <= 65 ? 'Hold & Wait out Volatility' : 'Aggressive Dip-Buyer'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION B: TARGET VS CURRENT ALLOCATION & REBALANCING ALERT */}
      <div className="space-y-4">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Target vs. Current Holding Allocation
              </CardTitle>
              <CardDescription>Compares actual portfolio asset distribution against PRQ benchmark allocation</CardDescription>
            </div>
            <Badge variant="brand" className="font-mono text-xs">
              {archetype.label.split(' ')[0]} Benchmark
            </Badge>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CURRENT ALLOCATION */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Current Portfolio Allocation</h4>
                  <span className="font-mono text-xs font-bold text-emerald-500">{actualEquityPct}% Equity</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono"><span>Mutual Funds & Stocks:</span> <strong className="text-emerald-500">{formatINR(currentEquityValue)} ({actualEquityPct}%)</strong></div>
                  <div className="flex justify-between text-xs font-mono"><span>FDs & Liquid Cash:</span> <strong className="text-amber-500">{formatINR(portfolio.fixedDeposits + portfolio.cashBuffer)} ({100 - actualEquityPct}%)</strong></div>
                </div>
              </div>

              {/* RECOMMENDED BENCHMARK */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider">Recommended PRQ Target</h4>
                  <span className="font-mono text-xs font-bold text-emerald-400">{targetEquityPct}% Equity Ceiling</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  {benchmarkAlloc.map((b, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-300">{b.name}:</span>
                      <strong className="text-white">{b.pct}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* REBALANCING DIAGNOSTIC ALERT */}
            {isDeviated ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">Actionable Rebalancing Diagnostic Alert</h4>
                  <p className="text-xs leading-relaxed font-medium">
                    Your portfolio is currently <strong>{actualEquityPct}% equity</strong>, but your {horizonYears}-year timeline suggests a <strong>{targetEquityPct}% equity ceiling</strong> to protect capital. Consider rebalancing into fixed income.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider mb-0.5">Optimal Asset Alignment</h4>
                  <p className="text-xs leading-relaxed font-medium">
                    Your equity allocation of {actualEquityPct}% matches your recommended PRQ target within safe variance limits!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECTION C: INTERACTIVE SCENARIO SIMULATOR */}
      <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
              Live Interactive Simulator
            </span>
            <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Risk Scenario Profiling Simulator
            </CardTitle>
          </div>
          <Badge variant="brand" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            Live PRQ Recalculation
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slider 1: Horizon */}
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300">Investment Horizon</label>
                <span className="font-mono font-extrabold text-emerald-400">{horizonYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={horizonYears}
                onChange={(e) => setHorizonYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Yr</span>
                <span>20 Yrs</span>
              </div>
            </div>

            {/* Slider 2: Dip Reaction */}
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-300">Market Dip Reaction</label>
                <span className="font-mono font-extrabold text-indigo-400">
                  {dipReaction <= 25 ? 'Panic' : dipReaction <= 65 ? 'Hold' : 'Buy Dip'}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="25"
                value={dipReaction}
                onChange={(e) => setDipReaction(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Panic</span>
                <span>Opportunistic</span>
              </div>
            </div>

            {/* Selector 3: Goal Urgency */}
            <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-300">Primary Goal Urgency</label>
              <select
                value={goalUrgencyType}
                onChange={(e) => setGoalUrgencyType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-extrabold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="emergency">Emergency / Capital Preservation</option>
                <option value="milestone">Milestone Target (Home / Education)</option>
                <option value="wealth">Long-term Wealth & Retirement</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // NON-ONBOARDED BLURRED LOCK ARCHITECTURE
  if (!isOnboarded) {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <PageHeader
          title="Risk Profiler & Asset Allocation Engine"
          subtitle="Evaluates goal urgency, horizon capacity, and volatility tolerance to generate your Composite Risk Quotient (PRQ)."
          tag="Risk Intelligence"
        />

        <FeatureOverviewCard
          moduleName="Risk Profiler Engine"
          subtitle="Computes your Composite Risk Quotient (PRQ: 0-100) and matches your portfolio against recommended asset allocation benchmarks."
          capabilities={[
            "Composite Risk Quotient (PRQ): Combines Goal Urgency (30%), Time Horizon (35%), and Volatility Tolerance (35%).",
            "Target vs Current Allocation: Side-by-side benchmark comparison with rebalancing diagnostic alerts.",
            "Interactive Scenario Simulator: Test how changing your investment timeframe alters your risk archetype live."
          ]}
          whyItMatters={[
            "Investing without assessing your true risk capacity leads to impulse selling during market corrections.",
            "Rebalancing your equity vs fixed-income ratio protects capital as your milestone target date approaches."
          ]}
        >
          {profilerContent}
        </FeatureOverviewCard>
      </div>
    );
  }

  // ONBOARDED Crisp Live Mode
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Risk Profiler & Asset Allocation Engine"
        subtitle="Evaluates goal urgency, horizon capacity, and volatility tolerance to generate your Composite Risk Quotient (PRQ)."
        tag="Risk Intelligence"
      />

      {profilerContent}
    </div>
  );
}
