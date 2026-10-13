import "server-only";

import type { Metadata } from "next";
import { getStorefront } from "@/lib/repo";
import { createSeed } from "@/lib/seed";

// Title, description, and canonical link for a CMS-backed page.
export async function pageMetadata(slug: string, path: string, fallbackTitle: string): Promise<Metadata> {
  const snapshot = await getStorefront();
  const page = snapshot.pages.find((item) => item.slug === slug) ?? createSeed().pages.find((item) => item.slug === slug);
  return {
    title: page?.seoTitle || page?.title || fallbackTitle,
    description: page?.seoDescription || undefined,
    alternates: { canonical: path },
  };
}
