(() => {
  const root = document.querySelector('#admin-agent-chat');
  if (!root) {
    return;
  }

  const CHAT_TRANSLATION_TARGET_LANG = 'en';

  const getMessageAuthor = (message) => {
    if (!message) {
      return '';
    }
    if (message.dataset.messageAuthor) {
      return message.dataset.messageAuthor;
    }
    return message.classList.contains('right') ? 'client' : 'operator';
  };

  const isMessageViewedByClient = (message) => {
    if (!message) {
      return true;
    }
    if (message.dataset.messageViewedByClient) {
      return message.dataset.messageViewedByClient === 'true';
    }
    return message.classList.contains('read');
  };

  const getMessageKind = (message) => {
    if (!message) {
      return '';
    }
    return message.dataset.messageKind || 'text';
  };

  const getAttachmentKind = (message) => {
    if (!message) {
      return 'none';
    }
    if (message.dataset.attachmentKind) {
      return message.dataset.attachmentKind;
    }
    const legacyKind = getMessageKind(message);
    if (legacyKind === 'files') {
      return 'file';
    }
    if (legacyKind === 'photo' || legacyKind === 'photos') {
      return 'image';
    }
    return ['file', 'audio', 'voice'].includes(legacyKind) ? legacyKind : 'none';
  };

  const getAttachmentCount = (message) => {
    if (!message) {
      return 0;
    }
    if (message.dataset.attachmentCount) {
      return Number(message.dataset.attachmentCount) || 0;
    }
    const legacyKind = getMessageKind(message);
    if (legacyKind === 'files' || legacyKind === 'photos') {
      return message.querySelectorAll('.message-file-card, .message-photo-card').length || 2;
    }
    return getAttachmentKind(message) === 'none' ? 0 : 1;
  };

  const getSystemKind = (message) => {
    if (!message) {
      return '';
    }
    if (message.dataset.systemKind) {
      return message.dataset.systemKind;
    }
    const legacyKind = getMessageKind(message);
    return getMessageAuthor(message) === 'system' ? legacyKind : '';
  };

  const getMessageCensoredState = (message) => {
    if (!message || message.dataset.messageModerated !== 'true') {
      return 'none';
    }
    return message.dataset.messageCensored || 'partial';
  };

  const getMessageSendState = (message) => {
    if (!message) {
      return '';
    }
    return message.dataset.sendState || '';
  };

  const getMessageLang = (message) => {
    if (!message) {
      return 'auto';
    }
    return message.dataset.messageLang || 'auto';
  };

  const getTranslationTargetLang = () => CHAT_TRANSLATION_TARGET_LANG;

  const messageHasTextPart = (message, bubble = null) => {
    if (!message) {
      return false;
    }
    if (message.dataset.messageHasText) {
      return message.dataset.messageHasText === 'true';
    }
    const scope = bubble || message.querySelector('.direct-chat-text');
    return Boolean(scope?.querySelector('.ng-binding')?.textContent.trim());
  };

  function bindToggle(selector) {
      const items = document.querySelectorAll(selector);
      items.forEach((item) => {
        if (item.dataset.toggleBound === '1') {
          return;
        }
        item.dataset.toggleBound = '1';
        item.setAttribute('role', 'checkbox');
        item.setAttribute('aria-checked', item.classList.contains('active') ? 'true' : 'false');
        item.addEventListener('click', (event) => {
          event.preventDefault();
          const isActive = item.classList.toggle('active');
          item.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
      });
    }

  function bindDateRangePickers() {
    const dates = document.querySelectorAll('#admin-agent-chat .conversation-items .date');
    if (!dates.length) {
      return;
    }

    const closeAll = (except) => {
      dates.forEach((date) => {
        if (date === except) {
          return;
        }
        date.classList.remove('is-open');
        const popover = date.querySelector('.date-range-popover');
        const toggle = date.querySelector('.date-range-toggle');
        if (popover) {
          popover.hidden = true;
        }
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    };

    dates.forEach((date, index) => {
      if (date.dataset.rangeBound === '1') {
        return;
      }

      const label = date.querySelector('span');
      if (!label) {
        return;
      }

      date.dataset.rangeBound = '1';
      const rawDate = label.textContent.trim();
      const inputDate = rawDate.split('.').reverse().join('-');
      const popoverId = `dateRangePopover-${index}`;

      const toggle = document.createElement('button');
      toggle.className = 'date-range-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', popoverId);
      toggle.textContent = rawDate;

      label.replaceWith(toggle);

      const popover = document.createElement('div');
      popover.className = 'date-range-popover';
      popover.id = popoverId;
      popover.hidden = true;
      popover.innerHTML = `
        <div class="date-range-title">Показать сообщения за период</div>
        <div class="date-range-grid">
          <div class="date-range-field">
            <label for="${popoverId}-from">С</label>
            <input id="${popoverId}-from" type="datetime-local" value="${inputDate}T00:00">
          </div>
          <div class="date-range-field">
            <label for="${popoverId}-to">По</label>
            <input id="${popoverId}-to" type="datetime-local" value="${inputDate}T23:59">
          </div>
        </div>
        <div class="date-range-actions">
          <button class="btn btn-default btn-xs js-date-range-reset" type="button">Сбросить</button>
          <button class="btn btn-primary btn-xs js-date-range-apply" type="button">Показать</button>
        </div>
        <div class="date-range-status" aria-live="polite"></div>
      `;
      date.appendChild(popover);

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = popover.hidden;
        closeAll(date);
        popover.hidden = !isOpen;
        date.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      popover.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      const apply = popover.querySelector('.js-date-range-apply');
      const reset = popover.querySelector('.js-date-range-reset');
      const status = popover.querySelector('.date-range-status');
      const from = popover.querySelector('input[id$="-from"]');
      const to = popover.querySelector('input[id$="-to"]');
      const dateInputs = popover.querySelectorAll('input[type="datetime-local"]');

      dateInputs.forEach((input) => {
        const openNativePicker = () => {
          if (typeof input.showPicker === 'function') {
            input.showPicker();
          }
        };

        input.addEventListener('focus', openNativePicker);
        input.addEventListener('click', openNativePicker);
      });

      if (apply && status && from && to) {
        apply.addEventListener('click', () => {
          status.textContent = `Выбран диапазон: ${from.value || 'начало'} - ${to.value || 'конец'}.`;
        });
      }

      if (reset && status && from && to) {
        reset.addEventListener('click', () => {
          from.value = `${inputDate}T00:00`;
          to.value = `${inputDate}T23:59`;
          status.textContent = 'Диапазон сброшен к выбранному дню.';
        });
      }
    });

    if (!document.body.dataset.dateRangeDismissBound) {
      document.body.dataset.dateRangeDismissBound = '1';
      document.addEventListener('click', () => closeAll());
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeAll();
        }
      });
    }
  }

  function bindRightContextTabs() {
    const panel = document.querySelector('#admin-agent-chat .pane-right');
    if (!panel || panel.dataset.rightTabsBound === '1') {
      return;
    }

    const tabs = panel.querySelectorAll('.right-tab[data-tab]');
    const panes = panel.querySelectorAll('.right-pane[id^="tab-"]');
    if (!tabs.length || !panes.length) {
      return;
    }

    panel.dataset.rightTabsBound = '1';

    const activate = (tabName) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.tab === tabName;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      panes.forEach((pane) => {
        pane.classList.toggle('active', pane.id === `tab-${tabName}`);
      });
    };

    tabs.forEach((tab) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        activate(tab.dataset.tab);
      });
    });

    activate(panel.querySelector('.right-tab.active')?.dataset.tab || 'ai');
  }

  function bindRightPanelCollapse() {
    const panel = document.querySelector('#admin-agent-chat .pane-right');
    if (!panel || panel.dataset.rightCollapseBound === '1') {
      return;
    }

    const collapseButton = panel.querySelector('.js-right-panel-collapse');
    const openButton = panel.querySelector('.js-right-panel-open');
    if (!collapseButton || !openButton) {
      return;
    }

    panel.dataset.rightCollapseBound = '1';

    const setCollapsed = (collapsed) => {
      panel.classList.toggle('is-collapsed', collapsed);
      collapseButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      openButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };

    collapseButton.addEventListener('click', (event) => {
      event.preventDefault();
      setCollapsed(true);
    });

    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      setCollapsed(false);
    });

    setCollapsed(false);
  }

  function bindLeftPanelCollapse() {
    const panel = document.querySelector('#admin-agent-chat .pane-left');
    if (!panel || panel.dataset.leftCollapseBound === '1') {
      return;
    }

    const collapseButton = panel.querySelector('.js-left-panel-collapse');
    const openButton = panel.querySelector('.js-left-panel-open');
    if (!collapseButton || !openButton) {
      return;
    }

    panel.dataset.leftCollapseBound = '1';

    const setCollapsed = (collapsed) => {
      panel.classList.toggle('is-collapsed', collapsed);
      collapseButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      openButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };

    collapseButton.addEventListener('click', (event) => {
      event.preventDefault();
      setCollapsed(true);
    });

    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      setCollapsed(false);
    });

    setCollapsed(false);
  }

  function bindRightContextProfile() {
    const panel = document.querySelector('#admin-agent-chat .pane-right');
    if (!panel || panel.dataset.profileContextBound === '1') {
      return;
    }

    panel.dataset.profileContextBound = '1';

    panel.querySelectorAll('.js-context-accordion').forEach((button) => {
      const item = button.closest('.context-accordion-item');
      const body = item?.querySelector('.context-accordion-body');
      if (!item || !body) {
        return;
      }

      button.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        body.hidden = !isOpen;
      });
    });

    panel.querySelectorAll('.context-accordion-body').forEach((body) => {
      const edit = body.querySelector('.js-context-edit');
      const cancel = body.querySelector('.js-context-cancel');
      const save = body.querySelector('.js-context-save');
      const rows = Array.from(body.querySelectorAll('.context-data-row')).filter((row) => row.querySelector('input'));

      rows.forEach((row) => {
        const input = row.querySelector('input');
        const output = row.querySelector('strong');
        const label = row.querySelector('span');
        if (input && output) {
          if (!input.value && output.textContent.trim() !== 'unknown') {
            input.value = output.textContent.trim();
          }
          input.dataset.savedValue = input.value;
          input.readOnly = true;
          input.hidden = false;
          if (label && !label.querySelector('.context-current-value')) {
            const currentValue = document.createElement('em');
            currentValue.className = 'context-current-value';
            currentValue.textContent = input.dataset.savedValue || 'unknown';
            label.appendChild(currentValue);
          }
        }
      });

      const syncDirtyState = () => {
        rows.forEach((row) => {
          const input = row.querySelector('input');
          row.classList.toggle('is-dirty', Boolean(input && input.value !== input.dataset.savedValue));
        });
      };

      const setEditing = (editing) => {
        rows.forEach((row) => {
          const input = row.querySelector('input');
          const currentValue = row.querySelector('.context-current-value');
          row.classList.toggle('is-editing', editing);
          if (input) {
            input.readOnly = !editing;
          }
          if (currentValue && input) {
            currentValue.textContent = input.dataset.savedValue || 'unknown';
          }
        });

        if (edit) {
          edit.hidden = editing;
        }
        if (cancel) cancel.hidden = !editing;
        if (save) save.hidden = !editing;
      };

      edit?.addEventListener('click', (event) => {
        event.preventDefault();
        body.classList.add('is-edit-mode');
        setEditing(true);
      });

      save?.addEventListener('click', (event) => {
        event.preventDefault();
        rows.forEach((row) => {
          const input = row.querySelector('input');
          const output = row.querySelector('strong');
          const value = input?.value?.trim();
          if (output && input) {
            output.textContent = value || 'unknown';
            input.dataset.savedValue = input.value;
            const currentValue = row.querySelector('.context-current-value');
            if (currentValue) {
              currentValue.textContent = input.dataset.savedValue || 'unknown';
            }
          }
        });
        body.classList.remove('is-edit-mode');
        syncDirtyState();
        setEditing(false);
      });

      cancel?.addEventListener('click', (event) => {
        event.preventDefault();
        rows.forEach((row) => {
          const input = row.querySelector('input');
          if (input) {
            input.value = input.dataset.savedValue || '';
          }
        });
        body.classList.remove('is-edit-mode');
        syncDirtyState();
        setEditing(false);
      });

      rows.forEach((row) => {
        row.querySelector('input')?.addEventListener('input', syncDirtyState);
      });

      setEditing(false);
    });

    panel.querySelectorAll('.js-copy-context').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const original = button.textContent.trim();
        try {
          await navigator.clipboard?.writeText(button.dataset.copy || '');
          button.textContent = 'Copied';
        } catch (error) {
          button.textContent = 'Ready to copy';
        }
        window.setTimeout(() => {
          button.textContent = original;
        }, 1200);
      });
    });
  }

  function bindPinnedMessagesDrawer() {
    const drawer = root.querySelector('#pinnedMessagesDrawer');
    const openButton = root.querySelector('.js-open-pinned-messages');
    if (!drawer || !openButton || drawer.dataset.pinnedDrawerBound === '1') {
      return;
    }

    drawer.dataset.pinnedDrawerBound = '1';
    const closeButton = drawer.querySelector('.js-close-pinned-messages');
    const list = drawer.querySelector('.pinned-drawer-list');
    const emptyState = drawer.querySelector('.pinned-empty-state');
    const currentOperator = 'admin';
    const demoPinnedSeed = [
      { id: 'pin-1009', messageId: 'demo-voice-message', title: 'Voice note', preview: 'Голосовое сообщение клиента, которое нужно быстро найти перед ответом.', meta: 'Voice · 0:10', pinnedBy: 'admin', pinnedAt: '8:43', pinnedAtTs: 9 },
      { id: 'pin-1008', messageId: 'demo-audio-file', title: 'Audio attachment', preview: 'Короткое аудио, закрепленное как важная часть диалога.', meta: 'Audio · 0:10', pinnedBy: 'admin', pinnedAt: '8:41', pinnedAtTs: 8 },
      { id: 'pin-1007', messageId: 'demo-five-photos', title: 'Reference photos', preview: 'Пять изображений, которые оператор может использовать при разборе контекста.', meta: 'Gallery · photos', pinnedBy: 'moderator_ira', pinnedAt: '8:38', pinnedAtTs: 7 },
      { id: 'pin-1006', messageId: 'demo-multi-files', title: 'Attached documents', preview: 'Несколько файлов для сверки платежа и истории обращения клиента.', meta: 'Support · files', pinnedBy: 'admin', pinnedAt: '8:35', pinnedAtTs: 6 },
      { id: 'pin-1005', messageId: '7', title: 'Payment context', preview: 'Оплата прошла, но нужно коротко объяснить следующий шаг без давления.', meta: 'Orion · 8:31', pinnedBy: 'admin', pinnedAt: '8:32', pinnedAtTs: 5 },
      { id: 'pin-1004', messageId: '6', title: 'Timezone confirmation', preview: 'Клиент просит подтвердить время по Нью-Йорку перед началом сессии.', meta: 'Alla · 8:24', pinnedBy: 'support_anna', pinnedAt: '8:25', pinnedAtTs: 4 },
      { id: 'pin-1003', messageId: 'demo-file-attachment', title: 'Payment document', preview: 'payment-details.pdf attached for billing review.', meta: 'Support · file', pinnedBy: 'admin', pinnedAt: '8:18', pinnedAtTs: 3 },
      { id: 'pin-1002', messageId: 'demo-long', title: 'Long context', preview: 'Клиент переживает, что часовой пояс может быть указан неверно.', meta: 'Orion · 7:58', pinnedBy: 'moderator_ira', pinnedAt: '8:12', pinnedAtTs: 2 },
      { id: 'pin-1001', messageId: '2', title: 'Session details', preview: 'Привет! Подскажите, пожалуйста, удобно ли сегодня обсудить детали?', meta: 'Alla · 8:17', pinnedBy: 'admin', pinnedAt: '8:10', pinnedAtTs: 1 },
    ];
    let pinnedStore = [];
    let nextPinnedId = 2000;
    let nextPinnedTs = demoPinnedSeed.length + 1;

    const demoPinnedApi = {
      list() {
        /*
        // Real API integration point:
        return fetch('/admin/messages/pinned?conversation_id=c2', {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        }).then((response) => response.json());
        */
        return window.Promise.resolve(demoPinnedSeed.map((item) => ({ ...item })));
      },
      pin(record) {
        /*
        // Real API integration point:
        return fetch('/admin/messages/pinned', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ conversation_id: 'c2', message_id: record.messageId }),
        }).then((response) => response.json());
        */
        return window.Promise.resolve({ ...record, id: record.id || `pin-${nextPinnedId++}` });
      },
      unpin(record) {
        /*
        // Real API integration point:
        return fetch(`/admin/messages/pinned/${encodeURIComponent(record.id)}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        }).then((response) => response.json());
        */
        return window.Promise.resolve({ ok: true, id: record.id });
      },
    };

    const getMessageAnchor = (messageId) => {
      if (!messageId) {
        return '';
      }

      return `message-${String(messageId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    };

    const ensureAnchors = () => {
      root.querySelectorAll('.direct-chat-msg[data-message-id]').forEach((message) => {
        if (message.id) {
          return;
        }

        const anchor = getMessageAnchor(message.dataset.messageId);
        if (anchor) {
          message.id = anchor;
        }
      });
    };

    const close = () => {
      drawer.hidden = true;
      openButton.classList.remove('is-active');
      openButton.setAttribute('aria-expanded', 'false');
    };

    const open = () => {
      drawer.hidden = false;
      openButton.classList.add('is-active');
      openButton.setAttribute('aria-expanded', 'true');
    };

    const toggle = () => {
      if (drawer.hidden) {
        open();
        return;
      }

      close();
    };

    const highlightMessage = (message) => {
      message.classList.remove('is-anchor-highlight');
      window.setTimeout(() => {
        message.classList.add('is-anchor-highlight');
        window.setTimeout(() => message.classList.remove('is-anchor-highlight'), 1800);
      }, 20);
    };

    const goToMessage = (messageId) => {
      ensureAnchors();
      const anchor = getMessageAnchor(messageId);
      const target = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightMessage(target);
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `#${anchor}`);
      }
    };

    const escapeText = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));

    const setMessagePinned = (messageId, pinned) => {
      const anchor = getMessageAnchor(messageId);
      const message = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
      if (message) {
        message.classList.toggle('is-pinned-message', pinned);
        const metaRow = message.querySelector('.message-meta-row');
        let indicator = message.querySelector('.message-pinned-state');
        if (pinned && metaRow && !indicator) {
          indicator = document.createElement('span');
          indicator.className = 'message-pinned-state';
          indicator.title = 'Pinned';
          indicator.setAttribute('aria-label', 'Pinned');
          metaRow.appendChild(indicator);
        } else if (!pinned && indicator) {
          indicator.remove();
        }

        const pinButton = message.querySelector('.message-pin-toggle');
        if (pinButton) {
          pinButton.classList.toggle('is-pinned', pinned);
          pinButton.textContent = pinned ? 'Unpin' : 'Pin';
          pinButton.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        }
      }
    };

    const sortPinned = () => {
      pinnedStore.sort((a, b) => (Number(b.pinnedAtTs) || 0) - (Number(a.pinnedAtTs) || 0));
    };

    const showPinnedError = (message) => {
      let error = drawer.querySelector('.pinned-drawer-error');
      if (!error) {
        error = document.createElement('div');
        error.className = 'pinned-drawer-error';
        drawer.querySelector('.pinned-drawer-head')?.after(error);
      }
      error.textContent = message;
      error.hidden = false;
      window.clearTimeout(showPinnedError.timer);
      showPinnedError.timer = window.setTimeout(() => {
        error.hidden = true;
      }, 2600);
    };

      const getPinnedPreviewFromMessage = (messageId) => {
        const anchor = getMessageAnchor(messageId);
        const message = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
        const attachmentKind = getAttachmentKind(message);
        const attachmentCount = getAttachmentCount(message);
        const text = message?.querySelector('.ng-binding')?.textContent?.trim();
        const timestamp = message?.querySelector('.direct-chat-timestamp')?.textContent?.trim();
        const sender = getMessageAuthor(message) === 'operator' ? 'Orion' : 'Alla';
        const kindTitles = {
          audio: 'Audio attachment',
          voice: 'Voice note',
          file: 'File attachment',
          image: 'Photo',
          mix: 'Mixed attachments',
        };

      return {
        messageId,
        title: attachmentCount > 1 && attachmentKind === 'file'
          ? 'Attached documents'
          : attachmentCount > 1 && attachmentKind === 'image'
            ? 'Photos'
            : kindTitles[attachmentKind] || 'Pinned message',
        preview: text || 'Non-text message attachment.',
        meta: `${sender}${timestamp ? ` · ${timestamp}` : ''}`,
      };
    };

    const updatePinnedUiState = () => {
      const messageIds = new Set(pinnedStore.map((item) => String(item.messageId)));
      root.querySelectorAll('.direct-chat-msg[data-message-id]').forEach((message) => {
        setMessagePinned(message.dataset.messageId, messageIds.has(String(message.dataset.messageId)));
      });

      if (emptyState) {
        emptyState.hidden = pinnedStore.length > 0;
      }

      openButton.classList.toggle('has-pinned-items', pinnedStore.length > 0);
    };

    const renderPinnedList = () => {
      if (!list) {
        return;
      }

      sortPinned();
      list.querySelectorAll('.pinned-message-card').forEach((card) => card.remove());
      pinnedStore.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'pinned-message-card';
        card.dataset.messageTarget = item.messageId;
        card.dataset.pinId = item.id;
        card.innerHTML = `
          <button class="pinned-message-main js-pinned-jump" type="button">
            <span class="pinned-message-meta">Message: ${escapeText(item.meta)}</span>
            <strong>${escapeText(item.title)}</strong>
            <span>${escapeText(item.preview)}</span>
            <span class="pinned-message-owner">Pinned by ${escapeText(item.pinnedBy)} · ${escapeText(item.pinnedAt)}</span>
          </button>
          <button class="pinned-unpin-btn js-pinned-unpin" type="button">Unpin</button>
        `;
        list.insertBefore(card, emptyState || null);
      });
      updatePinnedUiState();
    };

    const optimisticPin = (messageId) => {
      if (!messageId || pinnedStore.some((item) => String(item.messageId) === String(messageId))) {
        return;
      }

      const optimisticRecord = {
        ...getPinnedPreviewFromMessage(messageId),
        id: `optimistic-${Date.now()}`,
        pinnedBy: currentOperator,
        pinnedAt: 'now',
        pinnedAtTs: nextPinnedTs++,
      };
      pinnedStore.unshift(optimisticRecord);
      renderPinnedList();
      demoPinnedApi.pin(optimisticRecord)
        .then((savedRecord) => {
          const index = pinnedStore.findIndex((item) => item.id === optimisticRecord.id);
          if (index !== -1) {
            pinnedStore[index] = { ...optimisticRecord, ...savedRecord };
            renderPinnedList();
          }
        })
        .catch(() => {
          pinnedStore = pinnedStore.filter((item) => item.id !== optimisticRecord.id);
          renderPinnedList();
          showPinnedError('Could not pin message. State was restored.');
        });
    };

    const optimisticUnpin = (record) => {
      if (!record) {
        return;
      }

      const previousStore = pinnedStore.slice();
      pinnedStore = pinnedStore.filter((item) => item.id !== record.id);
      renderPinnedList();
      demoPinnedApi.unpin(record)
        .catch(() => {
          pinnedStore = previousStore;
          renderPinnedList();
          showPinnedError('Could not unpin message. State was restored.');
        });
    };

    const bindMessagePinButtons = () => {
      root.querySelectorAll('.direct-chat-msg[data-message-id]').forEach((message) => {
        const pinButton = Array.from(message.querySelectorAll('button')).find((button) => button.classList.contains('message-pin-toggle') || /^(Pin|Unpin)$/i.test(button.textContent.trim()));
        if (!pinButton || pinButton.dataset.pinToggleBound === '1') {
          return;
        }

        pinButton.dataset.pinToggleBound = '1';
        pinButton.classList.add('message-pin-toggle');
        pinButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const messageId = message.dataset.messageId;
          const record = pinnedStore.find((item) => String(item.messageId) === String(messageId));
          if (record) {
            optimisticUnpin(record);
            return;
          }
          optimisticPin(messageId);
        });
      });
    };

    openButton.setAttribute('aria-expanded', 'false');
    ensureAnchors();
    demoPinnedApi.list()
      .then((records) => {
        pinnedStore = Array.isArray(records) ? records.map((item) => ({ ...item })) : [];
        bindMessagePinButtons();
        renderPinnedList();
      })
      .catch(() => {
        pinnedStore = [];
        bindMessagePinButtons();
        renderPinnedList();
        showPinnedError('Could not load pinned messages.');
      });

    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    });

    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    });

    root.addEventListener('click', (event) => {
      const pinButton = event.target.closest('.message-pin-toggle');
      const message = pinButton?.closest('.direct-chat-msg[data-message-id]');
      if (!pinButton || !message) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const messageId = message.dataset.messageId;
      const record = pinnedStore.find((item) => String(item.messageId) === String(messageId));
      if (record) {
        optimisticUnpin(record);
        return;
      }
      optimisticPin(messageId);
    });

    drawer.addEventListener('click', (event) => {
      const jumpButton = event.target.closest('.js-pinned-jump');
      if (jumpButton) {
        event.preventDefault();
        goToMessage(jumpButton.closest('.pinned-message-card')?.dataset.messageTarget);
        return;
      }

      const unpinButton = event.target.closest('.js-pinned-unpin');
      if (unpinButton) {
        event.preventDefault();
        event.stopPropagation();
        const card = unpinButton.closest('.pinned-message-card');
        const record = pinnedStore.find((item) => item.id === card?.dataset.pinId);
        optimisticUnpin(record);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
      }
    });
  }

  function bindQueueRefresh() {
    const refreshButtons = document.querySelectorAll('#btnRefreshChat, .queue-refresh');
    refreshButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.reload();
      });
    });
  }

  const getQueueStatePayload = (root, changedBy = 'unknown') => ({
    changed_by: changedBy,
    active_filter_zone: root.dataset.queueActiveFilterZone || 'none',
    query: root.dataset.queueActiveFilterZone === 'search' ? root.querySelector('#conversationsSearch')?.value.trim() || '' : '',
    selected_user_id: root.dataset.queueActiveFilterZone === 'user_select' ? root.querySelector('#queueUserSelect')?.dataset.selectedUserId || '' : '',
    quick_preset: root.dataset.queueActiveFilterZone === 'quick_preset' ? root.querySelector('.js-queue-tab.active')?.dataset.tab || 'all' : '',
    active_filters: root.dataset.queueActiveFilterZone === 'quick_filters' ? Array.from(root.querySelectorAll('.queue-search-filters input:checked')).map((item) => ({
      group: item.dataset.group || '',
      value: item.value || '',
    })) : [],
  });

  const resetQueueFilterZones = (root, keepZone = 'none') => {
    if (keepZone !== 'search') {
      const search = root.querySelector('#conversationsSearch');
      if (search) {
        search.value = '';
        search.classList.remove('is-filled');
        search.closest('.queue-search-input-group')?.classList.remove('is-filled');
      }
    }

    if (keepZone !== 'user_select') {
      const userSelect = root.querySelector('#queueUserSelect');
      const userBox = root.querySelector('.queue-user-select');
      const empty = userBox?.querySelector('.searchable-selectbox-empty');
      if (userSelect) {
        userSelect.value = '';
        delete userSelect.dataset.selectedUserId;
        userSelect.classList.remove('is-filled');
      }
      if (userBox) {
        delete userBox.dataset.selectedUserId;
        userBox.classList.remove('is-filled', 'has-selected-value', 'has-no-results', 'is-open');
        userBox.querySelectorAll('.searchable-selectbox-option.is-active').forEach((option) => option.classList.remove('is-active'));
      }
      if (empty) {
        empty.hidden = true;
      }
    }

    if (keepZone !== 'quick_filters') {
      root.querySelectorAll('.queue-search-filters input:checked').forEach((input) => {
        input.checked = false;
      });
      root.querySelectorAll('.queue-search-filters .filter-choice.active').forEach((label) => {
        label.classList.remove('active');
      });
      const filterToggle = root.querySelector('.queue-search-filters .js-queue-filter-toggle');
      const filterCount = root.querySelector('.queue-search-filters .js-filter-count');
      if (filterToggle) {
        filterToggle.classList.remove('is-active');
      }
      if (filterCount) {
        filterCount.textContent = '0';
      }
    }

    if (keepZone !== 'quick_preset') {
      root.querySelectorAll('.js-queue-tab.active').forEach((tab) => {
        tab.classList.remove('active');
        tab.setAttribute('aria-pressed', 'false');
      });
    }
  };

  const requestQueueStateUpdate = (payload) => {
    /*
    // Real API integration point for queue tabs, user select, quick filters, and queue search.
    // The server should return the sorted/filtered conversation queue.
    // Expected response can be either:
    // { html: "<a class='conv-item' ...>...</a>", counters: {...} }
    // or { conversations: [...], counters: {...} } for client-side rendering.
    return fetch('/admin/messages/conversations/filter', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Conversation queue filter request failed');
      }
      return response.json();
    });
    */
    return window.Promise.resolve({ ok: true, payload });
  };

  const getQueueCardSearchText = (item) => [
    item.dataset.conversationId,
    item.dataset.senderUserId,
    item.dataset.senderName,
    item.dataset.recipientUserId,
    item.dataset.recipientName,
    item.dataset.displayContactName,
    item.querySelector('.conv-snippet')?.textContent,
    item.querySelector('.conv-time')?.textContent,
    ...Array.from(item.querySelectorAll('.conv-pill')).map((pill) => pill.textContent),
  ].filter(Boolean).join(' ').toLowerCase();

  const sortQueueCardsByPriority = (list) => {
    Array.from(list.querySelectorAll('.conv-item, .list-group-item'))
      .sort((a, b) => {
        const priorityA = Number(a.dataset.priority || 999);
        const priorityB = Number(b.dataset.priority || 999);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return 0;
      })
      .forEach((item) => list.appendChild(item));
  };

  // Русские подсказки для левой очереди: объясняют смысл коротких чипов без добавления лишнего текста в карточку.
  const queueHintByLabel = {
    reply: 'Клиент ждет ответа агента',
    sla: 'Клиент слишком долго ждет реакции; влияет на SLA',
    live: 'Идет активная платная сессия',
    pp: 'Клиент открыл оплату, но платеж еще не завершен',
    sell: 'Нужно довести клиента до покупки продолжения или дополнительных минут',
    new: 'Новый сигнал интереса до начала чата',
    intent: 'Клиент проявил сильный интерес',
    credits: 'У клиента есть кредиты для старта платного общения'
  };

  const syncQueueCardHints = (root) => {
    root.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
      item.querySelectorAll('.js-conv-favorite').forEach((favorite) => {
        const active = favorite.classList.contains('is-favorite') || item.dataset.favorite === 'true';
        favorite.setAttribute('title', active ? 'Убрать чат из избранного' : 'Добавить чат в избранное');
        favorite.setAttribute('aria-label', active ? 'Убрать чат из избранного' : 'Добавить чат в избранное');
      });
      item.querySelectorAll('.conv-pin').forEach((pin) => {
        pin.setAttribute('title', 'Диалог закреплен или содержит закрепленные важные сообщения');
      });
      item.querySelectorAll('.conv-unread').forEach((unread) => {
        const value = unread.textContent.trim();
        const hasUnread = value === '!' || (Number(value) || 0) > 0;
        const isNewDialog = item.dataset.newDialog === 'true' || item.classList.contains('is-new-dialog');
        unread.setAttribute('title', isNewDialog && hasUnread ? 'Новый недавний диалог с непрочитанными сообщениями' : hasUnread ? 'Есть непрочитанные сообщения' : 'Нет новых непрочитанных сообщений');
      });
      item.querySelectorAll('.conv-pill').forEach((pill) => {
        const hint = queueHintByLabel[pill.textContent.trim().toLowerCase()];
        if (hint) {
          pill.setAttribute('title', hint);
        }
      });
    });
  };

  const setHint = (node, text, force = false) => {
    if (!node || !text) {
      return;
    }
    if (force || !node.getAttribute('title')) {
      node.setAttribute('title', text);
    }
    if (node.matches?.('button, [role="button"], input, textarea')) {
      if (force || !node.getAttribute('aria-label')) {
        node.setAttribute('aria-label', text);
      }
    }
  };

  // Общий слой русских подсказок: покрывает правый контекст и служебные кнопки, где текст слишком короткий.
  const syncGlobalTooltips = (root = document) => {
    const scope = root.querySelector ? root : document;
    const fixedHints = [
      ['.left-collapse-rail', 'Открыть левую очередь чатов'],
      ['.left-collapse-btn', 'Свернуть левую очередь чатов'],
      ['.right-collapse-rail', 'Открыть правый контекст клиента'],
      ['.right-collapse-btn', 'Свернуть правый контекст клиента'],
      ['#btnRefreshChat', 'Обновить рабочую очередь и состояние подключения'],
      ['[data-mock-open="#modalReportProblem"]', 'Сообщить о проблеме в админ-интерфейсе'],
      ['.js-chat-search-toggle', 'Поиск внутри текущего диалога'],
      ['.js-chat-jump-up', 'Перейти к предыдущим сообщениям'],
      ['.js-chat-jump-down', 'Перейти к следующим сообщениям'],
      ['.js-chat-font-minus', 'Уменьшить размер текста в чате'],
      ['.js-chat-font-plus', 'Увеличить размер текста в чате'],
      ['.js-close-pinned-messages', 'Закрыть панель закрепленных сообщений'],
      ['#btnPinClear', 'Снять текущий фильтр закрепленных сообщений'],
      ['.composer-mode-toggle', 'Переключить быстрые ответы и рабочие действия чата'],
      ['.js-quick-scroll[data-direction="-1"]', 'Прокрутить быстрые ответы влево'],
      ['.js-quick-scroll[data-direction="1"]', 'Прокрутить быстрые ответы вправо'],
      ['[data-prototype-action="need-data"]', 'Подготовить сообщение с просьбой уточнить данные клиента'],
      ['[data-prototype-action="resolve-dialog"]', 'Отметить диалог как решенный'],
      ['#attachmentPreviewClear', 'Убрать выбранное вложение'],
      ['.js-composer-attach-toggle', 'Прикрепить файл или изображение'],
      ['#btnEmoji', 'Открыть выбор эмодзи'],
      ['#btnSendMessage', 'Отправить сообщение клиенту'],
      ['#btnVoiceMessage', 'Записать голосовое сообщение'],
      ['[data-prototype-action="insert-ai-draft"]', 'Вставить AI-черновик в поле ответа'],
      ['[data-prototype-action="save-note"]', 'Сохранить внутреннюю заметку по клиенту'],
      ['[data-prototype-action="clear-note"]', 'Очистить черновик заметки'],
      ['[data-prototype-action="open-follow-up"]', 'Запланировать следующее касание клиента'],
      ['[data-prototype-action="open-handoff"]', 'Передать диалог другому эксперту или старшему смены'],
      ['[data-prototype-action="open-compensation"]', 'Создать запрос на компенсацию для проверки'],
      ['[data-offer-action="sell"]', 'Вставить предложение продать продолжение или минуты'],
      ['[data-offer-action="package"]', 'Отправить ссылку на пакет продолжения'],
      ['[data-offer-action="deep-reading"]', 'Предложить глубокий платный разбор'],
      ['[data-offer-action="start-paid"]', 'Пригласить лида начать платный чат']
    ];

    fixedHints.forEach(([selector, hint]) => {
      scope.querySelectorAll(selector).forEach((node) => setHint(node, hint, true));
    });

    scope.querySelectorAll('[ng-click="copyMessage(item)"], .btn .fa-copy').forEach((node) => {
      const target = node.closest('button') || node;
      setHint(target, 'Скопировать сообщение', true);
    });
    scope.querySelectorAll('[ng-click="pinMessage(item)"], .btn .fa-thumb-tack').forEach((node) => {
      const target = node.closest('button') || node;
      setHint(target, 'Закрепить сообщение как важное', true);
    });
    scope.querySelectorAll('.audio-play-btn, .voice-note-play').forEach((node) => {
      setHint(node, 'Прослушать аудио или голосовое сообщение', true);
    });

    scope.querySelectorAll('.context-section-title').forEach((node) => {
      setHint(node, `Раздел правого контекста: ${node.textContent.trim().replace(/\s+/g, ' ')}`);
    });
    scope.querySelectorAll('.context-chip').forEach((node) => {
      setHint(node, `Контекстный признак клиента: ${node.textContent.trim()}`);
    });
    scope.querySelectorAll('.context-kpi, .context-line, .context-data-row').forEach((node) => {
      const label = node.querySelector('span')?.textContent.trim();
      const value = node.querySelector('strong')?.textContent.trim();
      if (label && value) {
        setHint(node, `${label}: ${value}`);
      }
    });
    scope.querySelectorAll('.flag-row').forEach((node) => {
      const label = node.querySelector('strong')?.textContent.trim();
      const value = node.querySelector('span')?.textContent.trim();
      if (label && value) {
        setHint(node, `Подготовка к сессии — ${label}: ${value}`);
      }
    });
    scope.querySelectorAll('.context-checkline').forEach((node) => {
      setHint(node, `Проверка качества: ${node.textContent.trim().replace(/\s+/g, ' ')}`);
    });
    scope.querySelectorAll('.context-note-item').forEach((node) => {
      setHint(node, `Внутренняя заметка: ${node.textContent.trim().replace(/\s+/g, ' ')}`);
    });
    scope.querySelectorAll('.context-accordion-head').forEach((node) => {
      setHint(node, `Открыть или закрыть блок: ${node.textContent.trim().replace(/\s+/g, ' ')}`);
    });
  };

  const syncQuickFilterVisibility = (root) => {
    const activeTab = root.querySelector('.js-queue-tab.active')?.dataset.tab || 'active_chats';
    const modeGroup = activeTab === 'pings' ? 'ping' : 'chat';
    root.querySelectorAll('.queue-search-filters .filter-choice').forEach((label) => {
      const input = label.querySelector('input');
      const group = input?.dataset.group || '';
      const visible = group === 'shared' || group === modeGroup;
      label.hidden = !visible;
      if (!visible && input?.checked) {
        input.checked = false;
      }
    });
    root.querySelectorAll('.queue-search-filters .filter-line').forEach((line) => {
      const choices = Array.from(line.querySelectorAll('.filter-choice'));
      line.hidden = choices.length > 0 && choices.every((choice) => choice.hidden);
    });
  };

  // Основная логика левой области: фильтруем рабочую очередь, архив показываем только по фильтру Archive.
  const applyDemoQueueState = (root, payload) => {
    const list = root.querySelector('.conv-list');
    if (!list) {
      return;
    }

    sortQueueCardsByPriority(list);
    syncQueueCardHints(root);

    const query = payload.query.toLowerCase();
    const quickPreset = payload.quick_preset || '';
    const filters = payload.active_filters || [];
    const filterValues = filters.map((filter) => String(filter.value || '').toLowerCase());
    const wantsArchive = filterValues.includes('archive');
    let visibleCount = 0;

    list.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
      const text = getQueueCardSearchText(item);
      const labels = Array.from(item.querySelectorAll('.conv-pill')).map((pill) => pill.textContent.trim().toLowerCase());
      const workloadType = item.dataset.workloadType || 'active_chat';
      const isArchived = item.dataset.archived === 'true' || item.classList.contains('is-archived');
      const isFavorite = item.dataset.favorite === 'true' || item.querySelector('.conv-favorite.is-favorite');
      const unread = item.querySelector('.conv-unread');
      const unreadValue = unread?.textContent.trim() || '0';
      const hasUnread = unreadValue === '!' || (Number(unreadValue) || 0) > 0;
      const isNewDialog = item.dataset.newDialog === 'true' || item.classList.contains('is-new-dialog');
      unread?.classList.toggle('is-fresh', isNewDialog && hasUnread);
      const matchesQuery = !query || text.includes(query);
      const matchesUser = !payload.selected_user_id
        || item.dataset.senderUserId === payload.selected_user_id
        || item.dataset.recipientUserId === payload.selected_user_id;
      const matchesPreset = wantsArchive
        || !quickPreset
        || (quickPreset === 'active_chats' && workloadType === 'active_chat')
        || (quickPreset === 'pings' && workloadType === 'ping');
      const matchesFilters = filters.every((filter) => {
        const value = String(filter.value || '').toLowerCase();
        if (value === 'archive') return isArchived;
        if (value === 'favorite') return isFavorite;
        if (value === 'needs_reply') return labels.some((label) => label === 'reply' || label.includes('needs reply'));
        if (value === 'sla') return labels.some((label) => label === 'sla');
        if (value === 'paid_live') return labels.some((label) => label === 'live');
        if (value === 'payment_pending') return labels.some((label) => label === 'pp');
        if (value === 'sell') return labels.some((label) => label === 'sell');
        if (value === 'new_ping') return workloadType === 'ping' && labels.some((label) => label === 'new');
        if (value === 'high_intent') return workloadType === 'ping' && labels.some((label) => label === 'intent' || label.includes('high intent'));
        if (value === 'has_credits' || value === 'has_balance') return workloadType === 'ping' && labels.some((label) => label === 'credits' || label.includes('has credits') || label.includes('has balance'));
        return !value || labels.some((label) => label.replace(/\s+/g, '_').includes(value) || label.includes(value.replace(/_/g, ' ')));
      });
      const visible = matchesQuery && matchesUser && matchesPreset && matchesFilters && (wantsArchive ? isArchived : !isArchived);

      item.hidden = !visible;
      item.classList.toggle('is-search-hidden', !visible);
      if (visible) visibleCount += 1;
    });

    list.classList.toggle('has-search-query', payload.active_filter_zone !== 'none' && Boolean(query || payload.selected_user_id || filters.length || quickPreset));
    list.classList.toggle('has-no-search-results', visibleCount === 0);
  };

  const runQueueStateUpdate = (root, changedBy = 'unknown', activeZone = null) => {
    if (activeZone) {
      root.dataset.queueActiveFilterZone = activeZone;
    }
    const payload = getQueueStatePayload(root, changedBy);
    root.classList.add('is-searching-conversations');
    return requestQueueStateUpdate(payload)
      .then((data) => {
        applyDemoQueueState(root, data?.payload || payload);
        return data;
      })
      .finally(() => {
        root.classList.remove('is-searching-conversations');
      });
  };

  function bindConversationSearch() {
    const root = document.querySelector('#admin-agent-chat');
    const button = root?.querySelector('#btnSearchConversations');
    const input = root?.querySelector('#conversationsSearch');
    const list = root?.querySelector('.conv-list');
    if (!root || !button || !input || !list || input.dataset.queueSearchBound === '1') {
      return;
    }

    input.dataset.queueSearchBound = '1';
    let searchTimer = null;

    const syncFilled = () => {
      input.classList.toggle('is-filled', input.value.trim().length > 0);
      input.closest('.queue-search-input-group')?.classList.toggle('is-filled', input.value.trim().length > 0);
    };

    const runConversationQueueSearch = () => {
      const activeZone = input.value.trim() ? 'search' : 'none';
      if (activeZone === 'search') {
        resetQueueFilterZones(root, 'search');
      } else {
        resetQueueFilterZones(root, 'none');
      }
      runQueueStateUpdate(root, 'search', activeZone);
    };

    const scheduleConversationQueueSearch = () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(runConversationQueueSearch, 1000);
    };

    input.addEventListener('input', () => {
      syncFilled();
      scheduleConversationQueueSearch();
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      syncFilled();
      if (!input.value.trim()) {
        resetQueueFilterZones(root, 'none');
        runQueueStateUpdate(root, 'search_clear', 'none');
        input.focus();
        return;
      }
      window.clearTimeout(searchTimer);
      runConversationQueueSearch();
    });

    syncFilled();
  }

    function bindChatMoreMenu() {
      const menu = document.querySelector('#admin-agent-chat .chat-more-menu');
      if (!menu) {
        return;
      }

      const toggle = menu.querySelector('.dropdown-toggle');
      const closeMenu = () => menu.classList.remove('open');
      if (!toggle || toggle.dataset.chatMoreBound === '1') {
        return;
      }

      toggle.dataset.chatMoreBound = '1';
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

      menu.querySelectorAll('.chat-menu-inline-actions .btn').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });
      });
    }

    function bindChatSearchToggle() {
      const header = document.querySelector('#admin-agent-chat .chat-head-stage2');
      if (!header) {
        return;
      }

      const button = header.querySelector('.js-chat-search-toggle');
      const input = header.querySelector('.chat-search-input');
      const count = header.querySelector('.chat-search-count');
      const resultsBox = header.querySelector('.chat-search-results');
      if (!button || !input || button.dataset.chatSearchBound === '1') {
        return;
      }

      button.dataset.chatSearchBound = '1';
      let searchTimer = null;
      let searchRequestId = 0;
      const demoSearchIndex = [
        { id: '2', meta: 'Alla · 8:17 · loaded', text: 'Привет! Подскажите, пожалуйста, удобно ли сегодня обсудить детали?' },
        { id: '6', meta: 'Alla · 8:24 · loaded', text: 'Клиент просит подтвердить время по Нью-Йорку перед началом сессии.' },
        { id: 'demo-long', meta: 'Orion · 7:58 · loaded', text: 'Клиент переживает, что часовой пояс может быть указан неверно.' },
        { id: 'archive-124', meta: 'Archive · 12.03.2026 · not loaded', text: 'Предыдущая сессия: клиент уже спрашивал про удобное время.' },
        { id: 'archive-155', meta: 'Archive · 28.03.2026 · not loaded', text: 'В старой истории есть похожий вопрос про оплату и продолжение.' },
      ];

      const clearHighlights = () => {
        root.querySelectorAll('.direct-chat-msg.is-search-current').forEach((message) => message.classList.remove('is-search-current'));
      };

      const updateCount = (total = 0) => {
        if (count) {
          count.textContent = String(total);
        }
      };

      const setSearchLoading = (loading) => {
        header.classList.toggle('is-search-loading', loading);
        if (count) {
          count.textContent = loading ? '...' : count.textContent;
        }
      };

      const getMessageAnchor = (messageId) => `message-${String(messageId || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

      const ensureAnchors = () => {
        root.querySelectorAll('.direct-chat-msg[data-message-id]').forEach((message) => {
          if (!message.id) {
            message.id = getMessageAnchor(message.dataset.messageId);
          }
        });
      };

      const goToResult = (messageId) => {
        ensureAnchors();
        const target = root.querySelector(`#${CSS.escape(getMessageAnchor(messageId))}`);
        if (!target) {
          return;
        }

        clearHighlights();
        target.classList.add('is-search-current');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => target.classList.remove('is-search-current'), 1600);
      };

      const fetchSearchResults = (query) => new Promise((resolve) => {
        /*
        // Real AJAX integration point:
        fetch(`/admin/messages/search?conversation_id=c2&q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
          .then((response) => response.json())
          .then((data) => resolve(data.results || []))
          .catch(() => resolve([]));
        return;
        */

        window.setTimeout(() => {
          const normalized = query.toLowerCase();
          const results = demoSearchIndex.filter((item) => item.text.toLowerCase().includes(normalized) || item.meta.toLowerCase().includes(normalized));
          resolve(results);
        }, 220);
      });

      const renderSearchResults = (results) => {
        if (!resultsBox) {
          return;
        }

        updateCount(results.length);
        resultsBox.hidden = false;

        if (!results.length) {
          resultsBox.innerHTML = '<div class="chat-search-empty">No matches</div>';
          return;
        }

        resultsBox.innerHTML = results.map((item) => `
          <button class="chat-search-result" type="button" data-message-target="${item.id}">
            <span class="chat-search-result-meta">${item.meta}</span>
            <span class="chat-search-result-text">${item.text}</span>
          </button>
        `).join('');
      };

      const runSearch = async () => {
        const query = input.value.trim();
        const requestId = ++searchRequestId;
        clearHighlights();
        if (!resultsBox) {
          return;
        }

        if (!query) {
          resultsBox.hidden = true;
          resultsBox.innerHTML = '<div class="chat-search-empty">No matches</div>';
          updateCount(0);
          return;
        }

        setSearchLoading(true);
        const results = await fetchSearchResults(query);
        if (requestId !== searchRequestId) {
          return;
        }

        setSearchLoading(false);
        renderSearchResults(results);
      };

      const scheduleSearch = () => {
        window.clearTimeout(searchTimer);
        const query = input.value.trim();
        clearHighlights();

        if (!query) {
          searchRequestId += 1;
          setSearchLoading(false);
          if (resultsBox) {
            resultsBox.hidden = true;
            resultsBox.innerHTML = '<div class="chat-search-empty">No matches</div>';
          }
          updateCount(0);
          return;
        }

        updateCount(0);
        if (resultsBox) {
          resultsBox.hidden = false;
          resultsBox.innerHTML = '<div class="chat-search-empty">Type pause: searching in 1s...</div>';
        }
        searchTimer = window.setTimeout(runSearch, 1000);
      };

      button.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = header.classList.contains('search-open');
        if (isOpen && input.value.trim() === '') {
          header.classList.remove('search-open');
          clearHighlights();
          if (resultsBox) resultsBox.hidden = true;
          updateCount(0);
          return;
        }

        header.classList.add('search-open');
        input.focus();
      });

      input.addEventListener('input', scheduleSearch);

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          input.value = '';
          header.classList.remove('search-open');
          window.clearTimeout(searchTimer);
          searchRequestId += 1;
          setSearchLoading(false);
          clearHighlights();
          if (resultsBox) resultsBox.hidden = true;
          updateCount(0);
          button.focus();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          resultsBox?.querySelector('.chat-search-result')?.click();
        }
      });

      resultsBox?.addEventListener('click', (event) => {
        const result = event.target.closest('.chat-search-result');
        if (!result) {
          return;
        }
        event.preventDefault();
        goToResult(result.dataset.messageTarget);
      });

      updateCount(0);
    }

    function bindSessionToggle() {
      const root = document.querySelector('#admin-agent-chat');
      const button = root?.querySelector('.js-session-toggle');
      const panel = root?.querySelector('#billingPanel');
      if (!button || button.dataset.sessionToggleBound === '1') {
        return;
      }

      const setSessionButtonState = (running) => {
        button.classList.toggle('is-live', running);
        button.classList.toggle('is-panel-open', running);
        button.setAttribute(
          'title',
          running
            ? 'Платная сессия запущена; открыта панель управления сессией'
            : 'Запустить платную сессию и открыть панель управления'
        );
        button.setAttribute(
          'aria-label',
          running ? 'Платная сессия запущена' : 'Запустить платную сессию'
        );
      };

      const ensurePill = (host, label, className, title) => {
        if (!host || Array.from(host.querySelectorAll('.conv-pill, .dialog-chip')).some((pill) => pill.textContent.trim() === label)) {
          return;
        }
        const pill = document.createElement('span');
        pill.className = className;
        pill.textContent = label;
        if (title) {
          pill.setAttribute('title', title);
        }
        host.appendChild(pill);
      };

      const startPaidSession = () => {
        if (!root || root.dataset.workloadType === 'ping') {
          return;
        }
        if (panel) {
          panel.hidden = false;
          panel.classList.add('is-open');
        }
        root.dataset.sessionState = 'live';
        setSessionButtonState(true);

        const activeCard = root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');
        ensurePill(
          activeCard?.querySelector('.conv-line-labels'),
          'Live',
          'conv-pill conv-pill-success',
          'Идет активная платная сессия'
        );

        const labelHost = root.querySelector('.dialog-meta-labels');
        if (labelHost && !Array.from(labelHost.querySelectorAll('.dialog-chip')).some((chip) => chip.textContent.trim() === 'Live')) {
          labelHost.querySelectorAll('.dialog-chip').forEach((chip) => chip.remove());
          const chip = document.createElement('span');
          chip.className = 'dialog-chip dialog-chip-success';
          chip.textContent = 'Live';
          chip.setAttribute('title', 'Клиент сейчас находится в активной платной сессии; другому эксперту лучше не перебивать');
          labelHost.insertBefore(chip, labelHost.firstChild);
        }
        syncQueueCardHints(root);
        syncGlobalTooltips(root);
      };

      setSessionButtonState(Boolean(panel && !panel.hidden && panel.classList.contains('is-open')));
      button.dataset.sessionToggleBound = '1';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        startPaidSession();
      });
    }

    function bindMessageSafeActions() {
      const root = document.querySelector('#admin-agent-chat');
      if (!root || root.dataset.messageSafeActionsBound === '1') {
        return;
      }

      root.dataset.messageSafeActionsBound = '1';
      const replyPreview = root.querySelector('#replyPreview');
      const replyPreviewText = root.querySelector('#replyPreviewText');
      const replyPreviewClose = root.querySelector('#replyPreviewClose');
      const messageInput = root.querySelector('#messageInput');
      const composer = root.querySelector('#conversationInputArea') || document.querySelector('#conversationInputArea');

      const setComposerMode = (mode) => {
        if (!composer) {
          return;
        }
        composer.dataset.composerMode = ['reply', 'edit'].includes(mode) ? mode : 'direct';
      };

      setComposerMode('direct');

      const stopMessageToggle = (event) => {
        if (event.target.closest('.direct-chat-text')) {
          event.stopPropagation();
        }
      };

      const clearReplyPreview = () => {
        if (replyPreview) {
          replyPreview.hidden = true;
          replyPreview.removeAttribute('data-reply-to');
          replyPreview.removeAttribute('role');
          replyPreview.removeAttribute('tabindex');
          replyPreview.removeAttribute('aria-label');
        }
        if (replyPreviewText) {
          replyPreviewText.textContent = '';
        }
        if (composer?.dataset.composerMode === 'reply') {
          setComposerMode('direct');
        }
      };

      const setReplyPreview = (message, messageId) => {
        if (!replyPreview || !replyPreviewText) {
          return;
        }

        clearComposerEditMode();
        setComposerMode('reply');
        replyPreviewText.textContent = message || 'Selected message';
        if (messageId) {
          replyPreview.dataset.replyTo = messageId;
          replyPreview.setAttribute('role', 'link');
          replyPreview.setAttribute('tabindex', '0');
          replyPreview.setAttribute('aria-label', 'Go to replied message');
        }
        replyPreview.hidden = false;
        messageInput?.focus();
      };

      const getMessageAnchor = (messageId) => {
        if (!messageId) {
          return '';
        }

        return `message-${String(messageId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      };

      const ensureMessageAnchor = (message) => {
        if (!message || message.id) {
          return;
        }

        const messageId = message.dataset.messageId;
        const anchor = getMessageAnchor(messageId);
        if (anchor) {
          message.id = anchor;
        }
      };

      const highlightMessage = (message) => {
        if (!message) {
          return;
        }

        message.classList.remove('is-anchor-highlight');
        window.setTimeout(() => {
          message.classList.add('is-anchor-highlight');
          window.setTimeout(() => message.classList.remove('is-anchor-highlight'), 1800);
        }, 20);
      };

      const goToMessage = (messageId) => {
        const anchor = getMessageAnchor(messageId);
        const target = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
        if (!target) {
          return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightMessage(target);
        if (window.history?.replaceState) {
          window.history.replaceState(null, '', `#${anchor}`);
        }
      };

      const bindReplyAnchors = (scope = root) => {
        scope.querySelectorAll('.message-reply-quote[data-reply-to]').forEach((quote) => {
          if (quote.dataset.replyAnchorBound === '1') {
            return;
          }

          quote.dataset.replyAnchorBound = '1';
          quote.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            goToMessage(quote.dataset.replyTo);
          });
          quote.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              goToMessage(quote.dataset.replyTo);
            }
          });
        });
      };

      const stopAllAudio = (exceptAudio) => {
        root.querySelectorAll('.is-audio-playing').forEach((player) => {
          const audio = player._chatAudio;
          if (audio && audio !== exceptAudio) {
            audio.pause();
            audio.currentTime = 0;
          }
          player.classList.remove('is-audio-playing');
          const icon = player.querySelector('.js-audio-toggle .fa');
          if (icon) {
            icon.className = 'fa fa-play';
          }
        });
      };

      const bindAudioPlayers = (scope = root) => {
        scope.querySelectorAll('.audio-attachment[data-audio-src], .voice-note[data-audio-src]').forEach((player) => {
          if (player.dataset.audioBound === '1') {
            return;
          }

          const button = player.querySelector('.js-audio-toggle');
          const src = player.dataset.audioSrc;
          if (!button || !src) {
            return;
          }

          const audio = new Audio(src);
          player._chatAudio = audio;
          player.dataset.audioBound = '1';

          const setPlaying = (playing) => {
            player.classList.toggle('is-audio-playing', playing);
            const icon = button.querySelector('.fa');
            if (icon) {
              icon.className = playing ? 'fa fa-pause' : 'fa fa-play';
            }
          };

          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (audio.paused) {
              stopAllAudio(audio);
              audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
            } else {
              audio.pause();
              setPlaying(false);
            }
          });

          audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            setPlaying(false);
          });
          audio.addEventListener('pause', () => {
            if (audio.currentTime < audio.duration) {
              setPlaying(false);
            }
          });
        });
      };

      const addReplyAction = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        if (getMessageAuthor(message) !== 'client' || getMessageCensoredState(message) === 'full') {
          bubble.querySelector('.js-message-reply')?.remove();
          return;
        }

        const actions = bubble.querySelector('div[style*="margin-top:8px"]');
        if (!actions || actions.querySelector('.js-message-reply')) {
          return;
        }

        const button = document.createElement('button');
        button.className = 'btn btn-xs btn-default js-message-reply';
        button.type = 'button';
        button.innerHTML = '<i class="fa fa-reply"></i> Reply';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();

          const text = bubble.querySelector('.ng-binding')?.textContent.trim();
          setReplyPreview(text, message?.dataset.messageId);
        });

        actions.insertBefore(button, actions.firstElementChild);
      };

      const getDemoTranslation = (message) => {
        const translations = {
          2: 'Hi! Please tell me if it is convenient to discuss the details today.',
          6: 'Yes, I can confirm the time by New York before the session starts.',
          7: 'The payment has gone through, but I would like to understand the next step.',
          8: 'Could you please explain it briefly, without too many details yet?',
          32: 'I am worried that the timezone may be incorrect.',
          38: 'Please keep this context so I do not have to repeat it later.',
          'demo-long': 'The client worries that the timezone may be entered incorrectly and asks for a calm next step without pressure.',
        };

        return translations[message?.dataset.messageId] || 'Demo translation will appear here after the translation API returns a result.';
      };

      const requestDemoTranslation = (message, sourceText) => new Promise((resolve) => {
        /*
        // Real translation API integration point:
        fetch('/admin/messages/translate', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            message_id: message?.dataset.messageId,
            source_text: sourceText,
            source_lang: getMessageLang(message),
            target_lang: getTranslationTargetLang(),
          }),
        })
          .then((response) => response.json())
          .then((data) => resolve(data.translation || ''))
          .catch(() => resolve('Translation unavailable. Please try again.'));
        return;
        */

        window.setTimeout(() => {
          resolve(getDemoTranslation(message));
        }, 900);
      });

      const ensureTranslationBlock = (bubble, text, visible = true) => {
        const message = bubble.closest('.direct-chat-msg');
        const sourceLang = getMessageLang(message);
        const targetLang = getTranslationTargetLang();
        let block = bubble.querySelector('.message-translation');
        if (!block) {
          block = document.createElement('div');
          block.className = 'message-translation';
          block.innerHTML = `
            <div class="message-translation-divider"></div>
            <div class="message-translation-head">Translated <span class="message-translation-lang"></span></div>
            <div class="message-translation-text"></div>
          `;
          const meta = bubble.querySelector('.message-meta-row');
          bubble.insertBefore(block, meta || null);
        }

        block.querySelector('.message-translation-lang').textContent = `${sourceLang} -> ${targetLang}`;
        block.querySelector('.message-translation-text').textContent = text;
        block.hidden = !visible;
        bubble.classList.toggle('has-translation', visible);
        return block;
      };

      const addTranslateAction = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const isIncoming = getMessageAuthor(message) === 'client';
        const attachmentKind = getAttachmentKind(message);
        const systemKind = getSystemKind(message);
        const sendState = getMessageSendState(message);
        const hasTextPart = messageHasTextPart(message, bubble);
        const sourceText = bubble.querySelector('.ng-binding')?.textContent.trim();
        const actions = bubble.querySelector('div[style*="margin-top:8px"], .message-actions-row');
        if (!isIncoming || systemKind || sendState || !hasTextPart || !sourceText || ['audio', 'voice'].includes(attachmentKind) || !actions || actions.querySelector('.js-message-translate')) {
          return;
        }

        const button = document.createElement('button');
        button.className = 'btn btn-xs btn-default js-message-translate message-icon-action message-translate-action';
        button.type = 'button';
        button.textContent = '';
        button.title = 'Translate message';
        button.setAttribute('aria-label', 'Translate message');
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (button.classList.contains('is-loading')) {
            return;
          }

          const block = bubble.querySelector('.message-translation');
          if (block && !block.hidden) {
            ensureTranslationBlock(bubble, block.querySelector('.message-translation-text')?.textContent || '', false);
            button.classList.remove('is-active');
            button.title = 'Translate message';
            button.setAttribute('aria-label', 'Translate message');
            return;
          }

          button.classList.add('is-loading');
          button.disabled = true;
          button.title = 'Translating...';
          button.setAttribute('aria-label', 'Translating...');
          const translatedText = await requestDemoTranslation(message, sourceText);
          ensureTranslationBlock(bubble, translatedText, true);
          button.classList.remove('is-loading');
          button.classList.add('is-active');
          button.disabled = false;
          button.title = 'Hide translation';
          button.setAttribute('aria-label', 'Hide translation');
        });

        const replyButton = actions.querySelector('.js-message-reply');
        if (replyButton?.nextSibling) {
          actions.insertBefore(button, replyButton.nextSibling);
        } else {
          actions.insertBefore(button, actions.firstElementChild);
        }

        if (message.dataset.messageId === '2') {
          ensureTranslationBlock(bubble, getDemoTranslation(message), true);
          button.classList.add('is-active');
          button.title = 'Hide translation';
          button.setAttribute('aria-label', 'Hide translation');
        }
      };

      const demoMessageMutations = {
        edit(messageId, text, previousText = '') {
          /*
          // Real API integration point for saving an edited operator message.
          // Expected server behavior:
          // - validate that the message belongs to the current operator/admin context;
          // - validate that the client has not viewed this message yet;
          // - save the new text;
          // - return the saved message payload or at least { ok: true, text: "..." }.
          return fetch(`/admin/messages/${encodeURIComponent(messageId)}`, {
            method: 'PATCH',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
              message_id: messageId,
              text,
              previous_text: previousText,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error('Message edit failed');
              }
              return response.json();
            });
          */
          return window.Promise.resolve({ ok: true, messageId, text, previousText });
        },
        delete(messageId) {
          /*
          // Real API integration point:
          return fetch(`/admin/messages/${encodeURIComponent(messageId)}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          }).then((response) => response.json());
          */
          return window.Promise.resolve({ ok: true, messageId });
        },
      };

      const canMutateOwnMessage = (message) => Boolean(
        message
        && getMessageAuthor(message) === 'operator'
        && !getSystemKind(message)
        && !['audio', 'voice'].includes(getAttachmentKind(message))
        && messageHasTextPart(message)
        && !isMessageViewedByClient(message)
        && !message.classList.contains('is-message-deleted')
      );

      const getMessageTextForAction = (bubble) => (
        bubble?.querySelector(':scope > .ng-binding')?.textContent.trim()
        || bubble?.querySelector('.ng-binding')?.textContent.trim()
        || ''
      );

      const canCopyMessage = (message, bubble) => Boolean(
        message
        && getMessageCensoredState(message) !== 'full'
        && messageHasTextPart(message, bubble)
        && getMessageTextForAction(bubble)
        && !message.classList.contains('is-message-deleted')
      );

      const copyMessageText = async (button, bubble) => {
        const text = getMessageTextForAction(bubble);
        if (!text) {
          return;
        }

        try {
          await navigator.clipboard?.writeText(text);
          button.classList.add('is-copied');
          button.title = 'Copied';
          button.setAttribute('aria-label', 'Copied');
          window.setTimeout(() => {
            button.classList.remove('is-copied');
            button.title = 'Copy message';
            button.setAttribute('aria-label', 'Copy message');
          }, 1000);
        } catch (error) {
          button.title = 'Copy unavailable';
          button.setAttribute('aria-label', 'Copy unavailable');
        }
      };

      const getComposerEditBar = () => {
        const composer = root.querySelector('#conversationInputArea') || document.querySelector('#conversationInputArea');
        const row = root.querySelector('.composer-input-row') || document.querySelector('.composer-input-row');
        if (!composer || !row) {
          return null;
        }

        let bar = composer.querySelector('.composer-edit-bar');
        if (!bar) {
          const rowParent = row.parentElement;
          bar = document.createElement('div');
          bar.className = 'composer-edit-bar';
          bar.hidden = true;
          bar.innerHTML = `
            <div class="composer-edit-body">
              <div class="composer-edit-label">Editing message</div>
              <div class="composer-edit-text"></div>
            </div>
            <button class="btn btn-default btn-xs composer-edit-cancel" type="button" title="Cancel edit">
              <i class="fa fa-times"></i>
            </button>
          `;
          if (rowParent) {
            rowParent.insertBefore(bar, row);
          } else {
            composer.appendChild(bar);
          }
        }

        return bar;
      };

      const setComposerValue = (value) => {
        const input = root.querySelector('#messageInput') || document.querySelector('#messageInput');
        if (!input) {
          return null;
        }

        input.value = value;
        input.defaultValue = value;
        input.textContent = value;
        input.removeAttribute('disabled');
        input.disabled = false;
        input.classList.toggle('ng-empty', !value);
        input.classList.toggle('ng-not-empty', Boolean(value));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        window.setTimeout(() => {
          input.value = value;
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }, 0);
        return input;
      };

      const getComposerServerPayload = () => {
        const mode = composer?.dataset.composerMode || 'direct';
        const input = root.querySelector('#messageInput') || document.querySelector('#messageInput');
        const send = root.querySelector('#btnSendMessage') || document.querySelector('#btnSendMessage');
        const attachmentPreview = root.querySelector('#attachmentPreview');
        const basePayload = {
          conversation_id: root.dataset.conversationId || 'c2',
          text: input?.value.trim() || '',
        };

        if (attachmentPreview && !attachmentPreview.hidden) {
          basePayload.attachment_source = attachmentPreview.dataset.activeSource || '';
          basePayload.attachment_label = root.querySelector('#attachmentPreviewText')?.textContent.trim() || '';
        }

        if (mode === 'reply') {
          return {
            mode,
            endpoint: '/admin/messages',
            method: 'POST',
            payload: {
              ...basePayload,
              reply_to_message_id: replyPreview?.dataset.replyTo || '',
            },
          };
        }

        if (mode === 'edit') {
          return {
            mode,
            endpoint: `/admin/messages/${encodeURIComponent(send?.dataset.editingMessageId || '')}`,
            method: 'PATCH',
            payload: {
              message_id: send?.dataset.editingMessageId || '',
              text: basePayload.text,
            },
          };
        }

        return {
          mode: 'direct',
          endpoint: '/admin/messages',
          method: 'POST',
          payload: basePayload,
        };
      };

      const sendComposerPayload = () => {
        const request = getComposerServerPayload();
        /*
        // Real composer API integration point for direct/reply/edit.
        return fetch(request.endpoint, {
          method: request.method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(request.payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Composer ${request.mode} request failed`);
          }
          return response.json();
        });
        */
        return window.Promise.resolve(request);
      };

      const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char]));

      const getReplyPreviewText = (messageId) => {
        if (!messageId) {
          return 'Selected message';
        }
        const source = root.querySelector(`.direct-chat-msg[data-message-id="${CSS.escape(messageId)}"]`);
        const attachmentKind = getAttachmentKind(source);
        const attachmentCount = getAttachmentCount(source);
        const text = source?.querySelector('.direct-chat-text .ng-binding')?.textContent.trim();
        if (text) {
          return text;
        }
        if (attachmentKind && attachmentKind !== 'none') {
          return `${attachmentKind}${attachmentCount > 1 ? ` x${attachmentCount}` : ''}`;
        }
        return 'Message unavailable';
      };

      const appendDemoSentMessage = (request) => {
        const list = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
        const text = request.payload?.text || '';
        const attachmentLabel = request.payload?.attachment_label || '';
        const hasAttachment = !!request.payload?.attachment_source;
        if (!list || (!text && !hasAttachment)) {
          return null;
        }

        const messageId = `demo-sent-${Date.now()}`;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const avatar = root.dataset.agentAvatar
          || root.dataset.userAvatar
          || 'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_CLUre-mRxp6ZnPZmK2odQwqPmK3ktQI8.webp';
        const wrapper = document.createElement('div');
        wrapper.className = 'direct-chat-msg read';
        wrapper.dataset.messageId = messageId;
        wrapper.dataset.messageAuthor = 'operator';
        wrapper.dataset.messageKind = 'text';
        wrapper.dataset.messageHasText = text ? 'true' : 'false';
        wrapper.dataset.messageLang = 'ru';
        wrapper.dataset.attachmentKind = hasAttachment ? 'mix' : 'none';
        wrapper.dataset.attachmentCount = hasAttachment ? '1' : '0';
        wrapper.dataset.messageViewedByClient = 'false';

        const replyTo = request.payload?.reply_to_message_id || '';
        const replyMarkup = replyTo
          ? `<div class="message-reply-quote" data-reply-to="${escapeHtml(replyTo)}" role="link" tabindex="0" aria-label="Go to replied message">
              <span class="message-reply-author">Reply</span>
              <span class="message-reply-text">${escapeHtml(getReplyPreviewText(replyTo))}</span>
            </div>`
          : '';
        const attachmentMarkup = attachmentLabel
          ? `<div class="message-attachments message-attachments-files">
              <span class="message-file-card">
                <i class="file-type-icon"></i>
                <span class="message-file-meta">
                  <strong>${escapeHtml(attachmentLabel)}</strong>
                  <small>Prepared attachment</small>
                </span>
              </span>
            </div>`
          : '';
        const textMarkup = text ? `<span class="ng-binding">${escapeHtml(text)}</span>` : '';
        const copyMarkup = text ? '<button class="btn btn-xs btn-default"><i class="fa fa-copy"></i> Copy</button>' : '';

        wrapper.innerHTML = `
          <div class="direct-chat-info clearfix">
            <span class="direct-chat-name pull-left"></span>
            <span class="direct-chat-timestamp pull-right">${now}</span>
          </div>
          <img class="direct-chat-img" src="${escapeHtml(avatar)}" alt="">
          <div class="direct-chat-text">
            ${replyMarkup}
            ${textMarkup}
            ${attachmentMarkup}
            <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
              ${copyMarkup}
              <button class="btn btn-xs btn-default message-pin-toggle" type="button" aria-pressed="false"><i class="fa fa-thumb-tack"></i> Pin</button>
            </div>
          </div>
        `;
        list.appendChild(wrapper);
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return wrapper;
      };

      const clearAttachmentChoice = () => {
        const attachmentPreview = root.querySelector('#attachmentPreview');
        if (!attachmentPreview) {
          return;
        }
        attachmentPreview.hidden = true;
        attachmentPreview.removeAttribute('data-active-source');
        root.querySelector('#attachmentPreviewText').textContent = 'Attachment ready';
        root.querySelector('#conversationInputArea')?.classList.remove('has-attachment-choice');
        root.querySelectorAll('#btnUploadPhotoDevice, #btnUploadPhoto, #btnUploadAudio, #btnUploadFile').forEach((action) => {
          action.classList.remove('is-attachment-active', 'is-attachment-disabled');
        });
        root.querySelector('#messageInput')?.dispatchEvent(new Event('input', { bubbles: true }));
      };

      const resetComposerAfterSend = () => {
        const mode = composer?.dataset.composerMode || 'direct';
        if (mode === 'reply') {
          clearReplyPreview();
        }
        if (mode === 'direct' || mode === 'reply') {
          clearAttachmentChoice();
          setComposerValue('');
          setComposerMode('direct');
        }
      };

      const handleComposerSend = () => {
        const request = getComposerServerPayload();
        if (request.mode === 'edit') {
          saveMessageEdit();
          return window.Promise.resolve(request);
        }

        /*
        // Real direct/reply send integration point.
        // direct payload:
        // { conversation_id, text, attachment_source?, attachment_label? }
        // reply payload:
        // { conversation_id, text, reply_to_message_id, attachment_source?, attachment_label? }
        return sendComposerPayload()
          .then((data) => {
            resetComposerAfterSend();
            return data;
          })
          .catch((error) => {
            // Keep composer content so operator can retry.
            throw error;
          });
        */

        // Demo mode: emulate successful direct/reply send locally.
        return sendComposerPayload().then((data) => {
          appendDemoSentMessage(request);
          resetComposerAfterSend();
          return data;
        });
      };

      const clearComposerEditMode = () => {
        const send = root.querySelector('#btnSendMessage') || document.querySelector('#btnSendMessage');
        const bar = getComposerEditBar();
        if (bar) {
          bar.hidden = true;
          delete bar.dataset.messageId;
          bar.removeAttribute('role');
          bar.removeAttribute('tabindex');
          bar.removeAttribute('aria-label');
          bar.querySelector('.composer-edit-text').textContent = '';
        }
        if (send) {
          send.title = 'Send';
          send.removeAttribute('data-editing-message-id');
        }
        root.querySelector('#conversationInputArea')?.classList.remove('is-editing-message');
        if (composer?.dataset.composerMode === 'edit') {
          setComposerMode('direct');
        }
      };

      const startMessageEdit = (message) => {
        const send = root.querySelector('#btnSendMessage') || document.querySelector('#btnSendMessage');
        const bar = getComposerEditBar();
        const bubble = message?.querySelector('.direct-chat-text');
        const textNode = bubble?.querySelector(':scope > .ng-binding') || bubble?.querySelector('.ng-binding');
        const messageId = message?.dataset.messageId;
        const text = textNode?.textContent.trim() || '';
        if (!send || !bar || !text || !messageId) {
          return;
        }

        clearReplyPreview();
        setComposerMode('edit');
        setComposerValue(text);
        send.disabled = false;
        send.removeAttribute('disabled');
        send.setAttribute('aria-disabled', 'false');
        send.classList.remove('is-disabled');
        send.title = 'Save edit';
        send.dataset.editingMessageId = messageId;
        bar.dataset.messageId = messageId;
        bar.setAttribute('role', 'link');
        bar.setAttribute('tabindex', '0');
        bar.setAttribute('aria-label', 'Go to edited message');
        bar.querySelector('.composer-edit-text').textContent = text;
        bar.hidden = false;
        root.querySelector('#conversationInputArea')?.classList.add('is-editing-message');
        root.querySelector('#conversationInputArea')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };

      const saveMessageEdit = () => {
        const input = root.querySelector('#messageInput');
        const send = root.querySelector('#btnSendMessage');
        const messageId = send?.dataset.editingMessageId;
        const message = messageId ? root.querySelector(`.direct-chat-msg[data-message-id="${CSS.escape(messageId)}"]`) : null;
        const textNode = message?.querySelector('.direct-chat-text .ng-binding');
        const nextText = input?.value.trim();
        if (!message || !textNode || !nextText) {
          return;
        }

        const previousText = textNode.textContent;
        textNode.textContent = nextText;
        clearComposerEditMode();
        setComposerValue('');
        message.classList.add('is-message-edit-saving');
        demoMessageMutations.edit(messageId, nextText, previousText)
          .then((data) => {
            textNode.textContent = data?.text || nextText;
          })
          .catch(() => {
            textNode.textContent = previousText;
            startMessageEdit(message);
          })
          .finally(() => {
            message.classList.remove('is-message-edit-saving');
          });
      };

      const deleteOwnMessage = (message) => {
        const messageId = message?.dataset.messageId;
        const bubble = message?.querySelector('.direct-chat-text');
        const textNode = bubble?.querySelector(':scope > .ng-binding') || bubble?.querySelector('.ng-binding');
        const actions = bubble?.querySelector('.message-actions-row');
        if (!messageId || !bubble || !textNode || !canMutateOwnMessage(message)) {
          return;
        }

        const previousText = textNode.textContent;
        const pinButton = message.querySelector('.message-pin-toggle.is-pinned');
        pinButton?.click();
        message.classList.add('is-message-deleted');
        textNode.textContent = 'Message deleted';
        if (actions) {
          actions.hidden = true;
        }
        demoMessageMutations.delete(messageId).catch(() => {
          message.classList.remove('is-message-deleted');
          textNode.textContent = previousText;
          if (actions) {
            actions.hidden = false;
          }
        });
      };

      const compactMessageUtilityActions = (bubble) => {
        bubble.querySelectorAll('button').forEach((button) => {
          const text = button.textContent.trim();
          if (/^Copy$/i.test(text)) {
            button.classList.add('message-icon-action', 'message-copy-action');
            button.textContent = '';
            button.title = 'Copy message';
            button.setAttribute('aria-label', 'Copy message');
          }
        });
      };

      const bindCopyActions = (bubble) => {
        bubble.querySelectorAll('.message-copy-action').forEach((button) => {
          if (button.dataset.copyBound === '1') {
            return;
          }

          button.dataset.copyBound = '1';
          button.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            copyMessageText(button, bubble);
          });
        });
      };

      const orderMessageActions = (bubble) => {
        const actions = bubble.querySelector('.message-actions-row, div[style*="margin-top:8px"]');
        if (!actions) {
          return;
        }

        const buttons = Array.from(actions.querySelectorAll('button'));
        const reply = buttons.find((button) => button.classList.contains('js-message-reply'));
        const pin = buttons.find((button) => button.classList.contains('message-pin-toggle') || /^(Pin|Unpin)$/i.test(button.textContent.trim()));
        const copy = buttons.find((button) => button.classList.contains('message-copy-action') || button.getAttribute('aria-label') === 'Copy message');
        const translate = buttons.find((button) => button.classList.contains('js-message-translate'));
        [reply, pin, copy, translate].filter(Boolean).forEach((button) => actions.appendChild(button));
      };

      const ensureMessageMutationMenu = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const actions = bubble.querySelector('.message-actions-row, div[style*="margin-top:8px"]');
        if (!actions) {
          return;
        }

        actions.querySelector('.message-mutation-menu')?.remove();
        const copyButtons = Array.from(actions.querySelectorAll('.message-copy-action, button[aria-label="Copy message"]'));
        copyButtons.forEach((button) => button.remove());

        const allowCopy = canCopyMessage(message, bubble);
        const allowMutation = canMutateOwnMessage(message);
        if (!allowCopy && !allowMutation) {
          return;
        }

        const menu = document.createElement('span');
        menu.className = 'message-mutation-menu';
        const copyItem = allowCopy
          ? '<button class="message-mutation-item js-message-copy-menu" type="button">Copy</button>'
          : '';
        const editItem = allowMutation
          ? '<button class="message-mutation-item js-message-edit" type="button">Edit</button>'
          : '';
        const deleteItem = allowMutation
          ? '<button class="message-mutation-item is-danger js-message-delete" type="button">Delete</button>'
          : '';
        menu.innerHTML = `
          <button class="btn btn-xs btn-default message-mutation-toggle" type="button" aria-label="Message actions" aria-expanded="false">...</button>
          <span class="message-mutation-dropdown" hidden>
            ${copyItem}
            ${editItem}
            ${deleteItem}
          </span>
        `;
        actions.appendChild(menu);

        const toggle = menu.querySelector('.message-mutation-toggle');
        const dropdown = menu.querySelector('.message-mutation-dropdown');
        const closeMenu = () => {
          dropdown.hidden = true;
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
          actions.classList.remove('is-menu-open');
        };

        toggle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const willOpen = dropdown.hidden;
          root.querySelectorAll('.message-mutation-dropdown').forEach((item) => {
            item.hidden = true;
            const itemMenu = item.closest('.message-mutation-menu');
            itemMenu?.classList.remove('is-open');
            itemMenu?.closest('.message-actions-row')?.classList.remove('is-menu-open');
            itemMenu?.querySelector('.message-mutation-toggle')?.setAttribute('aria-expanded', 'false');
          });
          dropdown.hidden = !willOpen;
          toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          menu.classList.toggle('is-open', willOpen);
          actions.classList.toggle('is-menu-open', willOpen);
        });

        menu.querySelector('.js-message-copy-menu')?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          copyMessageText(event.currentTarget, bubble);
        });

        menu.querySelector('.js-message-edit')?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          closeMenu();
          startMessageEdit(message);
        });

        menu.querySelector('.js-message-delete')?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          deleteOwnMessage(message);
        });
      };

      const normalizeMessageActionsByType = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const attachmentKind = getAttachmentKind(message);
        if (!['audio', 'voice'].includes(attachmentKind)) {
          return;
        }

        bubble.querySelectorAll('.fa-copy, .message-copy-action, .js-message-translate').forEach((element) => {
          element.closest('button')?.remove();
        });
      };

      const normalizeNonTextMessage = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const attachmentKind = getAttachmentKind(message);
        const hasText = messageHasTextPart(message, bubble);
        const nonTextKinds = ['audio', 'voice'];
        if (getMessageCensoredState(message) === 'full') {
          return;
        }
        if (!message || (hasText && !nonTextKinds.includes(attachmentKind))) {
          return;
        }

        bubble.classList.add('is-non-text-message');
        bubble.querySelectorAll('.message-copy-action, .js-message-translate').forEach((button) => button.remove());

        const status = bubble.querySelector('.message-status-row');
        if (!status || status.querySelector('.message-kind-badge')) {
          return;
        }

        const labels = {
          audio: 'audio',
          voice: 'voice',
          file: 'file',
          image: 'image',
          mix: 'mix',
        };

        const badge = document.createElement('span');
        badge.className = 'message-kind-badge';
        const attachmentCount = getAttachmentCount(message);
        badge.textContent = `${labels[attachmentKind] || 'non-text'}${attachmentCount > 1 ? ` x${attachmentCount}` : ''}`;
        badge.title = 'This message has no text to copy or translate';
        status.appendChild(badge);
      };

      const normalizeModeratedMessage = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const censoredState = getMessageCensoredState(message);
        if (!message || censoredState === 'none') {
          return;
        }

        bubble.classList.add(`is-censored-${censoredState}`);
        if (censoredState === 'full') {
          bubble.querySelectorAll('.message-copy-action, .js-message-translate, .fa-copy').forEach((element) => {
            element.closest('button')?.remove();
          });
        }

        const status = bubble.querySelector('.message-status-row');
        if (!status || status.querySelector('.message-moderation-badge')) {
          return;
        }

        const badge = document.createElement('span');
        badge.className = 'message-moderation-badge';
        badge.title = censoredState === 'full'
          ? 'Сообщение полностью скрыто серверной модерацией'
          : 'Часть сообщения скрыта серверной модерацией';
        badge.setAttribute('aria-label', 'Moderated message');
        status.appendChild(badge);
      };

      const normalizeDeliveryState = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const state = getMessageSendState(message);
        const status = bubble.querySelector('.message-status-row');
        if (!message || !state || !status) {
          return;
        }

        status.querySelectorAll('.message-read-state, .message-delivery-state, .js-message-retry').forEach((element) => element.remove());

        const stateConfig = {
          sending: { label: 'Sending...', className: 'is-sending' },
          failed: { label: 'Failed', className: 'is-failed' },
          retrying: { label: 'Retrying...', className: 'is-retrying' },
          sent: { label: 'Sent', className: 'is-sent' },
        };
        const config = stateConfig[state] || stateConfig.sending;

        const stateNode = document.createElement('span');
        stateNode.className = `message-delivery-state ${config.className}`;
        stateNode.innerHTML = `<i aria-hidden="true"></i>${config.label}`;
        status.appendChild(stateNode);

        if (state === 'failed') {
          const retryButton = document.createElement('button');
          retryButton.className = 'message-retry-btn js-message-retry';
          retryButton.type = 'button';
          retryButton.textContent = 'Retry';
          retryButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            message.dataset.sendState = 'retrying';
            normalizeDeliveryState(bubble);
            window.setTimeout(() => {
              message.dataset.sendState = 'sent';
              normalizeDeliveryState(bubble);
            }, 900);
          });
          status.appendChild(retryButton);
        }
      };

      const normalizeMessageMeta = (bubble) => {
        if (bubble.querySelector('.message-meta-row')) {
          return;
        }

        const message = bubble.closest('.direct-chat-msg');
        const timestamp = message?.querySelector('.direct-chat-timestamp');
        const readStatus = bubble.querySelector('.fa-check')?.closest('span.ng-scope');
        if (!message || !timestamp) {
          return;
        }

        const row = document.createElement('div');
        row.className = 'message-meta-row';

        const actions = bubble.querySelector('div[style*="margin-top:8px"]');
        if (actions) {
          actions.classList.add('message-actions-row');
          row.appendChild(actions);
        }

        const status = document.createElement('span');
        status.className = 'message-status-row';

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = timestamp.textContent.trim();
        status.appendChild(time);

        if (readStatus) {
          readStatus.classList.add('message-read-state');
          status.appendChild(readStatus);
        } else {
          const demoReadStatus = document.createElement('span');
          demoReadStatus.className = 'message-read-state message-read-state-demo';
          demoReadStatus.setAttribute('aria-label', 'Delivered and read');
          demoReadStatus.innerHTML = '<i class="fa fa-check"></i><i class="fa fa-check"></i>';
          status.appendChild(demoReadStatus);
        }

        row.appendChild(status);
        bubble.appendChild(row);

        timestamp.classList.add('message-time-original');
      };

      root.querySelectorAll('.direct-chat-text').forEach((bubble) => {
        ensureMessageAnchor(bubble.closest('.direct-chat-msg'));
        bubble.addEventListener('click', stopMessageToggle);
        addReplyAction(bubble);
        addTranslateAction(bubble);
        compactMessageUtilityActions(bubble);
        orderMessageActions(bubble);
        ensureMessageMutationMenu(bubble);
        normalizeMessageActionsByType(bubble);
        normalizeMessageMeta(bubble);
        normalizeDeliveryState(bubble);
        normalizeModeratedMessage(bubble);
        normalizeNonTextMessage(bubble);
        bindCopyActions(bubble);
      });
      bindReplyAnchors();
      bindAudioPlayers();

      if (root.dataset.messageMutationBound !== '1') {
        root.dataset.messageMutationBound = '1';
        root.querySelector('#btnSendMessage')?.addEventListener('click', (event) => {
          const request = getComposerServerPayload();
          if (!request.payload.text && !request.payload.attachment_source) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          handleComposerSend();
        }, true);

        root.addEventListener('click', (event) => {
          if (!event.target.closest('.message-mutation-menu')) {
            root.querySelectorAll('.message-mutation-dropdown').forEach((dropdown) => {
              dropdown.hidden = true;
              const menu = dropdown.closest('.message-mutation-menu');
              menu?.classList.remove('is-open');
              menu?.closest('.message-actions-row')?.classList.remove('is-menu-open');
              menu?.querySelector('.message-mutation-toggle')?.setAttribute('aria-expanded', 'false');
            });
          }

          const cancelEdit = event.target.closest('.composer-edit-cancel');
          if (cancelEdit) {
            event.preventDefault();
            clearComposerEditMode();
            setComposerValue('');
            return;
          }

          const send = event.target.closest('#btnSendMessage');
          if (send?.dataset.editingMessageId) {
            event.preventDefault();
            event.stopPropagation();
          }
        }, true);
      }

      if (window.location.hash && window.location.hash.startsWith('#message-')) {
        const target = root.querySelector(window.location.hash);
        if (target) {
          window.setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightMessage(target);
          }, 250);
        }
      }

      replyPreviewClose?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        clearReplyPreview();
      });

      replyPreview?.addEventListener('click', (event) => {
        if (event.target.closest('.reply-preview-close')) {
          return;
        }
        const replyTo = replyPreview.dataset.replyTo;
        if (replyTo) {
          event.preventDefault();
          goToMessage(replyTo);
        }
      });

      replyPreview?.addEventListener('keydown', (event) => {
        if (event.target.closest('.reply-preview-close')) {
          return;
        }
        const replyTo = replyPreview.dataset.replyTo;
        if (replyTo && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          goToMessage(replyTo);
        }
      });

      root.addEventListener('click', (event) => {
        const editBar = event.target.closest('.composer-edit-bar');
        if (!editBar || event.target.closest('.composer-edit-cancel')) {
          return;
        }
        const messageId = editBar.dataset.messageId;
        if (messageId) {
          event.preventDefault();
          goToMessage(messageId);
        }
      });

      root.addEventListener('keydown', (event) => {
        const editBar = event.target.closest('.composer-edit-bar');
        if (!editBar || event.target.closest('.composer-edit-cancel')) {
          return;
        }
        const messageId = editBar.dataset.messageId;
        if (messageId && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          goToMessage(messageId);
        }
      });

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) {
              return;
            }

            const bubbles = node.matches('.direct-chat-text')
              ? [node]
              : Array.from(node.querySelectorAll('.direct-chat-text'));
            bubbles.forEach((bubble) => {
              ensureMessageAnchor(bubble.closest('.direct-chat-msg'));
              bubble.addEventListener('click', stopMessageToggle);
              addReplyAction(bubble);
              addTranslateAction(bubble);
              compactMessageUtilityActions(bubble);
              orderMessageActions(bubble);
              ensureMessageMutationMenu(bubble);
              normalizeMessageActionsByType(bubble);
              normalizeMessageMeta(bubble);
              normalizeDeliveryState(bubble);
              normalizeNonTextMessage(bubble);
              bindCopyActions(bubble);
            });
            bindReplyAnchors(node);
            bindAudioPlayers(node);
          });
        });
      });

      observer.observe(root, { childList: true, subtree: true });
    }

    function bindComposerVisualState() {
      const root = document.querySelector('#admin-agent-chat');
      if (!root || root.dataset.composerVisualBound === '1') {
        return;
      }

        const composer = root.querySelector('#conversationInputArea');
        const input = root.querySelector('#messageInput');
        const send = root.querySelector('#btnSendMessage');
        const attachmentPreview = root.querySelector('#attachmentPreview');
        const attachmentPreviewText = root.querySelector('#attachmentPreviewText');
        const attachmentPreviewClear = root.querySelector('#attachmentPreviewClear');
        const attachMenu = root.querySelector('.composer-attach-menu');
      const attachToggle = root.querySelector('.js-composer-attach-toggle');
      const galleryPanel = root.querySelector('#composerGalleryPanel');
      const galleryClose = root.querySelector('#composerGalleryClose');
      const photoDeviceInput = root.querySelector('#composerPhotoDeviceInput');
      const audioInput = root.querySelector('#composerAudioInput');
      const fileInput = root.querySelector('#composerFileInput');
      const attachActions = root.querySelectorAll('#btnUploadPhotoDevice, #btnUploadPhoto, #btnUploadAudio, #btnUploadFile');
      const voice = root.querySelector('#btnVoiceMessage');
      const quickTrack = root.querySelector('.quick-replies-track');
      const quickViewport = root.querySelector('.quick-replies-viewport');
      const composerModeToggle = root.querySelector('.js-composer-mode-toggle');
        if (!composer || !input || !send) {
          return;
        }

        const syncComposerModeToggle = () => {
          if (!composerModeToggle) {
            return;
          }

          const controlsMode = composer.classList.contains('controls-mode');
          const icon = composerModeToggle.querySelector('.fa');
          composerModeToggle.classList.toggle('is-active', controlsMode);
          composerModeToggle.classList.toggle('is-quick-mode', !controlsMode);
          composerModeToggle.setAttribute('aria-pressed', String(controlsMode));
          composerModeToggle.setAttribute('title', controlsMode ? 'Chat controls' : 'Quick replies');

          if (icon) {
            icon.className = controlsMode ? 'fa fa-tasks' : 'fa fa-commenting-o';
          }
        };

        root.dataset.composerVisualBound = '1';
        composer.classList.add('controls-mode');
        syncComposerModeToggle();

        const growInput = () => {
          input.style.height = 'auto';
          const nextHeight = Math.min(input.scrollHeight, 150);
          input.style.height = `${nextHeight}px`;
          composer.classList.toggle('is-multiline-input', nextHeight > 44);
        };

        const sync = () => {
          const hasText = input.value.trim().length > 0;
          const hasAttachment = !!(attachmentPreview && !attachmentPreview.hidden && attachmentPreview.dataset.activeSource);
          const isReady = hasText || hasAttachment;
          composer.classList.toggle('has-draft', hasText);
          composer.classList.toggle('ready', isReady);
          send.classList.toggle('is-disabled', !isReady);
          send.disabled = !isReady;
          growInput();
        };

        input.addEventListener('input', sync);

        attachToggle?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          attachMenu?.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
          if (attachMenu && !attachMenu.contains(event.target)) {
            attachMenu.classList.remove('open');
          }
          if (galleryPanel && !galleryPanel.hidden && !galleryPanel.contains(event.target) && !event.target.closest('#btnUploadPhoto')) {
            galleryPanel.hidden = true;
          }
        });

        const setAttachLocked = (locked, activeId = '') => {
          composer.classList.toggle('has-attachment-choice', locked);
          attachActions.forEach((action) => {
            const isActive = activeId && action.id === activeId;
            action.classList.toggle('is-attachment-active', !!isActive);
            action.classList.toggle('is-attachment-disabled', locked && !isActive);
            action.setAttribute('aria-disabled', locked && !isActive ? 'true' : 'false');
          });
        };

        const canUseAttachAction = (action) => {
          if (!composer.classList.contains('has-attachment-choice') || action.classList.contains('is-attachment-active')) {
            return true;
          }

          showAttachmentPreview('Remove current attachment before choosing another source');
          return false;
        };

        const showAttachmentPreview = (text, activeId = '') => {
          if (!attachmentPreview || !attachmentPreviewText) {
            return;
          }

          attachmentPreviewText.textContent = text;
          attachmentPreview.dataset.activeSource = activeId;
          attachmentPreview.hidden = false;
          if (activeId) {
            setAttachLocked(true, activeId);
          }
          sync();
        };

        root.querySelectorAll('.js-template-chip').forEach((chip) => {
          chip.addEventListener('click', (event) => {
            event.preventDefault();
            const insert = chip.dataset.insert || chip.textContent.trim();
            input.value = `${input.value ? `${input.value} ` : ''}${insert}`;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
          });
        });

        composer.addEventListener('click', (event) => {
          const modeButton = event.target.closest('.js-composer-mode-toggle');
          if (modeButton) {
            event.preventDefault();
            const controlsMode = !composer.classList.contains('controls-mode');
            composer.classList.toggle('controls-mode', controlsMode);
            syncComposerModeToggle();
            return;
          }

          const button = event.target.closest('.js-quick-scroll');
          if (!button || !quickTrack) {
            return;
          }

          event.preventDefault();
          const direction = Number(button.dataset.direction || 1);
          const current = Number(quickTrack.dataset.offset || 0);
          const viewportWidth = quickViewport?.clientWidth || 0;
          const maxOffset = Math.max(0, quickTrack.scrollWidth - viewportWidth);
          const step = Math.max(140, Math.floor(viewportWidth * 0.75));
          const next = Math.max(0, Math.min(maxOffset, current + direction * step));

          quickTrack.dataset.offset = String(next);
          quickTrack.style.transform = `translateX(${-next}px)`;
        });

        syncComposerModeToggle();

        root.querySelectorAll('.js-chat-control').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            button.classList.toggle('active');
          });
        });

        root.querySelector('#btnUploadPhotoDevice')?.addEventListener('click', (event) => {
          event.preventDefault();
          if (!canUseAttachAction(event.currentTarget)) {
            return;
          }
          attachMenu?.classList.remove('open');
          if (galleryPanel) {
            galleryPanel.hidden = true;
          }
          photoDeviceInput?.click();
        });

        root.querySelector('#btnUploadFile')?.addEventListener('click', (event) => {
          event.preventDefault();
          if (!canUseAttachAction(event.currentTarget)) {
            return;
          }
          attachMenu?.classList.remove('open');
          if (galleryPanel) {
            galleryPanel.hidden = true;
          }
          fileInput?.click();
        });

        root.querySelector('#btnUploadAudio')?.addEventListener('click', (event) => {
          event.preventDefault();
          if (!canUseAttachAction(event.currentTarget)) {
            return;
          }
          attachMenu?.classList.remove('open');
          if (galleryPanel) {
            galleryPanel.hidden = true;
          }
          audioInput?.click();
        });

        root.querySelector('#btnUploadPhoto')?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canUseAttachAction(event.currentTarget)) {
            return;
          }
          attachMenu?.classList.remove('open');
          if (galleryPanel) {
            galleryPanel.hidden = !galleryPanel.hidden;
          }
        });

        photoDeviceInput?.addEventListener('change', () => {
          const fileName = photoDeviceInput.files?.[0]?.name || 'Photo from device';
          showAttachmentPreview(`Photo ready: ${fileName}`, 'btnUploadPhotoDevice');
        });

        fileInput?.addEventListener('change', () => {
          const fileName = fileInput.files?.[0]?.name || 'File from device';
          showAttachmentPreview(`File ready: ${fileName}`, 'btnUploadFile');
        });

        audioInput?.addEventListener('change', () => {
          const fileName = audioInput.files?.[0]?.name || 'Audio from device';
          showAttachmentPreview(`Audio ready: ${fileName}`, 'btnUploadAudio');
        });

        galleryClose?.addEventListener('click', (event) => {
          event.preventDefault();
          if (galleryPanel) {
            galleryPanel.hidden = true;
          }
        });

        attachmentPreview?.addEventListener('click', (event) => {
          if (event.target.closest('#attachmentPreviewClear')) {
            return;
          }

          if (attachmentPreview.dataset.activeSource !== 'btnUploadPhoto' || !galleryPanel) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          galleryPanel.hidden = false;
        });

        const syncGallerySelectionPreview = () => {
          const selected = Array.from(root.querySelectorAll('.composer-gallery-item.is-selected'));
          if (!selected.length) {
            if (attachmentPreview) {
              attachmentPreview.hidden = true;
            }
            sync();
            return;
          }

          const names = selected.map((item) => item.dataset.fileName || 'gallery photo');
          const label = selected.length === 1
            ? `Gallery photo ready: ${names[0]}`
            : `${selected.length} gallery photos ready`;
          showAttachmentPreview(label, 'btnUploadPhoto');
        };

        root.querySelectorAll('.composer-gallery-item').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            button.classList.toggle('is-selected');
            syncGallerySelectionPreview();
          });
        });

      attachmentPreviewClear?.addEventListener('click', (event) => {
        event.preventDefault();
          if (attachmentPreview) {
            attachmentPreview.hidden = true;
            attachmentPreview.removeAttribute('data-active-source');
          }
          root.querySelectorAll('.composer-gallery-item.is-selected').forEach((item) => {
            item.classList.remove('is-selected');
          });
          if (photoDeviceInput) {
            photoDeviceInput.value = '';
          }
          if (audioInput) {
            audioInput.value = '';
          }
          if (fileInput) {
            fileInput.value = '';
          }
          setAttachLocked(false);
          sync();
        });

        voice?.addEventListener('click', (event) => {
          event.preventDefault();
          voice.classList.toggle('is-recording');
          voice.title = voice.classList.contains('is-recording')
            ? 'Stop voice recording'
            : 'Record voice message';
        });

        sync();
      }

  function bindQuickFilters() {
      const root = document.querySelector('#admin-agent-chat');
      if (!root) {
        return;
    }

    const pop = root.querySelector('.pane-scroll .queue-search-row .filter-pop') || root.querySelector('.filter-pop');
    if (!pop) {
      return;
    }

      const toggle = pop.querySelector('.js-queue-filter-toggle');
      const menu = pop.querySelector('.filter-menu');
      const countBadge = pop.querySelector('.js-filter-count');
      const positionMenu = () => {
        if (!menu || !pop.classList.contains('open')) {
          return;
        }

        const rect = toggle.getBoundingClientRect();
        const width = menu.offsetWidth || 320;
        const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left));

        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 6}px`;
        menu.style.left = `${left}px`;
        menu.style.right = 'auto';
      };
      const closeMenu = () => {
        pop.classList.remove('open');
        if (menu) {
          menu.removeAttribute('style');
        }
      };
      const inputs = pop.querySelectorAll('input[type="checkbox"]');
      const labels = pop.querySelectorAll('.filter-choice');

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        pop.classList.toggle('open');
        if (pop.classList.contains('open')) {
          positionMenu();
        } else {
          closeMenu();
        }
      });

      document.addEventListener('click', (event) => {
        if (!pop.contains(event.target)) {
          closeMenu();
        }
      });

      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);

    const syncState = () => {
      syncQuickFilterVisibility(root);
      let count = 0;
      labels.forEach((label) => {
        const input = label.querySelector('input');
        const active = !!input && input.checked;
        label.classList.toggle('active', active);
        if (active) {
          count += 1;
        }
      });

      if (countBadge) {
        countBadge.textContent = String(count);
      }
      toggle.classList.toggle('is-active', count > 0);
    };

    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        resetQueueFilterZones(root, 'quick_filters');
        syncState();
        runQueueStateUpdate(root, 'quick_filters_change', inputs.some((item) => item.checked) ? 'quick_filters' : 'none');
      });
    });

    pop.querySelector('.js-qf-reset')?.addEventListener('click', (event) => {
      event.preventDefault();
      resetQueueFilterZones(root, 'none');
      syncState();
      runQueueStateUpdate(root, 'quick_filters_reset', 'none');
    });

    pop.querySelector('.js-qf-apply')?.addEventListener('click', (event) => {
      event.preventDefault();
      resetQueueFilterZones(root, 'quick_filters');
      syncState();
      runQueueStateUpdate(root, 'quick_filters_apply', inputs.some((item) => item.checked) ? 'quick_filters' : 'none');
      closeMenu();
    });

    syncState();
  }

  function bindQueueUserSelect() {
    const root = document.querySelector('#admin-agent-chat');
    const box = root?.querySelector('.queue-user-select');
    if (!box || box.dataset.userSelectBound === '1') {
      return;
    }

    const input = box.querySelector('.js-queue-user-input');
    const clearButton = box.querySelector('.js-queue-user-clear');
    const options = Array.from(box.querySelectorAll('.searchable-selectbox-option'));
    const empty = box.querySelector('.searchable-selectbox-empty');
    if (!input || !options.length) {
      return;
    }

    box.dataset.userSelectBound = '1';

    const open = () => {
      box.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      box.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
    };
    const filter = () => {
      const query = input.value.trim().toLowerCase();
      input.classList.toggle('is-filled', query.length > 0);
      box.classList.toggle('is-filled', query.length > 0);
      box.classList.toggle('has-selected-value', !!input.dataset.selectedUserId);
      let visibleCount = 0;
      options.forEach((option) => {
        const text = `${option.textContent} ${option.dataset.value || ''} ${option.dataset.code || ''} ${option.dataset.userId || ''}`.trim().toLowerCase();
        const hidden = !!query && !text.includes(query);
        option.hidden = hidden;
        if (!hidden) {
          visibleCount += 1;
        }
      });
      const isEmpty = query.length > 0 && visibleCount === 0;
      box.classList.toggle('has-no-results', isEmpty);
      if (empty) {
        empty.hidden = !isEmpty;
      }
    };

    const clearSelection = () => {
      resetQueueFilterZones(root, 'none');
      filter();
      runQueueStateUpdate(root, 'user_select_clear', 'none');
      input.focus();
      open();
    };

    input.addEventListener('focus', () => {
      open();
      filter();
    });
    input.addEventListener('click', () => {
      open();
      filter();
    });
    input.addEventListener('input', filter);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
      }
    });

    options.forEach((option) => {
      option.addEventListener('click', (event) => {
        event.preventDefault();
        options.forEach((item) => item.classList.remove('is-active'));
        resetQueueFilterZones(root, 'user_select');
        input.value = option.dataset.value || '';
        input.dataset.selectedUserId = option.dataset.userId || '';
        box.dataset.selectedUserId = option.dataset.userId || '';
        option.classList.add('is-active');
        box.classList.add('is-filled', 'has-selected-value');
        filter();
        runQueueStateUpdate(root, 'user_select', 'user_select');
        close();
      });
    });

    clearButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      clearSelection();
    });

    document.addEventListener('click', (event) => {
      if (!box.contains(event.target)) {
        close();
      }
    });
  }

  function bindQueueTabs() {
    const root = document.querySelector('#admin-agent-chat');
    const tabs = root ? Array.from(root.querySelectorAll('.js-queue-tab')) : [];
    if (!root || !tabs.length || root.dataset.queueTabsBound === '1') {
      return;
    }

    root.dataset.queueTabsBound = '1';
    tabs.forEach((tab) => {
      tab.setAttribute('role', 'button');
      tab.setAttribute('aria-pressed', tab.classList.contains('active') ? 'true' : 'false');
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        resetQueueFilterZones(root, 'quick_preset');
        syncQuickFilterVisibility(root);
        runQueueStateUpdate(root, 'quick_preset', 'quick_preset');
      });
    });
  }

  function bindConversationSwitcher() {
    const root = document.querySelector('#admin-agent-chat');
    const list = root?.querySelector('.conv-list');
    if (!root || !list || list.dataset.conversationSwitcherBound === '1') {
      return;
    }

    list.dataset.conversationSwitcherBound = '1';
    const initialActiveItem = list.querySelector('.conv-item.active, .list-group-item.active');
    if (initialActiveItem?.dataset.conversationId && !root.dataset.conversationId) {
      root.dataset.conversationId = initialActiveItem.dataset.conversationId;
    }
    list.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
      item.setAttribute('aria-current', item.classList.contains('active') ? 'true' : 'false');
    });

    const getConversationSwitchPayload = (item) => {
      const labels = Array.from(item.querySelectorAll('.conv-line-labels .conv-pill')).map((label) => label.textContent.trim()).filter(Boolean);
      const unread = item.querySelector('.conv-unread')?.textContent.trim() || '0';
      const pinned = !!item.querySelector('.conv-pin');

      return {
        conversation_id: item.dataset.conversationId || '',
        workload_type: item.dataset.workloadType || 'active_chat',
        sender_user_id: item.dataset.senderUserId || '',
        sender_name: item.dataset.senderName || '',
        sender_avatar: item.dataset.senderAvatar || '',
        recipient_user_id: item.dataset.recipientUserId || '',
        recipient_name: item.dataset.recipientName || '',
        recipient_avatar: item.dataset.recipientAvatar || '',
        display_contact_name: item.dataset.displayContactName || item.dataset.senderName || '',
        is_online: item.querySelector('.conv-people-overlap')?.classList.contains('has-online-contact') || false,
        unread_count: Number(unread) || 0,
        is_pinned: pinned,
        labels,
        last_message_preview: item.querySelector('.conv-snippet')?.textContent.trim() || '',
        last_message_time: item.querySelector('.conv-time')?.textContent.trim() || '',
      };
    };

    const requestConversationSwitch = (payload) => {
      /*
      // Real API integration point.
      // Expected server response can include: conversation, messages_html/messages_json,
      // right_context_html/context_json, pinned_messages, billing/session state.
      return fetch(`/admin/messages/conversations/${encodeURIComponent(payload.conversation_id)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Conversation switch request failed');
        }
        return response.json();
      });
      */
      return window.Promise.resolve({
        ok: true,
        conversation: payload,
        messages_html: null,
      });
    };

    const applyDemoConversationSwitch = (payload) => {
      root.dataset.conversationId = payload.conversation_id;
      root.dataset.workloadType = payload.workload_type || 'active_chat';
      const labelsLower = (payload.labels || []).map((label) => String(label).toLowerCase());
      const isPing = payload.workload_type === 'ping' || String(payload.conversation_id || '').startsWith('p');
      const hasPaidLive = labelsLower.some((label) => label === 'live');
      const hasPaymentOpened = labelsLower.some((label) => label === 'pp');
      const hasSell = labelsLower.some((label) => label === 'sell');
      // Нижняя панель сессии открывается только для реально запущенной платной сессии, а не для платежных ожиданий.
      const isBillable = !isPing && hasPaidLive;
      const isFocus = !isPing && labelsLower.some((label) => ['live', 'sla', 'pp', 'sell'].includes(label) || /refund risk|hot/.test(label));

      const contactDuo = root.querySelector('.chat-identity .contact-duo');
      const avatars = contactDuo ? Array.from(contactDuo.querySelectorAll('.contact-avatar')) : [];
      const names = contactDuo ? Array.from(contactDuo.querySelectorAll('.contact-name')) : [];

      if (avatars[0] && payload.sender_avatar) {
        avatars[0].src = payload.sender_avatar;
        avatars[0].setAttribute('ng-src', payload.sender_avatar);
      }
      if (avatars[1] && payload.recipient_avatar) {
        avatars[1].src = payload.recipient_avatar;
        avatars[1].setAttribute('ng-src', payload.recipient_avatar);
      }
      if (names[0]) {
        names[0].textContent = payload.sender_name;
        names[0].classList.toggle('is-online', payload.is_online);
      }
      if (names[1]) {
        names[1].textContent = payload.recipient_name;
      }

      const meta = root.querySelector('.contact-subline.dialog-meta');
      const labelHost = root.querySelector('.dialog-meta-labels') || meta;
      if (labelHost) {
        const chips = Array.from(labelHost.querySelectorAll('.dialog-chip'));
        chips.forEach((chip) => chip.remove());
        const metaChips = [];
        if (isPing) {
          metaChips.push({ label: 'Ping lead', className: 'dialog-chip-info', title: 'Это лид до начала полноценного чата' });
          metaChips.push({ label: 'No chat yet', className: 'dialog-chip-info', title: 'Диалог с клиентом еще не начат' });
        } else if (hasPaidLive) {
          metaChips.push({
            label: 'Live',
            className: 'dialog-chip-success',
            title: 'Клиент сейчас находится в активной платной сессии; другому эксперту лучше не перебивать'
          });
        } else if (hasPaymentOpened) {
          metaChips.push({ label: 'Payment opened', className: 'dialog-chip-warning', title: 'Клиент открыл оплату, но платная сессия еще не стартовала' });
          metaChips.push({ label: 'No live session', className: 'dialog-chip-info', title: 'Сейчас нет активной платной сессии' });
        } else if (hasSell) {
          metaChips.push({ label: 'Sell sent', className: 'dialog-chip-info', title: 'Предложение продления уже отправлено клиенту' });
        } else {
          metaChips.push({ label: 'Active dialog', className: 'dialog-chip-info', title: 'Открыт обычный рабочий диалог без активной платной сессии' });
        }
        const waitState = labelHost.querySelector('.dialog-wait-state');
        metaChips.forEach(({ label, className, title }) => {
          const chip = document.createElement('span');
          chip.className = `dialog-chip ${className}`;
          chip.textContent = label;
          if (title) {
            chip.setAttribute('title', title);
          }
          labelHost.insertBefore(chip, waitState || null);
        });
        const conversationNumber = labelHost.querySelector('.dialog-conversation-ref .ng-binding');
        if (conversationNumber) {
          conversationNumber.textContent = payload.conversation_id || '—';
        }
        if (waitState) {
          const lastTime = payload.last_message_time || 'now';
          if (isPing) {
            waitState.textContent = `Signal ${lastTime}`;
            waitState.setAttribute('title', 'Когда был последний сигнал интереса по этому лиду');
          } else {
            waitState.textContent = `Last activity ${lastTime}`;
            waitState.setAttribute('title', 'Время последней активности в открытом диалоге');
          }
        }
      }

      const billingPanel = root.querySelector('#billingPanel');
      const pingPanel = root.querySelector('#pingLeadPanel');
      const focusStrip = root.querySelector('#focusModeStrip');
      if (billingPanel) {
        billingPanel.hidden = !isBillable;
        billingPanel.classList.toggle('is-open', isBillable);
      }
      const sessionButton = root.querySelector('.js-session-toggle');
      if (sessionButton) {
        const canStartSession = !isPing;
        sessionButton.disabled = !canStartSession;
        sessionButton.classList.toggle('is-live', isBillable);
        sessionButton.classList.toggle('is-panel-open', isBillable);
        sessionButton.setAttribute(
          'title',
          isPing
            ? 'Пинг еще не является чатом; сначала пригласите клиента начать диалог'
            : isBillable
              ? 'Платная сессия запущена; открыта панель управления сессией'
              : 'Запустить платную сессию и открыть панель управления'
        );
        sessionButton.setAttribute(
          'aria-label',
          isPing ? 'Платная сессия недоступна для пинга' : isBillable ? 'Платная сессия запущена' : 'Запустить платную сессию'
        );
      }
      if (pingPanel) {
        pingPanel.hidden = !isPing;
        pingPanel.classList.toggle('is-open', isPing);
      }
      if (focusStrip) {
        focusStrip.hidden = !isFocus;
      }
      root.classList.toggle('is-ping-workload', isPing);

      const drawerTitle = root.querySelector('.pinned-drawer-sub');
      if (drawerTitle) {
        drawerTitle.textContent = `Important points in ${payload.display_contact_name || 'this conversation'}`;
      }
    };

    const setActiveConversationItem = (nextItem) => {
      list.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
        const active = item === nextItem;
        item.classList.toggle('active', active);
        item.setAttribute('aria-current', active ? 'true' : 'false');
      });
    };

    syncQueueCardHints(root);

    list.addEventListener('click', (event) => {
      const favorite = event.target.closest('.js-conv-favorite');
      if (favorite && list.contains(favorite)) {
        event.preventDefault();
        event.stopPropagation();
        const item = favorite.closest('.conv-item, .list-group-item');
        const nextFavorite = !favorite.classList.contains('is-favorite');
        favorite.classList.toggle('is-favorite', nextFavorite);
        favorite.setAttribute('aria-pressed', nextFavorite ? 'true' : 'false');
        favorite.setAttribute('title', nextFavorite ? 'Убрать чат из избранного' : 'Добавить чат в избранное');
        favorite.setAttribute('aria-label', nextFavorite ? 'Убрать чат из избранного' : 'Добавить чат в избранное');
        const icon = favorite.querySelector('.fa');
        icon?.classList.toggle('fa-star', nextFavorite);
        icon?.classList.toggle('fa-star-o', !nextFavorite);
        if (item) {
          item.dataset.favorite = nextFavorite ? 'true' : 'false';
          item.classList.toggle('is-favorite', nextFavorite);
        }
        // Избранное остается ручным флагом агента и доступно через фильтр Favorite.
        runQueueStateUpdate(root, 'favorite_toggle');
        return;
      }

      const item = event.target.closest('.conv-item, .list-group-item');
      if (!item || !list.contains(item)) {
        return;
      }

      event.preventDefault();
      const payload = getConversationSwitchPayload(item);
      if (!payload.conversation_id) {
        return;
      }

      setActiveConversationItem(item);
      root.classList.add('is-switching-conversation');
      requestConversationSwitch(payload)
        .then((data) => {
          applyDemoConversationSwitch(data?.conversation || payload);
        })
        .catch(() => {
          list.querySelectorAll('.conv-item, .list-group-item').forEach((candidate) => {
            const active = candidate.dataset.conversationId === root.dataset.conversationId;
            candidate.classList.toggle('active', active);
            candidate.setAttribute('aria-current', active ? 'true' : 'false');
          });
        })
        .finally(() => {
          root.classList.remove('is-switching-conversation');
        });
    });

    list.addEventListener('keydown', (event) => {
      const favorite = event.target.closest('.js-conv-favorite');
      if (!favorite || !list.contains(favorite) || !['Enter', ' '].includes(event.key)) {
        return;
      }
      event.preventDefault();
      favorite.click();
    });
  }

  function enhanceQueue() {
    const root = document.querySelector('#admin-agent-chat');
    if (!root) {
      return;
    }

    const paneLeft = root.querySelector('.pane-left');
    if (paneLeft && !paneLeft.dataset.queueEnhanced) {
      paneLeft.dataset.queueEnhanced = '1';

      const leftControls = paneLeft.querySelector('.left-controls');
      const searchRow = paneLeft.querySelector('.pane-scroll .queue-search-row');
      const tabsRow = leftControls ? leftControls.querySelector('.queue-tabs-row') : null;
      const filtersRow = leftControls ? leftControls.querySelector('.queue-filter-row') : null;

      if (leftControls) {
        if (searchRow) {
          searchRow.classList.add('queue-search');
          const searchInput = searchRow.querySelector('#conversationsSearch');
          if (searchInput) {
            searchInput.placeholder = 'Search workload';
          }
        }

        if (tabsRow) {
          tabsRow.classList.add('queue-tabs');
          const buttons = tabsRow.querySelectorAll('button.js-left-tab');
          buttons.forEach((btn) => {
            btn.classList.add('js-queue-tab');
            btn.disabled = false;
          });

          if (buttons[0]) {
            buttons[0].innerHTML = 'Chats <span class="badge" id="badgeNeedsReply">3</span>';
            buttons[0].dataset.tab = 'active_chats';
            buttons[0].classList.add('active');
          }

          if (buttons[1]) {
            buttons[1].innerHTML = 'Pings <span class="badge" id="badgePings">2</span>';
            buttons[1].dataset.tab = 'pings';
            buttons[1].classList.remove('active');
          }

          if (buttons[2]) {
            buttons[2].remove();
          }
        }
        if (filtersRow) {
          filtersRow.classList.add('queue-filter-row');
        }
      }
    }
}

  function bindOperationalPrototype() {
    const root = document.querySelector('#admin-agent-chat');
    if (!root || root.dataset.operationalPrototypeBound === '1') {
      return;
    }

    root.dataset.operationalPrototypeBound = '1';

    const messageInput = root.querySelector('#messageInput');
    const focusStrip = root.querySelector('#focusModeStrip');

    const ensureToastStack = () => {
      let stack = document.querySelector('.prototype-toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.className = 'prototype-toast-stack';
        document.body.appendChild(stack);
      }
      return stack;
    };

    const showToast = (text, variant = '') => {
      const stack = ensureToastStack();
      const toast = document.createElement('div');
      toast.className = `prototype-toast${variant ? ` is-${variant}` : ''}`;
      toast.textContent = text;
      stack.appendChild(toast);
      window.setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(4px)';
      }, 2200);
      window.setTimeout(() => toast.remove(), 2700);
    };

    const ensureActionLog = () => {
      let log = root.querySelector('.prototype-action-log');
      if (log) {
        return log;
      }

      const flagsPane = root.querySelector('#tab-signals') || root.querySelector('#tab-flags');
      const section = document.createElement('div');
      section.className = 'context-section prototype-action-section';
      section.innerHTML = `
        <div class="context-section-title">Action log</div>
        <div class="prototype-action-log"></div>
      `;
      flagsPane?.appendChild(section);
      log = section.querySelector('.prototype-action-log');
      return log;
    };

    const logAction = (title, detail = '') => {
      const log = ensureActionLog();
      if (!log) {
        return;
      }
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const item = document.createElement('div');
      item.className = 'prototype-action-item';
      item.innerHTML = `<span><strong>${title}</strong>${detail ? ` ${detail}` : ''}</span><small>${time}</small>`;
      log.prepend(item);
      Array.from(log.children).slice(4).forEach((node) => node.remove());
    };

    const openModal = (selector) => {
      const modal = document.querySelector(selector);
      if (!modal) {
        showToast('This action needs a modal that is not in the prototype yet.', 'warn');
        return;
      }
      modal.hidden = false;
      document.body.classList.add('modal-open');
      window.setTimeout(() => modal.querySelector('input, select, textarea, button')?.focus(), 0);
    };

    const closeModal = (modal) => {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    };

    const setComposerText = (text, append = false) => {
      if (!messageInput) {
        return;
      }
      messageInput.value = append && messageInput.value.trim()
        ? `${messageInput.value.trim()}\n${text}`
        : text;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.focus();
    };

    const getActiveCard = () => root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');

    const getCardLabels = (card) => card?.querySelector('.conv-line-labels') || null;

    const addCardPill = (label, className = 'conv-pill-neutral') => {
      const labels = getCardLabels(getActiveCard());
      if (!labels || Array.from(labels.children).some((pill) => pill.textContent.trim() === label)) {
        return;
      }
      const pill = document.createElement('span');
      pill.className = `conv-pill ${className}`;
      pill.textContent = label;
      labels.appendChild(pill);
    };

    const removeCardPill = (label) => {
      const labels = getCardLabels(getActiveCard());
      labels?.querySelectorAll('.conv-pill').forEach((pill) => {
        if (pill.textContent.trim() === label) {
          pill.remove();
        }
      });
    };

    const hasCardPill = (label) => {
      const labels = getCardLabels(getActiveCard());
      return Array.from(labels?.querySelectorAll('.conv-pill') || []).some((pill) => pill.textContent.trim() === label);
    };

    const addDialogChip = (label, className = 'dialog-chip-prototype') => {
      const labels = root.querySelector('.dialog-meta-labels');
      if (!labels || Array.from(labels.querySelectorAll('.dialog-chip')).some((chip) => chip.textContent.trim() === label)) {
        return;
      }
      const chip = document.createElement('span');
      chip.className = `dialog-chip ${className}`;
      chip.textContent = label;
      const firstPlain = Array.from(labels.children).find((node) => !node.classList?.contains('dialog-chip'));
      labels.insertBefore(chip, firstPlain || null);
    };

    const removeDialogChip = (label) => {
      root.querySelectorAll('.dialog-meta-labels .dialog-chip').forEach((chip) => {
        if (chip.textContent.trim() === label) {
          chip.remove();
        }
      });
    };

    const hasDialogChip = (label) => Array.from(root.querySelectorAll('.dialog-meta-labels .dialog-chip')).some((chip) => chip.textContent.trim() === label);

    const switchRightTab = (tabName) => {
      const tab = root.querySelector(`.right-tab[data-tab="${tabName}"], .js-right-tab[data-tab="${tabName}"]`);
      tab?.click();
    };

    const offerDrafts = {
      'start-paid': 'Я могу начать платную сессию и разобрать ваш вопрос глубже. Если готовы, нажмите кнопку начала чата, и мы продолжим без потери контекста.',
      sell: 'У нас осталось немного оплаченного времени. Чтобы я спокойно завершила разбор и дала следующий шаг, лучше продлить сессию сейчас.',
      package: 'Для вашей ситуации подойдет пакет продолжения: мы сможем разобрать вопрос глубже и сохранить весь контекст этого диалога.',
      'deep-reading': 'Здесь уже видно несколько важных слоев. Я могу предложить глубокий разбор, чтобы не ограничиваться коротким ответом.'
    };

    const offerLabels = {
      'start-paid': 'Start paid chat',
      sell: 'Sell',
      package: 'Package link',
      'deep-reading': 'Deep reading'
    };

    const applyOffer = (type) => {
      const label = offerLabels[type] || 'Offer';
      setComposerText(offerDrafts[type] || offerDrafts.package);
      addCardPill(label, type === 'sell' ? 'conv-pill-warning' : 'conv-pill-neutral');
      logAction('Offer prepared:', label);
      showToast(`${label} inserted into composer`, 'success');
    };

    const toggleNoPush = () => {
      if (hasDialogChip('Do not push')) {
        removeDialogChip('Do not push');
        removeCardPill('Do not push');
        logAction('No-push removed');
        showToast('No-push flag removed');
        return;
      }
      addDialogChip('Do not push', 'dialog-chip-danger');
      addCardPill('Do not push', 'conv-pill-danger');
      logAction('No-push set');
      showToast('No-push flag set', 'warn');
    };

    const toggleHot = () => {
      if (hasCardPill('Hot')) {
        removeCardPill('Hot');
        logAction('Hot flag removed');
        showToast('Hot client flag removed');
        return;
      }
      addCardPill('Hot', 'conv-pill-danger');
      logAction('Hot client marked');
      showToast('Dialog marked as hot', 'success');
    };

    const toggleFocus = () => {
      const nextHidden = !focusStrip?.hidden;
      if (focusStrip) {
        focusStrip.hidden = nextHidden;
      }
      if (nextHidden) {
        logAction('Focus mode off');
        showToast('Focus mode disabled');
      } else {
        logAction('Focus mode on');
        showToast('Focus mode enabled', 'success');
      }
    };

    const handleAction = (action, trigger) => {
      switch (action) {
        case 'need-data':
          setComposerText('Уточните, пожалуйста, дату рождения, точное время рождения и город. Это поможет мне не ошибиться в разборе.');
          logAction('Need data draft prepared');
          showToast('Need data draft inserted', 'success');
          break;
        case 'insert-sell-script':
          applyOffer('sell');
          break;
        case 'insert-ping-template':
          setComposerText('Здравствуйте. Вы смотрели мой профиль, и по вашему вопросу можно аккуратно начать с короткого разбора. Если хотите, напишите, что сейчас волнует больше всего.');
          addCardPill('Template ready', 'conv-pill-neutral');
          logAction('Ping outreach template prepared');
          showToast('Ping template inserted', 'success');
          break;
        case 'insert-ai-draft': {
          const draft = root.querySelector('#tab-ai .context-assist-card p')?.textContent.trim();
          setComposerText(draft || 'Я рядом. Давайте продолжим аккуратно и без спешки.');
          logAction('AI draft inserted');
          showToast('Reply draft inserted', 'success');
          break;
        }
        case 'toggle-no-push':
          toggleNoPush();
          break;
        case 'toggle-hot':
          toggleHot();
          break;
        case 'toggle-pinned': {
          const card = getActiveCard();
          card?.classList.toggle('is-pinned-demo');
          const pinned = card?.classList.contains('is-pinned-demo');
          logAction(pinned ? 'Dialog pinned' : 'Dialog unpinned');
          showToast(pinned ? 'Dialog pinned' : 'Dialog unpinned');
          break;
        }
        case 'archive-dialog': {
          const card = getActiveCard();
          if (!card) {
            showToast('Select a dialog before archiving', 'warn');
            break;
          }
          card.dataset.archived = 'true';
          card.classList.add('is-archived');
          // Архив убирает диалог из рабочей очереди, но не удаляет историю; найти его можно фильтром Archive.
          logAction('Dialog archived');
          showToast('Dialog moved to Archive', 'success');
          runQueueStateUpdate(root, 'archive_dialog');
          break;
        }
        case 'toggle-focus':
          toggleFocus();
          break;
        case 'open-compensation':
          openModal('#modalCompensationRequest');
          break;
        case 'open-handoff':
          openModal('#modalHandoffDialog');
          break;
        case 'open-follow-up':
          openModal('#modalFollowUpPlan');
          break;
        case 'open-flags':
          switchRightTab('flags');
          showToast('Flags panel opened');
          break;
        case 'resolve-dialog': {
          const card = getActiveCard();
          card?.classList.add('is-resolved');
          addDialogChip('Resolved', 'dialog-chip-prototype');
          addCardPill('Resolved', 'conv-pill-neutral');
          logAction('Dialog marked resolved');
          showToast('Dialog marked as resolved', 'success');
          break;
        }
        case 'submit-compensation': {
          const modal = trigger.closest('.global-modal-backdrop');
          const amount = modal?.querySelector('#compensationAmount')?.value || '10 credits';
          addCardPill('Comp request', 'conv-pill-warning');
          logAction('Compensation requested:', amount);
          closeModal(modal);
          showToast('Compensation request created', 'success');
          break;
        }
        case 'submit-handoff': {
          const modal = trigger.closest('.global-modal-backdrop');
          const target = modal?.querySelector('#handoffTarget')?.value || 'Senior shift';
          addDialogChip('Escalated', 'dialog-chip-danger');
          addCardPill('Escalated', 'conv-pill-danger');
          logAction('Handoff created:', target);
          closeModal(modal);
          showToast('Handoff created', 'success');
          break;
        }
        case 'submit-follow-up': {
          const modal = trigger.closest('.global-modal-backdrop');
          const when = modal?.querySelector('#followUpWhen')?.value || 'Today 21:00';
          addCardPill('Follow-up', 'conv-pill-neutral');
          logAction('Follow-up scheduled:', when);
          closeModal(modal);
          showToast('Follow-up scheduled', 'success');
          break;
        }
        case 'save-note': {
          const pane = trigger.closest('#tab-notes');
          const textarea = pane?.querySelector('textarea');
          const text = textarea?.value.trim();
          if (!text) {
            showToast('Add a note before saving', 'warn');
            textarea?.focus();
            return;
          }
          const note = document.createElement('div');
          note.className = 'context-note-item';
          note.innerHTML = `<small>Alex · now</small><span>${text}</span>`;
          textarea.before(note);
          textarea.value = '';
          addCardPill('Has notes', 'conv-pill-neutral');
          logAction('Internal note saved');
          showToast('Internal note saved', 'success');
          break;
        }
        case 'clear-note': {
          const textarea = trigger.closest('#tab-notes')?.querySelector('textarea');
          if (textarea) textarea.value = '';
          showToast('Note draft cleared');
          break;
        }
        case 'report-user':
          document.querySelector('[data-mock-open="#modalReportProblem"]')?.click();
          if (!document.querySelector('[data-mock-open="#modalReportProblem"]')) {
            openModal('#modalReportProblem');
          }
          break;
        default:
          showToast('Prototype action recorded');
      }
    };

    root.addEventListener('click', (event) => {
      const offer = event.target.closest('[data-offer-action]');
      if (offer) {
        event.preventDefault();
        event.stopPropagation();
        offer.closest('.offer-menu, .composer-offer-menu')?.classList.remove('open');
        applyOffer(offer.dataset.offerAction);
        return;
      }

      const action = event.target.closest('[data-prototype-action]');
      if (action) {
        event.preventDefault();
        event.stopPropagation();
        handleAction(action.dataset.prototypeAction, action);
      }
    });

    root.querySelectorAll('.offer-menu, .composer-offer-menu').forEach((menu) => {
      if (menu.dataset.prototypeDropdownBound === '1') {
        return;
      }
      menu.dataset.prototypeDropdownBound = '1';
      menu.querySelector('.dropdown-toggle')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        root.querySelectorAll('.offer-menu.open, .composer-offer-menu.open').forEach((openMenu) => {
          if (openMenu !== menu) openMenu.classList.remove('open');
        });
        menu.classList.toggle('open');
      });
    });

    document.addEventListener('click', (event) => {
      const globalAction = event.target.closest('[data-prototype-action]');
      if (globalAction && !root.contains(globalAction)) {
        event.preventDefault();
        event.stopPropagation();
        handleAction(globalAction.dataset.prototypeAction, globalAction);
        return;
      }

      if (!event.target.closest('.offer-menu, .composer-offer-menu')) {
        root.querySelectorAll('.offer-menu.open, .composer-offer-menu.open').forEach((menu) => menu.classList.remove('open'));
      }

      if (event.defaultPrevented) {
        return;
      }

      const deadLink = event.target.closest('a[href]');
      if (!deadLink || deadLink.dataset.offerAction || deadLink.dataset.prototypeAction || deadLink.closest('.dropdown-menu .js-set-status')) {
        return;
      }

      if (deadLink.closest('.main-sidebar, .admin-user-menu') && !deadLink.dataset.mockOpen) {
        event.preventDefault();
        document.querySelectorAll('.main-sidebar li.active').forEach((item) => item.classList.remove('active'));
        deadLink.closest('li')?.classList.add('active');
        const label = deadLink.textContent.trim().replace(/\s+/g, ' ') || 'admin section';
        showToast(`Prototype navigation: ${label}`);
        return;
      }

      const href = deadLink.getAttribute('href') || '';
      if (href === '#' || href.endsWith('/admin/message/chat#')) {
        event.preventDefault();
        showToast('Prototype navigation: this would open the selected admin section.');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      root.querySelectorAll('.offer-menu.open, .composer-offer-menu.open').forEach((menu) => menu.classList.remove('open'));
    });
  }

    document.addEventListener('DOMContentLoaded', () => {
      bindQueueRefresh();
      bindConversationSearch();
      bindQuickFilters();
      bindQueueUserSelect();
      bindConversationSwitcher();
      bindChatMoreMenu();
      bindChatSearchToggle();
      bindSessionToggle();
      bindMessageSafeActions();
      bindComposerVisualState();
      bindDateRangePickers();
      bindRightContextTabs();
      bindRightPanelCollapse();
      bindLeftPanelCollapse();
      bindRightContextProfile();
      bindPinnedMessagesDrawer();
      enhanceQueue();
      const initialQueueList = document.querySelector('#admin-agent-chat .conv-list');
      if (initialQueueList) {
        sortQueueCardsByPriority(initialQueueList);
      }
      syncQueueCardHints(document);
      syncGlobalTooltips(document);
      bindQueueTabs();
      bindOperationalPrototype();
    });
  })();
