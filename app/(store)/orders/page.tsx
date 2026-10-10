import type { Metadata } from "next";
import { OrderLookup } from "@/components/store/order-lookup";
import { getSnapshot } from "@/lib/repo";

export const metadata: Metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const snapshot = await getSnapshot();
  return <OrderLookup currency={snapshot.settings.currency} />;
}
