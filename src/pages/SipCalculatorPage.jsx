import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { Calculator, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';

export default function SipCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedRate, setExpectedRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(10);

  // SIP Compound Interest Calculation Logic
  // Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
  const i = expectedRate / 12 / 100;
  const n = tenureYears * 12;
  const totalInvested = monthlyInvestment * n;
  
  const estimatedCorpus = Math.round(
    monthlyInvestment * (((Math.pow(1 + i, n) - 1) / i) * (1 + i))
  );
  const estimatedReturns = Math.max(0, estimatedCorpus - totalInvested);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="SIP & Wealth Simulator"
        subtitle="Calculate expected returns, inflation-adjusted wealth growth, and step-up SIP scenarios."
        tag="Calculators"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Sliders Column */}
        <Card className="lg:col-span-2 space-y-6 p-6">
          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly SIP Amount</label>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatINR(monthlyInvestment)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Return Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expected Annual Return Rate (p.a)</label>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {expectedRate}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedRate}
              onChange={(e) => setExpectedRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Time Horizon (Years)</label>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {tenureYears} Years
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>1 Yr</span>
              <span>35 Yrs</span>
            </div>
          </div>
        </Card>

        {/* Wealth Output Card Column */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 flex flex-col justify-between border-slate-800">
          <div>
            <Badge variant="brand" className="mb-4">PROJECTED WEALTH</Badge>
            <span className="text-xs text-slate-400 block uppercase font-mono tracking-wider mb-1">Total Estimated Corpus</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mb-6">
              {formatINR(estimatedCorpus)}
            </h3>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Amount Invested</span>
                <span className="font-mono font-bold text-white">{formatINR(totalInvested)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Wealth Gain</span>
                <span className="font-mono font-bold text-emerald-400">+{formatINR(estimatedReturns)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Calculated based on standard monthly compound interest logic. Returns are indicative.
          </div>
        </Card>
      </div>
    </div>
  );
}
