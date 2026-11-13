import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { supabase, user } = session;
    const [subscriptionResult, usageResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('status, created_at, plan:plans(name, price, tokens_limit, description)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('usage_logs')
        .select('type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (subscriptionResult.error) throw subscriptionResult.error;
    if (usageResult.error) throw usageResult.error;

    const subscription = subscriptionResult.data
      ? { ...subscriptionResult.data.plan, status: subscriptionResult.data.status, created_at: subscriptionResult.data.created_at }
      : null;

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      subscription,
      usage: usageResult.data || [],
    });
  } catch (error) {
    console.error('profile error:', error);
    return Response.json({ error: 'تعذر تحميل الملف الشخصي' }, { status: 500 });
  }
}
