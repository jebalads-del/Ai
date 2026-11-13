import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { type } = await request.json();
    const { error } = await session.supabase
      .from('usage_logs')
      .insert({ user_id: session.user.id, type: type || 'image' });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('log-usage error:', error);
    return Response.json({ error: 'تعذر تسجيل الاستخدام' }, { status: 500 });
  }
}
