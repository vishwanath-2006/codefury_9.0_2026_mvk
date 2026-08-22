import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, resolveUserName } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { getNormalizedFinancialProfile } from '../services/onboardingService';
import { calculateFinancialHealthScore } from '../services/financialHealth/engine';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import { Wallet, TrendingUp, PiggyBank, Activity, Target, PieChart, Sparkles, ArrowRight, Settings2, ShieldCheck } from 'lucide-react';
import { mockPrimaryInsight } from '../mock/finlabsMockData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { formData } = useOnboarding();

  const [normProfile, setNormProfile] = useState(null);

  useEffect(() => {
    let mounted = true;
    setNormProfile(null);
    async function loadNormProfile() {
      if (!user?.id) {
        setNormProfile(null);
        return;
      }
      const data = await getNormalizedFinancialProfile(user.id);
      if (mounted) {
        setNormProfile(data);
      }
    }
    loadNormProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  // Dynamic User Name & Avatar
  const userName = resolveUserName(user, profile) || formData.fullName || 'FinLabs Investor';
  const avatarUrl = formData.profilePhoto || profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Single Source of Truth Metrics
  const isCompleted = Boolean(normProfile?.onboardingCompleted);
  const totalIncome = normProfile?.monthlyIncome ?? 0;
  const totalExpenses = normProfile?.monthlyExpenses ?? 0;
  const totalEmis = normProfile?.monthlyDebtPayments ?? 0;
  const monthlySavings = Math.max(0, totalIncome - totalExpenses - totalEmis);
  const savingsRatePct = totalIncome > 0 ? Math.round((monthlySavings / totalIncome) * 100) : 0;
  const emiRatioPct = totalIncome > 0 ? Math.round((totalEmis / totalIncome) * 100) : 0;

  // Calculate authoritative health score using engine
  const diagnostic = calculateFinancialHealthScore({
    monthlyIncome: totalIncome,
    monthlyExpenses: totalExpenses,
    monthlyEssentialExpenses: normProfile?.monthlyEssentialExpenses ?? 0,
    emergencyFund: normProfile?.emergencyFund ?? 0,
    monthlyDebtPayments: totalEmis,
    goals: normProfile?.goals || [],
    portfolioAllocation: [],
    safetyData: { hasHealthInsurance: true, hasLifeInsurance: true }
  });

  const healthScore = isCompleted ? diagnostic.overallScore : 0;
  const emergencyMonths = totalExpenses > 0 ? (normProfile?.emergencyFund / totalExpenses).toFixed(1) : '0.0';
  const riskProfile = isCompleted ? (normProfile?.riskProfile || 'Moderate') : 'Pending Onboarding';

  // Dynamic Health Metric Pillars
  const dynamicHealthMetrics = [
    {
      metric: 'Savings Rate',
      score: isCompleted ? `${savingsRatePct}%` : '0%',
      target: '25%',
      status: isCompleted ? (savingsRatePct >= 25 ? 'Excellent' : savingsRatePct >= 15 ? 'Good' : 'Needs Attention') : 'Pending Setup',
      description: isCompleted ? `Saving ₹${monthlySavings.toLocaleString('en-IN')} of ₹${totalIncome.toLocaleString('en-IN')} income.` : 'Complete onboarding to evaluate savings rate.',
    },
    {
      metric: 'Emergency Fund',
      score: isCompleted ? `${emergencyMonths} Months` : '0.0 Months',
      target: '6.0 Months',
      status: isCompleted ? (Number(emergencyMonths) >= 6 ? 'Excellent' : Number(emergencyMonths) >= 3 ? 'Good' : 'Needs Attention') : 'Pending Setup',
      description: isCompleted ? `₹${(normProfile?.emergencyFund || 0).toLocaleString('en-IN')} accumulated buffer.` : 'Complete onboarding to evaluate emergency fund.',
    },
    {
      metric: 'Debt-to-Income',
      score: isCompleted ? `${emiRatioPct}%` : '0%',
      target: '< 30%',
      status: isCompleted ? (emiRatioPct <= 15 ? 'Excellent' : emiRatioPct <= 30 ? 'Good' : 'Needs Attention') : 'Pending Setup',
      description: isCompleted ? (emiRatioPct > 0 ? `₹${totalEmis.toLocaleString('en-IN')} monthly debt outflow` : 'Zero active loan obligations') : 'Complete onboarding to evaluate debt ratio.',
    },
    {
      metric: 'Diversification',
      score: isCompleted ? `${Math.min(100, Math.max(25, (normProfile?.raw?.investment_categories || normProfile?.raw?.investmentCategories || []).length * 25))} / 100` : '0 / 100',
      target: '80 / 100',
      status: isCompleted ? ((normProfile?.raw?.investment_categories || []).length >= 3 ? 'Good' : 'Moderate') : 'Pending Setup',
      description: isCompleted ? `Across ${(normProfile?.raw?.investment_categories || normProfile?.raw?.investmentCategories || []).join(', ') || 'Liquid reserve'}` : 'Complete onboarding to configure asset allocation.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg border border-emerald-500/30 overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                {isCompleted ? 'Blueprint Verified' : 'Standard Baseline Active'}
              </span>
              <Badge variant={isCompleted ? 'success' : 'amber'} className="text-[10px]">
                {isCompleted ? 'Onboarding Complete' : 'Onboarding Pending'}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Good day, {userName} 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Risk Profile: <span className="font-bold text-emerald-500">{riskProfile} Investor</span> — FinLabs Blueprint Active
            </p>
          </div>
        </div>

        {!isCompleted && (
          <button
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm self-start sm:self-auto"
          >
            <Settings2 className="w-4 h-4" />
            <span>COMPLETE ONBOARDING</span>
          </button>
        )}
      </div>

      {/* ROW 1: DYNAMIC KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Financial Health"
          value={`${healthScore} / 100`}
          icon={Activity}
          change={healthScore >= 70 ? 'Strong Index' : healthScore >= 50 ? 'Moderate Index' : 'Needs Optimization'}
          changeType={healthScore >= 60 ? 'positive' : 'neutral'}
        />
        <StatCard
          title="Monthly Income"
          value={formatINR(totalIncome)}
          icon={Wallet}
          change={`₹${totalExpenses.toLocaleString('en-IN')} total expenses`}
          changeType="positive"
        />
        <StatCard
          title="Monthly Savings Surplus"
          value={formatINR(monthlySavings)}
          icon={PiggyBank}
          change={`${savingsRatePct}% savings rate`}
          changeType={savingsRatePct >= 20 ? 'positive' : 'neutral'}
        />
        <StatCard
          title="Emergency Reserve"
          value={formatINR(normProfile?.emergencyFund ?? 0)}
          icon={ShieldCheck}
          change={`${emergencyMonths} months buffer`}
          changeType={Number(emergencyMonths) >= 3 ? 'positive' : 'negative'}
        />
      </div>

      {/* ROW 2: HEALTH DIAGNOSTIC BREAKDOWN & AI COPILOT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Financial Diagnostic Pillars</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Core pillars shaping your overall {healthScore}/100 score.</p>
              </div>
              <button
                onClick={() => navigate('/financial-health')}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                <span>Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dynamicHealthMetrics.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.metric}</span>
                    <Badge variant={item.status === 'Excellent' || item.status === 'Good' ? 'success' : 'amber'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.score}</span>
                    <span className="text-[10px] font-mono text-slate-400">Target: {item.target}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* AI Copilot Quick Launch Widget */}
        <Card className="p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">FinLabs AI Copilot</h3>
                <span className="text-[10px] font-mono text-emerald-400">Stage 3 Intelligence Engine Active</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ask your AI Copilot about your savings, mutual fund recommendations matching your Moderate risk profile, or your prioritized waterfall action plan.
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono italic">
              "Which mutual funds match my risk profile?"
            </div>
          </div>

          <button
            onClick={() => navigate('/ai')}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
          >
            <span>Launch AI Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      </div>
    </div>
  );
}
