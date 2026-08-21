import React from 'react';
import { Activity, Target, ShieldCheck, PieChart, Sparkles, Bot } from 'lucide-react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

export default function FeaturePreview() {
  const features = [
    {
      icon: Activity,
      title: "Financial Health Score",
      description: "Real-time diagnostic score evaluating liquidity, savings rate, emergency reserve, and debt-to-income ratio.",
      badge: "01 Health",
    },
    {
      icon: Target,
      title: "Goal Planning Engine",
      description: "Multi-horizon goal tracking with dynamic SIP compounding models for retirement, real estate, and emergency funds.",
      badge: "02 Goals",
    },
    {
      icon: ShieldCheck,
      title: "Risk Profile Assessment",
      description: "Psychometric & capacity-based risk evaluation matching your psychological risk threshold with real assets.",
      badge: "03 Risk",
    },
    {
      icon: PieChart,
      title: "Unified Portfolio Dashboard",
      description: "Integrated view of mutual funds, equity stocks, and fixed income assets with asset allocation visualization.",
      badge: "04 Portfolio",
    },
    {
      icon: Sparkles,
      title: "Investment Suitability",
      description: "Algorithmic matching evaluating whether a specific stock, SIP, or IPO aligns with your baseline financial health.",
      badge: "05 Suitability",
    },
    {
      icon: Bot,
      title: "FinLabs AI Assistant",
      description: "Conversational copilot for instant scenario queries, tax optimization tips, and financial clarity.",
      badge: "06 AI Copilot",
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="brand" className="mb-3">INTELLIGENCE PLATFORM</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Everything you need for complete financial clarity
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            A modular ecosystem designed to guide your journey from baseline financial health to intelligent wealth creation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} hover className="relative group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral">{f.badge}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
