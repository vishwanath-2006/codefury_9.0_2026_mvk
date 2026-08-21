import React from 'react';
import { User, Briefcase, MapPin, Calendar } from 'lucide-react';
import { Input, Select } from '../ui/Input';

export default function OnboardingStep1({ data, onChange }) {
  const occupations = [
    'Salaried Professional',
    'Self-Employed / Business',
    'Student',
    'Freelancer / Creator',
    'Homemaker',
  ];

  const cityTiers = [
    { id: 'Tier 1 Metro', title: 'Tier 1 Metro', desc: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata' },
    { id: 'Tier 2 City', title: 'Tier 2 City', desc: 'Ahmedabad, Jaipur, Chandigarh, Kochi, Lucknow, etc.' },
    { id: 'Tier 3 / Other', title: 'Tier 3 / Other', desc: 'Towns, rural districts, international locations' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Let's personalize your wealth blueprint.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your career stage helps us benchmark realistic risk and growth horizons.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="e.g. Alex Sharma"
          icon={User}
          value={data.fullName || ''}
          onChange={(e) => onChange('fullName', e.target.value)}
        />

        {/* Age */}
        <Input
          label="Age"
          type="number"
          min="18"
          max="100"
          placeholder="e.g. 25"
          icon={Calendar}
          value={data.age || ''}
          onChange={(e) => onChange('age', Number(e.target.value))}
        />
      </div>

      {/* Employment Dropdown */}
      <Select
        label="Current Employment / Occupation"
        value={data.occupation || 'Salaried Professional'}
        onChange={(e) => onChange('occupation', e.target.value)}
      >
        {occupations.map((occ) => (
          <option key={occ} value={occ}>
            {occ}
          </option>
        ))}
      </Select>

      {/* City Tier Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          City Tier
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {cityTiers.map((tier) => {
            const isSelected = data.cityTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onChange('cityTier', tier.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-xs sm:text-sm font-bold">{tier.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{tier.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
