"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { formatMoney, whatsappUrl } from "@/lib/format";
import { useCart } from "@/components/store/cart";

export type NavLink = { label: string; href: string };
export type SearchProduct = {
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  currency: string;
};

export function CrownGlyph({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/brand/crown-mark.png"
      alt=""
      width={560}
      height={397}
      priority
      className={className}
    />
  );
}

function Mark({
  name,
  logoUrl,
  tone = "light",
}: {
  name: string;
  logoUrl?: string;
  tone?: "light" | "navy";
}) {
  return (
    <Link
      href="/"
      aria-label={name}
      className="flex flex-col items-center"
      data-track="Logo"
      data-track-id="logo"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-12 w-auto max-w-[180px] object-contain"
        />
      ) : (
        <>
          <CrownGlyph className="h-12 w-auto" />
          <span
            className={`mt-1 block pl-[0.13em] font-serif text-[15px] font-bold leading-none tracking-[0.13em] ${
              tone === "navy" ? "text-[#fbf8f1]" : "text-navy"
            }`}
          >
            CROWN
          </span>
        </>
      )}
    </Link>
  );
}

export function Header({
  storeName,
  logoUrl,
  announcement,
  announcementEnabled,
  nav,
  products,
}: {
  storeName: string;
  logoUrl?: string;
  announcement: string;
  announcementEnabled: boolean;
  nav: NavLink[];
  products: SearchProduct[];
}) {
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products.slice(0, 5);
    return products
      .filter((product) => product.title.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [products, query]);

  return (
    <>
      {announcementEnabled && announcement ? (
        <div className="navy-ground label px-4 py-2 text-center text-[10px] text-gold-strap">
          {announcement}
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-gold/40 bg-paper/92 backdrop-blur">
        <div className="mx-auto grid h-[4.75rem] max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-6">
          <button
            type="button"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block">
            <Mark name={storeName} logoUrl={logoUrl} />{" "}
          </div>
          <nav className="hidden items-center justify-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="label text-[10.5px] text-navy/75 transition-colors hover:text-brass"
                data-track={item.label}
                data-track-id={`nav-${item.label}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="justify-self-center md:hidden">
            <Mark name={storeName} logoUrl={logoUrl} />{" "}
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              aria-label="Search"
              data-track="Search"
              data-track-id="open-search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              aria-label="Open bag"
              className="relative"
              data-track="Bag"
              data-track-id="open-bag"
              onClick={() => cart.setOpen(true)}
            >
              <ShoppingBag size={18} />
              {cart.count > 0 ? (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold-bright px-1 text-[10px] font-bold text-navy">
                  {cart.count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
      {menu ? (
        <div className="fixed inset-0 z-50 bg-paper px-6 py-6 md:hidden">
          <div className="flex justify-between">
            <Mark name={storeName} logoUrl={logoUrl} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenu(false)}
            >
              <X />
            </button>
          </div>
          <div className="mt-10 flex flex-col gap-5">
            {nav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="font-serif text-4xl text-navy"
                onClick={() => setMenu(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      {searchOpen ? (
        <div className="fixed inset-0 z-50 bg-navy-deep/55">
          <div className="mx-auto mt-20 max-w-xl border-t-2 border-gold bg-paper p-5">
            <div className="flex items-center gap-3 border-b border-line">
              <Search size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setSearchOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }
                }}
                placeholder="Search towels, linen, robes"
                className="h-12 flex-1 bg-transparent outline-none"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {results.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex items-center gap-3"
                    onClick={() => setSearchOpen(false)}
                    data-track={product.title}
                    data-track-id="search-result"
                    data-track-type="search"
                  >
                    <span className="relative h-14 w-12 bg-sand">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </span>
                    <span className="flex-1 text-sm">{product.title}</span>
                    <span className="text-sm text-muted">
                      {formatMoney(product.price, product.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Footer({
  storeName,
  note,
  email,
  phone,
  address,
  city,
  hours,
  instagram,
  whatsappNumber,
  greeting,
  shop,
  help,
  company,
}: {
  storeName: string;
  note: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  hours: string;
  instagram: string;
  whatsappNumber: string;
  greeting: string;
  shop: NavLink[];
  help: NavLink[];
  company: NavLink[];
}) {
  const columns = [
    ["Shop", shop],
    ["Help", help],
    ["House", company],
  ] as const;
  return (
    <footer className="navy-ground on-navy mt-auto border-t-2 border-gold">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="sr-only">{storeName}</p>
          <div className="w-fit" aria-hidden>
            <CrownGlyph className="mx-auto h-20 w-auto" />
            <p className="mt-2 pl-[0.13em] text-center font-serif text-2xl font-bold tracking-[0.13em] text-[#fbf8f1]">
              CROWN
            </p>
          </div>
          <span className="crown-rule mt-4" aria-hidden />
          <p className="mt-4 max-w-xs font-serif text-[15px] italic leading-6 text-mist">{note}</p>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <p className="eyebrow">{title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-[#fbf8f1]/85 transition-colors hover:text-gold-hi"
                    data-track={link.label}
                    data-track-id={`footer-${link.label}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gold/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-mist md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            {address}, {city}
            {hours ? ` · ${hours}` : ""}
          </p>
          <p className="flex gap-4">
            <a href={`mailto:${email}`}>{email}</a>
            <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
            {instagram ? (
              <a href={instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            ) : null}
          </p>
        </div>
      </div>
      <a
        href={whatsappUrl(whatsappNumber, greeting)}
        target="_blank"
        rel="noreferrer"
        data-track="WhatsApp"
        data-track-id="float-whatsapp"
        data-track-type="whatsapp_click"
        className="btn-brass fixed bottom-5 right-5 z-30 min-h-0 px-4 py-3 text-[10px] shadow-[0_8px_24px_rgba(16,31,56,0.28)]"
      >
        WhatsApp
      </a>
    </footer>
  );
}
