import { useState, useEffect } from "react";

import { supabase } from "@/utils/supabase";

function MainComponent() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const finishVerification = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      setStatus(!error && data.session ? "success" : "error");
      if (error || !data.session) {
        setMessage("رابط التحقق غير صالح أو منتهي الصلاحية");
      }
    };
    finishVerification();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) setStatus("success");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#080717] p-4 sm:p-6 font-tajawal text-slate-100"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-[#100d25] rounded-[2rem] border border-white/10 shadow-2xl shadow-indigo-950/50 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-cyan-400 via-indigo-500 to-violet-600" />

        <div className="p-7 sm:p-10 text-center">
          {status === "loading" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/15 to-indigo-500/20 border border-cyan-300/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-cyan-300 spin-anim"
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
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                جاري التحقق...
              </h1>
              <p className="text-slate-400 text-sm">يرجى الانتظار لحظة</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/15 to-cyan-400/15 border border-emerald-300/10 flex items-center justify-center text-5xl mx-auto mb-6">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                تم التحقق بنجاح!
              </h1>
              <p className="text-slate-400 text-sm mb-8">
                تم تأكيد بريدك الإلكتروني. يمكنك الآن الاستمتاع بجميع مميزات
                كرياتيف AI.
              </p>
              <a
                href="/dashboard"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-950/50 text-center"
              >
                الذهاب إلى لوحة التحكم 🚀
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400/15 to-orange-400/10 border border-red-300/10 flex items-center justify-center text-5xl mx-auto mb-6">
                ❌
              </div>
              <h1 className="text-2xl font-bold text-slate-100 mb-2">
                فشل التحقق
              </h1>
              <p className="text-slate-400 text-sm mb-8">{message}</p>
              <a
                href="/account/verify-email-sent"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-950/50 text-center mb-3"
              >
                إعادة إرسال رابط التحقق
              </a>
              <a
                href="/account/signin"
                className="text-sm text-slate-400 hover:text-cyan-300 transition-colors"
              >
                العودة لتسجيل الدخول
              </a>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal { font-family: 'Tajawal', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin-anim { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default MainComponent;
