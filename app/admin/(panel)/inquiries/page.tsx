import Link from "next/link";
import { formatWhen } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function InquiriesPage() {
  const snapshot = await getSnapshot();
  const inquiries = [...snapshot.inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <h1 className="font-serif text-5xl">Inquiries</h1>
      <table className="admin-table mt-8 bg-white">
        <thead><tr><th>Name</th><th>Type</th><th>Piece</th><th>Status</th><th>When</th></tr></thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td><Link href={`/admin/inquiries/${inquiry.id}`}>{inquiry.name}</Link></td>
              <td>{inquiry.type}</td>
              <td>{inquiry.productTitle}</td>
              <td>{inquiry.status}</td>
              <td>{formatWhen(inquiry.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
