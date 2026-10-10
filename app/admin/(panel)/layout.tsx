import { Shell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <Shell email={session.email}>{children}</Shell>;
}
