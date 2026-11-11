export function PlanForm({
  planForm,
  setPlanForm,
  editingPlan,
  planSaving,
  handleSavePlan,
  resetPlanForm,
}) {
  const fields = [
    {
      label: "اسم الخطة *",
      key: "name",
      placeholder: "مثال: الخطة المميزة",
      type: "text",
    },
    {
      label: "السعر الشهري ($) *",
      key: "price",
      placeholder: "19.99",
      type: "number",
    },
    {
      label: "عدد العمليات الشهرية *",
      key: "tokens_limit",
      placeholder: "100",
      type: "number",
    },
    {
      label: "الوصف (اختياري)",
      key: "description",
      placeholder: "وصف مختصر",
      type: "text",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-[0_12px_32px_rgba(49,46,129,0.07)] p-5 sm:p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-5">
        {editingPlan ? "✏️ تعديل الخطة" : "➕ إضافة خطة جديدة"}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              {f.label}
            </label>
            <input
              type={f.type}
              value={planForm[f.key]}
              onChange={(e) =>
                setPlanForm((p) => ({ ...p, [f.key]: e.target.value }))
              }
              placeholder={f.placeholder}
              className="w-full bg-[#F8F8FC] border border-violet-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-shadow"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleSavePlan}
          disabled={planSaving}
          className="bg-gradient-to-l from-[#312E81] to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:to-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition-all"
        >
          {planSaving
            ? "جاري الحفظ..."
            : editingPlan
              ? "💾 حفظ التعديل"
              : "✅ إضافة"}
        </button>
        <button
          onClick={resetPlanForm}
          className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
