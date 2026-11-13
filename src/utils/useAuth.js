import { supabase } from './supabase';

function getRedirectUrl(callbackUrl) {
  const target = new URL(callbackUrl || '/', window.location.origin);
  return target.origin === window.location.origin ? target.toString() : window.location.origin;
}

function useAuth() {
  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl')
    : null;

  const signInWithCredentials = async ({ email, password, callbackUrl: target }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (target || callbackUrl) window.location.assign(getRedirectUrl(callbackUrl ?? target));
  };

  const signUpWithCredentials = async ({ email, password, name, callbackUrl: target }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: getRedirectUrl(target || '/account/verify-email'),
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithOAuth = async (provider, options = {}) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getRedirectUrl(callbackUrl ?? options.callbackUrl) },
    });
    if (error) throw error;
  };

  const signOut = async ({ callbackUrl: target = '/' } = {}) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.assign(getRedirectUrl(target));
  };

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle: (options) => signInWithOAuth('google', options),
    signInWithFacebook: (options) => signInWithOAuth('facebook', options),
    signInWithTwitter: (options) => signInWithOAuth('x', options),
    signInWithApple: (options) => signInWithOAuth('apple', options),
    signOut,
  };
}

export default useAuth;
