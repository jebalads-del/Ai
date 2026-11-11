export function FreeTierLimit({
  settings,
  setSettings,
  savingKey,
  handleSave,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        حد الخطة المجانية (عمليات شهرياً)
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={settings.free_tier_limit || "5"}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              free_tier_limit: e.target.value,
            }))
          }
          className="min-w-0 flex-1 bg-[#F8F8FC] border border-violet-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
        />
        <button
          onClick={() =>
            handleSave("free_tier_limit", settings.free_tier_limit)
          }
          disabled={savingKey === "free_tier_limit"}
          className="bg-gradient-to-l from-[#312E81] to-indigo-600 text-white px-5 rounded-xl text-sm font-bold hover:to-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition-all"
        >
          {savingKey === "free_tier_limit" ? "..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}
