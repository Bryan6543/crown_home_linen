import { QuoteManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function TestimonialsPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Notes</h1>
      <QuoteManager items={snapshot.testimonials} />
    </div>
  );
}
