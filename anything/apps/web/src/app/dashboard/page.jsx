import { useState, useEffect, useCallback } from "react";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";
import { useUpload } from "@/utils/useUpload";
import { BillingTab } from "@/components/BillingTab";
import {
  Sparkles,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Download,
  X,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Video,
  Clock,
  Star,
  Shield,
  ChevronLeft,
  Menu,
} from "lucide-react";

export default function UserDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("generate");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generate
  const [prompt, setPrompt] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genStatus, setGenStatus] = useState(""); // حالة التقدم
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);
  const [translatedPrompt, setTranslatedPrompt] = useState(""); // الوصف المترجم
  const [uploadedImage, setUploadedImage] = useState(null);
  const [upload] = useUpload();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);

  // Video generation
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoStatus, setVideoStatus] = useState(""); // حالة التقدم
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [videoImage, setVideoImage] = useState(null);

  // Profile + history
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("فشل تحميل البيانات");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPlans();
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .then((d) => {
          if (d.payment_methods) {
            try {
              setPaymentSettings(JSON.parse(d.payment_methods));
            } catch {}
          }
        })
        .catch(console.error);
    }
  }, [user, fetchProfile, fetchPlans]);

  const handleLogout = () => signOut({ callbackUrl: "/", redirect: true });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenLoading(true);
    setResult(null);
    setGenError(null);
    setTranslatedPrompt("");
    setGenStatus("🌐 جاري ترجمة الوصف للإنجليزية...");
    try {
      // الخطوة 1: ترجمة النص العربي إلى إنجليزي
      const translateRes = await fetch(
        "/integrations/google-gemini-2-5-flash/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: uploadedImage
                  ? "You are an expert at converting Arabic image editing instructions into highly detailed English prompts. Translate the Arabic text to English and describe exactly what changes to make to the image. Return ONLY the English prompt, nothing else."
                  : "You are an expert at converting Arabic image descriptions into highly detailed English prompts for AI image generation. Translate the Arabic text to English and enhance it with artistic details like lighting, style, quality keywords (e.g. 8k, ultra realistic, cinematic, detailed). Return ONLY the English prompt, nothing else.",
              },
              { role: "user", content: prompt.trim() },
            ],
          }),
        },
      );

      let englishPrompt = prompt.trim();
      if (translateRes.ok) {
        const translateData = await translateRes.json();
        const translated =
          translateData?.choices?.[0]?.message?.content?.trim();
        if (translated) {
          englishPrompt = translated;
          setTranslatedPrompt(translated);
        }
      }

      let url = null;

      if (uploadedImage) {
        // ── وضع تعديل الصورة: Nano Banana 2 مع الصورة الأصلية ──
        setGenStatus("🎨 جاري تعديل صورتك...");
        const editRes = await fetch(
          `/integrations/nano-banana/?prompt=${encodeURIComponent(englishPrompt)}&imageUrl=${encodeURIComponent(uploadedImage)}`,
          { method: "GET" },
        );
        if (!editRes.ok) {
          const errText = await editRes.text().catch(() => "");
          throw new Error(`فشل تعديل الصورة (${editRes.status})`);
        }
        const editData = await editRes.json();
        url = editData?.data?.[0];
        if (!url) throw new Error("لم يتم تعديل الصورة، حاول مرة أخرى");
      } else {
        // ── وضع نص إلى صورة: Stable Diffusion ──
        setGenStatus("🎨 جاري إنشاء الصورة...");
        const res = await fetch(
          `/integrations/stable-diffusion-v-3/?prompt=${encodeURIComponent(englishPrompt)}`,
          { method: "GET" },
        );
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`فشل إنشاء الصورة (${res.status})`);
        }
        const data = await res.json();
        url = data?.data?.[0];
        if (!url) throw new Error("لم تُنشأ الصورة، حاول مرة أخرى");
      }

      setResult(url);
      setGenStatus("");

      // تسجيل الاستخدام
      await fetch("/api/log-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image" }),
      });
      fetchProfile();
    } catch (err) {
      setGenError(err.message || "حدث خطأ، حاول مرة أخرى");
      setGenStatus("");
      console.error(err);
    } finally {
      setGenLoading(false);
    }
  };

  const onFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await upload({ file });
    if (url) setUploadedImage(url);
  };

  const onVideoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await upload({ file });
    if (url) setVideoImage(url);
  };

  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true);
    setVideoResult(null);
    setVideoError(null);
    setVideoStatus("🌐 جاري ترجمة الوصف للإنجليزية...");
    try {
      // الخطوة 1: ترجمة الوصف للإنجليزية
      const translateRes = await fetch(
        "/integrations/google-gemini-2-5-flash/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert at creating AI video generation prompts. Translate the Arabic text to English and enhance it with vivid cinematic details (camera movement, lighting, style, mood). Return ONLY the English prompt, nothing else. Keep it under 150 words.",
              },
              { role: "user", content: videoPrompt.trim() },
            ],
          }),
        },
      );

      let englishPrompt = videoPrompt.trim();
      if (translateRes.ok) {
        const translateData = await translateRes.json();
        const translated =
          translateData?.choices?.[0]?.message?.content?.trim();
        if (translated) englishPrompt = translated;
      }

      // الخطوة 2: بدء إنشاء الفيديو
      setVideoStatus("🎬 جاري بدء إنشاء الفيديو...");
      const startRes = await fetch("/api/generate-video/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: englishPrompt }),
      });

      const startData = await startRes.json();
      if (!startRes.ok)
        throw new Error(startData?.error || "فشل بدء إنشاء الفيديو");

      const predictionId = startData?.predictionId;
      if (!predictionId) throw new Error("لم يُستلم معرف الفيديو");

      // الخطوة 3: متابعة الحالة حتى الاكتمال
      setVideoStatus("⏳ جاري معالجة الفيديو (قد يستغرق 2-5 دقائق)...");
      let attempts = 0;
      const maxAttempts = 72; // 6 دقائق كحد أقصى

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(
          `/api/generate-video/status/${predictionId}`,
        );
        const statusData = await statusRes.json();

        if (statusData.status === "succeeded") {
          const url = Array.isArray(statusData.url)
            ? statusData.url[0]
            : statusData.url;
          if (!url) throw new Error("لم يُعاد رابط الفيديو");
          setVideoResult(url);
          setVideoStatus("");
          // ✅ نسجل الاستخدام فقط بعد نجاح الفيديو فعلاً
          await fetch("/api/log-usage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "video" }),
          });
          fetchProfile();
          return;
        } else if (
          statusData.status === "failed" ||
          statusData.status === "canceled"
        ) {
          throw new Error(statusData.error || "فشل إنشاء الفيديو");
        }

        attempts++;
        const elapsed = attempts * 5;
        setVideoStatus(`⏳ جاري المعالجة... (${elapsed} ثانية)`);
      }

      throw new Error("انتهت المهلة — حاول مرة أخرى");
    } catch (err) {
      setVideoError(err.message || "حدث خطأ، حاول مرة أخرى");
      setVideoStatus("");
      console.error(err);
    } finally {
      setVideoLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const usageCount = profile?.usage?.length || 0;
  const tokensLimit = profile?.subscription?.tokens_limit || 5;
  const usagePercent = Math.min(
    100,
    Math.round((usageCount / tokensLimit) * 100),
  );

  // Loading
  if (userLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#F0F2FF]"
        dir="rtl"
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-gray-500 text-sm font-tajawal">جاري التحميل...</p>
        </div>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
          .font-tajawal { font-family: 'Tajawal', sans-serif; }
        `}</style>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/account/signin";
    return null;
  }

  const navItems = [
    { key: "generate", label: "إنشاء صور", icon: Sparkles },
    { key: "video", label: "إنشاء فيديو", icon: Video },
    { key: "history", label: "السجل", icon: LayoutDashboard },
    { key: "billing", label: "الاشتراك", icon: CreditCard },
    { key: "account", label: "الحساب", icon: User },
  ];

  return (
    <div
      className="min-h-screen bg-[#F0F2FF] font-tajawal text-right"
      dir="rtl"
    >
      {/* Sidebar Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white border-l border-gray-100 fixed h-full shadow-sm">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-lg">
            ✨
          </div>
          <span className="text-lg font-bold text-gray-900">كرياتيف AI</span>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name
                ? user.name.charAt(0)
                : user.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">
                {user.name || "مستخدم"}
              </p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === key ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6 space-y-2">
          {/* ✅ Check admin role from profile (not session user) */}
          {profile?.user?.role === "admin" && (
            <a
              href="/admin"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
            >
              <Shield size={18} />
              لوحة الإدارة
            </a>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={22} className="text-gray-600" />
        </button>
        <span className="font-bold text-gray-900">كرياتيف AI</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
          {user.name
            ? user.name.charAt(0)
            : user.email?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-50">
              <span className="font-bold text-gray-900">كرياتيف AI</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-3 bg-indigo-50 rounded-2xl p-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.name
                    ? user.name.charAt(0)
                    : user.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {user.name || "مستخدم"}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === key ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="px-4 pb-6 space-y-2">
              {/* ✅ Mobile admin check uses profile */}
              {profile?.user?.role === "admin" && (
                <a
                  href="/admin"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-indigo-600 bg-indigo-50"
                >
                  <Shield size={18} />
                  لوحة الإدارة
                </a>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
            </div>
          </div>
          <div
            className="flex-1 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <div className="md:mr-64 p-4 md:p-8 pb-24 md:pb-8">
        {/* ─── TAB: إنشاء ─── */}
        {activeTab === "generate" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                أنشئ شيئاً مذهلاً ✨
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                اكتب وصفاً وسيتحول لصورة في ثوانٍ
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUploadedImage(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!uploadedImage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <ImageIcon size={14} /> نص إلى صورة
                </button>
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${uploadedImage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <Video size={14} /> تعديل صورة
                  <input
                    type="file"
                    className="hidden"
                    onChange={onFileUpload}
                    accept="image/*"
                  />
                </label>
              </div>

              {uploadedImage && (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-200">
                  <img
                    src={uploadedImage}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              {uploadedImage && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
                  ✅ تم رفع الصورة — الآن اكتب ما تريد تعديله عليها (مثال: "أزل
                  الخلفية"، "اجعلها ليلية"، "أضف تأثير دخان")
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  uploadedImage
                    ? "مثال: أزل الخلفية، اجعل السماء برتقالية، أضف تأثير ضبابي..."
                    : "مثال: قطة تجلس على مكتب خشبي في غرفة مضاءة بنور ذهبي..."
                }
                rows={4}
                className="w-full bg-[#F8F9FF] border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-gray-300"
              />

              {genError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium">
                  ⚠️ {genError}
                </div>
              )}

              {genStatus && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full flex-shrink-0"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  {genStatus}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={genLoading || !prompt.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {genLoading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                    جاري الإنشاء...
                  </>
                ) : (
                  "✨ أنشئ الآن"
                )}
              </button>

              {translatedPrompt && !genLoading && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1 font-medium">
                    🌐 الوصف المُرسل للنموذج:
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {translatedPrompt}
                  </p>
                </div>
              )}
            </div>

            {result && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">النتيجة ✓</h3>
                  <a
                    href={result}
                    download
                    className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline"
                  >
                    <Download size={14} />
                    تحميل
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <img src={result} className="w-full h-auto" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: إنشاء فيديو ─── */}
        {activeTab === "video" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                أنشئ فيديو مذهل 🎬
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                اكتب وصفاً أو ارفع صورة لتحويلها لفيديو
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVideoImage(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!videoImage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <Video size={14} /> نص إلى فيديو
                </button>
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${videoImage ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <ImageIcon size={14} /> صورة إلى فيديو
                  <input
                    type="file"
                    className="hidden"
                    onChange={onVideoFileUpload}
                    accept="image/*"
                  />
                </label>
              </div>

              {videoImage && (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-200">
                  <img
                    src={videoImage}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setVideoImage(null)}
                    className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="مثال: منظر طبيعي خلاب مع غروب الشمس وحركة الأمواج..."
                rows={4}
                className="w-full bg-[#F8F9FF] border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-gray-300"
              />

              {videoError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs font-medium">
                  {videoError.toLowerCase().includes("credit") ? (
                    <div>
                      <p className="font-bold text-red-700 mb-2">
                        💳 رصيد Replicate غير كافٍ
                      </p>
                      <p className="mb-3 text-red-600 leading-relaxed">
                        إنشاء الفيديو يحتاج رصيداً مدفوعاً في حساب Replicate. اشحن
                        دولاراً واحداً أو أكثر ثم عد وجرب مجدداً.
                      </p>
                      <a
                        href="https://replicate.com/account/billing#billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all"
                      >
                        💳 اشحن رصيد Replicate
                      </a>
                    </div>
                  ) : (
                    <p className="text-red-600">⚠️ {videoError}</p>
                  )}
                </div>
              )}

              {videoStatus && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 font-medium flex items-center gap-2">
                  <div
                    className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full flex-shrink-0"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                  {videoStatus}
                </div>
              )}

              {!videoStatus && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                  ⏱️ إنشاء الفيديو قد يستغرق 2-5 دقائق، يرجى الانتظار...
                </div>
              )}

              <button
                onClick={handleVideoGenerate}
                disabled={videoLoading || !videoPrompt.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white text-sm bg-gradient-to-l from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {videoLoading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                    جاري الإنشاء...
                  </>
                ) : (
                  "🎬 أنشئ الفيديو"
                )}
              </button>
            </div>

            {videoResult && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">النتيجة ✓</h3>
                  <a
                    href={videoResult}
                    download
                    className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:underline"
                  >
                    <Download size={14} />
                    تحميل
                  </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <video
                    src={videoResult}
                    controls
                    className="w-full h-auto"
                    autoPlay
                    loop
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: السجل ─── */}
        {activeTab === "history" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                سجل العمليات 📋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                جميع عمليات الإنشاء التي قمت بها
              </p>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-20">
                <div
                  className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </div>
            ) : profile?.usage?.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  لا يوجد سجل بعد
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  ابدأ بإنشاء أول صورة لك!
                </p>
                <button
                  onClick={() => setActiveTab("generate")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm"
                >
                  ابدأ الإنشاء ✨
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* إحصائية سريعة */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      label: "إجمالي العمليات",
                      value: profile?.usage?.length || 0,
                      icon: "⚡",
                    },
                    {
                      label: "هذا الشهر",
                      value:
                        profile?.usage?.filter(
                          (u) =>
                            new Date(u.created_at).getMonth() ===
                            new Date().getMonth(),
                        ).length || 0,
                      icon: "📅",
                    },
                    { label: "الحد المتاح", value: tokensLimit, icon: "🎯" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center"
                    >
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-xl font-bold text-gray-900">
                        {s.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {profile?.usage?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                          {item.type === "video" ? (
                            <Video size={18} />
                          ) : (
                            <ImageIcon size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            {item.type === "video"
                              ? "إنشاء فيديو"
                              : "إنشاء صورة"}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">
                          ✓ مكتمل
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: الاشتراك ─── */}
        {activeTab === "billing" && (
          <BillingTab
            profile={profile}
            profileLoading={profileLoading}
            plans={plans}
            fetchProfile={fetchProfile}
          />
        )}

        {/* ─── TAB: الحساب ─── */}
        {activeTab === "account" && (
          <div className="max-w-xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                إعدادات الحساب 👤
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                معلوماتك الشخصية وأمان حسابك
              </p>
            </div>

            {/* بطاقة المعلومات */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {user.name
                    ? user.name.charAt(0)
                    : user.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {user.name || "مستخدم"}
                  </h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">الاسم</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {user.name || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    {profile?.user?.emailVerified ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-amber-500" />
                    )}
                    <div>
                      <p className="text-xs text-gray-400">حالة البريد</p>
                      <p
                        className={`font-semibold text-sm ${profile?.user?.emailVerified ? "text-green-600" : "text-amber-600"}`}
                      >
                        {profile?.user?.emailVerified
                          ? "✓ مُتحقق منه"
                          : "⚠ غير مُتحقق"}
                      </p>
                    </div>
                  </div>
                  {!profile?.user?.emailVerified && (
                    <a
                      href="/account/verify-email-sent"
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      تحقق الآن
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* الأمان */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-5">
              <h3 className="font-bold text-gray-900 mb-4">🔒 الأمان</h3>
              <a
                href="/account/forgot-password"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 text-sm">
                    تغيير كلمة المرور
                  </span>
                </div>
                <ChevronLeft size={16} className="text-gray-400" />
              </a>
            </div>

            {/* تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl font-bold text-red-600 text-sm border-2 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-30 shadow-lg">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${activeTab === key ? "text-indigo-600" : "text-gray-400"}`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        ))}
      </div>

      {/* ── نافذة الدفع ── */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-l from-indigo-600 to-violet-600" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    الترقية إلى {selectedPlan.name}
                  </h3>
                  <p className="text-indigo-600 font-bold">
                    ${selectedPlan.price}/شهر — {selectedPlan.tokens_limit}{" "}
                    عملية
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {!paymentSettings ||
              (!paymentSettings.paypal &&
                !paymentSettings.western_union &&
                !paymentSettings.bank_iban) ? (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                  <p className="text-amber-700 font-bold text-sm mb-1">
                    ⚠️ طرق الدفع غير مفعّلة
                  </p>
                  <p className="text-amber-600 text-xs">
                    يرجى التواصل مع الإدارة لإتمام عملية الدفع
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-4">
                    اختر طريقة الدفع المناسبة وأرسل لنا إشعار الدفع:
                  </p>

                  {paymentSettings.paypal && (
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🅿️</span>
                        <span className="font-bold text-gray-900 text-sm">
                          PayPal
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        أرسل المبلغ إلى:
                      </p>
                      <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center justify-between">
                        <span className="text-sm font-mono font-bold text-gray-800">
                          {paymentSettings.paypal}
                        </span>
                        <button
                          onClick={() => {
                            if (typeof navigator !== "undefined")
                              navigator.clipboard?.writeText(
                                paymentSettings.paypal,
                              );
                          }}
                          className="text-xs text-indigo-600 font-bold"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentSettings.western_union && (
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🌐</span>
                        <span className="font-bold text-gray-900 text-sm">
                          Western Union
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                        {paymentSettings.western_union}
                      </p>
                    </div>
                  )}

                  {paymentSettings.bank_iban && (
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🏦</span>
                        <span className="font-bold text-gray-900 text-sm">
                          التحويل البنكي
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {paymentSettings.bank_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">البنك</span>
                            <span className="font-bold text-gray-800">
                              {paymentSettings.bank_name}
                            </span>
                          </div>
                        )}
                        {paymentSettings.bank_account_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">اسم الحساب</span>
                            <span className="font-bold text-gray-800">
                              {paymentSettings.bank_account_name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mt-1">
                          <span className="font-mono font-bold text-gray-800 text-xs">
                            {paymentSettings.bank_iban}
                          </span>
                          <button
                            onClick={() => {
                              if (typeof navigator !== "undefined")
                                navigator.clipboard?.writeText(
                                  paymentSettings.bank_iban,
                                );
                            }}
                            className="text-xs text-indigo-600 font-bold mr-2"
                          >
                            نسخ
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-indigo-50 rounded-2xl p-3 text-center">
                    <p className="text-xs text-indigo-700 font-medium">
                      بعد إتمام الدفع، تواصل معنا مع إشعار الدفع لتفعيل اشتراكك
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal { font-family: 'Tajawal', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
