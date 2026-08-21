import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      title: "Understand",
      description: "Build your financial profile by inputting baseline income, monthly expenses, emergency savings, and risk tolerance.",
    },
    {
      step: "02",
      title: "Analyze",
      description: "Get your personalized Financial Health Score (0-100) and Suitability Insights matching your goals with mutual funds or stocks.",
    },
    {
      step: "03",
      title: "Plan",
      description: "Make better-informed financial decisions, compound your wealth through SIPs, and track goal progress with AI assistance.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="brand" className="mb-3">SIMPLE METHODOLOGY</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            How FinLabs Works
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Three simple steps to transform complex financial data into confident investment decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => (
            <Card key={idx} hover className="relative p-6">
              <div className="text-4xl font-extrabold font-mono text-emerald-500/20 dark:text-emerald-400/20 mb-4">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.description}</p>
            </Card>
          ))}
        </div>

        {/* Final Call To Action Banner */}
        <div className="mt-16 text-center max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Start building your financial future.
          </h3>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto mb-6">
            Join thousands of smart investors using FinLabs to plan, analyze, and invest with clarity.
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/login')}
            className="shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
