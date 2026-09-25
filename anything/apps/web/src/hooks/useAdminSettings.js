import { useState, useEffect } from "react";

const EMPTY_PAYMENT = {
  paypal: "",
  western_union: "",
  bank_name: "",
  bank_iban: "",
  bank_account_name: "",
};

export function useAdminSettings() {
  const [settings, setSettings] = useState({
    site_maintenance: "false",
    free_tier_limit: "5",
  });
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings((s) => ({ ...s, ...d }));
        if (d.payment_methods) {
          try {
            setPayment((p) => ({ ...p, ...JSON.parse(d.payment_methods) }));
          } catch {}
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (key, value, showToast) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      showToast("تم الحفظ بنجاح ✓");
    } catch {
      showToast("فشل الحفظ", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const savePayment = async (showToast) => {
    setSavingKey("payment_methods");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "payment_methods",
          value: JSON.stringify(payment),
        }),
      });
      if (!res.ok) throw new Error();
      showToast("تم حفظ طرق الدفع ✓");
    } catch {
      showToast("فشل الحفظ", "error");
    } finally {
      setSavingKey(null);
    }
  };

  return {
    settings,
    setSettings,
    payment,
    setPayment,
    savingKey,
    handleSave,
    savePayment,
  };
}
