import type { OrderStatus } from "@/lib/types";

export const ORDER_FLOW: { id: OrderStatus; label: string; detail: string }[] = [
  { id: "new", label: "Received", detail: "The house has the order and has not opened it yet." },
  { id: "accepted", label: "Accepted", detail: "We have accepted the order and will confirm the details." },
  { id: "confirmed", label: "Confirmed", detail: "The cloth, the total, and the address are agreed." },
  { id: "packed", label: "Packed", detail: "It is folded and waiting for the courier." },
  { id: "shipped", label: "On the way", detail: "It has left the cupboard." },
  { id: "fulfilled", label: "Delivered", detail: "The order is complete." },
];

export function statusLabel(status: OrderStatus) {
  if (status === "cancelled") return "Cancelled";
  return ORDER_FLOW.find((step) => step.id === status)?.label || status;
}

export function statusIndex(status: OrderStatus) {
  return ORDER_FLOW.findIndex((step) => step.id === status);
}
