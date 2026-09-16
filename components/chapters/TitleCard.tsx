import { LitWords, wordCount } from "@/components/motion/LitWords";
import { ScrollLit } from "@/components/motion/ScrollLit";
import { Container } from "@/components/ui/Container";
import { WorldMap, type MapPoint } from "@/components/ui/map";
import { regions } from "@/content/chapters";
import { site, titleCard } from "@/content/site";
import { TitleCardMetrics } from "./TitleCardMetrics";

/** Where each region sits on the map (its timezone city), and which side its label takes. */
const PLACES: Record<string, Pick<MapPoint, "lat" | "lng" | "labelSide">> = {
  US: { lat: 40.71, lng: -74.0, labelSide: "top" },
  UK: { lat: 51.51, lng: -0.13, labelSide: "left" },
  EU: { lat: 52.52, lng: 13.4, labelSide: "right" },
  ME: { lat: 25.2, lng: 55.27, labelSide: "bottom" },
  AU: { lat: -33.87, lng: 151.21, labelSide: "left" },
  NZ: { lat: -36.85, lng: 174.76, labelSide: "bottom" },
};

/** The route follows the sun: the Americas, across to Europe, the Gulf, then down under. */
const ROUTE = ["US", "UK", "EU", "ME", "AU", "NZ"] as const;

/**
 * Black on black after the film: the statement lights up word by word as it rises,
 * a world map draws the six regions together, the proof points count up with a
 * drawing each, and the client names drift past.
 */
export function TitleCard() {
  const titleWords = wordCount(titleCard.title);
  const regionCodes = site.regionsShort.split(" · ");
  const point = (code: (typeof ROUTE)[number]): MapPoint => {
    const region = regions.list.find((r) => r.code === code)!;
    return { ...PLACES[code], label: region.name, shortLabel: region.code };
  };
  const routes = ROUTE.slice(1).map((code, i) => ({ start: point(ROUTE[i]!), end: point(code) }));

  return (
    <section data-theme="dark" aria-labelledby="title-card" className="title-card bg-bg py-20 text-ink md:py-28 xl:py-36">
      <Container>
        <ScrollLit total={titleWords + wordCount(titleCard.body)} className="mx-auto max-w-[46rem] text-center">
          <h2 id="title-card" className="text-statement">
            <LitWords text={titleCard.title} />
          </h2>
          <p className="text-lead mx-auto mt-6 max-w-[38rem] text-muted">
            <LitWords text={titleCard.body} from={titleWords} />
          </p>
        </ScrollLit>

        <div className="relative mt-12 md:mt-16">
          <div aria-hidden="true" className="title-card-glow" />
          <WorldMap dots={routes} />
        </div>

        <div data-reveal="rows" className="relative mt-10 md:mt-14">
          <TitleCardMetrics metrics={titleCard.metrics} regions={regionCodes} />

          <div data-reveal-item className="mt-14 text-center md:mt-16">
            <p className="eyebrow text-faint">{titleCard.logosLabel}</p>
            <div className="marquee mt-5">
              <div className="marquee-track">
                {[0, 1].map((copy) => (
                  <ul
                    key={copy}
                    aria-hidden={copy === 1 ? true : undefined}
                    className="flex shrink-0 gap-12 pr-12 text-sm font-medium whitespace-nowrap text-faint"
                  >
                    {titleCard.logos.map((logo) => (
                      <li key={logo} className="transition-colors duration-200 hover:text-ink">
                        {logo}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
