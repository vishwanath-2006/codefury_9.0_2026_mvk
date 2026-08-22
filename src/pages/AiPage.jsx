import React, { useState, useEffect } from 'react';
import { useAuth, resolveUserName } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Target
} from 'lucide-react';
import { generateAiResponse, buildUserFinancialContext } from '../services/aiService';

const STAGE3_SUGGESTED_PROMPTS = [
  "Which mutual funds match my risk profile?",
  "How many months of emergency fund do I have?",
  "Give me my complete financial summary and action plan.",
  "How much do I save every month?",
  "What are my financial goals?",
  "What is my financial health score?"
];

export default function AiPage() {
  const { user, profile } = useAuth();
  const userName = resolveUserName(user, profile);
  const firstName = userName && userName !== 'Investor' ? userName.split(' ')[0] : null;

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Financial Analysis state for Action Plan
  const [userAnalysis, setUserAnalysis] = useState(null);

  // Load user financial context for Action Plan on mount
  useEffect(() => {
    let mounted = true;
    setUserAnalysis(null);
    setMessages([]);
    async function loadAnalysis() {
      if (user?.id) {
        try {
          const ctx = await buildUserFinancialContext(user.id, profile);
          if (mounted && ctx?.financialAnalysis) {
            setUserAnalysis(ctx.financialAnalysis);
          }
        } catch (e) {
          console.info('Analysis context load notice:', e);
        }
      }
    }
    loadAnalysis();
    return () => {
      mounted = false;
    };
  }, [user?.id, profile]);

  // Initialize initial greeting dynamically based on authenticated user name
  useEffect(() => {
    const greetingText = firstName
      ? `Hello ${firstName} 👋 I'm your FinLabs AI financial copilot. I analyze your financial health, goals, and risk profile to provide clear, actionable financial guidance.`
      : "Hello 👋 I'm your FinLabs AI financial copilot. I analyze your financial health, goals, and risk profile to provide clear, actionable financial guidance.";

    setMessages([
      {
        sender: 'ai',
        text: greetingText
      }
    ]);
  }, [firstName]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');

    setLoading(true);

    try {
      // Call AI Service bound strictly to the logged in user ID and profile
      const aiResponse = await generateAiResponse(text, user?.id, profile);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiResponse }
      ]);
    } catch (err) {
      console.error('AI response error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to analyze financial context right now. Please check your network connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate surplus allocation waterfall
  const monthlySurplus = userAnalysis?.cashFlow?.monthlySurplus || 0;
  const isUnderfunded = userAnalysis?.emergency?.status === 'Critically Underfunded' || userAnalysis?.emergency?.status === 'Underfunded';
  const primaryGoalRequired = userAnalysis?.goals && userAnalysis.goals.length > 0 ? (userAnalysis.goals[0].requiredMonthlyAmount || 0) : 0;
  
  const emergencyAllocation = isUnderfunded ? Math.min(monthlySurplus, primaryGoalRequired > 0 ? primaryGoalRequired : Math.round(monthlySurplus * 0.5)) : 0;
  const goalAllocation = Math.min(Math.max(0, monthlySurplus - emergencyAllocation), primaryGoalRequired);
  const remainingForMutualFunds = Math.max(0, monthlySurplus - emergencyAllocation - goalAllocation);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      <PageHeader
        title="FinLabs AI Copilot"
        subtitle="Personalized financial intelligence, deterministic health diagnostics, and smart portfolio guidance."
        tag="AI Copilot"
      />

      {/* Prioritized Action Plan Section */}
      {userAnalysis && (
        <Card className="p-5 border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Prioritized Financial Action Plan</h3>
            </div>
            {userAnalysis.healthDiagnostic?.overallScore != null && (
              <Badge variant="brand" className="text-xs font-mono font-bold">
                Health Score: {userAnalysis.healthDiagnostic.overallScore}/100
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Priority 1: Emergency Reserve First */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>1. Emergency Reserve First</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {isUnderfunded
                  ? `Allocate ₹${emergencyAllocation.toLocaleString('en-IN')}/mo to emergency reserve (currently ${userAnalysis.emergency.emergencyMonths || '0'} months vs 6 months target).`
                  : 'Emergency reserve is adequate (6+ months). Maintain in liquid account.'}
              </p>
            </div>

            {/* Priority 2: Active Goal Allocations */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <Target className="w-3.5 h-3.5" />
                <span>2. Active Goal Allocations</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {userAnalysis.goals && userAnalysis.goals.length > 0
                  ? `Automate SIP of ₹${(userAnalysis.goals[0].requiredMonthlyAmount || 0).toLocaleString('en-IN')}/mo for ${userAnalysis.goals[0].goalName}.`
                  : 'Add financial goals in Profile to compute required monthly SIPs.'}
              </p>
            </div>

            {/* Priority 3: Remaining Surplus to Mutual Funds */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>3. Remaining Surplus to Mutual Funds</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {remainingForMutualFunds > 0
                  ? `Invest remaining surplus (₹${remainingForMutualFunds.toLocaleString('en-IN')}/mo) into Direct Growth Large Cap & Flexi Cap funds.`
                  : 'Focus monthly surplus on emergency fund & active goals before long-term equity mutual funds.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Suggested Questions Pills */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Stage 3 AI Copilot Queries</p>
        <div className="flex flex-wrap gap-2">
          {STAGE3_SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition shadow-xs disabled:opacity-50"
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
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md shadow-emerald-500/20">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60">
                <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                <span>FinLabs AI is analyzing your financial context...</span>
              </div>
            </div>
          )}
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
            placeholder="Ask FinLabs AI anything about your money, mutual funds, or action plan..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </Card>
    </div>
  );
}
