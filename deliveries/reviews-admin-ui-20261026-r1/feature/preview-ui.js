(function () {
  'use strict';
  const root = document.getElementById('confideline-reviews');
  const {can, url, lang} = window.ReviewAdminUI;
  const labels = lang === 'en' ? {
    globalSettings: 'General settings', expertCalculation: 'Expert rating calculation',
    unsavedTitle: 'Unsaved changes', keepEditing: 'Keep editing', discardChanges: 'Discard changes',
    ratingHistory: 'Rating change history', noChanges: 'No changes yet'
  } : {
    globalSettings: 'Общие параметры', expertCalculation: 'Расчёт рейтинга эксперта',
    unsavedTitle: 'Есть несохранённые изменения', keepEditing: 'Продолжить редактирование', discardChanges: 'Не сохранять',
    ratingHistory: 'История изменений рейтинга', noChanges: 'Изменений пока нет'
  };
  root.querySelectorAll('[data-review-label]').forEach(el => { el.textContent = labels[el.dataset.reviewLabel]; });
  document.title = root.querySelector('h1').textContent;
  const table = root.querySelector('.review-admin-table');
  if (table) {
    const labels = lang === 'en' ? ['ID / date','Client / expert','Session','Rating','Review','Status','Actions'] : ['№ / дата','Клиент / эксперт','Консульт.','Оценка','Отзыв','Статус','Действия'];
    const region = table.closest('.review-admin-table-wrap');
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', lang === 'en' ? 'Reviews table' : 'Таблица отзывов');
    table.querySelectorAll('thead tr:first-child th').forEach((el, i) => { el.title = el.textContent; el.textContent = labels[i]; });
    root.querySelector('.review-admin-summary .box-title').textContent = lang === 'en' ? 'Reviews' : 'Список отзывов';
    const statusLinks = [...root.querySelectorAll('[data-filter]')];
    const mobile = document.createElement('div');
    mobile.className = 'review-mobile-status';
    const label = document.createElement('label');
    label.htmlFor = 'review-status-select';
    label.textContent = lang === 'en' ? 'Status' : 'Статус';
    const select = document.createElement('select');
    select.id = label.htmlFor;
    select.className = 'form-control';
    statusLinks.forEach(link => { const option = document.createElement('option'); option.value = link.dataset.filter; select.append(option); });
    const sync = () => statusLinks.forEach((link, i) => { select.options[i].textContent = link.textContent.trim().replace(/\s+/g,' '); if (link.getAttribute('aria-pressed') === 'true') select.value = link.dataset.filter; });
    select.addEventListener('change', () => statusLinks.find(link => link.dataset.filter === select.value).click());
    mobile.append(label, select);
    root.querySelector('.box-nav .box-body').prepend(mobile);
    new MutationObserver(sync).observe(statusLinks[0].closest('ul'), {subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed']});
    sync();
  }
  root.querySelectorAll('[data-permission]').forEach(el => { el.hidden = !can(el.dataset.permission); });
  root.querySelectorAll('a[href="reviews.html"],a[href="write-review.html"],a[href="settings.html"]').forEach(el => {
    el.href = url(el.getAttribute('href'));
  });
  document.querySelectorAll('.main-sidebar a[href="reviews.html"],.main-sidebar a[href="write-review.html"],.main-sidebar a[href="settings.html"]').forEach(el => {
    const file = el.getAttribute('href');
    el.href = url(file);
    const permission = file === 'settings.html' ? 'settings' : file === 'write-review.html' ? 'create' : 'view';
    if (!can(permission)) el.closest('li').remove();
  });
  if (document.body.dataset.page === 'settings' && !can('settings')) {
    root.querySelector('.review-settings-catalog')?.remove();
    root.querySelectorAll('.breadcrumb a').forEach(link => link.replaceWith(document.createTextNode(link.textContent)));
  }
  const catalog = root.querySelector('.review-settings-catalog details');
  if (catalog) {
    const query = matchMedia('(max-width: 991px)');
    const adapt = () => { catalog.open = !query.matches; catalog.querySelector('summary').textContent = lang === 'en' ? (query.matches ? 'General settings · Reviews' : 'General settings') : (query.matches ? 'Общие настройки · Отзывы' : 'Общие настройки'); };
    adapt();
    query.addEventListener('change', adapt);
  }
  // Keep production navigation untouched; header search is not a review filter.
  document.querySelector('.header-search')?.addEventListener('submit', e => e.preventDefault());
})();
