import React, { useState, useEffect } from "react";
import { useUser } from "@/utils/useUser";
import {
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // جلب صلاحية الأدمن
  useEffect(() => {
    if (user) {
      fetch("/api/user/profile")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user?.role === "admin") setIsAdmin(true);
        })
        .catch(() => {});
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    document.title = "كرياتيف AI — إنشاء صور احترافية بالذكاء الاصطناعي";
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        "منصة كرياتيف AI لإنشاء الصور وتعديلها بتقنية DALL-E 3. حوّل أفكارك لصور مذهلة في ثوانٍ. ابدأ مجاناً اليوم!",
      );
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "كرياتيف AI",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    description:
      "منصة إنشاء الصور بالذكاء الاصطناعي — حوّل أفكارك لصور مذهلة في ثوانٍ باستخدام DALL-E 3",
    inLanguage: "ar",
    offers: [
      {
        "@type": "Offer",
        name: "الخطة المجانية",
        price: "0",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "الخطة المميزة",
        price: "19",
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "الخطة غير المحدودة",
        price: "49",
        priceCurrency: "USD",
      },
    ],
  };

  const features = [
    {
      title: "إنشاء الصور من الوصف",
      description: "حول كلماتك إلى لوحات فنية مذهلة في ثوانٍ معدودة.",
      icon: <Sparkles className="text-cyan-300" size={24} />,
      badge: "جديد",
    },
    {
      title: "تعديل الصور بالذكاء الاصطناعي",
      description: "أضف عناصر أو غير الخلفيات بضغطة زر واحدة.",
      icon: <ImageIcon className="text-cyan-300" size={24} />,
    },
    {
      title: "تحويل النص إلى فيديو",
      description: "اصنع فيديوهات سينمائية من مجرد وصف نصي بسيط.",
      icon: <VideoIcon className="text-cyan-300" size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080717] font-sans text-right text-slate-100" dir="rtl">
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      {/* Navigation */}
      <nav
        aria-label="التنقل الرئيسي"
        className="border-b border-white/10 sticky top-0 bg-[#080717]/90 backdrop-blur-xl z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-xl shadow-lg shadow-indigo-950/40 flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <span className="text-xl font-semibold text-slate-100 tracking-tight">
                كرياتيف AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a
                href="#features"
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                المميزات
              </a>
              <a
                href="#pricing"
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                الأسعار
              </a>
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center gap-1.5 text-purple-600 font-bold hover:text-purple-700 transition-colors"
                >
                  ⚙️ لوحة الإدارة
                </a>
              )}
              {user ? (
                <a
                  href="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  لوحة التحكم
                </a>
              ) : (
                <div className="flex items-center gap-4">
                  <a
                    href="/account/signin"
                    className="text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    تسجيل الدخول
                  </a>
                  <a
                    href="/account/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
                  >
                    ابدأ مجاناً
                  </a>
                </div>
              )}
            </div>

            <div className="md:hidden order-first">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-400"
                aria-label="فتح القائمة"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#100d25] px-4 py-6 space-y-4">
          <a href="#features" className="block text-slate-100 font-medium">
            المميزات
          </a>
          <a href="#pricing" className="block text-slate-100 font-medium">
            الأسعار
          </a>
          {user ? (
            <a href="/dashboard" className="block text-cyan-300 font-medium">
              لوحة التحكم
            </a>
          ) : (
            <>
              <a
                href="/account/signin"
                className="block text-slate-100 font-medium"
              >
                تسجيل الدخول
              </a>
              <a
                href="/account/signup"
                className="block text-cyan-300 font-medium"
              >
                ابدأ مجاناً
              </a>
            </>
          )}
          {isAdmin && (
            <a href="/admin" className="block text-purple-600 font-bold">
              ⚙️ لوحة الإدارة
            </a>
          )}
        </div>
      )}

      {/* Main */}
      <main>
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="relative isolate overflow-hidden px-4 py-16 md:py-20"
        >
          <div className="absolute inset-0 -z-10">
            <img
              src="https://images.pexels.com/photos/29419772/pexels-photo-29419772.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt=""
              className="h-full w-full object-cover opacity-75"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080717]/25 via-[#080717]/35 to-[#080717]/95" />
          </div>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/15 bg-[#080717]/60 px-3 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-sm">
              <Sparkles size={14} />
              <span>مدعوم بأحدث تقنيات الذكاء الاصطناعي DALL-E 3</span>
            </div>
            <h1
              id="hero-heading"
              className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-100 md:text-6xl"
            >
              حول خيالك إلى <span className="text-cyan-300">واقع بصري</span>{" "}
              مذهل
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-300">
              أنشئ الصور، عدل التصاميم، واصنع فيديوهات احترافية في ثوانٍ باستخدام
              أقوى أدوات الذكاء الاصطناعي. ابدأ رحلتك الإبداعية اليوم مجاناً.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/account/signup"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-cyan-500 to-indigo-600 px-8 py-4 font-semibold text-white transition-all hover:from-cyan-400 hover:to-indigo-500 sm:w-auto"
              >
                ابدأ تجربتك المجانية
                <ArrowRight size={20} className="rotate-180" />
              </a>
              <a
                href="#features"
                className="w-full rounded-xl border border-white/10 bg-[#100d25]/80 px-8 py-4 font-semibold text-slate-100 transition-all hover:bg-white/10 sm:w-auto"
              >
                استكشف المميزات
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="py-24 px-4 bg-[#080717]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                id="features-heading"
                className="text-3xl font-semibold text-slate-100 mb-4 tracking-tight"
              >
                أدوات إبداعية متكاملة
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                كل ما تحتاجه للإنتاج البصري في منصة واحدة سهلة الاستخدام.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <article
                  key={idx}
                  className="bg-gradient-to-b from-white/[0.045] to-transparent rounded-2xl border border-white/10 p-8 hover:border-cyan-300/30 hover:-translate-y-1 transition-all"
                >
                  <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-slate-100">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <span className="bg-cyan-400/10 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-300/20">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className="py-24 px-4 bg-[#0b0920] border-t border-white/10"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2
              id="pricing-heading"
              className="text-3xl font-semibold text-slate-100 mb-4 tracking-tight"
            >
              خطط تناسب طموحك
            </h2>
            <p className="text-slate-400 mb-16">
              اختر الخطة المناسبة وابدأ في الإبداع فوراً.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="bg-[#100d25] rounded-2xl border border-white/10 p-8 flex flex-col items-start text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  التجريبية
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-slate-100">
                    0
                  </span>
                  <span className="text-slate-400 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة المجانية"
                >
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> 5 أجيال صور
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> جودة قياسية
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> دعم مجتمعي
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full border border-white/10 text-slate-100 py-3 rounded-xl font-medium hover:bg-white/5 transition-all text-center"
                >
                  ابدأ مجاناً
                </a>
              </div>

              {/* Pro */}
              <div className="bg-gradient-to-b from-indigo-950/70 to-[#100d25] rounded-2xl border border-indigo-400/60 p-8 flex flex-col items-start text-right relative shadow-xl shadow-indigo-950/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  الأكثر طلباً
                </div>
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                  المميزة
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-slate-100">
                    19
                  </span>
                  <span className="text-slate-400 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة المميزة"
                >
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> 100 جيل شهرياً
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> جودة 4K مذهلة
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> أولوية في
                    المعالجة
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> دعم فني 24/7
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full bg-gradient-to-l from-cyan-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-cyan-400 hover:to-indigo-500 transition-all text-center"
                >
                  اشترك الآن
                </a>
              </div>

              {/* Ultimate */}
              <div className="bg-[#100d25] rounded-2xl border border-white/10 p-8 flex flex-col items-start text-right">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  غير المحدودة
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-slate-100">
                    49
                  </span>
                  <span className="text-slate-400 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة غير المحدودة"
                >
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> أجيال غير
                    محدودة
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> تحكم كامل
                    بالواجهة البرمجية
                  </li>
                  <li className="flex items-center text-sm text-slate-300">
                    <span className="text-slate-500 ml-2">✓</span> مدير حساب مخصص
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full border border-white/10 text-slate-100 py-3 rounded-xl font-medium hover:bg-white/5 transition-all text-center"
                >
                  تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-[#100d25] text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={14} />
            </div>
            <span className="text-lg font-semibold text-slate-100 tracking-tight">
              كرياتيف AI
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            © 2026 كرياتيف AI — منصة إنشاء الصور بالذكاء الاصطناعي. جميع الحقوق
            محفوظة.
          </p>
          <nav
            aria-label="روابط التذييل"
            className="flex items-center justify-center gap-6 text-sm font-medium"
          >
            <a
              href="/sitemap.xml"
              className="text-slate-500 hover:text-slate-300"
            >
              خريطة الموقع
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-100">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-100">
              الشروط والأحكام
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
