import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // نرسل الإيميل فقط مرة واحدة بعد تحميل المستخدم
    if (!userLoading && user?.email && !triggered) {
      setTriggered(true);
      sendVerification();
    }
  }, [user, userLoading, triggered]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendVerification = async () => {
    if (sending || countdown > 0) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإرسال");
      setSent(true);
      setCountdown(60);
    } catch (err) {
      console.error("send-verification error:", err);
      setError(err.message || "حدث خطأ أثناء إرسال الإيميل");
    } finally {
      setSending(false);
    }
  };

  // التحقق إذا كان البريد صحيحاً
  const isValidEmail =
    user?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F0F2FF] p-4 font-tajawal"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-l from-indigo-600 to-violet-600" />

        <div className="p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-5xl mx-auto mb-6">
            📧
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تحقق من بريدك الإلكتروني
          </h1>

          {userLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm my-4">
              <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full loader-spin" />
              جاري التحميل...
            </div>
          ) : isValidEmail ? (
            <>
              <p className="text-gray-400 text-sm mb-2">
                أرسلنا رابط التحقق إلى
              </p>
              <div className="inline-block bg-indigo-50 text-indigo-700 font-semibold text-sm px-4 py-2 rounded-full mb-6 border border-indigo-100">
                {user.email}
              </div>
            </>
          ) : user && !isValidEmail ? (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 text-right">
              <p className="text-amber-700 text-sm font-bold mb-1">
                ⚠️ البريد الإلكتروني غير صحيح
              </p>
              <p className="text-amber-600 text-xs">
                البريد المسجل <strong>"{user.email}"</strong> ليس بريداً
                إلكترونياً صحيحاً. يرجى إنشاء حساب جديد بريد صحيح مثل:
                name@gmail.com
              </p>
              <a
                href="/account/signup"
                className="mt-3 block w-full py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 text-center"
              >
                إنشاء حساب جديد
              </a>
            </div>
          ) : null}

          {isValidEmail && (
            <>
              <div className="bg-[#F8F9FF] rounded-2xl p-5 mb-6 text-right space-y-3">
                {[
                  { n: "١", t: "افتح بريدك الإلكتروني" },
                  { n: "٢", t: "ابحث عن رسالة من كرياتيف AI" },
                  { n: "٣", t: "انقر على رابط التحقق" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.n}
                    </div>
                    <span className="text-sm text-gray-600">{s.t}</span>
                  </div>
                ))}
              </div>

              {sent && !error && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-3 mb-4">
                  <p className="text-green-700 text-xs font-bold">
                    ✓ تم إرسال الإيميل بنجاح!
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    تحقق من صندوق الوارد أو مجلد Spam
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-right">
                  <p className="text-red-600 text-xs font-bold mb-1">
                    ⚠️ خطأ في إرسال الإيميل
                  </p>
                  <p className="text-red-500 text-xs">{error}</p>
                  <div className="mt-3 bg-red-100 rounded-xl p-3">
                    <p className="text-red-700 text-xs font-bold mb-1">
                      🔑 الحل:
                    </p>
                    <p className="text-red-600 text-xs">
                      يجب إضافة <strong>RESEND_API_KEY</strong> في إعدادات
                      المشروع:
                    </p>
                    <ol className="text-red-500 text-xs mt-1 space-y-1 list-decimal list-inside">
                      <li>
                        اذهب إلى <strong>resend.com</strong> وأنشئ حساباً
                      </li>
                      <li>أنشئ API Key جديد</li>
                      <li>
                        أضفه في Secrets باسم <strong>RESEND_API_KEY</strong>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              <button
                onClick={sendVerification}
                disabled={sending || countdown > 0}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-l from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 mb-4"
              >
                {sending
                  ? "جاري الإرسال..."
                  : countdown > 0
                    ? `إعادة الإرسال بعد ${countdown}ث`
                    : sent
                      ? "إعادة إرسال رابط التحقق"
                      : "إرسال رابط التحقق"}
              </button>

              <p className="text-xs text-gray-400 mb-4">
                لم تجد الإيميل؟ تحقق من مجلد Spam أو Promotions
              </p>
            </>
          )}

          <div className="border-t border-gray-100 pt-5 flex items-center justify-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              تخطي الآن ←
            </a>
            <span className="text-gray-200">|</span>
            <a
              href="/account/signin"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              تسجيل الدخول
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal { font-family: 'Tajawal', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

export default MainComponent;
