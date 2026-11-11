export function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "users", label: "👥 المستخدمون" },
    { key: "subrequests", label: "📩 طلبات الترقية" },
    { key: "plans", label: "📦 الخطط" },
    { key: "payment", label: "💳 طرق الدفع" },
    { key: "settings", label: "⚙️ الإعدادات" },
  ];

  return (
    <div className="px-4 sm:px-7 pt-5 sm:pt-7 max-w-[1800px] mx-auto">
      <div className="flex flex-wrap gap-1.5 mb-6 bg-white rounded-2xl p-1.5 border border-violet-100 shadow-sm w-full sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === t.key ? "bg-gradient-to-l from-[#312E81] to-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-indigo-800 hover:bg-violet-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
