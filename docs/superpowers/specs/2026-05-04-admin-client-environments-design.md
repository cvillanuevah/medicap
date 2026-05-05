# Ambientes Admin y Cliente — Diseño

## Resumen

Rediseño del panel de administración y creación de un ambiente de cuenta de cliente profesional para la tienda Soberana. Prototipo navegable: todas las pantallas existen con diseño profesional, interactividad mínima enfocada en demostrar flujo y diseño.

## Decisiones de diseño

| Aspecto | Decisión |
|---|---|
| Alcance | Admin + Cliente en paralelo |
| Nivel funcional | Prototipo navegable (UI completa, interactividad mínima) |
| Estilo admin | Light Elegant (fondo claro cálido, sidebar blanco, bordes sutiles) |
| Estilo cuenta cliente | Sidebar lateral dentro de las páginas de la tienda |
| Arquitectura admin | SPA — un solo `admin/index.html` con secciones JS |
| Arquitectura cliente | Páginas separadas que comparten header/footer de la tienda |

---

## Panel Admin (Light Elegant)

### Layout

- **Sidebar izquierdo (220px):** fondo blanco `#fff`, borde derecho `1px solid #e8e5df`. Logo "SOBERANA" en Playfair Display arriba. Items de navegación con íconos Font Awesome. Item activo: fondo `#faf5e6`, texto `#1a1a1a`, font-weight 600. Items inactivos: color `#888`.
- **Topbar:** fondo blanco, borde inferior sutil. Título de sección a la izquierda, avatar + nombre del admin a la derecha.
- **Área de contenido:** fondo `#f8f7f4`, padding 24px. Cards blancas con `border: 1px solid #e8e5df`, `border-radius: 12px`.
- **Responsive:** sidebar se oculta en mobile (<768px), aparece con botón hamburguesa como overlay.

### Secciones

**1. Dashboard**
- 4 stat cards en grid: Ventas Totales, Pedidos, Clientes, Productos. Cada una con ícono de color sobre fondo pastel.
- Gráfico de barras de ventas semanales (CSS puro, barras con gradiente dorado).
- Tabla "Últimos Pedidos" (5 más recientes): número, cliente, total, estado (badge).
- Lista "Top Productos" (5 primeros del catálogo): rank, imagen miniatura, nombre, precio.

**2. Productos**
- Tabla con columnas: imagen thumbnail (42px), nombre (bold), categoría, precio, estado (badge Disponible/Agotado).
- Buscador por nombre o categoría encima de la tabla.
- Solo lectura (no hay CRUD, es prototipo navegable).
- Datos vienen del array `PRODUCTS` en `products.js`.

**3. Pedidos**
- Tabla con columnas: número, cliente, total, estado (badge de color), fecha.
- Filtro por estado via `<select>` (Todos, Pendiente, Confirmado, Enviado, Entregado, Cancelado).
- Click en fila abre modal de detalle con:
  - Datos del cliente (nombre, email, teléfono).
  - Tabla de productos del pedido (nombre, cantidad, precio).
  - Timeline visual del estado: círculos conectados por línea, el paso actual resaltado en dorado.
  - Resumen: fecha, estado, total.
- Datos agregados desde `Auth.getAllUsers()`.

**4. Clientes**
- Tabla con columnas: nombre, email, cantidad de pedidos, fecha de registro.
- Buscador por nombre o email.
- Click en fila abre modal con resumen: datos de contacto, últimos pedidos.
- Solo muestra usuarios con `role !== 'admin'`.

**5. Configuración**
- Formulario visual con datos de la tienda: nombre, teléfono, email de contacto, dirección, links de redes sociales.
- Solo presentacional (los cambios no se persisten en localStorage).
- Sección informativa, demuestra que un admin real tendría acceso a estos controles.

---

## Ambiente del Cliente (Cuenta con Sidebar)

### Layout

- Header y footer idénticos al resto de la tienda.
- Contenedor centrado max-width ~1100px.
- **Sidebar izquierdo (220px):** avatar circular con inicial del usuario, nombre y email debajo, separador, links de navegación (ícono + texto). Item activo: fondo `#f0ede6`, font-weight 600. Botón "Cerrar Sesión" al fondo.
- **Área de contenido:** card blanca con `border: 1px solid #e8e5df`, `border-radius: 12px`, padding 24px.
- **Responsive:** en mobile (<768px) el sidebar se convierte en barra horizontal scrolleable tipo tabs arriba del contenido.

### Páginas

**1. Mi Perfil — `cuenta.html`**
- Página principal al entrar a la cuenta.
- Formulario editable: nombre, apellido, email (solo lectura), teléfono, dirección, ciudad, región.
- Botón "Guardar Cambios" que usa `Auth.updateProfile()`.
- Ya existe parcialmente, se mejora el diseño al nuevo sistema.

**2. Mis Pedidos — `cuenta-pedidos.html`**
- Lista de pedidos del usuario actual via `Auth.getCurrentUser()`.
- Cada pedido muestra: número, fecha, total, estado (badge de color).
- Click expande detalle inline: productos con imagen miniatura, cantidad, precio.
- Timeline visual del estado (Confirmado → Enviado → Entregado): círculos conectados, paso actual en dorado.
- Empty state elegante si no hay pedidos.

