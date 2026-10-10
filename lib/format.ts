import type { Order, OrderItem, Settings } from "@/lib/types";

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(order: Pick<Order, "number" | "customerName" | "phone" | "email" | "address" | "city" | "notes" | "items" | "subtotal">, settings: Pick<Settings, "storeName" | "currency">) {
  const lines = [
    `${settings.storeName} order ${order.number}`,
    "",
    order.customerName,
    order.phone,
    order.email,
    [order.address, order.city].filter(Boolean).join(", "),
    "",
    ...order.items.map((item) => lineFor(item, settings.currency)),
    "",
    `Total ${formatMoney(order.subtotal, settings.currency)}`,
  ];
  if (order.notes.trim()) lines.push("", `Note: ${order.notes.trim()}`);
  return lines.join("\n");
}

function lineFor(item: OrderItem, currency: string) {
  const variant = item.variantTitle ? ` (${item.variantTitle})` : "";
  return `${item.quantity} × ${item.title}${variant} — ${formatMoney(item.unitPrice * item.quantity, currency)}`;
}

export function inquiryMessage(input: { storeName: string; name: string; phone: string; email: string; message: string; productTitle?: string }) {
  const lines = [
    `${input.storeName} inquiry`,
    "",
    input.name,
    input.phone,
    input.email,
  ];
  if (input.productTitle) lines.push("", `About: ${input.productTitle}`);
  lines.push("", input.message);
  return lines.join("\n");
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function parseDevice(width: number): "mobile" | "tablet" | "desktop" {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function parseUserAgent(ua: string) {
  const source = ua || "";
  const browser = /edg\//i.test(source)
    ? "Edge"
    : /chrome|crios/i.test(source)
      ? "Chrome"
      : /firefox|fxios/i.test(source)
        ? "Firefox"
        : /safari/i.test(source)
          ? "Safari"
          : /instagram/i.test(source)
            ? "Instagram"
            : "Other";
  const os = /windows/i.test(source)
    ? "Windows"
    : /android/i.test(source)
      ? "Android"
      : /iphone|ipad|ios/i.test(source)
        ? "iOS"
        : /mac os/i.test(source)
          ? "macOS"
          : /linux/i.test(source)
            ? "Linux"
            : "Other";
  const device = /ipad|tablet/i.test(source)
    ? "tablet"
    : /mobi|iphone|android/i.test(source)
      ? "mobile"
      : "desktop";
  return { browser, os, device: device as "mobile" | "tablet" | "desktop" };
}
