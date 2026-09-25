export function TabNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "users", label: "👥 المستخدمون" },
    { key: "subrequests", label: "📩 طلبات الترقية" },
    { key: "plans", label: "📦 الخطط" },
    { key: "payment", label: "💳 طرق الدفع" },
    { key: "settings", label: "⚙️ الإعدادات" },
  ];

  return (
    <div className="px-6 pt-6">
      <div className="flex flex-wrap gap-1.5 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.key ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
