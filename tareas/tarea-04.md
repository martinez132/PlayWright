# Tarea 04 — Reflexión: Principios ISTQB

## ¿Cuál principio te parece más importante y por qué?

De los 7 principios de las pruebas de software (ISTQB), considero que el 
**Principio 2: Las pruebas exhaustivas son imposibles** es el más importante 
en la práctica.

En el test "Login con credenciales incorrectas" de esta clase, solo probamos 
UNA combinación de usuario y contraseña inválidos. Sería imposible probar 
todas las combinaciones posibles de credenciales incorrectas (usuario vacío, 
contraseña vacía, caracteres especiales, SQL injection, contraseñas muy 
largas, etc.). Este principio nos recuerda que como QA no buscamos cubrir 
el 100% de los casos, sino priorizar los escenarios de mayor riesgo y valor 
para el negocio, usando técnicas como partición de equivalencia y análisis 
de valores límite para decidir qué probar con el tiempo disponible.

Este principio también se conecta con el Principio 1 (las pruebas muestran 
la presencia de defectos, no su ausencia): que nuestro test de login 
incorrecto pase no significa que el sistema de autenticación esté libre de 
errores, solo confirma que ese caso específico se comporta como se espera.

## Preguntas de discusión en clase

**1. ¿Qué principio ISTQB aplica el test de "login con credenciales incorrectas"?**

Aplica principalmente el Principio 1 (las pruebas muestran la presencia de 
defectos, no su ausencia). El test demuestra que, para ese caso puntual, el 
sistema rechaza correctamente el acceso — pero no garantiza que no existan 
otras fallas de seguridad en el módulo de login.

**2. ¿Se puede garantizar que NINGÚN usuario haga login con contraseña incorrecta? (Principio 2)**

No. El Principio 2 (pruebas exhaustivas son imposibles) indica que no 
podemos probar todas las combinaciones posibles de credenciales inválidas. 
Solo podemos aumentar la confianza probando los casos más representativos 
y de mayor riesgo (contraseña vacía, usuario inexistente, formato inválido, 
intentos de inyección, etc.), no eliminar el riesgo por completo.

**3. Si se ejecuta 100 veces sin cambiar nada, ¿seguirá encontrando defectos nuevos? (Principio 5)**

No. Esto es el Principio 5, la "paradoja del pesticida": si el mismo test 
se ejecuta repetidamente sin modificarlo, deja de ser efectivo para 
encontrar defectos nuevos, porque el sistema ya "aprobó" ese mismo camino 
una y otra vez. Para seguir siendo útil, los casos de prueba deben 
revisarse y actualizarse periódicamente, agregando nuevas variantes y 
escenarios.