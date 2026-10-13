import { NextResponse } from "next/server";
import { z } from "zod";
import { digitsOnly, inquiryMessage, parseUserAgent, whatsappUrl } from "@/lib/format";
import { createInquiry, getStorefront, recordEvents } from "@/lib/repo";

const schema = z.object({
  clientToken: z.string().trim().min(8).max(80),
  type: z.enum(["contact", "product", "newsletter", "wholesale"]),
  name: z.string().trim().min(2, "Add your name.").max(80),
  phone: z
    .string()
    .trim()
    .max(32)
    .refine((value) => digitsOnly(value).length >= 9, "Add a phone number we can reach on WhatsApp."),
  email: z.union([z.literal(""), z.string().trim().email("Check the email address.").max(120)]).default(""),
  message: z.string().trim().min(4, "Write a short note so we know what you need.").max(1200, "Keep the note under 1,200 characters."),
  productTitle: z.string().max(160).default(""),
  productSlug: z.string().max(160).default(""),
  pagePath: z.string().max(200).default("/contact"),
  company: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = String(first?.path[0] ?? "");
    const friendly = ["name", "phone", "email", "message"].includes(field);
    return NextResponse.json({ error: friendly ? first.message : "Add a name, a phone number, and a short note.", field }, { status: 400 });
  }
  // Honeypot: a person never fills the hidden company field.
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const snapshot = await getStorefront();
  let inquiry;
  try {
    inquiry = await createInquiry({
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
  } catch (error) {
    console.error("inquiry failed", error);
    return NextResponse.json(
      { error: "The note could not be saved just now. Message us on WhatsApp directly.", whatsappUrl: whatsappUrl(snapshot.settings.whatsappNumber, parsed.data.message) },
      { status: 503 },
    );
  }

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
    wholesale: inquiry.type === "wholesale",
  });

  return NextResponse.json({
    id: inquiry.id,
    whatsappUrl: whatsappUrl(snapshot.settings.whatsappNumber, text),
  });
}
