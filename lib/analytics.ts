import type { AnalyticsEvent, DeviceType } from "@/lib/types";

export type AnalyticsSummary = {
  pageViews: number;
  sessions: number;
  buttonClicks: number;
  whatsappClicks: number;
  addToCart: number;
  orders: number;
  inquiries: number;
  devices: Record<DeviceType, number>;
  browsers: { name: string; count: number }[];
  systems: { name: string; count: number }[];
  sources: { name: string; count: number }[];
  topPages: { path: string; count: number }[];
  topButtons: { label: string; count: number }[];
  byDay: { date: string; views: number; clicks: number }[];
  sample: boolean;
};

function countBy(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function summarizeEvents(events: AnalyticsEvent[], days: number, now = new Date()): AnalyticsSummary {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const filtered = events.filter((event) => new Date(event.createdAt) >= start);
  const views = filtered.filter((event) => event.type === "page_view");
  const clicks = filtered.filter((event) => event.type === "button_click");
  const byDay: AnalyticsSummary["byDay"] = [];
  for (let index = 0; index < days; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    const key = day.toISOString().slice(0, 10);
    byDay.push({
      date: key.slice(5),
      views: views.filter((event) => event.createdAt.slice(0, 10) === key).length,
      clicks: clicks.filter((event) => event.createdAt.slice(0, 10) === key).length,
    });
  }
  return {
    pageViews: views.length,
    sessions: new Set(views.map((event) => event.sessionId)).size,
    buttonClicks: clicks.length,
    whatsappClicks: filtered.filter((event) => event.type === "whatsapp_click").length,
    addToCart: filtered.filter((event) => event.type === "add_to_cart").length,
    orders: filtered.filter((event) => event.type === "order_submit").length,
    inquiries: filtered.filter((event) => event.type === "inquiry_submit").length,
    devices: {
      mobile: filtered.filter((event) => event.device === "mobile").length,
      tablet: filtered.filter((event) => event.device === "tablet").length,
      desktop: filtered.filter((event) => event.device === "desktop").length,
    },
    browsers: countBy(filtered.map((event) => event.browser || "Other")).slice(0, 6),
    systems: countBy(filtered.map((event) => event.os || "Other")).slice(0, 6),
    sources: countBy(views.map((event) => event.utmSource || sourceFromReferrer(event.referrer))).slice(0, 8),
    topPages: countBy(views.map((event) => event.path || "/"))
      .slice(0, 8)
      .map((row) => ({ path: row.name, count: row.count })),
    topButtons: countBy(clicks.map((event) => event.label || event.elementId || "Button"))
      .slice(0, 8)
      .map((row) => ({ label: row.name, count: row.count })),
    byDay,
    sample: filtered.some((event) => event.sessionId.startsWith("sample-")),
  };
}

function sourceFromReferrer(referrer: string) {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}
