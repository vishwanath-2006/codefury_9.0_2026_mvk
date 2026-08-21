import React from 'react';
import { Target, IndianRupee, Clock, Sparkles } from 'lucide-react';
import { Input, Select } from '../ui/Input';

export default function OnboardingStep8({ data, onChange }) {
  const milestones = [
    'Higher Education',
    'Down Payment for House',
    'Retirement / Early Independence',
    'Wealth Creation',
    'Emergency Shield',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Define your North Star goal.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Every rupee should have an objective and a timeline.
        </p>
      </div>

      {/* Primary Milestone Dropdown */}
      <Select
        label="Primary Financial Milestone"
        value={data.primaryMilestone || 'Down Payment for House'}
        onChange={(e) => onChange('primaryMilestone', e.target.value)}
      >
        {milestones.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Target Goal Amount */}
        <Input
          label="Target Goal Amount (₹)"
          type="number"
          min="10000"
          placeholder="e.g. 1500000"
          icon={IndianRupee}
          value={data.targetGoalAmount || ''}
          onChange={(e) => onChange('targetGoalAmount', Number(e.target.value))}
          helperText="Total target corpus needed"
        />

        {/* Target Timeframe */}
        <Input
          label="Target Timeframe (in Years)"
          type="number"
          min="1"
          max="50"
          placeholder="e.g. 5"
          icon={Clock}
          value={data.targetTimeframeYears || ''}
          onChange={(e) => onChange('targetTimeframeYears', Number(e.target.value))}
          helperText="Number of years to reach milestone"
        />
      </div>

      {/* Monthly Commitment Capacity */}
      <Input
        label="Commitment Capacity — How much are you ready to invest monthly towards this goal? (₹)"
        type="number"
        min="500"
        placeholder="e.g. 15000"
        icon={IndianRupee}
        value={data.monthlyCommitmentAmount || ''}
        onChange={(e) => onChange('monthlyCommitmentAmount', Number(e.target.value))}
        helperText="Monthly SIP or automated recurring contribution"
      />

      {/* Summary Goal Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 shadow-md shadow-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              SmartWealth Target Horizon
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {data.primaryMilestone}: ₹{Number(data.targetGoalAmount || 0).toLocaleString('en-IN')} in {data.targetTimeframeYears || 5} Years
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[11px] text-slate-400">Monthly SIP Target</p>
          <p className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Number(data.monthlyCommitmentAmount || 0).toLocaleString('en-IN')}/mo
          </p>
        </div>
      </div>
    </div>
  );
}
