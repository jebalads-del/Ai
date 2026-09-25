import { PayPalSection } from "./PayPalSection";
import { WesternUnionSection } from "./WesternUnionSection";
import { BankTransferSection } from "./BankTransferSection";

export function PaymentTab({ payment, setPayment, savePayment, savingKey }) {
  return (
    <div className="px-6 pb-10 max-w-2xl">
      <h2 className="font-bold text-gray-900 mb-6 text-lg">
        💳 إعدادات طرق الدفع
      </h2>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <PayPalSection payment={payment} setPayment={setPayment} />
        <WesternUnionSection payment={payment} setPayment={setPayment} />
        <BankTransferSection payment={payment} setPayment={setPayment} />

        <button
          onClick={savePayment}
          disabled={savingKey === "payment_methods"}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
        >
          {savingKey === "payment_methods"
            ? "⏳ جاري الحفظ..."
            : "💾 حفظ طرق الدفع"}
        </button>
      </div>
    </div>
  );
}
