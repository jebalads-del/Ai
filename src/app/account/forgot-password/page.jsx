"use client";
import { useState } from "react";

function MainComponent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "حدث خطأ");
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F0F2FF] p-4 font-tajawal"
      dir="rtl"
    >
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200">
        {/* ── Left Brand Panel ── */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#1E1B4B] via-[#3730A3] to-[#4F46E5] p-10 text-white relative overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#818CF8] opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#C7D2FE] opacity-10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <a
              href="/account/signin"
              className="flex items-center gap-3 mb-12 w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg">
                ✨
              </div>
              <span className="text-xl font-bold tracking-tight">
                كرياتيف AI
              </span>
            </a>
            <h2 className="text-3xl font-bold leading-snug mb-4">
              لا تقلق،
              <br />
              سنساعدك
              <br />
              على الدخول
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              سنرسل رابط إعادة التعيين فوراً إلى بريدك الإلكتروني.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-400/30 flex items-center justify-center text-sm font-bold">
                  ١
                </div>
                <span className="text-sm">أدخل بريدك الإلكتروني</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-400/30 flex items-center justify-center text-sm font-bold">
                  ٢
                </div>
                <span className="text-sm">تحقق من صندوق البريد</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-400/30 flex items-center justify-center text-sm font-bold">
                  ٣
                </div>
                <span className="text-sm">عيّن كلمة مرور جديدة</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
              ✨
            </div>
            <span className="text-lg font-bold text-gray-900">كرياتيف AI</span>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-4xl mx-auto mb-6">
                📧
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                تم إرسال الرابط!
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                تحقق من بريدك الإلكتروني{" "}
                <span className="font-semibold text-gray-700">{email}</span>{" "}
                واتبع التعليمات. قد يستغرق الأمر بضع دقائق.
              </p>
              <a
                href="/account/signin"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 text-center"
              >
                العودة لتسجيل الدخول
              </a>
              <p className="text-xs text-gray-400 mt-4">
                لم يصلك الإيميل؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                نسيت كلمة المرور؟ 🔑
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                أدخل بريدك وسنرسل لك رابط إعادة التعيين
              </p>

              <form noValidate onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-[#F8F9FF] border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      جاري الإرسال...
                    </span>
                  ) : (
                    "إرسال رابط الاستعادة"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                تذكرت كلمة المرور؟{" "}
                <a
                  href="/account/signin"
                  className="text-indigo-600 font-bold hover:underline"
                >
                  تسجيل الدخول
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal { font-family: 'Tajawal', sans-serif; }
      `}</style>
    </div>
  );
}

export default MainComponent;
