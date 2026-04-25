import { expect, test } from "@playwright/test";

test.describe("Rankings", () => {
  test("loads table with CMV rows and navigates to a player profile", async ({ page }) => {
    await page.goto("/rankings");

    await expect(page.getByRole("heading", { name: /CMV Rankings/i })).toBeVisible();

    const playerLinks = page.locator('a[href^="/player/"]');
    const count = await playerLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);

    const firstRow = page.getByRole("link", { name: /Lamine Yamal/i }).first();
    await expect(firstRow).toBeVisible();

    await firstRow.click();
    await page.waitForURL(/\/player\//, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/player\//);
    await expect(page.getByText("Commercial Market Value", { exact: false })).toBeVisible();
  });
});
