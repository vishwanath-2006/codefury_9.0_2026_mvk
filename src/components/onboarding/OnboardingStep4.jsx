import React from 'react';
import { CreditCard, Landmark, IndianRupee, Check } from 'lucide-react';
import { Input, Select } from '../ui/Input';

export default function OnboardingStep4({ data, onChange }) {
  const loanOptions = [
    'Home Loan',
    'Education Loan',
    'Car/Bike Loan',
    'Personal Loan / BNPL',
    'None',
  ];

  const handleLoanToggle = (loan) => {
    let current = [...(data.activeLoans || [])];
    if (loan === 'None') {
      onChange('activeLoans', ['None']);
      onChange('totalEmiOutflow', 0);
      return;
    }

    current = current.filter((l) => l !== 'None');
    if (current.includes(loan)) {
      current = current.filter((l) => l !== loan);
    } else {
      current.push(loan);
    }

    if (current.length === 0) current = ['None'];
    onChange('activeLoans', current);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Let’s map out your debt & credit obligations.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          High-interest liabilities directly erode compounding gains.
        </p>
      </div>

      {/* Credit Cards Toggle */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Do you hold active Credit Cards?
              </p>
              <p className="text-xs text-slate-500">Helps analyze revolving credit health</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onChange('hasCreditCards', true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                data.hasCreditCards
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange('hasCreditCards', false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !data.hasCreditCards
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Conditional Fields if Credit Card = Yes */}
        {data.hasCreditCards && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Number of Active Cards"
              value={data.cardCount || '1-2'}
              onChange={(e) => onChange('cardCount', e.target.value)}
            >
              <option value="1-2">1–2 Cards</option>
              <option value="3-5">3–5 Cards</option>
              <option value="5+">5+ Cards</option>
            </Select>

            <Input
              label="Average Monthly Unpaid Balance (₹)"
              type="number"
              min="0"
              placeholder="0"
              icon={IndianRupee}
              value={data.unpaidBalance || ''}
              onChange={(e) => onChange('unpaidBalance', Number(e.target.value))}
              helperText="Enter 0 if paid in full every month"
            />
          </div>
        )}
      </div>

      {/* Active Loans Checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          Active Loans / EMIs (Select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {loanOptions.map((loan) => {
            const isChecked = (data.activeLoans || []).includes(loan);
            return (
              <button
                key={loan}
                type="button"
                onClick={() => handleLoanToggle(loan)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-semibold">{loan}</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                    isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-400'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total EMI Outflow */}
      <Input
        label="Total Monthly EMI Outflow (₹)"
        type="number"
        min="0"
        placeholder="0"
        icon={IndianRupee}
        value={data.totalEmiOutflow || ''}
        onChange={(e) => onChange('totalEmiOutflow', Number(e.target.value))}
        helperText="Combined sum of all active monthly EMI commitments"
      />
    </div>
  );
}
