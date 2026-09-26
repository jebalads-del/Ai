export function StatsCards({ stats }) {
  const cards = [
    {
      label: "إجمالي المستخدمين",
      value: stats.total,
      icon: "👥",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "البريد المُتحقق",
      value: stats.verified,
      icon: "✅",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "الإيرادات",
      value: `$${Number(stats.totalRevenue || 0).toFixed(0)}`,
      icon: "💰",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "استخدام اليوم",
      value: stats.todayUsage,
      icon: "⚡",
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-0">
      {cards.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}
          >
            {s.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
