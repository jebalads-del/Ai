import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await request.json();
    const prompt = body?.prompt;
    const imageUrl = body?.imageUrl; // صورة مرجعية للتعديل

    if (!prompt || !String(prompt).trim()) {
      return Response.json({ error: "يرجى كتابة وصف للصورة" }, { status: 400 });
    }

    const { data: activeSubscription, error: subscriptionError } = await session.supabase
      .from('subscriptions')
      .select('plan:plans(tokens_limit)')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subscriptionError) throw subscriptionError;
    const tokensLimit = activeSubscription?.plan?.tokens_limit ?? 5;
    const { count: usedCount, error: usageError } = await session.supabase
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    if (usageError) throw usageError;

    if (usedCount >= tokensLimit) {
      return Response.json(
        { error: "لقد استنفدت حد الاستخدام — يرجى ترقية خطتك" },
        { status: 403 },
      );
    }

    // استدعاء OpenAI DALL-E 3 مباشرةً من الخادم
    const rawKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY || "";
    const apiKey = rawKey.trim();

    if (!apiKey) {
      console.error("❌ OpenAI API key is missing");
      return Response.json(
        {
          error:
            "مفتاح OpenAI API غير موجود — أضف المفتاح في Secrets باسم OPENAI_API_KEY",
        },
        { status: 500 },
      );
    }

    // التحقق من صحة تنسيق المفتاح
    if (!apiKey.startsWith("sk-")) {
      console.error(
        "❌ Invalid OpenAI API key format. Key starts with:",
        apiKey.substring(0, 10) + "***",
      );
      return Response.json(
        {
          error: "مفتاح OpenAI API غير صحيح — يجب أن يبدأ المفتاح بـ sk-",
        },
        { status: 500 },
      );
    }

    console.log("✅ API Key validated, attempting to generate image...");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");
    if (imageUrl) {
      console.log("🖼️ Reference image provided for editing");
    }

    let aiResponse;

    // إذا كان هناك صورة مرجعية، نستخدم Image Variations API
    if (imageUrl) {
      console.log("🎨 Using image variation mode");

      // تحميل الصورة من URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("فشل تحميل الصورة المرجعية");
      }
      const imageBlob = await imageResponse.blob();

      // إنشاء FormData للإرسال
      const formData = new FormData();
      formData.append("image", imageBlob, "image.png");
      formData.append("prompt", String(prompt).trim());
      formData.append("n", "1");
      formData.append("size", "1024x1024");

      aiResponse = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });
    } else {
      // نحاول dall-e-3 أولاً، وإذا لم يكن متاحاً في الحساب نتراجع لـ dall-e-2
      const tryGenerate = async (model) => {
        console.log(`🎨 Trying model: ${model}`);
        return fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            prompt: String(prompt).trim(),
            n: 1,
            size: "1024x1024",
          }),
        });
      };

      aiResponse = await tryGenerate("dall-e-3");

      // إذا كان dall-e-3 غير متاح، نجرب dall-e-2
      if (!aiResponse.ok) {
        const errData = await aiResponse.json().catch(() => ({}));
        const errMsg = errData?.error?.message || "";
        console.error(`❌ DALL-E 3 failed (${aiResponse.status}):`, errMsg);

        const isModelError =
          errMsg.includes("does not exist") ||
          errMsg.includes("model") ||
          aiResponse.status === 404;

        if (isModelError) {
          console.warn("⚠️ DALL-E 3 not available, falling back to DALL-E 2");
          aiResponse = await tryGenerate("dall-e-2");
        }
      }
    }

    if (!aiResponse.ok) {
      const fallbackErr = await aiResponse.json().catch(() => ({}));
      const finalMsg =
        fallbackErr?.error?.message || `خطأ من OpenAI (${aiResponse.status})`;
      console.error("❌ Final error:", aiResponse.status, finalMsg);
      throw new Error(finalMsg);
    }

    const data = await aiResponse.json();
    const url = data?.data?.[0]?.url;

    if (!url) {
      console.error("❌ No image URL in response:", data);
      throw new Error("لم تُنشأ الصورة، حاول مرة أخرى");
    }

    console.log(
      "✅ Image generated successfully:",
      url.substring(0, 50) + "...",
    );

    const { error: logError } = await session.supabase
      .from('usage_logs')
      .insert({ user_id: session.user.id, type: 'image' });
    if (logError) throw logError;

    return Response.json({ url });
  } catch (error) {
    console.error("💥 generate-image error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
