import { expect, test } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:8000";
const SHUFFLED = ["S08", "S03", "S13", "S01", "S11", "S05", "S07", "S10", "S02", "S12", "S04", "S06", "S09"] as const;

test.describe("Story rail (DEMO_SPEC §6, SC-6)", () => {
  test("jumping to any beat puts the server exactly before it, with no errors", async ({ page, request }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto("/stage?step=S01");
    await expect(page.getByTestId("story-rail")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("story-rail")).toBeVisible();

    for (const id of SHUFFLED) {
      await page.getByTestId(`rail-step-${id}`).click();
      await expect(page.getByTestId("rail-step-id")).toContainText(id);
      const n = Number(id.slice(1));
      await expect
        .poll(async () => (await (await request.get(`${API}/v1/demo/state`)).json()).done.length)
        .toBe(n - 1);
    }
    expect(errors).toEqual([]);
  });

  test("Next performs an unfinished beat before moving on (Skip)", async ({ page, request }) => {
    await page.goto("/stage?step=S05");
    await expect(page.getByTestId("story-rail")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("rail-step-id")).toContainText("S05");
    await page.getByTestId("rail-next").click();
    await expect(page.getByTestId("rail-step-id")).toContainText("S06");
    const state = await (await request.get(`${API}/v1/demo/state`)).json();
    expect(state.reconcile.rows.find((r: { order: string }) => r.order === "#14").variance_mg).toBe(380);
  });

  test("keyboard: → next, ← back, ? opens real vs simulated", async ({ page }) => {
    await page.goto("/stage?step=S02");
    await expect(page.getByTestId("story-rail")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("rail-step-id")).toContainText("S02");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("rail-step-id")).toContainText("S03");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("rail-step-id")).toContainText("S02");
    await page.keyboard.press("?");
    await expect(page.getByTestId("real-vs-mocked")).toBeVisible();
  });
});
