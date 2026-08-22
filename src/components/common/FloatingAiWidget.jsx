import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, X, Move, EyeOff, RotateCcw, Bot, Send, User, Loader2, Maximize2 } from 'lucide-react';
import { generateAiResponse } from '../../services/aiService';

const STORAGE_KEY = 'finlabs_robot_state_v4';
const MARGIN = 24;
const ROBOT_WIDTH = 110;
const ROBOT_HEIGHT = 140;

export default function FloatingAiWidget() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null }); // null means default CSS right:24px bottom:24px
  const [isHidden, setIsHidden] = useState(false);
  const [hiddenEdge, setHiddenEdge] = useState('right');
  const [lastVisiblePos, setLastVisiblePos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y }

  // Interactive AI Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! 👋 I'm your FinLabs AI financial copilot. Ask me anything about mutual funds, your health score, or monthly surplus!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0, hasMoved: false });
  const widgetRef = useRef(null);
  const contextMenuRef = useRef(null);
  const chatModalRef = useRef(null);
  const chatEndRef = useRef(null);

  // Hide floating robot widget on the dedicated /ai chat page
  const isAiPage = location.pathname === '/ai';

  // Scroll chat messages to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading, isChatOpen]);

  // 1. Initial State: Always default to VISIBLE bottom-right unless explicitly moved/hidden by user in v4
  useEffect(() => {
    try {
      // Clear legacy stale storage keys from prior buggy versions
      localStorage.removeItem('finlabs_robot_position_v3');
      localStorage.removeItem('finlabs_robot_position_v2');
      localStorage.removeItem('finlabs_robot_position');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const maxX = Math.max(MARGIN, window.innerWidth - ROBOT_WIDTH - MARGIN);
          const maxY = Math.max(MARGIN, window.innerHeight - ROBOT_HEIGHT - MARGIN);
          const clampedX = Math.min(Math.max(MARGIN, parsed.x), maxX);
          const clampedY = Math.min(Math.max(MARGIN, parsed.y), maxY);

          setPosition({ x: clampedX, y: clampedY });
          setIsHidden(Boolean(parsed.isHidden));
          setHiddenEdge(parsed.hiddenEdge || (clampedX < window.innerWidth / 2 ? 'left' : 'right'));
          setLastVisiblePos({
            x: Math.min(Math.max(MARGIN, parsed.lastX ?? clampedX), maxX),
            y: Math.min(Math.max(MARGIN, parsed.lastY ?? clampedY), maxY)
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading robot state', e);
    }

    // Default state: strictly visible at bottom-right
    setPosition({ x: null, y: null });
    setLastVisiblePos({ x: null, y: null });
    setIsHidden(false);
  }, []);

  // 2. Clamp position on window resize so robot is never off-screen
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
      if (newPos.x === null || newPos.y === null) {
        if (hiddenState) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              x: window.innerWidth - ROBOT_WIDTH - MARGIN,
              y: window.innerHeight - ROBOT_HEIGHT - MARGIN,
              isHidden: true,
              hiddenEdge: edge,
              lastX: window.innerWidth - ROBOT_WIDTH - MARGIN,
              lastY: window.innerHeight - ROBOT_HEIGHT - MARGIN
            })
          );
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }
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
      console.warn('Failed to save robot state', e);
    }
  }, []);

  // 4. Close context menu or chat on outside click or Escape
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
      if (
        isChatOpen &&
        chatModalRef.current &&
        !chatModalRef.current.contains(e.target) &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target)
      ) {
        setIsChatOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setIsChatOpen(false);
        if (isDragging) setIsDragging(false);
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu, isChatOpen, isDragging]);

  // Handle Left Click -> Open Inline Interactive Chatbox
  const handleClick = (e) => {
    if (dragStartRef.current.hasMoved) {
      e?.preventDefault?.();
      return;
    }
    setContextMenu(null);
    setIsChatOpen((prev) => !prev);
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

  // Dragging logic
  const startDrag = (clientX, clientY) => {
    const currentX = position.x !== null ? position.x : (window.innerWidth - ROBOT_WIDTH - MARGIN);
    const currentY = position.y !== null ? position.y : (window.innerHeight - ROBOT_HEIGHT - MARGIN);

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: currentX,
      posY: currentY,
      hasMoved: false
    };
    setIsDragging(true);
    setContextMenu(null);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      startDrag(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

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
        const finalPos = currentPos.x !== null ? currentPos : {
          x: window.innerWidth - ROBOT_WIDTH - MARGIN,
          y: window.innerHeight - ROBOT_HEIGHT - MARGIN
        };
        setLastVisiblePos(finalPos);
        const edge = finalPos.x < window.innerWidth / 2 ? 'left' : 'right';
        setHiddenEdge(edge);
        persistState(finalPos, false, edge, finalPos);
        return finalPos;
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
    setIsChatOpen(false);
    const currentX = position.x !== null ? position.x : (window.innerWidth - ROBOT_WIDTH - MARGIN);
    const currentY = position.y !== null ? position.y : (window.innerHeight - ROBOT_HEIGHT - MARGIN);
    const edge = currentX < window.innerWidth / 2 ? 'left' : 'right';
    const posObj = { x: currentX, y: currentY };

    setHiddenEdge(edge);
    setLastVisiblePos(posObj);
    setIsHidden(true);
    persistState(posObj, true, edge, posObj);
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
    setPosition({ x: null, y: null });
    setLastVisiblePos({ x: null, y: null });
    setIsHidden(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Chat message submission
  const handleSendChatMessage = async (presetText) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setChatLoading(true);

    try {
      const userContext = {
        monthlyIncome: profile?.monthly_income || 50000,
        fixedExpenses: profile?.fixed_expenses || 20000,
        savings: profile?.current_savings || 100000,
        riskScore: profile?.risk_score || 60,
        knowledgeLevel: profile?.knowledge_level || 'Intermediate'
      };

      const history = chatMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const reply = await generateAiResponse(textToSend, userContext, history);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (e) {
      console.error('Chat error:', e);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm having a brief connection pause. Please try asking again in a moment or visit the full AI page!"
        }
      ]);
    } finally {
      setChatLoading(false);
    }
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

      {/* 1. Visible Robot Viewport Component (Defaults strictly to bottom-right: 24px) */}
      {!isHidden && (
        <aside
          ref={widgetRef}
          aria-label="FinLabs AI Assistant"
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'fixed',
            ...(position.x !== null && position.y !== null
              ? { left: `${position.x}px`, top: `${position.y}px` }
              : { right: '24px', bottom: '24px' }),
            zIndex: 45,
            touchAction: 'none'
          }}
          className={`flex flex-col items-end gap-2.5 select-none ${
            isDragging ? 'cursor-grabbing opacity-90 scale-102' : 'cursor-grab'
          } transition-transform duration-100 animate-in fade-in duration-300`}
        >
          {/* Dragging indicator badge */}
          {isDragging && (
            <div className="self-center px-2.5 py-0.5 rounded-full bg-slate-900/90 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40 shadow-lg pointer-events-none whitespace-nowrap animate-pulse">
              📍 Dragging Robot...
            </div>
          )}

          {/* Speech Bubble */}
          {!bubbleDismissed && !isDragging && !isChatOpen && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick();
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
                Click me to chat or ask any financial question!
              </p>

              {/* Speech bubble pointer arrow */}
              <div className="absolute -bottom-1.5 right-10 sm:right-12 w-3 h-3 bg-slate-900 border-r border-b border-emerald-500/40 rotate-45" />
            </div>
          )}

          {/* Prominent Original 3D FinLabs Robot Companion */}
          <div className="pointer-events-auto relative flex flex-col items-center">
            <button
              type="button"
              aria-label="Open FinLabs AI Chat (Right-click to move/hide)"
              onClick={handleClick}
              className="group relative w-22 h-26 sm:w-26 sm:h-30 md:w-28 md:h-32 flex items-center justify-center transition-transform duration-200 hover:scale-106 active:scale-95 focus:outline-none cursor-pointer p-0 bg-transparent border-0"
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
            </button>

            {/* 3D Floating Contact Shadow */}
            <div className="finlabs-robot-shadow w-14 sm:w-18 md:w-20 h-2.5 sm:h-3 -mt-1.5 rounded-full bg-emerald-950/70 dark:bg-emerald-900/60 blur-[4px]" />
          </div>
        </aside>
      )}

      {/* 2. Interactive AI Chat Modal */}
      {isChatOpen && !isHidden && (
        <div
          ref={chatModalRef}
          style={{
            position: 'fixed',
            right: position.x !== null ? `${Math.max(16, window.innerWidth - position.x - ROBOT_WIDTH)}px` : '24px',
            bottom: position.y !== null ? `${Math.max(16, window.innerHeight - position.y + 10)}px` : '150px',
            zIndex: 50
          }}
          className="w-[90vw] sm:w-[360px] md:w-[390px] h-[460px] max-h-[75vh] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5">
                  FinLabs AI Copilot
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h4>
                <p className="text-[10px] text-emerald-400 font-mono">● Online & Ready</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsChatOpen(false);
                  navigate('/ai');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    msg.sender === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`max-w-[82%] p-2.5 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/80'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono p-2">
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>FinLabs AI is typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="py-2 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto custom-scrollbar no-scrollbar shrink-0">
            {['Which funds match my risk?', 'My Health Score', 'Monthly Surplus'].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendChatMessage(prompt)}
                disabled={chatLoading}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 whitespace-nowrap transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="pt-2 flex gap-1.5 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask a financial question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 3. Hidden State: Edge Handle Tab */}
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

      {/* 4. Glassmorphic Context Menu */}
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
