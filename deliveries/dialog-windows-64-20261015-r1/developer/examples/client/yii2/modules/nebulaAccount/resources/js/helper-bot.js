(() => {
  'use strict';
  const root = document.querySelector('[data-helper-bot]');
  const form = root?.querySelector('[data-helper-composer]');
  const draft = form?.querySelector('textarea');
  const status = root?.querySelector('.hb-status');
  if (!root || !form || !draft) return;

  const send = form.querySelector('.hb-send');
  const syncDraft = () => {
    const ready = draft.value.trim().length > 0;
    if (send) send.disabled = !ready;
    root.dataset.composerState = ready ? 'ready' : 'empty';
  };
  draft.addEventListener('input', syncDraft);
  draft.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    form.requestSubmit();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!draft.value.trim()) {
      syncDraft();
      if (status) status.textContent = 'Enter a message first.';
      draft.focus();
      return;
    }
    const text = draft.value;
    root.dispatchEvent(new CustomEvent('nebula:helper-message-send-intent', {
      bubbles: true,
      detail: {
        text,
        fixtureOnly: true,
        messagePersisted: false,
        deliveryClaimed: false,
        botReplyGenerated: false,
        backendRequired: true
      }
    }));
    if (status) status.textContent = 'Message intent requires the Helper Bot host.';
    draft.focus();
  });
  syncDraft();
})();
