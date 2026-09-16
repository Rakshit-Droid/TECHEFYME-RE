import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ShinyButton } from "@/components/ui/shiny-button";
import { BOOKING_URL, hero } from "@/content/site";
import { LOCKUP } from "@/lib/hero-gate";
import { HeroFilm } from "./HeroFilm";

/** The last words of the headline carry the brand's violet-to-blue, one leg per word. */
const GRADIENT = [
  ["#a78bfa", "#818cf8"],
  ["#818cf8", "#60a5fa"],
  ["#60a5fa", "#38bdf8"],
] as const;

/**
 * Hero: a scroll-driven film. The section is tall, its inner layer is sticky, and
 * scroll position picks the frame. The film ends on the TECHEFYME lockup, which then
 * travels into the header logo; light rises out of the black and the headline
 * assembles word by word under the same scroll.
 */
export function Hero() {
  const words = hero.title.split(" ");
  return (
    <section data-hero data-theme="light" data-hero-state="idle" aria-labelledby="hero-title" className="hero">
      <div className="hero-sticky">
        <HeroFilm />
        <div aria-hidden="true" className="hero-glow" />

        <p className="sr-only">{hero.videoDescription}</p>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Container className="text-center">
            <h1 id="hero-title" data-hero-item className="hero-title text-hero mx-auto max-w-[18ch]">
              {words.map((word, i) => {
                const g = GRADIENT[i - (words.length - GRADIENT.length)];
                const style = { "--i": i, ...(g ? { "--g1": g[0], "--g2": g[1] } : {}) } as CSSProperties;
                return (
                  <span key={i}>
                    {i > 0 && " "}
                    <span className={`hero-word${g ? " hero-word--grad" : ""}`}>
                      <span style={style}>{word}</span>
                    </span>
                  </span>
                );
              })}
            </h1>
            <p data-hero-item className="hero-sub text-lead mx-auto mt-6 max-w-[46ch] text-muted">
              {hero.sub}
            </p>
            <div data-hero-item className="hero-ctas mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <ShinyButton href={BOOKING_URL} label={hero.primary} track="cta_book" trackLocation="hero" />
              <Button
                href="#services"
                variant="secondary"
                size="lg"
                className="h-[3.3rem] border-white/20 px-7 hover:border-white/40 hover:bg-white/5"
                track="cta_see_services"
              >
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
