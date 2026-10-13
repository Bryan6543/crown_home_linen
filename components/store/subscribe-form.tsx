"use client";

import { useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function SubscribeForm({ source, buttonLabel = "Join the list", inline = false }: { source: string; buttonLabel?: string; inline?: boolean }) {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const emailId = useId();
  const nameId = useId();

  async function onSubmit(formData: FormData) {
    setPending(true);
    setResult(null);
    try {
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
      setResult({ ok: response.ok, text: data.message || data.error || (response.ok ? "You are on the list." : "That address did not go through. Try again.") });
    } catch {
      setResult({ ok: false, text: "You seem to be offline. Try again in a moment." });
    } finally {
      setPending(false);
    }
  }

  if (result?.ok) {
    return (
      <p className="rise-in flex items-center gap-3 border border-ok/30 bg-[#f3f8f4] p-4 text-sm text-navy" role="status">
        <CheckCircle2 size={20} className="shrink-0 text-ok" aria-hidden /> {result.text}
      </p>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void onSubmit(new FormData(event.currentTarget)); }} className="space-y-3">
      <div className="hidden" aria-hidden>
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={inline ? "grid gap-3 sm:grid-cols-[0.8fr_1.2fr_auto] sm:items-end" : "space-y-3"}>
        <div>
          <label htmlFor={nameId} className="field-label">
            Name <span className="font-normal normal-case tracking-normal text-muted/80">(optional)</span>
          </label>
          <input id={nameId} name="name" autoComplete="given-name" maxLength={80} className="field" />
        </div>
        <div>
          <label htmlFor={emailId} className="field-label">Email</label>
          <input id={emailId} name="email" type="email" required autoComplete="email" maxLength={160} className="field" aria-invalid={result && !result.ok ? true : undefined} />
        </div>
        <button type="submit" disabled={pending} data-track="Join the list" data-track-id={`subscribe-${source}`} className={`btn-ink disabled:opacity-60 ${inline ? "h-[3.1rem] w-full sm:w-auto" : "w-full"}`}>
          {pending ? "Saving…" : buttonLabel}
        </button>
      </div>
      {result && !result.ok ? (
        <p className="text-sm text-danger" role="alert">
          {result.text}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-muted">A short note when new stock arrives. Every letter has a link to leave the list.</p>
    </form>
  );
}
