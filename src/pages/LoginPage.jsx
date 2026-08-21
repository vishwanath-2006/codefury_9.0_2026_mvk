import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const { login, loginWithGoogle, enableDevTestMode, isDevTestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/onboarding';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
      setGoogleLoading(false);
    }
  };

  const handleBypassDevMode = () => {
    enableDevTestMode();
    navigate('/financial-health', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-emerald-500">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
          <span>FinLabs</span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Welcome back to FinLabs
        </h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Access your secure financial profile and intelligence dashboard
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

          {/* Social Google Login Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-mono text-[10px]">
                  Or sign in with email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="user@finlabs.io"
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
              className="w-full justify-center shadow-lg shadow-emerald-500/20 mt-2 font-bold"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-500 font-bold hover:underline">
              Create free account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
