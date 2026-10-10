import type { Product, ProductVariant, StoreSnapshot } from "@/lib/types";

export function visibleCategories(snapshot: StoreSnapshot) {
  return snapshot.categories.filter((category) => category.visible).sort((a, b) => a.sort - b.sort);
}

export function activeProducts(snapshot: StoreSnapshot) {
  return snapshot.products
    .filter((product) => product.status === "active")
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
}

export function productBySlug(snapshot: StoreSnapshot, slug: string) {
  return activeProducts(snapshot).find((product) => product.slug === slug) ?? null;
}

export function categoryBySlug(snapshot: StoreSnapshot, slug: string) {
  return visibleCategories(snapshot).find((category) => category.slug === slug) ?? null;
}

export function productsInCategory(snapshot: StoreSnapshot, categoryId: string) {
  return activeProducts(snapshot).filter((product) => product.categoryId === categoryId);
}

export function relatedProducts(snapshot: StoreSnapshot, product: Product, limit = 4) {
  return activeProducts(snapshot)
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(snapshot: StoreSnapshot, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return activeProducts(snapshot);
  return activeProducts(snapshot).filter((product) => {
    const haystack = [product.title, product.shortDescription, product.description, product.material, product.sku]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function navItems(snapshot: StoreSnapshot, location: StoreSnapshot["navigation"][number]["location"]) {
  return snapshot.navigation
    .filter((item) => item.visible && item.location === location)
    .sort((a, b) => a.sort - b.sort);
}

export function pageSections(snapshot: StoreSnapshot, slug: string) {
  return snapshot.sections
    .filter((section) => section.pageSlug === slug && section.visible)
    .sort((a, b) => a.sort - b.sort);
}

export function heroBanners(snapshot: StoreSnapshot) {
  return snapshot.banners
    .filter((banner) => banner.active && banner.placement === "hero")
    .sort((a, b) => a.sort - b.sort);
}

export function lowestPrice(product: Product) {
  if (product.variants.length === 0) return product.price;
  return Math.min(...product.variants.map((variant) => variant.price));
}

export function displayPrice(product: Product, variant?: ProductVariant | null) {
  const price = variant?.price ?? lowestPrice(product);
  const compare = variant?.compareAtPrice ?? product.compareAtPrice;
  return {
    price,
    compare: compare && compare > price ? compare : null,
  };
}

export function variantInStock(variant: ProductVariant) {
  return variant.available && variant.stock > 0;
}
