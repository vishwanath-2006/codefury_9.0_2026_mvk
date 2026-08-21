import React from 'react';
import { IndianRupee, ShieldCheck, Check } from 'lucide-react';
import { Input } from '../ui/Input';

export default function OnboardingStep3({ data, onChange }) {
  const monthPills = [
    { id: '< 1 Month', label: '< 1 Month', desc: 'Minimal cushion for urgent cash needs' },
    { id: '1–3 Months', label: '1–3 Months', desc: 'Basic emergency runway' },
    { id: '3–6 Months', label: '3–6 Months', desc: 'Recommended baseline safety net' },
    { id: '6+ Months', label: '6+ Months', desc: 'Fortress liquidity buffer' },
  ];

  const assetOptions = [
    'Mutual Funds / SIPs',
    'Direct Equity / Stocks',
    'Fixed Deposits / Recurring Deposits',
    'Digital / Physical Gold',
    'Crypto / Alternative Assets',
    'None yet',
  ];

  const platformOptions = [
    'Zerodha',
    'Groww',
    'Upstox',
    'Bank Apps (HDFC/ICICI/SBI)',
    'INDmoney',
    'Other',
  ];

  const handleAssetToggle = (asset) => {
    let current = [...(data.assetClasses || [])];
    if (asset === 'None yet') {
      onChange('assetClasses', ['None yet']);
      onChange('totalInvestmentValue', 0);
      return;
    }

    current = current.filter((a) => a !== 'None yet');
    if (current.includes(asset)) {
      current = current.filter((a) => a !== asset);
    } else {
      current.push(asset);
    }

    if (current.length === 0) current = ['None yet'];
    onChange('assetClasses', current);
  };

  const handlePlatformToggle = (plat) => {
    let current = [...(data.primaryPlatforms || [])];
    if (current.includes(plat)) {
      current = current.filter((p) => p !== plat);
    } else {
      current.push(plat);
    }
    onChange('primaryPlatforms', current);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Step Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Part 3 of 4 • Liquidity & Existing Investments
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
          Your emergency buffer & investment footprint.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Consolidate your safety net and where your money is currently working across platforms.
        </p>
      </div>

      {/* SECTION A: LIQUIDITY & EMERGENCY SAFETY NET */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          1. Liquidity & Emergency Safety Net
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* SECTION B: EXISTING INVESTMENT PORTFOLIO */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          2. Existing Investment Portfolio
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Active Asset Classes (Multi-select toggle buttons)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {assetOptions.map((asset) => {
              const isSelected = (data.assetClasses || []).includes(asset);
              return (
                <button
                  key={asset}
                  type="button"
                  onClick={() => handleAssetToggle(asset)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-semibold">{asset}</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                      isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Estimated Total Value of Current Investments (₹)"
          type="number"
          min="0"
          placeholder="e.g. 350000"
          icon={IndianRupee}
          value={data.totalInvestmentValue || ''}
          onChange={(e) => onChange('totalInvestmentValue', Number(e.target.value))}
          helperText="Approximate market value of all active holdings"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Primary Platforms Used
          </label>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((plat) => {
              const isSelected = (data.primaryPlatforms || []).includes(plat);
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => handlePlatformToggle(plat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{plat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
