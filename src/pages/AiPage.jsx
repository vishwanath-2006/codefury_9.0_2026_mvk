import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, resolveUserName } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Compass,
  Check
} from 'lucide-react';
import { ADVISOR_DOMAINS } from '../data/advisorDomains';
import {
  loadAdvisorSession,
  saveAdvisorSession,
  clearAdvisorSession,
  initializeKnownFactsFromProfile,
  extractFactsFromAnswer,
  getNextAdvisorStep,
  generateDomainPlan,
  isUserRequestingStop
} from '../services/aiAdvisorEngine';
import { generateAiResponse, buildUserFinancialContext } from '../services/aiService';

export default function AiPage() {
  const { user, profile } = useAuth();
  const { isOnboarded } = useOnboarding();
  const navigate = useNavigate();
  const userName = resolveUserName(user, profile);
  const firstName = userName && userName !== 'Investor' ? userName.split(' ')[0] : 'there';

  // Domain & Guided Interview State
  const [activeDomain, setActiveDomain] = useState(null);
  const [currentStep, setCurrentStep] = useState(null); // { questionKey, questionText, options, isEnough }
  const [knownFacts, setKnownFacts] = useState({});
  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [answersHistory, setAnswersHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlanGenerated, setIsPlanGenerated] = useState(false);

  // Chat scroll refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll helper
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, loading, currentStep, activeDomain]);

  // 1. Initialize Profile Context & Restore Active Session
  useEffect(() => {
    let mounted = true;
    async function initSession() {
      try {
        const profileCtx = await buildUserFinancialContext(user?.id, profile);
        if (!mounted) return;

        const baseFacts = initializeKnownFactsFromProfile(profileCtx);
        const savedSession = loadAdvisorSession(user?.id);

        if (savedSession && savedSession.messages && savedSession.messages.length > 0) {
          setActiveDomain(savedSession.activeDomain || null);
          setCurrentStep(savedSession.currentStep || null);
          setKnownFacts({ ...baseFacts, ...(savedSession.knownFacts || {}) });
          setQuestionsAsked(savedSession.questionsAsked || []);
          setAnswersHistory(savedSession.answersHistory || []);
          setMessages(savedSession.messages || []);
          setIsPlanGenerated(savedSession.isPlanGenerated || false);
        } else {
          setKnownFacts(baseFacts);
          // Initial greeting without selecting a domain yet
          setMessages([
            {
              id: 'init_welcome',
              sender: 'ai',
              text: `Hi ${firstName} 👋 I'm **FinLabs AI**.

Instead of making you think of random questions, I'll guide you step-by-step through your finances with an adaptive financial interview.

**What would you like to work on today?**`
            }
          ]);
        }
      } catch (err) {
        console.info('Session initialization notice:', err);
      }
    }

    initSession();
    return () => {
      mounted = false;
    };
  }, [user?.id, profile, firstName]);

  // 2. Persist Session State on Changes
  useEffect(() => {
    if (messages.length > 0) {
      saveAdvisorSession({
        userId: user?.id,
        activeDomain,
        currentStep,
        knownFacts,
        questionsAsked,
        answersHistory,
        messages,
        isPlanGenerated
      });
    }
  }, [activeDomain, currentStep, knownFacts, questionsAsked, answersHistory, messages, isPlanGenerated, user?.id]);

  // 3. Handle Domain Selection
  const handleSelectDomain = (domainId) => {
    const domain = ADVISOR_DOMAINS.find((d) => d.id === domainId);
    if (!domain) return;

    setActiveDomain(domainId);
    setIsPlanGenerated(false);

    // Append user selection
    const userMsg = {
      id: `user_domain_${Date.now()}`,
      sender: 'user',
      text: `Let's work on ${domain.title}`
    };

    // Evaluate next question based on existing known facts
    const nextStep = getNextAdvisorStep(domainId, knownFacts, questionsAsked);

    let aiGreetingText = `Great! ${domain.initialPrompt}`;
    if (nextStep.questionText) {
      aiGreetingText += `

${nextStep.questionText}`;
    }

    const aiMsg = {
      id: `ai_domain_${Date.now()}`,
      sender: 'ai',
      text: aiGreetingText
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setCurrentStep(nextStep);
    if (nextStep.questionKey) {
      setQuestionsAsked((prev) => [...prev, nextStep.questionKey]);
    }

    if (nextStep.isEnough) {
      // If we already have all facts for this domain, generate plan directly
      triggerPlanGeneration(domainId, knownFacts);
    }
  };

  // 4. Trigger Final Plan Generation
  const triggerPlanGeneration = (domainId, factsToUse) => {
    const targetDomain = domainId || activeDomain || 'my_profile';
    const planMarkdown = generateDomainPlan(targetDomain, factsToUse || knownFacts);
    const domainObj = ADVISOR_DOMAINS.find((d) => d.id === targetDomain);

    const planMessage = {
      id: `ai_plan_${Date.now()}`,
      sender: 'ai',
      text: `${planMarkdown}

---

**✅ I've completed your personalized analysis for ${domainObj ? domainObj.title : 'this area'}.**

What would you like to work on next?`
    };

    setMessages((prev) => [...prev, planMessage]);
    setIsPlanGenerated(true);
    setCurrentStep(null);
  };

  // 5. Handle User Answer to Adaptive Question
  const handleUserAnswer = async (answerText) => {
    const text = (answerText || inputQuery).trim();
    if (!text || loading) return;

    // Check if user requested stop / plan
    if (isUserRequestingStop(text)) {
      const userMsg = { id: `user_${Date.now()}`, sender: 'user', text };
      setMessages((prev) => [...prev, userMsg]);
      setInputQuery('');
      triggerPlanGeneration(activeDomain, knownFacts);
      return;
    }

    const userMessage = { id: `user_${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    if (!answerText) setInputQuery('');

    // Extract facts from the answer
    const currentQKey = currentStep?.questionKey || 'general';
    const updatedFacts = extractFactsFromAnswer(currentQKey, text, knownFacts);
    setKnownFacts(updatedFacts);
    setAnswersHistory((prev) => [...prev, { questionKey: currentQKey, answer: text }]);

    setLoading(true);

    try {
      // Evaluate if we should ask next question or finalize
      const nextStep = getNextAdvisorStep(activeDomain || 'my_profile', updatedFacts, [...questionsAsked, currentQKey]);

      if (nextStep.isEnough || !nextStep.questionText) {
        // Complete domain interview and render plan
        triggerPlanGeneration(activeDomain, updatedFacts);
      } else {
        // Acknowledge briefly and ask next question
        let responseText = nextStep.questionText;

        // Optional server-side NLP enrichment
        try {
          const serverResponse = await generateAiResponse(
            `Context: Working on domain ${activeDomain}. User just answered: "${text}". Next question to ask: "${nextStep.questionText}"`,
            user?.id,
            profile,
            messages
          );
          if (serverResponse && !serverResponse.includes('Unable to formulate')) {
            // Keep clean formatted response
          }
        } catch (e) {
          // fallback to deterministic response
        }

        const aiResponseMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: responseText
        };

        setMessages((prev) => [...prev, aiResponseMsg]);
        setCurrentStep(nextStep);
        if (nextStep.questionKey) {
          setQuestionsAsked((prev) => [...prev, nextStep.questionKey]);
        }
      }
    } catch (err) {
      console.error('Advisor processing error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          isError: true,
          failedQuery: text,
          text: 'Unable to process your answer right now. Please click Retry.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 6. Reset or Switch Domain
  const handleResetSession = () => {
    clearAdvisorSession();
    setActiveDomain(null);
    setCurrentStep(null);
    setIsPlanGenerated(false);
    setQuestionsAsked([]);
    setAnswersHistory([]);
    setMessages([
      {
        id: 'init_welcome_reset',
        sender: 'ai',
        text: `Hi ${firstName} 👋 I'm **FinLabs AI**.

What would you like to work on next?`
      }
    ]);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 max-w-4xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span>FinLabs Guided Financial Advisor</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-mono font-bold">
              v2.0 Adaptive
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Context-aware financial interview, cash flow diagnostics, and personalized wealth roadmap.
          </p>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2">
          {activeDomain && (
            <button
              onClick={handleResetSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Domain</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-700 dark:text-slate-300 text-[11px]">
              {user?.email ? `Connected: ${firstName}` : 'Guest Session'}
            </span>
          </div>
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

                  {/* Optional Retry Button on Error */}
                  {msg.isError && msg.failedQuery && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-rose-400 font-medium">Request failed</span>
                      <button
                        type="button"
                        onClick={() => handleUserAnswer(msg.failedQuery)}
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
                <span>FinLabs AI is formulating adaptive response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INTERACTIVE DOCK & GUIDED CONTROLS */}
        <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800 flex flex-col gap-3">
          {/* STATE A: Show Domain Cards if No Active Domain OR Plan Completed */}
          {(!activeDomain || isPlanGenerated) && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose a Financial Domain to Guide You</span>
                </span>
              </div>

              {/* 8 Core Selectable Domain Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {ADVISOR_DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => handleSelectDomain(domain.id)}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between gap-1.5 active:scale-98 cursor-pointer shadow-sm hover:shadow-emerald-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{domain.icon}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                        {domain.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-emerald-300 text-xs">
                        {domain.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {domain.tagline}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STATE B: Active Interview with Quick Option Buttons */}
          {activeDomain && !isPlanGenerated && currentStep && !loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Suggested Quick Answers</span>
                </span>

                {/* Explicit Stop / Generate Plan Button */}
                <button
                  onClick={() => triggerPlanGeneration(activeDomain, knownFacts)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>✓ I have enough information</span>
                </button>
              </div>

              {/* Dynamic Quick Answer Chips */}
              {currentStep.options && currentStep.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {currentStep.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserAnswer(opt)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Natural Language Fallback Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuery.trim() && !loading) {
                handleUserAnswer(inputQuery);
              }
            }}
            className="flex gap-2 pt-1"
          >
            <input
              id="nlp-custom-input"
              type="text"
              placeholder={
                activeDomain
                  ? "Type your answer or amount (or say 'that's enough')..."
                  : "Select a domain above or ask anything..."
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputQuery.trim() && !loading) {
                    handleUserAnswer(inputQuery);
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
              <span>Send</span>
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

    // 1. Horizontal Divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={lineIdx} className="border-slate-800 my-2" />);
      return;
    }

    // 2. Bullet list item
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

    // 3. Numbered list item
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

    // 4. Section Title / Header (### Title or **Title**)
    if (trimmed.startsWith('### ')) {
      const title = trimmed.replace('### ', '');
      elements.push(
        <div key={lineIdx} className="font-extrabold text-emerald-400 text-sm mt-3 mb-1.5 tracking-tight flex items-center gap-1.5">
          {parseInlineMarkdown(title)}
        </div>
      );
      return;
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(':')) {
      elements.push(
        <div key={lineIdx} className="font-extrabold text-emerald-400 text-sm mt-3 mb-1 tracking-tight">
          {trimmed.replace(/\\*\\*/g, '')}
        </div>
      );
      return;
    }

    // 5. Empty line
    if (!trimmed) {
      elements.push(<div key={lineIdx} className="h-1.5" />);
      return;
    }

    // 6. Normal paragraph
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
