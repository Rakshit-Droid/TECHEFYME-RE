"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type RefObject } from "react";

interface ShinyButtonProps {
  label?: string;
  /** Renders a link instead of a button: internal paths use next/link, http opens a new tab. */
  href?: string;
  onClick?: () => void;
  className?: string;
  fillColor?: string;
  labelColor?: string;
  accentColor?: string;
  accentSoftColor?: string;
  sweepDuration?: number;
  easeDuration?: number;
  arcWidth?: number;
  cornerRadius?: number;
  showSpeckle?: boolean;
  showSheen?: boolean;
  speckleOpacity?: number;
  /** Delegated analytics, same contract as Button: read by NavState. */
  track?: string;
  trackLocation?: string;
}

/**
 * A pill whose edge carries a travelling arc of light, faster and wider on hover.
 * Defaults are the site's own: brand blue for the arc, violet for the hover shine,
 * a near-black fill that still reads as an object on a pure black stage.
 *
 * The client wants motion to play for everyone, so unlike the original component
 * this one keeps animating under prefers-reduced-motion, and it overrides the global
 * reduced-motion reset in globals.css to do so.
 */
export function ShinyButton({
  label = "Get Started",
  href,
  onClick,
  className = "",
  fillColor = "#05060b",
  labelColor = "#ffffff",
  accentColor = "#2997ff",
  accentSoftColor = "#a78bfa",
  sweepDuration = 3,
  easeDuration = 0.8,
  arcWidth = 5,
  cornerRadius = 32,
  showSpeckle = true,
  showSheen = true,
  speckleOpacity = 0.4,
  track,
  trackLocation,
}: ShinyButtonProps) {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.offscreen = "";
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete el.dataset.offscreen;
      else el.dataset.offscreen = "";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const scope = `gleam-edge-${instanceId}`;
  const angle = `--gradient-angle-${instanceId}`;
  const offset = `--gradient-angle-offset-${instanceId}`;
  const percent = `--gradient-percent-${instanceId}`;
  const shine = `--gradient-shine-${instanceId}`;
  const running = `var(--animation) var(--duration), var(--animation) calc(var(--duration) / 0.4) reverse paused`;

  const css = `
    @property ${angle} {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }
    @property ${offset} {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }
    @property ${percent} {
      syntax: "<percentage>";
      initial-value: ${arcWidth}%;
      inherits: false;
    }
    @property ${shine} {
      syntax: "<color>";
      initial-value: white;
      inherits: false;
    }

    .${scope} {
      --gleam-base: ${fillColor};
      --gleam-inset: #1b1d2a;
      --gleam-label: ${labelColor};
      --gleam-accent: ${accentColor};
      --gleam-accent-soft: ${accentSoftColor};
      --animation: gradient-angle-${instanceId} linear infinite;
      --duration: ${sweepDuration}s;
      --shadow-size: 2px;
      --transition: ${easeDuration}s cubic-bezier(0.25, 1, 0.5, 1);

      isolation: isolate;
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline-offset: 4px;
      padding: 1rem 2rem;
      font-size: 1.0625rem;
      line-height: 1.2;
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;
      border: 1px solid transparent;
      border-radius: ${cornerRadius}px;
      color: var(--gleam-label);
      background:
        linear-gradient(var(--gleam-base), var(--gleam-base)) padding-box,
        conic-gradient(
          from calc(var(${angle}) - var(${offset})),
          transparent,
          var(--gleam-accent) var(${percent}),
          var(${shine}) calc(var(${percent}) * 2),
          var(--gleam-accent) calc(var(${percent}) * 3),
          transparent calc(var(${percent}) * 4)
        ) border-box;
      box-shadow: inset 0 0 0 1px var(--gleam-inset);
      transition: var(--transition);
      transition-property: ${offset}, ${percent}, ${shine};
    }

    .${scope}::before,
    .${scope}::after,
    .${scope} span::before {
      content: "";
      pointer-events: none;
      position: absolute;
      inset-inline-start: 50%;
      inset-block-start: 50%;
      translate: -50% -50%;
      z-index: -1;
    }

    .${scope}:active {
      translate: 0 1px;
    }

    .${scope}::before {
      --size: calc(100% - var(--shadow-size) * 3);
      --position: 2px;
      --space: calc(var(--position) * 2);
      width: var(--size);
      height: var(--size);
      background: radial-gradient(
        circle at var(--position) var(--position),
        white calc(var(--position) / 4),
        transparent 0
      ) padding-box;
      background-size: var(--space) var(--space);
      background-repeat: space;
      mask-image: conic-gradient(
        from calc(var(${angle}) + 45deg),
        black,
        transparent 10% 90%,
        black
      );
      border-radius: inherit;
      opacity: ${showSpeckle ? speckleOpacity : 0};
      z-index: -1;
    }

    .${scope}::after {
      --animation: shimmer-${instanceId} linear infinite;
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(-50deg, transparent, var(--gleam-accent), transparent);
      mask-image: radial-gradient(circle at bottom, transparent 40%, black);
      opacity: ${showSheen ? 0.6 : 0};
    }

    .${scope} span {
      z-index: 1;
    }

    .${scope} span::before {
      --size: calc(100% + 1rem);
      width: var(--size);
      height: var(--size);
      box-shadow: inset 0 -1ex 2rem 4px var(--gleam-accent);
      opacity: 0;
      transition: opacity var(--transition);
      animation: calc(var(--duration) * 1.5) breathe-${instanceId} linear infinite;
    }

    .${scope},
    .${scope}::before,
    .${scope}::after {
      animation: ${running};
      animation-composition: add;
    }

    .${scope}:is(:hover, :focus-visible) {
      ${percent}: 20%;
      ${offset}: 95deg;
      ${shine}: var(--gleam-accent-soft);
    }

    .${scope}:is(:hover, :focus-visible),
    .${scope}:is(:hover, :focus-visible)::before,
    .${scope}:is(:hover, :focus-visible)::after {
      animation-play-state: running;
    }

    .${scope}:is(:hover, :focus-visible) span::before {
      opacity: 1;
    }

    @keyframes gradient-angle-${instanceId} {
      to {
        ${angle}: 360deg;
      }
    }

    @keyframes shimmer-${instanceId} {
      to {
        rotate: 360deg;
      }
    }

    @keyframes breathe-${instanceId} {
      from,
      to {
        scale: 1;
      }
      50% {
        scale: 1.2;
      }
    }

    /* Its arc animates a custom property, which runs on the main thread: pause off screen. */
    .${scope}[data-offscreen],
    .${scope}[data-offscreen]::before,
    .${scope}[data-offscreen]::after,
    .${scope}[data-offscreen] span::before {
      animation-play-state: paused !important;
    }

    /* Motion plays for everyone on this site: undo the global reduced-motion reset. */
    @media (prefers-reduced-motion: reduce) {
      .${scope},
      .${scope}::before,
      .${scope}::after {
        animation: ${running} !important;
        transition-property: ${offset}, ${percent}, ${shine} !important;
      }
      .${scope} span::before {
        animation: calc(var(--duration) * 1.5) breathe-${instanceId} linear infinite !important;
        transition-property: opacity !important;
      }
    }
  `;

  const cls = `${scope} ${className}`;
  const data = track ? { "data-track": track, "data-track-location": trackLocation } : {};
  const content = <span>{label}</span>;

  let element;
  if (href === undefined) {
    element = (
      <button ref={ref as RefObject<HTMLButtonElement>} type="button" className={cls} onClick={onClick} {...data}>
        {content}
      </button>
    );
  } else if (href.startsWith("/")) {
    element = (
      <Link ref={ref as RefObject<HTMLAnchorElement>} href={href} className={cls} onClick={onClick} {...data}>
        {content}
      </Link>
    );
  } else {
    const newTab = href.startsWith("http");
    element = (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        className={cls}
        onClick={onClick}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...data}
      >
        {content}
      </a>
    );
  }

  return (
    <>
      <style>{css}</style>
      {element}
    </>
  );
}

