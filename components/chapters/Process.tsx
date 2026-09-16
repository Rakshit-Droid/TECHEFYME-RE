import { Button } from "@/components/ui/Button";
import { Chapter } from "@/components/ui/Chapter";
import { faq, process } from "@/content/chapters";
import { BOOKING_URL, hero } from "@/content/site";
import { ProcessOrbit, type OrbitNode } from "./ProcessOrbit";

const call = faq.items.find((item) => item.id === "discovery-call");

/** The call that starts every engagement, then the four phases, clockwise from the top. */
const NODES: OrbitNode[] = [
  { name: process.callLabel, description: call?.a ?? "", deliverables: [] },
  ...process.phases.map((phase) => ({
    number: phase.number,
    name: phase.name,
    description: phase.description,
    deliverables: phase.deliverables,
  })),
];

/** The process as a turning ring beside its statement: the whole chapter reads in one screen. */
export function Process() {
  return (
    <Chapter
      id="process"
      theme="dark"
      compact
      labelledBy="process-title"
      // Extra room on top, so the Services tab bar has scrolled away before the ring arrives.
      className="relative isolate overflow-clip lg:pt-56 xl:pt-60"
    >
      <div className="grid items-center gap-12 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-16">
        <div data-reveal="statement" className="mx-auto max-w-[46rem] text-center xl:mx-0 xl:max-w-[32rem] xl:text-left">
          <p data-reveal-item className="eyebrow text-accent">
            {process.eyebrow}
          </p>
          <h2 id="process-title" data-reveal-item className="text-chapter mt-4">
            {process.title}
          </h2>
          <p data-reveal-item className="text-lead mt-5 text-muted">
            {process.lead}
          </p>
          <div data-reveal-item className="mt-8">
            <Button href={BOOKING_URL} variant="link" size="lg" track="cta_book" trackLocation="process">
              {hero.primary} <span aria-hidden="true">›</span>
            </Button>
          </div>
        </div>

        <ProcessOrbit nodes={NODES} cta={{ label: hero.primary, href: BOOKING_URL }} />
      </div>
    </Chapter>
  );
}
