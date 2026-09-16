"use client";

import { useEffect, useRef } from "react";

type Zone = { readonly code: string; readonly name: string; readonly timeZone: string };

/** Six local times. Server renders --:-- (same width in tabular figures); digits swap each minute. */
export function ClockStrip({ zones }: { zones: readonly Zone[] }) {
  const refs = useRef<(HTMLTimeElement | null)[]>([]);

  useEffect(() => {
    const formats = zones.map(
      (z) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: z.timeZone }),
    );
    let timer = 0;

    const tick = () => {
      const now = new Date();
      formats.forEach((format, i) => {
        const el = refs.current[i];
        if (el) el.textContent = format.format(now);
      });
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      tick();
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [zones]);

  return (
    <ul data-reveal="rows" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {zones.map((zone, i) => (
        <li key={zone.code} data-reveal-item className="card px-5 py-6 text-center">
          <p className="eyebrow text-accent">{zone.code}</p>
          <p className="mt-3 text-2xl leading-none font-semibold tracking-[-0.02em] tabular">
            <time
              ref={(el) => {
                refs.current[i] = el;
              }}
              suppressHydrationWarning
            >
              --:--
            </time>
            <span className="sr-only"> local time</span>
          </p>
          <p className="text-support mt-2 text-muted">{zone.name}</p>
        </li>
      ))}
    </ul>
  );
}
