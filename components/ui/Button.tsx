import Link from "next/link";
import type { ReactNode } from "react";

type Common = {
  variant?: "primary" | "secondary" | "link";
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
  /** Delegated analytics: event name and location, read by NavState. */
  track?: string;
  trackLocation?: string;
};

type AsLink = Common & { href: string; type?: never; disabled?: never };
type AsButton = Common & { href?: undefined; type?: "button" | "submit"; disabled?: boolean };

const base = "inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 ease-ui";

const variants = {
  primary: "rounded-pill bg-cta text-cta-ink hover:bg-cta-hover disabled:pointer-events-none disabled:opacity-40",
  secondary: "rounded-pill border border-line bg-transparent text-ink hover:bg-surface",
  link: "text-accent hover:underline underline-offset-4 decoration-1",
};

const sizes = {
  primary: { md: "h-9 px-4 text-sm", lg: "h-12 px-6 text-[1.0625rem]" },
  secondary: { md: "h-9 px-4 text-sm", lg: "h-12 px-6 text-[1.0625rem]" },
  link: { md: "min-h-9 text-sm", lg: "min-h-11 text-[1.0625rem]" },
};

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", className = "", children, track, trackLocation } = props;
  const cls = `${base} ${variants[variant]} ${sizes[variant][size]} ${className}`;
  const data = track ? { "data-track": track, "data-track-location": trackLocation } : {};

  if (props.href !== undefined) {
    const external = /^(https?:|mailto:|tel:|sms:)/.test(props.href);
    if (external) {
      const newTab = props.href.startsWith("http");
      return (
        <a href={props.href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...data}>
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls} {...data}>
        {children}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} disabled={props.disabled} className={cls} {...data}>
      {children}
    </button>
  );
}
