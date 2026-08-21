import React from 'react';
import { HelpCircle, AlertTriangle, Layers, Target, FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

export default function ProblemSection() {
  const problems = [
    {
      icon: FileText,
      title: "Financial information is complicated",
      description: "Jargon-filled statements, confusing financial metrics, and overwhelming data make understanding your money stressful.",
    },
    {
      icon: HelpCircle,
      title: "Beginners don't know where to invest",
      description: "With thousands of stocks and mutual funds, choosing options suited to your specific profile feels impossible.",
    },
    {
      icon: AlertTriangle,
      title: "People struggle to understand risk",
      description: "Most investors misjudge their risk tolerance, leading to panic selling or under-investing in long-term assets.",
    },
    {
      icon: Layers,
      title: "Investments are spread apart",
      description: "SIPs, stocks, FDs, and bank accounts scattered across apps make tracking net worth fragmented.",
    },
    {
      icon: Target,
      title: "Financial goals are difficult to plan",
      description: "Calculating inflation-adjusted goals like buying a home or retiring comfortably requires dynamic math.",
    },
  ];

  return (
    <section id="problem" className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="warning" className="mb-3">THE CHALLENGE</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Why traditional financial planning is failing investors
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Most people want to build long-term wealth, but modern financial products create friction instead of clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} hover className="flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
