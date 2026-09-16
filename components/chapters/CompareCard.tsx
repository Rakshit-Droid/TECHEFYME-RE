"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The Why us card. Writes --k (0 to 1) on each [data-strike-row] as that row climbs
 * from low on the screen to reading height: the first half strikes the alternative
 * through, the second half lights our answer. Scroll-driven, so it runs for everyone
 * and rewinds on the way back up. Also keeps data-visible current so the card's
 * light can stop breathing while it is off screen.
 */
export function CompareCard({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-strike-row]"));
    const last = rows.map(() => "");
    let raf = 0;

    const apply = () => {
      raf = 0;
      const vh = window.innerHeight;
      rows.forEach((row, i) => {
        const top = row.getBoundingClientRect().top;
        const k = Math.min(1, Math.max(0, (vh * 0.85 - top) / (vh * 0.3))).toFixed(3);
        if (k === last[i]) return;
        last[i] = k;
        row.style.setProperty("--k", k);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.dataset.visible = "";
          window.addEventListener("scroll", onScroll, { passive: true });
        } else {
          delete el.dataset.visible;
          window.removeEventListener("scroll", onScroll);
        }
        onScroll();
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
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
