import { notFound } from "next/navigation";
import { PageSections } from "@/components/store/sections";
import { pageMetadata } from "@/lib/page-meta";
import { getStorefront } from "@/lib/repo";
import { createSeed } from "@/lib/seed";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return pageMetadata(slug, `/pages/${slug}`, "Page");
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getStorefront();
  const saved = snapshot.pages.find((item) => item.slug === slug);
  const page = saved ?? createSeed().pages.find((item) => item.slug === slug);
  if (!page?.published || page.kind !== "page") notFound();
  return <PageSections snapshot={snapshot} slug={slug} />;
}
