(() => {
  const form = document.querySelector('#conf-integrated-form');
  const input = document.querySelector('#conf-paid-capacity');
  const status = document.querySelector('#conf-paid-status');
  const feedback = document.querySelector('#conf-save-status');
  const note = document.querySelector('#paid-mode-note');
  if (!form || !input || !status || !feedback || !note) return;
  const params = new URLSearchParams(location.search);
  if (params.get('mode') === '2') {
    location.replace('../site-modes/mock/mode-2.html#chat');
    return;
  }
  const blocked = params.get('guard') || '';
  form.addEventListener('submit', event => {
    if (Number(input.value) !== 0 || !['active', 'booking', 'both'].includes(blocked)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    feedback.textContent = blocked === 'active'
      ? 'Дождитесь завершения активных платных консультаций.'
      : blocked === 'booking'
        ? 'Сначала разберите будущие подтверждённые записи.'
        : 'Дождитесь завершения консультаций и разберите будущие подтверждённые записи.';
    feedback.setAttribute('role', 'alert');
  }, true);
  input.addEventListener('input', () => feedback.setAttribute('role', 'status'));
})();
