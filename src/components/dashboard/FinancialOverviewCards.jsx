import React from 'react';
import { Wallet, TrendingUp, PiggyBank, ArrowDownRight } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { mockUserSummary } from '../../mock/finlabsMockData';

export default function FinancialOverviewCards() {
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Monthly Income"
        value={formatINR(mockUserSummary.monthlyIncome)}
        icon={Wallet}
        change="Fixed Baseline"
        changeType="neutral"
        description="Verified monthly inflow"
      />

      <StatCard
        title="Monthly Savings"
        value={formatINR(mockUserSummary.monthlySavings)}
        icon={PiggyBank}
        change="20% Savings Rate"
        changeType="positive"
        description="Ideal benchmark >20%"
      />

      <StatCard
        title="Monthly Expenses"
        value={formatINR(mockUserSummary.monthlyExpenses)}
        icon={ArrowDownRight}
        change="80% Cash Flow"
        changeType="neutral"
        description="Includes rent & utilities"
      />

      <StatCard
        title="Portfolio Value"
        value={formatINR(mockUserSummary.portfolioValue)}
        icon={TrendingUp}
        change="+12.4% Annual"
        changeType="positive"
        description="Across 3 asset classes"
      />
    </div>
  );
}
