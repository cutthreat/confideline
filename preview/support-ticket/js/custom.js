(function () {
  // Support chat timing values: when moving to Yii2, change them here instead of inside handlers.
  var SUPPORT_TICKET_DEMO_MODE = document.documentElement.getAttribute('data-support-demo') === 'true'; // Enables local UI fallbacks only in the static prototype.
  var COMPOSER_DRAFT_SERVER_AUTOSAVE_MS = 10000; // How often the reply draft is sent to the backend.
  var COMPOSER_DRAFT_LOCAL_AUTOSAVE_MS = 400; // Debounce for fast localStorage draft saving.
  var COMPOSER_LOCAL_DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // Maximum local draft age before automatic cleanup.
  var COMPOSER_SEND_UNLOCK_SECONDS = 2; // How long the operator waits before confirmed message sending.
  var COMPOSER_SEND_UNLOCK_TICK_MS = 1000; // Countdown update interval for send unlock.
  var COMPOSER_DRAFT_SAVED_FEEDBACK_MS = 1200; // How long the saved-draft visual feedback stays visible.
  var COMPOSER_TRANSLATION_REQUEST_TIMEOUT_MS = 1400; // Max wait for composer translation endpoint before demo fallback.
  var DEMO_COMPOSER_TRANSLATION_DELAY_MS = 350; // Demo delay for composer translation while backend API is absent.
  var DEMO_MESSAGE_TRANSLATION_DELAY_MS = 700; // Demo delay for translating an existing client message.
  var DEMO_MESSAGE_EDIT_DELAY_MS = 450; // Demo delay for saving edited message text.
  var DEMO_MESSAGE_ACTION_DELAY_MS = 350; // Demo delay for quick message actions: pin/delete.
  var DEMO_NOTE_CREATE_DELAY_MS = 300; // Demo delay for creating an internal note.
  var DEMO_TEMPLATE_CREATE_DELAY_MS = 350; // Demo delay for creating a new reply template.
  var DEMO_ATTACHMENT_UPLOAD_DELAY_MS = 450; // Demo delay for uploading a composer attachment.
  var DEMO_TICKET_ACTION_DELAY_MS = 350; // Demo delay for ticket actions: status, assign, close.
  var MESSAGE_FOCUS_HIGHLIGHT_MS = 1400; // How long message highlight stays visible after jumping to it.
  var SUPPORT_REQUEST_FEEDBACK_MS = 5500; // How long a recoverable request error stays visible.

  function resolveDemoFallback(error, delayMs, createPayload) {
    if (!SUPPORT_TICKET_DEMO_MODE || error && error.status === 409) {
      return Promise.reject(error);
    }
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve(createPayload());
      }, delayMs || 0);
    });
  }

  function assertSuccessfulPayload(data, fallbackMessage) {
    if (data && typeof data === 'object' && (data.ok === false || data.success === false)) {
      var error = new Error(data.message || fallbackMessage || 'AJAX request failed');
      error.status = Number(data.status || data.status_code || 422);
      error.payload = data;
      throw error;
    }
    return data;
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var panels = document.querySelectorAll('.box-footer .tab-content > .tab-pane');
    var replyTextarea = document.getElementById('message-message');
    var composerForm = replyTextarea && replyTextarea.form;
    var composerHelp = document.querySelector('.field-message-message .help-block');
    var sendButton = document.querySelector('.ticket-composer-send');
    var draftStatus = document.querySelector('.ticket-composer-shortcut');
    var closeTicketButton = document.querySelector('.ticket-composer-close-ticket');
    var closeTicketActionSource = closeTicketButton || document.querySelector('.ticket-composer-status-select[data-close-url], [data-close-url]');
    var closeTicketModal = document.getElementById('ticket-close-modal');
    var closeTicketConfirm = document.getElementById('ticket-close-confirm');
    var closeTicketCancelButtons = document.querySelectorAll('.ticket-close-modal-cancel');
    var closeTicketModalBackdrop = null;
    var messageDeleteModal = document.getElementById('ticket-message-delete-modal');
    var messageDeleteConfirm = document.getElementById('ticket-message-delete-confirm');
    var messageDeletePreview = document.getElementById('ticket-message-delete-preview');
    var messageDeleteDescription = document.getElementById('ticket-message-delete-description');
    var messageDeleteCancelButtons = document.querySelectorAll('.ticket-message-delete-modal-cancel');
    var messageDeleteModalBackdrop = null;
    var assignTicketButtons = document.querySelectorAll('.ticket-assign-button');
    var assigneeLabels = document.querySelectorAll('[data-ticket-assignee-label]');
    var assigneeValue = document.querySelector('[data-ticket-assignee-value]');
    var ticketStatusSelects = document.querySelectorAll('.ticket-status-select');
    var ticketStatusSelect = ticketStatusSelects[0] || null;
    var ticketStatusLabels = document.querySelectorAll('[data-ticket-status-label]');
    var ticketEscalationLabels = document.querySelectorAll('[data-ticket-escalation-label]');
    var ticketEscalateButton = document.querySelector('.ticket-escalate-button');
    var ticketHistoryList = document.getElementById('ticket-history-list');
    var ticketEscalateModal = document.getElementById('ticket-escalate-modal');
    var ticketEscalateConfirm = document.getElementById('ticket-escalate-confirm');
    var ticketEscalateCancelButtons = document.querySelectorAll('.ticket-escalate-modal-cancel');
    var ticketEscalateTeam = document.getElementById('ticket-escalate-team');
    var ticketEscalateReason = document.getElementById('ticket-escalate-reason');
    var ticketEscalateComment = document.getElementById('ticket-escalate-comment');
    var ticketEscalateModalBackdrop = null;
    var ticketResolveModal = document.getElementById('ticket-resolve-modal');
    var ticketResolveConfirm = document.getElementById('ticket-resolve-confirm');
    var ticketResolveCancelButtons = document.querySelectorAll('.ticket-resolve-modal-cancel');
    var ticketResolveReason = document.getElementById('ticket-resolve-reason');
    var ticketResolveComment = document.getElementById('ticket-resolve-comment');
    var ticketResolveModalBackdrop = null;
    var ticketPaymentOpen = document.getElementById('ticket-client-payment-open');
    var ticketPaymentModal = document.getElementById('ticket-payment-modal');
    var ticketPaymentCancelButtons = document.querySelectorAll('.ticket-payment-modal-cancel');
    var ticketPaymentModalBackdrop = null;
    var pendingStatusBeforeResolve = 'waiting_support';
    var closeTicketReason = document.getElementById('ticket-close-reason');
    var closeTicketResolution = document.getElementById('ticket-close-resolution');
    var noteTextarea = document.getElementById('internal-note-message');
    var noteSave = document.getElementById('ticket-note-save');
    var noteList = document.querySelector('.ticket-note-list');
    var composerShell = document.querySelector('.ticket-composer-shell');
    var templateSelect = document.getElementById('quick-reply-template');
    var templateCombobox = document.getElementById('quick-reply-template-combobox');
    var templateSearch = document.getElementById('quick-reply-template-search');
    var templateClear = document.getElementById('quick-reply-template-clear');
    var templateToggle = document.getElementById('quick-reply-template-toggle');
    var templateMenu = document.getElementById('quick-reply-template-menu');
    var templateOptionsList = document.getElementById('quick-reply-template-options');
    var templateEmpty = document.getElementById('quick-reply-template-empty');
    var templatePanel = document.getElementById('quick-template');
    var templateAdd = document.getElementById('ticket-template-add');
    var templateWarning = document.getElementById('ticket-template-warning');
    var templatePopover = document.getElementById('ticket-template-popover');
    var templateName = document.getElementById('ticket-template-name');
    var templateSave = document.getElementById('ticket-template-save');
    var templateCancel = document.getElementById('ticket-template-cancel');
    var templateChip = document.getElementById('ticket-composer-template-chip');
    var templateChipClear = document.getElementById('ticket-composer-template-chip-clear');
    var noteButtons = document.querySelectorAll('[data-note-template]');
    var replyPreview = document.getElementById('ticket-reply-preview');
    var replyPreviewBody = document.getElementById('ticket-reply-preview-body');
    var replyPreviewLabel = document.getElementById('ticket-reply-preview-label');
    var replyPreviewText = document.getElementById('ticket-reply-preview-text');
    var replyPreviewClose = document.getElementById('ticket-reply-preview-close');
    var replyToInput = document.getElementById('message-reply-to-id');
    var editPreview = document.getElementById('ticket-edit-preview');
    var editPreviewBody = document.getElementById('ticket-edit-preview-body');
    var editPreviewText = document.getElementById('ticket-edit-preview-text');
    var editPreviewClose = document.getElementById('ticket-edit-preview-close');
    var composerTranslateChip = document.getElementById('ticket-composer-translate-chip');
    var composerTranslateButton = document.getElementById('ticket-composer-translate');
    var composerTranslateLabel = document.getElementById('ticket-composer-translate-label');
    var composerTranslateClear = document.getElementById('ticket-composer-translate-clear');
    var composerTranslationModal = document.getElementById('ticket-composer-translation-modal');
    var composerTranslationModalMeta = document.getElementById('ticket-composer-translation-modal-meta');
    var composerTranslationRouteLabel = document.getElementById('ticket-composer-translation-route-label');
    var composerTranslationRefresh = document.getElementById('ticket-composer-translation-refresh');
    var clientTranslationSource = document.getElementById('ticket-client-translation-source');
    var clientTranslationTarget = document.getElementById('ticket-client-translation-target');
    var composerTranslationOriginal = document.getElementById('ticket-composer-translation-original');
    var composerTranslationResult = document.getElementById('ticket-composer-translation-result');
    var composerTranslationCancelButtons = document.querySelectorAll('.ticket-composer-translation-modal-cancel');
    var composerTranslationModalBackdrop = null;
    var controlButtons = document.querySelectorAll('.ticket-composer-control-row .js-chat-control');
    var composerAttach = document.querySelector('.ticket-composer-attach');
    var composerAttachToggle = document.getElementById('ticket-composer-attach-toggle');
    var composerAttachMenu = document.getElementById('ticket-composer-attach-menu');
    var composerAttachOptions = composerAttachMenu
      ? composerAttachMenu.querySelectorAll('[data-attachment-kind]')
      : [];
    var fileInput = document.getElementById('baseupload-imagefiles');
    var attachmentZone = document.getElementById('ticket-attachment-zone');
    var attachmentList = document.getElementById('ticket-attachment-list');
    var messageTools = document.querySelectorAll('.ticket-message-tools .ticket-message-tool, .ticket-message-tools .ticket-message-menu-action');
    var messageMenus = document.querySelectorAll('.ticket-message-more');
    var threadSearchInput = document.getElementById('ticket-thread-search');
    var threadSearchClear = document.getElementById('ticket-thread-search-clear');
    var threadSearchCount = document.getElementById('ticket-search-count');
    var threadSearchResults = document.getElementById('ticket-thread-search-results');
    var threadSearchPrev = document.querySelector('.ticket-search-prev');
    var threadSearchNext = document.querySelector('.ticket-search-next');
    var threadFilterButtons = document.querySelectorAll('[data-thread-filter]');
    var threadFilterDropdown = document.querySelector('.ticket-thread-filter');
    var threadFilterToggle = document.querySelector('.ticket-thread-filter-toggle');
    var threadFilterLabel = document.getElementById('ticket-thread-filter-label');
    var sideTabs = document.querySelectorAll('.ticket-side-tabs a[data-toggle="tab"]');
    var collapsibleRightBoxes = document.querySelectorAll('[data-collapsible-box]');
    var stickySidePanel = document.querySelector('.ticket-side-tabs-box.ticket-right-collapsible-box');
    var stickySideColumn = document.querySelector('.ticket-right-sidebar-col');
    var stickyThreadColumn = document.querySelector('.support-thread-box') ? document.querySelector('.support-thread-box').parentElement : null;
    var stickySidePanelPlaceholder = null;
    var stickySidePanelStartY = 0;
    var pinnedToggle = document.getElementById('ticket-pinned-toggle');
    var pinnedBar = document.getElementById('ticket-pinned-bar');
    var pinnedContent = document.getElementById('ticket-pinned-content');
    var pinnedText = document.getElementById('ticket-pinned-text');
    var pinnedCount = document.getElementById('ticket-pinned-count');
    var pinnedToggleCount = document.getElementById('ticket-pinned-toggle-count');
    var pinnedClose = document.getElementById('ticket-pinned-close');
    var threadTimeline = document.getElementById('supportConversationItems');
    var queueGrid = document.getElementById('support-ticket-grid');
    var queueCheckAll = document.querySelector('[data-support-queue-check-all]');
    var queueRowChecks = document.querySelectorAll('[data-support-queue-row-check]');
    var queueSelectedCount = document.getElementById('support-queue-selected-count');
    var queueSelectedCountText = document.getElementById('support-queue-selected-count-text');
    var queueSelectedClear = document.getElementById('support-queue-selected-clear');
    var queueBulkActions = document.querySelectorAll('[data-support-queue-bulk-action]');
    var queueBulkAssignButton = document.querySelector('[data-support-queue-bulk-action="assign"]');
    var queueBulkPriorityButton = document.querySelector('[data-support-queue-bulk-action="priority"]');
    var queuePriorityDropdown = document.querySelector('.support-queue-priority-dropdown');
    var queuePriorityItems = document.querySelectorAll('[data-support-queue-priority]');
    var queueToolbarHint = document.getElementById('support-queue-toolbar-hint') || document.querySelector('.support-queue-toolbar-note > span:last-child');
    var queueResetButton = document.querySelector('.support-queue-reset');
    var queueFilterControls = document.querySelectorAll('#support-ticket-grid-filters input, #support-ticket-grid-filters select');
    var queueAssignModal = document.getElementById('support-queue-assign-modal');
    var queueAssignSummary = document.getElementById('support-queue-assign-summary');
    var queueAssigneeSelect = document.getElementById('support-queue-assignee');
    var queueAssignConfirm = document.getElementById('support-queue-assign-confirm');
    var queueAssignHelp = document.getElementById('support-queue-assign-help');
    var queueAssignCancelButtons = document.querySelectorAll('.support-queue-assign-modal-cancel');
    var queueAssignModalBackdrop = null;
    var supportRequestFeedback = document.getElementById('support-request-feedback');
    var ticketConfigNode = document.getElementById('support-ticket-config');
    var ticketStateNode = document.getElementById('support-ticket-state');
    var clientTranslationSettings = document.querySelector('.ticket-client-translation-settings');
    var supportRequestFeedbackTimer = null;
    var supportTicketConfig = readSupportTicketConfig();
    var ticketState = readTicketState();
    var appliedTemplateText = '';
    var activeReplyContext = null;
    var activeEditContext = null;
    var activeComposerTranslation = null;
    var pendingDeleteMessage = null;
    var threadSearchMatches = [];
    var threadSearchIndex = -1;
    var activeThreadFilter = 'all';
    var draftState = {
      autosaveMs: COMPOSER_DRAFT_SERVER_AUTOSAVE_MS,
      localAutosaveMs: COMPOSER_DRAFT_LOCAL_AUTOSAVE_MS,
      autosaveTimer: null,
      localAutosaveTimer: null,
      lastServerFingerprint: '',
      lastLocalFingerprint: '',
      revision: 0,
      nonce: 'support-draft-' + Date.now() + '-' + Math.random().toString(16).slice(2),
      isSending: false,
      restored: false,
      sendState: 'locked',
      unlockSeconds: COMPOSER_SEND_UNLOCK_SECONDS,
      unlockRemaining: 0,
      unlockTimer: null
    };

    function setCollapsibleBoxState(box, isCollapsed) {
      if (!box) {
        return;
      }
      var trigger = box.querySelector('[data-box-collapse-trigger]');
      var bodyId = trigger ? trigger.getAttribute('aria-controls') : '';
      var body = bodyId ? document.getElementById(bodyId) : box.querySelector('.box-body');
      box.classList.toggle('is-collapsed', Boolean(isCollapsed));
      if (trigger) {
        trigger.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
      }
      if (body) {
        body.setAttribute('aria-hidden', isCollapsed ? 'true' : 'false');
      }
    }

    function toggleCollapsibleBox(trigger) {
      var box = trigger && trigger.closest('[data-collapsible-box]');
      if (!box) {
        return;
      }
      setCollapsibleBoxState(box, !box.classList.contains('is-collapsed'));
      updateStickySidePanel(true);
    }

    function initCollapsibleRightBoxes() {
      Array.prototype.forEach.call(collapsibleRightBoxes, function (box) {
        var trigger = box.querySelector('[data-box-collapse-trigger]');
        if (!trigger) {
          return;
        }
        setCollapsibleBoxState(box, box.classList.contains('is-collapsed'));
        trigger.addEventListener('click', function () {
          toggleCollapsibleBox(trigger);
        });
        trigger.addEventListener('keydown', function (event) {
          if (event.key !== 'Enter' && event.key !== ' ') {
            return;
          }
          event.preventDefault();
          toggleCollapsibleBox(trigger);
        });
      });
    }

    function getStickyScrollTop() {
      return window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop
        || 0;
    }

    function getStickyTopOffset() {
      if (!stickySidePanel) {
        return 60;
      }
      var cssTop = parseFloat(window.getComputedStyle(stickySidePanel).top);
      return Number.isFinite(cssTop) ? cssTop : 60;
    }

    function ensureStickySidePanelPlaceholder() {
      if (!stickySidePanel || stickySidePanelPlaceholder) {
        return;
      }
      stickySidePanelPlaceholder = document.createElement('div');
      stickySidePanelPlaceholder.className = 'ticket-side-panel-sticky-placeholder';
      stickySidePanelPlaceholder.hidden = true;
      stickySidePanel.parentNode.insertBefore(stickySidePanelPlaceholder, stickySidePanel);
    }

    function isStickySidePanelAllowed() {
      if (!stickySidePanel || !stickySideColumn || !stickyThreadColumn) {
        return false;
      }
      var sideRect = stickySideColumn.getBoundingClientRect();
      var threadRect = stickyThreadColumn.getBoundingClientRect();
      var isBesideThread = sideRect.left > threadRect.left + 24;
      var isSameRow = Math.abs(sideRect.top - threadRect.top) < 24;
      return isBesideThread && isSameRow;
    }

    function setStickySidePanelFixed(isFixed) {
      if (!stickySidePanel) {
        return;
      }
      ensureStickySidePanelPlaceholder();
      if (isFixed) {
        var sourceRect = stickySidePanelPlaceholder && !stickySidePanelPlaceholder.hidden
          ? stickySidePanelPlaceholder.getBoundingClientRect()
          : stickySidePanel.getBoundingClientRect();
        var height = stickySidePanel.offsetHeight;
        stickySidePanelPlaceholder.hidden = false;
        stickySidePanelPlaceholder.style.height = height + 'px';
        stickySidePanelPlaceholder.style.marginBottom = window.getComputedStyle(stickySidePanel).marginBottom;
        stickySidePanel.classList.add('is-scroll-fixed');
        stickySidePanel.style.top = getStickyTopOffset() + 'px';
        stickySidePanel.style.left = sourceRect.left + 'px';
        stickySidePanel.style.width = sourceRect.width + 'px';
        return;
      }
      stickySidePanel.classList.remove('is-scroll-fixed');
      stickySidePanel.style.top = '';
      stickySidePanel.style.left = '';
      stickySidePanel.style.width = '';
      if (stickySidePanelPlaceholder) {
        stickySidePanelPlaceholder.hidden = true;
        stickySidePanelPlaceholder.style.height = '';
        stickySidePanelPlaceholder.style.marginBottom = '';
      }
    }

    function updateStickySidePanel(forceMeasure) {
      if (!stickySidePanel) {
        return;
      }
      ensureStickySidePanelPlaceholder();
      if (!isStickySidePanelAllowed()) {
        setStickySidePanelFixed(false);
        return;
      }
      var isFixed = stickySidePanel.classList.contains('is-scroll-fixed');
      var scrollTop = getStickyScrollTop();
      var topOffset = getStickyTopOffset();

      if (!isFixed || forceMeasure) {
        if (isFixed) {
          setStickySidePanelFixed(false);
        }
        stickySidePanelStartY = stickySidePanel.getBoundingClientRect().top + scrollTop;
      }

      if (scrollTop + topOffset >= stickySidePanelStartY) {
        setStickySidePanelFixed(true);
      } else {
        setStickySidePanelFixed(false);
      }
    }

    function syncQueueSelection() {
      if (!queueGrid || !queueRowChecks.length) {
        return;
      }
      var selectedCount = Array.prototype.filter.call(queueRowChecks, function (checkbox) {
        return checkbox.checked;
      }).length;
      var allSelected = selectedCount > 0 && selectedCount === queueRowChecks.length;
      var hasSelection = selectedCount > 0;

      if (queueSelectedCount) {
        if (queueSelectedCountText) {
          queueSelectedCountText.textContent = selectedCount + ' выбрано';
        }
        queueSelectedCount.hidden = !hasSelection;
      }
      if (queueCheckAll) {
        queueCheckAll.checked = allSelected;
        queueCheckAll.indeterminate = hasSelection && !allSelected;
      }
      Array.prototype.forEach.call(queueBulkActions, function (button) {
        button.disabled = !hasSelection;
        button.setAttribute('aria-disabled', String(!hasSelection));
      });
      Array.prototype.forEach.call(queueRowChecks, function (checkbox) {
        var row = checkbox.closest('tr');
        if (row) {
          row.classList.toggle('is-selected', checkbox.checked);
        }
      });
      if (!hasSelection) {
        toggleQueuePriorityDropdown(false);
      }
    }

    function isQueueYiiParam(name) {
      return name === 'sort'
        || name === 'page'
        || name === 'per-page'
        || name === 'status'
        || name === 'assigned'
        || name === 'sla'
        || name === 'q'
        || name.indexOf('SupportSearch[') === 0;
    }

    function hasQueueUrlState() {
      var params = new URLSearchParams(window.location.search || '');
      var hasState = false;
      params.forEach(function (value, name) {
        if (name === 'bust' || name === '_') {
          return;
        }
        if (isQueueYiiParam(name) && String(value || '').trim() !== '') {
          hasState = true;
        }
      });
      return hasState;
    }

    function hasQueueFilterValues() {
      return Array.prototype.some.call(queueFilterControls, function (control) {
        return String(control.value || '').trim() !== '';
      });
    }

    function syncQueueResetVisibility() {
      if (!queueResetButton) {
        return;
      }
      queueResetButton.hidden = !(hasQueueUrlState() || hasQueueFilterValues());
    }

    function getSelectedQueueRows() {
      return Array.prototype.map.call(queueRowChecks, function (checkbox) {
        return checkbox.checked ? checkbox.closest('tr') : null;
      }).filter(Boolean);
    }

    function getSelectedQueueTicketIds() {
      return getSelectedQueueRows().map(function (row) {
        return row.getAttribute('data-key') || '';
      }).filter(Boolean);
    }

    function getSelectedQueueTicketRevisions() {
      return getSelectedQueueRows().reduce(function (revisions, row) {
        var ticketId = row.getAttribute('data-key') || '';
        if (ticketId) {
          revisions[ticketId] = Number(row.getAttribute('data-revision') || 0);
        }
        return revisions;
      }, {});
    }

    function getQueueTicketCountLabel(count) {
      var absCount = Math.abs(count);
      var lastTwo = absCount % 100;
      var lastOne = absCount % 10;
      if (lastTwo >= 11 && lastTwo <= 14) {
        return count + ' тикетов';
      }
      if (lastOne === 1) {
        return count + ' тикет';
      }
      if (lastOne >= 2 && lastOne <= 4) {
        return count + ' тикета';
      }
      return count + ' тикетов';
    }

    function setQueueToolbarHint(text) {
      if (queueToolbarHint && text) {
        queueToolbarHint.textContent = text;
      }
    }

    function toggleQueuePriorityDropdown(forceState) {
      if (!queuePriorityDropdown || !queueBulkPriorityButton) {
        return;
      }
      var shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : !queuePriorityDropdown.classList.contains('open');
      if (shouldOpen && !getSelectedQueueRows().length) {
        shouldOpen = false;
      }
      queuePriorityDropdown.classList.toggle('open', shouldOpen);
      queueBulkPriorityButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }

    function openQueueAssignModal() {
      var selectedRows = getSelectedQueueRows();
      if (!queueAssignModal || !selectedRows.length) {
        return;
      }
      if (queueAssignSummary) {
        queueAssignSummary.textContent = 'Выбрано: ' + getQueueTicketCountLabel(selectedRows.length) + '. Назначьте ответственного сотрудника службы поддержки.';
      }
      if (queueAssignHelp) {
        queueAssignHelp.textContent = '';
      }
      if (queueAssigneeSelect) {
        queueAssigneeSelect.value = '';
      }
      if (queueAssignConfirm) {
        queueAssignConfirm.disabled = true;
        queueAssignConfirm.classList.remove('is-loading');
        queueAssignConfirm.innerHTML = 'Назначить';
      }
      queueAssignModal.hidden = false;
      queueAssignModal.style.display = 'block';
      queueAssignModal.classList.add('in');
      queueAssignModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!queueAssignModalBackdrop) {
        queueAssignModalBackdrop = document.createElement('div');
        queueAssignModalBackdrop.className = 'modal-backdrop fade in support-queue-assign-modal-backdrop';
        queueAssignModalBackdrop.addEventListener('click', hideQueueAssignModal);
        document.body.appendChild(queueAssignModalBackdrop);
      }
      window.setTimeout(function () {
        if (queueAssigneeSelect) {
          queueAssigneeSelect.focus();
        }
      }, 0);
    }

    function hideQueueAssignModal() {
      if (!queueAssignModal) {
        return;
      }
      queueAssignModal.classList.remove('in');
      queueAssignModal.style.display = 'none';
      queueAssignModal.hidden = true;
      queueAssignModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (queueAssignModalBackdrop && queueAssignModalBackdrop.parentNode) {
        queueAssignModalBackdrop.parentNode.removeChild(queueAssignModalBackdrop);
      }
      queueAssignModalBackdrop = null;
    }

    function getQueueBulkUrl(button, gridAttribute, fallbackUrl) {
      return button && button.getAttribute(gridAttribute)
        || queueGrid && queueGrid.getAttribute(gridAttribute)
        || fallbackUrl;
    }

    function requestQueueBulkAssign(ticketIds, assigneeId, assigneeName) {
      var url = getQueueBulkUrl(queueBulkAssignButton, 'data-bulk-assign-url', '/admin/support/bulk-assign');
      return requestJson(url, {
        ticket_ids: ticketIds,
        ticket_revisions: getSelectedQueueTicketRevisions(),
        assignee_id: assigneeId,
        assignee_name: assigneeName
      }, {
        errorMessage: 'Queue bulk assign failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            ticket_ids: ticketIds,
            assignee_id: assigneeId,
            assignee_name: assigneeName
          };
        });
      });
    }

    function requestQueueBulkPriority(ticketIds, priorityValue, priorityLabel) {
      var url = getQueueBulkUrl(queueBulkPriorityButton, 'data-bulk-priority-url', '/admin/support/bulk-priority');
      return requestJson(url, {
        ticket_ids: ticketIds,
        ticket_revisions: getSelectedQueueTicketRevisions(),
        priority: priorityValue,
        priority_label: priorityLabel
      }, {
        errorMessage: 'Queue bulk priority failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            ticket_ids: ticketIds,
            priority: priorityValue,
            priority_label: priorityLabel
          };
        });
      });
    }

    function createQueueLabel(text, labelClass, title) {
      var label = document.createElement('span');
      label.className = 'label ' + (labelClass || 'label-default');
      label.title = title || '';
      label.textContent = text || '';
      return label;
    }

    function applyQueueTicketRevisions(rows, data) {
      var payload = data && data.data && typeof data.data === 'object' ? data.data : data || {};
      var revisions = payload.ticket_revisions && typeof payload.ticket_revisions === 'object'
        ? payload.ticket_revisions
        : {};
      rows.forEach(function (row) {
        var ticketId = row.getAttribute('data-key') || '';
        if (ticketId && typeof revisions[ticketId] !== 'undefined') {
          row.setAttribute('data-revision', String(revisions[ticketId]));
        }
      });
    }

    function applyQueueBulkAssignee(rows, assigneeName) {
      rows.forEach(function (row) {
        var assigneeCell = row.cells && row.cells[6];
        if (assigneeCell) {
          assigneeCell.textContent = '';
          var assignee = document.createElement('span');
          assignee.className = 'support-assignee-name';
          assignee.title = 'Ответственный оператор назначен массовым действием';
          assignee.textContent = assigneeName;
          assigneeCell.appendChild(assignee);
        }
        var mobileMeta = row.querySelector('.support-topic-mobile-meta');
        if (mobileMeta) {
          Array.prototype.forEach.call(mobileMeta.querySelectorAll('.label, .support-mobile-assignee-empty'), function (label) {
            if (/Без ответ|^—$/.test((label.textContent || '').trim())) {
              label.parentNode.removeChild(label);
            }
          });
          var mobileAssignee = mobileMeta.querySelector('.support-mobile-assignee');
          if (!mobileAssignee) {
            mobileAssignee = document.createElement('span');
            mobileAssignee.className = 'support-mobile-assignee';
            mobileMeta.appendChild(mobileAssignee);
          }
          mobileAssignee.textContent = assigneeName;
          mobileAssignee.title = 'Ответственный оператор';
        }
      });
    }

    function applyQueueBulkPriority(rows, priorityLabel, priorityClass) {
      rows.forEach(function (row) {
        var priorityCell = row.cells && row.cells[7];
        if (priorityCell) {
          priorityCell.textContent = '';
          priorityCell.appendChild(createQueueLabel(priorityLabel, priorityClass, 'Приоритет тикета изменен массовым действием'));
        }
        var mobileMeta = row.querySelector('.support-topic-mobile-meta');
        if (mobileMeta) {
          var mobileLabels = mobileMeta.querySelectorAll('.label');
          var mobilePriority = mobileMeta.querySelector('[data-support-mobile-priority]');
          if (!mobilePriority && mobileLabels.length > 1) {
            mobilePriority = mobileLabels[1];
          }
          if (!mobilePriority) {
            mobilePriority = document.createElement('span');
            mobileMeta.appendChild(mobilePriority);
          }
          mobilePriority.className = 'label ' + (priorityClass || 'label-default');
          mobilePriority.setAttribute('data-support-mobile-priority', 'true');
          mobilePriority.title = 'Приоритет тикета';
          mobilePriority.textContent = priorityLabel;
        }
      });
    }

    function clearQueueSelection() {
      Array.prototype.forEach.call(queueRowChecks, function (checkbox) {
        checkbox.checked = false;
      });
      syncQueueSelection();
    }

    function showPanel(name) {
      var contentName = name === 'quick-template' ? 'public-reply' : name;
      Array.prototype.forEach.call(panels, function (panel) {
        panel.classList.toggle('active', panel.getAttribute('id') === contentName);
      });
      if (templatePanel) {
        templatePanel.hidden = name !== 'quick-template';
      }
      if (composerShell) {
        composerShell.classList.toggle('is-template-mode', name === 'quick-template');
      }
      Array.prototype.forEach.call(controlButtons, function (button) {
        var panelName = button.getAttribute('data-panel');
        if (panelName) {
          button.classList.toggle('active', panelName === name);
        }
      });
    }

    function getActiveComposerMode() {
      var active = document.querySelector('.ticket-composer-control-row .js-chat-control.active');
      return active ? active.getAttribute('data-panel') : '';
    }

    function clearNewMessageState(message) {
      if (!message || !message.classList.contains('ticket-message-new')) {
        return;
      }
      message.classList.remove('ticket-message-new', 'inbox-new');
      Array.prototype.forEach.call(message.querySelectorAll('.ticket-message-state-new'), function (state) {
        state.parentNode.removeChild(state);
      });
    }

    function autoGrow(textarea) {
      if (!textarea) {
        return;
      }
      var isReplyInput = textarea.classList.contains('ticket-reply-input');
      var isNoteInput = textarea.classList.contains('ticket-note-input');
      var minHeight = isReplyInput ? 38 : (isNoteInput ? 36 : 150);
      var maxHeight = isReplyInput ? 180 : (isNoteInput ? 150 : 360);
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(Math.max(minHeight, textarea.scrollHeight), maxHeight) + 'px';
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }

    function ensureReplyPreview(label, text, targetId) {
      if (!replyPreview || !replyPreviewText) {
        return;
      }
      replyPreview.hidden = false;
      if (replyPreviewLabel) {
        replyPreviewLabel.textContent = label ? 'Ответ на: ' + label : 'Ответ на сообщение';
      }
      replyPreviewText.textContent = text || '';
      replyPreview.setAttribute('data-target-message', targetId || '');
    }

    function updateTemplateStateUi(title) {
      var hasTemplate = Boolean(title);
      if (templateChip) {
        templateChip.hidden = !hasTemplate;
        templateChip.setAttribute('title', hasTemplate ? 'Выбран шаблон: ' + title : 'В ответ подставлен выбранный шаблон');
      }
      if (templateClear) {
        templateClear.hidden = !hasTemplate;
      }
    }

    function hideTemplateCreateUi() {
      if (templateWarning) {
        templateWarning.hidden = true;
      }
      if (templatePopover) {
        templatePopover.hidden = true;
      }
    }

    function getTemplateOptions() {
      if (!templateSelect) {
        return [];
      }
      return Array.prototype.filter.call(templateSelect.options, function (option) {
        return option.value;
      });
    }

    function closeTemplateMenu() {
      if (templateMenu) {
        templateMenu.hidden = true;
        templateMenu.style.removeProperty('--ticket-template-menu-max-height');
      }
      if (templateCombobox) {
        templateCombobox.classList.remove('is-template-menu-up', 'is-template-menu-down');
      }
      if (templateToggle) {
        templateToggle.setAttribute('aria-expanded', 'false');
      }
    }

    function positionTemplateMenu() {
      if (!templateCombobox || !templateMenu || templateMenu.hidden) {
        return;
      }
      templateCombobox.classList.remove('is-template-menu-up', 'is-template-menu-down');
      templateMenu.style.removeProperty('--ticket-template-menu-max-height');
      var anchor = templateSearch || templateCombobox;
      var anchorRect = anchor.getBoundingClientRect();
      var menuRect = templateMenu.getBoundingClientRect();
      var gap = 4;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      if (anchorRect.bottom <= 0 || anchorRect.top >= viewportHeight) {
        closeTemplateMenu();
        return;
      }
      var spaceBelow = Math.max(0, viewportHeight - anchorRect.bottom - gap);
      var spaceAbove = Math.max(0, anchorRect.top - gap);
      var shouldOpenUp = spaceBelow < menuRect.height && spaceAbove > spaceBelow;
      var availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;
      var listMaxHeight = Math.max(48, Math.min(188, Math.floor(availableSpace - 2)));
      templateCombobox.classList.add(shouldOpenUp ? 'is-template-menu-up' : 'is-template-menu-down');
      templateMenu.style.setProperty('--ticket-template-menu-max-height', listMaxHeight + 'px');
    }

    function openTemplateMenu() {
      renderTemplateOptions(templateSearch ? templateSearch.value : '');
      if (templateMenu) {
        templateMenu.hidden = false;
      }
      if (templateToggle) {
        templateToggle.setAttribute('aria-expanded', 'true');
      }
      positionTemplateMenu();
    }

    function syncTemplateSearchFromSelect() {
      if (!templateSelect || !templateSearch) {
        return;
      }
      var selected = templateSelect.value ? templateSelect.options[templateSelect.selectedIndex] : null;
      templateSearch.value = selected ? selected.textContent.trim() : '';
    }

    function selectTemplateOption(value) {
      if (!templateSelect) {
        return;
      }
      templateSelect.value = value || '';
      syncTemplateSearchFromSelect();
      closeTemplateMenu();
      templateSelect.dispatchEvent(new Event('change'));
    }

    function renderTemplateOptions(query) {
      if (!templateOptionsList) {
        return;
      }
      var normalizedQuery = (query || '').toLowerCase().trim();
      var options = getTemplateOptions().filter(function (option) {
        return !normalizedQuery || option.textContent.toLowerCase().indexOf(normalizedQuery) !== -1;
      });
      templateOptionsList.innerHTML = '';
      options.forEach(function (option) {
        var item = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'ticket-template-combobox-option';
        if (templateSelect && templateSelect.value === option.value) {
          button.classList.add('is-active');
        }
        button.setAttribute('data-template-value', option.value);
        button.textContent = option.textContent.trim();
        button.title = 'Выбрать шаблон: ' + option.textContent.trim();
        item.appendChild(button);
        templateOptionsList.appendChild(item);
      });
      if (templateEmpty) {
        templateEmpty.hidden = options.length > 0;
      }
    }

    function clearAppliedTemplate() {
      if (templateSelect) {
        templateSelect.value = '';
      }
      if (templateSearch) {
        templateSearch.value = '';
      }
      updateTemplateStateUi('');
      closeTemplateMenu();
      if (replyTextarea && appliedTemplateText && replyTextarea.value === appliedTemplateText) {
        replyTextarea.value = '';
        autoGrow(replyTextarea);
      }
      appliedTemplateText = '';
      touchComposerDraft();
    }

    function dispatchTextInput(textarea) {
      if (!textarea) {
        return;
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function replaceTextareaValueUndoable(textarea, text) {
      if (!textarea) {
        return false;
      }
      textarea.focus();
      textarea.setSelectionRange(0, textarea.value.length);
      try {
        if (document.execCommand && document.execCommand('insertText', false, text)) {
          return true;
        }
      } catch (error) {
        // Fallback below keeps old browsers usable if native undo insertion is unavailable.
      }
      if (typeof textarea.setRangeText === 'function') {
        textarea.setRangeText(text, 0, textarea.value.length, 'end');
      } else {
        textarea.value = text;
      }
      dispatchTextInput(textarea);
      return false;
    }

    function syncAppliedTemplateAfterTextareaInput() {
      if (!replyTextarea || !appliedTemplateText || replyTextarea.value === appliedTemplateText) {
        return;
      }
      appliedTemplateText = '';
      if (templateSelect) {
        templateSelect.value = '';
      }
      if (templateSearch) {
        templateSearch.value = '';
      }
      updateTemplateStateUi('');
    }

    function resetReplyPreview() {
      if (replyPreview) {
        replyPreview.hidden = true;
        replyPreview.removeAttribute('data-target-message');
      }
      if (replyPreviewText) {
        replyPreviewText.textContent = '';
      }
      activeReplyContext = null;
      if (replyToInput) {
        replyToInput.value = '';
      }
      touchComposerDraft();
    }

    function getMessageText(message) {
      var body = message && message.querySelector('.ticket-message-body p');
      return body ? body.textContent.trim() : '';
    }

    function getOneLinePreview(text, maxLength) {
      var normalized = (text || '').replace(/\s+/g, ' ').trim();
      var limit = maxLength || 120;
      if (normalized.length <= limit) {
        return normalized;
      }
      return normalized.slice(0, Math.max(0, limit - 3)).trim() + '...';
    }

    function getMessageTextNode(message) {
      return message && message.querySelector('.ticket-message-body p');
    }

    function getMessageAuthor(message) {
      var author = message && message.querySelector('.username a');
      return author ? author.textContent.trim() : 'Сообщение';
    }

    function getMessageId(message) {
      if (!message) {
        return '';
      }
      return message.getAttribute('data-message-id') || (message.id || '').replace('ticket-message-', '');
    }

    function isSupportMessage(message) {
      return Boolean(message && message.getAttribute('data-author-type') === 'support');
    }

    function getStoredOperatorOriginalText(message) {
      return message ? (message.getAttribute('data-translation-original-text') || '') : '';
    }

    function getStoredOperatorTranslatedText(message) {
      return message ? (message.getAttribute('data-translation-translated-text') || '') : '';
    }

    function hasStoredOperatorTranslation(message) {
      return Boolean(
        isSupportMessage(message)
        && message.getAttribute('data-message-sent-with-translation') === 'true'
        && getStoredOperatorOriginalText(message)
        && getStoredOperatorTranslatedText(message)
      );
    }

    function syncMessageTranslationAction(message) {
      if (!message) {
        return;
      }
      Array.prototype.forEach.call(message.querySelectorAll('[data-action="translate"]'), function (button) {
        if (isSupportMessage(message) && !hasStoredOperatorTranslation(message)) {
          button.parentNode && button.parentNode.removeChild(button);
          return;
        }
        if (hasStoredOperatorTranslation(message)) {
          button.title = 'Показать исходный текст оператора';
        } else {
          button.title = 'Перевести сообщение клиента';
        }
      });
    }

    function syncAllMessageTranslationActions() {
      Array.prototype.forEach.call(document.querySelectorAll('.support-conversation-items .ticket-message'), syncMessageTranslationAction);
    }

    function getDemoTranslation(messageId, sourceText) {
      var translations = {
        '101': 'Please tell me if everything is convenient and whether you can discuss the payment details today.',
        '102': 'I checked the data and forwarded the ticket to the billing team.',
        '103': 'I added a screenshot so support can see the error on the payment page.',
        '104': 'Here is one more image with the problem.',
        '105': 'I added several images so the whole scenario is visible.',
        '106': 'I am describing the payment issue in detail so it is easier to reproduce and check.',
        '107': 'I checked the payment scenario, browser behavior, cache and repeated attempts. The issue looks intermittent, so we should verify logs and subscription state before asking the user to retry.',
        '108': 'I forwarded the payment check to colleagues and added an internal note for this case.'
      };
      return translations[messageId] || ('Demo translation: ' + (sourceText || '').slice(0, 180));
    }

    function createMessageTranslationBlock(options) {
      options = options || {};
      var block = document.createElement('div');
      var head = document.createElement('div');
      var label = document.createElement('span');
      var language = document.createElement('span');
      var text = document.createElement('div');

      block.className = options.className || 'ticket-message-translation';
      head.className = 'ticket-message-translation-head';
      if (options.title) {
        head.title = options.title;
      }
      label.className = 'ticket-message-translation-label';
      label.textContent = options.label || 'Translation';
      language.className = 'ticket-message-translation-lang';
      language.textContent = options.language || 'auto';
      text.className = 'ticket-message-translation-text';
      text.textContent = options.text || '';

      head.appendChild(label);
      head.appendChild(language);
      block.appendChild(head);
      block.appendChild(text);

      return block;
    }

    function getCsrfToken() {
      var meta = document.querySelector('meta[name="csrf-token"]');
      if (meta) {
        return meta.getAttribute('content');
      }
      if (window.yii && typeof window.yii.getCsrfToken === 'function') {
        return window.yii.getCsrfToken();
      }
      return '';
    }

    function readTicketState() {
      var state = { ticket_id: null, revision: 0, counts: {} };
      if (!ticketStateNode) {
        return state;
      }
      try {
        var parsed = JSON.parse(ticketStateNode.textContent || '{}');
        state.ticket_id = parsed.ticket_id || null;
        state.revision = Number(parsed.revision || parsed.ticket_revision || 0);
        state.counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
      } catch (error) {
        state.counts = {};
      }
      return state;
    }

    function readSupportTicketConfig() {
      var config = { translation: {} };
      if (!ticketConfigNode) {
        return config;
      }
      try {
        var parsed = JSON.parse(ticketConfigNode.textContent || '{}');
        config.translation = parsed.translation && typeof parsed.translation === 'object'
          ? parsed.translation
          : {};
      } catch (error) {
        config.translation = {};
      }
      return config;
    }

    function normalizeProfileLanguage(language, fallback) {
      var value = String(language || '').trim().toLowerCase();
      return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(value) ? value : fallback;
    }

    function getProfileTranslationLanguage(direction) {
      var translationConfig = supportTicketConfig && supportTicketConfig.translation || {};
      if (direction === 'source') {
        return normalizeProfileLanguage(translationConfig.operator_profile_language, 'ru');
      }
      return normalizeProfileLanguage(translationConfig.client_profile_language, 'en');
    }

    function resolveTranslationLanguage(languageMode, direction) {
      var mode = String(languageMode || '').trim().toLowerCase();
      if (!mode || mode === 'auto' || mode === 'client') {
        return getProfileTranslationLanguage(direction);
      }
      return normalizeProfileLanguage(mode, getProfileTranslationLanguage(direction));
    }

    function normalizeTranslationMode(languageMode) {
      var mode = String(languageMode || '').trim().toLowerCase();
      return !mode || mode === 'client' ? 'auto' : mode;
    }

    function getResolvedTranslationRoute(sourceMode, targetMode) {
      var normalizedSourceMode = normalizeTranslationMode(sourceMode);
      var normalizedTargetMode = normalizeTranslationMode(targetMode);
      return {
        sourceMode: normalizedSourceMode,
        targetMode: normalizedTargetMode,
        sourceLanguage: resolveTranslationLanguage(normalizedSourceMode, 'source'),
        targetLanguage: resolveTranslationLanguage(normalizedTargetMode, 'target')
      };
    }

    function syncProfileTranslationOptionLabels() {
      var sourceAutoOption = document.getElementById('ticket-client-translation-source-auto');
      var targetAutoOption = document.getElementById('ticket-client-translation-target-auto');
      if (sourceAutoOption) {
        sourceAutoOption.textContent = 'Авто · ' + getProfileTranslationLanguage('source');
        sourceAutoOption.title = 'Язык ответа оператора из его профиля';
      }
      if (targetAutoOption) {
        targetAutoOption.textContent = 'Авто · ' + getProfileTranslationLanguage('target');
        targetAutoOption.title = 'Язык клиента из его профиля';
      }
    }

    function getTicketRevision() {
      return Number(ticketState && ticketState.revision || 0);
    }

    function getTicketMutationPayload(payload) {
      return Object.assign({
        ticket_id: getTicketId(),
        ticket_revision: getTicketRevision()
      }, payload || {});
    }

    function getRussianCountLabel(count, one, few, many) {
      var value = Number(count || 0);
      var lastTwo = Math.abs(value) % 100;
      var lastOne = Math.abs(value) % 10;
      var word = many;
      if (lastTwo < 11 || lastTwo > 14) {
        if (lastOne === 1) {
          word = one;
        } else if (lastOne >= 2 && lastOne <= 4) {
          word = few;
        }
      }
      return value + ' ' + word;
    }

    function getTicketCountLabel(key, count) {
      if (key === 'messages') {
        return getRussianCountLabel(count, 'сообщение', 'сообщения', 'сообщений');
      }
      if (key === 'attachments') {
        return getRussianCountLabel(count, 'вложение', 'вложения', 'вложений');
      }
      return String(Number(count || 0));
    }

    function syncTicketStateCounts() {
      if (!ticketState || !ticketState.counts) {
        return;
      }
      Object.keys(ticketState.counts).forEach(function (key) {
        var count = Number(ticketState.counts[key] || 0);
        Array.prototype.forEach.call(document.querySelectorAll('[data-ticket-count-value="' + key + '"]'), function (node) {
          node.textContent = String(count);
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-ticket-count-label="' + key + '"]'), function (node) {
          node.textContent = getTicketCountLabel(key, count);
        });
      });
    }

    function setTicketCount(key, count) {
      if (!ticketState) {
        return;
      }
      ticketState.counts = ticketState.counts || {};
      ticketState.counts[key] = Math.max(0, Number(count || 0));
      syncTicketStateCounts();
    }

    function incrementTicketCount(key, delta) {
      var current = Number(ticketState && ticketState.counts && ticketState.counts[key] || 0);
      setTicketCount(key, current + Number(delta || 0));
    }

    function getResponseStatePayload(data) {
      if (!data || typeof data !== 'object') {
        return null;
      }
      if (data.ticket_state && typeof data.ticket_state === 'object') {
        return data.ticket_state;
      }
      if (data.state && typeof data.state === 'object') {
        return data.state;
      }
      return data.data && typeof data.data === 'object' ? data.data : data;
    }

    function hasServerTicketCounts(data) {
      var payload = getResponseStatePayload(data);
      return Boolean(payload && payload.counts && typeof payload.counts === 'object');
    }

    function applyTicketServerState(data) {
      var payload = getResponseStatePayload(data);
      if (!payload || !ticketState) {
        return false;
      }
      var changed = false;
      var nextRevision = payload.ticket_revision || payload.revision;
      if (typeof nextRevision !== 'undefined') {
        ticketState.revision = Number(nextRevision || 0);
        changed = true;
      }
      if (payload.counts && typeof payload.counts === 'object') {
        ticketState.counts = Object.assign({}, ticketState.counts || {}, payload.counts);
        changed = true;
      }
      if (changed) {
        syncTicketStateCounts();
      }
      return changed;
    }

    function clearSupportRequestFeedback() {
      if (!supportRequestFeedback) {
        return;
      }
      window.clearTimeout(supportRequestFeedbackTimer);
      supportRequestFeedbackTimer = null;
      supportRequestFeedback.innerHTML = '';
      supportRequestFeedback.classList.remove('is-visible');
    }

    function showSupportRequestFeedback(message, options) {
      if (!supportRequestFeedback) {
        return;
      }
      options = options || {};
      clearSupportRequestFeedback();
      var card = document.createElement('div');
      var text = document.createElement('span');
      var controls = document.createElement('span');
      var close = document.createElement('button');
      card.className = 'support-request-feedback-card ' + (options.kind === 'conflict' ? 'is-conflict' : 'is-error');
      text.className = 'support-request-feedback-text';
      text.textContent = message || 'Не удалось выполнить действие.';
      controls.className = 'support-request-feedback-controls';
      if (typeof options.action === 'function') {
        var action = document.createElement('button');
        action.type = 'button';
        action.className = 'btn btn-xs btn-default support-request-feedback-action';
        action.textContent = options.actionLabel || 'Повторить';
        action.addEventListener('click', function () {
          clearSupportRequestFeedback();
          options.action();
        });
        controls.appendChild(action);
      }
      close.type = 'button';
      close.className = 'support-request-feedback-close';
      close.title = 'Скрыть сообщение';
      close.setAttribute('aria-label', 'Скрыть сообщение');
      close.textContent = '×';
      close.addEventListener('click', clearSupportRequestFeedback);
      controls.appendChild(close);
      card.appendChild(text);
      card.appendChild(controls);
      supportRequestFeedback.appendChild(card);
      supportRequestFeedback.classList.add('is-visible');
      if (!options.persistent) {
        supportRequestFeedbackTimer = window.setTimeout(clearSupportRequestFeedback, SUPPORT_REQUEST_FEEDBACK_MS);
      }
    }

    function handleSupportRequestError(error, options) {
      options = options || {};
      if (error && Number(error.status) === 409) {
        showSupportRequestFeedback('Тикет изменён другим оператором. Обновите страницу, чтобы продолжить.', {
          kind: 'conflict',
          persistent: true,
          actionLabel: 'Обновить',
          action: function () {
            window.location.reload();
          }
        });
        return;
      }
      showSupportRequestFeedback(options.message || error && error.message || 'Не удалось выполнить действие.', {
        actionLabel: options.actionLabel || 'Повторить',
        action: options.retry
      });
    }

    function getTicketId() {
      if (ticketState && ticketState.ticket_id) {
        return String(ticketState.ticket_id);
      }
      var form = replyTextarea && replyTextarea.form;
      var action = form && form.getAttribute('action');
      if (action) {
        try {
          return new URL(action, window.location.href).searchParams.get('id') || '1';
        } catch (e) {}
      }
      return document.querySelector('.ticket-workbar-id') ? document.querySelector('.ticket-workbar-id').textContent.replace(/\D+/g, '') || '1' : '1';
    }

    function getTicketImageViewerOptions() {
      return {
        loop: true,
        buttons: ['zoom', 'slideShow', 'fullScreen', 'thumbs', 'close'],
        animationEffect: 'fade',
        transitionEffect: 'fade',
        protect: false
      };
    }

    function getTicketImageLinks(root, selector) {
      var scope = root || document;
      var links = [];
      if (scope.matches && scope.matches(selector)) {
        links.push(scope);
      }
      return links.concat(Array.prototype.slice.call(scope.querySelectorAll ? scope.querySelectorAll(selector) : []));
    }

    function normalizeMessageImageGroups(root) {
      var scope = root || document;
      var messages = [];
      if (scope.matches && scope.matches('.ticket-message')) {
        messages.push(scope);
      }
      messages = messages.concat(Array.prototype.slice.call(scope.querySelectorAll ? scope.querySelectorAll('.ticket-message') : []));
      messages.forEach(function (message) {
        var messageId = getMessageId(message) || (message.id || '').replace('ticket-message-', '') || 'local';
        var groupName = 'ticket-message-images-' + messageId;
        Array.prototype.forEach.call(message.querySelectorAll('a[data-fancybox^="ticket-message-images"]'), function (link) {
          link.setAttribute('data-fancybox', groupName);
        });
      });
    }

    function openComposerAttachmentGallery(activeLink) {
      if (!window.jQuery || !window.jQuery.fancybox || !window.jQuery.fancybox.open || !activeLink) {
        return false;
      }
      var group = activeLink.getAttribute('data-fancybox') || 'ticket-composer-attachments';
      var selector = 'a[data-fancybox="' + group + '"]';
      var groupLinks = attachmentList
        ? Array.prototype.slice.call(attachmentList.querySelectorAll(selector))
        : Array.prototype.slice.call(document.querySelectorAll(selector));
      if (!groupLinks.length) {
        return false;
      }
      var activeIndex = Math.max(0, groupLinks.indexOf(activeLink));
      var items = groupLinks.map(function (link) {
        return {
          src: link.getAttribute('href') || link.querySelector('img') && link.querySelector('img').getAttribute('src') || '',
          type: 'image',
          opts: {
            caption: link.getAttribute('data-caption') || link.title || ''
          }
        };
      }).filter(function (item) {
        return Boolean(item.src);
      });
      if (!items.length) {
        return false;
      }
      window.jQuery.fancybox.open(items, getTicketImageViewerOptions(), Math.min(activeIndex, items.length - 1));
      return true;
    }

    function initComposerAttachmentGallery(root) {
      getTicketImageLinks(root || document, 'a[data-fancybox="ticket-composer-attachments"]').forEach(function (link) {
        if (link.getAttribute('data-ticket-viewer-bound')) {
          return;
        }
        link.setAttribute('data-ticket-viewer-bound', 'true');
        link.addEventListener('click', function (event) {
          if (openComposerAttachmentGallery(link)) {
            event.preventDefault();
          }
        });
      });
    }

    function initTicketImageViewer(root) {
      if (!window.jQuery || !window.jQuery.fancybox) {
        return;
      }
      normalizeMessageImageGroups(root || document);
      initComposerAttachmentGallery(root || document);
      var $links = window.jQuery(root || document).find('[data-fancybox^="ticket-"]').filter(function () {
        return this.getAttribute('data-fancybox') !== 'ticket-composer-attachments'
          && !this.getAttribute('data-ticket-viewer-bound');
      });
      if (!$links.length) {
        return;
      }
      $links.attr('data-ticket-viewer-bound', 'true').fancybox(getTicketImageViewerOptions());
    }

    function createImageViewerLink(options) {
      options = options || {};
      var link = document.createElement('a');
      link.href = options.href || options.src || '#';
      link.className = options.className || 'ticket-image-thumb';
      link.setAttribute('data-fancybox', options.group || 'ticket-message-images');
      link.setAttribute('data-caption', options.caption || '');
      link.title = options.title || 'Открыть изображение';

      var img = document.createElement('img');
      img.src = options.src || options.href || '';
      img.alt = options.alt || options.caption || 'attachment';
      if (options.imgClassName) {
        img.className = options.imgClassName;
      }
      link.appendChild(img);

      if (options.label) {
        var label = document.createElement('span');
        label.textContent = options.label;
        link.appendChild(label);
      }

      return link;
    }

    function createMessageFileCard(attachment) {
      attachment = attachment || {};
      var link = document.createElement('a');
      var icon = document.createElement('span');
      var meta = document.createElement('span');
      var name = document.createElement('strong');
      var details = document.createElement('small');
      var fileName = attachment.name || 'attachment';
      var fileMeta = attachment.meta || attachment.type_label || 'вложение';

      link.href = attachment.url || attachment.full_url || '#';
      link.className = 'ticket-file-card';
      link.title = 'Открыть прикрепленный файл ' + fileName;
      if (!attachment.url && !attachment.full_url) {
        link.setAttribute('aria-disabled', 'true');
        link.addEventListener('click', function (event) {
          event.preventDefault();
        });
      }
      icon.className = 'ticket-file-card-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '▣';
      meta.className = 'ticket-file-card-meta';
      name.textContent = fileName;
      details.textContent = fileMeta;
      meta.appendChild(name);
      meta.appendChild(details);
      link.appendChild(icon);
      link.appendChild(meta);
      return link;
    }

    function requestJson(url, payload, options) {
      if (SUPPORT_TICKET_DEMO_MODE) return Promise.reject(new Error('Static preview uses local demo results'));
      options = options || {};
      return fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(payload || {})
      }).then(function (response) {
        return response.text().then(function (body) {
          var data = {};
          if (body) {
            try {
              data = JSON.parse(body);
            } catch (parseError) {
              var invalidResponseError = new Error(options.errorMessage || 'Invalid JSON response');
              invalidResponseError.status = response.status;
              invalidResponseError.cause = parseError;
              throw invalidResponseError;
            }
          }
          if (!response.ok) {
            var requestError = new Error(data.message || options.errorMessage || 'AJAX request failed');
            requestError.status = response.status;
            requestError.payload = data;
            throw requestError;
          }
          data = assertSuccessfulPayload(data, options.errorMessage);
          applyTicketServerState(data);
          return data;
        });
      });
    }

    function getSupportActionUrl(element, elementAttribute, formAttribute, fallbackUrl) {
      var directUrl = element && elementAttribute ? element.getAttribute(elementAttribute) : '';
      var formUrl = composerForm && formAttribute ? composerForm.getAttribute(formAttribute) : '';
      return directUrl || formUrl || fallbackUrl;
    }

    function withRequestTimeout(promise, timeoutMs, errorMessage) {
      return new Promise(function (resolve, reject) {
        var timer = window.setTimeout(function () {
          reject(new Error(errorMessage || 'Request timed out'));
        }, timeoutMs);
        promise.then(function (value) {
          window.clearTimeout(timer);
          resolve(value);
        }).catch(function (error) {
          window.clearTimeout(timer);
          reject(error);
        });
      });
    }

    function getDemoComposerTranslation(originalText) {
      var text = (originalText || '').trim();
      if (!text) {
        return '';
      }
      return '[Demo translation to client language] ' + text;
    }

    function normalizeComposerTranslationResponse(data, originalText) {
      var response = data && typeof data === 'object' ? data : {};
      var payload = data;
      if (response.data) {
        payload = response.data;
      } else if (response.result) {
        payload = response.result;
      } else if (response.translation && typeof response.translation === 'object') {
        payload = response.translation;
      }

      var payloadObject = payload && typeof payload === 'object' ? payload : {};
      var nestedTranslation = payloadObject.translation && typeof payloadObject.translation === 'object'
        ? payloadObject.translation
        : {};
      var translatedText = '';
      if (typeof payload === 'string') {
        translatedText = payload;
      } else if (typeof response.translation === 'string') {
        translatedText = response.translation;
      } else {
        translatedText = payloadObject.translated_text
          || payloadObject.translatedText
          || payloadObject.translation_text
          || payloadObject.translationText
          || payloadObject.translated
          || payloadObject.text
          || nestedTranslation.translated_text
          || nestedTranslation.translatedText
          || nestedTranslation.text
          || response.translated_text
          || response.translatedText
          || response.text
          || '';
      }

      var normalizedOriginal = payloadObject.original_text
        || payloadObject.originalText
        || nestedTranslation.original_text
        || nestedTranslation.originalText
        || response.original_text
        || response.originalText
        || originalText
        || '';

      return {
        ok: response.ok !== false,
        original_text: normalizedOriginal,
        translated_text: translatedText,
        source_language: payloadObject.source_language
          || payloadObject.sourceLanguage
          || nestedTranslation.source_language
          || nestedTranslation.sourceLanguage
          || response.source_language
          || response.sourceLanguage
          || 'auto',
        target_language: payloadObject.target_language
          || payloadObject.targetLanguage
          || payloadObject.client_language
          || payloadObject.clientLanguage
          || nestedTranslation.target_language
          || nestedTranslation.targetLanguage
          || response.target_language
          || response.targetLanguage
          || response.client_language
          || response.clientLanguage
          || 'auto',
        source_language_mode: payloadObject.source_language_mode
          || payloadObject.sourceLanguageMode
          || nestedTranslation.source_language_mode
          || nestedTranslation.sourceLanguageMode
          || response.source_language_mode
          || response.sourceLanguageMode
          || '',
        target_language_mode: payloadObject.target_language_mode
          || payloadObject.targetLanguageMode
          || nestedTranslation.target_language_mode
          || nestedTranslation.targetLanguageMode
          || response.target_language_mode
          || response.targetLanguageMode
          || '',
        provider: payloadObject.provider
          || nestedTranslation.provider
          || response.provider
          || 'backend'
      };
    }

    function getComposerTranslationPayload(originalText, options) {
      options = options || {};
      var route = getResolvedTranslationRoute(
        options.sourceLanguage || 'auto',
        options.targetLanguage || 'auto'
      );
      return {
        ticket_id: getTicketId(),
        ticket_revision: getTicketRevision(),
        original_text: originalText,
        source_language: route.sourceLanguage,
        target_language: route.targetLanguage,
        source_language_mode: route.sourceMode,
        target_language_mode: route.targetMode,
        operator_profile_language: getProfileTranslationLanguage('source'),
        client_profile_language: getProfileTranslationLanguage('target'),
        client_language: getProfileTranslationLanguage('target'),
        context: {
          reply_to_message_id: replyToInput ? replyToInput.value : '',
          template_id: templateSelect && templateSelect.value ? templateSelect.value : ''
        }
      };
    }

    function requestComposerTranslation(originalText, options) {
      options = options || {};
      var route = getResolvedTranslationRoute(
        options.sourceLanguage || 'auto',
        options.targetLanguage || 'auto'
      );
      var translateUrl = composerTranslateButton && composerTranslateButton.getAttribute('data-translate-url')
        || composerForm && composerForm.getAttribute('data-translate-url')
        || '/admin/support/composer-translate';
      var request = requestJson(translateUrl, getComposerTranslationPayload(originalText, options), {
        errorMessage: 'Composer translation failed'
      }).then(function (data) {
        var normalized = normalizeComposerTranslationResponse(data, originalText);
        normalized.source_language_mode = normalized.source_language_mode || route.sourceMode;
        normalized.target_language_mode = normalized.target_language_mode || route.targetMode;
        normalized.source_language = resolveTranslationLanguage(normalized.source_language || route.sourceLanguage, 'source');
        normalized.target_language = resolveTranslationLanguage(normalized.target_language || route.targetLanguage, 'target');
        return normalized;
      });
      return withRequestTimeout(request, COMPOSER_TRANSLATION_REQUEST_TIMEOUT_MS, 'Composer translation timed out').catch(function (error) {
        return resolveDemoFallback(error, DEMO_COMPOSER_TRANSLATION_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            original_text: originalText,
            translated_text: getDemoComposerTranslation(originalText),
            source_language: route.sourceLanguage,
            target_language: route.targetLanguage,
            source_language_mode: route.sourceMode,
            target_language_mode: route.targetMode,
            provider: 'demo'
          };
        });
      });
    }

    function requestTicketTranslationSettings(sourceLanguage, targetLanguage) {
      if (!clientTranslationSettings) {
        return Promise.resolve({ ok: true, skipped: true });
      }
      var saveUrl = clientTranslationSettings.getAttribute('data-save-url') || '/admin/support/translation-settings?id=' + encodeURIComponent(getTicketId());
      var route = getResolvedTranslationRoute(sourceLanguage || 'auto', targetLanguage || 'auto');
      return requestJson(saveUrl, getTicketMutationPayload({
        source_language: route.sourceMode,
        target_language: route.targetMode,
        resolved_source_language: route.sourceLanguage,
        resolved_target_language: route.targetLanguage,
        operator_profile_language: getProfileTranslationLanguage('source'),
        client_profile_language: getProfileTranslationLanguage('target')
      }), {
        errorMessage: 'Ticket translation settings save failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            source_language: route.sourceMode,
            target_language: route.targetMode,
            resolved_source_language: route.sourceLanguage,
            resolved_target_language: route.targetLanguage
          };
        });
      });
    }

    function persistPreparedTranslationRoute() {
      if (!activeComposerTranslation) {
        return;
      }
      var sourceLanguage = activeComposerTranslation.preparedSourceLanguage || activeComposerTranslation.sourceLanguage || 'auto';
      var targetLanguage = activeComposerTranslation.preparedTargetLanguage || activeComposerTranslation.targetLanguage || 'auto';
      requestTicketTranslationSettings(sourceLanguage, targetLanguage).catch(function (error) {
        handleSupportRequestError(error, {
          message: 'Перевод готов, но направление языка тикета не сохранено.',
          retry: persistPreparedTranslationRoute
        });
      });
    }

    function isComposerTranslationTextStale() {
      if (!activeComposerTranslation || !replyTextarea) {
        return false;
      }
      return replyTextarea.value.trim() !== (activeComposerTranslation.originalText || '').trim();
    }

    function isComposerTranslationStale() {
      if (!activeComposerTranslation) {
        return false;
      }
      var preparedSourceLanguage = activeComposerTranslation.preparedSourceLanguage
        || activeComposerTranslation.sourceLanguage
        || 'auto';
      var preparedTargetLanguage = activeComposerTranslation.preparedTargetLanguage
        || activeComposerTranslation.targetLanguage
        || 'auto';
      var preparedResolvedSourceLanguage = activeComposerTranslation.preparedResolvedSourceLanguage
        || resolveTranslationLanguage(preparedSourceLanguage, 'source');
      var preparedResolvedTargetLanguage = activeComposerTranslation.preparedResolvedTargetLanguage
        || resolveTranslationLanguage(preparedTargetLanguage, 'target');
      return isComposerTranslationTextStale()
        || (activeComposerTranslation.sourceLanguage || 'auto') !== preparedSourceLanguage
        || (activeComposerTranslation.targetLanguage || 'auto') !== preparedTargetLanguage
        || (activeComposerTranslation.resolvedSourceLanguage || resolveTranslationLanguage(activeComposerTranslation.sourceLanguage, 'source')) !== preparedResolvedSourceLanguage
        || (activeComposerTranslation.resolvedTargetLanguage || resolveTranslationLanguage(activeComposerTranslation.targetLanguage, 'target')) !== preparedResolvedTargetLanguage;
    }

    function getComposerOutgoingText() {
      if (activeComposerTranslation && !isComposerTranslationStale()) {
        return activeComposerTranslation.translatedText || '';
      }
      return replyTextarea ? replyTextarea.value.trim() : '';
    }

    function getComposerTranslationLanguageLabel(language, fallback, direction) {
      if (!language || language === 'auto' || language === 'client') {
        return direction ? resolveTranslationLanguage(language, direction) : fallback;
      }
      return language;
    }

    function getComposerTranslationRouteLabel() {
      if (!activeComposerTranslation) {
        return getProfileTranslationLanguage('source') + ' → ' + getProfileTranslationLanguage('target');
      }
      var source = activeComposerTranslation.resolvedSourceLanguage
        || resolveTranslationLanguage(activeComposerTranslation.sourceLanguage, 'source');
      var target = activeComposerTranslation.resolvedTargetLanguage
        || resolveTranslationLanguage(activeComposerTranslation.targetLanguage, 'target');
      return source + ' → ' + target;
    }

    function setSelectValueSafely(select, value, fallback) {
      if (!select) {
        return;
      }
      var nextValue = value || fallback || '';
      var hasOption = Array.prototype.some.call(select.options, function (option) {
        return option.value === nextValue;
      });
      select.value = hasOption ? nextValue : fallback;
    }

    function getSelectedTranslationSource() {
      if (clientTranslationSource && clientTranslationSource.value) {
        return clientTranslationSource.value;
      }
      return 'auto';
    }

    function getSelectedTranslationTarget() {
      if (clientTranslationTarget && clientTranslationTarget.value) {
        return clientTranslationTarget.value;
      }
      return 'auto';
    }

    function getTranslationRouteLabel(sourceLanguage, targetLanguage) {
      var source = getComposerTranslationLanguageLabel(sourceLanguage, getProfileTranslationLanguage('source'), 'source');
      var target = getComposerTranslationLanguageLabel(targetLanguage, getProfileTranslationLanguage('target'), 'target');
      return source + ' → ' + target;
    }

    function syncTranslationDirectionControls(sourceLanguage, targetLanguage) {
      sourceLanguage = normalizeTranslationMode(sourceLanguage);
      targetLanguage = normalizeTranslationMode(targetLanguage);
      setSelectValueSafely(clientTranslationSource, sourceLanguage, 'auto');
      setSelectValueSafely(clientTranslationTarget, targetLanguage, 'auto');
      if (composerTranslationRouteLabel) {
        composerTranslationRouteLabel.textContent = getTranslationRouteLabel(sourceLanguage, targetLanguage);
      }
    }

    function applyTranslationDirectionControls(sourceLanguage, targetLanguage) {
      sourceLanguage = normalizeTranslationMode(sourceLanguage);
      targetLanguage = normalizeTranslationMode(targetLanguage);
      syncTranslationDirectionControls(sourceLanguage, targetLanguage);
      if (!activeComposerTranslation) {
        return;
      }
      var preparedSourceLanguage = activeComposerTranslation.preparedSourceLanguage
        || activeComposerTranslation.sourceLanguage
        || 'auto';
      var preparedTargetLanguage = activeComposerTranslation.preparedTargetLanguage
        || activeComposerTranslation.targetLanguage
        || 'auto';
      activeComposerTranslation.preparedSourceLanguage = preparedSourceLanguage;
      activeComposerTranslation.preparedTargetLanguage = preparedTargetLanguage;
      activeComposerTranslation.sourceLanguage = sourceLanguage;
      activeComposerTranslation.targetLanguage = targetLanguage;
      activeComposerTranslation.resolvedSourceLanguage = resolveTranslationLanguage(sourceLanguage, 'source');
      activeComposerTranslation.resolvedTargetLanguage = resolveTranslationLanguage(targetLanguage, 'target');
      activeComposerTranslation.languageDirty = sourceLanguage !== preparedSourceLanguage
        || targetLanguage !== preparedTargetLanguage;
      syncComposerTranslationUi();
      syncComposerTranslationLanguageControls();
      touchComposerDraft();
      syncComposerSendSafety();
    }

    function syncComposerTranslationLanguageControls() {
      var sourceLanguage = activeComposerTranslation ? activeComposerTranslation.sourceLanguage : getSelectedTranslationSource();
      var targetLanguage = activeComposerTranslation ? activeComposerTranslation.targetLanguage : getSelectedTranslationTarget();
      syncTranslationDirectionControls(sourceLanguage, targetLanguage);
      if (composerTranslationRefresh) {
        var shouldShowRefresh = Boolean(activeComposerTranslation && isComposerTranslationStale());
        composerTranslationRefresh.hidden = !shouldShowRefresh;
        composerTranslationRefresh.classList.toggle('is-stale', shouldShowRefresh);
        composerTranslationRefresh.title = shouldShowRefresh
          ? 'Обновить перевод с направлением из таба Клиент'
          : 'Перевод уже соответствует выбранному направлению';
      }
    }

    function applyClientTranslationLanguageControls() {
      applyTranslationDirectionControls(
        clientTranslationSource ? clientTranslationSource.value || 'auto' : getSelectedTranslationSource(),
        clientTranslationTarget ? clientTranslationTarget.value || 'auto' : getSelectedTranslationTarget()
      );
    }

    function refreshComposerTranslationFromModal() {
      if (!activeComposerTranslation || !composerTranslationRefresh) {
        return;
      }
      var originalText = activeComposerTranslation.originalText || (replyTextarea ? replyTextarea.value.trim() : '');
      if (!originalText) {
        return;
      }
      var sourceLanguage = getSelectedTranslationSource() || activeComposerTranslation.sourceLanguage || 'auto';
      var targetLanguage = getSelectedTranslationTarget() || activeComposerTranslation.targetLanguage || 'auto';
      composerTranslationRefresh.disabled = true;
      composerTranslationRefresh.classList.add('is-loading');
      requestComposerTranslation(originalText, {
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage
      }).then(function (translationData) {
        setComposerTranslation(translationData);
        persistPreparedTranslationRoute();
        if (composerTranslationOriginal) {
          composerTranslationOriginal.textContent = activeComposerTranslation.originalText || '';
        }
        if (composerTranslationResult) {
          composerTranslationResult.textContent = activeComposerTranslation.translatedText || '';
        }
        syncComposerTranslationLanguageControls();
      }).catch(function (error) {
        handleSupportRequestError(error, {
          message: 'Не удалось обновить перевод.',
          retry: refreshComposerTranslationFromModal
        });
      }).finally(function () {
        composerTranslationRefresh.disabled = false;
        composerTranslationRefresh.classList.remove('is-loading');
        syncComposerTranslationLanguageControls();
      });
    }

    function syncComposerTranslationUi() {
      if (!activeComposerTranslation) {
        syncComposerTranslationLanguageControls();
        if (composerTranslateChip) {
          composerTranslateChip.classList.remove('has-translation', 'is-stale');
        }
        if (composerTranslateButton) {
          composerTranslateButton.classList.remove('has-translation', 'is-stale');
          composerTranslateButton.title = 'Перевести текст ответа на язык клиента перед отправкой';
          composerTranslateButton.setAttribute('aria-label', 'Перевести ответ');
        }
        if (composerTranslateLabel) {
          composerTranslateLabel.hidden = true;
          composerTranslateLabel.textContent = '';
        }
        if (composerTranslateClear) {
          composerTranslateClear.hidden = true;
        }
        if (composerShell) {
          composerShell.classList.remove('has-composer-translation');
          composerShell.classList.remove('has-stale-composer-translation');
        }
        return;
      }
      var isStale = isComposerTranslationStale();
      var routeLabel = getComposerTranslationRouteLabel();
      if (composerTranslateChip) {
        composerTranslateChip.classList.add('has-translation');
        composerTranslateChip.classList.toggle('is-stale', isStale);
      }
      if (composerTranslateButton) {
        composerTranslateButton.classList.add('has-translation');
        composerTranslateButton.classList.toggle('is-stale', isStale);
        composerTranslateButton.title = isStale
          ? 'Перевод устарел. Нажмите, чтобы подготовить перевод заново.'
          : 'Перевод готов. Нажмите, чтобы открыть полный текст перевода.';
        composerTranslateButton.setAttribute('aria-label', isStale ? 'Обновить перевод ответа' : 'Открыть подготовленный перевод');
      }
      if (composerTranslateLabel) {
        composerTranslateLabel.hidden = false;
        composerTranslateLabel.textContent = (isStale ? 'устарел: ' : 'готов: ') + routeLabel;
      }
      if (composerTranslateClear) {
        composerTranslateClear.hidden = false;
      }
      if (composerShell) {
        composerShell.classList.add('has-composer-translation');
        composerShell.classList.toggle('has-stale-composer-translation', isStale);
      }
      syncComposerTranslationLanguageControls();
    }

    function setComposerTranslation(translationData) {
      var normalizedTranslation = normalizeComposerTranslationResponse(
        translationData,
        replyTextarea ? replyTextarea.value.trim() : ''
      );
      if (!normalizedTranslation.translated_text && normalizedTranslation.original_text) {
        normalizedTranslation.translated_text = getDemoComposerTranslation(normalizedTranslation.original_text);
        normalizedTranslation.provider = normalizedTranslation.provider || 'demo-fallback';
      }
      if (!normalizedTranslation.translated_text) {
        return;
      }
      activeComposerTranslation = {
        originalText: normalizedTranslation.original_text || '',
        translatedText: normalizedTranslation.translated_text || '',
        sourceLanguage: normalizeTranslationMode(normalizedTranslation.source_language_mode),
        targetLanguage: normalizeTranslationMode(normalizedTranslation.target_language_mode),
        resolvedSourceLanguage: resolveTranslationLanguage(normalizedTranslation.source_language || 'auto', 'source'),
        resolvedTargetLanguage: resolveTranslationLanguage(normalizedTranslation.target_language || 'auto', 'target'),
        preparedSourceLanguage: normalizeTranslationMode(normalizedTranslation.source_language_mode),
        preparedTargetLanguage: normalizeTranslationMode(normalizedTranslation.target_language_mode),
        preparedResolvedSourceLanguage: resolveTranslationLanguage(normalizedTranslation.source_language || 'auto', 'source'),
        preparedResolvedTargetLanguage: resolveTranslationLanguage(normalizedTranslation.target_language || 'auto', 'target'),
        languageDirty: false,
        provider: normalizedTranslation.provider || ''
      };
      resetComposerUnlock();
      setComposerValidation('');
      syncComposerTranslationUi();
      touchComposerDraft();
      syncComposerSendSafety();
    }

    function resetComposerTranslation(options) {
      options = options || {};
      if (!activeComposerTranslation) {
        syncComposerTranslationUi();
        return;
      }
      var originalText = activeComposerTranslation.originalText || '';
      activeComposerTranslation = null;
      if (options.restoreOriginal && replyTextarea && replyTextarea.value.trim() === originalText.trim()) {
        replyTextarea.value = originalText;
        autoGrow(replyTextarea);
      }
      syncComposerTranslationUi();
      resetComposerUnlock();
      touchComposerDraft();
      syncComposerSendSafety();
    }

    function showComposerTranslationModal() {
      if (!composerTranslationModal || !activeComposerTranslation) {
        return;
      }
      if (composerTranslationOriginal) {
        composerTranslationOriginal.textContent = activeComposerTranslation.originalText || '';
      }
      if (composerTranslationResult) {
        composerTranslationResult.textContent = activeComposerTranslation.translatedText || '';
      }
      syncComposerTranslationLanguageControls();
      composerTranslationModal.hidden = false;
      composerTranslationModal.style.display = 'block';
      composerTranslationModal.classList.add('in');
      composerTranslationModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!composerTranslationModalBackdrop) {
        composerTranslationModalBackdrop = document.createElement('div');
        composerTranslationModalBackdrop.className = 'modal-backdrop fade in ticket-composer-translation-modal-backdrop';
        document.body.appendChild(composerTranslationModalBackdrop);
        composerTranslationModalBackdrop.addEventListener('click', hideComposerTranslationModal);
      }
    }

    function hideComposerTranslationModal() {
      if (!composerTranslationModal) {
        return;
      }
      composerTranslationModal.classList.remove('in');
      composerTranslationModal.setAttribute('aria-hidden', 'true');
      composerTranslationModal.style.display = 'none';
      composerTranslationModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (composerTranslationModalBackdrop && composerTranslationModalBackdrop.parentNode) {
        composerTranslationModalBackdrop.parentNode.removeChild(composerTranslationModalBackdrop);
      }
      composerTranslationModalBackdrop = null;
    }

    function closeComposerAttachMenu() {
      if (!composerAttach || !composerAttachMenu || !composerAttachToggle) {
        return;
      }
      composerAttach.classList.remove('open');
      composerAttach.classList.remove('is-attach-menu-up');
      composerAttach.classList.remove('is-attach-menu-down');
      composerAttachMenu.hidden = true;
      composerAttachToggle.setAttribute('aria-expanded', 'false');
    }

    function positionComposerAttachMenu() {
      if (!composerAttach || !composerAttachMenu || !composerAttachToggle || composerAttachMenu.hidden) {
        return;
      }
      composerAttach.classList.remove('is-attach-menu-up');
      composerAttach.classList.remove('is-attach-menu-down');
      var toggleRect = composerAttachToggle.getBoundingClientRect();
      var menuRect = composerAttachMenu.getBoundingClientRect();
      var gap = 8;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      var spaceBelow = viewportHeight - toggleRect.bottom - gap;
      var spaceAbove = toggleRect.top - gap;
      var shouldOpenUp = spaceBelow < menuRect.height && spaceAbove > spaceBelow;
      composerAttach.classList.add(shouldOpenUp ? 'is-attach-menu-up' : 'is-attach-menu-down');
    }

    function toggleComposerAttachMenu(forceState) {
      if (!composerAttach || !composerAttachMenu || !composerAttachToggle) {
        return;
      }
      var shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : !composerAttach.classList.contains('open');
      composerAttach.classList.toggle('open', shouldOpen);
      composerAttachMenu.hidden = !shouldOpen;
      composerAttachToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
      if (shouldOpen) {
        positionComposerAttachMenu();
      } else {
        composerAttach.classList.remove('is-attach-menu-up');
        composerAttach.classList.remove('is-attach-menu-down');
      }
    }

    function chooseComposerAttachment(kind) {
      if (!fileInput) {
        return;
      }
      closeComposerAttachMenu();
      fileInput.value = '';
      fileInput.setAttribute('data-attachment-kind', kind || 'file');
      if (kind === 'image') {
        fileInput.setAttribute('accept', 'image/*');
        fileInput.title = 'Выберите изображение или скриншот для прикрепления к ответу';
      } else {
        fileInput.removeAttribute('accept');
        fileInput.title = 'Выберите файл для прикрепления к ответу';
      }
      fileInput.click();
    }

    function requestFormData(url, formData, options) {
      if (SUPPORT_TICKET_DEMO_MODE) return Promise.reject(new Error('Static preview uses local demo results'));
      options = options || {};
      return fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-Token': getCsrfToken()
        },
        body: formData
      }).then(function (response) {
        return response.text().then(function (body) {
          var data = {};
          if (body) {
            try {
              data = JSON.parse(body);
            } catch (parseError) {
              var invalidResponseError = new Error(options.errorMessage || 'Invalid upload response');
              invalidResponseError.status = response.status;
              throw invalidResponseError;
            }
          }
          if (!response.ok) {
            var uploadError = new Error(data.message || options.errorMessage || 'Upload request failed');
            uploadError.status = response.status;
            uploadError.payload = data;
            throw uploadError;
          }
          data = assertSuccessfulPayload(data, options.errorMessage);
          applyTicketServerState(data);
          return data;
        });
      });
    }

    function getActiveComposerModeForDraft() {
      if (activeEditContext) {
        return 'edit';
      }
      if (replyToInput && replyToInput.value) {
        return 'reply';
      }
      return 'direct';
    }

    function getComposerDraftPayload() {
      var selectedTemplate = templateSelect && templateSelect.value ? templateSelect.options[templateSelect.selectedIndex] : null;
      var preparedSourceLanguage = activeComposerTranslation
        ? activeComposerTranslation.preparedSourceLanguage || activeComposerTranslation.sourceLanguage || 'auto'
        : '';
      var preparedTargetLanguage = activeComposerTranslation
        ? activeComposerTranslation.preparedTargetLanguage || activeComposerTranslation.targetLanguage || 'auto'
        : '';
      return {
        ticket_id: getTicketId(),
        composer_mode: getActiveComposerModeForDraft(),
        text: replyTextarea ? replyTextarea.value : '',
        reply_to_message_id: replyToInput ? replyToInput.value : '',
        reply_label: replyPreviewLabel ? replyPreviewLabel.textContent : '',
        reply_text: replyPreviewText ? replyPreviewText.textContent : '',
        template_id: selectedTemplate ? selectedTemplate.value : '',
        template_title: selectedTemplate ? selectedTemplate.textContent.trim() : '',
        template_text: appliedTemplateText || '',
        translation_original_text: activeComposerTranslation ? activeComposerTranslation.originalText : '',
        translation_translated_text: activeComposerTranslation ? activeComposerTranslation.translatedText : '',
        translation_source_language: preparedSourceLanguage,
        translation_target_language: preparedTargetLanguage,
        translation_prepared_source_language: preparedSourceLanguage,
        translation_prepared_target_language: preparedTargetLanguage,
        translation_prepared_resolved_source_language: activeComposerTranslation ? activeComposerTranslation.preparedResolvedSourceLanguage || resolveTranslationLanguage(preparedSourceLanguage, 'source') : '',
        translation_prepared_resolved_target_language: activeComposerTranslation ? activeComposerTranslation.preparedResolvedTargetLanguage || resolveTranslationLanguage(preparedTargetLanguage, 'target') : '',
        translation_is_stale: activeComposerTranslation ? isComposerTranslationTextStale() : false,
        editing_message_id: activeEditContext ? activeEditContext.messageId : '',
        draft_client_nonce: draftState.nonce,
        draft_revision: draftState.revision + 1,
        draft_updated_at: new Date().toISOString()
      };
    }

    function getComposerDraftFingerprint(payload) {
      return JSON.stringify({
        ticket_id: payload.ticket_id,
        composer_mode: payload.composer_mode,
        text: payload.text,
        reply_to_message_id: payload.reply_to_message_id,
        template_id: payload.template_id,
        translation_original_text: payload.translation_original_text,
        translation_translated_text: payload.translation_translated_text,
        translation_source_language: payload.translation_source_language,
        translation_target_language: payload.translation_target_language,
        translation_prepared_source_language: payload.translation_prepared_source_language,
        translation_prepared_target_language: payload.translation_prepared_target_language,
        translation_prepared_resolved_source_language: payload.translation_prepared_resolved_source_language,
        translation_prepared_resolved_target_language: payload.translation_prepared_resolved_target_language,
        editing_message_id: payload.editing_message_id
      });
    }

    function getLocalDraftStorageKey(ticketId) {
      return 'supportTicket.composerDraft.' + (ticketId || getTicketId() || 'unknown');
    }

    function setDraftStatus(text) {
      if (!draftStatus) {
        return;
      }
      draftStatus.textContent = text || 'Ctrl+Enter';
    }

    function requestComposerDraftSave(payload) {
      var saveUrl = getSupportActionUrl(null, '', 'data-draft-save-url', '/admin/support/draft-save');
      return requestJson(saveUrl, payload, {
        errorMessage: 'Draft save failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, 0, function () {
          return { ok: true, demo: true };
        });
      });
    }

    function setComposerValidation(message) {
      var inputRow = document.querySelector('.field-message-message');
      if (composerHelp) {
        composerHelp.textContent = message || '';
      }
      if (inputRow) {
        inputRow.classList.toggle('has-error', Boolean(message));
      }
      if (message && replyTextarea) {
        replyTextarea.focus();
      }
    }

    function hasComposerAttachments() {
      return Boolean(attachmentList && attachmentList.children.length);
    }

    function hasPendingAttachmentUploads() {
      return Boolean(attachmentList && attachmentList.querySelector('[data-upload-status="uploading"]'));
    }

    function hasFailedAttachmentUploads() {
      return Boolean(attachmentList && attachmentList.querySelector('[data-upload-status="failed"]'));
    }

    function hasComposerSendContent() {
      return Boolean(
        (replyTextarea && replyTextarea.value.trim())
        || hasComposerAttachments()
      );
    }

    function hasComposerSendReadyPayload() {
      return Boolean(hasComposerSendContent() && !hasPendingAttachmentUploads() && !hasFailedAttachmentUploads());
    }

    function getComposerSendSafetyState() {
      if (draftState.isSending) {
        return 'sending';
      }
      if (!hasComposerSendReadyPayload()) {
        return 'locked';
      }
      return draftState.sendState || 'locked';
    }

    function setComposerSendSafetyState(state, remaining) {
      draftState.sendState = ['unlocking', 'ready'].indexOf(state) !== -1 ? state : 'locked';
      draftState.unlockRemaining = remaining || 0;
      if (composerShell) {
        composerShell.setAttribute('data-composer-send-state', draftState.sendState);
      }
      syncComposerSendSafety();
    }

    function resetComposerUnlock() {
      window.clearInterval(draftState.unlockTimer);
      draftState.unlockTimer = null;
      setComposerSendSafetyState('locked');
    }

    function startComposerUnlock() {
      if (!hasComposerSendReadyPayload() || draftState.isSending) {
        syncComposerSendSafety();
        return;
      }
      window.clearInterval(draftState.unlockTimer);
      setComposerSendSafetyState('unlocking', draftState.unlockSeconds);
      draftState.unlockTimer = window.setInterval(function () {
          draftState.unlockRemaining -= 1;
          if (draftState.unlockRemaining <= 0) {
            window.clearInterval(draftState.unlockTimer);
            draftState.unlockTimer = null;
            setComposerSendSafetyState('ready');
            return;
          }
          syncComposerSendSafety();
      }, COMPOSER_SEND_UNLOCK_TICK_MS);
    }

    function syncComposerSendSafety() {
      if (!sendButton) {
        return;
      }
      var state = getComposerSendSafetyState();
      var hasReadyPayload = hasComposerSendReadyPayload();
      var isReady = state === 'ready';
      var isSending = state === 'sending';
      var isUnlocking = state === 'unlocking';
      var titleMap = {
        locked: hasPendingAttachmentUploads()
          ? 'Дождитесь загрузки вложений перед отправкой'
          : hasFailedAttachmentUploads()
            ? 'Удалите не загруженное вложение или прикрепите файл заново'
            : hasReadyPayload
              ? 'Нажмите, чтобы разблокировать отправку'
              : 'Напишите сообщение или прикрепите файл, чтобы разблокировать отправку',
        unlocking: 'Разблокировка отправки...',
        ready: activeEditContext ? 'Сохранить изменение сообщения' : 'Отправить публичный ответ пользователю и оставить тикет открытым',
        sending: 'Отправляем сообщение...'
      };

      sendButton.disabled = isSending || !hasReadyPayload;
      sendButton.classList.toggle('is-disabled', !hasReadyPayload && !isSending);
      sendButton.classList.toggle('is-sending', isSending);
      sendButton.classList.toggle('is-unlocking', isUnlocking);
      sendButton.setAttribute('data-send-safety-state', state);
      sendButton.setAttribute('aria-disabled', String(sendButton.disabled));
      sendButton.title = titleMap[state] || titleMap.locked;
      if (isUnlocking) {
        sendButton.innerHTML = '<span class="ticket-send-countdown">' + draftState.unlockRemaining + '</span><span class="sr-only">Разблокировка отправки</span>';
      } else if (state === 'locked') {
        sendButton.innerHTML = '<span class="safe-lock-icon" aria-hidden="true"></span><span class="sr-only">Разблокировать отправку</span>';
      } else {
        sendButton.innerHTML = '<span class="ui-icon" aria-hidden="true">↑</span><span class="sr-only">Отправить</span>';
      }
      if (composerShell) {
        composerShell.classList.toggle('ready', isReady);
        composerShell.classList.toggle('is-send-locked', state === 'locked');
        composerShell.classList.toggle('is-send-unlocking', isUnlocking);
        composerShell.classList.toggle('is-send-ready', state === 'ready');
        composerShell.classList.toggle('is-send-sending', state === 'sending');
        composerShell.setAttribute('data-composer-send-state', state);
      }
    }

    function getComposerSendPayload() {
      var selectedTemplate = templateSelect && templateSelect.value ? templateSelect.options[templateSelect.selectedIndex] : null;
      var attachmentItems = attachmentList ? Array.prototype.map.call(attachmentList.querySelectorAll('.ticket-attachment-item'), function (item, index) {
        var name = item.querySelector('.ticket-attachment-meta strong');
        var meta = item.querySelector('.ticket-attachment-meta small');
        var thumb = item.querySelector('.ticket-attachment-thumb');
        var previewLink = item.querySelector('.ticket-attachment-preview-link');
        var isImage = Boolean(thumb && thumb.tagName === 'IMG');
        var attachmentName = name ? name.textContent.trim() : 'attachment';
        var previewUrl = isImage ? (thumb.getAttribute('src') || '') : '';
        var fileUrl = item.getAttribute('data-file-url') || (previewLink ? (previewLink.getAttribute('href') || previewUrl) : '#');
        return {
          client_id: 'attachment-' + index,
          upload_id: item.getAttribute('data-upload-id') || '',
          upload_status: item.getAttribute('data-upload-status') || 'local',
          kind: isImage ? 'image' : 'file',
          name: attachmentName,
          meta: getAttachmentMetaPayload(meta),
          preview_url: previewUrl,
          url: fileUrl,
          full_url: fileUrl
        };
      }) : [];
      return {
        ticket_id: getTicketId(),
        ticket_revision: getTicketRevision(),
        text: getComposerOutgoingText(),
        original_text: replyTextarea ? replyTextarea.value.trim() : '',
        reply_to_message_id: replyToInput ? replyToInput.value : '',
        template_id: selectedTemplate ? selectedTemplate.value : '',
        template_title: selectedTemplate ? selectedTemplate.textContent.trim() : '',
        translation: activeComposerTranslation ? {
          original_text: activeComposerTranslation.originalText || '',
          translated_text: activeComposerTranslation.translatedText || '',
          source_language: activeComposerTranslation.resolvedSourceLanguage || resolveTranslationLanguage(activeComposerTranslation.sourceLanguage, 'source'),
          target_language: activeComposerTranslation.resolvedTargetLanguage || resolveTranslationLanguage(activeComposerTranslation.targetLanguage, 'target'),
          source_language_mode: activeComposerTranslation.sourceLanguage || 'auto',
          target_language_mode: activeComposerTranslation.targetLanguage || 'auto',
          operator_profile_language: getProfileTranslationLanguage('source'),
          client_profile_language: getProfileTranslationLanguage('target'),
          provider: activeComposerTranslation.provider || '',
          is_stale: isComposerTranslationStale()
        } : null,
        attachments: attachmentItems,
        composer_send_state: getComposerSendSafetyState(),
        confirmed_to_send: getComposerSendSafetyState() === 'ready',
        client_nonce: 'message-' + Date.now() + '-' + Math.random().toString(16).slice(2)
      };
    }

    function requestTicketMessageSend(payload) {
      var sendUrl = composerForm && composerForm.getAttribute('data-send-url') || '/admin/support/message-send';
      return requestJson(sendUrl, payload, {
        errorMessage: 'Message send failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, 0, function () {
          return {
            ok: true,
            demo: true,
            message: {
              id: 'demo-' + Date.now(),
              author_name: 'Chapajev Wasil',
              author_type: 'support',
              text: payload.text,
              created_at_label: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              created_at_title: new Date().toLocaleString('ru-RU'),
              read_state: 'sent',
              translation: payload.translation || null,
              attachments: payload.attachments || []
            }
          };
        });
      });
    }

    function getAttachmentKindSummary(attachments) {
      var hasImage = false;
      var hasFile = false;
      (attachments || []).forEach(function (attachment) {
        if (attachment.preview_url || attachment.kind === 'image') {
          hasImage = true;
        } else {
          hasFile = true;
        }
      });
      if (hasImage && hasFile) {
        return 'mixed';
      }
      if (hasImage) {
        return 'image';
      }
      if (hasFile) {
        return 'file';
      }
      return 'none';
    }

    function renderSentMessage(messageData) {
      if (!threadTimeline || !messageData) {
        return;
      }
      var message = document.createElement('div');
      var messageId = messageData.id || ('demo-' + Date.now());
      var attachmentKind = getAttachmentKindSummary(messageData.attachments || []);
      var supportImage = document.querySelector('.ticket-message-agent .direct-chat-img');
      var avatarSrc = supportImage ? supportImage.getAttribute('src') : 'https://confideline.com/content/themes/youdate/static/images/support/logo-in-support.png';
      message.className = 'ticket-message ticket-message-agent direct-chat-msg read';
      message.id = 'ticket-message-' + messageId;
      message.setAttribute('data-message-id', messageId);
      message.setAttribute('data-author-type', 'support');
      message.setAttribute('data-message-author', 'operator');
      message.setAttribute('data-can-delete', 'true');
      message.setAttribute('data-can-edit', 'true');
      message.setAttribute('data-message-kind', attachmentKind !== 'none' ? 'mixed' : 'text');
      message.setAttribute('data-message-has-text', messageData.text ? 'true' : 'false');
      message.setAttribute('data-attachment-kind', attachmentKind);
      message.setAttribute('data-attachment-count', String(messageData.attachments ? messageData.attachments.length : 0));
      message.setAttribute('data-message-viewed-by-client', 'false');
      message.setAttribute('data-message-edited', 'false');
      if (messageData.translation && messageData.translation.original_text && messageData.translation.translated_text) {
        message.setAttribute('data-message-sent-with-translation', 'true');
        message.setAttribute('data-translation-original-text', messageData.translation.original_text || '');
        message.setAttribute('data-translation-translated-text', messageData.translation.translated_text || '');
        message.setAttribute('data-translation-source-language', messageData.translation.source_language || 'auto');
        message.setAttribute('data-translation-target-language', messageData.translation.target_language || 'auto');
      }

      var info = document.createElement('div');
      info.className = 'user-block direct-chat-info clearfix';
      info.innerHTML = '<span class="username"><a href="https://confideline.com/en/admin/user/info?id=1"></a></span><span class="description"><time></time> <span class="ticket-read-state ticket-read-sent" title="Сообщение отправлено, клиент еще не прочитал">✓</span></span>';
      info.querySelector('.username a').textContent = messageData.author_name || 'Chapajev Wasil';
      var time = info.querySelector('time');
      time.textContent = messageData.created_at_label || '';
      time.setAttribute('title', messageData.created_at_title || '');

      var avatar = document.createElement('img');
      avatar.className = 'direct-chat-img img-circle img-bordered-sm';
      avatar.src = avatarSrc;
      avatar.alt = 'support image';

      var bubble = document.createElement('div');
      bubble.className = 'ticket-message-body direct-chat-text';
      if (activeReplyContext) {
        var quote = document.createElement('button');
        quote.type = 'button';
        quote.className = 'ticket-reply-quote';
        quote.setAttribute('data-reply-target', activeReplyContext.messageId || '');
        quote.title = 'Перейти к сообщению, на которое отправлен ответ';
        quote.innerHTML = '<strong></strong><span></span>';
        quote.querySelector('strong').textContent = activeReplyContext.author || 'Сообщение';
        quote.querySelector('span').textContent = getOneLinePreview(activeReplyContext.text, 110);
        bubble.appendChild(quote);
      }
      if (messageData.text) {
        var text = document.createElement('p');
        text.textContent = messageData.text;
        bubble.appendChild(text);
      }
      var media = null;
      (messageData.attachments || []).forEach(function (attachment) {
        if (!media) {
          media = document.createElement('div');
          media.className = 'media-container';
        }
        if (attachment.preview_url) {
          media.appendChild(createImageViewerLink({
            href: attachment.url || attachment.full_url || attachment.preview_url,
            src: attachment.preview_url,
            caption: attachment.name || 'attachment',
            alt: attachment.name || 'attachment',
            title: 'Открыть изображение ' + (attachment.name || ''),
            group: 'ticket-message-images',
            className: 'ticket-image-thumb ticket-message-image-viewer'
          }));
          return;
        }
        media.appendChild(createMessageFileCard(attachment));
      });
      if (media) {
        bubble.appendChild(media);
      }

      var actions = document.createElement('div');
      actions.className = 'ticket-message-tools message-actions-row';
      var translateActionHtml = messageData.translation && messageData.translation.original_text && messageData.translation.translated_text
        ? '<button type="button" class="btn btn-default btn-xs ticket-message-tool ticket-message-tool-icon ticket-message-translate-action" data-action="translate" title="Показать исходный текст оператора"><span class="ui-icon" aria-hidden="true">A↗</span><span class="sr-only">Оригинал</span></button>'
        : '';
      actions.innerHTML = '<button type="button" class="btn btn-default btn-xs ticket-message-tool" data-action="reply" title="Ответить на это сообщение"><span class="ui-icon" aria-hidden="true">↩</span><span>Ответить</span></button>' + translateActionHtml + '<div class="btn-group ticket-message-more"><button type="button" class="btn btn-default btn-xs ticket-message-tool ticket-message-more-toggle" title="Открыть дополнительные действия" aria-expanded="false"><span class="ui-icon" aria-hidden="true">•••</span><span class="sr-only">Действия</span></button><ul class="dropdown-menu ticket-message-menu"><li><button type="button" class="ticket-message-menu-action" data-action="pin" title="Закрепить или открепить сообщение"><span class="ui-icon" aria-hidden="true">⌖</span> Закрепить</button></li><li><button type="button" class="ticket-message-menu-action" data-action="copy" title="Скопировать текст сообщения"><span class="ui-icon" aria-hidden="true">⧉</span> Копировать</button></li><li><button type="button" class="ticket-message-menu-action" data-action="edit" title="Изменить свое непрочитанное сообщение"><span class="ui-icon" aria-hidden="true">✎</span> Изменить</button></li><li><button type="button" class="ticket-message-menu-action ticket-message-menu-danger" data-action="delete" title="Удалить свое сообщение"><span class="ui-icon" aria-hidden="true">×</span> Удалить</button></li></ul></div>';

      message.appendChild(info);
      message.appendChild(avatar);
      message.appendChild(bubble);
      message.appendChild(actions);
      threadTimeline.appendChild(message);
      syncMessagePinActions(message);
      syncMessageTranslationAction(message);
      initTicketImageViewer(message);
      message.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function clearComposerAfterSend() {
      if (replyTextarea) {
        replyTextarea.value = '';
        autoGrow(replyTextarea);
      }
      resetComposerUnlock();
      resetReplyPreview();
      clearAppliedTemplate();
      resetComposerTranslation();
      if (attachmentList) {
        attachmentList.innerHTML = '';
      }
      if (fileInput) {
        fileInput.value = '';
      }
      updateAttachmentState();
      clearComposerDraft();
      setComposerValidation('');
      showPanel('public-reply');
      syncComposerSendSafety();
    }

    function sendComposerMessage() {
      if (!replyTextarea) {
        return;
      }
      if (draftState.isSending) {
        return;
      }
      var payload = getComposerSendPayload();
      if (!payload.text && !hasComposerAttachments()) {
        setComposerValidation('Напишите сообщение или прикрепите файл перед отправкой.');
        return;
      }
      if (hasPendingAttachmentUploads()) {
        setComposerValidation('Дождитесь загрузки вложений перед отправкой сообщения.');
        return;
      }
      if (hasFailedAttachmentUploads()) {
        setComposerValidation('Удалите не загруженное вложение или прикрепите файл заново.');
        return;
      }
      if (activeComposerTranslation && isComposerTranslationStale()) {
        setComposerValidation('');
        syncComposerTranslationUi();
        if (replyTextarea) {
          replyTextarea.focus();
        }
        return;
      }
      var safetyState = getComposerSendSafetyState();
      if (safetyState === 'locked') {
        startComposerUnlock();
        return;
      }
      if (safetyState === 'unlocking') {
        return;
      }
      if (activeEditContext) {
        saveMessageEdit();
        return;
      }
      setComposerValidation('');
      draftState.isSending = true;
      syncComposerSendSafety();
      requestTicketMessageSend(payload).then(function (data) {
        renderSentMessage(data && data.message ? data.message : payload);
        if (!hasServerTicketCounts(data)) {
          incrementTicketCount('messages', 1);
          incrementTicketCount('attachments', payload.attachments ? payload.attachments.length : 0);
        }
        clearComposerAfterSend();
      }).catch(function (error) {
        setComposerValidation('');
        handleSupportRequestError(error, {
          message: 'Не удалось отправить сообщение. Проверьте соединение.',
          retry: sendComposerMessage
        });
      }).finally(function () {
        draftState.isSending = false;
        syncComposerSendSafety();
      });
    }

    function isComposerSendShortcut(event) {
      return Boolean(event && (event.ctrlKey || event.metaKey) && event.key === 'Enter');
    }

    function handleComposerSendShortcut(event) {
      if (!isComposerSendShortcut(event)) {
        return false;
      }
      if (event.target && event.target.closest && event.target.closest('#internal-note')) {
        return false;
      }
      event.preventDefault();
      event.stopPropagation();
      sendComposerMessage();
      return true;
    }

    function removeLocalComposerDraft(ticketId) {
      try {
        window.localStorage && window.localStorage.removeItem(getLocalDraftStorageKey(ticketId));
      } catch (e) {}
      draftState.lastLocalFingerprint = '';
      draftState.lastServerFingerprint = '';
    }

    function saveLocalComposerDraft(options) {
      options = options || {};
      if (draftState.isSending) {
        return;
      }
      var payload = getComposerDraftPayload();
      var hasContent = Boolean(payload.text || payload.reply_to_message_id || payload.template_id || payload.editing_message_id);
      if (!hasContent) {
        removeLocalComposerDraft(payload.ticket_id);
        return;
      }
      var fingerprint = getComposerDraftFingerprint(payload);
      if (!options.force && fingerprint === draftState.lastLocalFingerprint) {
        return;
      }
      try {
        window.localStorage && window.localStorage.setItem(getLocalDraftStorageKey(payload.ticket_id), JSON.stringify(Object.assign({}, payload, {
          draft_local_saved_at: new Date().toISOString()
        })));
        draftState.lastLocalFingerprint = fingerprint;
        setDraftStatus('Черновик сохранен');
      } catch (e) {}
    }

    function scheduleLocalComposerDraftSave() {
      window.clearTimeout(draftState.localAutosaveTimer);
      draftState.localAutosaveTimer = window.setTimeout(function () {
        saveLocalComposerDraft();
      }, draftState.localAutosaveMs);
    }

    function saveComposerDraft(options) {
      options = options || {};
      if (draftState.isSending) {
        return Promise.resolve({ skipped: true, reason: 'sending' });
      }
      var payload = getComposerDraftPayload();
      if (!payload.text && !payload.reply_to_message_id && !payload.template_id && !payload.editing_message_id) {
        return Promise.resolve({ skipped: true, reason: 'empty' });
      }
      var fingerprint = getComposerDraftFingerprint(payload);
      if (!options.force && fingerprint === draftState.lastServerFingerprint) {
        return Promise.resolve({ skipped: true, reason: 'unchanged' });
      }
      draftState.lastServerFingerprint = fingerprint;
      draftState.revision += 1;
      payload.draft_revision = draftState.revision;
      if (composerShell) {
        composerShell.classList.add('is-draft-saving');
      }
      setDraftStatus('Сохраняем...');
      return requestComposerDraftSave(payload).finally(function () {
        if (composerShell) {
          composerShell.classList.remove('is-draft-saving');
          composerShell.classList.add('is-draft-saved');
          window.setTimeout(function () {
            composerShell.classList.remove('is-draft-saved');
          }, COMPOSER_DRAFT_SAVED_FEEDBACK_MS);
        }
        setDraftStatus('Черновик сохранен');
      });
    }

    function clearComposerDraft() {
      window.clearTimeout(draftState.localAutosaveTimer);
      removeLocalComposerDraft(getTicketId());
      setDraftStatus('Ctrl+Enter');
    }

    function restoreLocalComposerDraft() {
      if (!replyTextarea || replyTextarea.value.trim()) {
        return;
      }
      var ticketId = getTicketId();
      var savedDraft = null;
      try {
        savedDraft = JSON.parse((window.localStorage && window.localStorage.getItem(getLocalDraftStorageKey(ticketId))) || 'null');
      } catch (e) {
        savedDraft = null;
      }
      if (!savedDraft || (!savedDraft.text && !savedDraft.reply_to_message_id && !savedDraft.template_id && !savedDraft.translation_original_text)) {
        return;
      }
      var savedAt = Date.parse(savedDraft.draft_local_saved_at || '');
      if (savedAt && Date.now() - savedAt > COMPOSER_LOCAL_DRAFT_MAX_AGE_MS) {
        removeLocalComposerDraft(ticketId);
        return;
      }
      if (savedDraft.reply_to_message_id) {
        activeReplyContext = {
          author: (savedDraft.reply_label || '').replace(/^Ответ на:\s*/i, '') || 'Сообщение',
          text: savedDraft.reply_text || '',
          messageId: savedDraft.reply_to_message_id
        };
        if (replyToInput) {
          replyToInput.value = savedDraft.reply_to_message_id;
        }
        ensureReplyPreview(activeReplyContext.author, activeReplyContext.text, activeReplyContext.messageId);
      }
      if (savedDraft.template_id && templateSelect) {
        templateSelect.value = savedDraft.template_id;
        appliedTemplateText = savedDraft.template_text || '';
        syncTemplateSearchFromSelect();
        renderTemplateOptions(templateSearch ? templateSearch.value : '');
        updateTemplateStateUi(savedDraft.template_title || savedDraft.template_id);
      }
      replyTextarea.value = savedDraft.text || '';
      autoGrow(replyTextarea);
      if (savedDraft.translation_original_text || savedDraft.translation_translated_text) {
        var restoredSourceLanguage = savedDraft.translation_prepared_source_language
          || savedDraft.translation_source_language
          || 'auto';
        var restoredTargetLanguage = normalizeTranslationMode(savedDraft.translation_prepared_target_language
          || savedDraft.translation_target_language
          || 'auto');
        activeComposerTranslation = {
          originalText: savedDraft.translation_original_text || '',
          translatedText: savedDraft.translation_translated_text || savedDraft.text || '',
          sourceLanguage: restoredSourceLanguage,
          targetLanguage: restoredTargetLanguage,
          preparedSourceLanguage: restoredSourceLanguage,
          preparedTargetLanguage: restoredTargetLanguage,
          resolvedSourceLanguage: resolveTranslationLanguage(restoredSourceLanguage, 'source'),
          resolvedTargetLanguage: resolveTranslationLanguage(restoredTargetLanguage, 'target'),
          preparedResolvedSourceLanguage: savedDraft.translation_prepared_resolved_source_language || resolveTranslationLanguage(restoredSourceLanguage, 'source'),
          preparedResolvedTargetLanguage: savedDraft.translation_prepared_resolved_target_language || resolveTranslationLanguage(restoredTargetLanguage, 'target'),
          languageDirty: false,
          provider: 'draft'
        };
        syncComposerTranslationUi();
      }
      draftState.restored = true;
      draftState.lastLocalFingerprint = getComposerDraftFingerprint(savedDraft);
      setDraftStatus('Черновик восстановлен');
      syncComposerSendSafety();
    }

    function touchComposerDraft() {
      if (draftState.sendState !== 'locked') {
        resetComposerUnlock();
      } else {
        syncComposerSendSafety();
      }
      scheduleLocalComposerDraftSave();
    }

    function requestMessageTranslation(message, sourceText) {
      var messageId = getMessageId(message);
      var translateUrl = getSupportActionUrl(message, 'data-translate-url', 'data-message-translate-url', '/admin/support/message-translate');
      var payload = getTicketMutationPayload({
        message_id: messageId,
        source_text: sourceText,
        target_lang: getProfileTranslationLanguage('source')
      });
      return requestJson(translateUrl, payload, {
        errorMessage: 'Translation request failed'
      }).then(function (data) {
        return data.translation || data.text || '';
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_MESSAGE_TRANSLATION_DELAY_MS, function () {
          return getDemoTranslation(messageId, sourceText);
        });
      });
    }

    function requestMessageEdit(message, nextText, previousText) {
      var messageId = getMessageId(message);
      var editUrl = getSupportActionUrl(message, 'data-edit-url', 'data-message-edit-url', '/admin/support/message-edit');
      return requestJson(editUrl, getTicketMutationPayload({
        message_id: messageId,
        text: nextText,
        previous_text: previousText
      }), {
        method: 'PATCH',
        errorMessage: 'Message edit failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_MESSAGE_EDIT_DELAY_MS, function () {
          return { ok: true, demo: true, message_id: messageId, text: nextText, previous_text: previousText };
        });
      });
    }

    function requestMessagePin(message, shouldPin) {
      var messageId = getMessageId(message);
      var url = getSupportActionUrl(message, 'data-pin-url', 'data-message-pin-url', '/admin/support/message-pin');
      return requestJson(url, {
        ticket_id: getTicketId(),
        ticket_revision: getTicketRevision(),
        message_id: messageId,
        is_pinned: shouldPin
      }, {
        errorMessage: 'Message pin failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_MESSAGE_ACTION_DELAY_MS, function () {
          return { ok: true, demo: true, message_id: messageId, is_pinned: shouldPin };
        });
      });
    }

    function requestMessageDelete(message) {
      var messageId = getMessageId(message);
      var url = getSupportActionUrl(message, 'data-delete-url', 'data-message-delete-url', '/admin/support/message-delete');
      return requestJson(url, {
        ticket_id: getTicketId(),
        ticket_revision: getTicketRevision(),
        message_id: messageId
      }, {
        errorMessage: 'Message delete failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_MESSAGE_ACTION_DELAY_MS, function () {
          return { ok: true, demo: true, message_id: messageId, deleted_by: 'current_operator' };
        });
      });
    }

    function requestInternalNoteCreate(text) {
      var url = noteTextarea && noteTextarea.getAttribute('data-note-url') || '/admin/support/note-create';
      return requestJson(url, getTicketMutationPayload({
        body: text
      }), {
        errorMessage: 'Internal note create failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_NOTE_CREATE_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            note: {
              id: 'demo-note-' + Date.now(),
              author_name: 'admin',
              created_at_label: 'только что',
              title: 'Новая заметка',
              body: text
            }
          };
        });
      });
    }

    function requestQuickTemplateCreate(payload) {
      var url = templateSave && templateSave.getAttribute('data-template-create-url') || '/admin/support/template-create';
      return requestJson(url, payload, {
        errorMessage: 'Quick template create failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TEMPLATE_CREATE_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            template: {
              id: 'custom-' + Date.now(),
              title: payload.title,
              body: payload.body,
              source_message_id: payload.source_message_id || ''
            }
          };
        });
      });
    }

    function requestAttachmentUpload(file, clientId) {
      var url = attachmentZone && attachmentZone.getAttribute('data-upload-url') || '/admin/support/attachment-upload';
      var formData = new FormData();
      formData.append('ticket_id', getTicketId());
      formData.append('ticket_revision', String(getTicketRevision()));
      formData.append('client_id', clientId);
      formData.append('file', file);
      return requestFormData(url, formData, {
        errorMessage: 'Attachment upload failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_ATTACHMENT_UPLOAD_DELAY_MS, function () {
          return {
            ok: true,
            demo: true,
            attachment: {
              upload_id: 'demo-upload-' + Date.now(),
              client_id: clientId,
              name: file.name || 'image-from-clipboard.png',
              size: file.size || 0
            }
          };
        });
      });
    }

    function showPaymentModal() {
      if (!ticketPaymentModal) {
        return;
      }
      ticketPaymentModal.hidden = false;
      ticketPaymentModal.style.display = 'block';
      ticketPaymentModal.classList.add('in');
      ticketPaymentModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!ticketPaymentModalBackdrop) {
        ticketPaymentModalBackdrop = document.createElement('div');
        ticketPaymentModalBackdrop.className = 'modal-backdrop fade in ticket-payment-modal-backdrop';
        document.body.appendChild(ticketPaymentModalBackdrop);
        ticketPaymentModalBackdrop.addEventListener('click', hidePaymentModal);
      }
      var closeButton = ticketPaymentModal.querySelector('.ticket-payment-modal-cancel');
      if (closeButton) {
        closeButton.focus();
      }
    }

    function hidePaymentModal() {
      if (!ticketPaymentModal) {
        return;
      }
      ticketPaymentModal.classList.remove('in');
      ticketPaymentModal.setAttribute('aria-hidden', 'true');
      ticketPaymentModal.style.display = 'none';
      ticketPaymentModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (ticketPaymentModalBackdrop && ticketPaymentModalBackdrop.parentNode) {
        ticketPaymentModalBackdrop.parentNode.removeChild(ticketPaymentModalBackdrop);
      }
      ticketPaymentModalBackdrop = null;
      if (ticketPaymentOpen) {
        ticketPaymentOpen.focus();
      }
    }

    function showCloseTicketModal() {
      if (!closeTicketModal) {
        return;
      }
      closeTicketModal.hidden = false;
      closeTicketModal.style.display = 'block';
      closeTicketModal.classList.add('in');
      closeTicketModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!closeTicketModalBackdrop) {
        closeTicketModalBackdrop = document.createElement('div');
        closeTicketModalBackdrop.className = 'modal-backdrop fade in ticket-close-modal-backdrop';
        document.body.appendChild(closeTicketModalBackdrop);
        closeTicketModalBackdrop.addEventListener('click', hideCloseTicketModal);
      }
      if (closeTicketConfirm) {
        closeTicketConfirm.disabled = false;
        closeTicketConfirm.textContent = 'Да, закрыть';
        closeTicketConfirm.focus();
      }
    }

    function hideCloseTicketModal() {
      if (!closeTicketModal) {
        return;
      }
      closeTicketModal.classList.remove('in');
      closeTicketModal.setAttribute('aria-hidden', 'true');
      closeTicketModal.style.display = 'none';
      closeTicketModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (closeTicketModalBackdrop && closeTicketModalBackdrop.parentNode) {
        closeTicketModalBackdrop.parentNode.removeChild(closeTicketModalBackdrop);
      }
      closeTicketModalBackdrop = null;
    }

    function showMessageDeleteModal(message) {
      if (!messageDeleteModal || !message) {
        return;
      }
      pendingDeleteMessage = message;
      var messageId = getMessageId(message);
      var authorText = getMessageAuthor(message);
      var bodyText = getOneLinePreview(getMessageText(message), 150) || 'Сообщение без текста';
      if (messageDeletePreview) {
        messageDeletePreview.textContent = authorText + ': ' + bodyText;
      }
      if (messageDeleteConfirm) {
        var deleteEnabled = messageDeleteConfirm.getAttribute('data-delete-enabled') === 'true';
        messageDeleteConfirm.disabled = !deleteEnabled;
        messageDeleteConfirm.setAttribute('data-message-id', messageId);
        messageDeleteConfirm.setAttribute('data-delete-url', getSupportActionUrl(message, 'data-delete-url', 'data-message-delete-url', '/admin/support/message-delete'));
        messageDeleteConfirm.title = deleteEnabled
          ? 'Подтвердить удаление своего сообщения'
          : 'Удаление пока заблокировано до подключения backend-проверки';
        if (messageDeleteDescription) {
          messageDeleteDescription.textContent = deleteEnabled
            ? 'Подтвердите удаление своего сообщения. Отменить это действие после подтверждения нельзя.'
            : 'Подтвердите удаление сообщения. Сейчас действие заблокировано: программист подключит права и backend-проверку перед включением кнопки.';
        }
      }
      messageDeleteModal.hidden = false;
      messageDeleteModal.style.display = 'block';
      messageDeleteModal.classList.add('in');
      messageDeleteModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!messageDeleteModalBackdrop) {
        messageDeleteModalBackdrop = document.createElement('div');
        messageDeleteModalBackdrop.className = 'modal-backdrop fade in ticket-message-delete-modal-backdrop';
        messageDeleteModalBackdrop.addEventListener('click', hideMessageDeleteModal);
        document.body.appendChild(messageDeleteModalBackdrop);
      }
    }

    function hideMessageDeleteModal() {
      if (!messageDeleteModal) {
        return;
      }
      pendingDeleteMessage = null;
      messageDeleteModal.classList.remove('in');
      messageDeleteModal.setAttribute('aria-hidden', 'true');
      messageDeleteModal.style.display = 'none';
      messageDeleteModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (messageDeleteModalBackdrop && messageDeleteModalBackdrop.parentNode) {
        messageDeleteModalBackdrop.parentNode.removeChild(messageDeleteModalBackdrop);
      }
      messageDeleteModalBackdrop = null;
    }

    function showEscalateTicketModal() {
      if (!ticketEscalateModal) {
        return;
      }
      ticketEscalateModal.hidden = false;
      ticketEscalateModal.style.display = 'block';
      ticketEscalateModal.classList.add('in');
      ticketEscalateModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!ticketEscalateModalBackdrop) {
        ticketEscalateModalBackdrop = document.createElement('div');
        ticketEscalateModalBackdrop.className = 'modal-backdrop fade in ticket-escalate-modal-backdrop';
        document.body.appendChild(ticketEscalateModalBackdrop);
        ticketEscalateModalBackdrop.addEventListener('click', hideEscalateTicketModal);
      }
      if (ticketEscalateConfirm) {
        ticketEscalateConfirm.disabled = false;
        ticketEscalateConfirm.textContent = 'Передать';
      }
      if (ticketEscalateTeam) {
        ticketEscalateTeam.focus();
      }
    }

    function hideEscalateTicketModal() {
      if (!ticketEscalateModal) {
        return;
      }
      ticketEscalateModal.classList.remove('in');
      ticketEscalateModal.setAttribute('aria-hidden', 'true');
      ticketEscalateModal.style.display = 'none';
      ticketEscalateModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (ticketEscalateModalBackdrop && ticketEscalateModalBackdrop.parentNode) {
        ticketEscalateModalBackdrop.parentNode.removeChild(ticketEscalateModalBackdrop);
      }
      ticketEscalateModalBackdrop = null;
    }

    function showResolveTicketModal(previousStatus) {
      if (!ticketResolveModal) {
        return;
      }
      pendingStatusBeforeResolve = previousStatus || pendingStatusBeforeResolve || 'waiting_support';
      ticketResolveModal.hidden = false;
      ticketResolveModal.style.display = 'block';
      ticketResolveModal.classList.add('in');
      ticketResolveModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (!ticketResolveModalBackdrop) {
        ticketResolveModalBackdrop = document.createElement('div');
        ticketResolveModalBackdrop.className = 'modal-backdrop fade in ticket-resolve-modal-backdrop';
        document.body.appendChild(ticketResolveModalBackdrop);
        ticketResolveModalBackdrop.addEventListener('click', hideResolveTicketModal);
      }
      if (ticketResolveConfirm) {
        ticketResolveConfirm.disabled = false;
        ticketResolveConfirm.textContent = 'Отметить решенным';
      }
      if (ticketResolveReason) {
        ticketResolveReason.focus();
      }
    }

    function hideResolveTicketModal(keepResolvedStatus) {
      if (!ticketResolveModal) {
        return;
      }
      ticketResolveModal.classList.remove('in');
      ticketResolveModal.setAttribute('aria-hidden', 'true');
      ticketResolveModal.style.display = 'none';
      ticketResolveModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (ticketResolveModalBackdrop && ticketResolveModalBackdrop.parentNode) {
        ticketResolveModalBackdrop.parentNode.removeChild(ticketResolveModalBackdrop);
      }
      ticketResolveModalBackdrop = null;
      if (!keepResolvedStatus) {
        syncTicketStatusSelects(pendingStatusBeforeResolve || 'waiting_support');
      }
    }

    function requestCloseTicket(closeUrl, closePayload) {
      return requestJson(closeUrl, getTicketMutationPayload(closePayload), {
        errorMessage: 'Ticket close failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return { ok: true, demo: true };
        });
      });
    }

    function getTicketStatusMeta(status) {
      var map = {
        waiting_support: { text: 'Ждет ответа', className: 'label-warning', title: 'Последнее сообщение от клиента, нужен ответ поддержки' },
        waiting_client: { text: 'Ждет клиента', className: 'label-info', title: 'Поддержка ответила, ожидается ответ клиента' },
        escalated: { text: 'Эскалация', className: 'label-primary', title: 'Тикет передан старшему специалисту или в другой отдел' },
        on_hold: { text: 'Пауза', className: 'label-default', title: 'Работа временно приостановлена по внутренней причине' },
        resolved: { text: 'Решен', className: 'label-success', title: 'Вопрос решен, тикет можно закрыть после проверки' },
        closed: { text: 'Закрыт', className: 'label-success', title: 'Тикет закрыт, работа завершена' }
      };
      return map[status] || map.waiting_support;
    }

    function addTicketHistoryItem(title, text, icon) {
      if (!ticketHistoryList) {
        return;
      }
      var item = document.createElement('div');
      item.className = 'ticket-history-item';
      item.innerHTML = '<span class="ticket-history-icon" aria-hidden="true"></span><div><strong></strong><small></small></div>';
      item.querySelector('.ticket-history-icon').textContent = icon || '↔';
      item.querySelector('strong').textContent = title;
      item.querySelector('small').textContent = text;
      ticketHistoryList.insertBefore(item, ticketHistoryList.firstChild);
    }

    function syncTicketStatusSelects(status) {
      Array.prototype.forEach.call(ticketStatusSelects, function (select) {
        select.value = status;
      });
    }

    function syncTicketEscalationLabels(status) {
      var isEscalated = status === 'escalated';
      Array.prototype.forEach.call(ticketEscalationLabels, function (label) {
        label.hidden = !isEscalated;
        label.setAttribute('aria-hidden', isEscalated ? 'false' : 'true');
      });
    }

    function setTicketStatusSelectsDisabled(isDisabled) {
      Array.prototype.forEach.call(ticketStatusSelects, function (select) {
        select.disabled = isDisabled;
      });
    }

    function getStatusRequestUrl(sourceSelect) {
      var source = sourceSelect || ticketStatusSelect;
      return source && source.getAttribute('data-status-url') || '/admin/support/status?id=' + encodeURIComponent(getTicketId());
    }

    function getCloseTicketUrl() {
      if (closeTicketActionSource) {
        return closeTicketActionSource.getAttribute('data-close-url') || closeTicketActionSource.getAttribute('href');
      }
      return '/admin/support/close?id=' + encodeURIComponent(getTicketId());
    }

    function getCloseTicketQueueUrl() {
      if (closeTicketActionSource) {
        return closeTicketActionSource.getAttribute('data-queue-url') || 'https://confideline.com/en/admin/support/index';
      }
      return 'https://confideline.com/en/admin/support/index';
    }

    function applyTicketStatus(status, actorName) {
      var meta = getTicketStatusMeta(status);
      Array.prototype.forEach.call(ticketStatusLabels, function (label) {
        label.classList.remove('label-default', 'label-primary', 'label-info', 'label-success', 'label-warning', 'label-danger');
        label.classList.add(meta.className);
        label.textContent = meta.text;
        label.title = meta.title;
        label.setAttribute('data-ticket-status', status);
      });
      syncTicketStatusSelects(status);
      syncTicketEscalationLabels(status);
      if (closeTicketButton && status === 'resolved') {
        closeTicketButton.classList.add('is-ticket-resolved');
        closeTicketButton.title = 'Закрыть решенный тикет окончательно';
        closeTicketButton.innerHTML = '<span class="ui-icon" aria-hidden="true">✓</span> Закрыть решенный';
      }
      addTicketHistoryItem('Статус изменен', meta.text + ' · ' + (actorName || 'текущий оператор') + ' · только что', status === 'escalated' ? '↗' : '↔');
    }

    function requestTicketStatusChange(status, extraPayload, sourceSelect) {
      var statusUrl = getStatusRequestUrl(sourceSelect);
      return requestJson(statusUrl, getTicketMutationPayload(Object.assign({
        status: status
      }, extraPayload || {})), {
        errorMessage: 'Ticket status failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return { ok: true, demo: true, status: status, actor_name: 'Chapajev Wasil' };
        });
      });
    }

    function requestAssignTicket(assignUrl, assigneeName) {
      return requestJson(assignUrl, getTicketMutationPayload({
        assignee: 'current_operator'
      }), {
        errorMessage: 'Ticket assign failed'
      }).catch(function (error) {
        return resolveDemoFallback(error, DEMO_TICKET_ACTION_DELAY_MS, function () {
          return { ok: true, demo: true, assignee_name: assigneeName };
        });
      });
    }

    function setAssignButtonsLoading(isLoading) {
      Array.prototype.forEach.call(assignTicketButtons, function (button) {
        button.classList.toggle('is-loading', isLoading);
        button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        if (isLoading) {
          button.setAttribute('data-original-text', button.textContent.trim());
          button.innerHTML = '<span class="ui-icon" aria-hidden="true">↻</span> Назначаем...';
        } else if (!button.classList.contains('is-assigned')) {
          button.innerHTML = '<span class="ui-icon" aria-hidden="true">＋</span> Взять';
        }
      });
    }

    function applyTicketAssignee(assigneeName) {
      Array.prototype.forEach.call(assigneeLabels, function (label) {
        label.classList.remove('label-default');
        label.classList.add('label-info');
        label.textContent = assigneeName;
        label.title = 'Тикет закреплен за администратором ' + assigneeName;
      });
      if (assigneeValue) {
        assigneeValue.classList.remove('not-set');
        assigneeValue.textContent = assigneeName;
        assigneeValue.title = 'Текущий ответственный администратор';
      }
      Array.prototype.forEach.call(assignTicketButtons, function (button) {
        button.classList.remove('is-loading');
        button.classList.add('is-assigned');
        button.setAttribute('aria-busy', 'false');
        button.setAttribute('aria-disabled', 'true');
        button.title = 'Тикет уже закреплен за ' + assigneeName;
        button.innerHTML = '<span class="ui-icon" aria-hidden="true">✓</span> <span class="ticket-assign-button-name"></span>';
        var buttonName = button.querySelector('.ticket-assign-button-name');
        if (buttonName) {
          buttonName.textContent = assigneeName;
        }
      });
      addTicketHistoryItem('Ответственный назначен', assigneeName + ' · только что', '＋');
    }

    function toggleMessageTranslation(message, button) {
      var body = message && message.querySelector('.ticket-message-body');
      var bodyText = getMessageText(message);
      var messageId = getMessageId(message);
      var existing = body && body.querySelector('.ticket-message-translation');
      if (!body || !bodyText) {
        return;
      }
      if (button.classList.contains('is-loading')) {
        return;
      }
      if (existing) {
        existing.parentNode.removeChild(existing);
        button.classList.remove('is-active');
        button.title = hasStoredOperatorTranslation(message) ? 'Показать исходный текст оператора' : 'Перевести сообщение клиента';
        return;
      }
      if (isSupportMessage(message)) {
        var originalText = getStoredOperatorOriginalText(message);
        if (!hasStoredOperatorTranslation(message) || !originalText) {
          return;
        }
        var sourceLanguage = message.getAttribute('data-translation-source-language') || 'auto';
        var targetLanguage = message.getAttribute('data-translation-target-language') || 'auto';
        var originalBlock = createMessageTranslationBlock({
          className: 'ticket-message-translation ticket-message-translation-original',
          label: 'Original',
          language: getComposerTranslationLanguageLabel(sourceLanguage, getProfileTranslationLanguage('source'), 'source'),
          title: 'Original · ' + sourceLanguage + ' → ' + targetLanguage,
          text: originalText
        });
        body.appendChild(originalBlock);
        button.classList.add('is-active');
        button.title = 'Скрыть исходный текст';
        return;
      }
      button.classList.add('is-loading');
      button.disabled = true;
      button.title = 'Переводим сообщение...';
      requestMessageTranslation(message, bodyText).then(function (translationText) {
        var block = createMessageTranslationBlock({
          label: 'Translation',
          language: 'ru',
          title: 'Translation · auto → ru',
          text: translationText || getDemoTranslation(messageId, bodyText)
        });
        body.appendChild(block);
        button.classList.add('is-active');
        button.title = 'Скрыть перевод';
      }).finally(function () {
        button.classList.remove('is-loading');
        button.disabled = false;
      });
    }

    function focusMessageElement(message, options) {
      options = options || {};
      if (!message) {
        return;
      }
      if (options.scroll !== false) {
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      window.clearTimeout(message._ticketFocusTimer);
      message.classList.remove('ticket-message-focus');
      void message.offsetWidth;
      message.classList.add('ticket-message-focus');
      message._ticketFocusTimer = window.setTimeout(function () {
        message.classList.remove('ticket-message-focus');
        message._ticketFocusTimer = null;
      }, MESSAGE_FOCUS_HIGHLIGHT_MS);
    }

    function focusMessage(messageId, options) {
      focusMessageElement(findMessageById(messageId), options);
    }

    function messageMatchesThreadFilter(message, filter) {
      if (!message) {
        return false;
      }
      if (filter === 'client') {
        return message.getAttribute('data-author-type') === 'client';
      }
      if (filter === 'support') {
        return message.getAttribute('data-author-type') === 'support';
      }
      if (filter === 'attachments') {
        return Boolean(message.querySelector('.media-container, .message-attachments, .attachment-item, img.ticket-message-media'));
      }
      if (filter === 'events') {
        return message.getAttribute('data-message-kind') === 'system_event' || message.classList.contains('ticket-message-system');
      }
      return true;
    }

    function getThreadMessageSearchText(message) {
      if (!message) {
        return '';
      }
      return (getThreadMessageSearchMeta(message) + ' ' + getThreadMessageSearchPreview(message)).replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function getThreadMessages() {
      return document.querySelectorAll('.support-conversation-items .ticket-message');
    }

    function getThreadMessageSearchMeta(message) {
      if (!message) {
        return '';
      }
      if (message.classList.contains('ticket-message-system')) {
        var systemTitle = message.querySelector('.ticket-system-copy strong');
        var systemMeta = message.querySelector('.ticket-system-copy small');
        return ((systemTitle ? systemTitle.textContent : 'Событие') + ' · ' + (systemMeta ? systemMeta.textContent : '')).replace(/\s+/g, ' ').trim();
      }
      var author = message.querySelector('.user-block .username');
      var time = message.querySelector('.user-block time');
      var role = message.getAttribute('data-author-type') === 'support' ? 'Поддержка' : 'Клиент';
      return ((author ? author.textContent : role) + ' · ' + (time ? time.textContent : '') + ' · ' + role).replace(/\s+/g, ' ').trim();
    }

    function getThreadMessageSearchPreview(message) {
      if (!message) {
        return '';
      }
      var text = message.querySelector('.ticket-message-body p');
      if (text && text.textContent.trim()) {
        return getOneLinePreview(text.textContent, 150);
      }
      var systemCopy = message.querySelector('.ticket-system-copy');
      if (systemCopy && systemCopy.textContent.trim()) {
        return getOneLinePreview(systemCopy.textContent, 150);
      }
      var fileName = message.querySelector('.ticket-file-card-meta strong, .ticket-image-thumb img');
      if (fileName) {
        return getOneLinePreview(fileName.getAttribute('alt') || fileName.textContent || 'Вложение', 150);
      }
      return getOneLinePreview(message.textContent || '', 150);
    }

    function syncThreadSearchUiState() {
      var hasQuery = Boolean(threadSearchInput && threadSearchInput.value.trim());
      var searchBox = threadSearchInput && threadSearchInput.closest('.ticket-conversation-search');
      if (searchBox) {
        searchBox.classList.toggle('has-query', hasQuery);
      }
      if (threadSearchClear) {
        threadSearchClear.hidden = !hasQuery;
      }
      if (threadSearchResults) {
        threadSearchResults.hidden = !hasQuery;
      }
    }

    function clearThreadSearchResultNodes() {
      if (!threadSearchResults) {
        return;
      }
      while (threadSearchResults.firstChild) {
        threadSearchResults.removeChild(threadSearchResults.firstChild);
      }
    }

    function renderThreadSearchEmpty(text) {
      if (!threadSearchResults) {
        return;
      }
      clearThreadSearchResultNodes();
      var empty = document.createElement('div');
      empty.className = 'ticket-thread-search-empty';
      empty.textContent = text || 'Нет совпадений';
      threadSearchResults.appendChild(empty);
    }

    function renderThreadSearchResults() {
      var query = threadSearchInput ? threadSearchInput.value.trim() : '';
      syncThreadSearchUiState();
      if (!threadSearchResults) {
        return;
      }
      if (!query) {
        renderThreadSearchEmpty('Введите текст для поиска');
        threadSearchResults.hidden = true;
        return;
      }
      clearThreadSearchResultNodes();
      threadSearchResults.hidden = false;
      if (!threadSearchMatches.length) {
        renderThreadSearchEmpty('Нет совпадений в выбранном фильтре');
        return;
      }
      Array.prototype.forEach.call(threadSearchMatches, function (message, index) {
        var result = document.createElement('button');
        result.type = 'button';
        result.className = 'ticket-thread-search-result';
        result.setAttribute('data-search-index', String(index));
        result.setAttribute('title', 'Перейти к этому сообщению');
        if (index === threadSearchIndex) {
          result.classList.add('is-active');
        }
        var meta = document.createElement('span');
        meta.className = 'ticket-thread-search-result-meta';
        meta.textContent = getThreadMessageSearchMeta(message);
        var preview = document.createElement('span');
        preview.className = 'ticket-thread-search-result-text';
        preview.textContent = getThreadMessageSearchPreview(message);
        result.appendChild(meta);
        result.appendChild(preview);
        threadSearchResults.appendChild(result);
      });
    }

    function updateThreadSearchCount() {
      if (!threadSearchCount) {
        return;
      }
      if (!threadSearchInput || !threadSearchInput.value.trim()) {
        threadSearchCount.textContent = String(Array.prototype.filter.call(getThreadMessages(), function (message) {
          return !message.classList.contains('ticket-thread-hidden');
        }).length);
        return;
      }
      threadSearchCount.textContent = String(threadSearchMatches.length);
    }

    function setCurrentThreadSearchMatch(index, options) {
      options = options || {};
      Array.prototype.forEach.call(threadSearchMatches, function (message) {
        message.classList.remove('ticket-search-current');
      });
      if (!threadSearchMatches.length) {
        threadSearchIndex = -1;
        updateThreadSearchCount();
        renderThreadSearchResults();
        return;
      }
      threadSearchIndex = (index + threadSearchMatches.length) % threadSearchMatches.length;
      var current = threadSearchMatches[threadSearchIndex];
      if (options.highlight !== false) {
        current.classList.add('ticket-search-current');
      }
      if (options.scroll !== false) {
        focusMessageElement(current);
      }
      updateThreadSearchCount();
      renderThreadSearchResults();
    }

    function applyThreadSearchAndFilter() {
      var query = threadSearchInput ? threadSearchInput.value.trim().toLowerCase() : '';
      threadSearchMatches = [];
      threadSearchIndex = -1;
      Array.prototype.forEach.call(getThreadMessages(), function (message) {
        var filterMatch = messageMatchesThreadFilter(message, activeThreadFilter);
        var searchMatch = !query || getThreadMessageSearchText(message).indexOf(query) !== -1;
        message.classList.toggle('ticket-thread-hidden', !filterMatch);
        message.classList.toggle('ticket-search-match', Boolean(query && filterMatch && searchMatch));
        message.classList.remove('ticket-search-current');
        if (query && filterMatch && searchMatch) {
          threadSearchMatches.push(message);
        }
      });
      if (threadSearchMatches.length) {
        threadSearchIndex = 0;
      } else {
        threadSearchIndex = -1;
      }
      updateThreadSearchCount();
      renderThreadSearchResults();
    }

    function updatePinnedCount() {
      if (pinnedText) {
        var count = String(pinnedText.querySelectorAll('.ticket-pinned-item').length);
        if (pinnedCount) {
          pinnedCount.textContent = count;
        }
        if (pinnedToggleCount) {
          pinnedToggleCount.textContent = count;
        }
        setTicketCount('pinned', Number(count));
      }
    }

    function syncPinnedToggleState() {
      if (!pinnedToggle || !pinnedBar) {
        return;
      }
      var isOpen = !pinnedBar.hidden;
      pinnedToggle.classList.toggle('is-active', isOpen);
      pinnedToggle.setAttribute('aria-pressed', String(isOpen));
      pinnedToggle.title = isOpen
        ? 'Скрыть закрепленные или важные сообщения этого тикета'
        : 'Открыть закрепленные или важные сообщения этого тикета';
    }

    function isMessagePinned(message) {
      return Boolean(
        message
        && (message.getAttribute('data-message-pinned') === 'true' || message.classList.contains('ticket-message-pinned'))
      );
    }

    function syncMessagePinActions(message) {
      if (!message) {
        return;
      }
      var isPinned = isMessagePinned(message);
      Array.prototype.forEach.call(message.querySelectorAll('[data-action="pin"]'), function (button) {
        button.classList.toggle('is-active', isPinned);
        button.setAttribute('aria-pressed', String(isPinned));
        button.title = isPinned
          ? 'Открепить сообщение из панели важных сообщений'
          : 'Закрепить сообщение в панели важных сообщений';
        button.innerHTML = isPinned
          ? '<span class="ui-icon" aria-hidden="true">⌖</span> Открепить'
          : '<span class="ui-icon" aria-hidden="true">⌖</span> Закрепить';
      });
    }

    function syncAllMessagePinActions() {
      Array.prototype.forEach.call(document.querySelectorAll('.support-conversation-items .ticket-message'), syncMessagePinActions);
    }

    function findMessageById(messageId) {
      return messageId
        ? document.getElementById('ticket-message-' + messageId) || document.querySelector('.support-conversation-items .ticket-message[data-message-id="' + messageId + '"]')
        : null;
    }

    function updatePinnedEmptyState() {
      if (!pinnedText) {
        return;
      }
      updatePinnedCount();
      if (!pinnedText.querySelector('.ticket-pinned-item')) {
        pinnedText.textContent = 'Закрепленные сообщения появятся здесь.';
        if (pinnedBar) {
          pinnedBar.hidden = true;
          pinnedBar.removeAttribute('data-target-message');
        }
      }
      syncPinnedToggleState();
    }

    function renderPinnedItem(item, messageId, authorText, bodyText) {
      var chipText = (authorText || 'Сообщение') + ': ' + getOneLinePreview(bodyText || '', 90);
      item.innerHTML = '';
      item.className = 'ticket-pinned-item';
      item.setAttribute('data-target-message', messageId);

      var goButton = document.createElement('button');
      goButton.type = 'button';
      goButton.className = 'ticket-pinned-item-main';
      goButton.title = 'Перейти к закрепленному сообщению';
      goButton.textContent = chipText;

      var removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'ticket-pinned-item-remove';
      removeButton.title = 'Открепить сообщение';
      removeButton.setAttribute('aria-label', 'Открепить сообщение');
      removeButton.innerHTML = '<span aria-hidden="true">×</span>';

      item.appendChild(goButton);
      item.appendChild(removeButton);
    }

    function rebuildPinnedItemsFromMessages() {
      if (!pinnedText) {
        return;
      }
      var wasHidden = pinnedBar ? pinnedBar.hidden : true;
      pinnedText.textContent = '';
      Array.prototype.forEach.call(document.querySelectorAll('.support-conversation-items .ticket-message'), function (message) {
        if (isMessagePinned(message) && !message.classList.contains('ticket-message-deleted')) {
          applyPinnedState(message, true, getMessageAuthor(message), getMessageText(message));
        }
      });
      updatePinnedEmptyState();
      if (pinnedBar) {
        pinnedBar.hidden = wasHidden || !pinnedText.querySelector('.ticket-pinned-item');
      }
      syncPinnedToggleState();
    }

    function removePinnedMessage(messageId) {
      if (!pinnedText || !messageId) {
        return;
      }
      var pinnedItem = pinnedText.querySelector('.ticket-pinned-item[data-target-message="' + messageId + '"]');
      if (pinnedItem) {
        pinnedItem.parentNode.removeChild(pinnedItem);
      }
      updatePinnedEmptyState();
    }

    function applyPinnedState(message, isPinned, authorText, bodyText) {
      var messageId = getMessageId(message);
      if (!message || !pinnedBar || !pinnedText || !messageId) {
        return;
      }
      pinnedBar.setAttribute('data-target-message', messageId);
      var existingPinnedItem = pinnedText.querySelector('.ticket-pinned-item[data-target-message="' + messageId + '"]');
      if (isPinned) {
        if (!pinnedText.querySelector('.ticket-pinned-item')) {
          pinnedText.textContent = '';
        }
        if (!existingPinnedItem) {
          existingPinnedItem = document.createElement('span');
          pinnedText.appendChild(existingPinnedItem);
        }
        renderPinnedItem(existingPinnedItem, messageId, authorText || getMessageAuthor(message), bodyText || getMessageText(message));
        message.classList.add('ticket-message-pinned');
        message.setAttribute('data-message-pinned', 'true');
      } else {
        if (existingPinnedItem) {
          existingPinnedItem.parentNode.removeChild(existingPinnedItem);
        }
        message.classList.remove('ticket-message-pinned');
        message.setAttribute('data-message-pinned', 'false');
      }
      syncMessagePinActions(message);
      updatePinnedEmptyState();
    }

    function markMessageDeleted(message, messageId) {
      if (!message || message.classList.contains('ticket-message-deleted')) {
        return;
      }
      clearNewMessageState(message);
      removePinnedMessage(messageId);
      message.classList.remove('ticket-message-pinned');
      message.setAttribute('data-message-pinned', 'false');
      syncMessagePinActions(message);
      message.classList.add('ticket-message-deleted');
      message.setAttribute('data-message-deleted', 'true');
      var bubble = message.querySelector('.direct-chat-text');
      if (bubble && !bubble.querySelector('.ticket-message-deleted-note')) {
        var note = document.createElement('div');
        note.className = 'ticket-message-deleted-note';
        note.textContent = 'Сообщение удалено оператором';
        bubble.appendChild(note);
      }
    }

    function canDeleteMessage(message) {
      return Boolean(message && message.getAttribute('data-can-delete') === 'true');
    }

    function canEditMessage(message) {
      return Boolean(
        message
        && message.getAttribute('data-can-edit') === 'true'
        && message.getAttribute('data-message-viewed-by-client') === 'false'
        && !message.classList.contains('ticket-message-deleted')
      );
    }

    function clearComposerEditMode() {
      activeEditContext = null;
      if (editPreview) {
        editPreview.hidden = true;
        editPreview.removeAttribute('data-target-message');
      }
      if (editPreviewText) {
        editPreviewText.textContent = '';
      }
      if (sendButton) {
        sendButton.removeAttribute('data-editing-message-id');
        sendButton.title = 'Отправить публичный ответ пользователю и оставить тикет открытым';
      }
      if (composerShell) {
        composerShell.classList.remove('is-editing-message');
      }
      touchComposerDraft();
    }

    function ensureEditedState(message) {
      var meta = message && message.querySelector('.direct-chat-info .description');
      if (!message) {
        return;
      }
      message.setAttribute('data-message-edited', 'true');
      if (meta && !meta.querySelector('.ticket-message-state-edited')) {
        var editedState = document.createElement('span');
        var timeNode = meta.querySelector('time');
        var readState = meta.querySelector('.ticket-read-state');
        editedState.className = 'ticket-message-state-edited';
        editedState.title = 'Сообщение было изменено';
        editedState.textContent = 'изменено';
        if (timeNode) {
          meta.insertBefore(editedState, timeNode);
        } else {
          meta.insertBefore(editedState, readState || null);
        }
      }
    }

    function startMessageEdit(message) {
      var textNode = getMessageTextNode(message);
      var text = textNode ? textNode.textContent.trim() : '';
      var messageId = getMessageId(message);
      if (!canEditMessage(message) || !replyTextarea || !text || !messageId) {
        return;
      }
      resetReplyPreview();
      clearAppliedTemplate();
      hideTemplateCreateUi();
      showPanel('public-reply');
      activeEditContext = {
        message: message,
        messageId: messageId,
        textNode: textNode,
        previousText: text
      };
      replyTextarea.value = text;
      autoGrow(replyTextarea);
      if (editPreview && editPreviewText) {
        editPreview.hidden = false;
        editPreview.setAttribute('data-target-message', messageId);
        editPreviewText.textContent = text;
      }
      if (sendButton) {
        sendButton.setAttribute('data-editing-message-id', messageId);
        sendButton.title = 'Сохранить изменение сообщения';
      }
      if (composerShell) {
        composerShell.classList.add('is-editing-message');
      }
      syncComposerSendSafety();
      replyTextarea.focus();
    }

    function saveMessageEdit() {
      if (!activeEditContext || !replyTextarea) {
        return;
      }
      if (draftState.isSending) {
        return;
      }
      var nextText = replyTextarea.value.trim();
      var context = activeEditContext;
      if (!nextText || !context.textNode) {
        return;
      }
      draftState.isSending = true;
      context.textNode.textContent = nextText;
      clearComposerEditMode();
      replyTextarea.value = '';
      autoGrow(replyTextarea);
      syncComposerSendSafety();
      context.message.classList.add('ticket-message-edit-saving');
      requestMessageEdit(context.message, nextText, context.previousText).then(function (data) {
        context.textNode.textContent = data && data.text ? data.text : nextText;
        ensureEditedState(context.message);
        clearComposerDraft();
      }).catch(function (error) {
        context.textNode.textContent = context.previousText;
        startMessageEdit(context.message);
        handleSupportRequestError(error, {
          message: 'Не удалось сохранить изменение сообщения.',
          retry: saveMessageEdit
        });
      }).finally(function () {
        draftState.isSending = false;
        syncComposerSendSafety();
        context.message.classList.remove('ticket-message-edit-saving');
      });
    }

    function writeClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {});
      }
    }

    function renderInternalNote(note) {
      if (!noteList || !note) {
        return;
      }
      var item = document.createElement('div');
      item.className = 'ticket-note-item';
      item.setAttribute('data-note-id', note.id || '');
      item.innerHTML = '<div class="ticket-note-head"><strong></strong><small></small></div><span></span>';
      item.querySelector('strong').textContent = note.title || 'Новая заметка';
      item.querySelector('small').textContent = (note.author_name || 'admin') + ' · ' + (note.created_at_label || 'только что');
      item.querySelector('span').textContent = note.body || '';
      noteList.insertBefore(item, noteList.firstChild);
    }

    function saveInternalNote() {
      if (!noteTextarea || !noteList || (noteSave && noteSave.disabled)) {
        return;
      }
      var text = noteTextarea.value.trim();
      if (!text) {
        noteTextarea.focus();
        return;
      }
      if (noteSave) {
        noteSave.disabled = true;
        noteSave.classList.add('is-loading');
        noteSave.title = 'Сохраняем внутреннюю заметку...';
      }
      requestInternalNoteCreate(text).then(function (data) {
        renderInternalNote(data && data.note ? data.note : { body: text, author_name: 'admin', created_at_label: 'только что' });
        noteTextarea.value = '';
        autoGrow(noteTextarea);
        noteTextarea.focus();
      }).catch(function (error) {
        noteTextarea.focus();
        handleSupportRequestError(error, {
          message: 'Не удалось сохранить внутреннюю заметку.',
          retry: saveInternalNote
        });
      }).finally(function () {
        if (noteSave) {
          noteSave.disabled = false;
          noteSave.classList.remove('is-loading');
          noteSave.title = 'Сохранить внутреннюю заметку';
        }
      });
    }

    function updateAttachmentState() {
      if (!attachmentZone || !attachmentList) {
        return;
      }
      attachmentZone.classList.toggle('has-attachments', attachmentList.children.length > 0);
    }

    function humanSize(size) {
      var numericSize = Number(size);
      if (!isFinite(numericSize) || numericSize < 0) {
        return '';
      }
      if (numericSize === 0) {
        return '0 Б';
      }
      if (numericSize < 1024) {
        return numericSize + ' Б';
      }
      if (numericSize < 1024 * 1024) {
        return Math.round(numericSize / 1024) + ' КБ';
      }
      return (numericSize / (1024 * 1024)).toFixed(1) + ' МБ';
    }

    function getAttachmentSourceMeta(sourceLabel) {
      if (sourceLabel === 'вставлено') {
        return {
          icon: '⧉',
          className: 'is-pasted',
          label: 'Вставлено из буфера обмена'
        };
      }
      return {
        icon: '↥',
        className: 'is-selected',
        label: 'Выбрано через диалог файла'
      };
    }

    function getAttachmentStatusMeta(statusLabel) {
      if (statusLabel === 'загружаем') {
        return {
          icon: '↻',
          className: 'is-uploading',
          label: 'Загрузка идет'
        };
      }
      if (statusLabel === 'не загружено') {
        return {
          icon: '!',
          className: 'is-failed',
          label: 'Загрузка не удалась'
        };
      }
      return null;
    }

    function appendAttachmentMetaIcon(container, meta) {
      var icon = document.createElement('span');
      icon.className = 'ticket-attachment-meta-icon ' + meta.className;
      icon.textContent = meta.icon;
      icon.title = meta.label;
      icon.setAttribute('aria-label', meta.label);
      container.appendChild(icon);
    }

    function renderAttachmentMeta(metaNode, sourceLabel, statusLabel, size) {
      if (!metaNode) {
        return;
      }
      var sizeLabel = humanSize(size);
      metaNode.innerHTML = '';
      metaNode.setAttribute('data-source-label', sourceLabel || '');
      metaNode.setAttribute('data-status-label', statusLabel || '');
      metaNode.setAttribute('data-size-label', sizeLabel || '');
      appendAttachmentMetaIcon(metaNode, getAttachmentSourceMeta(sourceLabel));
      var statusMeta = getAttachmentStatusMeta(statusLabel);
      if (statusMeta) {
        appendAttachmentMetaIcon(metaNode, statusMeta);
      }
      if (sizeLabel) {
        var sizeText = document.createElement('span');
        sizeText.className = 'ticket-attachment-size';
        sizeText.textContent = sizeLabel;
        metaNode.appendChild(sizeText);
      }
    }

    function getAttachmentMetaPayload(metaNode) {
      if (!metaNode) {
        return '';
      }
      var parts = [];
      var sourceLabel = metaNode.getAttribute('data-source-label');
      var statusLabel = metaNode.getAttribute('data-status-label');
      var sizeLabel = metaNode.getAttribute('data-size-label');
      if (sourceLabel) {
        parts.push(sourceLabel);
      }
      if (statusLabel) {
        parts.push(statusLabel);
      }
      if (sizeLabel) {
        parts.push(sizeLabel);
      }
      return parts.join(' · ');
    }

    function isEmptyAttachment(file) {
      return file && Number(file.size) === 0;
    }

    function addAttachmentPreview(file, sourceLabel) {
      if (!attachmentList || !file) {
        return;
      }
      if (isEmptyAttachment(file)) {
        return;
      }
      var clientId = 'attachment-' + Date.now() + '-' + Math.random().toString(16).slice(2);
      var item = document.createElement('div');
      item.className = 'ticket-attachment-item';
      item.setAttribute('data-client-id', clientId);
      item.setAttribute('data-upload-status', 'uploading');

      var thumb;
      var previewUrl = '';
      var previewLink = null;
      if (file.type && file.type.indexOf('image/') === 0) {
        previewUrl = URL.createObjectURL(file);
        previewLink = createImageViewerLink({
          href: previewUrl,
          src: previewUrl,
          caption: file.name || 'image-from-clipboard.png',
          alt: file.name || 'attachment',
          title: 'Открыть предпросмотр изображения ' + (file.name || ''),
          group: 'ticket-composer-attachments',
          className: 'ticket-attachment-preview-link',
          imgClassName: 'ticket-attachment-thumb'
        });
      } else {
        thumb = document.createElement('div');
        thumb.className = 'ticket-attachment-thumb ticket-attachment-file-thumb';
        thumb.textContent = 'Файл';
      }

      var meta = document.createElement('div');
      meta.className = 'ticket-attachment-meta';
      meta.innerHTML = '<strong></strong><small></small>';
      meta.querySelector('strong').textContent = file.name || 'image-from-clipboard.png';
      var metaSmall = meta.querySelector('small');
      renderAttachmentMeta(metaSmall, sourceLabel, 'загружаем', file.size);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ticket-attachment-remove';
      remove.title = 'Убрать вложение из ответа';
      remove.textContent = '×';
      remove.addEventListener('click', function () {
        item.parentNode.removeChild(item);
        updateAttachmentState();
        resetComposerUnlock();
      });

      item.appendChild(previewLink || thumb);
      item.appendChild(meta);
      item.appendChild(remove);
      attachmentList.appendChild(item);
      updateAttachmentState();
      resetComposerUnlock();
      initTicketImageViewer(item);
      requestAttachmentUpload(file, clientId).then(function (data) {
        var attachment = data && data.attachment ? data.attachment : data;
        item.setAttribute('data-upload-status', 'uploaded');
        item.setAttribute('data-upload-id', attachment && attachment.upload_id ? attachment.upload_id : clientId);
        if (attachment && (attachment.url || attachment.full_url)) {
          item.setAttribute('data-file-url', attachment.url || attachment.full_url);
        }
        renderAttachmentMeta(metaSmall, sourceLabel, '', file.size);
      }).catch(function (error) {
        item.setAttribute('data-upload-status', 'failed');
        renderAttachmentMeta(metaSmall, sourceLabel, 'не загружено', file.size);
        handleSupportRequestError(error, {
          message: 'Не удалось загрузить вложение.'
        });
      }).finally(function () {
        syncComposerSendSafety();
      });
    }

    if (templateSelect && replyTextarea) {
      renderTemplateOptions('');
      templateSelect.addEventListener('change', function () {
        var selected = templateSelect.options[templateSelect.selectedIndex];
        var text = selected.getAttribute('data-template-text') || '';
        var title = selected.textContent.trim();
        syncTemplateSearchFromSelect();
        renderTemplateOptions(templateSearch ? templateSearch.value : '');
        if (text) {
          appliedTemplateText = text;
          updateTemplateStateUi(title);
          showPanel('public-reply');
          replaceTextareaValueUndoable(replyTextarea, text);
          autoGrow(replyTextarea);
          touchComposerDraft();
        } else {
          clearAppliedTemplate();
        }
      });
    }

    if (templateSearch && templateSelect) {
      templateSearch.addEventListener('focus', function () {
        openTemplateMenu();
      });
      templateSearch.addEventListener('mousedown', function () {
        openTemplateMenu();
      });
      templateSearch.addEventListener('click', function () {
        openTemplateMenu();
      });
      templateSearch.addEventListener('input', function () {
        openTemplateMenu();
      });
      templateSearch.addEventListener('keydown', function (event) {
        var visibleOptions = templateOptionsList ? templateOptionsList.querySelectorAll('.ticket-template-combobox-option') : [];
        var activeOption = templateOptionsList && templateOptionsList.querySelector('.ticket-template-combobox-option.is-active');
        var activeIndex = Array.prototype.indexOf.call(visibleOptions, activeOption);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          openTemplateMenu();
          if (!visibleOptions.length) {
            return;
          }
          if (activeIndex < 0) {
            activeIndex = event.key === 'ArrowDown' ? 0 : visibleOptions.length - 1;
          } else {
            activeIndex += event.key === 'ArrowDown' ? 1 : -1;
            if (activeIndex < 0) {
              activeIndex = visibleOptions.length - 1;
            }
            if (activeIndex >= visibleOptions.length) {
              activeIndex = 0;
            }
          }
          Array.prototype.forEach.call(visibleOptions, function (option) {
            option.classList.remove('is-active');
          });
          visibleOptions[activeIndex].classList.add('is-active');
          visibleOptions[activeIndex].scrollIntoView({ block: 'nearest' });
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          var picked = activeOption || (visibleOptions.length === 1 ? visibleOptions[0] : null);
          if (picked) {
            selectTemplateOption(picked.getAttribute('data-template-value'));
          }
        }
        if (event.key === 'Escape') {
          closeTemplateMenu();
        }
      });
    }

    if (templateToggle) {
      templateToggle.addEventListener('mousedown', function (event) {
        event.preventDefault();
      });
      templateToggle.addEventListener('click', function (event) {
        event.preventDefault();
        if (templateMenu && !templateMenu.hidden) {
          closeTemplateMenu();
        } else {
          openTemplateMenu();
          if (templateSearch) {
            templateSearch.focus();
          }
        }
      });
    }

    if (templateOptionsList) {
      templateOptionsList.addEventListener('click', function (event) {
        var optionButton = event.target.closest('.ticket-template-combobox-option');
        if (!optionButton) {
          return;
        }
        selectTemplateOption(optionButton.getAttribute('data-template-value'));
      });
    }

    document.addEventListener('click', function (event) {
      if (templateCombobox && !templateCombobox.contains(event.target)) {
        closeTemplateMenu();
      }
    });

    if (templateAdd) {
      templateAdd.addEventListener('click', function () {
        if (!activeReplyContext) {
          if (templatePopover) {
            templatePopover.hidden = true;
          }
          if (templateWarning) {
            templateWarning.hidden = false;
          }
          return;
        }
        if (templateWarning) {
          templateWarning.hidden = true;
        }
        if (templatePopover) {
          templatePopover.hidden = false;
        }
        if (templateName) {
          templateName.value = '';
          templateName.focus();
        }
      });
    }

    if (templateCancel) {
      templateCancel.addEventListener('click', function () {
        hideTemplateCreateUi();
        if (templateSearch) {
          templateSearch.focus();
        }
      });
    }

    if (templateSave && templateSelect) {
      templateSave.addEventListener('click', function () {
        if (templateSave.disabled) {
          return;
        }
        var name = templateName && templateName.value.trim();
        if (!name) {
          if (templateName) {
            templateName.focus();
          }
          return;
        }
        var sourceText = replyTextarea && replyTextarea.value.trim();
        var templateText = sourceText || (activeReplyContext && activeReplyContext.text) || '';
        var payload = {
          ticket_id: getTicketId(),
          title: name,
          body: templateText,
          source_message_id: activeReplyContext ? activeReplyContext.messageId : ''
        };
        templateSave.disabled = true;
        templateSave.classList.add('is-loading');
        templateSave.textContent = 'Сохраняем';
        requestQuickTemplateCreate(payload).then(function (data) {
          var template = data && data.template ? data.template : {};
          var option = document.createElement('option');
          option.value = template.id || ('custom-' + Date.now());
          option.textContent = template.title || name;
          option.setAttribute('data-template-text', template.body || templateText);
          templateSelect.appendChild(option);
          templateSelect.value = option.value;
          renderTemplateOptions('');
          hideTemplateCreateUi();
          templateSelect.dispatchEvent(new Event('change'));
        }).catch(function (error) {
          if (templateName) {
            templateName.focus();
          }
          handleSupportRequestError(error, {
            message: 'Не удалось сохранить шаблон ответа.'
          });
        }).finally(function () {
          templateSave.disabled = false;
          templateSave.classList.remove('is-loading');
          templateSave.textContent = 'Сохранить';
        });
      });
    }

    Array.prototype.forEach.call(noteButtons, function (button) {
      button.addEventListener('click', function () {
        if (noteTextarea) {
          noteTextarea.value = button.getAttribute('data-note-template') || '';
          showPanel('internal-note');
          autoGrow(noteTextarea);
          noteTextarea.focus();
        }
      });
    });

    if (replyPreviewClose && replyPreview) {
      replyPreviewClose.addEventListener('click', function () {
        resetReplyPreview();
      });
    }

    if (templateClear) {
      templateClear.addEventListener('click', function () {
        clearAppliedTemplate();
        if (templateSearch) {
          templateSearch.focus();
          openTemplateMenu();
        }
      });
    }

    if (templateChipClear) {
      templateChipClear.addEventListener('click', function () {
        clearAppliedTemplate();
        if (replyTextarea) {
          replyTextarea.focus();
        }
      });
    }

    if (replyPreviewBody && replyPreview) {
      replyPreviewBody.addEventListener('click', function () {
        focusMessage(replyPreview.getAttribute('data-target-message'));
      });
    }

    if (editPreviewBody && editPreview) {
      editPreviewBody.addEventListener('click', function () {
        focusMessage(editPreview.getAttribute('data-target-message'));
      });
    }

    if (editPreviewClose) {
      editPreviewClose.addEventListener('click', function () {
        clearComposerEditMode();
        if (replyTextarea) {
          replyTextarea.value = '';
          autoGrow(replyTextarea);
        }
      });
    }

    Array.prototype.forEach.call(controlButtons, function (button) {
      button.addEventListener('click', function () {
        var panelName = button.getAttribute('data-panel');
        if (panelName === 'internal-note' || (!panelName && /Заметка/i.test(button.textContent || ''))) {
          showPanel('internal-note');
          if (noteTextarea) {
            autoGrow(noteTextarea);
            noteTextarea.focus();
          }
          return;
        }
        if (panelName === 'quick-template') {
          showPanel('quick-template');
          if (templateSearch) {
            templateSearch.focus();
            openTemplateMenu();
          }
          return;
        }
        showPanel(panelName || 'public-reply');
        if (replyTextarea) {
          autoGrow(replyTextarea);
          replyTextarea.focus();
        }
      });
    });

    if (replyTextarea) {
      autoGrow(replyTextarea);
      if (replyTextarea.form) {
        replyTextarea.form.addEventListener('submit', function (event) {
          event.preventDefault();
          sendComposerMessage();
        });
        replyTextarea.form.addEventListener('keydown', function (event) {
          handleComposerSendShortcut(event);
        });
      }
      replyTextarea.addEventListener('input', function () {
        autoGrow(replyTextarea);
        syncAppliedTemplateAfterTextareaInput();
        if (replyTextarea.value.trim()) {
          setComposerValidation('');
        } else if (activeComposerTranslation) {
          resetComposerTranslation();
        }
        if (activeComposerTranslation) {
          syncComposerTranslationUi();
        }
        touchComposerDraft();
      });
      replyTextarea.addEventListener('keydown', function (event) {
        handleComposerSendShortcut(event);
      });
      replyTextarea.addEventListener('paste', function (event) {
        var items = event.clipboardData && event.clipboardData.items;
        var pastedImage = false;
        if (!items) {
          return;
        }
        Array.prototype.forEach.call(items, function (item) {
          if (item.kind === 'file') {
            var file = item.getAsFile();
            if (file) {
              pastedImage = true;
              if (!file.name) {
                try {
                  file = new File([file], 'image-from-clipboard.png', { type: file.type || 'image/png' });
                } catch (e) {}
              }
              addAttachmentPreview(file, 'вставлено');
            }
          }
        });
      });
    }

    if (composerTranslateButton) {
      composerTranslateButton.addEventListener('click', function () {
        if (!replyTextarea) {
          return;
        }
        if (activeComposerTranslation && !isComposerTranslationStale()) {
          showComposerTranslationModal();
          return;
        }
        if (activeEditContext) {
          setComposerValidation('Перевод перед отправкой доступен для нового ответа, а не для редактирования сообщения.');
          return;
        }
        var originalText = replyTextarea.value.trim();
        if (!originalText) {
          setComposerValidation('Напишите текст ответа, который нужно перевести на язык клиента.');
          return;
        }
        if (composerTranslateButton.classList.contains('is-loading')) {
          return;
        }
        composerTranslateButton.disabled = true;
        composerTranslateButton.classList.add('is-loading');
        if (composerTranslateChip) {
          composerTranslateChip.classList.add('is-loading');
        }
        composerTranslateButton.setAttribute('aria-busy', 'true');
        requestComposerTranslation(originalText, {
          sourceLanguage: getSelectedTranslationSource(),
          targetLanguage: getSelectedTranslationTarget()
        }).then(function (translationData) {
          setComposerTranslation(translationData);
          persistPreparedTranslationRoute();
        }).catch(function (error) {
          setComposerValidation('');
          handleSupportRequestError(error, {
            message: 'Не удалось подготовить перевод.',
            retry: function () {
              composerTranslateButton.click();
            }
          });
        }).finally(function () {
          composerTranslateButton.disabled = false;
          composerTranslateButton.classList.remove('is-loading');
          if (composerTranslateChip) {
            composerTranslateChip.classList.remove('is-loading');
          }
          composerTranslateButton.setAttribute('aria-busy', 'false');
          syncComposerTranslationUi();
        });
      });
    }

    if (composerTranslateClear) {
      composerTranslateClear.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        resetComposerTranslation({ restoreOriginal: true });
        if (composerTranslateButton) {
          composerTranslateButton.focus();
        }
      });
    }

    Array.prototype.forEach.call(composerTranslationCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hideComposerTranslationModal();
      });
    });

    if (clientTranslationSource) {
      clientTranslationSource.addEventListener('change', function () {
        applyClientTranslationLanguageControls();
      });
    }

    if (clientTranslationTarget) {
      clientTranslationTarget.addEventListener('change', function () {
        applyClientTranslationLanguageControls();
      });
    }

    syncProfileTranslationOptionLabels();
    syncTranslationDirectionControls(getSelectedTranslationSource(), getSelectedTranslationTarget());

    if (composerTranslationRefresh) {
      composerTranslationRefresh.addEventListener('click', function () {
        refreshComposerTranslationFromModal();
      });
    }

    if (sendButton) {
      sendButton.addEventListener('click', function (event) {
        if (activeEditContext) {
          event.preventDefault();
          sendComposerMessage();
        }
      });
    }

    Array.prototype.forEach.call(assignTicketButtons, function (button) {
      button.addEventListener('click', function (event) {
        var assignUrl = button.getAttribute('href');
        var assigneeName = button.getAttribute('data-assignee-name') || 'Текущий оператор';
        event.preventDefault();
        if (button.classList.contains('is-loading') || button.classList.contains('is-assigned')) {
          return;
        }
        setAssignButtonsLoading(true);
        requestAssignTicket(assignUrl, assigneeName).then(function (data) {
          applyTicketAssignee((data && data.assignee_name) || assigneeName);
        }).catch(function (error) {
          setAssignButtonsLoading(false);
          button.classList.add('is-error');
          button.innerHTML = '<span class="ui-icon" aria-hidden="true">!</span> Повторить';
          handleSupportRequestError(error, {
            message: 'Не удалось назначить тикет.',
            retry: function () {
              button.click();
            }
          });
        });
      });
    });

    syncTicketEscalationLabels(ticketStatusLabels[0] && ticketStatusLabels[0].getAttribute('data-ticket-status') || 'waiting_support');

    Array.prototype.forEach.call(ticketStatusSelects, function (select) {
      select.addEventListener('change', function () {
        var nextStatus = select.value;
        var previousStatus = ticketStatusLabels[0] && ticketStatusLabels[0].getAttribute('data-ticket-status') || 'waiting_support';
        if (nextStatus === 'resolved') {
          syncTicketStatusSelects(previousStatus);
          showResolveTicketModal(previousStatus);
          return;
        }
        if (nextStatus === 'closed') {
          syncTicketStatusSelects(previousStatus);
          showCloseTicketModal();
          return;
        }
        setTicketStatusSelectsDisabled(true);
        requestTicketStatusChange(nextStatus, null, select).then(function (data) {
          applyTicketStatus((data && data.status) || nextStatus, data && data.actor_name);
        }).catch(function (error) {
          syncTicketStatusSelects(previousStatus);
          handleSupportRequestError(error, {
            message: 'Не удалось изменить статус тикета.'
          });
        }).finally(function () {
          setTicketStatusSelectsDisabled(false);
        });
      });
    });

    Array.prototype.forEach.call(ticketResolveCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hideResolveTicketModal();
      });
    });

    if (ticketResolveConfirm) {
      ticketResolveConfirm.addEventListener('click', function () {
        var reasonLabel = ticketResolveReason && ticketResolveReason.options[ticketResolveReason.selectedIndex] ? ticketResolveReason.options[ticketResolveReason.selectedIndex].textContent.trim() : 'Резолюция не указана';
        var payload = {
          resolution_reason: ticketResolveReason ? ticketResolveReason.value : '',
          resolution_comment: ticketResolveComment ? ticketResolveComment.value.trim() : ''
        };
        ticketResolveConfirm.disabled = true;
        ticketResolveConfirm.textContent = 'Сохраняем...';
        setTicketStatusSelectsDisabled(true);
        requestTicketStatusChange('resolved', payload).then(function (data) {
          applyTicketStatus((data && data.status) || 'resolved', data && data.actor_name);
          addTicketHistoryItem('Резолюция', reasonLabel + ' · только что', '✓');
          if (ticketResolveComment) {
            ticketResolveComment.value = '';
          }
          hideResolveTicketModal(true);
        }).catch(function (error) {
          ticketResolveConfirm.disabled = false;
          ticketResolveConfirm.textContent = 'Повторить';
          setTicketStatusSelectsDisabled(false);
          syncTicketStatusSelects(pendingStatusBeforeResolve || 'waiting_support');
          handleSupportRequestError(error, {
            message: 'Не удалось сохранить решение тикета.'
          });
        }).finally(function () {
          setTicketStatusSelectsDisabled(false);
        });
      });
    }

    if (ticketEscalateButton) {
      ticketEscalateButton.addEventListener('click', function () {
        showEscalateTicketModal();
      });
    }

    Array.prototype.forEach.call(ticketEscalateCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hideEscalateTicketModal();
      });
    });

    if (ticketEscalateConfirm && ticketEscalateButton) {
      ticketEscalateConfirm.addEventListener('click', function () {
        var nextStatus = ticketEscalateButton.getAttribute('data-status') || 'escalated';
        var teamLabel = ticketEscalateTeam && ticketEscalateTeam.options[ticketEscalateTeam.selectedIndex] ? ticketEscalateTeam.options[ticketEscalateTeam.selectedIndex].textContent.trim() : 'Команда эскалации';
        var reasonLabel = ticketEscalateReason && ticketEscalateReason.options[ticketEscalateReason.selectedIndex] ? ticketEscalateReason.options[ticketEscalateReason.selectedIndex].textContent.trim() : 'Причина не указана';
        var payload = {
          escalation_team: ticketEscalateTeam ? ticketEscalateTeam.value : '',
          escalation_reason: ticketEscalateReason ? ticketEscalateReason.value : '',
          escalation_comment: ticketEscalateComment ? ticketEscalateComment.value.trim() : ''
        };
        ticketEscalateConfirm.disabled = true;
        ticketEscalateConfirm.textContent = 'Передаем...';
        ticketEscalateButton.disabled = true;
        ticketEscalateButton.classList.add('is-loading');
        requestTicketStatusChange(nextStatus, payload).then(function (data) {
          applyTicketStatus((data && data.status) || nextStatus, data && data.actor_name);
          addTicketHistoryItem('Эскалация', teamLabel + ' · ' + reasonLabel + ' · только что', '↗');
          if (ticketEscalateComment) {
            ticketEscalateComment.value = '';
          }
          hideEscalateTicketModal();
        }).catch(function (error) {
          ticketEscalateConfirm.disabled = false;
          ticketEscalateConfirm.textContent = 'Повторить';
          handleSupportRequestError(error, {
            message: 'Не удалось передать тикет на эскалацию.'
          });
        }).finally(function () {
          ticketEscalateButton.disabled = false;
          ticketEscalateButton.classList.remove('is-loading');
        });
      });
    }

    if (closeTicketButton) {
      closeTicketButton.addEventListener('click', function (event) {
        event.preventDefault();
        showCloseTicketModal();
      });
    }

    Array.prototype.forEach.call(closeTicketCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hideCloseTicketModal();
      });
    });

    if (closeTicketConfirm && closeTicketActionSource) {
      closeTicketConfirm.addEventListener('click', function () {
        var closeUrl = getCloseTicketUrl();
        var queueUrl = getCloseTicketQueueUrl();
        var closePayload = {
          reason: closeTicketReason ? closeTicketReason.value : 'resolved',
          resolution: closeTicketResolution ? closeTicketResolution.value.trim() : ''
        };
        closeTicketConfirm.disabled = true;
        closeTicketConfirm.textContent = 'Закрываем...';
        requestCloseTicket(closeUrl, closePayload).then(function (data) {
          clearComposerDraft();
          window.location.href = SUPPORT_TICKET_DEMO_MODE ? 'support-ticket-queue-final.html' : data && data.redirect_url || queueUrl;
        }).catch(function (error) {
          closeTicketConfirm.disabled = false;
          closeTicketConfirm.textContent = 'Повторить';
          handleSupportRequestError(error, {
            message: 'Не удалось закрыть тикет.'
          });
        });
      });
    }

    Array.prototype.forEach.call(messageDeleteCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hideMessageDeleteModal();
      });
    });

    if (messageDeleteConfirm) {
      messageDeleteConfirm.addEventListener('click', function () {
        if (messageDeleteConfirm.disabled || messageDeleteConfirm.getAttribute('data-delete-enabled') !== 'true') {
          return;
        }
        var message = pendingDeleteMessage;
        if (!message || !canDeleteMessage(message)) {
          handleSupportRequestError(new Error('Message delete is not allowed'), {
            message: 'Это сообщение нельзя удалить.'
          });
          return;
        }
        var messageId = getMessageId(message);
        messageDeleteConfirm.disabled = true;
        messageDeleteConfirm.classList.add('is-loading');
        messageDeleteConfirm.textContent = 'Удаляем...';
        requestMessageDelete(message).then(function (data) {
          markMessageDeleted(message, data && data.message_id || messageId);
          hideMessageDeleteModal();
        }).catch(function (error) {
          handleSupportRequestError(error, {
            message: 'Не удалось удалить сообщение.'
          });
        }).finally(function () {
          messageDeleteConfirm.classList.remove('is-loading');
          messageDeleteConfirm.textContent = 'Удалить';
          messageDeleteConfirm.disabled = messageDeleteConfirm.getAttribute('data-delete-enabled') !== 'true';
        });
      });
    }

    if (ticketPaymentOpen) {
      ticketPaymentOpen.addEventListener('click', function () {
        showPaymentModal();
      });
    }

    Array.prototype.forEach.call(ticketPaymentCancelButtons, function (button) {
      button.addEventListener('click', function () {
        hidePaymentModal();
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && ticketPaymentModal && !ticketPaymentModal.hidden) {
        hidePaymentModal();
      }
      if (event.key === 'Escape' && closeTicketModal && !closeTicketModal.hidden) {
        hideCloseTicketModal();
      }
      if (event.key === 'Escape' && messageDeleteModal && !messageDeleteModal.hidden) {
        hideMessageDeleteModal();
      }
      if (event.key === 'Escape' && ticketEscalateModal && !ticketEscalateModal.hidden) {
        hideEscalateTicketModal();
      }
      if (event.key === 'Escape' && ticketResolveModal && !ticketResolveModal.hidden) {
        hideResolveTicketModal();
      }
      if (event.key === 'Escape' && composerTranslationModal && !composerTranslationModal.hidden) {
        hideComposerTranslationModal();
      }
    });

    if (noteTextarea) {
      autoGrow(noteTextarea);
      noteTextarea.addEventListener('input', function () {
        autoGrow(noteTextarea);
      });
      noteTextarea.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          saveInternalNote();
        }
      });
    }

    if (noteSave) {
      noteSave.addEventListener('click', function () {
        saveInternalNote();
      });
    }

    if (composerAttachToggle) {
      composerAttachToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleComposerAttachMenu();
      });
    }

    Array.prototype.forEach.call(composerAttachOptions, function (option) {
      option.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        chooseComposerAttachment(option.getAttribute('data-attachment-kind') || 'file');
      });
    });

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (!fileInput.files || !fileInput.files.length) {
          return;
        }
        Array.prototype.forEach.call(fileInput.files, function (file) {
          addAttachmentPreview(file, 'выбрано');
        });
      });
    }

    if (threadSearchInput) {
      threadSearchInput.addEventListener('input', function () {
        applyThreadSearchAndFilter();
      });
      threadSearchInput.addEventListener('focus', function () {
        renderThreadSearchResults();
      });
      threadSearchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          var enterIndex = threadSearchIndex === -1 ? 0 : threadSearchIndex + (event.shiftKey ? -1 : 1);
          setCurrentThreadSearchMatch(enterIndex);
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          var direction = event.key === 'ArrowDown' ? 1 : -1;
          var nextIndex = threadSearchIndex === -1 ? 0 : threadSearchIndex + direction;
          setCurrentThreadSearchMatch(nextIndex, { scroll: false, highlight: false });
        }
        if (event.key === 'Escape') {
          threadSearchInput.value = '';
          applyThreadSearchAndFilter();
        }
      });
    }

    if (threadSearchClear) {
      threadSearchClear.addEventListener('click', function () {
        if (threadSearchInput) {
          threadSearchInput.value = '';
          threadSearchInput.focus();
        }
        applyThreadSearchAndFilter();
      });
    }

    if (threadSearchResults) {
      threadSearchResults.addEventListener('click', function (event) {
        var result = event.target.closest('.ticket-thread-search-result');
        if (!result) {
          return;
        }
        event.preventDefault();
        setCurrentThreadSearchMatch(parseInt(result.getAttribute('data-search-index'), 10) || 0);
      });
    }

    if (threadSearchPrev) {
      threadSearchPrev.addEventListener('click', function () {
        setCurrentThreadSearchMatch(threadSearchIndex - 1);
      });
    }

    if (threadSearchNext) {
      threadSearchNext.addEventListener('click', function () {
        setCurrentThreadSearchMatch(threadSearchIndex + 1);
      });
    }

    Array.prototype.forEach.call(threadFilterButtons, function (button) {
      button.addEventListener('click', function () {
        activeThreadFilter = button.getAttribute('data-thread-filter') || 'all';
        Array.prototype.forEach.call(threadFilterButtons, function (item) {
          item.classList.toggle('active', item === button);
        });
        if (threadFilterLabel) {
          threadFilterLabel.textContent = button.textContent.trim() || 'Все';
        }
        if (threadFilterDropdown) {
          threadFilterDropdown.classList.remove('open');
        }
        applyThreadSearchAndFilter();
      });
    });

    if (threadFilterToggle && threadFilterDropdown) {
      threadFilterToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        threadFilterDropdown.classList.toggle('open');
      });
    }

    initCollapsibleRightBoxes();
    updateStickySidePanel(true);
    window.addEventListener('scroll', function () {
      updateStickySidePanel(false);
    }, { passive: true });
    window.addEventListener('resize', function () {
      updateStickySidePanel(true);
    });
    rebuildPinnedItemsFromMessages();
    syncAllMessagePinActions();
    syncAllMessageTranslationActions();
    syncPinnedToggleState();
    applyThreadSearchAndFilter();

    if (pinnedToggle && pinnedBar) {
      pinnedToggle.addEventListener('click', function () {
        pinnedBar.hidden = !pinnedBar.hidden;
        syncPinnedToggleState();
      });
    }

    if (pinnedClose && pinnedBar) {
      pinnedClose.addEventListener('click', function () {
        pinnedBar.hidden = true;
        syncPinnedToggleState();
      });
    }

    if (pinnedContent && pinnedBar) {
      pinnedContent.addEventListener('click', function (event) {
        var removeButton = event.target.closest('.ticket-pinned-item-remove');
        var item = event.target.closest('.ticket-pinned-item');
        var targetMessageId = item ? item.getAttribute('data-target-message') : pinnedBar.getAttribute('data-target-message');
        if (removeButton) {
          event.preventDefault();
          event.stopPropagation();
          var message = findMessageById(targetMessageId);
          removeButton.disabled = true;
          removeButton.classList.add('is-loading');
          if (message) {
            requestMessagePin(message, false).then(function (data) {
              var finalIsPinned = Boolean(data && typeof data.is_pinned !== 'undefined' ? data.is_pinned : false);
              applyPinnedState(message, finalIsPinned, getMessageAuthor(message), getMessageText(message));
            }).catch(function (error) {
              handleSupportRequestError(error, {
                message: 'Не удалось открепить сообщение.'
              });
            }).finally(function () {
              removeButton.disabled = false;
              removeButton.classList.remove('is-loading');
            });
          } else {
            removePinnedMessage(targetMessageId);
          }
          return;
        }
        if (targetMessageId) {
          focusMessage(targetMessageId);
        }
      });
    }

    function closeMessageMenus(exceptMenu) {
      Array.prototype.forEach.call(document.querySelectorAll('.ticket-message-more'), function (menu) {
        if (menu !== exceptMenu) {
          menu.classList.remove('open');
          var toggle = menu.querySelector('.ticket-message-more-toggle');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }

    Array.prototype.forEach.call(sideTabs, function (tab) {
      tab.addEventListener('click', function (event) {
        var targetSelector = tab.getAttribute('href');
        var target = targetSelector && document.querySelector(targetSelector);
        var tabsRoot = tab.closest('.ticket-side-tabs');
        var contentRoot = target && target.closest('.ticket-side-tab-content');
        if (!target || !tabsRoot || !contentRoot) {
          return;
        }
        event.preventDefault();
        Array.prototype.forEach.call(tabsRoot.querySelectorAll('li'), function (item) {
          item.classList.remove('active');
        });
        tab.parentNode.classList.add('active');
        Array.prototype.forEach.call(contentRoot.querySelectorAll('.tab-pane'), function (pane) {
          pane.classList.toggle('active', pane === target);
        });
      });
    });

    if (queueCheckAll) {
      queueCheckAll.addEventListener('change', function () {
        Array.prototype.forEach.call(queueRowChecks, function (checkbox) {
          checkbox.checked = queueCheckAll.checked;
        });
        syncQueueSelection();
      });
    }

    Array.prototype.forEach.call(queueRowChecks, function (checkbox) {
      checkbox.addEventListener('change', syncQueueSelection);
    });

    Array.prototype.forEach.call(queueFilterControls, function (control) {
      control.addEventListener('input', syncQueueResetVisibility);
      control.addEventListener('change', syncQueueResetVisibility);
    });

    if (queueSelectedClear) {
      queueSelectedClear.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        clearQueueSelection();
        if (queueCheckAll) {
          queueCheckAll.focus();
        }
      });
    }

    syncQueueSelection();
    syncQueueResetVisibility();

    if (queueBulkAssignButton) {
      queueBulkAssignButton.addEventListener('click', function () {
        if (queueBulkAssignButton.disabled) {
          return;
        }
        toggleQueuePriorityDropdown(false);
        openQueueAssignModal();
      });
    }

    if (queueAssigneeSelect && queueAssignConfirm) {
      queueAssigneeSelect.addEventListener('change', function () {
        queueAssignConfirm.disabled = !queueAssigneeSelect.value;
        if (queueAssignHelp) {
          queueAssignHelp.textContent = '';
        }
      });
    }

    Array.prototype.forEach.call(queueAssignCancelButtons, function (button) {
      button.addEventListener('click', hideQueueAssignModal);
    });

    if (queueAssignConfirm) {
      queueAssignConfirm.addEventListener('click', function () {
        var selectedRows = getSelectedQueueRows();
        var ticketIds = getSelectedQueueTicketIds();
        var selectedOption = queueAssigneeSelect && queueAssigneeSelect.options[queueAssigneeSelect.selectedIndex];
        var assigneeId = queueAssigneeSelect ? queueAssigneeSelect.value : '';
        var assigneeName = selectedOption
          ? (selectedOption.getAttribute('data-assignee-name') || selectedOption.textContent.trim())
          : '';
        if (!selectedRows.length || !assigneeId) {
          if (queueAssignHelp) {
            queueAssignHelp.textContent = !selectedRows.length
              ? 'Выберите хотя бы один тикет в таблице.'
              : 'Выберите сотрудника службы поддержки.';
          }
          return;
        }
        queueAssignConfirm.disabled = true;
        queueAssignConfirm.classList.add('is-loading');
        queueAssignConfirm.innerHTML = '<span class="ui-icon" aria-hidden="true">↻</span> Назначаем...';
        requestQueueBulkAssign(ticketIds, assigneeId, assigneeName).then(function (data) {
          applyQueueBulkAssignee(selectedRows, (data && data.assignee_name) || assigneeName);
          applyQueueTicketRevisions(selectedRows, data);
          hideQueueAssignModal();
          setQueueToolbarHint('Ответственный назначен: ' + getQueueTicketCountLabel(selectedRows.length) + '.');
          clearQueueSelection();
        }).catch(function (error) {
          if (queueAssignHelp) {
            queueAssignHelp.textContent = 'Не удалось назначить тикеты. Попробуйте еще раз.';
          }
          handleSupportRequestError(error, {
            message: 'Не удалось назначить выбранные тикеты.'
          });
        }).finally(function () {
          queueAssignConfirm.classList.remove('is-loading');
          queueAssignConfirm.innerHTML = 'Назначить';
          queueAssignConfirm.disabled = !(queueAssigneeSelect && queueAssigneeSelect.value);
        });
      });
    }

    if (queueBulkPriorityButton) {
      queueBulkPriorityButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (queueBulkPriorityButton.disabled) {
          return;
        }
        toggleQueuePriorityDropdown();
      });
    }

    Array.prototype.forEach.call(queuePriorityItems, function (item) {
      item.addEventListener('click', function () {
        var selectedRows = getSelectedQueueRows();
        var ticketIds = getSelectedQueueTicketIds();
        var priorityValue = item.getAttribute('data-support-queue-priority') || '';
        var priorityLabel = item.getAttribute('data-priority-label') || item.textContent.trim();
        var priorityClass = item.getAttribute('data-priority-class') || 'label-default';
        if (!selectedRows.length || !priorityValue) {
          toggleQueuePriorityDropdown(false);
          return;
        }
        toggleQueuePriorityDropdown(false);
        queueBulkPriorityButton.disabled = true;
        queueBulkPriorityButton.classList.add('is-loading');
        queueBulkPriorityButton.innerHTML = '<span class="ui-icon" aria-hidden="true">↻</span> Меняем...';
        requestQueueBulkPriority(ticketIds, priorityValue, priorityLabel).then(function (data) {
          applyQueueBulkPriority(selectedRows, (data && data.priority_label) || priorityLabel, priorityClass);
          applyQueueTicketRevisions(selectedRows, data);
          setQueueToolbarHint('Приоритет обновлен: ' + getQueueTicketCountLabel(selectedRows.length) + '.');
          clearQueueSelection();
        }).catch(function (error) {
          handleSupportRequestError(error, {
            message: 'Не удалось изменить приоритет выбранных тикетов.'
          });
        }).finally(function () {
          queueBulkPriorityButton.classList.remove('is-loading');
          queueBulkPriorityButton.innerHTML = '<span class="ui-icon" aria-hidden="true">◇</span> Приоритет';
          syncQueueSelection();
        });
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.ticket-message-more')) {
        closeMessageMenus();
      }
      if (threadFilterDropdown && !event.target.closest('.ticket-thread-filter')) {
        threadFilterDropdown.classList.remove('open');
      }
      if (queuePriorityDropdown && !event.target.closest('.support-queue-priority-dropdown')) {
        toggleQueuePriorityDropdown(false);
      }
      if (composerAttach && !event.target.closest('.ticket-composer-attach')) {
        closeComposerAttachMenu();
      }
      var quote = event.target.closest('.ticket-reply-quote[data-reply-target]');
      if (quote) {
        event.preventDefault();
        focusMessage(quote.getAttribute('data-reply-target'));
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        toggleQueuePriorityDropdown(false);
        closeComposerAttachMenu();
        if (queueAssignModal && !queueAssignModal.hidden) {
          hideQueueAssignModal();
        }
      }
      var quote = event.target.closest && event.target.closest('.ticket-reply-quote[data-reply-target]');
      if (!quote || (event.key !== 'Enter' && event.key !== ' ')) {
        return;
      }
      event.preventDefault();
      focusMessage(quote.getAttribute('data-reply-target'));
    });

    window.addEventListener('resize', function () {
      if (templateMenu && !templateMenu.hidden) {
        positionTemplateMenu();
      }
      if (composerAttach && composerAttach.classList.contains('open')) {
        positionComposerAttachMenu();
      }
    });

    document.addEventListener('scroll', function () {
      if (templateMenu && !templateMenu.hidden) {
        positionTemplateMenu();
      }
      if (composerAttach && composerAttach.classList.contains('open')) {
        positionComposerAttachMenu();
      }
    }, true);

    function handleMessageToolClick(tool) {
      var message = tool.closest('.ticket-message');
      var action = tool.getAttribute('data-action');
      var authorText = getMessageAuthor(message);
      var bodyText = getMessageText(message);
      var messageId = getMessageId(message);

      if (!message || !action || message.classList.contains('ticket-message-deleted')) {
        return;
      }

      clearNewMessageState(message);

      if (action === 'reply') {
        clearComposerEditMode();
        var activeMode = getActiveComposerMode();
        showPanel(activeMode === 'quick-template' ? 'quick-template' : 'public-reply');
        activeReplyContext = {
          author: authorText,
          text: bodyText,
          messageId: messageId
        };
        if (replyToInput) {
          replyToInput.value = messageId;
        }
        hideTemplateCreateUi();
        ensureReplyPreview(authorText, getOneLinePreview(bodyText, 140), messageId);
        touchComposerDraft();
        if (activeMode === 'quick-template' && templateSearch) {
          templateSearch.focus();
          openTemplateMenu();
        } else if (replyTextarea) {
          replyTextarea.focus();
        }
      }

      if (action === 'copy') {
        writeClipboard(bodyText);
        tool.classList.add('is-done');
        tool.title = 'Текст сообщения скопирован';
        if (tool.classList.contains('ticket-message-menu-action')) {
          tool.innerHTML = '<span class="ui-icon" aria-hidden="true">✓</span> Скопировано';
        } else {
          tool.innerHTML = '<span class="ui-icon" aria-hidden="true">✓</span><span class="sr-only">Скопировано</span>';
        }
      }

      if (action === 'translate') {
        toggleMessageTranslation(message, tool);
      }

      if (action === 'edit') {
        startMessageEdit(message);
      }

      if (action === 'pin') {
        var shouldPin = !isMessagePinned(message);
        tool.disabled = true;
        tool.classList.add('is-loading');
        requestMessagePin(message, shouldPin).then(function (data) {
          var finalIsPinned = Boolean(data && typeof data.is_pinned !== 'undefined' ? data.is_pinned : shouldPin);
          applyPinnedState(message, finalIsPinned, authorText, bodyText);
        }).catch(function (error) {
          handleSupportRequestError(error, {
            message: shouldPin ? 'Не удалось закрепить сообщение.' : 'Не удалось открепить сообщение.'
          });
        }).finally(function () {
          tool.disabled = false;
          tool.classList.remove('is-loading');
        });
      }

      if (action === 'delete') {
        if (!canDeleteMessage(message)) {
          return;
        }
        showMessageDeleteModal(message);
      }

      if (tool.classList.contains('ticket-message-menu-action')) {
        closeMessageMenus();
      }
    }

    Array.prototype.forEach.call(messageTools, function (tool) {
      if (!tool.getAttribute('data-action')) {
        return;
      }
      tool.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        handleMessageToolClick(tool);
      });
    });

    document.addEventListener('click', function (event) {
      var toggle = event.target.closest('.ticket-message-more-toggle');
      if (!toggle) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      var menu = toggle.closest('.ticket-message-more');
      var isOpen = menu && menu.classList.contains('open');
      closeMessageMenus(menu);
      if (menu) {
        menu.classList.toggle('open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      }
    }, true);

    document.addEventListener('click', function (event) {
      var tool = event.target.closest('.ticket-message-tools .ticket-message-tool[data-action], .ticket-message-tools .ticket-message-menu-action[data-action]');
      if (tool) {
        event.preventDefault();
        handleMessageToolClick(tool);
      }
    });

    if (draftState.autosaveTimer === null) {
      draftState.autosaveTimer = window.setInterval(function () {
        saveComposerDraft();
      }, draftState.autosaveMs);
    }

    window.addEventListener('pagehide', function () {
      if (draftState.isSending) {
        return;
      }
      saveLocalComposerDraft({ force: true });
    });

    syncTicketStateCounts();
    initTicketImageViewer(document);
    restoreLocalComposerDraft();
    syncComposerSendSafety();
  });
}());
