var Cart = (function() {
  var STORAGE_KEY = 'medicap_cart';

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateUI();
  }

  function addItem(productId, quantity, material) {
    var items = getItems();
    var key = productId + '_' + (material || 'default');
    var existing = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].key === key) { existing = items[i]; break; }
    }
    if (existing) {
      existing.qty = Math.min(existing.qty + quantity, 10);
    } else {
      items.push({ key: key, id: productId, qty: quantity, material: material || 'default' });
    }
    saveItems(items);
    openDrawer();
  }

  function removeItem(key) {
    var items = getItems().filter(function(item) { return item.key !== key; });
    saveItems(items);
  }

  function updateQty(key, newQty) {
    var items = getItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].key === key) {
        if (newQty <= 0) { items.splice(i, 1); }
        else { items[i].qty = Math.min(newQty, 10); }
        break;
      }
    }
    saveItems(items);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    updateUI();
  }

  function getTotalItems() {
    return getItems().reduce(function(sum, item) { return sum + item.qty; }, 0);
  }

  function getSubtotal() {
    var items = getItems();
    var total = 0;
    var allProds = (typeof ProductManager !== 'undefined') ? ProductManager.getAll() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    items.forEach(function(item) {
      var p = allProds.find(function(pr) { return pr.id === item.id; });
      if (p) {
        var effectivePrice = (p.salePrice && p.salePrice < p.price) ? p.salePrice : p.price;
        total += effectivePrice * item.qty;
      }
    });
    return total;
  }

  function formatPrice(n) {
    return '$' + n.toLocaleString('es-CL');
  }

  // Update all cart UI elements across the page
  function updateUI() {
    // Badge count
    var count = getTotalItems();
    document.querySelectorAll('.cart-count').forEach(function(el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    renderDrawer();
  }

  function renderDrawer() {
    var body = document.querySelector('.cart-drawer-body');
    if (!body) return;
    var items = getItems();

    if (items.length === 0) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
          '<p>Tu carrito está vacío</p>' +
          '<a href="coleccion.html?cat=all" class="cart-continue-btn">Ver productos</a>' +
        '</div>';
      // Remove footer if exists
      var existingFooter = document.querySelector('.cart-drawer-footer');
      if (existingFooter) existingFooter.remove();
      return;
    }

    var html = '<div class="cart-items-list">';
    var allProds = (typeof ProductManager !== 'undefined') ? ProductManager.getAll() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    items.forEach(function(item) {
      var p = allProds.find(function(pr) { return pr.id === item.id; });
      if (!p) return;
      var matLabel = item.material === 'Gold' ? 'Oro 18K' : (item.material === 'Silver' ? 'Plata' : '');
      var displayPrice = (p.salePrice && p.salePrice < p.price) ? p.salePrice : p.price;
      html +=
        '<div class="cart-item" data-key="' + item.key + '">' +
          '<a href="producto.html?id=' + p.id + '" class="cart-item-img">' +
            '<img src="' + p.images[0] + '" alt="' + p.name + '">' +
          '</a>' +
          '<div class="cart-item-info">' +
            '<a href="producto.html?id=' + p.id + '" class="cart-item-name">' + p.name + '</a>' +
            (matLabel ? '<p class="cart-item-variant">' + matLabel + '</p>' : '') +
            '<p class="cart-item-price">' + formatPrice(displayPrice) + '</p>' +
            '<div class="cart-item-controls">' +
              '<div class="cart-qty">' +
                '<button class="cart-qty-btn" data-action="minus" data-key="' + item.key + '">−</button>' +
                '<span class="cart-qty-val">' + item.qty + '</span>' +
                '<button class="cart-qty-btn" data-action="plus" data-key="' + item.key + '">+</button>' +
              '</div>' +
              '<button class="cart-remove-btn" data-key="' + item.key + '" title="Eliminar">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';
    body.innerHTML = html;

    // Cart footer
    var drawer = document.querySelector('.cart-drawer');
    var existingFooter = drawer.querySelector('.cart-drawer-footer');
    if (existingFooter) existingFooter.remove();

    var subtotal = getSubtotal();
    var freeShipping = subtotal >= 80000;
    var footer = document.createElement('div');
    footer.className = 'cart-drawer-footer';
    footer.innerHTML =
      (freeShipping
        ? '<p class="cart-shipping-msg cart-free-ship"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ¡Envío gratis!</p>'
        : '<p class="cart-shipping-msg">Faltan <strong>' + formatPrice(80000 - subtotal) + '</strong> para envío gratis</p>'
      ) +
      '<div class="cart-subtotal">' +
        '<span>Subtotal</span>' +
        '<span>' + formatPrice(subtotal) + '</span>' +
      '</div>' +
      '<a href="checkout.html" class="cart-checkout-btn">FINALIZAR COMPRA</a>' +
      '<a href="coleccion.html?cat=all" class="cart-continue-link">Seguir comprando</a>';
    drawer.appendChild(footer);

    // Bind events
    body.querySelectorAll('.cart-qty-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var key = this.dataset.key;
        var action = this.dataset.action;
        var items = getItems();
        var item = items.find(function(i) { return i.key === key; });
        if (!item) return;
        if (action === 'plus') updateQty(key, item.qty + 1);
        else updateQty(key, item.qty - 1);
      });
    });

    body.querySelectorAll('.cart-remove-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var el = this.closest('.cart-item');
        el.style.transform = 'translateX(100%)';
        el.style.opacity = '0';
        setTimeout(function() { removeItem(btn.dataset.key); }, 300);
      });
    });
  }

  function openDrawer() {
    var cartDrawer = document.getElementById('cartDrawer');
    var cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
  }

  // Init on every page load
  document.addEventListener('DOMContentLoaded', function() {
    updateUI();
  });

  return {
    add: addItem,
    remove: removeItem,
    updateQty: updateQty,
    getItems: getItems,
    getSubtotal: getSubtotal,
    getTotalItems: getTotalItems,
    clear: clear,
    formatPrice: formatPrice,
    openDrawer: openDrawer,
    updateUI: updateUI
  };
})();
