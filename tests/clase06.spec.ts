import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';

// Crear carpeta para evidencias si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase06')) {
    fs.mkdirSync('./evidencias/clase06', { recursive: true });
  }
});

test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

  test('Login exitoso con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectToBeOnInventoryPage();

    console.log('Login con POM exitoso');
    await page.screenshot({ path: './evidencias/clase06/01-login-exitoso-pom.png', fullPage: true });
  });

  test('Login fallido con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('wrong_user', 'wrong_pass');

    await loginPage.expectLoginError(
      'Username and password do not match');

    console.log('Error de login capturado con POM');
    await page.screenshot({ path: './evidencias/clase06/02-login-fallido-pom.png', fullPage: true });
  });

  test('Flujo completo: login -> agregar 2 productos -> verificar carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    // Agregar productos por nombre
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.addProductByName('Sauce Labs Bike Light');

    // Verificar badge del carrito
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // Ir al carrito
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(2);

    console.log('Flujo completo con POM: 2 productos en carrito');
    await page.screenshot({ path: './evidencias/clase06/03-flujo-completo-carrito.png', fullPage: true });
  });

  test('Verificar que el inventario tiene 6 productos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);

    await page.screenshot({ path: './evidencias/clase06/04-inventario-6-productos.png', fullPage: true });
  });

  test('Ordenar productos de mayor a menor precio', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    // Ordenar de mayor a menor precio
    await inventoryPage.sortBy('hilo');

    const precios = page.locator('.inventory_item_price');
    const primerPrecio = await precios.first().textContent();

    // Los precios deben estar en orden descendente
    const todosLosPrecios = await precios.allTextContents();
    const numericos = todosLosPrecios.map(
      p => parseFloat(p.replace('$', '')));
    for (let i = 0; i < numericos.length - 1; i++) {
      expect(numericos[i]).toBeGreaterThanOrEqual(numericos[i + 1]);
    }

    await page.screenshot({ path: './evidencias/clase06/05-ordenar-mayor-menor.png', fullPage: true });
  });

  test('Reto 1 - Completar una compra de principio a fin con CheckoutPage', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(1);

    await cartPage.proceedToCheckout();
    await checkoutPage.fillInformation('Milton', 'Perez', '01001');
    await checkoutPage.continueToOverview();
    await checkoutPage.finishOrder();
    await checkoutPage.expectOrderComplete();

    console.log('Reto 1: compra completada de principio a fin con CheckoutPage');
    await page.screenshot({ path: './evidencias/clase06/06-reto1-checkout-completo.png', fullPage: true });
  });

  test('Reto 2 - Probar el flujo de logout con MenuPage', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const menuPage = new MenuPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await menuPage.logout();

    // Tras el logout debemos regresar a la pantalla de login
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(loginPage.loginButton).toBeVisible();

    console.log('Reto 2: logout exitoso con MenuPage');
    await page.screenshot({ path: './evidencias/clase06/07-reto2-logout-menupage.png', fullPage: true });
  });

  test('Reto 3 - Quitar un producto y verificar que el badge desaparece', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductByName('Sauce Labs Backpack');

    // Al quitar el único producto, el badge desaparece del DOM
    await expect(inventoryPage.cartBadge).not.toBeVisible();

    console.log('Reto 3: producto removido, badge del carrito desapareció');
    await page.screenshot({ path: './evidencias/clase06/08-reto3-badge-desaparece.png', fullPage: true });
  });

});