"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sessionId() {
  const key = "chl-visitor";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(key, created);
  return created;
}

function device() {
  const width = window.innerWidth;
  if (width < 768) return "mobile" as const;
  if (width < 1024) return "tablet" as const;
  return "desktop" as const;
}

function campaign() {
  const params = new URLSearchParams(window.location.search);
  const read = (name: string) => {
    const fresh = params.get(name);
    if (fresh) sessionStorage.setItem(name, fresh);
    return fresh || sessionStorage.getItem(name) || "";
  };
  return {
    utmSource: read("utm_source"),
    utmMedium: read("utm_medium"),
    utmCampaign: read("utm_campaign"),
  };
}

export function track(event: { type: "page_view" | "button_click" | "add_to_cart" | "whatsapp_click" | "search"; path?: string; label?: string; elementId?: string }) {
  if (typeof window === "undefined") return;
  const utm = campaign();
  const payload = {
    type: event.type,
    path: event.path || window.location.pathname,
    label: event.label || "",
    elementId: event.elementId || "",
    referrer: document.referrer || "",
    screen: `${window.innerWidth}x${window.innerHeight}`,
    sessionId: sessionId(),
    device: device(),
    ...utm,
  };
  const body = JSON.stringify({ events: [payload] });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
  else void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  if (window.gtag) {
    window.gtag("event", event.type, {
      event_label: payload.label,
      page_path: payload.path,
      button_id: payload.elementId,
      device: payload.device,
    });
  }
}

export function Analytics({ measurementId }: { measurementId: string }) {
  const gaId = measurementId.replace(/[^A-Za-z0-9-]/g, "");
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();

  useEffect(() => {
    track({ type: "page_view", path: query ? `${pathname}?${query}` : pathname, label: document.title });
    if (window.gtag && gaId) {
      window.gtag("config", gaId, { page_path: pathname });
    }
  }, [gaId, pathname, query]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const element = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!element) return;
      const label = element.dataset.track || element.textContent?.trim() || "Button";
      const elementId = element.dataset.trackId || "";
      const kind = element.dataset.trackType;
      track({
        type: kind === "whatsapp_click" || kind === "add_to_cart" || kind === "search" ? kind : "button_click",
        label,
        elementId,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!gaId) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
