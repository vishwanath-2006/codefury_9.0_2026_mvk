import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      question: "Why real-time financial intelligence vs. a regular AI solver?",
      answer: "Generic AI solvers give static answers without understanding your cash flows. FinLabs continuously evaluates your monthly surplus, debt commitments, and risk tolerance to provide personalized, actionable financial suitabilities."
    },
    {
      question: "Which asset classes and platforms are supported?",
      answer: "FinLabs supports Mutual Funds & SIPs, Direct Equity Stocks, Fixed Deposits & Recurring Deposits, Digital/Physical Gold, and Crypto/Alternative assets across platforms like Zerodha, Groww, Upstox, INDmoney, and major bank apps."
    },
    {
      question: "Is FinLabs free to use?",
      answer: "Yes! The core FinLabs financial health score, 5-step wealth blueprint wizard, and portfolio suitability engine are 100% free to access."
    },
    {
      question: "How does photo verification and data security work?",
      answer: "Your photo snapshot is processed locally in your browser to verify profile identity. All financial metrics are encrypted according to bank-grade security standards."
    }
  ];

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-950 dark:text-slate-100">
            Got Questions? We have answers.
          </h2>
        </div>

        {/* Expandable Accordion List (Noxar Style) */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-6 text-left font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-blue-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
