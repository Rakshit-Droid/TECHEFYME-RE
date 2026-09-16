"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { INTRO } from "@/lib/intro";

type Exit = "click" | "key" | "scroll" | "button" | "hidden" | "error" | "timeout" | "none";

/**
 * The entry curtain. The page renders underneath it from the first paint — the
 * curtain is only a fixed black layer on top — so the hero still wins LCP and the
 * site is complete the instant the film is dismissed.
 *
 * Whether it runs at all was decided pre-paint by INTRO_HEAD_SCRIPT; this
 * component only plays, dismisses, and gets out of the way. Every path ends in
 * dismissal: ended, any input, a hidden tab, a decode error, a slow first frame,
 * or a hard cap.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const exit = useRef<(reason: Exit) => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (!html.hasAttribute("data-intro")) return;

    const el = video.current;
    const timers: number[] = [];
    let done = false;
    let started = false;

    const off = () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchmove", onInput);
      document.removeEventListener("visibilitychange", onHide);
    };

    const finish = (reason: Exit) => {
      if (done) return;
      done = true;
      track("intro_end", { at: Math.round((el?.currentTime ?? 0) * 100) / 100, skipped: reason });
      timers.forEach(clearTimeout);
      off();
      html.setAttribute("data-intro-out", "");
      const clear = () => {
        html.removeAttribute("data-intro");
        html.removeAttribute("data-intro-out");
        window.scrollTo(0, 0);
        el?.pause();
      };
      root.current?.addEventListener("transitionend", clear, { once: true });
      timers.push(window.setTimeout(clear, 700));
    };
    exit.current = finish;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " " || e.key === "Tab") finish("key");
    }
    function onPointer(e: PointerEvent) {
      finish(e.target === skip.current ? "button" : "click");
    }
    function onInput() {
      finish("scroll");
    }
    function onHide() {
      if (document.visibilityState === "hidden") finish("hidden");
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchmove", onInput, { passive: true });
    document.addEventListener("visibilitychange", onHide);

    if (!el) {
      finish("error");
      return;
    }

    // AV1 is a quarter of the size; H.264 is the one every decoder has in hardware.
    el.muted = true;
    el.src = el.canPlayType('video/mp4; codecs="av01.0.05M.10"') === "probably" ? INTRO.av1 : INTRO.h264;
    el.load();
    el.addEventListener("playing", () => (started = true), { once: true });
    el.addEventListener("ended", () => finish("none"), { once: true });
    el.addEventListener("error", () => finish("error"), { once: true });
    el.play().then(() => track("intro_play")).catch(() => finish("error"));

    // A curtain still waiting for its first frame is just a black screen.
    timers.push(window.setTimeout(() => !started && finish("timeout"), INTRO.readyMs));
    timers.push(window.setTimeout(() => finish("timeout"), INTRO.capMs));

    return () => {
      timers.forEach(clearTimeout);
      off();
    };
  }, []);

  return (
    <div ref={root} className="intro" role="presentation">
      <video
        ref={video}
        className="intro-video"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
      />
      <button ref={skip} type="button" className="intro-skip" onClick={() => exit.current("button")}>
        Skip intro
      </button>
    </div>
  );
}
