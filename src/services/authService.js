import { supabase } from '../lib/supabaseClient';

/**
 * Register a new user with Email, Password, and Full Name.
 */
export async function signUpUser(email, password, fullName) {
  if (!email || !password || !fullName) {
    throw new Error('All fields are required.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    console.error('Supabase SignUp Error:', error);
    throw new Error(formatAuthError(error.message));
  }

  // Ensure profile row exists in case trigger is disabled or delayed
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        user_id: data.user.id,
        full_name: fullName,
        email: email,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Profile sync notice:', profileError.message);
    }
  }

  return data;
}

/**
 * Sign in an existing user with Email and Password.
 */
export async function signInUser(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Supabase SignIn Error:', error);
    throw new Error(formatAuthError(error.message));
  }

  return data;
}

/**
 * Sign in/up with Google OAuth provider.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    console.error('Supabase Google OAuth Error:', error);
    throw new Error(error.message || 'Google authentication failed.');
  }

  return data;
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase SignOut Error:', error);
    throw new Error('Failed to sign out.');
  }
}

/**
 * Fetch the authenticated user's profile from public.profiles.
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Fetch Profile Error:', error);
  }

  return data;
}

/**
 * Update the authenticated user's profile.
 */
export async function updateUserProfile(userId, updates) {
  if (!userId) throw new Error('Unauthenticated.');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update Profile Error:', error);
    throw new Error(error.message || 'Failed to update profile.');
  }

  return data;
}

/**
 * User-friendly authentication error message formatter.
 */
function formatAuthError(msg) {
  if (!msg) return 'An unexpected error occurred.';
  if (msg.includes('User already registered') || msg.includes('email_exists')) {
    return 'An account with this email already exists. Please log in.';
  }
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('invalid format') || msg.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  return msg;
}
