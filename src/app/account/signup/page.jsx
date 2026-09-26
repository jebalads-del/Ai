import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);

  const { signUpWithCredentials, signInWithGoogle } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("البريد الإلكتروني غير صحيح ← مثال صحيح: name@gmail.com");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/account/verify-email-sent",
        redirect: true,
      });
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الحساب. قد يكون البريد مستخدماً بالفعل.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#F0F2FF] p-4 font-tajawal"
      dir="rtl"
    >
      <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200">
        {/* Left Brand Panel */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-gradient-to-br from-[#1E1B4B] via-[#3730A3] to-[#4F46E5] p-10 text-white relative overflow-hidden">
          <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#818CF8] opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] right-[-40px] w-48 h-48 rounded-full bg-[#C7D2FE] opacity-10 blur-3xl pointer-events-none" />
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
              ابدأ رحلتك
              <br />
              الإبداعية
              <br />
              اليوم مجاناً
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              انضم لآلاف المبدعين الذين يستخدمون كرياتيف AI لإنتاج محتوى مذهل.
            </p>
          </div>
          <div className="relative z-10 space-y-3">
            {[
              { icon: "🎁", text: "تجربة مجانية بدون بطاقة" },
              { icon: "⚡", text: "نتائج فورية في ثوانٍ" },
              { icon: "🔒", text: "بيانات آمنة ومشفّرة" },
              { icon: "🌍", text: "دعم كامل للغة العربية" },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3"
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
              ✨
            </div>
            <span className="text-lg font-bold text-gray-900">كرياتيف AI</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            إنشاء حساب جديد ✨
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            ابدأ مجاناً، لا حاجة لبطاقة ائتمانية
          </p>

          <button
            type="button"
            onClick={() =>
              signInWithGoogle({ callbackUrl: "/dashboard", redirect: true })
            }
            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3.5 rounded-2xl hover:bg-gray-50 transition-all font-medium text-sm text-gray-700 mb-6 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
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
            التسجيل عبر جوجل
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              أو بالبريد الإلكتروني
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form noValidate onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="محمد أحمد"
                className="w-full bg-[#F8F9FF] border border-[#E2E8F0] rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-300"
              />
            </div>
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
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                كلمة المرور
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
              className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? "جاري الإنشاء..." : "ابدأ الآن مجاناً 🚀"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              بالتسجيل أنت توافق على{" "}
              <span className="text-indigo-600 cursor-pointer">
                شروط الاستخدام
              </span>{" "}
              و{" "}
              <span className="text-indigo-600 cursor-pointer">
                سياسة الخصوصية
              </span>
            </p>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            لديك حساب بالفعل؟{" "}
            <a
              href="/account/signin"
              className="text-indigo-600 font-bold hover:underline"
            >
              سجّل دخولك
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
