import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { sendEmail } from "@/app/api/utils/send-email";

// POST — الأدمن يرقي اشتراك مستخدم مباشرةً
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "غير مصرح" }, { status: 401 });

    const adminRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (adminRows[0]?.role !== "admin")
      return Response.json({ error: "غير مصرح" }, { status: 403 });

    const { user_id, plan_id, notify } = await request.json();
    if (!user_id || !plan_id)
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });

    // جلب الخطة
    const plans = await sql`SELECT * FROM plans WHERE id = ${plan_id} LIMIT 1`;
    if (!plans.length)
      return Response.json({ error: "الخطة غير موجودة" }, { status: 404 });
    const plan = plans[0];

    // جلب المستخدم
    const users =
      await sql`SELECT id, name, email FROM auth_users WHERE id = ${user_id} LIMIT 1`;
    if (!users.length)
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    const user = users[0];

    // حذف الاشتراكات القديمة وإضافة الجديد
    await sql`DELETE FROM subscriptions WHERE user_id = ${String(user_id)}`;
    await sql`
      INSERT INTO subscriptions (user_id, plan_id, status)
      VALUES (${String(user_id)}, ${plan.id}, 'active')
    `;

    // إرسال إيميل للمستخدم إذا طلب الأدمن ذلك
    if (notify && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `🎉 تم تفعيل اشتراكك في خطة ${plan.name}!`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0FDF4; padding: 30px; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #1E1B4B, #4F46E5); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
                <h2 style="margin:0; font-size: 20px;">🎉 تم تفعيل اشتراكك!</h2>
                <p style="margin: 8px 0 0; opacity: 0.8;">مرحباً ${user.name || "بك"}، اشتراكك الجديد جاهز</p>
              </div>
              <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #D1FAE5;">
                <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
                  مبروك! 🎊 تم تفعيل خطة <strong style="color: #4F46E5;">${plan.name}</strong> على حسابك بنجاح.
                  <br/><br/>
                  يمكنك الآن الاستمتاع بـ <strong>${plan.tokens_limit} عملية شهرياً</strong>.
                </p>
              </div>
              <div style="background: #EEF2FF; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #4F46E5; font-weight: bold;">📦 ${plan.name} — $${plan.price}/شهر — ${plan.tokens_limit} عملية</p>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.AUTH_URL || process.env.NEXT_PUBLIC_CREATE_APP_URL}/dashboard"
                   style="display: inline-block; background: #4F46E5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 15px;">
                  🚀 ابدأ الاستخدام الآن
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email notify error:", emailErr);
      }
    }

    return Response.json({ success: true, plan: plan.name });
  } catch (error) {
    console.error("upgrade-subscription error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — إلغاء اشتراك مستخدم
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "غير مصرح" }, { status: 401 });

    const adminRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (adminRows[0]?.role !== "admin")
      return Response.json({ error: "غير مصرح" }, { status: 403 });

    const { user_id } = await request.json();
    await sql`DELETE FROM subscriptions WHERE user_id = ${String(user_id)}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
