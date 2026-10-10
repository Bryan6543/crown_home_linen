import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/store/commerce";
import { ProductCard } from "@/components/store/sections";
import { productBySlug, relatedProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const product = productBySlug(snapshot, slug);
  if (!product) return { title: "Piece" };
  return {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const product = productBySlug(snapshot, slug);
  if (!product) notFound();
  const related = relatedProducts(snapshot, product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: product.images.map((image) => image.url),
    sku: product.sku,
    brand: { "@type": "Brand", name: snapshot.settings.storeName },
    offers: {
      "@type": "Offer",
      priceCurrency: snapshot.settings.currency,
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductPurchase product={product} currency={snapshot.settings.currency} />
      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="font-serif text-4xl">With it</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} currency={snapshot.settings.currency} />
            ))}
          </div>
          <p className="sr-only">From {formatMoney(product.price, snapshot.settings.currency)}</p>
        </section>
      ) : null}
    </article>
  );
}
