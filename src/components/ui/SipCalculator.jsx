import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import Badge from './Badge';

export default function SipCalculator({ initialMonthlyInvestment = 15000, initialExpectedRate = 12, initialTenureYears = 5 }) {
  const [monthlyInvestment, setMonthlyInvestment] = useState(initialMonthlyInvestment);
  const [expectedRate, setExpectedRate] = useState(initialExpectedRate);
  const [tenureYears, setTenureYears] = useState(initialTenureYears);

  useEffect(() => {
    if (initialMonthlyInvestment && !isNaN(initialMonthlyInvestment)) {
      setMonthlyInvestment(initialMonthlyInvestment);
    }
  }, [initialMonthlyInvestment]);

  useEffect(() => {
    if (initialTenureYears && !isNaN(initialTenureYears)) {
      setTenureYears(initialTenureYears);
    }
  }, [initialTenureYears]);

  // Sync expected rate if the initialExpectedRate prop changes
  useEffect(() => {
    if (initialExpectedRate && !isNaN(initialExpectedRate)) {
      setExpectedRate(initialExpectedRate);
    }
  }, [initialExpectedRate]);

  // SIP Compound Interest Calculation Logic
  // Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
  const i = expectedRate / 12 / 100;
  const n = tenureYears * 12;
  const totalInvested = monthlyInvestment * n;
  
  const estimatedCorpus = Math.round(
    monthlyInvestment * (i === 0 ? n : (((Math.pow(1 + i, n) - 1) / i) * (1 + i)))
  );
  const estimatedReturns = Math.max(0, estimatedCorpus - totalInvested);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Interactive Sliders */}
      <div className="md:col-span-3 space-y-4">
        {/* Monthly Investment Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly SIP Amount</label>
            <span className="text-sm font-bold font-mono text-emerald-500">
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
            <span>₹500</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        {/* Expected Return Rate Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Return (p.a)</label>
            <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration (Horizon)</label>
            <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
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
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-mono">
            <span>1 Yr</span>
            <span>35 Yrs</span>
          </div>
        </div>
      </div>

      {/* Output Results Summary */}
      <Card className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-150 dark:border-slate-800/80 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="brand" className="text-[9px] font-bold uppercase tracking-wider">SIP Projection</Badge>
            <span className="text-[9px] text-slate-400 font-mono">Horizon: {tenureYears}y</span>
          </div>
          
          <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">Total Value</span>
          <h4 className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
            {formatINR(estimatedCorpus)}
          </h4>

          <div className="space-y-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Invested Amount</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatINR(totalInvested)}</span>
            </div>
            <div className="flex justify-between items-center font-semibold">
              <span className="text-slate-500">Est. Growth Gain</span>
              <span className="font-mono text-emerald-500">+{formatINR(estimatedReturns)}</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-4 leading-tight">
          Standard monthly compounding model. Growth rates are estimates.
        </div>
      </Card>
    </div>
  );
}
