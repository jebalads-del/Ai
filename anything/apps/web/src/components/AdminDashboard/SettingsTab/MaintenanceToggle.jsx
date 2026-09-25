export function MaintenanceToggle({ settings, setSettings, handleSave }) {
  const handleToggle = () => {
    const v = settings.site_maintenance === "true" ? "false" : "true";
    setSettings((s) => ({ ...s, site_maintenance: v }));
    handleSave("site_maintenance", v);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <div>
        <p className="font-semibold text-sm text-gray-800">وضع الصيانة</p>
        <p className="text-xs text-gray-400 mt-0.5">إيقاف جميع عمليات الموقع</p>
      </div>
      <button
        onClick={handleToggle}
        className={`w-12 h-6 rounded-full transition-all relative ${settings.site_maintenance === "true" ? "bg-red-500" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.site_maintenance === "true" ? "left-1" : "right-1"}`}
        />
      </button>
    </div>
  );
}
