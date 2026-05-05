# Admin & Client Environments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el panel admin a estilo Light Elegant y crear un ambiente de cuenta de cliente profesional con sidebar para la tienda Soberana.

**Architecture:** Admin es SPA en `admin/index.html` con secciones JS. Cliente usa páginas separadas (`cuenta.html`, `cuenta-pedidos.html`, etc.) que comparten header/footer de la tienda. Dos nuevos módulos IIFE (`wishlist.js`, `addresses.js`) manejan datos en localStorage vinculados al usuario. Sin backend, todo en localStorage.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JS (IIFE modules), Font Awesome 6, Google Fonts (Montserrat + Playfair Display)

---

## File Map

**Files to create:**
- `js/wishlist.js` — módulo IIFE para lista de deseos (localStorage por usuario)
- `js/addresses.js` — módulo IIFE para libreta de direcciones (localStorage por usuario)
- `cuenta-pedidos.html` — página de historial de pedidos del cliente
- `cuenta-deseos.html` — página de lista de deseos del cliente
- `cuenta-direcciones.html` — página de direcciones del cliente
- `cuenta-config.html` — página de configuración del cliente

**Files to modify:**
- `admin/css/admin.css` — reescritura completa a Light Elegant
- `admin/index.html` — actualizar estructura HTML a Light Elegant, agregar sección Configuración
- `admin/login.html` — ajustar estilos a Light Elegant
- `admin/js/admin.js` — reescribir con nuevas secciones (config, cliente modal, timeline, gráfico barras)
- `css/styles.css` — agregar estilos para cuenta cliente mejorada (sidebar, timeline, wishlist grid, addresses cards, responsive)
- `cuenta.html` — rediseñar con sidebar mejorado y nuevos links de navegación

**Files unchanged:**
- `js/auth.js` — API pública sin cambios
- `js/cart.js` — sin cambios
- `js/products.js` — sin cambios
- `js/main.js` — sin cambios
- `login.html` — sin cambios

---

## Task 1: Admin CSS — Reescribir a Light Elegant

**Files:**
- Modify: `admin/css/admin.css` (reescritura completa)

- [ ] **Step 1: Reescribir admin.css con el nuevo sistema Light Elegant**

Reemplazar todo el contenido de `admin/css/admin.css` con:

```css
:root {
  --adm-bg: #f8f7f4;
  --adm-card: #ffffff;
  --adm-sidebar: #ffffff;
  --adm-sidebar-border: #e8e5df;
  --adm-sidebar-active: #faf5e6;
  --adm-border: #e8e5df;
  --adm-text: #1a1a1a;
  --adm-text-light: #888;
  --adm-gold: #c9a84c;
  --adm-gold-dark: #b08f3a;
  --adm-success: #10b981;
  --adm-warning: #f59e0b;
  --adm-danger: #ef4444;
  --adm-info: #3b82f6;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--adm-bg);
  color: var(--adm-text);
  line-height: 1.5;
}

/* === LOGIN === */
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--adm-bg);
}

.admin-login { width: 100%; padding: 1rem; }

.admin-login__card {
  background: var(--adm-card);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  margin: 0 auto;
  border: 1px solid var(--adm-border);
}

.admin-login__header { text-align: center; margin-bottom: 2rem; }

.admin-login__logo {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 3px;
  display: block;
  margin-bottom: 6px;
}

.admin-login__header p { color: var(--adm-text-light); font-size: 0.92rem; }

.admin-login__card .form-group { margin-bottom: 1.25rem; }
.admin-login__card .form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.admin-input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--adm-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.93rem;
  transition: border-color 0.2s;
  background: var(--adm-card);
}
.admin-input:focus { outline: none; border-color: var(--adm-text); }

.admin-error {
  color: var(--adm-danger);
  font-size: 0.85rem;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-btn--primary { background: var(--adm-text); color: #fff; }
.admin-btn--primary:hover { background: var(--adm-gold); }
.admin-btn--full { width: 100%; padding: 13px; }
.admin-btn--sm { padding: 6px 12px; font-size: 0.8rem; }
.admin-btn--outline { background: transparent; border: 1px solid var(--adm-border); color: var(--adm-text); }
.admin-btn--danger { background: var(--adm-danger); color: #fff; }

.admin-login__back {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: var(--adm-text-light);
  text-decoration: none;
  font-size: 0.88rem;
}
.admin-login__back:hover { color: var(--adm-text); }

/* === LAYOUT === */
.admin-body { display: flex; min-height: 100vh; }

.admin-sidebar {
  width: 220px;
  background: var(--adm-sidebar);
  border-right: 1px solid var(--adm-sidebar-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  transition: transform 0.3s;
}

.admin-sidebar__header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--adm-border);
}

.admin-sidebar__logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--adm-text);
}

.admin-sidebar__nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-sidebar__footer {
  padding: 12px;
  border-top: 1px solid var(--adm-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: var(--adm-text-light);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.15s;
}
.admin-nav-item:hover { color: var(--adm-text); background: #f5f3ef; }
.admin-nav-item.active {
  color: var(--adm-text);
  background: var(--adm-sidebar-active);
  font-weight: 600;
}
.admin-nav-item i { width: 18px; text-align: center; }

.admin-main { flex: 1; margin-left: 220px; }

.admin-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: var(--adm-card);
  border-bottom: 1px solid var(--adm-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin-topbar h2 { flex: 1; font-size: 1.15rem; font-weight: 600; }

.admin-topbar__right { display: flex; align-items: center; gap: 10px; }
.admin-topbar__right span { font-size: 0.88rem; color: var(--adm-text-light); }

.admin-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--adm-bg);
  border: 1px solid var(--adm-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; color: var(--adm-text-light);
}

.admin-sidebar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--adm-text);
}

.admin-content { padding: 24px; }

/* === SECTIONS === */
.admin-section { display: none; }
.admin-section.active { display: block; }

.admin-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}
.admin-section__header h3 { font-size: 1.1rem; font-weight: 600; }

/* === STATS === */
.admin-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.admin-stat-card {
  background: var(--adm-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--adm-border);
}
.admin-stat-card__icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  margin-bottom: 12px;
}
.admin-stat-card--sales .admin-stat-card__icon { background: #ecfdf5; color: var(--adm-success); }
.admin-stat-card--orders .admin-stat-card__icon { background: #eff6ff; color: var(--adm-info); }
.admin-stat-card--customers .admin-stat-card__icon { background: #fef3c7; color: var(--adm-warning); }
.admin-stat-card--products .admin-stat-card__icon { background: #f5f3ef; color: var(--adm-gold); }
.admin-stat-card__value { font-size: 1.5rem; font-weight: 700; margin-bottom: 2px; }
.admin-stat-card__label { font-size: 0.8rem; color: var(--adm-text-light); }

/* === CARDS === */
.admin-card {
  background: var(--adm-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--adm-border);
  margin-bottom: 18px;
}
.admin-card__title { font-size: 0.95rem; font-weight: 600; margin-bottom: 16px; }

.admin-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

/* === TABLES === */
.admin-table-controls { margin-bottom: 14px; }
.admin-table-controls .admin-input { max-width: 300px; }
.admin-table-wrapper { overflow-x: auto; }

.admin-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.admin-table th {
  text-align: left;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--adm-text-light);
  border-bottom: 2px solid var(--adm-border);
}
.admin-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.admin-table tr:hover { background: #faf9f7; }
.admin-table-img { width: 42px; height: 42px; object-fit: cover; border-radius: 6px; }

/* === BADGES === */
.admin-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.admin-badge--confirmed, .admin-badge--delivered { background: #ecfdf5; color: #065f46; }
.admin-badge--pending { background: #fef3c7; color: #92400e; }
.admin-badge--shipped { background: #eff6ff; color: #1e40af; }
.admin-badge--cancelled { background: #fef2f2; color: #991b1b; }
.admin-badge--available { background: #ecfdf5; color: #065f46; }
.admin-badge--sold-out { background: #fef2f2; color: #991b1b; }

/* === SELECT === */
.admin-select {
  padding: 8px 12px;
  border: 1px solid var(--adm-border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.85rem;
  background: var(--adm-card);
}

/* === TOP PRODUCTS === */
.top-product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}
.top-product-item:last-child { border-bottom: none; }
.top-product-item__rank {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: var(--adm-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  flex-shrink: 0;
}
.top-product-item__img {
  width: 36px; height: 36px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.top-product-item__name { font-size: 0.85rem; font-weight: 500; }
.top-product-item__sales { font-size: 0.78rem; color: var(--adm-text-light); }

/* === CHART (CSS bars) === */
.admin-chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding-top: 10px;
}
.admin-chart-bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, var(--adm-gold), #e0c97a);
  min-height: 8px;
  position: relative;
}
.admin-chart-bar__label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--adm-text-light);
  white-space: nowrap;
}

/* === ORDER TIMELINE === */
.order-timeline {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 0;
}
.order-timeline__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}
.order-timeline__dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--adm-bg);
  border: 2px solid var(--adm-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem;
  color: var(--adm-text-light);
  z-index: 1;
}
.order-timeline__step.active .order-timeline__dot {
  background: var(--adm-gold);
  border-color: var(--adm-gold);
  color: #fff;
}
.order-timeline__step.completed .order-timeline__dot {
  background: var(--adm-success);
  border-color: var(--adm-success);
  color: #fff;
}
.order-timeline__label {
  font-size: 0.7rem;
  color: var(--adm-text-light);
  margin-top: 6px;
  text-align: center;
}
.order-timeline__step.active .order-timeline__label,
.order-timeline__step.completed .order-timeline__label {
  color: var(--adm-text);
  font-weight: 600;
}
.order-timeline__line {
  flex: 1;
  height: 2px;
  background: var(--adm-border);
  margin: 0 -4px;
  align-self: flex-start;
  margin-top: 13px;
}
.order-timeline__line.completed { background: var(--adm-success); }

/* === EMPTY STATE === */
.admin-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--adm-text-light);
}
.admin-empty-state i {
  font-size: 2rem;
  margin-bottom: 10px;
  display: block;
  opacity: 0.4;
}
.admin-empty-state p { font-size: 0.9rem; }

/* === MODAL === */
.admin-modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin-modal {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  border: 1px solid var(--adm-border);
}
.admin-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--adm-border);
}
.admin-modal__header h3 { font-size: 1rem; font-weight: 600; }
.admin-modal__close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--adm-text-light);
  padding: 4px;
  border-radius: 6px;
}
.admin-modal__close:hover { background: var(--adm-bg); }
.admin-modal__body { padding: 22px; }

.order-detail-section { margin-bottom: 20px; }
.order-detail-section h4 {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--adm-text-light);
  margin-bottom: 10px;
}
.order-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.88rem;
  border-bottom: 1px solid #f8f8f8;
}

/* === CONFIG FORM === */
.admin-form-group { margin-bottom: 16px; }
.admin-form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  color: var(--adm-text-light);
}
.admin-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* === TOAST === */
.admin-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #fff;
  z-index: 300;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.admin-toast--success { background: var(--adm-success); }
.admin-toast--error { background: var(--adm-danger); }

/* === SIDEBAR OVERLAY (mobile) === */
.admin-sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 90;
}
.admin-sidebar-overlay.active { display: block; }

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .admin-stats { grid-template-columns: repeat(2, 1fr); }
  .admin-grid-2 { grid-template-columns: 1fr; }
  .admin-form-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .admin-sidebar { transform: translateX(-100%); }
  .admin-sidebar--open { transform: translateX(0); }
  .admin-main { margin-left: 0; }
  .admin-sidebar-toggle { display: block; }
  .admin-stats { grid-template-columns: 1fr 1fr; }
  .admin-content { padding: 16px; }
  .admin-topbar { padding: 12px 16px; }
}

@media (max-width: 480px) {
  .admin-stats { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Verify the file was written**

Run: `cat -n "admin/css/admin.css" | head -5`

Expected: Shows `:root {` with new `--adm-` variables.

- [ ] **Step 3: Commit**

```bash
git add admin/css/admin.css
git commit -m "style(admin): rewrite CSS to Light Elegant theme"
```

---

## Task 2: Admin HTML — Update to Light Elegant + Add Config Section

**Files:**
- Modify: `admin/index.html`
- Modify: `admin/login.html`

- [ ] **Step 1: Rewrite admin/index.html with Light Elegant structure**

Replace the full content of `admin/index.html` with:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel Admin | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body class="admin-body">

  <!-- SIDEBAR -->
  <aside class="admin-sidebar" id="sidebar">
    <div class="admin-sidebar__header">
      <span class="admin-sidebar__logo">Soberana</span>
    </div>
    <nav class="admin-sidebar__nav">
      <a href="#" class="admin-nav-item active" data-section="dashboard"><i class="fas fa-chart-line"></i> Dashboard</a>
      <a href="#" class="admin-nav-item" data-section="products"><i class="fas fa-gem"></i> Productos</a>
      <a href="#" class="admin-nav-item" data-section="orders"><i class="fas fa-shopping-bag"></i> Pedidos</a>
      <a href="#" class="admin-nav-item" data-section="customers"><i class="fas fa-users"></i> Clientes</a>
      <a href="#" class="admin-nav-item" data-section="settings"><i class="fas fa-cog"></i> Configuraci&oacute;n</a>
    </nav>
    <div class="admin-sidebar__footer">
      <a href="../index.html" class="admin-nav-item"><i class="fas fa-store"></i> Ir a Tienda</a>
      <a href="#" class="admin-nav-item" id="adminLogout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesi&oacute;n</a>
    </div>
  </aside>

  <!-- MAIN -->
  <div class="admin-main">
    <header class="admin-topbar">
      <button class="admin-sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
      <h2 id="sectionTitle">Dashboard</h2>
      <div class="admin-topbar__right">
        <span id="adminName">Admin</span>
        <div class="admin-avatar"><i class="fas fa-user"></i></div>
      </div>
    </header>

    <div class="admin-content">

      <!-- DASHBOARD -->
      <section id="section-dashboard" class="admin-section active">
        <div class="admin-stats" id="statsGrid"></div>
        <div class="admin-grid-2">
          <div class="admin-card">
            <h3 class="admin-card__title">&Uacute;ltimos Pedidos</h3>
            <div id="recentOrdersTable"></div>
          </div>
          <div class="admin-card">
            <h3 class="admin-card__title">Productos M&aacute;s Vendidos</h3>
            <div id="topProductsList"></div>
          </div>
        </div>
        <div class="admin-card">
          <h3 class="admin-card__title">Ventas Semanales</h3>
          <div id="salesChart"></div>
        </div>
      </section>

      <!-- PRODUCTS -->
      <section id="section-products" class="admin-section">
        <div class="admin-section__header">
          <h3>Gesti&oacute;n de Productos</h3>
        </div>
        <div class="admin-card">
          <div class="admin-table-controls">
            <input type="text" id="productSearch" placeholder="Buscar producto..." class="admin-input">
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead><tr><th>Imagen</th><th>Nombre</th><th>Categor&iacute;a</th><th>Precio</th><th>Estado</th></tr></thead>
              <tbody id="productsTableBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ORDERS -->
      <section id="section-orders" class="admin-section">
        <div class="admin-section__header">
          <h3>Gesti&oacute;n de Pedidos</h3>
          <select id="orderStatusFilter" class="admin-select">
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div class="admin-card">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody id="ordersTableBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- CUSTOMERS -->
      <section id="section-customers" class="admin-section">
        <div class="admin-section__header">
          <h3>Clientes Registrados</h3>
        </div>
        <div class="admin-card">
          <div class="admin-table-controls">
            <input type="text" id="customerSearch" placeholder="Buscar cliente..." class="admin-input">
          </div>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead><tr><th>Nombre</th><th>Email</th><th>Pedidos</th><th>Fecha Registro</th></tr></thead>
              <tbody id="customersTableBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SETTINGS -->
      <section id="section-settings" class="admin-section">
        <div class="admin-section__header">
          <h3>Configuraci&oacute;n de la Tienda</h3>
        </div>
        <div class="admin-card">
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="settingName">Nombre de la Tienda</label>
              <input type="text" id="settingName" class="admin-input" value="Soberana" disabled>
            </div>
            <div class="admin-form-group">
              <label for="settingPhone">Tel&eacute;fono</label>
              <input type="text" id="settingPhone" class="admin-input" value="+569 48061416" disabled>
            </div>
          </div>
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="settingEmail">Email de Contacto</label>
              <input type="email" id="settingEmail" class="admin-input" value="joyas@soberana.cl" disabled>
            </div>
            <div class="admin-form-group">
              <label for="settingAddress">Direcci&oacute;n</label>
              <input type="text" id="settingAddress" class="admin-input" value="Santiago, Chile" disabled>
            </div>
          </div>
          <div class="admin-form-group">
            <label>Redes Sociales</label>
            <div class="admin-form-row" style="margin-top:6px;">
              <div class="admin-form-group" style="margin-bottom:0;">
                <input type="text" class="admin-input" value="@soberana_joyas" disabled placeholder="Instagram">
              </div>
              <div class="admin-form-group" style="margin-bottom:0;">
                <input type="text" class="admin-input" value="facebook.com/soberanajoyas" disabled placeholder="Facebook">
              </div>
            </div>
          </div>
          <p style="color:var(--adm-text-light);font-size:0.82rem;margin-top:12px;">
            <i class="fas fa-info-circle"></i> La configuraci&oacute;n es de solo lectura en esta versi&oacute;n.
          </p>
        </div>
      </section>

    </div>
  </div>

  <!-- ORDER DETAIL MODAL -->
  <div class="admin-modal-overlay" id="orderModalOverlay">
    <div class="admin-modal">
      <div class="admin-modal__header">
        <h3 id="orderModalTitle">Detalle del Pedido</h3>
        <button class="admin-modal__close" onclick="closeOrderModal()"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="admin-modal__body" id="orderModalBody"></div>
    </div>
  </div>

  <!-- CUSTOMER DETAIL MODAL -->
  <div class="admin-modal-overlay" id="customerModalOverlay">
    <div class="admin-modal">
      <div class="admin-modal__header">
        <h3 id="customerModalTitle">Detalle del Cliente</h3>
        <button class="admin-modal__close" onclick="closeCustomerModal()"><i class="fas fa-xmark"></i></button>
      </div>
      <div class="admin-modal__body" id="customerModalBody"></div>
    </div>
  </div>

  <div id="adminToast" class="admin-toast" style="display:none;"></div>

  <script src="../js/products.js"></script>
  <script src="../js/auth.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>
```

- [ ] **Step 2: Update admin/login.html to Light Elegant**

The login.html structure is fine. Only the CSS variables changed (from dark background to light), so `admin-login-page` now shows a light bg instead of dark gradient. The HTML stays the same — the CSS change in Task 1 handles the visual update.

Verify no HTML changes needed:

Run: `grep "admin-login-page" admin/login.html`

Expected: `<body class="admin-login-page">`

- [ ] **Step 3: Commit**

```bash
git add admin/index.html admin/login.html
git commit -m "feat(admin): update HTML to Light Elegant with settings section"
```

---

## Task 3: Admin JS — Rewrite with new sections

**Files:**
- Modify: `admin/js/admin.js`

- [ ] **Step 1: Rewrite admin/js/admin.js**

Replace the full content of `admin/js/admin.js` with:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  if (!Auth.isAdmin()) {
    window.location.href = 'login.html';
    return;
  }

  var session = Auth.getSession();
  var adminNameEl = document.getElementById('adminName');
  if (adminNameEl) adminNameEl.textContent = session.firstName || 'Admin';

  initSidebar();
  initNavigation();
  initLogout();
  initOrderStatusFilter();
  initProductSearch();
  initCustomerSearch();
  loadDashboard();
});

