import React from 'react';
import { IndianRupee, CheckCircle2, CreditCard, Check } from 'lucide-react';
import { Input, Select } from '../ui/Input';

export default function OnboardingStep2({ data, onChange }) {
  const trackingMethods = [
    { id: 'I track every rupee', label: 'I track every rupee', desc: 'Use apps or spreadsheets regularly' },
    { id: 'Rough estimate', label: 'Rough estimate', desc: 'Check bank statement balances monthly' },
    { id: 'No active tracking', label: 'No active tracking', desc: 'Spend intuitively without logging' },
  ];

  const loanOptions = [
    'Home Loan',
    'Education Loan',
    'Car/Bike Loan',
    'Personal Loan / BNPL',
    'None',
  ];

  const totalInflow = Number(data.primaryMonthlyIncome || 0) + Number(data.secondaryMonthlyIncome || 0);
  const totalOutflow = Number(data.essentialExpenses || 0) + Number(data.discretionaryExpenses || 0);
  const netSurplus = totalInflow - totalOutflow - Number(data.totalEmiOutflow || 0);

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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Step Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Part 2 of 4 • Expenses & Debt Obligations
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
          Map out your monthly spend, liabilities & credit obligations.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Understanding fixed living costs and debt commitments reveals your true investable surplus.
        </p>
      </div>

      {/* SECTION A: EXPENSES & BURN RATE */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          1. Expenses & Burn Rate
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* SECTION B: LIABILITIES & CREDIT OBLIGATIONS */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          2. Liabilities & Credit Obligations
        </h3>

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

        {/* Net Surplus Banner */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Calculated Investable Surplus:
          </span>
          <span className={`text-base font-extrabold font-mono ${netSurplus >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ₹{netSurplus.toLocaleString('en-IN')} / mo
          </span>
        </div>
      </div>
    </div>
  );
}
