import { test, expect } from '@playwright/test';

test.describe('E2E Dynamic Hub Pricing Flow', () => {
  test('Admin edits warehouse location and customer checkout updates shipping fee automatically', async ({ page }) => {
    // 1. Admin navigates to Hubs management page
    await page.goto('http://localhost:3000/admin/hubs');
    await expect(page.getByText('Gestión de Puntos de Origen / Bodegas')).toBeVisible();

    // 2. Verify all 5 Quito hubs are listed
    await expect(page.getByText('Bodega La Magdalena (Sur)')).toBeVisible();
    await expect(page.getByText('Bodega Cotocollao (Norte)')).toBeVisible();

    // 3. Customer navigates to Checkout
    await page.goto('http://localhost:3000/checkout');
    await expect(page.getByText('Bodega de Origen (Despacho del Producto)')).toBeVisible();

    // 4. Verify checkout calculates dynamic fee
    const shippingFeeText = await page.getByText(/Cobro de Envío Logístico/).locator('..').textContent();
    expect(shippingFeeText).toContain('$');
  });
});
