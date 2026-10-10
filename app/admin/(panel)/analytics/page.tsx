import Link from "next/link";
import { VisitChart } from "@/components/admin/chart";
import { summarizeEvents } from "@/lib/analytics";
import { formatWhen } from "@/lib/format";
import { getSnapshot } from "@/lib/repo";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const days = params.days === "7" || params.days === "30" ? Number(params.days) : 14;
  const snapshot = await getSnapshot();
  const summary = summarizeEvents(snapshot.events, days);
  const recent = [...snapshot.events].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 25);
  return (
    <div>
      <h1 className="font-serif text-5xl">Analytics</h1>
      <div className="mt-4 flex gap-4 text-sm">
        {[7, 14, 30].map((value) => (
          <Link key={value} href={`/admin/analytics?days=${value}`} className={value === days ? "underline" : ""}>{value} days</Link>
        ))}
      </div>
      {summary.sample ? <p className="mt-3 text-sm text-muted">Sample visits are included until live traffic replaces the habit of an empty board.</p> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-white p-4"><p className="eyebrow">Visits</p><p className="font-serif text-4xl">{summary.pageViews}</p></div>
        <div className="border border-line bg-white p-4"><p className="eyebrow">Sessions</p><p className="font-serif text-4xl">{summary.sessions}</p></div>
        <div className="border border-line bg-white p-4"><p className="eyebrow">Clicks</p><p className="font-serif text-4xl">{summary.buttonClicks}</p></div>
      </div>
      <div className="mt-6 border border-line bg-white p-4"><VisitChart data={summary.byDay} /></div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <CountList title="Devices" rows={[["Mobile", summary.devices.mobile], ["Tablet", summary.devices.tablet], ["Desktop", summary.devices.desktop]]} />
        <CountList title="Where they came from" rows={summary.sources.map((row) => [row.name, row.count])} />
        <CountList title="Pages" rows={summary.topPages.map((row) => [row.path, row.count])} />
        <CountList title="Buttons" rows={summary.topButtons.map((row) => [row.label, row.count])} />
        <CountList title="Browsers" rows={summary.browsers.map((row) => [row.name, row.count])} />
        <CountList title="Systems" rows={summary.systems.map((row) => [row.name, row.count])} />
      </div>
      <table className="admin-table mt-8 bg-white">
        <thead><tr><th>When</th><th>Type</th><th>Path</th><th>Device</th><th>Browser</th><th>Source</th></tr></thead>
        <tbody>
          {recent.map((event) => (
            <tr key={event.id}>
              <td>{formatWhen(event.createdAt)}</td>
              <td>{event.type}</td>
              <td>{event.path}</td>
              <td>{event.device}</td>
              <td>{event.browser}</td>
              <td>{event.utmSource || event.referrer || "Direct"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CountList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section>
      <h2 className="font-serif text-3xl">{title}</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {rows.map(([label, count]) => (
          <li key={label} className="flex justify-between border-b border-line py-1"><span>{label}</span><span>{count}</span></li>
        ))}
      </ul>
    </section>
  );
}
