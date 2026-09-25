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
      icon: <Sparkles className="text-blue-600" size={24} />,
      badge: "جديد",
    },
    {
      title: "تعديل الصور بالذكاء الاصطناعي",
      description: "أضف عناصر أو غير الخلفيات بضغطة زر واحدة.",
      icon: <ImageIcon className="text-blue-600" size={24} />,
    },
    {
      title: "تحويل النص إلى فيديو",
      description: "اصنع فيديوهات سينمائية من مجرد وصف نصي بسيط.",
      icon: <VideoIcon className="text-blue-600" size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-right" dir="rtl">
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      {/* Navigation */}
      <nav
        aria-label="التنقل الرئيسي"
        className="border-b border-gray-200 sticky top-0 bg-white z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                كرياتيف AI
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a
                href="#features"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                المميزات
              </a>
              <a
                href="#pricing"
                className="text-gray-500 hover:text-gray-900 transition-colors"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  لوحة التحكم
                </a>
              ) : (
                <div className="flex items-center gap-4">
                  <a
                    href="/account/signin"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    تسجيل الدخول
                  </a>
                  <a
                    href="/account/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ابدأ مجاناً
                  </a>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500"
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
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-6 space-y-4">
          <a href="#features" className="block text-gray-900 font-medium">
            المميزات
          </a>
          <a href="#pricing" className="block text-gray-900 font-medium">
            الأسعار
          </a>
          {user ? (
            <a href="/dashboard" className="block text-blue-600 font-medium">
              لوحة التحكم
            </a>
          ) : (
            <>
              <a
                href="/account/signin"
                className="block text-gray-900 font-medium"
              >
                تسجيل الدخول
              </a>
              <a
                href="/account/signup"
                className="block text-blue-600 font-medium"
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
          className="py-20 px-4 bg-[#F9FAFB]"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium mb-8">
              <Sparkles size={14} />
              <span>مدعوم بأحدث تقنيات الذكاء الاصطناعي DALL-E 3</span>
            </div>
            <h1
              id="hero-heading"
              className="text-4xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight"
            >
              حول خيالك إلى <span className="text-blue-600">واقع بصري</span>{" "}
              مذهل
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              أنشئ الصور، عدل التصاميم، واصنع فيديوهات احترافية في ثوانٍ باستخدام
              أقوى أدوات الذكاء الاصطناعي. ابدأ رحلتك الإبداعية اليوم مجاناً.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/account/signup"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                ابدأ تجربتك المجانية
                <ArrowRight size={20} className="rotate-180" />
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto border border-gray-200 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
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
          className="py-24 px-4 bg-white"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                id="features-heading"
                className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight"
              >
                أدوات إبداعية متكاملة
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                كل ما تحتاجه للإنتاج البصري في منصة واحدة سهلة الاستخدام.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <article
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 p-8 hover:border-gray-300 transition-all"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    {feature.badge && (
                      <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 leading-relaxed text-sm">
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
          className="py-24 px-4 bg-[#F9FAFB] border-t border-gray-200"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2
              id="pricing-heading"
              className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight"
            >
              خطط تناسب طموحك
            </h2>
            <p className="text-gray-500 mb-16">
              اختر الخطة المناسبة وابدأ في الإبداع فوراً.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-start text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  التجريبية
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900">
                    0
                  </span>
                  <span className="text-gray-500 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة المجانية"
                >
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> 5 أجيال صور
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> جودة قياسية
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> دعم مجتمعي
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full border border-gray-200 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all text-center"
                >
                  ابدأ مجاناً
                </a>
              </div>

              {/* Pro */}
              <div className="bg-white rounded-xl border-2 border-blue-600 p-8 flex flex-col items-start text-right relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  الأكثر طلباً
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                  المميزة
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900">
                    19
                  </span>
                  <span className="text-gray-500 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة المميزة"
                >
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> 100 جيل شهرياً
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> جودة 4K مذهلة
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> أولوية في
                    المعالجة
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> دعم فني 24/7
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-all text-center"
                >
                  اشترك الآن
                </a>
              </div>

              {/* Ultimate */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-start text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  غير المحدودة
                </span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-semibold text-gray-900">
                    49
                  </span>
                  <span className="text-gray-500 text-sm">$/شهرياً</span>
                </div>
                <ul
                  className="space-y-4 mb-8 w-full"
                  aria-label="مزايا الخطة غير المحدودة"
                >
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> أجيال غير
                    محدودة
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> تحكم كامل
                    بالواجهة البرمجية
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-gray-400 ml-2">✓</span> مدير حساب مخصص
                  </li>
                </ul>
                <a
                  href="/account/signup"
                  className="w-full border border-gray-200 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all text-center"
                >
                  تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 bg-white text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Sparkles className="text-white" size={14} />
            </div>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              كرياتيف AI
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            © 2026 كرياتيف AI — منصة إنشاء الصور بالذكاء الاصطناعي. جميع الحقوق
            محفوظة.
          </p>
          <nav
            aria-label="روابط التذييل"
            className="flex items-center justify-center gap-6 text-sm font-medium"
          >
            <a
              href="/sitemap.xml"
              className="text-gray-400 hover:text-gray-600"
            >
              خريطة الموقع
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              الشروط والأحكام
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
