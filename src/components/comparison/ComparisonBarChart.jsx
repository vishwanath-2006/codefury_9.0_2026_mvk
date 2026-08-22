import React from 'react';

export default function ComparisonBarChart({
  title,
  subtitle,
  data = [],
  metricKey,
  displayKey,
  numericKey,
  unit = '%',
  prefix = '',
  isReturn = false,
  theme = 'emerald'
}) {
  if (!data || data.length === 0) return null;

  // Extract numeric values for scaling (trying numericKey -> metricKey -> parse string)
  const numValues = data.map((d) => {
    if (numericKey && d[numericKey] !== undefined && d[numericKey] !== null) {
      return Math.abs(Number(d[numericKey]) || 0);
    }
    const directNum = Number(d[metricKey]);
    if (!isNaN(directNum)) return Math.abs(directNum);
    // Parse numeric substring if string contains numbers (e.g. "31.2x P/E" -> 31.2, "0.58% TER" -> 0.58)
    const match = String(d[metricKey] || '').match(/[\d.]+/);
    return match ? Math.abs(parseFloat(match[0]) || 0) : 1;
  });

  const maxVal = Math.max(...numValues, 1);

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
          let numVal = 0;
          if (numericKey && item[numericKey] !== undefined && item[numericKey] !== null) {
            numVal = Number(item[numericKey]) || 0;
          } else {
            const raw = Number(item[metricKey]);
            if (!isNaN(raw)) {
              numVal = raw;
            } else {
              const match = String(item[metricKey] || '').match(/[\d.]+/);
              numVal = match ? parseFloat(match[0]) || 0 : 0;
            }
          }

          // Format displayed value
          let valDisplay = 'N/A';
          if (displayKey && item[displayKey]) {
            valDisplay = item[displayKey];
          } else if (item[metricKey] !== undefined && item[metricKey] !== null) {
            const raw = Number(item[metricKey]);
            if (!isNaN(raw)) {
              valDisplay = `${raw > 0 && isReturn ? '+' : ''}${prefix}${raw.toLocaleString('en-IN')}${unit}`;
            } else {
              valDisplay = String(item[metricKey]);
            }
          }

          const pctWidth = maxVal > 0 ? Math.min(100, Math.max(14, (Math.abs(numVal) / maxVal) * 100)) : 20;
          const isPositive = numVal >= 0;

          return (
            <div key={item.key || item.symbol || item.id || idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[60%]">
                  {item.displayName || item.name || item.symbol}
                </span>
                <span
                  className={`font-mono font-bold shrink-0 ml-2 ${
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

              {/* Proportional Bar Fill */}
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
