(() => {
  const root = document.querySelector('[data-nebula-question-before-start]');
  if (!root) return;

  const frame = root.querySelector('.question-before-start__frame');
  const modal = root.querySelector('.question-before-start__modal');
  const close = root.querySelector('[data-question-action="close"]');
  const subject = root.querySelector('[data-question-subject]');
  const dob = root.querySelector('[data-question-dob]');
  const details = root.querySelector('[data-question-details]');
  const attachment = root.querySelector('[data-question-action="attachment-intent"]');
  const submit = root.querySelector('[data-question-action="submit-intent"]');
  const live = root.querySelector('[data-question-live]');
  if (!frame || !modal || !close || !subject || !dob || !details || !attachment || !submit) return;
  let opener = null;

  const announce = (message) => {
    if (live) live.textContent = message;
  };

  root.addEventListener('nebula:question-before-start-open', () => {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    frame.hidden = false;
    root.dataset.lastAction = 'question-before-start-opened';
    subject.focus();
    announce('Question form opened.');
  });

  const closeFixture = () => {
    frame.hidden = true;
    root.dataset.lastAction = 'close-intent-owner-transition-required';
    announce('Question form close intent recorded.');
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-dismiss-required', {
      bubbles: true,
      detail: { dismissOnly: true, backendRequired: true, staticProjection: true, sessionCreated: false }
    }));
    opener?.focus();
  };

  close.addEventListener('click', closeFixture);
  frame.addEventListener('click', (event) => {
    if (event.target === frame) closeFixture();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFixture();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, subject, dob, details, attachment, submit];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  attachment.addEventListener('click', () => {
    root.dataset.lastAction = 'attachment-policy-required';
    announce('Attachment selection requires the server file policy.');
  });

  const validDob = (value) => {
    if (!value) return true;
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    return parsed.getUTCFullYear() === year
      && parsed.getUTCMonth() === month - 1
      && parsed.getUTCDate() === day
      && parsed.getTime() <= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  };

  submit.addEventListener('click', () => {
    const dobValue = dob.value.trim();
    const dobValid = validDob(dobValue);
    dob.setAttribute('aria-invalid', dobValid ? 'false' : 'true');
    if (!dobValid) {
      dob.focus();
      root.dataset.lastAction = 'validation-dob-invalid';
      announce('Enter a valid date of birth in DD.MM.YYYY format.');
      return;
    }
    const body = details.value.trim();
    details.setAttribute('aria-invalid', body ? 'false' : 'true');
    if (!body) {
      details.focus();
      root.dataset.lastAction = 'validation-question-required';
      announce('Enter a detailed question.');
      return;
    }
    root.dataset.lastAction = 'free-message-submit-intent-backend-required';
    announce('The question is ready. Sending requires the permanent dialogue backend.');
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-submit-required', {
      bubbles: true,
      detail: {
        subjectLength: subject.value.trim().length,
        hasDob: Boolean(dobValue),
        detailsLength: body.length,
        attachmentSelected: false,
        backendRequired: true,
        persisted: false,
        sessionCreated: false,
        staticProjection: true
      }
    }));
  });
})();
