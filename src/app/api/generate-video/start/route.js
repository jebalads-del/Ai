import { auth } from "@/auth";

// يبدأ إنشاء الفيديو ويعيد prediction ID فوراً (بدون انتظار)
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const body = await request.json();
    const prompt = body?.prompt;

    if (!prompt || !String(prompt).trim()) {
      return Response.json(
        { error: "يرجى كتابة وصف للفيديو" },
        { status: 400 },
      );
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

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return Response.json(
        {
          error:
            "مفتاح Replicate API غير موجود — أضف REPLICATE_API_TOKEN في Secrets",
        },
        { status: 500 },
      );
    }

    // إنشاء prediction وإعادة الـ ID فوراً للـ frontend
    const predictionRes = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${replicateToken}`,
        },
        body: JSON.stringify({
          version:
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
          input: {
            prompt: String(prompt).trim(),
            num_frames: 24,
            num_inference_steps: 50,
            fps: 8,
          },
        }),
      },
    );

    if (!predictionRes.ok) {
      const err = await predictionRes.json().catch(() => ({}));
      throw new Error(
        err?.detail || `خطأ من Replicate (${predictionRes.status})`,
      );
    }

    const prediction = await predictionRes.json();

    // ✅ لا نسجل الاستخدام هنا — يُسجَّل فقط بعد نجاح الفيديو فعلاً
    return Response.json({ predictionId: prediction.id });
  } catch (error) {
    console.error("generate-video/start error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
