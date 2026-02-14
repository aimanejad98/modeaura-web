import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
    test('homepage should load', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Mode Aura/i);
        // Check if hero section is present
        await expect(page.locator('main')).toBeVisible();
    });

    test('shop page should load products', async ({ page }) => {
        await page.goto('/shop');
        // Wait for the pulse loader to disappear
        await page.waitForSelector('text=Loading Collection...', { state: 'detached', timeout: 30000 }).catch(() => { });

        // Check if the page title or products container is visible
        const collectionHeading = page.getByText(/The Collection/i);
        const shopContainer = page.locator('main');
        await expect(collectionHeading.or(shopContainer)).toBeVisible();

        // Check if at least one product card is visible (if data exists)
        // Looking at ShopClient.tsx, products are rendered.
        // If no products, it shows "No pieces match your search"
        const productCards = page.locator('div.grid > div');
        const noProducts = page.getByText(/No pieces match your search/i);

        await expect(productCards.first().or(noProducts)).toBeVisible();
    });

    test('admin login page should be accessible', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('form')).toBeVisible();
        await expect(page.getByPlaceholder(/email/i)).toBeVisible();
        await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    });
});
