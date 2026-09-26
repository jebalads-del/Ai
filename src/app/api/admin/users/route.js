import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    let users;
    let countResult;

    if (search) {
      const searchPattern = `%${search}%`;
      users = await sql(
        `SELECT 
          u.id, u.name, u.email, 
          u."emailVerified" as email_verified,
          u.image,
          s.status as subscription_status,
          p.name as plan_name,
          p.price as plan_price,
          (SELECT COUNT(*) FROM usage_logs ul WHERE ul.user_id = u.id::text) as usage_count,
          (SELECT MAX(created_at) FROM usage_logs ul WHERE ul.user_id = u.id::text) as last_active,
          a.provider
         FROM auth_users u
         LEFT JOIN subscriptions s ON s.user_id = u.id::text
         LEFT JOIN plans p ON p.id = s.plan_id
         LEFT JOIN auth_accounts a ON a."userId" = u.id
         WHERE u.email ILIKE $1 OR u.name ILIKE $1
         ORDER BY u.id DESC
         LIMIT $2 OFFSET $3`,
        [searchPattern, limit, offset],
      );
      countResult = await sql(
        `SELECT COUNT(*) FROM auth_users WHERE email ILIKE $1 OR name ILIKE $1`,
        [searchPattern],
      );
    } else {
      users = await sql(
        `SELECT 
          u.id, u.name, u.email,
          u."emailVerified" as email_verified,
          u.image,
          s.status as subscription_status,
          p.name as plan_name,
          p.price as plan_price,
          (SELECT COUNT(*) FROM usage_logs ul WHERE ul.user_id = u.id::text) as usage_count,
          (SELECT MAX(created_at) FROM usage_logs ul WHERE ul.user_id = u.id::text) as last_active,
          a.provider
         FROM auth_users u
         LEFT JOIN subscriptions s ON s.user_id = u.id::text
         LEFT JOIN plans p ON p.id = s.plan_id
         LEFT JOIN auth_accounts a ON a."userId" = u.id
         ORDER BY u.id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      countResult = await sql(`SELECT COUNT(*) FROM auth_users`);
    }

    const totalUsers = parseInt(countResult[0]?.count || 0);
    const verifiedCount = await sql(
      `SELECT COUNT(*) FROM auth_users WHERE "emailVerified" IS NOT NULL`,
    );
    const totalRevenue = await sql(
      `SELECT COALESCE(SUM(p.price), 0) as total FROM subscriptions s JOIN plans p ON p.id = s.plan_id WHERE s.status = 'active'`,
    );
    const todayUsage = await sql(
      `SELECT COUNT(*) FROM usage_logs WHERE created_at >= CURRENT_DATE`,
    );

    return Response.json({
      users,
      total: totalUsers,
      verified: parseInt(verifiedCount[0]?.count || 0),
      totalRevenue: parseFloat(totalRevenue[0]?.total || 0),
      todayUsage: parseInt(todayUsage[0]?.count || 0),
      page,
      pages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return Response.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    await sql`DELETE FROM auth_users WHERE id = ${userId}`;
    return Response.json({ message: "تم حذف المستخدم" });
  } catch (error) {
    console.error("Delete user error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
