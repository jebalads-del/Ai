import { createClient } from '@supabase/supabase-js';
import { getContext } from 'hono/context-storage';

export async function auth() {
  const request = getContext().req.raw;
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return null;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.full_name || data.user.user_metadata?.name || data.user.user_metadata?.full_name || null,
      image: profile?.avatar_url || data.user.user_metadata?.avatar_url || null,
      role: profile?.role || 'user',
      emailVerified: data.user.email_confirmed_at || null,
    },
    supabase,
  };
}
