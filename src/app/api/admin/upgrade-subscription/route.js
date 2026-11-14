import { auth } from '@/auth';
import { sendEmail } from '@/app/api/utils/send-email';

function unauthorized(status = 401) {
  return Response.json({ error: 'غير مصرح' }, { status });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'admin') return unauthorized(403);

  try {
    const { user_id, plan_id, notify } = await request.json();
    if (!user_id || !plan_id) return Response.json({ error: 'بيانات ناقصة' }, { status: 400 });

    const [{ data: plan, error: planError }, { data: user, error: userError }] = await Promise.all([
      session.supabase.from('plans').select('id, name, price, tokens_limit').eq('id', plan_id).maybeSingle(),
      session.supabase.from('profiles').select('id, email, full_name').eq('id', user_id).maybeSingle(),
    ]);
    if (planError) throw planError;
    if (userError) throw userError;
    if (!plan) return Response.json({ error: 'الخطة غير موجودة' }, { status: 404 });
    if (!user) return Response.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    const { error } = await session.supabase.rpc('admin_set_app_subscription', {
      target_user_id: user_id,
      target_plan_id: plan.id,
    });
    if (error) throw error;

    if (notify && user.email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_CREATE_APP_URL || process.env.AUTH_URL || '';
        const safeName = (user.full_name || 'بك').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        const safePlanName = plan.name.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
        await sendEmail({
          to: user.email,
          subject: `تم تفعيل اشتراكك في خطة ${plan.name}`,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px"><h2>تم تفعيل اشتراكك</h2><p>مرحباً ${safeName}، تم تفعيل خطة ${safePlanName} على حسابك.</p><p>${plan.tokens_limit} عملية شهرياً</p><a href="${appUrl}/dashboard">ابدأ الاستخدام</a></div>`,
        });
      } catch (emailError) {
        console.error('Email notify error:', emailError);
      }
    }

    return Response.json({ success: true, plan: plan.name });
  } catch (error) {
    console.error('upgrade-subscription error:', error);
    return Response.json({ error: 'تعذر تفعيل الاشتراك' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'admin') return unauthorized(403);

  try {
    const { user_id } = await request.json();
    if (!user_id) return Response.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });

    const { error } = await session.supabase.rpc('admin_remove_app_subscription', {
      target_user_id: user_id,
    });
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('subscription removal error:', error);
    return Response.json({ error: 'تعذر إلغاء الاشتراك' }, { status: 500 });
  }
}
