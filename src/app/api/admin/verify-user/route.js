import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return Response.json({ error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const result = await sql`
      UPDATE auth_users
      SET "emailVerified" = NOW()
      WHERE id = ${userId}
      RETURNING id, email, "emailVerified"
    `;

    if (result.length === 0) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return Response.json({ message: "تم التحقق بنجاح", user: result[0] });
  } catch (error) {
    console.error("Verify user error:", error);
    return Response.json(
      { error: "حدث خطأ في الخادم: " + error.message },
      { status: 500 },
    );
  }
}
