(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fixture') !== '1') return;
    if (window.NebulaFixtureHost) return;

    const events = [];
    const intents = [
        'nebula:account-information-edit-required', 'nebula:alternate-payment-method-requested', 'nebula:astrology-edit-required', 'nebula:astrological-details-back-required', 'nebula:astrological-details-continue-required', 'nebula:astrological-details-dismiss-required', 'nebula:autorefill-consent-required', 'nebula:auto-refill-intent',
        'nebula:card-details-dismissed', 'nebula:card-details-open', 'nebula:card-details-request-rejected', 'nebula:card-payment-error-dismissed', 'nebula:card-payment-error-open', 'nebula:card-payment-error-request-rejected',
        'nebula:chat-active-back-required', 'nebula:chat-conversation-open-required', 'nebula:chat-send-intent-required', 'nebula:checkout-request-rejected', 'nebula:checkout-review-dismissed', 'nebula:checkout-review-open', 'nebula:checkout-submit-requested', 'nebula:continuation-checkout-required', 'nebula:consultation-start-intent-required', 'nebula:consultation-pause-intent-required',
        'nebula:connecting-dismiss-requested', 'nebula:consultation-ask-next-required', 'nebula:consultation-complaint-required', 'nebula:consultation-completed-dismissed', 'nebula:consultation-completed-open', 'nebula:consultation-connecting-open', 'nebula:consultation-offer-accept-requested', 'nebula:consultation-rating-draft-changed', 'nebula:consultation-reconnect-open', 'nebula:consultation-review-dismissed', 'nebula:consultation-review-open', 'nebula:consultation-review-open-required', 'nebula:consultation-review-submit-required', 'nebula:consultation-support-dismiss-required', 'nebula:consultation-support-required',
        'nebula:continuation-checkout-rejected', 'nebula:continuation-checkout-required', 'nebula:continuation-decline-requested', 'nebula:continuation-topup-dismissed', 'nebula:continuation-topup-open', 'nebula:discount-offer-dismissed', 'nebula:discount-offer-open', 'nebula:discounted-checkout-rejected', 'nebula:discounted-checkout-requested', 'nebula:end-chat-intent-required', 'nebula:end-or-stay-dismiss-required', 'nebula:end-or-stay-intent',
        'nebula:expert-details-before-selection-open', 'nebula:expert-details-dismiss-required', 'nebula:expert-details-generic-picker-return-required', 'nebula:expert-details-open-requested', 'nebula:expert-favorite-intent-required', 'nebula:expert-offline-dismiss-required', 'nebula:expert-offline-intent', 'nebula:expert-picker-generic-dismiss-required', 'nebula:expert-picker-generic-open', 'nebula:expert-picker-generic-selection-required', 'nebula:expert-picker-trial-close-requested', 'nebula:expert-picker-trial-open', 'nebula:expert-reviews-intent-required', 'nebula:expert-selection-flow-close-required', 'nebula:expert-unavailable',
        'nebula:consent-action-required', 'nebula:faq-support-required', 'nebula:followup-offer-accept-rejected', 'nebula:followup-offer-dismissed', 'nebula:followup-offer-open', 'nebula:helper-message-send-intent', 'nebula:horoscope-advisor-required', 'nebula:horoscope-period-intent', 'nebula:horoscope-zodiac-intent', 'nebula:insufficient-credits-dismissed', 'nebula:insufficient-credits-open', 'nebula:legal-document-intent', 'nebula:no-matching-experts-dismiss-required', 'nebula:no-matching-experts-intent',
        'nebula:notification-delivery-dismiss-required', 'nebula:notification-delivery-required', 'nebula:notification-destination-dismissed', 'nebula:notification-destination-open', 'nebula:notification-destination-open-required', 'nebula:notification-destination-rejected', 'nebula:notification-destination-requested', 'nebula:notification-preference-intent', 'nebula:one-click-dismissed', 'nebula:one-click-open', 'nebula:one-click-request-rejected', 'nebula:one-click-topup-requested', 'nebula:continuation-decline-requested', 'nebula:open-question-before-start', 'nebula:package-checkout-required', 'nebula:payment-error-dismissed', 'nebula:payment-error-open', 'nebula:payment-error-request-rejected', 'nebula:payment-method-chooser-requested', 'nebula:payment-preflight-required', 'nebula:payment-support-requested', 'nebula:alternate-payment-method-requested', 'nebula:payment-method-selection-requested', 'nebula:secure-payment-form-required', 'nebula:personal-data-deletion-unbound', 'nebula:plans-host-intent', 'nebula:pre-start-funding-open', 'nebula:profile-host-intent', 'nebula:question-before-start-dismiss-required', 'nebula:question-before-start-open', 'nebula:question-before-start-submit-required', 'nebula:question-topics-next-required', 'nebula:reconnect-dismiss-requested', 'nebula:reconnect-wait-acknowledged', 'nebula:saved-payment-method-chooser-requested', 'nebula:saved-payment-method-intent-requested', 'nebula:select-alternative-expert', 'nebula:standard-topup-required', 'nebula:trial-selection-commit-required', 'nebula:wallet-payment-intent-requested', 'nebula:expert-followup-offer-accept-requested', 'nebula:discounted-checkout-requested',
    ];
    const root = document.createElement('aside');
    root.dataset.nebulaFixtureConsole = 'true';
    root.setAttribute('aria-label', 'Fixture host interaction inspector');
    root.innerHTML = `
        <strong>Fixture host</strong>
        <p>In-memory demo. No API, persistence or payment. Active timer is local demo only; no billing.</p>
        <label>Outcome
            <select data-fixture-outcome>
                <option value="received">Received — no transition</option>
                <option value="pending">Pending — no transition</option>
                <option value="rejected">Rejected — no transition</option>
            </select>
        </label>
        <output data-fixture-log aria-live="polite">Waiting for a UI intent.</output>
        <ol data-fixture-history aria-label="Fixture event history"></ol>
        <button type="button" data-fixture-clear>Clear log</button>
    `;
    document.body.append(root);

    const log = root.querySelector('[data-fixture-log]');
    const history = root.querySelector('[data-fixture-history]');
    const outcome = root.querySelector('[data-fixture-outcome]');
    const rejectionPairs = [
        { root: '[data-nebula-card-details]', intents: ['nebula:payment-method-selection-requested', 'nebula:saved-payment-method-chooser-requested', 'nebula:secure-payment-form-required', 'nebula:checkout-submit-requested'], rejection: 'nebula:card-details-request-rejected' },
        { root: '[data-nebula-checkout-review]', intents: ['nebula:saved-payment-method-chooser-requested', 'nebula:checkout-submit-requested'], rejection: 'nebula:checkout-request-rejected' },
        { root: '[data-nebula-card-error]', intents: ['nebula:payment-support-requested', 'nebula:wallet-payment-intent-requested', 'nebula:saved-payment-method-intent-requested', 'nebula:payment-method-chooser-requested'], rejection: 'nebula:card-payment-error-request-rejected' },
        { root: '[data-nebula-payment-error]', intents: ['nebula:payment-support-requested', 'nebula:alternate-payment-method-requested'], rejection: 'nebula:payment-error-request-rejected' },
        { root: '[data-nebula-discount-offer]', intents: ['nebula:discounted-checkout-requested'], rejection: 'nebula:discounted-checkout-rejected' },
        { root: '[data-nebula-continuation-topup]', intents: ['nebula:continuation-checkout-required'], rejection: 'nebula:continuation-checkout-rejected' },
        { root: '[data-nebula-one-click]', intents: ['nebula:one-click-topup-requested', 'nebula:continuation-decline-requested'], rejection: 'nebula:one-click-request-rejected' },
        { root: '[data-nebula-followup-offer]', intents: ['nebula:consultation-offer-accept-requested'], rejection: 'nebula:followup-offer-accept-rejected' },
        { root: '[data-nebula-notify-destination]', intents: ['nebula:notification-destination-requested'], rejection: 'nebula:notification-destination-rejected' },
    ];
    const rejectionPairFor = (event) => {
        const target = event?.target instanceof Element ? event.target : null;
        if (!target) return null;
        return rejectionPairs.find((pair) => pair.intents.includes(event.type) && target.closest(pair.root));
    };
    const render = (entry) => {
        log.textContent = entry
            ? `${entry.type.replace('nebula:', '')}: ${entry.outcome} (fixtureOnly, backendCalled=false, persisted=false)`
            : 'Waiting for a UI intent.';
        if (!entry) {
            history.replaceChildren();
            return;
        }
        const item = document.createElement('li');
        item.textContent = `${entry.type.replace('nebula:', '')} — ${entry.outcome}`;
        item.dataset.fixtureOutcome = entry.outcome;
        history.append(item);
        while (history.children.length > 12) history.firstElementChild.remove();
    };
    const receive = (event) => {
        if (!event || !intents.includes(event.type)) return;
        const entry = { type: event.type, detail: event.detail ?? null, outcome: outcome.value };
        events.push(entry);
        render(entry);
        if (entry.outcome === 'rejected') {
            const pair = rejectionPairFor(event);
            const owner = pair ? event.target.closest(pair.root) : null;
            if (pair && owner && event.detail && typeof event.detail === 'object') {
                owner.dispatchEvent(new CustomEvent(pair.rejection, {
                    detail: { ...event.detail, fixtureOnly: true, backendCalled: false, persisted: false },
                    bubbles: true,
                }));
            }
        }
        document.dispatchEvent(new CustomEvent('nebula:fixture-host-response', {
            detail: { intent: entry.type, outcome: entry.outcome, fixtureOnly: true, backendCalled: false, persisted: false },
        }));
    };

    intents.forEach((intent) => document.addEventListener(intent, receive));

    const activate = (control, callback) => {
        control.dataset.fixtureInteractive = 'true';
        control.setAttribute('role', 'button');
        control.tabIndex = 0;
        control.addEventListener('click', callback);
        control.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            callback();
        });
    };

    const setupChatroomFixture = () => {
        const chat = document.querySelector('[data-nebula-chatroom]');
        if (!chat) return;
        // Chatroom C76 has no source-proven post-send bubble, delivery metadata,
        // search result, or local favorite/pin state. Keep all those visual
        // source affordances inert even in the opt-in fixture inspector.
        chat.dataset.fixtureChatBoundary = 'host-intent-only';
    };

    const setupActiveChatFixture = () => {
        if (params.get('state') !== 'active') return;
        const active = document.querySelector('[data-nebula-chatroom-active]');
        const timer = active?.querySelector('[data-active-timer]') || active?.querySelector('.active-end small');
        if (!active || !timer) return;
        let elapsed = 6;
        let interval = null;
        let running = false;
        const renderTimer = () => {
            const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
            const seconds = String(elapsed % 60).padStart(2, '0');
            timer.textContent = `00:${minutes}:${seconds}`;
        };
        const pause = () => {
            if (!running) return;
            running = false;
            if (interval !== null) window.clearInterval(interval);
            interval = null;
            active.dataset.fixtureTimer = 'paused-locally';
            renderTimer();
        };
        const resume = () => {
            if (running) return;
            running = true;
            active.dataset.fixtureTimer = 'running-locally';
            interval = window.setInterval(() => { if (running) { elapsed += 1; renderTimer(); } }, 1000);
        };
        renderTimer();
        resume();
        active.addEventListener('nebula:consultation-start-intent-required', resume);
        active.addEventListener('nebula:consultation-pause-intent-required', pause);
        active.addEventListener('nebula:end-chat-intent-required', pause);
        window.addEventListener('pagehide', pause, { once: true });
    };

    const setupNotificationFixtures = () => {
        const pages = document.querySelectorAll('[data-nebula-messages-from-psychics], [data-nebula-special-offers], [data-nebula-system-messages], [data-nebula-daily-horoscope]');
        pages.forEach((page) => {
            page.querySelectorAll('[data-notification-toggle]').forEach((control) => {
                control.dataset.fixtureInteractive = 'page-owned';
            });
            const labelFor = (control) => control.querySelector('span')?.textContent.trim() || 'Notification preference';
            const initialState = (control) => {
                const sourceLabel = control.getAttribute('aria-label') || '';
                return /:\s*on\b/i.test(sourceLabel) || Boolean(control.querySelector('img[src*="on.svg"]'));
            };
            const prepare = (control) => {
                if (!control || control.dataset.fixtureInteractive === 'true') return;
                // Notification pages already own controls marked with
                // data-notification-toggle. The fixture inspector must not
                // attach a second click/keyboard handler or change their
                // button semantics; it only records the host intent above.
                if (control.matches('[data-notification-toggle]')) {
                    control.dataset.fixtureInteractive = 'page-owned';
                    return;
                }
                const label = labelFor(control);
                let checked = initialState(control);
                const renderState = () => {
                    control.dataset.fixturePreferenceDraft = checked ? 'on' : 'off';
                    control.classList.toggle('is-fixture-selected', checked);
                    control.setAttribute('aria-checked', String(checked));
                    control.setAttribute('aria-label', `${label}: ${checked ? 'on' : 'off'} (local fixture)`);
                };
                const toggle = () => {
                    checked = !checked;
                    renderState();
                    page.dataset.fixturePreferenceDraft = 'changed-locally';
                };
                control.dataset.fixtureInteractive = 'true';
                control.setAttribute('role', 'switch');
                control.tabIndex = 0;
                control.addEventListener('click', toggle);
                control.addEventListener('keydown', (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    toggle();
                });
                renderState();
            };

            prepare(page.querySelector('.nb-messages-card--allow'));
            page.querySelectorAll('.nb-messages-card--channels > div').forEach(prepare);
        });
    };

    setupChatroomFixture();
    setupActiveChatFixture();
    setupNotificationFixtures();

    root.querySelector('[data-fixture-clear]').addEventListener('click', () => {
        events.length = 0;
        render(null);
    });

    window.NebulaFixtureHost = Object.freeze({
        mode: 'in-memory',
        getEvents: () => events.map((entry) => ({ ...entry })),
        getLastEvent: () => events.length ? { ...events[events.length - 1] } : null,
        clear: () => { events.length = 0; render(null); },
    });
})();
