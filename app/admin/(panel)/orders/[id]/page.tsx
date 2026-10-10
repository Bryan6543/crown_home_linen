import { notFound } from "next/navigation";
import { OrderDesk } from "@/components/admin/editors";
import { formatMoney } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getSnapshot();
  const order = snapshot.orders.find((item) => item.id === id);
  if (!order) notFound();
  return (
    <div>
      <h1 className="font-serif text-5xl">{order.number}</h1>
      <p className="mt-3 text-sm text-muted">{order.customerName} · {order.phone} · {order.email}</p>
      <p className="text-sm">{order.address}, {order.city}</p>
      {order.notes ? <p className="mt-3 text-sm">Customer note: {order.notes}</p> : null}
      <ul className="my-6 space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.variantId}>{item.quantity} × {item.title} ({item.variantTitle}) — {formatMoney(item.unitPrice * item.quantity, snapshot.settings.currency)}</li>
        ))}
      </ul>
      <p className="mb-6">Total {formatMoney(order.subtotal, snapshot.settings.currency)}</p>
      <OrderDesk order={order} currency={snapshot.settings.currency} whatsappNumber={snapshot.settings.whatsappNumber} storeName={snapshot.settings.storeName} />
    </div>
  );
}
