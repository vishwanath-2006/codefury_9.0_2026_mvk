import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Rocket, Calendar, TrendingUp } from 'lucide-react';
import { mockIpos } from '../mock/finlabsMockData';

export default function IposPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="IPO Radar & Subscription Insights"
        subtitle="Track upcoming, active, and past IPOs with GMP indicators and suitability scores."
        tag="Investments"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIpos.map((ipo) => (
          <Card key={ipo.id} hover className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant={ipo.status === 'Open Now' ? 'success' : 'info'} className="mb-2">
                    {ipo.status}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{ipo.company}</h3>
                </div>
                <Badge variant="purple" className="font-mono text-xs">{ipo.gmpPct} GMP</Badge>
              </div>

              <div className="space-y-2 text-xs my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription Dates</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{ipo.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price Band</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{ipo.priceBand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue Size</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{ipo.issueSize}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Suitability Indicator</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{ipo.suitability}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
