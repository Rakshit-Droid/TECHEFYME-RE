import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BOOKING_URL, contact, footer, hero, nav, site } from "@/content/site";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Every way to reach the studio that is not the email, in one spaced row. */
const channels = [
  ...site.social.map((s) => ({ label: s.label, href: s.href, newTab: true })),
  { label: "WhatsApp", href: site.whatsappHref, newTab: true },
  { label: "Call Us", href: site.phoneHref, newTab: false },
];

/**
 * The closing screen, edge to edge: the address and the next step up top, the channels
 * on a hairline, the name set as wide as the grid allows, and the fine print underneath.
 * The glow rises from the bottom edge, so the top half stays quiet for reading. On
 * desktop it fills the viewport, with the name held to the bottom.
 */
export function Footer() {
  return (
    <footer data-theme="dark" className="footer text-ink" data-reveal="statement">
      <div aria-hidden="true" className="footer-glow" />
      <Container className="relative flex flex-col pt-16 pb-3 md:pt-24 md:pb-5 lg:min-h-svh lg:pb-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16" data-reveal-item>
          <div>
            <p className="text-support text-muted">{site.regionsShort}</p>
            <a
              href={`mailto:${site.email}`}
              className="footer-email mt-3 inline-block font-normal tracking-[-0.03em] transition-opacity duration-150 hover:opacity-70"
            >
              {site.email}
            </a>
            <nav aria-label="Footer" className="mt-8">
              <ul className="flex flex-wrap gap-x-9 gap-y-1">
                {footer.navigate.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-support inline-flex min-h-11 items-center text-muted transition-colors duration-150 hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="max-w-[17rem]">
            <p className="text-[1.0625rem] font-medium leading-snug tracking-[-0.01em]">{hero.title}</p>
            <p className="text-support mt-2 text-muted">{contact.form.promise}</p>
            <Button href={BOOKING_URL} className="mt-5" track="cta_book" trackLocation="footer">
              {nav.cta}
            </Button>
          </div>
        </div>

        <div className="mt-20 md:mt-28 lg:mt-auto lg:pt-24">
          <div data-reveal-item>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1 sm:flex sm:justify-between">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium transition-opacity duration-150 hover:opacity-70 md:text-[1.0625rem]"
                    {...(c.newTab ? external : {})}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 h-px bg-white/20" />
          </div>

          {/* Set in SVG so the name fills the grid's width exactly at every size. The font
              size is chosen so Inter's natural width is already the full 1000 units;
              textLength only takes up the slack if a fallback face is showing. */}
          <svg
            aria-hidden="true"
            className="footer-wordmark mt-6 block w-full md:mt-8"
            viewBox="0 0 1000 127"
            data-reveal-item
          >
            <text x="0" y="127" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor">
              TECHEFYME
            </text>
          </svg>

          <div className="text-support mt-6 flex flex-col gap-3 text-white/75 md:mt-8 lg:flex-row lg:items-center lg:justify-between">
            <p>{footer.copyright}</p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-6 gap-y-1">
                {footer.legal.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
