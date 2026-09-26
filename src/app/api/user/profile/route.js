import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }
    const userId = session.user.id;

    const [userRows, subRows, usageRows] = await sql.transaction([
      sql`SELECT id, name, email, image, "emailVerified", role FROM auth_users WHERE id = ${userId} LIMIT 1`,
      sql`SELECT s.status, s.created_at, p.name as plan_name, p.price, p.tokens_limit, p.description
          FROM subscriptions s
          JOIN plans p ON p.id = s.plan_id
          WHERE s.user_id = ${String(userId)} AND s.status = 'active'
          ORDER BY s.created_at DESC LIMIT 1`,
      sql`SELECT type, created_at FROM usage_logs WHERE user_id = ${String(userId)} ORDER BY created_at DESC LIMIT 50`,
    ]);

    return Response.json({
      user: userRows[0] || null,
      subscription: subRows[0] || null,
      usage: usageRows || [],
    });
  } catch (error) {
    console.error("profile error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
