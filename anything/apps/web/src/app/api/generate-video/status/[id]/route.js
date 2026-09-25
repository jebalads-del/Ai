// يتحقق من حالة إنشاء الفيديو
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return Response.json({ error: "معرف الفيديو مطلوب" }, { status: 400 });
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return Response.json(
        { error: "مفتاح Replicate غير موجود" },
        { status: 500 },
      );
    }

    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${replicateToken}` },
    });

    if (!res.ok) {
      throw new Error(`خطأ في التحقق (${res.status})`);
    }

    const data = await res.json();

    // status: starting | processing | succeeded | failed | canceled
    return Response.json({
      status: data.status,
      url: data.output || null,
      error: data.error || null,
    });
  } catch (error) {
    console.error("generate-video/status error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
