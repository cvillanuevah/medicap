document.addEventListener('DOMContentLoaded', function() {
  if (!Auth.isAdmin()) {
    window.location.href = 'login.html';
    return;
  }

  var session = Auth.getSession();
  var adminNameEl = document.getElementById('adminName');
  if (adminNameEl) adminNameEl.textContent = session.firstName || 'Admin';

  // Sync store name from settings
  (function() {
    var s;
    try { s = JSON.parse(localStorage.getItem('soberana_settings')); } catch(e) {}
    if (s && s.name) {
      var logo = document.querySelector('.admin-sidebar__logo');
      if (logo) logo.textContent = s.name;
      document.title = 'Panel Admin | ' + s.name;
    }
  })();

  logActivity('auth', 'inició sesión en el panel de administración');

  initSidebar();
  initNavigation();
  initLogout();
  initOrderStatusFilter();
  initProductSearch();
  initCustomerSearch();
  loadDashboard();
  checkScheduledProducts();
  setInterval(checkScheduledProducts, 30000);
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
    activity: 'Registro de Actividad',
    settings: 'Configuración'
  };
  document.getElementById('sectionTitle').textContent = titles[name] || name;
  switch (name) {
    case 'dashboard': loadDashboard(); break;
    case 'products': loadProducts(); break;
    case 'orders': loadOrders(); break;
    case 'customers': loadCustomers(); break;
    case 'activity': loadActivityLog(); break;
    case 'settings': loadSettings(); break;
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
function fmtDateTime(d) {
  if (!d) return '-';
  var dt = new Date(d);
  var fecha = dt.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  var hora = dt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return fecha + '<br>' + hora;
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

// --- Activity Log ---
var ACTIVITY_KEY = 'soberana_activity_log';

function getActivityLog() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; }
  catch(e) { return []; }
}

function logActivity(type, action, detail) {
  var log = getActivityLog();
  var session = Auth.getSession();
  log.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    type: type,
    action: action,
    detail: detail || '',
    user: session ? (session.firstName || 'Admin') : 'Sistema',
    date: new Date().toISOString()
  });
  if (log.length > 500) log = log.slice(0, 500);
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log)); } catch(e) {}
}

var ACTIVITY_ICONS = {
  product: 'fas fa-gem',
  order: 'fas fa-shopping-bag',
  settings: 'fas fa-cog',
  auth: 'fas fa-user-shield',
  'delete': 'fas fa-trash'
};

var ACTIVITY_ICON_CLASS = {
  product: 'activity-icon--product',
  order: 'activity-icon--order',
  settings: 'activity-icon--settings',
  auth: 'activity-icon--auth',
  'delete': 'activity-icon--delete'
};

var activityPage = 0;
var ACTIVITY_PER_PAGE = 30;

function loadActivityLog() {
  activityPage = 0;
  renderActivityLog();
}

function renderActivityLog() {
  var container = document.getElementById('activityLogList');
  if (!container) return;
  var filter = document.getElementById('activityFilterType');
  var filterVal = filter ? filter.value : 'all';
  var log = getActivityLog();
  if (filterVal !== 'all') {
    log = log.filter(function(e) { return e.type === filterVal; });
  }

  if (log.length === 0) {
    container.innerHTML = '<div class="activity-empty"><i class="fas fa-clock-rotate-left"></i><p>No hay actividad registrada</p></div>';
    return;
  }

  var limit = (activityPage + 1) * ACTIVITY_PER_PAGE;
  var visible = log.slice(0, limit);
  var html = '';
  var lastDay = '';

  visible.forEach(function(entry) {
    var dt = new Date(entry.date);
    var day = dt.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (day !== lastDay) {
      html += '<div class="activity-day-sep">' + day + '</div>';
      lastDay = day;
    }

    var iconType = entry.type || 'product';
    if (entry.action && entry.action.indexOf('elimin') !== -1) iconType = 'delete';
    var iconCls = ACTIVITY_ICONS[iconType] || 'fas fa-circle';
    var iconColorCls = ACTIVITY_ICON_CLASS[iconType] || 'activity-icon--product';

    var ago = timeAgo(entry.date);
    var time = dt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

    html += '<div class="activity-item">' +
      '<div class="activity-icon ' + iconColorCls + '"><i class="' + iconCls + '"></i></div>' +
      '<div class="activity-body">' +
        '<div class="activity-text"><strong>' + escHtml(entry.user) + '</strong> ' + escHtml(entry.action) + '</div>' +
        (entry.detail ? '<div class="activity-text" style="color:var(--adm-text-light);font-size:0.78rem;">' + escHtml(entry.detail) + '</div>' : '') +
        '<div class="activity-meta"><span>' + time + '</span><span>' + ago + '</span></div>' +
      '</div>' +
    '</div>';
  });

  if (visible.length < log.length) {
    html += '<div class="activity-load-more"><button onclick="activityPage++;renderActivityLog();">Cargar más</button></div>';
  }

  container.innerHTML = html;
}

function clearActivityLog() {
  if (!confirm('¿Limpiar todo el registro de actividad?')) return;
  localStorage.removeItem(ACTIVITY_KEY);
  logActivity('settings', 'limpió el registro de actividad');
  renderActivityLog();
  showToast('Registro de actividad limpiado');
}

// --- Dashboard ---
function parseOrderTotal(o) {
  return typeof o.total === 'string' ? parseInt(o.total.replace(/[^0-9]/g, '')) : (o.total || 0);
}

function loadDashboard() {
  var users = Auth.getAllUsers();
  var customers = users.filter(function(u) { return u.role !== 'admin'; });
  var orders = getAllOrders();
  var allProducts = (typeof ProductManager !== 'undefined') ? ProductManager.getAll() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  var activeProducts = allProducts.filter(function(p) { return p.archived !== true; });

  var now = new Date();
  var thisMonth = now.getMonth();
  var thisYear = now.getFullYear();
  var totalSales = 0;
  var monthSales = 0;
  var lastMonthSales = 0;
  var todaySales = 0;
  var todayStr = now.toISOString().slice(0, 10);

  orders.forEach(function(o) {
    var num = parseOrderTotal(o);
    totalSales += num;
    if (o.date) {
      var d = new Date(o.date);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) monthSales += num;
      var prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      var prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) lastMonthSales += num;
      if (o.date.slice(0, 10) === todayStr) todaySales += num;
    }
  });

  var lowStockProducts = activeProducts.filter(function(p) {
    if (p.stock === undefined || p.stock === null) return false;
    var s = Number(p.stock);
    var min = Number(p.stockMin) || 5;
    return s <= min;
  });

  // Stats grid
  var grid = document.getElementById('statsGrid');
  grid.innerHTML =
    '<div class="admin-stat-card admin-stat-card--revenue"><div class="admin-stat-card__icon"><i class="fas fa-dollar-sign"></i></div><div><div class="admin-stat-card__value">' + fmtPrice(totalSales) + '</div><div class="admin-stat-card__label">Ingresos Totales</div></div></div>' +
    '<div class="admin-stat-card admin-stat-card--orders"><div class="admin-stat-card__icon"><i class="fas fa-shopping-bag"></i></div><div><div class="admin-stat-card__value">' + orders.length + '</div><div class="admin-stat-card__label">Pedidos</div><div class="admin-stat-card__sub">Hoy: ' + fmtPrice(todaySales) + '</div></div></div>' +
    '<div class="admin-stat-card admin-stat-card--customers"><div class="admin-stat-card__icon"><i class="fas fa-users"></i></div><div><div class="admin-stat-card__value">' + customers.length + '</div><div class="admin-stat-card__label">Clientes</div></div></div>' +
    '<div class="admin-stat-card admin-stat-card--products"><div class="admin-stat-card__icon"><i class="fas fa-gem"></i></div><div><div class="admin-stat-card__value">' + activeProducts.length + '</div><div class="admin-stat-card__label">Productos Activos</div></div></div>' +
    (lowStockProducts.length > 0 ? '<div class="admin-stat-card admin-stat-card--lowstock"><div class="admin-stat-card__icon"><i class="fas fa-triangle-exclamation"></i></div><div><div class="admin-stat-card__value">' + lowStockProducts.length + '</div><div class="admin-stat-card__label">Stock Bajo</div></div></div>' : '') +
    '<div class="admin-stat-card admin-stat-card--sales"><div class="admin-stat-card__icon"><i class="fas fa-calendar"></i></div><div><div class="admin-stat-card__value">' + fmtPrice(monthSales) + '</div><div class="admin-stat-card__label">Ventas del Mes</div></div></div>';

  // Monthly revenue
  var revEl = document.getElementById('dashMonthRevenue');
  if (revEl) revEl.textContent = fmtPrice(monthSales);
  var compareEl = document.getElementById('dashRevenueCompare');
  if (compareEl) {
    if (lastMonthSales > 0) {
      var pctChange = Math.round(((monthSales - lastMonthSales) / lastMonthSales) * 100);
      if (pctChange > 0) {
        compareEl.className = 'dash-revenue__compare dash-revenue__compare--up';
        compareEl.innerHTML = '<i class="fas fa-arrow-up"></i> +' + pctChange + '% vs mes anterior';
      } else if (pctChange < 0) {
        compareEl.className = 'dash-revenue__compare dash-revenue__compare--down';
        compareEl.innerHTML = '<i class="fas fa-arrow-down"></i> ' + pctChange + '% vs mes anterior';
      } else {
        compareEl.className = 'dash-revenue__compare dash-revenue__compare--neutral';
        compareEl.textContent = 'Igual que el mes anterior';
      }
    } else if (monthSales > 0) {
      compareEl.className = 'dash-revenue__compare dash-revenue__compare--up';
      compareEl.textContent = 'Primeras ventas del mes';
    } else {
      compareEl.className = 'dash-revenue__compare dash-revenue__compare--neutral';
      compareEl.textContent = 'Sin ventas este mes';
    }
  }

  // Sales chart — last 7 days with real data
  var chart = document.getElementById('salesChart');
  var dayLabels = [];
  var dayValues = [];
  for (var di = 6; di >= 0; di--) {
    var dd = new Date(now);
    dd.setDate(dd.getDate() - di);
    var key = dd.toISOString().slice(0, 10);
    dayLabels.push(dd.toLocaleDateString('es-CL', { weekday: 'short' }));
    var dayTotal = 0;
    orders.forEach(function(o) {
      if (o.date && o.date.slice(0, 10) === key) dayTotal += parseOrderTotal(o);
    });
    dayValues.push(dayTotal);
  }
  var maxVal = Math.max.apply(null, dayValues);
  if (maxVal === 0) maxVal = 1;
  var barsHtml = '<div class="admin-chart-bars">';
  dayLabels.forEach(function(day, i) {
    var pct = Math.round((dayValues[i] / maxVal) * 100);
    if (pct < 4 && dayValues[i] > 0) pct = 4;
    var tooltip = day + ': ' + fmtPrice(dayValues[i]);
    barsHtml += '<div class="admin-chart-bar" style="height:' + pct + '%" title="' + tooltip + '"><span class="admin-chart-bar__value">' + (dayValues[i] > 0 ? fmtPrice(dayValues[i]) : '') + '</span><span class="admin-chart-bar__label">' + day + '</span></div>';
  });
  barsHtml += '</div>';
  chart.innerHTML = barsHtml;

  // Recent orders
  var recent = document.getElementById('recentOrdersTable');
  if (orders.length === 0) {
    recent.innerHTML = '<div class="admin-empty-state"><i class="fas fa-shopping-bag"></i><p>No hay pedidos aún</p></div>';
  } else {
    var h = '<table class="admin-table"><thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>';
    orders.slice(0, 5).forEach(function(o) {
      var fecha = o.date ? timeAgo(o.date) : '-';
      h += '<tr><td>' + (o.number || '-') + '</td><td>' + escHtml(o.customerName) + '</td><td>' + escHtml(o.total) + '</td><td style="font-size:0.78rem;color:var(--adm-text-light);">' + fecha + '</td><td><span class="' + statusClass(o.status) + '">' + statusLabel(o.status) + '</span></td></tr>';
    });
    h += '</tbody></table>';
    recent.innerHTML = h;
  }

  // Top products — sorted by sold count or sale price
  var top = document.getElementById('topProductsList');
  var sortedProducts = activeProducts.slice().sort(function(a, b) {
    var aSold = Number(a.sold) || 0;
    var bSold = Number(b.sold) || 0;
    return bSold - aSold;
  });
  if (sortedProducts.length > 0) {
    var h2 = '';
    sortedProducts.slice(0, 5).forEach(function(p, i) {
      var displayPrice = (p.salePrice && p.salePrice < p.price) ? p.salePrice : p.price;
      var sold = Number(p.sold) || 0;
      var soldText = sold > 0 ? sold + ' vendido' + (sold !== 1 ? 's' : '') : fmtPrice(displayPrice);
      h2 += '<div class="top-product-item"><div class="top-product-item__rank">' + (i + 1) + '</div><img src="' + escHtml((p.images && p.images[0]) || '') + '" alt="" class="top-product-item__img" onerror="this.style.display=\'none\'"><div class="top-product-item__info"><div class="top-product-item__name">' + escHtml(p.name) + '</div><div class="top-product-item__sales">' + soldText + '</div></div></div>';
    });
    top.innerHTML = h2;
  } else {
    top.innerHTML = '<div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div>';
  }

  // Stock alerts
  var stockEl = document.getElementById('dashStockAlerts');
  if (stockEl) {
    if (lowStockProducts.length === 0) {
      stockEl.innerHTML = '<div class="activity-empty"><i class="fas fa-check-circle" style="color:var(--adm-success);opacity:0.6;"></i><p>Todo el stock está en orden</p></div>';
    } else {
      var sh = '';
      lowStockProducts.sort(function(a, b) { return Number(a.stock) - Number(b.stock); }).slice(0, 8).forEach(function(p) {
        var s = Number(p.stock);
        var isOut = s <= 0;
        sh += '<div class="dash-stock-alert">' +
          '<img src="' + escHtml((p.images && p.images[0]) || '') + '" alt="" class="dash-stock-alert__img" onerror="this.style.display=\'none\'">' +
          '<div class="dash-stock-alert__info"><div class="dash-stock-alert__name">' + escHtml(p.name) + '</div>' +
          '<div class="dash-stock-alert__stock ' + (isOut ? 'dash-stock-alert__stock--out' : 'dash-stock-alert__stock--low') + '">' + s + ' unidades</div></div>' +
          '<span class="dash-stock-alert__badge ' + (isOut ? 'dash-stock-alert__badge--out' : 'dash-stock-alert__badge--low') + '">' + (isOut ? 'Agotado' : 'Bajo') + '</span>' +
        '</div>';
      });
      stockEl.innerHTML = sh;
    }
  }

  // Recent activity in dashboard
  var actEl = document.getElementById('dashRecentActivity');
  if (actEl) {
    var log = getActivityLog().slice(0, 5);
    if (log.length === 0) {
      actEl.innerHTML = '<div class="activity-empty"><i class="fas fa-clock-rotate-left"></i><p>No hay actividad reciente</p></div>';
    } else {
      var ah = '';
      log.forEach(function(entry) {
        var iconType = entry.type || 'product';
        if (entry.action && entry.action.indexOf('elimin') !== -1) iconType = 'delete';
        var iconCls = ACTIVITY_ICONS[iconType] || 'fas fa-circle';
        var iconColorCls = ACTIVITY_ICON_CLASS[iconType] || 'activity-icon--product';
        ah += '<div class="activity-item">' +
          '<div class="activity-icon ' + iconColorCls + '"><i class="' + iconCls + '"></i></div>' +
          '<div class="activity-body">' +
            '<div class="activity-text"><strong>' + escHtml(entry.user) + '</strong> ' + escHtml(entry.action) + '</div>' +
            '<div class="activity-meta"><span>' + timeAgo(entry.date) + '</span></div>' +
          '</div></div>';
      });
      actEl.innerHTML = ah;
    }
  }
}

