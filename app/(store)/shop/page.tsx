import type { Metadata } from "next";
import { ShopBrowser } from "@/components/store/commerce";
import { activeProducts, pageSections, visibleCategories } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/format";
import { getStorefront } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await getStorefront();
  const page = snapshot.pages.find((item) => item.slug === "shop");
  return {
    title: page?.seoTitle || "Shop all items",
    description: page?.seoDescription,
    alternates: { canonical: "/shop" },
  };
}

type Params = { category?: string; q?: string; size?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const snapshot = await getStorefront();
  const categories = visibleCategories(snapshot);
  const intro = pageSections(snapshot, "shop").find((section) => section.type === "rich_text");
  return (
    <ShopBrowser
      products={activeProducts(snapshot)}
      currency={snapshot.settings.currency}
      categories={categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug }))}
      initialCategory={categories.find((category) => category.slug === params.category)?.id}
      initialQuery={params.q}
      initialSize={params.size}
      initialSort={params.sort}
      heading={intro && intro.type === "rich_text" ? intro.title : "Everything at Crown"}
      intro={intro && intro.type === "rich_text" ? intro.body : undefined}
      whatsappHref={whatsappUrl(snapshot.settings.whatsappNumber, snapshot.settings.whatsappGreeting)}
    />
  );
}
