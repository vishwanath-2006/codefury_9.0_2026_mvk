import React from 'react';
import { IndianRupee, PieChart, Check } from 'lucide-react';
import { Input } from '../ui/Input';

export default function OnboardingStep6({ data, onChange }) {
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
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Consolidate your current footprint.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tell us where your money is currently working across platforms.
        </p>
      </div>

      {/* Active Asset Classes */}
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

      {/* Total Investment Value */}
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

      {/* Primary Platforms Chips */}
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
  );
}