// --- Products ---
var productsCache = [];
var currentProductTab = 'active';
var selectedProducts = {};

function loadProducts() {
  productsCache = (typeof ProductManager !== 'undefined') ? ProductManager.getAll() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  updateTabCounts();
  updateProductStats();
  applyProductFilters();
}

function updateProductStats() {
  var active = productsCache.filter(function(p) { return p.archived !== true; });
  var total = active.length;
  var inStock = 0, outStock = 0, lowStock = 0, onSale = 0, totalValue = 0;
  active.forEach(function(p) {
    var isSoldOut = p.status === 'sold-out' || p.status === 'agotado';
    if (isSoldOut) { outStock++; }
    else { inStock++; }
    var sq = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : null;
    var sm = Number(p.stockMin) || 0;
    if (sq !== null && sq > 0 && sm > 0 && sq <= sm) lowStock++;
    if (sq === 0) outStock = outStock;
    if (p.salePrice && p.salePrice < p.price) onSale++;
    var price = (p.salePrice && p.salePrice < p.price) ? p.salePrice : (p.price || 0);
    var qty = (sq !== null && sq > 0) ? sq : 1;
    totalValue += price * qty;
  });
  var el = function(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; };
  el('statTotal', total);
  el('statInStock', inStock);
  el('statOutStock', outStock);
  el('statLowStock', lowStock);
  el('statOnSale', onSale);
  el('statValue', fmtPrice(totalValue));
}

function updateTabCounts() {
  var active = productsCache.filter(function(p) { return p.archived !== true; });
  var archived = productsCache.filter(function(p) { return p.archived === true; });
  var elActive = document.getElementById('tabCountActive');
  var elArchived = document.getElementById('tabCountArchived');
  var elAll = document.getElementById('tabCountAll');
  if (elActive) elActive.textContent = active.length;
  if (elArchived) elArchived.textContent = archived.length;
  if (elAll) elAll.textContent = productsCache.length;
}

function filterProductTab(tab) {
  currentProductTab = tab;
  document.querySelectorAll('.prod-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-filter') === tab);
  });
  applyProductFilters();
}

