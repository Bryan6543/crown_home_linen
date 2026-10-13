import type { MetadataRoute } from "next";
import { activeProducts, visibleCategories } from "@/lib/catalog";
import { getStorefront } from "@/lib/repo";
import { createSeed } from "@/lib/seed";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getStorefront();
  const base = siteUrl();
  const fixed: [string, number][] = [
    ["", 1],
    ["/shop", 0.9],
    ["/wholesale", 0.8],
    ["/about", 0.6],
    ["/contact", 0.6],
    ["/faq", 0.6],
  ];
  // Content pages under /pages/. About, contact, questions, and wholesale have
  // their own addresses above and are not listed twice.
  const known = new Map([...createSeed().pages, ...snapshot.pages].map((page) => [page.slug, page]));
  const pages = [...known.values()].filter((page) => page.published && page.kind === "page").map((page) => `/pages/${page.slug}`);
  const collections = visibleCategories(snapshot).map((category) => `/collections/${category.slug}`);
  const products = activeProducts(snapshot);
  return [
    ...fixed.map(([path, priority]) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority })),
    ...collections.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
