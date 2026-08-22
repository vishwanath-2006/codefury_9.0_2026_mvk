import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, X, Move, EyeOff, RotateCcw, Bot } from 'lucide-react';

const STORAGE_KEY = 'finlabs_robot_position_v2';
const MARGIN = 16;
const ROBOT_WIDTH = 110;
const ROBOT_HEIGHT = 130;

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

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, hasMoved: false });
  const widgetRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Hide on active AI page
  const isAiPage = location.pathname === '/ai';

  // 1. Load initial position from localStorage or default to bottom-right
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
        const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - 24);
        const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - 24);
        setPosition({ x: defaultX, y: defaultY });
        setLastVisiblePos({ x: defaultX, y: defaultY });
      }
    } catch {
      const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - 24);
      const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - 24);
      setPosition({ x: defaultX, y: defaultY });
      setLastVisiblePos({ x: defaultX, y: defaultY });
    }
  }, []);

  // 2. Clamp on window resize to prevent losing the robot
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

  // 3. Save position changes to localStorage
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

  // Handle Left Click
  const handleClick = (e) => {
    if (dragStartRef.current.hasMoved) {
      e?.preventDefault?.();
      return;
    }
    if (!isAiPage) {
      navigate('/ai');
    }
  };

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

  // Dragging handlers
  const startDrag = (clientX, clientY) => {
    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: position.x ?? (window.innerWidth - ROBOT_WIDTH - 24),
      posY: position.y ?? (window.innerHeight - ROBOT_HEIGHT - 24),
      hasMoved: false
    };
    setIsDragging(true);
    setContextMenu(null);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      // Left click mousedown — prepare drag detector
      startDrag(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Global mousemove/mouseup while dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        dragStartRef.current.hasMoved = true;
      }

      const maxX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
      const maxY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);

      const targetX = Math.min(Math.max(MARGIN, dragStartRef.current.posX + deltaX), maxX);
      const targetY = Math.min(Math.max(MARGIN, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: targetX, y: targetY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setPosition((currentPos) => {
        setLastVisiblePos(currentPos);
        const edge = currentPos.x < window.innerWidth / 2 ? 'left' : 'right';
        setHiddenEdge(edge);
        persistState(currentPos, false, edge, currentPos);
        return currentPos;
      });
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        handleMouseMove(e.touches[0]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, persistState]);

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
      x: window.innerWidth - ROBOT_WIDTH - 24,
      y: window.innerHeight - ROBOT_HEIGHT - 24
    };
    setPosition(restoredPos);
    persistState(restoredPos, false, hiddenEdge, restoredPos);
  };

  const handleResetPosition = () => {
    setContextMenu(null);
    const defaultX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - 24);
    const defaultY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - 24);
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
          50% { transform: translateY(-10px); }
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
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'fixed',
            left: position.x !== null ? `${position.x}px` : undefined,
            top: position.y !== null ? `${position.y}px` : undefined,
            bottom: position.x === null ? '24px' : undefined,
            right: position.x === null ? '24px' : undefined,
            zIndex: 45,
            touchAction: 'none'
          }}
          className={`flex flex-col items-center select-none ${
            isDragging ? 'cursor-grabbing opacity-90 scale-102' : 'cursor-grab'
          } transition-transform duration-100 animate-in fade-in duration-200`}
        >
          {/* Dragging indicator badge */}
          {isDragging && (
            <div className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40 shadow-lg pointer-events-none whitespace-nowrap animate-pulse">
              📍 Dragging Robot...
            </div>
          )}

          {/* Speech Bubble (only shown when not dragging) */}
          {!bubbleDismissed && !isDragging && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick();
              }}
              className="cursor-pointer relative max-w-[220px] sm:max-w-[240px] p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-100 border border-emerald-500/40 shadow-xl shadow-emerald-950/30 text-xs leading-relaxed transition-all hover:border-emerald-400 mb-2"
            >
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={(e) => {
                  e.stopPropagation();
                  setBubbleDismissed(true);
                }}
                className="absolute top-1 right-1 p-0.5 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-1 font-bold text-emerald-400 text-[11px] mb-0.5 pr-3">
                <Sparkles className="w-3 h-3 shrink-0 text-emerald-300 animate-pulse" />
                <span>Hi! I'm FinLabs AI 👋</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                Right-click me to Move or Hide!
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-emerald-500/40 rotate-45" />
            </div>
          )}

          {/* 3D FinLabs Robot Character */}
          <button
            type="button"
            aria-label="FinLabs AI Copilot (Right-click to move/hide)"
            onClick={handleClick}
            className="group relative w-22 h-26 sm:w-24 sm:h-28 flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none p-0 bg-transparent border-0"
          >
            {/* Ambient Glow Aura */}
            <div className="absolute inset-2 rounded-full bg-emerald-500/30 blur-2xl finlabs-glow-ambient group-hover:bg-emerald-400/50 transition-colors pointer-events-none" />

            {/* Floating Robot Body */}
            <div className="finlabs-robot-body w-full h-full relative flex items-center justify-center drop-shadow-[0_10px_22px_rgba(16,185,129,0.4)]">
              <svg viewBox="0 0 80 90" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="robotHelmetGrad" x1="20" y1="14" x2="60" y2="52" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="45%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>
                  <linearGradient id="robotHelmetStroke" x1="16" y1="14" x2="64" y2="54" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="40%" stopColor="#10b981" />
                    <stop offset="80%" stopColor="#064e3b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="robotVisorGrad" x1="22" y1="18" x2="58" y2="44" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#09141d" />
                    <stop offset="60%" stopColor="#061a23" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                  <linearGradient id="robotBodyGrad" x1="24" y1="52" x2="56" y2="72" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="40%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#044e39" />
                  </linearGradient>
                  <linearGradient id="haloGrad" x1="20" y1="14" x2="60" y2="14" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
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
                  <ellipse cx="40" cy="14" rx="19" ry="5.5" stroke="url(#haloGrad)" strokeWidth="1.8" strokeDasharray="6 3" filter="url(#emeraldAura)" />
                  <ellipse cx="40" cy="14" rx="19" ry="5.5" stroke="#a7f3d0" strokeWidth="0.75" />
                </g>

                {/* 2. Top Antenna Beacon */}
                <line x1="40" y1="18" x2="40" y2="10" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="40" cy="8.5" r="3.2" fill="#34d399" filter="url(#emeraldAura)" />
                <circle cx="40" cy="8.5" r="2" fill="#ffffff" className="finlabs-beacon-pulse" />

                {/* 3. Left & Right Ear Pods */}
                <rect x="11" y="27" width="5" height="13" rx="2.5" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
                <circle cx="13.5" cy="33.5" r="1.5" fill="#34d399" />
                <rect x="64" y="27" width="5" height="13" rx="2.5" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
                <circle cx="66.5" cy="33.5" r="1.5" fill="#34d399" />

                {/* 4. Head Helmet Base */}
                <rect x="15" y="16" width="50" height="35" rx="17.5" fill="url(#robotHelmetGrad)" stroke="url(#robotHelmetStroke)" strokeWidth="2.2" />

                {/* 5. Visor Screen */}
                <rect x="19" y="21" width="42" height="25" rx="12.5" fill="url(#robotVisorGrad)" stroke="#064e3b" strokeWidth="1.2" />
                <path d="M 22 25 Q 40 21 58 25" stroke="rgba(255, 255, 255, 0.28)" strokeWidth="1" fill="none" strokeLinecap="round" />

                {/* 6. Expressive Cyber Eyes */}
                <g className="finlabs-eye">
                  <ellipse cx="32" cy="33" rx="4.8" ry="5.8" fill="#06b6d4" filter="url(#eyeCyanGlow)" />
                  <ellipse cx="32" cy="33" rx="3.4" ry="4.4" fill="#a5f3fc" />
                  <circle cx="33.8" cy="31.2" r="1.4" fill="#ffffff" />
                  <ellipse cx="48" cy="33" rx="4.8" ry="5.8" fill="#06b6d4" filter="url(#eyeCyanGlow)" />
                  <ellipse cx="48" cy="33" rx="3.4" ry="4.4" fill="#a5f3fc" />
                  <circle cx="49.8" cy="31.2" r="1.4" fill="#ffffff" />
                </g>

                {/* 7. Cute Blush Dots */}
                <circle cx="26" cy="39" r="1.8" fill="#10b981" opacity="0.65" />
                <circle cx="54" cy="39" r="1.8" fill="#10b981" opacity="0.65" />

                {/* 8. Floating Torso */}
                <path d="M 27 52 Q 40 49 53 52 L 50 67 Q 40 70 30 67 Z" fill="url(#robotBodyGrad)" stroke="#34d399" strokeWidth="1.5" strokeLinejoin="round" />

                {/* 9. Core Energy Diamond */}
                <polygon points="40,55 45,60 40,65 35,60" fill="#a7f3d0" stroke="#ffffff" strokeWidth="0.8" filter="url(#emeraldAura)" />

                {/* 10. Left & Right Floating Hands */}
                <ellipse cx="20" cy="58" rx="3.8" ry="5.2" fill="#0f172a" stroke="#10b981" strokeWidth="1.4" transform="rotate(15 20 58)" />
                <ellipse cx="60" cy="58" rx="3.8" ry="5.2" fill="#0f172a" stroke="#10b981" strokeWidth="1.4" transform="rotate(-15 60 58)" />

                {/* 11. Jet Thruster Ring */}
                <ellipse cx="40" cy="69" rx="8" ry="2.5" fill="#047857" stroke="#10b981" strokeWidth="1" />
                <ellipse cx="40" cy="71" rx="5" ry="1.8" fill="#34d399" filter="url(#emeraldAura)" />
              </svg>
            </div>

            {/* Dynamic Ground Shadow */}
            <div className="finlabs-robot-shadow absolute -bottom-1 w-12 h-2.5 rounded-full bg-emerald-950/70 dark:bg-emerald-950/90 blur-[2px] pointer-events-none" />
          </button>
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