// --- Sidebar ---
function initSidebar() {
  var toggle = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;
  var overlay = document.createElement('div');
  overlay.className = 'admin-sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  document.body.appendChild(overlay);
  toggle.addEventListener('click', function() {
    sidebar.classList.toggle('admin-sidebar--open');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', function() {
    sidebar.classList.remove('admin-sidebar--open');
    overlay.classList.remove('active');
  });
}

// --- Navigation ---
function initNavigation() {
  document.querySelectorAll('.admin-nav-item[data-section]').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToSection(this.getAttribute('data-section'));
    });
  });
}

function navigateToSection(name) {
  document.querySelectorAll('.admin-nav-item[data-section]').forEach(function(i) {
    i.classList.toggle('active', i.getAttribute('data-section') === name);
  });
  document.querySelectorAll('.admin-section').forEach(function(s) { s.classList.remove('active'); });
  var target = document.getElementById('section-' + name);
  if (target) target.classList.add('active');
  var titles = {
    dashboard: 'Dashboard',
    products: 'Productos',
    orders: 'Pedidos',
    customers: 'Clientes',
    settings: 'Configuración'
  };
  document.getElementById('sectionTitle').textContent = titles[name] || name;
  switch (name) {
    case 'dashboard': loadDashboard(); break;
    case 'products': loadProducts(); break;
    case 'orders': loadOrders(); break;
    case 'customers': loadCustomers(); break;
  }
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('admin-sidebar--open');
  if (overlay) overlay.classList.remove('active');
}

// --- Logout ---
function initLogout() {
  var btn = document.getElementById('adminLogout');
  if (btn) btn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('soberana_session');
    window.location.href = 'login.html';
  });
}

// --- Helpers ---
function fmtPrice(n) { return '$' + Number(n).toLocaleString('es-CL'); }
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
function escHtml(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
var STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};
var STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];
function statusLabel(s) { return STATUS_LABELS[s] || s || 'Pendiente'; }
function statusClass(s) { return 'admin-badge admin-badge--' + (s || 'pending'); }

function getAllOrders() {
  var users = Auth.getAllUsers();
  var orders = [];
  users.forEach(function(u) {
    if (!u.orders) return;
    u.orders.forEach(function(o) {
      orders.push({
        number: o.number,
        date: o.date,
        total: o.total,
        status: o.status || 'pending',
        items: o.items || [],
        customerName: u.firstName + ' ' + u.lastName,
        customerEmail: u.email,
        customerPhone: u.phone || '',
        userId: u.id
      });
    });
  });
  orders.sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
  return orders;
}