function applyProductFilters() {
  var list = productsCache.slice();

  if (currentProductTab === 'active') {
    list = list.filter(function(p) { return p.archived !== true; });
  } else if (currentProductTab === 'archived') {
    list = list.filter(function(p) { return p.archived === true; });
  }

  var catFilter = document.getElementById('productCatFilter');
  if (catFilter && catFilter.value) {
    var cat = catFilter.value;
    list = list.filter(function(p) { return p.category === cat; });
  }

  var stockFilter = document.getElementById('productStockFilter');
  if (stockFilter && stockFilter.value) {
    var stock = stockFilter.value;
    list = list.filter(function(p) {
      var isSoldOut = p.status === 'sold-out' || p.status === 'agotado';
      return stock === 'sold-out' ? isSoldOut : !isSoldOut;
    });
  }

  var visFilter = document.getElementById('productVisFilter');
  if (visFilter && visFilter.value) {
    var vis = visFilter.value;
    list = list.filter(function(p) {
      return vis === 'draft' ? p.published === false : p.published !== false;
    });
  }

  var offerFilter = document.getElementById('productOfferFilter');
  if (offerFilter && offerFilter.value) {
    var offer = offerFilter.value;
    list = list.filter(function(p) {
      var hasSale = p.salePrice && p.salePrice < p.price;
      return offer === 'on-sale' ? hasSale : !hasSale;
    });
  }

  var searchInput = document.getElementById('productSearch');
  if (searchInput && searchInput.value.trim()) {
    var q = searchInput.value.toLowerCase().trim();
    list = list.filter(function(p) {
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
  }

  var sortFilter = document.getElementById('productSortFilter');
  var sortVal = sortFilter ? sortFilter.value : '';
  if (sortVal) {
    list = sortProductList(list, sortVal);
  }
  updateSortIcons(sortVal);

  var countEl = document.getElementById('prodFilterCount');
  if (countEl) countEl.textContent = list.length + ' producto' + (list.length !== 1 ? 's' : '');

  updateClearFiltersBtn();
  renderProducts(list);
}

function sortProductList(list, sortVal) {
  var sorted = list.slice();
  switch (sortVal) {
    case 'name-asc':
      sorted.sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
      break;
    case 'name-desc':
      sorted.sort(function(a, b) { return (b.name || '').localeCompare(a.name || ''); });
      break;
    case 'price-asc':
      sorted.sort(function(a, b) {
        var pa = (a.salePrice && a.salePrice < a.price) ? a.salePrice : a.price;
        var pb = (b.salePrice && b.salePrice < b.price) ? b.salePrice : b.price;
        return pa - pb;
      });
      break;
    case 'price-desc':
      sorted.sort(function(a, b) {
        var pa = (a.salePrice && a.salePrice < a.price) ? a.salePrice : a.price;
        var pb = (b.salePrice && b.salePrice < b.price) ? b.salePrice : b.price;
        return pb - pa;
      });
      break;
    case 'cat-asc':
      sorted.sort(function(a, b) { return (a.category || '').localeCompare(b.category || ''); });
      break;
    case 'created-desc':
      sorted.sort(function(a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
      break;
    case 'created-asc':
      sorted.sort(function(a, b) { return (a.createdAt || '').localeCompare(b.createdAt || ''); });
      break;
    case 'updated-desc':
      sorted.sort(function(a, b) { return (b.updatedAt || '').localeCompare(a.updatedAt || ''); });
      break;
    case 'updated-asc':
      sorted.sort(function(a, b) { return (a.updatedAt || '').localeCompare(b.updatedAt || ''); });
      break;
    case 'stock-asc':
      sorted.sort(function(a, b) { return (Number(a.stock) || 0) - (Number(b.stock) || 0); });
      break;
    case 'stock-desc':
      sorted.sort(function(a, b) { return (Number(b.stock) || 0) - (Number(a.stock) || 0); });
      break;
  }
  return sorted;
}

function sortProductsBy(field) {
  var sortFilter = document.getElementById('productSortFilter');
  if (!sortFilter) return;
  var current = sortFilter.value;
  if (field === 'name') {
    sortFilter.value = current === 'name-asc' ? 'name-desc' : 'name-asc';
  } else if (field === 'price') {
    sortFilter.value = current === 'price-asc' ? 'price-desc' : 'price-asc';
  } else if (field === 'category') {
    sortFilter.value = current === 'cat-asc' ? '' : 'cat-asc';
  } else if (field === 'created') {
    sortFilter.value = current === 'created-desc' ? 'created-asc' : 'created-desc';
  } else if (field === 'updated') {
    sortFilter.value = current === 'updated-desc' ? 'updated-asc' : 'updated-desc';
  } else if (field === 'stock') {
    sortFilter.value = current === 'stock-desc' ? 'stock-asc' : 'stock-desc';
  }
  applyProductFilters();
}

function updateSortIcons(sortVal) {
  ['sortIconName', 'sortIconCategory', 'sortIconPrice', 'sortIconStock', 'sortIconCreated', 'sortIconUpdated'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.className = 'fas fa-sort sort-icon';
  });
  if (!sortVal) return;
  var map = {
    'name-asc': ['sortIconName', 'up'], 'name-desc': ['sortIconName', 'down'],
    'price-asc': ['sortIconPrice', 'up'], 'price-desc': ['sortIconPrice', 'down'],
    'cat-asc': ['sortIconCategory', 'up'],
    'stock-desc': ['sortIconStock', 'down'], 'stock-asc': ['sortIconStock', 'up'],
    'created-desc': ['sortIconCreated', 'down'], 'created-asc': ['sortIconCreated', 'up'],
    'updated-desc': ['sortIconUpdated', 'down'], 'updated-asc': ['sortIconUpdated', 'up']
  };
  var m = map[sortVal];
  if (m) {
    var el = document.getElementById(m[0]);
    if (el) el.className = 'fas fa-sort-' + m[1] + ' sort-icon sort-icon--active';
  }
}

function hasActiveFilters() {
  var cat = document.getElementById('productCatFilter');
  var stock = document.getElementById('productStockFilter');
  var vis = document.getElementById('productVisFilter');
  var offer = document.getElementById('productOfferFilter');
  var sort = document.getElementById('productSortFilter');
  var search = document.getElementById('productSearch');
  return (cat && cat.value) || (stock && stock.value) || (vis && vis.value) || (offer && offer.value) || (sort && sort.value) || (search && search.value.trim());
}

function updateClearFiltersBtn() {
  var btn = document.getElementById('clearFiltersBtn');
  if (btn) btn.style.display = hasActiveFilters() ? 'inline-flex' : 'none';
}

function clearProductFilters() {
  var ids = ['productCatFilter', 'productStockFilter', 'productVisFilter', 'productOfferFilter', 'productSortFilter'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var search = document.getElementById('productSearch');
  if (search) search.value = '';
  applyProductFilters();
}

function renderProducts(list) {
  if (currentProductView === 'grid') {
    renderProductGrid(list);
  }
  var tbody = document.getElementById('productsTableBody');
  updateBulkBar();
  var selectAllCb = document.getElementById('prodSelectAll');
  if (selectAllCb) selectAllCb.checked = false;
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11"><div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div></td></tr>';
    if (currentProductView === 'grid') {
      var grid = document.getElementById('prodGridWrapper');
      if (grid) grid.innerHTML = '<div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div>';
    }
    return;
  }
  var h = '';
  list.forEach(function(p) {
    var isSoldOut = p.status === 'sold-out' || p.status === 'agotado';
    var statusBadge = isSoldOut
      ? '<span class="admin-badge admin-badge--sold-out">Agotado</span>'
      : '<span class="admin-badge admin-badge--available">Disponible</span>';

    var priceHtml;
    if (p.salePrice && p.salePrice < p.price) {
      var pct = Math.round((1 - p.salePrice / p.price) * 100);
      priceHtml = '<span class="price-original">' + fmtPrice(p.price) + '</span> <span class="price-sale">' + fmtPrice(p.salePrice) + '</span> <span class="admin-badge admin-badge--offer">-' + pct + '%</span>';
    } else {
      priceHtml = fmtPrice(p.price);
    }

    var nameBadge = '';
    if (p._isCustom) nameBadge = ' <span class="admin-badge admin-badge--custom">Nuevo</span>';
    else if (p._hasOverride) nameBadge = ' <span class="admin-badge admin-badge--modified">Editado</span>';

    var isArchived = p.archived === true;
    var actions = '<div class="admin-table-actions">';
    actions += '<button class="btn-edit" onclick="openEditProduct(\'' + p.id + '\')"><i class="fas fa-pen"></i> Editar</button>';
    actions += '<div class="actions-kebab">';
    actions += '<button class="actions-kebab__trigger" onclick="toggleKebab(event, this)"><i class="fas fa-ellipsis-vertical"></i></button>';
    actions += '<div class="actions-kebab__menu">';
    actions += '<a href="../producto.html?id=' + encodeURIComponent(p.id) + '" target="_blank" class="actions-kebab__item"><i class="fas fa-external-link-alt"></i> Ver en tienda</a>';
    actions += '<button class="actions-kebab__item" onclick="duplicateProduct(\'' + p.id + '\')"><i class="fas fa-copy"></i> Duplicar</button>';
    if (isArchived) {
      actions += '<button class="actions-kebab__item actions-kebab__item--success" onclick="restoreProduct(\'' + p.id + '\')"><i class="fas fa-rotate-left"></i> Restaurar</button>';
    } else {
      actions += '<button class="actions-kebab__item" onclick="confirmArchiveProduct(\'' + p.id + '\')"><i class="fas fa-box-archive"></i> Archivar</button>';
    }
    actions += '<div class="actions-kebab__divider"></div>';
    actions += '<button class="actions-kebab__item actions-kebab__item--danger" onclick="confirmDeleteProduct(\'' + p.id + '\')"><i class="fas fa-trash"></i> Eliminar</button>';
    actions += '</div></div>';
    actions += '</div>';

    var rowClasses = [];
    if (isArchived) rowClasses.push('prod-row--archived');
    if (selectedProducts[p.id]) rowClasses.push('prod-row--selected');
    h += '<tr class="' + rowClasses.join(' ') + '">';
    h += '<td class="td-check"><input type="checkbox" ' + (selectedProducts[p.id] ? 'checked' : '') + ' onchange="toggleProductSelect(\'' + p.id + '\', this.checked)"></td>';
    var imgCount = (p.images && p.images.length) || 0;
    var imgSrc = imgCount > 0 ? p.images[0] : '';
    if (imgSrc) {
      h += '<td><div class="img-hover-wrap"><img src="' + escHtml(imgSrc) + '" alt="" class="admin-table-img" onerror="this.outerHTML=\'<div class=admin-table-img-placeholder><i class=fas&nbsp;fa-image></i></div>\'"><div class="img-hover-preview"><img src="' + escHtml(imgSrc) + '" alt=""></div></div>';
      if (imgCount > 1) h += '<span style="font-size:0.65rem;color:#888;display:block;text-align:center;">+' + (imgCount - 1) + '</span>';
      h += '</td>';
    } else {
      h += '<td><div class="admin-table-img-placeholder"><i class="fas fa-image"></i></div></td>';
    }
    h += '<td><strong>' + escHtml(p.name) + '</strong>' + nameBadge + '</td>';
    h += '<td>' + escHtml(p.category.charAt(0).toUpperCase() + p.category.slice(1)) + '</td>';
    h += '<td>' + priceHtml + '</td>';
    h += '<td>' + statusBadge + '</td>';
    var stockQty = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : null;
    var stockMin = Number(p.stockMin) || 0;
    var stockHtml;
    if (stockQty === null) {
      stockHtml = '<span class="stock-na">—</span>';
    } else if (stockQty <= 0) {
      stockHtml = '<span class="stock-out">0</span>';
    } else if (stockMin > 0 && stockQty <= stockMin) {
      stockHtml = '<span class="stock-low">' + stockQty + '</span>';
    } else {
      stockHtml = '<span class="stock-ok">' + stockQty + '</span>';
    }
    if (stockQty !== null) {
      stockHtml = '<span class="stock-inline" onclick="inlineEditStock(event, \'' + p.id + '\', ' + stockQty + ')" title="Click para editar">' + stockHtml + ' <i class="fas fa-pen stock-edit-icon"></i></span>';
    }
    h += '<td class="td-stock">' + stockHtml + '</td>';
    var pubBadge;
    if (isArchived) {
      pubBadge = '<span class="admin-badge admin-badge--archived"><i class="fas fa-box-archive"></i> Archivado</span>';
    } else if (p.scheduledAt && new Date(p.scheduledAt) > new Date() && p.published === false) {
      pubBadge = '<span class="admin-badge admin-badge--scheduled"><i class="fas fa-clock"></i> Programado</span>';
    } else if (p.published === false) {
      pubBadge = '<span class="admin-badge admin-badge--draft">Borrador</span>';
    } else {
      pubBadge = '<span class="admin-badge admin-badge--published">Publicado</span>';
    }
    h += '<td>' + pubBadge + '</td>';
    var nowISO = new Date().toISOString();
    if (!p.createdAt) {
      p.createdAt = nowISO;
      p.updatedAt = p.updatedAt || nowISO;
      ProductManager.update(p.id, { createdAt: p.createdAt, updatedAt: p.updatedAt });
    }
    h += '<td class="td-date">' + fmtDateTime(p.createdAt) + '</td>';
    h += '<td class="td-date">' + fmtDateTime(p.updatedAt || p.createdAt) + '</td>';
    h += '<td>' + actions + '</td>';
    h += '</tr>';
  });
  tbody.innerHTML = h;
}

function inlineEditStock(e, id, currentVal) {
  e.stopPropagation();
  var cell = e.currentTarget.closest('.td-stock');
  if (!cell) return;
  cell.innerHTML = '<input type="number" class="stock-inline-input" value="' + currentVal + '" min="0" autofocus>';
  var input = cell.querySelector('input');
  input.focus();
  input.select();
  function save() {
    var newVal = parseInt(input.value);
    if (isNaN(newVal) || newVal < 0) newVal = currentVal;
    if (newVal !== currentVal) {
      var updateData = { stock: newVal };
      if (newVal <= 0) updateData.status = 'agotado';
      else {
        var p = ProductManager.getById(id);
        if (p && (p.status === 'agotado' || p.status === 'sold-out')) updateData.status = 'in-stock';
      }
      updateData._historyEntry = {
        date: new Date().toISOString(), action: 'updated',
        changes: ['Stock: ' + currentVal + ' uds → ' + newVal + ' uds']
      };
      ProductManager.update(id, updateData);
      var pn = ProductManager.getById(id);
      logActivity('product', 'actualizó stock de "' + (pn ? pn.name : id) + '"', currentVal + ' → ' + newVal + ' unidades');
      showToast('Stock actualizado: ' + currentVal + ' → ' + newVal);
    }
    loadProducts();
  }
  input.addEventListener('blur', save);
  input.addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
    if (ev.key === 'Escape') { loadProducts(); }
  });
}

function initProductSearch() {
  var input = document.getElementById('productSearch');
  if (!input) return;
  input.addEventListener('input', function() {
    applyProductFilters();
  });
}

// --- Product View Toggle ---
var currentProductView = 'table';

function setProductView(view) {
  currentProductView = view;
  document.getElementById('viewTableBtn').classList.toggle('active', view === 'table');
  document.getElementById('viewGridBtn').classList.toggle('active', view === 'grid');
  document.getElementById('prodTableWrapper').style.display = view === 'table' ? '' : 'none';
  document.getElementById('prodGridWrapper').style.display = view === 'grid' ? '' : 'none';
  applyProductFilters();
}

function renderProductGrid(list) {
  var grid = document.getElementById('prodGridWrapper');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = '<div class="admin-empty-state"><i class="fas fa-gem"></i><p>No hay productos</p></div>';
    return;
  }
  var h = '';
  list.forEach(function(p) {
    var imgSrc = (p.images && p.images.length > 0) ? p.images[0] : '';
    var isSoldOut = p.status === 'sold-out' || p.status === 'agotado';
    var isArchived = p.archived === true;
    var priceHtml;
    if (p.salePrice && p.salePrice < p.price) {
      var pct = Math.round((1 - p.salePrice / p.price) * 100);
      priceHtml = '<span class="pgc-price-old">' + fmtPrice(p.price) + '</span> <span class="pgc-price-sale">' + fmtPrice(p.salePrice) + '</span> <span class="pgc-badge-sale">-' + pct + '%</span>';
    } else {
      priceHtml = fmtPrice(p.price);
    }
    var badges = '';
    if (isArchived) badges += '<span class="pgc-badge pgc-badge--archived">Archivado</span>';
    else if (p.published === false) badges += '<span class="pgc-badge pgc-badge--draft">Borrador</span>';
    if (isSoldOut) badges += '<span class="pgc-badge pgc-badge--soldout">Agotado</span>';
    if (p.scheduledAt && new Date(p.scheduledAt) > new Date()) badges += '<span class="pgc-badge pgc-badge--sched"><i class="fas fa-clock"></i></span>';
    var stockQty = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : null;
    var stockMin = Number(p.stockMin) || 0;
    var stockClass = 'pgc-stock--na';
    if (stockQty !== null) {
      if (stockQty <= 0) stockClass = 'pgc-stock--out';
      else if (stockMin > 0 && stockQty <= stockMin) stockClass = 'pgc-stock--low';
      else stockClass = 'pgc-stock--ok';
    }
    var cls = isArchived ? ' pgc--archived' : '';
    h += '<div class="prod-grid-card' + cls + '" onclick="openEditProduct(\'' + p.id + '\')">';
    h += '<div class="pgc-img">';
    if (imgSrc) h += '<img src="' + escHtml(imgSrc) + '" alt="" loading="lazy">';
    else h += '<div class="pgc-img-empty"><i class="fas fa-image"></i></div>';
    if (badges) h += '<div class="pgc-badges">' + badges + '</div>';
    h += '</div>';
    h += '<div class="pgc-body">';
    h += '<div class="pgc-name">' + escHtml(p.name) + '</div>';
    h += '<div class="pgc-cat">' + escHtml(p.category.charAt(0).toUpperCase() + p.category.slice(1)) + '</div>';
    h += '<div class="pgc-price">' + priceHtml + '</div>';
    h += '<div class="pgc-meta">';
    if (stockQty !== null) h += '<span class="pgc-stock ' + stockClass + '"><i class="fas fa-box"></i> ' + stockQty + '</span>';
    if (p.sku) h += '<span class="pgc-sku">' + escHtml(p.sku) + '</span>';
    h += '</div>';
    h += '</div>';
    h += '<div class="pgc-actions">';
    h += '<button class="pgc-action-btn" onclick="event.stopPropagation();openEditProduct(\'' + p.id + '\')" title="Editar"><i class="fas fa-pen"></i></button>';
    h += '<button class="pgc-action-btn" onclick="event.stopPropagation();duplicateProduct(\'' + p.id + '\')" title="Duplicar"><i class="fas fa-copy"></i></button>';
    if (isArchived) {
      h += '<button class="pgc-action-btn pgc-action-btn--success" onclick="event.stopPropagation();restoreProduct(\'' + p.id + '\')" title="Restaurar"><i class="fas fa-rotate-left"></i></button>';
    } else {
      h += '<button class="pgc-action-btn" onclick="event.stopPropagation();confirmArchiveProduct(\'' + p.id + '\')" title="Archivar"><i class="fas fa-box-archive"></i></button>';
    }
    h += '</div>';
    h += '</div>';
  });
  grid.innerHTML = h;
}

