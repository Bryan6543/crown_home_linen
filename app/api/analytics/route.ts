import { NextResponse } from "next/server";
import { z } from "zod";
import { parseUserAgent } from "@/lib/format";
import { recordEvents } from "@/lib/repo";

const eventSchema = z.object({
  type: z.enum(["page_view", "button_click", "add_to_cart", "whatsapp_click", "search"]),
  path: z.string().max(200),
  label: z.string().max(160).default(""),
  elementId: z.string().max(80).default(""),
  referrer: z.string().max(300).default(""),
  utmSource: z.string().max(80).default(""),
  utmMedium: z.string().max(80).default(""),
  utmCampaign: z.string().max(80).default(""),
  screen: z.string().max(20).default(""),
  sessionId: z.string().min(6).max(80),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
});

const schema = z.object({
  events: z.array(eventSchema).min(1).max(20),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const agent = parseUserAgent(request.headers.get("user-agent") || "");
  await recordEvents(
    parsed.data.events.map((event) => ({
      ...event,
      label: event.label,
      elementId: event.elementId,
      device: event.device || agent.device,
      browser: agent.browser,
      os: agent.os,
    })),
  ).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
