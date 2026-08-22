import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, resolveUserName } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PlatformOverviewBanner from '../components/common/PlatformOverviewBanner';
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
  MessageSquare,
  HelpCircle,
  Layers
} from 'lucide-react';
import { generateAiResponse, buildUserFinancialContext } from '../services/aiService';
import { BOT_ROOT_TREE } from '../data/botDecisionTree';

export default function AiPage() {
  const { user, profile } = useAuth();
  const { isOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const userName = resolveUserName(user, profile);
  const firstName = userName && userName !== 'Investor' ? userName.split(' ')[0] : null;

  // Chat Transcript State
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Decision Tree State Engine
  const [activeTreeOptions, setActiveTreeOptions] = useState(BOT_ROOT_TREE);
  const [historyStack, setHistoryStack] = useState([]);
  const [isEscapeHatchMode, setIsEscapeHatchMode] = useState(false);

  // Chat scroll refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Financial Analysis state for Action Plan
  const [userAnalysis, setUserAnalysis] = useState(null);

  // Auto-scroll to bottom of chat container
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, loading, activeTreeOptions]);

  // Load user financial context on mount
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

  // Initial greeting
  useEffect(() => {
    const greetingText = firstName
      ? `Hello ${firstName} 👋 I'm your FinLabs Hybrid AI Copilot. Choose a topic from the quick-tap decision tree below, or type any custom question to activate NLP mode.`
      : "Hello 👋 I'm your FinLabs Hybrid AI Copilot. Choose a topic from the quick-tap decision tree below, or type any custom question to activate NLP mode.";

    setMessages([
      {
        id: 'init_msg',
        sender: 'ai',
        text: greetingText
      }
    ]);
  }, [firstName]);

  // Handle Tree Node Option Selection
  const handleSelectTreeNode = (node) => {
    // 1. Append user's selection
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: node.title
    };

    // 2. Append deterministic bot response
    const botMsg = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: node.botResponse,
      appAction: node.appAction
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);

    // 3. Update Tree Navigation Stack
    if (node.options && node.options.length > 0) {
      setHistoryStack((prev) => [...prev, activeTreeOptions]);
      setActiveTreeOptions(node.options);
      setIsEscapeHatchMode(false);
    } else {
      // Leaf node reached
      setIsEscapeHatchMode(true);
    }
  };

  // Back Navigation
  const handleGoBack = () => {
    if (historyStack.length === 0) return;
    const previousOptions = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setActiveTreeOptions(previousOptions);
    setIsEscapeHatchMode(false);
  };

  // Main Menu Reset Navigation
  const handleResetMainMenu = () => {
    setHistoryStack([]);
    setActiveTreeOptions(BOT_ROOT_TREE);
    setIsEscapeHatchMode(false);
  };

  // Handle Free-Form Custom Prompt (Gemini API NLP Fallback)
  const handleSendCustomPrompt = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMessage = { id: `user_${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');

    setLoading(true);

    try {
      const aiResponse = await generateAiResponse(text, user?.id, profile);
      setMessages((prev) => [
        ...prev,
        { id: `ai_${Date.now()}`, sender: 'ai', text: aiResponse }
      ]);
    } catch (err) {
      console.error('AI response error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: 'Unable to analyze financial context right now. Please check your network connection and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto pb-12">
      {!isOnboarded && <PlatformOverviewBanner />}

      <PageHeader
        title="FinLabs AI Copilot"
        subtitle="Hybrid Decision Tree & Smart Gemini NLP Copilot. Tap structured topics or ask custom questions."
        tag="Hybrid Intelligence"
      />

      {/* PRIORITIZED ACTION PLAN BANNER */}
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
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>1. Emergency Reserve First</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {userAnalysis.emergency?.status === 'Critically Underfunded'
                  ? `Allocate surplus to emergency reserve (currently ${userAnalysis.emergency.emergencyMonths || '0'} months vs 6 months target).`
                  : 'Emergency reserve is adequate (6+ months). Maintain in liquid account.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <Target className="w-3.5 h-3.5" />
                <span>2. Active Goal Allocations</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {userAnalysis.goals && userAnalysis.goals.length > 0
                  ? `Automate monthly goal SIP of ₹${(userAnalysis.goals[0].requiredMonthlyAmount || 0).toLocaleString('en-IN')}/mo.`
                  : 'Add financial goals in Profile to compute required monthly SIPs.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>3. Surplus to Mutual Funds</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                Invest remaining surplus into Index & Flexi Cap mutual funds for maximum compounding.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* MAIN CHAT CONVERSATION CONTAINER */}
      <Card className="min-h-[420px] max-h-[620px] flex flex-col justify-between p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden rounded-2xl">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id || Math.random()}
              className={`flex items-start gap-3 animate-in fade-in duration-200 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/25'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble Card */}
              <div className={`max-w-[88%] sm:max-w-[82%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs font-medium shadow-md shadow-indigo-950/20'
                      : 'bg-slate-900/90 dark:bg-slate-900/95 text-slate-100 dark:text-slate-100 rounded-tl-xs border border-emerald-500/30 dark:border-emerald-500/25 shadow-lg shadow-emerald-950/20'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-1 text-slate-100 dark:text-slate-100">
                      {renderFormattedAiMessage(msg.text)}
                    </div>
                  )}
                </div>

                {/* Direct App Action Launch Button */}
                {msg.appAction && (
                  <button
                    type="button"
                    onClick={() => navigate(msg.appAction.route)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 cursor-pointer group"
                  >
                    <span>{msg.appAction.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* High-Contrast Loading State */}
          {loading && (
            <div className="flex items-start gap-3 animate-in fade-in duration-200">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md shadow-emerald-500/30">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 text-emerald-400 text-xs font-mono flex items-center gap-2.5 rounded-tl-xs border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="font-semibold text-slate-200">FinLabs AI is analyzing your financial context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* DECISION TREE BUTTON TRAY & TOOLBAR */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Navigation Toolbar (Back & Main Menu) */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Flowchart Decision Tree</span>
              </span>
              {historyStack.length > 0 && (
                <Badge variant="brand" className="text-[10px] font-mono">
                  Depth: Level {historyStack.length + 1}
                </Badge>
              )}
            </div>

            {historyStack.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-[11px] font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetMainMenu}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-[11px] font-bold transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Main Menu</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick-Tap Options Button Tray */}
          <div className="flex flex-wrap gap-2">
            {activeTreeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectTreeNode(option)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-emerald-500/30 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/60 hover:border-emerald-400 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{option.title}</span>
              </button>
            ))}

            {/* Smart Escape Hatch Option */}
            <button
              type="button"
              onClick={() => {
                setIsEscapeHatchMode(true);
                const inputEl = document.getElementById('nlp-custom-input');
                if (inputEl) inputEl.focus();
              }}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>💬 Ask custom question</span>
            </button>
          </div>

          {/* Text Input Bar (NLP Escape Hatch) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCustomPrompt();
            }}
            className="flex gap-2 pt-1"
          >
            <input
              id="nlp-custom-input"
              type="text"
              placeholder={
                isEscapeHatchMode
                  ? "Type your custom financial question..."
                  : "Type a question if not listed above..."
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-medium placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

/**
 * Rich High-Contrast AI Message Renderer with Markdown support
 */
function renderFormattedAiMessage(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n');

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();

    // 1. Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2.5 my-1 text-slate-100">
          <span className="text-emerald-400 font-black text-sm mt-0.5 shrink-0">•</span>
          <span className="leading-relaxed">{parseInlineMarkdown(bulletContent)}</span>
        </div>
      );
    }

    // 2. Numbered list item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      return (
        <div key={lineIdx} className="flex items-start gap-2.5 my-1.5 text-slate-100">
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
            {num}
          </span>
          <span className="leading-relaxed">{parseInlineMarkdown(text)}</span>
        </div>
      );
    }

    // 3. Section Title / Header (**Title**)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(':')) {
      return (
        <div key={lineIdx} className="font-extrabold text-emerald-400 text-sm mt-3 mb-1 tracking-tight">
          {trimmed.replace(/\*\*/g, '')}
        </div>
      );
    }

    // 4. Empty line
    if (!trimmed) {
      return <div key={lineIdx} className="h-2" />;
    }

    // 5. Normal paragraph
    return (
      <p key={lineIdx} className="leading-relaxed text-slate-100 my-0.5">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

function parseInlineMarkdown(text) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-extrabold text-emerald-300 dark:text-emerald-400">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold">
          {codeText}
        </code>
      );
    }
    return part;
  });
}
