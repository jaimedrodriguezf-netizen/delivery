import { test, expect } from '@playwright/test';

test.describe('Production Verification Suite — energysmartguard.com', () => {
  test('Production Landing Page renders Hero, Features Grid, and API Docs', async ({ page }) => {
    await page.goto('https://energysmartguard.com/');
    await expect(page.getByText('Envíos Inteligentes')).toBeVisible();
    await expect(page.getByText('Multi-Bodega en Quito')).toBeVisible();
    await expect(page.getByText('Registrarse como Motorizado')).toBeVisible();
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(page.getByText('5 Bodegas Estratégicas')).toBeVisible();
    await expect(page.getByText('REST API Endpoints')).toBeVisible();
    await expect(page.getByText('/api/v1/deliveries/create')).toBeVisible();
  });

  test('Production Register Page renders motorizado onboarding', async ({ page }) => {
    await page.goto('https://energysmartguard.com/register');
    await expect(page.getByText('Crear Cuenta')).toBeVisible();
    await expect(page.getByText('Motorizado')).toBeVisible();
  });

  test('Production Login Page renders with admin credentials', async ({ page }) => {
    await page.goto('https://energysmartguard.com/login');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(page.getByText('admin@delivery.ec')).toBeVisible();
  });

  test('Production Headless API /api/v1/origin-hubs responds with 5 Quito hubs', async ({ request }) => {
    const response = await request.get('https://energysmartguard.com/api/v1/origin-hubs');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.hubs.length).toBe(5);
  });
});
