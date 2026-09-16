import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { skipIntro } from "./helpers";

test.beforeEach(async ({ page }) => skipIntro(page));

test.describe("navigation", () => {
  test("nav follows chapter polarity and marks the section being read", async ({ page, isMobile }) => {
    test.skip(isMobile, "links are in the menu on phones");
    await page.goto("/");
    for (const [id, theme] of [
      ["process", "light"],
      ["regions", "dark"],
      ["faq", "light"],
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

test.describe("services reel", () => {
  test("sticky figure follows the service in view", async ({ page, isMobile }) => {
    test.skip(isMobile, "stacked on phones");
    await page.goto("/");
    for (let i = 0; i < 5; i++) {
      await page.evaluate((i) => {
        const step = document.querySelector(`#services [data-step="${i}"]`)!;
        window.scrollTo({ top: step.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4, behavior: "instant" });
      }, i);
      await expect(page.locator("#services [data-step-target][data-active]")).toHaveAttribute("data-step-target", String(i));
    }
    const top = await page.locator("#services .sticky").evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBe(112);
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
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});
