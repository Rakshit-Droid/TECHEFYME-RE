"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import {
  CLIPS,
  CUES,
  FILM_SECONDS,
  HANDS_SECONDS,
  LOCKUP,
  LOGO_SECONDS,
  MERGE_SECONDS,
  MOBILE,
  NAV_MARK,
  POSTER,
  TIMELINE_SECONDS,
} from "@/lib/hero-gate";
import { createNavProbe } from "./navProbe";
import { createParallax } from "./parallax";

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
 * The playhead follows the scroll position rather than jumping to it: it closes about
 * 63% of the gap every PLAYHEAD_TAU seconds (0.18 per frame at 60Hz). Wheel events
 * arrive unevenly, and a direct write reproduces every gap as a stutter.
 */
const PLAYHEAD_TAU = 0.085;

/**
 * Seeks smaller than this show nothing (a 24fps frame is 42ms) and still cost a decode.
 * Phones get a wider band because their decoders are slower.
 */
const SEEK_EPS = { desktop: 0.008, mobile: 0.02 };

/** Keep clips a hair short of their end: seeking to the exact duration can show nothing. */
const END_GUARD = 0.02;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Flight = { x: number; y: number; scale: number; opacity: number; handover: number };
type Segment = "hands" | "logo" | "none";
type Clip = { el: HTMLVideoElement; ready: boolean; painted: boolean; priming: boolean; stuckAt: number };

/**
 * The hero film, scrubbed by scroll. The hero section is tall and its inner layer is
 * sticky, so scroll position maps to a moment on the timeline: the visitor drives the
 * hands together and the black hole open, then the mark and wordmark out of the black,
 * then the lockup up into the header logo. No autoplay, no scroll-jacking — the page
 * scrolls at its own speed and the picture follows it, in both directions.
 *
 * Both films are real video, keyframed densely and seeked by the playhead, so the
 * hardware decoder does the work and nothing holds hundreds of decoded frames.
 */