// --- Scheduled Publishing ---
function checkScheduledProducts() {
  if (typeof ProductManager === 'undefined') return;
  var all = ProductManager.getAll();
  var now = new Date();
  var changed = false;
  all.forEach(function(p) {
    if (p.scheduledAt && new Date(p.scheduledAt) <= now && p.published === false) {
      ProductManager.update(p.id, {
        published: true,
        scheduledAt: null,
        _historyEntry: {
          date: now.toISOString(), action: 'published',
          changes: ['Publicación automática programada']
        }
      });
      logActivity('product', 'publicó automáticamente "' + (p.name || p.id) + '" (programado)');
      changed = true;
    }
  });
  if (changed) loadProducts();
}

function updateSchedPreview() {
  var dateInput = document.getElementById('prodSchedDate');
  var timeInput = document.getElementById('prodSchedTime');
  var preview = document.getElementById('schedPreview');
  if (!dateInput.value) { preview.style.display = 'none'; return; }
  var dt = new Date(dateInput.value + 'T' + (timeInput.value || '00:00'));
  var now = new Date();
  if (dt <= now) {
    preview.innerHTML = '<i class="fas fa-exclamation-triangle"></i> La fecha ya pasó. El producto se publicará inmediatamente al guardar.';
    preview.className = 'sched-preview sched-preview--past';
  } else {
    var diff = dt - now;
    var days = Math.floor(diff / 86400000);
    var hrs = Math.floor((diff % 86400000) / 3600000);
    var label = '';
    if (days > 0) label += days + ' día' + (days !== 1 ? 's' : '');
    if (hrs > 0) label += (label ? ' y ' : '') + hrs + ' hora' + (hrs !== 1 ? 's' : '');
    if (!label) label = 'menos de 1 hora';
    preview.innerHTML = '<i class="fas fa-calendar-check"></i> Se publicará en <strong>' + label + '</strong> — ' + dt.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) + ' a las ' + dt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
    preview.className = 'sched-preview sched-preview--future';
  }
  preview.style.display = 'block';
}

function clearSchedule() {
  document.getElementById('prodSchedDate').value = '';
  document.getElementById('prodSchedTime').value = '';
  document.getElementById('schedPreview').style.display = 'none';
  document.getElementById('schedInfo').style.display = 'none';
}

// --- Product Modal ---
var productModalMode = 'edit';

function openProductModal() {
  document.getElementById('productModalOverlay').style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModalOverlay').style.display = 'none';
  document.getElementById('productForm').reset();
  document.getElementById('prodEditSaleInfo').style.display = 'none';
  document.getElementById('prodEditResetWrap').style.display = 'none';
}

function toggleProdSection(headerEl) {
  headerEl.parentElement.classList.toggle('collapsed');
}

var productImages = [];

function renderProductImages() {
  var gallery = document.getElementById('prodImageGallery');
  gallery.innerHTML = '';
  productImages.forEach(function(url, i) {
    var thumb = document.createElement('div');
    thumb.className = 'img-thumb';

    var img = document.createElement('img');
    img.src = url;
    img.alt = 'Imagen ' + (i + 1);
    img.onerror = function() {
      thumb.classList.add('img-thumb--error');
      thumb.innerHTML = '<i class="fas fa-image" style="font-size:1.5rem;color:#ccc;"></i><br><span>No carga</span>';
    };
    thumb.appendChild(img);

    var zoom = document.createElement('div');
    zoom.className = 'img-thumb__zoom';
    zoom.innerHTML = '<i class="fas fa-expand"></i>';
    thumb.appendChild(zoom);

    thumb.onclick = function(e) {
      if (e.target.closest('.img-thumb__actions')) return;
      openLightbox(i);
    };

    if (i === 0) {
      var badge = document.createElement('div');
      badge.className = 'img-thumb__badge';
      badge.textContent = 'Principal';
      thumb.appendChild(badge);
    }

    var actions = document.createElement('div');
    actions.className = 'img-thumb__actions';

    if (i > 0) {
      var starBtn = document.createElement('button');
      starBtn.title = 'Hacer principal';
      starBtn.innerHTML = '<i class="fas fa-star"></i>';
      starBtn.onclick = function(e) { e.stopPropagation(); makeImagePrimary(i); };
      actions.appendChild(starBtn);
    }

    if (i > 0) {
      var leftBtn = document.createElement('button');
      leftBtn.title = 'Mover izquierda';
      leftBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
      leftBtn.onclick = function(e) { e.stopPropagation(); moveImage(i, i - 1); };
      actions.appendChild(leftBtn);
    }
    if (i < productImages.length - 1) {
      var rightBtn = document.createElement('button');
      rightBtn.title = 'Mover derecha';
      rightBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
      rightBtn.onclick = function(e) { e.stopPropagation(); moveImage(i, i + 1); };
      actions.appendChild(rightBtn);
    }

    var editBtn = document.createElement('button');
    editBtn.title = 'Cambiar URL';
    editBtn.innerHTML = '<i class="fas fa-pen"></i>';
    editBtn.onclick = function(e) { e.stopPropagation(); editImageUrl(i); };
    actions.appendChild(editBtn);

    var dlBtn = document.createElement('button');
    dlBtn.title = 'Descargar';
    dlBtn.innerHTML = '<i class="fas fa-download"></i>';
    dlBtn.onclick = function(e) { e.stopPropagation(); downloadImage(url, i); };
    actions.appendChild(dlBtn);

    var rmBtn = document.createElement('button');
    rmBtn.title = 'Eliminar';
    rmBtn.className = 'img-action--danger';
    rmBtn.innerHTML = '<i class="fas fa-trash"></i>';
    rmBtn.onclick = function(e) { e.stopPropagation(); removeProductImage(i); };
    actions.appendChild(rmBtn);

    thumb.appendChild(actions);
    gallery.appendChild(thumb);
  });
  updateProductPreview();
}

function makeImagePrimary(idx) {
  var url = productImages.splice(idx, 1)[0];
  productImages.unshift(url);
  renderProductImages();
  showToast('Imagen establecida como principal');
}

function moveImage(from, to) {
  var url = productImages.splice(from, 1)[0];
  productImages.splice(to, 0, url);
  renderProductImages();
}

function editImageUrl(idx) {
  var current = productImages[idx];
  var newUrl = prompt('Editar URL de imagen:', current);
  if (newUrl !== null && newUrl.trim() !== '') {
    productImages[idx] = newUrl.trim();
    renderProductImages();
    showToast('URL de imagen actualizada');
  }
}

function switchImageTab(tab) {
  var tabs = document.querySelectorAll('.img-tab');
  tabs[0].classList.toggle('active', tab === 'url');
  tabs[1].classList.toggle('active', tab === 'file');
  document.getElementById('imgTabUrl').style.display = tab === 'url' ? 'flex' : 'none';
  document.getElementById('imgTabFile').style.display = tab === 'file' ? 'flex' : 'none';
}

