"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/store/cart";
import { formatMoney } from "@/lib/format";

function token() {
  return crypto.randomUUID();
}

export function InquiryForm({
  type,
  buttonLabel,
  pagePath,
  productTitle = "",
  productSlug = "",
}: {
  type: "contact" | "product" | "newsletter";
  buttonLabel: string;
  pagePath: string;
  productTitle?: string;
  productSlug?: string;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        clientToken: token(),
        type,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email") || "",
        message: formData.get("message"),
        productTitle,
        productSlug,
        pagePath,
        company: formData.get("company") || "",
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; whatsappUrl?: string };
    setPending(false);
    if (!response.ok || !data.whatsappUrl) {
      setError(data.error || "The note did not leave the desk. Try again.");
      return;
    }
    window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="name" required placeholder="Name" className="field" />
      <input name="phone" required placeholder="WhatsApp number" className="field" />
      <input name="email" type="email" placeholder="Email, if you use one" className="field" />
      <textarea name="message" required placeholder={type === "newsletter" ? "What should we keep aside?" : "Your note"} className="field min-h-32" />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} data-track={buttonLabel} data-track-id="send-inquiry" data-track-type="whatsapp_click" className="btn-ink w-full">
        {pending ? "Opening WhatsApp" : buttonLabel}
      </button>
    </form>
  );
}

export function CartView() {
  const cart = useCart();
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <h1 className="font-serif text-5xl">Bag</h1>
        {cart.lines.length === 0 ? (
          <p className="mt-6 text-muted">Nothing folded in here yet.</p>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5">
                <div className="relative h-28 w-24 bg-sand">
                  {line.imageUrl ? <Image src={line.imageUrl} alt="" fill className="object-cover" sizes="96px" /> : null}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${line.slug}`} className="font-serif text-2xl">
                    {line.title}
                  </Link>
                  <p className="text-sm text-muted">{line.variantTitle}</p>
                  <p className="mt-2 text-sm">{formatMoney(line.unitPrice, cart.currency)}</p>
                  <label className="mt-3 block text-xs uppercase tracking-[0.14em] text-muted">
                    Quantity
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(event) => cart.setQuantity(line.key, Number(event.target.value))}
                      className="ml-3 w-16 border border-line bg-white px-2 py-1 text-ink"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CheckoutForm />
    </div>
  );
}

export function CheckoutForm() {
  const cart = useCart();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    setPending(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        clientToken: token(),
        customerName: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email") || "",
        address: formData.get("address"),
        city: formData.get("city"),
        notes: formData.get("notes") || "",
        sourcePath: "/cart",
        company: formData.get("company") || "",
        items: cart.lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
        })),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; whatsappUrl?: string; orderNumber?: string };
    setPending(false);
    if (!response.ok || !data.whatsappUrl) {
      setError(data.error || "The order did not reach the house book.");
      return;
    }
    setOrderNumber(data.orderNumber || "");
    cart.clear();
    window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (cart.lines.length === 0 && !orderNumber) {
    return <p className="text-muted">Your bag is empty.</p>;
  }

  if (orderNumber && cart.lines.length === 0) {
    return (
      <div className="border border-line bg-white p-6">
        <p className="eyebrow">Order {orderNumber}</p>
        <h2 className="mt-3 font-serif text-4xl">The thread is open.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">WhatsApp should be in another window. If it did not open, use the green button and mention {orderNumber}. You can look the order up later under Your orders, with this number and your phone.</p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="name" required placeholder="Name" className="field" />
        <input name="phone" required placeholder="WhatsApp number" className="field" />
      </div>
      <input name="email" type="email" placeholder="Email" className="field" />
      <input name="address" required placeholder="Street address" className="field" />
      <input name="city" required placeholder="City" className="field" />
      <textarea name="notes" placeholder="A note for the packer" className="field min-h-24" />
      <div className="flex items-center justify-between py-2 text-sm">
        <span>Subtotal</span>
        <span>{formatMoney(cart.subtotal, cart.currency)}</span>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" disabled={pending} data-track="Order on WhatsApp" data-track-id="order-whatsapp" data-track-type="whatsapp_click" className="btn-ink w-full">
        {pending ? "Saving the order" : "Order on WhatsApp"}
      </button>
      <p className="text-xs leading-5 text-muted">The bag is saved in the house book first. Payment is arranged in the WhatsApp thread, never on this page.</p>
    </form>
  );
}
