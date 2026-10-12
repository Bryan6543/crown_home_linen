"use client";

import { useState } from "react";
import { formatMoney, formatWhen } from "@/lib/format";
import { ORDER_FLOW, statusIndex } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

type Found = {
  number: string;
  status: OrderStatus;
  statusLabel: string;
  publicNote: string;
  customerName: string;
  city: string;
  createdAt: string;
  subtotal: number;
  items: { title: string; variantTitle: string; quantity: number; unitPrice: number }[];
  timeline: { id: string; at: string; message: string }[];
};

export function OrderLookup({ currency }: { currency: string }) {
  const [order, setOrder] = useState<Found | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const step = order ? statusIndex(order.status) : -1;

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const response = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ number: formData.get("number"), phone: formData.get("phone") }),
    });
    const data = (await response.json().catch(() => ({}))) as { order?: Found; error?: string };
    setPending(false);
    if (!response.ok || !data.order) {
      setOrder(null);
      setError(data.error || "We could not find that order.");
      return;
    }
    setOrder(data.order);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">Your orders</p>
      <h1 className="mt-2 gold-text font-serif text-5xl font-bold">Where the cloth is</h1>
      <p className="mt-4 text-sm leading-6 text-muted">Use the order number from WhatsApp and the phone you gave with the order. Staff notes stay in the house book.</p>
      <form action={onSubmit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input name="number" required placeholder="CHL-1001" className="field" />
        <input name="phone" required placeholder="Phone on the order" className="field" />
        <button className="btn-ink" disabled={pending} data-track="Look up order" data-track-id="order-lookup">{pending ? "Looking" : "Look up"}</button>
      </form>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {order ? (
        <article className="mt-10 border border-line bg-white p-6">
          <p className="eyebrow">{order.number}</p>
          <h2 className="mt-2 font-serif text-4xl">{order.status === "cancelled" ? "Cancelled" : order.statusLabel}</h2>
          <p className="mt-2 text-sm text-muted">{order.customerName} · {order.city} · {formatWhen(order.createdAt)}</p>
          {order.status !== "cancelled" ? (
            <ol className="mt-8 grid gap-3 sm:grid-cols-3">
              {ORDER_FLOW.map((item, index) => (
                <li key={item.id} className={`border px-3 py-3 text-sm ${index <= step ? "border-ink bg-ivory" : "border-line text-muted"}`}>
                  <span className="block text-[10px] uppercase tracking-[0.16em]">{index <= step ? "Done" : "Ahead"}</span>
                  {item.label}
                </li>
              ))}
            </ol>
          ) : null}
          {order.publicNote ? <p className="mt-6 leading-7">{order.publicNote}</p> : null}
          <ul className="mt-6 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={`${item.title}-${item.variantTitle}`}>{item.quantity} × {item.title} ({item.variantTitle}) — {formatMoney(item.unitPrice * item.quantity, currency)}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">Total {formatMoney(order.subtotal, currency)}</p>
          <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm text-muted">
            {order.timeline.map((entry) => (
              <li key={entry.id}>{formatWhen(entry.at)} — {entry.message}</li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  );
}
