import { ClockStrip } from "@/components/motion/ClockStrip";
import { Chapter } from "@/components/ui/Chapter";
import { Container } from "@/components/ui/Container";
import { regions, whyUs } from "@/content/chapters";

/** The difference, side by side, then the six regions and their local times. */
export function WhyUs() {
  return (
    <>
      <Chapter id="why-us" theme="light" eyebrow={whyUs.eyebrow} title={whyUs.title} titleId="why-us-title">
        <div data-reveal="rows" className="grid gap-4 md:grid-cols-2">
          <div data-reveal-item className="card p-8 md:p-10">
            <p className="eyebrow text-faint">{whyUs.alternative}</p>
            <ul className="mt-6 border-t border-line">
              {whyUs.rows.map((row) => (
                <li key={row.label} className="border-b border-line py-5 last:border-b-0">
                  <p className="text-support text-faint">{row.label}</p>
                  <p className="text-body mt-1 text-muted">{row.alternative}</p>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal-item className="rounded-card bg-ink p-8 text-bg md:p-10">
            <p className="eyebrow opacity-60">
              {whyUs.us} · {whyUs.usNote}
            </p>
            <ul className="mt-6 border-t border-current/20">
              {whyUs.rows.map((row) => (
                <li key={row.label} className="border-b border-current/20 py-5 last:border-b-0">
                  <p className="text-support opacity-60">{row.label}</p>
                  <p className="text-body mt-1">{row.us}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Chapter>

      <section
        id="regions"
        data-anchor=""
        data-theme="dark"
        data-nav-section="regions"
        aria-labelledby="regions-title"
        className="bg-bg py-20 text-ink md:py-28 xl:py-36"
      >
        <Container>
          <div data-reveal="statement" className="mx-auto max-w-[46rem] text-center">
            <h2 id="regions-title" data-reveal-item className="text-chapter">
              {regions.title}
            </h2>
            <p data-reveal-item className="text-lead mx-auto mt-5 max-w-[40rem] text-muted">
              {regions.lead}
            </p>
          </div>
          <div className="mt-14 md:mt-20">
            <ClockStrip zones={regions.list} />
          </div>
        </Container>
      </section>
    </>
  );
}
