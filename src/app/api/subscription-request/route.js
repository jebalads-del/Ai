import { auth } from '@/auth';
import { sendEmail } from '@/app/api/utils/send-email';

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const { plan_id } = await request.json();
    if (!plan_id) return Response.json({ error: 'يرجى اختيار خطة' }, { status: 400 });

    const { data: plan, error: planError } = await session.supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .maybeSingle();
    if (planError) throw planError;
    if (!plan) return Response.json({ error: 'الخطة غير موجودة' }, { status: 404 });

    const { data: existing, error: existingError } = await session.supabase
      .from('subscription_requests')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .limit(1);
    if (existingError) throw existingError;
    if (existing?.length) {
      return Response.json({ error: 'لديك طلب ترقية قيد المراجعة بالفعل، يرجى الانتظار' }, { status: 400 });
    }

    const requestData = {
      user_id: session.user.id,
      user_email: session.user.email || '',
      user_name: session.user.name || '',
      plan_id: plan.id,
      plan_name: plan.name,
      plan_price: plan.price,
    };
    const { data: createdRequest, error: insertError } = await session.supabase
      .from('subscription_requests')
      .insert(requestData)
      .select()
      .single();
    if (insertError) throw insertError;

    if (session.user.email) {
      try {
        await sendEmail({
          to: session.user.email,
          subject: `تم استلام طلب ترقية اشتراكك — ${plan.name}`,
          html: `<div dir="rtl"><h2>تم استلام طلبك بنجاح</h2><p>مرحباً ${session.user.name || 'بك'}، طلبك لخطة ${plan.name} بسعر $${plan.price}/شهر قيد المراجعة.</p></div>`,
        });
      } catch (emailError) {
        console.error('Subscription confirmation email failed:', emailError);
      }
    }

    return Response.json({ success: true, request: createdRequest });
  } catch (error) {
    console.error('subscription-request error:', error);
    return Response.json({ error: 'تعذر إرسال طلب الاشتراك' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { data, error } = await session.supabase
    .from('subscription_requests')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('subscription request lookup failed:', error);
    return Response.json({ error: 'تعذر تحميل الطلب' }, { status: 500 });
  }
  return Response.json({ request: data });
}
