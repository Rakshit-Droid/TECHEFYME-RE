import { Contact } from "@/components/chapters/Contact";
import { Faq } from "@/components/chapters/Faq";
import { Process } from "@/components/chapters/Process";
import { Proof } from "@/components/chapters/Proof";
import { Services } from "@/components/chapters/Services";
import { TitleCard } from "@/components/chapters/TitleCard";
import { WhyUs } from "@/components/chapters/WhyUs";
import { Hero } from "@/components/hero/Hero";
import { MotionLoader } from "@/components/motion/MotionLoader";
import { faq } from "@/content/chapters";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ description: site.description, path: "/" });

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    email: site.email,
    telephone: site.phoneDisplay,
    description: site.description,
    slogan: site.slogan,
    sameAs: site.social.map((s) => s.href),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

export default function Home() {
  return (
    <>
      <Hero />
      <TitleCard />
      <Services />
      <Process />
      <WhyUs />
      <Proof />
      <Faq />
      <Contact />
      <MotionLoader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
