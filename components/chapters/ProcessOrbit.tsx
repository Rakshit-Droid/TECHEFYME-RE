"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import rays from "@/assets/img/process-rays-dark.png";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LogoMark } from "@/components/ui/Logo";

export type OrbitNode = {
  number?: string;
  name: string;
  description: string;
  deliverables: readonly string[];
};

/** Violet to cyan around the ring, the hero glow's own family. */
const COLORS = ["#a78bfa", "#818cf8", "#5b8cff", "#2997ff", "#22d3ee"] as const;

const SECONDS_PER_TURN = 90;
const TURN_MS = 900;

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** Discovery call, Discover, Design, Build, Iterate. */
const ICONS = [
  icon(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>,
  ),
  icon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>,
  ),
  icon(
    <>
      <rect x="3" y="3" width="18" height="7" rx="1" />
      <rect x="3" y="14" width="9" height="7" rx="1" />
      <rect x="16" y="14" width="5" height="7" rx="1" />
    </>,
  ),
  icon(<path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />),
  icon(
    <>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </>,
  ),
];

/**
 * The process as a ring of five points that turns slowly clockwise. Pressing a point
 * turns it to the top and opens its card; the card names its neighbours so the ring can
 * be walked in order. Every card is in the server HTML, so without script they simply
 * read as a list under the ring.
 */
export function ProcessOrbit({ nodes, cta }: { nodes: readonly OrbitNode[]; cta: { label: string; href: string } }) {
  const [active, setActive] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const motion = useRef({
    rot: 0,
    tween: null as null | { from: number; to: number; start: number },
    open: false,
    hover: false,
    focus: false,
    visible: false,
    raf: 0,
    last: 0,
    kick: () => {},
  });
  const step = 360 / nodes.length;

  useEffect(() => {
    const m = motion.current;
    const root = rootRef.current;
    if (!root) return;

    const frame = (t: number) => {
      m.raf = 0;
      const dt = m.last ? Math.min(64, t - m.last) : 0;
      m.last = t;
      if (m.tween) {
        const p = Math.min(1, Math.max(0, (t - m.tween.start) / TURN_MS));
        m.rot = m.tween.from + (m.tween.to - m.tween.from) * (1 - (1 - p) ** 3);
        if (p === 1) m.tween = null;
      } else if (!m.open && !m.hover && !m.focus) {
        m.rot = (m.rot + (dt / 1000) * (360 / SECONDS_PER_TURN)) % 360;
      }
      const value = `${m.rot.toFixed(3)}deg`;
      for (const el of nodeRefs.current) el?.style.setProperty("--rot", value);
      m.kick();
    };

    m.kick = () => {
      const moving = m.tween !== null || !(m.open || m.hover || m.focus);
      if (!m.visible || !moving) {
        m.last = 0;
        return;
      }
      if (!m.raf) m.raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      m.visible = Boolean(entry?.isIntersecting);
      if (m.visible) root.dataset.visible = "";
      else delete root.dataset.visible;
      m.kick();
    });
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(m.raf);
      m.raf = 0;
      m.kick = () => {};
    };
  }, []);

  const select = useCallback(
    (i: number | null, focus = false) => {
      const m = motion.current;
      if (i !== null) {
        // Shortest turn that brings this point to twelve o'clock.
        const delta = ((((-(i * step + m.rot)) % 360) + 540) % 360) - 180;
        m.tween = { from: m.rot, to: m.rot + delta, start: performance.now() };
      }
      m.open = i !== null;
      setActive(i);
      m.kick();
      if (i === null) return;
      requestAnimationFrame(() => {
        if (focus) buttonRefs.current[i]?.focus({ preventScroll: true });
        // Under the ring on narrow screens the card can open below the fold.
        if (window.matchMedia("(max-width: 1023px)").matches) {
          document.getElementById(`orbit-panel-${i}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      });
    },
    [step],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      select(null);
      buttonRefs.current[active]?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, select]);

  const onRootClick = (e: MouseEvent) => {
    if (active !== null && !(e.target as Element).closest(".orbit-button, .orbit-panel")) select(null);
  };

  const hold = (key: "hover" | "focus", on: boolean) => {
    motion.current[key] = on;
    motion.current.kick();
  };

  const n = nodes.length;
  const state = (i: number) => {
    if (active === null) return undefined;
    if (i === active) return "active";
    return (i - active + n) % n === 1 || (active - i + n) % n === 1 ? "related" : "dim";
  };

  return (
    <div ref={rootRef} className="orbit" data-open={active !== null ? "" : undefined} onClick={onRootClick}>
      <div className="orbit-stage">
        <div aria-hidden="true" className="orbit-rays">
          <Image src={rays} alt="" fill sizes="(min-width: 1024px) 1460px, 820px" />
        </div>
        <div aria-hidden="true" className="orbit-ring" />
        <div aria-hidden="true" className="orbit-core">
          <LogoMark size={40} id="orbit-mark" className="orbit-mark" />
        </div>

        <ol className="orbit-nodes">
          {nodes.map((node, i) => (
            <li
              key={node.name}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="orbit-node"
              data-state={state(i)}
              style={{ "--a": `${i * step}deg`, "--c": COLORS[i % COLORS.length] } as CSSProperties}
            >
              <button
                ref={(el) => {
                  buttonRefs.current[i] = el;
                }}
                type="button"
                className="orbit-button"
                aria-expanded={active === i}
                aria-controls={`orbit-panel-${i}`}
                onClick={() => select(active === i ? null : i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && hold("hover", true)}
                onPointerLeave={() => hold("hover", false)}
                onFocus={(e) => hold("focus", e.currentTarget.matches(":focus-visible"))}
                onBlur={() => hold("focus", false)}
              >
                <span className="orbit-dot">{ICONS[i]}</span>
                <span className="orbit-label">{node.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="orbit-panels">
        {nodes.map((node, i) => {
          const prev = (i - 1 + n) % n;
          const next = (i + 1) % n;
          return (
            <section
              key={node.name}
              id={`orbit-panel-${i}`}
              aria-labelledby={`orbit-title-${i}`}
              className="orbit-panel"
              data-active={active === i ? "" : undefined}
              style={{ "--c": COLORS[i % COLORS.length] } as CSSProperties}
            >
              <div className="orbit-panel-head">
                <span className="orbit-badge">{node.number ?? ICONS[i]}</span>
                <span aria-hidden="true" className="orbit-steps">
                  {nodes.map((other, k) => (
                    <i key={other.name} data-on={k <= i ? "" : undefined} />
                  ))}
                </span>
              </div>
              <h3 id={`orbit-title-${i}`} className="orbit-panel-title">
                {node.name}
              </h3>
              <p className="orbit-panel-text">{node.description}</p>
              {node.deliverables.length > 0 && (
                <ul className="orbit-panel-list">
                  {node.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
              {i === 0 && (
                <div className="orbit-panel-cta">
                  <InteractiveHoverButton href={cta.href} label={cta.label} track="cta_book" trackLocation="process" />
                </div>
              )}
              <div className="orbit-panel-links">
                <button type="button" onClick={() => select(prev, true)}>
                  <span aria-hidden="true">←</span> {nodes[prev]!.name}
                </button>
                <button type="button" onClick={() => select(next, true)}>
                  {nodes[next]!.name} <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
