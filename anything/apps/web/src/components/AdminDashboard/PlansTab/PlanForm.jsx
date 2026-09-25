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
    <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-sm p-6 mb-6">
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleSavePlan}
          disabled={planSaving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
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
