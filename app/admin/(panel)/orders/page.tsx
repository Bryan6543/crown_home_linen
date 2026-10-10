import Link from "next/link";
import { formatMoney, formatWhen } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function OrdersPage() {
  const snapshot = await getSnapshot();
  const orders = [...snapshot.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <h1 className="font-serif text-5xl">Orders</h1>
      <table className="admin-table mt-8 bg-white">
        <thead><tr><th>Number</th><th>Customer</th><th>City</th><th>Total</th><th>Status</th><th>When</th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link href={`/admin/orders/${order.id}`}>{order.number}</Link></td>
              <td>{order.customerName}</td>
              <td>{order.city}</td>
              <td>{formatMoney(order.subtotal, snapshot.settings.currency)}</td>
              <td>{order.status}</td>
              <td>{formatWhen(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