function addProductImagesFromFiles(input) {
  var files = input.files;
  if (!files || files.length === 0) return;
  var pending = files.length;
  Array.from(files).forEach(function(file) {
    if (!file.type.startsWith('image/')) {
      pending--;
      if (pending === 0) renderProductImages();
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      productImages.push(e.target.result);
      pending--;
      if (pending === 0) {
        renderProductImages();
        showToast(files.length + (files.length === 1 ? ' imagen agregada' : ' imágenes agregadas'));
      }
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function downloadImage(url, idx) {
  fetch(url)
    .then(function(res) { return res.blob(); })
    .then(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      var ext = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
      a.download = 'producto-imagen-' + (idx + 1) + (ext ? '.' + ext[1] : '.jpg');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    })
    .catch(function() {
      window.open(url, '_blank');
    });
}

// --- Lightbox ---
var lightboxIndex = 0;

function openLightbox(idx) {
  lightboxIndex = idx;
  var lb = document.getElementById('imgLightbox');
  document.getElementById('imgLightboxImg').src = productImages[idx];
  document.getElementById('imgLightboxCounter').textContent = (idx + 1) + ' / ' + productImages.length;
  lb.classList.add('active');
}

function closeLightbox() {
  document.getElementById('imgLightbox').classList.remove('active');
}

function lightboxNext() {
  if (productImages.length === 0) return;
  lightboxIndex = (lightboxIndex + 1) % productImages.length;
  openLightbox(lightboxIndex);
}

function lightboxPrev() {
  if (productImages.length === 0) return;
  lightboxIndex = (lightboxIndex - 1 + productImages.length) % productImages.length;
  openLightbox(lightboxIndex);
}

document.addEventListener('keydown', function(e) {
  var lb = document.getElementById('imgLightbox');
  if (!lb || !lb.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') lightboxNext();
  if (e.key === 'ArrowLeft') lightboxPrev();
});

function addProductImage() {
  var input = document.getElementById('prodImageInput');
  var url = input.value.trim();
  if (!url) { showToast('Pega una URL de imagen', 'error'); return; }
  productImages.push(url);
  input.value = '';
  renderProductImages();
}

function removeProductImage(idx) {
  productImages.splice(idx, 1);
  renderProductImages();
}

function openEditProduct(id) {
  var p = (typeof ProductManager !== 'undefined') ? ProductManager.getById(id) : null;
  if (!p) return;
  productModalMode = 'edit';
  document.getElementById('productModalTitle').textContent = 'Editar Producto';
  document.getElementById('prodEditId').value = p.id;
  document.getElementById('prodEditName').value = p.name || '';
  document.getElementById('prodEditPrice').value = p.price || '';
  document.getElementById('prodEditSalePrice').value = p.salePrice || '';
  var pctInput = document.getElementById('prodEditSalePct');
  if (p.salePrice && p.price && p.salePrice < p.price) {
    pctInput.value = Math.round((1 - p.salePrice / p.price) * 100);
  } else {
    pctInput.value = '';
  }
  document.getElementById('prodEditCategory').value = p.category || 'collares';
  document.getElementById('prodEditStatus').value = p.status || 'in-stock';
  document.getElementById('prodEditStock').value = (p.stock !== undefined && p.stock !== null) ? p.stock : '';
  document.getElementById('prodEditStockMin').value = p.stockMin || '';
  document.getElementById('prodEditDesc').value = p.description || '';
  document.getElementById('prodEditSku').value = p.sku || '';
  document.getElementById('prodEditWeight').value = p.weight || '';
  document.getElementById('prodEditNotes').value = p.notes || '';

  if (p.scheduledAt) {
    var sd = new Date(p.scheduledAt);
    document.getElementById('prodSchedDate').value = sd.toISOString().slice(0, 10);
    document.getElementById('prodSchedTime').value = sd.toTimeString().slice(0, 5);
    var info = document.getElementById('schedInfo');
    if (new Date(p.scheduledAt) > new Date()) {
      info.style.display = 'block';
      document.getElementById('schedBadge').innerHTML = '<i class="fas fa-clock"></i> Publicación programada para ' + sd.toLocaleDateString('es-CL', { day: '2-digit', month: 'long' }) + ' a las ' + sd.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      info.style.display = 'none';
    }
    updateSchedPreview();
  } else {
    document.getElementById('prodSchedDate').value = '';
    document.getElementById('prodSchedTime').value = '';
    document.getElementById('schedPreview').style.display = 'none';
    document.getElementById('schedInfo').style.display = 'none';
  }

  var pubCb = document.getElementById('prodPublished');
  if (pubCb) {
    pubCb.checked = p.published !== false;
    updatePublishedLabel();
  }

  var matGold = document.getElementById('matGold');
  var matSilver = document.getElementById('matSilver');
  if (matGold && matSilver) {
    var mats = p.materials || ['Gold'];
    matGold.checked = mats.indexOf('Gold') !== -1;
    matSilver.checked = mats.indexOf('Silver') !== -1;
  }

  productImages = (p.images && p.images.length) ? p.images.slice() : [];
  renderProductImages();
  document.getElementById('prodImageInput').value = '';

  if (p._hasOverride && !p._isCustom) {
    document.getElementById('prodEditResetWrap').style.display = 'inline';
  } else {
    document.getElementById('prodEditResetWrap').style.display = 'none';
  }

  updateSaleInfo();
  openProductModal();
  updateProductPreview();
  renderProductHistory(p);
}

function openAddProduct() {
  productModalMode = 'add';
  document.getElementById('productModalTitle').textContent = 'Agregar Producto';
  document.getElementById('prodEditId').value = '';
  document.getElementById('productForm').reset();
  productImages = [];
  renderProductImages();
  document.getElementById('prodEditSaleInfo').style.display = 'none';
  document.getElementById('prodEditResetWrap').style.display = 'none';
  renderProductHistory(null);
  var pubCb = document.getElementById('prodPublished');
  if (pubCb) { pubCb.checked = true; updatePublishedLabel(); }
  var matGold = document.getElementById('matGold');
  var matSilver = document.getElementById('matSilver');
  if (matGold) matGold.checked = true;
  if (matSilver) matSilver.checked = false;
  openProductModal();
  updateProductPreview();
}

var _saleSyncSource = '';

function updateSaleFromPrice() {
  if (_saleSyncSource === 'pct') return;
  _saleSyncSource = 'price';
  var price = parseInt(document.getElementById('prodEditPrice').value) || 0;
  var sale = parseInt(document.getElementById('prodEditSalePrice').value) || 0;
  var pctInput = document.getElementById('prodEditSalePct');
  if (sale > 0 && sale < price) {
    pctInput.value = Math.round((1 - sale / price) * 100);
  } else {
    pctInput.value = '';
  }
  _saleSyncSource = '';
  updateSaleInfo();
}

function updateSaleFromPct() {
  if (_saleSyncSource === 'price') return;
  _saleSyncSource = 'pct';
  var price = parseInt(document.getElementById('prodEditPrice').value) || 0;
  var pct = parseInt(document.getElementById('prodEditSalePct').value) || 0;
  var saleInput = document.getElementById('prodEditSalePrice');
  if (pct > 0 && pct < 100 && price > 0) {
    saleInput.value = Math.round(price * (1 - pct / 100));
  } else {
    saleInput.value = '';
  }
  _saleSyncSource = '';
  updateSaleInfo();
}

function updateSaleInfo() {
  var price = parseInt(document.getElementById('prodEditPrice').value) || 0;
  var sale = parseInt(document.getElementById('prodEditSalePrice').value) || 0;
  var info = document.getElementById('prodEditSaleInfo');
  if (sale > 0 && sale < price) {
    var pct = Math.round((1 - sale / price) * 100);
    var ahorro = price - sale;
    document.getElementById('prodEditDiscount').textContent = pct + '% de descuento — Cliente paga ' + fmtPrice(sale) + ' (ahorra ' + fmtPrice(ahorro) + ')';
    info.style.display = 'flex';
  } else {
    info.style.display = 'none';
  }
}

function updatePublishedLabel() {
  var cb = document.getElementById('prodPublished');
  var label = document.getElementById('prodPublishedLabel');
  if (cb && label) {
    label.textContent = cb.checked ? 'Publicado' : 'Borrador';
  }
}

function updateProductPreview() {
  var name = document.getElementById('prodEditName').value.trim() || 'Nombre del producto';
  var price = parseInt(document.getElementById('prodEditPrice').value) || 0;
  var salePrice = parseInt(document.getElementById('prodEditSalePrice').value) || 0;
  var status = document.getElementById('prodEditStatus').value;
  var published = document.getElementById('prodPublished').checked;
  var productId = document.getElementById('prodEditId').value;

  document.getElementById('prodPreviewName').textContent = name;

  var priceHtml = '';
  if (salePrice > 0 && salePrice < price) {
    priceHtml = '<span class="original-price">' + fmtPrice(price) + '</span> ' + fmtPrice(salePrice);
  } else if (price > 0) {
    priceHtml = fmtPrice(price);
  } else {
    priceHtml = '$0';
  }
  document.getElementById('prodPreviewPrice').innerHTML = priceHtml;

  var imgWrap = document.getElementById('prodPreviewImgWrap');
  if (productImages.length > 0) {
    var badges = '';
    if (status === 'agotado') badges += '<span class="prod-preview__badge prod-preview__badge--sold-out">Agotado</span>';
    if (salePrice > 0 && salePrice < price) badges += '<span class="prod-preview__badge prod-preview__badge--offer">Oferta</span>';
    if (!published) badges += '<span class="prod-preview__badge prod-preview__badge--draft">Borrador</span>';
    imgWrap.innerHTML = '<img src="' + productImages[0] + '" alt="Preview">' + badges;
  } else {
    imgWrap.innerHTML = '<div class="prod-preview__empty"><div class="prod-preview__empty-text"><i class="fas fa-image"></i>Sin imagen</div></div>';
  }

  var previewLink = document.getElementById('prodPreviewLink');
  var previewHint = document.getElementById('prodPreviewHint');
  if (previewLink && previewHint) {
    if (productId && productModalMode === 'edit') {
      previewLink.href = '../producto.html?id=' + encodeURIComponent(productId);
      previewLink.style.display = 'flex';
      if (published) {
        previewHint.style.display = 'block';
        previewHint.className = 'prod-preview__hint prod-preview__hint--live';
        previewHint.innerHTML = '<i class="fas fa-check-circle"></i> Este producto es visible para los clientes en la tienda.';
      } else {
        previewHint.style.display = 'block';
        previewHint.className = 'prod-preview__hint prod-preview__hint--draft';
        previewHint.innerHTML = '<i class="fas fa-eye-slash"></i> Borrador: solo visible para administradores. Activa el toggle para publicar.';
      }
    } else {
      previewLink.style.display = 'none';
      if (productModalMode === 'add') {
        previewHint.style.display = 'block';
        previewHint.className = 'prod-preview__hint prod-preview__hint--draft';
        previewHint.innerHTML = '<i class="fas fa-info-circle"></i> Guarda el producto para obtener el enlace de vista previa.';
      } else {
        previewHint.style.display = 'none';
      }
    }
  }
}

function compressImage(dataUrl, maxWidth, quality) {
  return new Promise(function(resolve) {
    if (!dataUrl.startsWith('data:image')) { resolve(dataUrl); return; }
    var img = new Image();
    img.onload = function() {
      var w = img.width;
      var h = img.height;
      if (w > maxWidth) {
        h = Math.round(h * maxWidth / w);
        w = maxWidth;
      }
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = function() { resolve(dataUrl); };
    img.src = dataUrl;
  });
}

var FIELD_LABELS = {
  name: 'Nombre', price: 'Precio', salePrice: 'Precio oferta', category: 'Categoría',
  status: 'Estado stock', stock: 'Stock', stockMin: 'Stock mínimo',
  description: 'Descripción', sku: 'SKU', weight: 'Peso', notes: 'Notas',
  images: 'Imágenes', materials: 'Materiales', published: 'Visibilidad',
  scheduledAt: 'Publicación programada'
};
var STATUS_LABELS = { disponible: 'Disponible', agotado: 'Agotado', preventa: 'Preventa' };
var CAT_LABELS = { anillos: 'Anillos', collares: 'Collares', pulseras: 'Pulseras', aros: 'Aros' };
var MAT_LABELS = { Gold: 'Oro 18K', Silver: 'Plata' };

function detectChanges(oldP, newData) {
  var changes = [];
  Object.keys(FIELD_LABELS).forEach(function(key) {
    var oldVal = oldP[key];
    var newVal = newData[key];

    if (key === 'name') {
      if (String(oldVal || '') !== String(newVal || '')) {
        changes.push('Nombre: "' + (oldVal || '') + '" → "' + (newVal || '') + '"');
      }
      return;
    }

    if (key === 'price') {
      var op = Number(oldVal) || 0;
      var np = Number(newVal) || 0;
      if (op !== np) {
        changes.push('Precio: ' + fmtPrice(op) + ' → ' + fmtPrice(np));
      }
      return;
    }

    if (key === 'salePrice') {
      var oldSale = Number(oldVal) || 0;
      var newSale = Number(newVal) || 0;
      var basePrice = Number(newData.price || oldP.price) || 0;
      if (oldSale === newSale) return;
      if (oldSale === 0 && newSale > 0) {
        var pct = basePrice > 0 ? Math.round((1 - newSale / basePrice) * 100) : 0;
        changes.push('Oferta activada: ' + fmtPrice(basePrice) + ' → ' + fmtPrice(newSale) + ' (-' + pct + '%)');
      } else if (oldSale > 0 && newSale === 0) {
        changes.push('Oferta desactivada: se eliminó precio oferta ' + fmtPrice(oldSale) + ' (vuelve a ' + fmtPrice(basePrice) + ')');
      } else {
        var oldPct = basePrice > 0 ? Math.round((1 - oldSale / basePrice) * 100) : 0;
        var newPct = basePrice > 0 ? Math.round((1 - newSale / basePrice) * 100) : 0;
        changes.push('Precio oferta: ' + fmtPrice(oldSale) + ' (-' + oldPct + '%) → ' + fmtPrice(newSale) + ' (-' + newPct + '%)');
      }
      return;
    }

    if (key === 'category') {
      if (String(oldVal || '') !== String(newVal || '')) {
        var oldCat = CAT_LABELS[oldVal] || oldVal || '-';
        var newCat = CAT_LABELS[newVal] || newVal || '-';
        changes.push('Categoría: ' + oldCat + ' → ' + newCat);
      }
      return;
    }

    if (key === 'status') {
      if (String(oldVal || '') !== String(newVal || '')) {
        var oldSt = STATUS_LABELS[oldVal] || oldVal || '-';
        var newSt = STATUS_LABELS[newVal] || newVal || '-';
        changes.push('Stock: ' + oldSt + ' → ' + newSt);
      }
      return;
    }

    if (key === 'stock') {
      var oldStock = (oldVal !== undefined && oldVal !== null) ? Number(oldVal) : null;
      var newStock = (newVal !== undefined && newVal !== null) ? Number(newVal) : null;
      if (oldStock !== newStock) {
        var oldLabel = oldStock !== null ? String(oldStock) + ' uds' : 'sin definir';
        var newLabel = newStock !== null ? String(newStock) + ' uds' : 'sin definir';
        changes.push('Stock: ' + oldLabel + ' → ' + newLabel);
      }
      return;
    }

    if (key === 'stockMin') {
      var oldMin = (oldVal !== undefined && oldVal !== null) ? Number(oldVal) : null;
      var newMin = (newVal !== undefined && newVal !== null) ? Number(newVal) : null;
      if (oldMin !== newMin) {
        var oldMLabel = oldMin !== null ? String(oldMin) + ' uds' : 'sin definir';
        var newMLabel = newMin !== null ? String(newMin) + ' uds' : 'sin definir';
        changes.push('Stock mínimo: ' + oldMLabel + ' → ' + newMLabel);
      }
      return;
    }

    if (key === 'description') {
      var oldDesc = String(oldVal || '');
      var newDesc = String(newVal || '');
      if (oldDesc !== newDesc) {
        var oldLen = oldDesc.length;
        var newLen = newDesc.length;
        changes.push('Descripción modificada (' + oldLen + ' → ' + newLen + ' caracteres)');
      }
      return;
    }

    if (key === 'images') {
      var oldImgs = (oldVal || []).length;
      var newImgs = (newVal || []).length;
      if (oldImgs !== newImgs || JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        if (oldImgs === 0 && newImgs > 0) {
          changes.push('Imágenes agregadas (' + newImgs + ')');
        } else if (newImgs === 0) {
          changes.push('Todas las imágenes eliminadas');
        } else {
          var diff = newImgs - oldImgs;
          if (diff > 0) changes.push('Imágenes: +' + diff + ' agregada' + (diff !== 1 ? 's' : '') + ' (' + oldImgs + ' → ' + newImgs + ')');
          else if (diff < 0) changes.push('Imágenes: ' + Math.abs(diff) + ' eliminada' + (Math.abs(diff) !== 1 ? 's' : '') + ' (' + oldImgs + ' → ' + newImgs + ')');
          else changes.push('Imágenes reordenadas (' + newImgs + ')');
        }
      }
      return;
    }

    if (key === 'materials') {
      var oldMats = (oldVal || []).map(function(m) { return MAT_LABELS[m] || m; });
      var newMats = (newVal || []).map(function(m) { return MAT_LABELS[m] || m; });
      if (JSON.stringify(oldVal || []) !== JSON.stringify(newVal || [])) {
        changes.push('Materiales: ' + (oldMats.join(', ') || 'ninguno') + ' → ' + (newMats.join(', ') || 'ninguno'));
      }
      return;
    }

    if (key === 'sku') {
      if (String(oldVal || '') !== String(newVal || '')) {
        changes.push('SKU: "' + (oldVal || '-') + '" → "' + (newVal || '-') + '"');
      }
      return;
    }

    if (key === 'weight') {
      var oldW = (oldVal !== undefined && oldVal !== null) ? Number(oldVal) : null;
      var newW = (newVal !== undefined && newVal !== null) ? Number(newVal) : null;
      if (oldW !== newW) {
        changes.push('Peso: ' + (oldW !== null ? oldW + 'g' : '-') + ' → ' + (newW !== null ? newW + 'g' : '-'));
      }
      return;
    }

    if (key === 'notes') {
      if (String(oldVal || '') !== String(newVal || '')) {
        changes.push('Notas internas modificadas');
      }
      return;
    }

    if (key === 'published') {
      var oldPub = oldVal !== false;
      var newPub = newVal !== false;
      if (oldPub !== newPub) {
        changes.push(newPub ? 'Visibilidad: Borrador → Publicado' : 'Visibilidad: Publicado → Borrador');
      }
      return;
    }

    if (key === 'scheduledAt') {
      var oldSched = oldVal || null;
      var newSched = newVal || null;
      if (oldSched !== newSched) {
        if (!oldSched && newSched) {
          var sd = new Date(newSched);
          changes.push('Publicación programada: ' + sd.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + sd.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }));
        } else if (oldSched && !newSched) {
          changes.push('Publicación programada cancelada');
        } else {
          var sd2 = new Date(newSched);
          changes.push('Publicación reprogramada: ' + sd2.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + sd2.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }));
        }
      }
      return;
    }
  });
  return changes;
}

function buildHistoryEntry(action, changes, extra) {
  var entry = { date: new Date().toISOString(), action: action };
  if (changes && changes.length > 0) entry.changes = changes;
  if (extra) entry.extra = extra;
  return entry;
}

function timeAgo(dateStr) {
  var now = Date.now();
  var then = new Date(dateStr).getTime();
  var diff = Math.max(0, now - then);
  var sec = Math.floor(diff / 1000);
  if (sec < 60) return 'hace un momento';
  var min = Math.floor(sec / 60);
  if (min < 60) return 'hace ' + min + ' min';
  var hrs = Math.floor(min / 60);
  if (hrs < 24) return 'hace ' + hrs + 'h';
  var days = Math.floor(hrs / 24);
  if (days < 30) return 'hace ' + days + 'd';
  var months = Math.floor(days / 30);
  if (months < 12) return 'hace ' + months + (months === 1 ? ' mes' : ' meses');
  var years = Math.floor(months / 12);
  return 'hace ' + years + (years === 1 ? ' año' : ' años');
}

function dayKey(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

var HISTORY_ACTION_LABELS = {
  created: 'Producto creado',
  updated: 'Producto actualizado',
  archived: 'Producto archivado',
  restored: 'Producto restaurado',
  duplicated: 'Duplicado de otro producto',
  published: 'Publicado en tienda',
  unpublished: 'Ocultado de la tienda'
};
var HISTORY_ACTION_ICONS = {
  created: 'fa-plus', updated: 'fa-pen', archived: 'fa-box-archive',
  restored: 'fa-rotate-left', duplicated: 'fa-copy', published: 'fa-eye', unpublished: 'fa-eye-slash'
};
var CHANGE_ICONS = {
  'Nombre': 'fa-tag', 'Precio': 'fa-dollar-sign', 'Oferta': 'fa-percent',
  'Precio oferta': 'fa-percent', 'Categoría': 'fa-layer-group', 'Stock mínimo': 'fa-triangle-exclamation',
  'Stock': 'fa-boxes-stacked', 'Descripción': 'fa-align-left', 'Imágenes': 'fa-images',
  'Materiales': 'fa-gem', 'Visibilidad': 'fa-eye', 'SKU': 'fa-barcode',
  'Peso': 'fa-weight-hanging', 'Notas': 'fa-note-sticky', 'Publicación programada': 'fa-calendar-clock',
  'Publicación reprogramada': 'fa-calendar-clock', 'Publicación automática': 'fa-calendar-check'
};

function getChangeIcon(changeText) {
  var keys = Object.keys(CHANGE_ICONS);
  for (var i = 0; i < keys.length; i++) {
    if (changeText.indexOf(keys[i]) === 0) return CHANGE_ICONS[keys[i]];
  }
  return 'fa-circle-dot';
}

var _historyFilter = 'all';

function filterHistory(type) {
  _historyFilter = type;
  var btns = document.querySelectorAll('.prod-history__filter-btn');
  btns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-filter') === type); });
  var entries = document.querySelectorAll('.prod-history__entry');
  var daySeps = document.querySelectorAll('.prod-history__day-sep');
  entries.forEach(function(el) {
    if (type === 'all') { el.style.display = ''; return; }
    el.style.display = el.getAttribute('data-action') === type ? '' : 'none';
  });
  daySeps.forEach(function(sep) {
    var next = sep.nextElementSibling;
    var show = false;
    while (next && !next.classList.contains('prod-history__day-sep')) {
      if (next.style.display !== 'none') show = true;
      next = next.nextElementSibling;
    }
    sep.style.display = show ? '' : 'none';
  });
}

function renderProductHistory(product) {
  var section = document.getElementById('prodHistorySection');
  var datesEl = document.getElementById('prodDates');
  var listEl = document.getElementById('prodHistoryList');
  var countEl = document.getElementById('prodHistoryCount');

  if (!product || productModalMode === 'add') {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  _historyFilter = 'all';

  var now = Date.now();
  var datesHtml = '';
  datesHtml += '<div class="prod-dates__item"><span class="prod-dates__label">Creado</span><span class="prod-dates__value">' + (product.createdAt ? fmtDateTime(product.createdAt) : 'Producto original') + '</span>';
  if (product.createdAt) datesHtml += '<span class="prod-dates__ago">' + timeAgo(product.createdAt) + '</span>';
  datesHtml += '</div>';
  datesHtml += '<div class="prod-dates__item"><span class="prod-dates__label">Última modificación</span><span class="prod-dates__value">' + (product.updatedAt ? fmtDateTime(product.updatedAt) : '-') + '</span>';
  if (product.updatedAt) datesHtml += '<span class="prod-dates__ago">' + timeAgo(product.updatedAt) + '</span>';
  datesHtml += '</div>';

  var history = (product.history || []).slice();
  var totalEdits = 0;
  var actionCounts = {};
  history.forEach(function(e) {
    var a = e.action || 'updated';
    actionCounts[a] = (actionCounts[a] || 0) + 1;
    if (a === 'updated') totalEdits++;
  });

  datesHtml += '<div class="prod-dates__item"><span class="prod-dates__label">Total de cambios</span><span class="prod-dates__value">' + history.length + '</span></div>';
  if (totalEdits > 0) {
    datesHtml += '<div class="prod-dates__item"><span class="prod-dates__label">Ediciones</span><span class="prod-dates__value">' + totalEdits + '</span></div>';
  }
  datesEl.innerHTML = datesHtml;

  var reversed = history.slice().reverse();
  if (countEl) countEl.textContent = reversed.length;

  if (reversed.length === 0) {
    listEl.innerHTML = '<div class="prod-history__empty"><i class="fas fa-clock-rotate-left" style="opacity:0.3;display:block;font-size:1.3rem;margin-bottom:6px;"></i>Sin historial de cambios</div>';
    return;
  }

  var h = '';

  var availableTypes = Object.keys(actionCounts);
  if (availableTypes.length > 1) {
    h += '<div class="prod-history__filters">';
    h += '<button class="prod-history__filter-btn active" data-filter="all" onclick="filterHistory(\'all\')">Todos</button>';
    var filterOrder = ['updated','created','published','unpublished','archived','restored','duplicated'];
    filterOrder.forEach(function(type) {
      if (!actionCounts[type]) return;
      h += '<button class="prod-history__filter-btn" data-filter="' + type + '" onclick="filterHistory(\'' + type + '\')">' + (HISTORY_ACTION_LABELS[type] || type).replace('Producto ','') + ' (' + actionCounts[type] + ')</button>';
    });
    h += '</div>';
  }

  var lastDay = '';
  reversed.forEach(function(entry) {
    var cls = entry.action || 'updated';
    var day = entry.date ? dayKey(entry.date) : '';
    if (day && day !== lastDay) {
      h += '<div class="prod-history__day-sep">' + day + '</div>';
      lastDay = day;
    }
    h += '<div class="prod-history__entry prod-history__entry--' + cls + '" data-action="' + cls + '">';
    h += '<div class="prod-history__dot"></div>';
    h += '<div class="prod-history__header">';
    h += '<span class="prod-history__badge prod-history__badge--' + cls + '"><i class="fas ' + (HISTORY_ACTION_ICONS[cls] || 'fa-circle') + '"></i> ' + (HISTORY_ACTION_LABELS[cls] || cls) + '</span>';
    if (entry.date) {
      var t = new Date(entry.date);
      h += '<span class="prod-history__time">' + t.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' <span class="prod-history__ago">' + timeAgo(entry.date) + '</span></span>';
    }
    h += '</div>';
    if (entry.changes && entry.changes.length > 0) {
      h += '<ul class="prod-history__detail-list">';
      entry.changes.forEach(function(c) {
        var icon = getChangeIcon(c);
        h += '<li class="prod-history__detail-item"><i class="fas ' + icon + ' prod-history__detail-icon"></i> ' + escHtml(c) + '</li>';
      });
      h += '</ul>';
    }
    if (entry.extra) {
      h += '<div class="prod-history__extra"><i class="fas fa-info-circle"></i> ' + escHtml(entry.extra) + '</div>';
    }
    h += '</div>';
  });
  listEl.innerHTML = h;
}

function saveProduct() {
  var name = document.getElementById('prodEditName').value.trim();
  var price = parseInt(document.getElementById('prodEditPrice').value) || 0;
  var salePrice = parseInt(document.getElementById('prodEditSalePrice').value) || 0;
  var category = document.getElementById('prodEditCategory').value;
  var status = document.getElementById('prodEditStatus').value;
  var stockVal = document.getElementById('prodEditStock').value;
  var stock = stockVal !== '' ? parseInt(stockVal) : null;
  var stockMinVal = document.getElementById('prodEditStockMin').value;
  var stockMin = stockMinVal !== '' ? parseInt(stockMinVal) : null;
  var desc = document.getElementById('prodEditDesc').value.trim();
  var sku = document.getElementById('prodEditSku').value.trim();
  var weightVal = document.getElementById('prodEditWeight').value;
  var weight = weightVal !== '' ? parseFloat(weightVal) : null;
  var notes = document.getElementById('prodEditNotes').value.trim();

  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
  if (price <= 0) { showToast('El precio debe ser mayor a 0', 'error'); return; }
  if (salePrice > 0 && salePrice >= price) { showToast('El precio oferta debe ser menor al precio normal', 'error'); return; }

  var promises = productImages.map(function(url) {
    return compressImage(url, 800, 0.75);
  });

  Promise.all(promises).then(function(compressedImages) {
    var data = {
      name: name,
      price: price,
      category: category,
      status: status,
      stock: stock,
      stockMin: stockMin,
      description: desc,
      sku: sku,
      weight: weight,
      notes: notes,
      images: compressedImages
    };

    if (salePrice > 0 && salePrice < price) {
      data.salePrice = salePrice;
    } else {
      data.salePrice = null;
    }

    data.published = document.getElementById('prodPublished').checked;

    var schedDate = document.getElementById('prodSchedDate').value;
    var schedTime = document.getElementById('prodSchedTime').value;
    if (schedDate) {
      var schedDT = new Date(schedDate + 'T' + (schedTime || '00:00'));
      if (schedDT > new Date()) {
        data.scheduledAt = schedDT.toISOString();
        data.published = false;
      } else {
        data.scheduledAt = null;
      }
    } else {
      data.scheduledAt = null;
    }

    var materials = [];
    if (document.getElementById('matGold') && document.getElementById('matGold').checked) materials.push('Gold');
    if (document.getElementById('matSilver') && document.getElementById('matSilver').checked) materials.push('Silver');
    if (materials.length > 0) data.materials = materials;

    if (productModalMode === 'add') {
      var result = ProductManager.add(data);
      if (result && result.error === 'storage_full') {
        showToast('Error: almacenamiento lleno. Usa menos imágenes o imágenes más pequeñas.', 'error');
        return;
      }
      showToast('Producto agregado correctamente');
      logActivity('product', 'agregó el producto "' + (data.name || '') + '"');
    } else {
      var id = document.getElementById('prodEditId').value;
      var oldProduct = ProductManager.getById(id);
      if (oldProduct) {
        var changes = detectChanges(oldProduct, data);
        if (changes.length > 0) {
          data._historyEntry = buildHistoryEntry('updated', changes);
        }
      }
      var updateResult = ProductManager.update(id, data);
      if (updateResult && updateResult.error === 'storage_full') {
        showToast('Error: almacenamiento lleno. Usa menos imágenes o imágenes más pequeñas.', 'error');
        return;
      }
      showToast('Producto actualizado correctamente');
      logActivity('product', 'editó el producto "' + (data.name || oldProduct.name || '') + '"', changes.length > 0 ? changes.length + ' campo' + (changes.length !== 1 ? 's' : '') + ' modificado' + (changes.length !== 1 ? 's' : '') : '');
    }

    closeProductModal();
    loadProducts();
  });
}

function resetProduct() {
  var id = document.getElementById('prodEditId').value;
  if (!id) return;
  var pName = ProductManager.getById(id);
  ProductManager.resetOverride(id);
  showToast('Producto restaurado a valores originales');
  logActivity('product', 'restauró el producto "' + (pName ? pName.name : id) + '" a valores originales');
  closeProductModal();
  loadProducts();
}

var pendingDeleteId = null;
function confirmDeleteProduct(id) {
  pendingDeleteId = id;
  var p = ProductManager.getById(id);
  var overlay = document.getElementById('deleteProductOverlay');
  var msgEl = overlay.querySelector('.admin-modal__body p');
  if (msgEl) {
    msgEl.innerHTML = '¿Eliminar <strong>' + escHtml(p ? p.name : '') + '</strong>? Esta acción no se puede deshacer.';
  }
  overlay.style.display = 'flex';
  document.getElementById('confirmDeleteBtn').onclick = function() {
    var delName = p ? p.name : pendingDeleteId;
    ProductManager.remove(pendingDeleteId);
    overlay.style.display = 'none';
    showToast('Producto eliminado');
    logActivity('product', 'eliminó el producto "' + delName + '"');
    loadProducts();
  };
}

// --- Kebab menu ---
function toggleKebab(e, btn) {
  e.stopPropagation();
  var menu = btn.nextElementSibling;
  var wasOpen = menu.classList.contains('open');
  closeAllKebabs();
  if (!wasOpen) {
    menu.classList.add('open');
    var rect = btn.getBoundingClientRect();
    var menuRect = menu.getBoundingClientRect();
    if (rect.bottom + menuRect.height > window.innerHeight) {
      menu.style.top = 'auto';
      menu.style.bottom = '100%';
      menu.style.marginBottom = '4px';
      menu.style.marginTop = '0';
    }
  }
}

function closeAllKebabs() {
  document.querySelectorAll('.actions-kebab__menu.open').forEach(function(m) {
    m.classList.remove('open');
    m.style.top = '';
    m.style.bottom = '';
    m.style.marginBottom = '';
    m.style.marginTop = '';
  });
}

document.addEventListener('click', function() { closeAllKebabs(); });

// --- Bulk Selection ---
function toggleProductSelect(id, checked) {
  if (checked) {
    selectedProducts[id] = true;
  } else {
    delete selectedProducts[id];
  }
  var row = document.querySelector('input[onchange*="' + id + '"]');
  if (row) {
    var tr = row.closest('tr');
    if (tr) tr.classList.toggle('prod-row--selected', checked);
  }
  updateBulkBar();
  updateSelectAllCheckbox();
}

function toggleSelectAll(checked) {
  var checkboxes = document.querySelectorAll('#productsTableBody .td-check input[type="checkbox"]');
  checkboxes.forEach(function(cb) {
    cb.checked = checked;
    var id = cb.getAttribute('onchange').match(/'([^']+)'/)[1];
    var tr = cb.closest('tr');
    if (checked) {
      selectedProducts[id] = true;
      if (tr) tr.classList.add('prod-row--selected');
    } else {
      delete selectedProducts[id];
      if (tr) tr.classList.remove('prod-row--selected');
    }
  });
  updateBulkBar();
}

function updateSelectAllCheckbox() {
  var all = document.querySelectorAll('#productsTableBody .td-check input[type="checkbox"]');
  var checked = document.querySelectorAll('#productsTableBody .td-check input[type="checkbox"]:checked');
  var selectAllCb = document.getElementById('prodSelectAll');
  if (selectAllCb) {
    selectAllCb.checked = all.length > 0 && all.length === checked.length;
    selectAllCb.indeterminate = checked.length > 0 && checked.length < all.length;
  }
}

function clearSelection() {
  selectedProducts = {};
  document.querySelectorAll('#productsTableBody .td-check input[type="checkbox"]').forEach(function(cb) {
    cb.checked = false;
    var tr = cb.closest('tr');
    if (tr) tr.classList.remove('prod-row--selected');
  });
  var selectAllCb = document.getElementById('prodSelectAll');
  if (selectAllCb) { selectAllCb.checked = false; selectAllCb.indeterminate = false; }
  updateBulkBar();
}

function getSelectedIds() {
  return Object.keys(selectedProducts);
}

function updateBulkBar() {
  var bar = document.getElementById('bulkBar');
  if (!bar) return;
  var ids = getSelectedIds();
  if (ids.length > 0) {
    bar.style.display = 'flex';
    document.getElementById('bulkCount').textContent = ids.length + ' seleccionado' + (ids.length !== 1 ? 's' : '');
  } else {
    bar.style.display = 'none';
  }
}

function bulkPublish(publish) {
  var ids = getSelectedIds();
  if (ids.length === 0) return;
  ids.forEach(function(id) {
    ProductManager.update(id, {
      published: publish,
      _historyEntry: buildHistoryEntry(publish ? 'published' : 'unpublished')
    });
  });
  var bulkMsg = ids.length + ' producto' + (ids.length !== 1 ? 's' : '') + (publish ? ' publicado' : ' ocultado') + (ids.length !== 1 ? 's' : '');
  showToast(bulkMsg);
  logActivity('product', bulkMsg);
  selectedProducts = {};
  loadProducts();
}

function bulkArchive() {
  var ids = getSelectedIds();
  if (ids.length === 0) return;
  var overlay = document.getElementById('archiveProductOverlay');
  document.getElementById('archiveModalTitle').textContent = 'Archivar ' + ids.length + ' producto' + (ids.length !== 1 ? 's' : '');
  document.getElementById('archiveModalText').innerHTML = '¿Archivar <strong>' + ids.length + ' producto' + (ids.length !== 1 ? 's' : '') + '</strong>? Ya no serán visibles en la tienda.';
  var confirmBtn = document.getElementById('confirmArchiveBtn');
  confirmBtn.innerHTML = '<i class="fas fa-box-archive"></i> Archivar ' + ids.length;
  confirmBtn.onclick = function() {
    ids.forEach(function(id) {
      ProductManager.update(id, {
        archived: true,
        published: false,
        _historyEntry: buildHistoryEntry('archived')
      });
    });
    overlay.style.display = 'none';
    var archMsg = ids.length + ' producto' + (ids.length !== 1 ? 's' : '') + ' archivado' + (ids.length !== 1 ? 's' : '');
    showToast(archMsg);
    logActivity('product', archMsg);
    selectedProducts = {};
    loadProducts();
  };
  overlay.style.display = 'flex';
}

function bulkDelete() {
  var ids = getSelectedIds();
  if (ids.length === 0) return;
  var overlay = document.getElementById('deleteProductOverlay');
  var msgEl = overlay.querySelector('.admin-modal__body p');
  if (msgEl) {
    msgEl.innerHTML = '¿Eliminar <strong>' + ids.length + ' producto' + (ids.length !== 1 ? 's' : '') + '</strong>? Esta acción no se puede deshacer.';
  }
  overlay.style.display = 'flex';
  document.getElementById('confirmDeleteBtn').onclick = function() {
    ids.forEach(function(id) {
      ProductManager.remove(id);
    });
    overlay.style.display = 'none';
    var delMsg = ids.length + ' producto' + (ids.length !== 1 ? 's' : '') + ' eliminado' + (ids.length !== 1 ? 's' : '');
    showToast(delMsg);
    logActivity('product', delMsg);
    selectedProducts = {};
    loadProducts();
  };
}

// --- Archive / Restore / Duplicate ---
var pendingArchiveId = null;

function confirmArchiveProduct(id) {
  pendingArchiveId = id;
  var p = ProductManager.getById(id);
  var overlay = document.getElementById('archiveProductOverlay');
  document.getElementById('archiveModalTitle').textContent = 'Archivar Producto';
  document.getElementById('archiveModalText').innerHTML = '¿Archivar <strong>' + escHtml(p ? p.name : '') + '</strong>? Ya no será visible en la tienda, pero podrás restaurarlo en cualquier momento.';
  var confirmBtn = document.getElementById('confirmArchiveBtn');
  confirmBtn.innerHTML = '<i class="fas fa-box-archive"></i> Archivar';
  confirmBtn.className = 'admin-btn admin-btn--primary';
  confirmBtn.onclick = function() {
    ProductManager.update(pendingArchiveId, {
      archived: true,
      published: false,
      _historyEntry: buildHistoryEntry('archived')
    });
    overlay.style.display = 'none';
    showToast('Producto archivado');
    logActivity('product', 'archivó el producto "' + (p ? p.name : pendingArchiveId) + '"');
    loadProducts();
  };
  overlay.style.display = 'flex';
}

function restoreProduct(id) {
  var rp = ProductManager.getById(id);
  ProductManager.update(id, {
    archived: false,
    _historyEntry: buildHistoryEntry('restored')
  });
  showToast('Producto restaurado');
  logActivity('product', 'restauró el producto "' + (rp ? rp.name : id) + '" del archivo');
  loadProducts();
}

function duplicateProduct(id) {
  var p = ProductManager.getById(id);
  if (!p) return;
  var copy = {
    name: p.name + ' (copia)',
    price: p.price,
    category: p.category,
    status: p.status,
    description: p.description || '',
    images: (p.images || []).slice(),
    materials: (p.materials || []).slice(),
    published: false,
    history: [buildHistoryEntry('duplicated', null, 'Origen: ' + p.name)]
  };
  if (p.salePrice) copy.salePrice = p.salePrice;
  var result = ProductManager.add(copy);
  if (result && result.error === 'storage_full') {
    showToast('Error: almacenamiento lleno', 'error');
    return;
  }
  showToast('Producto duplicado como borrador');
  logActivity('product', 'duplicó el producto "' + p.name + '"');
  loadProducts();
}

// Enter en input de imagen agrega automáticamente
document.addEventListener('keydown', function(e) {
  if (e.target.id === 'prodImageInput' && e.key === 'Enter') {
    e.preventDefault();
    addProductImage();
  }
});

// Live discount preview
document.addEventListener('input', function(e) {
  if (e.target.id === 'prodEditPrice') {
    var pctVal = document.getElementById('prodEditSalePct').value;
    if (pctVal) {
      updateSaleFromPct();
    } else {
      updateSaleFromPrice();
    }
    updateProductPreview();
  }
  if (e.target.id === 'prodEditSalePrice') {
    updateSaleFromPrice();
    updateProductPreview();
  }
  if (e.target.id === 'prodEditSalePct') {
    updateSaleFromPct();
    updateProductPreview();
  }
  if (e.target.id === 'prodEditName') {
    updateProductPreview();
  }
});
document.addEventListener('change', function(e) {
  if (e.target.id === 'prodEditStatus') updateProductPreview();
  if (e.target.id === 'prodPublished') {
    updatePublishedLabel();
    updateProductPreview();
  }
});

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
  if (e.target === document.getElementById('productModalOverlay')) closeProductModal();
  if (e.target === document.getElementById('deleteProductOverlay')) {
    document.getElementById('deleteProductOverlay').style.display = 'none';
  }
  if (e.target === document.getElementById('archiveProductOverlay')) {
    document.getElementById('archiveProductOverlay').style.display = 'none';
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeOrderModal();
    closeCustomerModal();
    closeProductModal();
    document.getElementById('deleteProductOverlay').style.display = 'none';
    document.getElementById('archiveProductOverlay').style.display = 'none';
  }
});

