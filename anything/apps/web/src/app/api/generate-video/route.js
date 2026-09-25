import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await request.json();
    const prompt = body?.prompt;
    const imageUrl = body?.imageUrl; // صورة مرجعية لتحويلها لفيديو

    if (!prompt || !String(prompt).trim()) {
      return Response.json(
        { error: "يرجى كتابة وصف للفيديو" },
        { status: 400 },
      );
    }

    const userId = String(session.user.id);

    // التحقق من حد الاستخدام
    const subRows = await sql`
      SELECT p.tokens_limit FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      LIMIT 1
    `;
    const tokensLimit = subRows[0]?.tokens_limit ?? 5;
    const usageRows = await sql`
      SELECT COUNT(*) AS cnt FROM usage_logs WHERE user_id = ${userId}
    `;
    const usedCount = Number(usageRows[0]?.cnt ?? 0);

    if (usedCount >= tokensLimit) {
      return Response.json(
        { error: "لقد استنفدت حد الاستخدام — يرجى ترقية خطتك" },
        { status: 403 },
      );
    }

    // استخدام Replicate API لإنشاء الفيديو
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateToken) {
      console.error("❌ Replicate API token is missing");
      return Response.json(
        {
          error:
            "مفتاح Replicate API غير موجود — أضف المفتاح في Secrets باسم REPLICATE_API_TOKEN",
        },
        { status: 500 },
      );
    }

    console.log("✅ Starting video generation...");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");

    // إذا كان هناك صورة، نستخدم image-to-video، وإلا نستخدم text-to-video
    let modelInput;
    let modelVersion;

    if (imageUrl) {
      console.log("🖼️ Using image-to-video mode");
      // Stable Video Diffusion - Image to Video
      modelVersion =
        "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438";
      modelInput = {
        input_image: imageUrl,
        sizing_strategy: "maintain_aspect_ratio",
        frames_per_second: 6,
        motion_bucket_id: 127,
      };
    } else {
      console.log("📝 Using text-to-video mode");
      // نستخدم نموذج text-to-video (مثل Zeroscope)
      modelVersion =
        "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351";
      modelInput = {
        prompt: String(prompt).trim(),
        num_frames: 24,
        num_inference_steps: 50,
      };
    }

    // إنشاء prediction
    const predictionResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${replicateToken}`,
        },
        body: JSON.stringify({
          version: modelVersion,
          input: modelInput,
        }),
      },
    );

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json().catch(() => ({}));
      console.error("❌ Replicate API error:", errorData);
      throw new Error(
        errorData?.detail || `خطأ من Replicate (${predictionResponse.status})`,
      );
    }

    const prediction = await predictionResponse.json();
    console.log("⏳ Prediction created:", prediction.id);

    // انتظار اكتمال الفيديو (polling)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 دقائق كحد أقصى

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // انتظار 5 ثواني

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${replicateToken}`,
          },
        },
      );

      if (!statusResponse.ok) {
        throw new Error("فشل التحقق من حالة الفيديو");
      }

      const status = await statusResponse.json();
      console.log(
        `📊 Status: ${status.status} (attempt ${attempts + 1}/${maxAttempts})`,
      );

      if (status.status === "succeeded") {
        videoUrl = status.output;
        break;
      } else if (status.status === "failed") {
        throw new Error(status.error || "فشل إنشاء الفيديو");
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("انتهت مهلة إنشاء الفيديو — حاول مرة أخرى");
    }

    console.log("✅ Video generated successfully:", videoUrl);

    // تسجيل الاستخدام
    await sql`INSERT INTO usage_logs (user_id, type) VALUES (${userId}, 'video')`;

    return Response.json({ url: videoUrl });
  } catch (error) {
    console.error("💥 generate-video error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
