import type { MetadataRoute } from "next";
import { activeProducts, visibleCategories } from "@/lib/catalog";
import { getSnapshot } from "@/lib/repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getSnapshot();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticPaths = ["", "/shop", "/about", "/contact", "/faq", "/cart", "/search"];
  const pages = snapshot.pages.filter((page) => page.published && page.kind === "page").map((page) => `/pages/${page.slug}`);
  const products = activeProducts(snapshot).map((product) => `/products/${product.slug}`);
  const collections = visibleCategories(snapshot).map((category) => `/collections/${category.slug}`);
  return [...staticPaths, ...pages, ...products, ...collections].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
