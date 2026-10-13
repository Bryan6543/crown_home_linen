"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, ShoppingBag, Trash2, X } from "lucide-react";
import { MAX_LINE_QUANTITY } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { ProductPlate } from "@/components/store/product-plate";
import { QuantityStepper } from "@/components/store/quantity";

export type CartLine = {
  key: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  slug: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number, options?: { open?: boolean }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  currency: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE = "chl-cart";
const EMPTY: CartLine[] = [];

// The bag lives in localStorage, outside React, so every tab sees the same bag
// and the first render on the server is simply "empty".
const listeners = new Set<() => void>();
let cached: CartLine[] | null = null;

function readBag(): CartLine[] {
  if (cached) return cached;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    cached = Array.isArray(parsed) ? (parsed as CartLine[]).filter((line) => line && line.key && line.quantity > 0) : [];
  } catch {
    cached = [];
  }
  return cached;
}

function writeBag(next: CartLine[]) {
  cached = next;
  try {
    localStorage.setItem(STORAGE, JSON.stringify(next));
  } catch {
    // Private browsing can refuse storage. The bag still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE) return;
    cached = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};
const clamp = (quantity: number) => Math.max(0, Math.min(MAX_LINE_QUANTITY, Math.floor(quantity)));

export function CartProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, readBag, () => EMPTY);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  const add = useCallback<CartContextValue["add"]>((line, quantity = 1, options) => {
    const key = `${line.productId}:${line.variantId}`;
    const current = readBag();
    const existing = current.find((item) => item.key === key);
    writeBag(
      existing
        ? current.map((item) => (item.key === key ? { ...item, ...line, quantity: clamp(item.quantity + quantity) } : item))
        : [...current, { ...line, key, quantity: clamp(quantity) || 1 }],
    );
    if (options?.open !== false) setOpen(true);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      ready,
      open,
      setOpen,
      add,
      setQuantity: (key, quantity) => {
        const next = clamp(quantity);
        writeBag(readBag().flatMap((line) => (line.key === key ? (next <= 0 ? [] : [{ ...line, quantity: next }]) : [line])));
      },
      remove: (key) => writeBag(readBag().filter((line) => line.key !== key)),
      clear: () => writeBag([]),
      currency,
    }),
    [add, currency, lines, open, ready],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {open ? <CartDrawer /> : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart is only available in the shop.");
  return value;
}

function CartDrawer() {
  const cart = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const openedOn = useRef(pathname);
  const { setOpen } = cart;

  // Close on Escape and on navigation; keep the page behind from scrolling;
  // move focus into the drawer and back to where it was afterwards.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab" && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [setOpen]);

  useEffect(() => {
    if (pathname !== openedOn.current) setOpen(false);
  }, [pathname, setOpen]);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close bag" tabIndex={-1} className="fade-in absolute inset-0 bg-navy-deep/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
        className="drawer-in absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col bg-paper shadow-2xl outline-none"
      >
        <div className="navy-ground flex items-center justify-between px-5 py-4">
          <h2 id="bag-title" className="flex items-center gap-2.5 font-serif text-2xl font-bold text-[#fbf8f1]">
            <ShoppingBag size={18} className="text-gold-bright" aria-hidden /> Your bag
            {cart.count ? <span className="label text-[10px] text-gold-strap">({cart.count})</span> : null}
          </h2>
          <button type="button" aria-label="Close bag" className="grid h-10 w-10 place-items-center text-[#fbf8f1] hover:text-gold-hi" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {cart.lines.length === 0 ? (
            <div className="py-14 text-center">
              <ShoppingBag className="mx-auto text-gold" size={30} aria-hidden />
              <p className="mt-4 font-serif text-xl font-bold text-navy">The bag is empty</p>
              <p className="mt-1 text-sm text-muted">Add the sizes you need, then send the order on WhatsApp.</p>
              <Link href="/shop" className="btn-ink mt-6">
                Shop all items
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {cart.lines.map((line) => (
                <li key={line.key} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-sand">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ProductPlate product={{ title: line.title, material: "", options: [] }} size="thumb" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${line.slug}`} className="font-serif text-[16px] font-bold leading-snug text-navy hover:text-brass">
                      {line.title}
                    </Link>
                    <p className="label mt-0.5 text-[9px] text-muted">{line.variantTitle}</p>
                    <p className="tabular mt-1 font-serif text-[15px] font-bold text-brass">{formatMoney(line.unitPrice * line.quantity, cart.currency)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper value={line.quantity} label={line.title} onChange={(value) => cart.setQuantity(line.key, value)} />
                      <button type="button" aria-label={`Remove ${line.title}`} className="grid h-10 w-10 place-items-center text-muted hover:text-danger" onClick={() => cart.remove(line.key)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cart.lines.length > 0 ? (
          <div className="border-t border-line bg-white px-5 py-5">
            <div className="tabular mb-1 flex items-baseline justify-between">
              <span className="font-serif text-lg font-bold text-navy">Subtotal</span>
              <span className="font-serif text-xl font-bold text-brass">{formatMoney(cart.subtotal, cart.currency)}</span>
            </div>
            <p className="mb-4 text-xs text-muted">Delivery and the final total are confirmed on WhatsApp.</p>
            <Link href="/cart" onClick={() => setOpen(false)} data-track="Review bag" data-track-id="review-bag" className="btn-brass w-full">
              <MessageCircle size={15} aria-hidden /> Checkout on WhatsApp
            </Link>
            <button type="button" className="btn-line mt-2 w-full" onClick={() => setOpen(false)}>
              Keep shopping
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
