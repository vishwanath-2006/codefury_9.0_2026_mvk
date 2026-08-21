import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/onboarding';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest(email ? email.split('@')[0] : 'SmartWealth User');
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            Fin<span className="text-emerald-500">Labs</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Log in to access your financial overview & onboarding wizard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 space-y-2">
              <p className="text-xs font-semibold text-center">{errorMsg}</p>
              {(errorMsg.toLowerCase().includes('email not confirmed') || errorMsg.toLowerCase().includes('rate limit')) && (
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bypass Auth & Open 8-Step Onboarding</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="alex@finlabs.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full justify-center shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'Authenticating...' : 'Sign In to FinLabs'}
            </Button>
          </form>

          {/* Quick Start / Demo Mode Access Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>⚡ Quick Start 8-Step Onboarding (Demo Session)</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-5">
            Don't have a FinLabs account?{' '}
            <Link to="/signup" className="text-emerald-500 font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400">
          <Link to="/" className="hover:underline">
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
