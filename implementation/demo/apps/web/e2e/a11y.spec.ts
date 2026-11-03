import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:8000";
const ROUTES = [
  "/",
  "/stage?step=S01",
  "/stage?step=S07",
  "/stage?step=S09",
  "/stage?step=S11",
  "/jeweller",
  "/karigar",
  "/ledger",
  "/orders/14",
  "/settlements/SET-2026-W42-RAFIQ",
  "/lender/passport/ps-rafiq-w42-demo0001a",
] as const;

async function audit(page: Page, route: string) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const summary = results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.html) }));
  expect(summary, `axe violations on ${route}`).toEqual([]);
}

test.describe("Accessibility (WCAG 2.1 AA) and layout", () => {
  test.beforeAll(async ({ request }) => {
    await request.post(`${API}/v1/demo/reset`, { data: { to_step: "S13" } });
  });

  for (const route of ROUTES) {
    test(`${route} has no axe violations (light)`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      await audit(page, route);
    });
  }

  test("dark theme has no axe violations on / and /stage", async ({ page }) => {
    for (const route of ["/", "/stage?step=S05"] as const) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      if (!(await page.evaluate(() => document.documentElement.classList.contains("dark")))) {
        await page.getByRole("button", { name: "Dark theme" }).first().click();
      }
      await expect(page.locator("html")).toHaveClass(/dark/);
      await audit(page, `${route} (dark)`);
    }
  });

  test("no horizontal scroll at 390 × 844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/", "/stage?step=S03", "/karigar", "/jeweller"] as const) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0);
    }
  });
});
