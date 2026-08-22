import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export default function LockedFeatureOverlay({ title = "Unlock Your Live Profile", description = "Complete your 2-minute onboarding to unlock real metrics, live health scores, and personalized asset analytics." }) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-700/50 text-center animate-in fade-in duration-200">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
        <Lock className="w-6 h-6" />
      </div>

      <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-2 justify-center">
        <span>{title}</span>
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
      </h3>

      <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed mb-5 font-medium">
        {description}
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/onboarding')}
        icon={ArrowRight}
        iconPosition="right"
        className="bg-emerald-500 hover:bg-emerald-600 font-extrabold text-white shadow-xl shadow-emerald-500/20 px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
      >
        Complete Onboarding to Unlock
      </Button>
    </div>
  );
}
