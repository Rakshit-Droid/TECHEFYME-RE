import type { CSSProperties } from "react";
import { PortalField } from "@/components/motion/PortalField";
import { Avatar } from "@/components/ui/Avatar";
import { Chapter } from "@/components/ui/Chapter";
import { proof } from "@/content/chapters";
import { services } from "@/content/services";
import { SERVICE_COLORS } from "@/lib/service-colors";
import { ProofWall } from "./ProofWall";

type Testimonial = (typeof proof.testimonials)[number];

const serviceName = (id: Testimonial["service"]) => services.find((s) => s.id === id)?.name ?? "";

/** The quote with its result phrase marked; the marker sweeps in when the card is lit. */
function Quote({ t }: { t: Testimonial }) {
  const at = t.quote.indexOf(t.highlight);
  if (at < 0) return <p>“{t.quote}”</p>;
  return (
    <p>
      “{t.quote.slice(0, at)}
      <mark className="proof-mark">{t.highlight}</mark>
      {t.quote.slice(at + t.highlight.length)}”
    </p>
  );
}

function Card({ t, index }: { t: Testimonial; index: number }) {
  return (
    <li className="proof-card" data-index={index} style={{ "--c": SERVICE_COLORS[t.service] } as CSSProperties}>
      <span aria-hidden="true" className="proof-glyph">
        “
      </span>
      <figure>
        <p className="proof-tag">
          <span aria-hidden="true" className="proof-tag-dot" />
          {serviceName(t.service)}
        </p>
        <blockquote className="proof-quote">
          <Quote t={t} />
        </blockquote>
        <figcaption className="proof-by">
          <Avatar name={t.name} tone="color" />
          <span>
            <span className="block font-medium text-ink">{t.name}</span>
            <span className="block text-muted">
              {t.role}, {t.company}
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

/**
 * One column of the wall. The page carries each quote once; ProofWall adds the second
 * copy that makes the drift seamless, and on phones gathers every column into this one.
 */
function Column({ items, seconds, delay }: { items: readonly { t: Testimonial; index: number }[]; seconds: number; delay: number }) {
  return (
    <div className="proof-col" style={{ "--dur": `${seconds}s`, "--delay": `${delay}s` } as CSSProperties}>
      <div className="proof-track">
        <ul>
          {items.map(({ t, index }) => (
            <Card key={t.name} t={t} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Each column's own pace, so the wall never lines up: medium, slow, quick. */
const COLUMNS = [
  { offset: 0, seconds: 48, delay: -6 },
  { offset: 1, seconds: 66, delay: -24 },
  { offset: 2, seconds: 38, delay: -14 },
] as const;

/** Twelve named people as a wall of three columns, each rising at its own speed. */
export function Proof() {
  const all = proof.testimonials.map((t, index) => ({ t, index }));

  return (
    <Chapter id="proof" theme="dark" eyebrow={proof.eyebrow} title={proof.title} titleId="proof-title" className="relative isolate overflow-clip">
      <PortalField className="proof-portal" />
      <div className="proof">
        <ProofWall className="proof-view">
          {/* Three columns of four; phones show them as one column (see ProofWall). */}
          <div className="proof-wall">
            {COLUMNS.map((c) => (
              <Column key={c.offset} items={all.filter(({ index }) => index % 3 === c.offset)} seconds={c.seconds} delay={c.delay} />
            ))}
          </div>
        </ProofWall>

        <div className="mt-10 flex items-center justify-center gap-4">
          <label className="proof-toggle">
            <input type="checkbox" aria-label="Pause testimonials" />
            <svg className="proof-toggle-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
            <svg className="proof-toggle-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          </label>
          <p className="eyebrow text-faint">{proof.more}</p>
        </div>
      </div>
    </Chapter>
  );
}
