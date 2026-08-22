import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export default function PlatformOverviewBanner() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 dark:bg-slate-900/95 border border-emerald-500/30 backdrop-blur-md shadow-xl text-white relative overflow-hidden animate-in fade-in duration-200">
      {/* Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                Platform Overview Mode
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">2-Minute Setup</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
              You are currently viewing FinLabs in Platform Overview Mode.
            </p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              Complete your 2-minute financial onboarding to unlock your personalized health score, custom SIP roadmap, and risk diagnostics.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate('/onboarding')}
          className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 px-5 py-2.5 text-xs font-extrabold shrink-0 self-stretch sm:self-auto justify-center"
        >
          Unlock Your Live Profile
        </Button>
      </div>
    </div>
  );
}
