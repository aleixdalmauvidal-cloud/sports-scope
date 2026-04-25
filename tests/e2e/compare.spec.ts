import { expect, test } from "@playwright/test";

test.describe("Compare", () => {
  test("loads compare page with default players and comparison table", async ({ page }) => {
    await page.goto("/compare");

    await expect(page.getByRole("heading", { name: /Compare Players/i })).toBeVisible();

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText("Lamine Yamal", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Vinicius", { exact: false }).first()).toBeVisible();
  });

  test("can add a third player via search", async ({ page }) => {
    await page.goto("/compare");

    const addSlot = page.getByRole("button", { name: /Add player/i }).first();
    await addSlot.click();

    const search = page.getByPlaceholder(/Search players/i);
    await search.fill("Salah");

    await page.getByRole("button", { name: /Mohamed Salah/i }).click();

    await expect(page.getByText("Mohamed Salah", { exact: false }).first()).toBeVisible();
  });
});
