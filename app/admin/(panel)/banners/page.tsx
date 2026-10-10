import { BannerManager } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function BannersPage() {
  const snapshot = await getSnapshot();
  return (
    <div>
      <h1 className="mb-8 font-serif text-5xl">Banners</h1>
      <BannerManager banners={snapshot.banners} />
    </div>
  );
}
