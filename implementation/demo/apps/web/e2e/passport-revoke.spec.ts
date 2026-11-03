import { expect, test } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://127.0.0.1:8000";
const TOKEN = "ps-rafiq-w42-demo0001a";

test.describe("Work Passport: the karigar can take it back (F-08, EC-8)", () => {
  test("Take it back closes the lender link; Share again reopens it", async ({ page, request }) => {
    // Shared and opened once by the lender (S11 done); the karigar's own phone mirrors the server.
    await request.post(`${API}/v1/demo/reset`, { data: { to_step: "S11" } });
    expect((await request.get(`${API}/v1/passport/${TOKEN}`)).status()).toBe(200);
    await page.goto("/karigar");

    await page.getByTestId("phone-share-revoke").click();
    await expect(page.getByTestId("phone-share-revoked")).toBeVisible();
    expect((await request.get(`${API}/v1/passport/${TOKEN}`)).status()).toBe(410);

    const lender = await page.context().newPage();
    await lender.goto(`/lender/passport/${TOKEN}`);
    await expect(lender.getByTestId("lender-revoked")).toBeVisible();

    await page.getByTestId("phone-share-again").click();
    await expect(page.getByTestId("phone-share-revoke")).toBeVisible();
    expect((await request.get(`${API}/v1/passport/${TOKEN}`)).status()).toBe(200);
  });
});
