import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 },
      );
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email FROM auth_users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return Response.json({ message: "تم الإرسال" });
    }

    const user = users[0];

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    await sql`
      INSERT INTO password_reset_tokens (token, user_id, used, expires_at)
      VALUES (${token}, ${user.id}, false, ${expiresAt})
    `;

    const resetLink = `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/reset-password?token=${token}`;

    // Send email
    await sendEmail({
      to: email,
      subject: "إعادة تعيين كلمة المرور - كرياتيف AI",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">✨</div>
              <h1 style="font-size: 22px; font-weight: 600; color: #111827; margin-top: 12px;">كرياتيف AI</h1>
            </div>
            <h2 style="font-size: 18px; font-weight: 600; color: #111827; text-align: right;">إعادة تعيين كلمة المرور</h2>
            <p style="color: #6b7280; font-size: 14px; text-align: right; line-height: 1.6;">
              لقد طلبت إعادة تعيين كلمة المرور لحسابك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background: #2563eb; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block;">
                إعادة تعيين كلمة المرور
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              هذا الرابط صالح لمدة ساعة واحدة فقط. إذا لم تطلب إعادة التعيين، تجاهل هذا البريد.
            </p>
            <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
            <p style="color: #d1d5db; font-size: 11px; text-align: center;">كرياتيف AI - منصة الإبداع بالذكاء الاصطناعي</p>
          </div>
        </div>
      `,
      text: `إعادة تعيين كلمة المرور\n\nانقر على الرابط التالي لإعادة تعيين كلمة المرور:\n${resetLink}\n\nهذا الرابط صالح لمدة ساعة واحدة.`,
    });

    return Response.json({ message: "تم الإرسال" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
