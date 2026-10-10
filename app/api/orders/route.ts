import { NextResponse } from "next/server";
import { z } from "zod";
import { orderMessage, whatsappUrl } from "@/lib/format";
import { createOrder, getSnapshot, recordEvents } from "@/lib/repo";
import { parseUserAgent } from "@/lib/format";

const schema = z.object({
  clientToken: z.string().trim().min(8).max(80),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(32),
  email: z.string().trim().max(120).default(""),
  address: z.string().trim().min(4).max(200),
  city: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).default(""),
  sourcePath: z.string().trim().max(200).default("/cart"),
  company: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(12),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the name, phone, address, and bag." }, { status: 400 });
  }
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const snapshot = await getSnapshot();
  const items = [];
  for (const line of parsed.data.items) {
    const product = snapshot.products.find((item) => item.id === line.productId && item.status === "active");
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant || !variant.available) {
      return NextResponse.json({ error: "A piece in the bag is no longer available." }, { status: 400 });
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
  const order = await createOrder({
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
