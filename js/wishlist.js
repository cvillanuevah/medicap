var Wishlist = (function() {
  var STORAGE_KEY = 'medicap_wishlist';

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
