export function PayPalSection({ payment, setPayment }) {
  return (
    <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🅿️</span>
        <h3 className="font-bold text-gray-900">PayPal</h3>
      </div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5">
        بريد PayPal أو رابط الدفع
      </label>
      <input
        type="text"
        value={payment.paypal}
        onChange={(e) => setPayment((p) => ({ ...p, paypal: e.target.value }))}
        placeholder="paypal@example.com أو paypal.me/username"
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
