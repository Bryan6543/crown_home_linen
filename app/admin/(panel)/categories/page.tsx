import { CategoryManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function CategoriesPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Collections</h1>
      <CategoryManager categories={snapshot.categories} />
    </div>
  );
}
