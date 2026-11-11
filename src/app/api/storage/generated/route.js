import { randomUUID } from "node:crypto";
import { auth } from "@/auth";

const bucket = "ai-generated";
const maxFileSize = 100 * 1024 * 1024;
const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return Response.json(
        { error: "إعدادات تخزين Supabase غير مكتملة" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !extensions[file.type]) {
      return Response.json({ error: "نوع الملف غير مدعوم" }, { status: 400 });
    }
    if (!file.size || file.size > maxFileSize) {
      return Response.json({ error: "حجم الملف غير مدعوم" }, { status: 413 });
    }

    const path = `${String(session.user.id)}/${randomUUID()}.${extensions[file.type]}`;
    const bytes = await file.arrayBuffer();
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    };

    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": file.type },
        body: bytes,
      },
    );
    if (!uploadResponse.ok) {
      console.error("Supabase Storage upload failed:", await uploadResponse.text());
      return Response.json({ error: "فشل حفظ الملف" }, { status: 502 });
    }

    const signedResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${bucket}/${path}`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: 604800 }),
      },
    );
    if (!signedResponse.ok) {
      console.error("Supabase Storage signed URL failed:", await signedResponse.text());
      return Response.json({ error: "فشل إنشاء رابط الملف" }, { status: 502 });
    }

    const { signedURL } = await signedResponse.json();
    return Response.json({
      url: signedURL.startsWith("http") ? signedURL : `${supabaseUrl}/storage/v1${signedURL}`,
    });
  } catch (error) {
    console.error("generated media storage error:", error.message);
    return Response.json({ error: "فشل حفظ الملف" }, { status: 500 });
  }
}