// --- Settings ---
var SETTINGS_KEY = 'soberana_settings';
var SETTINGS_DEFAULTS = {
  name: 'MediCap',
  slogan: 'Gorros quir&uacute;rgicos con estilo',
  description: 'Gorros quir&uacute;rgicos para profesionales de la salud',
  email: 'contacto@medicap.cl',
  phone: '+569 48061416',
  address: 'Santiago, Chile',
  instagram: '@medicap_cl',
  facebook: 'facebook.com/medicap.cl',
  tiktok: '',
  whatsapp: '',
  shipCost: 3990,
  freeShipMin: 80000,
  shipTime: '3-5 días hábiles',
  shipNote: '',
  payTransfer: true,
  payWebpay: false,
  payMercadoPago: false,
  payPaypal: false,
  currency: 'CLP',
  color: '#c9a84c',
  colorText: '#c9a84c',
  logo: '',
  favicon: ''
};

function getSettings() {
  try {
    var stored = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return Object.assign({}, SETTINGS_DEFAULTS, stored || {});
  } catch(e) { return Object.assign({}, SETTINGS_DEFAULTS); }
}

function loadSettings() {
  var s = getSettings();
  var fields = {
    settingName: s.name,
    settingSlogan: s.slogan,
    settingDesc: s.description,
    settingEmail: s.email,
    settingPhone: s.phone,
    settingAddress: s.address,
    settingInstagram: s.instagram,
    settingFacebook: s.facebook,
    settingTiktok: s.tiktok,
    settingWhatsapp: s.whatsapp,
    settingShipCost: s.shipCost,
    settingFreeShipMin: s.freeShipMin,
    settingShipTime: s.shipTime,
    settingShipNote: s.shipNote,
    settingCurrency: s.currency,
    settingColor: s.color,
    settingColorText: s.color,
    settingLogo: s.logo,
    settingFavicon: s.favicon
  };
  Object.keys(fields).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id] || '';
  });
  var checks = { payTransfer: s.payTransfer, payWebpay: s.payWebpay, payMercadoPago: s.payMercadoPago, payPaypal: s.payPaypal };
  Object.keys(checks).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.checked = !!checks[id];
  });
  document.getElementById('settingColor').addEventListener('input', function() {
    document.getElementById('settingColorText').value = this.value;
  });
}

