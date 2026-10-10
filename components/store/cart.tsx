"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { formatMoney } from "@/lib/format";

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
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  currency: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE = "chl-cart";

export function CartProvider({ currency, children }: { currency: string; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      try {
        setLines(JSON.parse(raw) as CartLine[]);
      } catch {
        localStorage.removeItem(STORAGE);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (line, quantity = 1) => {
      const key = `${line.productId}:${line.variantId}`;
      setLines((current) => {
        const existing = current.find((item) => item.key === key);
        const next = !existing
          ? [...current, { ...line, key, quantity }]
          : current.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item));
        localStorage.setItem(STORAGE, JSON.stringify(next));
        return next;
      });
      setOpen(true);
    };
    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
      open,
      setOpen,
      add,
      setQuantity: (key, quantity) => {
        setLines((current) => current.flatMap((line) => (line.key === key ? (quantity <= 0 ? [] : [{ ...line, quantity }]) : [line])));
      },
      remove: (key) => setLines((current) => current.filter((line) => line.key !== key)),
      clear: () => setLines([]),
      currency,
    };
  }, [currency, lines, open]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
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
  if (!cart.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close bag" className="absolute inset-0 bg-ink/40" onClick={() => cart.setOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-3xl">Your bag</h2>
          <button type="button" aria-label="Close" onClick={() => cart.setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">
          {cart.lines.length === 0 ? (
            <p className="text-muted">The bag is empty. The towels are still on the rail.</p>
          ) : (
            <ul className="space-y-5">
              {cart.lines.map((line) => (
                <li key={line.key} className="flex gap-4">
                  <div className="relative h-24 w-20 bg-sand">
                    {line.imageUrl ? <Image src={line.imageUrl} alt="" fill className="object-cover" sizes="80px" /> : null}
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${line.slug}`} className="text-sm" onClick={() => cart.setOpen(false)}>
                      {line.title}
                    </Link>
                    <p className="text-xs text-muted">{line.variantTitle}</p>
                    <p className="mt-1 text-sm">{formatMoney(line.unitPrice * line.quantity, cart.currency)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <button type="button" aria-label="Decrease" onClick={() => cart.setQuantity(line.key, line.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span className="text-sm">{line.quantity}</span>
                      <button type="button" aria-label="Increase" onClick={() => cart.setQuantity(line.key, line.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                      <button type="button" className="ml-auto text-xs uppercase tracking-widest text-muted" onClick={() => cart.remove(line.key)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line px-5 py-5">
          <div className="mb-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatMoney(cart.subtotal, cart.currency)}</span>
          </div>
          <Link href="/cart" onClick={() => cart.setOpen(false)} data-track="Review bag" data-track-id="review-bag" className="btn-ink w-full">
            Order on WhatsApp
          </Link>
          <p className="mt-3 text-center text-xs leading-5 text-muted">Nothing is charged here. The house confirms the total in the thread.</p>
        </div>
      </aside>
    </div>
  );
}
