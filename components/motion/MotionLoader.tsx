"use client";

import { useEffect } from "react";

/**
 * Loads GSAP + ScrollTrigger only after hydration, in their own chunk.
 * The page is complete and visible without it.
 */
export function MotionLoader() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./Choreography")
      .then((m) => {
        if (!cancelled) cleanup = m.init();
      })
      .catch(() => {
        // Motion is an enhancement; a failed chunk leaves the static page.
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
