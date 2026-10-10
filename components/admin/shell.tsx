"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const links = [
  ["/admin", "Overview"],
  ["/admin/products", "Pieces"],
  ["/admin/categories", "Collections"],
  ["/admin/orders", "Orders"],
  ["/admin/inquiries", "Inquiries"],
  ["/admin/customers", "Customers"],
  ["/admin/mail", "Letters"],
  ["/admin/banners", "Banners"],
  ["/admin/pages", "Pages"],
  ["/admin/navigation", "Navigation"],
  ["/admin/testimonials", "Notes"],
  ["/admin/faqs", "Questions"],
  ["/admin/analytics", "Analytics"],
  ["/admin/settings", "Settings"],
];

export function Shell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-ivory md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-paper md:min-h-screen">
        <div className="px-5 py-6">
          <p className="font-serif text-3xl tracking-[0.14em]">CROWN</p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">House book</p>
        </div>
        <nav className="flex gap-1 overflow-auto px-3 pb-4 md:block md:px-3">
          {links.map(([href, label]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`block whitespace-nowrap px-3 py-2 text-sm ${active ? "bg-brass text-white" : "text-white/75 hover:text-white"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="px-5 py-6">
          <p className="truncate text-xs text-white/50">{email}</p>
          <button type="submit" className="mt-3 text-xs uppercase tracking-[0.16em] text-white/80">
            Sign out
          </button>
        </form>
      </aside>
      <div className="px-5 py-8 md:px-10">{children}</div>
    </div>
  );
}
