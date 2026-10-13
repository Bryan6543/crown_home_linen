import { PageSections } from "@/components/store/sections";
import { getStorefront } from "@/lib/repo";

export default async function HomePage() {
  const snapshot = await getStorefront();
  return <PageSections snapshot={snapshot} slug="home" />;
}
