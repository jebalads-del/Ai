import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { supabase } from "@/utils/supabase";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const requestedEmail = new URLSearchParams(window.location.search).get("email");
    setEmail(user?.email || requestedEmail || "");
    setSent(Boolean(requestedEmail));
  }, [user]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendVerification = async () => {
    if (sending || countdown > 0) return;
    if (!email) {
      setError("أدخل البريد الإلكتروني أولاً");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
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
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#080717] p-4 sm:p-6 font-tajawal text-slate-100"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-[#100d25] rounded-[2rem] border border-white/10 shadow-2xl shadow-indigo-950/50 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-cyan-400 via-indigo-500 to-violet-600" />

        <div className="p-7 sm:p-10 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/15 to-indigo-500/20 border border-cyan-300/10 flex items-center justify-center text-5xl mx-auto mb-6">
            📧
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            تحقق من بريدك الإلكتروني
          </h1>

          {userLoading && !email ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm my-4">
              <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full loader-spin" />
              جاري التحميل...
            </div>
          ) : isValidEmail ? (
            <>
              <p className="text-slate-400 text-sm mb-2">
                أرسلنا رابط التحقق إلى
              </p>
              <div className="inline-block bg-indigo-400/10 text-indigo-200 font-semibold text-sm px-4 py-2 rounded-full mb-6 border border-indigo-300/20">
                {email}
              </div>
            </>
          ) : email && !isValidEmail ? (
            <div className="bg-amber-400/10 border border-amber-300/20 rounded-2xl p-4 mb-6 text-right">
              <p className="text-amber-200 text-sm font-bold mb-1">
                ⚠️ البريد الإلكتروني غير صحيح
              </p>
              <p className="text-amber-300 text-xs">
                البريد المسجل <strong>"{email}"</strong> ليس بريداً
                إلكترونياً صحيحاً. يرجى إنشاء حساب جديد بريد صحيح مثل:
                name@gmail.com
              </p>
              <a
                href="/account/signup"
                className="mt-3 block w-full py-2.5 rounded-xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-center shadow-lg shadow-indigo-950/40"
              >
                إنشاء حساب جديد
              </a>
            </div>
          ) : null}

          {isValidEmail && (
            <>
              <div className="bg-[#17132f] border border-white/10 rounded-2xl p-5 mb-6 text-right space-y-3">
                {[
                  { n: "١", t: "افتح بريدك الإلكتروني" },
                  { n: "٢", t: "ابحث عن رسالة من كرياتيف AI" },
                  { n: "٣", t: "انقر على رابط التحقق" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.n}
                    </div>
                    <span className="text-sm text-slate-300">{s.t}</span>
                  </div>
                ))}
              </div>

              {sent && !error && (
                <div className="bg-emerald-400/10 border border-emerald-300/20 rounded-2xl p-3 mb-4">
                  <p className="text-emerald-300 text-xs font-bold">
                    ✓ تم إرسال الإيميل بنجاح!
                  </p>
                  <p className="text-emerald-300 text-xs mt-1">
                    تحقق من صندوق الوارد أو مجلد Spam
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-400/10 border border-red-300/20 rounded-2xl p-4 mb-4 text-right">
                  <p className="text-red-300 text-xs font-bold mb-1">
                    ⚠️ خطأ في إرسال الإيميل
                  </p>
                  <p className="text-red-300 text-xs">{error}</p>
                  <div className="mt-3 bg-red-300/10 rounded-xl p-3">
                    <p className="text-red-200 text-xs font-bold mb-1">
                      🔑 الحل:
                    </p>
                    <p className="text-red-300 text-xs">
                      تحقق من إعدادات البريد الإلكتروني في Supabase ثم حاول مجددًا.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={sendVerification}
                disabled={sending || countdown > 0}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-950/50 disabled:opacity-50 mb-4"
              >
                {sending
                  ? "جاري الإرسال..."
                  : countdown > 0
                    ? `إعادة الإرسال بعد ${countdown}ث`
                    : sent
                      ? "إعادة إرسال رابط التحقق"
                      : "إرسال رابط التحقق"}
              </button>

              <p className="text-xs text-slate-400 mb-4">
                لم تجد الإيميل؟ تحقق من مجلد Spam أو Promotions
              </p>
            </>
          )}

          <div className="border-t border-white/10 pt-5 flex items-center justify-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-cyan-300 font-bold hover:underline"
            >
              تخطي الآن ←
            </a>
            <span className="text-white/10">|</span>
            <a
              href="/account/signin"
              className="text-sm text-slate-400 hover:text-slate-300"
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
