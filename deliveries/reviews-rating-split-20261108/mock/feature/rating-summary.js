(function () {
  'use strict';
  const {can, store, t, error} = ReviewAdminUI;
  const $ = id => document.getElementById(id);
  if (!can('create')) { $('rating-management').remove(); return; }
  $('rating-management').hidden = false;
  function render() {
    try {
      const value = store.summary($('create-expert').value);
      $('admin-average').textContent = value.rating === null ? '\u2014' : value.rating.toFixed(1);
      $('admin-votes').textContent = value.votes;
      $('admin-texts').textContent = value.textCount;
      $('admin-rating-mode').textContent = t(value.mode);
      $('rating-management-error').hidden = true;
    } catch (e) {
      $('rating-management-error').textContent = error(e);
      $('rating-management-error').hidden = false;
    }
  }
  $('create-expert').addEventListener('change', render);
  $('create-form').addEventListener('submit', render);
  addEventListener('storage', render);
  render();
})();
