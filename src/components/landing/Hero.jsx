import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Tagline Badge */}
        <Badge variant="brand" className="mb-6 py-1 px-3 text-xs tracking-wider uppercase font-bold inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Personalized Financial Intelligence Platform
        </Badge>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight">
          Understand your money.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500">
            Plan smarter.
          </span>{' '}
          Invest with confidence.
        </h1>

        {/* Supporting Paragraph */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          FinLabs helps users understand their financial health, goals, spending and investment choices through personalized financial intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto shadow-lg shadow-emerald-500/25"
          >
            Get Started
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const elem = document.getElementById('features');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto"
          >
            Explore FinLabs
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Bank-grade privacy standards
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Clear, non-biased intelligence
          </span>
        </div>

        {/* Dashboard Preview Component */}
        <div className="mt-14 sm:mt-20">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
