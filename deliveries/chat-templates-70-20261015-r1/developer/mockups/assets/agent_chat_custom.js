(() => {
  const root = document.querySelector('#admin-agent-chat');
  if (!root) {
    return;
  }

  const CHAT_PAGE_CONFIG = (() => {
    const configNode = document.querySelector('#adminAgentChatConfig');
    try {
      return Object.freeze({
        ...(configNode?.textContent ? JSON.parse(configNode.textContent) : {}),
        ...(window.ADMIN_AGENT_CHAT_CONFIG || {}),
      });
    } catch (error) {
      return Object.freeze(window.ADMIN_AGENT_CHAT_CONFIG || {});
    }
  })(); // Server-rendered values supplied by the Yii2 PHP view.
  const CHAT_API_ENDPOINTS = Object.freeze({
    translateDraft: '/admin/messages/translate-draft', // Translate composer text before sending.
    translateMessage: '/admin/messages/translate', // Translate an existing client message.
    sendMessage: '/admin/messages', // Create a direct or reply message.
    saveDraft: '/admin/messages/drafts/save', // Persist the current composer draft.
    queueFilter: '/admin/messages/conversations/filter', // Load a filtered conversation queue.
    conversationState: '/admin/messages/conversations/state', // Toggle favorite/pinned conversation state.
    pinnedList: '/admin/messages/pinned', // Load or create pinned-message records.
    searchMessages: '/admin/messages/search', // Search messages in the active conversation.
    conversation: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}`, // Load or delete one conversation.
    conversationRange: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/range`, // Load a message date range.
    translationDirection: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/translation-direction`, // Save per-client translation direction.
    contextSection: (conversationId, section) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/context/${encodeURIComponent(section)}`, // Save a right-panel context section.
    refreshConversation: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/refresh`, // Refresh queue, conversation and context data.
    billingAction: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/billing/action`, // Send a top-up or package-link action.
    followUp: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/follow`, // Reschedule or update a follow-up scenario.
    conversationBoundary: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/boundary`, // Load the first or last message boundary.
    reportConversation: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/report`, // Submit a user/conversation report.
    conversationControls: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/controls`, // Apply Assign, Note, Resolve and related controls.
    pinnedRecord: (pinId) => `/admin/messages/pinned/${encodeURIComponent(pinId)}`, // Delete one pinned-message record.
    message: (messageId) => `/admin/messages/${encodeURIComponent(messageId)}`, // Edit or delete one message.
    retryMessage: (messageId) => `/admin/messages/${encodeURIComponent(messageId)}/retry`, // Retry a failed outgoing message.
    aiSummary: (conversationId) => `/admin/messages/conversations/${encodeURIComponent(conversationId)}/ai/summary`, // Refresh the operator AI context for one conversation.
  });
  const CHAT_AI_ASSISTANT_CONFIG = Object.freeze({
    lossRiskVisibilityPercent: 40, // Show the loss-risk card only at or above this percentage.
    insertedDraftFeedbackMs: 1200, // Keep the successful "Inserted" button label visible briefly.
  });
  const CHAT_TRANSLATION_DEFAULT_SOURCE_LANG = 'ru'; // Default operator/source language for composer translations.
  const CHAT_TRANSLATION_TARGET_LANG = 'en'; // Default language used for demo/API translation targets.
  const CHAT_TRANSLATION_LANGUAGES = Object.freeze({
    auto: 'Auto',
    ru: 'Russian',
    en: 'English',
    es: 'Spanish',
    de: 'German',
    fr: 'French',
    pt: 'Portuguese',
  });
  const CHAT_UI_TIMING = Object.freeze({
    immediateFocusMs: 0, // Run focus/layout work on the next browser tick.
    quickUiSettleMs: 20, // Small delay before applying transient highlight classes.
    clipboardFeedbackMs: 1200, // Time to keep generic clipboard feedback visible.
    anchorHighlightMs: 1800, // Time to keep a jumped-to message highlighted.
    pinnedErrorMs: 2600, // Time to keep pinned-message drawer errors visible.
    queueSearchDebounceMs: 1000, // Delay before filtering/loading the conversation queue.
    queueSearchSpinnerMinMs: 420, // Minimum visible time for the queue-search spinner, including instant local filtering.
    chatSearchDebounceMs: 1000, // Delay before searching inside the active conversation.
    demoTranslationLatencyMs: 650, // Mock latency for composer translation requests.
    demoMessageTranslationLatencyMs: 900, // Mock latency for message translation requests.
    demoSearchLatencyMs: 220, // Mock latency for in-chat search result loading.
    chatSearchHighlightMs: 1600, // Time to highlight the currently selected search result.
    boundaryButtonMinLockMs: 1500, // Minimum disabled time for jump-to-start/end buttons.
    copyActionFeedbackMs: 1000, // Time to show copied state on message action buttons.
    actionFeedbackMs: 1200, // Time to show generic action success/error text.
    draftSavedFlashMs: 1200, // Time to show composer draft-saved visual feedback.
    hashScrollDelayMs: 250, // Delay before scrolling to a message from URL hash.
    templateMenuRepositionMs: 60, // Delay for second-pass template menu positioning.
  });
  const CHAT_COMPOSER_CONFIG = Object.freeze({
    voiceMessagesEnabled: false, // Set to true when this chat supports recording voice messages.
    emojiPickerEnabled: true, // Set to false to hide the composer emoji picker completely.
    sendUnlockEnabled: true, // Set to false to send ready composer content without the protected unlock countdown.
    unlockDelaySeconds: 5, // Countdown before the protected send button becomes ready.
    unlockTickMs: 1000, // Countdown tick interval for send unlock state.
    serverAutosaveMs: 10000, // Interval for throttled draft autosave requests to backend.
    localAutosaveMs: 400, // Delay before saving fast draft changes to localStorage.
    localDraftMaxAgeMs: 7 * 24 * 60 * 60 * 1000, // Maximum age for restoring local drafts.
    inputMinRows: 2, // Default textarea height in text rows.
    inputMaxRows: 8, // Maximum textarea rows before internal scrolling.
  });
  const CHAT_COMPOSER_EMOJIS = Object.freeze([
    '😀', '😃', '😂', '😊', '😉',
    '😍', '😘', '😎', '🤔', '😢',
    '😭', '😡', '👍', '👎', '❤️',
    '🎉', '🙏', '👌', '🔥', '✅',
  ]);
  const CHAT_MESSAGE_ACTION_CONFIG = Object.freeze({
    allowReplyToOwnOperatorMessages: true, // Set to false to hide Reply on the operator's own messages.
    replyBlockedSendStates: Object.freeze(['sending', 'failed', 'retrying']), // Outgoing states that cannot be used as reply targets yet.
    replyPreviewMaxChars: 180, // Maximum visible reply excerpt length before the composer adds an ellipsis.
  });
  const CHAT_QUEUE_CONFIG = Object.freeze({
    localFilterLimit: 80, // Use local filtering up to this number of demo/loaded items.
  });
  const CHAT_FOLLOW_CONFIG = Object.freeze({
    demoPostponeLabel: 'Tomorrow 10:00', // Demo-only label; backend returns the real next touch in the client timezone.
  });
  const CHAT_BADGE_ROLE_ORDER = Object.freeze({
    action: 0,
    constraint: 1,
    state: 2,
    signal: 2,
    context: 3,
  }); // Approved role-first badge order shared by queue, center header and right context.
  const CHAT_BADGE_TONE_CLASS_NAMES = Object.freeze([
    'badge-tone-action',
    'badge-tone-positive',
    'badge-tone-money',
    'badge-tone-signal',
    'badge-tone-warning',
    'badge-tone-muted',
  ]); // Optional semantic color classes; remove has-semantic-badge-tones from the chat root to restore base styling.
  const CHAT_BADGE_DEFINITIONS = Object.freeze([
    Object.freeze({ code: 'chats_sell', label: 'Sell', scenario: 'chats', role: 'action', tone: 'action', priority: 60, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'chats_live', label: 'Live', scenario: 'chats', role: 'state', tone: 'positive', priority: 10, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_payment_process', label: 'PP', scenario: 'chats', role: 'state', tone: 'money', priority: 20, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_paid', label: 'Paid', scenario: 'chats', role: 'context', tone: 'money', priority: 30, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_trial', label: 'Trial', scenario: 'chats', role: 'context', tone: 'muted', priority: 70, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_skeptic', label: 'Skeptic', scenario: 'chats', role: 'action', tone: 'warning', priority: 50, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_revive', label: 'Revive', scenario: 'chats', role: 'context', tone: 'muted', priority: 80, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_risk', label: 'Risk', scenario: 'chats', role: 'constraint', tone: 'warning', priority: 40, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_safe', label: 'Safe', scenario: 'chats', role: 'constraint', tone: 'positive', priority: 35, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'chats_coupon', label: 'Coupon', scenario: 'chats', role: 'context', tone: 'money', priority: 90, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'pings_fire', label: 'Fire', scenario: 'pings', role: 'signal', tone: 'signal', priority: 10, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'pings_hot', label: 'Hot', scenario: 'pings', role: 'signal', tone: 'signal', priority: 20, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'pings_new', label: 'NEW', scenario: 'pings', role: 'signal', tone: 'signal', priority: 40, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'pings_paid', label: 'Paid', scenario: 'pings', role: 'context', tone: 'money', priority: 30, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'pings_reply', label: 'Reply', scenario: 'pings', role: 'action', tone: 'action', priority: 45, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'pings_await', label: 'Await', scenario: 'pings', role: 'state', tone: 'muted', priority: 50, zones: Object.freeze(['left', 'center']) }),
    Object.freeze({ code: 'pings_revive', label: 'Revive', scenario: 'pings', role: 'context', tone: 'muted', priority: 60, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'pings_trial', label: 'Trial', scenario: 'pings', role: 'context', tone: 'muted', priority: 70, zones: Object.freeze(['left', 'center', 'right']) }),
    Object.freeze({ code: 'pings_risk', label: 'Risk', scenario: 'pings', role: 'constraint', tone: 'warning', priority: 55, zones: Object.freeze(['left', 'center', 'right']) }),
  ]); // Single frontend source of truth for the approved 19-row badge contract.
  const CHAT_BADGE_BY_CODE = new Map(
    CHAT_BADGE_DEFINITIONS.map((badge) => [badge.code, badge])
  ); // Stable badge_code lookup used by filters and rendered data attributes.
  const CHAT_BADGE_BY_SCENARIO_LABEL = new Map(
    CHAT_BADGE_DEFINITIONS.map((badge) => [`${badge.scenario}:${badge.label.toLowerCase()}`, badge])
  ); // Compatibility lookup for server/demo payloads that still contain labels.
  const CHAT_PANEL_GESTURES = Object.freeze({
    mobileMaxWidthPx: 999, // Max shell/window width where swipe gestures should control overlay panes.
    leftSwipeMinDistancePx: 56, // Minimum horizontal left swipe distance to close the conversations pane.
    rightSwipeMinDistancePx: 56, // Minimum horizontal right swipe distance to close the context pane.
    swipeMaxVerticalPx: 80, // Ignore gestures that look like vertical scrolling.
    swipeDominanceRatio: 1.25, // Horizontal movement must be stronger than vertical movement.
  });
  const CHAT_LAYOUT_BREAKPOINTS = Object.freeze({
    compactBelowPx: 1360, // Apply compact three-pane spacing below this shell width.
    rightRailBelowPx: 1200, // Collapse the right pane to its rail below this shell width.
    railsBelowPx: 1000, // Use overlay/rail panes below this shell width.
    singlePaneBelowPx: 820, // Prefer one visible workspace pane below this shell width.
    mobileViewportMaxPx: 767, // Use viewport-clamped popup positioning on phones.
  });
  const CHAT_FLOATING_UI = Object.freeze({
    viewportPaddingPx: 8, // Minimum viewport spacing for floating menus and popovers.
    popupGapPx: 6, // Gap between a trigger and its popup.
    datePopoverMinHeightPx: 190, // Minimum estimated date-range popover height.
    datePopoverMaxHeightPx: 260, // Maximum estimated date-range popover height.
    datePopoverFallbackHeightPx: 210, // Fallback before the popover is measured.
    datePopoverBoundaryGapPx: 14, // Space reserved between the date popover and composer.
    templateMenuGapPx: 4, // Gap between the template field and its floating option list.
    templateMenuMaxHeightPx: 168, // Maximum option-list height before scrolling.
    templateMenuOpenUpThresholdPx: 112, // Minimum room required to open the template list downward.
    templateMenuMinHeightPx: 96, // Minimum usable floating template-list height.
    templateMenuItemMinHeightPx: 24, // Minimum measured height for one template row.
    filterMenuFallbackWidthPx: 320, // Width used before the filter popup is measured.
    filterMenuFallbackHeightPx: 280, // Height used before the filter popup is measured.
    filterMenuMinWidthPx: 120, // Minimum clamped filter popup width.
    filterMenuMobilePaddingPx: 10, // Phone viewport padding for the queue filter popup.
    filterMenuDesktopPaddingPx: 12, // Desktop viewport padding for the queue filter popup.
    pinnedDrawerTopInsetPx: 8, // Minimum pinned drawer top offset inside the center pane.
    pinnedDrawerRightInsetPx: 12, // Minimum pinned drawer right offset inside the center pane.
    scrollBottomTolerancePx: 2, // Pixel tolerance when detecting that a pane scroller reached its bottom.
  });
  const CHAT_SYSTEM_EVENT_CONFIG = Object.freeze({
    autoScrollTolerancePx: 80, // Keep the message stream at the bottom only when the operator is already near it.
    timeLocale: 'ru-RU', // Locale used for technical-event time labels when the server does not supply one.
  });
  const CHAT_SYSTEM_EVENT_TONES = new Set([
    'info',
    'positive',
    'warning',
    'muted',
  ]); // Allowed presentation tones for server-authored technical timeline events.
  const CHAT_PAID_SESSION_EVENT_ICONS = Object.freeze({
    offer_sent: '<path d="M4 12h12M12 6l6 6-6 6"></path>', // Icon for a paid-session offer sent to the client.
    offer_accepted: '<path d="m5 12 4 4L19 6"></path>', // Icon for server-confirmed client consent.
    session_started: '<path class="chat-system-event-icon-fill" d="M8 6.5 18 12 8 17.5z"></path>', // Icon for actual billing/session start.
    session_paused: '<path d="M9 7v10M15 7v10"></path>', // Icon for a committed paid-session pause.
    session_resumed: '<path class="chat-system-event-icon-fill" d="M8 6.5 18 12 8 17.5z"></path>', // Icon for a paused session becoming active again.
    session_completed: '<path d="m5 12 4 4L19 6"></path>', // Icon for terminal paid-session completion.
  });
  const markAgentChatPage = () => {
    document.body.classList.add('has-admin-agent-chat');
    root.closest('section.content')?.classList.add('has-admin-agent-chat-content');
  };

  const formatSystemEventTime = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(CHAT_SYSTEM_EVENT_CONFIG.timeLocale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const appendSystemTimelineEvent = (eventData = {}) => {
    const items = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
    const body = root.querySelector('#conversationBody');
    const messageId = String(eventData.message_id || '');
    const conversationId = String(eventData.conversation_id || '');
    const activeConversationId = String(root.dataset.conversationId || '');
    if (!items || !messageId || !conversationId || conversationId !== activeConversationId) {
      return false;
    }
    const duplicate = Array.from(items.querySelectorAll('[data-message-id]')).some(
      (node) => node.dataset.messageId === messageId
    );
    if (duplicate) {
      return false;
    }

    const distanceFromBottom = body
      ? body.scrollHeight - body.scrollTop - body.clientHeight
      : Number.POSITIVE_INFINITY;
    const shouldKeepAtBottom = distanceFromBottom <= CHAT_SYSTEM_EVENT_CONFIG.autoScrollTolerancePx;
    const eventCode = String(eventData.event_code || '');
    const tone = CHAT_SYSTEM_EVENT_TONES.has(eventData.tone) ? eventData.tone : 'info';

    const wrapper = document.createElement('div');
    wrapper.className = `chat-system-event chat-system-event-paid is-${tone}`;
    wrapper.dataset.messageId = messageId;
    wrapper.dataset.messageAuthor = 'system';
    wrapper.dataset.messageKind = 'system';
    wrapper.dataset.systemKind = String(eventData.system_kind || 'paid_session');
    wrapper.dataset.systemEventCode = eventCode;
    wrapper.dataset.conversationId = conversationId;
    wrapper.setAttribute('role', 'note');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'chat-system-event-icon');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    icon.innerHTML = CHAT_PAID_SESSION_EVENT_ICONS[eventCode]
      || CHAT_PAID_SESSION_EVENT_ICONS.offer_sent;

    const text = document.createElement('span');
    text.className = 'chat-system-event-text';
    text.textContent = String(eventData.text || 'Статус платной консультации изменен');

    const time = document.createElement('time');
    time.className = 'chat-system-event-time';
    time.dateTime = String(eventData.occurred_at || '');
    time.textContent = String(eventData.occurred_at_label || formatSystemEventTime(eventData.occurred_at));

    wrapper.append(icon, text, time);
    const typingIndicator = items.querySelector('#clientTypingIndicator');
    items.insertBefore(wrapper, typingIndicator || null);

    if (body && shouldKeepAtBottom) {
      window.requestAnimationFrame(() => {
        body.scrollTop = body.scrollHeight;
      });
    }
    return true;
  };

  const bindPaidSessionTimelineEvents = () => {
    if (root.dataset.paidSessionTimelineBound === '1') {
      return;
    }
    root.dataset.paidSessionTimelineBound = '1';
    root.addEventListener('agentpaid:timeline-event', (event) => {
      appendSystemTimelineEvent(event.detail?.event || {});
    });
    window.AgentChatSystemEvents = Object.freeze({
      append: appendSystemTimelineEvent,
    });
  };

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

  const canReplyToMessage = (message) => {
    if (!message?.dataset.messageId || getMessageCensoredState(message) === 'full') {
      return false;
    }

    const author = getMessageAuthor(message);
    if (author === 'client') {
      return true;
    }
    if (author !== 'operator' || !CHAT_MESSAGE_ACTION_CONFIG.allowReplyToOwnOperatorMessages) {
      return false;
    }

    return !CHAT_MESSAGE_ACTION_CONFIG.replyBlockedSendStates.includes(getMessageSendState(message));
  };

  const getImageItemFromElement = (element, fallbackTitle = 'Image') => {
    const image = element?.querySelector?.('img') || (element?.matches?.('img') ? element : null);
    const src = element?.dataset?.src
      || element?.dataset?.fullSrc
      || image?.currentSrc
      || image?.getAttribute?.('src')
      || element?.getAttribute?.('href')
      || '';
    const normalizedSrc = src && src !== '#' ? src : image?.src || '';

    return {
      src: normalizedSrc,
      title: element?.dataset?.caption || image?.alt || element?.dataset?.fileName || fallbackTitle,
    };
  };

  const syncOriginalFancyboxImages = (scope = root) => {
    const messages = scope.matches?.('.direct-chat-msg')
      ? [scope]
      : Array.from(scope.querySelectorAll('.direct-chat-msg'));

    messages.forEach((message) => {
      const messageId = message.dataset.messageId || `message-${Math.random().toString(16).slice(2)}`;
      message.querySelectorAll('.message-photo-card').forEach((card, index) => {
        const item = getImageItemFromElement(card, `Message image ${index + 1}`);
        if (!item.src) {
          return;
        }

        card.setAttribute('href', item.src);
        card.setAttribute('data-fancybox', `message-${messageId}`);
        card.setAttribute('data-caption', item.title);
        card.setAttribute('data-type', 'image');
      });
    });
  };

  const bindOriginalFancyboxImages = () => {
    syncOriginalFancyboxImages();

    if (root.dataset.agentFancyBound === '1') {
      return;
    }

    root.dataset.agentFancyBound = '1';

    const hasFancybox = Boolean(window.jQuery && window.jQuery.fancybox);

    root.addEventListener('click', (event) => {
      const messagePhoto = event.target.closest('.message-photo-card');
      if (messagePhoto && root.contains(messagePhoto) && !hasFancybox) {
        event.preventDefault();
        return;
      }

      const galleryView = event.target.closest('.js-composer-gallery-view');
      if (galleryView && root.contains(galleryView)) {
        event.preventDefault();
        event.stopPropagation();
        if (!hasFancybox) {
          return;
        }

        const currentItem = galleryView.closest('.composer-gallery-item');
        const galleryItems = Array.from(root.querySelectorAll('#composerGalleryPanel .composer-gallery-item'));
        const group = galleryItems
          .map((item) => getImageItemFromElement(item, item.dataset.fileName || 'Gallery photo'))
          .filter((item) => item.src)
          .map((item) => ({ src: item.src, opts: { type: 'image', caption: item.title } }));

        if (!group.length) {
          return;
        }

        window.jQuery.fancybox.open(group, {
          loop: group.length > 1,
          buttons: ['close'],
        }, Math.max(0, galleryItems.indexOf(currentItem)));
      }
    });

    root.addEventListener('keydown', (event) => {
      const galleryView = event.target.closest('.js-composer-gallery-view');
      if (!galleryView || !['Enter', ' '].includes(event.key)) {
        return;
      }
      event.preventDefault();
      galleryView.click();
    });
  };

  const getMessageLang = (message) => {
    if (!message) {
      return 'auto';
    }
    return message.dataset.messageLang || 'auto';
  };

  const normalizeTranslationLang = (lang, fallback = 'auto') => {
    const value = String(lang || '').trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(CHAT_TRANSLATION_LANGUAGES, value) ? value : fallback;
  };

  const getTranslationSourceLang = () => normalizeTranslationLang(
    root.dataset.translationSourceLang || CHAT_TRANSLATION_DEFAULT_SOURCE_LANG,
    CHAT_TRANSLATION_DEFAULT_SOURCE_LANG
  );

  const getTranslationTargetLang = () => normalizeTranslationLang(
    root.dataset.translationTargetLang || CHAT_TRANSLATION_TARGET_LANG,
    CHAT_TRANSLATION_TARGET_LANG
  );

  const getProfileTranslationLang = () => {
    const activeItem = root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');
    const profileLang = normalizeTranslationLang(
      activeItem?.dataset.profileLanguage
        || activeItem?.dataset.userLanguage
        || root.dataset.profileLanguage
        || CHAT_PAGE_CONFIG.profileLanguage
        || CHAT_TRANSLATION_TARGET_LANG,
      CHAT_TRANSLATION_TARGET_LANG
    );
    return profileLang === 'auto' ? CHAT_TRANSLATION_TARGET_LANG : profileLang;
  };

  const getEffectiveTranslationSourceLang = () => {
    const sourceLang = getTranslationSourceLang();
    return sourceLang === 'auto' ? getProfileTranslationLang() : sourceLang;
  };

  const getEffectiveTranslationTargetLang = () => {
    const targetLang = getTranslationTargetLang();
    return targetLang === 'auto' ? getProfileTranslationLang() : targetLang;
  };

  const getOperatorTranslationPayload = (message) => {
    if (!message || getMessageAuthor(message) !== 'operator') {
      return null;
    }

    const originalText = message.dataset.originalText || '';
    const translatedText = message.dataset.translatedText || '';
    if (!originalText || !translatedText) {
      return null;
    }

    return {
      originalText,
      translatedText,
      sourceLang: message.dataset.translationSourceLang || 'auto',
      targetLang: message.dataset.translationTargetLang || getMessageLang(message),
      provider: message.dataset.translationProvider || '',
    };
  };

  const getComposerSourceLang = () => getEffectiveTranslationSourceLang();

  const getComposerTranslationPreview = () => root.querySelector('#composerTranslationPreview');

  const getComposerTranslationState = (currentSourceText = '') => {
    const preview = getComposerTranslationPreview();
    if (!preview) {
      return null;
    }

    const originalText = preview.dataset.originalText || '';
    const translatedText = preview.dataset.translatedText || '';
    if (!originalText || !translatedText) {
      return null;
    }

    return {
      original_text: originalText,
      translated_text: translatedText,
      source_lang: preview.dataset.sourceLang || getComposerSourceLang(originalText),
      target_lang: preview.dataset.targetLang || getTranslationTargetLang(),
      provider: preview.dataset.provider || 'demo',
      translated_at: preview.dataset.translatedAt || '',
      is_stale: originalText !== currentSourceText,
    };
  };

  const getComposerTranslationPayload = (currentSourceText = '') => {
    const state = getComposerTranslationState(currentSourceText);
    if (!state || state.is_stale) {
      return null;
    }

    return {
      original_text: state.original_text,
      translated_text: state.translated_text,
      source_lang: state.source_lang,
      target_lang: state.target_lang,
      provider: state.provider,
      translated_at: state.translated_at,
    };
  };

  const syncComposerTranslationPreviewState = (currentSourceText = '') => {
    const preview = getComposerTranslationPreview();
    const previewText = root.querySelector('#composerTranslationPreviewText');
    const button = root.querySelector('#btnComposerTranslate');
    const buttonLabel = root.querySelector('#composerTranslateLabel');
    const buttonClear = root.querySelector('#composerTranslateClear');
    const composer = root.querySelector('#conversationInputArea');
    const state = getComposerTranslationState(currentSourceText);
    if (!preview || !previewText || !state) {
      composer?.classList.remove('has-stale-translation');
      buttonLabel?.setAttribute('hidden', '');
      buttonClear?.setAttribute('hidden', '');
      button?.removeAttribute('data-translation-label');
      return null;
    }

    preview.dataset.stale = state.is_stale ? 'true' : 'false';
    preview.classList.toggle('is-stale', state.is_stale);
    const stateLabel = state.is_stale
      ? `устарел: ${state.source_lang} → ${state.target_lang}`
      : `готов: ${state.source_lang} → ${state.target_lang}`;
    previewText.textContent = state.is_stale
      ? `Перевод ${stateLabel}`
      : `Перевод ${stateLabel}`;
    composer?.classList.add('has-translation-choice');
    composer?.classList.toggle('has-stale-translation', state.is_stale);
    button?.classList.toggle('is-active', !state.is_stale);
    button?.classList.toggle('is-stale', state.is_stale);
    button?.setAttribute('aria-pressed', String(!state.is_stale));
    button?.setAttribute('data-translation-label', stateLabel);
    button?.setAttribute('title', state.is_stale
      ? 'Перевод устарел. Откройте детали или сбросьте перевод'
      : 'Перевод готов. Открыть детали перевода');
    if (buttonLabel) {
      buttonLabel.textContent = stateLabel;
      buttonLabel.hidden = false;
    }
    if (buttonClear) {
      buttonClear.hidden = false;
    }
    return state;
  };

  const setComposerTranslationPreview = ({
    originalText,
    translatedText,
    sourceLang = 'auto',
    targetLang = getTranslationTargetLang(),
    provider = 'demo',
  }) => {
    const preview = getComposerTranslationPreview();
    const previewText = root.querySelector('#composerTranslationPreviewText');
    const button = root.querySelector('#btnComposerTranslate');
    const buttonLabel = root.querySelector('#composerTranslateLabel');
    const buttonClear = root.querySelector('#composerTranslateClear');
    const composer = root.querySelector('#conversationInputArea');
    if (!preview || !previewText || !originalText || !translatedText) {
      return;
    }

    preview.dataset.originalText = originalText;
    preview.dataset.translatedText = translatedText;
    preview.dataset.sourceLang = sourceLang;
    preview.dataset.targetLang = targetLang;
    preview.dataset.provider = provider;
    preview.dataset.translatedAt = new Date().toISOString();
    preview.dataset.stale = 'false';
    preview.classList.remove('is-stale');
    const stateLabel = `готов: ${sourceLang} → ${targetLang}`;
    previewText.textContent = `Перевод ${stateLabel}`;
    preview.hidden = true;
    composer?.classList.add('has-translation-choice');
    composer?.classList.remove('has-stale-translation');
    button?.classList.add('is-active');
    button?.classList.remove('is-stale');
    button?.setAttribute('aria-pressed', 'true');
    button?.setAttribute('data-translation-label', stateLabel);
    button?.setAttribute('title', 'Перевод готов. Открыть детали перевода');
    if (buttonLabel) {
      buttonLabel.textContent = stateLabel;
      buttonLabel.hidden = false;
    }
    if (buttonClear) {
      buttonClear.hidden = false;
    }
  };

  const clearComposerTranslationPreview = () => {
    const preview = getComposerTranslationPreview();
    const previewText = root.querySelector('#composerTranslationPreviewText');
    const button = root.querySelector('#btnComposerTranslate');
    const buttonLabel = root.querySelector('#composerTranslateLabel');
    const buttonClear = root.querySelector('#composerTranslateClear');
    const composer = root.querySelector('#conversationInputArea');
    if (!preview) {
      return;
    }

    preview.hidden = true;
    ['originalText', 'translatedText', 'sourceLang', 'targetLang', 'provider', 'translatedAt', 'stale'].forEach((key) => {
      delete preview.dataset[key];
    });
    preview.classList.remove('is-stale');
    if (previewText) {
      previewText.textContent = 'Translation ready';
    }
    composer?.classList.remove('has-translation-choice', 'has-stale-translation');
    button?.classList.remove('is-active', 'is-loading', 'is-stale');
    button?.setAttribute('aria-pressed', 'false');
    button?.removeAttribute('data-translation-label');
    button?.setAttribute('title', 'Перевести на язык клиента');
    buttonLabel?.setAttribute('hidden', '');
    buttonClear?.setAttribute('hidden', '');
  };

  const closeComposerTranslationModal = () => {
    const modal = root.querySelector('#composerTranslationModal') || document.querySelector('#composerTranslationModal');
    if (modal) {
      modal.hidden = true;
    }
  };

  const openComposerTranslationModal = () => {
    const state = getComposerTranslationState(root.querySelector('#messageInput')?.value.trim() || '');
    const modal = root.querySelector('#composerTranslationModal') || document.querySelector('#composerTranslationModal');
    if (!state || !modal) {
      return;
    }

    modal.querySelector('#composerTranslationModalMeta').textContent = state.is_stale
      ? `${state.source_lang} → ${state.target_lang} · устарел`
      : `${state.source_lang} → ${state.target_lang}`;
    modal.querySelector('#composerTranslationOriginalText').textContent = state.original_text;
    modal.querySelector('#composerTranslationFullText').textContent = state.translated_text;
    modal.hidden = false;
    window.setTimeout(() => modal.querySelector('#composerTranslationModalClose')?.focus(), CHAT_UI_TIMING.immediateFocusMs);
  };

  const getDemoComposerTranslation = (sourceText, targetLang = getTranslationTargetLang()) => {
    const normalized = sourceText.trim();
    const demoDictionary = new Map([
      ['Здравствуйте', 'Hello'],
      ['Привет', 'Hi'],
      ['Спасибо', 'Thank you'],
      ['Пожалуйста', 'Please'],
      ['Я рядом', 'I am here with you'],
      ['Сейчас проверю', 'I will check it now'],
      ['Сообщение получено', 'Your message has been received'],
      ['Подтвердите время', 'Please confirm the time'],
    ]);

    let translated = normalized;
    demoDictionary.forEach((replacement, source) => {
      translated = translated.replace(new RegExp(source, 'gi'), replacement);
    });

    if (translated === normalized) {
      translated = normalized;
    }

    return `[DEMO SEND ${targetLang}] ${translated}`;
  };

  const requestComposerDraftTranslation = (sourceText) => new Promise((resolve) => {
    const requestedSourceLang = getTranslationSourceLang();
    const resolvedSourceLang = getEffectiveTranslationSourceLang();
    const requestedTargetLang = getTranslationTargetLang();
    const resolvedTargetLang = getEffectiveTranslationTargetLang();
    const profileLanguage = getProfileTranslationLang();
    const activeItem = root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');
    /*
    // Real composer translation integration point.
    // The backend can choose the translation provider and return normalized text.
    fetch(CHAT_API_ENDPOINTS.translateDraft, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        conversation_id: root.dataset.conversationId || 'c2',
        source_text: sourceText,
        source_lang: requestedSourceLang,
        target_lang: requestedTargetLang,
        source_lang_source: requestedSourceLang === 'auto' ? 'user_profile' : 'manual',
        target_lang_source: requestedTargetLang === 'auto' ? 'user_profile' : 'manual',
        profile_language_fallback: profileLanguage,
        resolved_source_lang: resolvedSourceLang,
        resolved_target_lang: resolvedTargetLang,
        recipient_user_id: activeItem?.dataset.senderUserId || '',
        expert_user_id: activeItem?.dataset.recipientUserId || '',
      }),
    })
      .then((response) => response.json())
      .then((data) => resolve({
        originalText: sourceText,
        translatedText: data.translated_text || data.translation || '',
        sourceLang: data.resolved_source_lang || data.source_lang || resolvedSourceLang,
        targetLang: data.resolved_target_lang || data.target_lang || resolvedTargetLang,
        provider: data.provider || 'api',
      }))
      .catch(() => resolve(null));
    return;
    */

    window.setTimeout(() => {
      resolve({
        originalText: sourceText,
        translatedText: getDemoComposerTranslation(sourceText, resolvedTargetLang),
        sourceLang: resolvedSourceLang,
        targetLang: resolvedTargetLang,
        provider: 'demo',
      });
    }, CHAT_UI_TIMING.demoTranslationLatencyMs);
  });

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

    const requestDateRangeMessages = (payload) => {
      /*
      // Real date-range message request integration point.
      // Expected backend behavior:
      // - return a message window for the selected range;
      // - include pagination flags if range contains more messages than can be rendered at once;
      // - keep current conversation context unchanged.
      return fetch(CHAT_API_ENDPOINTS.conversationRange(payload.conversation_id), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Date range request failed');
        }
        return response.json();
      });
      */

      return window.Promise.resolve({
        ok: true,
        demo: true,
        payload,
        messages: [],
        has_before: false,
        has_after: false,
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
            <input id="${popoverId}-from" type="datetime-local" value="${inputDate}T00:00" aria-label="Начало периода">
          </div>
          <div class="date-range-field">
            <input id="${popoverId}-to" type="datetime-local" value="${inputDate}T23:59" aria-label="Конец периода">
          </div>
        </div>
        <div class="date-range-actions">
          <button class="btn btn-default btn-xs js-date-range-reset" type="button">Сбросить</button>
          <button class="btn btn-primary btn-xs js-date-range-apply" type="button">Показать</button>
        </div>
        <div class="date-range-status" aria-live="polite"></div>
      `;
      date.appendChild(popover);

      const updatePopoverDirection = () => {
        const toggleRect = toggle.getBoundingClientRect();
        const composerRect = document.querySelector('#conversationInputArea')?.getBoundingClientRect();
        const lowerBoundary = composerRect?.top || window.innerHeight;
        const estimatedPopoverHeight = Math.min(
          CHAT_FLOATING_UI.datePopoverMaxHeightPx,
          Math.max(
            CHAT_FLOATING_UI.datePopoverMinHeightPx,
            popover.scrollHeight || CHAT_FLOATING_UI.datePopoverFallbackHeightPx
          )
        );
        const shouldOpenUp = toggleRect.bottom
          + estimatedPopoverHeight
          + CHAT_FLOATING_UI.datePopoverBoundaryGapPx
          > lowerBoundary;
        popover.classList.toggle('is-open-up', shouldOpenUp);
      };

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isOpen = popover.hidden;
        closeAll(date);
        popover.hidden = !isOpen;
        date.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
          updatePopoverDirection();
        }
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
          const payload = {
            conversation_id: root.dataset.conversationId || 'c2',
            range_from: from.value || '',
            range_to: to.value || '',
            anchor_date: rawDate,
            action: 'apply',
            requested_from: 'date_separator_popover',
            limit: 80,
          };

          apply.disabled = true;
          reset.disabled = true;
          status.textContent = 'Загружаем сообщения за выбранный период...';
          requestDateRangeMessages(payload)
            .then(() => {
              status.textContent = `Диапазон выбран: ${from.value || 'начало'} - ${to.value || 'конец'}.`;
            })
            .catch(() => {
              status.textContent = 'Не удалось загрузить диапазон. Попробуйте ещё раз.';
            })
            .finally(() => {
              apply.disabled = false;
              reset.disabled = false;
            });
        });
      }

      if (reset && status && from && to) {
        reset.addEventListener('click', () => {
          from.value = `${inputDate}T00:00`;
          to.value = `${inputDate}T23:59`;
          const payload = {
            conversation_id: root.dataset.conversationId || 'c2',
            range_from: from.value,
            range_to: to.value,
            anchor_date: rawDate,
            action: 'reset_to_day',
            requested_from: 'date_separator_popover',
            limit: 80,
          };

          apply.disabled = true;
          reset.disabled = true;
          status.textContent = 'Возвращаем сообщения выбранного дня...';
          requestDateRangeMessages(payload)
            .then(() => {
              status.textContent = 'Диапазон сброшен к выбранному дню.';
            })
            .catch(() => {
              status.textContent = 'Не удалось сбросить диапазон. Попробуйте ещё раз.';
            })
            .finally(() => {
              apply.disabled = false;
              reset.disabled = false;
            });
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

    root.querySelectorAll('.js-open-ai-summary').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        panel.querySelector('.js-right-panel-open')?.click();
        activate('ai');
        panel.querySelector('#tab-ai')?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    activate(panel.querySelector('.right-tab.active')?.dataset.tab || 'ai');
  }

  function bindAiAssistant() {
    const pane = root.querySelector('#tab-ai');
    if (!pane || pane.dataset.aiAssistantBound === '1') {
      return;
    }
    pane.dataset.aiAssistantBound = '1';

    const summaryToggle = pane.querySelector('.js-ai-summary-toggle');
    const summaryContent = pane.querySelector('.context-ai-summary-content');
    const refreshButton = pane.querySelector('.js-ai-summary-refresh');
    const insertButton = pane.querySelector('.js-ai-draft-insert');
    const staleBadge = pane.querySelector('.context-ai-stale');

    const setStale = (isStale) => {
      pane.classList.toggle('is-ai-stale', isStale);
      staleBadge.hidden = !isStale;
      refreshButton?.classList.toggle('is-attention', isStale);
    };

    summaryToggle?.addEventListener('click', () => {
      const willOpen = summaryContent.hidden;
      summaryContent.hidden = !willOpen;
      summaryToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      summaryToggle.classList.toggle('is-open', willOpen);
    });

    insertButton?.addEventListener('click', () => {
      const input = root.querySelector('#messageInput');
      const draft = pane.dataset.aiDraft || pane.querySelector('.context-ai-draft-text')?.textContent.trim() || '';
      if (!input || !draft) {
        return;
      }
      input.value = input.value.trim() ? `${input.value.trimEnd()}\n\n${draft}` : draft;
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const originalText = insertButton.textContent;
      insertButton.textContent = 'Inserted';
      window.setTimeout(() => {
        insertButton.textContent = originalText;
      }, CHAT_AI_ASSISTANT_CONFIG.insertedDraftFeedbackMs);
    });

    refreshButton?.addEventListener('click', () => {
      const conversationId = root.dataset.conversationId || '';
      if (!conversationId || refreshButton.disabled) {
        return;
      }
      refreshButton.disabled = true;
      refreshButton.classList.add('is-loading');
      const payload = {
        conversation_id: conversationId,
        requested_from: 'ai_summary_refresh',
        requested_at: new Date().toISOString(),
      };
      /*
      // Real API integration point. The response should contain
      // { ok: true, context_json: { apply_sections: ['ai'], ai: { ... } } }.
      return fetch(CHAT_API_ENDPOINTS.aiSummary(conversationId), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => response.json()).then((response) => {
        if (!response.ok) throw new Error('AI summary refresh failed');
        applyRightContext({ conversation_id: conversationId }, response.context_json);
      });
      */
      window.Promise.resolve(payload)
        .then(() => setStale(false))
        .finally(() => {
          refreshButton.disabled = false;
          refreshButton.classList.remove('is-loading');
        });
    });

    root.addEventListener('admin-agent-chat:incoming-message', (event) => {
      const conversationId = event.detail?.conversation_id;
      if (!conversationId || conversationId === root.dataset.conversationId) {
        setStale(true);
      }
    });
  }

  function bindRightPanelCollapse() {
    const panel = document.querySelector('#admin-agent-chat .pane-right');
    const root = document.querySelector('#admin-agent-chat');
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
      root?.classList.toggle('is-right-overlay-open', !collapsed);
    };

    let touchStart = null;
    const isMobilePaneGesture = () => {
      const shellWidth = root?.querySelector('.chat-shell')?.getBoundingClientRect().width || window.innerWidth;
      return Math.min(shellWidth, window.innerWidth) <= CHAT_PANEL_GESTURES.mobileMaxWidthPx;
    };

    panel.addEventListener('touchstart', (event) => {
      if (panel.classList.contains('is-collapsed') || !isMobilePaneGesture() || event.touches.length !== 1) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }, { passive: true });

    panel.addEventListener('touchend', (event) => {
      if (!touchStart || !event.changedTouches.length || panel.classList.contains('is-collapsed')) {
        touchStart = null;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      touchStart = null;

      const isSwipeRight = deltaX >= CHAT_PANEL_GESTURES.rightSwipeMinDistancePx
        && absY <= CHAT_PANEL_GESTURES.swipeMaxVerticalPx
        && absX >= absY * CHAT_PANEL_GESTURES.swipeDominanceRatio;

      if (!isSwipeRight || !isMobilePaneGesture()) {
        return;
      }

      panel.dataset.userCollapse = 'collapsed';
      delete panel.dataset.autoCollapsed;
      setCollapsed(true);
    }, { passive: true });

    collapseButton.addEventListener('click', (event) => {
      event.preventDefault();
      panel.dataset.userCollapse = 'collapsed';
      delete panel.dataset.autoCollapsed;
      setCollapsed(true);
    });

    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      panel.dataset.userCollapse = 'open';
      delete panel.dataset.autoCollapsed;
      setCollapsed(false);
    });

    setCollapsed(false);
  }

  function bindLeftPanelCollapse() {
    const panel = document.querySelector('#admin-agent-chat .pane-left');
    const root = document.querySelector('#admin-agent-chat');
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
      root?.classList.toggle('is-left-overlay-open', !collapsed);
    };

    let touchStart = null;
    const isMobilePaneGesture = () => {
      const shellWidth = root?.querySelector('.chat-shell')?.getBoundingClientRect().width || window.innerWidth;
      return Math.min(shellWidth, window.innerWidth) <= CHAT_PANEL_GESTURES.mobileMaxWidthPx;
    };

    panel.addEventListener('touchstart', (event) => {
      if (panel.classList.contains('is-collapsed') || !isMobilePaneGesture() || event.touches.length !== 1) {
        touchStart = null;
        return;
      }
      const touch = event.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }, { passive: true });

    panel.addEventListener('touchend', (event) => {
      if (!touchStart || !event.changedTouches.length || panel.classList.contains('is-collapsed')) {
        touchStart = null;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      touchStart = null;

      const isSwipeLeft = deltaX <= -CHAT_PANEL_GESTURES.leftSwipeMinDistancePx
        && absY <= CHAT_PANEL_GESTURES.swipeMaxVerticalPx
        && absX >= absY * CHAT_PANEL_GESTURES.swipeDominanceRatio;

      if (!isSwipeLeft || !isMobilePaneGesture()) {
        return;
      }

      panel.dataset.userCollapse = 'collapsed';
      delete panel.dataset.autoCollapsed;
      setCollapsed(true);
    }, { passive: true });

    collapseButton.addEventListener('click', (event) => {
      event.preventDefault();
      panel.dataset.userCollapse = 'collapsed';
      delete panel.dataset.autoCollapsed;
      setCollapsed(true);
    });

    openButton.addEventListener('click', (event) => {
      event.preventDefault();
      panel.dataset.userCollapse = 'open';
      delete panel.dataset.autoCollapsed;
      setCollapsed(false);
    });

    setCollapsed(false);
  }

  function bindResponsiveChatLayout() {
    const root = document.querySelector('#admin-agent-chat');
    const shell = root?.querySelector('.chat-shell');
    const left = root?.querySelector('.pane-left');
    const right = root?.querySelector('.pane-right');
    if (!root || !shell || !left || !right || root.dataset.responsiveLayoutBound === '1') {
      return;
    }

    root.dataset.responsiveLayoutBound = '1';

    const setAutoCollapsed = (panel, collapsed) => {
      if (panel.dataset.userCollapse) {
        return;
      }

      panel.classList.toggle('is-collapsed', collapsed);
      if (collapsed) {
        panel.dataset.autoCollapsed = '1';
      } else {
        delete panel.dataset.autoCollapsed;
      }

      const collapseButton = panel.querySelector('[class*="panel-collapse"]');
      const openButton = panel.querySelector('[class*="panel-open"]');
      collapseButton?.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      openButton?.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    };

    const syncResponsiveLayout = () => {
      const width = shell.getBoundingClientRect().width || window.innerWidth;
      root.classList.toggle('chat-layout-compact', width < CHAT_LAYOUT_BREAKPOINTS.compactBelowPx);
      root.classList.toggle('chat-layout-right-rail', width < CHAT_LAYOUT_BREAKPOINTS.rightRailBelowPx);
      root.classList.toggle('chat-layout-rails', width < CHAT_LAYOUT_BREAKPOINTS.railsBelowPx);
      root.classList.toggle('chat-layout-single-candidate', width < CHAT_LAYOUT_BREAKPOINTS.singlePaneBelowPx);

      if (width >= CHAT_LAYOUT_BREAKPOINTS.rightRailBelowPx) {
        if (right.dataset.autoCollapsed === '1') {
          setAutoCollapsed(right, false);
        }
        if (left.dataset.autoCollapsed === '1') {
          setAutoCollapsed(left, false);
        }
        return;
      }

      if (width >= CHAT_LAYOUT_BREAKPOINTS.railsBelowPx) {
        setAutoCollapsed(right, true);
        if (left.dataset.autoCollapsed === '1') {
          setAutoCollapsed(left, false);
        }
        return;
      }

      setAutoCollapsed(left, true);
      setAutoCollapsed(right, true);
    };

    syncResponsiveLayout();
    window.addEventListener('resize', syncResponsiveLayout);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(syncResponsiveLayout);
      observer.observe(shell);
    }
  }

  function syncRightContextMissingBadges(root = document.querySelector('#admin-agent-chat')) {
    const panel = root?.querySelector('.pane-right');
    if (!panel) {
      return;
    }

    const isEmptyContextValue = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      return !normalized || normalized === 'unknown' || normalized === 'n/a' || normalized === 'na' || normalized === '-';
    };

    panel.querySelectorAll('.context-accordion-item').forEach((item) => {
      const body = item.querySelector('.context-accordion-body');
      const rows = Array.from(item.querySelectorAll('.context-data-row')).filter((row) => row.querySelector('input'));
      const meta = item.querySelector('.context-accordion-meta');
      if (!body || !rows.length || !meta) {
        return;
      }

      const missingCount = rows.reduce((count, row) => {
        const input = row.querySelector('input');
        const output = row.querySelector('strong');
        const value = body.classList.contains('is-edit-mode')
          ? input?.value
          : output?.textContent;
        return count + (isEmptyContextValue(value) ? 1 : 0);
      }, 0);

      let badge = meta.querySelector('.context-missing-badge');
      if (!badge && missingCount > 0) {
        badge = document.createElement('span');
        badge.className = 'context-missing-badge';
        const disclosureIcon = meta.querySelector('.context-disclosure-icon');
        meta.insertBefore(badge, disclosureIcon || null);
      }

      if (!badge) {
        return;
      }

      badge.textContent = '!';
      badge.title = `Незаполненные поля: ${missingCount}`;
      badge.setAttribute('aria-label', `Незаполненные поля: ${missingCount}`);
      badge.hidden = missingCount === 0;
    });
  }

  function getTranslationLangLabel(lang) {
    const normalized = normalizeTranslationLang(lang, 'auto');
    if (normalized === 'auto') {
      return 'Auto (profile language)';
    }
    return CHAT_TRANSLATION_LANGUAGES[normalized] || String(lang || 'auto').toUpperCase();
  }

  function setQualityTranslationEditMode(panel, isEditing) {
    const block = panel?.querySelector('[data-translation-direction]');
    const editPanel = block?.querySelector('.context-translation-edit');
    const editButton = block?.querySelector('.js-quality-translation-edit');
    if (!block || !editPanel || !editButton) {
      return;
    }
    editPanel.hidden = !isEditing;
    editButton.hidden = isEditing;
  }

  function renderQualityTranslationDirection(direction = {}) {
    const block = root.querySelector('#tab-quality [data-translation-direction]');
    if (!block) {
      return;
    }

    const sourceLang = normalizeTranslationLang(direction.source_lang || getTranslationSourceLang(), CHAT_TRANSLATION_DEFAULT_SOURCE_LANG);
    const targetLang = normalizeTranslationLang(direction.target_lang || getTranslationTargetLang(), CHAT_TRANSLATION_TARGET_LANG);
    const sourceLabel = block.querySelector('.js-quality-source-label');
    const targetLabel = block.querySelector('.js-quality-target-label');
    const sourceSelect = block.querySelector('.js-quality-source-select');
    const targetSelect = block.querySelector('.js-quality-target-select');
    const status = block.querySelector('.js-quality-translation-status');

    root.dataset.translationSourceLang = sourceLang;
    root.dataset.translationTargetLang = targetLang;

    if (sourceLabel) {
      sourceLabel.dataset.lang = sourceLang;
      sourceLabel.textContent = sourceLang.toUpperCase();
      sourceLabel.title = getTranslationLangLabel(sourceLang);
    }
    if (targetLabel) {
      targetLabel.dataset.lang = targetLang;
      targetLabel.textContent = targetLang.toUpperCase();
      targetLabel.title = getTranslationLangLabel(targetLang);
    }
    if (sourceSelect) {
      sourceSelect.value = sourceLang;
    }
    if (targetSelect) {
      targetSelect.value = targetLang;
    }
    if (status && !direction.status_text) {
      status.hidden = true;
      status.classList.remove('is-error');
      status.textContent = '';
    }
    setQualityTranslationEditMode(root, false);
  }

  function requestQualityTranslationDirectionSave(payload) {
    /*
    // Real API integration point for per-conversation translation direction.
    return fetch(CHAT_API_ENDPOINTS.translationDirection(payload.conversation_id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': window.yii?.getCsrfToken?.() || '',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Translation direction update failed');
      }
      return response.json();
    });
    */
    return window.Promise.resolve({
      ok: true,
      translation_direction: {
        source_lang: payload.source_lang,
        target_lang: payload.target_lang,
      },
    });
  }

  function bindQualityTranslationDirection() {
    const block = root.querySelector('#tab-quality [data-translation-direction]');
    if (!block || block.dataset.bound === '1') {
      return;
    }

    block.dataset.bound = '1';

    const editButton = block.querySelector('.js-quality-translation-edit');
    const cancelButton = block.querySelector('.js-quality-translation-cancel');
    const saveButton = block.querySelector('.js-quality-translation-save');
    const sourceSelect = block.querySelector('.js-quality-source-select');
    const targetSelect = block.querySelector('.js-quality-target-select');
    const status = block.querySelector('.js-quality-translation-status');

    const showStatus = (text, isError = false) => {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.hidden = false;
      status.classList.toggle('is-error', isError);
      window.clearTimeout(showStatus.timer);
      showStatus.timer = window.setTimeout(() => {
        status.hidden = true;
      }, CHAT_UI_TIMING.actionFeedbackMs);
    };

    editButton?.addEventListener('click', () => {
      if (sourceSelect) sourceSelect.value = getTranslationSourceLang();
      if (targetSelect) targetSelect.value = getTranslationTargetLang();
      setQualityTranslationEditMode(root, true);
    });

    cancelButton?.addEventListener('click', () => {
      renderQualityTranslationDirection({
        source_lang: getTranslationSourceLang(),
        target_lang: getTranslationTargetLang(),
      });
    });

    saveButton?.addEventListener('click', async () => {
      const sourceLang = normalizeTranslationLang(sourceSelect?.value || CHAT_TRANSLATION_DEFAULT_SOURCE_LANG, CHAT_TRANSLATION_DEFAULT_SOURCE_LANG);
      const targetLang = normalizeTranslationLang(targetSelect?.value || CHAT_TRANSLATION_TARGET_LANG, CHAT_TRANSLATION_TARGET_LANG);
      const activeItem = root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');
      const payload = {
        conversation_id: root.dataset.conversationId || activeItem?.dataset.conversationId || '',
        user_id: activeItem?.dataset.senderUserId || root.dataset.userId || '',
        source_lang: sourceLang,
        target_lang: targetLang,
        source_lang_source: sourceLang === 'auto' ? 'user_profile' : 'manual',
        target_lang_source: targetLang === 'auto' ? 'user_profile' : 'manual',
        profile_language_fallback: getProfileTranslationLang(),
        resolved_source_lang: sourceLang === 'auto' ? getProfileTranslationLang() : sourceLang,
        resolved_target_lang: targetLang === 'auto' ? getProfileTranslationLang() : targetLang,
        applies_to: 'composer_and_message_translation',
        changed_by: root.dataset.agentId || 'admin',
        changed_at: new Date().toISOString(),
      };

      saveButton.disabled = true;
      try {
        const response = await requestQualityTranslationDirectionSave(payload);
        const nextDirection = response?.translation_direction || payload;
        renderQualityTranslationDirection(nextDirection);
        if (activeItem) {
          activeItem.dataset.translationSourceLang = nextDirection.source_lang || payload.source_lang;
          activeItem.dataset.translationTargetLang = nextDirection.target_lang || payload.target_lang;
        }
        clearComposerTranslationPreview();
        root.querySelector('#messageInput')?.dispatchEvent(new Event('input', { bubbles: true }));
        showStatus('Translation direction saved');
      } catch (error) {
        showStatus('Could not save translation direction', true);
      } finally {
        saveButton.disabled = false;
      }
    });

    renderQualityTranslationDirection({
      source_lang: getTranslationSourceLang(),
      target_lang: getTranslationTargetLang(),
    });
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
      const accordionItem = body.closest('.context-accordion-item');
      const syncMissingFieldsBadge = () => {
        syncRightContextMissingBadges(document.querySelector('#admin-agent-chat'));
      };

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
        syncMissingFieldsBadge();
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
        syncMissingFieldsBadge();
      };

      const getContextSectionName = () => {
        const title = accordionItem?.querySelector('.context-accordion-head > span')?.textContent.trim().toLowerCase() || 'context';
        if (title.includes('personal')) {
          return 'personal';
        }
        if (title.includes('partner')) {
          return 'partner';
        }
        return title.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'context';
      };

      const getContextRowLabel = (row) => {
        const label = row.querySelector('span');
        return label?.firstChild?.textContent.trim() || label?.textContent.trim() || '';
      };

      const buildContextSavePayload = () => ({
        conversation_id: root.dataset.conversationId || '',
        section: getContextSectionName(),
        changed_by: root.dataset.agentId || root.dataset.userId || 'admin',
        changed_from: 'right_context_panel',
        changed_at: new Date().toISOString(),
        fields: rows.map((row) => {
          const label = getContextRowLabel(row);
          const input = row.querySelector('input');
          return {
            key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
            label,
            value: input?.value?.trim() || '',
            previous_value: input?.dataset.savedValue || '',
          };
        }),
      });

      const requestContextSectionSave = (payload) => {
        /*
        // Real API integration point for right-panel Personal/Partner sections.
        // Backend should validate permissions, persist changed fields, and return
        // the saved field values for this conversation context.
        return fetch(CHAT_API_ENDPOINTS.contextSection(payload.conversation_id, payload.section), {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Right context save failed');
          }
          return response.json();
        });
        */

        return window.Promise.resolve({ ok: true, context_section: payload });
      };

      edit?.addEventListener('click', (event) => {
        event.preventDefault();
        body.classList.add('is-edit-mode');
        setEditing(true);
      });

      save?.addEventListener('click', (event) => {
        event.preventDefault();
        const payload = buildContextSavePayload();
        const previousValues = rows.map((row) => ({
          row,
          value: row.querySelector('input')?.dataset.savedValue || '',
        }));
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
        if (save) {
          save.disabled = true;
        }
        requestContextSectionSave(payload)
          .then((result) => {
            if (root.dataset.conversationId !== payload.conversation_id) {
              return;
            }
            const savedFields = Array.isArray(result?.context_section?.fields)
              ? result.context_section.fields
              : payload.fields;
            savedFields.forEach((field) => {
              const index = payload.fields.findIndex((payloadField) => payloadField.key === field.key);
              const row = index >= 0 ? rows[index] : null;
              const input = row?.querySelector('input');
              const output = row?.querySelector('strong');
              if (!input || !output) {
                return;
              }
              const savedValue = String(field.value ?? '');
              input.value = savedValue;
              input.dataset.savedValue = savedValue;
              output.textContent = savedValue || 'unknown';
              const currentValue = row.querySelector('.context-current-value');
              if (currentValue) {
                currentValue.textContent = savedValue || 'unknown';
              }
            });
            body.classList.remove('is-edit-mode');
            syncDirtyState();
            setEditing(false);
            syncMissingFieldsBadge();
          })
          .catch(() => {
            if (root.dataset.conversationId !== payload.conversation_id) {
              return;
            }
            previousValues.forEach(({ row, value }) => {
              const input = row.querySelector('input');
              const output = row.querySelector('strong');
              if (input) {
                input.value = value;
                input.dataset.savedValue = value;
              }
              if (output) {
                output.textContent = value || 'unknown';
              }
            });
            syncDirtyState();
          })
          .finally(() => {
            if (save) {
              save.disabled = false;
            }
          });
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
        syncMissingFieldsBadge();
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
        }, CHAT_UI_TIMING.clipboardFeedbackMs);
      });
    });
  }

  function bindContextNotes() {
    const notesPane = root.querySelector('#tab-notes');
    const notesSection = notesPane?.querySelector('.context-section');
    const input = notesPane?.querySelector('#contextNoteInput');
    const saveButton = notesPane?.querySelector('.js-context-note-save');
    const clearButton = notesPane?.querySelector('.js-context-note-clear');
    if (!notesPane || !notesSection || !input || !saveButton || !clearButton || notesPane.dataset.notesBound === '1') {
      return;
    }

    notesPane.dataset.notesBound = '1';

    const getRenderedNotes = () => Array.from(notesSection.querySelectorAll('.context-note-item')).map((item) => {
      const metadata = item.querySelector('small')?.textContent.trim() || '';
      const [author = 'system', ...metaParts] = metadata.split(' · ');
      return {
        id: item.dataset.noteId || '',
        author,
        meta: metaParts.join(' · ') || 'note',
        text: item.querySelector('span')?.textContent.trim() || '',
        pinned: item.classList.contains('is-pinned'),
      };
    });

    const renderNotes = (notes = []) => {
      notesSection.querySelectorAll('.context-note-item').forEach((item) => item.remove());
      notes.forEach((note) => {
        const item = document.createElement('div');
        item.className = `context-note-item${note.pinned || note.meta === 'pinned' ? ' is-pinned' : ''}`;
        item.dataset.noteId = String(note.id || '');
        item.innerHTML = `<small>${queueEscapeHtml(note.author || 'system')} · ${queueEscapeHtml(note.meta || 'note')}</small><span>${queueEscapeHtml(note.text || '')}</span>`;
        notesSection.insertBefore(item, input);
      });
    };

    const showError = (message = '') => {
      let error = notesSection.querySelector('.context-notes-error');
      if (!message) {
        error?.remove();
        input.removeAttribute('aria-invalid');
        return;
      }
      if (!error) {
        error = document.createElement('div');
        error.className = 'context-notes-error';
        error.setAttribute('role', 'alert');
        notesSection.insertBefore(error, input);
      }
      error.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    };

    const getPayload = (text) => ({
      conversation_id: root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '',
      action: 'create',
      text,
      author_id: root.dataset.agentId || root.dataset.userId || '',
      author_name: root.dataset.agentFullname || root.dataset.userFullname || 'admin',
      source: 'right_context_notes',
      created_at: new Date().toISOString(),
    });

    const requestNoteCreate = (payload) => {
      /*
      // Real API integration point for creating an internal conversation note.
      // Backend must authorize the agent, sanitize the text, and return a
      // canonical note with a stable id, author and server timestamp.
      return fetch(CHAT_API_ENDPOINTS.contextSection(payload.conversation_id, 'notes'), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Note create request failed');
        }
        return response.json();
      });
      */

      return window.Promise.resolve({
        ok: true,
        note: {
          id: `demo-note-${Date.now()}`,
          author: payload.author_name,
          meta: 'now',
          text: payload.text,
          pinned: false,
        },
      });
    };

    clearButton.addEventListener('click', (event) => {
      event.preventDefault();
      input.value = '';
      showError('');
      input.focus();
    });

    input.addEventListener('input', () => showError(''));

    saveButton.addEventListener('click', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        showError('Введите текст заметки.');
        input.focus();
        return;
      }

      const payload = getPayload(text);
      const previousNotes = getRenderedNotes();
      const optimisticNote = {
        id: `optimistic-note-${Date.now()}`,
        author: payload.author_name,
        meta: 'now',
        text,
        pinned: false,
      };
      renderNotes([...previousNotes, optimisticNote]);
      input.value = '';
      showError('');
      saveButton.disabled = true;

      requestNoteCreate(payload)
        .then((response) => {
          if (!response?.ok || !response.note) {
            throw new Error('Note was not created');
          }
          if (root.dataset.conversationId !== payload.conversation_id) {
            return;
          }
          const currentNotes = getRenderedNotes();
          renderNotes(currentNotes.map((note) => (
            note.id === optimisticNote.id ? { ...optimisticNote, ...response.note } : note
          )));
        })
        .catch(() => {
          if (root.dataset.conversationId !== payload.conversation_id) {
            return;
          }
          renderNotes(previousNotes);
          input.value = text;
          showError('Не удалось сохранить заметку. Попробуйте еще раз.');
        })
        .finally(() => {
          saveButton.disabled = false;
        });
    });
  }

  function bindFollowPostpone() {
    const followPane = root.querySelector('#tab-follow');
    const button = followPane?.querySelector('.js-follow-postpone');
    if (!followPane || !button || button.dataset.followPostponeBound === '1') {
      return;
    }

    button.dataset.followPostponeBound = '1';

    const getKpi = (label) => Array.from(followPane.querySelectorAll('.context-kpi')).find(
      (item) => item.querySelector('span')?.textContent.trim() === label
    );
    const getFollowState = () => ({
      next_touch: getKpi('Next touch')?.querySelector('strong')?.textContent.trim() || '',
      limit: getKpi('Limit')?.querySelector('strong')?.textContent.trim() || '',
      reason: getKpi('Reason')?.querySelector('strong')?.textContent.trim() || '',
      channel: getKpi('Channel')?.querySelector('strong')?.textContent.trim() || '',
      soft_touch: followPane.querySelector('.context-note-card p')?.textContent.trim() || '',
    });

    const renderFollowState = (state = {}) => {
      const values = {
        'Next touch': state.next_touch,
        Limit: state.limit,
        Reason: state.reason,
        Channel: state.channel,
      };
      Object.entries(values).forEach(([label, value]) => {
        const output = getKpi(label)?.querySelector('strong');
        if (output && typeof value === 'string') {
          output.textContent = value;
        }
      });
      const softTouch = followPane.querySelector('.context-note-card p');
      if (softTouch && typeof state.soft_touch === 'string') {
        softTouch.textContent = state.soft_touch;
      }
    };

    const requestFollowPostpone = (payload) => {
      /*
      // Real API integration point for rescheduling an existing follow-up.
      // Backend owns the exact next-touch timestamp, business-hours policy,
      // channel eligibility, remaining limit and concurrent update checks.
      return fetch(CHAT_API_ENDPOINTS.followUp(payload.conversation_id), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Follow postpone request failed');
        }
        return response.json();
      });
      */

      return window.Promise.resolve({
        ok: true,
        conversation_id: payload.conversation_id,
        follow: {
          ...payload.previous_follow,
          next_touch: CHAT_FOLLOW_CONFIG.demoPostponeLabel,
          reason: 'Postponed by operator',
        },
      });
    };

    button.addEventListener('click', (event) => {
      event.preventDefault();
      const conversationId = root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '';
      if (!conversationId || button.disabled) {
        return;
      }

      const originalLabel = button.textContent.trim();
      const previousFollow = getFollowState();
      const payload = {
        conversation_id: conversationId,
        action: 'postpone_until_tomorrow',
        previous_follow: previousFollow,
        requested_by: root.dataset.agentId || root.dataset.userId || '',
        requested_from: 'right_context_follow',
        requested_at: new Date().toISOString(),
      };
      renderFollowState({
        ...previousFollow,
        next_touch: CHAT_FOLLOW_CONFIG.demoPostponeLabel,
        reason: 'Postponed by operator',
      });
      button.disabled = true;
      button.textContent = 'Postponing...';

      requestFollowPostpone(payload)
        .then((response) => {
          if (!response?.ok || !response.follow) {
            throw new Error('Follow was not postponed');
          }
          if (root.dataset.conversationId !== conversationId) {
            return;
          }
          renderFollowState(response.follow);
          button.textContent = 'Postponed';
        })
        .catch(() => {
          if (root.dataset.conversationId === conversationId) {
            renderFollowState(previousFollow);
            button.textContent = 'Could not postpone';
          }
        })
        .finally(() => {
          window.setTimeout(() => {
            button.disabled = false;
            button.textContent = originalLabel;
          }, CHAT_UI_TIMING.actionFeedbackMs);
        });
    });
  }

  function bindPinnedMessagesDrawer() {
    const drawer = root.querySelector('#pinnedMessagesDrawer');
    const getOpenButtons = () => Array.from(root.querySelectorAll('.js-open-pinned-messages'));
    const openButton = getOpenButtons()[0];
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
    let activeOpenButton = openButton;

    const getPinnedConversationId = () => root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '';
    const normalizePinnedRecord = (record = {}, index = 0) => ({
      id: String(record.id || record.pin_id || `pin-server-${index + 1}`),
      messageId: String(record.messageId || record.message_id || ''),
      title: record.title || 'Pinned message',
      preview: record.preview || record.text_preview || '',
      meta: record.meta || record.message_meta || '',
      pinnedBy: record.pinnedBy || record.pinned_by || 'system',
      pinnedAt: record.pinnedAt || record.pinned_at_label || record.pinned_at || '',
      pinnedAtTs: Number(record.pinnedAtTs || record.pinned_at_ts || Date.parse(record.pinned_at || '')) || 0,
    });

    const getPinnedRecordsFromResponse = (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      return Array.isArray(response?.pinned_messages) ? response.pinned_messages : [];
    };

    const getPinnedRecordFromResponse = (response) => response?.pinned_message || response || {};

    const demoPinnedApi = {
      list() {
        const conversationId = getPinnedConversationId();
        /*
        // Real API integration point:
        return fetch(`${CHAT_API_ENDPOINTS.pinnedList}?conversation_id=${encodeURIComponent(conversationId)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        }).then((response) => response.json());
        */
        return window.Promise.resolve(demoPinnedSeed.map((item) => ({ ...item })));
      },
      pin(record) {
        const conversationId = getPinnedConversationId();
        /*
        // Real API integration point:
        return fetch(CHAT_API_ENDPOINTS.pinnedList, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
          body: JSON.stringify({ conversation_id: conversationId, message_id: record.messageId }),
        }).then((response) => response.json());
        */
        return window.Promise.resolve({ ...record, id: record.id || `pin-${nextPinnedId++}` });
      },
      unpin(record) {
        /*
        // Real API integration point:
        return fetch(CHAT_API_ENDPOINTS.pinnedRecord(record.id), {
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
      getOpenButtons().forEach((button) => {
        button.classList.remove('is-active');
        button.setAttribute('aria-expanded', 'false');
      });
    };

    const positionDrawer = () => {
      const centerPane = root.querySelector('.pane-center');
      const chatShell = root.querySelector('.chat-shell');
      const buttonRect = activeOpenButton.getBoundingClientRect();
      const paneRect = centerPane?.getBoundingClientRect();
      const shellRect = chatShell?.getBoundingClientRect();
      if (!paneRect) {
        return;
      }

      const top = Math.max(
        CHAT_FLOATING_UI.pinnedDrawerTopInsetPx,
        buttonRect.bottom + CHAT_FLOATING_UI.popupGapPx
      );
      const right = Math.max(
        CHAT_FLOATING_UI.pinnedDrawerRightInsetPx,
        window.innerWidth - buttonRect.right
      );
      const viewportBottom = window.innerHeight - CHAT_FLOATING_UI.viewportPaddingPx;
      const lowerBoundary = Math.min(
        viewportBottom,
        shellRect?.bottom || viewportBottom
      );
      const availableHeight = Math.max(
        0,
        lowerBoundary - top
      );
      drawer.style.top = `${top}px`;
      drawer.style.right = `${right}px`;
      drawer.style.maxHeight = `${availableHeight}px`;
    };

    const open = () => {
      positionDrawer();
      drawer.hidden = false;
      getOpenButtons().forEach((button) => {
        const isActiveTrigger = button === activeOpenButton;
        button.classList.toggle('is-active', isActiveTrigger);
        button.setAttribute('aria-expanded', isActiveTrigger ? 'true' : 'false');
      });
    };

    const getPrimaryOpenButton = () => root.querySelector('.dialog-pinned-btn.js-open-pinned-messages') || openButton;

    const toggle = (trigger = openButton) => {
      // The more-menu entry opens the drawer from the stable header control.
      activeOpenButton = trigger.closest('.chat-more-menu') ? getPrimaryOpenButton() : trigger;
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
        window.setTimeout(() => message.classList.remove('is-anchor-highlight'), CHAT_UI_TIMING.anchorHighlightMs);
      }, CHAT_UI_TIMING.quickUiSettleMs);
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
          pinButton.setAttribute('aria-label', pinned ? 'Unpin message' : 'Pin message');
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
      }, CHAT_UI_TIMING.pinnedErrorMs);
    };

      const getPinnedPreviewFromMessage = (messageId) => {
        const anchor = getMessageAnchor(messageId);
        const message = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
        const attachmentKind = getAttachmentKind(message);
        const attachmentCount = getAttachmentCount(message);
        const text = message?.querySelector('.ng-binding')?.textContent?.trim();
        const timestamp = message?.querySelector('.direct-chat-timestamp')?.textContent?.trim();
        const sender = getMessageAuthor(message) === 'operator' ? 'Orion' : 'Alla';
        const cardType = message?.dataset.messageCardType || '';
        const offerTitle = message?.querySelector('.billing-offer-head strong')?.textContent?.trim();
        const offerDescription = message?.querySelector('.billing-offer-card p')?.textContent?.trim();
        const kindTitles = {
          audio: 'Audio attachment',
          voice: 'Voice note',
          file: 'File attachment',
          image: 'Photo',
          mix: 'Mixed attachments',
        };

        if (cardType === 'billing_offer') {
          return {
            messageId,
            title: offerTitle || 'Package offer',
            preview: offerDescription || 'Personal package offer prepared for the client.',
            meta: `Package offer${timestamp ? ` · ${timestamp}` : ''}`,
          };
        }

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

      getOpenButtons().forEach((button) => {
        button.classList.toggle('has-pinned-items', pinnedStore.length > 0);
      });
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
            <span class="pinned-message-heading">
              <strong>${escapeText(item.title)}</strong>
              <span class="pinned-message-meta">${escapeText(item.meta)}</span>
            </span>
            <span>${escapeText(item.preview)}</span>
          </button>
          <span class="pinned-message-owner">Pinned by ${escapeText(item.pinnedBy)} · ${escapeText(item.pinnedAt)}</span>
          <button class="pinned-unpin-btn js-pinned-unpin" type="button">Unpin</button>
        `;
        list.insertBefore(card, emptyState || null);
      });
      updatePinnedUiState();
    };

    const replacePinnedStore = (records = []) => {
      pinnedStore = Array.isArray(records)
        ? records.map((record, index) => normalizePinnedRecord(record, index)).filter((record) => record.messageId)
        : [];
      nextPinnedTs = Math.max(
        demoPinnedSeed.length + 1,
        ...pinnedStore.map((record) => Number(record.pinnedAtTs) || 0)
      ) + 1;
      bindMessagePinButtons();
      renderPinnedList();
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
        .then((savedResponse) => {
          const savedRecord = getPinnedRecordFromResponse(savedResponse);
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

    getOpenButtons().forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    ensureAnchors();
    demoPinnedApi.list()
      .then((response) => {
        replacePinnedStore(getPinnedRecordsFromResponse(response));
      })
      .catch(() => {
        replacePinnedStore([]);
        showPinnedError('Could not load pinned messages.');
      });

    root.addEventListener('agentchat:pinned-records-replaced', (event) => {
      replacePinnedStore(event.detail?.records || []);
      close();
    });

    // Capture before Bootstrap/AdminLTE menu handlers can close or consume the click.
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.js-open-pinned-messages');
      if (!trigger || !root.contains(trigger)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      trigger.closest('.chat-more-menu')?.classList.remove('open');
      toggle(trigger);
    }, true);

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

    window.addEventListener('resize', () => {
      if (!drawer.hidden) {
        positionDrawer();
      }
    });
  }

  function bindQueueRefresh() {
    const refreshButtons = document.querySelectorAll('#btnRefreshChat, .queue-refresh');
    const requestChatRefresh = () => {
      const payload = {
        conversation_id: root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '',
        include_queue: true,
        include_conversation: true,
        include_context: true,
        requested_by: root.dataset.agentId || root.dataset.userId || 'admin',
        requested_from: 'header_refresh',
        requested_at: new Date().toISOString(),
      };

      /*
      // Real API integration point for manual refresh without full page reload.
      // Backend can return the same response shape as queue/conversation switch endpoints.
      return fetch(CHAT_API_ENDPOINTS.refreshConversation(payload.conversation_id), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Conversation refresh failed');
        }
        return response.json();
      });
      */

      return window.Promise.resolve({ ok: true, refresh: payload });
    };

    refreshButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        button.disabled = true;
        requestChatRefresh()
          .then((response) => {
            if (response?.conversation) {
              root.dispatchEvent(new CustomEvent('agentchat:apply-conversation-response', {
                detail: {
                  response,
                  fallback_conversation: response.conversation,
                  source: 'manual_refresh',
                },
              }));
              return;
            }
            runQueueStateUpdate(root, 'manual_refresh', root.dataset.queueActiveFilterZone || 'quick_preset');
          })
          .catch(() => {
            runQueueStateUpdate(root, 'manual_refresh_failed', root.dataset.queueActiveFilterZone || 'quick_preset');
          })
          .finally(() => {
            button.disabled = false;
          });
      });
    });
  }

  function bindBillingActions() {
    const buttons = Array.from(root.querySelectorAll('.js-send-package-link'));
    if (!buttons.length || root.dataset.billingActionsBound === '1') {
      return;
    }

    root.dataset.billingActionsBound = '1';

    const buildBillingActionPayload = (action, source) => {
      const activeItem = getActiveConversationItem(root);
      return {
        conversation_id: root.dataset.conversationId || activeItem?.dataset.conversationId || '',
        sender_user_id: activeItem?.dataset.senderUserId || '',
        sender_name: activeItem?.dataset.senderName || activeItem?.dataset.displayContactName || '',
        recipient_user_id: activeItem?.dataset.recipientUserId || '',
        recipient_name: activeItem?.dataset.recipientName || '',
        action,
        source,
        requested_by: root.dataset.agentId || root.dataset.userId || 'admin',
        requested_at: new Date().toISOString(),
      };
    };

    const requestBillingAction = (payload) => {
      /*
      // Real API integration point for billing/payment actions from the chat UI.
      // Backend should create/send the payment/top-up/package link and return the final action status.
      return fetch(CHAT_API_ENDPOINTS.billingAction(payload.conversation_id), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Billing action failed');
        }
        return response.json();
      });
      */

      return window.Promise.resolve({
        ok: true,
        billing_action: payload,
        message: {
          id: `demo-billing-${Date.now()}`,
          offer: {
            title: 'Deep reading',
            description: 'Персональное предложение для продолжения консультации.',
            url: 'https://confideline.com/',
            cta: 'Открыть предложение',
          },
        },
      });
    };

    const appendBillingActionMessage = (payload, response = {}) => {
      if (root.dataset.conversationId !== payload.conversation_id) {
        return;
      }
      const list = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
      if (!list) {
        return;
      }

      if (typeof response.message_html === 'string') {
        const fragment = document.createRange().createContextualFragment(response.message_html);
        list.appendChild(fragment);
        list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return;
      }

      const messageId = String(response.message?.id || `demo-billing-${Date.now()}`);
      const offer = response.message?.offer || {};
      const offerTitle = String(offer.title || 'Пакет консультации');
      const offerDescription = String(offer.description || 'Персональное предложение готово.');
      const offerUrl = String(offer.url || '#');
      const offerCta = String(offer.cta || 'Открыть предложение');
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const avatar = root.dataset.agentAvatar || root.dataset.userAvatar || '';
      const message = document.createElement('div');
      message.className = 'direct-chat-msg read';
      message.id = `message-${messageId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      message.dataset.messageId = messageId;
      message.dataset.messageAuthor = 'operator';
      message.dataset.messageKind = 'text';
      message.dataset.messageCardType = 'billing_offer';
      message.dataset.messageHasText = 'false';
      message.dataset.messageLang = '';
      message.dataset.attachmentKind = 'none';
      message.dataset.attachmentCount = '0';
      message.dataset.messageViewedByClient = 'false';
      message.innerHTML = `
        <div class="direct-chat-info clearfix">
          <span class="direct-chat-name pull-left"></span>
          <span class="direct-chat-timestamp pull-right">${queueEscapeHtml(timestamp)}</span>
        </div>
        <img class="direct-chat-img" src="${queueEscapeHtml(avatar)}" alt="">
        <div class="direct-chat-text">
          <section class="billing-offer-card" aria-label="Предложение пакета ${queueEscapeHtml(offerTitle)}">
            <div class="billing-offer-head">
              <i class="fa fa-credit-card" aria-hidden="true"></i>
              <strong>${queueEscapeHtml(offerTitle)}</strong>
            </div>
            <p>${queueEscapeHtml(offerDescription)}</p>
            <a class="btn btn-primary btn-xs billing-offer-open" href="${queueEscapeHtml(offerUrl)}" target="_blank" rel="noopener noreferrer">
              <span>${queueEscapeHtml(offerCta)}</span><i class="fa fa-angle-right" aria-hidden="true"></i>
            </a>
          </section>
          <div class="message-actions-row">
            <button class="btn btn-xs btn-default message-pin-toggle" type="button" aria-pressed="false"><i class="fa fa-thumb-tack"></i> Pin</button>
          </div>
        </div>
      `;
      list.appendChild(message);
      message.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const originalText = button.textContent.trim();
        const action = 'send_package_link';
        const source = 'right_context_pay_tab';
        const payload = buildBillingActionPayload(action, source);
        button.disabled = true;
        requestBillingAction(payload)
          .then((response) => {
            if (!response?.ok) {
              throw new Error('Billing action was not sent');
            }
            appendBillingActionMessage(payload, response);
            button.textContent = 'Sent';
            window.setTimeout(() => {
              button.textContent = originalText;
            }, CHAT_UI_TIMING.actionFeedbackMs);
          })
          .catch(() => {
            button.textContent = 'Error';
            window.setTimeout(() => {
              button.textContent = originalText;
            }, CHAT_UI_TIMING.actionFeedbackMs);
          })
          .finally(() => {
            button.disabled = false;
          });
      });
    });
  }

  const getQueueKnownTotal = (root) => {
    const declaredTotal = Number(root.dataset.queueKnownTotal || root.querySelector('.conv-list')?.dataset.totalConversations || 0);
    if (declaredTotal > 0) {
      return declaredTotal;
    }
    return Math.max(
      root.querySelectorAll('.conv-list .conv-item, .conv-list .list-group-item').length,
      Array.isArray(QUEUE_DEMO_CONVERSATIONS) ? QUEUE_DEMO_CONVERSATIONS.length : 0
    );
  };

  const getQueueFilterMode = (root) => (
    getQueueKnownTotal(root) > CHAT_QUEUE_CONFIG.localFilterLimit ? 'ajax' : 'local'
  );

  const getQueueStatePayload = (root, changedBy = 'unknown') => {
    const activeZone = root.dataset.queueActiveFilterZone || 'none';
    const filterMode = getQueueFilterMode(root);
    return {
      changed_by: changedBy,
      active_filter_zone: activeZone,
      filter_mode: filterMode,
      local_filter_limit: CHAT_QUEUE_CONFIG.localFilterLimit,
      known_total: getQueueKnownTotal(root),
      query: activeZone === 'search' ? root.querySelector('#conversationsSearch')?.value.trim() || '' : '',
      selected_user_id: activeZone === 'user_select' ? root.querySelector('#queueUserSelect')?.dataset.selectedUserId || '' : '',
      selected_expert_id: activeZone === 'expert_select' ? root.querySelector('#queueExpertSelect')?.dataset.selectedExpertId || '' : '',
      quick_preset: activeZone === 'quick_preset' ? root.querySelector('.js-queue-tab.active')?.dataset.tab || 'chats' : '',
       active_filters: activeZone === 'quick_filters' ? Array.from(root.querySelectorAll('.queue-search-filters input:checked')).map((item) => ({
         group: item.dataset.group || '',
         value: item.dataset.badgeCode || item.value || '',
         badge_code: item.dataset.badgeCode || item.value || '',
         scenario: item.dataset.scenario || '',
         badge: item.dataset.badge || item.value || '',
         zones: String(item.dataset.zones || '').split(',').map((zone) => zone.trim()).filter(Boolean),
       })) : [],
    };
  };

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

    if (keepZone !== 'expert_select') {
      const expertSelect = root.querySelector('#queueExpertSelect');
      const expertBox = root.querySelector('.queue-expert-select');
      const empty = expertBox?.querySelector('.searchable-selectbox-empty');
      if (expertSelect) {
        expertSelect.value = '';
        delete expertSelect.dataset.selectedExpertId;
        expertSelect.classList.remove('is-filled');
      }
      if (expertBox) {
        delete expertBox.dataset.selectedExpertId;
        expertBox.classList.remove('is-filled', 'has-selected-value', 'has-no-results', 'is-open');
        expertBox.querySelectorAll('.searchable-selectbox-option.is-active').forEach((option) => option.classList.remove('is-active'));
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

  const queueEscapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);

  const getQueueBadgeDefinition = (scenario, badgeOrCode) => {
    const normalizedValue = String(badgeOrCode || '').trim();
    if (!normalizedValue) {
      return null;
    }
    return CHAT_BADGE_BY_CODE.get(normalizedValue)
      || CHAT_BADGE_BY_SCENARIO_LABEL.get(`${String(scenario || '').toLowerCase()}:${normalizedValue.toLowerCase()}`)
      || null;
  };

  const getBadgeToneClass = (definition) => (
    definition?.tone ? `badge-tone-${definition.tone}` : ''
  );

  const syncBadgeToneClasses = (scope = root) => {
    scope.querySelectorAll('[data-badge]').forEach((badge) => {
      CHAT_BADGE_TONE_CLASS_NAMES.forEach((className) => badge.classList.remove(className));
      const definition = getQueueBadgeDefinition(
        badge.dataset.badgeScenario || badge.closest('.conv-item')?.dataset.leadType || '',
        badge.dataset.badgeCode || badge.dataset.badge || badge.textContent.trim()
      );
      const toneClass = getBadgeToneClass(definition);
      if (toneClass) {
        badge.classList.add(toneClass);
      }
    });
  };

  const getQueueBadgeCodesForZone = (values, scenario, zone) => {
    const uniqueCodes = new Set();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const definition = getQueueBadgeDefinition(scenario, value);
      if (definition && definition.scenario === scenario && definition.zones.includes(zone)) {
        uniqueCodes.add(definition.code);
      }
    });
    return Array.from(uniqueCodes).sort((leftCode, rightCode) => {
      const left = CHAT_BADGE_BY_CODE.get(leftCode);
      const right = CHAT_BADGE_BY_CODE.get(rightCode);
      const roleDelta = (CHAT_BADGE_ROLE_ORDER[left?.role] ?? 99) - (CHAT_BADGE_ROLE_ORDER[right?.role] ?? 99);
      return roleDelta || (left?.priority ?? 999) - (right?.priority ?? 999);
    });
  };

  const getQueueBadgeLabels = (codes) => (
    (Array.isArray(codes) ? codes : [])
      .map((code) => CHAT_BADGE_BY_CODE.get(code)?.label)
      .filter(Boolean)
  );

  // Demo queue fixtures stay beside the renderer and are replaced by the conversation API in Yii2.
  const QUEUE_AVATARS = {
    clientA: 'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_OraGJPMgdK6RaWdgh_BQNxnMTT18IiHa.webp',
    clientB: 'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_YYmlxxf_GAfbo-HgrA8OIR0u-yte-vOq.webp',
    expertA: 'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_CLUre-mRxp6ZnPZmK2odQwqPmK3ktQI8.webp',
    expertB: 'https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_jxSPNscGV5BEjL1BLbBQJNhj29uiYVMv.webp',
  };
  const QUEUE_CLIENT_AVATAR = QUEUE_AVATARS.clientA;
  const QUEUE_EXPERT_AVATAR = QUEUE_AVATARS.expertA;

  const QUEUE_DEMO_CONVERSATIONS = [
    {
      id: 'c2',
      leadType: 'chats',
      senderUserId: '791',
      recipientUserId: '792',
      senderName: 'Alla',
      recipientName: 'Orion Esposito',
      senderAvatar: QUEUE_AVATARS.clientA,
      recipientAvatar: QUEUE_AVATARS.expertA,
      time: '8:17 AM',
      snippet: 'Need a quick confirmation for the New York slot at 12:00.',
      unread: 3,
      isOnline: true,
      isPinned: true,
      isFavorite: true,
      leftBadges: ['Safe', 'Live', 'Paid'],
      centerBadges: ['Safe', 'Live', 'Paid'],
      rightBadges: ['Safe', 'Live', 'Paid'],
    },
    {
      id: 'c3',
      leadType: 'chats',
      senderUserId: '799',
      recipientUserId: '800',
      senderName: 'Maya Bennett',
      recipientName: 'Elena Park',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertB,
      time: '9:12 AM',
      snippet: 'Client reached payment but needs a soft nudge to finish.',
      unread: 1,
      isOnline: true,
      leftBadges: ['PP', 'Paid', 'Revive', 'Coupon'],
      centerBadges: ['PP', 'Paid', 'Revive', 'Coupon'],
      rightBadges: ['PP', 'Paid', 'Revive', 'Coupon'],
    },
    {
      id: 'c7',
      leadType: 'chats',
      senderUserId: '841',
      recipientUserId: '842',
      senderName: 'Eva Coleman',
      recipientName: 'Mila Stone',
      senderAvatar: QUEUE_AVATARS.expertB,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: '10:26 AM',
      snippet: 'Paid session is active with another expert, do not interrupt.',
      unread: 0,
      isOnline: true,
      leftBadges: ['Safe', 'Live', 'Paid'],
      centerBadges: ['Safe', 'Live', 'Paid'],
      rightBadges: ['Safe', 'Live', 'Paid'],
    },
    {
      id: 'c8',
      leadType: 'chats',
      senderUserId: '843',
      recipientUserId: '844',
      senderName: 'Nora Vale',
      recipientName: 'Orion Esposito',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertA,
      time: '11:03 AM',
      snippet: 'Free reading boundary is close; next answer should lead to paid chat.',
      unread: 2,
      leftBadges: ['Sell', 'Paid', 'Trial'],
      centerBadges: ['Sell', 'Paid', 'Trial'],
      rightBadges: ['Sell', 'Paid', 'Trial'],
    },
    {
      id: 'c9',
      leadType: 'chats',
      senderUserId: '845',
      recipientUserId: '846',
      senderName: 'Ivy Morgan',
      recipientName: 'Sophia Reed',
      senderAvatar: QUEUE_AVATARS.clientA,
      recipientAvatar: QUEUE_AVATARS.expertB,
      time: 'Yesterday',
      snippet: 'Returning buyer asks about coupon after a paused payment attempt.',
      unread: 0,
      isPinned: true,
      isFavorite: true,
      leftBadges: ['PP', 'Revive', 'Coupon'],
      centerBadges: ['PP', 'Revive', 'Coupon'],
      rightBadges: ['PP', 'Revive', 'Coupon'],
    },
    {
      id: 'c10',
      leadType: 'chats',
      senderUserId: '857',
      recipientUserId: '858',
      senderName: 'Amelia Hart',
      recipientName: 'Elena Park',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertB,
      time: '11:28 AM',
      snippet: 'Needs a careful reply before the paid session timer runs too low.',
      unread: 5,
      isOnline: true,
      isPinned: true,
      leftBadges: ['Risk', 'Live', 'Paid'],
      centerBadges: ['Risk', 'Live', 'Paid'],
      rightBadges: ['Risk', 'Live', 'Paid'],
    },
    {
      id: 'c11',
      leadType: 'chats',
      senderUserId: '859',
      recipientUserId: '860',
      senderName: 'Diego Santos',
      recipientName: 'Orion Esposito',
      senderAvatar: QUEUE_AVATARS.clientA,
      recipientAvatar: QUEUE_AVATARS.expertA,
      time: '12:06 PM',
      snippet: 'Asked for a package explanation after seeing the payment prompt.',
      unread: 0,
      isFavorite: true,
      leftBadges: ['Skeptic', 'PP'],
      centerBadges: ['Skeptic', 'PP'],
      rightBadges: ['Skeptic', 'PP'],
    },
    {
      id: 'c12',
      leadType: 'chats',
      senderUserId: '861',
      recipientUserId: '862',
      senderName: 'Priya Shah',
      recipientName: 'Mila Stone',
      senderAvatar: QUEUE_AVATARS.expertB,
      recipientAvatar: QUEUE_AVATARS.clientA,
      time: '12:41 PM',
      snippet: 'Live paid chat is open; client is waiting for a short confirmation.',
      unread: 2,
      isOnline: true,
      isPinned: true,
      leftBadges: ['Live', 'Paid', 'Trial'],
      centerBadges: ['Live', 'Paid', 'Trial'],
      rightBadges: ['Live', 'Paid', 'Trial'],
    },
    {
      id: 'c13',
      leadType: 'chats',
      senderUserId: '863',
      recipientUserId: '864',
      senderName: 'Kira Novak',
      recipientName: 'Sophia Reed',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertA,
      time: '1:15 PM',
      snippet: 'Wants a softer transition from free answer to paid follow-up.',
      unread: 1,
      isOnline: true,
      leftBadges: ['Sell', 'Safe', 'Coupon'],
      centerBadges: ['Sell', 'Safe', 'Coupon'],
      rightBadges: ['Sell', 'Safe', 'Coupon'],
    },
    {
      id: 'c14',
      leadType: 'chats',
      senderUserId: '865',
      recipientUserId: '866',
      senderName: 'Tom Warren',
      recipientName: 'Elena Park',
      senderAvatar: QUEUE_AVATARS.expertA,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: '2:03 PM',
      snippet: 'Long wait after payment; answer should acknowledge delay first.',
      unread: 4,
      isFavorite: true,
      leftBadges: ['Risk', 'Paid', 'Revive'],
      centerBadges: ['Risk', 'Paid', 'Revive'],
      rightBadges: ['Risk', 'Paid', 'Revive'],
    },
    {
      id: 'p1',
      leadType: 'pings',
      senderUserId: '835',
      recipientUserId: '836',
      senderName: 'Liam Carter',
      recipientName: 'Sophia Reed',
      senderAvatar: QUEUE_AVATARS.expertA,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: 'Now',
      snippet: 'Client is actively checking the expert profile and payment path.',
      unread: 4,
      isOnline: true,
      isPinned: true,
      leftBadges: ['Reply', 'Fire', 'Paid', 'Revive'],
      centerBadges: ['Reply', 'Fire', 'Paid', 'Revive', 'Trial'],
      rightBadges: ['Paid', 'Revive', 'Trial'],
    },
    {
      id: 'p2',
      leadType: 'pings',
      senderUserId: '838',
      recipientUserId: '839',
      senderName: 'Noah Reed',
      recipientName: 'Mila Stone',
      senderAvatar: QUEUE_AVATARS.expertB,
      recipientAvatar: QUEUE_AVATARS.clientA,
      time: '6 min',
      snippet: 'Expert already touched the lead; wait for the client response.',
      unread: 0,
      leftBadges: ['Hot', 'Await'],
      centerBadges: ['Hot', 'Await', 'Trial'],
      rightBadges: ['Trial'],
    },
    {
      id: 'p3',
      leadType: 'pings',
      senderUserId: '847',
      recipientUserId: '848',
      senderName: 'Clara Hill',
      recipientName: 'Elena Park',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertB,
      time: '18 min',
      snippet: 'Fresh pre-chat signal with moderator risk note attached.',
      unread: 1,
      isOnline: true,
      leftBadges: ['NEW', 'Risk'],
      centerBadges: ['Risk', 'NEW'],
      rightBadges: ['Risk'],
    },
    {
      id: 'p4',
      leadType: 'pings',
      senderUserId: '849',
      recipientUserId: '850',
      senderName: 'Mark Lewis',
      recipientName: 'Orion Esposito',
      senderAvatar: QUEUE_AVATARS.clientA,
      recipientAvatar: QUEUE_AVATARS.expertA,
      time: '42 min',
      snippet: 'Previous buyer returned to the old topic after expert follow-up.',
      unread: 0,
      leftBadges: ['Await', 'Paid', 'Revive'],
      centerBadges: ['Await', 'Paid', 'Revive'],
      rightBadges: ['Paid', 'Revive'],
    },
    {
      id: 'p5',
      leadType: 'pings',
      senderUserId: '851',
      recipientUserId: '852',
      senderName: 'Sasha Kim',
      recipientName: 'Sophia Reed',
      senderAvatar: QUEUE_AVATARS.expertB,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: '1h',
      snippet: 'High-intent first touch, but outreach must stay soft and safe.',
      unread: 2,
      isOnline: true,
      leftBadges: ['Fire', 'Risk'],
      centerBadges: ['Risk', 'Fire'],
      rightBadges: ['Risk', 'Trial'],
    },
    {
      id: 'p6',
      leadType: 'pings',
      senderUserId: '853',
      recipientUserId: '854',
      senderName: 'Daria Frost',
      recipientName: 'Mila Stone',
      senderAvatar: QUEUE_AVATARS.expertA,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: 'Today',
      snippet: 'Fresh signal without stronger personal intent yet.',
      unread: 0,
      leftBadges: ['NEW'],
      centerBadges: ['NEW'],
      rightBadges: [],
    },
    {
      id: 'r1',
      leadType: 'rejects',
      senderUserId: '837',
      recipientUserId: '838',
      senderName: 'Sofia Alvarez',
      recipientName: 'Noah Reed',
      senderAvatar: QUEUE_AVATARS.clientB,
      recipientAvatar: QUEUE_AVATARS.expertB,
      time: 'Yesterday',
      snippet: 'Rejected lead kept for audit history; no approved badges for this tab.',
      unread: 0,
      leftBadges: [],
      centerBadges: [],
      rightBadges: [],
    },
    {
      id: 'r2',
      leadType: 'rejects',
      senderUserId: '855',
      recipientUserId: '856',
      senderName: 'Ben Foster',
      recipientName: 'Elena Park',
      senderAvatar: QUEUE_AVATARS.clientA,
      recipientAvatar: QUEUE_AVATARS.clientB,
      time: '24 Apr',
      snippet: 'Declined outreach candidate. Shown without badge semantics.',
      unread: 0,
      leftBadges: [],
      centerBadges: [],
      rightBadges: [],
    },
  ];

  const renderQueueBadge = (badgeCode, zone) => {
    const definition = CHAT_BADGE_BY_CODE.get(badgeCode);
    if (!definition || !definition.zones.includes(zone)) {
      return '';
    }
    return `
      <span class="conv-pill ${getBadgeToneClass(definition)}" data-badge="${queueEscapeHtml(definition.label)}" data-badge-code="${queueEscapeHtml(definition.code)}" data-badge-scenario="${queueEscapeHtml(definition.scenario)}" data-badge-role="${queueEscapeHtml(definition.role)}" data-badge-priority="${definition.priority}" data-badge-zone="${queueEscapeHtml(zone)}">${queueEscapeHtml(definition.label)}</span>
    `;
  };

  const normalizeQueueBoolean = (value) => value === true || value === 1 || value === '1' || value === 'true';

  const normalizeQueueConversation = (conversation = {}) => ({
    id: String(conversation.id || conversation.conversation_id || ''),
    leadType: conversation.leadType || conversation.lead_type || 'chats',
    senderUserId: String(conversation.senderUserId || conversation.sender_user_id || ''),
    recipientUserId: String(conversation.recipientUserId || conversation.recipient_user_id || ''),
    senderName: conversation.senderName || conversation.sender_name || conversation.display_contact_name || 'Client',
    recipientName: conversation.recipientName || conversation.recipient_name || 'Expert',
    displayContactName: conversation.displayContactName || conversation.display_contact_name || conversation.senderName || conversation.sender_name || 'Client',
    senderAvatar: conversation.senderAvatar || conversation.sender_avatar || QUEUE_CLIENT_AVATAR,
    recipientAvatar: conversation.recipientAvatar || conversation.recipient_avatar || QUEUE_EXPERT_AVATAR,
    time: conversation.time || conversation.last_message_time || '',
    snippet: conversation.snippet || conversation.last_message_preview || '',
    unread: Number(conversation.unread ?? conversation.unread_count ?? 0),
    isOnline: normalizeQueueBoolean(conversation.isOnline ?? conversation.is_online),
    isPinned: normalizeQueueBoolean(conversation.isPinned ?? conversation.is_pinned),
    isFavorite: normalizeQueueBoolean(conversation.isFavorite ?? conversation.is_favorite),
    isActive: normalizeQueueBoolean(conversation.isActive ?? conversation.is_active),
    leftBadges: conversation.leftBadges || conversation.left_badge_codes || conversation.badge_codes || conversation.labels || [],
    centerBadges: conversation.centerBadges || conversation.center_badge_codes || conversation.center_labels || [],
    rightBadges: conversation.rightBadges || conversation.right_badge_codes || conversation.right_labels || [],
    profileLanguage: conversation.profileLanguage || conversation.profile_language || '',
    translationSourceLang: conversation.translationSourceLang || conversation.translation_source_lang || 'auto',
    translationTargetLang: conversation.translationTargetLang || conversation.translation_target_lang || 'auto',
  });

  const renderDemoQueueCards = (leadType = 'chats', sourceConversations = QUEUE_DEMO_CONVERSATIONS) => {
    const normalizedLeadType = ['chats', 'pings', 'rejects'].includes(leadType) ? leadType : 'all';
    const conversations = (Array.isArray(sourceConversations) ? sourceConversations : [])
      .map((item) => normalizeQueueConversation(item))
      .filter((item) => item.id && (normalizedLeadType === 'all' || item.leadType === normalizedLeadType));
    const activeConversationId = root.dataset.conversationId || '';
    const activeConversationIsVisible = conversations.some((item) => item.id === activeConversationId);

    return conversations.map((item, index) => {
      const leftBadgeCodes = getQueueBadgeCodesForZone(item.leftBadges, item.leadType, 'left');
      const centerBadgeCodes = getQueueBadgeCodesForZone(item.centerBadges, item.leadType, 'center');
      const rightBadgeCodes = getQueueBadgeCodesForZone(item.rightBadges, item.leadType, 'right');
      const leftBadges = getQueueBadgeLabels(leftBadgeCodes);
      const centerBadges = getQueueBadgeLabels(centerBadgeCodes);
      const rightBadges = getQueueBadgeLabels(rightBadgeCodes);
      const senderAvatar = item.senderAvatar || QUEUE_CLIENT_AVATAR;
      const recipientAvatar = item.recipientAvatar || QUEUE_EXPERT_AVATAR;
      const profileLanguage = normalizeTranslationLang(item.profileLanguage || CHAT_PAGE_CONFIG.profileLanguage || CHAT_TRANSLATION_TARGET_LANG, CHAT_TRANSLATION_TARGET_LANG);
      const translationSourceLang = normalizeTranslationLang(item.translationSourceLang || 'auto', 'auto');
      const translationTargetLang = normalizeTranslationLang(item.translationTargetLang || 'auto', 'auto');
      const isActive = item.isActive || item.id === activeConversationId
        || (!activeConversationIsVisible && index === 0 && normalizedLeadType !== 'all');
      const itemClasses = [
        'list-group-item',
        'conv-item',
        isActive ? 'active' : '',
        item.isFavorite ? 'is-favorite-conversation' : '',
        item.isPinned ? 'is-pinned-conversation' : '',
      ].filter(Boolean).join(' ');
      const labelsMarkup = leftBadges.length
        ? leftBadgeCodes.map((badgeCode) => renderQueueBadge(badgeCode, 'left')).join('')
        : '';

      return `
        <a href="#" class="${itemClasses}" data-conversation-id="${queueEscapeHtml(item.id)}" data-lead-type="${queueEscapeHtml(item.leadType)}" data-sender-user-id="${queueEscapeHtml(item.senderUserId)}" data-recipient-user-id="${queueEscapeHtml(item.recipientUserId)}" data-sender-name="${queueEscapeHtml(item.senderName)}" data-recipient-name="${queueEscapeHtml(item.recipientName)}" data-sender-avatar="${queueEscapeHtml(senderAvatar)}" data-recipient-avatar="${queueEscapeHtml(recipientAvatar)}" data-display-contact-name="${queueEscapeHtml(item.displayContactName)}" data-profile-language="${queueEscapeHtml(profileLanguage)}" data-translation-source-lang="${queueEscapeHtml(translationSourceLang)}" data-translation-target-lang="${queueEscapeHtml(translationTargetLang)}" data-is-favorite="${item.isFavorite ? 'true' : 'false'}" data-is-pinned="${item.isPinned ? 'true' : 'false'}" data-center-badges="${queueEscapeHtml(centerBadges.join(','))}" data-center-badge-codes="${queueEscapeHtml(centerBadgeCodes.join(','))}" data-right-badges="${queueEscapeHtml(rightBadges.join(','))}" data-right-badge-codes="${queueEscapeHtml(rightBadgeCodes.join(','))}" aria-current="${isActive ? 'true' : 'false'}">
          <div class="conv-line conv-line-head">
            <div class="conv-people conv-people-overlap ${item.isOnline ? 'has-online-contact' : ''}" data-display-contact-name="${queueEscapeHtml(item.displayContactName)}">
              <span class="conv-person ${item.isOnline ? 'is-online' : ''}" data-party-role="client">
                <img class="conv-mini-avatar" src="${queueEscapeHtml(senderAvatar)}" alt="${queueEscapeHtml(item.senderName)}">
                <span class="conv-person-name">${queueEscapeHtml(item.senderName)}</span>
              </span>
              ${item.isFavorite ? '<span class="conv-favorite conv-favorite-inline" title="Favorite chat" aria-label="Favorite chat"><i class="fa fa-star"></i></span>' : ''}
              <span class="conv-link"><i class="fa fa-long-arrow-right"></i></span>
              <span class="conv-person" data-party-role="expert">
                <img class="conv-mini-avatar" src="${queueEscapeHtml(recipientAvatar)}" alt="${queueEscapeHtml(item.recipientName)}">
                <span class="conv-person-name">${queueEscapeHtml(item.recipientName)}</span>
              </span>
            </div>
            <small class="conv-time">${queueEscapeHtml(item.time)}</small>
          </div>
          <div class="conv-line conv-line-message">
            <div class="conv-snippet">${queueEscapeHtml(item.snippet)}</div>
            <div class="conv-tools">
              ${item.isPinned ? '<span class="conv-pin"><i class="fa fa-thumb-tack"></i></span>' : ''}
              ${Number(item.unread) > 0 ? `<span class="conv-unread">${queueEscapeHtml(item.unread)}</span>` : ''}
            </div>
          </div>
          <div class="conv-line conv-line-labels">${labelsMarkup}</div>
        </a>
      `;
    }).join('');
  };

  const requestQueueStateUpdate = (payload) => {
    const shouldUseAjax = payload.filter_mode === 'ajax';
    /*
    // Real API integration point for queue tabs, user select, quick filters, and queue search.
    // Hybrid rule:
    // - payload.filter_mode === "local": frontend can filter already loaded/lightweight queue data.
    // - payload.filter_mode === "ajax": backend must filter a large queue and return the reduced list.
    // Expected response can be either:
    // { html: "<a class='conv-item' ...>...</a>", counters: {...} }
    // or { conversations: [...], counters: {...} } for client-side rendering.
    if (shouldUseAjax) {
      return fetch(CHAT_API_ENDPOINTS.queueFilter, {
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
    }
    return window.Promise.resolve({ ok: true, payload, filter_mode: 'local' });
    */
    const leadType = payload.active_filter_zone === 'quick_preset'
      ? payload.quick_preset || 'chats'
      : 'all';
    const localHtml = payload.active_filter_zone === 'quick_filters' && !shouldUseAjax
      ? renderDemoQueueCards('all')
      : renderDemoQueueCards(leadType);

    return window.Promise.resolve({
      ok: true,
      payload,
      filter_mode: shouldUseAjax ? 'ajax' : 'local',
      html: localHtml,
      counters: {
        chats: QUEUE_DEMO_CONVERSATIONS.filter((item) => item.leadType === 'chats').length,
        pings: QUEUE_DEMO_CONVERSATIONS.filter((item) => item.leadType === 'pings').length,
        rejects: QUEUE_DEMO_CONVERSATIONS.filter((item) => item.leadType === 'rejects').length,
      },
    });
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

  const getQueueCardBadgeEntries = (item) => {
    const leadType = item.dataset.leadType || 'chats';
    const entries = Array.from(item.querySelectorAll('.conv-pill')).map((pill) => {
      const scenario = pill.dataset.badgeScenario || leadType;
      const definition = getQueueBadgeDefinition(scenario, pill.dataset.badgeCode || pill.dataset.badge || pill.textContent.trim());
      return {
        code: definition?.code || pill.dataset.badgeCode || '',
        badge: definition?.label || pill.dataset.badge || pill.textContent.trim(),
        scenario,
        zone: pill.dataset.badgeZone || 'left',
      };
    });

    const appendDatasetEntries = (codeValue, labelValue, zone) => {
      const rawValues = String(codeValue || labelValue || '').split(',').map((value) => value.trim()).filter(Boolean);
      rawValues.forEach((value) => {
        const definition = getQueueBadgeDefinition(leadType, value);
        if (definition && definition.zones.includes(zone)) {
          entries.push({ code: definition.code, badge: definition.label, scenario: definition.scenario, zone });
        }
      });
    };

    appendDatasetEntries(item.dataset.centerBadgeCodes, item.dataset.centerBadges, 'center');
    appendDatasetEntries(item.dataset.rightBadgeCodes, item.dataset.rightBadges, 'right');

    return entries.map((entry) => ({
      code: String(entry.code || '').toLowerCase(),
      badge: String(entry.badge || '').toLowerCase(),
      scenario: String(entry.scenario || '').toLowerCase(),
      zone: String(entry.zone || '').toLowerCase(),
    }));
  };

  const queueCardMatchesBadgeFilter = (item, filter) => {
    const filterScenario = String(filter.scenario || item.dataset.leadType || 'chats').toLowerCase();
    const filterDefinition = getQueueBadgeDefinition(filterScenario, filter.badge_code || filter.value || filter.badge);
    const badgeCode = String(filterDefinition?.code || filter.badge_code || filter.value || '').toLowerCase();
    const badge = String(filterDefinition?.label || filter.badge || '').toLowerCase();
    const scenario = String(filter.scenario || '').toLowerCase();
    const zones = Array.isArray(filter.zones) ? filter.zones.map((zone) => String(zone).toLowerCase()) : [];
    return getQueueCardBadgeEntries(item).some((entry) => (
      (badgeCode ? entry.code === badgeCode : entry.badge === badge)
      && (!scenario || entry.scenario === scenario)
      && (!zones.length || zones.includes(entry.zone))
    ));
  };

  const applyDemoQueueState = (root, payload, response = {}) => {
    const list = root.querySelector('.conv-list');
    if (!list) {
      return;
    }

    if (typeof response.html === 'string') {
      list.innerHTML = response.html;
    } else if (Array.isArray(response.conversations)) {
      // DTO support is intentionally normalized here so API responses and demo cards share one markup path.
      list.innerHTML = renderDemoQueueCards('all', response.conversations);
    }

    root.classList.toggle('is-local-queue-filtering', payload.filter_mode === 'local');
    root.classList.toggle('is-ajax-queue-filtering', payload.filter_mode === 'ajax');

    const query = payload.query.toLowerCase();
    const quickPreset = payload.quick_preset || '';
    const filters = payload.active_filters || [];
    let visibleCount = 0;

    list.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
      const text = getQueueCardSearchText(item);
      const matchesQuery = !query || text.includes(query);
      const matchesUser = !payload.selected_user_id
        || item.dataset.senderUserId === payload.selected_user_id
        || item.dataset.recipientUserId === payload.selected_user_id;
      const matchesExpert = !payload.selected_expert_id
        || item.dataset.recipientUserId === payload.selected_expert_id;
      const leadType = item.dataset.leadType || 'chats';
      const matchesPreset = !quickPreset
        || quickPreset === leadType;
      const matchesFilters = filters.every((filter) => queueCardMatchesBadgeFilter(item, filter));
      const visible = matchesQuery && matchesUser && matchesExpert && matchesPreset && matchesFilters;

      item.hidden = !visible;
      item.classList.toggle('is-search-hidden', !visible);
      if (visible) visibleCount += 1;
    });

    list.classList.toggle('has-search-query', payload.active_filter_zone !== 'none' && Boolean(query || payload.selected_user_id || payload.selected_expert_id || filters.length || quickPreset));
    list.classList.toggle('has-no-search-results', visibleCount === 0);

    if ((typeof response.html === 'string' || Array.isArray(response.conversations)) && payload.active_filter_zone === 'quick_preset') {
      window.setTimeout(() => {
        const activeItem = list.querySelector('.conv-item.active:not([hidden]), .list-group-item.active:not([hidden])')
          || list.querySelector('.conv-item:not([hidden]), .list-group-item:not([hidden])');
        activeItem?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }, CHAT_UI_TIMING.immediateFocusMs);
    }
  };

  const runQueueStateUpdate = (root, changedBy = 'unknown', activeZone = null) => {
    if (activeZone) {
      root.dataset.queueActiveFilterZone = activeZone;
    }
    const payload = getQueueStatePayload(root, changedBy);
    root.classList.add('is-searching-conversations');
    root.classList.remove('has-queue-request-error');
    delete root.dataset.queueRequestError;
    return requestQueueStateUpdate(payload)
      .then((data) => {
        applyDemoQueueState(root, data?.payload || payload, data || {});
        return data;
      })
      .catch((error) => {
        root.classList.add('has-queue-request-error');
        root.dataset.queueRequestError = error?.message || 'queue_request_failed';
        return {
          ok: false,
          payload,
          error,
        };
      })
      .finally(() => {
        root.classList.remove('is-searching-conversations');
      });
  };

  function bindConversationSearch() {
    const root = document.querySelector('#admin-agent-chat');
    const input = root?.querySelector('#conversationsSearch');
    const list = root?.querySelector('.conv-list');
    const inputGroup = input?.closest('.queue-search-input-group');
    const clearButton = inputGroup?.querySelector('.queue-search-clear');
    if (!root || !input || !inputGroup || !clearButton || !list || input.dataset.queueSearchBound === '1') {
      return;
    }

    input.dataset.queueSearchBound = '1';
    let searchTimer = null;
    let searchRequestId = 0;

    const syncFilled = () => {
      input.classList.toggle('is-filled', input.value.trim().length > 0);
      input.closest('.queue-search-input-group')?.classList.toggle('is-filled', input.value.trim().length > 0);
    };

    const beginSearchPending = () => {
      searchRequestId += 1;
      inputGroup.classList.add('is-searching');
      inputGroup.setAttribute('aria-busy', 'true');
      return searchRequestId;
    };

    const runConversationQueueSearch = () => {
      const activeZone = input.value.trim() ? 'search' : 'none';
      if (activeZone === 'search') {
        resetQueueFilterZones(root, 'search');
      } else {
        resetQueueFilterZones(root, 'none');
      }
      const requestId = beginSearchPending();
      const startedAt = Date.now();
      return runQueueStateUpdate(root, activeZone === 'search' ? 'search' : 'search_clear', activeZone)
        .finally(() => {
          const elapsedMs = Date.now() - startedAt;
          const remainingMs = Math.max(0, CHAT_UI_TIMING.queueSearchSpinnerMinMs - elapsedMs);
          window.setTimeout(() => {
            if (requestId === searchRequestId) {
              inputGroup.classList.remove('is-searching');
              inputGroup.setAttribute('aria-busy', 'false');
            }
          }, remainingMs);
        });
    };

    const scheduleConversationQueueSearch = () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(runConversationQueueSearch, CHAT_UI_TIMING.queueSearchDebounceMs);
    };

    input.addEventListener('input', () => {
      syncFilled();
      beginSearchPending();
      scheduleConversationQueueSearch();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        window.clearTimeout(searchTimer);
        syncFilled();
        runConversationQueueSearch();
      }
    });

    clearButton.addEventListener('click', () => {
      if (!input.value) {
        input.focus();
        return;
      }
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      window.clearTimeout(searchTimer);
      syncFilled();
      runConversationQueueSearch();
      input.focus();
    });

    inputGroup.setAttribute('aria-busy', 'false');
    syncFilled();
    }

    function bindChatBoundaryJump() {
      const root = document.querySelector('#admin-agent-chat');
      const upButton = root?.querySelector('.js-chat-jump-up');
      const downButton = root?.querySelector('.js-chat-jump-down');
      const items = root?.querySelector('#conversationItems');
      const body = root?.querySelector('#conversationBody');
      if (!root || !items || !body || (!upButton && !downButton) || root.dataset.chatBoundaryJumpBound === '1') {
        return;
      }

      root.dataset.chatBoundaryJumpBound = '1';

      const getMessageAnchor = (messageId) => {
        if (!messageId) {
          return '';
        }

        return `message-${String(messageId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
      };

      const ensureAnchors = () => {
        items.querySelectorAll('.direct-chat-msg[data-message-id]').forEach((message) => {
          if (message.id) {
            return;
          }

          const anchor = getMessageAnchor(message.dataset.messageId);
          if (anchor) {
            message.id = anchor;
          }
        });
      };

      const highlightMessage = (message) => {
        if (!message) {
          return;
        }

        message.classList.remove('is-anchor-highlight');
        window.setTimeout(() => {
          message.classList.add('is-anchor-highlight');
          window.setTimeout(() => message.classList.remove('is-anchor-highlight'), CHAT_UI_TIMING.anchorHighlightMs);
        }, CHAT_UI_TIMING.quickUiSettleMs);
      };

      const scrollToMessage = (messageId, block = 'center') => {
        ensureAnchors();
        const anchor = getMessageAnchor(messageId);
        const target = anchor ? root.querySelector(`#${CSS.escape(anchor)}`) : null;
        if (!target) {
          return false;
        }

        target.scrollIntoView({ behavior: 'smooth', block });
        highlightMessage(target);
        if (window.history?.replaceState) {
          window.history.replaceState(null, '', `#${anchor}`);
        }
        return true;
      };

      const getLoadedMessages = () => Array.from(items.querySelectorAll('.direct-chat-msg[data-message-id]'));

      const syncBoundaryDataset = () => {
        const messages = getLoadedMessages();
        const first = messages[0];
        const last = messages[messages.length - 1];
        items.dataset.firstLoadedMessageId = first?.dataset.messageId || '';
        items.dataset.lastLoadedMessageId = last?.dataset.messageId || '';
        items.dataset.loadedMessageCount = String(messages.length);
      };

      const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char]);

      const createDemoBoundaryHtml = (direction) => {
        if (direction === 'first') {
          return `
            <div class="ng-scope js-boundary-window" data-boundary-window="first">
              <div class="date ng-scope">
                <span class="ng-binding">21.03.2026</span>
              </div>
              <div class="direct-chat-msg inbox-new" data-message-id="demo-first-boundary" data-message-author="client" data-message-has-text="true" data-message-kind="text" data-attachment-kind="none" data-attachment-count="0" data-message-lang="ru" data-send-state="delivered">
                <div class="direct-chat-info clearfix">
                  <span class="direct-chat-name pull-left">Алла</span>
                </div>
                <img class="direct-chat-img" src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_OraGJPMgdK6RaWdgh_BQNxnMTT18IiHa.webp" alt="Алла">
                <div class="direct-chat-text">
                  <span class="ng-binding">Это самое первое сообщение диалога, подгруженное сервером как boundary-window.</span>
                  <div class="message-meta-row">
                    <span class="message-time">7:42</span>
                  </div>
                </div>
              </div>
            </div>`;
        }

        return `
          <div class="ng-scope js-boundary-window" data-boundary-window="last">
            <div class="direct-chat-msg" data-message-id="demo-last-boundary" data-message-author="operator" data-message-viewed-by-client="false" data-message-has-text="true" data-message-kind="text" data-attachment-kind="none" data-attachment-count="0" data-message-lang="ru" data-send-state="delivered">
              <div class="direct-chat-info clearfix">
                <span class="direct-chat-name pull-left">admin</span>
              </div>
              <img class="direct-chat-img" src="https://hugs-project.s3.amazonaws.com/content/photos/1/thumb_jxSPNscGV5BEjL1BLbBQJNhj29uiYVMv.webp" alt="admin">
              <div class="direct-chat-text">
                <span class="ng-binding">Это самое последнее сообщение, полученное через серверный прыжок вниз.</span>
                <div class="message-meta-row">
                  <span class="message-time">now</span>
                  <span class="message-read-state">✓✓</span>
                </div>
              </div>
            </div>
          </div>`;
      };

      const requestConversationBoundary = (payload) => {
        /*
        // Real API integration point.
        // Server should return a boundary window, not only one message,
        // so the operator lands with enough context around the first/last message.
        return fetch(CHAT_API_ENDPOINTS.conversationBoundary(payload.conversation_id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Conversation boundary request failed');
          }
          return response.json();
        });
        */

        const direction = payload.direction;
        const alreadyInserted = direction === 'first'
          ? !!items.querySelector('[data-message-id="demo-first-boundary"]')
          : !!items.querySelector('[data-message-id="demo-last-boundary"]');

        return window.Promise.resolve({
          ok: true,
          direction,
          target_message_id: direction === 'first' ? 'demo-first-boundary' : 'demo-last-boundary',
          messages_html: alreadyInserted ? '' : createDemoBoundaryHtml(direction),
          has_before: direction === 'first' ? false : items.dataset.hasBefore === 'true',
          has_after: direction === 'last' ? false : items.dataset.hasAfter === 'true',
        });
      };

      const setButtonLoading = (button, loading) => {
        if (!button) {
          return;
        }

        button.disabled = loading;
        button.classList.toggle('is-loading', loading);
        button.setAttribute('aria-busy', loading ? 'true' : 'false');
      };

      const runWithButtonLock = (button, task) => {
        if (!button || button.disabled) {
          return;
        }

        setButtonLoading(button, true);
        const startedAt = Date.now();
        const minLockMs = CHAT_UI_TIMING.boundaryButtonMinLockMs;
        window.Promise.resolve()
          .then(task)
          .finally(() => {
            const rest = Math.max(0, minLockMs - (Date.now() - startedAt));
            window.setTimeout(() => setButtonLoading(button, false), rest);
          });
      };

      const applyBoundaryResponse = (response) => {
        if (!response?.ok) {
          return;
        }

        if (response.messages_html) {
          if (response.direction === 'first') {
            items.insertAdjacentHTML('afterbegin', response.messages_html);
          } else {
            items.insertAdjacentHTML('beforeend', response.messages_html);
          }
        }

        items.dataset.hasBefore = response.has_before ? 'true' : 'false';
        items.dataset.hasAfter = response.has_after ? 'true' : 'false';
        syncBoundaryDataset();
        scrollToMessage(response.target_message_id, response.direction === 'first' ? 'start' : 'end');
      };

      const jumpToBoundary = (direction, button) => {
        const messages = getLoadedMessages();
        const targetMessage = direction === 'first' ? messages[0] : messages[messages.length - 1];
        const hasHiddenBoundary = direction === 'first'
          ? items.dataset.hasBefore === 'true'
          : items.dataset.hasAfter === 'true';

        if (!hasHiddenBoundary && targetMessage?.dataset.messageId) {
          runWithButtonLock(button, () => {
            scrollToMessage(targetMessage.dataset.messageId, direction === 'first' ? 'start' : 'end');
          });
          return;
        }

        const payload = {
          conversation_id: root.dataset.conversationId || 'c2',
          direction,
          first_loaded_message_id: items.dataset.firstLoadedMessageId || messages[0]?.dataset.messageId || '',
          last_loaded_message_id: items.dataset.lastLoadedMessageId || messages[messages.length - 1]?.dataset.messageId || '',
          loaded_message_ids: messages.map((message) => message.dataset.messageId).filter(Boolean),
          has_before: items.dataset.hasBefore === 'true',
          has_after: items.dataset.hasAfter === 'true',
          anchor_strategy: 'conversation_boundary',
          requested_from: 'chat_more_menu',
        };

        runWithButtonLock(button, () => requestConversationBoundary(payload).then(applyBoundaryResponse));
      };

      syncBoundaryDataset();

      upButton?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        jumpToBoundary('first', upButton);
      });

      downButton?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        jumpToBoundary('last', downButton);
      });
    }

    function bindChatReadableFontControls() {
      const root = document.querySelector('#admin-agent-chat');
      const body = root?.querySelector('#conversationBody');
      const composer = root?.querySelector('#conversationInputArea');
      const minusButton = root?.querySelector('.js-chat-font-minus');
      const plusButton = root?.querySelector('.js-chat-font-plus');
      const valueLabel = root?.querySelector('.js-chat-font-size-value');
      if (!root || !body || !minusButton || !plusButton || root.dataset.chatReadableFontBound === '1') {
        return;
      }

      root.dataset.chatReadableFontBound = '1';
      const storageKey = 'adminAgentChat.readableFontSize';
      const minSize = 11;
      const maxSize = 17;
      const defaultSize = 13;

      const clampSize = (value) => Math.min(maxSize, Math.max(minSize, Number(value) || defaultSize));

      let currentSize = defaultSize;
      try {
        currentSize = clampSize(window.localStorage?.getItem(storageKey));
      } catch (error) {
        currentSize = defaultSize;
      }

      const render = () => {
        body.style.setProperty('--chat-readable-font-size', `${currentSize}px`);
        composer?.style.setProperty('--chat-readable-font-size', `${currentSize}px`);
        composer?.querySelector('#messageInput')?.dispatchEvent(new Event('input', { bubbles: true }));
        if (valueLabel) {
          valueLabel.textContent = String(currentSize);
        }
        minusButton.classList.toggle('is-disabled-soft', currentSize <= minSize);
        plusButton.classList.toggle('is-disabled-soft', currentSize >= maxSize);
        minusButton.setAttribute('aria-disabled', currentSize <= minSize ? 'true' : 'false');
        plusButton.setAttribute('aria-disabled', currentSize >= maxSize ? 'true' : 'false');
      };

      const persist = () => {
        try {
          window.localStorage?.setItem(storageKey, String(currentSize));
        } catch (error) {
          // Local preference only; ignore storage failures.
        }
      };

      const setSize = (nextSize) => {
        const previousSize = currentSize;
        currentSize = clampSize(nextSize);
        render();
        if (currentSize !== previousSize) {
          persist();
        }
      };

      minusButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSize(currentSize - 1);
      });

      plusButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSize(currentSize + 1);
      });

      render();
    }

    function bindDeleteChatModal() {
      const root = document.querySelector('#admin-agent-chat');
      const modal = document.querySelector('#modalDeleteChat');
      const confirmButton = modal?.querySelector('.js-confirm-delete-chat');
      if (!root || !modal || !confirmButton || modal.dataset.deleteChatBound === '1') {
        return;
      }

      modal.dataset.deleteChatBound = '1';

      const closeModal = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
      };

      const getActiveConversationPayload = () => {
        const activeItem = root.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active');
        return {
          conversation_id: root.dataset.conversationId || activeItem?.dataset.conversationId || '',
          sender_user_id: activeItem?.dataset.senderUserId || '',
          recipient_user_id: activeItem?.dataset.recipientUserId || '',
          display_contact_name: activeItem?.dataset.displayContactName || '',
          requested_by: root.dataset.agentId || root.dataset.userId || '',
          requested_from: 'chat_more_menu',
          delete_allowed: modal.dataset.deleteAllowed === 'true',
          requested_at: new Date().toISOString(),
        };
      };

      const requestDeleteConversation = (payload) => {
        /*
        // Real API integration point.
        // Backend must verify permissions and return the final deletion result.
        return fetch(CHAT_API_ENDPOINTS.conversation(payload.conversation_id), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Conversation delete request failed');
          }
          return response.json();
        });
        */

        return window.Promise.resolve({
          ok: false,
          forbidden: true,
          message: 'Вам запрещено удалять данный чат',
          payload,
        });
      };

      const setDeleting = (isDeleting) => {
        confirmButton.disabled = modal.dataset.deleteAllowed !== 'true' || isDeleting;
        confirmButton.classList.toggle('is-loading', isDeleting);
        confirmButton.textContent = isDeleting ? 'Удаление...' : 'Да, удалить';
      };

      confirmButton.addEventListener('click', (event) => {
        event.preventDefault();
        const payload = getActiveConversationPayload();
        if (!payload.delete_allowed) {
          setDeleting(false);
          return;
        }

        setDeleting(true);
        requestDeleteConversation(payload)
          .then((response) => {
            if (!response?.ok) {
              throw new Error(response?.message || 'Conversation was not deleted');
            }

            const activeItem = root.querySelector(`.conv-list [data-conversation-id="${CSS.escape(payload.conversation_id)}"]`);
            activeItem?.remove();
            closeModal();
          })
          .catch(() => {
            setDeleting(false);
          });
      });

      document.addEventListener('click', (event) => {
        const opener = event.target.closest('.js-delete-chat-open');
        if (!opener) {
          return;
        }

        const allowed = modal.dataset.deleteAllowed === 'true';
        confirmButton.disabled = !allowed;
        confirmButton.textContent = 'Да, удалить';
      });
    }

    function bindConversationReportModal() {
      const root = document.querySelector('#admin-agent-chat');
      const modal = document.querySelector('#conversation-report');
      const submitButton = modal?.querySelector('.js-submit-conversation-report');
      if (!root || !modal || !submitButton || modal.dataset.conversationReportBound === '1') {
        return;
      }

      modal.dataset.conversationReportBound = '1';

      const closeModal = () => {
        modal.hidden = true;
        modal.classList.remove('is-submitting');
        document.body.classList.remove('modal-open');
      };

      const getActiveConversationPayload = () => {
        const activeItem = getActiveConversationItem(root);
        return {
          conversation_id: root.dataset.conversationId || activeItem?.dataset.conversationId || '',
          reported_user_id: activeItem?.dataset.senderUserId || '',
          reported_user_name: activeItem?.dataset.displayContactName || activeItem?.dataset.senderName || '',
          reported_user_avatar: activeItem?.dataset.senderAvatar || '',
          paired_user_id: activeItem?.dataset.recipientUserId || '',
          paired_user_name: activeItem?.dataset.recipientName || '',
          reporter_agent_id: root.dataset.agentId || root.dataset.userId || '',
          reporter_agent_name: root.dataset.agentFullname || root.dataset.userFullname || '',
          source: 'chat_more_menu',
          page_url: window.location.href,
        };
      };

      const fillContext = () => {
        const payload = getActiveConversationPayload();
        const userName = modal.querySelector('.js-report-user-name');
        const meta = modal.querySelector('.js-report-conversation-meta');
        if (userName) {
          userName.textContent = payload.reported_user_name || 'Unknown user';
        }
        if (meta) {
          const userId = payload.reported_user_id ? `ID ${payload.reported_user_id}` : 'ID unknown';
          const conversationId = payload.conversation_id ? `Conversation ${payload.conversation_id}` : 'Conversation unknown';
          meta.textContent = `${userId} · ${conversationId}`;
        }
        return payload;
      };

      const resetForm = () => {
        const reasonSelect = modal.querySelector('#conversationReportReason');
        if (reasonSelect) {
          reasonSelect.value = '';
        }
        const description = modal.querySelector('#conversationReportDescription');
        if (description) {
          description.value = '';
        }
        const error = modal.querySelector('.js-report-error');
        if (error) {
          error.hidden = true;
        }
        submitButton.disabled = false;
        submitButton.textContent = 'Отправить';
      };

      const openModal = () => {
        resetForm();
        fillContext();
        modal.hidden = false;
        document.body.classList.add('modal-open');
        window.setTimeout(() => {
          modal.querySelector('#conversationReportReason, textarea, button')?.focus();
        }, CHAT_UI_TIMING.immediateFocusMs);
      };

      const buildReportPayload = () => {
        const context = getActiveConversationPayload();
        const reasonSelect = modal.querySelector('#conversationReportReason');
        const description = modal.querySelector('#conversationReportDescription')?.value.trim() || '';
        return {
          ...context,
          reason: reasonSelect?.value || '',
          reason_label: reasonSelect?.selectedOptions?.[0]?.textContent.trim() || '',
          description,
          reported_at: new Date().toISOString(),
        };
      };

      const requestConversationReport = (payload) => {
        /*
        // Real API integration point.
        // Backend should validate permissions, current conversation membership,
        // rate limits, and create a moderation/report ticket.
        return fetch(CHAT_API_ENDPOINTS.reportConversation(payload.conversation_id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Conversation report request failed');
          }
          return response.json();
        });
        */

        return window.Promise.resolve({
          ok: true,
          report_id: `demo-report-${Date.now()}`,
          payload,
        });
      };

      document.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-target="#conversation-report"], .js-conversation-report-open');
        if (!opener) {
          return;
        }

        event.preventDefault();
        openModal();
      });

      modal.querySelector('#conversationReportReason')?.addEventListener('change', () => {
        const error = modal.querySelector('.js-report-error');
        if (error) {
          error.hidden = true;
        }
      });

      submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        const payload = buildReportPayload();
        const error = modal.querySelector('.js-report-error');
        if (!payload.reason) {
          if (error) {
            error.hidden = false;
          }
          return;
        }

        modal.classList.add('is-submitting');
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        requestConversationReport(payload)
          .then((response) => {
            if (!response?.ok) {
              throw new Error('Report was not created');
            }
            closeModal();
          })
          .catch(() => {
            modal.classList.remove('is-submitting');
            submitButton.disabled = false;
            submitButton.textContent = 'Отправить';
            if (error) {
              error.textContent = 'Не удалось отправить жалобу. Попробуйте еще раз.';
              error.hidden = false;
            }
          });
      });
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
      const clearButton = header.querySelector('.chat-search-clear');
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

      const syncSearchQueryState = () => {
        header.querySelector('.chat-search-inline')?.classList.toggle('has-query', input.value.trim().length > 0);
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
        window.setTimeout(() => target.classList.remove('is-search-current'), CHAT_UI_TIMING.chatSearchHighlightMs);
      };

      const fetchSearchResults = (query) => new Promise((resolve) => {
        const conversationId = root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '';
        /*
        // Real AJAX integration point:
        fetch(`${CHAT_API_ENDPOINTS.searchMessages}?conversation_id=${encodeURIComponent(conversationId)}&q=${encodeURIComponent(query)}`, {
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
        }, CHAT_UI_TIMING.demoSearchLatencyMs);
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
        syncSearchQueryState();
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
        searchTimer = window.setTimeout(runSearch, CHAT_UI_TIMING.chatSearchDebounceMs);
      };

      const closeSearch = (focusToggle = true) => {
        input.value = '';
        syncSearchQueryState();
        header.classList.remove('search-open');
        window.clearTimeout(searchTimer);
        searchRequestId += 1;
        setSearchLoading(false);
        clearHighlights();
        if (resultsBox) {
          resultsBox.hidden = true;
          resultsBox.innerHTML = '<div class="chat-search-empty">No matches</div>';
        }
        updateCount(0);
        if (focusToggle) {
          button.focus();
        }
      };

      button.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = header.classList.contains('search-open');
        if (isOpen && input.value.trim() === '') {
          closeSearch(false);
          return;
        }

        header.classList.add('search-open');
        input.focus();
      });

      input.addEventListener('input', scheduleSearch);

      clearButton?.addEventListener('click', (event) => {
        event.preventDefault();
        closeSearch();
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeSearch();
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
      syncSearchQueryState();
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
      const send = root.querySelector('#btnSendMessage') || document.querySelector('#btnSendMessage');
      const composer = root.querySelector('#conversationInputArea') || document.querySelector('#conversationInputArea');

      const setComposerMode = (mode) => {
        if (!composer) {
          return;
        }
        composer.dataset.composerMode = ['reply', 'edit'].includes(mode) ? mode : 'direct';
      };

      setComposerMode('direct');

      const stopMessageToggle = (event) => {
        if (event.target.closest('button, a, .message-actions-row')) {
          return;
        }
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
          replyPreviewText.removeAttribute('title');
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
        const fullPreviewText = String(message || 'Selected message').replace(/\s+/g, ' ').trim();
        const previewLimit = CHAT_MESSAGE_ACTION_CONFIG.replyPreviewMaxChars;
        const previewText = fullPreviewText.length > previewLimit
          ? `${fullPreviewText.slice(0, Math.max(0, previewLimit - 1)).trimEnd()}…`
          : fullPreviewText;
        replyPreviewText.textContent = previewText;
        replyPreviewText.title = fullPreviewText;
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
        window.setTimeout(() => message.classList.remove('is-anchor-highlight'), CHAT_UI_TIMING.anchorHighlightMs);
      }, CHAT_UI_TIMING.quickUiSettleMs);
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

      const getAudioDurationNode = (player) => (
        player?.querySelector('.audio-duration, .voice-note-duration') || null
      );

      const formatAudioTime = (seconds) => {
        const safeSeconds = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0));
        const minutes = Math.floor(safeSeconds / 60);
        const rest = String(safeSeconds % 60).padStart(2, '0');
        return `${minutes}:${rest}`;
      };

      const getAudioOriginalDuration = (player) => {
        const node = getAudioDurationNode(player);
        if (!node) {
          return '0:00';
        }

        if (!node.dataset.originalDuration) {
          node.dataset.originalDuration = node.textContent.trim() || '0:00';
        }

        return node.dataset.originalDuration;
      };

      const resetAudioTimer = (player) => {
        const node = getAudioDurationNode(player);
        if (node) {
          node.textContent = getAudioOriginalDuration(player);
        }
      };

      const updateAudioTimer = (player, audio) => {
        const node = getAudioDurationNode(player);
        if (!node || !audio || !Number.isFinite(audio.duration)) {
          return;
        }

        const remaining = Math.max(0, audio.duration - audio.currentTime);
        node.textContent = formatAudioTime(remaining);
      };

      const stopAllAudio = (exceptAudio) => {
        root.querySelectorAll('.is-audio-playing').forEach((player) => {
          const audio = player._chatAudio;
          if (audio && audio !== exceptAudio) {
            audio.pause();
            audio.currentTime = 0;
          }
          player.classList.remove('is-audio-playing');
          resetAudioTimer(player);
          const icon = player.querySelector('.js-audio-toggle .fa');
          if (icon) {
            icon.className = 'fa fa-play';
          }
        });
      };

      const getAudioForPlayer = (player) => {
        if (!player) {
          return null;
        }

        if (player._chatAudio) {
          return player._chatAudio;
        }

        const src = player.dataset.audioSrc;
        if (!src) {
          return null;
        }

        const audio = new Audio(new URL(src, document.baseURI).href);
        audio.preload = 'auto';
        player._chatAudio = audio;
        return audio;
      };

      const setAudioPlaying = (player, playing) => {
        if (!player) {
          return;
        }

        player.classList.toggle('is-audio-playing', playing);
        player.classList.remove('is-audio-error');
        if (!playing) {
          resetAudioTimer(player);
        }
        const icon = player.querySelector('.js-audio-toggle .fa');
        if (icon) {
          icon.className = playing ? 'fa fa-pause' : 'fa fa-play';
        }
      };

      const setAudioError = (player) => {
        if (!player) {
          return;
        }

        player.classList.remove('is-audio-playing');
        player.classList.add('is-audio-error');
        resetAudioTimer(player);
        player.title = 'Audio could not be played. Check the source file path.';
        const icon = player.querySelector('.js-audio-toggle .fa');
        if (icon) {
          icon.className = 'fa fa-play';
        }
      };

      const toggleAudioPlayer = (player) => {
        const audio = getAudioForPlayer(player);
        if (!audio) {
          setAudioError(player);
          return;
        }

        if (audio.paused) {
          stopAllAudio(audio);
          audio.load();
          audio.play()
            .then(() => {
              setAudioPlaying(player, true);
              updateAudioTimer(player, audio);
            })
            .catch(() => setAudioError(player));
          return;
        }

        audio.pause();
        setAudioPlaying(player, false);
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

          const audio = getAudioForPlayer(player);
          player.dataset.audioBound = '1';

          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleAudioPlayer(player);
          });
          player.addEventListener('click', (event) => {
            if (event.target.closest('a, button:not(.js-audio-toggle), .message-actions-row')) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            toggleAudioPlayer(player);
          });

          audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            setAudioPlaying(player, false);
          });
          audio.addEventListener('pause', () => {
            if (audio.currentTime < audio.duration) {
              player.classList.remove('is-audio-playing');
              const icon = player.querySelector('.js-audio-toggle .fa');
              if (icon) {
                icon.className = 'fa fa-play';
              }
            }
          });
          audio.addEventListener('timeupdate', () => updateAudioTimer(player, audio));
          audio.addEventListener('loadedmetadata', () => updateAudioTimer(player, audio));
          audio.addEventListener('error', () => setAudioError(player));
        });

        if (root.dataset.audioDelegatedBound !== '1') {
          root.dataset.audioDelegatedBound = '1';
          root.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
              return;
            }

            const player = event.target.closest('.voice-note[data-audio-src], .audio-attachment[data-audio-src]');
            if (!player || !root.contains(player)) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            toggleAudioPlayer(player);
          });
        }
      };

      const addReplyAction = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        if (!canReplyToMessage(message)) {
          bubble.querySelector('.js-message-reply')?.remove();
          return;
        }

        const actions = bubble.querySelector('.message-actions-row');
        if (!actions) {
          return;
        }

        const bindReplyButton = (button) => {
          if (button.dataset.replyActionBound === '1') {
            return;
          }

          button.dataset.replyActionBound = '1';
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const text = bubble.querySelector('.ng-binding')?.textContent.trim();
            setReplyPreview(text, message?.dataset.messageId);
          });
        };

        const existingButton = actions.querySelector('.js-message-reply');
        if (existingButton) {
          bindReplyButton(existingButton);
          return;
        }

        const button = document.createElement('button');
        button.className = 'btn btn-xs btn-default js-message-reply';
        button.type = 'button';
        button.innerHTML = '<i class="fa fa-reply"></i> Reply';
        bindReplyButton(button);
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
        fetch(CHAT_API_ENDPOINTS.translateMessage, {
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
        }, CHAT_UI_TIMING.demoMessageTranslationLatencyMs);
      });

      const ensureTranslationBlock = (bubble, text, visible = true, options = {}) => {
        const message = bubble.closest('.direct-chat-msg');
        const sourceLang = getMessageLang(message);
        const targetLang = getTranslationTargetLang();
        const label = options.label || 'Translated';
        const langText = options.langText || `${sourceLang} → ${targetLang}`;
        let block = bubble.querySelector('.message-translation');
        if (!block) {
          block = document.createElement('div');
          block.className = 'message-translation';
          block.innerHTML = `
            <div class="message-translation-divider"><div class="message-translation-head"><span class="message-translation-label"></span> <span class="message-translation-lang"></span></div></div>
            <div class="message-translation-text"></div>
          `;
          const meta = bubble.querySelector('.message-meta-row');
          bubble.insertBefore(block, meta || null);
        }

        const divider = block.querySelector('.message-translation-divider');
        let head = block.querySelector('.message-translation-head');
        if (divider && head && head.parentElement !== divider) {
          divider.appendChild(head);
        }
        if (divider && !head) {
          head = document.createElement('div');
          head.className = 'message-translation-head';
          divider.appendChild(head);
        }
        let labelNode = block.querySelector('.message-translation-label');
        if (!labelNode && head) {
          labelNode = document.createElement('span');
          labelNode.className = 'message-translation-label';
          head.insertBefore(labelNode, head.firstChild);
        }
        if (labelNode) {
          labelNode.textContent = label;
        }
        block.querySelector('.message-translation-lang').textContent = langText;
        block.querySelector('.message-translation-text').textContent = text;
        block.hidden = !visible;
        bubble.classList.toggle('has-translation', visible);
        return block;
      };

      const addTranslateAction = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const author = getMessageAuthor(message);
        const isClientMessage = author === 'client';
        const operatorTranslation = getOperatorTranslationPayload(message);
        const attachmentKind = getAttachmentKind(message);
        const systemKind = getSystemKind(message);
        const sendState = getMessageSendState(message);
        const hasTextPart = messageHasTextPart(message, bubble);
        const sourceText = bubble.querySelector('.ng-binding')?.textContent.trim();
        const actions = bubble.querySelector('.message-actions-row');
        if ((!isClientMessage && !operatorTranslation) || systemKind || sendState || !hasTextPart || !sourceText || ['audio', 'voice'].includes(attachmentKind) || !actions || actions.querySelector('.js-message-translate')) {
          return;
        }

        const button = document.createElement('button');
        button.className = 'btn btn-xs btn-default js-message-translate message-icon-action message-translate-action';
        button.type = 'button';
        button.textContent = '';
        const defaultTitle = operatorTranslation ? 'Show original' : 'Translate message';
        const activeTitle = operatorTranslation ? 'Hide original' : 'Hide translation';
        button.title = defaultTitle;
        button.setAttribute('aria-label', defaultTitle);
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
            button.title = defaultTitle;
            button.setAttribute('aria-label', defaultTitle);
            return;
          }

          if (operatorTranslation) {
            ensureTranslationBlock(bubble, operatorTranslation.originalText, true, {
              label: 'Original',
              langText: operatorTranslation.sourceLang,
            });
            button.classList.add('is-active');
            button.title = activeTitle;
            button.setAttribute('aria-label', activeTitle);
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
          button.title = activeTitle;
          button.setAttribute('aria-label', activeTitle);
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
          return fetch(CHAT_API_ENDPOINTS.message(messageId), {
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
        delete(messageId, deletionMode = 'soft') {
          /*
          // Real API integration point. `deletion_mode` is enforced by the server:
          // - soft keeps a moderated "Message deleted" placeholder in history;
          // - hard retracts an eligible billing-offer card without a placeholder.
          return fetch(CHAT_API_ENDPOINTS.message(messageId), {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
              message_id: messageId,
              deletion_mode: deletionMode,
            }),
          }).then((response) => response.json());
          */
          return window.Promise.resolve({ ok: true, messageId, deletion_mode: deletionMode });
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

      const getMessageDeletionMode = (message) => {
        if (!message || getMessageAuthor(message) !== 'operator' || getSystemKind(message)
          || isMessageViewedByClient(message) || message.classList.contains('is-message-deleted')) {
          return '';
        }

        if (message.dataset.messageCardType === 'billing_offer') {
          return 'hard';
        }

        return canMutateOwnMessage(message) ? 'soft' : '';
      };

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
          }, CHAT_UI_TIMING.copyActionFeedbackMs);
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
        }, CHAT_UI_TIMING.immediateFocusMs);
        return input;
      };

      const composerSafety = {
        unlockSeconds: CHAT_COMPOSER_CONFIG.unlockDelaySeconds,
        autosaveMs: CHAT_COMPOSER_CONFIG.serverAutosaveMs,
        localAutosaveMs: CHAT_COMPOSER_CONFIG.localAutosaveMs,
        state: CHAT_COMPOSER_CONFIG.sendUnlockEnabled ? 'locked' : 'ready',
        remaining: 0,
        unlockTimer: null,
        autosaveTimer: null,
        localAutosaveTimer: null,
        lastDraftFingerprint: '',
        lastLocalDraftFingerprint: '',
        isSending: false,
        draftNonce: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        draftRevision: 0,
        clearedDraftConversationIds: new Set(),
      };

      const getComposerSafetyState = () => {
        if (!CHAT_COMPOSER_CONFIG.sendUnlockEnabled) {
          return 'ready';
        }
        return composer?.dataset.composerSendState || composerSafety.state || 'locked';
      };

      const hasComposerPayloadContent = (request = getComposerServerPayload()) => Boolean(
        request?.payload?.text || request?.payload?.attachment_source
      );

      const requestComposerDraftSave = (payload) => {
        /*
        // Real draft autosave integration point.
        // Drafts are saved independently from final message send.
        // This request is intentionally throttled; browser localStorage keeps
        // the fast typing buffer so the backend is not hit on every keystroke.
        return fetch(CHAT_API_ENDPOINTS.saveDraft, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(payload),
        }).then((response) => {
          if (!response.ok) {
            throw new Error('Composer draft autosave failed');
          }
          return response.json();
        });
        */
        return window.Promise.resolve({ ok: true, payload });
      };

      const setComposerStatusIndicator = (status, label) => {
        const nextStatus = status || 'idle';
        const nextLabel = label || 'Статус композера';
        composer?.setAttribute('data-composer-status', nextStatus);

        if (send) {
          send.setAttribute('data-composer-status-label', nextLabel);
          send.setAttribute('aria-description', nextLabel);
        }
      };

      const syncComposerSafetyUi = () => {
        const request = getComposerServerPayload();
        const hasContent = hasComposerPayloadContent(request);
        const state = getComposerSafetyState();
        const actionLabel = request.mode === 'edit' ? 'save edit' : 'send';
        const showDisabledEmptySend = !CHAT_COMPOSER_CONFIG.voiceMessagesEnabled && !hasContent;

        composer?.classList.toggle('is-send-locked', state === 'locked');
        composer?.classList.toggle('is-send-unlocking', state === 'unlocking');
        composer?.classList.toggle('is-send-ready', state === 'ready');
        composer?.setAttribute('data-composer-send-state', state);

        if (send) {
          const ensureLockIcon = () => {
            let icon = send.querySelector('.safe-lock-icon');
            if (!icon) {
              send.innerHTML = '<span class="safe-lock-icon" aria-hidden="true"></span>';
              icon = send.querySelector('.safe-lock-icon');
            }
            return icon;
          };

          send.dataset.sendSafetyState = state;
          send.setAttribute(
            'aria-label',
            showDisabledEmptySend
              ? 'Send message unavailable'
              : state === 'ready'
                ? (request.mode === 'edit' ? 'Save edit' : 'Send message')
                : 'Unlock message sending'
          );
          send.title = showDisabledEmptySend
            ? 'Enter a message'
            : state === 'ready'
              ? (request.mode === 'edit' ? 'Save edit' : 'Send message')
              : state === 'unlocking'
                ? `Unlocking ${actionLabel}`
                : `Unlock ${actionLabel}`;
          if (showDisabledEmptySend) {
            send.disabled = true;
            send.setAttribute('aria-disabled', 'true');
            send.innerHTML = '<i class="fa fa-paper-plane"></i>';
          } else if (state === 'unlocking') {
            send.innerHTML = `<span class="composer-send-countdown">${composerSafety.remaining}</span>`;
          } else if (state === 'ready') {
            send.innerHTML = '<i class="fa fa-paper-plane"></i>';
          } else {
            ensureLockIcon();
          }
        }

        const statusLabels = {
          locked: hasContent ? 'Черновик защищен' : 'Можно записать голосовое',
          unlocking: `Разблокировка ${composerSafety.remaining || ''}`.trim(),
          ready: request.mode === 'edit' ? 'Правка готова к сохранению' : 'Готово к отправке',
        };
        setComposerStatusIndicator(hasContent || state !== 'locked' ? state : 'idle', statusLabels[state] || 'Черновик защищен');
      };

      const setComposerSendState = (state, remaining = 0) => {
        const nextState = CHAT_COMPOSER_CONFIG.sendUnlockEnabled
          ? (['unlocking', 'ready'].includes(state) ? state : 'locked')
          : 'ready';
        composerSafety.state = nextState;
        composerSafety.remaining = remaining;
        if (composer) {
          composer.dataset.composerSendState = nextState;
        }
        syncComposerSafetyUi();
      };

      const resetComposerUnlock = () => {
        window.clearInterval(composerSafety.unlockTimer);
        composerSafety.unlockTimer = null;
        setComposerSendState('locked');
      };

      const startComposerUnlock = () => {
        window.clearInterval(composerSafety.unlockTimer);
        if (!CHAT_COMPOSER_CONFIG.sendUnlockEnabled) {
          composerSafety.unlockTimer = null;
          setComposerSendState('ready');
          return;
        }
        setComposerSendState('unlocking', composerSafety.unlockSeconds);
        composerSafety.unlockTimer = window.setInterval(() => {
          composerSafety.remaining -= 1;
          if (composerSafety.remaining <= 0) {
            window.clearInterval(composerSafety.unlockTimer);
            composerSafety.unlockTimer = null;
            setComposerSendState('ready');
            return;
          }
          syncComposerSafetyUi();
        }, CHAT_COMPOSER_CONFIG.unlockTickMs);
      };

      const getComposerDraftPayload = () => {
        const request = getComposerServerPayload();
        const targetMessageId = request.payload.reply_to_message_id || request.payload.message_id || '';
        const attachmentPhotos = Array.isArray(request.payload.attachment_photos)
          ? request.payload.attachment_photos
          : [];
        return {
          conversation_id: request.payload.conversation_id || root.dataset.conversationId || 'c2',
          composer_mode: request.mode,
          send_unlock_enabled: CHAT_COMPOSER_CONFIG.sendUnlockEnabled,
          composer_send_state: getComposerSafetyState(),
          target_message_id: targetMessageId,
          reply_preview_text: request.mode === 'reply'
            ? (replyPreviewText?.textContent.trim() || (targetMessageId ? getReplyPreviewText(targetMessageId) : ''))
            : '',
          text: request.payload.original_text || request.payload.text || '',
          original_text: request.payload.original_text || '',
          send_text_source: request.payload.send_text_source || 'operator',
          translation: request.payload.translation || null,
          attachment_source: request.payload.attachment_source || '',
          attachment_label: request.payload.attachment_label || '',
          attachment_photos: attachmentPhotos,
          draft_client_nonce: composerSafety.draftNonce,
          draft_revision: composerSafety.draftRevision + 1,
          draft_updated_at: new Date().toISOString(),
        };
      };

      const getComposerDraftFingerprint = (payload) => JSON.stringify({
        conversation_id: payload.conversation_id,
        composer_mode: payload.composer_mode,
        target_message_id: payload.target_message_id,
        text: payload.text,
        original_text: payload.original_text || '',
        send_text_source: payload.send_text_source || 'operator',
        translation: payload.translation || null,
        attachment_source: payload.attachment_source,
        attachment_label: payload.attachment_label,
        attachment_photos: payload.attachment_photos || [],
        reply_preview_text: payload.reply_preview_text || '',
      });

      const saveComposerDraft = (options = {}) => {
        if (composerSafety.isSending) {
          return window.Promise.resolve({ skipped: true, reason: 'sending' });
        }

        const payload = getComposerDraftPayload();
        if (!payload.text && !payload.attachment_source) {
          if (!options.force) {
            return window.Promise.resolve({ skipped: true, reason: 'empty' });
          }
          payload.draft_deleted = true;
          composerSafety.lastDraftFingerprint = '';
          return requestComposerDraftSave(payload);
        }

        const fingerprint = getComposerDraftFingerprint(payload);
        if (!options.force && fingerprint === composerSafety.lastDraftFingerprint) {
          return window.Promise.resolve({ skipped: true, reason: 'unchanged' });
        }

        composerSafety.lastDraftFingerprint = fingerprint;
        composerSafety.draftRevision += 1;
        payload.draft_revision = composerSafety.draftRevision;
        composer?.classList.add('is-draft-saving');
        setComposerStatusIndicator('saving', 'Черновик сохраняется');
        return requestComposerDraftSave(payload)
          .then((result) => {
            const serverRevision = Number(result?.draft_revision);
            if (
              result?.draft_client_nonce === composerSafety.draftNonce
              && Number.isFinite(serverRevision)
              && serverRevision > composerSafety.draftRevision
            ) {
              composerSafety.draftRevision = serverRevision;
            }
            if (getComposerSafetyState() === 'locked') {
              setComposerStatusIndicator('saved', 'Черновик сохранен');
            }
            return result;
          })
          .finally(() => {
            composer?.classList.remove('is-draft-saving');
            composer?.classList.add('is-draft-saved');
            window.setTimeout(() => composer?.classList.remove('is-draft-saved'), CHAT_UI_TIMING.draftSavedFlashMs);
          });
      };

      const getComposerGalleryPanel = () => document.querySelector('#composerGalleryPanel');

      const getSelectedGalleryPhotos = () => Array.from(getComposerGalleryPanel()?.querySelectorAll('.composer-gallery-item.is-selected') || [])
        .map((item, index) => {
          const image = item.querySelector('img');
          const src = item.dataset.src || item.dataset.fullSrc || image?.src || '';
          const fileName = item.dataset.fileName || image?.alt || `gallery-photo-${index + 1}.webp`;
          return {
            src,
            alt: image?.alt || fileName,
            file_name: fileName,
          };
        })
        .filter((photo) => photo.src);

      const isImageLikeFile = (file) => {
        if (!file) {
          return false;
        }
        if (file.type?.startsWith('image/')) {
          return true;
        }
        return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(file.name || '');
      };

      const getDevicePhotoAttachment = () => {
        const input = root.querySelector('#composerPhotoDeviceInput');
        const file = input?.files?.[0];
        if (!input) {
          return [];
        }

        if (file && isImageLikeFile(file)) {
          if (!input.dataset.previewUrl && window.URL?.createObjectURL) {
            input.dataset.previewUrl = window.URL.createObjectURL(file);
          }

          const fileSignature = `${file.name || 'photo'}:${file.size || 0}:${file.lastModified || 0}`;
          if (input.dataset.messagePreviewSignature !== fileSignature) {
            delete input.dataset.messagePreviewUrl;
            input.dataset.messagePreviewSignature = fileSignature;
          }
          if (!input.dataset.messagePreviewUrl && window.URL?.createObjectURL) {
            input.dataset.messagePreviewUrl = window.URL.createObjectURL(file);
          }

          const messageUrl = input.dataset.messagePreviewUrl || input.dataset.previewUrl || '';
          if (messageUrl) {
            input.dataset.selectedPhotoSrc = messageUrl;
            input.dataset.selectedPhotoName = file.name || 'uploaded-photo';
          }
        }

        const messageUrl = input.dataset.selectedPhotoSrc || '';
        const fileName = input.dataset.selectedPhotoName || 'uploaded-photo';
        return messageUrl
          ? [{
            src: messageUrl,
            full_src: messageUrl,
            alt: fileName,
            file_name: fileName,
            source: 'device',
          }]
          : [];
      };

      const releaseDevicePhotoPreview = () => {
        const input = root.querySelector('#composerPhotoDeviceInput');
        if (!input) {
          return;
        }

        if (input.dataset.previewUrl) {
          window.URL?.revokeObjectURL?.(input.dataset.previewUrl);
          delete input.dataset.previewUrl;
        }
        delete input.dataset.selectedPhotoSrc;
        delete input.dataset.selectedPhotoName;
        delete input.dataset.messagePreviewUrl;
        delete input.dataset.messagePreviewSignature;
      };

      const restoreDraftGalleryPhotos = (photos = []) => {
        const wanted = Array.isArray(photos) ? photos : [];
        const wantedFileNames = new Set(wanted.map((photo) => photo?.file_name).filter(Boolean));
        const wantedSrcFallback = new Set(
          wanted
            .filter((photo) => !photo?.file_name && photo?.src)
            .map((photo) => photo.src)
        );

        getComposerGalleryPanel()?.querySelectorAll('.composer-gallery-item.is-selected').forEach((item) => {
          item.classList.remove('is-selected');
        });

        if (!wantedFileNames.size && !wantedSrcFallback.size) {
          return 0;
        }

        let restored = 0;
        getComposerGalleryPanel()?.querySelectorAll('.composer-gallery-item').forEach((item) => {
          const image = item.querySelector('img');
          const fileName = item.dataset.fileName || image?.alt || '';
          const shouldSelect = wantedFileNames.has(fileName)
            || (!wantedFileNames.size && [item.dataset.src, item.dataset.fullSrc, image?.src]
              .filter(Boolean)
              .some((src) => wantedSrcFallback.has(src)));
          if (shouldSelect) {
            item.classList.add('is-selected');
            restored += 1;
          }
        });

        return restored;
      };

      const getComposerServerPayload = () => {
        const mode = composer?.dataset.composerMode || 'direct';
        const input = root.querySelector('#messageInput') || document.querySelector('#messageInput');
        const send = root.querySelector('#btnSendMessage') || document.querySelector('#btnSendMessage');
        const attachmentPreview = root.querySelector('#attachmentPreview');
        const safetyPayload = {
          composer_mode: mode,
          send_unlock_enabled: CHAT_COMPOSER_CONFIG.sendUnlockEnabled,
          composer_send_state: getComposerSafetyState(),
          confirmed_to_send: getComposerSafetyState() === 'ready',
        };
        const basePayload = {
          conversation_id: root.dataset.conversationId || 'c2',
          text: input?.value.trim() || '',
          ...safetyPayload,
        };
        const composerTranslationState = getComposerTranslationState(basePayload.text);
        if (composerTranslationState?.is_stale) {
          basePayload.blocked_reason = 'stale_translation';
          basePayload.translation = {
            source_text: composerTranslationState.original_text,
            translated_text: composerTranslationState.translated_text,
            source_lang: composerTranslationState.source_lang,
            target_lang: composerTranslationState.target_lang,
            provider: composerTranslationState.provider,
            translated_at: composerTranslationState.translated_at,
            is_stale: true,
          };
        }
        const composerTranslation = getComposerTranslationPayload(basePayload.text);
        if (composerTranslation) {
          basePayload.original_text = composerTranslation.original_text;
          basePayload.text = composerTranslation.translated_text;
          basePayload.send_text_source = 'translation';
          basePayload.translation = {
            source_text: composerTranslation.original_text,
            translated_text: composerTranslation.translated_text,
            source_lang: composerTranslation.source_lang,
            target_lang: composerTranslation.target_lang,
            provider: composerTranslation.provider,
            translated_at: composerTranslation.translated_at,
          };
        }

        if (attachmentPreview && !attachmentPreview.hidden) {
          basePayload.attachment_source = attachmentPreview.dataset.activeSource || '';
          basePayload.attachment_label = root.querySelector('#attachmentPreviewText')?.textContent.trim() || '';
          if (basePayload.attachment_source === 'btnUploadPhoto') {
            basePayload.attachment_photos = getSelectedGalleryPhotos();
          } else if (basePayload.attachment_source === 'btnUploadPhotoDevice') {
            basePayload.attachment_photos = getDevicePhotoAttachment();
          }
        }

        if (mode === 'reply') {
          return {
            mode,
            endpoint: CHAT_API_ENDPOINTS.sendMessage,
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
            endpoint: CHAT_API_ENDPOINTS.message(send?.dataset.editingMessageId || ''),
            method: 'PATCH',
            payload: {
              message_id: send?.dataset.editingMessageId || '',
              text: basePayload.text,
              original_text: basePayload.original_text || '',
              send_text_source: basePayload.send_text_source || 'operator',
              translation: basePayload.translation || null,
              ...safetyPayload,
            },
          };
        }

        return {
          mode: 'direct',
          endpoint: CHAT_API_ENDPOINTS.sendMessage,
          method: 'POST',
          payload: basePayload,
        };
      };

      const getLocalDraftStorageKey = (conversationId = root.dataset.conversationId || 'c2') => (
        `adminAgentChat.composerDraft.${conversationId || 'unknown'}`
      );

      const removeLocalComposerDraft = (conversationId = root.dataset.conversationId || 'c2') => {
        const normalizedConversationId = conversationId || 'unknown';
        try {
          window.localStorage?.removeItem(getLocalDraftStorageKey(normalizedConversationId));
        } catch (error) {
          // Local draft is a convenience layer; ignore storage failures.
        }
        composerSafety.clearedDraftConversationIds.add(normalizedConversationId);
        composerSafety.lastLocalDraftFingerprint = '';
      };

      const saveLocalComposerDraft = (options = {}) => {
        const payload = getComposerDraftPayload();
        const storageKey = getLocalDraftStorageKey(payload.conversation_id);
        const hasContent = Boolean(payload.text || payload.attachment_source);

        if (!hasContent) {
          removeLocalComposerDraft(payload.conversation_id);
          return;
        }
        composerSafety.clearedDraftConversationIds.delete(payload.conversation_id);

        const fingerprint = getComposerDraftFingerprint(payload);
        if (!options.force && fingerprint === composerSafety.lastLocalDraftFingerprint) {
          return;
        }

        try {
          window.localStorage?.setItem(storageKey, JSON.stringify({
            ...payload,
            draft_local_saved_at: new Date().toISOString(),
          }));
          composerSafety.lastLocalDraftFingerprint = fingerprint;
        } catch (error) {
          // Storage quota/private mode should not block typing.
        }
      };

      const scheduleLocalComposerDraftSave = () => {
        window.clearTimeout(composerSafety.localAutosaveTimer);
        composerSafety.localAutosaveTimer = window.setTimeout(() => {
          saveLocalComposerDraft();
        }, composerSafety.localAutosaveMs);
      };

      const restoreLocalComposerDraft = () => {
        const conversationId = root.dataset.conversationId || 'c2';
        if (composerSafety.clearedDraftConversationIds.has(conversationId)) {
          return;
        }
        let savedDraft = null;
        try {
          savedDraft = JSON.parse(window.localStorage?.getItem(getLocalDraftStorageKey(conversationId)) || 'null');
        } catch (error) {
          savedDraft = null;
        }

        if (!savedDraft || (!savedDraft.text && !savedDraft.attachment_source)) {
          return;
        }

        const savedAt = Date.parse(savedDraft.draft_local_saved_at || '');
        const maxAgeMs = CHAT_COMPOSER_CONFIG.localDraftMaxAgeMs;
        if (savedAt && Date.now() - savedAt > maxAgeMs) {
          removeLocalComposerDraft(conversationId);
          return;
        }

        const input = root.querySelector('#messageInput') || document.querySelector('#messageInput');
        if (input?.value.trim()) {
          return;
        }

        if (savedDraft.composer_mode === 'reply' && savedDraft.target_message_id) {
          setReplyPreview(
            savedDraft.reply_preview_text || getReplyPreviewText(savedDraft.target_message_id),
            savedDraft.target_message_id
          );
        } else {
          clearReplyPreview();
          setComposerMode('direct');
        }

        if (savedDraft.text) {
          setComposerValue(savedDraft.text);
        }

        if (savedDraft.translation?.source_text && savedDraft.translation?.translated_text) {
          setComposerTranslationPreview({
            originalText: savedDraft.translation.source_text,
            translatedText: savedDraft.translation.translated_text,
            sourceLang: savedDraft.translation.source_lang || getComposerSourceLang(savedDraft.translation.source_text),
            targetLang: savedDraft.translation.target_lang || getTranslationTargetLang(),
            provider: savedDraft.translation.provider || 'draft',
          });
        }

        // Browser File objects cannot be reconstructed from localStorage.
        // Only gallery assets with stable server/demo IDs are safe to restore.
        if (savedDraft.attachment_source === 'btnUploadPhoto') {
          const attachmentPreview = root.querySelector('#attachmentPreview');
          const attachmentPreviewText = root.querySelector('#attachmentPreviewText');
          if (attachmentPreview && attachmentPreviewText) {
            const restoredCount = restoreDraftGalleryPhotos(savedDraft.attachment_photos);
            if (restoredCount > 0) {
              attachmentPreview.dataset.activeSource = savedDraft.attachment_source;
              const galleryLabel = restoredCount > 1
                ? `${restoredCount} gallery photos ready`
                : 'Gallery photo ready';
              attachmentPreviewText.textContent = savedDraft.attachment_label || galleryLabel;
              attachmentPreview.hidden = false;
              root.querySelector('#conversationInputArea')?.classList.add('has-attachment-choice');
            }
          }
        }

        composerSafety.lastLocalDraftFingerprint = getComposerDraftFingerprint(savedDraft);
      };

      const sendComposerPayload = () => {
        const request = getComposerServerPayload();
        /*
        // Real composer API integration point for direct/reply/edit.
        // If composer translation is active, request.payload.text is the translated
        // client-facing text, while request.payload.original_text and
        // request.payload.translation keep the operator's source text and metadata.
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

      const createDemoPhotoGridMarkup = (photos, messageId) => {
        if (!photos.length) {
          return '';
        }

        const gridClass = photos.length > 1 ? 'is-gallery' : 'is-single';
        const safeGroup = escapeHtml(`message-${messageId}`);
        const photoCards = photos.map((photo, index) => {
          const title = photo.file_name || photo.alt || `Gallery photo ${index + 1}`;
          return `
            <a class="message-photo-card" href="${escapeHtml(photo.src)}" data-fancybox="${safeGroup}" data-type="image" data-caption="${escapeHtml(title)}">
              <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || title)}">
            </a>
          `;
        }).join('');

        return `
          <div class="message-attachments message-attachments-photos ${gridClass}">
            ${photoCards}
          </div>
        `;
      };

      const appendDemoSentMessage = (request) => {
        const list = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
        const text = request.payload?.text || '';
        const attachmentLabel = request.payload?.attachment_label || '';
        const attachmentSource = request.payload?.attachment_source || '';
        const attachmentKindsBySource = {
          btnUploadPhoto: 'image',
          btnUploadPhotoDevice: 'image',
          btnUploadAudio: 'audio',
          btnUploadFile: 'file',
        };
        const galleryPhotos = ['btnUploadPhoto', 'btnUploadPhotoDevice'].includes(attachmentSource)
          ? (Array.isArray(request.payload?.attachment_photos) ? request.payload.attachment_photos : [])
          : [];
        const hasGalleryPhotos = galleryPhotos.length > 0;
        const hasAttachment = !!attachmentSource;
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
        wrapper.id = `message-${messageId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
        wrapper.dataset.messageId = messageId;
        wrapper.dataset.messageAuthor = 'operator';
        wrapper.dataset.messageKind = text ? 'text' : 'attachment';
        wrapper.dataset.messageHasText = text ? 'true' : 'false';
        wrapper.dataset.messageLang = request.payload?.translation?.target_lang || getComposerSourceLang(text);
        if (request.payload?.original_text) {
          wrapper.dataset.originalText = request.payload.original_text;
        }
        if (request.payload?.translation?.translated_text) {
          wrapper.dataset.translatedText = request.payload.translation.translated_text;
          wrapper.dataset.translationSourceLang = request.payload.translation.source_lang || 'auto';
          wrapper.dataset.translationTargetLang = request.payload.translation.target_lang || wrapper.dataset.messageLang;
          wrapper.dataset.translationProvider = request.payload.translation.provider || 'demo';
        }
        wrapper.dataset.attachmentKind = hasGalleryPhotos
          ? 'image'
          : (hasAttachment ? (attachmentKindsBySource[attachmentSource] || 'mix') : 'none');
        wrapper.dataset.attachmentCount = hasGalleryPhotos ? String(galleryPhotos.length) : (hasAttachment ? '1' : '0');
        wrapper.dataset.messageViewedByClient = 'false';

        const replyTo = request.payload?.reply_to_message_id || '';
        const replyMarkup = replyTo
          ? `<div class="message-reply-quote" data-reply-to="${escapeHtml(replyTo)}" role="link" tabindex="0" aria-label="Go to replied message">
              <span class="message-reply-author">Reply</span>
              <span class="message-reply-text">${escapeHtml(getReplyPreviewText(replyTo))}</span>
            </div>`
          : '';
        const attachmentMarkup = hasGalleryPhotos
          ? createDemoPhotoGridMarkup(galleryPhotos, messageId)
          : (attachmentLabel
            ? `<div class="message-attachments message-attachments-files">
              <span class="message-file-card">
                <i class="file-type-icon"></i>
                <span class="message-file-meta">
                  <strong>${escapeHtml(attachmentLabel)}</strong>
                  <small>Prepared attachment</small>
                </span>
              </span>
            </div>`
            : '');
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
            <div class="message-actions-row">
              ${copyMarkup}
              <button class="btn btn-xs btn-default message-pin-toggle" type="button" aria-pressed="false"><i class="fa fa-thumb-tack"></i> Pin</button>
            </div>
          </div>
        `;
        list.appendChild(wrapper);
        syncOriginalFancyboxImages(wrapper);
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return wrapper;
      };

      const applyCanonicalSentMessage = (response = {}) => {
        const list = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
        if (!list || typeof response.message_html !== 'string') {
          return null;
        }

        const fragment = document.createRange().createContextualFragment(response.message_html);
        const message = Array.from(fragment.children).find((node) => node.matches?.('.direct-chat-msg')) || null;
        list.appendChild(fragment);
        syncOriginalFancyboxImages(list);
        const target = message || list.querySelector('.direct-chat-msg:last-child');
        target?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return target;
      };

      const clearAttachmentChoice = () => {
        const attachmentPreview = root.querySelector('#attachmentPreview');
        if (!attachmentPreview) {
          return;
        }
        attachmentPreview.hidden = true;
        attachmentPreview.removeAttribute('data-active-source');
        root.querySelector('#attachmentPreviewText').textContent = 'Attachment ready';
        getComposerGalleryPanel()?.querySelectorAll('.composer-gallery-item.is-selected').forEach((item) => {
          item.classList.remove('is-selected');
        });
        releaseDevicePhotoPreview();
        const photoDeviceInput = root.querySelector('#composerPhotoDeviceInput');
        if (photoDeviceInput) {
          photoDeviceInput.value = '';
        }
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
          clearComposerTranslationPreview();
          setComposerValue('');
          setComposerMode('direct');
          removeLocalComposerDraft();
        }
      };

      const handleComposerSend = () => {
        const request = getComposerServerPayload();
        if (request.mode === 'edit') {
          composerSafety.isSending = true;
          saveMessageEdit();
          composerSafety.isSending = false;
          resetComposerUnlock();
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
            applyCanonicalSentMessage(data);
            resetComposerAfterSend();
            return data;
          })
          .catch((error) => {
            // Keep composer content so operator can retry.
            throw error;
          });
        */

        // Demo mode: emulate successful direct/reply send locally.
        composerSafety.isSending = true;
        return sendComposerPayload().then((data) => {
          appendDemoSentMessage(request);
          resetComposerAfterSend();
          return data;
        }).finally(() => {
          composerSafety.isSending = false;
          composerSafety.lastDraftFingerprint = '';
          removeLocalComposerDraft();
          resetComposerUnlock();
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
        removeLocalComposerDraft();
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
        const deletionMode = getMessageDeletionMode(message);
        if (!messageId || !bubble || !deletionMode) {
          return;
        }

        const pinButton = message.querySelector('.message-pin-toggle.is-pinned');
        pinButton?.click();

        if (deletionMode === 'hard') {
          const parent = message.parentNode;
          const nextSibling = message.nextSibling;
          message.remove();
          demoMessageMutations.delete(messageId, deletionMode).catch(() => {
            parent?.insertBefore(message, nextSibling || null);
          });
          return;
        }

        if (!textNode) {
          return;
        }

        const previousText = textNode.textContent;
        message.classList.add('is-message-deleted');
        textNode.textContent = 'Message deleted';
        if (actions) {
          actions.hidden = true;
        }
        demoMessageMutations.delete(messageId, deletionMode).catch(() => {
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
        const actions = bubble.querySelector('.message-actions-row');
        if (!actions) {
          return;
        }

        const buttons = Array.from(actions.querySelectorAll('button'));
        const reply = buttons.find((button) => button.classList.contains('js-message-reply'));
        const translate = buttons.find((button) => button.classList.contains('js-message-translate'));
        [reply, translate].filter(Boolean).forEach((button) => actions.appendChild(button));
      };

      const ensureMessageMutationMenu = (bubble) => {
        const message = bubble.closest('.direct-chat-msg');
        const actions = bubble.querySelector('.message-actions-row');
        if (!actions) {
          return;
        }

        let pinButton = Array.from(actions.querySelectorAll('button')).find((button) => (
          button.classList.contains('message-pin-toggle')
          || /^(Pin|Unpin)$/i.test(button.textContent.trim())
        ));
        if (!pinButton && message?.dataset.messageId && getMessageAuthor(message) !== 'system') {
          pinButton = document.createElement('button');
          pinButton.type = 'button';
          pinButton.textContent = 'Pin';
          pinButton.setAttribute('aria-pressed', 'false');
        }
        if (pinButton) {
          pinButton.remove();
          pinButton.classList.remove('btn', 'btn-xs', 'btn-default', 'message-icon-action');
          pinButton.classList.add('message-mutation-item', 'message-pin-toggle');
          pinButton.setAttribute('aria-label', pinButton.classList.contains('is-pinned') ? 'Unpin message' : 'Pin message');
        }

        actions.querySelector('.message-mutation-menu')?.remove();
        const copyButtons = Array.from(actions.querySelectorAll('.message-copy-action, button[aria-label="Copy message"]'));
        copyButtons.forEach((button) => button.remove());

        const allowCopy = canCopyMessage(message, bubble);
        const allowEdit = canMutateOwnMessage(message);
        const allowDelete = Boolean(getMessageDeletionMode(message));
        if (!pinButton && !allowCopy && !allowDelete) {
          return;
        }

        const menu = document.createElement('span');
        menu.className = 'message-mutation-menu';
        const copyItem = allowCopy
          ? '<button class="message-mutation-item js-message-copy-menu" type="button">Copy</button>'
          : '';
        const editItem = allowEdit
          ? '<button class="message-mutation-item js-message-edit" type="button">Edit</button>'
          : '';
        const deleteItem = allowDelete
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
        if (pinButton) {
          dropdown.insertBefore(pinButton, dropdown.firstChild);
        }
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

        pinButton?.addEventListener('click', () => {
          closeMenu();
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
        if (message?.dataset.messageCardType === 'billing_offer') {
          bubble.classList.remove('is-non-text-message');
          bubble.querySelector('.message-kind-badge')?.remove();
          bubble.querySelectorAll('.message-copy-action, .js-message-translate').forEach((button) => button.remove());
          return;
        }
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

        const requestMessageRetry = (messageNode) => {
          const payload = {
            conversation_id: root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '',
            message_id: messageNode.dataset.messageId || '',
            previous_send_state: messageNode.dataset.sendState || '',
            requested_by: root.dataset.agentId || root.dataset.userId || 'admin',
            requested_from: 'message_retry_button',
            requested_at: new Date().toISOString(),
          };

          /*
          // Real API integration point for retrying a failed outbound message.
          // Backend should enqueue/resend the original message and return the new send state.
          return fetch(CHAT_API_ENDPOINTS.retryMessage(payload.message_id), {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
          }).then((response) => {
            if (!response.ok) {
              throw new Error('Message retry failed');
            }
            return response.json();
          });
          */

          return window.Promise.resolve({ ok: true, message_id: payload.message_id, send_state: 'sent' });
        };

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
            retryButton.disabled = true;
            message.dataset.sendState = 'retrying';
            normalizeDeliveryState(bubble);
            requestMessageRetry(message)
              .then((response) => {
                message.dataset.sendState = response?.send_state || 'sent';
              })
              .catch(() => {
                message.dataset.sendState = 'failed';
              })
              .finally(() => {
                normalizeDeliveryState(bubble);
              });
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

        const actions = bubble.querySelector('.message-actions-row');
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

      setComposerSendState('locked');

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
          if (request.payload.blocked_reason === 'stale_translation') {
            syncComposerSafetyUi();
            return;
          }
          if (!CHAT_COMPOSER_CONFIG.sendUnlockEnabled) {
            handleComposerSend();
            return;
          }
          if (getComposerSafetyState() === 'locked') {
            startComposerUnlock();
            return;
          }
          if (getComposerSafetyState() === 'unlocking') {
            return;
          }
          handleComposerSend();
        }, true);

        messageInput?.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) {
            return;
          }

          const request = getComposerServerPayload();
          if (!request.payload.text && !request.payload.attachment_source) {
            return;
          }
          if (request.payload.blocked_reason === 'stale_translation') {
            event.preventDefault();
            event.stopPropagation();
            syncComposerSafetyUi();
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          send?.click();
        });

        messageInput?.addEventListener('input', () => {
          scheduleLocalComposerDraftSave();
          if (getComposerSafetyState() !== 'locked') {
            resetComposerUnlock();
          } else {
            syncComposerSafetyUi();
          }
        });

        composerSafety.autosaveTimer = window.setInterval(() => {
          saveComposerDraft();
        }, composerSafety.autosaveMs);

        root.addEventListener('agentchat:conversation-will-change', () => {
          saveLocalComposerDraft({ force: true });
          saveComposerDraft({ force: true });
        });

        root.addEventListener('agentchat:conversation-changed', () => {
          window.clearTimeout(composerSafety.localAutosaveTimer);
          clearReplyPreview();
          clearComposerEditMode();
          clearAttachmentChoice();
          clearComposerTranslationPreview();
          setComposerValue('');
          setComposerMode('direct');
          resetComposerUnlock();
          composerSafety.lastDraftFingerprint = '';
          composerSafety.lastLocalDraftFingerprint = '';
          composerSafety.draftRevision = 0;
          composerSafety.draftNonce = `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          restoreLocalComposerDraft();
        });

        window.addEventListener('pagehide', () => {
          saveLocalComposerDraft({ force: true });
        });

        restoreLocalComposerDraft();

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

        // One delegated Reply path covers both server-rendered and dynamic messages.
        root.addEventListener('click', (event) => {
          const replyButton = event.target.closest('.js-message-reply');
          if (!replyButton || !root.contains(replyButton)) {
            return;
          }

          const bubble = replyButton.closest('.direct-chat-text');
          const message = bubble?.closest('.direct-chat-msg');
          if (!bubble || !canReplyToMessage(message)) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          setReplyPreview(bubble.querySelector('.ng-binding')?.textContent.trim(), message.dataset.messageId);
        }, true);
      }

      if (window.location.hash && window.location.hash.startsWith('#message-')) {
        const target = root.querySelector(window.location.hash);
        if (target) {
          window.setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightMessage(target);
          }, CHAT_UI_TIMING.hashScrollDelayMs);
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
      const composerTranslateToggle = root.querySelector('.js-composer-translate-toggle');
      const composerTranslateClear = root.querySelector('#composerTranslateClear');
      const translationPreview = root.querySelector('#composerTranslationPreview');
      const translationPreviewClear = root.querySelector('#composerTranslationPreviewClear');
      const translationModal = root.querySelector('#composerTranslationModal');
      const translationModalClose = root.querySelector('#composerTranslationModalClose');
      const galleryPanel = root.querySelector('#composerGalleryPanel');
      const galleryClose = root.querySelector('#composerGalleryClose');
      const galleryDone = root.querySelector('#composerGalleryDone');
      const galleryCount = root.querySelector('#composerGalleryCount');
      const photoDeviceInput = root.querySelector('#composerPhotoDeviceInput');
      const audioInput = root.querySelector('#composerAudioInput');
      const fileInput = root.querySelector('#composerFileInput');
      const attachActions = root.querySelectorAll('#btnUploadPhotoDevice, #btnUploadPhoto, #btnUploadAudio, #btnUploadFile');
      const voice = root.querySelector('#btnVoiceMessage');
      const emoji = root.querySelector('#btnEmoji');
      const emojiPicker = root.querySelector('#composerEmojiPicker');
      const composerModeToggle = root.querySelector('.js-composer-mode-toggle');
      const composerToolsToggle = root.querySelector('.js-composer-tools-toggle');
      const composerPanelSwitches = Array.from(root.querySelectorAll('.js-composer-panel-switch'));
        if (!composer || !input || !send) {
          return;
        }

        if (galleryPanel && galleryPanel.parentElement !== document.body) {
          galleryPanel.classList.add('agent-chat-modal-layer');
          document.body.appendChild(galleryPanel);
        }

        if (translationModal && translationModal.parentElement !== document.body) {
          document.body.appendChild(translationModal);
        }

        const syncComposerModeToggle = () => {
          const controlsMode = composer.classList.contains('controls-mode') || composer.classList.contains('tools-mode');
          if (composerModeToggle) {
            const icon = composerModeToggle.querySelector('.fa');
            composerModeToggle.classList.toggle('is-active', controlsMode);
            composerModeToggle.classList.toggle('is-quick-mode', !controlsMode);
            composerModeToggle.setAttribute('aria-pressed', String(controlsMode));
            composerModeToggle.setAttribute('title', controlsMode ? 'Chat controls' : 'Quick replies');

            if (icon) {
              icon.className = controlsMode ? 'fa fa-tasks' : 'fa fa-commenting-o';
            }
          }

          if (composerToolsToggle) {
            const toolsMode = composer.classList.contains('tools-mode');
            composerToolsToggle.classList.toggle('is-active', toolsMode);
            composerToolsToggle.setAttribute('aria-expanded', String(toolsMode));
          }

          composerPanelSwitches.forEach((button) => {
            const activePanel = composer.dataset.composerToolPanel || (controlsMode ? 'labels' : 'answer');
            const isActive = button.dataset.panel === activePanel;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
          });
        };

        root.dataset.composerVisualBound = '1';
        composer.classList.remove('controls-mode');
        composer.classList.remove('templates-mode', 'labels-mode', 'tools-mode');
        composer.classList.toggle('voice-messages-enabled', CHAT_COMPOSER_CONFIG.voiceMessagesEnabled);
        composer.classList.toggle('voice-messages-disabled', !CHAT_COMPOSER_CONFIG.voiceMessagesEnabled);
        composer.classList.toggle('emoji-picker-enabled', CHAT_COMPOSER_CONFIG.emojiPickerEnabled);
        composer.classList.toggle('emoji-picker-disabled', !CHAT_COMPOSER_CONFIG.emojiPickerEnabled);
        composer.classList.toggle('send-unlock-enabled', CHAT_COMPOSER_CONFIG.sendUnlockEnabled);
        composer.classList.toggle('send-unlock-disabled', !CHAT_COMPOSER_CONFIG.sendUnlockEnabled);
        composer.dataset.voiceMessagesEnabled = String(CHAT_COMPOSER_CONFIG.voiceMessagesEnabled);
        composer.dataset.emojiPickerEnabled = String(CHAT_COMPOSER_CONFIG.emojiPickerEnabled);
        composer.dataset.sendUnlockEnabled = String(CHAT_COMPOSER_CONFIG.sendUnlockEnabled);
        if (voice) {
          voice.hidden = !CHAT_COMPOSER_CONFIG.voiceMessagesEnabled;
          voice.disabled = !CHAT_COMPOSER_CONFIG.voiceMessagesEnabled;
        }
        if (emoji) {
          emoji.hidden = !CHAT_COMPOSER_CONFIG.emojiPickerEnabled;
          emoji.disabled = !CHAT_COMPOSER_CONFIG.emojiPickerEnabled;
        }
        if (emojiPicker) {
          emojiPicker.hidden = true;
        }
        composer.dataset.composerToolPanel = 'answer';
        syncComposerModeToggle();

        const syncComposerMeasuredHeight = () => {
          const height = Math.ceil(composer.getBoundingClientRect().height || composer.offsetHeight || 0);
          if (height > 0) {
            root.style.setProperty('--agent-composer-height', `${height}px`);
          }
        };

        const growInput = () => {
          const style = window.getComputedStyle(input);
          const paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
          const borderY = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
          const fontSize = parseFloat(style.fontSize) || 13;
          const lineHeightValue = parseFloat(style.lineHeight);
          const rowHeight = Math.max(1, Number.isFinite(lineHeightValue) ? lineHeightValue : fontSize * 1.35);
          const minRows = CHAT_COMPOSER_CONFIG.inputMinRows;
          const maxRows = CHAT_COMPOSER_CONFIG.inputMaxRows;
          const baseHeight = Math.ceil((minRows * rowHeight) + paddingY + borderY);
          const maxHeight = Math.ceil((maxRows * rowHeight) + paddingY + borderY);

          input.style.minHeight = '0px';
          input.style.height = '0px';
          const measuredRows = Math.max(1, Math.round(Math.max(0, input.scrollHeight - paddingY) / rowHeight));
          const visibleRows = Math.min(Math.max(minRows, measuredRows), maxRows);
          const nextHeight = Math.ceil((visibleRows * rowHeight) + paddingY + borderY);

          input.style.minHeight = `${baseHeight}px`;
          input.style.height = `${nextHeight}px`;
          input.style.overflowY = measuredRows > maxRows ? 'auto' : 'hidden';
          composer.style.setProperty('--composer-input-line-height', `${rowHeight}px`);
          composer.style.setProperty('--composer-input-min-height', `${baseHeight}px`);
          composer.style.setProperty('--composer-input-height', `${nextHeight}px`);
          composer.style.setProperty('--composer-input-max-height', `${maxHeight}px`);
          composer.classList.toggle('is-multiline-input', nextHeight > baseHeight);
          syncComposerMeasuredHeight();
        };

        const sync = () => {
          const hasText = input.value.trim().length > 0;
          const hasAttachment = !!(attachmentPreview && !attachmentPreview.hidden && attachmentPreview.dataset.activeSource);
          const translationState = syncComposerTranslationPreviewState(input.value.trim());
          const hasTranslation = Boolean(translationState);
          const hasValidTranslation = Boolean(translationState && !translationState.is_stale);
          const hasStaleTranslation = Boolean(translationState?.is_stale);
          const isReady = (hasText || hasAttachment) && !hasStaleTranslation;
          composer.classList.toggle('has-draft', hasText);
          composer.classList.toggle('composer-translate-hidden', !hasText);
          composer.classList.toggle('has-translation-choice', hasTranslation);
          composer.classList.toggle('has-stale-translation', hasStaleTranslation);
          if (composerTranslateToggle) {
            composerTranslateToggle.hidden = !hasText;
            composerTranslateToggle.setAttribute('aria-hidden', String(!hasText));
          }
          composerTranslateToggle?.classList.toggle('is-active', hasValidTranslation);
          composerTranslateToggle?.classList.toggle('is-stale', hasStaleTranslation);
          composerTranslateToggle?.setAttribute('aria-pressed', String(hasValidTranslation));
          composer.classList.toggle('ready', isReady);
          send.classList.toggle('is-disabled', !isReady);
          send.disabled = !isReady;
          if (hasStaleTranslation) {
            send.title = 'Удалите устаревший перевод или верните исходный текст перевода';
            send.setAttribute('aria-disabled', 'true');
          } else {
            send.title = hasText || hasAttachment
              ? 'Send message'
              : CHAT_COMPOSER_CONFIG.voiceMessagesEnabled
                ? 'Message is locked'
                : 'Enter a message';
            send.setAttribute('aria-disabled', String(!isReady));
          }
          growInput();
        };

        if ('ResizeObserver' in window) {
          const composerObserver = new ResizeObserver(syncComposerMeasuredHeight);
          composerObserver.observe(composer);
        }
        syncComposerMeasuredHeight();

        input.addEventListener('input', () => {
          syncComposerTranslationPreviewState(input.value.trim());
          sync();
        });

        const setEmojiPickerOpen = (isOpen, options = {}) => {
          if (!emoji || !emojiPicker || !CHAT_COMPOSER_CONFIG.emojiPickerEnabled) {
            return;
          }
          emojiPicker.hidden = !isOpen;
          emoji.classList.toggle('is-active', isOpen);
          emoji.setAttribute('aria-expanded', String(isOpen));
          if (isOpen && options.focusFirst) {
            emojiPicker.querySelector('.composer-emoji-option')?.focus();
          }
        };

        const insertComposerEmoji = (symbol) => {
          const selectionStart = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
          const selectionEnd = Number.isInteger(input.selectionEnd) ? input.selectionEnd : selectionStart;
          input.setRangeText(symbol, selectionStart, selectionEnd, 'end');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        };

        if (emoji && emojiPicker && CHAT_COMPOSER_CONFIG.emojiPickerEnabled) {
          const emojiFragment = document.createDocumentFragment();
          CHAT_COMPOSER_EMOJIS.forEach((symbol) => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'composer-emoji-option';
            option.setAttribute('role', 'menuitem');
            option.setAttribute('aria-label', `Insert ${symbol}`);
            option.textContent = symbol;
            option.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              insertComposerEmoji(symbol);
              setEmojiPickerOpen(false);
            });
            emojiFragment.appendChild(option);
          });
          emojiPicker.replaceChildren(emojiFragment);

          emoji.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            setEmojiPickerOpen(emojiPicker.hidden, { focusFirst: false });
          });

          document.addEventListener('click', (event) => {
            if (!emojiPicker.hidden && !emojiPicker.contains(event.target) && !emoji.contains(event.target)) {
              setEmojiPickerOpen(false);
            }
          });

          document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !emojiPicker.hidden) {
              event.preventDefault();
              setEmojiPickerOpen(false);
              emoji.focus();
            }
          });
        }

        const getSelectedGalleryItems = () => Array.from(galleryPanel?.querySelectorAll('.composer-gallery-item.is-selected') || []);

        const updateGallerySelectionCount = () => {
          if (!galleryCount) {
            return;
          }
          const count = getSelectedGalleryItems().length;
          galleryCount.textContent = count === 1 ? '1 selected' : `${count} selected`;
        };

        const openGalleryModal = () => {
          if (!galleryPanel) {
            return;
          }
          galleryPanel.hidden = false;
          updateGallerySelectionCount();
          window.setTimeout(() => galleryClose?.focus(), CHAT_UI_TIMING.immediateFocusMs);
        };

        const closeGalleryModal = () => {
          if (!galleryPanel) {
            return;
          }
          galleryPanel.hidden = true;
          input.focus();
        };

        composerTranslateToggle?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.target.closest('#composerTranslateClear')) {
            clearComposerTranslationPreview();
            sync();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return;
          }

          const sourceText = input.value.trim();
          if (!sourceText) {
            input.focus();
            return;
          }

          const existingTranslation = getComposerTranslationPayload(sourceText);
          if (existingTranslation) {
            openComposerTranslationModal();
            return;
          }

          composerTranslateToggle.classList.add('is-loading');
          composerTranslateToggle.disabled = true;
          requestComposerDraftTranslation(sourceText).then((result) => {
            if (result?.translatedText) {
              setComposerTranslationPreview(result);
              sync();
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }).finally(() => {
            composerTranslateToggle.classList.remove('is-loading');
            composerTranslateToggle.disabled = false;
          });
        });

        composerTranslateClear?.addEventListener('keydown', (event) => {
          if (!['Enter', ' '].includes(event.key)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          clearComposerTranslationPreview();
          sync();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        translationPreview?.addEventListener('click', (event) => {
          if (event.target.closest('#composerTranslationPreviewClear')) {
            return;
          }

          event.preventDefault();
          openComposerTranslationModal();
        });

        translationPreview?.addEventListener('keydown', (event) => {
          if (!['Enter', ' '].includes(event.key)) {
            return;
          }
          event.preventDefault();
          openComposerTranslationModal();
        });

        translationPreviewClear?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          clearComposerTranslationPreview();
          sync();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        translationModalClose?.addEventListener('click', (event) => {
          event.preventDefault();
          closeComposerTranslationModal();
          input.focus();
        });

        translationModal?.addEventListener('click', (event) => {
          if (event.target === translationModal) {
            closeComposerTranslationModal();
          }
        });

        attachToggle?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          composer.dataset.composerToolPanel = 'answer';
          composer.classList.remove('controls-mode', 'templates-mode', 'labels-mode', 'tools-mode');
          setTemplateMenuOpen(false);
          syncComposerModeToggle();
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
          input.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const releasePhotoDevicePreview = () => {
          if (!photoDeviceInput) {
            return;
          }

          if (photoDeviceInput.dataset.previewUrl) {
            window.URL?.revokeObjectURL?.(photoDeviceInput.dataset.previewUrl);
          }
          delete photoDeviceInput.dataset.previewUrl;
          delete photoDeviceInput.dataset.selectedPhotoSrc;
          delete photoDeviceInput.dataset.selectedPhotoName;
          delete photoDeviceInput.dataset.messagePreviewUrl;
          delete photoDeviceInput.dataset.messagePreviewSignature;
        };

        const clearAttachmentPreviewState = () => {
          if (attachmentPreview) {
            attachmentPreview.hidden = true;
            attachmentPreview.removeAttribute('data-active-source');
          }
          if (attachmentPreviewText) {
            attachmentPreviewText.textContent = 'Attachment ready';
          }
          galleryPanel?.querySelectorAll('.composer-gallery-item.is-selected').forEach((item) => {
            item.classList.remove('is-selected');
          });
          updateGallerySelectionCount();
          releasePhotoDevicePreview();
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
          input.dispatchEvent(new Event('input', { bubbles: true }));
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

        const templateSelect = root.querySelector('.js-composer-template-select');
        const templateMenu = root.querySelector('.js-composer-template-menu');
        const templateOptions = Array.from(templateMenu?.querySelectorAll('.composer-template-option') || []);
        const templateEmpty = templateMenu?.querySelector('.composer-template-empty');
        const composerPanelDrawer = root.querySelector('#composerToolsPanel');

        if (templateMenu && templateMenu.parentElement !== document.body) {
          templateMenu.classList.add('composer-template-menu-floating');
          document.body.appendChild(templateMenu);
        }

        const positionTemplateMenu = () => {
          if (!templateSelect || !templateMenu || !templateMenu.classList.contains('is-open')) {
            return;
          }

          const gap = CHAT_FLOATING_UI.templateMenuGapPx;
          const viewportPadding = CHAT_FLOATING_UI.viewportPaddingPx;
          const rect = templateSelect.getBoundingClientRect();
          const maxMenuHeight = CHAT_FLOATING_UI.templateMenuMaxHeightPx;
          const availableBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
          const availableAbove = rect.top - gap - viewportPadding;
          const openUp = availableBelow < CHAT_FLOATING_UI.templateMenuOpenUpThresholdPx
            && availableAbove > availableBelow;
          const availableSpace = Math.max(
            CHAT_FLOATING_UI.templateMenuMinHeightPx,
            Math.min(maxMenuHeight, openUp ? availableAbove : availableBelow)
          );
          const contentHeight = Math.max(
            CHAT_FLOATING_UI.templateMenuItemMinHeightPx,
            Math.min(availableSpace, templateMenu.scrollHeight || availableSpace)
          );
          const left = Math.min(
            Math.max(viewportPadding, rect.left),
            Math.max(viewportPadding, window.innerWidth - viewportPadding - rect.width)
          );
          const top = openUp
            ? Math.max(viewportPadding, rect.top - contentHeight - gap)
            : rect.bottom + gap;

          templateMenu.style.setProperty('--composer-template-menu-width', `${rect.width}px`);
          templateMenu.style.left = `${left}px`;
          templateMenu.style.top = `${top}px`;
          templateMenu.style.maxHeight = `${availableSpace}px`;
        };

        const scheduleTemplateMenuPosition = () => {
          positionTemplateMenu();
          window.requestAnimationFrame(positionTemplateMenu);
          window.setTimeout(positionTemplateMenu, CHAT_UI_TIMING.templateMenuRepositionMs);
        };

        const setTemplateMenuOpen = (open) => {
          if (!templateMenu || !templateSelect) {
            return;
          }

          templateMenu.classList.toggle('is-open', open);
          templateSelect.setAttribute('aria-expanded', String(open));

          if (open) {
            scheduleTemplateMenuPosition();
            return;
          }

          templateMenu.style.removeProperty('--composer-template-menu-width');
          templateMenu.style.removeProperty('left');
          templateMenu.style.removeProperty('top');
          templateMenu.style.removeProperty('max-height');
        };

        const filterTemplateOptions = () => {
          const query = (templateSelect?.value || '').trim().toLowerCase();
          let visibleCount = 0;
          templateOptions.forEach((option) => {
            const searchableText = [
              option.textContent,
              option.dataset.templateText,
            ].filter(Boolean).join(' ').toLowerCase();
            const isVisible = !query || searchableText.includes(query);
            option.hidden = !isVisible;
            option.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            if (isVisible) {
              visibleCount += 1;
            }
          });
          if (templateEmpty) {
            templateEmpty.hidden = visibleCount > 0;
          }

          scheduleTemplateMenuPosition();
        };

        const insertTemplate = (option) => {
          const insert = option?.dataset.templateText || '';
          if (!insert) {
            return;
          }

          input.focus();
          input.setSelectionRange(0, input.value.length);
          let replacedWithUndo = false;
          try {
            // Keeps the replacement in the browser undo stack, so Ctrl+Z restores the previous draft text.
            replacedWithUndo = document.execCommand && document.execCommand('insertText', false, insert);
          } catch (error) {
            replacedWithUndo = false;
          }
          if (!replacedWithUndo) {
            input.setRangeText(insert, 0, input.value.length, 'end');
            input.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              inputType: 'insertReplacementText',
              data: insert,
            }));
          }
          input.classList.toggle('ng-empty', !input.value);
          input.classList.toggle('ng-not-empty', Boolean(input.value));
          templateSelect.value = '';
          filterTemplateOptions();
          setTemplateMenuOpen(false);
          composer.dataset.composerToolPanel = 'answer';
          composer.classList.remove('controls-mode', 'templates-mode', 'labels-mode', 'tools-mode');
          syncComposerModeToggle();
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        };

        templateSelect?.addEventListener('focus', () => {
          filterTemplateOptions();
          setTemplateMenuOpen(true);
        });

        templateSelect?.addEventListener('input', () => {
          filterTemplateOptions();
          setTemplateMenuOpen(true);
        });

        templateSelect?.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') {
            return;
          }

          const firstVisibleOption = templateOptions.find((option) => !option.hidden);
          if (!firstVisibleOption) {
            return;
          }

          event.preventDefault();
          insertTemplate(firstVisibleOption);
        });

        templateOptions.forEach((option) => {
          option.addEventListener('click', (event) => {
            event.preventDefault();
            insertTemplate(option);
          });
        });

        composer.addEventListener('click', (event) => {
          const toolsButton = event.target.closest('.js-composer-tools-toggle');
          if (toolsButton && composer.contains(toolsButton)) {
            event.preventDefault();
            const toolsMode = !composer.classList.contains('tools-mode');
            composer.dataset.composerToolPanel = toolsMode ? 'tools' : 'answer';
            composer.classList.toggle('tools-mode', toolsMode);
            composer.classList.remove('templates-mode', 'labels-mode');
            composer.classList.toggle('controls-mode', toolsMode);
            setTemplateMenuOpen(false);
            syncComposerModeToggle();
            return;
          }

          const panelSwitch = event.target.closest('.js-composer-panel-switch');
          if (panelSwitch && composer.contains(panelSwitch)) {
            event.preventDefault();
            const panelName = panelSwitch.dataset.panel || 'answer';
            const isSameOpenPanel = panelName !== 'answer' && composer.dataset.composerToolPanel === panelName;
            const nextPanelName = isSameOpenPanel ? 'answer' : panelName;
            composer.dataset.composerToolPanel = nextPanelName;
            composer.classList.toggle('controls-mode', nextPanelName !== 'answer');
            composer.classList.toggle('templates-mode', nextPanelName === 'templates');
            composer.classList.toggle('labels-mode', nextPanelName === 'labels');
            syncComposerModeToggle();
            return;
          }

          const modeButton = event.target.closest('.js-composer-mode-toggle');
          if (modeButton) {
            event.preventDefault();
            const controlsMode = !composer.classList.contains('controls-mode');
            composer.classList.toggle('controls-mode', controlsMode);
            syncComposerModeToggle();
            return;
          }

        });

        document.addEventListener('click', (event) => {
          if (!composer.classList.contains('templates-mode') && !composer.classList.contains('labels-mode') && !composer.classList.contains('tools-mode')) {
            return;
          }

          const target = event.target;
          if (!(target instanceof Element)) {
            return;
          }

          const isInsideDrawer = composerPanelDrawer?.contains(target);
          const isInsideTemplateMenu = templateMenu?.contains(target);
          const isToolsToggle = Boolean(target.closest('.js-composer-tools-toggle'));

          if (isInsideDrawer || isInsideTemplateMenu || isToolsToggle) {
            return;
          }

          composer.dataset.composerToolPanel = 'answer';
          composer.classList.remove('controls-mode', 'templates-mode', 'labels-mode', 'tools-mode');
          setTemplateMenuOpen(false);
          syncComposerModeToggle();
        });

        window.addEventListener('resize', positionTemplateMenu);
        document.addEventListener('scroll', positionTemplateMenu, true);

        syncComposerModeToggle();

        const requestChatControlAction = (button, active) => {
          const payload = {
            conversation_id: root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '',
            action: button.dataset.chatControlAction || button.textContent.trim().toLowerCase().replace(/\s+/g, '_'),
            enabled: Boolean(active),
            changed_by: root.dataset.agentId || root.dataset.userId || 'admin',
            changed_from: 'composer_control_panel',
            changed_at: new Date().toISOString(),
          };

          /*
          // Real API integration point for composer control buttons.
          // Backend should persist/recalculate the conversation label or task state
          // and return the final saved state for this action.
          return fetch(CHAT_API_ENDPOINTS.conversationControls(payload.conversation_id), {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
          }).then((response) => {
            if (!response.ok) {
              throw new Error('Conversation control action failed');
            }
            return response.json();
          });
          */

          return window.Promise.resolve({ ok: true, control: payload });
        };

        root.querySelectorAll('.js-chat-control').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            const nextActive = !button.classList.contains('active');
            button.classList.toggle('active', nextActive);
            button.disabled = true;
            requestChatControlAction(button, nextActive)
              .then((response) => {
                const saved = response?.control;
                if (saved && typeof saved.enabled === 'boolean') {
                  button.classList.toggle('active', saved.enabled);
                }
              })
              .catch(() => {
                button.classList.toggle('active', !nextActive);
              })
              .finally(() => {
                button.disabled = false;
              });
          });
        });

        root.querySelector('#btnUploadPhotoDevice')?.addEventListener('click', (event) => {
          event.preventDefault();
          if (!canUseAttachAction(event.currentTarget)) {
            return;
          }
          attachMenu?.classList.remove('open');
          if (galleryPanel) {
            closeGalleryModal();
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
            closeGalleryModal();
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
            closeGalleryModal();
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
            if (galleryPanel.hidden) {
              openGalleryModal();
            } else {
              closeGalleryModal();
            }
          }
        });

        photoDeviceInput?.addEventListener('change', () => {
          const file = photoDeviceInput.files?.[0];
          if (!file) {
            return;
          }

          const fileName = file.name || 'Photo from device';
          releasePhotoDevicePreview();
          showAttachmentPreview(`Photo ready: ${fileName}`, 'btnUploadPhotoDevice');
        });

        fileInput?.addEventListener('change', () => {
          const file = fileInput.files?.[0];
          if (!file) {
            return;
          }

          const fileName = file.name || 'File from device';
          showAttachmentPreview(`File ready: ${fileName}`, 'btnUploadFile');
        });

        audioInput?.addEventListener('change', () => {
          const file = audioInput.files?.[0];
          if (!file) {
            return;
          }

          const fileName = file.name || 'Audio from device';
          showAttachmentPreview(`Audio ready: ${fileName}`, 'btnUploadAudio');
        });

        galleryClose?.addEventListener('click', (event) => {
          event.preventDefault();
          closeGalleryModal();
        });

        galleryDone?.addEventListener('click', (event) => {
          event.preventDefault();
          closeGalleryModal();
        });

        galleryPanel?.addEventListener('click', (event) => {
          if (event.target === galleryPanel) {
            event.preventDefault();
            closeGalleryModal();
          }
        });

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && galleryPanel && !galleryPanel.hidden) {
            event.preventDefault();
            closeGalleryModal();
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
          openGalleryModal();
        });

        const syncGallerySelectionPreview = () => {
          const selected = getSelectedGalleryItems();
          updateGallerySelectionCount();
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

        galleryPanel?.querySelectorAll('.composer-gallery-item').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            if (event.target.closest('.js-composer-gallery-view')) {
              return;
            }
            button.classList.toggle('is-selected');
            syncGallerySelectionPreview();
          });
        });

      attachmentPreviewClear?.addEventListener('click', (event) => {
        event.preventDefault();
        clearAttachmentPreviewState();
      });

        if (voice && CHAT_COMPOSER_CONFIG.voiceMessagesEnabled) {
          voice.addEventListener('click', (event) => {
            event.preventDefault();
            voice.classList.toggle('is-recording');
            voice.title = voice.classList.contains('is-recording')
              ? 'Stop voice recording'
              : 'Record voice message';
          });
        }

        updateGallerySelectionCount();
        sync();
      }

  function bindQuickFilters() {
      const root = document.querySelector('#admin-agent-chat');
      if (!root || root.dataset.quickFiltersBound === '1') {
        return;
      }
      root.dataset.quickFiltersBound = '1';

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
        const isMobileViewport = window.innerWidth <= CHAT_LAYOUT_BREAKPOINTS.mobileViewportMaxPx;
        const viewportPad = isMobileViewport
          ? CHAT_FLOATING_UI.filterMenuMobilePaddingPx
          : CHAT_FLOATING_UI.filterMenuDesktopPaddingPx;
        const availableWidth = Math.max(
          CHAT_FLOATING_UI.filterMenuMinWidthPx,
          window.innerWidth - (viewportPad * 2)
        );
        const width = Math.min(menu.offsetWidth || CHAT_FLOATING_UI.filterMenuFallbackWidthPx, availableWidth);
        const spaceBelow = window.innerHeight - rect.bottom - viewportPad - CHAT_FLOATING_UI.popupGapPx;
        const spaceAbove = rect.top - viewportPad - CHAT_FLOATING_UI.popupGapPx;
        const naturalHeight = menu.scrollHeight
          || menu.offsetHeight
          || CHAT_FLOATING_UI.filterMenuFallbackHeightPx;
        const shouldOpenAbove = spaceBelow < naturalHeight && spaceAbove > spaceBelow;
        const preferredLeft = isMobileViewport ? rect.right - width : rect.left;
        const left = Math.max(viewportPad, Math.min(window.innerWidth - width - viewportPad, preferredLeft));
        const top = shouldOpenAbove
          ? Math.max(viewportPad, rect.top - naturalHeight - CHAT_FLOATING_UI.popupGapPx)
          : Math.max(
            viewportPad,
            Math.min(
              rect.bottom + CHAT_FLOATING_UI.popupGapPx,
              window.innerHeight - naturalHeight - viewportPad
            )
          );

        menu.style.position = 'fixed';
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.style.right = 'auto';
        menu.style.width = `${width}px`;
        menu.style.maxHeight = 'none';
        menu.style.overflow = 'visible';
      };
      const closeMenu = () => {
        pop.classList.remove('open');
        if (menu) {
          menu.removeAttribute('style');
        }
      };
      const inputs = Array.from(pop.querySelectorAll('input[type="checkbox"]'));
      const labels = Array.from(pop.querySelectorAll('.filter-choice'));

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
        syncState();
        root.dataset.queuePendingFilterZone = inputs.some((item) => item.checked) ? 'quick_filters' : 'none';
      });
    });

    pop.querySelector('.js-qf-reset')?.addEventListener('click', (event) => {
      event.preventDefault();
      delete root.dataset.queuePendingFilterZone;
      resetQueueFilterZones(root, 'none');
      syncState();
      runQueueStateUpdate(root, 'quick_filters_reset', 'none');
    });

    pop.querySelector('.js-qf-apply')?.addEventListener('click', (event) => {
      event.preventDefault();
      resetQueueFilterZones(root, 'quick_filters');
      syncState();
      delete root.dataset.queuePendingFilterZone;
      runQueueStateUpdate(root, 'quick_filters_apply', inputs.some((item) => item.checked) ? 'quick_filters' : 'none');
      closeMenu();
    });

    syncState();
  }

  function bindQueueUserSelect() {
    const root = document.querySelector('#admin-agent-chat');
    if (!root || root.dataset.queueSearchableSelectsBound === '1') {
      return;
    }

    root.dataset.queueSearchableSelectsBound = '1';
    const configs = [
      {
        boxSelector: '.queue-user-select',
        inputSelector: '.js-queue-user-input',
        clearSelector: '.js-queue-user-clear',
        zone: 'user_select',
        idKey: 'userId',
        selectedDatasetKey: 'selectedUserId',
        changedBy: 'user_select',
        clearChangedBy: 'user_select_clear',
      },
      {
        boxSelector: '.queue-expert-select',
        inputSelector: '.js-queue-expert-input',
        clearSelector: '.js-queue-expert-clear',
        zone: 'expert_select',
        idKey: 'expertId',
        selectedDatasetKey: 'selectedExpertId',
        changedBy: 'expert_select',
        clearChangedBy: 'expert_select_clear',
      },
    ];

    configs.forEach((config) => {
      const box = root.querySelector(config.boxSelector);
      const input = box?.querySelector(config.inputSelector);
      const clearButton = box?.querySelector(config.clearSelector);
      const options = box ? Array.from(box.querySelectorAll('.searchable-selectbox-option')) : [];
      const empty = box?.querySelector('.searchable-selectbox-empty');
      if (!box || !input || !options.length) {
        return;
      }

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
        box.classList.toggle('has-selected-value', !!input.dataset[config.selectedDatasetKey]);
        let visibleCount = 0;
        options.forEach((option) => {
          const optionId = option.dataset[config.idKey] || '';
          const text = `${option.textContent} ${option.dataset.value || ''} ${option.dataset.code || ''} ${optionId}`.trim().toLowerCase();
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
        runQueueStateUpdate(root, config.clearChangedBy, 'none');
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
          resetQueueFilterZones(root, config.zone);
          input.value = option.dataset.value || '';
          input.dataset[config.selectedDatasetKey] = option.dataset[config.idKey] || '';
          box.dataset[config.selectedDatasetKey] = option.dataset[config.idKey] || '';
          option.classList.add('is-active');
          box.classList.add('is-filled', 'has-selected-value');
          filter();
          runQueueStateUpdate(root, config.changedBy, config.zone);
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
        syncQueuePaneHeadState(root);
        runQueueStateUpdate(root, 'quick_preset', 'quick_preset');
      });
    });
    syncQueuePaneHeadState(root);
  }

  function syncQueuePaneHeadState(root = document.querySelector('#admin-agent-chat')) {
    const paneHead = root?.querySelector('.pane-left .pane-head');
    if (!paneHead) {
      return;
    }

    const activeTab = root.querySelector('.js-queue-tab.active')?.dataset.tab || 'chats';
    const normalizedTab = ['chats', 'pings', 'rejects'].includes(activeTab) ? activeTab : 'chats';
    paneHead.dataset.queueTab = normalizedTab;
    paneHead.classList.remove('is-tab-chats', 'is-tab-pings', 'is-tab-rejects');
    paneHead.classList.add(`is-tab-${normalizedTab}`);
  }

  function getActiveConversationItem(root) {
    return root?.querySelector('.conv-list .conv-item.active, .conv-list .list-group-item.active') || null;
  }

  function getConversationState(item, stateName) {
    if (!item || !stateName) {
      return false;
    }

    const datasetKey = stateName === 'favorite' ? 'isFavorite' : 'isPinned';
    if (item.dataset[datasetKey] === 'true') {
      return true;
    }
    if (item.dataset[datasetKey] === 'false') {
      return false;
    }

    return stateName === 'favorite'
      ? item.classList.contains('is-favorite-conversation')
      : item.classList.contains('is-pinned-conversation') || !!item.querySelector('.conv-pin:not([hidden])');
  }

  function setConversationStateUi(root, stateName, enabled, item = getActiveConversationItem(root)) {
    if (!root || !stateName) {
      return;
    }

    const normalizedEnabled = Boolean(enabled);
    const datasetKey = stateName === 'favorite' ? 'isFavorite' : 'isPinned';
    const rootDatasetKey = stateName === 'favorite' ? 'conversationFavorite' : 'conversationPinned';
    root.dataset[rootDatasetKey] = normalizedEnabled ? 'true' : 'false';

    if (item) {
      item.dataset[datasetKey] = normalizedEnabled ? 'true' : 'false';
      item.classList.toggle(`is-${stateName}-conversation`, normalizedEnabled);
      if (stateName === 'favorite') {
        const people = item.querySelector('.conv-people-overlap');
        let favorite = item.querySelector('.conv-favorite');
        if (favorite && people && favorite.parentElement !== people) {
          favorite.classList.add('conv-favorite-inline');
          people.appendChild(favorite);
        }
        if (normalizedEnabled && !favorite && people) {
          favorite = document.createElement('span');
          favorite.className = 'conv-favorite conv-favorite-inline';
          favorite.title = 'Favorite chat';
          favorite.setAttribute('aria-label', 'Favorite chat');
          favorite.innerHTML = '<i class="fa fa-star"></i>';
          people.appendChild(favorite);
        }
        if (favorite) {
          favorite.hidden = !normalizedEnabled;
          favorite.classList.toggle('is-hidden', !normalizedEnabled);
        }
      }
      if (stateName === 'pinned') {
        const tools = item.querySelector('.conv-tools');
        let pin = item.querySelector('.conv-pin');
        if (normalizedEnabled && !pin && tools) {
          pin = document.createElement('span');
          pin.className = 'conv-pin';
          pin.innerHTML = '<i class="fa fa-thumb-tack"></i>';
          tools.insertBefore(pin, tools.firstChild);
        }
        if (pin) {
          pin.hidden = !normalizedEnabled;
          pin.classList.toggle('is-hidden', !normalizedEnabled);
        }
      }
    }

    const stateIcon = root.querySelector(`[data-conversation-state-icon="${stateName}"]`);
    if (stateIcon) {
      stateIcon.classList.toggle('is-on', normalizedEnabled);
      stateIcon.setAttribute('aria-hidden', normalizedEnabled ? 'false' : 'true');
    }

    const menuItem = root.querySelector(`.js-toggle-conversation-state[data-conversation-state="${stateName}"]`);
    const menuIcon = menuItem?.querySelector('.fa');
    if (menuItem) {
      menuItem.classList.toggle('is-active', normalizedEnabled);
      menuItem.setAttribute('aria-pressed', normalizedEnabled ? 'true' : 'false');
    }
    if (menuIcon && stateName === 'favorite') {
      menuIcon.classList.toggle('fa-star', normalizedEnabled);
      menuIcon.classList.toggle('fa-star-o', !normalizedEnabled);
    }
  }

  function requestConversationStateToggle(root, stateName, enabled) {
    const payload = {
      conversation_id: root.dataset.conversationId || getActiveConversationItem(root)?.dataset.conversationId || '',
      state: stateName,
      enabled: Boolean(enabled),
      changed_by: root.dataset.agentId || root.dataset.userId || '',
      changed_from: 'chat_action_menu',
      changed_at: new Date().toISOString(),
    };

    /*
    // Real API integration point.
    // The server should persist conversation-level flags and return the saved state.
    return fetch(CHAT_API_ENDPOINTS.conversationState, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Conversation state update failed');
      }
      return response.json();
    });
    */

    return window.Promise.resolve({ ok: true, conversation_state: payload });
  }

  function bindConversationStateToggles() {
    const root = document.querySelector('#admin-agent-chat');
    const buttons = root ? Array.from(root.querySelectorAll('.js-toggle-conversation-state')) : [];
    if (!root || !buttons.length || root.dataset.conversationStateTogglesBound === '1') {
      return;
    }

    root.dataset.conversationStateTogglesBound = '1';
    const activeItem = getActiveConversationItem(root);
    ['favorite', 'pinned'].forEach((stateName) => {
      setConversationStateUi(root, stateName, getConversationState(activeItem, stateName), activeItem);
    });

    buttons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const stateName = button.dataset.conversationState;
        if (!['favorite', 'pinned'].includes(stateName)) {
          return;
        }

        const item = getActiveConversationItem(root);
        const previous = getConversationState(item, stateName);
        const next = !previous;
        setConversationStateUi(root, stateName, next, item);
        requestConversationStateToggle(root, stateName, next)
          .then((response) => {
            const saved = response?.conversation_state;
            if (saved && typeof saved.enabled === 'boolean') {
              setConversationStateUi(root, stateName, saved.enabled, item);
            }
          })
          .catch(() => {
            setConversationStateUi(root, stateName, previous, item);
          });
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
      const leadType = item.dataset.leadType || 'chats';
      const badgeCodes = getQueueBadgeCodesForZone(
        Array.from(item.querySelectorAll('.conv-line-labels .conv-pill')).map((label) => label.dataset.badgeCode || label.dataset.badge || label.textContent.trim()),
        leadType,
        'left'
      );
      const centerBadgeCodes = getQueueBadgeCodesForZone(
        String(item.dataset.centerBadgeCodes || item.dataset.centerBadges || '').split(','),
        leadType,
        'center'
      );
      const rightBadgeCodes = getQueueBadgeCodesForZone(
        String(item.dataset.rightBadgeCodes || item.dataset.rightBadges || '').split(','),
        leadType,
        'right'
      );
      const labels = getQueueBadgeLabels(badgeCodes);
      const centerLabels = getQueueBadgeLabels(centerBadgeCodes);
      const rightLabels = getQueueBadgeLabels(rightBadgeCodes);
      const unread = item.querySelector('.conv-unread')?.textContent.trim() || '0';
      const favorite = getConversationState(item, 'favorite');
      const pinned = getConversationState(item, 'pinned');

      return {
        conversation_id: item.dataset.conversationId || '',
        lead_type: leadType,
        sender_user_id: item.dataset.senderUserId || '',
        sender_name: item.dataset.senderName || '',
        sender_avatar: item.dataset.senderAvatar || '',
        recipient_user_id: item.dataset.recipientUserId || '',
        recipient_name: item.dataset.recipientName || '',
        recipient_avatar: item.dataset.recipientAvatar || '',
        display_contact_name: item.dataset.displayContactName || item.dataset.senderName || '',
        is_online: item.querySelector('.conv-people-overlap')?.classList.contains('has-online-contact') || false,
        unread_count: Number(unread) || 0,
        is_favorite: favorite,
        is_pinned: pinned,
        labels,
        badge_codes: badgeCodes,
        center_labels: centerLabels,
        center_badge_codes: centerBadgeCodes,
        right_labels: rightLabels,
        right_badge_codes: rightBadgeCodes,
        profile_language: item.dataset.profileLanguage || root.dataset.profileLanguage || CHAT_PAGE_CONFIG.profileLanguage || CHAT_TRANSLATION_TARGET_LANG,
        translation_source_lang: item.dataset.translationSourceLang || root.dataset.translationSourceLang || CHAT_TRANSLATION_DEFAULT_SOURCE_LANG,
        translation_target_lang: item.dataset.translationTargetLang || root.dataset.translationTargetLang || CHAT_TRANSLATION_TARGET_LANG,
        last_message_preview: item.querySelector('.conv-snippet')?.textContent.trim() || '',
        last_message_time: item.querySelector('.conv-time')?.textContent.trim() || '',
      };
    };

    const buildDemoRightContext = (payload) => {
      const allLabels = [
        ...(payload.labels || []),
        ...(payload.center_labels || []),
        ...(payload.right_labels || []),
      ];
      const hasLabel = (label) => allLabels.includes(label);
      const leadType = payload.lead_type || payload.leadType || 'chats';
      const isPaid = hasLabel('Paid') || hasLabel('Live');
      const isRisk = hasLabel('Risk');
      const isReply = hasLabel('Reply');
      const localTime = payload.last_message_time || '10:29 AM';
      const timezone = leadType === 'pings' ? 'UTC+1' : 'UTC-4';
      const location = leadType === 'pings' ? 'London' : 'New York';
      const status = leadType === 'rejects'
        ? 'rejected'
        : (isReply ? 'needs_reply' : (hasLabel('Await') ? 'awaiting_client' : leadType));
      const rightLabels = Array.isArray(payload.right_labels) ? payload.right_labels : [];
      const rightBadgeCodes = getQueueBadgeCodesForZone(
        Array.isArray(payload.right_badge_codes) && payload.right_badge_codes.length ? payload.right_badge_codes : rightLabels,
        leadType,
        'right'
      );
      const rightBadges = rightBadgeCodes.map((code) => {
        const definition = CHAT_BADGE_BY_CODE.get(code);
        return {
          code,
          label: definition?.label || code,
          scenario: definition?.scenario || leadType,
          role: definition?.role || 'context',
          priority: definition?.priority ?? 999,
        };
      });
      const clientName = payload.display_contact_name || payload.sender_name || 'Client';
      const clientFirstName = clientName.split(' ')[0] || 'Client';
      const clientLastName = clientName.split(' ').slice(1).join(' ') || 'unknown';
      // The queue recipient is the expert/operator, not the client's partner.
      // Demo partner data stays unknown until the backend supplies a real partner section.
      const partnerName = 'unknown';
      const partnerFirstName = 'unknown';
      const partnerLastName = 'unknown';
      const riskText = isRisk
        ? 'Safe wording required: avoid pressure, guarantees, and overly specific promises.'
        : 'Standard guardrails apply for this conversation.';

      return {
        apply_sections: ['profile', 'summary', 'personal', 'partner', 'support', 'restrictions', 'pay', 'follow', 'notes', 'quality', 'ai'],
        profile: {
          name: clientName,
          avatar: payload.sender_avatar || QUEUE_CLIENT_AVATAR,
          user_id: payload.sender_user_id || '',
          subline: `id:${payload.sender_user_id || 'unknown'} · ${timezone} · ${localTime} · ${location}`,
        },
        summary: {
          registration: leadType === 'pings' ? '24 Apr 2026' : '14 Feb 2026',
          last_active: payload.last_message_time || 'today',
          paid: isPaid ? 'Yes' : 'No',
          paid_sessions: isPaid ? '1 session' : '0 sessions',
          topic: leadType === 'pings' ? 'Pre-chat interest' : (leadType === 'rejects' ? 'Rejected lead' : 'Relationship'),
          device: payload.is_online ? 'Web · online' : 'Web',
        },
        badges: rightBadges,
        personal: {
          fields: [
            { key: 'first_name', label: 'First name', value: clientFirstName, input_value: clientFirstName },
            { key: 'last_name', label: 'Last name', value: clientLastName, input_value: clientLastName === 'unknown' ? '' : clientLastName },
            { key: 'date_of_birth', label: 'Date of birth', value: leadType === 'pings' ? 'unknown' : '01 Dec 2003', input_value: leadType === 'pings' ? '' : '2003-12-01' },
            { key: 'birth_time', label: 'Birth time', value: 'unknown', input_value: '' },
            { key: 'birth_timezone', label: 'Birth timezone', value: 'unknown', input_value: '' },
            { key: 'birth_location', label: 'Birth location', value: location, input_value: location },
          ],
          meta: 'editable',
        },
        partner: {
          fields: [
            { key: 'first_name', label: 'First name', value: partnerFirstName, input_value: partnerFirstName === 'unknown' ? '' : partnerFirstName },
            { key: 'last_name', label: 'Last name', value: partnerLastName, input_value: partnerLastName === 'unknown' ? '' : partnerLastName },
            { key: 'date_of_birth', label: 'Date of birth', value: 'unknown', input_value: '' },
            { key: 'birth_time', label: 'Birth time', value: 'unknown', input_value: '' },
            { key: 'birth_timezone', label: 'Birth timezone', value: 'unknown', input_value: '' },
            { key: 'birth_location', label: 'Birth location', value: 'unknown', input_value: '' },
          ],
          meta: partnerName === 'unknown' ? 'needs data' : 'editable',
        },
        support: {
          conversation_id: payload.conversation_id || '',
          user_id: payload.sender_user_id ? `U-${payload.sender_user_id}` : 'U-unknown',
          assigned: payload.recipient_name || 'admin',
          status,
          unread: String(payload.unread_count || 0),
          payment_method: isPaid ? 'STRIPE' : 'none',
        },
        restrictions: isRisk
          ? ['No guarantees', 'No pressure', 'No legal/health', 'No external links']
          : ['No guarantees', 'No legal/health', 'No external links'],
        pay: {
          balance: isPaid ? '50 credits' : '0 credits',
          status: hasLabel('Live') ? 'Live paid' : (isPaid ? 'Paid history' : 'Not paid'),
          ltv: isPaid ? '$124' : '$0',
          coupons: hasLabel('Coupon') ? '1 requested' : '0 available',
          events: [
            { icon: 'check', title: isPaid ? 'Payment context loaded' : 'No payment yet', meta: isPaid ? `${payload.last_message_time || 'today'}, Stripe context` : 'show soft conversion only' },
            { icon: hasLabel('Coupon') ? 'ticket' : 'clock-o', title: hasLabel('Coupon') ? 'Coupon requested' : 'Next billing step', meta: hasLabel('Coupon') ? 'verify eligibility before sending' : 'offer only when context is warm' },
          ],
        },
        follow: {
          next_touch: hasLabel('Await') ? 'After client reply' : 'Today 21:00',
          limit: hasLabel('Revive') ? '2 of 3' : '1 of 3',
          reason: hasLabel('Revive') ? 'Revive' : (hasLabel('Await') ? 'Await client' : (hasLabel('Risk') ? 'Risk guard' : 'Normal follow-up')),
          channel: leadType === 'pings' ? 'Ping + chat' : 'Push + chat',
          soft_touch: hasLabel('Revive')
            ? 'Можно мягко вернуть клиента к прошлому контексту без давления и без повторного объяснения.'
            : 'Я сохранила ваш контекст. Если захотите продолжить разбор, можно вернуться к этому диалогу без повторного объяснения ситуации.',
        },
        notes: [
          { author: 'admin', meta: status === 'rejected' ? 'audit' : 'pinned', text: status === 'rejected' ? 'Keep this lead only for audit history.' : `Current context belongs to ${clientName}.` },
          { author: 'moderator_ira', meta: 'today', text: isRisk ? riskText : 'Warm client, likes short and clear replies.' },
        ],
        quality: {
          translation_direction: {
            source_lang: payload.translation_source_lang || CHAT_TRANSLATION_DEFAULT_SOURCE_LANG,
            target_lang: payload.translation_target_lang || CHAT_TRANSLATION_TARGET_LANG,
            updated_by: 'admin',
            updated_at: 'demo',
          },
          checks: [
            { state: 'ok', icon: 'check', title: 'Tone', text: 'empathic, no pressure' },
            { state: isPaid ? 'ok' : 'warn', icon: isPaid ? 'check' : 'exclamation', title: 'Monetization', text: isPaid ? 'paid context is available' : 'do not give full reading before payment' },
            { state: isRisk ? 'risk' : 'ok', icon: 'shield', title: 'Policy', text: riskText },
            { state: isReply ? 'warn' : 'ok', icon: 'clock-o', title: 'SLA', text: isReply ? 'reply needed now' : 'normal response window' },
          ],
          supervisor_note: isRisk
            ? 'Use conservative wording and keep the next step simple.'
            : 'Good contact quality. Keep the answer concise and practical.',
        },
        ai: {
          client: `${clientName} · ${leadType}`,
          topic: leadType === 'pings' ? 'Pre-chat interest' : (leadType === 'rejects' ? 'Rejected lead' : 'Relationship and booking'),
          money: isPaid ? 'Live paid session · 50 credits' : 'No active payment',
          state: `${status} · ${payload.last_message_time || 'no recent time'}`,
          recommendation: isRisk
            ? 'Use a soft, safe reply. Avoid pressure and strong promises.'
            : (leadType === 'pings' ? 'Use a short first touch and move only if the client reacts.' : 'Answer briefly, keep context, then choose the next paid step.'),
          next_best_actions: [
            isRisk ? 'Use safe wording and avoid guarantees.' : 'Answer shortly and acknowledge the request.',
            isPaid ? 'Confirm the next paid-session step.' : 'Do not provide a full reading before payment.',
            leadType === 'pings' ? 'Move only if the client reacts.' : 'Ask only one clarification if needed.',
          ],
          draft: isRisk
            ? 'Я рядом. Отвечу аккуратно и без обещаний результата: сначала уточним ключевой момент, затем выберем безопасный следующий шаг.'
            : 'Я рядом. Подтвердите, пожалуйста, удобное время, и я предложу следующий понятный шаг.',
          loss_risk: isRisk ? '72%' : (isReply ? '48%' : '24%'),
          loss_note: isRisk ? 'High-risk wording and waiting time require a careful reply.' : 'No critical risk, but keep the answer timely.',
        },
      };
    };

    const requestConversationSwitch = (payload) => {
      /*
      // Real API integration point.
      // Expected server response can include: conversation, messages_html/messages_json,
      // right_context_html/context_json, pinned_messages, billing/session state.
      return fetch(CHAT_API_ENDPOINTS.conversation(payload.conversation_id), {
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
        context_json: buildDemoRightContext(payload),
        messages_html: null,
      });
    };

    const getContextRowLabel = (row) => {
      const labelNode = row?.querySelector('span');
      if (!labelNode) {
        return '';
      }
      const clone = labelNode.cloneNode(true);
      clone.querySelectorAll('.context-current-value').forEach((node) => node.remove());
      return clone.textContent.trim();
    };

    const updateContextKpi = (container, label, value, inputValue = value) => {
      const row = Array.from(container?.querySelectorAll('.context-kpi, .context-data-row, .context-line, .context-summary-list > div') || [])
        .find((item) => getContextRowLabel(item) === label);
      const strong = row?.querySelector('strong');
      if (strong) {
        strong.textContent = value;
      }
      const input = row?.querySelector('input');
      if (input) {
        input.value = inputValue === 'unknown' ? '' : (inputValue || '');
        input.dataset.savedValue = input.value;
        const currentValue = row.querySelector('.context-current-value');
        if (currentValue) {
          currentValue.textContent = input.dataset.savedValue || 'unknown';
        }
      }
    };

    const getContextChipClass = (badge) => {
      if (['Paid', 'Live', 'Safe'].includes(badge)) return 'context-chip is-paid';
      if (['Risk', 'Skeptic', 'Trial', 'Coupon', 'PP'].includes(badge)) return 'context-chip is-warn';
      return 'context-chip';
    };

    const shouldApplyContextSection = (context, sectionName) => {
      const list = Array.isArray(context.apply_sections) ? context.apply_sections : null;
      if (!list) {
        return Object.prototype.hasOwnProperty.call(context, sectionName);
      }
      return list.includes(sectionName);
    };

    const getContextAccordionItem = (title) => Array.from(root.querySelectorAll('#tab-client .context-accordion-item'))
      .find((item) => {
        const text = item.querySelector('.context-accordion-head > span')?.textContent.trim().toLowerCase();
        return text === title.toLowerCase();
      });

    const updateContextAccordionMeta = (item, value) => {
      const meta = item?.querySelector('.context-accordion-meta');
      const disclosureIcon = meta?.querySelector('.context-disclosure-icon');
      if (!meta || !value) {
        return;
      }
      Array.from(meta.childNodes).forEach((node) => {
        if (node !== disclosureIcon) {
          node.remove();
        }
      });
      const title = item.querySelector('.context-accordion-head > span')?.textContent.trim().toLowerCase();
      if (title === 'personal data' || title === 'partner') {
        return;
      }
      meta.insertBefore(document.createTextNode(`${value} `), disclosureIcon || null);
    };

    const applyContextFields = (item, fields = []) => {
      const grid = item?.querySelector('.context-data-grid');
      if (!grid || !Array.isArray(fields)) {
        return;
      }
      fields.forEach((field) => {
        updateContextKpi(grid, field.label, field.value || 'unknown', field.input_value ?? field.value ?? '');
      });
    };

    const renderContextChips = (host, chips = []) => {
      if (!host || !Array.isArray(chips)) {
        return;
      }
      host.innerHTML = chips.map((chip) => {
        const label = typeof chip === 'string' ? chip : chip.label;
        const className = typeof chip === 'string' ? getContextChipClass(chip) : (chip.class_name || getContextChipClass(label));
        const badgeCode = typeof chip === 'string' ? '' : (chip.code || chip.badge_code || '');
        const definition = CHAT_BADGE_BY_CODE.get(badgeCode);
        const toneClass = getBadgeToneClass(definition);
        const scenario = definition?.scenario || (typeof chip === 'string' ? '' : chip.scenario || '');
        const role = definition?.role || (typeof chip === 'string' ? '' : chip.role || '');
        const priority = definition?.priority ?? (typeof chip === 'string' ? '' : chip.priority ?? '');
        return `<span class="${className}${toneClass ? ` ${toneClass}` : ''}" data-badge="${queueEscapeHtml(label)}"${badgeCode ? ` data-badge-code="${queueEscapeHtml(badgeCode)}"` : ''}${scenario ? ` data-badge-scenario="${queueEscapeHtml(scenario)}"` : ''}${role ? ` data-badge-role="${queueEscapeHtml(role)}"` : ''}${priority !== '' ? ` data-badge-priority="${queueEscapeHtml(priority)}"` : ''} data-badge-zone="right">${queueEscapeHtml(label)}</span>`;
      }).join('');
    };

    const renderPaymentEvents = (pane, events = []) => {
      const section = Array.from(pane?.querySelectorAll('.context-section') || [])
        .find((node) => node.querySelector('.context-section-title')?.textContent.trim().startsWith('Payment events'));
      if (!section || !Array.isArray(events)) {
        return;
      }
      section.querySelectorAll('.context-timeline-row').forEach((row) => row.remove());
      events.forEach((event) => {
        const row = document.createElement('div');
        row.className = 'context-timeline-row';
        row.innerHTML = `<i class="fa fa-${queueEscapeHtml(event.icon || 'check')}"></i><span><strong>${queueEscapeHtml(event.title || '')}</strong><small>${queueEscapeHtml(event.meta || '')}</small></span>`;
        section.appendChild(row);
      });
    };

    const renderNotes = (notes = []) => {
      const notesSection = root.querySelector('#tab-notes .context-section');
      const textarea = notesSection?.querySelector('textarea');
      const actions = notesSection?.querySelector('.context-note-actions');
      if (!notesSection || !Array.isArray(notes)) {
        return;
      }
      notesSection.querySelectorAll('.context-note-item').forEach((item) => item.remove());
      notes.forEach((note) => {
        const item = document.createElement('div');
        item.className = `context-note-item${note.pinned || note.meta === 'pinned' ? ' is-pinned' : ''}`;
        item.dataset.noteId = note.id || '';
        item.innerHTML = `<small>${queueEscapeHtml(note.author || 'system')} · ${queueEscapeHtml(note.meta || 'note')}</small><span>${queueEscapeHtml(note.text || '')}</span>`;
        notesSection.insertBefore(item, textarea || actions || null);
      });
    };

    const renderQuality = (quality = {}) => {
      const pane = root.querySelector('#tab-quality');
      const firstSection = pane?.querySelector('.context-quality-checks');
      if (!pane || !firstSection) {
        return;
      }
      renderQualityTranslationDirection(quality.translation_direction || {});
      if (!Array.isArray(quality.checks)) {
        return;
      }
      firstSection.querySelectorAll('.context-checkline').forEach((line) => line.remove());
      quality.checks.forEach((check) => {
        const line = document.createElement('div');
        line.className = `context-checkline${check.state === 'warn' ? ' is-warn' : ''}${check.state === 'risk' ? ' is-risk' : ''}`;
        line.innerHTML = `<i class="fa fa-${queueEscapeHtml(check.icon || 'check')}"></i><span><strong>${queueEscapeHtml(check.title || 'Check')}:</strong> ${queueEscapeHtml(check.text || '')}</span>`;
        firstSection.appendChild(line);
      });
      const supervisor = pane.querySelector('.context-note-card p');
      if (supervisor && quality.supervisor_note) {
        supervisor.textContent = quality.supervisor_note;
      }
    };

    const renderAiContext = (ai = {}) => {
      const pane = root.querySelector('#tab-ai');
      if (!pane) {
        return;
      }
      const summary = pane.querySelector('.context-summary-list');
      if (summary) {
        updateContextKpi(summary, 'Client', ai.client || '');
        updateContextKpi(summary, 'Topic', ai.topic || 'unknown');
        updateContextKpi(summary, 'Money', ai.money || 'unknown');
        updateContextKpi(summary, 'State', ai.state || '');
      }
      const list = pane.querySelector('.context-ai-next-list');
      if (list && Array.isArray(ai.next_best_actions)) {
        list.innerHTML = ai.next_best_actions.map((item) => `<li>${queueEscapeHtml(item)}</li>`).join('');
      }
      pane.dataset.aiDraft = ai.draft || '';
      const draftText = pane.querySelector('.context-ai-draft-text');
      if (draftText) {
        draftText.textContent = ai.draft || 'No safe draft is available for this conversation.';
      }
      const riskValue = pane.querySelector('.context-risk-value');
      if (riskValue && ai.loss_risk) {
        riskValue.textContent = ai.loss_risk;
      }
      const riskNote = riskValue?.closest('.context-section')?.querySelector('.context-muted');
      if (riskNote && ai.loss_note) {
        riskNote.textContent = ai.loss_note;
      }
      const riskMeter = pane.querySelector('.context-risk-meter span');
      if (riskMeter && ai.loss_risk) {
        riskMeter.style.width = ai.loss_risk;
      }
      const riskSection = pane.querySelector('.context-ai-risk');
      const riskPercent = Number.parseFloat(ai.loss_risk || '0');
      if (riskSection) {
        riskSection.hidden = !Number.isFinite(riskPercent)
          || riskPercent < CHAT_AI_ASSISTANT_CONFIG.lossRiskVisibilityPercent;
      }
      pane.classList.remove('is-ai-stale');
      pane.querySelector('.context-ai-stale')?.setAttribute('hidden', '');
      pane.querySelector('.js-ai-summary-refresh')?.classList.remove('is-attention');
    };

    const applyRightContext = (payload, context) => {
      if (!context) {
        return;
      }

      const profileCard = root.querySelector('#tab-client .context-profile-card');
      const profile = context.profile || {};
      const profileLanguage = normalizeTranslationLang(
        profile.language || context.profile_language || payload.profile_language || CHAT_PAGE_CONFIG.profileLanguage || CHAT_TRANSLATION_TARGET_LANG,
        CHAT_TRANSLATION_TARGET_LANG
      );
      root.dataset.profileLanguage = profileLanguage === 'auto' ? CHAT_TRANSLATION_TARGET_LANG : profileLanguage;
      const avatar = profileCard?.querySelector('.context-avatar');
      const name = profileCard?.querySelector('.context-name');
      const subline = profileCard?.querySelector('.context-subline');
      const badgeStrip = profileCard?.querySelector('.context-profile-meta-strip');
      const summary = profileCard?.querySelector('.context-profile-summary');

      if (shouldApplyContextSection(context, 'profile') && avatar && profile.avatar) {
        avatar.src = profile.avatar;
        avatar.alt = profile.name || '';
      }
      if (shouldApplyContextSection(context, 'profile') && name) {
        name.textContent = profile.name || payload.display_contact_name || payload.sender_name || 'Client';
      }
      if (shouldApplyContextSection(context, 'profile') && subline) {
        subline.textContent = profile.subline || '';
      }
      if (shouldApplyContextSection(context, 'profile') && badgeStrip) {
        renderContextChips(badgeStrip, context.badges || []);
      }
      if (shouldApplyContextSection(context, 'summary') && summary) {
        const summaryData = context.summary || {};
        updateContextKpi(summary, 'Registration', summaryData.registration || 'unknown');
        updateContextKpi(summary, 'Last active', summaryData.last_active || 'unknown');
        updateContextKpi(summary, 'Paid', summaryData.paid || 'No');
        updateContextKpi(summary, 'Paid sessions', summaryData.paid_sessions || '0 sessions');
        updateContextKpi(summary, 'Topic', summaryData.topic || 'unknown');
        updateContextKpi(summary, 'Device', summaryData.device || 'unknown');
      }

      if (shouldApplyContextSection(context, 'personal') && context.personal) {
        const personalItem = getContextAccordionItem('Personal data');
        applyContextFields(personalItem, context.personal.fields);
        updateContextAccordionMeta(personalItem, context.personal.meta || 'editable');
      }

      if (shouldApplyContextSection(context, 'partner') && context.partner) {
        const partnerItem = getContextAccordionItem('Partner');
        applyContextFields(partnerItem, context.partner.fields);
        updateContextAccordionMeta(partnerItem, context.partner.meta || 'editable');
      }

      const support = root.querySelector('#tab-client .context-lines');
      if (shouldApplyContextSection(context, 'support') && support && context.support) {
        updateContextKpi(support, 'Conversation', context.support.conversation_id || payload.conversation_id || '');
        updateContextKpi(support, 'User', context.support.user_id || '');
        updateContextKpi(support, 'Assigned', context.support.assigned || '');
        updateContextKpi(support, 'Status', context.support.status || '');
        updateContextKpi(support, 'Unread', context.support.unread || '0');
        updateContextKpi(support, 'Payment method', context.support.payment_method || 'none');
      }

      if (shouldApplyContextSection(context, 'restrictions') && Array.isArray(context.restrictions)) {
        const restrictionsHost = Array.from(root.querySelectorAll('#tab-client .context-section'))
          .find((section) => section.querySelector('.context-section-title')?.textContent.trim() === 'Restrictions')
          ?.querySelector('.context-status-strip');
        renderContextChips(restrictionsHost, context.restrictions.map((label) => ({ label, class_name: label.toLowerCase().includes('no') ? 'context-chip is-warn' : 'context-chip' })));
      }

      const payPane = root.querySelector('#tab-pay');
      if (shouldApplyContextSection(context, 'pay') && payPane && context.pay) {
        updateContextKpi(payPane, 'Balance', context.pay.balance || '0 credits');
        updateContextKpi(payPane, 'Status', context.pay.status || 'Not paid');
        updateContextKpi(payPane, 'LTV', context.pay.ltv || '$0');
        updateContextKpi(payPane, 'Coupons', context.pay.coupons || '0 available');
        renderPaymentEvents(payPane, context.pay.events || []);
      }

      const followPane = root.querySelector('#tab-follow');
      if (shouldApplyContextSection(context, 'follow') && followPane && context.follow) {
        updateContextKpi(followPane, 'Next touch', context.follow.next_touch || 'unknown');
        updateContextKpi(followPane, 'Limit', context.follow.limit || '0 of 0');
        updateContextKpi(followPane, 'Reason', context.follow.reason || 'Normal follow-up');
        updateContextKpi(followPane, 'Channel', context.follow.channel || 'chat');
        const softTouch = followPane.querySelector('.context-note-card p');
        if (softTouch && context.follow.soft_touch) {
          softTouch.textContent = context.follow.soft_touch;
        }
      }

      if (shouldApplyContextSection(context, 'notes') && Array.isArray(context.notes)) {
        renderNotes(context.notes);
      }

      if (shouldApplyContextSection(context, 'quality') && context.quality) {
        renderQuality(context.quality);
      }

      if (shouldApplyContextSection(context, 'ai') && context.ai) {
        renderAiContext(context.ai);
      }

      syncRightContextMissingBadges(root);
    };

    const applyDemoConversationSwitch = (payload, context = null) => {
      root.dataset.conversationId = payload.conversation_id;

      const contactDuo = root.querySelector('.chat-identity .contact-duo');
      const avatars = contactDuo ? Array.from(contactDuo.querySelectorAll('.contact-avatar')) : [];
      const names = contactDuo ? Array.from(contactDuo.querySelectorAll('.contact-name')) : [];
      const expertName = payload.recipient_name || '';
      const expertAvatar = payload.recipient_avatar || '';
      const contactName = payload.sender_name || payload.display_contact_name || '';
      const contactAvatar = payload.sender_avatar || '';

      if (avatars[0] && expertAvatar) {
        avatars[0].src = expertAvatar;
        avatars[0].setAttribute('ng-src', expertAvatar);
      }
      if (avatars[1] && contactAvatar) {
        avatars[1].src = contactAvatar;
        avatars[1].setAttribute('ng-src', contactAvatar);
      }
      if (names[0]) {
        names[0].textContent = expertName;
        names[0].classList.remove('is-online');
      }
      if (names[1]) {
        names[1].textContent = contactName;
        names[1].classList.toggle('is-online', payload.is_online);
      }
      avatars[1]?.closest('.contact-avatar-shell')?.classList.toggle('is-online', payload.is_online);

      const meta = root.querySelector('.contact-subline.dialog-meta');
      if (meta) {
        const labelsHost = meta.querySelector('.dialog-meta-labels') || meta;
        const chips = Array.from(labelsHost.querySelectorAll('.dialog-chip'));
        chips.forEach((chip) => chip.remove());
        const centerBadgeCodes = getQueueBadgeCodesForZone(
          Array.isArray(payload.center_badge_codes) && payload.center_badge_codes.length ? payload.center_badge_codes : payload.center_labels,
          payload.lead_type || 'chats',
          'center'
        );
        const anchor = labelsHost.firstElementChild;
        centerBadgeCodes.forEach((badgeCode) => {
          const definition = CHAT_BADGE_BY_CODE.get(badgeCode);
          if (!definition) {
            return;
          }
          const chip = document.createElement('span');
          chip.className = `dialog-chip dialog-chip-info ${getBadgeToneClass(definition)}`.trim();
          chip.dataset.badge = definition.label;
          chip.dataset.badgeCode = definition.code;
          chip.dataset.badgeScenario = definition.scenario;
          chip.dataset.badgeRole = definition.role;
          chip.dataset.badgePriority = String(definition.priority);
          chip.dataset.badgeZone = 'center';
          chip.textContent = definition.label;
          labelsHost.insertBefore(chip, anchor);
        });
      }

      const drawerTitle = root.querySelector('.pinned-drawer-sub');
      if (drawerTitle) {
        drawerTitle.textContent = `Important points in ${payload.display_contact_name || 'this conversation'}`;
      }
      setConversationStateUi(root, 'favorite', payload.is_favorite, getActiveConversationItem(root));
      setConversationStateUi(root, 'pinned', payload.is_pinned, getActiveConversationItem(root));
      applyRightContext(payload, context || buildDemoRightContext(payload));
    };

    const resetRightContextTransientState = () => {
      root.querySelectorAll('.context-accordion-body').forEach((body) => {
        body.classList.remove('is-edit-mode');
        body.querySelectorAll('.context-data-row').forEach((row) => {
          const input = row.querySelector('input');
          row.classList.remove('is-editing', 'is-dirty');
          if (input) {
            input.value = input.dataset.savedValue || '';
            input.readOnly = true;
          }
        });
        const edit = body.querySelector('.js-context-edit');
        const cancel = body.querySelector('.js-context-cancel');
        const save = body.querySelector('.js-context-save');
        if (edit) edit.hidden = false;
        if (cancel) cancel.hidden = true;
        if (save) {
          save.hidden = true;
          save.disabled = false;
        }
      });

      const noteInput = root.querySelector('#tab-notes textarea');
      if (noteInput) {
        noteInput.value = '';
      }
    };

    const applyConversationMessages = (response = {}) => {
      if (typeof response.messages_html !== 'string') {
        return;
      }
      const items = root.querySelector('#conversationItems') || root.querySelector('#conversationBody .items');
      if (!items) {
        return;
      }
      items.innerHTML = response.messages_html;
      syncOriginalFancyboxImages(items);
    };

    const applyConversationResponse = (response = {}, fallbackPayload = {}) => {
      const conversation = {
        ...fallbackPayload,
        ...(response.conversation || {}),
      };
      if (!conversation.conversation_id) {
        return;
      }

      const previousConversationId = root.dataset.conversationId || '';
      const conversationChanged = previousConversationId !== conversation.conversation_id;
      if (conversationChanged) {
        resetRightContextTransientState();
      }

      applyDemoConversationSwitch(
        conversation,
        response.context_json || buildDemoRightContext(conversation)
      );
      applyConversationMessages(response);

      if (Array.isArray(response.pinned_messages)) {
        root.dispatchEvent(new CustomEvent('agentchat:pinned-records-replaced', {
          detail: { records: response.pinned_messages },
        }));
      }

      if (conversationChanged) {
        root.dispatchEvent(new CustomEvent('agentchat:conversation-changed', {
          detail: {
            previous_conversation_id: previousConversationId,
            conversation_id: conversation.conversation_id,
          },
        }));
      }
    };

    const setActiveConversationItem = (nextItem) => {
      list.querySelectorAll('.conv-item, .list-group-item').forEach((item) => {
        const active = item === nextItem;
        item.classList.toggle('active', active);
        item.setAttribute('aria-current', active ? 'true' : 'false');
      });
    };

    root.addEventListener('agentchat:apply-conversation-response', (event) => {
      const detail = event.detail || {};
      applyConversationResponse(detail.response || {}, detail.fallback_conversation || {});
    });

    list.addEventListener('click', (event) => {
      const item = event.target.closest('.conv-item, .list-group-item');
      if (!item || !list.contains(item)) {
        return;
      }

      event.preventDefault();
      const payload = getConversationSwitchPayload(item);
      if (!payload.conversation_id) {
        return;
      }

      const previousConversationId = root.dataset.conversationId || '';
      if (previousConversationId !== payload.conversation_id) {
        root.dispatchEvent(new CustomEvent('agentchat:conversation-will-change', {
          detail: {
            previous_conversation_id: previousConversationId,
            conversation_id: payload.conversation_id,
          },
        }));
      }

      setActiveConversationItem(item);
      root.classList.add('is-switching-conversation');
      requestConversationSwitch(payload)
        .then((data) => {
          applyConversationResponse(data || {}, payload);
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
            searchInput.placeholder = 'Search';
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
            buttons[0].textContent = 'Chats';
            buttons[0].dataset.tab = 'chats';
            buttons[0].classList.add('active');
          }

          if (buttons[1]) {
            buttons[1].textContent = 'Pings';
            buttons[1].dataset.tab = 'pings';
            buttons[1].classList.remove('active');
          }

          if (buttons[2]) {
            buttons[2].textContent = 'Rejects';
            buttons[2].dataset.tab = 'rejects';
            buttons[2].classList.remove('active');
          } else if (!tabsRow.querySelector('[data-tab="rejects"]')) {
            const rejectsBtn = document.createElement('button');
            rejectsBtn.className = 'btn btn-default btn-sm js-queue-tab';
            rejectsBtn.dataset.tab = 'rejects';
            rejectsBtn.textContent = 'Rejects';
            tabsRow.appendChild(rejectsBtn);
          }
        }
        if (filtersRow) {
          filtersRow.classList.add('queue-filter-row');
        }
      }
    }
}

  function bindPaneScrollAffordances() {
    const root = document.querySelector('#admin-agent-chat');
    if (!root || root.dataset.paneScrollAffordancesBound === '1') {
      return;
    }

    root.dataset.paneScrollAffordancesBound = '1';

    const pairs = [
      {
        pane: root.querySelector('.pane-left'),
        scroller: root.querySelector('.pane-left .pane-scroll'),
      },
      {
        pane: root.querySelector('.pane-right'),
        scroller: root.querySelector('.pane-right .right-context-body') || root.querySelector('.pane-right .pane-body'),
      },
    ].filter((item) => item.pane && item.scroller);

    if (!pairs.length) {
      return;
    }

    const syncPair = ({ pane, scroller }) => {
      const hasScroll = scroller.scrollHeight > scroller.clientHeight + 1;
      const atBottom = !hasScroll
        || scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - CHAT_FLOATING_UI.scrollBottomTolerancePx;
      pane.classList.toggle('has-scroll-y', hasScroll);
      pane.classList.toggle('is-scroll-bottom', atBottom);
    };

    const syncAll = () => pairs.forEach(syncPair);
    let raf = 0;
    const requestSync = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        syncAll();
      });
    };

    pairs.forEach(({ pane, scroller }) => {
      scroller.addEventListener('scroll', requestSync, { passive: true });

      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(requestSync);
        resizeObserver.observe(pane);
        resizeObserver.observe(scroller);
      }

      if ('MutationObserver' in window) {
        const mutationObserver = new MutationObserver(requestSync);
        mutationObserver.observe(scroller, { childList: true, subtree: true, attributes: true });
      }
    });

    window.addEventListener('resize', requestSync);
    window.setTimeout(requestSync, CHAT_UI_TIMING.quickUiSettleMs);
  }

    document.addEventListener('DOMContentLoaded', () => {
      markAgentChatPage();
      bindQueueRefresh();
      bindBillingActions();
      bindConversationSearch();
      bindQuickFilters();
      bindQueueUserSelect();
      bindConversationSwitcher();
      bindConversationStateToggles();
      bindChatMoreMenu();
      bindChatBoundaryJump();
      bindChatReadableFontControls();
      bindDeleteChatModal();
      bindConversationReportModal();
      bindChatSearchToggle();
      bindMessageSafeActions();
      bindComposerVisualState();
      bindDateRangePickers();
      bindRightContextTabs();
      bindAiAssistant();
      bindRightPanelCollapse();
      bindLeftPanelCollapse();
      bindResponsiveChatLayout();
      bindOriginalFancyboxImages();
      bindRightContextProfile();
      bindContextNotes();
      bindFollowPostpone();
      bindQualityTranslationDirection();
      bindPinnedMessagesDrawer();
      bindPaidSessionTimelineEvents();
      syncBadgeToneClasses(root);
      enhanceQueue();
      bindQueueTabs();
      bindPaneScrollAffordances();
      runQueueStateUpdate(root, 'initial_load', 'quick_preset');
    });
  })();