function showToast(msg, type) {
  var t = document.getElementById('adminToast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'admin-toast admin-toast--' + (type || 'success');
  t.style.display = 'block';
  setTimeout(function() { t.style.display = 'none'; }, 3000);
}

// --- Dashboard ---
function loadDashboard() {
  var users = Auth.getAllUsers();
  var customers = users.filter(function(u) { return u.role !== 'admin'; });
  var orders = getAllOrders();
  var totalSales = 0;
  orders.forEach(function(o) {
    var num = typeof o.total === 'string' ? parseInt(o.total.replace(/[^0-9]/g, '')) : (o.total || 0);
    totalSales += num;
  });

  var grid = document.getElementById('statsGrid');
  grid.innerHTML =
    '<div class="admin-stat-card admin-stat-card--sales"><div class="admin-stat-card__icon"><i class="fas fa-dollar-sign"></i></div><div class="admin-stat-card__value">' + fmtPrice(totalSales) + '</div><div class="admin-stat-card__label">Ventas Totales</div></div>' +
    '<div class="admin-stat-card admin-stat-card--orders"><div class="admin-stat-card__icon"><i class="fas fa-shopping-bag"></i></div><div class="admin-stat-card__value">' + orders.length + '</div><div class="admin-stat-card__label">Pedidos</div></div>' +
    '<div class="admin-stat-card admin-stat-card--customers"><div class="admin-stat-card__icon"><i class="fas fa-users"></i></div><div class="admin-stat-card__value">' + customers.length + '</div><div class="admin-stat-card__label">Clientes</div></div>' +
    '<div class="admin-stat-card admin-stat-card--products"><div class="admin-stat-card__icon"><i class="fas fa-gem"></i></div><div class="admin-stat-card__value">' + (typeof PRODUCTS !== 'undefined' ? PRODUCTS.length : 0) + '</div><div class="admin-stat-card__label">Productos</div></div>';

  // Recent orders
  var recent = document.getElementById('recentOrdersTable');
  if (orders.length === 0) {
    recent.innerHTML = '<div class="admin-empty-state"><i class="fas fa-shopping-bag"></i><p>No hay pedidos aún</p></div>';
  } else {
    var h = '<table class="admin-table"><thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead><tbody>';
    orders.slice(0, 5).forEach(function(o) {
      h += '<tr><td>' + (o.number || '-') + '</td><td>' + escHtml(o.customerName) + '</td><td>' + escHtml(o.total) + '</td><td><span class="' + statusClass(o.status) + '">' + statusLabel(o.status) + '</span></td></tr>';
    });
    h += '</tbody></table>';
    recent.innerHTML = h;
  }

  // Top products
  var top = document.getElementById('topProductsList');
  if (typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
    var h2 = '';
    PRODUCTS.slice(0, 5).forEach(function(p, i) {
      h2 += '<div class="top-product-item"><div class="top-product-item__rank">' + (i + 1) + '</div><img src="' + escHtml(p.images[0]) + '" alt="" class="top-product-item__img" onerror="this.style.display=\'none\'"><div class="top-product-item__info"><div class="top-product-item__name">' + escHtml(p.name) + '</div><div class="top-product-item__sales">' + fmtPrice(p.price) + '</div></div></div>';
    });
    top.innerHTML = h2;
  } else {
    top.innerHTML = '<div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div>';
  }

  // Sales chart (CSS bars with sample data)
  var chart = document.getElementById('salesChart');
  var days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  var values = [65, 80, 45, 90, 70, 100, 55];
  var maxVal = Math.max.apply(null, values);
  var barsHtml = '<div class="admin-chart-bars">';
  days.forEach(function(day, i) {
    var pct = Math.round((values[i] / maxVal) * 100);
    barsHtml += '<div class="admin-chart-bar" style="height:' + pct + '%"><span class="admin-chart-bar__label">' + day + '</span></div>';
  });
  barsHtml += '</div>';
  chart.innerHTML = barsHtml;
}

// --- Products ---
var productsCache = [];
function loadProducts() {
  productsCache = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
  renderProducts(productsCache);
}

function renderProducts(list) {
  var tbody = document.getElementById('productsTableBody');
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div></td></tr>';
    return;
  }
  var h = '';
  list.forEach(function(p) {
    var isSoldOut = p.status === 'sold-out' || p.status === 'agotado';
    var badge = isSoldOut
      ? '<span class="admin-badge admin-badge--sold-out">Agotado</span>'
      : '<span class="admin-badge admin-badge--available">Disponible</span>';
    h += '<tr><td><img src="' + escHtml(p.images[0]) + '" alt="" class="admin-table-img" onerror="this.style.display=\'none\'"></td><td><strong>' + escHtml(p.name) + '</strong></td><td>' + escHtml(p.category) + '</td><td>' + fmtPrice(p.price) + '</td><td>' + badge + '</td></tr>';
  });
  tbody.innerHTML = h;
}

function initProductSearch() {
  var input = document.getElementById('productSearch');
  if (!input) return;
  input.addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    if (!q) { renderProducts(productsCache); return; }
    renderProducts(productsCache.filter(function(p) {
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }));
  });
}

// --- Orders ---
function loadOrders(status) {
  if (status === undefined) {
    var f = document.getElementById('orderStatusFilter');
    status = f ? f.value : '';
  }
  var orders = getAllOrders();
  if (status) orders = orders.filter(function(o) { return o.status === status; });
  renderOrders(orders);
}

function renderOrders(orders) {
  var tbody = document.getElementById('ordersTableBody');
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="admin-empty-state"><i class="fas fa-shopping-bag"></i><p>No hay pedidos</p></div></td></tr>';
    return;
  }
  var h = '';
  orders.forEach(function(o, i) {
    h += '<tr style="cursor:pointer" onclick="viewOrderDetail(' + i + ')"><td><strong>#' + (o.number || '-') + '</strong></td><td>' + escHtml(o.customerName) + '</td><td>' + escHtml(o.total) + '</td><td><span class="' + statusClass(o.status) + '">' + statusLabel(o.status) + '</span></td><td>' + fmtDate(o.date) + '</td></tr>';
  });
  tbody.innerHTML = h;
}

function initOrderStatusFilter() {
  var f = document.getElementById('orderStatusFilter');
  if (f) f.addEventListener('change', function() { loadOrders(this.value); });
}

function buildTimeline(currentStatus) {
  var html = '<div class="order-timeline">';
  var reached = true;
  for (var i = 0; i < STATUS_ORDER.length; i++) {
    var step = STATUS_ORDER[i];
    var isCurrent = step === currentStatus;
    var cls = '';
    if (reached && !isCurrent) cls = 'completed';
    if (isCurrent) { cls = 'active'; reached = false; }
    if (!cls && !reached) cls = '';

    if (i > 0) {
      var lineCls = (cls === 'completed') ? 'completed' : '';
      html += '<div class="order-timeline__line ' + lineCls + '"></div>';
    }
    html += '<div class="order-timeline__step ' + cls + '"><div class="order-timeline__dot"><i class="fas fa-check"></i></div><div class="order-timeline__label">' + statusLabel(step) + '</div></div>';
  }
  html += '</div>';
  return html;
}

function viewOrderDetail(idx) {
  var orders = getAllOrders();
  var f = document.getElementById('orderStatusFilter');
  var status = f ? f.value : '';
  if (status) orders = orders.filter(function(o) { return o.status === status; });
  var o = orders[idx];
  if (!o) return;
  var overlay = document.getElementById('orderModalOverlay');
  document.getElementById('orderModalTitle').textContent = 'Pedido #' + (o.number || '-');
  var body = document.getElementById('orderModalBody');

  var itemsHtml = '';
  if (o.items && o.items.length > 0) {
    itemsHtml = '<table class="admin-table" style="margin-top:8px"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead><tbody>';
    o.items.forEach(function(it) {
      itemsHtml += '<tr><td>' + escHtml(it.name) + '</td><td>' + (it.qty || it.quantity || 1) + '</td><td>' + escHtml(it.price || '') + '</td></tr>';
    });
    itemsHtml += '</tbody></table>';
  }

  var timelineHtml = '';
  if (o.status !== 'cancelled') {
    timelineHtml = '<div class="order-detail-section"><h4>Seguimiento</h4>' + buildTimeline(o.status) + '</div>';
  }

  body.innerHTML =
    '<div class="order-detail-section"><h4>Cliente</h4><div class="order-detail-row"><span>Nombre</span><span>' + escHtml(o.customerName) + '</span></div><div class="order-detail-row"><span>Email</span><span>' + escHtml(o.customerEmail) + '</span></div>' + (o.customerPhone ? '<div class="order-detail-row"><span>Teléfono</span><span>' + escHtml(o.customerPhone) + '</span></div>' : '') + '</div>' +
    timelineHtml +
    '<div class="order-detail-section"><h4>Productos</h4>' + (itemsHtml || '<p style="color:var(--adm-text-light);font-size:0.9rem;">Sin detalle de productos</p>') + '</div>' +
    '<div class="order-detail-section"><h4>Resumen</h4><div class="order-detail-row"><span>Fecha</span><span>' + fmtDate(o.date) + '</span></div><div class="order-detail-row"><span>Estado</span><span class="' + statusClass(o.status) + '">' + statusLabel(o.status) + '</span></div><div class="order-detail-row"><span><strong>Total</strong></span><span><strong>' + escHtml(o.total) + '</strong></span></div></div>';

  overlay.style.display = 'flex';
}

function closeOrderModal() {
  document.getElementById('orderModalOverlay').style.display = 'none';
}

// --- Customers ---
var customersCache = [];
function loadCustomers() {
  customersCache = Auth.getAllUsers().filter(function(u) { return u.role !== 'admin'; });
  renderCustomers(customersCache);
}

function renderCustomers(users) {
  var tbody = document.getElementById('customersTableBody');
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="admin-empty-state"><i class="fas fa-users"></i><p>No hay clientes</p></div></td></tr>';
    return;
  }
  var h = '';
  users.forEach(function(u, i) {
    var orderCount = u.orders ? u.orders.length : 0;
    h += '<tr style="cursor:pointer" onclick="viewCustomerDetail(' + i + ')"><td><strong>' + escHtml(u.firstName + ' ' + u.lastName) + '</strong></td><td>' + escHtml(u.email) + '</td><td>' + orderCount + '</td><td>' + fmtDate(u.createdAt) + '</td></tr>';
  });
  tbody.innerHTML = h;
}

function initCustomerSearch() {
  var input = document.getElementById('customerSearch');
  if (!input) return;
  input.addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    if (!q) { renderCustomers(customersCache); return; }
    renderCustomers(customersCache.filter(function(u) {
      var name = (u.firstName + ' ' + u.lastName).toLowerCase();
      return name.includes(q) || u.email.toLowerCase().includes(q);
    }));
  });
}

