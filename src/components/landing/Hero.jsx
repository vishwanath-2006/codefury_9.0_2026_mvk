import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Command } from 'lucide-react';
import Button from '../ui/Button';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden transition-colors">
      {/* Noxar-style Pastel Gradient Mesh Backdrop */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#b8d5ff]/70 via-[#e2edff]/50 to-[#fff8eb]/80 dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#090d16] transition-colors duration-300" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-400/20 via-teal-300/20 to-emerald-300/20 rounded-full blur-3xl opacity-70 animate-pulse-glow" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Noxar Style Floating Build Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm mb-6 text-xs font-mono font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 animate-float-slow">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>V1.0.0 WEALTHTECH BUILD</span>
        </div>

        {/* Display Serif Headline (Noxar Style) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-slate-950 dark:text-slate-100 max-w-5xl mx-auto leading-[1.15]">
          #1 Financial{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
            Intelligence
          </span>{' '}
          Assistant
        </h1>

        {/* Supporting Paragraph */}
        <p className="mt-6 text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          FinLabs evaluates your cash flows, performs complex baseline health analysis, and serves personalized investment suitabilities—all in one seamless experience.
        </p>

        {/* Noxar Style CTA Button with Key Badge */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Get Started with FinLabs</span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/80 text-[10px] font-mono tracking-wider font-extrabold text-blue-100 flex items-center gap-1">
              <Command className="w-3 h-3" /> Step 1
            </span>
          </button>

          <button
            onClick={() => {
              const elem = document.getElementById('features');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition backdrop-blur-md"
          >
            Explore Methodology
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Bank-grade privacy standards
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Clear, non-biased intelligence
          </span>
        </div>

        {/* Dashboard Preview Component with Floating Animation */}
        <div className="mt-14 sm:mt-16 animate-float">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
