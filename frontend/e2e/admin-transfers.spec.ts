import { test, expect } from '@playwright/test';

test.describe('Admin Transfer Verification E2E Flow', () => {
  test('allows admin to view pending bank transfers, inspect receipt modal, and approve payment', async ({ page }) => {
    // 1. Visit Admin Transfers Panel
    await page.goto('http://localhost:3000/admin/transfers');

    // 2. Verify Page Header & Navigation
    await expect(page.locator('h1')).toContainText('Validación de Transferencias Bancarias');
    await expect(page.locator('aside')).toBeVisible();

    // 3. Filter Pending Transfers
    const pendingFilterBtn = page.locator('button:has-text("Pendientes")');
    await expect(pendingFilterBtn).toBeVisible();
    await pendingFilterBtn.click();

    // 4. Verify Transfer Item details (Customer, Sector, Amount, Reference)
    const transferCard = page.locator('div.bg-slate-900\\/80').first();
    await expect(transferCard).toBeVisible();
    await expect(transferCard).toContainText('Carlos Mendoza');
    await expect(transferCard).toContainText('Valle de Los Chillos y Conocoto');

    // 5. Open Receipt Preview Modal
    const viewReceiptBtn = transferCard.locator('button:has-text("Ver Comprobante")');
    await viewReceiptBtn.click();

    // 6. Verify Receipt Image Modal is visible
    const modalImage = page.locator('img[alt="Comprobante Bancario"]');
    await expect(modalImage).toBeVisible();

    // 7. Close Receipt Modal
    const closeModalBtn = page.locator('button:has-text("Cerrar")');
    await closeModalBtn.click();
    await expect(modalImage).not.toBeVisible();

    // 8. Approve Transfer
    const approveBtn = transferCard.locator('button:has-text("Aprobar")');
    await approveBtn.click();

    // 9. Verify Transfer Status changes to Approved
    await expect(transferCard).toContainText('Aprobada');
  });
});
