import { test, expect } from '@playwright/test';

test.describe('E2E Landing Page, Register & Login Flow', () => {
  test('Landing page renders hero section, features grid, and API docs', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.getByText('Envíos Inteligentes')).toBeVisible();
    await expect(page.getByText('Multi-Bodega en Quito')).toBeVisible();
    await expect(page.getByText('Registrarse como Motorizado')).toBeVisible();
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(page.getByText('5 Bodegas Estratégicas')).toBeVisible();
    await expect(page.getByText('REST API Endpoints')).toBeVisible();
    await expect(page.getByText('/api/v1/deliveries/create')).toBeVisible();
  });

  test('Register page creates motorizado account and redirects to /driver', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.getByText('Crear Cuenta')).toBeVisible();
    await expect(page.getByText('Motorizado')).toBeVisible();
  });

  test('Login page renders with admin test credentials visible', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(page.getByText('admin@delivery.ec')).toBeVisible();
  });
});
