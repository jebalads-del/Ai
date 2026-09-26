export function PlansList({
  plans,
  plansLoading,
  deletingPlanId,
  startEditPlan,
  handleDeletePlan,
}) {
  if (plansLoading) {
    return (
      <div className="text-center py-12 text-gray-400">⏳ جاري التحميل...</div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
        <div className="text-5xl mb-3">📦</div>
        <p className="text-gray-500">لا توجد خطط — أضف خطة جديدة الآن</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900">{plan.name}</h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => startEditPlan(plan)}
                className="text-indigo-600 text-xs border border-indigo-100 px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 font-bold"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDeletePlan(plan.id)}
                disabled={deletingPlanId === plan.id}
                className="text-red-400 text-xs border border-red-100 px-2.5 py-1.5 rounded-xl hover:bg-red-50"
              >
                {deletingPlanId === plan.id ? "..." : "حذف"}
              </button>
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 mb-1">
            ${plan.price}
            <span className="text-sm font-normal text-gray-400">/شهر</span>
          </p>
          <p className="text-sm text-indigo-600 font-bold mb-2">
            {plan.tokens_limit} عملية شهرياً
          </p>
          {plan.description && (
            <p className="text-xs text-gray-400">{plan.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
