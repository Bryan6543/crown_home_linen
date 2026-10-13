import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_LINE_QUANTITY } from "@/lib/catalog";
import { digitsOnly, orderMessage, parseUserAgent, whatsappUrl } from "@/lib/format";
import { DuplicateOrderError, createOrder, getStorefront, recordEvents } from "@/lib/repo";

const schema = z.object({
  clientToken: z.string().trim().min(8).max(80),
  customerName: z.string().trim().min(2, "Add your name.").max(80),
  phone: z
    .string()
    .trim()
    .max(32)
    .refine((value) => digitsOnly(value).length >= 9, "Add a phone number we can reach on WhatsApp."),
  email: z.union([z.literal(""), z.string().trim().email("Check the email address.").max(120)]).default(""),
  address: z.string().trim().min(4, "Add the delivery address.").max(200),
  city: z.string().trim().min(2, "Add the town or city.").max(80),
  notes: z.string().trim().max(500).default(""),
  sourcePath: z.string().trim().max(200).default("/cart"),
  company: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
      }),
    )
    .min(1, "The bag is empty.")
    .max(60),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = String(first?.path[0] ?? "");
    const message =
      field === "items"
        ? first.code === "too_small"
          ? "The bag is empty."
          : `Up to ${MAX_LINE_QUANTITY} of each size per order. For more, ask us for a wholesale quote.`
        : ["customerName", "phone", "email", "address", "city"].includes(field)
          ? first.message
          : "Check the name, phone, address, and bag.";
    return NextResponse.json({ error: message, field }, { status: 400 });
  }
  // Honeypot: a person never fills the hidden company field.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const snapshot = await getStorefront();
  const items = [];
  for (const line of parsed.data.items) {
    const product = snapshot.products.find((item) => item.id === line.productId && item.status === "active");
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant || !variant.available) {
      return NextResponse.json(
        {
          error: product ? `${product.title}${variant ? ` (${variant.title})` : ""} is no longer available. Remove it from the bag and send again.` : "An item in the bag is no longer sold. Remove it and send again.",
          unavailable: line.variantId,
        },
        { status: 409 },
      );
    }
    items.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantId: variant.id,
      variantTitle: variant.title,
      sku: variant.sku,
      quantity: line.quantity,
      unitPrice: variant.price,
      imageUrl: variant.imageUrl || product.images[0]?.url || "",
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let order;
  try {
    order = await createOrder({
      clientToken: parsed.data.clientToken,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes,
      staffNotes: "",
      publicNote: "",
      items,
      subtotal,
      status: "new",
      sourcePath: parsed.data.sourcePath,
    });
  } catch (error) {
    if (error instanceof DuplicateOrderError) {
      return NextResponse.json({ error: "This order was already sent. Check WhatsApp, or look it up under Your orders." }, { status: 409 });
    }
    console.error("order failed", error);
    return NextResponse.json(
      { error: "The order could not be saved just now. Message us on WhatsApp and we will take it by hand.", whatsappUrl: whatsappUrl(snapshot.settings.whatsappNumber, snapshot.settings.whatsappGreeting) },
      { status: 503 },
    );
  }

  const agent = parseUserAgent(request.headers.get("user-agent") || "");
  await recordEvents([
    {
      type: "order_submit",
      path: parsed.data.sourcePath,
      label: order.number,
      elementId: "order-submit",
      referrer: request.headers.get("referer") || "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      device: agent.device,
      browser: agent.browser,
      os: agent.os,
      screen: "",
      sessionId: parsed.data.clientToken,
    },
  ]).catch(() => undefined);

  const text = orderMessage(order, snapshot.settings);
  return NextResponse.json({
    orderNumber: order.number,
    whatsappUrl: whatsappUrl(snapshot.settings.whatsappNumber, text),
  });
}
