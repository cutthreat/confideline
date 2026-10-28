(function () {
  'use strict';
  if (window.confidelineExpertCardKeys) return;
  window.confidelineExpertCardKeys = true;
  function photoFallback(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest('.cl-expert-card .cl-expert-photo')) return;
    const fallback = image.parentElement.querySelector('.cl-expert-photo-fallback');
    if (fallback) { image.hidden = true; fallback.hidden = false; }
  }
  function scanPhotos() {
    document.querySelectorAll('.cl-expert-card .cl-expert-photo img').forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) photoFallback(image);
    });
  }
  document.addEventListener('error', function (event) { photoFallback(event.target); }, true);
  document.addEventListener('pjax:end', scanPhotos);
  scanPhotos();
  const pinned = new WeakSet();
  document.addEventListener('pointerover', function (event) {
    const status = event.target.closest('.cl-expert-card .cl-expert-presence');
    if (status && event.pointerType !== 'touch') status.open = true;
  });
  document.addEventListener('pointerout', function (event) {
    const status = event.target.closest('.cl-expert-card .cl-expert-presence');
    if (status && !status.contains(event.relatedTarget) && !pinned.has(status) && !status.contains(document.activeElement)) status.open = false;
  });
  document.addEventListener('click', function (event) {
    const summary = event.target.closest('.cl-expert-card .cl-expert-presence summary');
    if (!summary) return;
    event.preventDefault();
    const status = summary.parentElement;
    if (pinned.has(status)) { pinned.delete(status); status.open = false; }
    else { pinned.add(status); status.open = true; }
  });
  document.addEventListener('focusin', function (event) {
    const status = event.target.closest('.cl-expert-card .cl-expert-presence');
    if (status) status.open = true;
  });
  document.addEventListener('focusout', function (event) {
    const status = event.target.closest('.cl-expert-card .cl-expert-presence');
    if (status && !status.contains(event.relatedTarget)) { pinned.delete(status); status.open = false; }
  });
  document.addEventListener('pointerdown', function (event) {
    document.querySelectorAll('.cl-expert-card .cl-expert-presence[open]').forEach(function (status) {
      if (!status.contains(event.target)) { pinned.delete(status); status.open = false; }
    });
  });
  document.addEventListener('keydown', function (event) {
    const rail = event.target.closest('.cl-catalog-filter .cl-expert-grid');
    if (rail === event.target && matchMedia('(max-width:575px)').matches && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      const items = [...rail.querySelectorAll(':scope > .cl-expert-item')];
      if (!items.length) return;
      const left = rail.getBoundingClientRect().left + 2;
      const current = items.reduce((best, item, index) => Math.abs(item.getBoundingClientRect().left-left) < Math.abs(items[best].getBoundingClientRect().left-left) ? index : best, 0);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length-1 : Math.max(0,Math.min(items.length-1,current+(event.key === 'ArrowRight' ? 1 : -1)));
      rail.scrollTo({left:rail.scrollLeft+items[next].getBoundingClientRect().left-left,behavior:'instant'});
      event.preventDefault();
      return;
    }
    const details = event.target.closest('.cl-expert-card details[open]');
    if (event.key !== 'Escape' || !details) return;
    details.open = false;
    pinned.delete(details);
    details.querySelector('summary').focus({preventScroll: true});
    event.preventDefault();
  });
})();
