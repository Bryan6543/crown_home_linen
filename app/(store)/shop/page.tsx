import type { Metadata } from "next";
import { ShopBrowser } from "@/components/store/commerce";
import { activeProducts, pageSections, visibleCategories } from "@/lib/catalog";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const snapshot = await getSnapshot();
  const intro = pageSections(snapshot, "shop").find((section) => section.type === "rich_text");
  return (
    <ShopBrowser
      products={activeProducts(snapshot)}
      currency={snapshot.settings.currency}
      categories={visibleCategories(snapshot).map((category) => ({ id: category.id, name: category.name }))}
      heading={intro && intro.type === "rich_text" ? intro.title : "The house collection"}
      intro={intro && intro.type === "rich_text" ? intro.body : undefined}
    />
  );
}
