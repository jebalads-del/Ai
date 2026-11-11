import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { signInWithCredentials, signInWithGoogle } = useAuth();

  // ← اكتشاف أخطاء next-auth من الرابط
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        const msgs = {
          CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          OAuthSignin: "فشل الدخول عبر جوجل، حاول مرة أخرى",
          OAuthCallback: "فشل الدخول عبر جوجل، حاول مرة أخرى",
          OAuthCreateAccount: "لا يمكن إنشاء حساب بهذه الطريقة",
          EmailCreateAccount: "هذا البريد مستخدم بالفعل",
          Callback: "حدث خطأ أثناء تسجيل الدخول",
          AccessDenied: "ليس لديك صلاحية الدخول",
          Configuration: "خطأ في إعدادات النظام",
        };
        setError(msgs[err] || "حدث خطأ، يرجى المحاولة مجدداً");
      }
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      console.error("signin error:", err);
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#080717] p-4 sm:p-6 font-tajawal text-slate-100"
      dir="rtl"
    >
      <div className="w-full max-w-5xl flex rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/50">
        {/* ── اللوحة اليسرى ── */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#11102b] via-[#24205d] to-[#3730a3] p-10 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-cyan-300 opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full bg-violet-300 opacity-15 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg">
                ✨
              </div>
              <span className="text-xl font-bold tracking-tight">
                كرياتيف AI
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-snug mb-4">
              أطلق إبداعك
              <br />
              بقوة الذكاء
              <br />
              الاصطناعي
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
              أنشئ صوراً وفيديوهات مذهلة من وصف نصي بسيط في ثوانٍ.
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            {[
              { icon: "🖼️", text: "إنشاء صور بالذكاء الاصطناعي" },
              { icon: "✏️", text: "تعديل الصور بدقة عالية" },
              { icon: "🎬", text: "إنتاج فيديوهات احترافية" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 bg-white/[0.07] border border-white/10 backdrop-blur rounded-2xl px-4 py-3"
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── نموذج الدخول ── */}
        <div className="flex-1 bg-[#100d25] p-7 sm:p-9 md:p-12 flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white">
              ✨
            </div>
            <span className="text-lg font-bold text-slate-100">كرياتيف AI</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1">
            مرحباً بك مجدداً 👋
          </h1>
          <p className="text-slate-400 text-sm mb-8">سجّل دخولك للمتابعة</p>

          {/* زر جوجل */}
          <button
            type="button"
            onClick={() =>
              signInWithGoogle({ callbackUrl: "/dashboard", redirect: true })
            }
            className="w-full flex items-center justify-center gap-3 border border-white/10 py-3.5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all font-medium text-sm text-slate-200 mb-6 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            المتابعة عبر جوجل
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-400 whitespace-nowrap">
              أو بالبريد الإلكتروني
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form noValidate onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-[#17132f] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent transition-all placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <a
                  href="/account/forgot-password"
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-medium"
                >
                  نسيت كلمة المرور؟
                </a>
                <label className="text-xs font-semibold text-slate-300">
                  كلمة المرور
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-300 bg-red-400/10 border border-red-300/20 p-3 rounded-xl">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-950/50 disabled:opacity-50"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            ليس لديك حساب؟{" "}
            <a
              href="/account/signup"
              className="text-cyan-300 font-bold hover:underline"
            >
              سجّل مجاناً
            </a>
          </p>
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
