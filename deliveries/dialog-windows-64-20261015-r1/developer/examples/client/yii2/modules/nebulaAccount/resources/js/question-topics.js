(() => {
    'use strict';
    const root = document.querySelector('.topic-picker');
    if (!root) return;
    const status = root.querySelector('[data-topic-status]');
    const emitSelection = (control) => {
        const selected = control.getAttribute('aria-pressed') !== 'true';
        control.setAttribute('aria-pressed', String(selected));
        control.classList.toggle('is-selected', selected);
        if (status) status.textContent = `${control.dataset.topic || 'Topic'} ${selected ? 'selected' : 'cleared'} locally.`;
    };

    const topicControls = [...root.querySelectorAll('[data-topic]')];
    const setRovingTabIndex = (index) => {
        topicControls.forEach((control, controlIndex) => {
            control.tabIndex = controlIndex === index ? 0 : -1;
        });
    };
    const initialIndex = Math.max(0, topicControls.findIndex((control) => control.getAttribute('aria-pressed') === 'true'));
    setRovingTabIndex(initialIndex);

    topicControls.forEach((control, index) => {
        control.addEventListener('click', () => emitSelection(control));
        control.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const delta = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1;
                const targetIndex = event.key === 'Home' ? 0
                    : event.key === 'End' ? topicControls.length - 1
                    : (index + delta + topicControls.length) % topicControls.length;
                setRovingTabIndex(targetIndex);
                topicControls[targetIndex]?.focus();
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); emitSelection(control); }
        });
    });

    root.querySelector('[data-topic-action="next"]')?.addEventListener('click', () => {
        const selectedTopics = [...root.querySelectorAll('[data-topic][aria-pressed="true"]')]
            .map((control) => control.dataset.topic);
        root.dispatchEvent(new CustomEvent('nebula:question-topics-next-required', {
            bubbles: true,
            detail: {
                selectedTopics,
                backendRequired: true,
                staticProjection: true,
                persisted: false,
                profileMutation: false,
            },
        }));
        if (status) status.textContent = 'Next step requires the onboarding host.';
    });
})();
