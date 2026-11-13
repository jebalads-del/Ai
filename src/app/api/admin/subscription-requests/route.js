import { auth } from '@/auth';
import { sendEmail } from '@/app/api/utils/send-email';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.id) return { response: Response.json({ error: 'غير مصرح' }, { status: 401 }) };
  if (session.user.role !== 'admin') return { response: Response.json({ error: 'غير مصرح' }, { status: 403 }) };
  return { session };
}

export async function GET(request) {
  const { session, response } = await getAdminSession();
  if (response) return response;

  const status = new URL(request.url).searchParams.get('status') || 'pending';
  const { data, error } = await session.supabase
    .from('subscription_requests')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('subscription request list failed:', error);
    return Response.json({ error: 'تعذر تحميل الطلبات' }, { status: 500 });
  }
  return Response.json({ requests: data });
}

export async function PUT(request) {
  const { session, response } = await getAdminSession();
  if (response) return response;

  try {
    const { request_id, status, admin_note } = await request.json();
    if (!request_id || !['approved', 'rejected'].includes(status)) {
      return Response.json({ error: 'بيانات الطلب غير صالحة' }, { status: 400 });
    }

    const { data: subscriptionRequest, error: requestError } = await session.supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (requestError) throw requestError;

    const { error: updateError } = await session.supabase
      .from('subscription_requests')
      .update({ status, admin_note: admin_note || null, updated_at: new Date().toISOString() })
      .eq('id', request_id);
    if (updateError) throw updateError;

    if (status === 'approved') {
      const { error: deleteError } = await session.supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', subscriptionRequest.user_id);
      if (deleteError) throw deleteError;

      const { error: insertError } = await session.supabase
        .from('subscriptions')
        .insert({ user_id: subscriptionRequest.user_id, plan_id: subscriptionRequest.plan_id, status: 'active' });
      if (insertError) throw insertError;
    }

    if (subscriptionRequest.user_email) {
      try {
        const approved = status === 'approved';
        await sendEmail({
          to: subscriptionRequest.user_email,
          subject: approved ? 'تمت الموافقة على طلب اشتراكك' : 'تحديث بخصوص طلب اشتراكك',
          html: `<div dir="rtl"><h2>${approved ? 'تمت الموافقة على طلبك' : 'تعذر قبول الطلب'}</h2><p>${approved ? `تم تفعيل خطة ${escapeHtml(subscriptionRequest.plan_name)}.` : 'يرجى التواصل مع فريق الدعم.'}</p>${admin_note ? `<p>${escapeHtml(admin_note)}</p>` : ''}</div>`,
        });
      } catch (emailError) {
        console.error('Subscription decision email failed:', emailError);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('subscription request update failed:', error);
    return Response.json({ error: 'تعذر تحديث الطلب' }, { status: 500 });
  }
}
