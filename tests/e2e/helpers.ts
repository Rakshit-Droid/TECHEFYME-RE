import type { Page } from "@playwright/test";

/**
 * Marks the intro as already seen for this session, before any page script runs.
 * Every spec except the intro's own starts from a page with no curtain.
 */
export async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem("tm-intro", "1");
    } catch {
      // storage blocked: the intro does not run anyway
    }
  });
}

export type HeroSnapshot = {
  state: string;
  theme: string;
  nav: string;
  /** Mean luma of the painted canvas, 0 (black) to 1 (white): a proxy for the frame shown. */
  luma: number;
  /** Frame position as scroll progress through the hero, 0 to 1. */
  frame: number;
  itemOpacity: number;
  transform: string;
};

export function heroSnapshot(page: Page): Promise<HeroSnapshot> {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("[data-hero]")!;
    const item = section.querySelector("[data-hero-item]")!;
    const wrap = section.querySelector(".hero-parallax")!;
    const distance = section.offsetHeight - window.innerHeight;
    const frame = distance > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance)) : 0;

    const canvas = section.querySelector("canvas") as HTMLCanvasElement;
    const probe = document.createElement("canvas");
    probe.width = 24;
    probe.height = 16;
    const ctx = probe.getContext("2d")!;
    ctx.drawImage(canvas, 0, 0, 24, 16);
    const data = ctx.getImageData(0, 0, 24, 16).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
    return {
      state: section.dataset.heroState ?? "",
      theme: section.dataset.theme ?? "",
      nav: document.querySelector<HTMLElement>("[data-site-header]")?.dataset.theme ?? "",
      luma: sum / (data.length / 4) / 255,
      frame,
      itemOpacity: Number(getComputedStyle(item).opacity),
      transform: getComputedStyle(wrap).transform,
    };
  });
}

/**
 * Scrolls to a given progress through the hero's scrub distance, then waits for the
 * film's playhead to glide there and settle.
 */
export async function scrubHero(page: Page, progress: number) {
  await page.evaluate(async (p) => {
    const section = document.querySelector<HTMLElement>("[data-hero]")!;
    const distance = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: distance * p, behavior: "instant" });
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    await frame();
    await frame();
    const until = performance.now() + 5000;
    while (section.hasAttribute("data-hero-moving") && performance.now() < until) await frame();
    await frame();
  }, progress);
  await page.waitForTimeout(100);
}

export async function waitForHeroState(page: Page, state: string, timeout = 15_000) {
  await page.waitForFunction(
    (s) => document.querySelector<HTMLElement>("[data-hero]")?.dataset.heroState === s,
    state,
    { timeout },
  );
}

export function collectMedia(page: Page) {
  const urls: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (/\.(mp4|jpg|png|webp|avif)$/.test(u.pathname) || u.pathname.startsWith("/_next/image")) urls.push(u.pathname);
  });
  return urls;
}
