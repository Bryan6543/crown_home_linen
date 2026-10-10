import { NextResponse } from "next/server";
import { z } from "zod";
import { inquiryMessage, parseUserAgent, whatsappUrl } from "@/lib/format";
import { createInquiry, getSnapshot, recordEvents } from "@/lib/repo";

const schema = z.object({
  clientToken: z.string().trim().min(8).max(80),
  type: z.enum(["contact", "product", "newsletter"]),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(32),
  email: z.string().trim().max(120).default(""),
  message: z.string().trim().min(4).max(1200),
  productTitle: z.string().max(160).default(""),
  productSlug: z.string().max(160).default(""),
  pagePath: z.string().max(200).default("/contact"),
  company: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Add a name, a phone number, and a short note." }, { status: 400 });
  }
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const snapshot = await getSnapshot();
  const inquiry = await createInquiry({
    type: parsed.data.type,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    message: parsed.data.message,
    productTitle: parsed.data.productTitle,
    productSlug: parsed.data.productSlug,
    pagePath: parsed.data.pagePath,
    clientToken: parsed.data.clientToken,
  });

  const agent = parseUserAgent(request.headers.get("user-agent") || "");
  await recordEvents([
    {
      type: "inquiry_submit",
      path: parsed.data.pagePath,
      label: parsed.data.type,
      elementId: "inquiry-submit",
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

  const text = inquiryMessage({
    storeName: snapshot.settings.storeName,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    message: inquiry.message,
    productTitle: inquiry.productTitle,
  });

  return NextResponse.json({
    id: inquiry.id,
    whatsappUrl: whatsappUrl(snapshot.settings.whatsappNumber, text),
  });
}
