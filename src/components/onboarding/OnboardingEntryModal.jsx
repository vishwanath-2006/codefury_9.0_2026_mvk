import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, LayoutDashboard, X, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export default function OnboardingEntryModal({ isOpen, onClose, onStartOnboarding }) {
  // ESC key listener to dismiss/skip to dashboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-modal-title"
      >
        {/* Ambient Top Glow Accents */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close / Skip button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Skip to Market Overview (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            FinLabs Wealth Intelligence
          </span>
        </div>

        <h3 id="entry-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2 leading-tight">
          Welcome to FinLabs Market Center
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Would you like to complete your 2-minute baseline questionnaire to calculate your personalized health score, net worth, and custom SIP roadmap, or explore the live market overview first?
        </p>

        {/* Highlight Pills */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-semibold">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Live Market Trends</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span>2-Min Personalization</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            icon={LayoutDashboard}
            iconPosition="left"
            className="w-full sm:w-auto justify-center border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
          >
            Explore Market Overview
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onStartOnboarding}
            icon={Sparkles}
            iconPosition="left"
            className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 px-6 font-extrabold text-white"
          >
            Start 2-Min Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}
