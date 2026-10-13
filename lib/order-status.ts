import type { OrderStatus } from "@/lib/types";

export const ORDER_FLOW: { id: OrderStatus; label: string; detail: string }[] = [
  { id: "new", label: "Received", detail: "Crown has your order and will reply on WhatsApp." },
  { id: "accepted", label: "Accepted", detail: "We have accepted the order and are checking stock." },
  { id: "confirmed", label: "Confirmed", detail: "Items, total, and delivery are agreed." },
  { id: "packed", label: "Packed", detail: "Packed and ready for delivery or collection." },
  { id: "shipped", label: "On the way", detail: "With the courier, on its way to you." },
  { id: "fulfilled", label: "Delivered", detail: "Delivered or collected. Thank you." },
];

export function statusLabel(status: OrderStatus) {
  if (status === "cancelled") return "Cancelled";
  return ORDER_FLOW.find((step) => step.id === status)?.label || status;
}

export function statusIndex(status: OrderStatus) {
  return ORDER_FLOW.findIndex((step) => step.id === status);
}
