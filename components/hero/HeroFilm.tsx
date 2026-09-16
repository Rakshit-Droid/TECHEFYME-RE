"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import {
  CUES,
  FRAMES,
  LOCKUP,
  MERGE_SECONDS,
  MOBILE,
  NAV_MARK,
  POSTER,
  filmSeconds,
  timelineSeconds,
} from "@/lib/hero-gate";
import { createNavProbe } from "./navProbe";
import { createParallax } from "./parallax";

const EAGER = 10; // frames fetched before the canvas takes over from the poster

/** The logo film is drawn whole on phones, a little larger than a strict fit. */
const LOGO_ZOOM = 1.2;

/**
 * Share of the merge spent travelling. The lockup comes to rest on the header logo
 * here, and only then dissolves into it, so the two never overlap while offset.
 */
const ARRIVE_AT = 0.85;

/** The headline waits this long after the lockup has landed. */
const REVEAL_DELAY = 0.1;

/**
 * The film's playhead follows the scroll position rather than jumping to it: it closes
 * about 63% of the gap every PLAYHEAD_TAU seconds. A flick of the wheel becomes a
 * glide, and the page itself still scrolls natively.
 */
const PLAYHEAD_TAU = 0.2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Flight = { x: number; y: number; scale: number; opacity: number; handover: number };

/**
 * The hero film, scrubbed by scroll. The hero section is tall and its inner layer is
 * sticky, so scroll position maps to a moment on the timeline: the visitor drives the
 * hands together and the black hole open, then the mark and wordmark out of the black,
 * then the lockup up into the header logo. No autoplay, no scroll-jacking — the page
 * scrolls at its own speed and the picture follows it, in both directions.
 */
