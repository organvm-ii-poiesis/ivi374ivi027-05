import { expect, test } from "@playwright/test";

test("mode switching flow works", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /ancient myth meets synthetic signal/i })).toBeVisible();

  await page.locator(".mode-nav").getByRole("link", { name: "Feed", exact: true }).click();
  await expect(page).toHaveURL(/\/feed$/);
  await expect(page.getByRole("heading", { name: /narrative as signal flood/i })).toBeVisible();

  await page.locator(".mode-nav").getByRole("link", { name: "Scroll", exact: true }).click();
  await expect(page).toHaveURL(/\/scroll$/);
  await expect(page.getByRole("heading", { name: /long-form passage/i })).toBeVisible();
});

test("reader and archive routes expose expected content", async ({ page }) => {
  await page.goto("/read/intro");
  await expect(page.getByRole("heading", { name: /^intro$/i, exact: true }).first()).toBeVisible();

  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: /complete source archive/i })).toBeVisible();

  await expect(page.locator('a[href*=".pdf"]').first()).toBeVisible();
  await expect(page.locator('a[href*=".numbers"]').first()).toBeVisible();
  await expect(page.locator('a[href*=".pages"]').first()).toBeVisible();
  await expect(page.locator('a[href*=".zip"]').first()).toBeVisible();
});
