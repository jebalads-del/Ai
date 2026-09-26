export function Header() {
  return (
    <div className="bg-gradient-to-l from-[#1E1B4B] to-[#4F46E5] text-white px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          ✨
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">كرياتيف AI</h1>
          <p className="text-indigo-200 text-xs">لوحة تحكم الإدارة</p>
        </div>
      </div>
      <a
        href="/dashboard"
        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl"
      >
        ← الموقع
      </a>
    </div>
  );
}
