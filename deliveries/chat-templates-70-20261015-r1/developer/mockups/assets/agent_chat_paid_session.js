(() => {
  'use strict';

  // Central paid-session constants. Keep editable defaults here and override business values via #paidSessionConfig.
  const PAID_SESSION_TIME_CONSTANTS = Object.freeze({
    millisecondsPerSecond: 1000, // Number of milliseconds used when converting timestamps to seconds.
    secondsPerMinute: 60, // Number of seconds used by all paid-session minute calculations.
    timerRefreshMs: 1000, // Interval for refreshing visible countdown and elapsed-time labels.
    modalFocusDelayMs: 0, // Delay before focusing the first actionable field in an opened modal.
    controlPressEffectMs: 160, // Duration of the paid-session control press feedback.
    sessionStartSoundDurationMs: 280, // Duration of the gentle session-start confirmation tone.
    sessionStartSoundAttackMs: 18, // Fade-in time that prevents an audible click at tone start.
    offerAcceptedSoundDurationMs: 150, // Duration of the short consent-confirmation chime.
    offerAcceptedSoundAttackMs: 12, // Fade-in time for the consent-confirmation chime.
  });
  const PAID_SESSION_VALUE_CONSTANTS = Object.freeze({
    minimumVersion: 1, // Lowest valid optimistic-lock version accepted by the client state model.
    timerDigitCount: 2, // Minimum digit count used for minute and second timer segments.
  });
  const PAID_SESSION_DEMO_STATE = Object.freeze({
    version: 1, // Initial optimistic-lock version used only by the local demo transport.
    serviceId: 'paid_consultation_per_minute', // Stable backend identifier for the default paid consultation service.
    serviceVersion: '1', // Version of the default service definition sent with an offer.
    serviceLabel: 'Платная консультация', // Human-readable default service name rendered in the disabled selector.
    rateLabel: '10 credits/min', // Initial rate label used only when the server has not supplied one.
    balanceSignal: 'sufficient', // Initial demo balance state used before a server snapshot is loaded.
    trialAvailable: true, // Whether the local demo starts in trial mode before paid billing.
    expertReady: true, // Initial demo readiness flag for the current operator.
    clientReady: false, // Initial demo readiness flag for the client.
  });
  const PAID_SESSION_TRANSPORT_MODES = Object.freeze({
    ajax: 'ajax', // Production transport that sends requests to Yii2 endpoints.
    demo: 'demo', // Local-only transport that simulates backend transitions in the browser.
  });

  const PAID_SESSION_STATUSES = Object.freeze([
    'no_consent',
    'offer_pending',
    'ready',
    'connecting',
    'active',
    'paused',
    'reconnecting',
    'completed',
  ]); // Canonical backend states accepted by the paid-session renderer.
  const PAID_SESSION_BILLING_MODES = Object.freeze([
    'none',
    'trial',
    'paid',
  ]); // Billing mode is independent from the connection/session state.
  const PAID_SESSION_DEFAULTS = Object.freeze({
    offerTtlSeconds: 15 * PAID_SESSION_TIME_CONSTANTS.secondsPerMinute, // Maximum lifetime of a client offer.
    connectionTimeoutSeconds: 3 * PAID_SESSION_TIME_CONSTANTS.secondsPerMinute, // Maximum free connection/setup period.
    manualPauseSeconds: 5 * PAID_SESSION_TIME_CONSTANTS.secondsPerMinute, // Default operator pause window.
    reconnectGraceSeconds: PAID_SESSION_TIME_CONSTANTS.secondsPerMinute, // Technical reconnect grace period.
    requestLatencyMs: 320, // Demo-only simulated request latency.
    autoConsentMs: 2600, // Demo-only delay before simulated client consent.
    autoConnectMs: 2200, // Demo-only delay before simulated client and expert readiness.
    sessionButtonViewportInsetPx: 14, // Floating control spacing from the center pane edge.
    composerFallbackHeightPx: 86, // Positioning fallback before composer measurement.
    errorVisibilityMs: 4200, // Inline request error visibility duration.
    sessionStartSoundEnabled: true, // Whether the first transition into an active paid session plays a confirmation tone.
    sessionStartSoundVolume: 0.035, // Quiet Web Audio gain used for the session-start confirmation tone.
    sessionStartSoundFrequencyHz: 620, // Starting frequency of the session-start confirmation tone.
    sessionStartSoundEndFrequencyHz: 820, // Ending frequency of the session-start confirmation tone.
    offerAcceptedSoundEnabled: true, // Whether client consent commits play a short confirmation chime.
    offerAcceptedSoundVolume: 0.028, // Quiet Web Audio gain used for the consent-confirmation chime.
    offerAcceptedSoundFrequencyHz: 540, // Starting frequency of the consent-confirmation chime.
    offerAcceptedSoundEndFrequencyHz: 680, // Ending frequency of the consent-confirmation chime.
  });
  const PAID_SESSION_ENDPOINTS = Object.freeze({
    state: '/admin/paid-session/state', // Load canonical state for a conversation.
    offer: '/admin/paid-session/offer', // Create a consent offer.
    start: '/admin/paid-session/start', // Begin the free connection phase.
    pause: '/admin/paid-session/pause', // Pause an active session.
    resume: '/admin/paid-session/resume', // Begin connection after a pause.
    complete: '/admin/paid-session/complete', // Complete the session.
    topUp: '/admin/paid-session/top-up', // Send a top-up action without auto-resume.
  });
  const PANEL_AUTO_OPEN_STATES = new Set([
    'connecting',
    'active',
    'paused',
    'reconnecting',
  ]); // Operational states that should reveal the status panel automatically.
  const SPINNING_ICON_STATES = new Set([
    'offer_pending',
    'connecting',
    'reconnecting',
  ]); // States that keep an indeterminate progress icon rotating.
  const CONNECTION_PROGRESS_STATES = new Set([
    'connecting',
    'reconnecting',
  ]); // Transitional states that show only status/clock and participant readiness.
  const PAUSE_REASON_LABELS = Object.freeze({
    client_request: 'По просьбе клиента',
    expert_break: 'Короткий перерыв эксперта',
    technical: 'Техническая проблема',
    balance: 'Требуется пополнение',
  }); // Human-readable labels for backend pause reason codes.
  const PAID_SESSION_STATUS_LABELS = Object.freeze({
    no_consent: 'Paid consultation is not offered', // Label before an offer is sent.
    offer_pending: 'Waiting for client consent', // Label while waiting for the client response.
    ready: 'Client accepted', // Label after consent and before the expert starts connection.
    connecting: 'Connecting', // Label during the free connection/setup phase.
    active: 'Live', // Base label for an active session; elapsed time is appended dynamically.
    paused: 'Session paused', // Label while billing/session progress is paused.
    reconnecting: 'Reconnecting', // Label during a technical reconnect attempt.
    completed: 'Session completed', // Label after the paid consultation is finished.
  });
  const PAID_SESSION_STATUS_ICONS = Object.freeze({
    no_consent: 'offer', // Solid lightning icon shown before client consent exists.
    offer_pending: 'spinner', // Progress icon shown while the offer is pending.
    ready: 'check', // Confirmation icon shown after client consent.
    connecting: 'spinner', // Progress icon shown during initial connection.
    active: 'live', // Live-state icon shown while billing is active.
    paused: 'pause', // Pause icon shown while the consultation is paused.
    reconnecting: 'reconnect', // Reconnect icon shown during connection recovery.
    completed: 'check', // Completion icon shown after the session ends.
  });
  const PAID_SESSION_BALANCE_LABELS = Object.freeze({
    unknown: 'Balance unknown', // Label when the backend has not supplied a balance signal.
    sufficient: 'Balance OK', // Label when the client can continue the paid consultation.
    low: 'Low balance', // Label when the operator should offer a top-up soon.
    required: 'Top-up required', // Label when a top-up is required before continuing.
  });
  const PAID_SESSION_TIMELINE_EVENTS = Object.freeze({
    offer_sent: Object.freeze({
      text: 'Предложение платной консультации отправлено',
      tone: 'info',
    }), // Persistent event created after the offer and its client message are committed.
    offer_accepted: Object.freeze({
      text: 'Клиент принял предложение платной консультации',
      tone: 'positive',
    }), // Persistent event created only after server-authoritative client consent.
    session_started: Object.freeze({
      text: 'Платная консультация началась',
      tone: 'positive',
    }), // Persistent event created when billing actually starts, not during connection.
    session_paused: Object.freeze({
      text: 'Консультация поставлена на паузу',
      tone: 'warning',
    }), // Persistent event created after a successful pause transition.
    session_resumed: Object.freeze({
      text: 'Платная консультация продолжена',
      tone: 'info',
    }), // Persistent event created when a paused session becomes active again.
    session_completed: Object.freeze({
      text: 'Платная консультация завершена',
      tone: 'muted',
    }), // Persistent terminal event created after completion is committed.
  });
  const PAID_SESSION_ICON_MARKUP = Object.freeze({
    offer: '<path class="paid-session-icon-fill" d="M13.4 2.5 5.8 13h5.1l-.8 8.5L18.2 10h-5.3l.5-7.5z"></path>',
    waiting: '<path d="M7 3h10M7 21h10M8 3c0 4 1 6 4 9-3 3-4 5-4 9M16 3c0 4-1 6-4 9 3 3 4 5 4 9"></path>',
    play: '<path class="paid-session-icon-fill" d="M9 6.8 18 12l-9 5.2z"></path>',
    spinner: '<circle class="paid-session-icon-track" cx="12" cy="12" r="8"></circle><path d="M12 4a8 8 0 0 1 8 8"></path>',
    pause: '<path d="M9 7v10M15 7v10"></path>',
    reconnect: '<path d="M20 8V4l-2 2a8 8 0 0 0-13 3M4 16v4l2-2a8 8 0 0 0 13-3"></path>',
    check: '<path d="m5 12 4 4L19 6"></path>',
    live: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"></circle>',
  }); // Inline SVG paths avoid icon-font encoding failures in paid-session controls.
  const CONTROL_VIEWS = Object.freeze({
    no_consent: Object.freeze({
      action: 'offer',
      icon: 'offer',
      label: 'Offer paid consultation',
      disabled: false,
    }),
    offer_pending: Object.freeze({
      action: '',
      icon: 'spinner',
      label: 'Waiting for client consent',
      disabled: true,
    }),
    ready: Object.freeze({
      action: 'start',
      icon: 'play',
      label: 'Start paid session',
      disabled: false,
    }),
    connecting: Object.freeze({
      action: '',
      icon: 'spinner',
      label: 'Connecting client and expert',
      disabled: true,
    }),
    active: Object.freeze({
      action: 'pause',
      icon: 'pause',
      label: 'Pause paid session',
      disabled: false,
    }),
    paused: Object.freeze({
      action: 'resume',
      icon: 'play',
      label: 'Resume paid session',
      disabled: false,
    }),
    reconnecting: Object.freeze({
      action: '',
      icon: 'reconnect',
      label: 'Reconnecting',
      disabled: true,
    }),
    completed: Object.freeze({
      action: '',
      icon: 'check',
      label: 'Paid session completed',
      disabled: true,
    }),
  }); // Single visual/action mapping for the primary paid-session control.

  const root = document.querySelector('#admin-agent-chat');
  if (!root) {
    return;
  }

  const parseConfig = () => {
    const node = document.querySelector('#paidSessionConfig');
    let embedded = {};
    try {
      embedded = node?.textContent ? JSON.parse(node.textContent) : {};
    } catch (error) {
      console.error('[agent-paid-session] Invalid #paidSessionConfig JSON.', error);
    }
    const runtime = window.ADMIN_AGENT_PAID_SESSION_CONFIG || {};
    return Object.freeze({
      ...embedded,
      ...runtime,
      defaults: Object.freeze({
        ...PAID_SESSION_DEFAULTS,
        ...(embedded.defaults || {}),
        ...(runtime.defaults || {}),
        ...(embedded.demo || {}),
        ...(runtime.demo || {}),
      }),
      endpoints: Object.freeze({
        ...PAID_SESSION_ENDPOINTS,
        ...(embedded.endpoints || {}),
        ...(runtime.endpoints || {}),
      }),
      csrf: Object.freeze({
        ...(embedded.csrf || {}),
        ...(runtime.csrf || {}),
      }),
    });
  };

  const config = parseConfig();
  const elements = {
    control: root.querySelector('#paidSessionControl'),
    controlIcon: root.querySelector('#paidSessionControl .paid-session-control-icon'),
    controlLabel: root.querySelector('#paidSessionControl [data-paid-session-control-label]'),
    panel: root.querySelector('#billingPanel'),
    panelIcon: root.querySelector('#billingPanel .paid-session-panel-icon'),
    statusLabel: root.querySelector('#billingPanel [data-paid-session-status-label]'),
    mode: root.querySelector('#billingPanel [data-paid-session-mode]'),
    readiness: root.querySelector('#billingPanel [data-paid-session-readiness]'),
    balance: root.querySelector('#billingPanel [data-paid-session-balance]'),
    panelError: root.querySelector('#billingPanel [data-paid-session-error]'),
    topUp: root.querySelector('#btnSendTopUp'),
    collapse: root.querySelector('#billingPanel .js-paid-session-panel-collapse'),
    composer: root.querySelector('#conversationInputArea'),
    centerPane: root.querySelector('.pane-center'),
  };
  const modals = {
    offer: document.querySelector('#paidSessionOfferModal'),
    start: document.querySelector('#paidSessionStartModal'),
    pause: document.querySelector('#paidSessionPauseModal'),
    resume: document.querySelector('#paidSessionResumeModal'),
    complete: document.querySelector('#paidSessionCompleteModal'),
  };

  if (!elements.control || !elements.panel) {
    return;
  }

  let session = null;
  let pendingAction = '';
  let panelDismissed = false;
  let currentModal = null;
  let errorTimer = 0;
  let countdownTimer = 0;
  let positionRaf = 0;
  let demoConsentTimer = 0;
  let demoConnectTimer = 0;
  let controlPressTimer = 0;
  let feedbackAudioContext = null;
  const demoSnapshots = new Map();

  const nowIso = () => new Date().toISOString();
  const addSeconds = (seconds) => new Date(
    Date.now() + (Number(seconds) || 0) * PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond
  ).toISOString();
  const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  const getConversationId = () => (
    root.dataset.conversationId
    || root.querySelector('.conv-list .active')?.dataset.conversationId
    || config.conversationId
    || ''
  );
  const createIdempotencyKey = (action) => {
    if (window.crypto?.randomUUID) {
      return `paid-${action}-${window.crypto.randomUUID()}`;
    }
    return `paid-${action}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const createDemoTimelineEvent = (eventCode, snapshot, overrides = {}) => {
    const definition = PAID_SESSION_TIMELINE_EVENTS[eventCode];
    if (!definition || !snapshot?.conversation_id) {
      return null;
    }
    const messageId = `demo-paid-${eventCode}-${snapshot.conversation_id}-${Date.now()}`;
    return {
      message_id: messageId,
      conversation_id: String(snapshot.conversation_id),
      session_id: snapshot.session_id || null,
      system_kind: 'paid_session',
      event_code: eventCode,
      text: overrides.text || definition.text,
      tone: overrides.tone || definition.tone,
      occurred_at: nowIso(),
      metadata: overrides.metadata || {},
    };
  };
  const publishTimelineEvent = (timelineEvent) => {
    if (!timelineEvent) {
      return;
    }
    root.dispatchEvent(new CustomEvent('agentpaid:timeline-event', {
      detail: {
        event: timelineEvent,
        session,
      },
    }));
  };
  const setSvgIcon = (element, icon, spinning = false) => {
    if (!element || !PAID_SESSION_ICON_MARKUP[icon]) {
      return;
    }
    element.innerHTML = PAID_SESSION_ICON_MARKUP[icon];
    element.classList.toggle('is-spinning', spinning);
  };
  const getFeedbackAudioContext = (enabled) => {
    if (!enabled) {
      return null;
    }
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      return null;
    }
    feedbackAudioContext ||= new AudioContextConstructor();
    return feedbackAudioContext;
  };
  const primeSessionStartSound = () => {
    const context = getFeedbackAudioContext(
      config.defaults.sessionStartSoundEnabled || config.defaults.offerAcceptedSoundEnabled
    );
    if (context?.state === 'suspended') {
      context.resume().catch(() => {});
    }
  };
  const playSessionStartSound = () => {
    const context = getFeedbackAudioContext(config.defaults.sessionStartSoundEnabled);
    if (!context) {
      return;
    }
    if (context.state === 'suspended') {
      context.resume().then(playSessionStartSound).catch(() => {});
      return;
    }

    const startAt = context.currentTime + 0.01;
    const duration = PAID_SESSION_TIME_CONSTANTS.sessionStartSoundDurationMs
      / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond;
    const attack = PAID_SESSION_TIME_CONSTANTS.sessionStartSoundAttackMs
      / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(config.defaults.sessionStartSoundFrequencyHz, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      config.defaults.sessionStartSoundEndFrequencyHz,
      startAt + duration
    );
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(config.defaults.sessionStartSoundVolume, startAt + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  };
  const playOfferAcceptedSound = () => {
    const context = getFeedbackAudioContext(config.defaults.offerAcceptedSoundEnabled);
    if (!context) {
      return;
    }
    if (context.state === 'suspended') {
      context.resume().then(playOfferAcceptedSound).catch(() => {});
      return;
    }

    const startAt = context.currentTime + 0.01;
    const duration = PAID_SESSION_TIME_CONSTANTS.offerAcceptedSoundDurationMs
      / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond;
    const attack = PAID_SESSION_TIME_CONSTANTS.offerAcceptedSoundAttackMs
      / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(config.defaults.offerAcceptedSoundFrequencyHz, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      config.defaults.offerAcceptedSoundEndFrequencyHz,
      startAt + duration
    );
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(config.defaults.offerAcceptedSoundVolume, startAt + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  };
  const showControlPressFeedback = () => {
    window.clearTimeout(controlPressTimer);
    elements.control.classList.remove('is-pressed');
    void elements.control.offsetWidth;
    elements.control.classList.add('is-pressed');
    controlPressTimer = window.setTimeout(() => {
      elements.control.classList.remove('is-pressed');
    }, PAID_SESSION_TIME_CONSTANTS.controlPressEffectMs);
  };
  const normalizeStatus = (value) => (
    PAID_SESSION_STATUSES.includes(value) ? value : 'no_consent'
  );
  const normalizeBillingMode = (value) => (
    PAID_SESSION_BILLING_MODES.includes(value) ? value : 'none'
  );
  const defaultSnapshot = (conversationId = getConversationId()) => ({
    session_id: null,
    consent_id: null,
    conversation_id: String(conversationId || ''),
    status: 'no_consent',
    billing_mode: 'none',
    pause_reason: null,
    version: PAID_SESSION_DEMO_STATE.version,
    service_id: PAID_SESSION_DEMO_STATE.serviceId,
    service_version: PAID_SESSION_DEMO_STATE.serviceVersion,
    rate_label: PAID_SESSION_DEMO_STATE.rateLabel,
    balance_signal: PAID_SESSION_DEMO_STATE.balanceSignal,
    trial_available: PAID_SESSION_DEMO_STATE.trialAvailable,
    expert_ready: PAID_SESSION_DEMO_STATE.expertReady,
    client_ready: PAID_SESSION_DEMO_STATE.clientReady,
    offer_expires_at: null,
    connection_deadline: null,
    pause_expires_at: null,
    reconnect_deadline: null,
    started_at: null,
    updated_at: nowIso(),
  });
  const normalizeSnapshot = (input = {}) => {
    const base = defaultSnapshot(input.conversation_id || getConversationId());
    return Object.freeze({
      ...base,
      ...input,
      conversation_id: String(input.conversation_id || base.conversation_id),
      status: normalizeStatus(input.status),
      billing_mode: normalizeBillingMode(input.billing_mode),
      version: Math.max(
        PAID_SESSION_VALUE_CONSTANTS.minimumVersion,
        Number(input.version) || PAID_SESSION_VALUE_CONSTANTS.minimumVersion
      ),
      expert_ready: Boolean(input.expert_ready),
      client_ready: Boolean(input.client_ready),
    });
  };

  const getCsrf = () => {
    const metaParam = document.querySelector('meta[name="csrf-param"]')?.content;
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
    return {
      param: config.csrf.param || metaParam || '_csrf',
      token: config.csrf.token || metaToken || '',
    };
  };
  const buildMutationPayload = (action, extra = {}) => ({
    conversation_id: session?.conversation_id || getConversationId(),
    session_id: session?.session_id || null,
    consent_id: session?.consent_id || null,
    operator_id: String(config.operatorId || root.dataset.agentId || root.dataset.userId || ''),
    expected_version: session?.version || PAID_SESSION_VALUE_CONSTANTS.minimumVersion,
    idempotency_key: createIdempotencyKey(action),
    ...extra,
  });

  const ajaxRequest = async (endpoint, options = {}) => {
    const csrf = getCsrf();
    const body = options.body
      ? { ...options.body, [csrf.param]: csrf.token }
      : null;
    const response = await window.fetch(endpoint, {
      method: options.method || 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrf.token ? { 'X-CSRF-Token': csrf.token } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      const error = new Error(data.message || `Paid-session request failed (${response.status}).`);
      error.code = data.code || `HTTP_${response.status}`;
      error.session = data.session || null;
      throw error;
    }
    return data;
  };

  const createAjaxTransport = () => ({
    async load(conversationId) {
      const query = new URLSearchParams({ conversation_id: conversationId });
      return ajaxRequest(`${config.endpoints.state}?${query}`, { method: 'GET' });
    },
    transition(action, payload) {
      const endpoint = config.endpoints[action];
      if (!endpoint) {
        return Promise.reject(new Error(`Missing paid-session endpoint for "${action}".`));
      }
      return ajaxRequest(endpoint, { method: 'POST', body: payload });
    },
  });

  const demoTransition = (current, action, payload) => {
    const next = { ...current, version: current.version + 1, updated_at: nowIso() };
    const invalid = () => {
      const error = new Error(`Action "${action}" is not allowed from "${current.status}".`);
      error.code = 'INVALID_TRANSITION';
      error.session = current;
      throw error;
    };

    if (action === 'offer' && current.status === 'no_consent') {
      return {
        ...next,
        session_id: current.session_id || `ps-demo-${current.conversation_id}-${Date.now()}`,
        status: 'offer_pending',
        billing_mode: 'none',
        service_id: payload.service_id || current.service_id,
        service_version: payload.service_version || current.service_version,
        rate_label: payload.rate_label || current.rate_label,
        offer_expires_at: addSeconds(config.defaults.offerTtlSeconds),
      };
    }
    if (action === 'start' && current.status === 'ready') {
      return {
        ...next,
        status: 'connecting',
        billing_mode: 'none',
        expert_ready: true,
        client_ready: false,
        connection_deadline: addSeconds(config.defaults.connectionTimeoutSeconds),
      };
    }
    if (action === 'pause' && current.status === 'active') {
      return {
        ...next,
        status: 'paused',
        pause_reason: payload.pause_reason,
        pause_expires_at: addSeconds(config.defaults.manualPauseSeconds),
      };
    }
    if (action === 'resume' && current.status === 'paused') {
      return {
        ...next,
        status: 'connecting',
        pause_reason: null,
        pause_expires_at: null,
        expert_ready: true,
        client_ready: false,
        connection_deadline: addSeconds(config.defaults.connectionTimeoutSeconds),
      };
    }
    if (action === 'complete' && ['active', 'paused'].includes(current.status)) {
      return {
        ...next,
        status: 'completed',
        pause_reason: null,
        offer_expires_at: null,
        connection_deadline: null,
        pause_expires_at: null,
        reconnect_deadline: null,
      };
    }
    if (action === 'topUp' && ['active', 'paused'].includes(current.status)) {
      return next;
    }
    return invalid();
  };

  const createDemoTransport = () => ({
    async load(conversationId) {
      await delay(config.defaults.requestLatencyMs);
      if (!demoSnapshots.has(conversationId)) {
        const initial = String(config.initialState?.conversation_id || '') === String(conversationId)
          ? normalizeSnapshot({ ...config.initialState, conversation_id: conversationId })
          : normalizeSnapshot(defaultSnapshot(conversationId));
        demoSnapshots.set(conversationId, initial);
      }
      return { ok: true, request_id: `demo-load-${Date.now()}`, session: clone(demoSnapshots.get(conversationId)) };
    },
    async transition(action, payload) {
      await delay(config.defaults.requestLatencyMs);
      const conversationId = String(payload.conversation_id || getConversationId());
      const current = demoSnapshots.get(conversationId) || normalizeSnapshot(defaultSnapshot(conversationId));
      if (Number(payload.expected_version) !== current.version) {
        const error = new Error('Session changed in another tab. Current server state was restored.');
        error.code = 'STALE_VERSION';
        error.session = current;
        throw error;
      }
      const next = normalizeSnapshot(demoTransition(current, action, payload));
      demoSnapshots.set(conversationId, next);
      return {
        ok: true,
        request_id: `demo-${action}-${Date.now()}`,
        session: clone(next),
        timeline_event: action === 'offer'
          ? createDemoTimelineEvent('offer_sent', next)
          : action === 'pause'
            ? createDemoTimelineEvent('session_paused', next, {
              text: `${PAID_SESSION_TIMELINE_EVENTS.session_paused.text} · ${PAUSE_REASON_LABELS[payload.pause_reason] || payload.pause_reason}`,
              metadata: { pause_reason: payload.pause_reason },
            })
            : action === 'complete'
              ? createDemoTimelineEvent('session_completed', next, {
                metadata: { completion_reason: payload.completion_reason },
              })
              : null,
        ...(action === 'offer' ? {
          offer_message: {
            message_id: `paid-offer-message-${Date.now()}`,
            template_id: payload.offer_template_id,
            template_version: payload.offer_template_version,
            text: payload.client_message_preview,
            delivery_status: 'sent',
          },
        } : {}),
        ...(action === 'pause' ? {
          pause_message: {
            message_id: `paid-pause-message-${Date.now()}`,
            template_id: payload.pause_template_id,
            template_version: payload.pause_template_version,
            text: payload.client_message_preview,
            delivery_status: 'sent',
          },
          internal_comment_saved: Boolean(payload.internal_comment),
        } : {}),
      };
    },
  });

  const transport = config.transport === PAID_SESSION_TRANSPORT_MODES.ajax
    ? createAjaxTransport()
    : createDemoTransport();

  const formatDuration = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safe / PAID_SESSION_TIME_CONSTANTS.secondsPerMinute);
    const remainder = safe % PAID_SESSION_TIME_CONSTANTS.secondsPerMinute;
    return `${minutes}:${String(remainder).padStart(PAID_SESSION_VALUE_CONSTANTS.timerDigitCount, '0')}`;
  };
  const formatElapsedDuration = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safe / PAID_SESSION_TIME_CONSTANTS.secondsPerMinute);
    const remainder = safe % PAID_SESSION_TIME_CONSTANTS.secondsPerMinute;
    return `${String(minutes).padStart(PAID_SESSION_VALUE_CONSTANTS.timerDigitCount, '0')}:${String(remainder).padStart(PAID_SESSION_VALUE_CONSTANTS.timerDigitCount, '0')}`;
  };
  const secondsUntil = (iso) => (
    iso
      ? Math.max(0, Math.ceil(
        (new Date(iso).getTime() - Date.now()) / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond
      ))
      : 0
  );
  const secondsSince = (iso) => (
    iso
      ? Math.max(0, Math.floor(
        (Date.now() - new Date(iso).getTime()) / PAID_SESSION_TIME_CONSTANTS.millisecondsPerSecond
      ))
      : 0
  );
  const getStatusText = () => {
    if (session?.status === 'active' && session.started_at) {
      return `${PAID_SESSION_STATUS_LABELS.active} · ${formatElapsedDuration(secondsSince(session.started_at))}`;
    }
    if (session?.status === 'offer_pending' && session.offer_expires_at) {
      return `${PAID_SESSION_STATUS_LABELS.offer_pending} · ${formatDuration(secondsUntil(session.offer_expires_at))}`;
    }
    if (session?.status === 'connecting' && session.connection_deadline) {
      return `${PAID_SESSION_STATUS_LABELS.connecting} · ${formatDuration(secondsUntil(session.connection_deadline))}`;
    }
    if (session?.status === 'paused' && session.pause_expires_at) {
      return `${PAID_SESSION_STATUS_LABELS.paused} · ${formatDuration(secondsUntil(session.pause_expires_at))}`;
    }
    if (session?.status === 'reconnecting' && session.reconnect_deadline) {
      return `${PAID_SESSION_STATUS_LABELS.reconnecting} · ${formatDuration(secondsUntil(session.reconnect_deadline))}`;
    }
    return PAID_SESSION_STATUS_LABELS[session?.status] || 'Paid session';
  };
  const getStatusIcon = () => PAID_SESSION_STATUS_ICONS[session?.status] || 'live';
  const getBalanceText = () => (
    PAID_SESSION_BALANCE_LABELS[session?.balance_signal]
    || PAID_SESSION_BALANCE_LABELS.unknown
  );

  const setOptionalPill = (element, value) => {
    if (!element) {
      return;
    }
    element.textContent = value || '';
    element.hidden = !value;
  };
  const syncSessionStatusClock = () => {
    if (elements.statusLabel) {
      elements.statusLabel.textContent = getStatusText();
    }
  };
  const syncPanelVisibility = () => {
    const shouldOpen = PANEL_AUTO_OPEN_STATES.has(session?.status) && !panelDismissed;
    elements.panel.hidden = !shouldOpen;
    elements.panel.classList.toggle('is-open', shouldOpen);
    elements.collapse?.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    root.dispatchEvent(new CustomEvent('agentpaid:layout-changed', {
      detail: { panel_open: shouldOpen, session },
    }));
  };
  const render = () => {
    if (!session) {
      return;
    }
    const view = CONTROL_VIEWS[session.status];
    const isPending = Boolean(pendingAction);
    elements.control.dataset.sessionStatus = session.status;
    elements.control.dataset.sessionAction = view.action;
    elements.control.className = `btn btn-default paid-session-float js-session-toggle is-state-${session.status}`;
    elements.control.disabled = view.disabled || isPending;
    elements.control.setAttribute('aria-disabled', elements.control.disabled ? 'true' : 'false');
    elements.control.setAttribute('aria-busy', isPending ? 'true' : 'false');
    elements.control.title = isPending ? 'Saving paid session state' : view.label;
    elements.control.setAttribute('aria-label', elements.control.title);
    if (elements.controlIcon) {
      const controlIcon = isPending ? 'spinner' : view.icon;
      setSvgIcon(elements.controlIcon, controlIcon, isPending || SPINNING_ICON_STATES.has(session.status));
    }
    if (elements.controlLabel) {
      elements.controlLabel.textContent = elements.control.title;
    }

    elements.panel.dataset.sessionStatus = session.status;
    syncSessionStatusClock();
    if (elements.panelIcon) {
      setSvgIcon(elements.panelIcon, getStatusIcon(), SPINNING_ICON_STATES.has(session.status));
    }
    const isConnectionProgress = CONNECTION_PROGRESS_STATES.has(session.status);
    const hasBillingMode = session.billing_mode !== 'none';
    setOptionalPill(
      elements.mode,
      hasBillingMode && !isConnectionProgress ? session.billing_mode.toUpperCase() : ''
    );
    const readiness = isConnectionProgress
      ? `${session.expert_ready ? 'Expert ready' : 'Expert waiting'} · ${session.client_ready ? 'Client ready' : 'Client waiting'}`
      : '';
    setOptionalPill(elements.readiness, readiness);
    if (elements.balance) {
      elements.balance.dataset.balanceSignal = session.balance_signal || 'unknown';
    }
    setOptionalPill(
      elements.balance,
      hasBillingMode && !isConnectionProgress ? getBalanceText() : ''
    );
    if (elements.topUp) {
      elements.topUp.hidden = isConnectionProgress
        || !['low', 'required'].includes(session.balance_signal);
      elements.topUp.disabled = isPending;
    }
    document.querySelectorAll('[data-paid-session-rate]').forEach((node) => {
      node.textContent = session.rate_label || 'Rate from server';
    });
    const serviceSelect = document.querySelector('#paidSessionServiceSelect');
    if (serviceSelect) {
      const matchingOption = Array.from(serviceSelect.options).find((option) => (
        option.value === session.service_id
      ));
      if (matchingOption) {
        serviceSelect.value = matchingOption.value;
      }
      const selectedOption = serviceSelect.selectedOptions[0];
      if (selectedOption) {
        const serviceLabel = selectedOption.dataset.serviceLabel || PAID_SESSION_DEMO_STATE.serviceLabel;
        const rateLabel = session.rate_label || selectedOption.dataset.rateLabel || PAID_SESSION_DEMO_STATE.rateLabel;
        selectedOption.dataset.rateLabel = rateLabel;
        selectedOption.textContent = `${serviceLabel} — ${rateLabel}`;
      }
    }
    document.querySelectorAll('[data-paid-session-start-mode]').forEach((node) => {
      node.textContent = session.trial_available ? 'Trial, then paid' : 'Paid';
    });
    document.querySelectorAll('[data-paid-session-pause-reason]').forEach((node) => {
      node.textContent = PAUSE_REASON_LABELS[session.pause_reason] || 'Not specified';
    });
    syncPanelVisibility();
    requestControlPosition();
  };

  const applySessionSnapshot = (next, options = {}) => {
    const previous = session;
    const normalized = normalizeSnapshot(next);
    const statusChanged = previous?.status !== normalized.status;
    const isFirstActiveTransition = normalized.status === 'active'
      && previous?.status !== 'active'
      && !previous?.started_at
      && !['load', 'load-error'].includes(options.source);
    const isOfferAcceptedTransition = normalized.status === 'ready'
      && previous?.status === 'offer_pending'
      && !['load', 'load-error'].includes(options.source);
    session = normalized;
    demoSnapshots.set(session.conversation_id, session);
    if (statusChanged) {
      panelDismissed = false;
      closeModal();
    }
    render();
    if (isFirstActiveTransition) {
      playSessionStartSound();
    }
    if (isOfferAcceptedTransition) {
      playOfferAcceptedSound();
    }
    root.dispatchEvent(new CustomEvent('agentpaid:state-changed', {
      detail: {
        previous,
        session,
        source: options.source || 'unknown',
      },
    }));
    scheduleDemoProgress();
    return session;
  };

  const showError = (message) => {
    window.clearTimeout(errorTimer);
    if (!elements.panelError) {
      return;
    }
    elements.panelError.textContent = message || 'Paid-session action failed.';
    elements.panelError.hidden = false;
    elements.panel.hidden = false;
    elements.panel.classList.add('is-open', 'has-error');
    errorTimer = window.setTimeout(() => {
      elements.panelError.hidden = true;
      elements.panel.classList.remove('has-error');
      syncPanelVisibility();
    }, config.defaults.errorVisibilityMs);
  };
  const closeModal = () => {
    if (!currentModal) {
      return;
    }
    currentModal.hidden = true;
    currentModal.classList.remove('is-open');
    currentModal = null;
  };
  const openModal = (modal) => {
    closeModal();
    if (!modal) {
      return;
    }
    currentModal = modal;
    modal.hidden = false;
    modal.classList.add('is-open');
    window.setTimeout(() => {
      modal.querySelector('textarea, select, button:not([data-paid-session-dismiss])')?.focus();
    }, PAID_SESSION_TIME_CONSTANTS.modalFocusDelayMs);
  };

  const runTransition = async (action, extra = {}) => {
    if (!session || pendingAction) {
      return null;
    }
    pendingAction = action;
    render();
    try {
      const response = await transport.transition(action, buildMutationPayload(action, extra));
      if (!response?.session) {
        throw new Error('Server response does not contain a canonical session snapshot.');
      }
      applySessionSnapshot(response.session, { source: `transition:${action}` });
      if (action === 'topUp') {
        root.dispatchEvent(new CustomEvent('agentpaid:topup-requested', {
          detail: { session, response },
        }));
      }
      if (action === 'offer') {
        root.dispatchEvent(new CustomEvent('agentpaid:offer-created', {
          detail: {
            session,
            offer_message: response.offer_message || null,
          },
        }));
      }
      if (action === 'pause') {
        root.dispatchEvent(new CustomEvent('agentpaid:pause-created', {
          detail: {
            session,
            pause_message: response.pause_message || null,
            internal_comment_saved: response.internal_comment_saved === true,
          },
        }));
      }
      publishTimelineEvent(response.timeline_event);
      return response;
    } catch (error) {
      if (error.session) {
        applySessionSnapshot(error.session, { source: `error:${action}` });
      }
      showError(error.message);
      return null;
    } finally {
      pendingAction = '';
      render();
    }
  };

  const clearDemoTimers = () => {
    window.clearTimeout(demoConsentTimer);
    window.clearTimeout(demoConnectTimer);
    demoConsentTimer = 0;
    demoConnectTimer = 0;
  };
  const demoSetState = (status, patch = {}) => {
    if (config.transport === PAID_SESSION_TRANSPORT_MODES.ajax || !session) {
      return null;
    }
    const next = normalizeSnapshot({
      ...session,
      ...patch,
      status,
      version: session.version + 1,
      updated_at: nowIso(),
    });
    demoSnapshots.set(next.conversation_id, next);
    return applySessionSnapshot(next, { source: 'demo-set-state' });
  };
  const scheduleDemoProgress = () => {
    clearDemoTimers();
    if (config.transport === PAID_SESSION_TRANSPORT_MODES.ajax || !session) {
      return;
    }
    if (session.status === 'offer_pending') {
      demoConsentTimer = window.setTimeout(() => {
        const readySession = demoSetState('ready', {
          consent_id: `consent-demo-${session.conversation_id}-${Date.now()}`,
          client_ready: true,
          offer_expires_at: null,
        });
        publishTimelineEvent(createDemoTimelineEvent('offer_accepted', readySession));
      }, config.defaults.autoConsentMs);
    }
    if (session.status === 'connecting') {
      demoConnectTimer = window.setTimeout(() => {
        const isResuming = Boolean(session.started_at);
        const activeSession = demoSetState('active', {
          billing_mode: session.trial_available ? 'trial' : 'paid',
          expert_ready: true,
          client_ready: true,
          connection_deadline: null,
          started_at: session.started_at || nowIso(),
        });
        publishTimelineEvent(createDemoTimelineEvent(
          isResuming ? 'session_resumed' : 'session_started',
          activeSession
        ));
      }, config.defaults.autoConnectMs);
    }
  };

  const load = async (conversationId = getConversationId()) => {
    if (!conversationId) {
      return null;
    }
    pendingAction = 'load';
    render();
    try {
      const response = await transport.load(String(conversationId));
      return applySessionSnapshot(response.session, { source: 'load' });
    } catch (error) {
      if (error.session) {
        applySessionSnapshot(error.session, { source: 'load-error' });
      }
      showError(error.message);
      return null;
    } finally {
      pendingAction = '';
      render();
    }
  };

  const syncControlPosition = () => {
    if (!elements.centerPane || !elements.control) {
      return;
    }
    const paneRect = elements.centerPane.getBoundingClientRect();
    const right = Math.max(
      config.defaults.sessionButtonViewportInsetPx,
      window.innerWidth - paneRect.right + config.defaults.sessionButtonViewportInsetPx
    );
    const composerTop = elements.composer?.getBoundingClientRect().top
      || (window.innerHeight - config.defaults.composerFallbackHeightPx);
    const bottom = Math.max(
      config.defaults.sessionButtonViewportInsetPx,
      window.innerHeight - composerTop + config.defaults.sessionButtonViewportInsetPx
    );
    elements.control.style.right = `${right}px`;
    elements.control.style.bottom = `${bottom}px`;
  };
  const requestControlPosition = () => {
    if (positionRaf) {
      window.cancelAnimationFrame(positionRaf);
    }
    positionRaf = window.requestAnimationFrame(() => {
      positionRaf = 0;
      syncControlPosition();
    });
  };

  const setFieldValidation = (field, error, isInvalid) => {
    if (!field) {
      return;
    }
    field.setAttribute('aria-invalid', isInvalid ? 'true' : 'false');
    field.closest('.paid-session-field-group, .paid-session-template-field')
      ?.classList.toggle('is-invalid', isInvalid);
    if (error) {
      error.hidden = !isInvalid;
    }
  };

  const getSelectedTemplate = (modal) => {
    const input = modal?.querySelector('.js-paid-session-template-select');
    const templateId = input?.dataset.templateId || '';
    const templateVersion = input?.dataset.templateVersion || '';
    const option = Array.from(modal?.querySelectorAll('.paid-session-template-option') || []).find((item) => (
      item.dataset.templateId === templateId
      && item.dataset.templateVersion === templateVersion
    ));
    return option ? {
      input,
      id: templateId,
      version: templateVersion,
      text: option.dataset.templateText || '',
    } : null;
  };

  const bindPaidSessionTemplateSelect = (modal) => {
    const field = modal?.querySelector('.paid-session-template-field');
    const input = modal?.querySelector('.js-paid-session-template-select');
    const toggle = modal?.querySelector('.js-paid-session-template-toggle');
    const menu = modal?.querySelector('.js-paid-session-template-menu');
    const preview = modal?.querySelector('[data-paid-session-offer-preview]');
    const empty = modal?.querySelector('.paid-session-template-empty');
    const options = Array.from(modal?.querySelectorAll('.paid-session-template-option') || []);
    if (!field || !input || !toggle || !menu || !options.length) {
      return;
    }

    const closeMenu = () => {
      menu.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      menu.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    };
    const selectOption = (option) => {
      options.forEach((item) => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
      });
      input.value = option.textContent.trim();
      input.dataset.templateId = option.dataset.templateId || '';
      input.dataset.templateVersion = option.dataset.templateVersion || '';
      if (preview) {
        preview.textContent = option.dataset.templateText || '';
      }
      setFieldValidation(
        input,
        modal.querySelector('[data-paid-session-template-error]'),
        false,
      );
      closeMenu();
    };
    const filterOptions = () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visibleCount = 0;
      options.forEach((option) => {
        const visible = !query || option.textContent.toLocaleLowerCase().includes(query);
        option.hidden = !visible;
        visibleCount += visible ? 1 : 0;
      });
      if (empty) {
        empty.hidden = visibleCount > 0;
      }
      return visibleCount;
    };

    input.addEventListener('focus', () => {
      filterOptions();
      openMenu();
    });
    input.addEventListener('input', () => {
      const selected = options.find((option) => (
        option.dataset.templateId === input.dataset.templateId
        && option.textContent.trim() === input.value.trim()
      ));
      if (!selected) {
        input.dataset.templateId = '';
        input.dataset.templateVersion = '';
      }
      filterOptions();
      openMenu();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }
      if (event.key === 'Enter') {
        const firstVisible = options.find((option) => !option.hidden);
        if (firstVisible) {
          event.preventDefault();
          selectOption(firstVisible);
        }
      }
    });
    toggle.addEventListener('click', () => {
      if (menu.hidden) {
        filterOptions();
        openMenu();
        input.focus();
      } else {
        closeMenu();
      }
    });
    options.forEach((option) => {
      option.addEventListener('click', () => selectOption(option));
    });
    document.addEventListener('click', (event) => {
      if (!field.contains(event.target)) {
        closeMenu();
      }
    });
  };

  const bindModalEvents = () => {
    bindPaidSessionTemplateSelect(modals.offer);
    bindPaidSessionTemplateSelect(modals.pause);
    const pauseReasonField = modals.pause?.querySelector('#paidSessionPauseReason');
    const pauseReasonError = modals.pause?.querySelector('[data-paid-session-pause-error]');
    const completeReasonField = modals.complete?.querySelector('#paidSessionCompleteReason');
    const completeReasonError = modals.complete?.querySelector('[data-paid-session-complete-error]');
    pauseReasonField?.addEventListener('change', () => {
      setFieldValidation(pauseReasonField, pauseReasonError, !pauseReasonField.value);
    });
    completeReasonField?.addEventListener('change', () => {
      setFieldValidation(completeReasonField, completeReasonError, !completeReasonField.value);
    });
    document.querySelectorAll('.paid-session-modal [data-paid-session-dismiss]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });
    document.querySelectorAll('.paid-session-modal').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && currentModal) {
        closeModal();
      }
    });

    modals.offer?.querySelector('.js-paid-session-offer-submit')?.addEventListener('click', async () => {
      const templateInput = modals.offer.querySelector('.js-paid-session-template-select');
      const selectedTemplate = getSelectedTemplate(modals.offer);
      const serviceSelect = modals.offer.querySelector('.js-paid-session-service-select');
      const selectedService = serviceSelect?.selectedOptions[0];
      const error = modals.offer.querySelector('[data-paid-session-offer-error]');
      if (!selectedTemplate) {
        setFieldValidation(templateInput, error, true);
        templateInput?.focus();
        return;
      }
      setFieldValidation(templateInput, error, false);
      closeModal();
      await runTransition('offer', {
        service_id: serviceSelect?.value || session.service_id || PAID_SESSION_DEMO_STATE.serviceId,
        service_version: selectedService?.dataset.serviceVersion || session.service_version || PAID_SESSION_DEMO_STATE.serviceVersion,
        rate_label: selectedService?.dataset.rateLabel || session.rate_label || PAID_SESSION_DEMO_STATE.rateLabel,
        offer_template_id: selectedTemplate.id,
        offer_template_version: selectedTemplate.version,
        client_message_preview: selectedTemplate.text,
        delivery_mode: 'automatic_chat_message',
      });
    });
    modals.start?.querySelector('.js-paid-session-start-submit')?.addEventListener('click', async () => {
      closeModal();
      await runTransition('start', { expert_ready: true });
    });
    modals.pause?.querySelector('.js-paid-session-pause-submit')?.addEventListener('click', async () => {
      const reasonField = modals.pause.querySelector('#paidSessionPauseReason');
      const reason = reasonField?.value || '';
      const reasonError = modals.pause.querySelector('[data-paid-session-pause-error]');
      const templateInput = modals.pause.querySelector('.js-paid-session-template-select');
      const templateError = modals.pause.querySelector('[data-paid-session-pause-template-error]');
      const selectedTemplate = getSelectedTemplate(modals.pause);
      setFieldValidation(reasonField, reasonError, !reason);
      setFieldValidation(templateInput, templateError, !selectedTemplate);
      if (!reason || !selectedTemplate) {
        (!reason ? reasonField : templateInput)?.focus();
        return;
      }
      const internalComment = modals.pause.querySelector('#paidSessionPauseInternalComment')?.value.trim() || '';
      closeModal();
      const response = await runTransition('pause', {
        pause_reason: reason,
        pause_template_id: selectedTemplate.id,
        pause_template_version: selectedTemplate.version,
        client_message_preview: selectedTemplate.text,
        delivery_mode: 'automatic_chat_message',
        internal_comment: internalComment,
      });
      if (response) {
        modals.pause.querySelector('#paidSessionPauseReason').value = '';
        modals.pause.querySelector('#paidSessionPauseInternalComment').value = '';
      }
    });
    modals.resume?.querySelector('.js-paid-session-resume-submit')?.addEventListener('click', async () => {
      closeModal();
      await runTransition('resume');
    });
    document.querySelectorAll('.js-paid-session-open-complete').forEach((button) => {
      button.addEventListener('click', () => openModal(modals.complete));
    });
    modals.complete?.querySelector('.js-paid-session-complete-submit')?.addEventListener('click', async () => {
      const reasonField = modals.complete.querySelector('#paidSessionCompleteReason');
      const reason = reasonField?.value || '';
      const error = modals.complete.querySelector('[data-paid-session-complete-error]');
      if (!reason) {
        setFieldValidation(reasonField, error, true);
        reasonField?.focus();
        return;
      }
      setFieldValidation(reasonField, error, false);
      const clientMessage = modals.complete.querySelector('#paidSessionCompleteMessage')?.value.trim() || '';
      closeModal();
      await runTransition('complete', {
        completion_reason: reason,
        client_message: clientMessage,
      });
    });
  };

  const bindControls = () => {
    elements.control.addEventListener('click', (event) => {
      event.preventDefault();
      if (elements.control.disabled || pendingAction || !session) {
        return;
      }
      showControlPressFeedback();
      primeSessionStartSound();
      const action = elements.control.dataset.sessionAction;
      if (action === 'offer') {
        openModal(modals.offer);
      } else if (action === 'start') {
        openModal(modals.start);
      } else if (action === 'pause') {
        openModal(modals.pause);
      } else if (action === 'resume') {
        openModal(modals.resume);
      }
    });
    elements.collapse?.addEventListener('click', () => {
      panelDismissed = true;
      syncPanelVisibility();
    });
    elements.topUp?.addEventListener('click', async () => {
      await runTransition('topUp', { source: 'billing_panel' });
    });
    root.addEventListener('agentchat:conversation-changed', (event) => {
      clearDemoTimers();
      panelDismissed = false;
      const conversationId = event.detail?.conversation_id || getConversationId();
      load(String(conversationId));
    });
    root.addEventListener('agentchat:layout-changed', requestControlPosition);
    window.addEventListener('resize', requestControlPosition);
    window.addEventListener('scroll', requestControlPosition, true);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(requestControlPosition);
      if (elements.composer) {
        observer.observe(elements.composer);
      }
      if (elements.centerPane) {
        observer.observe(elements.centerPane);
      }
    } else {
      elements.composer?.querySelector('#messageInput')?.addEventListener('input', requestControlPosition);
    }
  };

  const init = () => {
    if (root.dataset.paidSessionBound === '1') {
      return;
    }
    root.dataset.paidSessionBound = '1';
    const initial = normalizeSnapshot({
      ...defaultSnapshot(getConversationId()),
      ...(config.initialState || {}),
      conversation_id: getConversationId(),
    });
    session = initial;
    demoSnapshots.set(initial.conversation_id, initial);
    bindModalEvents();
    bindControls();
    render();
    load(initial.conversation_id);
    countdownTimer = window.setInterval(() => {
      if (session) {
        syncSessionStatusClock();
      }
    }, PAID_SESSION_TIME_CONSTANTS.timerRefreshMs);
  };

  window.AgentPaidSession = Object.freeze({
    init,
    getState: () => (session ? clone(session) : null),
    reload: () => load(getConversationId()),
    applySessionSnapshot: (next) => applySessionSnapshot(next, { source: 'external' }),
    demoSetState,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
