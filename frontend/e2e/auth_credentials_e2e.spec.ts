import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Flow with Supabase Credentials', () => {
  test('Admin logs in with admin@delivery.ec and accesses Admin Dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();

    await page.fill('input[type="email"]', 'admin@delivery.ec');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/admin');
    await expect(page.getByText('Panel de Control Logístico')).toBeVisible();
    await expect(page.getByText('Optimización de Rutas')).toBeVisible();
  });

  test('Driver logs in with chofer@delivery.ec and accesses Driver Dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();

    await page.fill('input[type="email"]', 'chofer@delivery.ec');
    await page.fill('input[type="password"]', 'moto123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/driver');
    await expect(page.getByText('Panel del Motorizado')).toBeVisible();
    await expect(page.getByText('Mis Entregas Asignadas')).toBeVisible();
  });
});
