import { expect, test } from "@playwright/test";
import { CUES, FILM_SECONDS, LOCKUP, MERGE_SECONDS, NAV_MARK, progressAt } from "../../lib/hero-gate";
import { collectMedia, heroSnapshot, scrubHero, skipIntro, waitForHeroState } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("hero film", () => {
  test("scroll drives the frames and the headline arrives on black", async ({ page, isMobile }) => {
    const media = collectMedia(page);
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-hero]")?.hasAttribute("data-hero-painted"));

    // At the top the film is on its first frame and the headline is hidden.
    const start = await heroSnapshot(page);
    expect(start.state).toBe("idle");
    expect(start.itemOpacity).toBe(0);
    expect(start.theme).toBe("light");

    // Half way through the scrub the film has advanced but the text is still hidden.
    await scrubHero(page, 0.5);
    const middle = await heroSnapshot(page);
    expect(middle.state).toBe("playing");
    expect(middle.frame).toBeGreaterThan(start.frame);
    expect(middle.itemOpacity).toBe(0);

    // Past the black hole the logo film plays out of the black, still under the scroll,
    // and the headline waits for it.
    await scrubHero(page, progressAt(CUES.logo + 2.2));
    await expect.poll(async () => (await heroSnapshot(page)).luma, { timeout: 15_000 }).toBeGreaterThan(0.004);
    const logo = await heroSnapshot(page);
    expect(logo.state).toBe("playing");
    expect(logo.theme).toBe("dark");
    expect(logo.itemOpacity).toBe(0);
    expect(logo.frame).toBeGreaterThan(middle.frame);

    // At the end the lockup has landed in the header, the nav is dark, and the headline is up.
    await scrubHero(page, 1);
    await waitForHeroState(page, "revealed");
    const end = await heroSnapshot(page);
    expect(end.theme).toBe("dark");
    expect(end.nav).toBe("dark");
    expect(end.frame).toBeGreaterThan(middle.frame);
    await expect(page.locator("[data-hero] [data-hero-item]").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".hero-sticky")).toHaveCSS("background-color", "rgb(0, 0, 0)");

    // Scrubbing back returns to the light frames: the film follows scroll in both directions.
    await scrubHero(page, 0.2);
    const back = await heroSnapshot(page);
    expect(back.frame).toBeLessThan(end.frame);
    expect(back.theme).toBe("light");

    // Two scrub clips, each fetched once, in the rendition for the device.
    const clips = media.filter((u) => u.startsWith("/hero/") && u.endsWith(".mp4"));
    expect(clips.filter((u) => u.includes("/hero/hands.")).length).toBe(1);
    expect(clips.filter((u) => u.includes("/hero/logo.")).length).toBe(1);
    expect(clips.every((u) => u.endsWith(isMobile ? ".m.mp4" : ".d.mp4"))).toBe(true);
  });

  test("the finished lockup flies into the header logo, then hands over to it", async ({ page }) => {
    await page.goto("/");
    const end = FILM_SECONDS;
    const state = () =>
      page.evaluate(() => {
        const fly = document.querySelector<HTMLElement>(".hero-lockup")!;
        const logo = document.querySelector<HTMLElement>("[data-nav-logo]")!;
        const svg = logo.querySelector("svg")!.getBoundingClientRect();
        const r = fly.getBoundingClientRect();
        return {
          visible: getComputedStyle(fly).visibility === "visible" && Number(getComputedStyle(fly).opacity) > 0,
          fly: { left: r.left, top: r.top, width: r.width, height: r.height },
          mark: { left: svg.left, top: svg.top, width: svg.width, height: svg.height },
          logoOpacity: Number(getComputedStyle(logo).opacity),
        };
      });

    // On the film's last frame the lockup is still part of the film; the header logo has stepped aside.
    await scrubHero(page, progressAt(end - 0.2));
    await expect.poll(async () => (await heroSnapshot(page)).luma, { timeout: 15_000 }).toBeGreaterThan(0.004);
    let s = await state();
    expect(s.visible).toBe(false);
    expect(s.logoOpacity).toBe(0);

    // Take-off: the still takes over from the film at the film's own size, and the film goes black.
    await scrubHero(page, progressAt(end + 0.02));
    s = await state();
    expect(s.visible).toBe(true);
    const viewport = page.viewportSize()!;
    expect(s.fly.width).toBeGreaterThan(viewport.width * 0.6);
    expect((await heroSnapshot(page)).luma).toBeLessThan(0.002);

    // Mid-flight: smaller, higher, and the header logo still waiting.
    await scrubHero(page, progressAt(end + MERGE_SECONDS * 0.5));
    const mid = await state();
    expect(mid.visible).toBe(true);
    expect(mid.fly.width).toBeLessThan(s.fly.width);
    expect(mid.fly.top).toBeLessThan(s.fly.top);
    expect(mid.logoOpacity).toBe(0);

    // Landing: the flying mark sits exactly on the header's mark, mid-handover.
    await scrubHero(page, progressAt(end + MERGE_SECONDS * 0.93));
    s = await state();
    const scale = s.fly.width / LOCKUP.crop.width;
    const flyMarkX = s.fly.left + (LOCKUP.mark.centerX - LOCKUP.crop.x) * scale;
    const flyMarkY = s.fly.top + (LOCKUP.mark.centerY - LOCKUP.crop.y) * scale;
    expect(Math.abs(flyMarkX - (s.mark.left + s.mark.width * NAV_MARK.centerX))).toBeLessThan(2);
    expect(Math.abs(flyMarkY - (s.mark.top + s.mark.height * NAV_MARK.centerY))).toBeLessThan(2);
    expect(LOCKUP.mark.height * scale).toBeCloseTo(s.mark.height * NAV_MARK.height, 0);
    expect(s.logoOpacity).toBeGreaterThan(0);
    expect(s.logoOpacity).toBeLessThan(1);

    // Landed: only the real header logo remains, and the headline follows.
    await scrubHero(page, 1);
    await waitForHeroState(page, "revealed");
    s = await state();
    expect(s.visible).toBe(false);
    expect(s.logoOpacity).toBe(1);

    // Scrolling back reverses all of it.
    await scrubHero(page, progressAt(end - 0.2));
    s = await state();
    expect(s.visible).toBe(false);
    expect(s.logoOpacity).toBe(0);
    await scrubHero(page, 0);
    expect((await state()).logoOpacity).toBe(1);
  });

  test("cursor parallax moves the film within its envelope and never changes the frame", async ({ page, isMobile }) => {
    test.skip(isMobile, "no pointer parallax on touch");
    await page.goto("/");
    await scrubHero(page, 0.4);
    const before = await heroSnapshot(page);
    for (let i = 0; i < 8; i++) await page.mouse.move(150 + i * 150, 120 + i * 80, { steps: 4 });
    await page.waitForTimeout(500);
    const after = await heroSnapshot(page);
    expect(after.frame).toBe(before.frame);
    const m = after.transform.match(/matrix\(([^)]+)\)/)![1]!.split(",").map(Number);
    expect(m[0]).toBeCloseTo(1.03, 2);
    expect(Math.abs(m[4]!)).toBeLessThanOrEqual(12.01);
    expect(Math.abs(m[5]!)).toBeLessThanOrEqual(10.01);
  });

  test("keyboard focus reveals the headline without scrolling", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard path");
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-hero]")?.hasAttribute("data-hero-painted"));
    await page.locator("[data-hero] a").first().focus();
    await expect(page.locator("[data-hero] [data-hero-item]").first()).toHaveCSS("opacity", "1");
  });
});

test.describe("hero with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("still plays with scroll, without cursor parallax", async ({ page }) => {
    await page.goto("/");
    await scrubHero(page, 1);
    await waitForHeroState(page, "revealed");
    await expect(page.locator("[data-hero] [data-hero-item]").first()).toHaveCSS("opacity", "1");
    const snap = await heroSnapshot(page);
    expect(snap.theme).toBe("dark");
    expect(snap.transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
  });
});

test.describe("hero on a short phone", () => {
  test.use({ viewport: { width: 375, height: 548 }, isMobile: true, hasTouch: true });

  test("CTAs stay above the fold once the headline arrives", async ({ page }) => {
    await page.goto("/");
    await scrubHero(page, 1);
    await waitForHeroState(page, "revealed");
    const bottom = await page
      .getByRole("link", { name: "Book a discovery call" })
      .first()
      .evaluate((el) => el.getBoundingClientRect().bottom);
    expect(bottom).toBeLessThanOrEqual(548);
  });
});
