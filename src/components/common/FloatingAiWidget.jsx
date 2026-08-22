import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, X, Move, EyeOff, RotateCcw, Bot } from 'lucide-react';

const STORAGE_KEY = 'finlabs_robot_position_v4';
const MARGIN = 16;
const ROBOT_WIDTH = 110;
const ROBOT_HEIGHT = 140;

export default function FloatingAiWidget() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null });
  const [isHidden, setIsHidden] = useState(false);
  const [hiddenEdge, setHiddenEdge] = useState('right');
  const [lastVisiblePos, setLastVisiblePos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y }

  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
    startTime: 0,
    hasMoved: false
  });

  const widgetRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Hide the floating widget when the user is actively on the /ai chat page
  const isAiPage = location.pathname === '/ai';

  // 1. Initial State: Always default to visible bottom-right unless explicitly moved/hidden
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const maxX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
        const maxY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);

        const clampedX = Math.min(Math.max(MARGIN, parsed.x ?? maxX), maxX);
        const clampedY = Math.min(Math.max(MARGIN, parsed.y ?? maxY), maxY);

        setPosition({ x: clampedX, y: clampedY });
        setIsHidden(Boolean(parsed.isHidden));
        setHiddenEdge(parsed.hiddenEdge || (clampedX < window.innerWidth / 2 ? 'left' : 'right'));
        setLastVisiblePos({
          x: Math.min(Math.max(MARGIN, parsed.lastX ?? clampedX), maxX),
          y: Math.min(Math.max(MARGIN, parsed.lastY ?? clampedY), maxY)
        });
      } else {
        const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
        const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);
        setPosition({ x: defaultX, y: defaultY });
        setLastVisiblePos({ x: defaultX, y: defaultY });
        setIsHidden(false);
      }
    } catch {
      const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
      const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);
      setPosition({ x: defaultX, y: defaultY });
      setLastVisiblePos({ x: defaultX, y: defaultY });
      setIsHidden(false);
    }
  }, []);

  // 2. Clamp position on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (prev.x === null || prev.y === null) return prev;
        const maxX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
        const maxY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);
        const clampedX = Math.min(Math.max(MARGIN, prev.x), maxX);
        const clampedY = Math.min(Math.max(MARGIN, prev.y), maxY);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Persist State
  const persistState = useCallback((newPos, hiddenState, edge, lastPos) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          x: newPos.x,
          y: newPos.y,
          isHidden: hiddenState,
          hiddenEdge: edge,
          lastX: lastPos?.x ?? newPos.x,
          lastY: lastPos?.y ?? newPos.y
        })
      );
    } catch (e) {
      console.warn('Failed to save robot position to localStorage', e);
    }
  }, []);

  // 4. Close context menu on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        if (isDragging) setIsDragging(false);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleGlobalClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, isDragging]);

  // 1-CLICK OPEN ACTION: Navigate directly to AI Assistant or Focus Chat Input
  const openAiChat = useCallback(() => {
    if (!isAiPage) {
      navigate('/ai');
    } else {
      const inputEl = document.getElementById('nlp-custom-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isAiPage, navigate]);

  // Handle Right Click -> Open Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 160;
    const menuHeight = 130;
    const menuX = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const menuY = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setContextMenu({ x: Math.max(10, menuX), y: Math.max(10, menuY) });
  };

  // Pointer & Touch Dragging Handlers
  const handlePointerDown = (e) => {
    if (e.button === 2) return; // Ignore right-click

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x ?? (window.innerWidth - ROBOT_WIDTH - MARGIN),
      posY: position.y ?? (window.innerHeight - ROBOT_HEIGHT - MARGIN),
      startTime: Date.now(),
      hasMoved: false
    };

    setIsDragging(true);
    setContextMenu(null);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist > 8) {
        dragStartRef.current.hasMoved = true;
      }

      const maxX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
      const maxY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);

      const targetX = Math.min(Math.max(MARGIN, dragStartRef.current.posX + deltaX), maxX);
      const targetY = Math.min(Math.max(MARGIN, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: targetX, y: targetY });
    };

    const handlePointerUp = (e) => {
      setIsDragging(false);

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const dist = Math.hypot(deltaX, deltaY);
      const duration = Date.now() - dragStartRef.current.startTime;

      // IF IT WAS A CLICK (Micro-movement <= 8px AND duration < 350ms) -> OPEN CHAT IN 1 CLICK!
      if (!dragStartRef.current.hasMoved || (dist <= 8 && duration < 350)) {
        openAiChat();
        return;
      }

      // OTHERWISE: IT WAS A DRAG -> SAVE NEW POSITION
      setPosition((currentPos) => {
        setLastVisiblePos(currentPos);
        const edge = currentPos.x < window.innerWidth / 2 ? 'left' : 'right';
        setHiddenEdge(edge);
        persistState(currentPos, false, edge, currentPos);
        return currentPos;
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, openAiChat, persistState]);

  // Context Menu Actions
  const handleHideRobot = () => {
    setContextMenu(null);
    const edge = (position.x ?? window.innerWidth / 2) < window.innerWidth / 2 ? 'left' : 'right';
    setHiddenEdge(edge);
    setLastVisiblePos({ ...position });
    setIsHidden(true);
    persistState(position, true, edge, position);
  };

  const handleRestoreRobot = () => {
    setIsHidden(false);
    const restoredPos = lastVisiblePos.x !== null ? lastVisiblePos : {
      x: window.innerWidth - ROBOT_WIDTH - MARGIN,
      y: window.innerHeight - ROBOT_HEIGHT - MARGIN
    };
    setPosition(restoredPos);
    persistState(restoredPos, false, hiddenEdge, restoredPos);
  };

  const handleResetPosition = () => {
    setContextMenu(null);
    const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
    const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);
    const defaultPos = { x: defaultX, y: defaultY };
    setPosition(defaultPos);
    setLastVisiblePos(defaultPos);
    setIsHidden(false);
    persistState(defaultPos, false, 'right', defaultPos);
  };

  if (isAiPage) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes finlabs-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes finlabs-shadow {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(0.72); opacity: 0.25; }
        }
        @keyframes finlabs-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.12); }
        }
        @keyframes finlabs-beacon {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes finlabs-halo-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes finlabs-ambient-glow {
          0%, 100% { opacity: 0.45; transform: scale(0.95); }
          50% { opacity: 0.85; transform: scale(1.15); }
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

      {/* 1. Visible Robot Viewport Component */}
      {!isHidden && (
        <aside
          ref={widgetRef}
          aria-label="FinLabs AI Assistant"
          onContextMenu={handleContextMenu}
          onPointerDown={handlePointerDown}
          style={{
            position: 'fixed',
            left: position.x !== null ? `${position.x}px` : undefined,
            top: position.y !== null ? `${position.y}px` : undefined,
            bottom: position.x === null ? '24px' : undefined,
            right: position.x === null ? '24px' : undefined,
            zIndex: 50,
            touchAction: 'none'
          }}
          className={`flex flex-col items-end gap-2 select-none ${
            isDragging ? 'cursor-grabbing opacity-90 scale-102' : 'cursor-grab hover:scale-104'
          } transition-transform duration-150 animate-in fade-in`}
        >
          {/* Dragging indicator badge */}
          {isDragging && (
            <div className="self-center px-2.5 py-0.5 rounded-full bg-slate-900/95 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40 shadow-lg pointer-events-none whitespace-nowrap animate-pulse">
              📍 Moving Robot...
            </div>
          )}

          {/* Speech Bubble */}
          {!bubbleDismissed && !isDragging && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                openAiChat();
              }}
              className="pointer-events-auto cursor-pointer relative max-w-[240px] sm:max-w-[270px] p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md text-slate-100 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 text-xs leading-relaxed transition-all hover:scale-102 hover:border-emerald-400 hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mr-2"
            >
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={(e) => {
                  e.stopPropagation();
                  setBubbleDismissed(true);
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-0.5 pr-4">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-300 animate-pulse" />
                <span className="tracking-tight font-extrabold text-[12px]">Hi! I'm FinLabs AI 👋</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Click me to ask any financial question!
              </p>

              {/* Speech bubble pointer arrow */}
              <div className="absolute -bottom-1.5 right-10 sm:right-12 w-3 h-3 bg-slate-900 border-r border-b border-emerald-500/40 rotate-45" />
            </div>
          )}

          {/* Prominent 3D FinLabs Robot Companion */}
          <div className="pointer-events-auto relative flex flex-col items-center">
            <div
              role="button"
              tabIndex={0}
              title="1-Click to open AI Chat (Drag to move, right-click for settings)"
              className="group relative w-22 h-26 sm:w-26 sm:h-30 md:w-28 md:h-32 flex items-center justify-center transition-transform duration-200 hover:scale-106 active:scale-95 cursor-grab active:cursor-grabbing p-0 bg-transparent border-0"
            >
              {/* Ambient Glow Aura */}
              <div className="absolute inset-2 rounded-full bg-emerald-500/30 blur-2xl finlabs-glow-ambient group-hover:bg-emerald-400/50 transition-colors pointer-events-none" />

              {/* Floating Robot Body Structure */}
              <div className="finlabs-robot-body w-full h-full relative flex items-center justify-center drop-shadow-[0_10px_22px_rgba(16,185,129,0.4)]">
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
            </div>

            {/* 3D Floating Contact Shadow */}
            <div className="finlabs-robot-shadow w-14 sm:w-18 md:w-20 h-2.5 sm:h-3 -mt-1.5 rounded-full bg-emerald-950/70 dark:bg-emerald-900/60 blur-[4px]" />

            {/* Quick 1-Click "Ask FinLabs AI" Interactive Badge */}
            {!isDragging && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  openAiChat();
                }}
                title="1-Click to open AI Copilot"
                className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/95 dark:bg-slate-900/95 border border-emerald-500/50 shadow-lg shadow-emerald-950/40 text-emerald-400 text-[11px] font-bold tracking-tight cursor-pointer hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 select-none"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>Ask FinLabs AI</span>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 2. Hidden State: Edge Handle Tab */}
      {isHidden && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.min(Math.max(40, lastVisiblePos.y ?? 200), window.innerHeight - 80)}px`,
            [hiddenEdge]: '0px',
            zIndex: 45
          }}
          className="animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={handleRestoreRobot}
            title="Click to restore FinLabs AI Assistant"
            className={`flex items-center gap-1.5 px-2.5 py-2 bg-slate-900/95 border border-emerald-500/50 text-emerald-400 shadow-2xl shadow-emerald-950/50 hover:bg-slate-800 transition-all hover:scale-105 cursor-pointer ${
              hiddenEdge === 'left' ? 'rounded-r-2xl border-l-0' : 'rounded-l-2xl border-r-0'
            }`}
          >
            <Bot className="w-5 h-5 animate-pulse text-emerald-400" />
            <span className="text-[11px] font-bold tracking-tight hidden sm:inline">AI</span>
          </button>
        </div>
      )}

      {/* 3. Glassmorphic Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 60
          }}
          className="w-44 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/90 shadow-2xl shadow-emerald-950/40 text-slate-200 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>FinLabs AI</span>
            <span className="text-emerald-400 text-[10px]">Controls</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setContextMenu(null);
              setIsDragging(true);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400 text-left transition cursor-pointer font-medium"
          >
            <Move className="w-3.5 h-3.5 text-emerald-400" />
            <span>📍 Move Robot</span>
          </button>

          <button
            type="button"
            onClick={handleHideRobot}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400 text-left transition cursor-pointer font-medium"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>🙈 Hide Robot</span>
          </button>

          <button
            type="button"
            onClick={handleResetPosition}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-emerald-400 text-left transition cursor-pointer font-medium border-t border-slate-800/80"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>↺ Reset Position</span>
          </button>
        </div>
      )}
    </>
  );
}
