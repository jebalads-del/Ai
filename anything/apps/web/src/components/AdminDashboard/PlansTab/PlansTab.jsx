import { PlanForm } from "./PlanForm";
import { PlansList } from "./PlansList";

export function PlansTab({
  plans,
  plansLoading,
  planForm,
  setPlanForm,
  editingPlan,
  planSaving,
  deletingPlanId,
  showPlanForm,
  handleSavePlan,
  handleDeletePlan,
  startEditPlan,
  resetPlanForm,
  openNewPlanForm,
}) {
  return (
    <div className="px-6 pb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900 text-lg">📦 إدارة الخطط</h2>
        <button
          onClick={openNewPlanForm}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-md"
        >
          + خطة جديدة
        </button>
      </div>

      {showPlanForm && (
        <PlanForm
          planForm={planForm}
          setPlanForm={setPlanForm}
          editingPlan={editingPlan}
          planSaving={planSaving}
          handleSavePlan={handleSavePlan}
          resetPlanForm={resetPlanForm}
        />
      )}

      <PlansList
        plans={plans}
        plansLoading={plansLoading}
        deletingPlanId={deletingPlanId}
        startEditPlan={startEditPlan}
        handleDeletePlan={handleDeletePlan}
      />
    </div>
  );
}
