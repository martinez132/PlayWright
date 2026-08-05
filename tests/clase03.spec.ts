import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase03')) {
    fs.mkdirSync('./evidencias/clase03', { recursive: true });
  }
});

test.describe('Clase 03 - Locators en DemoBlaze', () => {

  test('Locator por texto: verificar elementos del menú', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#navbarExample');

    await expect(nav.getByText('Home')).toBeVisible();
    await expect(nav.getByText('Contact')).toBeVisible();
    await expect(nav.getByText('About us')).toBeVisible();
    await expect(nav.getByText('Cart', { exact: true })).toBeVisible();

    await page.screenshot({ path: './evidencias/clase03/01-menu-texto.png', fullPage: true });
  });

  test('Locator por CSS: productos en la página principal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    const tarjetas = page.locator('.card');
    const cantidad = await tarjetas.count();
    expect(cantidad).toBeGreaterThan(0);

    const primerProducto = page.locator('.card-title a').first();
    const nombreProducto = await primerProducto.textContent();
    expect(nombreProducto).not.toBeNull();

    await page.screenshot({ path: './evidencias/clase03/02-productos-css.png', fullPage: true });
  });

  test('Locator por ID: campos del modal de login', async ({ page }) => {
    await page.goto('/');
    await page
      .locator('#navbarExample')
      .getByRole('link', { name: 'Log in', exact: true })
      .click();

    await page.waitForSelector('#logInModal', { state: 'visible' });

    await expect(page.locator('#loginusername')).toBeVisible();
    await expect(page.locator('#loginpassword')).toBeVisible();

    await page.locator('#logInModal').screenshot({ path: './evidencias/clase03/03-modal-login.png' });
  });

  test('Locator por atributo: imagen del primer producto', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    await page.locator('.card-title a').first().click();
    await page.waitForLoadState('domcontentloaded');

    const imagenProducto = page.locator('.product-image img');
    await expect(imagenProducto).toBeVisible();

    const srcImagen = await imagenProducto.getAttribute('src');
    expect(srcImagen).not.toBeNull();

    await page.screenshot({ path: './evidencias/clase03/04-imagen-producto.png', fullPage: true });
  });

  test('Locators encadenados: precio dentro de una tarjeta', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    const primeraTarjeta = page.locator('.card').first();
    const precio = primeraTarjeta.locator('h5');
    await expect(precio).toBeVisible();

    await primeraTarjeta.screenshot({ path: './evidencias/clase03/05-precio-tarjeta.png' });
  });

  test('Verificar que NO existe un elemento (negación)', async ({ page }) => {
    await page.goto('/');
    const mensajeVacio = page.getByText('No products found');
    await expect(mensajeVacio).not.toBeVisible();

    await page.screenshot({ path: './evidencias/clase03/06-sin-mensaje-vacio.png', fullPage: true });
  });

  test('Reto 1 - Locator por rol: botón Place Order en el carrito', async ({ page }) => {
    await page.goto('/cart.html');
    const botonPlaceOrder = page.getByRole('button', { name: 'Place Order' });
    await expect(botonPlaceOrder).toBeVisible();

    await page.screenshot({ path: './evidencias/clase03/07-reto1-place-order.png', fullPage: true });
  });

  test('Reto 2 - Locator con filter(): producto específico por nombre', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    const tarjetaProducto = page.locator('.card').filter({ hasText: 'Samsung galaxy s6' });
    await expect(tarjetaProducto).toBeVisible();

    const precio = await tarjetaProducto.locator('h5').textContent();
    console.log('Precio encontrado:', precio);
    expect(precio).not.toBeNull();

    await tarjetaProducto.screenshot({ path: './evidencias/clase03/08-reto2-filter.png' });
  });

  test('Reto 3 - Locator por atributo parcial: categorías del sidebar', async ({ page }) => {
    await page.goto('/');

    const categorias = page.locator('a[onclick*="byCat"]');
    await expect(categorias).toHaveCount(3);
    await expect(categorias.filter({ hasText: 'Phones' })).toBeVisible();
    await expect(categorias.filter({ hasText: 'Laptops' })).toBeVisible();
    await expect(categorias.filter({ hasText: 'Monitors' })).toBeVisible();

    await page.screenshot({ path: './evidencias/clase03/09-reto3-atributo.png', fullPage: true });
  });

});