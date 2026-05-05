document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var productId = params.get('id');

  if (!productId || !getProduct(productId)) {
    document.getElementById('productDetail').style.display = 'none';
    document.getElementById('productNotFound').style.display = 'block';
    document.querySelector('.product-breadcrumb').style.display = 'none';
    return;
  }

  var product = getProduct(productId);

  if (product.published === false || product.archived === true) {
    var isAdmin = (typeof Auth !== 'undefined') && Auth.isAdmin();
    if (!isAdmin) {
      document.getElementById('productDetail').style.display = 'none';
      document.getElementById('productNotFound').style.display = 'block';
      document.querySelector('.product-breadcrumb').style.display = 'none';
      return;
    }
  }

  var catInfo = CATEGORIES[product.category] || {name: product.category, slug: product.category};

  // Page title
  document.title = product.name + ' | Soberana';

  // Breadcrumb
  document.getElementById('prodCatLink').textContent = catInfo.name;
  document.getElementById('prodCatLink').href = 'coleccion.html?cat=' + product.category;
  document.getElementById('prodBreadcrumbName').textContent = product.name;

  // Main image
  var mainImg = document.getElementById('mainImage');
  mainImg.src = product.images[0];
  mainImg.alt = product.name;

  // Thumbnails
  var thumbsContainer = document.getElementById('galleryThumbs');
  product.images.forEach(function(img, i) {
    var thumb = document.createElement('div');
    thumb.className = 'thumb' + (i === 0 ? ' active' : '');
    thumb.innerHTML = '<img src="' + img + '" alt="' + product.name + ' ' + (i+1) + '">';
    thumb.addEventListener('click', function() {
      mainImg.src = img;
      thumbsContainer.querySelectorAll('.thumb').forEach(function(t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
    thumbsContainer.appendChild(thumb);
  });

  // Product info
  document.getElementById('prodName').textContent = product.name;

  var priceEl = document.getElementById('prodPrice');
  if (product.originalPrice) {
    priceEl.innerHTML = '<span class="original-price">' + formatPrice(product.originalPrice) + '</span> ' + formatPrice(product.price);
  } else if (product.salePrice && product.salePrice < product.price) {
    priceEl.innerHTML = '<span class="original-price">' + formatPrice(product.price) + '</span> ' + formatPrice(product.salePrice);
  } else {
    priceEl.textContent = formatPrice(product.price);
  }

  document.getElementById('prodDesc').textContent = product.description;
  document.getElementById('accDesc').innerHTML = '<p>' + product.description + '</p><p>Hecho a mano. Hipoalergénico. Libre de níquel.</p>';

  // Material options
  var matContainer = document.getElementById('materialOptions');
  if (product.materials && product.materials.length > 0) {
    var label = document.createElement('p');
    label.className = 'option-label';
    label.textContent = 'Material:';
    matContainer.appendChild(label);

    product.materials.forEach(function(mat, i) {
      var btn = document.createElement('button');
      btn.className = 'material-btn' + (i === 0 ? ' active' : '');
      btn.textContent = mat === 'Gold' ? 'Oro 18K' : 'Plata';
      btn.addEventListener('click', function() {
        matContainer.querySelectorAll('.material-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
      matContainer.appendChild(btn);
    });
  }

  // Sold out state
  var addBtn = document.getElementById('btnAddCart');
  var qtySelector = document.getElementById('quantitySelector');
  if (product.status === 'agotado') {
    addBtn.textContent = 'AGOTADO';
    addBtn.className = 'btn-sold-out';
    addBtn.disabled = true;
    qtySelector.style.display = 'none';
    if (matContainer.children.length > 0) {
      matContainer.style.opacity = '0.5';
      matContainer.style.pointerEvents = 'none';
    }
  }

  // Quantity
  var qtyInput = document.getElementById('qtyInput');
  document.getElementById('qtyMinus').addEventListener('click', function() {
    var v = parseInt(qtyInput.value);
    if (v > 1) qtyInput.value = v - 1;
  });
  document.getElementById('qtyPlus').addEventListener('click', function() {
    var v = parseInt(qtyInput.value);
    if (v < 10) qtyInput.value = v + 1;
  });

  // Add to cart
  addBtn.addEventListener('click', function() {
    var qty = parseInt(qtyInput.value) || 1;
    var matBtn = matContainer.querySelector('.material-btn.active');
    var material = 'default';
    if (matBtn) material = matBtn.textContent === 'Oro 18K' ? 'Gold' : 'Silver';
    Cart.add(product.id, qty, material);
    addBtn.textContent = '¡AGREGADO!';
    addBtn.style.backgroundColor = '#c9a84c';
    setTimeout(function() {
      addBtn.textContent = 'AGREGAR AL CARRITO';
      addBtn.style.backgroundColor = '';
    }, 2000);
  });

  // Accordions
  document.querySelectorAll('.accordion-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var item = this.parentElement;
      var body = item.querySelector('.accordion-body');
      var icon = this.querySelector('.accordion-icon');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.accordion-item').forEach(function(ai) {
        ai.classList.remove('open');
        ai.querySelector('.accordion-body').style.maxHeight = null;
        ai.querySelector('.accordion-icon').textContent = '+';
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        icon.textContent = '−';
      }
    });
  });

  // Related products
  var allProds = (typeof ProductManager !== 'undefined') ? ProductManager.getPublished() : PRODUCTS;
  var related = allProds.filter(function(p) {
    return p.category === product.category && p.id !== product.id;
  }).slice(0, 4);

  if (related.length > 0) {
    var relSection = document.getElementById('relatedSection');
    relSection.style.display = 'block';
    var relGrid = document.getElementById('relatedGrid');

    related.forEach(function(p) {
      var card = document.createElement('a');
      card.href = 'producto.html?id=' + p.id;
      card.className = 'product-card';
      var badge = p.status === 'agotado' ? '<span class="product-badge sold-out">Agotado</span>' : '';
      card.innerHTML =
        '<div class="product-image">' +
          '<img src="' + p.images[0] + '" alt="' + p.name + '" loading="lazy">' +
          badge +
          '<div class="quick-view">Ver Producto</div>' +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="price">' + formatPrice(p.price) + '</p>' +
        '</div>';
      relGrid.appendChild(card);
    });
  }

  // Image zoom on hover
  var galleryMain = document.querySelector('.gallery-main');
  galleryMain.addEventListener('mousemove', function(e) {
    var rect = galleryMain.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top) / rect.height) * 100;
    mainImg.style.transformOrigin = x + '% ' + y + '%';
    mainImg.style.transform = 'scale(1.5)';
  });
  galleryMain.addEventListener('mouseleave', function() {
    mainImg.style.transform = 'scale(1)';
  });
});
