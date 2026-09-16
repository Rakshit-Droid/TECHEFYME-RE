import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { footer, site } from "@/content/site";

const linkCls = "inline-flex min-h-11 items-center transition-colors duration-150 hover:text-muted";

export function Footer() {
  return (
    <footer data-theme="dark" className="bg-bg pb-12 text-ink">
      <Container>
        <div className="grid grid-cols-12 gap-x-4 gap-y-12 border-t border-line pt-12 md:gap-x-6">
          <div className="col-span-12 lg:col-span-4">
            <Link href="/" aria-label={site.shortName}>
              <Logo size={24} id="tm-footer" />
            </Link>
            <p className="text-support mt-4 max-w-[44ch] text-muted">{site.description}</p>
            <p className="eyebrow mt-6 text-faint">{site.regionsShort}</p>
          </div>

          <nav aria-label="Footer" className="col-span-6 md:col-span-3 lg:col-span-2 lg:col-start-5">
            <p className="eyebrow text-faint">Navigate</p>
            <ul className="text-support mt-4">
              {footer.navigate.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-3 lg:col-span-2">
            <p className="eyebrow text-faint">Reach us</p>
            <ul className="text-support mt-4">
              {footer.reach.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className={linkCls}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 md:col-span-3 lg:col-span-2">
            <p className="eyebrow text-faint">Social</p>
            <ul className="text-support mt-4">
              {site.social.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Legal" className="col-span-6 md:col-span-3 lg:col-span-2">
            <p className="eyebrow text-faint">Legal</p>
            <ul className="text-support mt-4">
              {footer.legal.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="text-support mt-16 border-t border-line pt-6 text-muted">{footer.copyright}</p>
      </Container>
    </footer>
  );
}
