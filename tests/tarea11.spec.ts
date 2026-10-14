import { test, expect } from '@playwright/test';

const BASE_URL = 'https://practice.expandtesting.com';
const TEXTO_CORRECTO = "Sometimes you'll see a typo, other times you won't.";

const limpiar = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, '');

test.describe('Tarea 11 - Documentar defectos con Playwright', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.errors.length === 0) return;

    const obtenido = limpiar(testInfo.errors[0].message ?? 'Sin mensaje de error')
      .split('\n').slice(0, 8).join('\n');

    const borrador = [
      `# Borrador de Bug Report - ${testInfo.title}`,
      '',
      `**Título:** ${testInfo.title}`,
      `**Fecha:** ${new Date().toISOString()}`,
      `**Ambiente:** ${process.platform}, proyecto ${testInfo.project.name}`,
      `**URL:** ${page.url()}`,
      '',
      '## Resultado obtenido',
      '```',
      obtenido,
      '```',
      '',
      '## Pendiente de completar',
      'Severidad, prioridad, frecuencia, pasos para reproducir y resultado esperado.',
    ].join('\n');

    await testInfo.attach('borrador-bug-report.md', {
      body: borrador,
      contentType: 'text/markdown',
    });
  });

  test('Reto 1: medir la frecuencia del typo en /typos', async ({ page }, testInfo) => {
    const VECES = 12;
    const lecturas: string[] = [];
    let conError = 0;

    await page.goto(`${BASE_URL}/typos`);
    for (let i = 1; i <= VECES; i++) {
      if (i > 1) await page.reload();
      const texto = (await page
        .getByText(/Sometimes you.ll see a typo/)
        .innerText())
        .replace(/[’‘]/g, "'")
        .trim();
      const hayError = texto !== TEXTO_CORRECTO;
      if (hayError) conError++;
      lecturas.push(`Carga ${i}: ${hayError ? 'CON ERROR' : 'correcto'} -> ${texto}`);
    }

    const frecuencia = `${conError} de ${VECES}`;
    testInfo.annotations.push({ type: 'frecuencia', description: frecuencia });
    await testInfo.attach('frecuencia-typos', {
      body: `Frecuencia del error de texto: ${frecuencia}\n\n${lecturas.join('\n')}`,
      contentType: 'text/plain',
    });

    await page.screenshot({
      path: 'evidencias/tarea11/01_reto1_typos.png',
      fullPage: true,
    });

    // Se asegura que las 12 lecturas se hicieron; el resultado depende del azar.
    expect(lecturas).toHaveLength(VECES);
  });

  test.fixme(
    'Reto 2: /typos debe mostrar el texto sin errores',
    {
      annotation: {
        type: 'issue',
        description: 'https://github.com/martinez132/PlayWright/issues/1',
      },
    },
    async ({ page }) => {
      await page.goto(`${BASE_URL}/typos`);
      await expect(page.getByText(/Sometimes you.ll see a typo/))
        .toHaveText(TEXTO_CORRECTO);
    },
  );

  test('Reto 3: imágenes rotas generan un borrador desde afterEach', async ({ page }) => {
    test.fail(true, 'BUG-001: asdf.jpg y hjkl.jpg responden 404');

    await page.goto(`${BASE_URL}/broken-images`);
    const imagenes = page.locator('main img');
    await expect.poll(() => imagenes.evaluateAll(
      imgs => imgs.every(img => (img as HTMLImageElement).complete),
    )).toBe(true);

    // La captura va ANTES de las aserciones para que se guarde aunque el test falle.
    await page.screenshot({
      path: 'evidencias/tarea11/03_reto3_imagenes_rotas.png',
      fullPage: true,
    });

    const anchos = await imagenes.evaluateAll(
      imgs => imgs.map(img => (img as HTMLImageElement).naturalWidth),
    );
    for (const ancho of anchos) {
      expect(ancho).toBeGreaterThan(0);
    }
  });

});