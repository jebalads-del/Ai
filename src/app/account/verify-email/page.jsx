"use client";
import { useState, useEffect } from "react";

function MainComponent() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) {
        setStatus("error");
        setMessage("رابط التحقق غير صالح");
        return;
      }
      verifyEmail(token);
    }
  }, []);

  const verifyEmail = async (token) => {
    try {
      const res = await fetch(`/api/verify-email?token=${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل التحقق");
      }
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "رابط التحقق غير صالح أو منتهي الصلاحية");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F0F2FF] p-4 font-tajawal"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-l from-indigo-600 to-violet-600" />

        <div className="p-10 text-center">
          {status === "loading" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-indigo-600 spin-anim"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                جاري التحقق...
              </h1>
              <p className="text-gray-400 text-sm">يرجى الانتظار لحظة</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-5xl mx-auto mb-6">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                تم التحقق بنجاح!
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                تم تأكيد بريدك الإلكتروني. يمكنك الآن الاستمتاع بجميع مميزات
                كرياتيف AI.
              </p>
              <a
                href="/dashboard"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 text-center"
              >
                الذهاب إلى لوحة التحكم 🚀
              </a>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-5xl mx-auto mb-6">
                ❌
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                فشل التحقق
              </h1>
              <p className="text-gray-400 text-sm mb-8">{message}</p>
              <a
                href="/account/verify-email-sent"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 text-center mb-3"
              >
                إعادة إرسال رابط التحقق
              </a>
              <a
                href="/account/signin"
                className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
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
