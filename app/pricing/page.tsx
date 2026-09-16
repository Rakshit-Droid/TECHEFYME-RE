import type { Metadata } from "next";
import Image from "next/image";
import { MotionLoader } from "@/components/motion/MotionLoader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import handsApart from "@/assets/img/hands-apart.png";
import { pricing } from "@/content/pricing";
import { BOOKING_URL } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({ title: "Pricing", description: pricing.lead, path: "/pricing" });

export default function PricingPage() {
  return (
    <div data-theme="light" className="bg-bg text-ink">
      <section aria-labelledby="pricing-title" className="pt-[calc(var(--nav-h)+4rem)] md:pt-[calc(var(--nav-h)+6rem)]">
        <Container>
          <div className="grid grid-cols-12 items-end gap-x-4 gap-y-12 md:gap-x-6">
            <div className="col-span-12 lg:col-span-6">
              <p className="eyebrow text-accent">{pricing.eyebrow}</p>
              <h1 id="pricing-title" className="text-statement mt-5">
                {pricing.title}
              </h1>
              <p className="text-lead mt-8 max-w-[48ch] text-muted">{pricing.lead}</p>
              <div className="mt-10">
                <Button href={BOOKING_URL} size="lg" track="cta_book" trackLocation="pricing">
                  {pricing.cta}
                </Button>
              </div>
            </div>
            <figure className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="relative aspect-[3/2] overflow-hidden rounded-panel bg-surface">
                <Image
                  src={handsApart}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </div>
        </Container>
      </section>

      <section aria-label="Services and inclusions" className="pt-24 pb-24 md:pt-40 md:pb-40">
        <Container>
          <ol data-reveal="rows" className="grid gap-4">
            {pricing.services.map((s) => (
              <li key={s.name} data-reveal-item className="card grid grid-cols-12 gap-x-4 gap-y-4 p-8 md:gap-x-6 md:p-10">
                <p className="eyebrow col-span-12 text-accent lg:col-span-2">{s.number}</p>
                <div className="col-span-12 lg:col-span-5">
                  <h2 className="text-feature">{s.name}</h2>
                  <p className="text-body mt-3 max-w-[48ch] text-muted">{s.description}</p>
                </div>
                <ul className="col-span-12 lg:col-span-4 lg:col-start-9">
                  {s.inclusions.map((item) => (
                    <li key={item} className="text-support border-t border-line py-3 first:border-t-0 first:pt-0 lg:first:pt-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <MotionLoader />
    </div>
  );
}
