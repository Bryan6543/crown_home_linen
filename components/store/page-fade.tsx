"use client";

import { usePathname } from "next/navigation";

// A short fade between pages. Keyed on the path only, so filtering the shop
// (which changes the query string) does not replay it.
export function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
