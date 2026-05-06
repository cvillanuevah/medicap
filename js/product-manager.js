var ProductManager = (function() {
  var OVERRIDES_KEY = 'medicap_product_overrides';
  var CUSTOM_KEY = 'medicap_custom_products';

  function getOverrides() {
    try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
    catch(e) { return {}; }
  }

  function saveOverrides(data) {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(data));
  }

  function getCustomProducts() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveCustomProducts(list) {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
      return true;
    } catch(e) {
      console.error('Error guardando productos:', e);
      return false;
    }
  }

  function getAll() {
    var base = typeof PRODUCTS !== 'undefined' ? PRODUCTS.slice() : [];
    var overrides = getOverrides();
    var custom = getCustomProducts();

    var merged = [];
    base.forEach(function(p) {
      var o = overrides[p.id];
      if (o && o._deleted) return;
      if (!o) { merged.push(p); return; }
      merged.push(Object.assign({}, p, o, { _hasOverride: true }));
    });

    custom.forEach(function(cp) {
      merged.push(Object.assign({}, cp, { _isCustom: true }));
    });

    return merged;
  }

  function getPublished() {
    return getAll().filter(function(p) { return p.published !== false && p.archived !== true; });
  }

  function getActive() {
    return getAll().filter(function(p) { return p.archived !== true; });
  }

  function getArchived() {
    return getAll().filter(function(p) { return p.archived === true; });
  }

  function getById(id) {
    return getAll().find(function(p) { return p.id === id; }) || null;
  }

  function update(id, data) {
    data.updatedAt = new Date().toISOString();
    var custom = getCustomProducts();
    var idx = -1;
    custom.forEach(function(p, i) { if (p.id === id) idx = i; });

    if (idx !== -1) {
      if (data._historyEntry) {
        if (!custom[idx].history) custom[idx].history = [];
        custom[idx].history.push(data._historyEntry);
        delete data._historyEntry;
      }
      Object.assign(custom[idx], data);
      if (!saveCustomProducts(custom)) return { error: 'storage_full' };
    } else {
      var overrides = getOverrides();
      var existing = overrides[id] || {};
      if (data._historyEntry) {
        if (!existing.history) existing.history = [];
        existing.history.push(data._historyEntry);
        delete data._historyEntry;
      }
      overrides[id] = Object.assign(existing, data);
      try {
        saveOverrides(overrides);
      } catch(e) {
        return { error: 'storage_full' };
      }
    }
    return { ok: true };
  }

  function add(product) {
    var custom = getCustomProducts();
    var now = new Date().toISOString();
    product.id = 'custom_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    product.images = product.images || [];
    product.materials = product.materials || ['Gold'];
    product.createdAt = now;
    product.updatedAt = now;
    if (!product.history) {
      product.history = [{ date: now, action: 'created' }];
    }
    custom.push(product);
    if (!saveCustomProducts(custom)) {
      custom.pop();
      return { error: 'storage_full' };
    }
    return product;
  }

  function removeCustom(id) {
    var custom = getCustomProducts().filter(function(p) { return p.id !== id; });
    saveCustomProducts(custom);
  }

  function remove(id) {
    if (isCustom(id)) {
      removeCustom(id);
    } else {
      var overrides = getOverrides();
      overrides[id] = { _deleted: true };
      saveOverrides(overrides);
    }
  }

  function resetOverride(id) {
    var overrides = getOverrides();
    delete overrides[id];
    saveOverrides(overrides);
  }

  function isCustom(id) {
    return getCustomProducts().some(function(p) { return p.id === id; });
  }

  function hasOverride(id) {
    return !!getOverrides()[id];
  }

  return {
    getAll: getAll,
    getPublished: getPublished,
    getActive: getActive,
    getArchived: getArchived,
    getById: getById,
    update: update,
    add: add,
    remove: remove,
    removeCustom: removeCustom,
    resetOverride: resetOverride,
    isCustom: isCustom,
    hasOverride: hasOverride
  };
})();
