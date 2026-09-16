/** The only numbers GSAP ever sees. Mirrors the CSS tokens in globals.css. */
export const T = { t1: 0.15, t2: 0.25, t3: 0.4, t4: 0.6 } as const;

export const Y = { row: 8, block: 12 } as const;

export const STAGGER = { row: 0.06, rowMobile: 0.04, metric: 0.1, metricMobile: 0.08, block: 0.12, cap: 0.48 } as const;

export const EASE = { enter: "power2.out", draw: "expo.out", exit: "power2.in" } as const;

export const AT = {
  statement: "top 80%",
  rows: "top 70%",
  compare: "top 60%",
} as const;

/** Keep long cascades under the cap. */
export function stagger(each: number, count: number) {
  return count > 8 ? STAGGER.cap / count : each;
}
