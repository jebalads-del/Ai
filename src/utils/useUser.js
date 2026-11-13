import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || null,
    image: user.user_metadata?.avatar_url || null,
    role: user.app_metadata?.role || 'user',
  };
}

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    setUser(error ? null : mapUser(data.user));
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(mapUser(session?.user));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setUser(error ? null : mapUser(data.session?.user));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, data: user, loading, refetch };
};

export { useUser };
export default useUser;
