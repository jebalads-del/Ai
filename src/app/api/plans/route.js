import { createClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

function publicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: Response.json({ error: 'غير مصرح' }, { status: 401 }) };
  if (session.user.role !== 'admin') return { error: Response.json({ error: 'غير مصرح' }, { status: 403 }) };
  return session;
}

export async function GET() {
  try {
    const { data, error } = await publicSupabase().from('plans').select('*').order('price');
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('plans error:', error);
    return Response.json({ error: 'تعذر تحميل الخطط' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await requireAdmin();
  if (session.error) return session.error;

  try {
    const { name, price, tokens_limit, description } = await request.json();
    if (!name || price === undefined || !Number.isInteger(Number(tokens_limit))) {
      return Response.json({ error: 'بيانات الخطة غير مكتملة' }, { status: 400 });
    }
    const { data, error } = await session.supabase
      .from('plans')
      .insert({ name, price: Number(price), tokens_limit: Number(tokens_limit), description: description || '' })
      .select()
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('create plan error:', error);
    return Response.json({ error: 'تعذر إنشاء الخطة' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await requireAdmin();
  if (session.error) return session.error;

  try {
    const { id, name, price, tokens_limit, description } = await request.json();
    if (!id) return Response.json({ error: 'المعرف مطلوب' }, { status: 400 });
    const { data, error } = await session.supabase
      .from('plans')
      .update({ name, price: Number(price), tokens_limit: Number(tokens_limit), description: description || '' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error('update plan error:', error);
    return Response.json({ error: 'تعذر تحديث الخطة' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await requireAdmin();
  if (session.error) return session.error;

  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: 'المعرف مطلوب' }, { status: 400 });
    const { error } = await session.supabase.from('plans').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('delete plan error:', error);
    return Response.json({ error: 'تعذر حذف الخطة' }, { status: 500 });
  }
}
