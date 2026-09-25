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
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() =>
            handleSave("free_tier_limit", settings.free_tier_limit)
          }
          disabled={savingKey === "free_tier_limit"}
          className="bg-indigo-600 text-white px-5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {savingKey === "free_tier_limit" ? "..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}
