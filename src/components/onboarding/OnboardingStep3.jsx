import React from 'react';
import { IndianRupee, PieChart, CheckCircle2 } from 'lucide-react';
import { Input } from '../ui/Input';

export default function OnboardingStep3({ data, onChange }) {
  const trackingMethods = [
    { id: 'I track every rupee', label: 'I track every rupee', desc: 'Use apps or spreadsheets regularly' },
    { id: 'Rough estimate', label: 'Rough estimate', desc: 'Check bank statement balances monthly' },
    { id: 'No active tracking', label: 'No active tracking', desc: 'Spend intuitively without logging' },
  ];

  const totalInflow = Number(data.primaryMonthlyIncome || 0) + Number(data.secondaryMonthlyIncome || 0);
  const totalOutflow = Number(data.essentialExpenses || 0) + Number(data.discretionaryExpenses || 0);
  const netSurplus = totalInflow - totalOutflow;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Where does your monthly income go?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Knowing your fixed and lifestyle costs reveals your true savings potential.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Essential Expenses */}
        <Input
          label="Essential Monthly Expenses (Rent, Groceries, Utilities) (₹)"
          type="number"
          min="0"
          placeholder="e.g. 30000"
          icon={IndianRupee}
          value={data.essentialExpenses || ''}
          onChange={(e) => onChange('essentialExpenses', Number(e.target.value))}
          helperText="Fixed non-negotiable living costs"
        />

        {/* Discretionary Expenses */}
        <Input
          label="Discretionary / Lifestyle Spend (Dining, Subscriptions, Shopping) (₹)"
          type="number"
          min="0"
          placeholder="e.g. 15000"
          icon={IndianRupee}
          value={data.discretionaryExpenses || ''}
          onChange={(e) => onChange('discretionaryExpenses', Number(e.target.value))}
          helperText="Flexible personal spend & entertainment"
        />
      </div>

      {/* Net Cash Surplus Calculator Box */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Monthly Income: ₹{totalInflow.toLocaleString('en-IN')}</span>
          <span>Total Expenses: ₹{totalOutflow.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Calculated Net Savings Surplus:
          </span>
          <span className={`text-base font-extrabold font-mono ${netSurplus >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ₹{netSurplus.toLocaleString('en-IN')} / mo
          </span>
        </div>
      </div>

      {/* Expense Tracking Method */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          Expense Tracking Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trackingMethods.map((method) => {
            const isSelected = data.expenseTrackingMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onChange('expenseTrackingMethod', method.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-xs sm:text-sm font-bold">{method.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{method.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
