import { auth } from '@/auth';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'غير مصرح' }, { status: 401 });
  if (session.user.role !== 'admin') return Response.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });

    const { data, error } = await session.supabase.rpc('admin_verify_app_user', {
      target_user_id: userId,
    });
    if (error) throw error;
    if (!data) return Response.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    return Response.json({ message: 'تم التحقق بنجاح', user: data });
  } catch (error) {
    console.error('Verify user error:', error);
    return Response.json({ error: 'تعذر التحقق من المستخدم' }, { status: 500 });
  }
}
