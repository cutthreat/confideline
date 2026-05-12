(() => {
  function moveTopbarToHeader() {
    const topbar = document.querySelector('#admin-agent-chat .topbar');
    const navbarMenu = document.querySelector('.main-header .navbar-custom-menu');

    if (!topbar || !navbarMenu || topbar.dataset.movedToHeader) {
      return;
    }

    topbar.dataset.movedToHeader = '1';
    topbar.classList.add('topbar-header-tools');

    const headerTools = document.createElement('div');
    headerTools.className = 'header-tools';

    Array.from(topbar.children).forEach((child) => {
      headerTools.appendChild(child);
    });

    const searchForm = navbarMenu.querySelector('form.header-search');
    if (searchForm && searchForm.nextSibling) {
      navbarMenu.insertBefore(headerTools, searchForm.nextSibling);
    } else {
      navbarMenu.appendChild(headerTools);
    }

    topbar.style.display = 'none';
    topbar.closest('.box.box-solid')?.classList.add('header-tools-source-box');
  }

  function bindUserMenuDropdown() {
    const menu = document.querySelector('.main-header .user-menu');
    if (!menu || menu.dataset.globalDropdownBound === '1') {
      return;
    }

    const toggle = menu.querySelector('.dropdown-toggle');
    if (!toggle) {
      return;
    }

    menu.dataset.globalDropdownBound = '1';
    const closeMenu = () => menu.classList.remove('open');

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) {
        closeMenu();
      }
    });

    menu.querySelectorAll('.dropdown-menu a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  function bindStatusDropdown() {
    const menu = document.querySelector('#statusDropdown');
    if (!menu || menu.dataset.statusDropdownBound === '1') {
      return;
    }

    const toggle = menu.querySelector('.dropdown-toggle');
    if (!toggle) {
      return;
    }

    menu.dataset.statusDropdownBound = '1';
    const label = menu.querySelector('#operatorStatusLabel');
    const dot = document.querySelector('#connDot');
    const closeMenu = () => menu.classList.remove('open');

    const applyStatus = (status) => {
      if (label) {
        label.textContent = status;
      }
      document.querySelectorAll('.admin-status-pill[data-status]').forEach((pill) => {
        pill.classList.toggle('active', pill.dataset.status === status);
      });
      if (dot) {
        dot.classList.remove('conn-green', 'conn-yellow', 'conn-red');
        if (status === 'Available' || status === 'Online' || status === 'On shift') {
          dot.classList.add('conn-green');
        } else if (status === 'Busy' || status === 'Break' || status === 'Paused') {
          dot.classList.add('conn-yellow');
        } else {
          dot.classList.add('conn-red');
        }
      }
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target)) {
        closeMenu();
      }
    });

    menu.querySelectorAll('.js-set-status').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const status = link.dataset.status || 'Offline';
        applyStatus(status);
        closeMenu();
      });
    });
  }

  function bindSidebarToggle() {
    const toggles = document.querySelectorAll('.sidebar-toggle');
    toggles.forEach((toggle) => {
      if (toggle.dataset.sidebarToggleBound === '1') {
        return;
      }

      toggle.dataset.sidebarToggleBound = '1';
      toggle.setAttribute('aria-label', 'Toggle sidebar');
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const body = document.body;
        const isMobile = window.innerWidth <= 767;

        if (isMobile) {
          body.classList.toggle('sidebar-open');
        } else {
          body.classList.toggle('sidebar-collapse');
        }
      });
    });
  }

  function bindGlobalMockModals() {
    if (document.body.dataset.globalMockModalsBound === '1') {
      return;
    }

    document.body.dataset.globalMockModalsBound = '1';

    const closeModal = (modal) => {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    };

    const openModal = (selector) => {
      const modal = document.querySelector(selector);
      if (!modal) return;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      window.setTimeout(() => {
        modal.querySelector('input, select, textarea, button')?.focus();
      }, 0);
    };

    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-mock-open]');
      if (opener) {
        event.preventDefault();
        openModal(opener.dataset.mockOpen);
        return;
      }

      const dismiss = event.target.closest('[data-dismiss="modal"]');
      if (dismiss) {
        event.preventDefault();
        closeModal(dismiss.closest('.global-modal-backdrop'));
        return;
      }

      if (event.target.classList.contains('global-modal-backdrop')) {
        closeModal(event.target);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.global-modal-backdrop:not([hidden])').forEach(closeModal);
    });

    document.querySelector('#btnSendProblem')?.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const modal = button.closest('.global-modal-backdrop');
      const title = modal?.querySelector('#problemTitle');
      const desc = modal?.querySelector('#problemDesc');
      const valid = Boolean(title?.value.trim() && desc?.value.trim());

      if (!valid) {
        [title, desc].forEach((field) => {
          field?.classList.toggle('has-error-field', !field.value.trim());
        });
        (title?.value.trim() ? desc : title)?.focus();
        return;
      }

      /*
      // Real API integration point:
      // const formData = new FormData();
      // formData.append('category', modal.querySelector('#problemCategory').value);
      // formData.append('priority', modal.querySelector('#problemPriority').value);
      // formData.append('title', title.value.trim());
      // formData.append('description', desc.value.trim());
      // const file = modal.querySelector('#problemFile').files[0];
      // if (file) formData.append('file', file);
      // fetch('/admin/report/problem', {
      //   method: 'POST',
      //   headers: { 'X-Requested-With': 'XMLHttpRequest' },
      //   body: formData,
      // }).then((response) => response.json());
      */

      button.textContent = 'Sent';
      window.setTimeout(() => {
        button.textContent = 'Отправить';
        closeModal(modal);
      }, 700);
    });

    document.querySelector('#btnApplyBusy')?.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const modal = button.closest('.global-modal-backdrop');
      const reason = modal?.querySelector('input[name="busyReason"]:checked')?.value || 'Paused';
      const comment = modal?.querySelector('#busyComment')?.value.trim() || '';

      /*
      // Real API integration point:
      // fetch('/admin/operator/status/busy', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'X-Requested-With': 'XMLHttpRequest',
      //   },
      //   body: JSON.stringify({ status: 'Busy', reason, comment }),
      // }).then((response) => response.json());
      */

      const label = document.querySelector('#operatorStatusLabel');
      const dot = document.querySelector('#connDot');
      if (label) label.textContent = 'Paused';
      if (dot) {
        dot.classList.remove('conn-green', 'conn-red');
        dot.classList.add('conn-yellow');
      }
      button.dataset.lastReason = reason;
      button.dataset.lastComment = comment;
      button.textContent = 'Applied';
      window.setTimeout(() => {
        button.textContent = 'Применить';
        closeModal(modal);
      }, 600);
    });
  }

  function bindAdminUserMenuControls() {
    const menu = document.querySelector('.main-header .admin-user-menu');
    if (!menu || menu.dataset.adminControlsBound === '1') {
      return;
    }

    menu.dataset.adminControlsBound = '1';

    menu.querySelectorAll('.admin-status-pill[data-status]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const status = button.dataset.status || 'Offline';
        document.querySelector('#operatorStatusLabel').textContent = status;
        const dot = document.querySelector('#connDot');
        if (dot) {
          dot.classList.remove('conn-green', 'conn-yellow', 'conn-red');
          dot.classList.add((status === 'Available' || status === 'Online' || status === 'On shift') ? 'conn-green' : (status === 'Busy' || status === 'Break' || status === 'Paused') ? 'conn-yellow' : 'conn-red');
        }
        menu.querySelectorAll('.admin-status-pill').forEach((pill) => pill.classList.toggle('active', pill === button));
      });
    });

    menu.querySelectorAll('.js-admin-menu-toggle').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const active = button.classList.toggle('active');
        const state = button.querySelector('b');
        if (state) {
          state.textContent = active ? 'On' : 'Off';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    moveTopbarToHeader();
    bindUserMenuDropdown();
    bindStatusDropdown();
    bindSidebarToggle();
    bindGlobalMockModals();
    bindAdminUserMenuControls();
  });
})();
