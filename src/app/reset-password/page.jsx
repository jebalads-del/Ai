import { useState, useEffect } from "react";

function MainComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("token");
      if (t) setToken(t);
      else setError("رابط إعادة التعيين غير صالح أو منتهي الصلاحية");
    }
  }, []);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "ضعيفة", "مقبولة", "جيدة", "قوية"][strength];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-400",
  ][strength];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
              اختر كلمة
              <br />
              مرور آمنة
              <br />
              وقوية
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              كلمة المرور القوية تحمي حسابك وجميع إبداعاتك.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5">
            <p className="text-sm font-semibold mb-3">نصائح لكلمة مرور قوية:</p>
            <ul className="space-y-2 text-sm text-indigo-200">
              <li className="flex items-center gap-2">
                <span>✓</span> 8 أحرف على الأقل
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> أحرف كبيرة وصغيرة
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> أرقام ورموز
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> لا تستخدم معلوماتك الشخصية
              </li>
            </ul>
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-4xl mx-auto mb-6">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                تم تغيير كلمة المرور!
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة بأمان.
              </p>
              <a
                href="/account/signin"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 text-center"
              >
                تسجيل الدخول الآن
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                تعيين كلمة مرور جديدة 🔒
              </h1>
              <p className="text-gray-400 text-sm mb-8">
                أدخل كلمة المرور الجديدة الخاصة بك
              </p>

              <form noValidate onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      className="w-full bg-[#F8F9FF] border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      {showPass ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-100"}`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-600" : strength <= 3 ? "text-blue-600" : "text-green-600"}`}
                      >
                        قوة كلمة المرور: {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      className={`w-full bg-[#F8F9FF] border rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300 ${confirmPassword && password !== confirmPassword ? "border-red-300" : "border-[#E2E8F0]"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      {showConfirm ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ كلمتا المرور متطابقتان
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
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
                      جاري الحفظ...
                    </span>
                  ) : (
                    "تعيين كلمة المرور الجديدة"
                  )}
                </button>
              </form>
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
