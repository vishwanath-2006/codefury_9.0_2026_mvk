import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
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
      {/* Capability Walkthrough Header Card */}
      <Card className="bg-slate-900 border-slate-800 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between gap-6 p-2">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                Engine Capabilities
              </span>
              <span className="text-xs text-slate-400 font-mono">{moduleName}</span>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              What The {moduleName} Engine Does
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {subtitle}
            </p>

            {/* Capability Pills */}
            <div className="space-y-2 pt-1">
              {capabilities.map((cap, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual CTA Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4 shrink-0 max-w-xs w-full">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Lock className="w-4 h-4" />
                <span>Live Calculations Locked</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Input your income & baseline financial metrics to generate live recommendations.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate(stepTarget)}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 w-full justify-center text-xs font-bold"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </Card>

      {/* Blurred Mock Visual Overlay Card */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Underlaid Blurred Component */}
        <div className="filter blur-md opacity-45 select-none pointer-events-none transition-all duration-300">
          {children}
        </div>

        {/* Lock Overlay Shield */}
        <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-full bg-slate-900 border-2 border-emerald-500/50 text-emerald-400 shadow-2xl shadow-emerald-500/20 mb-3 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold uppercase tracking-wider mb-2">
            Locked — Requires Onboarding Data
          </span>

          <h4 className="text-base sm:text-lg font-bold text-white mb-1">
            Personalized {moduleName} Visualizations
          </h4>

          <p className="text-xs text-slate-300 max-w-md mb-4 leading-relaxed">
            Complete your baseline onboarding to render active charts, ratio stress tests, and automated asset allocation.
          </p>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            iconPosition="left"
            onClick={() => navigate(stepTarget)}
            className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 px-6 font-bold"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      {/* Why This Matters Educational Card */}
      <Card className="bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Why This Financial Concept Matters</span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {whyItMatters.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
