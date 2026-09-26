import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Check if already verified
    const users = await sql`
      SELECT "emailVerified" FROM auth_users WHERE id = ${userId} LIMIT 1
    `;
    if (users[0]?.emailVerified) {
      return Response.json({ message: "البريد محقق بالفعل" });
    }

    // Delete old unused tokens
    await sql`
      DELETE FROM email_verification_tokens
      WHERE user_id = ${userId} AND used = false AND expires_at < NOW()
    `;

    // Rate limiting: check if a token was sent recently (within 60 seconds)
    const recent = await sql`
      SELECT id FROM email_verification_tokens
      WHERE user_id = ${userId} AND used = false AND created_at > NOW() - INTERVAL '60 seconds'
      LIMIT 1
    `;
    if (recent.length > 0) {
      return Response.json({ message: "تم الإرسال مسبقاً" });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await sql`
      INSERT INTO email_verification_tokens (token, user_id, used, expires_at)
      VALUES (${token}, ${userId}, false, ${expiresAt})
    `;

    const verifyLink = `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/account/verify-email?token=${token}`;

    await sendEmail({
      to: userEmail,
      subject: "تأكيد بريدك الإلكتروني - كرياتيف AI",
      html: `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F0F2FF; padding: 20px;">
          <div style="background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(79,70,229,0.15);">
            <div style="height: 6px; background: linear-gradient(to left, #4F46E5, #7C3AED);"></div>
            <div style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">✨</div>
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">كرياتيف AI</h1>
              </div>
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; text-align: right; margin-bottom: 8px;">تأكيد بريدك الإلكتروني</h2>
              <p style="color: #6B7280; font-size: 14px; text-align: right; line-height: 1.7; margin-bottom: 32px;">
                مرحباً! شكراً لتسجيلك في كرياتيف AI. انقر على الزر أدناه لتأكيد بريدك الإلكتروني والبدء في استخدام المنصة.
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(to left, #4F46E5, #7C3AED); color: white; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(79,70,229,0.3);">
                  تأكيد البريد الإلكتروني ✓
                </a>
              </div>
              <div style="background: #F8F9FF; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #6B7280; font-size: 12px; text-align: right; margin: 0; line-height: 1.6;">
                  هذا الرابط صالح لمدة 24 ساعة. إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #F3F4F6; margin: 24px 0;">
              <p style="color: #D1D5DB; font-size: 12px; text-align: center; margin: 0;">كرياتيف AI — منصة الإبداع بالذكاء الاصطناعي</p>
            </div>
          </div>
        </div>
      `,
      text: `تأكيد بريدك الإلكتروني\n\nانقر على الرابط التالي لتأكيد بريدك:\n${verifyLink}\n\nهذا الرابط صالح لمدة 24 ساعة.`,
    });

    return Response.json({ message: "تم الإرسال" });
  } catch (error) {
    console.error("Send verification error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
