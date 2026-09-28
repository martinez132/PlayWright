import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

if (!fs.existsSync('./evidencias/tarea09')) {
  fs.mkdirSync('./evidencias/tarea09', { recursive: true });
}

// Reto 1 - Fixture con teardown real
type TeardownFixtures = {
  timedPage: Page;
};

const testConTeardown = test.extend<TeardownFixtures>({
  timedPage: async ({ page }, use) => {
    const inicio = Date.now();

    await use(page);

    const duracionMs = Date.now() - inicio;
    console.log(`[Reto 1] Teardown ejecutado: el test tardó ${duracionMs}ms`);
  },
});

testConTeardown.describe('Reto 1 - Fixture con teardown real', () => {
  testConTeardown('Login cronometrado con teardown que reporta la duración', async ({ timedPage }) => {
    await timedPage.goto('https://www.saucedemo.com');
    await timedPage.locator('#user-name').fill('standard_user');
    await timedPage.locator('#password').fill('secret_sauce');
    await timedPage.locator('#login-button').click();
    await expect(timedPage).toHaveURL(/inventory/);

    await timedPage.screenshot({ path: './evidencias/tarea09/reto1-fixture-teardown-real.png', fullPage: true });
  });
});

// Reto 2 - Fixture de alcance worker
type WorkerFixtures = {
  workerCounter: { value: number };
};

const testConWorker = test.extend<{}, WorkerFixtures>({
  workerCounter: [async ({}, use) => {
    // Se crea una sola vez para todo el worker
    const contador = { value: 0 };
    await use(contador);
  }, { scope: 'worker' }],
});

testConWorker.describe('Reto 2 - Fixture de alcance worker', () => {
  testConWorker('Primer test: el contador de worker sube a 1', async ({ workerCounter }) => {
    workerCounter.value++;
    console.log(`[Reto 2] Contador de worker: ${workerCounter.value}`);
    expect(workerCounter.value).toBe(1);
  });

  testConWorker('Segundo test: el contador de worker sube a 2 (mismo worker que el anterior)', async ({ workerCounter, page }) => {
    workerCounter.value++;
    console.log(`[Reto 2] Contador de worker: ${workerCounter.value}`);
    expect(workerCounter.value).toBe(2);

    await page.goto('https://www.saucedemo.com');
    await page.screenshot({ path: './evidencias/tarea09/reto2-fixture-worker-scope.png', fullPage: true });
  });
});

// Reto 3 - test.use() + parametrización
const viewports = [
  { nombre: 'movil', width: 375, height: 667 },
  { nombre: 'escritorio', width: 1280, height: 720 },
];

test.describe('Reto 3 - test.use() + parametrización de viewports', () => {
  for (const viewport of viewports) {
    test.describe(`Viewport: ${viewport.nombre}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test(`El login funciona en ${viewport.nombre} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.goto('https://www.saucedemo.com');
        await expect(page.locator('#login-button')).toBeVisible();

        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();
        await expect(page).toHaveURL(/inventory/);

        await page.screenshot({ path: `./evidencias/tarea09/reto3-viewport-${viewport.nombre}.png`, fullPage: true });
      });
    });
  }
});