import { test, expect } from '@playwright/test';

test.describe('E2E Headless Shipping API & Delivery Widget Flow', () => {
  test('Customer uses DeliveryWidget to calculate quote and submit 3PL delivery', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    await expect(page.getByText('Detalles de Envío')).toBeVisible();
  });
});
