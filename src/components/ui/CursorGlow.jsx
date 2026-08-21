import React, { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Detect if cursor is over interactive elements
      const target = e.target;
      const isInteractive = target.closest('button, a, input, select, [role="button"], .interactive-hover');
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Ambient Radial Spotlight Aura following Cursor */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, 0.07), rgba(16, 185, 129, 0.05) 40%, transparent 80%)`,
        }}
      />

      {/* Dynamic Cursor Ring Follower */}
      <div
        className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full transition-transform duration-100 ease-out hidden md:block border ${
          isHovered
            ? 'w-10 h-10 -ml-5 -mt-5 border-emerald-500 bg-emerald-500/10 scale-125 shadow-lg shadow-emerald-500/20'
            : 'w-6 h-6 -ml-3 -mt-3 border-blue-400/40 bg-blue-500/5'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
    </>
  );
}
