import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

/** Next adds the noindex itself on a 404. */
export const metadata: Metadata = {
  title: "Page not found",
};

/** The 404: a large numeral fading into the dark, one line, and two ways back in. */
export default function NotFound() {
  return (
    <section data-theme="dark" className="flex min-h-svh items-center bg-bg pt-[var(--nav-h)] pb-16 text-ink">
      <Container>
        <div className="mx-auto max-w-[32rem] text-center">
          <p className="not-found-code" aria-hidden="true">
            404
          </p>
          <h1 className="text-body text-muted">The page you&rsquo;re looking for might have been moved or doesn&rsquo;t exist.</h1>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="not-found-button not-found-button--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M10 21v-6h4v6" />
              </svg>
              Go Home
            </Link>
            <Link href="/#services" className="not-found-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="m15.5 8.5-2 5-5 2 2-5z" />
              </svg>
              Explore
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
