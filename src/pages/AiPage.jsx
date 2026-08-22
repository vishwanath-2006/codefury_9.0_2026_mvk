import React, { useState } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import FeatureOverviewCard from '../components/common/FeatureOverviewCard';
import { Bot, Send, Sparkles, User, HelpCircle } from 'lucide-react';
import { mockAiPrompts } from '../mock/finlabsMockData';

export default function AiPage() {
  const { isOnboarded } = useOnboarding();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello investor 👋 I'm your FinLabs AI financial copilot. I analyze your financial health, goals, and risk profile to answer any question about your money."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const handleSend = (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const newMessages = [
      ...messages,
      { sender: 'user', text }
    ];
    setMessages(newMessages);
    if (!textToSend) setInputQuery('');

    // Simulate AI Copilot Response
    setTimeout(() => {
      let response = "Based on your FinLabs profile, increasing equity allocation via SIP compound interest is your strongest path to target goals.";
      if (text.includes('74') || text.includes('score')) {
        response = "Your score is driven by strong savings rate and low debt ratio. Your main bottleneck is emergency reserves.";
      } else if (text.includes('Downpayment') || text.includes('goal')) {
        response = "Increasing your monthly goal contribution by ₹2,000 will reach target 14 months earlier.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: response }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      {/* Global Overview Mode Banner */}
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="FinLabs AI Assistant"
        subtitle="Conversational financial copilot for instant queries, scenario analysis, and portfolio guidance."
        tag="AI Copilot"
      />

      {!isOnboarded ? (
        <FeatureOverviewCard
          moduleName="FinLabs AI Financial Copilot"
          subtitle="Generates personalized financial guidance, rule-based portfolio explanations, and scenario stress tests grounded in your exact health score & goals."
          capabilities={[
            'Answers natural language queries about your savings surplus, EMIs, and investment suitability.',
            'Simulates "what-if" scenarios (e.g. "What if I increase monthly SIP by ₹3,000?").',
            'Cross-references tax savings, emergency fund runways, and risk profile bounds.'
          ]}
          whyItMatters={[
            'Generic financial advice ignores your unique debt obligations and risk tolerance.',
            'An AI copilot grounded in your data provides instant diagnostic clarity without costly advisor fees.',
            'Asking natural language scenario questions helps you make data-driven decisions.'
          ]}
          ctaLabel="Unlock FinLabs AI Copilot"
          stepTarget="/onboarding"
        >
          {/* Mock Chat Visual */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white">AI</div>
              <div className="p-3 bg-slate-800 rounded-xl text-xs max-w-xs">
                How can I optimize my monthly ₹30,000 savings surplus for my Home Down Payment goal?
              </div>
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-white">User</div>
              <div className="p-3 bg-indigo-600 rounded-xl text-xs max-w-xs">
                Increasing your equity SIP by ₹5,000/mo reaches target 12 months earlier.
              </div>
            </div>
          </div>
        </FeatureOverviewCard>
      ) : (
        /* LIVE AI CHAT MODE */
        <>
          {/* Suggested Questions Pills */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Suggested Financial Questions</p>
            <div className="flex flex-wrap gap-2">
              {mockAiPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Container */}
          <Card className="min-h-[380px] max-h-[500px] flex flex-col justify-between p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask FinLabs AI anything about your money, goals, or stocks..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
