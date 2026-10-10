import { NavManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function NavigationPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Navigation</h1>
      <NavManager items={snapshot.navigation} />
    </div>
  );
}
