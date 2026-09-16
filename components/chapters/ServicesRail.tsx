"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { RAIL, RAIL_MEDIA } from "@/lib/services-rail";

const PLAYHEAD_TAU = 0.085;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** "1,247" / "312h" / "$8.4k" / "97" → something we can count towards and print back. */
const counter = (text: string) => {
  const m = text.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const raw = m[2]!;
  const decimals = raw.includes(".") ? raw.split(".")[1]!.length : 0;
  const to = Number(raw.replace(/,/g, ""));
  const commas = raw.includes(",");
  return (p: number) => {
    const v = to * p;
    const s = commas
      ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : v.toFixed(decimals);
    return `${m[1]}${s}${m[3]}`;
  };
};

/**
 * Drives the services chapter. On a wide screen the chapter holds the screen and the
 * five panels slide sideways under the scroll, settling on each for a moment; every
 * panel's scene builds from --dp as it arrives. Elsewhere the panels simply stack and
 * each scene builds as it scrolls into view. Writes transforms and custom properties
 * only, and only while the chapter is near the screen.
 */
export function ServicesRail({ colors, children }: { colors: readonly string[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const stage = rail.querySelector<HTMLElement>(".services-stage")!;
    const track = rail.querySelector<HTMLElement>(".services-track")!;
    const panels = Array.from(rail.querySelectorAll<HTMLElement>(".service-panel"));
    const scenes = panels.map((p) => p.querySelector<HTMLElement>(".service-scene")!);
    const glows = Array.from(rail.querySelectorAll<HTMLElement>(".services-glow > span"));
    const tabs = Array.from(rail.querySelectorAll<HTMLButtonElement>(".services-tab"));
    const n = panels.length;
    const counts = panels.map((panel) =>
      Array.from(panel.querySelectorAll<HTMLElement>("[data-count]")).map((el) => ({
        el,
        format: counter(el.dataset.count ?? ""),
        last: "",
      })),
    );
    const mq = window.matchMedia(RAIL_MEDIA);

    let pos = 0;
    let target = 0;
    let primed = false;
    let last = 0;
    let raf = 0;
    let near = false;
    const written = new Map<string, string>();
    const write = (el: HTMLElement, name: string, value: string, key: string) => {
      if (written.get(key) === value) return;
      written.set(key, value);
      el.style.setProperty(name, value);
    };

    const setScene = (i: number, dp: number) => {
      // On the scene only: a custom property re-styles everything beneath where it is set.
      write(scenes[i]!, "--dp", dp.toFixed(3), `dp${i}`);
      // Numbers count through the first two thirds of the build.
      const p = smooth(clamp01(dp / 0.66));
      for (const c of counts[i]!) {
        if (!c.format) continue;
        const text = c.format(p);
        if (text !== c.last) {
          c.last = text;
          c.el.textContent = text;
        }
      }
    };

    const railFrame = (dt: number) => {
      const vh = window.innerHeight;
      target = -rail.getBoundingClientRect().top / (RAIL.span * vh);
      if (!primed || dt === 0) pos = target;
      else pos += (target - pos) * (1 - Math.exp(-dt / PLAYHEAD_TAU));
      primed = true;

      // Hold on each panel for the first part of its step, then slide to the next.
      const unit = Math.floor(pos);
      const frac = pos - unit;
      const x = Math.min(n - 1, Math.max(0, unit + smooth(clamp01((frac - RAIL.hold) / (1 - RAIL.hold)))));
      write(track, "transform", `translate3d(${(-x * stage.clientWidth).toFixed(1)}px, 0, 0)`, "track");

      // The glow crossfades between the colours of the two panels either side.
      glows.forEach((glow, i) => write(glow, "opacity", clamp01(1 - Math.abs(x - i)).toFixed(3), `glow${i}`));

      const active = Math.round(x);
      tabs.forEach((tab, i) => {
        const on = i === active;
        if (tab.getAttribute("aria-current") !== String(on)) tab.setAttribute("aria-current", String(on));
        write(tab, "--fill", clamp01(x - i + 1).toFixed(3), `tab${i}`);
      });

      for (let i = 0; i < n; i++) setScene(i, clamp01((pos - (i - 0.65)) / 0.9));
      return Math.abs(target - pos) > 0.0005;
    };

    const stackFrame = () => {
      const vh = window.innerHeight;
      panels.forEach((panel, i) => {
        const top = panel.getBoundingClientRect().top;
        setScene(i, clamp01((vh * 0.9 - top) / (vh * 0.6)));
      });
      return false;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const moving = mq.matches ? railFrame(dt) : stackFrame();
      if (moving && near) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /** The layout itself is CSS; this marks which mode is live and clears the other's state. */
    const applyMode = () => {
      if (mq.matches) rail.dataset.rail = "";
      else {
        delete rail.dataset.rail;
        track.style.transform = "";
      }
    };
    applyMode();

    const reset = () => {
      written.clear();
      primed = false;
      applyMode();
      kick();
    };

    // Only work while the chapter is anywhere near the screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        near = !!entry?.isIntersecting;
        if (near) {
          window.addEventListener("scroll", kick, { passive: true });
          primed = false;
          kick();
        } else {
          window.removeEventListener("scroll", kick);
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(rail);

    // The progress tabs jump to a panel; keyboard focus inside a panel brings it on screen.
    const panelTop = (i: number) => rail.getBoundingClientRect().top + window.scrollY + (i + RAIL.hold * 0.5) * RAIL.span * window.innerHeight;
    const onTab = (e: Event) => {
      const i = tabs.indexOf(e.currentTarget as HTMLButtonElement);
      if (i >= 0 && mq.matches) window.scrollTo({ top: panelTop(i), behavior: "smooth" });
    };
    tabs.forEach((t) => t.addEventListener("click", onTab));
    const onFocus = (e: FocusEvent) => {
      if (!mq.matches) return;
      const i = panels.findIndex((p) => p.contains(e.target as Node));
      if (i < 0) return;
      stage.scrollLeft = 0; // focus can nudge the clipped stage sideways
      if (Math.abs(pos - i) > 0.4) window.scrollTo({ top: panelTop(i), behavior: "instant" });
    };
    rail.addEventListener("focusin", onFocus);

    // Cursor light and a slight tilt on the scene under the pointer.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onMove = (e: PointerEvent) => {
      const win = (e.target as Element).closest<HTMLElement>(".demo-window");
      if (!win) return;
      const r = win.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      win.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      win.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      win.style.setProperty("--tilt-x", `${((0.5 - py) * 5).toFixed(2)}deg`);
      win.style.setProperty("--tilt-y", `${((px - 0.5) * 7).toFixed(2)}deg`);
    };
    const windows = Array.from(rail.querySelectorAll<HTMLElement>(".demo-window"));
    const onLeave = (e: PointerEvent) => {
      const win = e.currentTarget as HTMLElement;
      for (const p of ["--mx", "--my", "--tilt-x", "--tilt-y"]) win.style.removeProperty(p);
    };
    if (fine.matches) {
      rail.addEventListener("pointermove", onMove, { passive: true });
      windows.forEach((w) => w.addEventListener("pointerleave", onLeave));
    }

    const onResize = () => kick();
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", reset);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", reset);
      tabs.forEach((t) => t.removeEventListener("click", onTab));
      rail.removeEventListener("focusin", onFocus);
      rail.removeEventListener("pointermove", onMove);
      windows.forEach((w) => w.removeEventListener("pointerleave", onLeave));
      delete rail.dataset.rail;
      track.style.transform = "";
    };
  }, [colors]);

  return (
    <div ref={ref} className="services-rail" style={{ "--n": colors.length } as CSSProperties}>
      {children}
    </div>
  );
}
