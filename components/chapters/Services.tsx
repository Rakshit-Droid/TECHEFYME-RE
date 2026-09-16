import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { ShinyButton } from "@/components/ui/shiny-button";
import { BOOKING_URL, hero } from "@/content/site";
import { services } from "@/content/services";
import { SERVICE_COLORS } from "@/lib/service-colors";
import { ServiceDemo } from "./ServiceDemos";
import { ServicesRail } from "./ServicesRail";

const COLORS = services.map((service) => SERVICE_COLORS[service.id]);

/**
 * The demonstration beat, and the peak of the page. On a wide screen the chapter holds
 * the screen and five panels slide past sideways, each with its service on the left
 * and a live scene on the right that builds as the panel arrives. On smaller screens
 * the panels stack and each scene builds as it scrolls into view.
 */
export function Services() {
  return (
    <section
      id="services"
      data-anchor=""
      data-nav-section="services"
      data-theme="dark"
      aria-labelledby="services-title"
      className="services text-ink"
    >
      <h2 id="services-title" className="sr-only">
        Services
      </h2>
      <ServicesRail colors={COLORS}>
        <div className="services-stage">
          {/* One glow per service, crossfaded by opacity: repainting a full-screen
              gradient in a new colour every frame is what made the rail stutter. */}
          <div aria-hidden="true" className="services-glow">
            {COLORS.map((c) => (
              <span key={c} style={{ "--c": c } as CSSProperties} />
            ))}
          </div>
          <div className="services-track">
            {services.map((service, i) => (
              <article
                key={service.id}
                aria-labelledby={`service-${service.id}`}
                className="service-panel"
                style={{ "--c": COLORS[i] } as CSSProperties}
              >
                <Container className="service-panel-inner">
                  <div className="service-copy">
                    <span aria-hidden="true" className="service-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="eyebrow service-eyebrow">
                      {String(i + 1).padStart(2, "0")} · {service.name}
                    </p>
                    <h3 id={`service-${service.id}`} className="text-chapter mt-4">
                      {service.statement}
                    </h3>
                    <p className="text-lead mt-5 max-w-[34rem] text-muted">{service.description}</p>
                    {i === services.length - 1 && (
                      <div className="mt-9">
                        <ShinyButton href={BOOKING_URL} label={hero.primary} track="cta_book" trackLocation="services" />
                      </div>
                    )}
                  </div>
                  <div className="service-scene">
                    <ServiceDemo exhibit={service.exhibit} />
                  </div>
                </Container>
              </article>
            ))}
          </div>

          <nav aria-label="Services" className="services-tabs">
            {services.map((service, i) => (
              <button
                key={service.id}
                type="button"
                className="services-tab"
                aria-current={i === 0}
                style={{ "--c": COLORS[i] } as CSSProperties}
              >
                <span className="services-tab-bar" aria-hidden="true" />
                <span className="services-tab-label">
                  <span className="tabular">{String(i + 1).padStart(2, "0")}</span> {service.name}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </ServicesRail>
    </section>
  );
}
