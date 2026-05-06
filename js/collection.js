document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var cat = params.get('cat') || 'all';
  var minPrice = parseInt(params.get('min')) || 0;
  var maxPrice = parseInt(params.get('max')) || 999999;

  var catInfo = CATEGORIES[cat];
  var title = cat === 'all' ? 'Todos los Productos' : (catInfo ? catInfo.name : 'Colección');
  var bannerImg = catInfo ? catInfo.banner : 'https://www.drwoofapparel.com/cdn/shop/files/002_Dinosaurs_Front_1600x.jpg?v=1708999209';

  document.title = title + ' | MediCap';
  document.getElementById('collectionTitle').textContent = title;
  document.getElementById('breadcrumbCat').textContent = title;
  document.getElementById('collectionBanner').style.backgroundImage = 'url(' + bannerImg + ')';

  var allProducts = (typeof ProductManager !== 'undefined') ? ProductManager.getPublished() : PRODUCTS.slice();
  var products = cat === 'all' ? allProducts : allProducts.filter(function(p) { return p.category === cat; });
  products = products.filter(function(p) {
    var effectivePrice = (p.salePrice && p.salePrice < p.price) ? p.salePrice : p.price;
    return effectivePrice >= minPrice && effectivePrice <= maxPrice;
  });

  function renderProducts(list) {
    var grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    document.getElementById('productCount').textContent = list.length + ' productos';

    if (list.length === 0) {
      grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:60px 0;color:#999;">No se encontraron productos.</p>';
      return;
    }

    list.forEach(function(p) {
      var card = document.createElement('a');
      card.href = 'producto.html?id=' + p.id;
      card.className = 'product-card';

      var badge = '';
      if (p.status === 'agotado') {
        badge = '<span class="product-badge sold-out">Agotado</span>';
      }
      var hasOffer = p.originalPrice || (p.salePrice && p.salePrice < p.price);
      if (hasOffer) {
        badge += '<span class="product-badge" style="background:#c9a84c;">Oferta</span>';
      }

      var priceHtml = '';
      if (p.originalPrice) {
        priceHtml = '<span class="original-price">' + formatPrice(p.originalPrice) + '</span> ' + formatPrice(p.price);
      } else if (p.salePrice && p.salePrice < p.price) {
        priceHtml = '<span class="original-price">' + formatPrice(p.price) + '</span> ' + formatPrice(p.salePrice);
      } else {
        priceHtml = formatPrice(p.price);
      }

      card.innerHTML =
        '<div class="product-image">' +
          '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy">' +
          badge +
          '<div class="quick-view">Ver Producto</div>' +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="price">' + priceHtml + '</p>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  renderProducts(products);

  // Sort
  document.getElementById('sortSelect').addEventListener('change', function() {
    var val = this.value;
    var sorted = products.slice();
    if (val === 'price-asc') sorted.sort(function(a,b) { return a.price - b.price; });
    else if (val === 'price-desc') sorted.sort(function(a,b) { return b.price - a.price; });
    else if (val === 'name-asc') sorted.sort(function(a,b) { return a.name.localeCompare(b.name); });
    else if (val === 'name-desc') sorted.sort(function(a,b) { return b.name.localeCompare(a.name); });
    applyStockFilter(sorted);
  });

  // Stock filter
  document.getElementById('stockFilter').addEventListener('change', function() {
    var sorted = getCurrentSort();
    applyStockFilter(sorted);
  });

  function getCurrentSort() {
    var val = document.getElementById('sortSelect').value;
    var sorted = products.slice();
    if (val === 'price-asc') sorted.sort(function(a,b) { return a.price - b.price; });
    else if (val === 'price-desc') sorted.sort(function(a,b) { return b.price - a.price; });
    else if (val === 'name-asc') sorted.sort(function(a,b) { return a.name.localeCompare(b.name); });
    else if (val === 'name-desc') sorted.sort(function(a,b) { return b.name.localeCompare(a.name); });
    return sorted;
  }

  function applyStockFilter(list) {
    var stockVal = document.getElementById('stockFilter').value;
    if (stockVal !== 'all') {
      list = list.filter(function(p) { return p.status === stockVal; });
    }
    renderProducts(list);
  }

  // Search functionality
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        window.location.href = 'coleccion.html?cat=all&q=' + encodeURIComponent(this.value.trim());
      }
    });
  }

  // Handle search query
  var query = params.get('q');
  if (query) {
    var q = query.toLowerCase();
    products = allProducts.filter(function(p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || p.category.toLowerCase().indexOf(q) !== -1;
    });
    document.getElementById('collectionTitle').textContent = 'Resultados: "' + query + '"';
    document.getElementById('breadcrumbCat').textContent = 'Búsqueda';
    renderProducts(products);
  }
});
