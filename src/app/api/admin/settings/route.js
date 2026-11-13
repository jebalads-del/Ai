import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data, error } = await session.supabase
    .from('admin_settings')
    .select('setting_key, setting_value');
  if (error) {
    console.error('admin settings read failed:', error);
    return Response.json({ error: 'تعذر تحميل الإعدادات' }, { status: 500 });
  }
  return Response.json(Object.fromEntries(data.map(({ setting_key, setting_value }) => [setting_key, setting_value])));
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return Response.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const { key, value } = await request.json();
    if (!key || typeof value !== 'string') {
      return Response.json({ error: 'بيانات الإعداد غير صالحة' }, { status: 400 });
    }
    const { error } = await session.supabase
      .from('admin_settings')
      .upsert({ setting_key: key, setting_value: value });
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('admin settings update failed:', error);
    return Response.json({ error: 'تعذر حفظ الإعداد' }, { status: 500 });
  }
}
