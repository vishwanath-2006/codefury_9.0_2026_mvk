import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, resolveUserName } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
import { COMPLETE_FINANCIAL_TREE } from '../data/faqTreeData';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  TrendingUp,
  ShieldAlert,
  Target,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  GitBranch,
  ChevronRight
} from 'lucide-react';
import { generateAiResponse, buildUserFinancialContext } from '../services/aiService';

export default function AiPage() {
  const { user, profile } = useAuth();
  const { isOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const userName = resolveUserName(user, profile);
  const firstName = userName && userName !== 'Investor' ? userName.split(' ')[0] : null;

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Decision Tree Recursive State
  const [treePath, setTreePath] = useState([]);

  // Determine active branch options based on tree depth
  const currentNode = treePath.length > 0 ? treePath[treePath.length - 1] : null;
  const currentOptions = currentNode ? currentNode.followUps : COMPLETE_FINANCIAL_TREE;

  // Chat scroll refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Financial Analysis state for Action Plan
  const [userAnalysis, setUserAnalysis] = useState(null);

  // Auto-scroll to bottom of chat container
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: 'end'
      });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, loading]);

  // Load user financial context for Action Plan on mount
  useEffect(() => {
    let mounted = true;
    setUserAnalysis(null);
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

  // Initial greeting message
  useEffect(() => {
    const greetingText = firstName
      ? `Hello ${firstName} 👋 I'm your FinLabs AI Copilot. Select any decision topic below to explore our guided financial tree, or type a custom question.`
      : "Hello 👋 I'm your FinLabs AI Copilot. Select any decision topic below to explore our guided financial tree, or type a custom question.";

    setMessages([
      {
        sender: 'ai',
        text: greetingText
      }
    ]);
  }, [firstName]);

  // Decision Tree Option Selection Handler
  const handleSelectNode = (node) => {
    setTreePath((prev) => [...prev, node]);

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: node.label },
      { sender: 'ai', text: node.answer, action: node.actionRoute }
    ]);
  };

  // Tree Navigation Back Handler
  const handleBack = () => {
    if (treePath.length > 0) {
      setTreePath((prev) => prev.slice(0, -1));
    }
  };

  // Tree Navigation Reset Handler
  const handleResetTree = () => {
    setTreePath([]);
  };

  // Free-Text Gemini AI Handler
  const handleSend = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');

    setLoading(true);

    try {
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

  // Surplus allocation waterfall calculations
  const monthlySurplus = userAnalysis?.cashFlow?.monthlySurplus || 0;
  const isUnderfunded = userAnalysis?.emergency?.status === 'Critically Underfunded' || userAnalysis?.emergency?.status === 'Underfunded';
  const primaryGoalRequired = userAnalysis?.goals && userAnalysis.goals.length > 0 ? (userAnalysis.goals[0].requiredMonthlyAmount || 0) : 0;

  const emergencyAllocation = isUnderfunded ? Math.min(monthlySurplus, primaryGoalRequired > 0 ? primaryGoalRequired : Math.round(monthlySurplus * 0.5)) : 0;
  const goalAllocation = Math.min(Math.max(0, monthlySurplus - emergencyAllocation), primaryGoalRequired);
  const remainingForMutualFunds = Math.max(0, monthlySurplus - emergencyAllocation - goalAllocation);

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto pb-12">
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="FinLabs AI Copilot & Decision Tree"
        subtitle="Explore multi-tier financial decision trees or ask free-text queries to our Gemini AI financial engine."
        tag="AI Intelligence"
      />

      {/* PRIORITIZED ACTION PLAN */}
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
            {/* Priority 1 */}
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

            {/* Priority 2 */}
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

            {/* Priority 3 */}
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

      {/* RECURSIVE DECISION TREE PILLS SECTION */}
      <Card className="p-4 space-y-3 bg-slate-900/40 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-500" />
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              {treePath.length === 0 ? '7 Core Financial Root Topics' : 'Branching Follow-Up Questions'}
            </span>
          </div>

          {treePath.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-500 font-bold transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleResetTree}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-500 font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Root</span>
              </button>
            </div>
          )}
        </div>

        {/* Tree Path Breadcrumb */}
        {treePath.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 overflow-x-auto py-1 custom-scrollbar">
            <span className="cursor-pointer hover:underline" onClick={handleResetTree}>Root</span>
            {treePath.map((node, i) => (
              <React.Fragment key={node.id}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-bold truncate max-w-[150px]">{node.label.replace(/^[^\w\s]+/, '').trim()}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Option Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto custom-scrollbar">
          {currentOptions.length > 0 ? (
            currentOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectNode(opt)}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-all flex items-center justify-between group shadow-2xs"
              >
                <span className="truncate pr-2">{opt.label}</span>
                <span className="text-emerald-500/40 group-hover:text-emerald-500 font-bold shrink-0">→</span>
              </button>
            ))
          ) : (
            <div className="col-span-full py-4 text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium">End of this decision branch reached.</p>
              <button
                type="button"
                onClick={handleResetTree}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-xs hover:bg-emerald-500/20 transition cursor-pointer"
              >
                ↺ Return to All Root Topics
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* CHAT MESSAGES CONTAINER */}
      <Card className="min-h-[380px] max-h-[500px] flex flex-col justify-between p-4 overflow-hidden shadow-xl">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
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

              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Deep-link Action Button */}
                {msg.action && (
                  <Link
                    to={msg.action.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white text-[11px] font-bold transition shadow-2xs"
                  >
                    <span>{msg.action.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
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

          <div ref={messagesEndRef} />
        </div>

        {/* Free-Text Input Bar */}
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
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </Card>
    </div>
  );
}
