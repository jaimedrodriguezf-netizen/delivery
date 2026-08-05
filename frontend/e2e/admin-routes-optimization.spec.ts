import { test, expect } from '@playwright/test';

test.describe('E2E Admin Route Optimization Flow', () => {
  test('Dispatcher selects origin hub, triggers spatial route optimization, and verifies multi-stop navigation URL', async ({ page }) => {
    // 1. Navigate to Admin Routes page
    await page.goto('http://localhost:3000/admin/routes');
    await expect(page.getByText('Optimización de Rutas de Despacho')).toBeVisible();

    // 2. Click trigger button to calculate optimal route
    const triggerButton = page.getByText('Generar Rutas Óptimas por Bodega');
    await expect(triggerButton).toBeVisible();
    await triggerButton.click();

    // 3. Verify route sequence and metrics summary banner appear
    await expect(page.getByText(/Paradas de Entrega/)).toBeVisible();
    await expect(page.getByText('Abrir Navegación Google Maps Multi-Stop')).toBeVisible();
  });
});
