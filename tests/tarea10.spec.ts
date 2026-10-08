import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';
 
if (!fs.existsSync('./evidencias/tarea10')) {
  fs.mkdirSync('./evidencias/tarea10', { recursive: true });
}
 
test.describe('Reto 1 - Tags multiples y --grep-invert', () => {
 
  test('La lista de productos se ve completa (regresion + UI)',
    { tag: ['@regression', '@ui'] }, async ({ page }, testInfo) => {
    await loginAs(page, 'standard_user');
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page.locator('.inventory_item')).toHaveCount(6);
    await page.screenshot({
      path: `./evidencias/tarea10/reto1-lista-productos-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
 
  test('El logo de la aplicacion es visible (humo + UI)',
    { tag: ['@smoke', '@ui'] }, async ({ page }) => {
    await loginAs(page, 'standard_user');
    await expect(page.locator('.app_logo')).toBeVisible();
  });
 
  test('Ordenar por precio de menor a mayor deja el mas barato primero (solo regresion)',
    { tag: '@regression' }, async ({ page }) => {
    await loginAs(page, 'standard_user');
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const precios = (await page.locator('.inventory_item_price').allTextContents())
      .map(p => parseFloat(p.replace('$', '')));
    expect(precios[0]).toBeLessThanOrEqual(precios[precios.length - 1]);
  });
});
 
test.describe('Reto 2 - expect.soft()', () => {
 
  test('Atributos del primer producto con soft assertions', async ({ page }, testInfo) => {
    await loginAs(page, 'standard_user');
    const producto = page.locator('.inventory_item').first();
 
    await expect.soft(producto.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
    await expect.soft(producto.locator('.inventory_item_price')).toHaveText(/^\$\d+\.\d{2}$/);
    await expect.soft(producto.locator('.inventory_item_desc')).not.toBeEmpty();
    await expect.soft(producto.locator('img')).toBeVisible();
    await expect.soft(producto.locator('.btn_inventory')).toHaveText('Add to cart');
 
    console.log(`[Reto 2] Soft assertions fallidas: ${testInfo.errors.length}`);
    expect(testInfo.errors).toHaveLength(0);
 
    await page.screenshot({
      path: `./evidencias/tarea10/reto2-soft-assertions-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
 
const userAgentEsperado = {
  chromium: /Chrome\//,
  firefox: /Firefox\//,
  webkit: /Version\/[\d.]+.*Safari\//,
} as const;
 
test.describe('Reto 3 - fixture browserName', () => {
 
  test('El user agent coincide con el motor real del navegador',
    async ({ page, browserName }, testInfo) => {
    await page.goto('https://www.saucedemo.com');
    await expect(page.locator('#login-button')).toBeVisible();
 
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log(`[Reto 3] project=${testInfo.project.name} motor=${browserName} UA=${userAgent}`);
 
    // La aserción depende del motor, pero el test nunca se salta
    expect(userAgent).toMatch(userAgentEsperado[browserName]);
 
    await page.screenshot({
      path: `./evidencias/tarea10/reto3-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});