import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

function mapUser(user, profile) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.user_metadata?.name || user.user_metadata?.full_name || null,
    image: profile?.avatar_url || user.user_metadata?.avatar_url || null,
    role: profile?.role || 'user',
  };
}

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestVersion = useRef(0);

  const loadUser = useCallback(async (authUser) => {
    const version = ++requestVersion.current;
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (version !== requestVersion.current) return;
    setUser(mapUser(authUser, profile));
    setLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    await loadUser(error ? null : data.user);
  }, [loadUser]);

  useEffect(() => {
    let active = true;
    const loadIfActive = async (authUser) => {
      if (active) await loadUser(authUser);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadIfActive(session?.user || null);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      void loadIfActive(error ? null : data.session?.user || null);
    });

    return () => {
      active = false;
      requestVersion.current += 1;
      subscription.unsubscribe();
    };
  }, [loadUser]);

  return { user, data: user, loading, refetch };
};

export { useUser };
export default useUser;
