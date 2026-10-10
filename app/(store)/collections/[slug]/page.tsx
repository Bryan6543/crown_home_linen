import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopBrowser } from "@/components/store/commerce";
import { activeProducts, categoryBySlug, visibleCategories } from "@/lib/catalog";
import { getSnapshot } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const category = categoryBySlug(snapshot, slug);
  return { title: category?.name || "Collection", description: category?.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const category = categoryBySlug(snapshot, slug);
  if (!category) notFound();
  return (
    <ShopBrowser
      key={category.id}
      products={activeProducts(snapshot)}
      currency={snapshot.settings.currency}
      categories={visibleCategories(snapshot).map((item) => ({ id: item.id, name: item.name }))}
      initialCategory={category.id}
      heading={category.name}
      intro={category.description}
    />
  );
}
