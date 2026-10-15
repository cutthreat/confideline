(() => {
  const OPERATOR_STATUS_ENDPOINT = '/admin/operator/status'; // Persist Online, Busy and Offline operator state.
  const OPERATOR_BUSY_ENDPOINT = '/admin/operator/status/busy'; // Optional endpoint for a Busy reason/comment.
  const OPERATOR_OFFLINE_ENDPOINT = '/admin/operator/status/offline'; // Optional endpoint for an Offline reason/comment.
  const NETWORK_HEALTH_ENDPOINT = '/admin/operator/network-health'; // Verify backend/chat infrastructure availability.
  const PROBLEM_REPORT_ENDPOINT = '/admin/report/problem'; // Submit the global problem-report form and screenshots.
  const NETWORK_CHECK_INTERVAL_MS = 15000; // Delay between automatic connection-quality probes.
  const GLOBAL_UI_CONFIG = Object.freeze({
    mobileViewportMaxPx: 767, // Viewport threshold for mobile dropdown/modal positioning.
    immediateFocusMs: 0, // Focus the first modal control on the next browser tick.
    reportFeedbackMs: 700, // Keep successful report feedback visible before closing.
    statusFeedbackMs: 600, // Keep successful Busy/Offline feedback visible before closing.
  });

  const operatorRuntimeState = {
    operatorStatus: 'Offline',
    connectionQuality: 'good',
    shiftStarted: false,
    lastNetworkCheckAt: 0,
  };

  const connectionLabels = {
    good: 'Подкл.',
    unstable: 'Нестабильно',
    offline: 'Нет связи',
  };

  const connectionDotClasses = {
    good: 'conn-green',
    unstable: 'conn-yellow',
    offline: 'conn-red',
  };
  const operatorStatusDotClasses = {
    Online: 'operator-status-online',
    Busy: 'operator-status-busy',
    Offline: 'operator-status-offline',
  };
  const operatorStatusLabels = {
    Online: 'Онлайн',
    Busy: 'Занят',
    Offline: 'Офлайн',
  };

  const normalizeConnectionQuality = (quality) => (
    ['good', 'unstable', 'offline'].includes(quality) ? quality : 'good'
  );

  const normalizeOperatorStatus = (status) => (
    ['Online', 'Busy', 'Offline'].includes(status) ? status : 'Offline'
  );

  function updateOperatorStatusUi(status) {
    const normalizedStatus = normalizeOperatorStatus(status);
    operatorRuntimeState.operatorStatus = normalizedStatus;
    operatorRuntimeState.shiftStarted = normalizedStatus !== 'Offline';

    const label = document.querySelector('#operatorStatusLabel');
    if (label) {
      label.textContent = operatorStatusLabels[normalizedStatus] || normalizedStatus;
    }

    const statusDot = document.querySelector('#statusDropdown .operator-status-dot');
    if (statusDot) {
      statusDot.classList.remove('operator-status-online', 'operator-status-busy', 'operator-status-offline');
      statusDot.classList.add(operatorStatusDotClasses[normalizedStatus]);
    }

    document.querySelectorAll('.admin-status-pill[data-status]').forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.status === normalizedStatus);
    });
  }

  function updateOnlineAvailability() {
    const isNetworkOffline = operatorRuntimeState.connectionQuality === 'offline';
    document.querySelectorAll('[data-status="Online"]').forEach((control) => {
      control.classList.toggle('is-disabled', isNetworkOffline);
      control.setAttribute('aria-disabled', isNetworkOffline ? 'true' : 'false');
      control.title = isNetworkOffline
        ? 'Онлайн недоступен, пока соединение не восстановлено'
        : '';
    });
  }

  function requestOperatorStatusChange(status, options = {}) {
    const normalizedStatus = normalizeOperatorStatus(status);
    const payload = {
      status: normalizedStatus,
      previous_status: normalizeOperatorStatus(options.previousStatus || operatorRuntimeState.operatorStatus),
      reason: options.reason || '',
      reason_label: options.reasonLabel || '',
      comment: options.comment || '',
      source: options.source || 'header_tools',
      connection_quality: operatorRuntimeState.connectionQuality,
      changed_at: new Date().toISOString(),
    };

    /*
    // Real API integration point for backend programmer:
    // return fetch(OPERATOR_STATUS_ENDPOINT, {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'X-Requested-With': 'XMLHttpRequest',
    //   },
    //   body: JSON.stringify(payload),
    // }).then((response) => response.json());
    */

    return Promise.resolve({ ok: true, payload });
  }

  function setOperatorStatus(status, options = {}) {
    const normalizedStatus = normalizeOperatorStatus(status);
    const previousStatus = operatorRuntimeState.operatorStatus;
    if (normalizedStatus === 'Online' && operatorRuntimeState.connectionQuality === 'offline') {
      updateOnlineAvailability();
      return Promise.resolve({ ok: false, blocked: 'network_offline' });
    }

    updateOperatorStatusUi(normalizedStatus);
    return requestOperatorStatusChange(normalizedStatus, {
      previousStatus,
      ...options,
    }).catch(() => {
      updateOperatorStatusUi(options.previousStatus || previousStatus || 'Offline');
      return { ok: false };
    });
  }

  function setConnectionQuality(quality, options = {}) {
    const normalizedQuality = normalizeConnectionQuality(quality);
    operatorRuntimeState.connectionQuality = normalizedQuality;
    operatorRuntimeState.lastNetworkCheckAt = Date.now();

    const label = document.querySelector('#connLabel');
    const dot = document.querySelector('#connDot');
    const badge = document.querySelector('.main-header .conn-badge');

    if (label) {
      label.textContent = connectionLabels[normalizedQuality];
    }
    if (dot) {
      dot.classList.remove('conn-green', 'conn-yellow', 'conn-red');
      dot.classList.add(connectionDotClasses[normalizedQuality]);
    }
    if (badge) {
      badge.dataset.connectionQuality = normalizedQuality;
      badge.title = options.message || '';
    }

    updateOnlineAvailability();

    if (
      normalizedQuality === 'offline'
      && operatorRuntimeState.shiftStarted
      && operatorRuntimeState.operatorStatus === 'Online'
    ) {
      setOperatorStatus('Busy', {
        reason: 'network_offline',
        comment: 'Auto Busy: network connection is unavailable',
        source: 'network_monitor',
        previousStatus: 'Online',
      });
    }
  }

  function requestConnectionQuality() {
    if (navigator.onLine === false) {
      return Promise.resolve({
        quality: 'offline',
        message: 'Браузер сообщает, что сеть недоступна',
      });
    }

    /*
    // Real API integration point for backend programmer:
    // This endpoint should reflect connection to backend/chat infrastructure,
    // not just generic internet availability.
    // return fetch(NETWORK_HEALTH_ENDPOINT, {
    //   method: 'GET',
    //   cache: 'no-store',
    //   headers: {
    //     'Accept': 'application/json',
    //     'X-Requested-With': 'XMLHttpRequest',
    //   },
    // }).then((response) => response.json());
    //
    // Expected response:
    // { quality: 'good' | 'unstable' | 'offline', latency_ms: 120, message: '' }
    */

    return Promise.resolve({
      quality: 'good',
      message: 'Локальная демо-проверка сети',
    });
  }

  function bindConnectionQualityMonitor() {
    if (document.body.dataset.connectionMonitorBound === '1') {
      return;
    }

    document.body.dataset.connectionMonitorBound = '1';

    const runProbe = () => {
      requestConnectionQuality()
        .then((result) => {
          setConnectionQuality(result?.quality || 'good', {
            message: result?.message || '',
          });
        })
        .catch(() => {
          setConnectionQuality('offline', {
            message: 'Проверка сети не выполнена',
          });
        });
    };

    window.addEventListener('online', runProbe);
    window.addEventListener('offline', () => {
      setConnectionQuality('offline', {
        message: 'Браузер сообщает, что сеть недоступна',
      });
    });

    runProbe();
    window.setInterval(runProbe, NETWORK_CHECK_INTERVAL_MS);
  }

  window.AdminOperatorRuntime = {
    state: operatorRuntimeState,
    setConnectionQuality,
    setOperatorStatus,
    requestConnectionQuality,
  };

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
    const sourceBox = topbar.closest('.box.box-solid');

    Array.from(topbar.children).forEach((child) => {
      headerTools.appendChild(child);
    });

    const searchForm = navbarMenu.querySelector('form.header-search');
    if (searchForm && searchForm.nextSibling) {
      navbarMenu.insertBefore(headerTools, searchForm.nextSibling);
    } else {
      navbarMenu.appendChild(headerTools);
    }

    // The source box hosted only controls moved into the global header.
    // Removing it prevents an empty panel above the chat workspace.
    if (sourceBox) {
      sourceBox.remove();
    } else {
      topbar.remove();
    }
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

    menu.querySelectorAll('.js-set-status').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const status = link.dataset.status || 'Offline';
        setOperatorStatus(status, {
          source: 'status_dropdown',
          previousStatus: operatorRuntimeState.operatorStatus,
        }).then(() => closeMenu());
      });
    });

    menu.querySelectorAll('[data-mock-open="#modalMakeBusy"], [data-mock-open="#modalMakeOffline"]').forEach((link) => {
      link.addEventListener('click', () => {
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
        const isMobile = window.innerWidth <= GLOBAL_UI_CONFIG.mobileViewportMaxPx;

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

    const releaseHeaderMenus = () => {
      document.querySelectorAll('.main-header .user-menu.is-modal-active').forEach((menu) => {
        menu.classList.remove('is-modal-active');
      });
    };

    const closeModal = (modal) => {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      releaseHeaderMenus();
    };

    const openModal = (selector) => {
      const modal = document.querySelector(selector);
      if (!modal) return;
      document.querySelectorAll('.main-header .user-menu').forEach((menu) => {
        menu.classList.remove('open');
        menu.classList.add('is-modal-active');
      });
      modal.hidden = false;
      document.body.classList.add('modal-open');
      window.setTimeout(() => {
        modal.querySelector('input, select, textarea, button')?.focus();
      }, GLOBAL_UI_CONFIG.immediateFocusMs);
    };

    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-mock-open]');
      if (opener) {
        event.preventDefault();
        openModal(opener.dataset.mockOpen);
        return;
      }

      const offlineRadioCard = event.target.closest('#modalMakeOffline .global-modal-body .radio');
      if (offlineRadioCard && !event.target.closest('input, button, a, select, textarea')) {
        const input = offlineRadioCard.querySelector('input[type="radio"][name="offlineReason"]');
        if (input && !input.disabled) {
          event.preventDefault();
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
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
      // const screenshots = Array.from(modal.querySelector('#problemFile').files || []);
      // screenshots.forEach((file) => formData.append('screenshots[]', file));
      // fetch(PROBLEM_REPORT_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'X-Requested-With': 'XMLHttpRequest' },
      //   body: formData,
      // }).then((response) => response.json());
      */

      button.textContent = 'Отправлено';
      window.setTimeout(() => {
        button.textContent = 'Отправить';
        closeModal(modal);
      }, GLOBAL_UI_CONFIG.reportFeedbackMs);
    });

    document.querySelector('#btnApplyBusy')?.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const modal = button.closest('.global-modal-backdrop');
      const reason = modal?.querySelector('input[name="busyReason"]:checked')?.value || 'busy';
      const reasonLabel = modal?.querySelector('input[name="busyReason"]:checked')?.closest('label')?.textContent.trim() || 'Занят';
      const comment = modal?.querySelector('#busyComment')?.value.trim() || '';

      button.dataset.lastReason = reason;
      button.dataset.lastComment = comment;
      button.textContent = 'Применено';

      /*
      // Optional dedicated Busy endpoint for backend programmer:
      // If backend wants reason/comment stored separately from generic status,
      // use OPERATOR_BUSY_ENDPOINT instead of OPERATOR_STATUS_ENDPOINT.
      // fetch(OPERATOR_BUSY_ENDPOINT, {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'X-Requested-With': 'XMLHttpRequest',
      //   },
      //   body: JSON.stringify({
      //     status: 'Busy',
      //     previous_status: operatorRuntimeState.operatorStatus,
      //     reason,
      //     reason_label: reasonLabel,
      //     comment,
      //     source: 'make_me_busy_modal',
      //     connection_quality: operatorRuntimeState.connectionQuality,
      //     changed_at: new Date().toISOString(),
      //   }),
      // }).then((response) => response.json());
      */

      setOperatorStatus('Busy', {
        reason,
        reasonLabel,
        comment,
        source: 'make_me_busy_modal',
        previousStatus: operatorRuntimeState.operatorStatus,
      }).finally(() => {
        window.setTimeout(() => {
          button.textContent = 'Применить';
          closeModal(modal);
        }, GLOBAL_UI_CONFIG.statusFeedbackMs);
      });
    });

    document.querySelector('#btnApplyOffline')?.addEventListener('click', (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const modal = button.closest('.global-modal-backdrop');
      const reason = modal?.querySelector('input[name="offlineReason"]:checked')?.value || 'shift_finished';
      const reasonLabel = modal?.querySelector('input[name="offlineReason"]:checked')?.closest('label')?.textContent.trim() || 'Офлайн';
      const comment = modal?.querySelector('#offlineComment')?.value.trim() || '';

      button.dataset.lastReason = reason;
      button.dataset.lastComment = comment;
      button.textContent = 'Применено';

      /*
      // Optional dedicated Offline endpoint for backend programmer:
      // If backend wants offline reason stored separately from generic status,
      // use OPERATOR_OFFLINE_ENDPOINT instead of OPERATOR_STATUS_ENDPOINT.
      // fetch(OPERATOR_OFFLINE_ENDPOINT, {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //     'X-Requested-With': 'XMLHttpRequest',
      //   },
      //   body: JSON.stringify({
      //     status: 'Offline',
      //     previous_status: operatorRuntimeState.operatorStatus,
      //     reason,
      //     reason_label: reasonLabel,
      //     comment,
      //     source: 'make_me_offline_modal',
      //     connection_quality: operatorRuntimeState.connectionQuality,
      //     changed_at: new Date().toISOString(),
      //   }),
      // }).then((response) => response.json());
      */

      setOperatorStatus('Offline', {
        reason,
        reasonLabel,
        comment,
        source: 'make_me_offline_modal',
        previousStatus: operatorRuntimeState.operatorStatus,
      }).finally(() => {
        window.setTimeout(() => {
          button.textContent = 'Применить';
          closeModal(modal);
        }, GLOBAL_UI_CONFIG.statusFeedbackMs);
      });
    });
  }

  function bindAdminUserMenuControls() {
    const menu = document.querySelector('.main-header .admin-user-menu');
    if (!menu || menu.dataset.adminControlsBound === '1') {
      return;
    }

    menu.dataset.adminControlsBound = '1';
    const dropdown = menu.closest('.user-menu');
    const closeDropdown = () => dropdown?.classList.remove('open');

    menu.querySelectorAll('.admin-status-pill[data-status]').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (button.dataset.mockOpen) {
          closeDropdown();
          return;
        }
        event.preventDefault();
        const status = button.dataset.status || 'Offline';
        setOperatorStatus(status, {
          source: 'admin_user_menu',
          previousStatus: operatorRuntimeState.operatorStatus,
        }).finally(closeDropdown);
      });
    });

    menu.querySelectorAll('[data-mock-open]').forEach((button) => {
      button.addEventListener('click', closeDropdown);
    });

    menu.querySelectorAll('.js-admin-menu-toggle').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const active = button.classList.toggle('active');
        const state = button.querySelector('b');
        if (state) {
          state.textContent = active ? 'Вкл.' : 'Выкл.';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    moveTopbarToHeader();
    updateOperatorStatusUi(operatorRuntimeState.operatorStatus);
    bindUserMenuDropdown();
    bindStatusDropdown();
    bindSidebarToggle();
    bindGlobalMockModals();
    bindAdminUserMenuControls();
    bindConnectionQualityMonitor();
  });
})();
