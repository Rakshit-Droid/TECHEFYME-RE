"use client";

import { useEffect, useRef } from "react";
import type { Layer } from "@/three/layer";

/**
 * The testimonials backdrop: a Three.js light ring that slowly changes shape. The
 * Three.js chunk loads only when the section is close, the loop runs only while it is on
 * screen, and without WebGL nothing mounts, so the section keeps its plain black.
 */
export function PortalField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let cancelled = false;
    let layer: Layer | null = null;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        import("@/three/effects/portal-field").then(({ mountPortalField }) => {
          if (cancelled) return;
          layer = mountPortalField(host, host.closest("section"));
        });
      },
      { rootMargin: "80% 0px" },
    );
    near.observe(host);

    return () => {
      cancelled = true;
      near.disconnect();
      layer?.dispose();
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={className} />;
}
