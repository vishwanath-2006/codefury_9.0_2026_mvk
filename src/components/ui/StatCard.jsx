import React from 'react';
import { Card } from './Card';
import Badge from './Badge';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, description }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/60">
          {change && (
            <Badge variant={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'warning' : 'neutral'}>
              {change}
            </Badge>
          )}
          {description && <span className="text-slate-500 dark:text-slate-400 truncate">{description}</span>}
        </div>
      )}
    </Card>
  );
}
