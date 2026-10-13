import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopBrowser } from "@/components/store/commerce";
import { activeProducts, categoryBySlug, visibleCategories } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/format";
import { getStorefront } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getStorefront();
  const category = categoryBySlug(snapshot, slug);
  if (!category) return { title: "Collection" };
  return {
    title: category.name,
    description: `${category.description} Retail and wholesale from Crown, Colombo 11.`,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; size?: string; sort?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const snapshot = await getStorefront();
  const category = categoryBySlug(snapshot, slug);
  if (!category) notFound();
  return (
    <ShopBrowser
      key={category.id}
      products={activeProducts(snapshot)}
      currency={snapshot.settings.currency}
      categories={visibleCategories(snapshot).map((item) => ({ id: item.id, name: item.name, slug: item.slug }))}
      collection={category.id}
      initialQuery={query.q}
      initialSize={query.size}
      initialSort={query.sort}
      heading={category.name}
      intro={category.description}
      whatsappHref={whatsappUrl(snapshot.settings.whatsappNumber, snapshot.settings.whatsappGreeting)}
    />
  );
}
