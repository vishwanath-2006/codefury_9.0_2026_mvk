import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function FeatureOverviewCard({
  moduleName,
  subtitle,
  capabilities = [],
  whyItMatters = [],
  ctaLabel = 'Unlock With Onboarding',
  stepTarget = '/onboarding',
  children,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Capability Walkthrough Header Card (Solid Slate-900 Dark Container for Guaranteed 100% High Contrast Text in Light & Dark Mode) */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wider border border-emerald-500/40 shadow-xs">
                Engine Capabilities
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">{moduleName}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              What The {moduleName} Engine Does
            </h3>

            <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed">
              {subtitle}
            </p>

            {/* High Contrast White Capability Bullet Points */}
            <div className="space-y-3 pt-2">
              {capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white font-extrabold">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug text-white drop-shadow-xs">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual CTA Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 shrink-0 max-w-xs w-full shadow-lg">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-1.5">
                <Lock className="w-4 h-4" />
                <span>Live Calculations Locked</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                Input your income & baseline financial metrics to generate live recommendations.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate(stepTarget)}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 w-full justify-center text-xs font-extrabold text-white py-2.5"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Blurred Mock Visual Overlay Card */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Underlaid Blurred Component */}
        <div className="filter blur-md opacity-45 select-none pointer-events-none transition-all duration-300">
          {children}
        </div>

        {/* Lock Overlay Shield */}
        <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-full bg-slate-900 border-2 border-emerald-500/50 text-emerald-400 shadow-2xl shadow-emerald-500/20 mb-3 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold uppercase tracking-wider mb-2">
            Locked — Requires Onboarding Data
          </span>

          <h4 className="text-lg sm:text-xl font-extrabold text-white mb-1.5">
            Personalized {moduleName} Visualizations
          </h4>

          <p className="text-xs sm:text-sm text-slate-200 font-semibold max-w-md mb-4 leading-relaxed">
            Complete your baseline onboarding to render active charts, ratio stress tests, and automated asset allocation.
          </p>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            iconPosition="left"
            onClick={() => navigate(stepTarget)}
            className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 px-6 font-extrabold text-white py-2.5 text-xs"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      {/* Why This Matters Educational Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Why This Financial Concept Matters</span>
        </div>
        <ul className="space-y-3">
          {whyItMatters.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white font-extrabold leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
