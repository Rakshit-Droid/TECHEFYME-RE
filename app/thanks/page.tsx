import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: contact.form.promise,
  robots: { index: false, follow: false },
};

/** Conversion is a pageview. Existing copy only; a confirmation line waits for client approval. */
export default function ThanksPage() {
  return (
    <section
      data-theme="dark"
      aria-labelledby="thanks-title"
      className="flex min-h-svh items-end bg-bg pt-[calc(var(--nav-h)+4rem)] pb-24 text-ink md:pb-40"
    >
      <Container>
        <div className="grid grid-cols-12 gap-x-4 gap-y-16 md:gap-x-6">
          <div className="col-span-12 lg:col-span-6">
            <h1 id="thanks-title" className="text-statement">
              {contact.form.promise}
            </h1>
          </div>
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="eyebrow text-accent">{contact.channelsLabel}</p>
            <ul className="mt-5 grid gap-3">
              {contact.channels.map((c) => (
                <li key={c.label} className="card">
                  <a
                    href={c.href}
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="grid grid-cols-[6rem_1fr] items-baseline gap-x-4 px-6 py-5"
                  >
                    <span className="eyebrow text-muted">{c.label}</span>
                    <span className="font-medium tabular">{c.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
