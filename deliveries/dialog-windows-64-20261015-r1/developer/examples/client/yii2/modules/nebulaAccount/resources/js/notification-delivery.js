(() => {
    const root = document.querySelector('.delivery');
    const dialog = root?.querySelector('[role="dialog"]');
    const close = root?.querySelector('.delivery__close');
    const origin = root?.querySelector('[data-origin-trigger]');

    if (!dialog || !close) {
        return;
    }

    const focusable = () => [...dialog.querySelectorAll('button, input, textarea, [tabindex]')]
        .filter((element) => !element.disabled && element.tabIndex >= 0);

    const dismiss = () => {
        root.dispatchEvent(new CustomEvent('nebula:notification-delivery-dismiss-required', {
            bubbles: true,
            detail: {
                dismissOnly: true,
                backendRequired: true,
                staticProjection: true,
            },
        }));
        origin?.focus();
    };

    root.querySelectorAll('[data-intent]').forEach((control) => {
        control.addEventListener('click', () => {
            root.dispatchEvent(new CustomEvent('nebula:notification-delivery-required', {
                bubbles: true,
                detail: {
                    channel: control.dataset.intent,
                    backendRequired: true,
                    staticProjection: true,
                    persisted: false,
                    notificationSent: false,
                },
            }));
        });
    });

    close.addEventListener('click', dismiss);
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            dismiss();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const controls = focusable();
        if (!controls.length) {
            return;
        }

        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    close.focus();
})();
