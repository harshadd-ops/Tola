import { expect, test, type Page } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:8000";

/** Wait until a HeroUI (React Aria) button is enabled, then press it. */
async function press(page: Page, testId: string) {
  const el = page.getByTestId(testId).first();
  await expect(el).toBeVisible();
  await expect(el).not.toHaveAttribute("data-disabled", "true");
  await el.click();
}

async function weigh(page: Page, scale: string) {
  await press(page, `${scale}-place`);
  await expect(page.getByTestId(`${scale}-status`)).toContainText("Stable", { timeout: 6000 });
  await press(page, `${scale}-capture`);
}

test.describe("One week at Shetty Jewellers (DEMO_SPEC §10)", () => {
  test("the scripted clicks walk S01 → S13 and every figure matches the seed", async ({ page, request }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await request.post(`${API}/v1/demo/reset`, { data: {} });
    await page.goto("/stage?step=S01");
    await expect(page.getByTestId("story-rail")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("rail-step-id")).toContainText("S01");

    // Monday: the scale reads 40.000 g, Suresh signs, Rafiq hears it and says haan.
    await weigh(page, "scale");
    await expect(page.getByTestId("scale-readout")).toContainText("40.000");
    await expect(page.getByTestId("scale-readout")).toContainText("36.640 g fine");
    await press(page, "sign-issue");
    await expect(page.getByTestId("issue-waiting")).toBeVisible();
    await expect(page.getByTestId("rail-step-id")).toContainText("S03");
    await press(page, "readback-play");
    await press(page, "phone-haan-issue");
    await expect(page.getByTestId("issue-sealed")).toBeVisible();

    // Thursday: voice note, two scale captures, Lakshmi signs. The scale wins over the voice.
    await page.getByTestId("rail-next").click();
    await expect(page.getByTestId("rail-step-id")).toContainText("S04");
    await press(page, "phone-voice-return");
    await weigh(page, "scale-piece");
    await weigh(page, "scale-scrap");
    await expect(page.getByTestId("return-total")).toContainText("38.620");
    await expect(page.getByTestId("scale-matches-voice")).toBeVisible();
    await press(page, "sign-return");
    await expect(page.getByTestId("phone-return-sealed")).toContainText("38.620");

    // Saturday: run the week, one flag, Rafiq disputes by voice, they agree on 0.130 g.
    await page.getByTestId("rail-next").click();
    await press(page, "run-week");
    const table = page.getByTestId("variance-table");
    await expect(table).toContainText("24.480");
    await expect(table).toContainText("28.870");
    await expect(table).toContainText("+0.380");
    await expect(table).toContainText("₹5,188");
    await expect(page.getByTestId("rail-step-id")).toContainText("S06");
    await press(page, "phone-voice-dispute");
    await expect(page.getByTestId("dispute-thread")).toContainText("solder joint cracked");
    await expect(page.getByTestId("rail-step-id")).toContainText("S07");
    await press(page, "propose-130");
    await press(page, "phone-haan-proposal");
    await expect(page.getByTestId("carried-shortfall")).toContainText("0.250");
    await expect(page.getByTestId("carried-shortfall")).toContainText("0.229 g fine");

    // Sunday: one statement, two approvals, then UPI (simulated).
    await page.getByTestId("rail-next").click();
    await press(page, "draft-settlement");
    await expect(page.getByTestId("settlement-payable")).toContainText("₹5,040.00");
    await expect(page.getByTestId("settlement-carried")).toContainText("0.250");
    await press(page, "approve-jeweller");
    await expect(page.getByTestId("open-upi")).toHaveCount(0);
    await press(page, "phone-approve");
    await expect(page.getByTestId("rail-step-id")).toContainText("S09");
    await press(page, "open-upi");
    await expect(page.getByTestId("upi-card")).toContainText("am=5040.00");
    await expect(page.getByTestId("upi-simulated")).toBeVisible();

    // Passport, lender, GST, chain.
    await page.getByTestId("rail-next").click();
    await press(page, "phone-share-open");
    await press(page, "phone-share-confirm");
    await expect(page.getByTestId("rail-step-id")).toContainText("S11");
    await expect(page.getByTestId("lender-mocked")).toBeVisible();
    await expect(page.getByTestId("passport-figures")).toContainText("194.000");
    await expect(page.getByTestId("passport-figures")).toContainText("13 of 14");
    await expect(page.getByTestId("passport-figures")).toContainText("83.7%");
    await press(page, "verify-passport");
    await expect(page.getByTestId("passport-verified")).toBeVisible();

    await page.getByTestId("rail-next").click();
    await press(page, "open-gst");
    await expect(page.getByTestId("gst-pdf")).toBeVisible();

    await page.getByTestId("rail-next").click();
    await press(page, "verify-chain");
    await expect(page.getByTestId("chain-valid")).toBeVisible();
    await press(page, "tamper");
    await expect(page.getByTestId("chain-broken")).toContainText("R6");

    // The real ledger is untouched by the sandbox.
    const ledger = await (await request.get(`${API}/v1/ledger?karigarId=p-rafiq`)).json();
    expect(ledger.chain.valid).toBe(true);
    const state = await (await request.get(`${API}/v1/demo/state`)).json();
    expect(state.done).toHaveLength(13);

    await page.getByTestId("rail-next").click();
    await expect(page.getByTestId("closing")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
