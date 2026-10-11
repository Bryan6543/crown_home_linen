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

function Mark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <Link
      href="/"
      aria-label={name}
      className="flex items-center gap-3"
      data-track="Logo"
      data-track-id="logo"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="h-10 w-auto max-w-[180px] object-contain"
        />
      ) : (
        <>
          <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
            <path
              d="M4 22 L10 10 L16 18 L22 8 L28 22 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M6 24 H26" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="leading-none">
            <span className="block font-serif text-[1.7rem] tracking-[0.18em]">
              CROWN
            </span>
            <span className="block text-[9px] uppercase tracking-[0.32em] text-muted">
              Home Linen
            </span>
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
        <div className="bg-ink px-4 py-2 text-center text-[11px] uppercase tracking-[0.18em] text-paper">
          {announcement}
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto grid h-[4.5rem] max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-6">
          <button
            type="button"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block">
            <Mark name={storeName} />
          </div>
          <nav className="hidden items-center justify-center gap-6 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-[12px] uppercase tracking-[0.16em] text-ink/80 hover:text-ink"
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
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center bg-ink px-1 text-[10px] text-paper">
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
                className="font-serif text-4xl"
                onClick={() => setMenu(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      {searchOpen ? (
        <div className="fixed inset-0 z-50 bg-ink/40">
          <div className="mx-auto mt-20 max-w-xl bg-paper p-5">
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
    <footer className="mt-auto border-t border-line bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-serif text-3xl tracking-wide">{storeName}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">{note}</p>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <p className="eyebrow">{title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-brass"
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
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
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
        className="fixed bottom-5 right-5 z-30 bg-[#1f6b45] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white"
      >
        WhatsApp
      </a>
    </footer>
  );
}
