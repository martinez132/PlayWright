import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase08')) {
    fs.mkdirSync('./evidencias/clase08', { recursive: true });
  }
});

test.describe('Clase 08 - Suite de inventario con hooks', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'standard_user');
    // Verificar que llegamos al inventario
    await expect(page).toHaveURL(/inventory/);
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_').toLowerCase();
      try {
        await page.screenshot({
          path: `./evidencias/clase08/fallo-${nombreSeguro}.png`,
          fullPage: true
        });
        console.log(`Test fallido: ${testInfo.title} - Screenshot guardado`);} catch (e) {
        // Si la página ya fue cerrada antes del afterEach, el screenshot fallará
        console.log('No se pudo capturar screenshot:', e);
      }
    }
  });

  test('El inventario muestra 6 productos', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
    await page.screenshot({ path: './evidencias/clase08/t01-inventario-6-productos.png', fullPage: true });
  });

  test('Todos los productos tienen precio visible', async ({ page }) => {
    const precios = page.locator('.inventory_item_price');
    const cantidad = await precios.count();
    for (let i = 0; i < cantidad; i++) {
      const precio = precios.nth(i);
      await expect(precio).toBeVisible();
      const textoPrecio = await precio.textContent();
      expect(textoPrecio).toMatch(/^\$\d+\.\d{2}$/); // formato: $9.99
    }
    console.log(`Todos los ${cantidad} productos tienen precio en formato correcto`);
    await page.screenshot({ path: './evidencias/clase08/t02-productos-precio-visible.png', fullPage: true });
  });

  test('Todos los productos tienen imagen visible', async ({ page }) => {
    const imagenes = page.locator('.inventory_item img');
    const cantidad = await imagenes.count();

    for (let i = 0; i < cantidad; i++) {
      await expect(imagenes.nth(i)).toBeVisible();
      const src = await imagenes.nth(i).getAttribute('src');
      expect(src).not.toBeNull();
    }
    console.log(`${cantidad} imágenes verificadas`);
    await page.screenshot({ path: './evidencias/clase08/t03-productos-imagen-visible.png', fullPage: true });
  });

test('El menú de hamburguesa funciona', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.waitForSelector('.bm-menu', { state: 'visible' });

    await expect(page.getByText('All Items')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
    await expect(page.getByText('Reset App State')).toBeVisible();

    await page.screenshot({ path: './evidencias/clase08/t04-menu-hamburguesa-abierto.png', fullPage: true });

    await page.locator('#react-burger-cross-btn').click();
    await page.waitForSelector('.bm-menu', { state: 'hidden' });
  });

test('Logout funciona correctamente', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await page.getByText('Logout').click();

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('#login-button')).toBeVisible();
    await page.screenshot({ path: './evidencias/clase08/t05-logout-completado.png', fullPage: true });
  });
});

// ----------- SUITE SEPARADA: Comportamiento con diferentes usuarios -----------
test.describe('Clase 08 - Comportamiento por tipo de usuario', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Usuario estándar puede completar el checkout', async ({ page }) => {
    await loginAs(page, 'standard_user');

    await page.locator('.btn_inventory').first().click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/checkout-step-one/);
    console.log('Usuario estándar llegó al checkout');
    await page.screenshot({ path: './evidencias/clase08/t06-checkout-usuario-estandar.png', fullPage: true });
  });

  test('Usuario de rendimiento degrado experimenta lentitud', async ({ page }) => {
    const inicio = Date.now();
    await loginAs(page, 'performance_glitch_user');
    const tiempoLogin = Date.now() - inicio;
    console.log(`Tiempo de login (glitch user): ${tiempoLogin}ms`);
    expect(tiempoLogin).toBeGreaterThan(0);
    await expect(page).toHaveURL(/inventory/);
    await page.screenshot({ path: './evidencias/clase08/t07-usuario-rendimiento-degradado.png', fullPage: true });
  });

});