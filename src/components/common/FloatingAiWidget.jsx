import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

export default function FloatingAiWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Hide the floating widget when the user is actively on the /ai chat page
  const isAiPage = location.pathname === '/ai';

  const handleClick = () => {
    if (!isAiPage) {
      navigate('/ai');
    }
  };

  if (isAiPage) {
    return null;
  }

  return (
    <aside
      aria-label="FinLabs AI Assistant"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <style>{`
        @keyframes finlabs-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes finlabs-shadow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(0.72);
            opacity: 0.25;
          }
        }

        @keyframes finlabs-blink {
          0%, 92%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.12);
          }
        }

        @keyframes finlabs-beacon {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes finlabs-halo-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes finlabs-ambient-glow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes finlabs-pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.8;
          }
        }

        .finlabs-robot-body {
          animation: finlabs-float 3.6s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .finlabs-robot-shadow {
          animation: finlabs-shadow 3.6s ease-in-out infinite;
          transform-origin: center center;
        }

        .finlabs-eye {
          animation: finlabs-blink 4.2s infinite ease-in-out;
          transform-origin: center center;
        }

        .finlabs-beacon-pulse {
          animation: finlabs-beacon 2s infinite ease-in-out;
          transform-origin: center center;
        }

        .finlabs-glow-ambient {
          animation: finlabs-ambient-glow 3s infinite ease-in-out;
        }

        .finlabs-halo-rotate {
          animation: finlabs-halo-spin 8s linear infinite;
          transform-origin: 40px 14px;
        }

        @media (prefers-reduced-motion: reduce) {
          .finlabs-robot-body,
          .finlabs-robot-shadow,
          .finlabs-eye,
          .finlabs-beacon-pulse,
          .finlabs-glow-ambient,
          .finlabs-halo-rotate {
            animation: none !important;
          }
        }
      `}</style>

      {/* Speech Bubble */}
      {!bubbleDismissed && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleClick();
          }}
          className="pointer-events-auto cursor-pointer relative max-w-[240px] sm:max-w-[270px] p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-slate-100 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 text-xs leading-relaxed transition-all hover:scale-102 hover:border-emerald-400 hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mr-1"
        >
          {/* Dismiss button */}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={(e) => {
              e.stopPropagation();
              setBubbleDismissed(true);
            }}
            className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-0.5 pr-4">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-300 animate-pulse" />
            <span className="tracking-tight font-extrabold text-[12px]">Hi! I'm FinLabs AI 👋</span>
          </div>
          <p className="text-[11px] text-slate-300 font-medium">
            I'm free — ask me any financial question!
          </p>

          {/* Speech bubble pointer arrow */}
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-slate-900 border-r border-b border-emerald-500/40 rotate-45" />
        </div>
      )}

      {/* Futuristic 3D FinLabs Robot Companion */}
      <div className="pointer-events-auto relative flex flex-col items-center">
        <button
          type="button"
          aria-label="Open FinLabs AI Copilot"
          onClick={handleClick}
          className="group relative w-16 h-18 sm:w-18 sm:h-20 flex items-center justify-center transition-transform duration-200 hover:scale-108 active:scale-95 focus:outline-none cursor-pointer p-0 bg-transparent border-0"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute inset-1 rounded-full bg-emerald-500/25 blur-xl finlabs-glow-ambient group-hover:bg-emerald-400/40 transition-colors" />

          {/* Floating Robot Body Structure */}
          <div className="finlabs-robot-body w-full h-full relative flex items-center justify-center drop-shadow-[0_8px_16px_rgba(16,185,129,0.35)]">
            <svg
              viewBox="0 0 80 90"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Helmet Gradient */}
                <linearGradient id="robotHelmetGrad" x1="20" y1="14" x2="60" y2="52" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="45%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                {/* 3D Helmet Stroke Highlight */}
                <linearGradient id="robotHelmetStroke" x1="16" y1="14" x2="64" y2="54" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="40%" stopColor="#10b981" />
                  <stop offset="80%" stopColor="#064e3b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Visor Glass Screen */}
                <linearGradient id="robotVisorGrad" x1="22" y1="18" x2="58" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#09141d" />
                  <stop offset="60%" stopColor="#061a23" />
                  <stop offset="100%" stopColor="#022c22" />
                </linearGradient>

                {/* Body Torso Gradient */}
                <linearGradient id="robotBodyGrad" x1="24" y1="52" x2="56" y2="72" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="40%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#044e39" />
                </linearGradient>

                {/* Halo Energy Ring Gradient */}
                <linearGradient id="haloGrad" x1="20" y1="14" x2="60" y2="14" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>

                {/* Glowing Filters */}
                <filter id="emeraldAura" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="eyeCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Floating Energy Halo */}
              <g className="finlabs-halo-rotate">
                <ellipse
                  cx="40"
                  cy="14"
                  rx="19"
                  ry="5"
                  stroke="url(#haloGrad)"
                  strokeWidth="1.8"
                  strokeDasharray="8 4"
                  fill="none"
                  filter="url(#emeraldAura)"
                  opacity="0.85"
                />
              </g>

              {/* 2. Top Antenna & Blinking Beacon */}
              <rect x="38.5" y="8" width="3" height="8" rx="1.5" fill="#334155" />
              <circle
                cx="40"
                cy="7"
                r="3.5"
                fill="#10b981"
                className="finlabs-beacon-pulse"
                filter="url(#emeraldAura)"
              />
              <circle cx="40" cy="7" r="1.5" fill="#ffffff" />

              {/* 3. Ear Pods / Audio Nodes */}
              <rect x="14" y="27" width="5" height="14" rx="2.5" fill="#047857" stroke="#34d399" strokeWidth="0.8" />
              <rect x="61" y="27" width="5" height="14" rx="2.5" fill="#047857" stroke="#34d399" strokeWidth="0.8" />

              {/* 4. Rounded 3D Helmet Head */}
              <rect
                x="17"
                y="16"
                width="46"
                height="35"
                rx="17.5"
                fill="url(#robotHelmetGrad)"
                stroke="url(#robotHelmetStroke)"
                strokeWidth="1.8"
              />

              {/* 5. Visor Screen */}
              <rect
                x="22"
                y="20"
                width="36"
                height="25"
                rx="12.5"
                fill="url(#robotVisorGrad)"
                stroke="#10b981"
                strokeWidth="0.9"
                strokeOpacity="0.6"
              />

              {/* 6. Visor Glass 3D Highlight Reflection */}
              <path
                d="M24 23 C30 21, 46 21, 54 23 C42 27, 28 29, 24 27 Z"
                fill="#ffffff"
                opacity="0.22"
              />

              {/* 7. Expressive Cybernetic Glowing Eyes */}
              <g className="finlabs-eye">
                {/* Left Eye */}
                <ellipse cx="32" cy="32" rx="4.2" ry="5" fill="#22d3ee" filter="url(#eyeCyanGlow)" />
                <ellipse cx="32" cy="32" rx="2.2" ry="2.6" fill="#ffffff" />
                <circle cx="33.8" cy="30.2" r="1.2" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="48" cy="32" rx="4.2" ry="5" fill="#22d3ee" filter="url(#eyeCyanGlow)" />
                <ellipse cx="48" cy="32" rx="2.2" ry="2.6" fill="#ffffff" />
                <circle cx="49.8" cy="30.2" r="1.2" fill="#ffffff" />
              </g>

              {/* 8. Friendly Digital Mouth / Audio Wave Line */}
              <path
                d="M35 40 Q40 42.5 45 40"
                fill="none"
                stroke="#34d399"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.95"
                filter="url(#eyeCyanGlow)"
              />

              {/* 9. Neck Articulation Joint */}
              <rect x="36" y="50" width="8" height="4" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

              {/* 10. Magnetic Floating Arms */}
              <rect
                x="18"
                y="55"
                width="6"
                height="12"
                rx="3"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="1"
                transform="rotate(14 21 61)"
              />
              <rect
                x="56"
                y="55"
                width="6"
                height="12"
                rx="3"
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth="1"
                transform="rotate(-14 59 61)"
              />

              {/* 11. 3D Body Torso */}
              <path
                d="M26 53 C26 51, 54 51, 54 53 L50 68 C50 70.5, 30 70.5, 30 68 Z"
                fill="url(#robotBodyGrad)"
                stroke="#34d399"
                strokeWidth="1.4"
              />

              {/* 12. FinLabs "AI" Heart Core / Chest Emblem */}
              <circle
                cx="40"
                cy="60"
                r="5"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="1.2"
                filter="url(#emeraldAura)"
              />
              <text
                x="40"
                y="62"
                textAnchor="middle"
                fontSize="4.8"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.2"
              >
                AI
              </text>

              {/* 13. Anti-Gravity Thruster Glow Base */}
              <ellipse
                cx="40"
                cy="71"
                rx="10"
                ry="3.5"
                fill="#10b981"
                filter="url(#emeraldAura)"
                opacity="0.95"
              />
              <ellipse cx="40" cy="71" rx="5" ry="1.8" fill="#a7f3d0" />
            </svg>
          </div>
        </button>

        {/* 3D Floating Contact Shadow */}
        <div className="finlabs-robot-shadow w-10 h-2 -mt-1 rounded-full bg-emerald-950/70 dark:bg-emerald-900/60 blur-[3px]" />
      </div>
    </aside>
  );
}
