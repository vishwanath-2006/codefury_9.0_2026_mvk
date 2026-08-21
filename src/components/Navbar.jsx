import React from 'react';

export default function Navbar({
  currentView,
  setView,
  cartCount,
  user,
  onOpenAuth,
  onLogout,
  onOpenCart
}) {
  const isStaffOrAdmin = user?.profile?.role === 'staff' || user?.profile?.role === 'admin';

  return (
    <nav className="w-full bg-white/90 dark:bg-[#23170f]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#ff6a00]/10 flex items-center justify-center border border-[#ff6a00]/20 text-[#ff6a00]">
            <span className="material-symbols-outlined text-2xl">memory</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              Code<span className="text-[#ff6a00]">Fury</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400">Street Kiosk v4.0</p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 font-semibold text-sm">
          <button
            onClick={() => setView('menu')}
            className={`px-4 py-2 rounded-xl transition ${currentView === 'menu' ? 'bg-[#ff6a00]/10 text-[#ff6a00]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            Menu
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded-xl transition ${currentView === 'history' ? 'bg-[#ff6a00]/10 text-[#ff6a00]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
          >
            Order History
          </button>
          {isStaffOrAdmin && (
            <button
              onClick={() => setView('kitchen')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1 ${currentView === 'kitchen' ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              <span className="material-symbols-outlined text-sm">soup_kitchen</span>
              Kitchen Queue
            </button>
          )}
        </div>

        {/* Right Action Icons & User Controls */}
        <div className="flex items-center gap-3">
          {/* Cart Icon & Counter */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ff6a00] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Control */}
          {user && !user.is_anonymous ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 truncate max-w-[120px]">
                {user.profile?.full_name || user.email}
              </span>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
