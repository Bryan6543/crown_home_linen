"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SubscribeForm } from "@/components/store/subscribe-form";

const KEY = "chl-letter-dismissed";

function dismissed() {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

export function NewsletterPopup({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const closed = useRef(false);

  useEffect(() => {
    if (dismissed()) {
      closed.current = true;
      return;
    }
    const timer = window.setTimeout(() => {
      if (!closed.current && !dismissed()) setOpen(true);
    }, 7000);
    function onScroll() {
      if (closed.current || dismissed()) return;
      if (window.scrollY > window.innerHeight * 0.7) setOpen(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    if (card.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(card.current, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" });
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    closed.current = true;
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Private browsing can block storage. The ref still keeps it closed for this visit.
    }
    setOpen(false);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 sm:items-center" onClick={close}>
      <div ref={card} className="w-full max-w-md border border-line bg-paper p-6 shadow-xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="letter-popup-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">The list</p>
            <h2 id="letter-popup-title" className="mt-2 font-serif text-4xl">{title}</h2>
          </div>
          <button type="button" onClick={close} className="text-xs uppercase tracking-[0.16em]" aria-label="Close">
            Close
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        <div className="mt-5">
          <SubscribeForm source="popup" />
        </div>
      </div>
    </div>
  );
}
