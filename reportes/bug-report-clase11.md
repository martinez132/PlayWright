# Bug Report - BR-CLASE11-001

**Título:** Página /broken-images: asdf.jpg y hjkl.jpg responden 404 en Firefox
**Fecha:** 2026-10-13
**Reportado por:** Milton Martínez
**Ambiente:** Windows, Firefox, https://practice.expandtesting.com/broken-images

## Descripción
En la página /broken-images, dos de las imágenes no cargan porque sus archivos responden 404.

## Severidad: Baja
Las imágenes son decorativas y no bloquean ningún flujo del usuario.

## Prioridad: P4
Backlog, sin fecha comprometida.

## Frecuencia: Siempre

## Pasos para reproducir
1. Abrir https://practice.expandtesting.com/broken-images
2. Esperar a que la página termine de cargar
3. Observar las imágenes de la página

## Resultado esperado
Todas las imágenes cargan y tienen un ancho natural mayor que 0.

## Resultado obtenido
asdf.jpg y hjkl.jpg responden 404. En el test: Expected: > 0, Received: 0.

## Evidencia
- Captura: evidencias/clase11/09_bug001_imagenes_rotas.png
- Traza del test (pestaña Network con los 404) en el reporte HTML de Playwright.
- Issue registrado: https://github.com/martinez132/PlayWright/issues/1

## Notas adicionales
Detectado por el test "Imágenes rotas" de tests/clase11.spec.ts (BUG-001), que usa test.fail() mientras el defecto siga abierto.