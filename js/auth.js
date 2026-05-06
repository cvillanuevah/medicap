var Auth = (function() {
  var USERS_KEY = 'soberana_users';
  var SESSION_KEY = 'soberana_session';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function seedDefaults() {
    var users = getUsers();
    var defaults = [
      { email: 'admin@medicap.cl', password: 'admin123', firstName: 'Administrador', lastName: 'MediCap', phone: '+569 48061416', address: '', city: 'Santiago', region: 'RM', role: 'admin' },
      { email: 'maria@medicap.cl', password: 'maria123', firstName: 'Mar&iacute;a', lastName: 'Gonz&aacute;lez', phone: '+569 12345678', address: 'Av. Providencia 1234', city: 'Santiago', region: 'RM', role: 'customer' },
      { email: 'carla@medicap.cl', password: 'carla123', firstName: 'Carla', lastName: 'Mu&ntilde;oz', phone: '+569 87654321', address: 'Los Leones 567', city: 'Santiago', region: 'RM', role: 'customer' },
      { email: 'test@test.com', password: 'test123', firstName: 'Cliente', lastName: 'Test', phone: '+569 11111111', address: 'Calle Test 100', city: 'Valparaíso', region: 'V', role: 'customer' }
    ];
    defaults.forEach(function(d) {
      var idx = -1;
      users.forEach(function(u, i) { if (u.email === d.email) idx = i; });
      if (idx === -1) {
        users.push({
          id: generateId(),
          email: d.email,
          password: hashPassword(d.password),
          firstName: d.firstName,
          lastName: d.lastName,
          phone: d.phone || '',
          address: d.address || '',
          city: d.city || '',
          region: d.region || '',
          role: d.role || 'customer',
          createdAt: new Date().toISOString(),
          orders: []
        });
      } else {
        users[idx].role = d.role || 'customer';
      }
    });
    saveUsers(users);
  }

  function generateId() {
    return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function hashPassword(pw) {
    var hash = 0;
    for (var i = 0; i < pw.length; i++) {
      var c = pw.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  }

  function register(data) {
    var users = getUsers();
    var exists = users.some(function(u) { return u.email.toLowerCase() === data.email.toLowerCase(); });
    if (exists) return { ok: false, error: 'Ya existe una cuenta con este email.' };
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { ok: false, error: 'Completa todos los campos obligatorios.' };
    }
    if (data.password.length < 6) return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };

    var user = {
      id: generateId(),
      email: data.email.toLowerCase().trim(),
      password: hashPassword(data.password),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      region: data.region || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
      orders: []
    };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user: user };
  }

  function login(email, password) {
    var users = getUsers();
    var user = users.find(function(u) { return u.email === email.toLowerCase().trim(); });
    if (!user) return { ok: false, error: 'No existe una cuenta con este email.' };
    if (user.password !== hashPassword(password)) return { ok: false, error: 'Contraseña incorrecta.' };
    setSession(user);
    return { ok: true, user: user };
  }

  function setSession(user) {
    var session = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role || 'customer' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    updateAuthUI();
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateAuthUI();
    window.location.href = 'index.html';
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch(e) {
      return null;
    }
  }

  function getCurrentUser() {
    var session = getSession();
    if (!session) return null;
    var users = getUsers();
    return users.find(function(u) { return u.id === session.id; }) || null;
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function isAdmin() {
    var session = getSession();
    return session && session.role === 'admin';
  }

  function getAllUsers() {
    return getUsers();
  }

  function updateProfile(data) {
    var session = getSession();
    if (!session) return { ok: false, error: 'No has iniciado sesión.' };
    var users = getUsers();
    var idx = users.findIndex(function(u) { return u.id === session.id; });
    if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };
    if (data.firstName) users[idx].firstName = data.firstName.trim();
    if (data.lastName) users[idx].lastName = data.lastName.trim();
    if (data.phone !== undefined) users[idx].phone = data.phone;
    if (data.address !== undefined) users[idx].address = data.address;
    if (data.city !== undefined) users[idx].city = data.city;
    if (data.region !== undefined) users[idx].region = data.region;
    saveUsers(users);
    setSession(users[idx]);
    return { ok: true };
  }

  function addOrder(orderData) {
    var session = getSession();
    if (!session) return;
    var users = getUsers();
    var idx = users.findIndex(function(u) { return u.id === session.id; });
    if (idx === -1) return;
    users[idx].orders = users[idx].orders || [];
    users[idx].orders.push(orderData);
    saveUsers(users);
  }

  function updateAuthUI() {
    var session = getSession();
    if (session && !session.role) {
      var fullUser = getCurrentUser();
      if (fullUser) {
        session.role = fullUser.role || 'customer';
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }

    document.querySelectorAll('.auth-link').forEach(function(el) {
      if (session) {
        el.innerHTML = '<i class="fa-solid fa-user"></i>';
        el.href = 'cuenta.html';
        el.title = session.firstName;
      } else {
        el.innerHTML = '<i class="fa-regular fa-user"></i>';
        el.href = 'login.html';
        el.title = 'Ingresar';
      }
    });

    // Limpiar links admin anteriores
    document.querySelectorAll('.admin-menu-item').forEach(function(el) { el.remove(); });

    if (session && session.role === 'admin') {
      // Agregar ícono en header-icons (antes del auth-link)
      var headerIcons = document.querySelector('.header-icons');
      var authLink = headerIcons ? headerIcons.querySelector('.auth-link') : null;
      if (headerIcons && authLink) {
        var adminIcon = document.createElement('a');
        adminIcon.href = 'admin/index.html';
        adminIcon.className = 'admin-menu-item';
        adminIcon.title = 'Panel Administrador';
        adminIcon.innerHTML = '<i class="fa-solid fa-screwdriver-wrench"></i>';
        headerIcons.insertBefore(adminIcon, authLink);
      }

      // Agregar link en menú mobile
      var mobileNav = document.querySelector('.mobile-nav > ul');
      if (mobileNav) {
        var mli = document.createElement('li');
        mli.className = 'admin-menu-item';
        mli.innerHTML = '<a href="admin/index.html"><i class="fa-solid fa-screwdriver-wrench"></i> Administrador</a>';
        mobileNav.appendChild(mli);
      }

      // Agregar link en sidebar de cuenta
      var accountNav = document.querySelector('.account-nav');
      if (accountNav && !accountNav.querySelector('.account-nav-item--admin')) {
        var adminNavItem = document.createElement('a');
        adminNavItem.href = 'admin/index.html';
        adminNavItem.className = 'account-nav-item account-nav-item--admin admin-menu-item';
        adminNavItem.innerHTML = '<i class="fa-solid fa-screwdriver-wrench"></i> Panel de Administrador';
        accountNav.insertBefore(adminNavItem, accountNav.firstChild);
      }
    }
  }

  // Init
  seedDefaults();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateAuthUI();
    });
  } else {
    updateAuthUI();
  }

  return {
    register: register,
    login: login,
    logout: logout,
    getSession: getSession,
    getCurrentUser: getCurrentUser,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    getAllUsers: getAllUsers,
    updateProfile: updateProfile,
    addOrder: addOrder,
    updateAuthUI: updateAuthUI
  };
})();
