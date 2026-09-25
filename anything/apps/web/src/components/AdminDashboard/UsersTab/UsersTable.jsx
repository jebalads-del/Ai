import { UserAvatar } from "./UserAvatar";
import { formatDate } from "../utils";

export function UsersTable({
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
    <table className="hidden md:table w-full">
      <thead>
        <tr className="border-b border-gray-50 bg-gray-50/50">
          {[
            "المستخدم",
            "الحالة",
            "الخطة",
            "طريقة الدخول",
            "الاستخدام",
            "التاريخ",
            "إجراءات",
          ].map((h) => (
            <th
              key={h}
              className="text-right px-5 py-4 text-xs font-bold text-gray-500"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {users.map((u) => {
          const isVerified = !!u.email_verified;
          return (
            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar name={u.name} email={u.email} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {u.name || "—"}
                    </p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold ${isVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {isVerified ? "✓ مُتحقق" : "⚠ غير مُتحقق"}
                </span>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-bold ${u.plan_name ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {u.plan_name || "مجاني"}
                </span>
              </td>
              <td className="px-5 py-4 text-xs text-gray-600">
                {u.provider === "google" ? "🔵 Google" : "📧 بريد"}
              </td>
              <td className="px-5 py-4">
                <span className="text-sm font-semibold text-gray-700">
                  {u.usage_count || 0}
                </span>
                <span className="text-xs text-gray-400 mr-1">عملية</span>
              </td>
              <td className="px-5 py-4 text-xs text-gray-500">
                {formatDate(u.last_active)}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => onUpgrade(u)}
                    className="text-indigo-600 text-xs border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-50 font-bold whitespace-nowrap"
                  >
                    🔼 ترقية
                  </button>
                  {u.plan_name && (
                    <button
                      onClick={() => handleRemoveSub(u.id)}
                      disabled={removingSubId === u.id}
                      className="text-orange-500 text-xs border border-orange-100 px-3 py-1.5 rounded-xl hover:bg-orange-50 whitespace-nowrap"
                    >
                      {removingSubId === u.id ? "..." : "إلغاء"}
                    </button>
                  )}
                  {!isVerified && (
                    <button
                      onClick={() => handleVerify(u.id)}
                      disabled={verifyingId === u.id}
                      className="text-green-600 text-xs border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 font-bold"
                    >
                      {verifyingId === u.id ? "⏳" : "✓ تحقق"}
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
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
