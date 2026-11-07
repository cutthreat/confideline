/*
 * Keeps accessibility state in step with the existing AdminLTE tree.
 * It does not handle clicks or expand/collapse menu nodes itself.
 */
(function () {
  'use strict';

  function bindSidebarState() {
    var menu = document.querySelector('.admin-sidebar-modern .sidebar-menu');
    if (!menu || menu.dataset.sidebarStateBound === '1') {
      return;
    }

    menu.dataset.sidebarStateBound = '1';

    function syncItem(item) {
      var link = item.querySelector(':scope > a');
      var submenu = item.querySelector(':scope > .treeview-menu');
      if (!link) {
        return;
      }

      var label = link.querySelector('span:not(.pull-right-container):not(.label)');
      if (label && label.textContent.trim() && !link.hasAttribute('title')) {
        link.setAttribute('title', label.textContent.trim());
      }

      if (!submenu) {
        return;
      }

      link.setAttribute('role', 'button');
      link.setAttribute('aria-expanded', String(window.getComputedStyle(submenu).display !== 'none'));
    }

    function syncAll() {
      menu.querySelectorAll('li').forEach(syncItem);
    }

    syncAll();

    new MutationObserver(syncAll).observe(menu, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSidebarState);
  } else {
    bindSidebarState();
  }
}());
