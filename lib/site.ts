// The public address of the shop, without a trailing slash. Set
// NEXT_PUBLIC_SITE_URL in production (https://crownhomelinen.com) so
// canonical links, the sitemap, and shared previews point at the real domain.
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}
