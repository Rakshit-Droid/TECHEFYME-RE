import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BOOKING_URL, hero } from "@/content/site";
import { LOCKUP } from "@/lib/hero-gate";
import { HeroFilm } from "./HeroFilm";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Hero: a scroll-driven film. The section is tall, its inner layer is sticky, and
 * scroll position picks the frame. The film ends on the TECHEFYME lockup, which then
 * travels into the header logo; the headline arrives once it has landed.
 */
export function Hero() {
  return (
    <section data-hero data-theme="light" data-hero-state="idle" aria-labelledby="hero-title" className="hero">
      <div className="hero-sticky">
        <HeroFilm />

        <p className="sr-only">{hero.videoDescription}</p>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Container className="text-center">
            <h1 id="hero-title" data-hero-item style={delay(0)} className="text-hero mx-auto max-w-[18ch]">
              {hero.title}
            </h1>
            <p data-hero-item style={delay(120)} className="text-lead mx-auto mt-6 max-w-[46ch] text-muted">
              {hero.sub}
            </p>
            <div
              data-hero-item
              style={delay(240)}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            >
              <Button href={BOOKING_URL} size="lg" track="cta_book" trackLocation="hero">
                {hero.primary}
              </Button>
              <Button href="#services" variant="link" size="lg" track="cta_see_services">
                {hero.secondary} <span aria-hidden="true">›</span>
              </Button>
            </div>
          </Container>
        </div>

        <p aria-hidden="true" className="hero-cue eyebrow">
          Scroll
        </p>
      </div>

      {/* Outside the sticky layer on purpose: it has to fly over the fixed nav. */}
      <div aria-hidden="true" className="hero-lockup" style={{ width: LOCKUP.crop.width, height: LOCKUP.crop.height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOCKUP.src} alt="" width={LOCKUP.crop.width} height={LOCKUP.crop.height} decoding="async" fetchPriority="low" />
      </div>
    </section>
  );
}
