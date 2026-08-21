import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { GitCompare, Shield, Zap, Lock, DollarSign } from 'lucide-react';

export default function InvestmentComparisonPage() {
  const comparisonData = [
    { asset: "Mutual Funds (SIP)", risk: "Moderate to High", returnRange: "12% - 16%", liquidity: "High (T+2)", tax: "12.5% LTCG > ₹1.25L", suitability: "Best for Goal Compounding" },
    { asset: "Direct Equity Stocks", risk: "High", returnRange: "15% - 25%+", liquidity: "High (T+1)", tax: "12.5% LTCG / 20% STCG", suitability: "High Risk Appetite" },
    { asset: "Fixed Deposits (FD)", risk: "Very Low", returnRange: "6.5% - 7.5%", liquidity: "Moderate (Penalty)", tax: "Taxed as per Income Slab", suitability: "Short-term Emergency" },
    { asset: "Real Estate Property", risk: "Moderate", returnRange: "8% - 10%", liquidity: "Very Low (Months)", tax: "12.5% LTCG (No Indexation)", suitability: "Generational Wealth" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Investment Comparison Studio"
        subtitle="Compare Mutual Funds vs Stocks vs FD vs Real Estate across risk, liquidity, and return metrics."
        tag="Tools"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <th className="p-4 rounded-tl-xl">Asset Class</th>
              <th className="p-4">Risk Profile</th>
              <th className="p-4">Historical Return</th>
              <th className="p-4">Liquidity</th>
              <th className="p-4">Tax Treatment</th>
              <th className="p-4 rounded-tr-xl">Best Suitability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{row.asset}</td>
                <td className="p-4">
                  <Badge variant={row.risk.includes('High') ? 'warning' : 'success'}>{row.risk}</Badge>
                </td>
                <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.returnRange}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{row.liquidity}</td>
                <td className="p-4 text-slate-600 dark:text-slate-400">{row.tax}</td>
                <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{row.suitability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
