"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Fraction of the viewport height where a step becomes active (0.55 = 55% from the top). */
  line: number;
  /** Only run when this media query matches; otherwise every target is left as rendered. */
  media: string;
};

/**
 * Marks the step whose top has crossed the line as active, and mirrors that onto
 * matching targets. Scoped to the nearest <section>. Native scroll, no GSAP:
 * an IntersectionObserver on the section gates a frame-throttled scroll listener.
 */
export function ActiveSteps({ line, media }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = ref.current?.closest("section");
    if (!scope) return;
    const steps = Array.from(scope.querySelectorAll<HTMLElement>("[data-step]"));
    const targets = Array.from(scope.querySelectorAll<HTMLElement>("[data-step-target]"));
    if (!steps.length) return;

    const mq = window.matchMedia(media);
    let io: IntersectionObserver | null = null;
    let active = -1;

    const setActive = (index: number) => {
      if (index === active) return;
      active = index;
      for (const t of targets) {
        if (Number(t.dataset.stepTarget) === index) t.setAttribute("data-active", "");
        else t.removeAttribute("data-active");
      }
    };

    const evaluate = () => {
      const y = window.innerHeight * line;
      let index = 0;
      steps.forEach((step, i) => {
        if (step.getBoundingClientRect().top <= y) index = i;
      });
      setActive(index);
    };

    // While the section is on screen, evaluate on every scrolled frame. A thin observer band
    // can miss jumps (Page Down, find-in-page) that skip from one gap between steps to another.
    let raf = 0;
    let listening = false;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        evaluate();
      });
    };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) window.addEventListener("scroll", onScroll, { passive: true });
      else window.removeEventListener("scroll", onScroll);
    };

    const build = () => {
      io?.disconnect();
      io = null;
      listen(false);
      if (!mq.matches) return;
      io = new IntersectionObserver(([entry]) => {
        listen(Boolean(entry?.isIntersecting));
        evaluate();
      });
      io.observe(scope);
      evaluate();
    };

    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    };

    build();
    mq.addEventListener("change", build);
    window.addEventListener("resize", onResize);
    return () => {
      io?.disconnect();
      listen(false);
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", build);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(timer);
    };
  }, [line, media]);

  return <span ref={ref} hidden />;
}
