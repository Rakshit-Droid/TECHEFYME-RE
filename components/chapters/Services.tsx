import { Exhibit } from "@/components/exhibits/Exhibit";
import { ActiveSteps } from "@/components/motion/ActiveSteps";
import { Button } from "@/components/ui/Button";
import { Chapter } from "@/components/ui/Chapter";
import { BOOKING_URL, hero } from "@/content/site";
import { services } from "@/content/services";

const REEL = "(min-width: 1024px) and (min-height: 720px)";

/**
 * The demonstration beat. Desktop: the text column scrolls while one sticky card
 * swaps to the service in view. Elsewhere: each card sits under its text.
 */
export function Services() {
  return (
    <Chapter id="services" theme="light" labelledBy="services-title">
      <h2 id="services-title" className="sr-only">
        Services
      </h2>
      <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
        <div className="col-span-12 flex flex-col gap-20 md:gap-24 js:lg:tall:col-span-5 js:lg:tall:gap-40">
          {services.map((service, i) => (
            <article key={service.id} data-step={i} aria-labelledby={`service-${service.id}`}>
              <div data-reveal="statement">
                <p data-reveal-item className="eyebrow tabular text-accent">
                  {String(i + 1).padStart(2, "0")} · {service.name}
                </p>
                <h3 id={`service-${service.id}`} data-reveal-item className="text-feature mt-4">
                  {service.statement}
                </h3>
                <p data-reveal-item className="text-body mt-4 max-w-[46ch] text-muted">
                  {service.description}
                </p>
              </div>

              {/* Stacked card: phones, tablets, short desktops, and no-JS. */}
              <Exhibit exhibit={service.exhibit} revealRows className="mt-8 max-w-[560px] js:lg:tall:hidden" />
            </article>
          ))}

          <div>
            <Button href={BOOKING_URL} variant="link" size="lg" track="cta_book" trackLocation="services">
              {hero.primary} <span aria-hidden="true">›</span>
            </Button>
          </div>
        </div>

        {/* Desktop sticky stack. Hidden from assistive tech: the stacked cards above carry the content. */}
        <div aria-hidden="true" className="hidden js:lg:tall:col-span-6 js:lg:tall:col-start-7 js:lg:tall:block">
          <div className="sticky top-28 grid">
            {services.map((service, i) => (
              <div key={service.id} data-step-target={i} {...(i === 0 ? { "data-active": "" } : {})} className="reel-item">
                <Exhibit exhibit={service.exhibit} className="max-h-[calc(100vh-10rem)] min-h-[26rem]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ActiveSteps line={0.55} media={REEL} />
    </Chapter>
  );
}
