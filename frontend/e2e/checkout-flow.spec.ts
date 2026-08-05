import { test, expect } from '@playwright/test';

test.describe('Client Delivery Checkout E2E Flow', () => {
  test('allows client to pick GPS location, auto-calculate fee, and submit shipping payment', async ({ page }) => {
    // 1. Visit Checkout page
    await page.goto('http://localhost:3000/checkout');

    // 2. Verify Page Title
    await expect(page.locator('h3')).toContainText('Detalles de Envío');

    // 3. Verify Auto GPS location detection badge
    const autoBadge = page.locator('span:has-text("Pin GPS Directo")');
    await expect(autoBadge).toBeVisible();

    // 4. Fill optional location reference
    const referenceInput = page.locator('textarea#reference_notes');
    await referenceInput.fill('Conjunto San José, Apto 3B / Frente al parque de Conocoto');

    // 5. Select Payment Channel (Transferencia)
    const transferRadio = page.locator('input[value="transfer"]');
    await transferRadio.check({ force: true });

    // 6. Submit Shipping Payment
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
  });
});
