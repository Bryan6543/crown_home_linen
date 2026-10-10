import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageSections } from "@/components/store/sections";
import { getSnapshot } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const page = snapshot.pages.find((item) => item.slug === slug && item.published);
  return { title: page?.seoTitle || page?.title || "Page", description: page?.seoDescription };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const page = snapshot.pages.find((item) => item.slug === slug && item.published && item.kind === "page");
  if (!page) notFound();
  return <PageSections snapshot={snapshot} slug={slug} />;
}
