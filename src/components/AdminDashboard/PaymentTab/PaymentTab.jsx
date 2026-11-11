import { PayPalSection } from "./PayPalSection";
import { WesternUnionSection } from "./WesternUnionSection";
import { BankTransferSection } from "./BankTransferSection";

export function PaymentTab({ payment, setPayment, savePayment, savingKey }) {
  return (
    <div className="px-4 sm:px-7 pb-10 max-w-3xl">
      <h2 className="font-bold text-gray-900 mb-6 text-lg">
        💳 إعدادات طرق الدفع
      </h2>
      <div className="bg-white rounded-3xl border border-violet-100/80 shadow-[0_12px_32px_rgba(49,46,129,0.06)] p-5 sm:p-6 space-y-5">
        <PayPalSection payment={payment} setPayment={setPayment} />
        <WesternUnionSection payment={payment} setPayment={setPayment} />
        <BankTransferSection payment={payment} setPayment={setPayment} />

        <button
          onClick={savePayment}
          disabled={savingKey === "payment_methods"}
          className="w-full bg-gradient-to-l from-[#312E81] to-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:to-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
        >
          {savingKey === "payment_methods"
            ? "⏳ جاري الحفظ..."
            : "💾 حفظ طرق الدفع"}
        </button>
      </div>
    </div>
  );
}
