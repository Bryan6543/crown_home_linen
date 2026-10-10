import { NextResponse } from "next/server";
import { z } from "zod";
import { statusLabel } from "@/lib/order-status";
import { findOrderForCustomer } from "@/lib/repo";

const schema = z.object({
  number: z.string().trim().min(4).max(24),
  phone: z.string().trim().min(6).max(32),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the order number and the phone on the order." }, { status: 400 });
  const order = await findOrderForCustomer(parsed.data.number, parsed.data.phone);
  if (!order) return NextResponse.json({ error: "Those details do not match an order." }, { status: 404 });
  return NextResponse.json({
    order: {
      number: order.number,
      status: order.status,
      statusLabel: statusLabel(order.status),
      publicNote: order.publicNote,
      customerName: order.customerName,
      city: order.city,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      items: order.items.map((item) => ({
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      timeline: order.activities.filter((activity) => activity.visible),
    },
  });
}
