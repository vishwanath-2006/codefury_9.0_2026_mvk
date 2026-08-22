import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserProfile, signInUser, signUpUser, signOutUser, updateUserProfile, signInWithGoogle } from '../services/authService';

const AuthContext = createContext();

const IS_DEV = import.meta.env.DEV;

// Reusable Name Resolution Helper
export function resolveUserName(user, profile) {
  if (profile?.full_name && !profile.full_name.includes('Alex Dev')) {
    return profile.full_name;
  }
  if (user?.user_metadata?.full_name && !user.user_metadata.full_name.includes('Alex Dev')) {
    return user.user_metadata.full_name;
  }
  if (user?.user_metadata?.name && !user.user_metadata.name.includes('Alex Dev')) {
    return user.user_metadata.name;
  }
  if (user?.email) {
    const prefix = user.email.split('@')[0];
    if (prefix && prefix !== 'dev.tester') {
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
  }
  return 'Investor';
}

// Development-Only Mock User & Profile
const DEV_MOCK_USER = Object.freeze({
  id: 'dev-test-user-id-99999',
  email: 'dev.tester@finlabs.io',
  user_metadata: { full_name: 'FinLabs Investor' },
  created_at: new Date().toISOString(),
});

const DEV_MOCK_PROFILE = Object.freeze({
  id: 'dev-test-user-id-99999',
  user_id: 'dev-test-user-id-99999',
  full_name: 'FinLabs Investor',
  email: 'dev.tester@finlabs.io',
  avatar_url: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Development-Only Test Mode Toggle State
  const [isDevTestMode, setIsDevTestMode] = useState(() => {
    if (!IS_DEV) return false;
    const stored = localStorage.getItem('finlabs_dev_test_mode');
    if (stored !== null) return stored === 'true';
    return import.meta.env.VITE_ENABLE_DEV_TEST_MODE === 'true';
  });

  const enableDevTestMode = () => {
    if (!IS_DEV) return;
    localStorage.setItem('finlabs_dev_test_mode', 'true');
    setIsDevTestMode(true);
  };

  const disableDevTestMode = () => {
    if (!IS_DEV) return;
    localStorage.removeItem('finlabs_dev_test_mode');
    setIsDevTestMode(false);
  };

  // Load active profile for a given user
  const loadProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    try {
      const userProf = await getUserProfile(authUser.id);
      setProfile(userProf);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback basic profile from auth user metadata
      setProfile({
        id: authUser.id,
        user_id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Investor',
        email: authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url || null,
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Fetch initial Supabase session on mount
    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession?.user) {
          await loadProfile(currentSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    disableDevTestMode();
    const data = await signInUser(email, password);
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await loadProfile(data.user);
    }
    return data;
  };

  const signup = async (email, password, fullName) => {
    disableDevTestMode();
    const data = await signUpUser(email, password, fullName);
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await loadProfile(data.user);
    }
    return data;
  };

  const loginWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const logout = async () => {
    disableDevTestMode();
    await signOutUser();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (fullName) => {
    if (!activeUser) return;
    if (IS_DEV && isDevTestMode && !user) {
      setProfile((prev) => ({ ...prev, full_name: fullName }));
      return { ...DEV_MOCK_PROFILE, full_name: fullName };
    }
    const updated = await updateUserProfile(user.id, { full_name: fullName });
    setProfile(updated);
    return updated;
  };

  // Determine active user and profile
  const activeUser = user || (IS_DEV && isDevTestMode ? DEV_MOCK_USER : null);
  const activeProfile = profile || (IS_DEV && isDevTestMode ? DEV_MOCK_PROFILE : null);
  const isAuthenticated = !!activeUser;

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        profile: activeProfile,
        session,
        loading,
        isAuthenticated,
        isDevTestMode: IS_DEV && isDevTestMode,
        enableDevTestMode,
        disableDevTestMode,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshProfile: () => loadProfile(activeUser)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
