(() => {
  'use strict';

  const root = document.querySelector('[data-nebula-personal-data]');
  const action = root?.querySelector('[data-personal-data-action="deletion-unbound"]');

  if (!root || !action) {
    return;
  }

  const emitUnbound = () => {
    root.dataset.deletionCapability = 'backend_capability_unbound';
    action.dataset.deletionState = 'unbound';
    action.setAttribute('aria-pressed', 'true');
    action.setAttribute('aria-busy', 'false');
    const status = root.querySelector('[data-personal-data-status]');
    if (status) {
      status.textContent = 'Deletion is unavailable until a server-authorized capability is connected.';
    }
    root.dispatchEvent(new CustomEvent('nebula:personal-data-deletion-unbound', {
      bubbles: true,
      detail: {
        capability: 'backend_capability_unbound',
        backendRequired: true,
        deletionRequested: false,
        accountMutated: false,
        successShown: false,
        staticProjection: true,
      },
    }));
  };

  action.addEventListener('click', emitUnbound);
  action.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      emitUnbound();
    }
  });
})();