export function HeroFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const handsRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const handsEl = handsRef.current;
    const logoEl = logoRef.current;
    const sticky = wrap?.closest<HTMLElement>(".hero-sticky");
    const section = wrap?.closest<HTMLElement>("[data-hero]");
    if (!wrap || !handsEl || !logoEl || !sticky || !section) return;

    document.documentElement.setAttribute("data-hero-armed", "");
    const hero: HTMLElement = section; // narrowed for the hoisted tick()

    const mobile = window.matchMedia(MOBILE).matches;
    const sources = mobile ? CLIPS.mobile : CLIPS.desktop;
    const eps = mobile ? SEEK_EPS.mobile : SEEK_EPS.desktop;
    const lockup = section.querySelector<HTMLElement>(".hero-lockup");
    const navLogo = document.querySelector<HTMLElement>("[data-nav-logo]");

    const hands: Clip = { el: handsEl, ready: false, painted: false, priming: false, stuckAt: 0 };
    const logo: Clip = { el: logoEl, ready: false, painted: false, priming: false, stuckAt: 0 };
    const urls: string[] = [];

    let time = 0; // where the playhead is, in seconds
    let target = 0; // where the scroll position says it should be
    let last = 0;
    let primed = false;
    let moving = false;
    let raf = 0;
    let completed = false;
    let started = false;
    let disposed = false;
    let segment: Segment | "" = "";
    let navLogoOpacity = "";

    const parallax = createParallax(section, wrap);
    const navProbe = createNavProbe(() => (hands.painted ? handsEl : undefined));

    const segmentAt = (t: number): Segment => (t < HANDS_SECONDS ? "hands" : t < FILM_SECONDS ? "logo" : "none");
    const handsTime = (t: number) => Math.min(Math.max(t, 0), HANDS_SECONDS - END_GUARD);
    const logoTime = (t: number) => Math.min(Math.max(t - HANDS_SECONDS, 0), LOGO_SECONDS - END_GUARD);

    /**
     * Asks the decoder for a time. Never while it is still resolving the last seek (a
     * fast flick would pile them up and freeze the picture), but a seek stuck for more
     * than 700ms is re-issued rather than waited on forever. Returns whether the clip
     * still has work to do.
     */
    const seek = (clip: Clip, t: number) => {
      if (!clip.ready) return false;
      const el = clip.el;
      // Priming plays the clip for an instant; a scrubbed clip must never run on its own.
      // (Not mid-prime: interrupting that play() can leave iOS unprimed.)
      if (!el.paused && !clip.priming) el.pause();
      if (el.seeking) {
        const now = performance.now();
        if (!clip.stuckAt) clip.stuckAt = now;
        else if (now - clip.stuckAt > 700) {
          clip.stuckAt = now;
          el.currentTime = el.currentTime + 0.001;
        }
        return true;
      }
      clip.stuckAt = 0;
      if (Math.abs(el.currentTime - t) <= eps) return false;
      el.currentTime = t;
      return true;
    };

    function onScroll() {
      if (!raf && !disposed) raf = requestAnimationFrame(tick);
    }

    const load = async (clip: Clip, src: string) => {
      try {
        // Fetched whole, so seeking never waits on a range request.
        const res = await fetch(src);
        if (!res.ok) return;
        const blob = await res.blob();
        if (disposed) return;
        const el = clip.el;
        const paint = () => {
          if (clip.painted || disposed) return;
          clip.painted = true;
          if (clip === hands) section.dataset.heroPainted = "";
        };
        el.addEventListener(
          "loadedmetadata",
          () => {
            clip.ready = true;
            // Force a first seek even at 0: the painted flag waits for a 'seeked'.
            el.currentTime = Math.max(clip === hands ? handsTime(time) : logoTime(time), 0.001);
            // A muted inline play() primes the decoder so seeks paint straight away
            // (iOS will not paint a never-played video). Rejection here is harmless.
            clip.priming = true;
            el.play()
              .then(() => el.pause())
              .catch(() => {})
              .finally(() => {
                clip.priming = false;
                // It may have run for a moment: put it back where the scroll says it should be.
                onScroll();
              });
            onScroll();
          },
          { once: true },
        );
        el.addEventListener("seeked", paint, { once: true });
        el.addEventListener("seeked", onScroll);
        // Never let the picture depend only on an event that may not arrive.
        window.setTimeout(paint, 2500);
        el.preload = "auto";
        el.muted = true;
        el.playsInline = true;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        el.src = url;
      } catch {
        // The poster holds.
      }
    };

    /** Fits the logo film: whole on a phone, a little inside a cover fit elsewhere. */
    const fitLogo = () => {
      const w = sticky.clientWidth;
      const h = sticky.clientHeight;
      const ratio = LOCKUP.film.width / LOCKUP.film.height;
      const contain = Math.min(w / ratio, h);
      const cover = Math.max(w / ratio, h);
      logoEl.style.setProperty("--logo-zoom", String(Math.min(cover / contain, LOGO_ZOOM)));
    };

    /**
     * The lockup's flight, measured before anything is written. It leaves from exactly
     * where the logo film drew its last frame and lands with its mark on the header
     * logo's mark, then hands over to the real one.
     */
    const measureFlight = (): Flight | null => {
      const svg = navLogo?.querySelector("svg");
      if (!svg) return null;
      const p = clamp01((time - FILM_SECONDS) / MERGE_SECONDS);
      const e = easeInOut(clamp01(p / ARRIVE_AT));
      const { mark, film } = LOCKUP;

      // Take-off: the logo film's picture inside its (zoomed, parallaxed) element box.
      const box = logoEl.getBoundingClientRect();
      const s0 = Math.min(box.width / film.width, box.height / film.height);
      const x0 = box.left + (box.width - film.width * s0) / 2 + mark.centerX * s0;
      const y0 = box.top + (box.height - film.height * s0) / 2 + mark.centerY * s0;

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
      if (time >= CUES.logo && time < FILM_SECONDS) value = String(1 - smoothstep(CUES.logo, CUES.navLogoOut, time));
      else if (flight) value = String(flight.handover);
      if (value === "1") value = "";
      if (value === navLogoOpacity) return;
      navLogoOpacity = value;
      navLogo.style.opacity = value;
    };

    const setData = (key: string, value: string) => {
      if (section.dataset[key] !== value) section.dataset[key] = value;
    };

    /** Reads the scroll position into `target`; says whether the hero is off screen. */
    const readTarget = () => {
      const distance = section.offsetHeight - window.innerHeight;
      const rect = section.getBoundingClientRect();
      target = (distance > 0 ? clamp01(-rect.top / distance) : 0) * TIMELINE_SECONDS;
      return rect.bottom <= 0 || rect.top >= window.innerHeight;
    };

    /** Draws the timeline at `time`. Returns whether a clip is still catching up. */
    const render = () => {
      // Read everything first, then write.
      const flight = time >= FILM_SECONDS && time < FILM_SECONDS + MERGE_SECONDS ? measureFlight() : null;

      if (!started && time > TIMELINE_SECONDS * 0.004) {
        started = true;
        section.dataset.heroStarted = "";
      }
      setData("theme", time >= CUES.navDark ? "dark" : "light");
      const revealed = time >= FILM_SECONDS + MERGE_SECONDS + REVEAL_DELAY;
      setData("heroState", revealed ? "revealed" : started ? "playing" : "idle");
      if (revealed && !completed) {
        completed = true;
        track("hero_complete");
      }

      const now = segmentAt(time);
      if (now !== segment) {
        segment = now;
        section.dataset.heroClip = now;
      }
      // The clip on screen follows the playhead; the other waits parked at the seam,
      // so crossing it in either direction shows the right frame immediately.
      const onScreen = now === "logo" ? seek(logo, logoTime(time)) : now === "hands" ? seek(hands, handsTime(time)) : false;
      const parked = now === "logo" ? seek(hands, handsTime(HANDS_SECONDS)) : seek(logo, now === "none" ? logoTime(FILM_SECONDS) : 0.001);

      placeLockup(flight);
      setNavLogo(flight);
      if (time > CUES.probeFrom && time < CUES.logo) navProbe.sample();
      else navProbe.clear();
      return onScreen || parked;
    };

    function tick(nowMs: number) {
      raf = 0;
      const offscreen = readTarget();
      const dt = last ? Math.min(0.1, (nowMs - last) / 1000) : 0;
      last = nowMs;
      // Nothing to glide past when the hero is not on screen (first paint, anchor links,
      // coming back to the page): jump straight to where the scroll is.
      if (!primed || offscreen) time = target;
      else time += (target - time) * (1 - Math.exp(-dt / PLAYHEAD_TAU));
      primed = true;
      const arrived = Math.abs(target - time) < 0.004;
      if (arrived) time = target;
      const busy = render();
      const settled = arrived && !busy;
      if (settled === moving) {
        moving = !settled;
        if (moving) hero.dataset.heroMoving = "";
        else delete hero.dataset.heroMoving;
      }
      if (arrived) last = 0;
      // Once arrived, a clip still seeking gets another look from its 'seeked' event.
      else raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      fitLogo();
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

    fitLogo();
    void (async () => {
      await load(hands, sources.hands);
      await curtainLifted();
      if (!disposed) await load(logo, sources.logo);
    })();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      handsEl.removeEventListener("seeked", onScroll);
      logoEl.removeEventListener("seeked", onScroll);
      parallax.dispose();
      navProbe.clear();
      placeLockup(null);
      if (navLogo) navLogo.style.opacity = "";
      for (const el of [handsEl, logoEl]) {
        el.removeAttribute("src");
        el.load();
      }
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const video = {
    muted: true,
    playsInline: true,
    preload: "none",
    disablePictureInPicture: true,
    disableRemotePlayback: true,
    tabIndex: -1,
  } as const;

  return (
    <div ref={wrapRef} className="hero-parallax" aria-hidden="true">
      <div className="hero-clip">
        {/* Frame 0 as a plain image: the first paint, and the page's LCP element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER} alt="" fetchPriority="high" decoding="async" className="hero-media hero-poster" />
        <video ref={handsRef} className="hero-media hero-video" {...video} />
        <video ref={logoRef} className="hero-logo-video" {...video} />
      </div>
    </div>
  );
}
