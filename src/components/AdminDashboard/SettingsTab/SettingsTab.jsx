import { MaintenanceToggle } from "./MaintenanceToggle";
import { FreeTierLimit } from "./FreeTierLimit";

export function SettingsTab({ settings, setSettings, savingKey, handleSave }) {
  return (
    <div className="px-4 sm:px-7 pb-10 max-w-2xl">
      <h2 className="font-bold text-gray-900 mb-6 text-lg">⚙️ إعدادات المنصة</h2>
      <div className="bg-white rounded-3xl border border-violet-100/80 shadow-[0_12px_32px_rgba(49,46,129,0.06)] p-5 sm:p-6 space-y-5">
        <MaintenanceToggle
          settings={settings}
          setSettings={setSettings}
          handleSave={handleSave}
        />
        <FreeTierLimit
          settings={settings}
          setSettings={setSettings}
          savingKey={savingKey}
          handleSave={handleSave}
        />
      </div>
    </div>
  );
}
