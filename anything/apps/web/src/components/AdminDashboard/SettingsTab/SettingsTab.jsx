import { MaintenanceToggle } from "./MaintenanceToggle";
import { FreeTierLimit } from "./FreeTierLimit";

export function SettingsTab({ settings, setSettings, savingKey, handleSave }) {
  return (
    <div className="px-6 pb-10 max-w-xl">
      <h2 className="font-bold text-gray-900 mb-6 text-lg">⚙️ إعدادات المنصة</h2>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
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
