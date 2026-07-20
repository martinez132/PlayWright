# Reflexión: Auto-wait vs. sleep()

## ¿Qué es el auto-wait de Playwright?

Playwright no ejecuta una acción de inmediato; antes espera automáticamente 
a que el elemento esté listo (visible, habilitado, estable, adjunto al DOM). 
Esto se ve en varios puntos del código de la Clase 2:

- `page.waitForSelector('.card-title a')`: espera a que los productos 
  aparezcan en el DOM antes de contarlos, sin importar cuánto tarde la red.
- `page.waitForURL('**/cart.html')`: espera a que la navegación termine 
  y la URL cambie realmente, en vez de asumir un tiempo fijo.
- `expect(page).toHaveURL(...)` y `expect(page.locator(...)).toBeVisible()`: 
  estas aserciones reintentan automáticamente durante unos segundos hasta 
  que la condición se cumple o se agota el timeout.

## ¿Por qué no usar sleep() / setTimeout fijo?

Un `sleep(5000)` congela el test un tiempo fijo sin importar si la página 
ya cargó o no:

- **Si la espera es muy corta**: el test falla aunque la app funcione 
  bien, porque el elemento aún no aparecía.
- **Si la espera es muy larga**: el test pasa, pero desperdicia tiempo 
  de ejecución en cada corrida (multiplicado por decenas o cientos de 
  tests, esto se vuelve muy costoso en un pipeline de CI/CD).
- **Es frágil ante cambios de red o servidor**: un día la página tarda 
  200ms, otro día tarda 3s por congestión del servidor demo; un sleep 
  fijo no se adapta a esa variación.

## Ejemplo concreto de mi código

En el test de "Navegar a la categoría Phones" evité usar 
`waitForResponse` apuntando a un endpoint interno específico, ya que 
ese endpoint podría cambiar de nombre o estructura en el futuro y 
volvería el test frágil. En su lugar usé `waitForSelector`, que espera 
directamente por el resultado visible en el DOM (los productos), sin 
acoplarse a detalles internos de implementación del backend.

## Conclusión

El auto-wait hace que los tests sean más **rápidos** (no esperan más de 
lo necesario) y más **confiables** (esperan lo necesario según lo que 
realmente pasa en la página, no según un número arbitrario). Usar 
`sleep()` es una solución más simple de escribir, pero introduce 
tests inestables ("flaky") y ejecuciones más lentas a gran escala.