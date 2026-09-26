"use client";
import { useState } from "react";

export default function TestGenerationPage() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testImageGeneration = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // استخدام Stable Diffusion V3 من المنصة
      const res = await fetch(
        `/integrations/stable-diffusion-v-3/?prompt=${encodeURIComponent(
          "A beautiful sunset over the ocean with vibrant colors",
        )}`,
        { method: "GET" },
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`فشل الاختبار (${res.status}) — ${errText}`);
      }

      const data = await res.json();
      const url = data?.data?.[0];
      if (!url) throw new Error("لم تُنشأ الصورة — لا يوجد URL في الرد");

      setTestResult({
        type: "image",
        url,
        status: "✅ نجح الاختبار! Stable Diffusion V3 يعمل بشكل صحيح",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 اختبار Stable Diffusion V3
          </h1>
          <p className="text-gray-500 mb-6">
            اختبر إذا كانت وظيفة إنشاء الصور تعمل بشكل صحيح
          </p>

          <button
            onClick={testImageGeneration}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 mb-6"
          >
            {loading ? "⏳ جاري الاختبار..." : "🚀 ابدأ الاختبار"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-bold mb-2">❌ فشل الاختبار</p>
              <p className="text-red-600 text-sm font-mono break-all">
                {error}
              </p>
            </div>
          )}

          {testResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-bold mb-4">
                {testResult.status}
              </p>
              {testResult.url && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={testResult.url}
                    alt="Test result"
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 font-bold mb-2">📋 معلومات</p>
            <ul className="text-blue-600 text-sm space-y-1">
              <li>• يستخدم Stable Diffusion V3 من المنصة مباشرة</li>
              <li>• لا يحتاج مفتاح OpenAI منفصل</li>
              <li>• الوصف: "A beautiful sunset over the ocean"</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        body { font-family: 'Tajawal', sans-serif; }
      `}</style>
    </div>
  );
}
