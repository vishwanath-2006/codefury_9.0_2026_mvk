import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserProfile, signInUser, signInWithGoogle, signUpUser, signOutUser, updateUserProfile } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load active profile for a given user
  const loadProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    try {
      const prof = await getUserProfile(authUser.id);
      const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.user_metadata?.preferred_username;
      const googleAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

      const mergedProfile = {
        id: authUser.id,
        user_id: authUser.id,
        full_name: prof?.full_name || googleName || authUser.email?.split('@')[0] || 'FinLabs User',
        avatar_url: prof?.avatar_url || googleAvatar || null,
        email: authUser.email,
        ...prof,
      };

      setProfile(mergedProfile);

      // Auto upsert profile row so Google name/avatar is saved to database
      if (!prof || !prof.full_name || !prof.avatar_url) {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          user_id: authUser.id,
          full_name: mergedProfile.full_name,
          avatar_url: mergedProfile.avatar_url,
          email: authUser.email,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' }).then(({ error }) => {
          if (error) console.warn('Auto profile upsert warning:', error.message);
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
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

    // Listen to real-time auth state changes
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
    const data = await signInUser(email, password);
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await loadProfile(data.user);
    }
    return data;
  };

  const signup = async (email, password, fullName) => {
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
    await signOutUser();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (fullName) => {
    if (!user) return;
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
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
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
