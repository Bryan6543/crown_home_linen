import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function ProductsPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-5xl">Pieces</h1>
        <Link href="/admin/products/new" className="btn-ink">New piece</Link>
      </div>
      <table className="admin-table mt-8 bg-white">
        <thead><tr><th>Title</th><th>Collection</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>
          {snapshot.products.map((product) => (
            <tr key={product.id}>
              <td><Link href={`/admin/products/${product.id}`}>{product.title}</Link></td>
              <td>{snapshot.categories.find((category) => category.id === product.categoryId)?.name}</td>
              <td>{formatMoney(product.price, snapshot.settings.currency)}</td>
              <td>{product.status}{product.featured ? " · featured" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
