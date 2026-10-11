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
    <div className="min-h-screen bg-ivory">
      {/* Fixed sidebar on md+ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink text-paper md:flex">
        <div className="px-5 py-6">
          <p className="font-serif text-3xl tracking-[0.14em]">CROWN</p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">House book</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {links.map(([href, label]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 text-sm ${
                  active ? "bg-brass text-white" : "text-white/75 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="border-t border-white/10 px-5 py-6">
          <p className="truncate text-xs text-white/50">{email}</p>
          <button
            type="submit"
            className="mt-3 text-xs uppercase tracking-[0.16em] text-white/80 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile top bar + horizontal nav */}
      <div className="sticky top-0 z-40 border-b border-line bg-ink text-paper md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-serif text-xl tracking-[0.14em]">CROWN</p>
            <p className="text-[9px] uppercase tracking-[0.28em] text-white/60">House book</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-xs uppercase tracking-[0.14em] text-white/80">
              Sign out
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {links.map(([href, label]) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap px-3 py-1.5 text-sm ${
                  active ? "bg-brass text-white" : "text-white/75"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content – offset on desktop so it doesn’t sit under the fixed sidebar */}
      <div className="md:ml-60">
        <div className="px-5 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}