import { PageSections } from "@/components/store/sections";
import { getSnapshot } from "@/lib/repo";

export default async function HomePage() {
  const snapshot = await getSnapshot();
  return <PageSections snapshot={snapshot} slug="home" />;
}