export function HeroFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const sticky = wrap?.closest<HTMLElement>(".hero-sticky");
    const section = wrap?.closest<HTMLElement>("[data-hero]");
    if (!wrap || !canvas || !sticky || !section) return;

    document.documentElement.setAttribute("data-hero-armed", "");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set = window.matchMedia(MOBILE).matches ? FRAMES.mobile : FRAMES.desktop;
    const TOTAL = timelineSeconds(set);
    const FILM_END = filmSeconds(set);
    const LANDED = FILM_END + MERGE_SECONDS;
    const lockup = section.querySelector<HTMLElement>(".hero-lockup");
    const navLogo = document.querySelector<HTMLElement>("[data-nav-logo]");

    const images: (HTMLImageElement | undefined)[] = new Array(set.count);
    const loaded = new Set<number>();
    let drawn = -1;
    let time = 0; // where the playhead is, in seconds
    let target = 0; // where the scroll position says it should be
    let last = 0;
    let primed = false;
    let moving = false;
    let raf = 0;
    let completed = false;
    let started = false;
    let disposed = false;
    let navLogoOpacity = "";

    const parallax = createParallax(section, wrap);
    const navProbe = createNavProbe(() => (drawn >= 0 ? images[drawn] : undefined));

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        if (i < 0 || i >= set.count || images[i]) return resolve();
        const img = new Image();
        img.decoding = "async";
        const done = () => {
          loaded.add(i);
          resolve();
        };
        img.onload = () => {
          // Decode off the main thread where possible, so scrubbing never janks.
          if (img.decode) void img.decode().then(done, done);
          else done();
        };
        img.onerror = () => resolve();
        img.src = set.path(i);
        images[i] = img;
      });

    /** Nearest loaded frame from the same film: a hand never stands in for the logo. */
    const nearestLoaded = (i: number) => {
      const lo = i >= set.logoFrom ? set.logoFrom : 0;
      const hi = i >= set.logoFrom ? set.count - 1 : set.logoFrom - 1;
      if (loaded.has(i)) return i;
      for (let d = 1; d < set.count; d++) {
        if (i - d >= lo && loaded.has(i - d)) return i - d;
        if (i + d <= hi && loaded.has(i + d)) return i + d;
      }
      return -1;
    };

    /** Where a frame of the given size lands on the canvas, in canvas pixels. */
    const placement = (index: number, w0: number, h0: number) => {
      const cw = canvas.width;
      const chh = canvas.height;
      const cover = Math.max(cw / w0, chh / h0);
      if (index >= set.logoFrom) {
        // The lockup must never be cropped, so on a portrait phone the frame is fitted
        // rather than covered; its edges are pure black, so the fit leaves no seam.
        const scale = Math.min(cover, Math.min(cw / w0, chh / h0) * LOGO_ZOOM);
        return { x: (cw - w0 * scale) / 2, y: (chh - h0 * scale) / 2, w: w0 * scale, h: h0 * scale };
      }
      // Matches the poster's object-position: 46% 55%.
      return { x: (cw - w0 * cover) * 0.46, y: (chh - h0 * cover) * 0.55, w: w0 * cover, h: h0 * cover };
    };

    const fillBlack = (tag: number) => {
      if (drawn === tag) return;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawn = tag;
    };

    const paint = () => {
      // Once the lockup has left the film, the film behind it is black.
      if (time >= FILM_END) return fillBlack(-3);
      const target = Math.min(set.count - 1, Math.round(time * set.fps));
      const index = nearestLoaded(target);
      if (index < 0) {
        // Nothing from the logo film has arrived yet: it opens on black, so hold black.
        if (target >= set.logoFrom && drawn < set.logoFrom) fillBlack(-2);
        return;
      }
      if (index === drawn) return;
      const img = images[index];
      if (!img?.naturalWidth) return;
      const at = placement(index, img.naturalWidth, img.naturalHeight);
      if (index >= set.logoFrom) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, at.x, at.y, at.w, at.h);
      drawn = index;
      section.dataset.heroPainted = "";
    };

    /**
     * The lockup's flight, measured before anything is written. It leaves from exactly
     * where the canvas drew it in the film's last frame and lands with its mark on the
     * header logo's mark, then hands over to the real one.
     */
    const measureFlight = (): Flight | null => {
      const svg = navLogo?.querySelector("svg");
      if (!svg) return null;
      const p = clamp01((time - FILM_END) / MERGE_SECONDS);
      const e = easeInOut(clamp01(p / ARRIVE_AT));
      const { mark } = LOCKUP;

      // Take-off: the last film frame's placement, through the canvas's on-screen box
      // (which already includes the cursor parallax on the layer above it).
      const box = canvas.getBoundingClientRect();
      const frame = placement(set.count - 1, LOCKUP.film.width, LOCKUP.film.height);
      const kx = box.width / canvas.width;
      const ky = box.height / canvas.height;
      const s0 = (frame.w * kx) / LOCKUP.film.width;
      const x0 = box.left + frame.x * kx + mark.centerX * s0;
      const y0 = box.top + frame.y * ky + mark.centerY * ((frame.h * ky) / LOCKUP.film.height);

      // Landing: the header's mark, same centre, same height.
      const m = svg.getBoundingClientRect();
      const s1 = (m.height * NAV_MARK.height) / mark.height;
      const x1 = m.left + m.width * NAV_MARK.centerX;
      const y1 = m.top + m.height * NAV_MARK.centerY;

      // Scale in log space so the shrink reads as constant speed, not a sudden collapse.
      const scale = Math.exp(lerp(Math.log(s0), Math.log(s1), e));
      const cx = lerp(x0, x1, e);
      const cy = lerp(y0, y1, e);
      // The two wordmarks differ, so they overlap as briefly as possible: the still
      // is mostly gone by the time the header logo is half in.
      const handover = smoothstep(ARRIVE_AT + 0.03, 1, p);
      return {
        x: cx - (mark.centerX - LOCKUP.crop.x) * scale,
        y: cy - (mark.centerY - LOCKUP.crop.y) * scale,
        scale,
        opacity: 1 - smoothstep(ARRIVE_AT, ARRIVE_AT + 0.1, p),
        handover,
      };
    };

    const placeLockup = (flight: Flight | null) => {
      if (!lockup) return;
      if (!flight || flight.opacity <= 0) {
        lockup.style.visibility = "";
        lockup.style.opacity = "";
        lockup.style.transform = "";
        return;
      }
      lockup.style.visibility = "visible";
      lockup.style.opacity = String(flight.opacity);
      lockup.style.transform = `translate3d(${flight.x}px, ${flight.y}px, 0) scale(${flight.scale})`;
    };

    /** The header logo steps aside while its larger self is drawn, and takes over on landing. */
    const setNavLogo = (flight: Flight | null) => {
      if (!navLogo) return;
      let value = "";
      if (time >= CUES.logo && time < FILM_END) value = String(1 - smoothstep(CUES.logo, CUES.navLogoOut, time));
      else if (flight) value = String(flight.handover);
      if (value === "1") value = "";
      if (value === navLogoOpacity) return;
      navLogoOpacity = value;
      navLogo.style.opacity = value;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(sticky.clientWidth * dpr);
      const h = Math.round(sticky.clientHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      drawn = -1;
      paint();
    };

    /** Reads the scroll position into `target`; says whether the hero is off screen. */
    const readTarget = () => {
      const distance = section.offsetHeight - window.innerHeight;
      const rect = section.getBoundingClientRect();
      target = (distance > 0 ? clamp01(-rect.top / distance) : 0) * TOTAL;
      return rect.bottom <= 0 || rect.top >= window.innerHeight;
    };

    const render = () => {
      // Read everything first, then write.
      const flight = time >= FILM_END && time < LANDED ? measureFlight() : null;

      if (!started && time > TOTAL * 0.004) {
        started = true;
        section.dataset.heroStarted = "";
      }
      section.dataset.theme = time >= CUES.navDark ? "dark" : "light";
      const revealed = time >= LANDED + REVEAL_DELAY;
      section.dataset.heroState = revealed ? "revealed" : started ? "playing" : "idle";
      if (revealed && !completed) {
        completed = true;
        track("hero_complete");
      }

      paint();
      placeLockup(flight);
      setNavLogo(flight);
      if (time > CUES.probeFrom && time < CUES.logo) navProbe.sample();
      else navProbe.clear();
    };

    const tick = (now: number) => {
      raf = 0;
      const offscreen = readTarget();
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      // Nothing to glide past when the hero is not on screen (first paint, anchor links,
      // coming back to the page): jump straight to where the scroll is.
      if (!primed || offscreen) time = target;
      else time += (target - time) * (1 - Math.exp(-dt / PLAYHEAD_TAU));
      primed = true;
      const settled = Math.abs(target - time) < 0.004;
      if (settled) time = target;
      render();
      if (settled !== !moving) {
        moving = !settled;
        if (moving) section.dataset.heroMoving = "";
        else delete section.dataset.heroMoving;
      }
      if (settled) last = 0;
      else raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      resize();
      onScroll();
    };

    /** While the intro curtain is up, its film owns the connection. */
    const curtainLifted = () =>
      new Promise<void>((resolve) => {
        const html = document.documentElement;
        if (!html.hasAttribute("data-intro")) return resolve();
        const observer = new MutationObserver(() => {
          if (!html.hasAttribute("data-intro")) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
      });

    // Load the opening frames first, paint, then stream the rest in the background.
    void (async () => {
      resize();
      for (let i = 0; i < EAGER && !disposed; i++) await load(i);
      onScroll();
      await curtainLifted();
      for (let i = EAGER; i < set.count && !disposed; i++) {
        await load(i);
        if (i % 8 === 0) paint();
      }
      paint();
    })();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      parallax.dispose();
      navProbe.clear();
      placeLockup(null);
      if (navLogo) navLogo.style.opacity = "";
    };
  }, []);

  return (
    <div ref={wrapRef} className="hero-parallax" aria-hidden="true">
      <div className="hero-clip">
        {/* Frame 0 as a plain image: the first paint, and the page's LCP element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="" fetchPriority="high" decoding="async" className="hero-media hero-poster" />
        <canvas ref={canvasRef} className="hero-media hero-canvas" />
      </div>
    </div>
  );
}
