import { useState, useEffect } from "react";

import { supabase } from "@/utils/supabase";

function MainComponent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setError("رابط إعادة التعيين غير صالح أو منتهي الصلاحية");
      }
      setReady(Boolean(data.session) && !error);
    });
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
    "bg-cyan-400",
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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
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
      className="min-h-screen w-full flex items-center justify-center bg-[#080717] p-4 sm:p-6 font-tajawal text-slate-100"
      dir="rtl"
    >
      <div className="w-full max-w-5xl flex rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/50">
        {/* ── Left Brand Panel ── */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#11102b] via-[#24205d] to-[#3730a3] p-10 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-cyan-300 opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full bg-violet-300 opacity-15 blur-3xl pointer-events-none" />

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
            <p className="text-indigo-100 text-sm leading-relaxed">
              كلمة المرور القوية تحمي حسابك وجميع إبداعاتك.
            </p>
          </div>

          <div className="relative z-10 bg-white/[0.07] border border-white/10 backdrop-blur rounded-2xl p-5">
            <p className="text-sm font-semibold mb-3">نصائح لكلمة مرور قوية:</p>
            <ul className="space-y-2 text-sm text-indigo-100">
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
        <div className="flex-1 bg-[#100d25] p-7 sm:p-9 md:p-12 flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white">
              ✨
            </div>
            <span className="text-lg font-bold text-slate-100">كرياتيف AI</span>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/15 to-cyan-400/15 border border-emerald-300/10 flex items-center justify-center text-4xl mx-auto mb-6">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-3">
                تم تغيير كلمة المرور!
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة بأمان.
              </p>
              <a
                href="/account/signin"
                className="block w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-950/50 text-center"
              >
                تسجيل الدخول الآن
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-100 mb-1">
                تعيين كلمة مرور جديدة 🔒
              </h1>
              <p className="text-slate-400 text-sm mb-8">
                أدخل كلمة المرور الجديدة الخاصة بك
              </p>

              <form noValidate onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      className="w-full bg-[#17132f] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
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
                            className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-white/10"}`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-xs ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-300" : strength <= 3 ? "text-cyan-300" : "text-emerald-300"}`}
                      >
                        قوة كلمة المرور: {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      className={`w-full bg-[#17132f] border rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent transition-all placeholder:text-slate-500 ${confirmPassword && password !== confirmPassword ? "border-red-300" : "border-white/10"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                    >
                      {showConfirm ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-emerald-300 mt-1">
                      ✓ كلمتا المرور متطابقتان
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-300 bg-red-400/10 border border-red-300/20 p-3 rounded-xl">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-950/50 disabled:opacity-50"
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
