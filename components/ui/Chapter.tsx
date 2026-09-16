import type { ReactNode } from "react";
import { Container } from "./Container";

type Props = {
  id?: string;
  theme: "light" | "dark" | "surface";
  eyebrow?: string;
  title?: string;
  titleId?: string;
  lead?: ReactNode;
  labelledBy?: string;
  label?: string;
  className?: string;
  /** Tighter padding and intro gap, for chapters that should read in one screen. */
  compact?: boolean;
  children: ReactNode;
};

/**
 * One chapter, one polarity. The intro is centred and the body follows:
 * eyebrow, headline, one supporting line, then the content.
 */
export function Chapter({ id, theme, eyebrow, title, titleId, lead, labelledBy, label, className = "", compact = false, children }: Props) {
  return (
    <section
      id={id}
      data-anchor={id ? "" : undefined}
      data-nav-section={id}
      data-theme={theme === "surface" ? "light" : theme}
      aria-labelledby={labelledBy ?? titleId}
      aria-label={labelledBy ?? titleId ? undefined : label}
      className={`${theme === "surface" ? "bg-surface" : "bg-bg"} ${compact ? "py-16 md:py-20 xl:py-24" : "py-20 md:py-28 xl:py-36"} text-ink ${className}`}
    >
      <Container>
        {(eyebrow || title) && (
          <div data-reveal="statement" className="mx-auto max-w-[46rem] text-center">
            {eyebrow ? (
              <p data-reveal-item className="eyebrow text-accent">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 id={titleId} data-reveal-item className="text-chapter mt-4">
                {title}
              </h2>
            ) : null}
            {lead ? (
              <div data-reveal-item className="text-lead mx-auto mt-5 max-w-[42rem] text-muted">
                {lead}
              </div>
            ) : null}
          </div>
        )}
        <div className={eyebrow || title ? (compact ? "mt-10 md:mt-12" : "mt-14 md:mt-20") : ""}>{children}</div>
      </Container>
    </section>
  );
}
