import { UserAvatar } from "./UserAvatar";

export function UsersMobileCards({
  users,
  deletingId,
  verifyingId,
  handleDelete,
  handleVerify,
  handleRemoveSub,
  onUpgrade,
  removingSubId,
}) {
  return (
    <div className="md:hidden divide-y divide-gray-50">
      {users.map((u) => {
        const isVerified = !!u.email_verified;
        return (
          <div key={u.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={u.name} email={u.email} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {u.name || "—"}
                  </p>
                  <p className="text-gray-400 text-xs">{u.email}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
              >
                {isVerified ? "✓ مُتحقق" : "⚠ غير مُتحقق"}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {u.provider === "google" ? "🔵 Google" : "📧 بريد"}
              </span>
              {u.plan_name && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {u.plan_name}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onUpgrade(u)}
                className="text-indigo-600 text-xs border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 font-bold"
              >
                🔼 ترقية
              </button>
              {u.plan_name && (
                <button
                  onClick={() => handleRemoveSub(u.id)}
                  disabled={removingSubId === u.id}
                  className="text-orange-500 text-xs border border-orange-100 px-3 py-1.5 rounded-xl hover:bg-orange-50"
                >
                  {removingSubId === u.id ? "..." : "إلغاء الاشتراك"}
                </button>
              )}
              {!isVerified && (
                <button
                  onClick={() => handleVerify(u.id)}
                  disabled={verifyingId === u.id}
                  className="text-green-600 text-xs border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 font-bold"
                >
                  {verifyingId === u.id ? "..." : "✓ تحقق"}
                </button>
              )}
              <button
                onClick={() => handleDelete(u.id)}
                disabled={deletingId === u.id}
                className="text-red-400 text-xs border border-red-100 px-3 py-1.5 rounded-xl hover:bg-red-50"
              >
                {deletingId === u.id ? "..." : "حذف"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
