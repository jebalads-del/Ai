export function BankTransferSection({ payment, setPayment }) {
  const fields = [
    {
      label: "اسم البنك",
      key: "bank_name",
      placeholder: "مثال: بنك الأهلي السعودي",
    },
    {
      label: "رقم الآيبان (IBAN)",
      key: "bank_iban",
      placeholder: "SA0000000000000000000000",
    },
    {
      label: "اسم صاحب الحساب",
      key: "bank_account_name",
      placeholder: "محمد أحمد",
    },
  ];

  return (
    <div className="border border-green-100 rounded-2xl p-4 bg-green-50/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🏦</span>
        <h3 className="font-bold text-gray-900">التحويل البنكي</h3>
      </div>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              {f.label}
            </label>
            <input
              type="text"
              value={payment[f.key]}
              onChange={(e) =>
                setPayment((p) => ({ ...p, [f.key]: e.target.value }))
              }
              placeholder={f.placeholder}
              className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${f.key === "bank_iban" ? "font-mono" : ""}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
