import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { PieChart, TrendingUp, LineChart, ShieldCheck } from 'lucide-react';
import { mockUserSummary, mockPortfolioAllocation } from '../mock/finlabsMockData';

export default function PortfolioPage() {
  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Integrated Portfolio Workspace"
        subtitle="Unified view of your mutual funds, equity holdings, debt instruments, and net worth trajectory."
        tag="Asset Management"
      />

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Worth"
          value={formatINR(mockUserSummary.portfolioValue)}
          icon={TrendingUp}
          change="+12.4% Overall CAGR"
          changeType="positive"
          description="3 asset classes"
        />

        <StatCard
          title="Mutual Funds (SIP)"
          value={formatINR(mockPortfolioAllocation[0].value)}
          icon={PieChart}
          change="55% Allocation"
          changeType="positive"
          description="Core growth engine"
        />

        <StatCard
          title="Direct Equity Stocks"
          value={formatINR(mockPortfolioAllocation[1].value)}
          icon={LineChart}
          change="30% Allocation"
          changeType="neutral"
          description="Alpha growth holdings"
        />
      </div>

      {/* Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChart className="w-4 h-4 text-emerald-500" />
            Asset Class Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-6 bg-slate-100 dark:bg-slate-800">
            {mockPortfolioAllocation.map((item, idx) => (
              <div
                key={idx}
                className="h-full transition-all"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockPortfolioAllocation.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-sm">{item.name}</span>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mb-1">{formatINR(item.value)}</p>
                <Badge variant="neutral">{item.percentage}% of total portfolio</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
