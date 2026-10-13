import { NextResponse } from "next/server";
import { z } from "zod";
import { fillTemplate, letterHtml, sendEmail } from "@/lib/mail";
import { defaultTemplates } from "@/lib/migrate";
import { getStorefront, subscribeEmail } from "@/lib/repo";

const schema = z.object({
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(80).default(""),
  source: z.string().trim().max(40).default("site"),
  company: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a real email address." }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ result: "created" });

  const { result, subscriber } = await subscribeEmail(parsed.data);
  if (result === "already") {
    return NextResponse.json({ result, message: "That address is already on the list." });
  }

  const snapshot = await getStorefront();
  // Visitors cannot read the templates table, so the built-in letter stands in.
  const templateId = result === "resubscribed" ? "welcome_back" : "welcome";
  const template = [...snapshot.templates, ...defaultTemplates()].find((item) => item.id === templateId);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const unsubscribeUrl = `${origin}/unsubscribe?token=${subscriber.token}`;
  const vars = {
    name: subscriber.name || "there",
    store_name: snapshot.settings.storeName,
    unsubscribe_url: unsubscribeUrl,
  };
  const text = fillTemplate(template?.body || "", vars);
  const subject = fillTemplate(template?.subject || snapshot.settings.storeName, vars);
  const sent = await sendEmail({
    from: process.env.EMAIL_FROM || snapshot.settings.emailFrom,
    to: subscriber.email,
    subject,
    text,
    html: letterHtml(text, snapshot.settings),
    unsubscribeUrl,
  });

  const message =
    result === "resubscribed"
      ? sent.ok
        ? "You are back on the list. A note is on its way."
        : "You are back on the list."
      : sent.ok
        ? "You are on the list. A short welcome is on its way."
        : "You are on the list.";

  return NextResponse.json({ result, message, emailed: sent.ok });
}
