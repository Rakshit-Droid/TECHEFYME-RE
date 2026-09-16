import { expect, test } from "@playwright/test";
import { collectMedia, skipIntro } from "./helpers";

const introUp = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.hasAttribute("data-intro"));

test.describe("intro curtain", () => {
  test("plays once, then never again in the session", async ({ page }) => {
    await page.goto("/");
    expect(await introUp(page)).toBe(true);

    // The curtain is opaque, above the nav, and covers the viewport.
    // Full bleed apart from the reserved scrollbar gutter, which the root paints black.
    const box = await page.locator(".intro").boundingBox();
    const viewport = page.viewportSize()!;
    expect(box!.width).toBeGreaterThan(viewport.width - 20);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).toBe("rgb(0, 0, 0)");
    expect(await page.locator(".intro").evaluate((el) => Number(getComputedStyle(el).zIndex))).toBeGreaterThan(50);

    // The page underneath is fully rendered while the curtain is up: LCP is unaffected.
    await expect(page.locator("#hero-title")).toHaveCount(1);
    await expect(page.locator("[data-hero]")).toHaveAttribute("data-hero-painted", "", { timeout: 15_000 });

    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), null, { timeout: 15_000 });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.reload();
    expect(await introUp(page)).toBe(false);
  });

  test("any input dismisses it, and the page is usable immediately", async ({ page }) => {
    await page.goto("/");
    expect(await introUp(page)).toBe(true);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), null, { timeout: 5_000 });

    // The scroll lock is released and the hero scrubs as normal.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
    await page.evaluate(() => window.scrollBy(0, 400));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("does not run on other routes, and burns the session flag there too", async ({ page }) => {
    await page.goto("/pricing");
    expect(await introUp(page)).toBe(false);
    await page.goto("/");
    expect(await introUp(page)).toBe(false);
  });

  test("fetches exactly one rendition, and none once seen", async ({ page }) => {
    const first = collectMedia(page);
    await page.goto("/");
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-intro"), null, { timeout: 15_000 });
    expect(first.filter((u) => u.startsWith("/intro/"))).toHaveLength(1);

    const second = collectMedia(page);
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(second.filter((u) => u.startsWith("/intro/"))).toHaveLength(0);
  });

  test("is absent when the session has already seen it", async ({ page }) => {
    await skipIntro(page);
    await page.goto("/");
    expect(await introUp(page)).toBe(false);
    await expect(page.locator(".intro")).toBeHidden();
  });
});
