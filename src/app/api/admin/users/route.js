import { auth } from '@/auth';

const unauthorized = (status = 401) => Response.json({ error: 'غير مصرح' }, { status });

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'admin') return unauthorized(403);

  try {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim().slice(0, 100);
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const { data, error } = await session.supabase.rpc('admin_list_app_users', {
      search_query: search || null,
      page_number: page,
      page_size: 20,
    });
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('Admin users error:', error);
    return Response.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'admin') return unauthorized(403);

  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });
    if (userId === session.user.id) return Response.json({ error: 'لا يمكن حذف حسابك الحالي' }, { status: 400 });

    const { error } = await session.supabase.rpc('admin_delete_app_user', { target_user_id: userId });
    if (error) throw error;
    return Response.json({ message: 'تم حذف المستخدم' });
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ error: 'تعذر حذف المستخدم' }, { status: 500 });
  }
}
