import { useState, useCallback } from "react";

export function BillingTab({ profile, profileLoading, plans, fetchProfile }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [checkingReq, setCheckingReq] = useState(false);

  // جلب الطلب المعلق عند تغيير البروفايل
  const checkPendingRequest = useCallback(async () => {
    setCheckingReq(true);
    try {
      const res = await fetch("/api/subscription-request");
      if (res.ok) {
        const data = await res.json();
        if (data.request?.status === "pending") {
          setPendingRequest(data.request);
        } else {
          setPendingRequest(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingReq(false);
    }
  }, []);

  useState(() => {
    checkPendingRequest();
  });

  const usageCount = profile?.usage?.length || 0;
  const tokensLimit = profile?.subscription?.tokens_limit || 5;
  const usagePercent = Math.min(
    100,
    Math.round((usageCount / tokensLimit) * 100),
  );

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const handleSendRequest = async () => {
    if (!selectedPlan) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: selectedPlan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setRequestSent(true);
      setPendingRequest(data.request);
      setSelectedPlan(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة الاشتراك 💳</h1>
        <p className="text-gray-500 text-sm mt-1">خططك واستهلاكك الحالي</p>
      </div>

      {/* ── الخطة الحالية ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {profile?.subscription
                ? profile.subscription.plan_name
                : "الخطة المجانية"}
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">خطتك الحالية</p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-bold ${profile?.subscription ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
          >
            {profile?.subscription ? "✓ مشترك" : "مجاني"}
          </span>
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>الاستخدام</span>
            <span>
              {usageCount} / {tokensLimit} عملية
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${usagePercent}%`,
                background:
                  usagePercent >= 80
                    ? "#EF4444"
                    : usagePercent >= 50
                      ? "#F59E0B"
                      : "#4F46E5",
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {usagePercent >= 80
              ? "⚠️ اقتربت من الحد، يرجى الترقية"
              : `متبقي ${tokensLimit - usageCount} عملية`}
          </p>
        </div>

        {profile?.subscription && (
          <div className="bg-indigo-50 rounded-2xl p-4 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>السعر الشهري</span>
              <span className="font-bold text-gray-900">
                ${profile.subscription.price}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>تاريخ الاشتراك</span>
              <span className="font-semibold">
                {formatDate(profile.subscription.created_at)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── طلب معلق ── */}
      {pendingRequest && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold text-amber-800">طلب ترقية قيد المراجعة</p>
              <p className="text-amber-700 text-sm mt-1">
                طلبك للترقية إلى <strong>{pendingRequest.plan_name}</strong>{" "}
                بسعر <strong>${pendingRequest.plan_price}/شهر</strong> قيد
                المراجعة. سيتواصل معك فريقنا على بريدك الإلكتروني خلال 24 ساعة.
              </p>
              <p className="text-amber-500 text-xs mt-2">
                {formatDate(pendingRequest.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── تأكيد إرسال الطلب ── */}
      {requestSent && !pendingRequest && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800">تم إرسال طلب الترقية!</p>
              <p className="text-green-700 text-sm mt-1">
                سيتواصل معك فريقنا على بريدك الإلكتروني خلال 24 ساعة لإتمام
                عملية الدفع وتفعيل اشتراكك.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── الخطط المتاحة للترقية ── */}
      {!pendingRequest && plans.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-1">🔼 ترقية اشتراكك</h3>
          <p className="text-gray-400 text-xs mb-4">
            اختر الخطة المناسبة وسيتواصل معك فريقنا لإتمام الدفع
          </p>
          <div className="space-y-3">
            {plans.map((plan) => {
              const isCurrent = profile?.subscription?.plan_name === plan.name;
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() =>
                    !isCurrent && setSelectedPlan(isSelected ? null : plan)
                  }
                  disabled={isCurrent}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-right ${isCurrent ? "border-indigo-200 bg-indigo-50/50 opacity-70 cursor-default" : isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white hover:border-gray-300 cursor-pointer"}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-gray-900">{plan.name}</p>
                      {isCurrent && (
                        <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          حالياً
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      {plan.tokens_limit} عملية شهرياً
                    </p>
                    {plan.description && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <div className="text-left flex items-center gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-xl leading-none">
                        ${plan.price}
                      </p>
                      <p className="text-xs text-gray-400 text-left">/شهر</p>
                    </div>
                    {isSelected && !isCurrent && (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Send request button */}
          {selectedPlan && (
            <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-indigo-800 text-sm">
                    الخطة المختارة: {selectedPlan.name}
                  </p>
                  <p className="text-indigo-600 text-xs">
                    ${selectedPlan.price}/شهر — {selectedPlan.tokens_limit}{" "}
                    عملية
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-indigo-400 text-xs hover:text-indigo-600"
                >
                  ✕ إلغاء
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs mb-3 bg-red-50 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}
              <button
                onClick={handleSendRequest}
                disabled={sending}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <span
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />{" "}
                    جاري إرسال الطلب...
                  </>
                ) : (
                  "📩 أرسل طلب الترقية"
                )}
              </button>
              <p className="text-center text-xs text-indigo-500 mt-2">
                سيتواصل معك فريقنا على بريدك الإلكتروني خلال 24 ساعة
              </p>
            </div>
          )}
        </div>
      )}

      {plans.length === 0 && !profileLoading && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm">لا توجد خطط مضافة بعد</p>
          <p className="text-gray-400 text-xs mt-1">
            يمكن للمدير إضافة خطط من لوحة الإدارة
          </p>
        </div>
      )}
    </div>
  );
}
