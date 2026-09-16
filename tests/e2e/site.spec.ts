import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { RAIL } from "../../lib/services-rail";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("navigation", () => {
  test("nav follows chapter polarity and marks the section being read", async ({ page, isMobile }) => {
    test.skip(isMobile, "links are in the menu on phones");
    await page.goto("/");
    for (const [id, theme] of [
      ["process", "dark"],
      ["regions", "dark"],
      ["faq", "dark"],
    ] as const) {
      await page.evaluate((s) => document.getElementById(s)!.scrollIntoView({ block: "start", behavior: "instant" }), id);
      await expect(page.locator(`[data-nav-link="${id}"]`)).toHaveAttribute("aria-current", "true");
      // The strip under the nav belongs to the chapter above the anchor offset, so wait a frame and read the band.
      await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));
      await expect(page.locator("[data-site-header]")).toHaveAttribute("data-theme", theme);
    }
  });

  test("mobile menu opens as a modal and closes with Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phones only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("nav polarity follows the new page after client-side navigation", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.querySelector("footer")!.scrollIntoView({ block: "end", behavior: "instant" }));
    await expect(page.locator("[data-site-header]")).toHaveAttribute("data-theme", "dark");
    await page.locator("footer").getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator("[data-site-header]")).toHaveAttribute("data-theme", "light");
  });

  test("no horizontal overflow", async ({ page }) => {
    for (const path of ["/", "/pricing", "/terms", "/thanks"]) {
      await page.goto(path);
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(sw, path).toBeLessThanOrEqual(iw);
    }
  });
});

test.describe("services rail", () => {
  test("holds the screen and slides the five services past sideways", async ({ page, isMobile }) => {
    test.skip(isMobile, "stacked on phones");
    await page.goto("/");
    await expect(page.locator(".services-rail")).toHaveAttribute("data-rail", "");
    const width = await page.evaluate(() => document.querySelector<HTMLElement>(".services-stage")!.clientWidth);
    // The scroll length reserved in CSS matches the geometry the rail animates with.
    const [height, vh] = await page.evaluate(() => [document.querySelector<HTMLElement>(".services-rail")!.offsetHeight, window.innerHeight]);
    expect(height).toBeCloseTo(vh * (1 + (4 + RAIL.holdEnd) * RAIL.span), -1);

    for (let i = 0; i < 5; i++) {
      await page.evaluate(
        ([i, span, hold]) => {
          const rail = document.querySelector<HTMLElement>(".services-rail")!;
          const top = rail.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: top + (i + hold / 2) * span * window.innerHeight, behavior: "instant" });
        },
        [i, RAIL.span, RAIL.hold] as const,
      );
      await expect(page.locator(".services-tab").nth(i)).toHaveAttribute("aria-current", "true");
      await expect
        .poll(() => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector(".services-track")!).transform).m41))
        .toBeCloseTo(-i * width, -1);
      // The stage is pinned while it slides.
      expect(await page.locator(".services-stage").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
    }
  });

  test("stacks on phones, each scene building as it arrives", async ({ page, isMobile }) => {
    test.skip(!isMobile, "rail on desktop");
    await page.goto("/");
    await expect(page.locator(".service-panel")).toHaveCount(5);
    expect(await page.locator(".services-rail").getAttribute("data-rail")).toBeNull();
    const last = page.locator(".service-scene").last();
    await last.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    await expect.poll(() => last.evaluate((el) => Number(getComputedStyle(el).getPropertyValue("--dp")))).toBeGreaterThan(0.5);
  });
});

test.describe("process orbit", () => {
  test("turns on its own, and a pressed point opens its card until Escape", async ({ page }) => {
    await page.goto("/");
    const orbit = page.locator(".orbit");
    await orbit.scrollIntoViewIfNeeded();
    const rot = () => page.locator(".orbit-node").first().evaluate((el) => parseFloat(el.style.getPropertyValue("--rot") || "0"));
    const before = await rot();
    await page.waitForTimeout(600);
    expect(await rot()).toBeGreaterThan(before);

    await expect(page.locator(".orbit-panel[data-active]")).toHaveCount(0);
    // The ring never holds still for a pointer, so press the point from the keyboard,
    // which also holds the ring while the point has focus.
    const design = page.getByRole("button", { name: "Design", exact: true });
    await design.focus();
    await page.keyboard.press("Enter");
    const panel = page.locator("#orbit-panel-2");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Brand system documentation");
    await expect(design).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(design).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("not found", () => {
  test("unknown paths get the 404 page, unindexed, with two ways back", async ({ page }) => {
    const response = await page.goto("/definitely-not-here");
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    await expect(page.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/#services");
  });
});

test.describe("keyboard", () => {
  test("focus never lands on a link that is still waiting to fade in", async ({ page }) => {
    await page.goto("/");
    // Footer links sit inside a scroll-reveal group far below the fold.
    const link = page.locator("footer").getByRole("link", { name: "Pricing" });
    await link.focus();
    await expect(link).toBeFocused();
    await expect
      .poll(async () => link.evaluate((el) => {
        let opacity = 1;
        for (let node: HTMLElement | null = el as HTMLElement; node; node = node.parentElement) opacity = Math.min(opacity, parseFloat(getComputedStyle(node).opacity));
        return opacity;
      }))
      .toBeGreaterThan(0.95);
  });
});

test.describe("enquiry form", () => {
  test("server validation returns field errors", async ({ page }) => {
    await page.goto("/#contact");
    await page.locator("form").evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await page.getByLabel("Full name").fill("A");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const alert = page.locator("#contact form").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Please enter your full name.");
    await expect(page.getByLabel("Full name")).toHaveValue("A");
  });

  test("honeypot submissions get a silent success", async ({ page }) => {
    await page.goto("/#contact");
    await page.locator("form").evaluate((f: HTMLFormElement) => (f.noValidate = true));
    await page.locator("#enquiry-website").evaluate((el: HTMLInputElement) => (el.value = "spam"));
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page).toHaveURL(/\/thanks$/);
  });
});

test.describe("accessibility", () => {
  // Reduced motion shows the hero text immediately, so axe sees the page as users do.
  test.use({ reducedMotion: "reduce" });

  for (const path of ["/", "/pricing", "/privacy-policy", "/terms", "/cancellation-refunds", "/delivery-policy", "/thanks"]) {
    test(`axe: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // Measure the page as it reads: scroll-lit words start dim on purpose and are
      // fully lit by the time they reach reading height, so walk the page first.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          // Wait for real rendered frames, not just time: a busy page can skip the frame
          // in which a block's IntersectionObserver would have woken its scroll listener.
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 30))));
        }
      });
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});
