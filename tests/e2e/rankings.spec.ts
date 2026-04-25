import { expect, test } from "@playwright/test";

test.describe("Rankings", () => {
  test("loads table with CMV rows and navigates to a player profile", async ({ page }) => {
    await page.goto("/rankings");

    await expect(page.getByRole("heading", { name: /CMV Rankings/i })).toBeVisible();

    const playerLinks = page.locator('a[href^="/player/"]');
    const count = await playerLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);

    const firstRow = playerLinks.first();
    const cmvText = await firstRow.locator("span.font-mono.text-lg.font-semibold").textContent();
    const cmv = Number((cmvText ?? "").trim());
    expect(Number.isFinite(cmv)).toBe(true);
    expect(cmv).toBeGreaterThanOrEqual(0);
    expect(cmv).toBeLessThanOrEqual(100);

    await playerLinks.first().click();
    await expect(page).toHaveURL(/\/player\/[^/]+$/);
    await expect(page.getByText("Commercial Market Value", { exact: false })).toBeVisible();
  });
});
