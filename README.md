# GranaBank

Billetera virtual del Club Atlético Lanús, hecha para el challenge técnico. Login, inicio con tarjetas y últimos movimientos, listado de movimientos con búsqueda y filtros rápidos, y detalle de cada movimiento.

**Demo:** _pendiente de deploy_
**Credenciales:** `soygranate@clublanus.com` / `GRANATE1@`

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **API routes de Next.js** como backend
- **PostgreSQL** en [Neon](https://neon.tech) + **Prisma 7** como ORM
- **TanStack Query** para el estado de datos en el cliente
- **Zod** para validar, **jose** para la sesión, **bcryptjs** para contraseñas

## Cómo correrlo

Requiere Node 20+ y una base PostgreSQL (una gratuita de Neon alcanza).

```bash
npm install                      # también genera el cliente de Prisma
cp .env.example .env             # y completar las variables
npx prisma migrate deploy        # crea las tablas
npm run db:seed                  # carga el usuario y los datos de ejemplo
npm run dev
```

Abrir http://localhost:3000 e ingresar con las credenciales de arriba.

| Variable         | Para qué                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`   | Conexión **con pooling** de Neon. La usa la app.                          |
| `DIRECT_URL`     | Conexión **directa** de Neon. La usan las migraciones y el seed.          |
| `SESSION_SECRET` | Clave para firmar la sesión. Se genera con `openssl rand -base64 32`.     |

## Estructura

```
prisma/
  schema.prisma        modelos: User, Card, Movement
  seed.ts              usuario de prueba, 2 tarjetas y 14 movimientos
src/
  proxy.ts             redirige a /login si no hay sesión (ex-middleware)
  app/
    login/             pantalla de login
    (app)/             pantallas logueadas, comparten la barra inferior
      page.tsx         Home
      movimientos/     listado con búsqueda y filtros, y detalle [id]
    api/               backend: auth, me, movements
  components/          piezas de UI reutilizables
  lib/
    services/          acceso a datos (Prisma); siempre filtra por usuario
    session.ts         crear, verificar y borrar la sesión
    validation.ts      schemas de Zod compartidos entre cliente y API
    queries.ts         hooks de TanStack Query
    types.ts           tipos de las respuestas de la API
```

## Decisiones técnicas

**Backend en capas.** Las API routes solo validan la entrada, verifican la sesión y responden. La lógica de datos vive en `lib/services`. Así cada capa es simple y se puede probar o cambiar por separado.

**Sesión propia en lugar de NextAuth.** Para un único login con email y contraseña, NextAuth suma configuración que no aporta. La sesión es un JWT firmado (HS256) guardado en una cookie `httpOnly`, `sameSite=lax` y `secure` en producción. Con "Recordarme" dura 30 días; sin él, se borra al cerrar el navegador.

**Seguridad del login.**
- Las contraseñas se guardan hasheadas con bcrypt.
- El mensaje de error es el mismo si falla el email o la contraseña, para no revelar qué cuentas existen.
- Cuando el email no existe, igual se compara contra un hash, para que la respuesta tarde lo mismo.

**Autorización en dos niveles.** El `proxy` redirige rápido a `/login` a quien no tiene sesión. Aun así, cada API route vuelve a verificar la sesión, y todas las consultas filtran por el usuario logueado. Un movimiento de otro usuario responde 404, igual que uno inexistente, para no revelar que existe.

**Validación compartida.** El mismo schema de Zod valida el formulario de login en el navegador y el body en la API. Los parámetros de búsqueda y filtro también se validan, y un valor inválido responde 400 con un mensaje claro.

**Modelo de datos.**
- **Montos en centavos (`Int`)**, para evitar errores de redondeo con dinero.
- **Tipos y estados como `enum`**: tipo (`SUBSCRIPTION`, `CASH_IN`, `CASH_OUT`) y estado (`COMPLETED`, `PENDING`, `FAILED`).
- **El saldo es de la cuenta, no de la tarjeta.** GranaBank es una billetera: las tarjetas son de débito sobre esa cuenta, y la tarjeta muestra el saldo como en el diseño.
- **El vencimiento de la tarjeta se calcula** a partir de la fecha. Solo se guarda si está bloqueada, así no puede quedar una tarjeta vencida marcada como activa.
- **Búsqueda sin tildes ni mayúsculas.** Cada movimiento guarda una columna normalizada (`searchKey`), así "jose" encuentra "José Suárez" usando solo Prisma, sin extensiones de Postgres.

**Estados de la UI.** Todas las pantallas manejan carga (esqueletos), error (mensaje y botón "Reintentar") y vacío. Hay mensajes distintos para "no tenés movimientos" y "tu búsqueda no tiene resultados", con un atajo para limpiar los filtros. TanStack Query reintenta solo los errores de red o del servidor; un 401 manda al login.

**Búsqueda y filtros en la URL** (`/movimientos?type=CASH_IN&q=juan`). Sobreviven a una recarga, se pueden compartir y el botón "Volver" del detalle regresa al listado filtrado. La búsqueda espera 300 ms después de que se deja de escribir.

**Fidelidad al diseño.** Colores, tipografía (Poppins), medidas, sombras e íconos salen del Figma. El diseño es mobile, así que en pantallas grandes la app se muestra como una columna centrada en lugar de inventar un layout de escritorio.

**Detalle de movimiento.** No estaba en el Figma, así que lo diseñé con el mismo lenguaje visual: ícono y monto grandes, estado con color y una tarjeta con tipo, fecha, medio de pago, descripción y número de operación.

**Detalles de UX.**
- **Deslizar con el mouse:** el carrusel de tarjetas y los filtros se pueden arrastrar con el mouse, como con el dedo. El arrastre no activa el filtro sobre el que termina.
- **Confirmación al salir:** cerrar sesión pide confirmación con un `<dialog>` nativo, que se cierra con Esc o con un clic afuera.

**Accesibilidad.** HTML semántico, labels en todos los campos, `aria-current` en la navegación, `aria-pressed` en los filtros, foco visible y textos alternativos.

## Qué mejoraría con más tiempo

- **Tests:** unitarios para `services` y validaciones, y end-to-end con Playwright para el login, la búsqueda y el detalle.
- **Límite de intentos de login** por IP o email, para frenar ataques de fuerza bruta.
- **Paginación o scroll infinito** en Movimientos. Hoy trae todos, que alcanza para el volumen de ejemplo.
- **Agrupar movimientos por fecha** ("Hoy", "Ayer", "Esta semana").
- **Saldo calculado** a partir de los movimientos, o un historial de saldo, en lugar de un valor guardado.
- **Layout de escritorio** propio, si hubiera diseño.
- **Notificaciones reales** para la campana, que hoy solo muestra un aviso.
- **Búsqueda con índice** (`pg_trgm`) si el volumen de movimientos creciera mucho.
