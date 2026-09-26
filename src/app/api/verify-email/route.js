import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return Response.json({ error: "رمز التحقق مطلوب" }, { status: 400 });
    }

    // Find valid token
    const tokens = await sql`
      SELECT evt.*, au.id as user_id, au.email
      FROM email_verification_tokens evt
      JOIN auth_users au ON evt.user_id = au.id
      WHERE evt.token = ${token}
        AND evt.used = false
        AND evt.expires_at > NOW()
      LIMIT 1
    `;

    if (tokens.length === 0) {
      return Response.json(
        { error: "رابط التحقق غير صالح أو منتهي الصلاحية" },
        { status: 400 },
      );
    }

    const { user_id } = tokens[0];

    // Mark email as verified and token as used
    await sql.transaction([
      sql`
        UPDATE auth_users
        SET "emailVerified" = NOW()
        WHERE id = ${user_id}
      `,
      sql`
        UPDATE email_verification_tokens
        SET used = true
        WHERE token = ${token}
      `,
    ]);

    return Response.json({ message: "تم التحقق بنجاح" });
  } catch (error) {
    console.error("Verify email error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
