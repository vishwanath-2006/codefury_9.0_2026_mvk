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
  BarChart3,
  Lightbulb,
  HeartHandshake
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

  // 5. Risk Archetype Classification & Human Translation
  const archetype =
    prq <= 35
      ? {
          label: 'Conservative Investor (Capital Shield)',
          shortLabel: 'Conservative',
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/30',
          badgeVar: 'warning',
          translation:
            'Your priority is keeping your money 100% safe. You prefer steady, guaranteed returns over high-growth stock market swings.',
        }
      : prq <= 70
      ? {
          label: 'Balanced Investor (Moderate Growth)',
          shortLabel: 'Balanced Investor',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          badgeVar: 'brand',
          translation:
            'You want your money to grow faster than a bank FD, but you don\'t want extreme rollercoaster risks. A balanced mix of stable funds and stocks is your sweet spot.',
        }
      : {
          label: 'Aggressive Investor (Alpha Accelerator)',
          shortLabel: 'Aggressive Growth',
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10 border-indigo-500/30',
          badgeVar: 'purple',
          translation:
            'You are focused on maximum long-term wealth growth. You don\'t mind short-term market dips because you have time on your side.',
        };

  // Recommended Benchmark Allocation based on Archetype
  const benchmarkAlloc =
    prq <= 35
      ? [
          { name: 'Large Company Stocks & Index Funds', pct: 15, color: '#10b981' },
          { name: 'Growing Mid/Small Company Funds', pct: 0, color: '#06b6d4' },
          { name: 'Safe Fixed Deposits & Bonds', pct: 75, color: '#3b82f6' },
          { name: 'Gold Reserves', pct: 10, color: '#eab308' },
        ]
      : prq <= 70
      ? [
          { name: 'Large Company Stocks & Index Funds', pct: 45, color: '#10b981' },
          { name: 'Growing Mid/Small Company Funds', pct: 15, color: '#06b6d4' },
          { name: 'Safe Fixed Deposits & Bonds', pct: 30, color: '#3b82f6' },
          { name: 'Gold Reserves', pct: 10, color: '#eab308' },
        ]
      : [
          { name: 'Large Company Stocks & Index Funds', pct: 50, color: '#10b981' },
          { name: 'Growing Mid/Small Company Funds', pct: 35, color: '#06b6d4' },
          { name: 'Safe Fixed Deposits & Bonds', pct: 10, color: '#3b82f6' },
          { name: 'Gold Reserves', pct: 5, color: '#eab308' },
        ];

  // User Current Allocation
  const portfolio = userProfile.portfolio || { mutualFunds: 0, stocks: 0, fixedDeposits: 150000, gold: 0, cashBuffer: 150000 };
  const totalNetWorth = userProfile.totalPortfolioNetWorth || 300000;
  const currentEquityValue = (portfolio.mutualFunds || 0) + (portfolio.stocks || 0);
  const actualEquityPct = Math.round((currentEquityValue / (totalNetWorth || 1)) * 100);

  const targetEquityPct = benchmarkAlloc[0].pct + benchmarkAlloc[1].pct;
  const isZeroEquity = actualEquityPct === 0;

  const profilerContent = (
    <div className="space-y-8">
      {/* EXPLANATORY VALUE PROPOSITION BANNER */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              How the Risk Profiler Helps You
              <Badge variant="brand" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                Personal Wealth Shield
              </Badge>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium mt-1">
              By analyzing your <strong>Goal Urgency</strong>, <strong>Investment Timeline</strong>, and <strong>Market Comfort Level</strong>, this engine computes your <strong>Personal Risk Score (0–100)</strong>. It protects you from panic selling during market dips and tells you exactly when to rebalance into fixed income as your milestone date nears.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION A: SCORE CARD & SUB-SCORE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SCORE DISPLAY CARD WITH DONUT SCORE */}
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-slate-900 text-white border-slate-800 shadow-xl">
          <CardHeader className="p-0 pb-2 mb-2 w-full text-center border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Your Personal Risk Score
            </span>
            <CardTitle className="text-base font-extrabold text-white">Investor Profile Score</CardTitle>
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
              <span className="text-4xl font-extrabold font-mono text-white">{prq} / 100</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Risk Score</span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full border text-xs font-extrabold mb-3 ${archetype.bg} ${archetype.color}`}>
            {archetype.label}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium px-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            "{archetype.translation}"
          </p>
        </Card>

        {/* HUMAN-FRIENDLY SUB-SCORE MATRIX */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              What Drives Your Risk Score?
            </CardTitle>
            <CardDescription>Understanding the 3 core factors that shape your ideal investment balance</CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {/* Factor 1: Goal Urgency */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">1. Goal Urgency & Importance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">How soon and how badly you need this money</span>
                </div>
                <span className="font-mono font-extrabold text-emerald-500 text-sm">{sGoal} / 100</span>
              </div>
              <ProgressIndicator value={sGoal} max={100} color="emerald" />
            </div>

            {/* Factor 2: Time Horizon */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">2. Investment Timeline</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">How many years you can let your money grow without touching it</span>
                </div>
                <span className="font-mono font-extrabold text-sky-500 text-sm">{sHorizon} / 100</span>
              </div>
              <ProgressIndicator value={sHorizon} max={100} color="sky" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                ⏱️ Current Selection: <strong>{horizonYears} Years Growth Timeline</strong>
              </p>
            </div>

            {/* Factor 3: Market Comfort Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-sm">3. Market Comfort Level</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">How calm you stay when market prices go up and down</span>
                </div>
                <span className="font-mono font-extrabold text-amber-500 text-sm">{sTolerance} / 100</span>
              </div>
              <ProgressIndicator value={sTolerance} max={100} color="amber" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                🎢 Reaction to 20% Dip: <strong>{sTolerance <= 25 ? 'Panic & Sell' : sTolerance <= 65 ? 'Stay Calm & Hold' : 'Buy the Discount'}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION B: VISUAL ALLOCATION DONUT / BAR CHARTS */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-base font-extrabold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Where Your Money Is vs. Where It Should Be
            </CardTitle>
            <CardDescription>Visual comparison of your actual holdings against your recommended balance</CardDescription>
          </div>
          <Badge variant="brand" className="font-mono text-xs">
            {archetype.shortLabel}
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT CHART: WHERE YOUR MONEY IS RIGHT NOW */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Where Your Money Is Right Now</h4>
                  <Badge variant={isZeroEquity ? "neutral" : "success"} className="text-[10px]">
                    {isZeroEquity ? 'Too Safe / Low Growth' : 'Active Growth'}
                  </Badge>
                </div>

                {/* Allocation Stack Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 mb-4">
                  {actualEquityPct > 0 && (
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${actualEquityPct}%` }} />
                  )}
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${100 - actualEquityPct}%` }} />
                </div>

                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Fixed Deposits & Cash Buffer:
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{100 - actualEquityPct}%</span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Stocks & Mutual Funds:
                    </span>
                    <span className="font-mono font-bold text-emerald-500">{actualEquityPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CHART: RECOMMENDED BALANCE FOR YOU */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-extrabold text-sm text-emerald-400">Recommended Balance For You</h4>
                  <Badge variant="brand" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    Optimal Growth & Safety Blend
                  </Badge>
                </div>

                {/* Recommended Stack Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800 mb-4">
                  {benchmarkAlloc.map((b, i) => (
                    <div
                      key={i}
                      className="h-full transition-all duration-500"
                      style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                      title={`${b.name}: ${b.pct}%`}
                    />
                  ))}
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {benchmarkAlloc.map((b, i) => (
                    <div key={i} className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="flex items-center gap-2 text-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        {b.name}:
                      </span>
                      <span className="font-mono font-bold text-white">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HUMAN-READABLE ALERT CARD */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-slate-100 flex items-start gap-3.5 shadow-sm">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-amber-600 dark:text-amber-400">
                💡 Easy Fix for Faster Growth
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {isZeroEquity ? (
                  <>
                    Right now, <strong>100% of your money</strong> is sitting in low-interest cash and FDs. Since you have a <strong>{horizonYears}-year timeline</strong>, inflation will eat away your purchasing power. Shifting a small portion into index mutual funds will help you reach your goals much faster without taking crazy risks.
                  </>
                ) : (
                  <>
                    Your current mix has <strong>{actualEquityPct}% in growth assets</strong>. For a <strong>{horizonYears}-year horizon</strong>, keeping around <strong>{targetEquityPct}% in stocks & mutual funds</strong> provides the perfect balance between beating inflation and keeping your capital safe.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION C: INTERACTIVE SIMULATOR (ZERO JARGON) */}
      <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Try It Out Live
            </span>
            <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Test How Your Risk Score Changes
            </CardTitle>
          </div>
          <Badge variant="brand" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            Live Recalculation
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control 1: How long will you invest? */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-extrabold text-xs text-slate-200">How long will you invest?</label>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs">
                    {horizonYears} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2">
                <span>1 Year (Short)</span>
                <span>20 Years (Long)</span>
              </div>
            </div>

            {/* Control 2: If market drops 20% */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <label className="font-extrabold text-xs text-slate-200 block">If the market drops 20%, you will:</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Panic & Sell', val: 15 },
                  { label: 'Stay Calm & Hold', val: 55 },
                  { label: 'Buy the Discount', val: 90 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setDipReaction(opt.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition text-left flex items-center justify-between ${
                      dipReaction === opt.val
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {dipReaction === opt.val && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Target goal is for */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <label className="font-extrabold text-xs text-slate-200 block">Your target goal is for:</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Emergency Safety', val: 'emergency' },
                  { label: 'House / Education', val: 'milestone' },
                  { label: 'Long-Term Wealth', val: 'wealth' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setGoalUrgencyType(opt.val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition text-left flex items-center justify-between ${
                      goalUrgencyType === opt.val
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {goalUrgencyType === opt.val && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
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
          subtitle="Evaluates your goal urgency, timeline, and market comfort to find your ideal investment sweet spot."
          tag="Risk Intelligence"
        />

        <FeatureOverviewCard
          moduleName="Risk Profiler Engine"
          subtitle="Computes your Investor Risk Score (0-100) and matches your portfolio against recommended asset allocation benchmarks."
          capabilities={[
            "Personalized Investor Risk Score (0-100): Evaluates your goal timeline, urgency, and market comfort.",
            "Side-by-Side Visual Asset Allocation: Shows where your money is right now vs. where it should be.",
            "Interactive Live Simulator: Test how changing your timeline or dip reaction updates your score in real time."
          ]}
          whyItMatters={[
            "Investing without assessing your true risk comfort leads to panic selling during market corrections.",
            "Rebalancing your equity vs fixed-income ratio protects your capital as your target date approaches."
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
        subtitle="Evaluates your goal urgency, timeline, and market comfort to find your ideal investment sweet spot."
        tag="Risk Intelligence"
      />

      {profilerContent}
    </div>
  );
}
