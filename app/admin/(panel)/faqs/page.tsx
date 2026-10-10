import { FaqManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function FaqsPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Questions</h1>
      <FaqManager items={snapshot.faqs} />
    </div>
  );
}
