import Link from "next/link";
import { PageCreator } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function PagesIndex() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="font-serif text-5xl">Pages</h1>
      <ul className="mt-8 space-y-3">
        {snapshot.pages.map((page) => (
          <li key={page.slug}>
            <Link href={`/admin/pages/${page.slug}`} className="text-lg">{page.title}</Link>
            <span className="ml-3 text-xs uppercase tracking-[0.14em] text-muted">{page.kind} · /{page.slug === "home" ? "" : page.slug}</span>
          </li>
        ))}
      </ul>
      <PageCreator />
    </div>
  );
}
