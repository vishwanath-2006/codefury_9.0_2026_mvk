import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserProfile, signInUser, signInWithGoogle, signUpUser, signOutUser, updateUserProfile } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load active profile for a given user
  const loadProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    try {
      const prof = await getUserProfile(authUser.id);
      setProfile(prof || {
        id: authUser.id,
        user_id: authUser.id,
        full_name: authUser.user_metadata?.full_name || 'SmartWealth User',
        email: authUser.email
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check for saved Guest Session first
    try {
      const savedGuest = localStorage.getItem('smartwealth_guest_session');
      if (savedGuest) {
        const guestData = JSON.parse(savedGuest);
        setUser(guestData.user);
        setProfile(guestData.profile);
        setIsGuest(true);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Guest session read error:', e);
    }

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

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      if (isGuest) return; // Don't override guest session

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
    try {
      const data = await signInUser(email, password);
      if (data?.user) {
        setIsGuest(false);
        localStorage.removeItem('smartwealth_guest_session');
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user);
      }
      return data;
    } catch (err) {
      // If email not confirmed, offer guest login fallback
      throw err;
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      const data = await signUpUser(email, password, fullName);
      if (data?.user) {
        setIsGuest(false);
        localStorage.removeItem('smartwealth_guest_session');
        setUser(data.user);
        setSession(data.session);
        await loadProfile(data.user);
      }
      return data;
    } catch (err) {
      // Fallback or re-throw
      throw err;
    }
  };

  const loginAsGuest = (customName = 'SmartWealth Investor') => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'guest@smartwealth.ai',
      user_metadata: { full_name: customName }
    };
    const guestProfile = {
      id: guestUser.id,
      user_id: guestUser.id,
      full_name: customName,
      email: guestUser.email,
      role: 'customer'
    };

    localStorage.setItem('smartwealth_guest_session', JSON.stringify({ user: guestUser, profile: guestProfile }));
    setUser(guestUser);
    setProfile(guestProfile);
    setIsGuest(true);
    setLoading(false);
    return guestUser;
  };

  const loginWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      // Ignore guest logout errors
    }
    localStorage.removeItem('smartwealth_guest_session');
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsGuest(false);
  };

  const updateProfile = async (fullName) => {
    if (!user) return;
    if (isGuest) {
      const updated = { ...profile, full_name: fullName };
      setProfile(updated);
      localStorage.setItem('smartwealth_guest_session', JSON.stringify({ user, profile: updated }));
      return updated;
    }
    const updated = await updateUserProfile(user.id, { full_name: fullName });
    setProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isGuest,
        loading,
        isAuthenticated: !!user || isGuest,
        login,
        loginWithGoogle,
        signup,
        loginAsGuest,
        logout,
        updateProfile,
        refreshProfile: () => loadProfile(user)
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
