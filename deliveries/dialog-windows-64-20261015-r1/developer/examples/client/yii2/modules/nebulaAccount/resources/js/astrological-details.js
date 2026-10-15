(() => {
    const root = document.querySelector('.astrological-details');
    const dialog = root?.querySelector('[role="dialog"]');
    const origin = root?.querySelector('[data-origin-trigger]');
    const back = root?.querySelector('[data-action="back"]');
    if (!root || !dialog || !back) return;

    const controls = () => [...dialog.querySelectorAll('button')].filter((node) => !node.disabled);
    const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { ...detail, backendRequired: true, staticProjection: true, routeIntentUnbound: true } }));
    const dismiss = () => { emit('nebula:astrological-details-dismiss-required', { dismissOnly: true }); origin?.focus(); };

    root.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') root.dataset.keyboardNavigation = 'true';
    });
    root.addEventListener('pointerdown', () => { delete root.dataset.keyboardNavigation; });

    root.querySelector('[data-action="back"]')?.addEventListener('click', () => emit('nebula:astrological-details-back-required', { navigationPerformed: false }));
    root.querySelector('[data-action="dismiss"]')?.addEventListener('click', dismiss);
    root.querySelector('[data-action="continue"]')?.addEventListener('click', () => emit('nebula:astrological-details-continue-required', { persisted: false, profileMutation: false, matchingStarted: false }));
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); dismiss(); return; }
        if (event.key !== 'Tab') return;
        const list = controls(); const first = list[0]; const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    if (!root.hidden) back.focus();
})();
