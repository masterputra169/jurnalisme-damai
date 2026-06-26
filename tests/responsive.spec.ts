import { test, expect } from "@playwright/test";

const BASE_URL = "https://jurnalisme-damai.vercel.app";

test.describe("responsive", () => {
  test("homepage renders on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);

    // Key elements visible
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("main")).toBeVisible();
    // Nav utama hidden di mobile (md:block), cek header saja
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("homepage renders on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Navigasi utama")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("homepage renders on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE_URL);

    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel("Navigasi utama")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("article page responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);

    const firstArticle = page.locator("article h1 a").first();
    await expect(firstArticle).toBeVisible({ timeout: 15000 });
    const href = await firstArticle.getAttribute("href");
    await page.goto(`${BASE_URL}${href}`);

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("forum page responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/forum`);

    await expect(page.getByRole("heading", { name: "Diskusi", exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.locator("main")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto(BASE_URL);

    // Beranda link clickable and works
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL(BASE_URL + "/", { timeout: 15000 });
  });
});
