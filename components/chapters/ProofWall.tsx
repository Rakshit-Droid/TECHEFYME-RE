"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Every column becomes one on phones, drifting at this pace. */
const NARROW_SECONDS = 130;

/**
 * Behaviour for the testimonial wall, which is otherwise server HTML:
 *  - on phones, every column's cards are gathered into the first, in their original order
 *  - each list is cloned once, so the drift can loop; the page itself carries no copies
 *  - data-visible on the wall while it is on screen, so the columns only move then
 *  - data-lit on each card while most of it is inside the wall, so its result marker
 *    sweeps in as it rises into view and resets once it has scrolled away
 *  - --mx / --my on the card under a fine pointer, for the light along its edge
 */
export function ProofWall({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Both steps are idempotent, so a second run (development remounts) changes nothing.
    const wall = root.querySelector<HTMLElement>(".proof-wall");
    if (wall && window.matchMedia("(max-width: 767px)").matches && !("merged" in wall.dataset)) {
      const cols = Array.from(wall.querySelectorAll<HTMLElement>(".proof-col"));
      const first = cols[0]?.querySelector("ul");
      if (first) {
        const cards = cols.flatMap((col) => Array.from(col.querySelectorAll<HTMLElement>(":scope > .proof-track > ul > li")));
        cards.sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
        for (const card of cards) first.appendChild(card);
        cols[0]!.style.setProperty("--dur", `${NARROW_SECONDS}s`);
        cols[0]!.style.setProperty("--delay", "0s");
        wall.dataset.merged = "";
      }
    }
    for (const track of root.querySelectorAll<HTMLElement>(".proof-track")) {
      if ("looped" in track.dataset) continue;
      const list = track.querySelector("ul");
      if (!list) continue;
      const copy = list.cloneNode(true) as HTMLElement;
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
      track.dataset.looped = "";
    }

    const visible = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) root.dataset.visible = "";
      else delete root.dataset.visible;
    });
    visible.observe(root);

    const walls = Array.from(root.querySelectorAll<HTMLElement>(".proof-wall"));
    const lit = walls.map((wall) => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const card = entry.target as HTMLElement;
            if (entry.isIntersecting) card.dataset.lit = "";
            else delete card.dataset.lit;
          }
        },
        { root: wall, threshold: 0.6 },
      );
      wall.querySelectorAll(".proof-card").forEach((card) => io.observe(card));
      return io;
    });

    let raf = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      raf = 0;
      if (!last) return;
      const card = (last.target as Element | null)?.closest<HTMLElement>(".proof-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${Math.round(last.clientX - r.left)}px`);
      card.style.setProperty("--my", `${Math.round(last.clientY - r.top)}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      visible.disconnect();
      lit.forEach((io) => io.disconnect());
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
