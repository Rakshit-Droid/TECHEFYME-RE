"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import au from "@/assets/img/regions/au.jpg";
import eu from "@/assets/img/regions/eu.jpg";
import me from "@/assets/img/regions/me.jpg";
import nz from "@/assets/img/regions/nz.jpg";
import uk from "@/assets/img/regions/uk.jpg";
import us from "@/assets/img/regions/us.jpg";

type Zone = { readonly code: string; readonly name: string; readonly timeZone: string };

/*
 * One night view per region, cropped to the card and graded into the site's cool palette.
 * All public domain or CC0 on Wikimedia Commons, so no credit line is required:
 *  US  Empire State Building Night View, Mike Sinko (public domain)
 *  ME  Dubai skyline, Robert Bock (CC0)
 *  EU  Berliner Fernsehturm at night, Leonhard Lenz (CC0)
 *  AU  Sydney Opera House at night, Eumaeus (public domain)
 *  NZ  Ports of Auckland night operations, Ingolfson (public domain)
 *  UK  Tower Bridge by night, Bert Seghers (CC0)
 */
const PHOTOS: Record<string, StaticImageData> = { US: us, ME: me, EU: eu, AU: au, NZ: nz, UK: uk };

const AUTOPLAY_MS = 3800;

/**
 * The six regions as a fanned deck of cards, each a night view with its local time. The
 * centre card is the current one; the deck spreads wider under the pointer, turns on its
 * own while nobody is holding it, and takes arrows, dots, a swipe, or a press on any card.
 */
export function RegionFan({ zones }: { zones: readonly Zone[] }) {
  const n = zones.length;
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeRefs = useRef<(HTMLTimeElement | null)[]>([]);
  const [hold, setHolds] = useState({ hover: false, focus: false, visible: false });
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const swiped = useRef(false);

  const go = useCallback((i: number) => setActive(((i % n) + n) % n), [n]);

  // Local times: the server renders --:--, then the digits swap on each minute.
  useEffect(() => {
    const formats = zones.map((z) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: z.timeZone }));
    let timer = 0;
    const tick = () => {
      const now = new Date();
      formats.forEach((format, i) => {
        const el = timeRefs.current[i];
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

  // Only turn while the deck is on screen, so the loop costs nothing elsewhere.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting);
      if (visible) root.dataset.visible = "";
      else delete root.dataset.visible;
      setHolds((h) => (h.visible === visible ? h : { ...h, visible }));
    });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const turning = hold.visible && !hold.hover && !hold.focus;
  useEffect(() => {
    if (!turning) return;
    const timer = window.setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [turning, active, go]);

  const setHold = (key: "hover" | "focus", on: boolean) => setHolds((h) => (h[key] === on ? h : { ...h, [key]: on }));

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    // A swipe also ends in a click on whichever card is under it; that click is ignored.
    swiped.current = Math.abs(dx) > 40;
    if (swiped.current) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={rootRef}
      className="fan"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHold("hover", true)}
      onPointerLeave={() => setHold("hover", false)}
      onFocus={(e) => setHold("focus", e.target.matches(":focus-visible"))}
      onBlur={() => setHold("focus", false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        else if (e.key === "ArrowLeft") go(active - 1);
      }}
    >
      <ul className="fan-deck" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
        {zones.map((zone, i) => {
          // Offset from the centre card, wrapped into -3..2 so the deck reads both ways.
          const d = ((i - active + n + 3) % n) - 3;
          const ad = Math.abs(d);
          return (
            <li
              key={zone.code}
              className="fan-card"
              data-hidden={ad > 2 ? "" : undefined}
              data-active={d === 0 ? "" : undefined}
              style={{ "--d": d, "--ad": ad, zIndex: 10 - ad } as CSSProperties}
            >
              <button type="button" className="fan-button" aria-current={d === 0} tabIndex={ad > 2 ? -1 : 0} onClick={() => (swiped.current ? (swiped.current = false) : go(i))}>
                <Image src={PHOTOS[zone.code]!} alt="" fill sizes="(min-width: 768px) 300px, 200px" className="fan-photo" />
                <span className="fan-code">{zone.code}</span>
                <span className="fan-meta">
                  <time
                    ref={(el) => {
                      timeRefs.current[i] = el;
                    }}
                    className="fan-time"
                    suppressHydrationWarning
                  >
                    --:--
                  </time>
                  <span className="sr-only"> local time, </span>
                  <span className="fan-name">{zone.name}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fan-controls">
        <button type="button" className="fan-arrow" aria-label="Previous region" onClick={() => go(active - 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="fan-dots">
          {zones.map((zone, i) => (
            <button key={zone.code} type="button" aria-label={zone.name} aria-current={i === active} onClick={() => go(i)} />
          ))}
        </div>
        <button type="button" className="fan-arrow" aria-label="Next region" onClick={() => go(active + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