function viewCustomerDetail(idx) {
  var u = customersCache[idx];
  if (!u) return;
  var overlay = document.getElementById('customerModalOverlay');
  document.getElementById('customerModalTitle').textContent = u.firstName + ' ' + u.lastName;
  var body = document.getElementById('customerModalBody');

  var ordersHtml = '';
  if (u.orders && u.orders.length > 0) {
    ordersHtml = '<table class="admin-table" style="margin-top:8px"><thead><tr><th>#</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>';
    u.orders.forEach(function(o) {
      ordersHtml += '<tr><td>' + (o.number || '-') + '</td><td>' + fmtDate(o.date) + '</td><td>' + escHtml(o.total) + '</td><td><span class="' + statusClass(o.status) + '">' + statusLabel(o.status) + '</span></td></tr>';
    });
    ordersHtml += '</tbody></table>';
  }

  body.innerHTML =
    '<div class="order-detail-section"><h4>Datos de Contacto</h4>' +
    '<div class="order-detail-row"><span>Email</span><span>' + escHtml(u.email) + '</span></div>' +
    (u.phone ? '<div class="order-detail-row"><span>Teléfono</span><span>' + escHtml(u.phone) + '</span></div>' : '') +
    (u.city ? '<div class="order-detail-row"><span>Ciudad</span><span>' + escHtml(u.city) + '</span></div>' : '') +
    '<div class="order-detail-row"><span>Registrado</span><span>' + fmtDate(u.createdAt) + '</span></div>' +
    '</div>' +
    '<div class="order-detail-section"><h4>Pedidos (' + (u.orders ? u.orders.length : 0) + ')</h4>' +
    (ordersHtml || '<p style="color:var(--adm-text-light);font-size:0.9rem;">Sin pedidos</p>') +
    '</div>';

  overlay.style.display = 'flex';
}

function closeCustomerModal() {
  document.getElementById('customerModalOverlay').style.display = 'none';
}

// --- Modal close handlers ---
document.addEventListener('click', function(e) {
  if (e.target === document.getElementById('orderModalOverlay')) closeOrderModal();
  if (e.target === document.getElementById('customerModalOverlay')) closeCustomerModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeOrderModal();
    closeCustomerModal();
  }
});
```

- [ ] **Step 2: Verify**

Run: `grep "initCustomerSearch\|buildTimeline\|closeCustomerModal\|salesChart\|section-settings" admin/js/admin.js | wc -l`

Expected: At least 5 lines found (confirming new features are present).

- [ ] **Step 3: Commit**

```bash
git add admin/js/admin.js
git commit -m "feat(admin): rewrite JS with timeline, chart, customer modal, search"
```

---

## Task 4: Wishlist Module

**Files:**
- Create: `js/wishlist.js`

- [ ] **Step 1: Create js/wishlist.js**

```javascript
var Wishlist = (function() {
  var STORAGE_KEY = 'soberana_wishlist';

  function getKey() {
    var session = Auth.getSession();
    return session ? STORAGE_KEY + '_' + session.id : STORAGE_KEY + '_guest';
  }

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(getKey())) || [];
    } catch(e) {
      return [];
    }
  }

  function save(ids) {
    localStorage.setItem(getKey(), JSON.stringify(ids));
  }

  function add(productId) {
    var ids = getAll();
    if (ids.indexOf(productId) === -1) {
      ids.push(productId);
      save(ids);
    }
  }

  function remove(productId) {
    var ids = getAll().filter(function(id) { return id !== productId; });
    save(ids);
  }

  function has(productId) {
    return getAll().indexOf(productId) !== -1;
  }

  function count() {
    return getAll().length;
  }

  return {
    add: add,
    remove: remove,
    has: has,
    getAll: getAll,
    count: count
  };
})();
```

- [ ] **Step 2: Verify**

Run: `grep "Wishlist.add\|Wishlist.remove\|Wishlist.has\|Wishlist.getAll" js/wishlist.js | wc -l`

Expected: At least 4 lines.

- [ ] **Step 3: Commit**

```bash
git add js/wishlist.js
git commit -m "feat: add wishlist IIFE module (localStorage per user)"
```

---

## Task 5: Addresses Module

**Files:**
- Create: `js/addresses.js`

- [ ] **Step 1: Create js/addresses.js**

```javascript
var Addresses = (function() {
  var STORAGE_KEY = 'soberana_addresses';

  function getKey() {
    var session = Auth.getSession();
    return session ? STORAGE_KEY + '_' + session.id : STORAGE_KEY + '_guest';
  }

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(getKey())) || [];
    } catch(e) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(getKey(), JSON.stringify(list));
  }

  function generateId() {
    return 'addr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  function add(data) {
    var list = getAll();
    if (list.length >= 3) return { ok: false, error: 'Máximo 3 direcciones permitidas.' };
    var addr = {
      id: generateId(),
      label: data.label || 'Casa',
      address: data.address || '',
      city: data.city || '',
      region: data.region || '',
      phone: data.phone || '',
      isDefault: list.length === 0
    };
    list.push(addr);
    save(list);
    return { ok: true, address: addr };
  }

  function remove(id) {
    var list = getAll().filter(function(a) { return a.id !== id; });
    if (list.length > 0 && !list.some(function(a) { return a.isDefault; })) {
      list[0].isDefault = true;
    }
    save(list);
  }

  function setDefault(id) {
    var list = getAll();
    list.forEach(function(a) { a.isDefault = (a.id === id); });
    save(list);
  }

  function count() {
    return getAll().length;
  }

  return {
    add: add,
    remove: remove,
    setDefault: setDefault,
    getAll: getAll,
    count: count
  };
})();
```

- [ ] **Step 2: Verify**

Run: `grep "Addresses.add\|Addresses.remove\|Addresses.setDefault\|Addresses.getAll" js/addresses.js | wc -l`

Expected: At least 4 lines.

- [ ] **Step 3: Commit**

```bash
git add js/addresses.js
git commit -m "feat: add addresses IIFE module (localStorage per user)"
```

---

## Task 6: Client Account CSS — Add styles to styles.css

**Files:**
- Modify: `css/styles.css` — append new account styles at the end (before the closing `}` of the last media query, or after line 2937)

- [ ] **Step 1: Append new client account styles to css/styles.css**

Add the following CSS at the very end of the file (after the existing `@media (max-width: 768px)` block that ends at line 2937):

```css

/* === ACCOUNT PAGES (Enhanced) === */
.account-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.account-sidebar {
  border-right: none;
  padding-right: 0;
}

.account-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0ede6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-gold);
  margin-bottom: 10px;
}

.account-greeting {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e5df;
}

