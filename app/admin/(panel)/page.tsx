import Link from "next/link";
import { VisitChart } from "@/components/admin/chart";
import { summarizeEvents } from "@/lib/analytics";
import { formatMoney, formatWhen } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function DashboardPage() {
  const snapshot = await getSnapshot();
  const summary = summarizeEvents(snapshot.events, 14);
  const openInquiries = snapshot.inquiries.filter((inquiry) => inquiry.status === "new" || inquiry.status === "in_progress").length;
  const cards = [
    ["Sessions", summary.sessions],
    ["Page visits", summary.pageViews],
    ["Button clicks", summary.buttonClicks],
    ["WhatsApp clicks", summary.whatsappClicks],
    ["Orders", snapshot.orders.length],
    ["Open inquiries", openInquiries],
  ];
  return (
    <div>
      <h1 className="font-serif text-5xl">Overview</h1>
      {summary.sample ? <p className="mt-3 text-sm text-muted">Sample visits are in the book so the board is readable before the first real guest.</p> : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-line bg-white p-4">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 border border-line bg-white p-4">
        <VisitChart data={summary.byDay} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-3xl">Recent orders</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[...snapshot.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.id}`}>{order.number}</Link> · {order.customerName} · {formatMoney(order.subtotal, snapshot.settings.currency)} · {formatWhen(order.createdAt)}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-3xl">Recent inquiries</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[...snapshot.inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((inquiry) => (
              <li key={inquiry.id}>
                <Link href={`/admin/inquiries/${inquiry.id}`}>{inquiry.name}</Link> · {inquiry.type} · {inquiry.status}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
