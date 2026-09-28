import { test, expect } from '../fixtures';
import { test as baseTest } from '@playwright/test';
import * as fs from 'fs';

if (!fs.existsSync('./evidencias/clase09')) {
  fs.mkdirSync('./evidencias/clase09', { recursive: true });
}

test.describe('Clase 09 - Fixtures y datos de prueba', () => {

  test('Usando fixture de login: verificar inventario',
    async ({ inventoryPage, page }) => {
    // El fixture ya hizo el login - verificamos el inventario
    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);
    console.log(`Inventario tiene ${count} productos (via fixture)`);
    await page.screenshot({ path: './evidencias/clase09/t01-fixture-login-inventario.png', fullPage: true });
  });

  test('Usando fixture de carrito: verificar que hay 1 item',
    async ({ cartPage }) => {
    const count = await cartPage.getItemCount();
    expect(count).toBe(1);
    console.log(`Carrito tiene ${count} item (via fixture)`);
    await cartPage.page.screenshot({ path: './evidencias/clase09/t02-fixture-carrito.png', fullPage: true });
  });

  test('Usando fixture de loginPage: login manual en el test',
    async ({ loginPage, page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
    await page.screenshot({ path: './evidencias/clase09/t03-fixture-loginpage-manual.png', fullPage: true });
  });

});

const usuariosDeLogin = [
  {
    username: 'standard_user',
    password: 'secret_sauce',
    esperadoURL: /inventory/,
    descripcion: 'usuario estándar puede ingresar'
  },
  {
    username: 'locked_out_user',
    password: 'secret_sauce',
    esperadoURL: null,
    descripcion: 'usuario bloqueado no puede ingresar'
  },
  {
    username: '',
    password: '',
    esperadoURL: null,
    descripcion: 'campos vacíos muestran error'
  },
];

baseTest.describe('Clase 09 - Tests parametrizados de login', () => {

  usuariosDeLogin.forEach((datos, indice) => {
    baseTest(`Login: ${datos.descripcion}`, async ({ page }) => {
      await page.goto('https://www.saucedemo.com');
      await page.locator('#user-name').fill(datos.username);
      await page.locator('#password').fill(datos.password);
      await page.locator('#login-button').click();

      if (datos.esperadoURL) {
        await expect(page).toHaveURL(datos.esperadoURL);
        console.log(`${datos.descripcion}: acceso correcto`);
      } else {
        const error = page.locator('[data-test="error"]');
        await expect(error).toBeVisible();
        console.log(`${datos.descripcion}: error mostrado correctamente`);
      }

      const numero = String(indice + 4).padStart(2, '0'); // t04, t05, t06
      const nombreSeguro = datos.descripcion.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await page.screenshot({ path: `./evidencias/clase09/t${numero}-login-${nombreSeguro}.png`, fullPage: true });
    });
  });

});

const productosAVerificar = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
];

baseTest.describe('Clase 09 - Agregar productos al carrito (parametrizado)', () => {

  baseTest.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
  });

  productosAVerificar.forEach((nombreProducto, indice) => {
    baseTest(`Agregar "${nombreProducto}" al carrito`, async ({ page }) => {
      const producto = page.locator('.inventory_item', { hasText: nombreProducto });
      await producto.locator('.btn_inventory').click();

      await expect(page.locator('.shopping_cart_badge')).toBeVisible();

      await page.locator('.shopping_cart_link').click();
      await expect(page.locator('.inventory_item_name',
        { hasText: nombreProducto })).toBeVisible();

      console.log(`"${nombreProducto}" verificado en carrito`);

      const numero = String(indice + 7).padStart(2, '0'); // t07, t08, t09
      const nombreSeguro = nombreProducto.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await page.screenshot({ path: `./evidencias/clase09/t${numero}-carrito-${nombreSeguro}.png`, fullPage: true });
    });
  });

});