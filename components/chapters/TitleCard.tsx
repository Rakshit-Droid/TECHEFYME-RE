import { Container } from "@/components/ui/Container";
import { titleCard } from "@/content/site";

/** Black on black after the film: only the content changes, so the void turns into meaning. */
export function TitleCard() {
  return (
    <section data-theme="dark" aria-labelledby="title-card" className="bg-bg py-20 text-ink md:py-28 xl:py-36">
      <Container>
        <div data-reveal="statement" className="mx-auto max-w-[46rem] text-center">
          <h2 id="title-card" data-reveal-item className="text-statement">
            {titleCard.title}
          </h2>
          <p data-reveal-item className="text-lead mx-auto mt-6 max-w-[38rem] text-muted">
            {titleCard.body}
          </p>
        </div>

        <div data-reveal="rows" className="mt-16 md:mt-20">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {titleCard.metrics.map((m) => (
              <div key={m.label} data-reveal-item className="card px-6 py-10 text-center">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block text-5xl leading-none font-semibold tracking-[-0.03em] tabular md:text-6xl">
                    {m.value}
                  </span>
                  <span className="text-support mt-3 block text-muted">{m.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div data-reveal-item className="mt-14 text-center md:mt-16">
            <p className="eyebrow text-faint">{titleCard.logosLabel}</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-faint">
              {titleCard.logos.map((logo) => (
                <li key={logo}>{logo}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
