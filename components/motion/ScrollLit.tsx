"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Lights words from dim to full as the block travels up the screen: it starts when
 * the block's top passes `start` of the viewport height and finishes at `end`. Writes
 * one custom property, --lit (how many words are lit); LitWords does the rest in CSS.
 * Scroll-driven, so it runs for everyone and reverses on the way back up.
 */
export function ScrollLit({
  total,
  start = 0.9,
  end = 0.35,
  className = "",
  children,
}: {
  total: number;
  start?: number;
  end?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = "";

    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh * start - top) / (vh * (start - end))));
      // A little past the last word, so it reaches full rather than stopping on the ramp.
      const lit = (p * (total + 1)).toFixed(2);
      if (lit === last) return;
      last = lit;
      el.style.setProperty("--lit", lit);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    // Only listen while the block is anywhere near the screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else {
          window.removeEventListener("scroll", onScroll);
          onScroll();
        }
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    window.addEventListener("resize", onScroll);
    apply();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total, start, end]);

  return (
    <div ref={ref} className={`scroll-lit ${className}`}>
      {children}
    </div>
  );
}
