import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export default function LoginPage() {
  const { login, enableDevTestMode, isDevTestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

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

  const handleBypassDevMode = () => {
    enableDevTestMode();
    navigate('/financial-health', { replace: true });
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
          Log in to access your financial overview & intelligence dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Local Dev Test Mode Banner (Only rendered in localhost development environment) */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Local Dev Test Mode Available
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                Dev Only
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Bypass login during local development to inspect Financial Health & Dashboard with sample data.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Zap}
              onClick={handleBypassDevMode}
              className="mt-1 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 justify-center font-bold"
            >
              Activate Dev Test Session & Launch /financial-health →
            </Button>
          </div>
        )}

        <Card className="p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold text-center">
              {errorMsg}
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
