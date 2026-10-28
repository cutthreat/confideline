(function () {
  'use strict';
  if (window.confidelineExpertCardKeys) return;
  window.confidelineExpertCardKeys = true;
  document.addEventListener('keydown', function (event) {
    const details = event.target.closest('.cl-expert-card .cl-expert-more[open]');
    if (event.key !== 'Escape' || !details) return;
    details.open = false;
    details.querySelector('summary').focus({preventScroll: true});
    event.preventDefault();
  });
})();
