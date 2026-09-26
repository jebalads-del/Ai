import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "غير مصرح" }, { status: 401 });
    }
    const { type } = await request.json();
    await sql`INSERT INTO usage_logs (user_id, type) VALUES (${String(session.user.id)}, ${type || "image"})`;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("log-usage error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
