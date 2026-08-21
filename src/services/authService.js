import { supabase } from '../lib/supabaseClient';

/**
 * Sign up a new user with email and password.
 */
export async function signUpUser(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || 'User'
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Failed to sign up.');
  }

  return data;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Invalid email or password.');
  }

  return data;
}

/**
 * Sign out the current user session.
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out.');
  }
}

/**
 * Get current user profile information including role.
 */
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Profile fetch error:', error);
  }

  return {
    ...user,
    profile: profile || { role: 'customer', full_name: user.user_metadata?.full_name || 'Guest' }
  };
}
