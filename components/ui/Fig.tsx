import type { ReactNode } from "react";

/**
 * A product artifact, shown on a card. Real data, real markup, captioned so the
 * reader knows what they are looking at.
 */
export function Fig({ caption, children, className = "" }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`card flex flex-col ${className}`} style={{ contain: "layout paint" }}>
      <div className="flex-1 p-6 md:p-8">{children}</div>
      <figcaption className="eyebrow border-t border-line/70 px-6 py-4 text-faint md:px-8">{caption}</figcaption>
    </figure>
  );
}
