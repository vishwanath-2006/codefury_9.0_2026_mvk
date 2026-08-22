import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallbackPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [sessionChecking, setSessionChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Auth callback processing error:', err);
      } finally {
        if (isMounted) setSessionChecking(false);
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!loading && !sessionChecking) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        const timer = setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, loading, sessionChecking, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 animate-pulse mb-4">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Completing Authentication...</p>
    </div>
  );
}
