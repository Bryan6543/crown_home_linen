"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function PageFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(ref.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
    },
    { dependencies: [pathname], scope: ref },
  );
  return <div ref={ref}>{children}</div>;
}
