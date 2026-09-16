"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Metric = { readonly value: string; readonly label: string };

const COUNT_MS = 1400;
const STAGGER_MS = 140;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const parse = (value: string) => {
  const m = value.match(/^(\d+)(.*)$/);
  return m ? { n: Number(m[1]), suffix: m[2] ?? "" } : { n: 0, suffix: value };
};

/**
 * The three proof points as small instruments. Each number counts up once as it
 * arrives, and a drawing under it fills in step with the count: a tick per
 * engagement, a dot per region, a segment per day to launch. The server renders the
 * finished state, so without JS, or when the cards are already on screen, nothing
 * resets to zero.
 */
export function TitleCardMetrics({ metrics, regions }: { metrics: readonly Metric[]; regions: readonly string[] }) {
  const ref = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-metric]"));
    const cleanups: (() => void)[] = [];

    // Cursor light on the card borders, wherever there is a real pointer.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const onMove = (e: PointerEvent) => {
        for (const card of cards) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
      };
      const onLeave = () => {
        for (const card of cards) {
          card.style.removeProperty("--mx");
          card.style.removeProperty("--my");
        }
      };
      root.addEventListener("pointermove", onMove, { passive: true });
      root.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      });
    }

    // Count only what the visitor has not seen yet.
    if (root.getBoundingClientRect().top < window.innerHeight) return () => cleanups.forEach((c) => c());

    const nodes = cards.map((card) => {
      const out = card.querySelector<HTMLElement>("[data-count]")!;
      const { n, suffix } = parse(out.dataset.count ?? "");
      card.style.setProperty("--m", "0");
      out.textContent = `0${suffix}`;
      return { card, out, n, suffix };
    });

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const frame = (now: number) => {
          let running = false;
          nodes.forEach(({ card, out, n, suffix }, i) => {
            const t = Math.min(1, Math.max(0, (now - t0 - i * STAGGER_MS) / COUNT_MS));
            if (t < 1) running = true;
            const e = easeOut(t);
            card.style.setProperty("--m", e.toFixed(3));
            out.textContent = `${Math.round(e * n)}${suffix}`;
          });
          raf = running ? requestAnimationFrame(frame) : 0;
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
      for (const { card, out, n, suffix } of nodes) {
        card.style.removeProperty("--m");
        out.textContent = `${n}${suffix}`;
      }
    };
  }, []);

  return (
    <dl ref={ref} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((m, index) => {
        const { n } = parse(m.value);
        return (
          <div key={m.label} data-reveal-item data-metric className="metric card px-6 pt-10 pb-8 text-center">
            <dt className="sr-only">{m.label}</dt>
            <dd>
              <span className="sr-only">{m.value}</span>
              <span
                aria-hidden="true"
                data-count={m.value}
                className="block text-5xl leading-none font-semibold tracking-[-0.03em] tabular md:text-6xl"
              >
                {m.value}
              </span>
              <span className="text-support mt-3 block text-muted">{m.label}</span>
              {/* One drawing per proof point, in the order the content lists them. */}
              <span aria-hidden="true" className="mt-6 block">
                {index === 0 && (
                  <span className="metric-ticks" style={{ "--n": n } as CSSProperties}>
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className="metric-cell" style={{ "--i": i } as CSSProperties} />
                    ))}
                  </span>
                )}
                {index === 1 && (
                  <span className="metric-dots" style={{ "--n": regions.length } as CSSProperties}>
                    {regions.map((region, i) => (
                      <span key={region} className="metric-dot" style={{ "--i": i } as CSSProperties}>
                        <span className="metric-cell" />
                        <span className="metric-dot-label">{region}</span>
                      </span>
                    ))}
                  </span>
                )}
                {index === 2 && (
                  <span className="metric-days" style={{ "--n": n } as CSSProperties}>
                    {Array.from({ length: n }, (_, i) => (
                      <span key={i} className="metric-cell" style={{ "--i": i } as CSSProperties} />
                    ))}
                  </span>
                )}
              </span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
