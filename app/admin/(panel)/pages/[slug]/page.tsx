import { notFound } from "next/navigation";
import { PageMetaForm, SectionManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const snapshot = await getSnapshot();
  const page = snapshot.pages.find((item) => item.slug === slug);
  if (!page) notFound();
  const sections = snapshot.sections.filter((section) => section.pageSlug === slug).sort((a, b) => a.sort - b.sort);
  return (
    <div>
      <h1 className="mb-6 font-serif text-5xl">{page.title}</h1>
      <PageMetaForm page={page} />
      <SectionManager pageSlug={slug} sections={sections} />
    </div>
  );
}
