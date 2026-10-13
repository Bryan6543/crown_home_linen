"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Banner } from "@/lib/types";

const headline = "mt-4 max-w-xl font-serif text-[2.6rem] font-bold leading-[1.06] sm:text-6xl lg:text-[4.2rem]";

function step(order: number) {
  return { "--d": order } as React.CSSProperties;
}

// Each word rises from behind its own mask, a beat after the one before.
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="word-mask">
            <span className="word-up" style={{ "--w": index } as React.CSSProperties}>
              <span className="gold-text-light hero-sheen">{word}</span>
            </span>
          </span>{" "}
        </span>
      ))}
    </>
  );
}

// The homepage opener. Navy ground (the Crown brand ground), the photograph
// held in a gold-ruled frame. Several active banners become slides; they
// advance slowly, stop while hovered or focused, and never move for
// reduced-motion visitors.
export function Hero({ banners, whatsappHref, phone }: { banners: Banner[]; whatsappHref: string; phone: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 8000);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;
  const banner = banners[index % count];

  return (
    <section
      className="navy-ground on-navy relative overflow-hidden"
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-10 md:px-8 lg:min-h-[640px] lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:py-16">
        <div key={banner.id}>
          <span className="crown-rule hero-rule mb-5" aria-hidden />
          <p className="eyebrow hero-step">{banner.eyebrow}</p>
          {index === 0 ? (
            <h1 className={headline}>
              <Words text={banner.title} />
            </h1>
          ) : (
            <p className={headline}>
              <Words text={banner.title} />
            </p>
          )}
          <p className="hero-step mt-6 max-w-lg font-serif text-lg italic leading-8 text-[#fbf8f1]/85 md:text-xl" style={step(4)}>
            {banner.subtitle}
          </p>
          <div className="hero-step mt-9 flex flex-wrap items-center gap-3" style={step(5)}>
            <Link href={banner.buttonHref} className="btn-brass" data-track={banner.buttonLabel} data-track-id={`hero-${banner.id}`}>
              {banner.buttonLabel}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-line border-gold/60 text-[#fbf8f1] hover:border-gold-hi hover:bg-[#fbf8f1] hover:text-navy"
              data-track="WhatsApp hero"
              data-track-id="hero-whatsapp"
              data-track-type="whatsapp_click"
            >
              <MessageCircle size={15} aria-hidden />
              WhatsApp {phone}
            </a>
          </div>
          {count > 1 ? (
            <div className="hero-step mt-10 flex items-center gap-3" style={step(6)} role="group" aria-label="Choose a slide">
              {banners.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show slide ${itemIndex + 1}: ${item.title}`}
                  aria-current={itemIndex === index}
                  onClick={() => setIndex(itemIndex)}
                  className="group flex h-8 items-center"
                >
                  <span className={`block h-[2px] transition-all duration-500 ${itemIndex === index ? "w-10 bg-gold-bright" : "w-5 bg-[#fbf8f1]/35 group-hover:bg-[#fbf8f1]/70"}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-[640px] sm:aspect-[4/3] lg:aspect-[5/6]">
            <div className="hero-frame absolute inset-0 border-2 border-[#fbf8f1]/80" aria-hidden />
            <div className="hero-unveil absolute inset-[9px] overflow-hidden">
              {banners.map((slide, slideIndex) => (
                <Image
                  key={slide.id}
                  src={slide.imageUrl}
                  alt={slideIndex === index ? slide.imageAlt || slide.title : ""}
                  fill
                  priority={slideIndex === 0}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className={`object-cover transition-opacity duration-1000 ${slideIndex === index ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>
            <div className="hero-frame pointer-events-none absolute inset-[9px] border border-gold/70" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
