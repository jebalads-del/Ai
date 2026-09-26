"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminPlans } from "@/hooks/useAdminPlans";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useToast } from "@/hooks/useToast";
import { Header } from "@/components/AdminDashboard/Header";
import { UnauthorizedAccess } from "@/components/AdminDashboard/UnauthorizedAccess";
import { StatsCards } from "@/components/AdminDashboard/StatsCards";
import { TabNavigation } from "@/components/AdminDashboard/TabNavigation";
import { UsersTab } from "@/components/AdminDashboard/UsersTab/UsersTab";
import { PlansTab } from "@/components/AdminDashboard/PlansTab/PlansTab";
import { PaymentTab } from "@/components/AdminDashboard/PaymentTab/PaymentTab";
import { SettingsTab } from "@/components/AdminDashboard/SettingsTab/SettingsTab";
import { SubscriptionRequestsTab } from "@/components/AdminDashboard/SubscriptionRequestsTab";
import { UpgradeModal } from "@/components/AdminDashboard/UpgradeModal";
import { Toast } from "@/components/AdminDashboard/Toast";

export default function AdminDashboard() {
  const { data: user } = useUser();
  const [activeTab, setActiveTab] = useState("users");

  const { toast, showToast } = useToast();

  // Upgrade modal state
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [removingSubId, setRemovingSubId] = useState(null);

  const {
    users,
    stats,
    loading,
    search,
    setSearch,
    page,
    setPage,
    pages,
    deletingId,
    verifyingId,
    fetchUsers,
    handleDelete,
    handleVerify,
  } = useAdminUsers();

  const {
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
  } = useAdminPlans();

  const {
    settings,
    setSettings,
    payment,
    setPayment,
    savingKey,
    handleSave,
    savePayment,
  } = useAdminSettings();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleRemoveSub = async (userId) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("إلغاء اشتراك هذا المستخدم؟")
    )
      return;
    setRemovingSubId(userId);
    try {
      const res = await fetch("/api/admin/upgrade-subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error();
      showToast("تم إلغاء الاشتراك ✓");
      fetchUsers();
    } catch {
      showToast("فشل إلغاء الاشتراك", "error");
    } finally {
      setRemovingSubId(null);
    }
  };

  if (
    user !== undefined &&
    user?.role !== "admin" &&
    process.env.NODE_ENV !== "development"
  ) {
    return <UnauthorizedAccess />;
  }

  return (
    <div
      className="min-h-screen bg-[#F0F2FF] font-tajawal text-right"
      dir="rtl"
    >
      <Header />
      <StatsCards stats={stats} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "users" && (
        <UsersTab
          users={users}
          loading={loading}
          search={search}
          setSearch={setSearch}
          page={page}
          setPage={setPage}
          pages={pages}
          fetchUsers={fetchUsers}
          deletingId={deletingId}
          verifyingId={verifyingId}
          removingSubId={removingSubId}
          handleDelete={(id) => handleDelete(id, showToast)}
          handleVerify={(id) => handleVerify(id, showToast)}
          handleRemoveSub={handleRemoveSub}
          onUpgrade={(u) =>
            setUpgradeModal({
              userId: u.id,
              userName: u.name,
              userEmail: u.email,
            })
          }
        />
      )}

      {activeTab === "subrequests" && (
        <SubscriptionRequestsTab showToast={showToast} />
      )}

      {activeTab === "plans" && (
        <PlansTab
          plans={plans}
          plansLoading={plansLoading}
          planForm={planForm}
          setPlanForm={setPlanForm}
          editingPlan={editingPlan}
          planSaving={planSaving}
          deletingPlanId={deletingPlanId}
          showPlanForm={showPlanForm}
          handleSavePlan={() => handleSavePlan(showToast)}
          handleDeletePlan={(id) => handleDeletePlan(id, showToast)}
          startEditPlan={startEditPlan}
          resetPlanForm={resetPlanForm}
          openNewPlanForm={openNewPlanForm}
        />
      )}

      {activeTab === "payment" && (
        <PaymentTab
          payment={payment}
          setPayment={setPayment}
          savePayment={() => savePayment(showToast)}
          savingKey={savingKey}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab
          settings={settings}
          setSettings={setSettings}
          savingKey={savingKey}
          handleSave={(key, value) => handleSave(key, value, showToast)}
        />
      )}

      {upgradeModal && (
        <UpgradeModal
          user={upgradeModal}
          plans={plans}
          onClose={() => setUpgradeModal(null)}
          onSuccess={fetchUsers}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }
      `}</style>
    </div>
  );
}
