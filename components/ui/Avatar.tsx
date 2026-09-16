/**
 * Initials in a hairline circle — the designed default until real headshots exist.
 * `tone="color"` fills the circle from the --c custom property of an ancestor instead.
 */
export function Avatar({ name, size = 40, tone = "line" }: { name: string; size?: 24 | 40; tone?: "line" | "color" }) {
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${
        tone === "color" ? "avatar-color" : "border border-line text-muted"
      } ${
        size === 24 ? "size-6 text-[0.625rem]" : "size-10 text-xs"
      }`}
    >
      {initials}
    </span>
  );
}
