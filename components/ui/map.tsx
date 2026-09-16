import type { CSSProperties } from "react";
import { InView } from "@/components/motion/InView";
import { WORLD_MAP } from "@/lib/world-map";

export type MapPoint = {
  lat: number;
  lng: number;
  label?: string;
  /** Shorter label for phones, where full names would collide. */
  shortLabel?: string;
  /** Which side of the pin the label sits on, for neighbours that would overlap. */
  labelSide?: "top" | "bottom" | "left" | "right";
};

export type MapRoute = { start: MapPoint; end: MapPoint };

// Ellipsoidal Mercator (WGS84), the projection dotted-map drew the dots with.
const A = 6378137;
const E = 0.0818191908426215;
const project = ({ lat, lng }: MapPoint) => {
  const phi = (lat * Math.PI) / 180;
  const s = Math.sin(phi);
  const mx = A * ((lng * Math.PI) / 180);
  const my = A * Math.log(Math.tan(Math.PI / 4 + phi / 2) * ((1 - E * s) / (1 + E * s)) ** (E / 2));
  return {
    x: (WORLD_MAP.width * (mx - WORLD_MAP.xMin)) / WORLD_MAP.xRange,
    y: (WORLD_MAP.height * (WORLD_MAP.yMax - my)) / WORLD_MAP.yRange,
  };
};

/** A curve that lifts off the map in proportion to how far it travels. */
const arc = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const cx = (a.x + b.x) / 2;
  const cy = Math.min(a.y, b.y) - Math.max(3, dist * 0.32);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

/** Seconds between one route starting to draw and the next. */
const STEP = 0.45;

/**
 * A dotted world with routes drawn across it. Server-rendered: the dots are a static
 * image and every route, pin and label is computed here, so the only client code is
 * the observer that starts the drawing when the map comes into view. Once drawn, a
 * light keeps travelling each route and the pins pulse.
 */
export function WorldMap({ dots, className = "" }: { dots: MapRoute[]; className?: string }) {
  const routes = dots.map((d, i) => {
    const a = project(d.start);
    const b = project(d.end);
    return { d: arc(a, b), i };
  });

  // Each place once, lit when the first route reaching it arrives.
  const places = new Map<string, MapPoint & { x: number; y: number; at: number }>();
  dots.forEach((d, i) => {
    for (const [p, at] of [
      [d.start, i],
      [d.end, i + 0.9],
    ] as const) {
      const key = p.label ?? `${p.lat},${p.lng}`;
      const prev = places.get(key);
      if (!prev || at < prev.at) places.set(key, { ...p, ...project(p), at });
    }
  });

  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

  return (
    <InView className={`world-map ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WORLD_MAP.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="world-map-dots" />

      <svg
        viewBox={`0 0 ${WORLD_MAP.width} ${WORLD_MAP.height}`}
        className="world-map-routes"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="world-map-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2997ff" stopOpacity="0.2" />
            <stop offset="18%" stopColor="#2997ff" />
            <stop offset="82%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
          </linearGradient>
          <filter id="world-map-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#world-map-glow)">
          {routes.map(({ d, i }) => (
            <g key={i} style={{ "--i": i, "--step": `${STEP}s` } as CSSProperties}>
              <path d={d} pathLength={1} className="world-map-route" stroke="url(#world-map-line)" />
              <path d={d} pathLength={1} className="world-map-comet" />
            </g>
          ))}
        </g>

        {[...places.values()].map((p) => (
          <g key={p.label ?? `${p.lat},${p.lng}`} style={{ "--at": p.at, "--step": `${STEP}s` } as CSSProperties}>
            <circle cx={p.x} cy={p.y} r={1.6} className="world-map-ping" />
            <circle cx={p.x} cy={p.y} r={0.62} className="world-map-pin" />
          </g>
        ))}
      </svg>

      {[...places.values()]
        .filter((p) => p.label)
        .map((p) => (
          <span
            key={p.label}
            aria-hidden="true"
            className="world-map-label"
            data-side={p.labelSide ?? "top"}
            style={
              {
                left: pct(p.x, WORLD_MAP.width),
                top: pct(p.y, WORLD_MAP.height),
                "--at": p.at,
                "--step": `${STEP}s`,
              } as CSSProperties
            }
          >
            <span className="world-map-label-full">{p.label}</span>
            <span className="world-map-label-short">{p.shortLabel ?? p.label}</span>
          </span>
        ))}
    </InView>
  );
}
