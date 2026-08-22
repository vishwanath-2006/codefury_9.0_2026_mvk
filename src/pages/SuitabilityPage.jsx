import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import { Sparkles, CheckCircle2, AlertTriangle, Info, ShieldAlert, Clock, Award, ArrowRight } from 'lucide-react';

export default function SuitabilityPage() {
  const { userProfile, isOnboarded } = useOnboarding();

  // Dynamic Suitability Evaluator
  const emergencyRunwayMonths = userProfile.essentialExpenses > 0
    ? Math.round((userProfile.emergencyFundAmount / userProfile.essentialExpenses) * 10) / 10
    : 3;

  const timeframeYears = userProfile.primaryGoal.timeframeYears || 5;

  const riskLabel = userProfile.riskProfileLabel || 'Moderate';
  const isConservative = userProfile.riskScore === 1;
  const isAggressive = userProfile.riskScore === 3;

  const dynamicInsights = [
    // 1. Risk Appetite Match
    {
      id: 's1',
      type: isAggressive ? 'positive' : isConservative ? 'warning' : 'info',
      tag: 'Risk Appetite Evaluation',
      title: `Risk Profile Match: ${riskLabel} Investor`,
      description: isConservative
        ? 'Your profile reflects a Conservative risk tolerance. Your wealth blueprint prioritizes capital preservation and high-grade fixed income instruments over volatile equities.'
        : isAggressive
        ? 'Your profile reflects an Aggressive growth profile. You have high volatility tolerance and can allocate up to 75%+ towards equity mutual funds & direct stocks.'
        : 'Your profile reflects a Moderate balanced strategy. A 60/40 mix between equity mutual funds and debt instruments optimizes returns while buffering drawdowns.',
      impact: isConservative ? 'Capital Preservation' : isAggressive ? 'Maximum Wealth Alpha' : 'Balanced Growth',
      cta: 'View Recommended Funds'
    },

    // 2. Time Horizon Alignment
    {
      id: 's2',
      type: timeframeYears >= 5 ? 'positive' : 'warning',
      tag: 'Time Horizon Alignment',
      title: `${timeframeYears}-Year Horizon Alignment for ${userProfile.primaryGoal.name}`,
      description: timeframeYears >= 5
        ? `With a ${timeframeYears}-year horizon, equity compounding is highly suitable. Short-term market dips are statistically smoothed out over 5+ year horizons.`
        : `Your ${timeframeYears}-year target date is short-term. Locking capital into volatile equities is risky. Allocate a higher ratio towards liquid debt and fixed deposits.`,
      impact: timeframeYears >= 5 ? 'High Equity Suitability' : 'Fixed Income Preferred',
      cta: 'Simulate Horizon Returns'
    },

    // 3. Liquidity Requirement Shield
    {
      id: 's3',
      type: emergencyRunwayMonths >= 3 ? 'positive' : 'warning',
      tag: 'Liquidity Requirement Safeguard',
      title: `Emergency Cushion Audit: ${emergencyRunwayMonths} Months Covered`,
      description: emergencyRunwayMonths >= 3
        ? `Your liquid buffer covers ${emergencyRunwayMonths} months of essential living expenses, satisfying the FinLabs liquidity safeguard.`
        : `WARNING: Your emergency runway covers only ${emergencyRunwayMonths} months of essential expenses. Locking funds in equity is NOT recommended until a 3-month emergency cushion is established.`,
      impact: emergencyRunwayMonths >= 3 ? 'Safeguard Passed' : 'Action Required',
      cta: 'Top Up Emergency Fund'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Global Overview Mode Banner */}
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="Personalized Suitability Engine"
        subtitle="Algorithmic suitability evaluation matching your risk profile, timeline, and liquidity shield."
        tag="Intelligence"
      />

      <div className="space-y-4">
        {dynamicInsights.map((insight) => (
          <Card key={insight.id} hover className="p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'neutral'}>
                    {insight.tag}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">Impact: {insight.impact}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{insight.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                  {insight.description}
                </p>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shrink-0 self-start sm:self-center flex items-center gap-1.5 shadow-sm">
                <span>{insight.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
