import { notFound } from "next/navigation";
import { InquiryDesk } from "@/components/admin/editors";
import { getSnapshot } from "@/lib/repo";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const snapshot = await getSnapshot();
  const inquiry = snapshot.inquiries.find((item) => item.id === id);
  if (!inquiry) notFound();
  return (
    <div>
      <h1 className="font-serif text-5xl">{inquiry.name}</h1>
      <p className="mt-3 text-sm text-muted">{inquiry.phone} · {inquiry.email} · {inquiry.type}</p>
      {inquiry.productTitle ? <p className="mt-2 text-sm">About {inquiry.productTitle}</p> : null}
      <p className="my-6 max-w-2xl leading-7">{inquiry.message}</p>
      <InquiryDesk inquiry={inquiry} whatsappNumber={snapshot.settings.whatsappNumber} storeName={snapshot.settings.storeName} />
    </div>
  );
}
