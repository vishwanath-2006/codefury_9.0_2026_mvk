import React from 'react';
import { IndianRupee, ShieldAlert, Sparkles } from 'lucide-react';
import { Input } from '../ui/Input';

export default function OnboardingStep2({ data, onChange }) {
  const stabilityPills = [
    { id: 'Highly Predictable', label: 'Highly Predictable', desc: 'Fixed monthly salary or guaranteed cash flow' },
    { id: 'Moderate Variation', label: 'Moderate Variation', desc: 'Base pay + performance bonuses/commission' },
    { id: 'Freelance / Irregular', label: 'Freelance / Irregular', desc: 'Project-based income or variable business revenue' },
  ];

  const totalInflow = Number(data.primaryMonthlyIncome || 0) + Number(data.secondaryMonthlyIncome || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Understanding your cash inflows.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          We use this to calculate your monthly surplus and investment capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Income */}
        <Input
          label="Primary Monthly In-Hand Income (₹)"
          type="number"
          min="0"
          placeholder="e.g. 75000"
          icon={IndianRupee}
          value={data.primaryMonthlyIncome || ''}
          onChange={(e) => onChange('primaryMonthlyIncome', Number(e.target.value))}
          helperText="Take-home pay after tax & deductions"
        />

        {/* Secondary Income */}
        <Input
          label="Secondary / Variable Monthly Income (₹)"
          type="number"
          min="0"
          placeholder="0"
          icon={IndianRupee}
          value={data.secondaryMonthlyIncome || ''}
          onChange={(e) => onChange('secondaryMonthlyIncome', Number(e.target.value))}
          helperText="Optional: Dividends, side hustles, rental income"
        />
      </div>

      {/* Total Monthly Cashflow Banner */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Total Monthly Cash Inflow:
          </span>
        </div>
        <span className="text-base sm:text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
          ₹{totalInflow.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Income Stability Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          Income Stability Rating
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stabilityPills.map((pill) => {
            const isSelected = data.incomeStability === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onChange('incomeStability', pill.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-xs sm:text-sm font-bold">{pill.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{pill.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
