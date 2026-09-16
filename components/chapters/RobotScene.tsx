"use client";

import type { Application } from "@splinetool/runtime";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { hasWebGL } from "@/three/quality";

const Spline = lazy(() => import("@splinetool/react-spline"));

/** The robot from Spline's public scene library; its head turns toward the cursor. */
const SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * The contact visual: a 3D robot that looks where the pointer goes, with a light that
 * follows the pointer behind it. The Spline runtime is heavy, so it only loads on wide
 * screens once the section is close, and the scene stops rendering while off screen.
 */
export function RobotScene() {
  const ref = useRef<HTMLDivElement>(null);
  const app = useRef<Application | null>(null);
  const visible = useRef(false);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // Without WebGL the runtime would only download a large scene it cannot draw.
    if (!el || !window.matchMedia("(min-width: 1024px)").matches || !hasWebGL()) return;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setLoad(true);
        near.disconnect();
      },
      { rootMargin: "60% 0px" },
    );
    near.observe(el);

    const onScreen = new IntersectionObserver(([entry]) => {
      visible.current = Boolean(entry?.isIntersecting);
      if (visible.current) app.current?.play();
      else app.current?.stop();
    });
    onScreen.observe(el);

    // The whole section drives the scene, not just the stage: the robot looks toward the
    // pointer wherever it is in the section, and the light follows, held to the stage's edge.
    const card = el.closest<HTMLElement>("[data-robot-scope]") ?? el;
    let raf = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      raf = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const x = Math.min(r.width, Math.max(0, last.clientX - r.left));
      const y = Math.min(r.height, Math.max(0, last.clientY - r.top));
      el.style.setProperty("--sx", `${Math.round(x)}px`);
      el.style.setProperty("--sy", `${Math.round(y)}px`);
      // Spline only listens on its canvas, and reads positions relative to it. So the pointer's
      // place in the whole section is rescaled onto the canvas: far left of the section reads
      // as the canvas's left edge, and the robot turns that way without over-rotating.
      const canvas = el.querySelector("canvas");
      if (!canvas) return;
      const scope = card.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (last.clientX - scope.left) / scope.width));
      const ny = Math.min(1, Math.max(0, (last.clientY - scope.top) / scope.height));
      const clientX = c.left + nx * c.width;
      const clientY = c.top + ny * c.height;
      const forwarded = new PointerEvent("pointermove", {
        clientX,
        clientY,
        pointerId: last.pointerId,
        pointerType: last.pointerType,
        isPrimary: true,
        bubbles: true,
      });
      // Spline measures from pageX/pageY, which a constructed event reports without the
      // page's scroll, so the robot would look far above the pointer. Give it the real values.
      Object.defineProperty(forwarded, "pageX", { value: clientX + window.scrollX });
      Object.defineProperty(forwarded, "pageY", { value: clientY + window.scrollY });
      canvas.dispatchEvent(forwarded);
    };
    const onMove = (e: PointerEvent) => {
      if (!e.isTrusted || e.pointerType === "touch") return;
      last = e;
      el.dataset.pointer = "";
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => delete el.dataset.pointer;
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave);

    return () => {
      near.disconnect();
      onScreen.disconnect();
      cancelAnimationFrame(raf);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="contact-stage" data-ready={ready ? "" : undefined}>
      <span className="contact-spot" />
      {load ? (
        <Suspense fallback={null}>
          <Spline
            scene={SCENE}
            className="contact-robot"
            onLoad={(loaded) => {
              app.current = loaded;
              if (!visible.current) loaded.stop();
              setReady(true);
            }}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
