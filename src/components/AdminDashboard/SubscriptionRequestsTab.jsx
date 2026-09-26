import { useState, useEffect, useCallback } from "react";

export function SubscriptionRequestsTab({ showToast }) {
  const [subRequests, setSubRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/subscription-requests?status=${filter}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSubRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, status, note = "") => {
    setProcessingId(requestId);
    try {
      const res = await fetch("/api/admin/subscription-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          status,
          admin_note: note,
        }),
      });
      if (!res.ok) throw new Error();
      showToast(
        status === "approved"
          ? "✅ تمت الموافقة وتفعيل الاشتراك"
          : "تم رفض الطلب",
      );
      setRejectingId(null);
      setRejectNote("");
      fetchRequests();
    } catch {
      showToast("فشل — حاول مرة أخرى", "error");
    } finally {
      setProcessingId(null);
    }
  };

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

  return (
    <div className="px-6 pb-10">
      {/* Header + Filter */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">📩 طلبات الترقية</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            الطلبات التي أرسلها المستخدمون لترقية اشتراكاتهم
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "pending", label: "⏳ قيد الانتظار" },
            { key: "approved", label: "✅ مقبولة" },
            { key: "rejected", label: "❌ مرفوضة" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === s.key ? "bg-indigo-600 text-white shadow" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={fetchRequests}
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 text-sm"
          >
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-400 text-sm">جاري التحميل...</p>
          </div>
        </div>
      ) : subRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-14 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-semibold">لا توجد طلبات</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === "pending"
              ? "لا توجد طلبات قيد الانتظار حالياً"
              : filter === "approved"
                ? "لا توجد طلبات مقبولة"
                : "لا توجد طلبات مرفوضة"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {subRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Status bar */}
              <div
                className={`h-1 w-full ${req.status === "approved" ? "bg-green-500" : req.status === "rejected" ? "bg-red-400" : "bg-amber-400"}`}
              />

              <div className="p-5">
                <div className="flex flex-wrap items-start gap-4 justify-between mb-4">
                  {/* User info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {(req.user_name || req.user_email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {req.user_name || "—"}
                      </p>
                      <p className="text-gray-500 text-sm">{req.user_email}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Plan badge */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3 text-center">
                    <p className="font-bold text-indigo-700 text-sm">
                      {req.plan_name}
                    </p>
                    <p className="text-indigo-500 font-black text-lg">
                      ${req.plan_price}
                      <span className="text-xs font-normal">/شهر</span>
                    </p>
                  </div>
                </div>

                {/* Admin note */}
                {req.admin_note && (
                  <div className="mb-4 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-600 border border-gray-100">
                    💬 <span className="font-semibold">ملاحظة:</span>{" "}
                    {req.admin_note}
                  </div>
                )}

                {/* Status badge for non-pending */}
                {req.status !== "pending" && (
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full ${req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    {req.status === "approved"
                      ? "✅ تمت الموافقة — تم تفعيل الاشتراك"
                      : "❌ مرفوض"}
                  </div>
                )}

                {/* Actions for pending */}
                {req.status === "pending" && (
                  <div className="flex flex-wrap gap-2 items-start">
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      disabled={processingId === req.id}
                      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {processingId === req.id ? (
                        <>
                          <span
                            className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                            style={{ animation: "spin 0.8s linear infinite" }}
                          />
                          ⏳ جاري التفعيل...
                        </>
                      ) : (
                        <>✅ موافقة وتفعيل الاشتراك</>
                      )}
                    </button>

                    {rejectingId === req.id ? (
                      <div className="flex gap-2 items-center flex-1 min-w-0">
                        <input
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="سبب الرفض (اختياري)..."
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 min-w-0"
                        />
                        <button
                          onClick={() =>
                            handleAction(req.id, "rejected", rejectNote)
                          }
                          disabled={processingId === req.id}
                          className="bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 whitespace-nowrap"
                        >
                          تأكيد الرفض
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectNote("");
                          }}
                          className="text-gray-400 text-sm px-3 py-2.5 hover:text-gray-600"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRejectingId(req.id);
                          setRejectNote("");
                        }}
                        className="border-2 border-red-200 text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                      >
                        ❌ رفض
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style
        jsx
        global
      >{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