**3. Lista de Deseos — `cuenta-deseos.html`**
- Grid de productos guardados (3 columnas desktop, 2 tablet, 1 mobile).
- Cada card: imagen del producto, nombre, precio, botón "Agregar al Carrito", botón "Quitar".
- Nuevo módulo `js/wishlist.js` (IIFE):
  - Almacena array de product IDs en localStorage, vinculado al user ID.
  - API: `Wishlist.add(productId)`, `Wishlist.remove(productId)`, `Wishlist.has(productId)`, `Wishlist.getAll()`.
- Botón corazón en las páginas de producto/colección para agregar a deseos.
- Empty state si la lista está vacía.

**4. Mis Direcciones — `cuenta-direcciones.html`**
- Tarjetas con direcciones guardadas: etiqueta (Casa, Trabajo), dirección, ciudad, región, teléfono.
- Badge "Principal" en la dirección por defecto.
- Botón "Agregar Dirección" muestra formulario inline. Máximo 3 direcciones.
- Nuevo módulo `js/addresses.js` (IIFE):
  - Almacena array de objetos dirección en localStorage, vinculado al user ID.
  - API: `Addresses.add(data)`, `Addresses.remove(id)`, `Addresses.setDefault(id)`, `Addresses.getAll()`.
- Empty state si no hay direcciones.

**5. Configuración — `cuenta-config.html`**
- Cambiar contraseña: campos actual, nueva, confirmar nueva.
- Preferencias de notificación: checkboxes visuales (email de pedidos, novedades, ofertas).
- Botón "Eliminar Cuenta" en rojo al final: al hacer clic muestra modal de confirmación (solo visual).

### Protección de rutas

Si el usuario no está logueado y visita cualquier página `cuenta-*.html`, se redirige a `login.html`.

---

## Sistema de diseño compartido

### Paleta de colores

| Variable | Valor | Uso |
|---|---|---|
| Texto principal | `#1a1a1a` | Títulos, texto body |
| Dorado | `#c9a84c` | Acentos, items activos, highlights |
| Fondo tienda | `#faf9f7` | Background general tienda |
| Fondo admin | `#f8f7f4` | Background área de contenido admin |
| Bordes | `#e8e5df` | Bordes de cards, separadores, inputs |
| Texto secundario | `#888` | Labels, items inactivos, metadata |
| Hover dorado suave | `#faf5e6` | Item de nav activo (admin), hover suave |
| Active cuenta | `#f0ede6` | Item de nav activo (cuenta cliente) |

### Badges de estado

| Estado | Background | Color texto |
|---|---|---|
| Pendiente | `#fef3c7` | `#92400e` |
| Confirmado | `#ecfdf5` | `#065f46` |
| Enviado | `#eff6ff` | `#1e40af` |
| Entregado | `#ecfdf5` | `#065f46` |
| Cancelado | `#fef2f2` | `#991b1b` |

### Componentes reutilizados

- **Tablas:** headers uppercase 0.78rem, color `#888`, border-bottom 2px. Celdas con padding 10px 12px, hover `#faf9f7`.
- **Botones:** primario (background `#1a1a1a`, hover `#c9a84c`), outline (borde `#e8e5df`), danger (background `#ef4444`), sm (padding reducido).
- **Inputs:** border `#e8e5df`, border-radius 6px, focus border `#1a1a1a`. Labels uppercase 0.8rem, font-weight 600.
- **Cards:** background `#fff`, border `1px solid #e8e5df`, border-radius 12px, padding 20px.
- **Empty states:** ícono grande (2rem) con opacidad 0.4, texto descriptivo centrado.
- **Modals:** overlay oscuro, card blanca max-width 560px, header con título y botón cerrar, body con padding 22px.
- **Toasts:** esquina inferior derecha, border-radius 8px, verde éxito / rojo error, desaparecen en 3s.

### Tipografía

- **Playfair Display:** logo "SOBERANA", títulos de marca.
- **Montserrat:** todo lo demás (nav, body, labels, botones, tablas).

### Archivos

**CSS:**
- `css/styles.css` — estilos de la tienda + estilos nuevos de cuenta del cliente.
- `admin/css/admin.css` — se reescribe completamente a Light Elegant.

**JS existentes (se modifican):**
- `js/auth.js` — sin cambios en API pública, compartido entre tienda y admin.
- `admin/js/admin.js` — se reescribe con nuevas secciones y estilos.

**JS nuevos:**
- `js/wishlist.js` — módulo IIFE para lista de deseos (localStorage por usuario).
- `js/addresses.js` — módulo IIFE para direcciones (localStorage por usuario).

**HTML existentes (se modifican):**
- `admin/index.html` — se actualiza con nueva estructura Light Elegant y sección Configuración.
- `admin/login.html` — se ajusta estilo a Light Elegant.
- `cuenta.html` — se rediseña con sidebar y nuevo layout.
- `login.html` — sin cambios funcionales.

**HTML nuevos:**
- `cuenta-pedidos.html` — página de historial de pedidos del cliente.
- `cuenta-deseos.html` — página de lista de deseos.
- `cuenta-direcciones.html` — página de gestión de direcciones.
- `cuenta-config.html` — página de configuración y contraseña.

### Navegación entre ambientes

- **Tienda → Cuenta:** ícono de usuario en header lleva a `cuenta.html` (logueado) o `login.html` (no logueado).
- **Cuenta → Tienda:** link "Ir a Tienda" visible en sidebar de cuenta + header de la tienda normal.
- **Admin:** acceso solo via `admin/login.html` (URL directa, sin link público). Link "Ir a Tienda" en sidebar del admin.
