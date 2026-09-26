import { useState } from "react";

export function UpgradeModal({ user, plans, onClose, onSuccess, showToast }) {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/upgrade-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.userId,
          plan_id: selectedPlan,
          notify,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(
        `✅ تم تفعيل خطة ${data.plan} لـ ${user.userName || user.userEmail}`,
      );
      onSuccess();
      onClose();
    } catch (e) {
      showToast("فشل: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-l from-indigo-600 to-violet-600" />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                🔼 ترقية الاشتراك
              </h3>
              <p className="text-gray-500 text-sm mt-0.5 truncate max-w-[260px]">
                {user.userName || user.userEmail}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Plans */}
          <div className="space-y-2.5 mb-5">
            <p className="text-xs font-bold text-gray-500 mb-3">
              اختر الخطة للتفعيل الفوري
            </p>
            {plans.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">لا توجد خطط متاحة</p>
                <a
                  href="/admin"
                  className="text-indigo-600 text-xs underline mt-1 block"
                >
                  أضف خطة من تبويب الخطط
                </a>
              </div>
            ) : (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-right ${selectedPlan === plan.id ? "border-indigo-500 bg-indigo-50/70" : "border-gray-100 hover:border-gray-200 bg-gray-50/50"}`}
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {plan.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {plan.tokens_limit} عملية شهرياً
                    </p>
                  </div>
                  <div className="text-left flex items-center gap-2">
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-none">
                        ${plan.price}
                      </p>
                      <p className="text-xs text-gray-400 text-left">/شهر</p>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Notify toggle */}
          <label className="flex items-center gap-3 mb-6 p-3.5 bg-amber-50 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                📧 إشعار المستخدم بالإيميل
              </p>
              <p className="text-xs text-amber-600">
                سيتلقى إيميلاً بتفعيل الاشتراك
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={!selectedPlan || loading}
              className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />{" "}
                  جاري التفعيل...
                </>
              ) : (
                "✅ تفعيل الاشتراك فوراً"
              )}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
