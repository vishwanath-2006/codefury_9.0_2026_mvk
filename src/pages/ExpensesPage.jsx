import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { Wallet, PieChart, ArrowDownRight, TrendingDown, AlertCircle } from 'lucide-react';
import { mockExpensesBreakdown, mockUserSummary } from '../mock/finlabsMockData';

export default function ExpensesPage() {
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Income & Expense Analytics"
        subtitle="Track spending trends, categorize subscriptions, and discover cashflow optimization points."
        tag="Analytics"
      />

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Monthly Outflow"
          value={formatINR(mockExpensesBreakdown.totalMonthly)}
          icon={ArrowDownRight}
          change="80% of Income"
          changeType="neutral"
          description="Fixed & variable expenses"
        />

        <StatCard
          title="Monthly Savings Margin"
          value={formatINR(mockUserSummary.monthlySavings)}
          icon={Wallet}
          change="+20% Net Cashflow"
          changeType="positive"
          description="Available for investment"
        />

        <StatCard
          title="Top Category"
          value="Housing & Rent"
          icon={PieChart}
          change="44% Allocation"
          changeType="neutral"
          description="₹14,000 / month"
        />
      </div>

      {/* Expense Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Monthly Category Breakdown
          </CardTitle>
          <CardDescription>Detailed distribution of monthly expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockExpensesBreakdown.categories.map((cat, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
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
}
