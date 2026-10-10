import type { Metadata } from "next";
import { PageSections } from "@/components/store/sections";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Questions" };

export default async function FaqPage() {
  const snapshot = await getSnapshot();
  return <PageSections snapshot={snapshot} slug="faq" />;
}
