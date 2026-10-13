import type { Metadata } from "next";
import { OrderLookup } from "@/components/store/order-lookup";
import { whatsappUrl } from "@/lib/format";
import { getStorefront } from "@/lib/repo";

export const metadata: Metadata = { title: "Track an order", robots: { index: false } };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ number?: string }> }) {
  const { number = "" } = await searchParams;
  const snapshot = await getStorefront();
  return (
    <OrderLookup
      currency={snapshot.settings.currency}
      initialNumber={number.slice(0, 24)}
      whatsappHref={whatsappUrl(snapshot.settings.whatsappNumber, number ? `Hello Crown, about my order ${number.slice(0, 24)}:` : snapshot.settings.whatsappGreeting)}
    />
  );
}
