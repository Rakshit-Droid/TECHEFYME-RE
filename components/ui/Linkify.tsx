import Link from "next/link";
import { Fragment } from "react";

const RULES: { match: string; href: string }[] = [
  { match: "hello@techefyme.com", href: "mailto:hello@techefyme.com" },
  { match: "+91 81431 37619", href: "tel:+918143137619" },
  { match: "/cancellation-refunds", href: "/cancellation-refunds" },
  { match: "Cancellation & Refunds Policy", href: "/cancellation-refunds" },
];

const pattern = new RegExp(`(${RULES.map((r) => r.match.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|")})`, "g");

/** Turns the email, phone and policy references inside verbatim copy into links. */
export function Linkify({ text }: { text: string }) {
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const rule = RULES.find((r) => r.match === part);
        if (!rule) return <Fragment key={i}>{part}</Fragment>;
        const cls = "text-accent underline decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-2";
        return rule.href.startsWith("/") ? (
          <Link key={i} href={rule.href} className={cls}>
            {part}
          </Link>
        ) : (
          <a key={i} href={rule.href} className={cls}>
            {part}
          </a>
        );
      })}
    </>
  );
}
