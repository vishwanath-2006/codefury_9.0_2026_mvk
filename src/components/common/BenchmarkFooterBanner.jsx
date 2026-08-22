import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function BenchmarkFooterBanner({ message = "Currently displaying the Early Career National Benchmark. Complete onboarding to map your own assets." }) {
  const navigate = useNavigate();

  return (
    <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-200">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={() => navigate('/onboarding')}
        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
      >
        <span>Complete Onboarding</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
