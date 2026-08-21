import React from 'react';
import { IndianRupee, ShieldCheck, Landmark } from 'lucide-react';
import { Input } from '../ui/Input';

export default function OnboardingStep5({ data, onChange }) {
  const monthPills = [
    { id: '< 1 Month', label: '< 1 Month', desc: 'Minimal cushion for urgent cash needs' },
    { id: '1–3 Months', label: '1–3 Months', desc: 'Basic emergency runway' },
    { id: '3–6 Months', label: '3–6 Months', desc: 'Recommended baseline safety net' },
    { id: '6+ Months', label: '6+ Months', desc: 'Fortress liquidity buffer' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Your financial defense line.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          An emergency buffer protects your investments from premature liquidation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Savings in Bank */}
        <Input
          label="Current Savings in Bank Accounts (₹)"
          type="number"
          min="0"
          placeholder="e.g. 150000"
          icon={IndianRupee}
          value={data.bankSavings || ''}
          onChange={(e) => onChange('bankSavings', Number(e.target.value))}
          helperText="Total balances across liquid savings & current accounts"
        />

        {/* Dedicated Emergency Fund */}
        <Input
          label="Dedicated Emergency Fund Amount (₹)"
          type="number"
          min="0"
          placeholder="e.g. 150000"
          icon={IndianRupee}
          value={data.emergencyFundAmount || ''}
          onChange={(e) => onChange('emergencyFundAmount', Number(e.target.value))}
          helperText="Earmarked funds in liquid MFs or High-Yield FDs"
        />
      </div>

      {/* Months of Living Costs Covered */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          How many months of basic living costs can your cash cover?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {monthPills.map((pill) => {
            const isSelected = data.monthsCovered === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onChange('monthsCovered', pill.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
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
