"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(ref.current, {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%" },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLElement>(null);
  const slides = banners.length ? banners : [];

  useGSAP(
    () => {
      if (slides.length < 2) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tween = gsap.to(
        {},
        {
          duration: 6.5,
          repeat: -1,
          onRepeat: () => setIndex((current) => (current + 1) % slides.length),
        },
      );
      return () => tween.kill();
    },
    { scope: root, dependencies: [slides.length] },
  );

  if (slides.length === 0) return null;
  const banner = slides[index];

  return (
    <section ref={root} className="relative min-h-[78vh] bg-navy-deep text-paper" aria-roledescription="carousel">
      {slides.map((slide, slideIndex) => (
        <Image
          key={slide.id}
          src={slide.imageUrl}
          alt={slide.imageAlt || slide.title}
          fill
          priority={slideIndex === 0}
          className={`object-cover transition-opacity duration-700 ${slideIndex === index ? "opacity-100" : "opacity-0"}`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/85 via-navy/45 to-navy/5" />
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8">
        <span className="crown-rule mb-4" aria-hidden />
        <p className="eyebrow text-gold-strap">{banner.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl gold-text-light font-serif text-5xl font-bold leading-[1.05] md:text-7xl">{banner.title}</h1>
        <p className="mt-5 max-w-xl font-serif text-lg italic leading-7 text-[#fbf8f1]/90 md:text-xl">{banner.subtitle}</p>
        <div className="mt-8 flex items-center gap-4">
          <Link href={banner.buttonHref} data-track={banner.buttonLabel} data-track-id={`hero-${banner.id}`} className="btn-brass">
            {banner.buttonLabel}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center border border-gold/60 text-gold-hi hover:bg-gold/15"
              onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center border border-gold/60 text-gold-hi hover:bg-gold/15"
              onClick={() => setIndex((current) => (current + 1) % slides.length)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
