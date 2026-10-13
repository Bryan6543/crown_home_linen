import { PageSections } from "@/components/store/sections";
import { pageMetadata } from "@/lib/page-meta";
import { getStorefront } from "@/lib/repo";

export function generateMetadata() {
  return pageMetadata("about", "/about", "About Crown");
}

export default async function Page() {
  const snapshot = await getStorefront();
  return <PageSections snapshot={snapshot} slug="about" />;
}
