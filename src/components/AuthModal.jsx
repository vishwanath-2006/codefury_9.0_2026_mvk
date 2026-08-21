import React, { useState } from 'react';
import { signInUser, signUpUser } from '../services/authService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpUser(email, password, fullName);
      } else {
        await signInUser(email, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#23170f] w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#ff6a00]/10 text-[#ff6a00] flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? 'Create CodeFury Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp ? 'Sign up to track orders & save pickup details' : 'Log in with your credentials'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Alex Developer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@codefury.tech"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6a00]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ff6a00]/30 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
            className="text-[#ff6a00] font-bold underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
}
