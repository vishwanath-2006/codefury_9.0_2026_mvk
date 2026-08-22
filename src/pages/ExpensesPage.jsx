import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import { Wallet, PieChart, ArrowDownRight } from 'lucide-react';

export default function ExpensesPage() {
  const { userProfile, isOnboarded } = useOnboarding();

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val ?? 0);

  // Onboarded Data
  const essential = userProfile.essentialExpenses || 30000;
  const discretionary = userProfile.discretionaryExpenses || 15000;
  const emiOutflow = userProfile.totalMonthlyEmis || 0;
  const totalOutflow = essential + discretionary + emiOutflow;

  const totalIncome = userProfile.monthlyIncome || 75000;
  const savingsMargin = Math.max(0, totalIncome - totalOutflow);

  const essentialPct = Math.round((essential / (totalOutflow || 1)) * 100) || 50;
  const discretionaryPct = Math.round((discretionary / (totalOutflow || 1)) * 100) || 30;
  const emiPct = Math.round((emiOutflow / (totalOutflow || 1)) * 100) || 0;

  const categories = [
    { name: 'Essential Fixed Living (Rent, Utilities, Groceries - 50% Target)', amount: essential, percentage: essentialPct, color: '#10b981' },
    { name: 'Lifestyle & Discretionary (Dining, Shopping, Travel - 30% Target)', amount: discretionary, percentage: discretionaryPct, color: '#6366f1' },
    { name: 'Monthly Loan EMIs & Debt Outflow (< 15% Target)', amount: emiOutflow, percentage: emiPct, color: '#f59e0b' },
  ];

  const expensesContent = (
    <div className="space-y-8">
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
          value="Essential Fixed Living"
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
            Monthly Category Breakdown (50/30/20 Framework)
          </CardTitle>
          <CardDescription>
            Detailed distribution of your monthly expenses & debt payments
          </CardDescription>
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
    </div>
  );

  // NON-ONBOARDED BLURRED LOCK ARCHITECTURE
  if (!isOnboarded) {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <PageHeader
          title="Income & Expense Analytics"
          subtitle="Track spending trends, categorize subscriptions, and discover cashflow optimization points."
          tag="Analytics"
        />

        <FeatureOverviewCard
          moduleName="Income & Expense Analytics"
          subtitle="Categorizes monthly cash outflows using the 50/30/20 financial planning benchmark."
          capabilities={[
            "50% Essential Fixed Living: Rent, groceries, utilities, and insurance.",
            "30% Discretionary Spend: Dining out, subscriptions, shopping, and leisure.",
            "20% Investable Savings Margin: Direct monthly SIP capacity & wealth building."
          ]}
          whyItMatters={[
            "Lifestyle creep often swallows salary hikes. Tracking expenses guarantees you maintain a 20%+ savings margin.",
            "Detecting high monthly EMI obligations prevents over-leveraging before taking on new debt."
          ]}
        >
          {expensesContent}
        </FeatureOverviewCard>
      </div>
    );
  }

  // ONBOARDED Crisp Live Mode
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Income & Expense Analytics"
        subtitle="Track spending trends, categorize subscriptions, and discover cashflow optimization points."
        tag="Analytics"
      />

      {expensesContent}
    </div>
  );
}
