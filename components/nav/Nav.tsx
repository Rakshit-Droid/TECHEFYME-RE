import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { BOOKING_URL, nav, site } from "@/content/site";
import { MobileMenu } from "./MobileMenu";
import { NavState } from "./NavState";

/**
 * Fixed nav. Transparent over the film, then a translucent bar once the page moves.
 * Its polarity follows whichever chapter sits directly under it (NavState).
 */
export function Nav() {
  return (
    <header
      data-site-header
      data-theme="light"
      className="fixed inset-x-0 top-0 z-50 h-(--nav-h) border-b border-transparent text-ink transition-[background-color,border-color,color,backdrop-filter] duration-250 ease-ui data-scrolled:border-line/60 data-scrolled:bg-bg/80 data-scrolled:backdrop-blur-xl"
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" data-nav-probe data-nav-logo aria-label={site.shortName} className="transition-colors duration-250">
          <Logo size={24} id="tm-nav" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          <ul className="flex items-center gap-7">
            {nav.links.map((link) => (
              <li key={link.id} data-nav-probe>
                <Link
                  href={link.href}
                  data-nav-link={link.id}
                  className="text-[0.8125rem] font-normal opacity-80 transition-opacity duration-150 hover:opacity-100 aria-[current=true]:font-medium aria-[current=true]:opacity-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <span data-nav-probe className="inline-flex">
            <Button href={BOOKING_URL} track="cta_book" trackLocation="nav">
              {nav.cta}
            </Button>
          </span>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <span data-nav-probe className="inline-flex">
            <Button href={BOOKING_URL} track="cta_book" trackLocation="nav">
              {nav.cta}
            </Button>
          </span>
          <span data-nav-probe className="inline-flex transition-colors duration-250">
            <MobileMenu />
          </span>
        </div>
      </Container>
      <NavState />
    </header>
  );
}
