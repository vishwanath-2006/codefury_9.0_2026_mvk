import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, X } from 'lucide-react';

export default function FloatingAiWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // If already on /ai, clicking won't cause unexpected reload
  const isAiPage = location.pathname === '/ai';

  const handleClick = () => {
    if (!isAiPage) {
      navigate('/ai');
    }
  };

  // Hide the floating widget when the user is actively on the /ai chat page
  if (isAiPage) {
    return null;
  }

  return (
    <aside
      aria-label="FinLabs AI Assistant"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Speech Bubble */}
      {!bubbleDismissed && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick();
          }}
          className="pointer-events-auto cursor-pointer relative max-w-[240px] sm:max-w-[260px] p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-emerald-500/30 shadow-xl shadow-emerald-500/10 text-xs leading-relaxed transition-all hover:scale-102 hover:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {/* Dismiss button */}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={(e) => {
              e.stopPropagation();
              setBubbleDismissed(true);
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-0.5 pr-4">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Hi! I'm FinLabs AI 👋</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            I'm free — ask me any financial question!
          </p>

          {/* Speech bubble arrow pointer */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-emerald-500/30 rotate-45" />
        </div>
      )}

      {/* Floating Robot Button */}
      <button
        type="button"
        aria-label="Open FinLabs AI Copilot"
        onClick={handleClick}
        className="pointer-events-auto group relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border-2 border-emerald-400/40 hover:scale-108 hover:shadow-emerald-500/40 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-emerald-500/50 cursor-pointer"
      >
        <div className="relative">
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:rotate-6" />
          {/* Active status pulse indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100" />
          </span>
        </div>
      </button>
    </aside>
  );
}
