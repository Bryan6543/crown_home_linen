import { CustomerNotes } from "@/components/admin/editors";
import { formatWhen } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function CustomersPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="font-serif text-5xl">Customers</h1>
      <table className="admin-table mt-8 bg-white">
        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Inquiries</th><th>Last seen</th><th>Notes</th></tr></thead>
        <tbody>
          {snapshot.customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
              <td>{customer.orderCount}</td>
              <td>{customer.inquiryCount}</td>
              <td>{formatWhen(customer.lastSeenAt)}</td>
              <td><CustomerNotes id={customer.id} notes={customer.notes} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
