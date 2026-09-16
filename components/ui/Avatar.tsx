/** Initials in a hairline circle — the designed default until real headshots exist. */
export function Avatar({ name, size = 40 }: { name: string; size?: 24 | 40 }) {
  const initials = name
    .replace(/[^\p{L}\s-]/gu, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line font-medium text-muted ${
        size === 24 ? "size-6 text-[0.625rem]" : "size-10 text-xs"
      }`}
    >
      {initials}
    </span>
  );
}
