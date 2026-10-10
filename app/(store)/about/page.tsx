import type { Metadata } from "next";
import { PageSections } from "@/components/store/sections";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Our house" };

export default async function AboutPage() {
  const snapshot = await getSnapshot();
  return <PageSections snapshot={snapshot} slug="about" />;
}
