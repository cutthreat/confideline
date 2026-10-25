/* Keep an in-panel action inside its disclosure even when a legacy renderer
 * synchronously replaces the clicked row. No data, calculations or requests. */
(function () {
  'use strict';
  const root = document.getElementById('confideline-interactions');
  if (!root) return;
  root.addEventListener('click', function (event) {
    const insidePanel = event.composedPath().some(function (node) {
      return node.classList && (node.classList.contains('cl-disclosure-body') || node.classList.contains('profile-picker-body'));
    });
    if (insidePanel) event.stopPropagation();
  });
})();
