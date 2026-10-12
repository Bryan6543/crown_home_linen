"use client";

import { useState } from "react";

export function SubscribeForm({ source, buttonLabel = "Join the list", dark = false }: { source: string; buttonLabel?: string; dark?: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        name: formData.get("name") || "",
        source,
        company: formData.get("company") || "",
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    setPending(false);
    setMessage(data.message || data.error || "The list did not take that address.");
  }

  return (
    <form action={onSubmit} className="space-y-3">
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="name" placeholder="Name" className={`field ${dark ? "border-gold/40 bg-transparent text-paper placeholder:text-white/50" : ""}`} />
      <input name="email" type="email" required placeholder="Email" className={`field ${dark ? "border-gold/40 bg-transparent text-paper placeholder:text-white/50" : ""}`} />
      <button type="submit" disabled={pending} data-track="Join the list" data-track-id={`subscribe-${source}`} className={dark ? "btn-brass w-full" : "btn-ink w-full"}>
        {pending ? "Saving" : buttonLabel}
      </button>
      {message ? <p className="text-sm">{message}</p> : null}
      <p className={`text-xs leading-5 ${dark ? "text-mist" : "text-muted"}`}>One letter at a time. You can leave the list from any letter, without writing to us.</p>
    </form>
  );
}
