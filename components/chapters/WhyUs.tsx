import type { ReactNode } from "react";
import { Chapter } from "@/components/ui/Chapter";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { CompareCard } from "./CompareCard";
import { RegionFan } from "./RegionFan";
import { regions, whyUs } from "@/content/chapters";

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/** Design approach, progress visibility, post-launch, success metrics, market fit. */
const ROW_ICONS = [
  icon(
    <>
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </>,
  ),
  icon(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  ),
  icon(
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>,
  ),
  icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>,
  ),
  icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18 13.5 13.5 0 0 0 0-18M3 12h18" />
    </>,
  ),
];

/** The difference, crossed out row by row under a cold light across the top, then the six regions and their local times. */
export function WhyUs() {
  return (
    <>
      <Chapter id="why-us" theme="dark" compact labelledBy="why-us-title" className="arctic relative isolate overflow-clip pt-20 md:pt-28">
        <CompareCard>
          <div aria-hidden="true" className="arctic-light" />
          <div data-reveal="statement" className="arctic-head">
            <p data-reveal-item className="eyebrow">
              {whyUs.eyebrow}
            </p>
            <h2 id="why-us-title" data-reveal-item className="text-chapter mt-4">
              {whyUs.title}
            </h2>
          </div>

          <table className="compare">
            <thead>
              <tr>
                <td />
                <th scope="col" className="compare-col-alt">
                  {whyUs.alternative}
                </th>
                <th scope="col" className="compare-col-us">
                  <span className="inline-flex items-center gap-2">
                    <LogoMark size={16} id="compare-mark" />
                    {whyUs.us} · {whyUs.usNote}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {whyUs.rows.map((row, i) => (
                <tr key={row.label} data-strike-row="" className="compare-row">
                  <th scope="row" className="compare-label">
                    <span className="compare-label-inner">
                      <span aria-hidden="true" className="compare-icon">
                        {ROW_ICONS[i]}
                      </span>
                      {row.label}
                    </span>
                  </th>
                  <td className="compare-alt" data-col={whyUs.alternative}>
                    <span aria-hidden="true" className="compare-x">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M7 7l10 10M17 7 7 17" />
                      </svg>
                    </span>
                    <span className="compare-alt-text">{row.alternative}</span>
                  </td>
                  <td className="compare-us" data-col={whyUs.us}>
                    <span aria-hidden="true" className="compare-check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    <span>{row.us}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CompareCard>
      </Chapter>

      <section
        id="regions"
        data-anchor=""
        data-theme="dark"
        data-nav-section="regions"
        aria-labelledby="regions-title"
        className="overflow-clip bg-bg py-28 pt-36 text-ink md:py-40 md:pt-52 xl:py-52 xl:pt-72"
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
            <RegionFan zones={regions.list} />
          </div>
        </Container>
      </section>
    </>
  );
}
