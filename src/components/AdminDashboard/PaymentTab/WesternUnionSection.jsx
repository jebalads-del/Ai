export function WesternUnionSection({ payment, setPayment }) {
  return (
    <div className="border border-violet-100 rounded-2xl p-4 sm:p-5 bg-violet-50/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🌐</span>
        <h3 className="font-bold text-gray-900">Western Union</h3>
      </div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        تعليمات الإرسال (ستظهر للمستخدم)
      </label>
      <textarea
        value={payment.western_union}
        onChange={(e) =>
          setPayment((p) => ({ ...p, western_union: e.target.value }))
        }
        placeholder={
          "الاسم: محمد أحمد\nالدولة: المملكة العربية السعودية\nالمدينة: الرياض\nالهاتف: +9665xxxxxxxx"
        }
        rows={4}
        className="w-full bg-white border border-violet-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-none leading-7"
      />
    </div>
  );
}
