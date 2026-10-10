"use client";

import { useState } from "react";
import { saveCampaignAction, saveTemplateAction, sendCampaignAction } from "@/app/actions/admin";
import { formatWhen } from "@/lib/format";
import type { Campaign, Delivery, EmailTemplate, Subscriber } from "@/lib/types";

export function MailDesk({
  subscribers,
  campaigns,
  templates,
  deliveries,
}: {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  templates: EmailTemplate[];
  deliveries: Delivery[];
}) {
  const [letters, setLetters] = useState(templates);
  const [drafts, setDrafts] = useState(campaigns);
  const [message, setMessage] = useState("");
  const active = subscribers.filter((subscriber) => subscriber.status === "active").length;

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-serif text-3xl">Subscribers</h2>
        <p className="mt-2 text-sm text-muted">{active} active · {subscribers.length - active} left the list. Addresses ending in @example.com are sample rows and are never mailed.</p>
        <table className="admin-table mt-4 bg-white">
          <thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Returns</th><th>Since</th></tr></thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td>{subscriber.email}</td>
                <td>{subscriber.name}</td>
                <td>{subscriber.status}</td>
                <td>{subscriber.resubscribeCount}</td>
                <td>{formatWhen(subscriber.subscribedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl">Automatic letters</h2>
        <p className="text-sm text-muted">Welcome goes to a new address. Welcome back goes to someone who left and joined again. Order update goes when you tick the box on an order. Use {"{{name}}"}, {"{{store_name}}"}, {"{{unsubscribe_url}}"}, and for orders {"{{order_number}}"}, {"{{status_label}}"}, {"{{public_note}}"}, {"{{order_url}}"}.</p>
        {letters.map((template) => (
          <div key={template.id} className="space-y-2 border border-line bg-white p-4">
            <p className="eyebrow">{template.name}</p>
            <input className="field" value={template.subject} onChange={(event) => setLetters(letters.map((item) => item.id === template.id ? { ...item, subject: event.target.value } : item))} />
            <textarea className="field min-h-36" value={template.body} onChange={(event) => setLetters(letters.map((item) => item.id === template.id ? { ...item, body: event.target.value } : item))} />
            <button type="button" className="btn-ink" onClick={() => void saveTemplateAction(template).then((result) => setMessage("error" in result ? result.error || "Could not save." : "Letter saved."))}>Save letter</button>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-3xl">Campaigns</h2>
        <p className="text-sm text-muted">A campaign sends once to every active subscriber. Someone who already received it is skipped if you send again after a failure. Each letter carries a one-click unsubscribe link.</p>
        {drafts.map((campaign) => (
          <div key={campaign.id} className="space-y-2 border border-line bg-white p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{campaign.status}{campaign.sentAt ? ` · ${formatWhen(campaign.sentAt)} · sent ${campaign.sentCount}, failed ${campaign.failedCount}` : ""}</p>
            <input className="field" value={campaign.name} onChange={(event) => setDrafts(drafts.map((item) => item.id === campaign.id ? { ...item, name: event.target.value } : item))} />
            <input className="field" value={campaign.subject} onChange={(event) => setDrafts(drafts.map((item) => item.id === campaign.id ? { ...item, subject: event.target.value } : item))} />
            <textarea className="field min-h-36" value={campaign.body} onChange={(event) => setDrafts(drafts.map((item) => item.id === campaign.id ? { ...item, body: event.target.value } : item))} />
            <div className="flex gap-3">
              <button type="button" className="btn-line" onClick={() => void saveCampaignAction(campaign).then((result) => setMessage("error" in result ? result.error || "Could not save." : "Campaign saved."))}>Save draft</button>
              <button type="button" className="btn-ink" onClick={() => {
                if (!confirm(`Send “${campaign.name}” to active addresses, excluding sample rows?`)) return;
                void saveCampaignAction(campaign).then(async (saved) => {
                  if ("error" in saved) {
                    setMessage(saved.error || "Could not save.");
                    return;
                  }
                  const result = await sendCampaignAction(campaign.id);
                  setMessage("error" in result ? result.error || "Send failed." : `Sent ${result.sentCount}. Failed ${result.failedCount}.`);
                });
              }}>Send campaign</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-line" onClick={() => setDrafts([{ id: crypto.randomUUID(), name: "New letter", subject: "", body: "{{name}},\n\n\n\n{{store_name}}", status: "draft", sentCount: 0, failedCount: 0, createdAt: new Date().toISOString(), sentAt: null }, ...drafts])}>New campaign</button>
      </section>

      {deliveries.length > 0 ? (
        <section>
          <h2 className="font-serif text-3xl">Recent sends</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {deliveries.slice(0, 12).map((delivery) => (
              <li key={delivery.id}>{delivery.email} · {delivery.status}{delivery.error ? ` · ${delivery.error}` : ""}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
