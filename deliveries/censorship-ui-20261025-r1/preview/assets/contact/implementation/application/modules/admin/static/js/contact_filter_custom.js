/* Production UI enhancements only. Native Yii POST forms remain authoritative. */
(() => {
  'use strict';
  const CONFIG = Object.freeze({
    filterDebounceMs: 300, // Delay before submitting a changed list filter.
    lookupDebounceMs: 250, // Delay before a configured user lookup request.
    lookupPageSize: 20, // Requested user lookup page size; the server enforces its limit.
    feedbackMs: 4400, // Lifetime of the centralized operation notice.
    ruleLabelMaxChars: 100, // Matches the existing rule-save label limit.
    patternMaxBytes: 500, // Matches PHP compilePattern's UTF-8 byte limit.
    examplesMaxBytes: 4000, // Matches rule-save's limit for each examples field.
    overflowTolerancePx: 1, // Ignore subpixel horizontal overflow.
    pendingStatus: 'pending', // Initial review state for a detected contact.
    journalDefaultStatus: 'pending', // Default journal filter, also restored by Reset.
    confirmedStatus: 'confirmed', // Review result submitted by the inline confirmation button.
    dateValueFormat: 'YYYY-MM-DD', // Stable GET format; the backend applies its configured timezone.
    dateDisplayFormat: 'DD.MM.YY', // Compact date presentation in the journal filter.
    dateRangeSeparator: ' – ', // Display separator; never parse this text on the backend.
    datePickerGutterPx: 8, // Minimum gap between the calendar popup and viewport edges.
  });
  const CATEGORIES = Object.freeze({phone: 'Телефон', email: 'E-mail', link: 'Ссылка', messenger: 'Мессенджер'});
  const STATUSES = Object.freeze({pending: 'На проверке', confirmed: 'Подтверждено', false_positive: 'Ложное срабатывание'});
  const REVIEW_NOTES = Object.freeze({
    pending: 'Срабатывание ещё не проверено.',
    confirmed: 'Срабатывание подтверждено. Текст в чате не изменяется.',
    false_positive: 'Не учитывается как нарушение. Оригинал в чате не восстанавливается.',
  });
  const root = document.querySelector('[data-contact-filter-page]');
  if (!root || root.dataset.contactUiBound) return;
  root.dataset.contactUiBound = '1';
  document.body.classList.add('has-contact-filter');
  // Yii renders view content inside .wrapper; modal controls must remain outside its inert background.
  const wrapper = document.querySelector('.wrapper');
  document.querySelectorAll('#contactRuleModal,#contactReviewModal,#contactOriginalModal,#contactFilterFeedback').forEach(node => {
    if (wrapper?.contains(node)) document.body.append(node);
  });
  let currentModal = null;
  let previousFocus = null;
  let filterTimer;
  let feedbackTimer;

  function notify(message, error = false) {
    if (document.querySelector('script[src="assets/preview-only.js"]')) {
      document.dispatchEvent(new CustomEvent('admin:previewnotice', {detail: {message, error}}));
      return;
    }
    const notice = document.getElementById('contactFilterFeedback');
    if (!notice) return;
    clearTimeout(feedbackTimer);
    notice.textContent = message;
    notice.classList.toggle('is-error', error);
    notice.hidden = false;
    feedbackTimer = setTimeout(() => { notice.hidden = true; }, CONFIG.feedbackMs);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    window.jQuery?.('[data-cf-date-range]').data('daterangepicker')?.hide();
    if (window.jQuery?.fn.select2) {
      root.querySelectorAll('[data-cf-person-select]').forEach(select => {
        if (window.jQuery(select).data('select2')) window.jQuery(select).select2('close');
      });
    }
    if (currentModal) closeModal(false);
    previousFocus = document.activeElement;
    currentModal = modal;
    modal.hidden = false;
    document.body.classList.add('cf-modal-open');
    document.querySelector('.wrapper').inert = true;
    const deleteForm = modal.querySelector('[data-cf-delete-raw]');
    if (deleteForm) {
      deleteForm.dataset.deleteConfirmed = 'false';
      deleteForm.querySelector('[data-cf-request-delete]').hidden = false;
      deleteForm.querySelector('[data-cf-delete-confirmation]').hidden = true;
    }
    const focus = modal.querySelector('[data-initial-focus]') || modal.querySelector('input:not([type="hidden"]),select,textarea,button');
    focus?.focus({preventScroll: true});
  }

  function closeModal(restoreFocus = true) {
    if (!currentModal) return;
    const closed = currentModal;
    closed.hidden = true;
    closed.querySelectorAll('[data-raw-text]').forEach(node => { node.textContent = ''; });
    currentModal = null;
    document.body.classList.remove('cf-modal-open');
    document.querySelector('.wrapper').inert = false;
    if (restoreFocus) {
      let target = previousFocus?.isConnected ? previousFocus : null;
      if (!target && previousFocus?.dataset.cfEditRule) target = root.querySelector(`[data-cf-edit-rule="${previousFocus.dataset.cfEditRule}"]`);
      const previousIncidentId = previousFocus?.dataset.incidentId || previousFocus?.closest('[data-incident-id]')?.dataset.incidentId;
      if (!target && previousIncidentId) target = root.querySelector(`[data-cf-review][data-incident-id="${previousIncidentId}"]`);
      (target || root.querySelector('.cf-scroll'))?.focus({preventScroll: true});
    }
    root.dispatchEvent(new CustomEvent('contact-filter:modal-closed', {detail: {id: closed.id}}));
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(field => {
      field.removeAttribute('aria-invalid');
      if (field.getAttribute('aria-describedby') === `${field.id}-error`) field.removeAttribute('aria-describedby');
    });
    form.querySelectorAll('.cf-field-error').forEach(node => node.remove());
  }

  function fieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    const error = document.createElement('span');
    error.className = 'cf-field-error';
    error.id = `${field.id}-error`;
    error.textContent = message;
    field.setAttribute('aria-describedby', error.id);
    field.insertAdjacentElement('afterend', error);
  }

  function validateRule(form) {
    clearErrors(form);
    const checks = [
      ['label', value => value.trim() && Array.from(value.trim()).length <= CONFIG.ruleLabelMaxChars, 'Введите название, не более 100 символов.'],
      ['category', value => Object.hasOwn(CATEGORIES, value), 'Выберите категорию.'],
      ['pattern', value => value.trim() && new TextEncoder().encode(value.trim()).length <= CONFIG.patternMaxBytes, 'Введите PCRE-шаблон, не более 500 байт UTF-8.'],
      ['positive_examples', value => value.trim() && new TextEncoder().encode(value.trim()).length <= CONFIG.examplesMaxBytes, 'Добавьте пример совпадения, не более 4000 байт.'],
      ['negative_examples', value => value.trim() && new TextEncoder().encode(value.trim()).length <= CONFIG.examplesMaxBytes, 'Добавьте пример без совпадения, не более 4000 байт.'],
    ];
    let firstInvalid;
    for (const [name, valid, message] of checks) {
      const field = form.elements.namedItem(name);
      if (!valid(field.value)) {
        fieldError(field, message);
        firstInvalid ||= field;
      }
    }
    if (firstInvalid) {
      const advanced = firstInvalid.closest('details');
      if (advanced) advanced.open = true;
      firstInvalid.focus();
      return false;
    }
    // Only PHP may validate PCRE syntax, runtime and good/bad examples.
    return true;
  }

  function editRule(id) {
    if (root.dataset.canManage !== 'true') return;
    const form = document.getElementById('contactRuleForm');
    const model = document.getElementById(`contact-rule-${id}`);
    if (!form || (id && !model)) return;
    form.reset();
    clearErrors(form);
    const rule = id ? JSON.parse(model.textContent) : {};
    for (const name of ['id', 'label', 'category', 'pattern', 'positive_examples', 'negative_examples']) {
      const field = form.elements.namedItem(name);
      field.value = rule[name] ?? (name === 'category' ? 'phone' : '');
    }
    form.elements.namedItem('is_enabled').checked = Boolean(rule.is_enabled);
    form.querySelector('details').open = !id;
    document.getElementById('contactRuleModalTitle').textContent = id ? 'Редактировать правило' : 'Новое правило';
    openModal('contactRuleModal');
  }

  function editReview(button) {
    if (root.dataset.canManage !== 'true') return;
    const form = document.getElementById('contactReviewForm');
    form.action = button.dataset.reviewAction;
    form.dataset.incidentId = button.dataset.incidentId;
    form.elements.namedItem('status').value = button.dataset.reviewStatus || CONFIG.pendingStatus;
    document.getElementById('contactReviewIncident').textContent = `Срабатывание #${button.dataset.incidentId}`;
    updateReviewNote();
    openModal('contactReviewModal');
  }

  function updateReviewNote() {
    const form = document.getElementById('contactReviewForm');
    const note = document.getElementById('contactReviewNote');
    if (form && note) note.textContent = REVIEW_NOTES[form.elements.namedItem('status').value] || '';
  }

  function submitFilters() {
    clearTimeout(filterTimer);
    const form = document.getElementById('contactFilterForm');
    if (!form) return;
    form.elements.namedItem('page').value = '1';
    form.requestSubmit();
  }

  function syncDateRange() {
    const field = root.querySelector('[data-cf-date-range]');
    const form = document.getElementById('contactFilterForm');
    if (!field || !form || !window.moment) return;
    const start = window.moment(form.elements.namedItem('date_from').value, CONFIG.dateValueFormat, true);
    const end = window.moment(form.elements.namedItem('date_to').value, CONFIG.dateValueFormat, true);
    field.value = start.isValid() && end.isValid()
      ? `${start.format(CONFIG.dateDisplayFormat)}${CONFIG.dateRangeSeparator}${end.format(CONFIG.dateDisplayFormat)}`
      : start.isValid() ? `С ${start.format(CONFIG.dateDisplayFormat)}` : end.isValid() ? `До ${end.format(CONFIG.dateDisplayFormat)}` : '';
    field.title = field.value || 'Выбрать период';
    const picker = window.jQuery(field).data('daterangepicker');
    if (picker) {
      picker.setStartDate(start.isValid() ? start : window.moment().startOf('day'));
      picker.setEndDate(end.isValid() ? end : start.isValid() ? start : window.moment().endOf('day'));
    }
  }

  function initDateRange() {
    const $ = window.jQuery;
    const field = root.querySelector('[data-cf-date-range]');
    if (!field || !$?.fn.daterangepicker || !window.moment) return;
    const control = $(field);
    if (!control.data('daterangepicker')) {
      control.daterangepicker({
        parentEl: 'body', opens: 'left', autoUpdateInput: false, alwaysShowCalendars: true,
        locale: {
          format: CONFIG.dateDisplayFormat, separator: CONFIG.dateRangeSeparator,
          applyLabel: 'Применить', cancelLabel: 'Очистить', customRangeLabel: 'Период',
          firstDay: 1, daysOfWeek: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
          monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        },
      });
    }
    const picker = control.data('daterangepicker');
    picker.container.addClass('cf-date-picker').attr({role: 'dialog', 'aria-label': 'Выбор периода'});
    picker.container.find('.applyBtn').attr('aria-label', 'Применить период');
    picker.container.find('.cancelBtn').attr('aria-label', 'Очистить период');
    control.on('apply.daterangepicker.contactFilter', (_, selected) => {
      const form = document.getElementById('contactFilterForm');
      form.elements.namedItem('date_from').value = selected.startDate.format(CONFIG.dateValueFormat);
      form.elements.namedItem('date_to').value = selected.endDate.format(CONFIG.dateValueFormat);
      syncDateRange();
      submitFilters();
    });
    control.on('cancel.daterangepicker.contactFilter', () => {
      const form = document.getElementById('contactFilterForm');
      form.elements.namedItem('date_from').value = '';
      form.elements.namedItem('date_to').value = '';
      syncDateRange();
      submitFilters();
    });
    control.on('show.daterangepicker.contactFilter', () => {
      field.setAttribute('aria-expanded', 'true');
      const anchor = field.getBoundingClientRect();
      const height = picker.container.outerHeight();
      picker.drops = anchor.bottom + height > window.innerHeight && anchor.top > window.innerHeight - anchor.bottom ? 'up' : 'down';
      picker.move();
      const bounds = picker.container[0].getBoundingClientRect();
      const top = Math.max(CONFIG.datePickerGutterPx, Math.min(bounds.top, window.innerHeight - height - CONFIG.datePickerGutterPx));
      const marginTop = parseFloat(window.getComputedStyle(picker.container[0]).marginTop) || 0;
      picker.container.css('top', top + window.scrollY - marginTop);
    });
    control.on('hide.daterangepicker.contactFilter', () => field.setAttribute('aria-expanded', 'false'));
    field.addEventListener('keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      picker.show();
    });
    syncDateRange();
  }

  function initPeopleFilters() {
    const $ = window.jQuery;
    if (!$?.fn.select2) return;
    root.querySelectorAll('[data-cf-person-select]').forEach(select => {
      const field = $(select);
      if (!field.data('select2')) {
        const options = {
          theme: 'bootstrap', width: '100%', placeholder: select.dataset.placeholder || '',
          allowClear: true, minimumResultsForSearch: 0, dropdownCssClass: 'cf-person-dropdown',
          language: {
            noResults: () => 'Ничего не найдено',
            searching: () => 'Поиск…',
            errorLoading: () => 'Не удалось загрузить список',
          },
        };
        // Yii supplies an authorized URL when remote user lookup is connected.
        if (select.dataset.cfLookupUrl && root.dataset.preview !== 'true') {
          options.ajax = {
            url: select.dataset.cfLookupUrl, dataType: 'json', delay: CONFIG.lookupDebounceMs,
            data: params => ({q: params.term || '', page: params.page || 1, 'per-page': CONFIG.lookupPageSize}),
          };
        }
        field.select2(options);
      }
      const container = field.next('.select2-container');
      container.find('.select2-selection').removeAttr('aria-labelledby').attr('aria-label', select.getAttribute('aria-label'));
      const updateClearLabel = () => {
        const label = select.name === 'sender_user_id' ? 'Сбросить отправителя' : 'Сбросить получателя';
        container.find('.select2-selection__clear').attr({role: 'button', tabindex: '0', 'aria-label': label, title: label});
      };
      field.on('change.select2.contactFilterLabels', updateClearLabel);
      container.on('keydown.contactFilterPeople', '.select2-selection__clear', event => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        field.val('').trigger('change');
        field.select2('close');
        container.find('.select2-selection').trigger('focus');
      });
      updateClearLabel();
      field.on('change.contactFilterPeople', event => {
        // Native changes are already handled by the root listener below.
        if (!event.originalEvent) submitFilters();
      });
      field.on('select2:open.contactFilterPeople', () => {
        const search = document.querySelector('.cf-person-dropdown .select2-search__field');
        if (search) {
          search.setAttribute('aria-label', select.name === 'sender_user_id' ? 'Поиск отправителя' : 'Поиск получателя');
          search.focus({preventScroll: true});
        }
      });
    });
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const close = event.target.closest('[data-cf-close]');
    if (close || (event.target === currentModal)) { closeModal(); return; }
    const requestDelete = event.target.closest('[data-cf-request-delete]');
    const cancelDelete = event.target.closest('[data-cf-cancel-delete]');
    if (requestDelete || cancelDelete) {
      const form = (requestDelete || cancelDelete).closest('form');
      const confirmed = Boolean(requestDelete);
      form.dataset.deleteConfirmed = String(confirmed);
      form.querySelector('[data-cf-request-delete]').hidden = confirmed;
      form.querySelector('[data-cf-delete-confirmation]').hidden = !confirmed;
      (confirmed ? form.querySelector('button[type="submit"]') : form.querySelector('[data-cf-request-delete]')).focus();
      return;
    }
    const edit = event.target.closest('[data-cf-edit-rule]');
    if (edit && root.contains(edit)) { editRule(Number(edit.dataset.cfEditRule)); return; }
    const review = event.target.closest('[data-cf-review]');
    if (review && root.contains(review)) { editReview(review); return; }
    const sort = event.target.closest('[data-cf-sort]');
    const status = event.target.closest('[data-cf-status]');
    if ((sort || status) && root.contains(sort || status)) {
      event.preventDefault();
      const form = document.getElementById('contactFilterForm');
      if (sort) {
        const key = sort.dataset.cfSort;
        form.elements.namedItem('sort').value = form.elements.namedItem('sort').value === key ? `-${key}` : key;
      } else {
        form.elements.namedItem('status').value = status.dataset.cfStatus;
      }
      submitFilters();
      return;
    }
    const reset = event.target.closest('[data-cf-reset-filters]');
    if (reset && root.contains(reset)) {
      const form = document.getElementById('contactFilterForm');
      root.querySelectorAll('[data-cf-filter]').forEach(field => {
        field.value = field.name === 'status' && root.dataset.contactFilterPage === 'incidents' ? CONFIG.journalDefaultStatus : '';
        if (field.matches('[data-cf-person-select]') && window.jQuery?.fn.select2) {
          window.jQuery(field).trigger('change.select2');
        }
      });
      syncDateRange();
      submitFilters();
    }
  });

  document.addEventListener('keydown', event => {
    if (!currentModal) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...currentModal.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,summary')]
      .filter(node => !node.disabled && node.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.matches('#contactPolicyForm,#contactRuleForm,#contactReviewForm,[data-cf-approve],[data-cf-delete-raw]') && root.dataset.canManage !== 'true') {
      event.preventDefault();
      return;
    }
    if (form.matches('[data-cf-raw],[data-cf-delete-raw]') && root.dataset.canRaw !== 'true') {
      event.preventDefault();
      return;
    }
    if (form.matches('#contactRuleForm') && !validateRule(form)) { event.preventDefault(); return; }
    if (form.matches('[data-cf-delete-raw]') && form.dataset.deleteConfirmed !== 'true') {
      event.preventDefault();
    }
  });

  root.addEventListener('input', event => {
    if (!event.target.matches('[data-cf-filter]:not(select)')) return;
    clearTimeout(filterTimer);
    filterTimer = setTimeout(submitFilters, CONFIG.filterDebounceMs);
  });
  root.addEventListener('change', event => {
    if (event.target.matches('select[data-cf-filter], [data-cf-page-size]')) submitFilters();
    if (event.target.name === 'chatContactFilterEnabled') updatePolicy();
  });
  document.getElementById('contactReviewStatus')?.addEventListener('change', updateReviewNote);

  function updatePolicy() {
    const form = document.getElementById('contactPolicyForm');
    if (!form) return;
    const enabled = form.elements.namedItem('chatContactFilterEnabled').checked;
    form.classList.toggle('is-off', !enabled);
    const text = form.querySelector('.cf-policy-master span');
    if (text) text.textContent = enabled ? 'Фильтр включён' : 'Фильтр выключен';
  }

  const scroll = root.querySelector('.cf-scroll');
  const top = root.querySelector('.cf-top-scroll');
  function syncScrollbar() {
    if (!scroll || !top) return;
    top.hidden = scroll.scrollWidth <= scroll.clientWidth + CONFIG.overflowTolerancePx;
    top.firstElementChild.style.width = `${scroll.scrollWidth}px`;
    top.scrollLeft = scroll.scrollLeft;
  }
  if (scroll && top) {
    scroll.addEventListener('scroll', () => { if (top.scrollLeft !== scroll.scrollLeft) top.scrollLeft = scroll.scrollLeft; });
    top.addEventListener('scroll', () => { if (scroll.scrollLeft !== top.scrollLeft) scroll.scrollLeft = top.scrollLeft; });
    const observer = new ResizeObserver(syncScrollbar);
    observer.observe(scroll);
    observer.observe(scroll.querySelector('table'));
  }
  initPeopleFilters();
  initDateRange();
  updatePolicy();
  syncScrollbar();
  window.ContactFilterUI = Object.freeze({notify, openModal, closeModal, validateRule, syncScrollbar, syncDateRange, CATEGORIES, STATUSES, CONFIG});
})();
