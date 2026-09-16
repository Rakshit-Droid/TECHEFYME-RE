import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <section data-theme="light" className="flex min-h-svh items-end bg-bg pt-[calc(var(--nav-h)+4rem)] pb-24 text-ink md:pb-40">
      <Container>
        <p className="eyebrow text-accent">404</p>
        <h1 className="text-statement mt-6">Not found.</h1>
        <Link
          href="/"
          className="text-lead mt-10 inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
        >
          {site.shortName} <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </Container>
    </section>
  );
}