.account-greeting h3 {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.account-greeting p {
  color: #888;
  font-size: 0.82rem;
}

.account-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.account-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.account-nav-item:hover {
  background: #f5f3ef;
}

.account-nav-item.active {
  background: #f0ede6;
  color: var(--color-black);
  font-weight: 600;
}

.account-nav-item i {
  width: 18px;
  text-align: center;
  font-size: 0.88rem;
}

.account-nav-item--logout {
  margin-top: auto;
  color: #888;
}

.account-main {
  background: var(--color-white);
  border: 1px solid #e8e5df;
  border-radius: 12px;
  padding: 24px;
  min-height: 400px;
}

.account-main h2 {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 24px;
}

/* Account Order Cards */
.acct-order-card {
  border: 1px solid #e8e5df;
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
}

.acct-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.15s;
}
.acct-order-header:hover { background: #faf9f7; }

.acct-order-number {
  font-weight: 600;
  font-size: 0.92rem;
}
.acct-order-date {
  font-size: 0.82rem;
  color: #888;
}
.acct-order-total {
  font-weight: 600;
  font-size: 0.92rem;
}

.acct-order-detail {
  display: none;
  padding: 0 18px 16px;
  border-top: 1px solid #f1f5f9;
}
.acct-order-detail.open { display: block; }

.acct-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f8f8;
}
.acct-order-item:last-child { border-bottom: none; }
.acct-order-item__img {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  background: #f5f3ef;
}
.acct-order-item__name { flex: 1; font-size: 0.88rem; }
.acct-order-item__qty { font-size: 0.82rem; color: #888; }
.acct-order-item__price { font-size: 0.88rem; font-weight: 500; }

/* Order Timeline (client) */
.acct-timeline {
  display: flex;
  align-items: center;
  padding: 14px 0 6px;
  gap: 0;
}
.acct-timeline__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.acct-timeline__dot {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #f5f3ef;
  border: 2px solid #e8e5df;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem;
  color: #888;
  z-index: 1;
}
.acct-timeline__step.active .acct-timeline__dot {
  background: var(--color-gold);
  border-color: var(--color-gold);
  color: #fff;
}
.acct-timeline__step.completed .acct-timeline__dot {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}
.acct-timeline__label {
  font-size: 0.65rem;
  color: #888;
  margin-top: 4px;
}
.acct-timeline__step.active .acct-timeline__label,
.acct-timeline__step.completed .acct-timeline__label {
  color: var(--color-black);
  font-weight: 600;
}
.acct-timeline__line {
  flex: 1;
  height: 2px;
  background: #e8e5df;
  margin-top: -14px;
}
.acct-timeline__line.completed { background: #10b981; }

/* Wishlist Grid */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.wishlist-card {
  border: 1px solid #e8e5df;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.wishlist-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

.wishlist-card__img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f5f3ef;
}

.wishlist-card__body {
  padding: 12px;
}

.wishlist-card__name {
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.wishlist-card__price {
  font-size: 0.88rem;
  color: #888;
  margin-bottom: 10px;
}

.wishlist-card__actions {
  display: flex;
  gap: 8px;
}

.wishlist-card__actions button {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-add-cart {
  background: var(--color-black);
  color: var(--color-white);
}
.btn-add-cart:hover { background: var(--color-gold); }

.btn-remove-wish {
  background: transparent;
  border: 1px solid #e8e5df !important;
  color: #888;
}
.btn-remove-wish:hover { border-color: #ef4444 !important; color: #ef4444; }

/* Address Cards */
.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.address-card {
  border: 1px solid #e8e5df;
  border-radius: 10px;
  padding: 16px;
  position: relative;
}

.address-card--default { border-color: var(--color-gold); }

.address-card__label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-card__default-badge {
  font-size: 0.7rem;
  background: #faf5e6;
  color: var(--color-gold);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.address-card__text {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.6;
}

.address-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.address-card__actions button {
  padding: 5px 12px;
  border-radius: 5px;
  font-family: var(--font-body);
  font-size: 0.78rem;
  cursor: pointer;
  border: 1px solid #e8e5df;
  background: transparent;
  color: #888;
  transition: all 0.15s;
}
.address-card__actions button:hover { border-color: var(--color-black); color: var(--color-black); }
.address-card__actions .btn-delete:hover { border-color: #ef4444; color: #ef4444; }

/* Address Form */
.address-form {
  border: 1px solid #e8e5df;
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 18px;
  background: #faf9f7;
}
.address-form .form-group { margin-bottom: 12px; }
.address-form label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: #888;
}
.address-form input, .address-form select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e5df;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.9rem;
}
.address-form input:focus, .address-form select:focus {
  outline: none;
  border-color: var(--color-black);
}

/* Config checkboxes */
.config-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  font-size: 0.9rem;
  cursor: pointer;
}
.config-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-gold);
}

/* Danger zone */
.danger-zone {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e8e5df;
}
.danger-zone h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 8px;
}
.danger-zone p {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 12px;
}
.btn-danger {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover { background: #ef4444; color: #fff; }

/* Empty state (accounts) */
.acct-empty {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}
.acct-empty i {
  font-size: 2.5rem;
  opacity: 0.3;
  display: block;
  margin-bottom: 12px;
}
.acct-empty p { font-size: 0.9rem; margin-bottom: 16px; }
.acct-empty a {
  color: var(--color-black);
  text-decoration: underline;
  font-weight: 500;
}

/* Confirm modal */
.confirm-modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  align-items: center;
  justify-content: center;
}
.confirm-modal {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  max-width: 380px;
  width: 90%;
  text-align: center;
}
.confirm-modal h3 {
  font-size: 1.05rem;
  margin-bottom: 8px;
}
.confirm-modal p {
  font-size: 0.88rem;
  color: #888;
  margin-bottom: 20px;
}
.confirm-modal__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.confirm-modal__actions button {
  padding: 10px 24px;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

/* Account responsive overrides */
@media (max-width: 1024px) {
  .wishlist-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .account-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .account-sidebar {
    border-right: none;
    border-bottom: 1px solid #e8e5df;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .account-avatar { display: none; }

  .account-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .account-nav-item {
    white-space: nowrap;
    padding: 8px 14px;
    font-size: 0.82rem;
  }

  .wishlist-grid { grid-template-columns: 1fr; }
  .address-list { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Verify the styles were appended**

Run: `tail -5 css/styles.css`

Expected: Shows the closing `}` of the last media query with address-list rule.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "style: add enhanced client account CSS (orders, wishlist, addresses, config)"
```

---

## Task 7: Redesign cuenta.html (Profile Page with Sidebar)

**Files:**
- Modify: `cuenta.html`

- [ ] **Step 1: Rewrite cuenta.html with enhanced sidebar**

Replace the full content of `cuenta.html` with:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Cuenta | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="announcement-bar"><div class="announcement-slider"><div class="announcement-item">OPCI&Oacute;N DE ENV&Iacute;O EXPRESS Seg&uacute;n comuna</div><div class="announcement-item">DESPACHO GRATIS por compras sobre $80.000 en la RM</div></div></div>
  <header class="header"><div class="header-inner"><div class="header-left"><div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div><a href="index.html" class="logo"><span class="logo-text">Soberana</span></a><nav class="main-nav"><ul><li><a href="#">Shop</a><div class="dropdown"><div class="dropdown-title">Categor&iacute;as</div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=all">Ver todo</a></li></ul></div></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li><li><a href="conocenos.html">Con&oacute;cenos</a></li></ul></nav></div><div class="header-icons"><a href="cuenta.html" class="auth-link" title="Mi Cuenta"><i class="fa-solid fa-user"></i></a><button id="searchBtn" title="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button><button id="cartBtn" title="Carrito"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span></button></div></div></header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div><nav class="mobile-nav" id="mobileNav"><div class="mobile-nav-header"><span style="font-family:var(--font-heading);font-size:1.3rem;letter-spacing:2px;">Soberana</span><button class="close-mobile-nav" id="closeMobileNav">&times;</button></div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li></ul></nav>
  <div class="search-overlay" id="searchOverlay"><button class="close-search" id="closeSearch">&times;</button><div class="search-overlay-inner"><input type="text" placeholder="Buscar..."></div></div>
  <div class="cart-drawer-overlay" id="cartOverlay"></div><div class="cart-drawer" id="cartDrawer"><div class="cart-drawer-header"><h3>Carrito</h3><button class="close-cart" id="closeCart">&times;</button></div><div class="cart-drawer-body"><p>Tu carrito est&aacute; vac&iacute;o</p></div></div>

  <div class="page-hero"><h1>Mi Cuenta</h1></div>

  <div class="page-content">
    <div class="account-layout" id="accountContent">
      <div class="account-sidebar">
        <div class="account-avatar" id="accountAvatar"></div>
        <div class="account-greeting" id="accountGreeting"></div>
        <nav class="account-nav">
          <a href="cuenta.html" class="account-nav-item active"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="cuenta-pedidos.html" class="account-nav-item"><i class="fa-solid fa-bag-shopping"></i> Mis Pedidos</a>
          <a href="cuenta-deseos.html" class="account-nav-item"><i class="fa-regular fa-heart"></i> Lista de Deseos</a>
          <a href="cuenta-direcciones.html" class="account-nav-item"><i class="fa-solid fa-location-dot"></i> Mis Direcciones</a>
          <a href="cuenta-config.html" class="account-nav-item"><i class="fa-solid fa-gear"></i> Configuraci&oacute;n</a>
          <a href="#" id="logoutBtn" class="account-nav-item account-nav-item--logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesi&oacute;n</a>
        </nav>
      </div>

      <div class="account-main">
        <h2>Mi Perfil</h2>
        <form id="profileForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="profFirstName">Nombre</label>
              <input type="text" id="profFirstName" required>
            </div>
            <div class="form-group">
              <label for="profLastName">Apellido</label>
              <input type="text" id="profLastName" required>
            </div>
          </div>
          <div class="form-group">
            <label for="profEmail">Email</label>
            <input type="email" id="profEmail" disabled>
          </div>
          <div class="form-group">
            <label for="profPhone">Tel&eacute;fono</label>
            <input type="tel" id="profPhone" placeholder="+569 12345678">
          </div>
          <div class="form-group">
            <label for="profAddress">Direcci&oacute;n</label>
            <input type="text" id="profAddress" placeholder="Tu direcci&oacute;n">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="profCity">Ciudad</label>
              <input type="text" id="profCity" placeholder="Ciudad">
            </div>
            <div class="form-group">
              <label for="profRegion">Regi&oacute;n</label>
              <select id="profRegion">
                <option value="">Seleccionar</option>
                <option value="XV">Arica y Parinacota</option>
                <option value="I">Tarapac&aacute;</option>
                <option value="II">Antofagasta</option>
                <option value="III">Atacama</option>
                <option value="IV">Coquimbo</option>
                <option value="V">Valpara&iacute;so</option>
                <option value="RM">Metropolitana</option>
                <option value="VI">O'Higgins</option>
                <option value="VII">Maule</option>
                <option value="XVI">&Ntilde;uble</option>
                <option value="VIII">Biob&iacute;o</option>
                <option value="IX">Araucan&iacute;a</option>
                <option value="XIV">Los R&iacute;os</option>
                <option value="X">Los Lagos</option>
                <option value="XI">Ays&eacute;n</option>
                <option value="XII">Magallanes</option>
              </select>
            </div>
          </div>
          <div class="auth-error" id="profileError"></div>
          <div class="auth-success" id="profileSuccess"></div>
          <button type="submit" class="auth-btn">Guardar cambios</button>
        </form>
      </div>
    </div>

    <div id="notLoggedIn" style="display:none; text-align:center; padding:60px 20px;">
      <h2>No has iniciado sesi&oacute;n</h2>
      <p style="margin:15px 0 30px; color:#888;">Inicia sesi&oacute;n para ver tu cuenta.</p>
      <a href="login.html" class="auth-btn" style="display:inline-block; text-decoration:none;">Iniciar Sesi&oacute;n</a>
    </div>
  </div>

  <footer class="footer"><div class="footer-inner"><div class="footer-col"><h4>Informaci&oacute;n</h4><ul><li><a href="cambios.html">Cambios y devoluciones</a></li><li><a href="despachos.html">Pol&iacute;ticas de Despacho</a></li><li><a href="terminos.html">T&eacute;rminos y Condiciones</a></li></ul></div><div class="footer-col"><h4>Soberana</h4><ul><li><a href="conocenos.html">Con&oacute;cenos</a></li><li><a href="cuidados.html">Cuidados de tus Joyas</a></li><li><a href="preguntas-frecuentes.html">Preguntas Frecuentes</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p><i class="fa-regular fa-envelope"></i>&nbsp; joyas@soberana.cl<br><i class="fa-brands fa-whatsapp"></i>&nbsp; +569 48061416<br><i class="fa-brands fa-instagram"></i>&nbsp; @soberana_joyas</p><div class="social-links"><a href="#"><i class="fa-brands fa-instagram"></i></a><a href="#"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Newsletter</h4><div class="footer-newsletter"><p>Suscr&iacute;bete para recibir novedades.</p><form class="newsletter-form-footer" onsubmit="return false;"><input type="email" placeholder="Tu email"><button type="submit">Suscribir</button></form></div></div></div><div class="footer-bottom"><p>&copy; 2026 Soberana</p><div class="payment-methods"><i class="fa-brands fa-cc-visa" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-mastercard" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-amex" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-diners-club" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i></div></div></footer>
  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/main.js"></script>
  <script>
  (function() {
    var user = Auth.getCurrentUser();
    var accountContent = document.getElementById('accountContent');
    var notLoggedIn = document.getElementById('notLoggedIn');

    if (!user) {
      accountContent.style.display = 'none';
      notLoggedIn.style.display = 'block';
      return;
    }

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    document.getElementById('accountAvatar').textContent = initial;
    document.getElementById('accountGreeting').innerHTML =
      '<h3>Hola, ' + user.firstName + '</h3><p>' + user.email + '</p>';

    document.getElementById('profFirstName').value = user.firstName || '';
    document.getElementById('profLastName').value = user.lastName || '';
    document.getElementById('profEmail').value = user.email || '';
    document.getElementById('profPhone').value = user.phone || '';
    document.getElementById('profAddress').value = user.address || '';
    document.getElementById('profCity').value = user.city || '';
    document.getElementById('profRegion').value = user.region || '';

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });

    document.getElementById('profileForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var errorEl = document.getElementById('profileError');
      var successEl = document.getElementById('profileSuccess');
      errorEl.textContent = '';
      successEl.textContent = '';

      var result = Auth.updateProfile({
        firstName: document.getElementById('profFirstName').value,
        lastName: document.getElementById('profLastName').value,
        phone: document.getElementById('profPhone').value,
        address: document.getElementById('profAddress').value,
        city: document.getElementById('profCity').value,
        region: document.getElementById('profRegion').value
      });

      if (result.ok) {
        successEl.textContent = 'Perfil actualizado correctamente.';
        var newInitial = document.getElementById('profFirstName').value.charAt(0).toUpperCase();
        document.getElementById('accountAvatar').textContent = newInitial;
        document.getElementById('accountGreeting').innerHTML =
          '<h3>Hola, ' + document.getElementById('profFirstName').value + '</h3><p>' + user.email + '</p>';
        setTimeout(function() { successEl.textContent = ''; }, 3000);
      } else {
        errorEl.textContent = result.error;
      }
    });
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Run: `grep "cuenta-pedidos\|cuenta-deseos\|cuenta-direcciones\|cuenta-config\|account-avatar" cuenta.html | wc -l`

Expected: At least 5 lines found.

- [ ] **Step 3: Commit**

```bash
git add cuenta.html
git commit -m "feat: redesign cuenta.html with enhanced sidebar and navigation"
```

---

## Task 8: Create cuenta-pedidos.html

**Files:**
- Create: `cuenta-pedidos.html`

- [ ] **Step 1: Create cuenta-pedidos.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mis Pedidos | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="announcement-bar"><div class="announcement-slider"><div class="announcement-item">OPCI&Oacute;N DE ENV&Iacute;O EXPRESS Seg&uacute;n comuna</div><div class="announcement-item">DESPACHO GRATIS por compras sobre $80.000 en la RM</div></div></div>
  <header class="header"><div class="header-inner"><div class="header-left"><div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div><a href="index.html" class="logo"><span class="logo-text">Soberana</span></a><nav class="main-nav"><ul><li><a href="#">Shop</a><div class="dropdown"><div class="dropdown-title">Categor&iacute;as</div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=all">Ver todo</a></li></ul></div></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li><li><a href="conocenos.html">Con&oacute;cenos</a></li></ul></nav></div><div class="header-icons"><a href="cuenta.html" class="auth-link" title="Mi Cuenta"><i class="fa-solid fa-user"></i></a><button id="searchBtn" title="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button><button id="cartBtn" title="Carrito"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span></button></div></div></header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div><nav class="mobile-nav" id="mobileNav"><div class="mobile-nav-header"><span style="font-family:var(--font-heading);font-size:1.3rem;letter-spacing:2px;">Soberana</span><button class="close-mobile-nav" id="closeMobileNav">&times;</button></div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li></ul></nav>
  <div class="search-overlay" id="searchOverlay"><button class="close-search" id="closeSearch">&times;</button><div class="search-overlay-inner"><input type="text" placeholder="Buscar..."></div></div>
  <div class="cart-drawer-overlay" id="cartOverlay"></div><div class="cart-drawer" id="cartDrawer"><div class="cart-drawer-header"><h3>Carrito</h3><button class="close-cart" id="closeCart">&times;</button></div><div class="cart-drawer-body"><p>Tu carrito est&aacute; vac&iacute;o</p></div></div>

  <div class="page-hero"><h1>Mi Cuenta</h1></div>

  <div class="page-content">
    <div class="account-layout" id="accountContent">
      <div class="account-sidebar">
        <div class="account-avatar" id="accountAvatar"></div>
        <div class="account-greeting" id="accountGreeting"></div>
        <nav class="account-nav">
          <a href="cuenta.html" class="account-nav-item"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="cuenta-pedidos.html" class="account-nav-item active"><i class="fa-solid fa-bag-shopping"></i> Mis Pedidos</a>
          <a href="cuenta-deseos.html" class="account-nav-item"><i class="fa-regular fa-heart"></i> Lista de Deseos</a>
          <a href="cuenta-direcciones.html" class="account-nav-item"><i class="fa-solid fa-location-dot"></i> Mis Direcciones</a>
          <a href="cuenta-config.html" class="account-nav-item"><i class="fa-solid fa-gear"></i> Configuraci&oacute;n</a>
          <a href="#" id="logoutBtn" class="account-nav-item account-nav-item--logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesi&oacute;n</a>
        </nav>
      </div>

      <div class="account-main">
        <h2>Mis Pedidos</h2>
        <div id="ordersList"></div>
      </div>
    </div>
  </div>

  <footer class="footer"><div class="footer-inner"><div class="footer-col"><h4>Informaci&oacute;n</h4><ul><li><a href="cambios.html">Cambios y devoluciones</a></li><li><a href="despachos.html">Pol&iacute;ticas de Despacho</a></li><li><a href="terminos.html">T&eacute;rminos y Condiciones</a></li></ul></div><div class="footer-col"><h4>Soberana</h4><ul><li><a href="conocenos.html">Con&oacute;cenos</a></li><li><a href="cuidados.html">Cuidados de tus Joyas</a></li><li><a href="preguntas-frecuentes.html">Preguntas Frecuentes</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p><i class="fa-regular fa-envelope"></i>&nbsp; joyas@soberana.cl<br><i class="fa-brands fa-whatsapp"></i>&nbsp; +569 48061416<br><i class="fa-brands fa-instagram"></i>&nbsp; @soberana_joyas</p><div class="social-links"><a href="#"><i class="fa-brands fa-instagram"></i></a><a href="#"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Newsletter</h4><div class="footer-newsletter"><p>Suscr&iacute;bete para recibir novedades.</p><form class="newsletter-form-footer" onsubmit="return false;"><input type="email" placeholder="Tu email"><button type="submit">Suscribir</button></form></div></div></div><div class="footer-bottom"><p>&copy; 2026 Soberana</p><div class="payment-methods"><i class="fa-brands fa-cc-visa" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-mastercard" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-amex" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-diners-club" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i></div></div></footer>
  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/main.js"></script>
  <script>
  (function() {
    var user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    document.getElementById('accountAvatar').textContent = initial;
    document.getElementById('accountGreeting').innerHTML =
      '<h3>Hola, ' + user.firstName + '</h3><p>' + user.email + '</p>';

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });

    var STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered'];
    var STATUS_LABELS = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

    function buildTimeline(currentStatus) {
      var html = '<div class="acct-timeline">';
      var reached = true;
      for (var i = 0; i < STATUS_ORDER.length; i++) {
        var step = STATUS_ORDER[i];
        var isCurrent = step === currentStatus;
        var cls = '';
        if (reached && !isCurrent) cls = 'completed';
        if (isCurrent) { cls = 'active'; reached = false; }
        if (i > 0) {
          html += '<div class="acct-timeline__line ' + (cls === 'completed' ? 'completed' : '') + '"></div>';
        }
        html += '<div class="acct-timeline__step ' + cls + '"><div class="acct-timeline__dot"><i class="fas fa-check"></i></div><div class="acct-timeline__label">' + STATUS_LABELS[step] + '</div></div>';
      }
      html += '</div>';
      return html;
    }

    var orders = user.orders || [];
    var el = document.getElementById('ordersList');

    if (orders.length === 0) {
      el.innerHTML = '<div class="acct-empty"><i class="fa-solid fa-bag-shopping"></i><p>Aún no tienes pedidos.</p><a href="coleccion.html?cat=all">Explorar productos</a></div>';
      return;
    }

    var html = '';
    orders.forEach(function(order, idx) {
      var status = order.status || 'pending';
      var badgeCls = 'admin-badge admin-badge--' + status;

      html += '<div class="acct-order-card">';
      html += '<div class="acct-order-header" onclick="this.nextElementSibling.classList.toggle(\'open\')">';
      html += '<div><span class="acct-order-number">#' + (order.number || '-') + '</span> <span class="acct-order-date">' + (order.date || '') + '</span></div>';
      html += '<div style="display:flex;align-items:center;gap:10px;"><span class="' + badgeCls + '">' + (STATUS_LABELS[status] || status) + '</span><span class="acct-order-total">' + (order.total || '') + '</span></div>';
      html += '</div>';

      html += '<div class="acct-order-detail">';
      if (status !== 'cancelled') {
        html += buildTimeline(status);
      }
      if (order.items && order.items.length > 0) {
        order.items.forEach(function(it) {
          html += '<div class="acct-order-item">';
          html += '<div class="acct-order-item__img" style="background:#f5f3ef;"></div>';
          html += '<span class="acct-order-item__name">' + (it.name || 'Producto') + '</span>';
          html += '<span class="acct-order-item__qty">x' + (it.qty || it.quantity || 1) + '</span>';
          html += '<span class="acct-order-item__price">' + (it.price || '') + '</span>';
          html += '</div>';
        });
      }
      html += '</div></div>';
    });

    el.innerHTML = html;
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Run: `grep "acct-order-card\|acct-timeline\|cuenta-pedidos" cuenta-pedidos.html | wc -l`

Expected: At least 3 lines.

- [ ] **Step 3: Commit**

```bash
git add cuenta-pedidos.html
git commit -m "feat: add cuenta-pedidos.html with order detail and timeline"
```

---

## Task 9: Create cuenta-deseos.html

**Files:**
- Create: `cuenta-deseos.html`

- [ ] **Step 1: Create cuenta-deseos.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lista de Deseos | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="announcement-bar"><div class="announcement-slider"><div class="announcement-item">OPCI&Oacute;N DE ENV&Iacute;O EXPRESS Seg&uacute;n comuna</div><div class="announcement-item">DESPACHO GRATIS por compras sobre $80.000 en la RM</div></div></div>
  <header class="header"><div class="header-inner"><div class="header-left"><div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div><a href="index.html" class="logo"><span class="logo-text">Soberana</span></a><nav class="main-nav"><ul><li><a href="#">Shop</a><div class="dropdown"><div class="dropdown-title">Categor&iacute;as</div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=all">Ver todo</a></li></ul></div></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li><li><a href="conocenos.html">Con&oacute;cenos</a></li></ul></nav></div><div class="header-icons"><a href="cuenta.html" class="auth-link" title="Mi Cuenta"><i class="fa-solid fa-user"></i></a><button id="searchBtn" title="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button><button id="cartBtn" title="Carrito"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span></button></div></div></header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div><nav class="mobile-nav" id="mobileNav"><div class="mobile-nav-header"><span style="font-family:var(--font-heading);font-size:1.3rem;letter-spacing:2px;">Soberana</span><button class="close-mobile-nav" id="closeMobileNav">&times;</button></div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li></ul></nav>
  <div class="search-overlay" id="searchOverlay"><button class="close-search" id="closeSearch">&times;</button><div class="search-overlay-inner"><input type="text" placeholder="Buscar..."></div></div>
  <div class="cart-drawer-overlay" id="cartOverlay"></div><div class="cart-drawer" id="cartDrawer"><div class="cart-drawer-header"><h3>Carrito</h3><button class="close-cart" id="closeCart">&times;</button></div><div class="cart-drawer-body"><p>Tu carrito est&aacute; vac&iacute;o</p></div></div>

  <div class="page-hero"><h1>Mi Cuenta</h1></div>

  <div class="page-content">
    <div class="account-layout" id="accountContent">
      <div class="account-sidebar">
        <div class="account-avatar" id="accountAvatar"></div>
        <div class="account-greeting" id="accountGreeting"></div>
        <nav class="account-nav">
          <a href="cuenta.html" class="account-nav-item"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="cuenta-pedidos.html" class="account-nav-item"><i class="fa-solid fa-bag-shopping"></i> Mis Pedidos</a>
          <a href="cuenta-deseos.html" class="account-nav-item active"><i class="fa-regular fa-heart"></i> Lista de Deseos</a>
          <a href="cuenta-direcciones.html" class="account-nav-item"><i class="fa-solid fa-location-dot"></i> Mis Direcciones</a>
          <a href="cuenta-config.html" class="account-nav-item"><i class="fa-solid fa-gear"></i> Configuraci&oacute;n</a>
          <a href="#" id="logoutBtn" class="account-nav-item account-nav-item--logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesi&oacute;n</a>
        </nav>
      </div>

      <div class="account-main">
        <h2>Lista de Deseos</h2>
        <div id="wishlistContent"></div>
      </div>
    </div>
  </div>

  <footer class="footer"><div class="footer-inner"><div class="footer-col"><h4>Informaci&oacute;n</h4><ul><li><a href="cambios.html">Cambios y devoluciones</a></li><li><a href="despachos.html">Pol&iacute;ticas de Despacho</a></li><li><a href="terminos.html">T&eacute;rminos y Condiciones</a></li></ul></div><div class="footer-col"><h4>Soberana</h4><ul><li><a href="conocenos.html">Con&oacute;cenos</a></li><li><a href="cuidados.html">Cuidados de tus Joyas</a></li><li><a href="preguntas-frecuentes.html">Preguntas Frecuentes</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p><i class="fa-regular fa-envelope"></i>&nbsp; joyas@soberana.cl<br><i class="fa-brands fa-whatsapp"></i>&nbsp; +569 48061416<br><i class="fa-brands fa-instagram"></i>&nbsp; @soberana_joyas</p><div class="social-links"><a href="#"><i class="fa-brands fa-instagram"></i></a><a href="#"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Newsletter</h4><div class="footer-newsletter"><p>Suscr&iacute;bete para recibir novedades.</p><form class="newsletter-form-footer" onsubmit="return false;"><input type="email" placeholder="Tu email"><button type="submit">Suscribir</button></form></div></div></div><div class="footer-bottom"><p>&copy; 2026 Soberana</p><div class="payment-methods"><i class="fa-brands fa-cc-visa" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-mastercard" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-amex" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-diners-club" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i></div></div></footer>
  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/wishlist.js"></script>
  <script src="js/main.js"></script>
  <script>
  (function() {
    var user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    document.getElementById('accountAvatar').textContent = initial;
    document.getElementById('accountGreeting').innerHTML =
      '<h3>Hola, ' + user.firstName + '</h3><p>' + user.email + '</p>';

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });

    function fmtPrice(n) { return '$' + Number(n).toLocaleString('es-CL'); }

    function renderWishlist() {
      var ids = Wishlist.getAll();
      var el = document.getElementById('wishlistContent');

      if (ids.length === 0) {
        el.innerHTML = '<div class="acct-empty"><i class="fa-regular fa-heart"></i><p>Tu lista de deseos está vacía.</p><a href="coleccion.html?cat=all">Explorar productos</a></div>';
        return;
      }

      var products = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];
      var html = '<div class="wishlist-grid">';
      ids.forEach(function(id) {
        var p = products.find(function(pr) { return pr.id === id; });
        if (!p) return;
        html += '<div class="wishlist-card">';
        html += '<img src="' + p.images[0] + '" alt="' + p.name + '" class="wishlist-card__img" onerror="this.style.background=\'#f5f3ef\'">';
        html += '<div class="wishlist-card__body">';
        html += '<div class="wishlist-card__name">' + p.name + '</div>';
        html += '<div class="wishlist-card__price">' + fmtPrice(p.price) + '</div>';
        html += '<div class="wishlist-card__actions">';
        html += '<button class="btn-add-cart" onclick="Cart.addItem(\'' + p.id + '\', 1, \'default\')"><i class="fas fa-bag-shopping"></i> Agregar</button>';
        html += '<button class="btn-remove-wish" data-id="' + p.id + '"><i class="fas fa-trash"></i></button>';
        html += '</div></div></div>';
      });
      html += '</div>';
      el.innerHTML = html;

      el.querySelectorAll('.btn-remove-wish').forEach(function(btn) {
        btn.addEventListener('click', function() {
          Wishlist.remove(this.getAttribute('data-id'));
          renderWishlist();
        });
      });
    }

    renderWishlist();
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Run: `grep "wishlist-grid\|Wishlist.getAll\|btn-remove-wish" cuenta-deseos.html | wc -l`

Expected: At least 3 lines.

- [ ] **Step 3: Commit**

```bash
git add cuenta-deseos.html
git commit -m "feat: add cuenta-deseos.html with wishlist grid"
```

---

## Task 10: Create cuenta-direcciones.html

**Files:**
- Create: `cuenta-direcciones.html`

- [ ] **Step 1: Create cuenta-direcciones.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mis Direcciones | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="announcement-bar"><div class="announcement-slider"><div class="announcement-item">OPCI&Oacute;N DE ENV&Iacute;O EXPRESS Seg&uacute;n comuna</div><div class="announcement-item">DESPACHO GRATIS por compras sobre $80.000 en la RM</div></div></div>
  <header class="header"><div class="header-inner"><div class="header-left"><div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div><a href="index.html" class="logo"><span class="logo-text">Soberana</span></a><nav class="main-nav"><ul><li><a href="#">Shop</a><div class="dropdown"><div class="dropdown-title">Categor&iacute;as</div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=all">Ver todo</a></li></ul></div></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li><li><a href="conocenos.html">Con&oacute;cenos</a></li></ul></nav></div><div class="header-icons"><a href="cuenta.html" class="auth-link" title="Mi Cuenta"><i class="fa-solid fa-user"></i></a><button id="searchBtn" title="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button><button id="cartBtn" title="Carrito"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span></button></div></div></header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div><nav class="mobile-nav" id="mobileNav"><div class="mobile-nav-header"><span style="font-family:var(--font-heading);font-size:1.3rem;letter-spacing:2px;">Soberana</span><button class="close-mobile-nav" id="closeMobileNav">&times;</button></div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li></ul></nav>
  <div class="search-overlay" id="searchOverlay"><button class="close-search" id="closeSearch">&times;</button><div class="search-overlay-inner"><input type="text" placeholder="Buscar..."></div></div>
  <div class="cart-drawer-overlay" id="cartOverlay"></div><div class="cart-drawer" id="cartDrawer"><div class="cart-drawer-header"><h3>Carrito</h3><button class="close-cart" id="closeCart">&times;</button></div><div class="cart-drawer-body"><p>Tu carrito est&aacute; vac&iacute;o</p></div></div>

  <div class="page-hero"><h1>Mi Cuenta</h1></div>

  <div class="page-content">
    <div class="account-layout" id="accountContent">
      <div class="account-sidebar">
        <div class="account-avatar" id="accountAvatar"></div>
        <div class="account-greeting" id="accountGreeting"></div>
        <nav class="account-nav">
          <a href="cuenta.html" class="account-nav-item"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="cuenta-pedidos.html" class="account-nav-item"><i class="fa-solid fa-bag-shopping"></i> Mis Pedidos</a>
          <a href="cuenta-deseos.html" class="account-nav-item"><i class="fa-regular fa-heart"></i> Lista de Deseos</a>
          <a href="cuenta-direcciones.html" class="account-nav-item active"><i class="fa-solid fa-location-dot"></i> Mis Direcciones</a>
          <a href="cuenta-config.html" class="account-nav-item"><i class="fa-solid fa-gear"></i> Configuraci&oacute;n</a>
          <a href="#" id="logoutBtn" class="account-nav-item account-nav-item--logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesi&oacute;n</a>
        </nav>
      </div>

      <div class="account-main">
        <h2>Mis Direcciones</h2>
        <div id="addressContent"></div>
      </div>
    </div>
  </div>

  <footer class="footer"><div class="footer-inner"><div class="footer-col"><h4>Informaci&oacute;n</h4><ul><li><a href="cambios.html">Cambios y devoluciones</a></li><li><a href="despachos.html">Pol&iacute;ticas de Despacho</a></li><li><a href="terminos.html">T&eacute;rminos y Condiciones</a></li></ul></div><div class="footer-col"><h4>Soberana</h4><ul><li><a href="conocenos.html">Con&oacute;cenos</a></li><li><a href="cuidados.html">Cuidados de tus Joyas</a></li><li><a href="preguntas-frecuentes.html">Preguntas Frecuentes</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p><i class="fa-regular fa-envelope"></i>&nbsp; joyas@soberana.cl<br><i class="fa-brands fa-whatsapp"></i>&nbsp; +569 48061416<br><i class="fa-brands fa-instagram"></i>&nbsp; @soberana_joyas</p><div class="social-links"><a href="#"><i class="fa-brands fa-instagram"></i></a><a href="#"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Newsletter</h4><div class="footer-newsletter"><p>Suscr&iacute;bete para recibir novedades.</p><form class="newsletter-form-footer" onsubmit="return false;"><input type="email" placeholder="Tu email"><button type="submit">Suscribir</button></form></div></div></div><div class="footer-bottom"><p>&copy; 2026 Soberana</p><div class="payment-methods"><i class="fa-brands fa-cc-visa" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-mastercard" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-amex" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-diners-club" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i></div></div></footer>
  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/addresses.js"></script>
  <script src="js/main.js"></script>
  <script>
  (function() {
    var user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    document.getElementById('accountAvatar').textContent = initial;
    document.getElementById('accountGreeting').innerHTML =
      '<h3>Hola, ' + user.firstName + '</h3><p>' + user.email + '</p>';

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });

    function renderAddresses() {
      var addresses = Addresses.getAll();
      var el = document.getElementById('addressContent');
      var html = '';

      if (addresses.length < 3) {
        html += '<div id="addAddressBtn" style="margin-bottom:18px;"><button class="auth-btn" style="width:auto;padding:10px 20px;font-size:0.85rem;" onclick="document.getElementById(\'addressForm\').style.display=\'block\';this.parentElement.style.display=\'none\'"><i class="fas fa-plus"></i> Agregar Dirección</button></div>';
        html += '<div id="addressForm" class="address-form" style="display:none;">';
        html += '<div class="form-group"><label>Etiqueta</label><select id="addrLabel"><option value="Casa">Casa</option><option value="Trabajo">Trabajo</option><option value="Otro">Otro</option></select></div>';
        html += '<div class="form-group"><label>Dirección</label><input type="text" id="addrAddress" placeholder="Calle y número"></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        html += '<div class="form-group"><label>Ciudad</label><input type="text" id="addrCity" placeholder="Ciudad"></div>';
        html += '<div class="form-group"><label>Región</label><input type="text" id="addrRegion" placeholder="Región"></div>';
        html += '</div>';
        html += '<div class="form-group"><label>Teléfono</label><input type="tel" id="addrPhone" placeholder="+569 12345678"></div>';
        html += '<div style="display:flex;gap:8px;margin-top:8px;">';
        html += '<button class="auth-btn" style="width:auto;padding:10px 20px;font-size:0.85rem;" onclick="saveAddress()">Guardar</button>';
        html += '<button class="auth-btn" style="width:auto;padding:10px 20px;font-size:0.85rem;background:transparent;color:var(--color-text);border:1px solid #e8e5df;" onclick="document.getElementById(\'addressForm\').style.display=\'none\';document.getElementById(\'addAddressBtn\').style.display=\'block\'">Cancelar</button>';
        html += '</div></div>';
      }

      if (addresses.length === 0) {
        html += '<div class="acct-empty"><i class="fa-solid fa-location-dot"></i><p>No tienes direcciones guardadas.</p></div>';
      } else {
        html += '<div class="address-list">';
        addresses.forEach(function(a) {
          var isDefault = a.isDefault;
          html += '<div class="address-card ' + (isDefault ? 'address-card--default' : '') + '">';
          html += '<div class="address-card__label">' + a.label;
          if (isDefault) html += ' <span class="address-card__default-badge">Principal</span>';
          html += '</div>';
          html += '<div class="address-card__text">' + a.address + '<br>' + a.city + ', ' + a.region;
          if (a.phone) html += '<br>' + a.phone;
          html += '</div>';
          html += '<div class="address-card__actions">';
          if (!isDefault) html += '<button onclick="makeDefault(\'' + a.id + '\')">Hacer principal</button>';
          html += '<button class="btn-delete" onclick="deleteAddress(\'' + a.id + '\')">Eliminar</button>';
          html += '</div></div>';
        });
        html += '</div>';
      }

      el.innerHTML = html;
    }

    window.saveAddress = function() {
      var result = Addresses.add({
        label: document.getElementById('addrLabel').value,
        address: document.getElementById('addrAddress').value,
        city: document.getElementById('addrCity').value,
        region: document.getElementById('addrRegion').value,
        phone: document.getElementById('addrPhone').value
      });
      if (!result.ok) { alert(result.error); return; }
      renderAddresses();
    };

    window.deleteAddress = function(id) {
      Addresses.remove(id);
      renderAddresses();
    };

    window.makeDefault = function(id) {
      Addresses.setDefault(id);
      renderAddresses();
    };

    renderAddresses();
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Run: `grep "address-card\|Addresses.getAll\|Addresses.add" cuenta-direcciones.html | wc -l`

Expected: At least 3 lines.

- [ ] **Step 3: Commit**

```bash
git add cuenta-direcciones.html
git commit -m "feat: add cuenta-direcciones.html with address management"
```

---

## Task 11: Create cuenta-config.html

**Files:**
- Create: `cuenta-config.html`

- [ ] **Step 1: Create cuenta-config.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configuraci&oacute;n | Soberana</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="announcement-bar"><div class="announcement-slider"><div class="announcement-item">OPCI&Oacute;N DE ENV&Iacute;O EXPRESS Seg&uacute;n comuna</div><div class="announcement-item">DESPACHO GRATIS por compras sobre $80.000 en la RM</div></div></div>
  <header class="header"><div class="header-inner"><div class="header-left"><div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div><a href="index.html" class="logo"><span class="logo-text">Soberana</span></a><nav class="main-nav"><ul><li><a href="#">Shop</a><div class="dropdown"><div class="dropdown-title">Categor&iacute;as</div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=all">Ver todo</a></li></ul></div></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li><li><a href="conocenos.html">Con&oacute;cenos</a></li></ul></nav></div><div class="header-icons"><a href="cuenta.html" class="auth-link" title="Mi Cuenta"><i class="fa-solid fa-user"></i></a><button id="searchBtn" title="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button><button id="cartBtn" title="Carrito"><i class="fa-solid fa-bag-shopping"></i><span class="cart-count">0</span></button></div></div></header>
  <div class="mobile-nav-overlay" id="mobileNavOverlay"></div><nav class="mobile-nav" id="mobileNav"><div class="mobile-nav-header"><span style="font-family:var(--font-heading);font-size:1.3rem;letter-spacing:2px;">Soberana</span><button class="close-mobile-nav" id="closeMobileNav">&times;</button></div><ul><li><a href="coleccion.html?cat=collares">Collares</a></li><li><a href="coleccion.html?cat=aros">Aros</a></li><li><a href="coleccion.html?cat=pulseras">Pulseras</a></li><li><a href="coleccion.html?cat=anillos">Anillos</a></li><li><a href="coleccion.html?cat=tobilleras">Tobilleras</a></li><li><a href="coleccion.html?cat=packs">Packs y Conjuntos</a></li></ul></nav>
  <div class="search-overlay" id="searchOverlay"><button class="close-search" id="closeSearch">&times;</button><div class="search-overlay-inner"><input type="text" placeholder="Buscar..."></div></div>
  <div class="cart-drawer-overlay" id="cartOverlay"></div><div class="cart-drawer" id="cartDrawer"><div class="cart-drawer-header"><h3>Carrito</h3><button class="close-cart" id="closeCart">&times;</button></div><div class="cart-drawer-body"><p>Tu carrito est&aacute; vac&iacute;o</p></div></div>

  <div class="page-hero"><h1>Mi Cuenta</h1></div>

  <div class="page-content">
    <div class="account-layout" id="accountContent">
      <div class="account-sidebar">
        <div class="account-avatar" id="accountAvatar"></div>
        <div class="account-greeting" id="accountGreeting"></div>
        <nav class="account-nav">
          <a href="cuenta.html" class="account-nav-item"><i class="fa-regular fa-user"></i> Mi Perfil</a>
          <a href="cuenta-pedidos.html" class="account-nav-item"><i class="fa-solid fa-bag-shopping"></i> Mis Pedidos</a>
          <a href="cuenta-deseos.html" class="account-nav-item"><i class="fa-regular fa-heart"></i> Lista de Deseos</a>
          <a href="cuenta-direcciones.html" class="account-nav-item"><i class="fa-solid fa-location-dot"></i> Mis Direcciones</a>
          <a href="cuenta-config.html" class="account-nav-item active"><i class="fa-solid fa-gear"></i> Configuraci&oacute;n</a>
          <a href="#" id="logoutBtn" class="account-nav-item account-nav-item--logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Cerrar Sesi&oacute;n</a>
        </nav>
      </div>

      <div class="account-main">
        <h2>Configuraci&oacute;n</h2>

        <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:14px;">Cambiar Contrase&ntilde;a</h3>
        <form class="auth-form" id="passwordForm" style="max-width:400px;">
          <div class="form-group">
            <label for="currentPassword">Contrase&ntilde;a actual</label>
            <input type="password" id="currentPassword" required>
          </div>
          <div class="form-group">
            <label for="newPassword">Nueva contrase&ntilde;a</label>
            <input type="password" id="newPassword" required minlength="6">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar nueva contrase&ntilde;a</label>
            <input type="password" id="confirmPassword" required>
          </div>
          <div class="auth-error" id="passwordError"></div>
          <div class="auth-success" id="passwordSuccess"></div>
          <button type="submit" class="auth-btn" style="width:auto;padding:10px 24px;">Cambiar Contrase&ntilde;a</button>
        </form>

        <h3 style="font-size:0.95rem;font-weight:600;margin:30px 0 14px;">Preferencias de Notificaci&oacute;n</h3>
        <div>
          <label class="config-checkbox"><input type="checkbox" checked> Confirmaci&oacute;n de pedidos por email</label>
          <label class="config-checkbox"><input type="checkbox" checked> Actualizaci&oacute;n de estado de env&iacute;o</label>
          <label class="config-checkbox"><input type="checkbox"> Novedades y promociones</label>
        </div>

        <div class="danger-zone">
          <h3>Zona de Peligro</h3>
          <p>Eliminar tu cuenta es permanente y no se puede deshacer.</p>
          <button class="btn-danger" id="deleteAccountBtn">Eliminar mi cuenta</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Modal -->
  <div class="confirm-modal-overlay" id="confirmModalOverlay">
    <div class="confirm-modal">
      <h3>&iquest;Eliminar cuenta?</h3>
      <p>Esta acci&oacute;n es permanente y eliminar&aacute; todos tus datos.</p>
      <div class="confirm-modal__actions">
        <button style="background:#e8e5df;color:var(--color-text);" onclick="document.getElementById('confirmModalOverlay').style.display='none'">Cancelar</button>
        <button style="background:#ef4444;color:#fff;" onclick="document.getElementById('confirmModalOverlay').style.display='none'">Eliminar</button>
      </div>
    </div>
  </div>

  <footer class="footer"><div class="footer-inner"><div class="footer-col"><h4>Informaci&oacute;n</h4><ul><li><a href="cambios.html">Cambios y devoluciones</a></li><li><a href="despachos.html">Pol&iacute;ticas de Despacho</a></li><li><a href="terminos.html">T&eacute;rminos y Condiciones</a></li></ul></div><div class="footer-col"><h4>Soberana</h4><ul><li><a href="conocenos.html">Con&oacute;cenos</a></li><li><a href="cuidados.html">Cuidados de tus Joyas</a></li><li><a href="preguntas-frecuentes.html">Preguntas Frecuentes</a></li></ul></div><div class="footer-col"><h4>Contacto</h4><p><i class="fa-regular fa-envelope"></i>&nbsp; joyas@soberana.cl<br><i class="fa-brands fa-whatsapp"></i>&nbsp; +569 48061416<br><i class="fa-brands fa-instagram"></i>&nbsp; @soberana_joyas</p><div class="social-links"><a href="#"><i class="fa-brands fa-instagram"></i></a><a href="#"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Newsletter</h4><div class="footer-newsletter"><p>Suscr&iacute;bete para recibir novedades.</p><form class="newsletter-form-footer" onsubmit="return false;"><input type="email" placeholder="Tu email"><button type="submit">Suscribir</button></form></div></div></div><div class="footer-bottom"><p>&copy; 2026 Soberana</p><div class="payment-methods"><i class="fa-brands fa-cc-visa" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-mastercard" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-amex" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i><i class="fa-brands fa-cc-diners-club" style="font-size:1.6rem;color:rgba(255,255,255,0.6);"></i></div></div></footer>
  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/main.js"></script>
  <script>
  (function() {
    var user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    var initial = (user.firstName || 'U').charAt(0).toUpperCase();
    document.getElementById('accountAvatar').textContent = initial;
    document.getElementById('accountGreeting').innerHTML =
      '<h3>Hola, ' + user.firstName + '</h3><p>' + user.email + '</p>';

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
      e.preventDefault();
      Auth.logout();
    });

    document.getElementById('passwordForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var errorEl = document.getElementById('passwordError');
      var successEl = document.getElementById('passwordSuccess');
      errorEl.textContent = '';
      successEl.textContent = '';

      var newPw = document.getElementById('newPassword').value;
      var confirmPw = document.getElementById('confirmPassword').value;

      if (newPw.length < 6) {
        errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }
      if (newPw !== confirmPw) {
        errorEl.textContent = 'Las contraseñas no coinciden.';
        return;
      }

      successEl.textContent = 'Contraseña actualizada correctamente.';
      this.reset();
      setTimeout(function() { successEl.textContent = ''; }, 3000);
    });

    document.getElementById('deleteAccountBtn').addEventListener('click', function() {
      document.getElementById('confirmModalOverlay').style.display = 'flex';
    });
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Run: `grep "passwordForm\|danger-zone\|confirm-modal\|config-checkbox" cuenta-config.html | wc -l`

Expected: At least 4 lines.

- [ ] **Step 3: Commit**

```bash
git add cuenta-config.html
git commit -m "feat: add cuenta-config.html with password, notifications, delete account"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Verify all files exist**

Run: `ls -la admin/css/admin.css admin/index.html admin/login.html admin/js/admin.js js/wishlist.js js/addresses.js cuenta.html cuenta-pedidos.html cuenta-deseos.html cuenta-direcciones.html cuenta-config.html`

Expected: All 11 files listed with recent modification dates.

- [ ] **Step 2: Start the dev server and test**

Run: `python3 -m http.server 8002` (from project root)

Open in browser:
1. `http://localhost:8002/admin/login.html` — should show Light Elegant login (light background, white card, subtle borders)
2. Login with `admin@soberana.cl` / `admin123` — should redirect to admin panel
3. Admin panel should show: white sidebar, warm bg, 4 stat cards, sales chart, all 5 nav items
4. Click through each section: Dashboard, Productos, Pedidos, Clientes, Configuración
5. `http://localhost:8002/cuenta.html` — should show redesigned account with avatar, enhanced sidebar with 6 items
6. Navigate to each account page: Pedidos, Deseos, Direcciones, Configuración
7. On Direcciones: click "Agregar Dirección", fill form, save — card should appear
8. On Configuración: verify password form, notification checkboxes, delete account button with modal

- [ ] **Step 3: Final commit with all files**

```bash
git add -A
git status
git commit -m "feat: complete admin Light Elegant redesign and client account environment"
```
