(function () {
  'use strict';
  const {role, lang, can, store, t, error} = ReviewAdminUI;
  const byId = id => document.getElementById(id);
  const rows = byId('rating-rows');
  const dialog = byId('review-detail');
  if (!rows || !can('view') || !can('rating') || !can('settings')) return;

  const en = lang === 'en';
  const title = byId('review-detail-title');
  const count = byId('review-detail-count');
  const body = byId('review-detail-body');
  const list = byId('review-detail-list');
  const empty = byId('review-detail-empty');
  const close = byId('review-detail-close');
  const pages = byId('review-detail-pages');
  const range = byId('review-detail-range');
  const previous = byId('review-detail-prev');
  const next = byId('review-detail-next');
  const pageSize = 10;
  const dateFormat = new Intl.DateTimeFormat(en ? 'en-GB' : 'ru-RU', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
  });
  const scoreFormat = new Intl.NumberFormat(en ? 'en-GB' : 'ru-RU', {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  });
  const ratingLine = ({rating, votes}) =>
    (rating === null ? '—' : scoreFormat.format(rating)) + (en ? ' · Votes: ' : ' · Голосов: ') + votes;
  let returnFocus;
  let reviews = [], page = 0;
  close.title = t('close');
  close.setAttribute('aria-label', close.title);
  close.onclick = () => dialog.close();
  for (const [button, label] of [[previous,en ? 'Previous page' : 'Предыдущая страница'],
                                 [next,en ? 'Next page' : 'Следующая страница']]) {
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-controls', 'review-detail-list');
  }
  previous.onclick = () => changePage(-1, previous);
  next.onclick = () => changePage(1, next);

  function changePage(step, control) {
    const target = page + step;
    if (target < 0 || target * pageSize >= reviews.length) return;
    page = target;
    renderPage();
    if (control.disabled) (control === next ? previous : next).focus({preventScroll:true});
  }

  function renderPage() {
    const start = page * pageSize;
    const end = Math.min(start + pageSize, reviews.length);
    pages.hidden = reviews.length <= pageSize;
    list.replaceChildren(...reviews.slice(start, end).map(reviewEntry));
    list.scrollTop = 0;
    body.scrollTop = 0;
    previous.disabled = start === 0;
    next.disabled = end === reviews.length;
    range.textContent = pages.hidden ? '' : (start + 1) + '–' + end + (en ? ' of ' : ' из ') + reviews.length;
  }

  function item(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function reviewEntry(review, index) {
    const entry = item('details', 'review-detail-entry');
    const summary = item('summary');
    const meta = item('span', 'review-detail-meta');
    const date = item('time', null, dateFormat.format(new Date(review.createdAt)) + ' UTC');
    date.dateTime = review.createdAt;
    meta.append(item('strong', null, review.id), date);
    const score = item('span', 'review-detail-rating');
    const star = item('i', 'fa fa-star');
    star.setAttribute('aria-hidden', 'true');
    score.append(star, item('span', null, review.stars + ' / 5'));
    summary.append(meta, score);
    const content = item('div', 'review-detail-content');
    const author = review.author + (review.anonymous ? ' (' + (en ? 'anonymous on site' : 'анонимно на сайте') + ')' : '');
    const authorInfo = item('dl', 'review-detail-author');
    authorInfo.append(item('dt', null, t('reviewDetailAuthor')), item('dd', null, author));
    content.append(authorInfo);
    if (review.text.trim()) {
      content.append(item('h4', 'review-detail-section-title', t('textColumn')),
        item('p', 'review-detail-text', review.text));
    } else {
      content.append(item('p', 'review-detail-no-comment', t('noText')));
    }
    entry.open = index === 0 && reviews.length <= pageSize;
    entry.append(summary, content);
    return entry;
  }

  rows.addEventListener('click', event => {
    const trigger = event.target.closest('[data-rating-review-expert]');
    if (!trigger) return;
    const expert = ReviewAdminWorkflow.experts.find(item => item.id === trigger.dataset.ratingReviewExpert);
    if (!expert) return;
    try {
      reviews = store.list(role)
        .filter(review => review.expertId === expert.id && review.status === 'published')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id, 'en', {numeric:true}));
      const {published, base, effective} = store.ratingComparison(expert.id);
      title.textContent = expert.name;
      byId('review-detail-expert').textContent = t('expert') + ' #' + expert.id.replace(/^EX-/, '');
      count.textContent = '(' + reviews.length + ')';
      byId('review-detail-published').textContent = ratingLine(published);
      byId('review-detail-base').textContent = base.votes === 0 ? (en ? 'Not set' : 'Не задана') :
        ratingLine(base) + (effective.mode === 'manual' ? '' : (en ? ' (not applied)' : ' (не учитывается)'));
      byId('review-detail-total').textContent = ratingLine(effective);
      empty.textContent = en ? 'No published ratings yet.' : 'Опубликованных оценок пока нет.';
      empty.hidden = reviews.length > 0;
      page = 0;
      renderPage();
      returnFocus = trigger;
      dialog.showModal();
      title.focus({preventScroll:true});
    } catch (e) {
      const feedback = byId('admin-feedback');
      feedback.textContent = error(e);
      feedback.hidden = false;
    }
  });

  dialog.addEventListener('close', () => {
    const trigger = returnFocus?.isConnected ? returnFocus :
      [...rows.querySelectorAll('[data-rating-review-expert]')]
        .find(button => button.dataset.ratingReviewExpert === returnFocus?.dataset.ratingReviewExpert);
    (trigger || byId('rating-search')).focus({preventScroll:true});
    returnFocus = null;
    reviews = [];
    list.replaceChildren();
  });
})();
