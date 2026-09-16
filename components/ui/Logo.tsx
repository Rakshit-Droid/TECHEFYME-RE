/**
 * TechefyMe mark: a body with a channel cut across it, and the one point that got
 * clear of it. The hero film's event horizon, reduced to two shapes.
 *
 * Drawn in currentColor so it inverts with the chapter polarity. Each instance
 * needs its own `id` because the cut is a mask reference.
 */
export function LogoMark({ size = 26, id = "tm-mark", className = "" }: { size?: number; id?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <mask id={id}>
        <rect width="100" height="100" fill="#fff" />
        <rect x="8" y="52" width="84" height="12" rx="6" fill="#000" transform="rotate(-16 50 58)" />
      </mask>
      <circle cx="48" cy="50" r="30" fill="currentColor" mask={`url(#${id})`} />
      <circle cx="84" cy="26" r="6" fill="currentColor" />
    </svg>
  );
}

/** Mark plus wordmark, for the nav and the footer. */
export function Logo({ size = 26, id = "tm-mark", className = "" }: { size?: number; id?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} id={id} />
      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em]">TechefyMe</span>
    </span>
  );
}
