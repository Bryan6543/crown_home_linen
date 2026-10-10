import { MailDesk } from "@/components/admin/mail";
import { getSnapshot } from "@/lib/repo";

export default async function MailPage() {
  const snapshot = await getSnapshot();
  const deliveries = [...snapshot.deliveries].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Letters</h1>
      <MailDesk subscribers={snapshot.subscribers} campaigns={snapshot.campaigns} templates={snapshot.templates} deliveries={deliveries} />
    </div>
  );
}
