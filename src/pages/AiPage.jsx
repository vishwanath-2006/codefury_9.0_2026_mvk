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
      const aiResponse = await generateAiResponse(text, user?.id, profile, messages);
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
          isError: true,
          failedQuery: text,
          text: 'Unable to formulate financial response right now. Please check your network connection and click Retry.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 max-w-4xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span>FinLabs AI Copilot</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-mono font-bold">
              v2.0 Active
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Personalized wealth intelligence, cash-flow diagnostic, and financial education engine.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-700 dark:text-slate-300 text-[11px]">
            {user?.email ? `Connected: ${userName}` : 'Guest Session'}
          </span>
        </div>
      </div>

      {/* CHAT CONTAINER CARD */}
      <Card className="flex flex-col h-[650px] sm:h-[700px] border-slate-200 dark:border-slate-800 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* MESSAGES VIEWPORT */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-150`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none font-medium shadow-indigo-950/20'
                      : 'bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-tl-none shadow-emerald-950/20 text-slate-100'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {renderFormattedAiMessage(msg.text)}
                    </div>
                  )}

                  {/* Optional Deep-Link Action Button */}
                  {msg.appAction && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">Explore dedicated tool:</span>
                      <button
                        onClick={() => navigate(msg.appAction.route)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <span>{msg.appAction.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Optional Retry Button on Error */}
                  {msg.isError && msg.failedQuery && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-rose-400 font-medium">Request failed</span>
                      <button
                        type="button"
                        onClick={() => handleSendCustomPrompt(msg.failedQuery)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 border border-indigo-400/30 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Thinking Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900/90 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400 font-medium shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>FinLabs AI is formulating financial response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INTERACTIVE CONTROLS DOCK */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-3">
          {/* 1. Quick Decision Tree Options Grid */}
          {!loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>Interactive Quick Topics</span>
                </span>
                <div className="flex gap-2">
                  {historyStack.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                    >
                      ← Back
                    </button>
                  )}
                  {historyStack.length > 0 && (
                    <button
                      onClick={handleResetMainMenu}
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 transition"
                    >
                      Main Menu
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Option Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {activeTreeOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectTreeNode(opt)}
                    className="p-2 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group flex items-start gap-2 active:scale-98 cursor-pointer"
                  >
                    <span className="text-base mt-0.5">{opt.icon || '💬'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-200 group-hover:text-emerald-300 text-xs truncate">
                        {opt.title}
                      </div>
                      {opt.subtitle && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {opt.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Free-Form NLP Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim() && !loading) {
                handleSendCustomPrompt();
              }
            }}
            className="flex gap-2 pt-1"
          >
            <input
              id="nlp-custom-input"
              type="text"
              placeholder="Ask anything (e.g., 'What is a mutual fund?', 'How to invest ₹1,00,000')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputQuery.trim() && !loading) {
                    handleSendCustomPrompt();
                  }
                }
              }}
              disabled={loading}
              className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-medium"
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
 * Rich High-Contrast AI Message Renderer with Markdown & Table support
 */
function renderFormattedAiMessage(rawText) {
  if (!rawText) return null;

  const lines = rawText.split('\n');
  const elements = [];
  let tableBuffer = [];

  const flushTable = (key) => {
    if (tableBuffer.length === 0) return null;
    const header = tableBuffer[0].split('|').map((c) => c.trim()).filter(Boolean);
    const dataRows = tableBuffer.slice(2).map((row) =>
      row.split('|').map((c) => c.trim()).filter(Boolean)
    );

    const tbl = (
      <div key={key} className="overflow-x-auto my-2 rounded-lg border border-slate-700/80 bg-slate-950/60 shadow-inner">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/80 bg-slate-900/90 text-emerald-400 font-bold">
              {header.map((h, hi) => (
                <th key={hi} className="p-2">{parseInlineMarkdown(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((r, ri) => (
              <tr key={ri} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40">
                {r.map((c, ci) => (
                  <td key={ci} className="p-2 text-slate-200">{parseInlineMarkdown(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    return tbl;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Check if line is part of a markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    } else if (tableBuffer.length > 0) {
      elements.push(flushTable(`table_${lineIdx}`));
    }

    // 1. Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletContent = trimmed.substring(2);
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2.5 my-1 text-slate-100">
          <span className="text-emerald-400 font-black text-sm mt-0.5 shrink-0">•</span>
          <span className="leading-relaxed">{parseInlineMarkdown(bulletContent)}</span>
        </div>
      );
      return;
    }

    // 2. Numbered list item
    const numMatch = trimmed.match(/^(\\d+)\\.\\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      elements.push(
        <div key={lineIdx} className="flex items-start gap-2.5 my-1.5 text-slate-100">
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
            {num}
          </span>
          <span className="leading-relaxed">{parseInlineMarkdown(text)}</span>
        </div>
      );
      return;
    }

    // 3. Section Title / Header (**Title**)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(':')) {
      elements.push(
        <div key={lineIdx} className="font-extrabold text-emerald-400 text-sm mt-3 mb-1 tracking-tight">
          {trimmed.replace(/\\*\\*/g, '')}
        </div>
      );
      return;
    }

    // 4. Empty line
    if (!trimmed) {
      elements.push(<div key={lineIdx} className="h-1.5" />);
      return;
    }

    // 5. Normal paragraph
    elements.push(
      <p key={lineIdx} className="leading-relaxed text-slate-100 my-0.5">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  if (tableBuffer.length > 0) {
    elements.push(flushTable(`table_end`));
  }

  return elements;
}

function parseInlineMarkdown(text) {
  const parts = text.split(/(\\*\\*.*?\\*\\*|`.*?`)/g);

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
