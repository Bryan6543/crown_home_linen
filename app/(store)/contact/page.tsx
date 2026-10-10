import type { Metadata } from "next";
import { PageSections } from "@/components/store/sections";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const snapshot = await getSnapshot();
  return <PageSections snapshot={snapshot} slug="contact" />;
}
