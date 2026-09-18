import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/tarea08')) {
    fs.mkdirSync('./evidencias/tarea08', { recursive: true });
  }
});

test.describe('Reto 1 - Suite serial con página compartida', () => {
  test.describe.configure({ mode: 'serial' });

  let page: import('@playwright/test').Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, 'standard_user');
  });

  test.afterAll(async () => {
    await page.screenshot({ path: './evidencias/tarea08/reto1-estado-final.png', fullPage: true });
    await page.close();
  });

  test('Paso 1: agrega el primer producto al carrito', async () => {
    await page.locator('.inventory_item').first().locator('.btn_inventory').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('Paso 2: el carrito conserva el producto (mismo estado de sesión)', async () => {
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('Paso 3: completa el checkout reutilizando la misma sesión', async () => {
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});

test.describe('Reto 2 - test.slow() para usuario con lentitud artificial', () => {
  test('Usuario con rendimiento degradado: login marcado como slow', async ({ page }) => {
    test.slow(); 

    const inicio = Date.now();
    await loginAs(page, 'performance_glitch_user');
    const tiempoLogin = Date.now() - inicio;

    console.log(`Tiempo de login (glitch user) con test.slow(): ${tiempoLogin}ms`);
    await expect(page).toHaveURL(/inventory/);

    await page.screenshot({ path: './evidencias/tarea08/reto2-test-slow.png', fullPage: true });
  });
});

test.describe('Reto 3 - test.skip() dinámico', () => {
  test('Ordenar por precio (se omite si todos los productos cuestan igual)', async ({ page }) => {
    await loginAs(page, 'standard_user');

    const textosPrecios = await page.locator('.inventory_item_price').allTextContents();
    const precios = textosPrecios.map((t) => parseFloat(t.replace('$', '')));
    const todosIguales = precios.every((p) => p === precios[0]);

    test.skip(todosIguales, 'Se omite: todos los productos tienen el mismo precio, no se puede validar un orden ascendente real');

    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    const preciosOrdenados = (await page.locator('.inventory_item_price').allTextContents())
      .map((t) => parseFloat(t.replace('$', '')));
    const preciosEsperados = [...preciosOrdenados].sort((a, b) => a - b);

    expect(preciosOrdenados).toEqual(preciosEsperados);
    console.log('Orden ascendente de precios verificado correctamente');
    await page.screenshot({ path: './evidencias/tarea08/reto3-test-skip-dinamico.png', fullPage: true });
  });
});