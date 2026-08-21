import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, TrendingUp, Star, Filter, ArrowUpRight } from 'lucide-react';
import { mockMutualFunds } from '../mock/finlabsMockData';

export default function MutualFundsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Large Cap Index', 'Flexi Cap', 'Small Cap', 'Debt'];

  const filteredFunds = mockMutualFunds.filter((fund) => {
    const matchesSearch = fund.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || fund.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <PageHeader
        title="Mutual Funds & SIP Screener"
        subtitle="Explore top-performing index, equity, hybrid, and debt funds with personalized risk matching."
        tag="Investments"
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search mutual funds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Funds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFunds.map((fund) => (
          <Card key={fund.id} hover className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Badge variant="neutral" className="mb-1 text-[10px]">{fund.category}</Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{fund.name}</h3>
                </div>
                <Badge variant="brand" className="text-[10px] font-bold">{fund.suitability}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">3Y CAGR</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{fund.cagr3Yr}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Min SIP</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">₹{fund.minSip}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Risk Rating</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{fund.risk}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {fund.rating} / 5 Rating
              </span>
              <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right">
                Fund Analytics
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
