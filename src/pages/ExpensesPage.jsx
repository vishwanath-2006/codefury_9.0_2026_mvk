import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import { Wallet, PieChart, ArrowDownRight, TrendingDown, ShieldAlert } from 'lucide-react';

export default function ExpensesPage() {
  const { formData, isOnboarded } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const essential = Number(formData.essentialExpenses || 25000);
  const discretionary = Number(formData.discretionaryExpenses || 10000);
  const emiOutflow = Number(formData.totalEmiOutflow || 0);
  const totalOutflow = essential + discretionary + emiOutflow;

  const primaryInc = Number(formData.primaryMonthlyIncome || 50000);
  const secondaryInc = Number(formData.secondaryMonthlyIncome || 0);
  const totalIncome = primaryInc + secondaryInc || 75000;
  const savingsMargin = Math.max(0, totalIncome - totalOutflow);

  const essentialPct = Math.round((essential / totalOutflow) * 100) || 55;
  const discretionaryPct = Math.round((discretionary / totalOutflow) * 100) || 25;
  const emiPct = Math.round((emiOutflow / totalOutflow) * 100) || 20;

  const categories = [
    { name: 'Essential Fixed Living (Rent, Utilities, Groceries)', amount: essential, percentage: essentialPct, color: '#10b981' },
    { name: 'Lifestyle & Discretionary (Dining, Shopping, Entertainment)', amount: discretionary, percentage: discretionaryPct, color: '#6366f1' },
    { name: 'Monthly Loan EMIs & Debt Outflow', amount: emiOutflow, percentage: emiPct, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Global Overview Mode Banner */}
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="Income & Expense Analytics"
        subtitle="Track spending trends, categorize subscriptions, and discover cashflow optimization points."
        tag="Analytics"
      />

      {!isOnboarded ? (
        <FeatureOverviewCard
          moduleName="Expense & Burn Rate Tracker"
          subtitle="Categorizes monthly cash outflows into essential fixed expenses, discretionary lifestyle spend, and active loan EMIs to calculate true net savings margin."
          capabilities={[
            'Audits Essential vs. Discretionary spending ratios against the 50/30/20 benchmark.',
            'Highlights recurring debt outflow risks and high-interest credit card balance burn.',
            'Identifies hidden lifestyle inflation points to optimize your monthly investable surplus.'
          ]}
          whyItMatters={[
            'High fixed overhead (essential expenses > 60%) reduces your financial flexibility during income interruptions.',
            'Tracking discretionary spend reveals instant opportunities to step up monthly SIP contributions.',
            'Keeping total monthly EMI obligations under 30% prevents debt traps and loan default stress.'
          ]}
          ctaLabel="Set Expense Details in Onboarding"
          stepTarget="/onboarding"
        >
          {/* Mock Expense Visual */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800 rounded-xl text-xs"><p className="font-bold">Outflow: ₹35,000</p></div>
              <div className="p-3 bg-slate-800 rounded-xl text-xs"><p className="font-bold text-emerald-400">Margin: ₹15,000</p></div>
              <div className="p-3 bg-slate-800 rounded-xl text-xs"><p className="font-bold text-indigo-400">Essential: 65%</p></div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-emerald-500 rounded-full w-3/4"></div>
              <div className="h-4 bg-indigo-500 rounded-full w-1/2"></div>
            </div>
          </div>
        </FeatureOverviewCard>
      ) : (
        /* LIVE EXPENSE MODE */
        <>
          {/* Expense Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Monthly Outflow"
              value={formatINR(totalOutflow)}
              icon={ArrowDownRight}
              change={`${Math.round((totalOutflow / totalIncome) * 100)}% of Income`}
              changeType="neutral"
              description="Fixed living + lifestyle + EMIs"
            />

            <StatCard
              title="Monthly Savings Margin"
              value={formatINR(savingsMargin)}
              icon={Wallet}
              change={`+${Math.round((savingsMargin / totalIncome) * 100)}% Net Margin`}
              changeType="positive"
              description="Investable monthly cashflow"
            />

            <StatCard
              title="Top Expense Category"
              value="Essential Living"
              icon={PieChart}
              change={`${essentialPct}% Allocation`}
              changeType="neutral"
              description={`${formatINR(essential)} / month`}
            />
          </div>

          {/* Expense Categories Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <PieChart className="w-4 h-4 text-emerald-500" />
                Monthly Category Breakdown
              </CardTitle>
              <CardDescription>Detailed distribution of monthly expenses & debt payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-900 dark:text-slate-100">{cat.name}</span>
                      </div>
                      <div className="font-mono">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(cat.amount)}</span>
                        <span className="text-slate-400 ml-2">({cat.percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
