import React from 'react';
import { Award, TrendingDown, Target, IndianRupee, Clock } from 'lucide-react';
import { Input, Select } from '../ui/Input';

export default function OnboardingStep4({ data, onChange }) {
  const experiences = [
    { id: 'Complete Beginner', label: 'Complete Beginner', desc: 'New to investing, looking for safe guidance' },
    { id: '1-3 Years (Intermediate)', label: '1-3 Years (Intermediate)', desc: 'Familiar with MFs, SIPs & stock markets' },
    { id: '3+ Years (Active Investor)', label: '3+ Years (Active Investor)', desc: 'Experienced in equities, F&O or crypto' },
  ];

  const scenarioOptions = [
    {
      id: 'Option A',
      code: 'Option A',
      title: 'Panic and liquidate everything to prevent further loss',
      tag: 'Conservative (1 pt)',
      desc: 'You prioritize capital preservation above all else and dislike capital drawdowns.',
    },
    {
      id: 'Option B',
      code: 'Option B',
      title: 'Hold and wait for the market to recover',
      tag: 'Moderate (2 pts)',
      desc: 'You understand market cycles and stay calm through temporary volatility.',
    },
    {
      id: 'Option C',
      code: 'Option C',
      title: 'See it as a discount and invest more aggressively',
      tag: 'Aggressive (3 pts)',
      desc: 'You view market dips as prime buying opportunities for long-term wealth compounding.',
    },
  ];

  const milestones = [
    'Higher Education',
    'Down Payment for House',
    'Retirement / Early Independence',
    'Wealth Creation',
    'Emergency Shield',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Step Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Part 4 of 4 • Risk Profile & Financial Goal
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
          Your risk reaction & North Star milestone.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Matching your psychological volatility threshold with your primary wealth objective.
        </p>
      </div>

      {/* SECTION A: BEHAVIORAL RISK PROFILE */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          1. Behavioral Risk Profile
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Investing Experience Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {experiences.map((exp) => {
              const isSelected = data.investingExperience === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => onChange('investingExperience', exp.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <span className="text-xs sm:text-sm font-bold">{exp.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{exp.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario Question Box */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                Market Correction Stress Test
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                "If your portfolio suddenly drops 20% in two weeks due to market correction, what is your immediate reaction?"
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {scenarioOptions.map((opt) => {
              const isSelected = data.marketCorrectionReaction === opt.id || data.marketCorrectionReaction === opt.code;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange('marketCorrectionReaction', opt.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-slate-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-400 text-slate-500'
                    }`}
                  >
                    {opt.code.split(' ')[1]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {opt.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {opt.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION B: PRIMARY FINANCIAL GOAL & LAUNCHPAD */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
          2. Primary Financial Goal & Launchpad
        </h3>

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

        {/* Goal Target Summary */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 shadow-md shadow-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                FinLabs Horizon Target
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
    </div>
  );
}
