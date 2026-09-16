import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AT, EASE, STAGGER, T, Y, stagger } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Every scroll-linked arrival on the site. Rules:
 *  - arrive once, never on scroll-back, never scrubbed, never pinned
 *  - only elements that start below the viewport are ever hidden
 *  - reduced motion keeps the arrivals but drops the movement: opacity only
 */
export function init() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();

  const build = (reduced: boolean) => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const rise = reduced ? 0 : 1;

    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-wipe]"));
    // One batched read before any write.
    const belowFold = new Set(
      groups.filter((el) => el.offsetParent !== null && el.getBoundingClientRect().top > window.innerHeight),
    );

    for (const group of belowFold) {
      const kind = group.dataset.reveal;
      const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]"));

      if (kind === "statement" && items.length) {
        gsap.set(items, { opacity: 0, y: Y.block * rise });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: mobile ? T.t3 : T.t4,
          ease: EASE.enter,
          stagger: STAGGER.block,
          scrollTrigger: { trigger: group, start: AT.statement, once: true },
        });
      } else if (kind === "rows" && items.length) {
        gsap.set(items, { opacity: 0, y: Y.row * rise });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: T.t3,
          ease: EASE.enter,
          stagger: stagger(mobile ? STAGGER.metricMobile : STAGGER.metric, items.length),
          scrollTrigger: { trigger: group, start: AT.statement, once: true },
        });
      } else if (kind === "exhibit" && items.length) {
        gsap.set(items, { opacity: 0 });
        gsap.to(items, {
          opacity: 1,
          duration: 0.3,
          ease: EASE.enter,
          stagger: stagger(STAGGER.rowMobile, items.length),
          scrollTrigger: { trigger: group, start: AT.rows, once: true },
        });
      } else if (kind === "fade") {
        gsap.set(group, { opacity: 0 });
        gsap.to(group, {
          opacity: 1,
          duration: T.t4,
          ease: EASE.enter,
          scrollTrigger: { trigger: group, start: AT.statement, once: true },
        });
      }

      // The drawn rule in the comparison table is movement: skip it under reduced motion.
      if (group.hasAttribute("data-wipe") && wide && !reduced) {
        const rules = Array.from(group.querySelectorAll<HTMLElement>("[data-wipe-v]"));
        if (rules.length) {
          gsap.set(rules, { scaleY: 0, transformOrigin: "50% 0%" });
          gsap.to(rules, {
            scaleY: 1,
            duration: T.t3,
            ease: EASE.draw,
            stagger: STAGGER.row,
            scrollTrigger: { trigger: group, start: AT.compare, once: true },
          });
        }
      }
    }
  };

  // Keyed on reduced motion only: crossing a width breakpoint must never revert and
  // re-hide reveals the visitor has already seen.
  mm.add("(prefers-reduced-motion: no-preference)", () => build(false));
  mm.add("(prefers-reduced-motion: reduce)", () => build(true));

  let alive = true;
  document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());

  return () => {
    alive = false;
    mm.revert();
  };
}
