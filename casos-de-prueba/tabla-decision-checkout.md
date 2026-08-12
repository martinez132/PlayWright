# Tabla de Decisión — Proceso de Checkout (Sauce Demo)

## Condiciones evaluadas
1. Usuario autenticado
2. Carrito con al menos 1 item
3. Formulario de checkout completo (First Name, Last Name, Zip/Postal Code)
4. Clic en botón "Finish"

## Tabla de decisión

| Condición / Regla            | R1  | R2  | R3  | R4  | R5  | R6  |
|-------------------------------|-----|-----|-----|-----|-----|-----|
| Usuario autenticado            | Sí  | Sí  | Sí  | Sí  | No  | Sí  |
| Carrito con items              | Sí  | No  | Sí  | Sí  | Sí  | Sí  |
| Formulario completo            | Sí  | -   | No  | Sí  | -   | Sí  |
| Clic en "Finish"               | Sí  | -   | -   | No  | -   | Sí  |
| **Resultado esperado**         | Orden completada ("Thank you for your order!") | Llega al formulario de checkout aunque el carrito esté vacío (Sauce Demo no lo bloquea) | Mensaje de error específico según el campo faltante (p. ej. "Error: Last Name is required") | Permanece en checkout-step-two.html, la orden no se confirma | "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." | Orden completada, carrito se vacía |

## Notas de verificación en vivo

- **¿Qué pasa si accedes a checkout-step-one.html sin sesión?**
  Confirmado: Sauce Demo bloquea el acceso directo y muestra el mensaje
  "Epic sadface: You can only access '/checkout-step-one.html' when you
  are logged in." — no permite ver el formulario de checkout sin sesión
  activa, redirige de vuelta al flujo de login.

- **¿Qué pasa si el carrito está vacío al hacer checkout?**
  Confirmado: el botón "Checkout" es accesible y la página "Checkout:
  Your Information" carga normalmente con el formulario (First Name,
  Last Name, Zip/Postal Code) aunque el carrito no tenga productos.
  Sauce Demo no bloquea este flujo.

- **¿El mensaje de error es igual sin importar qué campo falta?**
  Confirmado: NO es igual. El mensaje cambia según el campo específico
  que falte, siguiendo el patrón "Error: [Campo] is required":
  - Campo First Name vacío → "Error: First Name is required"
  - Campo Last Name vacío → "Error: Last Name is required"
  - Campo Zip/Postal Code vacío → "Error: Postal Code is required"
    (comportamiento esperado por el mismo patrón, no verificado
    explícitamente en captura)

## Reglas explicadas

- **R1**: Camino feliz — usuario logueado, con productos, formulario completo, confirma con Finish → la orden se procesa.
- **R2**: Usuario logueado sin items en el carrito — Sauce Demo permite llegar al formulario de checkout de todas formas, aunque no tenga sentido pagar sin productos.
- **R3**: Formulario incompleto — el sistema bloquea el avance y muestra un mensaje de error específico por campo (no un mensaje genérico).
- **R4**: Todo listo pero el usuario no confirma con "Finish" — la orden queda pendiente, no se completa.
- **R5**: Usuario no autenticado — Sauce Demo bloquea el acceso directo a checkout-step-one.html con un mensaje explícito, redirigiendo al login.
- **R6**: Repetición del camino feliz para reforzar que, cumplidas todas las condiciones, el resultado es consistente.