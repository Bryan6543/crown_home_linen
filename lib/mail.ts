import "server-only";

import type { Settings } from "@/lib/types";

export function fillTemplate(source: string, vars: Record<string, string>) {
  return source.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, key: string) => vars[key] ?? "");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function letterHtml(text: string, settings: Pick<Settings, "storeName">) {
  const blocks = text
    .trim()
    .split(/\n\n+/)
    .map((block) => `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<div style="background:#faf7f3;padding:32px 16px;font-family:Georgia,serif;color:#1c1916">
    <div style="max-width:560px;margin:0 auto;background:#fff;padding:36px 32px">
      <p style="letter-spacing:0.22em;font-size:12px;font-family:Arial,sans-serif;margin:0 0 24px">${escapeHtml(settings.storeName).toUpperCase()}</p>
      ${blocks}
    </div>
  </div>`;
}

export async function sendEmail(input: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !input.from.trim()) {
    return { ok: false as const, queued: true, error: "RESEND_API_KEY or the from address is not set." };
  }
  const headers: Record<string, string> = {};
  if (input.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${input.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
      headers,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    return { ok: false as const, queued: false, error: detail.slice(0, 300) || "The mail service refused the letter." };
  }
  return { ok: true as const, queued: false, error: "" };
}
