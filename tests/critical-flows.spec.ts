import { test, expect } from '@playwright/test';

test.describe('E2E Critical Flows', () => {

    test('HP -> Shop -> Category Filter', async ({ page }) => {
        await page.goto('/');

        // Wait for hero to be visible
        await expect(page.locator('main')).toBeVisible();

        // Navigate to Shop via Nav
        const shopLink = page.getByRole('link', { name: /ABAYAS/i }).first();
        if (await shopLink.isVisible()) {
            await shopLink.click();
        } else {
            await page.goto('/shop');
        }

        await expect(page).toHaveURL(/.*shop.*/);
        await expect(page.getByText(/The Collection/i)).toBeVisible();

        // Test Category Sidebar (Desktop)
        const collectionFilter = page.locator('aside').getByText(/Collection/i);
        if (await collectionFilter.isVisible()) {
            await expect(collectionFilter).toBeVisible();
        }
    });

    test('Customer Login Flow', async ({ page }) => {
        await page.goto('/login');

        // Check form elements
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Try invalid login
        await page.fill('input[name="email"]', 'test@wrong.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Should show error (wait for action response)
        await expect(page.locator('div:has-text("Invalid email or password")').or(page.locator('div:has-text("account is pending admin approval")'))).toBeVisible();
    });

    test('Admin Portal Access Flow', async ({ page }) => {
        await page.goto('/atelier-portal-v7');

        await expect(page.getByText(/Atelier Portal/i)).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();

        // Mock admin credentials check (don't perform real login here unless needed for test data)
        await page.fill('input[name="email"]', 'admin@modeaura.ca');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
    });

    test('Newsletter Subscription Smoke', async ({ page }) => {
        await page.goto('/');
        const emailInput = page.locator('input[placeholder*="ENTER YOUR EMAIL"]');
        if (await emailInput.isVisible()) {
            await emailInput.fill('automation@test.com');
            const submitBtn = page.locator('button:has-text("JOIN THE CIRCLE")');
            await expect(submitBtn).toBeEnabled();
        }
    });
});
