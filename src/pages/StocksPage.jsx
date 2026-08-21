import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, LineChart, TrendingUp, TrendingDown } from 'lucide-react';
import { mockStocks } from '../mock/finlabsMockData';

export default function StocksPage() {
  const [search, setSearch] = useState('');

  const filteredStocks = mockStocks.filter(
    (st) =>
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.ticker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Equity Stocks & Sector Intelligence"
        subtitle="Screen fundamental metrics, growth trajectories, and dividend yields for NSE/BSE stocks."
        tag="Investments"
      />

      <div className="max-w-md">
        <Input
          icon={Search}
          placeholder="Search equity ticker or company name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStocks.map((st) => (
          <Card key={st.id} hover className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {st.ticker}
                  </span>
                  <Badge variant="neutral" className="text-[10px]">{st.sector}</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{st.name}</h3>
              </div>
              <Badge variant={st.suitability === 'Strong Buy' ? 'success' : 'neutral'}>
                {st.suitability}
              </Badge>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Price</span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">₹{st.price.toFixed(2)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Day Change</span>
                <span
                  className={`text-xs font-bold font-mono flex items-center justify-end gap-1 ${
                    st.changePct >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {st.changePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {st.changePct >= 0 ? `+${st.changePct}%` : `${st.changePct}%`}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
