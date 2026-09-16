"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marks its root with data-in the first time a share of it is on screen, so CSS can
 * start entrance animations then rather than on page load (once only), and keeps
 * data-visible current so looping decoration can pause while it is off screen.
 */
export function InView({ threshold = 0.3, className = "", children }: { threshold?: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { threshold },
    );
    const visible = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) el.dataset.visible = "";
      else delete el.dataset.visible;
    });
    io.observe(el);
    visible.observe(el);
    return () => {
      io.disconnect();
      visible.disconnect();
    };
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
