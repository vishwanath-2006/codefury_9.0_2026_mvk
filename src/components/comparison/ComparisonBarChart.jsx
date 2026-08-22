import React from 'react';

export default function ComparisonBarChart({
  title,
  subtitle,
  data = [],
  metricKey,
  unit = '%',
  prefix = '',
  isReturn = false,
  theme = 'emerald'
}) {
  if (!data || data.length === 0) return null;

  // Find max for scaling
  const values = data.map((d) => Math.abs(Number(d[metricKey]) || 0));
  const maxVal = Math.max(...values, 1);

  const getGradient = (isPositive) => {
    if (isReturn) {
      return isPositive
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
        : 'bg-gradient-to-r from-rose-500 to-amber-500';
    }
    switch (theme) {
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-blue-400';
      case 'teal':
        return 'bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400';
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400';
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-400';
      default:
        return 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700/80 transition">
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</h4>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>

      <div className="space-y-3.5">
        {data.map((item, idx) => {
          const rawVal = Number(item[metricKey]);
          const isNum = !isNaN(rawVal);
          const valDisplay = isNum
            ? `${rawVal > 0 && isReturn ? '+' : ''}${prefix}${rawVal.toLocaleString('en-IN')}${unit}`
            : item[metricKey] || 'N/A';
          const pctWidth = isNum ? Math.min(100, Math.max(8, (Math.abs(rawVal) / maxVal) * 100)) : 0;
          const isPositive = rawVal >= 0;

          return (
            <div key={item.symbol || item.id || idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.symbol || item.name}</span>
                <span
                  className={`font-mono font-bold ${
                    isReturn
                      ? isPositive
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {valDisplay}
                </span>
              </div>

              {/* Bar Fill */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getGradient(isPositive)}`}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
