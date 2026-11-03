import { expect, test } from "@playwright/test";

const LOCAL = new Set(["localhost", "127.0.0.1"]);

test.describe("Works offline (SC-1, DEMO_SPEC §11)", () => {
  test("the stage never calls an external host: fonts, QR, passport and ledger are all local", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/^(data|blob|about):/.test(url)) return;
      if (!LOCAL.has(new URL(url).hostname)) external.push(url);
    });

    await page.goto("/");
    await page.goto("/stage?step=S01");
    await expect(page.getByTestId("story-rail")).toHaveAttribute("data-ready", "true");
    for (const id of ["S05", "S09", "S11", "S12", "S13"]) {
      await page.getByTestId(`rail-step-${id}`).click();
      await expect(page.getByTestId("rail-step-id")).toContainText(id);
    }
    expect(external, external.join("\n")).toEqual([]);
  });
});
