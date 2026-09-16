import Link from "next/link";

/**
 * A dark pill with a small light dot beside its label. On hover or keyboard focus the dot
 * swells to fill the pill white, the label slides out, and the same label returns in ink
 * with an arrow. Links behave like Button: http opens a new tab, anything else is a route.
 */
export function InteractiveHoverButton({
  href,
  label,
  track,
  trackLocation,
}: {
  href: string;
  label: string;
  track?: string;
  trackLocation?: string;
}) {
  const data = track ? { "data-track": track, "data-track-location": trackLocation } : {};
  const content = (
    <>
      <span className="hover-cta-rest">
        <span aria-hidden="true" className="hover-cta-dot" />
        <span className="hover-cta-label">{label}</span>
      </span>
      <span aria-hidden="true" className="hover-cta-over">
        <span>{label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </>
  );

  if (/^(https?:|mailto:|tel:|sms:)/.test(href)) {
    const newTab = href.startsWith("http");
    return (
      <a href={href} className="hover-cta" {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...data}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className="hover-cta" {...data}>
      {content}
    </Link>
  );
}
