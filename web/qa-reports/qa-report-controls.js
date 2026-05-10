(function () {
  const STORAGE_PREFIX = 'confideline.qa.report.';

  function getReportKey() {
    return STORAGE_PREFIX + location.pathname.replace(/\/+$/, '');
  }

  function classifyStatus(node) {
    const text = (node.textContent || '').toUpperCase();
    const cls = String(node.className || '').toLowerCase();
    if (cls.includes('fail') || /\bFAIL\b|P0|P1/.test(text)) return 'fail';
    if (cls.includes('warn') || /\bWARN\b|RECHECK|RETEST|INVALID|PARTIAL/.test(text)) return 'warn';
    if (cls.includes('pass') || /\bPASS\b/.test(text)) return 'pass';
    if (cls.includes('info') || /INFO|HANDOFF|CONTROL|UX\/UI|АРХИВ/.test(text)) return 'info';
    return '';
  }

  function filterTargets() {
    return Array.from(document.querySelectorAll([
      '.qa-table tbody tr',
      '.qa-status-card',
      '.qa-proof-card',
      '.qa-shot',
      '.evidence',
      '.qa-evidence-card',
      'figure',
      'article.tp-card',
      'section.card'
    ].join(','))).filter((node) => !node.closest('.qa-global-toolbar') && classifyStatus(node));
  }

  function applyFilters() {
    const enabled = new Set(Array.from(document.querySelectorAll('[data-qa-global-status]'))
      .filter((input) => input.checked)
      .map((input) => input.dataset.qaGlobalStatus));
    filterTargets().forEach((node) => {
      const status = classifyStatus(node);
      node.classList.toggle('qa-filter-hidden', !enabled.has(status));
    });
  }

  function buildToolbar() {
    if (document.querySelector('.qa-global-toolbar')) return;
    const toolbar = document.createElement('section');
    toolbar.className = 'qa-global-toolbar';
    toolbar.setAttribute('aria-label', 'Фильтры QA отчета');
    toolbar.innerHTML = [
      '<div class="qa-global-toolbar__row">',
      '<span class="qa-global-toolbar__title">Фильтр отчета:</span>',
      '<label class="qa-global-toolbar__pill"><input type="checkbox" data-qa-global-status="fail" checked> FAIL</label>',
      '<label class="qa-global-toolbar__pill"><input type="checkbox" data-qa-global-status="warn" checked> WARN</label>',
      '<label class="qa-global-toolbar__pill"><input type="checkbox" data-qa-global-status="pass" checked> PASS</label>',
      '<label class="qa-global-toolbar__pill"><input type="checkbox" data-qa-global-status="info" checked> INFO</label>',
      '<button class="qa-global-toolbar__button" type="button" data-qa-only-fail>Только FAIL</button>',
      '<button class="qa-global-toolbar__button" type="button" data-qa-show-all>Показать все</button>',
      '<input class="qa-global-toolbar__note" type="text" data-qa-done-note placeholder="Выполнено / комментарий Игоря">',
      '</div>',
      '<p class="qa-global-toolbar__hint">Фильтры работают локально в браузере. Поле комментария сохраняется в этом браузере; для общего статуса нужен коммит отчета.</p>'
    ].join('');

    const anchor = document.querySelector('main > header, .tp-hero, .hero, main');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(toolbar, anchor.nextSibling);
    else document.body.insertBefore(toolbar, document.body.firstChild);

    const note = toolbar.querySelector('[data-qa-done-note]');
    note.value = localStorage.getItem(getReportKey() + '.doneNote') || '';
    note.addEventListener('input', () => localStorage.setItem(getReportKey() + '.doneNote', note.value));
    toolbar.addEventListener('change', (event) => {
      if (event.target.matches('[data-qa-global-status]')) applyFilters();
    });
    toolbar.querySelector('[data-qa-only-fail]').addEventListener('click', () => {
      document.querySelectorAll('[data-qa-global-status]').forEach((input) => { input.checked = input.dataset.qaGlobalStatus === 'fail'; });
      applyFilters();
    });
    toolbar.querySelector('[data-qa-show-all]').addEventListener('click', () => {
      document.querySelectorAll('[data-qa-global-status]').forEach((input) => { input.checked = true; });
      applyFilters();
    });
    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToolbar);
  } else {
    buildToolbar();
  }
})();
