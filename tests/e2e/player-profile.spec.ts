import { expect, test } from "@playwright/test";

test.describe("Players directory → profile", () => {
  test("opens a player from /players and shows CMV breakdown sections", async ({ page }) => {
    await page.goto("/players");

    await expect(page.getByRole("heading", { name: /All Players/i })).toBeVisible();

    const firstPlayerLink = page.locator('a[href^="/player/"]').first();
    await expect(firstPlayerLink).toBeVisible();
    await firstPlayerLink.click();
    await page.waitForURL(/\/player\//, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/player\/[^/]+$/);
    await expect(page.getByText("Commercial Market Value", { exact: false })).toBeVisible();
    await expect(page.getByText("CMV Breakdown", { exact: false })).toBeVisible();
    await expect(page.getByText(/Social Media Deep Dive/i)).toBeVisible();
    await expect(page.getByText(/Sports Performance Detail/i)).toBeVisible();
  });
});
