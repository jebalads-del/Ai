import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { sendEmail } from "@/app/api/utils/send-email";

// GET — قائمة طلبات الترقية (للأدمن)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "غير مصرح" }, { status: 401 });

    const adminRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (adminRows[0]?.role !== "admin")
      return Response.json({ error: "غير مصرح" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const rows = await sql`
      SELECT * FROM subscription_requests
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return Response.json({ requests: rows });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT — الأدمن يوافق أو يرفض الطلب
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "غير مصرح" }, { status: 401 });

    const adminRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (adminRows[0]?.role !== "admin")
      return Response.json({ error: "غير مصرح" }, { status: 403 });

    const { request_id, status, admin_note } = await request.json();
    if (!request_id || !status)
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });

    // جلب الطلب
    const reqRows =
      await sql`SELECT * FROM subscription_requests WHERE id = ${request_id} LIMIT 1`;
    if (!reqRows.length)
      return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
    const req = reqRows[0];

    // تحديث حالة الطلب
    await sql`
      UPDATE subscription_requests
      SET status = ${status}, admin_note = ${admin_note || null}, updated_at = NOW()
      WHERE id = ${request_id}
    `;

    // إذا وافق الأدمن — فعّل الاشتراك فوراً
    if (status === "approved") {
      // حذف الاشتراكات القديمة
      await sql`DELETE FROM subscriptions WHERE user_id = ${req.user_id}`;
      // إضافة الاشتراك الجديد
      await sql`
        INSERT INTO subscriptions (user_id, plan_id, status)
        VALUES (${req.user_id}, ${req.plan_id}, 'active')
      `;
    }

    // إرسال إيميل للمستخدم
    const emailSubject =
      status === "approved"
        ? `🎉 تمت الموافقة على طلب ترقية اشتراكك!`
        : `❌ بخصوص طلب ترقية اشتراكك`;

    const emailHtml =
      status === "approved"
        ? `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0FDF4; padding: 30px; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #065F46, #059669); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
            <h2 style="margin:0; font-size: 20px;">🎉 تمت الموافقة على طلبك!</h2>
            <p style="margin: 8px 0 0; opacity: 0.8;">تم تفعيل اشتراكك بنجاح</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #D1FAE5;">
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
              مبروك! 🎊 تم تفعيل خطة <strong style="color: #059669;">${req.plan_name}</strong> على حسابك.
              <br/><br/>
              يمكنك الآن الاستمتاع بجميع مميزات الخطة.
            </p>
            ${admin_note ? `<p style="margin-top: 16px; padding: 12px; background: #ECFDF5; border-radius: 8px; color: #065F46; font-size: 14px;">💬 ملاحظة من الإدارة: ${admin_note}</p>` : ""}
          </div>
          <div style="text-align: center;">
            <a href="${process.env.AUTH_URL || process.env.NEXT_PUBLIC_CREATE_APP_URL}/dashboard"
               style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px;">
              🚀 ابدأ الاستخدام الآن
            </a>
          </div>
        </div>
      `
        : `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF7ED; padding: 30px; border-radius: 16px;">
          <div style="background: linear-gradient(135deg, #92400E, #D97706); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
            <h2 style="margin:0; font-size: 20px;">بخصوص طلب ترقية اشتراكك</h2>
          </div>
          <div style="background: white; border-radius: 12px; padding: 20px; border: 1px solid #FED7AA;">
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
              لم نتمكن من معالجة طلب الترقية إلى خطة <strong>${req.plan_name}</strong> في الوقت الحالي.
              ${admin_note ? `<br/><br/>💬 <strong>السبب:</strong> ${admin_note}` : ""}
              <br/><br/>
              يسعدنا مساعدتك، يمكنك إرسال طلب جديد أو التواصل معنا.
            </p>
          </div>
        </div>
      `;

    try {
      await sendEmail({
        to: req.user_email,
        subject: emailSubject,
        html: emailHtml,
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
