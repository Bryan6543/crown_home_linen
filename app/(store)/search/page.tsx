import type { Metadata } from "next";
import { ProductCard } from "@/components/store/sections";
import { searchProducts } from "@/lib/catalog";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const snapshot = await getSnapshot();
  const products = searchProducts(snapshot, q);
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <p className="eyebrow">Search</p>
      <h1 className="mt-2 gold-text font-serif text-5xl font-bold">{q ? `“${q}”` : "The whole cupboard"}</h1>
      <p className="mt-3 text-sm text-muted">{products.length} pieces</p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} currency={snapshot.settings.currency} />
        ))}
      </div>
    </div>
  );
}
