(function () {
  'use strict';
  const desktop = matchMedia('(min-width: 576px) and (pointer: fine)');
  for (const root of document.querySelectorAll('.cl-catalog-filter.cl-catalog-vertical')) {
    const form = root.querySelector('.cl-filter');
    form?.addEventListener('change', event => {
      if (!desktop.matches || event.target !== form) return;
      for (const group of form.querySelectorAll('.cl-filter-areas, .cl-filter-topics')) {
        group.dispatchEvent(new Event('change'));
      }
    });

    for (const [selector, icon] of [
      ['.cl-filter-areas legend', 'compass'],
      ['.cl-filter-topics legend', 'comments-o'],
      ['.cl-extra-heading', 'list-ul']
    ]) {
      const heading = root.querySelector(selector);
      if (!heading) continue;
      const mark = document.createElement('i');
      mark.className = 'fa fa-' + icon + ' cl-filter-group-mark';
      mark.setAttribute('aria-hidden', 'true');
      heading.prepend(mark);
    }

    for (const [selector, tool, labelSelector] of [
      ['.cl-filter-open', 'open', '[data-drawer-label]'],
      ['.cl-drawer-close', 'close', null],
      ['.cl-reset', 'reset', '[data-i18n="reset"]']
    ]) {
      const button = root.querySelector(selector);
      if (!button) continue;
      const label = labelSelector && button.querySelector(labelSelector);
      const name = button.getAttribute('aria-label') || label?.textContent.trim();
      if (!name) continue;
      button.dataset.filterTool = tool;
      const title = button.getAttribute('title');
      const syncTitle = () => {
        if (desktop.matches) button.removeAttribute('title');
        else if (title) button.setAttribute('title', title);
      };
      syncTitle();
      desktop.addEventListener('change', syncTitle);
      const tip = document.createElement('span');
      tip.className = 'cl-filter-tool-tip';
      tip.setAttribute('aria-hidden', 'true');
      tip.textContent = tool === 'open' && label ? label.textContent.trim() : name;
      tip.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
      });
      button.append(tip);
      button.addEventListener('keydown', event => {
        if (event.key === 'Escape') button.dataset.tipDismissed = 'true';
      });
      for (const event of ['pointerenter', 'focus']) {
        button.addEventListener(event, () => { delete button.dataset.tipDismissed; });
      }
    }
  }
})();
