import { redirect } from "next/navigation";

// Search lives on the shop page now, where it can be combined with filters.
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  redirect(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
}
