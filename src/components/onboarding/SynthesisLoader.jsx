import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SynthesisLoader({ healthScore, riskProfile, onComplete }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [progress, setProgress] = useState(10);

  const synthesisSteps = [
    { title: 'Benchmarking monthly surplus & cash flows...', icon: Activity },
    { title: 'Calculating debt-to-income ratio & credit health...', icon: ShieldCheck },
    { title: 'Evaluating market volatility risk profile...', icon: TrendingUp },
    { title: 'Synthesizing your FinLabs clarity engine...', icon: Sparkles },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress > 25 && progress <= 50) setCurrentStepIdx(1);
    else if (progress > 50 && progress <= 75) setCurrentStepIdx(2);
    else if (progress > 75) setCurrentStepIdx(3);
  }, [progress]);

  const CurrentIcon = synthesisSteps[currentStepIdx].icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Progress Ring */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="stroke-emerald-500 transition-all duration-150 ease-linear"
              strokeWidth="8"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <CurrentIcon className="w-8 h-8 text-emerald-400 animate-pulse mb-1" />
            <span className="text-xs font-mono font-extrabold text-slate-300">{progress}%</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            FinLabs AI Engine
          </h3>
          <p className="text-xs text-emerald-400 font-medium mt-1 animate-pulse">
            {synthesisSteps[currentStepIdx].title}
          </p>
        </div>

        {/* Dynamic Micro Checklist */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 text-left">
          {synthesisSteps.map((step, idx) => {
            const isDone = idx < currentStepIdx || progress === 100;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-opacity duration-200 ${
                  isDone
                    ? 'text-slate-300 font-medium'
                    : isCurrent
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-600 opacity-60'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    isDone
                      ? 'text-emerald-500'
                      : isCurrent
                      ? 'text-emerald-400 animate-spin'
                      : 'text-slate-700'
                  }`}
                />
                <span className="truncate">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Preview Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Index</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{healthScore} / 100</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Profile</span>
            <span className="text-base font-bold text-teal-300">{riskProfile}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
