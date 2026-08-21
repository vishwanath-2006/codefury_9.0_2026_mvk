import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { User, ShieldCheck, Mail, Calendar, Activity } from 'lucide-react';
import { mockUserSummary } from '../mock/finlabsMockData';

export default function ProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl mx-auto">
      <PageHeader
        title="Investor Profile & Identity"
        subtitle="Manage personal baseline details, risk tolerance questionnaire, and financial baseline targets."
        tag="Account"
      />

      <Card className="p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 font-extrabold flex items-center justify-center text-xl shrink-0">
            AD
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{mockUserSummary.name}</h3>
            <p className="text-xs text-slate-400">alex@finlabs.io</p>
            <Badge variant="brand" className="mt-2 text-[10px]">{mockUserSummary.role}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Profile</span>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{mockUserSummary.riskProfile}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Health Baseline</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{mockUserSummary.financialHealthScore} / 100 ({mockUserSummary.healthStatus})</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