function saveSettings() {
  var s = {
    name: document.getElementById('settingName').value.trim(),
    slogan: document.getElementById('settingSlogan').value.trim(),
    description: document.getElementById('settingDesc').value.trim(),
    email: document.getElementById('settingEmail').value.trim(),
    phone: document.getElementById('settingPhone').value.trim(),
    address: document.getElementById('settingAddress').value.trim(),
    instagram: document.getElementById('settingInstagram').value.trim(),
    facebook: document.getElementById('settingFacebook').value.trim(),
    tiktok: document.getElementById('settingTiktok').value.trim(),
    whatsapp: document.getElementById('settingWhatsapp').value.trim(),
    shipCost: parseInt(document.getElementById('settingShipCost').value) || 0,
    freeShipMin: parseInt(document.getElementById('settingFreeShipMin').value) || 0,
    shipTime: document.getElementById('settingShipTime').value.trim(),
    shipNote: document.getElementById('settingShipNote').value.trim(),
    payTransfer: document.getElementById('payTransfer').checked,
    payWebpay: document.getElementById('payWebpay').checked,
    payMercadoPago: document.getElementById('payMercadoPago').checked,
    payPaypal: document.getElementById('payPaypal').checked,
    currency: document.getElementById('settingCurrency').value,
    color: document.getElementById('settingColor').value,
    logo: document.getElementById('settingLogo').value.trim(),
    favicon: document.getElementById('settingFavicon').value.trim()
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  var logo = document.querySelector('.admin-sidebar__logo');
  if (logo) logo.textContent = s.name || 'MediCap';
  document.title = 'Panel Admin | ' + (s.name || 'MediCap');
  logActivity('settings', 'actualizó la configuración de la tienda');
  showToast('Configuración guardada correctamente');
}

function resetSettings() {
  if (!confirm('¿Restaurar toda la configuración a los valores por defecto?')) return;
  localStorage.removeItem(SETTINGS_KEY);
  loadSettings();
  logActivity('settings', 'restauró la configuración a valores por defecto');
  showToast('Configuración restaurada');
}
