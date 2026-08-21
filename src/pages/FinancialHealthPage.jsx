import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PiggyBank,
  ArrowDownRight,
  Target,
  PieChart,
  Shield,
  RefreshCw,
  FlaskConical
} from 'lucide-react';
import { getFinancialHealthDiagnostic } from '../services/financialHealth/adapter';
import { runFinancialHealthEngineTests } from '../services/financialHealth/__tests__/financialHealthEngine.test';

export default function FinancialHealthPage() {
  const { user } = useAuth();
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState(null);

  const loadDiagnostic = async () => {
    try {
      setLoading(true);
      const res = await getFinancialHealthDiagnostic(user?.id);
      setDiagnostic(res);
    } catch (err) {
      console.error('Error loading diagnostic:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostic();
  }, [user?.id]);

  const handleRunTests = () => {
    const tests = runFinancialHealthEngineTests();
    setTestResults(tests);
  };

  if (loading || !diagnostic) {
    return (
      <div className="text-center py-20 text-slate-400 font-mono flex flex-col items-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <span>Evaluating financial health diagnostic rules...</span>
      </div>
    );
  }

  const { overallScore, status, dataCompleteness, factorsEvaluated, totalFactors, components, strengths, improvementAreas } = diagnostic;

  const componentList = [
    { key: 'savingsRate', title: 'Savings Rate', maxScore: 20, icon: Wallet, comp: components.savingsRate },
    { key: 'emergencyFund', title: 'Emergency Reserve', maxScore: 20, icon: PiggyBank, comp: components.emergencyFund },
    { key: 'debtManagement', title: 'Debt Management', maxScore: 20, icon: ArrowDownRight, comp: components.debtManagement },
    { key: 'goalReadiness', title: 'Goal Readiness', maxScore: 15, icon: Target, comp: components.goalReadiness },
    { key: 'diversification', title: 'Investment Diversification', maxScore: 15, icon: PieChart, comp: components.diversification },
    { key: 'financialSafety', title: 'Financial Safety', maxScore: 10, icon: Shield, comp: components.financialSafety },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Financial Health"
        subtitle="Understand the strengths and gaps in your financial foundation."
        tag="Core Intelligence"
      >
        <Button variant="outline" size="sm" icon={FlaskConical} onClick={handleRunTests}>
          Run Engine Tests
        </Button>
      </PageHeader>

      {/* Automated Unit Test Runner Results Overlay */}
      {testResults && (
        <Card className="bg-slate-900 text-white border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Engine Test Suite Results (6 Cases Verified)
            </h4>
            <button onClick={() => setTestResults(null)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {testResults.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg">
                <span className="text-slate-200">{t.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[10px]">{t.details}</span>
                  <Badge variant={t.status === 'PASS' ? 'success' : 'warning'}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Score Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full border-4 border-emerald-500/30 bg-slate-800/80 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                {overallScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                  {status} Status
                </Badge>
                <Badge variant="neutral" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                  Based on {factorsEvaluated} of {totalFactors} financial factors ({dataCompleteness}%)
                </Badge>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Financial Health Index</h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                Deterministic calculation evaluating savings rate, emergency reserve, debt burden, goals, diversification, and safety.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 6 Component Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {componentList.map(({ key, title, maxScore, icon: Icon, comp }) => (
          <Card key={key} hover className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
                </div>
                <Badge variant={comp.isAvailable ? (comp.score >= maxScore * 0.7 ? 'success' : 'warning') : 'neutral'}>
                  {comp.status}
                </Badge>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{comp.score}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {maxScore} pts</span>
                </div>
                {comp.fallbackUsed && (
                  <span className="text-[10px] text-amber-500 font-medium">Fallback used</span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[36px]">
                {comp.explanation}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Weight: {maxScore} pts</span>
              <span>{comp.isAvailable ? 'Evaluated' : 'Insufficient Data'}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* What's Going Well & Areas to Improve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              What's Going Well ({strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.length === 0 ? (
              <p className="text-xs text-slate-400">No strong baseline factors recorded yet.</p>
            ) : (
              strengths.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">{s.title} ({s.score}/{s.maxScore} pts)</strong>
                    <span>{s.explanation}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Areas to Improve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Areas to Improve ({improvementAreas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvementAreas.length === 0 ? (
              <p className="text-xs text-slate-400">All evaluated factors meet high financial health benchmarks!</p>
            ) : (
              improvementAreas.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">{imp.title} ({imp.score}/{imp.maxScore} pts)</strong>
                    <span>{imp.explanation}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
