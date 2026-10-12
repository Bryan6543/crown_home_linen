import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leave the list" };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <p className="eyebrow">The list</p>
      <h1 className="mt-2 gold-text font-serif text-5xl font-bold">Leave the letters</h1>
      <p className="mt-4 text-sm leading-7 text-muted">This removes only the email list. Orders you already placed stay in the house book. You can join again later, and we will treat that as a return, not a new stranger.</p>
      <form action={unsubscribe} className="mt-8">
        <input type="hidden" name="token" value={token} />
        <button className="btn-ink">Leave the list</button>
      </form>
    </div>
  );
}

async function unsubscribe(formData: FormData) {
  "use server";
  const { unsubscribeByToken } = await import("@/lib/repo");
  const { redirect } = await import("next/navigation");
  const token = String(formData.get("token") || "");
  const result = await unsubscribeByToken(token);
  redirect(`/unsubscribe/done?result=${result}`);
}
