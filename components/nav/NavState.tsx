"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Keeps the nav correct without ScrollTrigger:
 *  - polarity from the chapter in a 1px band directly under the nav
 *  - active link from the same band
 *  - "scrolled" from a sentinel at the top of the document
 *  - delegated analytics for any [data-track] element
 */
export function NavState() {
  // The nav lives in the root layout; rebuild every observer when the page under it changes.
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    header.dataset.theme = "light";

    const links = Array.from(header.querySelectorAll<HTMLAnchorElement>("[data-nav-link]"));
    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main [data-theme], footer[data-theme]"));

    const inBand = new Set<HTMLElement>();
    let current: HTMLElement | null = null;

    const apply = () => {
      // The deepest / latest element in document order wins (e.g. #regions inside Why us).
      let pick: HTMLElement | null = null;
      for (const el of sections()) if (inBand.has(el)) pick = el;
      current = pick;
      if (pick) header.dataset.theme = pick.dataset.theme === "dark" ? "dark" : "light";
      updateActive();
    };

    // Active link: the section crossing a reading line at 35% of the viewport, not the strip under the nav.
    const updateActive = () => {
      const y = window.innerHeight * 0.35;
      let id = "";
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"))) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) id = el.dataset.navSection ?? "";
      }
      for (const link of links) {
        if (link.dataset.navLink === id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    };

    let band: IntersectionObserver | null = null;
    const buildBand = () => {
      band?.disconnect();
      inBand.clear();
      const navH = header.offsetHeight;
      const bottom = Math.max(0, window.innerHeight - navH - 1);
      band = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            if (e.isIntersecting) inBand.add(el);
            else inBand.delete(el);
          }
          apply();
        },
        { rootMargin: `-${navH}px 0px -${bottom}px 0px`, threshold: 0 },
      );
      for (const el of sections()) band.observe(el);
    };
    buildBand();

    // The hero flips its own theme at the black frame; follow it without waiting for scroll.
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.target === current)) apply();
    });
    for (const el of sections()) mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });

    const sentinel = document.querySelector("[data-scroll-sentinel]");
    const top = new IntersectionObserver(([e]) => {
      if (!e) return;
      if (e.isIntersecting) delete header.dataset.scrolled;
      else header.dataset.scrolled = "";
    });
    if (sentinel) top.observe(sentinel);

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateActive();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildBand, 150);
    };
    window.addEventListener("resize", onResize);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const name = el.dataset.track;
      if (name === "cta_book") {
        track("cta_book", { location: (el.dataset.trackLocation ?? "nav") as "nav" });
      } else if (name === "cta_see_services") {
        track("cta_see_services");
      } else if (name === "whatsapp_click") {
        track("whatsapp_click");
      }
    };
    document.addEventListener("click", onClick);

    const onToggle = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el instanceof HTMLDetailsElement && el.open && el.dataset.faqId) track("faq_open", { id: el.dataset.faqId });
    };
    document.addEventListener("toggle", onToggle, true);

    return () => {
      band?.disconnect();
      mo.disconnect();
      top.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRaf);
      window.clearTimeout(resizeTimer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, [pathname]);

  return null;
}
