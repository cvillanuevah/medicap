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
