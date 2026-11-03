(function () {
  'use strict';
  function mount(root) {
    for (const group of root.querySelectorAll('.cl-filter-areas, .cl-filter-topics')) {
      if (group.dataset.compactMounted) continue;
      const options = group.querySelector('.cl-options');
      const labels = options && [...options.querySelectorAll(':scope > label.cl-chip')];
      if (!labels || labels.length <= 6) continue;
      group.dataset.compactMounted = 'true';
      if (!options.id) options.id = (root.querySelector('dialog')?.id || 'cl-filter') + '-' + (group.classList.contains('cl-filter-areas') ? 'areas' : 'topics');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cl-options-more';
      button.setAttribute('aria-controls', options.id);
      let expanded = false;
      function render() {
        let remaining = 0;
        labels.forEach((label, index) => {
          const selected = label.querySelector('input')?.checked;
          label.hidden = !expanded && index >= 6 && !selected;
          if (index >= 6 && !selected) remaining++;
        });
        const en = document.documentElement.lang.toLowerCase().startsWith('en');
        const more = group.dataset.showMore || (en ? 'Show {count} more' : 'Показать ещё {count}');
        const less = group.dataset.showLess || (en ? 'Show less' : 'Свернуть');
        button.hidden = !expanded && remaining === 0;
        button.textContent = expanded ? less : more.replace('{count}', String(remaining));
        button.setAttribute('aria-expanded', String(expanded));
      }
      button.addEventListener('click', () => { expanded = !expanded; render(); });
      group.addEventListener('change', render);
      group.append(button);
      render();
    }
  }
  function init() { document.querySelectorAll('.cl-catalog-filter').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
