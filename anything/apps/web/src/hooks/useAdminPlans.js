import { useState, useCallback } from "react";

const EMPTY_PLAN = { name: "", price: "", tokens_limit: "", description: "" };

export function useAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await fetch("/api/plans");
      if (res.ok) setPlans(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const handleSavePlan = async (showToast) => {
    if (!planForm.name || planForm.price === "" || !planForm.tokens_limit) {
      showToast("يرجى ملء الحقول المطلوبة", "error");
      return;
    }
    setPlanSaving(true);
    try {
      const method = editingPlan ? "PUT" : "POST";
      const body = editingPlan ? { id: editingPlan.id, ...planForm } : planForm;
      const res = await fetch("/api/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast(editingPlan ? "تم التعديل ✓" : "تمت الإضافة ✓");
      setPlanForm(EMPTY_PLAN);
      setEditingPlan(null);
      setShowPlanForm(false);
      fetchPlans();
    } catch {
      showToast("فشل الحفظ", "error");
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDeletePlan = async (id, showToast) => {
    if (typeof window !== "undefined" && !window.confirm("حذف الخطة؟")) return;
    setDeletingPlanId(id);
    try {
      await fetch("/api/plans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      showToast("تم الحذف ✓");
      fetchPlans();
    } catch {
      showToast("فشل الحذف", "error");
    } finally {
      setDeletingPlanId(null);
    }
  };

  const startEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      tokens_limit: plan.tokens_limit,
      description: plan.description || "",
    });
    setShowPlanForm(true);
  };

  const resetPlanForm = () => {
    setShowPlanForm(false);
    setEditingPlan(null);
    setPlanForm(EMPTY_PLAN);
  };

  const openNewPlanForm = () => {
    setShowPlanForm(true);
    setEditingPlan(null);
    setPlanForm(EMPTY_PLAN);
  };

  return {
    plans,
    plansLoading,
    planForm,
    setPlanForm,
    editingPlan,
    planSaving,
    deletingPlanId,
    showPlanForm,
    fetchPlans,
    handleSavePlan,
    handleDeletePlan,
    startEditPlan,
    resetPlanForm,
    openNewPlanForm,
  };
}
