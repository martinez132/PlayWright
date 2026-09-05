import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/tarea07')) {
    fs.mkdirSync('./evidencias/tarea07', { recursive: true });
  }
});

test.describe('Tarea 07 - Evidencias avanzadas', () => {

  test('Reto 1 - test.step(): login estructurado en pasos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Navegar a la página de login', async () => {
      await loginPage.navigate();
    });

    await test.step('Iniciar sesión con credenciales válidas', async () => {
      await loginPage.login('standard_user', 'secret_sauce');
    });

    await test.step('Verificar que llegamos al inventario', async () => {
      await inventoryPage.expectToBeOnInventoryPage();
    });
     await page.screenshot({ path: './evidencias/tarea07/reto1-test-step.png', fullPage: true });
  });

  test('Reto 2 - testInfo.attach(): adjuntar datos capturados', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    const cantidadProductos = await inventoryPage.getProductCount();
    const url = page.url();
    const fecha = new Date().toISOString();

    const contenido = [
      `Cantidad de productos: ${cantidadProductos}`,
      `URL: ${url}`,
      `Fecha de ejecución: ${fecha}`,
    ].join('\n');

    await testInfo.attach('datos-capturados', {
      body: contenido,
      contentType: 'text/plain',
    });

    expect(cantidadProductos).toBe(6);
       await page.screenshot({ path: './evidencias/tarea07/reto2-testinfo-attach.png', fullPage: true });
  });

  test('Reto 3 - toHaveScreenshot(): comparación visual del inventario', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    // La primera corrida genera el baseline en tests/tarea07.spec.ts-snapshots/
    await expect(page).toHaveScreenshot('inventario-baseline.png', { fullPage: true });
  });

});