import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { sendEmail } from "@/app/api/utils/send-email";

// POST — المستخدم يطلب ترقية الاشتراك
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { plan_id } = await request.json();
    if (!plan_id) {
      return Response.json({ error: "يرجى اختيار خطة" }, { status: 400 });
    }

    const userId = String(session.user.id);
    const userEmail = session.user.email || "";
    const userName = session.user.name || "";

    // جلب الخطة
    const plans = await sql`SELECT * FROM plans WHERE id = ${plan_id} LIMIT 1`;
    if (!plans.length) {
      return Response.json({ error: "الخطة غير موجودة" }, { status: 404 });
    }
    const plan = plans[0];

    // التحقق إذا كان هناك طلب معلق بالفعل
    const existing = await sql`
      SELECT id FROM subscription_requests
      WHERE user_id = ${userId} AND status = 'pending'
      LIMIT 1
    `;
    if (existing.length) {
      return Response.json(
        { error: "لديك طلب ترقية قيد المراجعة بالفعل، يرجى الانتظار" },
        { status: 400 },
      );
    }

    // حفظ الطلب
    const result = await sql`
      INSERT INTO subscription_requests (user_id, user_email, user_name, plan_id, plan_name, plan_price)
      VALUES (${userId}, ${userEmail}, ${userName}, ${plan.id}, ${plan.name}, ${plan.price})
      RETURNING *
    `;

    // إرسال إيميل للأدمن
    const adminEmails = await sql`
      SELECT email FROM auth_users WHERE role = 'admin' LIMIT 5
    `;

    if (adminEmails.length) {
      const adminEmailList = adminEmails.map((r) => r.email).filter(Boolean);
      try {
        await sendEmail({
          to: adminEmailList,
          subject: `🔔 طلب ترقية اشتراك جديد — ${plan.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9FAFB; padding: 30px; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #1E1B4B, #4F46E5); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
                <h2 style="margin:0; font-size: 20px;">🔔 طلب ترقية اشتراك جديد</h2>
                <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">تلقت لوحة الإدارة طلب ترقية جديد</p>
              </div>

              <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #E5E7EB;">
                <h3 style="margin: 0 0 16px; font-size: 16px; color: #111827;">👤 بيانات المستخدم</h3>
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 6px 0; color: #6B7280;">الاسم</td><td style="font-weight: bold;">${userName || "—"}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6B7280;">البريد الإلكتروني</td><td style="font-weight: bold;">${userEmail}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6B7280;">رقم المستخدم</td><td style="font-family: monospace;">${userId}</td></tr>
                </table>
              </div>

              <div style="background: #EEF2FF; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #C7D2FE;">
                <h3 style="margin: 0 0 16px; font-size: 16px; color: #3730A3;">📦 الخطة المطلوبة</h3>
                <table style="width: 100%; font-size: 14px; color: #374151;">
                  <tr><td style="padding: 6px 0; color: #6B7280;">اسم الخطة</td><td style="font-weight: bold; color: #4F46E5;">${plan.name}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6B7280;">السعر الشهري</td><td style="font-weight: bold; font-size: 18px; color: #111827;">$${plan.price}</td></tr>
                  <tr><td style="padding: 6px 0; color: #6B7280;">عدد العمليات</td><td style="font-weight: bold;">${plan.tokens_limit} عملية/شهر</td></tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.AUTH_URL || process.env.NEXT_PUBLIC_CREATE_APP_URL}/admin"
                   style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px;">
                  ⚙️ فتح لوحة الإدارة
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }
    }

    // إرسال إيميل للمستخدم تأكيداً
    try {
      await sendEmail({
        to: userEmail,
        subject: `✅ تم استلام طلب ترقية اشتراكك — ${plan.name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9FAFB; padding: 30px; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #1E1B4B, #4F46E5); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
              <h2 style="margin:0; font-size: 20px;">✅ تم استلام طلبك بنجاح</h2>
              <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">شكراً ${userName || "لك"}، سنتواصل معك قريباً</p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #E5E7EB;">
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
                تم استلام طلبك للترقية إلى خطة <strong style="color: #4F46E5;">${plan.name}</strong> بسعر <strong>$${plan.price}/شهر</strong>.
                <br/><br/>
                سيتواصل معك فريقنا على هذا البريد الإلكتروني خلال <strong>24 ساعة</strong> لإتمام عملية الدفع وتفعيل اشتراكك.
              </p>
            </div>

            <div style="background: #EEF2FF; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #4F46E5; font-weight: bold;">📦 ${plan.name} — $${plan.price}/شهر — ${plan.tokens_limit} عملية شهرياً</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("User confirmation email error:", emailErr);
    }

    return Response.json({ success: true, request: result[0] });
  } catch (error) {
    console.error("subscription-request error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET — المستخدم يشوف طلبه الحالي
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = String(session.user.id);
    const rows = await sql`
      SELECT * FROM subscription_requests
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return Response.json({ request: rows[0] || null });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
