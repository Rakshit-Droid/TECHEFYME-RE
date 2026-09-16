import { Button } from "@/components/ui/Button";
import { Chapter } from "@/components/ui/Chapter";
import { process } from "@/content/chapters";
import { BOOKING_URL, hero } from "@/content/site";

/** Four phases as cards. Every phase lists what you actually receive. */
export function Process() {
  return (
    <Chapter
      id="process"
      theme="surface"
      eyebrow={process.eyebrow}
      title={process.title}
      titleId="process-title"
      lead={process.lead}
    >
      <ol data-reveal="rows" className="grid gap-4 md:grid-cols-2">
        {process.phases.map((phase, i) => (
          <li key={phase.name} data-step={i} data-reveal-item className="rounded-card bg-bg p-8 md:p-10">
            <article aria-labelledby={`phase-${i}`}>
              <p className="eyebrow tabular text-accent">{phase.number}</p>
              <h3 id={`phase-${i}`} className="text-feature mt-4">
                {phase.name}
              </h3>
              <p className="text-body mt-4 max-w-[46ch] text-muted">{phase.description}</p>
              <ul className="mt-8 border-t border-line">
                {phase.deliverables.map((d) => (
                  <li key={d} className="text-support border-b border-line py-3 text-ink last:border-b-0">
                    {d}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-12 text-center">
        <Button href={BOOKING_URL} variant="link" size="lg" track="cta_book" trackLocation="process">
          {hero.primary} <span aria-hidden="true">›</span>
        </Button>
      </div>
    </Chapter>
  );
}
