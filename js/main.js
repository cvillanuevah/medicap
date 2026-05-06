document.addEventListener('DOMContentLoaded', function() {

  // Sync admin settings to store
  (function syncSettings() {
    var SETTINGS_KEY = 'medicap_settings';
    var s;
    try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch(e) {}
    if (!s) return;

    var footerCols = document.querySelectorAll('.footer-col');
    footerCols.forEach(function(col) {
      var h4 = col.querySelector('h4');
      if (!h4) return;
      var title = h4.textContent.trim();

      if (title === 'Contacto') {
        var p = col.querySelector('p');
        if (p) {
          var email = s.email || 'contacto@medicap.cl';
          var phone = s.phone || '+569 48061416';
          var ig = s.instagram || '@medicap_cl';
          p.innerHTML =
            '<i class="fa-regular fa-envelope"></i>&nbsp; ' + email + '<br>' +
            '<i class="fa-brands fa-whatsapp"></i>&nbsp; ' + phone + '<br>' +
            '<i class="fa-brands fa-instagram"></i>&nbsp; ' + ig;
        }
        var social = col.querySelector('.social-links');
        if (social) {
          var links = '';
          if (s.instagram) {
            var igHandle = s.instagram.replace('@', '');
            links += '<a href="https://instagram.com/' + igHandle + '" target="_blank" title="Instagram"><i class="fa-brands fa-instagram"></i></a>';
          } else {
            links += '<a href="#" title="Instagram"><i class="fa-brands fa-instagram"></i></a>';
          }
          if (s.facebook) {
            var fbUrl = s.facebook.indexOf('http') === 0 ? s.facebook : 'https://' + s.facebook;
            links += '<a href="' + fbUrl + '" target="_blank" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>';
          } else {
            links += '<a href="#" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>';
          }
          if (s.tiktok) {
            var tkHandle = s.tiktok.replace('@', '');
            links += '<a href="https://tiktok.com/@' + tkHandle + '" target="_blank" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>';
          }
          social.innerHTML = links;
        }
      }

      if (title === 'MediCap' && s.name && s.name !== 'MediCap') {
        h4.textContent = s.name;
      }
    });

    var footerBottom = document.querySelector('.footer-bottom');
    if (footerBottom) {
      var cp = footerBottom.querySelector('p');
      if (cp) {
        var storeName = s.name || 'MediCap';
        cp.innerHTML = '&copy; ' + new Date().getFullYear() + ' ' + storeName;
      }
    }

    var newName = s.name;
    var nameChanged = newName && newName !== 'MediCap';

    if (nameChanged) {
      document.querySelectorAll('.logo-text').forEach(function(el) {
        el.textContent = newName;
      });
      var loader = document.querySelector('.loader-text');
      if (loader) loader.textContent = newName;
      document.title = document.title.replace('MediCap', newName);

      var mobileNavHeader = document.querySelector('.mobile-nav-header span');
      if (mobileNavHeader && mobileNavHeader.textContent.trim() === 'MediCap') {
        mobileNavHeader.textContent = newName;
      }
    }

    function replaceInText(el) {
      if (!el) return;
      var html = el.innerHTML;
      var changed = false;
      if (nameChanged && html.indexOf('MediCap') !== -1) {
        html = html.split('MediCap').join(newName);
        changed = true;
      }
      if (s.email && html.indexOf('contacto@medicap.cl') !== -1) {
        html = html.split('contacto@medicap.cl').join(s.email);
        changed = true;
      }
      if (s.phone && html.indexOf('+569 48061416') !== -1) {
        html = html.split('+569 48061416').join(s.phone);
        changed = true;
      }
      if (changed) el.innerHTML = html;
    }

    document.querySelectorAll('p, h2, h3, blockquote, .auth-subtitle').forEach(replaceInText);
  })();

  // Loading screen
  var loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    window.addEventListener('load', function() {
      setTimeout(function() { loadingScreen.classList.add('hidden'); }, 800);
    });
    setTimeout(function() { loadingScreen.classList.add('hidden'); }, 3000);
  }

  // Hero slider
  var heroSlider = document.getElementById('heroSlider');
  var dots = document.querySelectorAll('.hero-dots .dot');
  var currentSlide = 0;
  var totalSlides = 2;

  function goToSlide(index) {
    if (!heroSlider) return;
    currentSlide = index;
    heroSlider.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === index);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      goToSlide(parseInt(this.dataset.slide));
    });
  });

  if (heroSlider) {
    setInterval(function() {
      goToSlide((currentSlide + 1) % totalSlides);
    }, 6000);
  }

  // Search overlay
  var searchBtn = document.getElementById('searchBtn');
  var searchOverlay = document.getElementById('searchOverlay');
  var closeSearch = document.getElementById('closeSearch');

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', function() {
      searchOverlay.classList.add('active');
      searchOverlay.querySelector('input').focus();
    });
    if (closeSearch) closeSearch.addEventListener('click', function() {
      searchOverlay.classList.remove('active');
    });
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) searchOverlay.classList.remove('active');
    });
  }

  // Cart drawer
  var cartBtn = document.getElementById('cartBtn');
  var cartDrawer = document.getElementById('cartDrawer');
  var closeCart = document.getElementById('closeCart');
  var cartOverlay = document.getElementById('cartOverlay');

  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', function() {
      cartDrawer.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
    });
    if (closeCart) closeCart.addEventListener('click', function() {
      cartDrawer.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
    });
    if (cartOverlay) cartOverlay.addEventListener('click', function() {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    });
  }

  // Mobile navigation
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  var closeMobileNav = document.getElementById('closeMobileNav');
  var mobileNavOverlay = document.getElementById('mobileNavOverlay');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function() {
      mobileNav.classList.add('active');
      if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
    });
    if (closeMobileNav) closeMobileNav.addEventListener('click', function() {
      mobileNav.classList.remove('active');
      if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
    });
    if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', function() {
      mobileNav.classList.remove('active');
      mobileNavOverlay.classList.remove('active');
    });
  }

  // Scroll animations
  var fadeElements = document.querySelectorAll('.fade-in');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(function(el) {
    observer.observe(el);
  });

  // Header scroll effect
  var header = document.querySelector('.header');
  var lastScroll = 0;

  window.addEventListener('scroll', function() {
    var currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
      header.style.boxShadow = 'none';
    }
    lastScroll = currentScroll;
  });

  // Keyboard: Escape to close overlays
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchOverlay.classList.remove('active');
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
      mobileNav.classList.remove('active');
      mobileNavOverlay.classList.remove('active');
    }
  });

});
