import { SettingsForm } from "@/components/admin/editors";
import { getSnapshot, storageMode } from "@/lib/repo";

export default async function SettingsPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Settings</h1>
      <SettingsForm settings={snapshot.settings} mode={storageMode()} />
    </div>
  );
}
