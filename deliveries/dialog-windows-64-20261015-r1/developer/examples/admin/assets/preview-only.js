/* Static preview safety only. Do not include in the real admin application. */
(function () {
    'use strict';
    var FEEDBACK_MS = 3200; // Lifetime of the single fixed demo notice.
    var notice, timer;
    function showNotice(message) {
        if (!notice) {
            notice = document.createElement('div');
            notice.setAttribute('role', 'status');
            notice.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:10000;max-width:calc(100vw - 32px);padding:12px 16px;border-radius:6px;background:#25374b;color:#fff;box-shadow:0 4px 20px #0002;font:13px/1.5 sans-serif';
            document.body.appendChild(notice);
        }
        notice.textContent = message;
        notice.hidden = false;
        clearTimeout(timer);
        timer = setTimeout(function () { notice.hidden = true; }, FEEDBACK_MS);
    }
    function explain(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showNotice('Static preview: this action does not contact the live server.');
    }
    document.addEventListener('admin:previewnotice', function (event) {
        showNotice(String(event.detail.message));
    });
    document.addEventListener('submit', function (event) {
        if (event.target.matches('#partnerRewardForm[data-preview-local-form],#orderRefundDraftForm[data-preview-local-form]')) return;
        explain(event);
    }, true);
    document.addEventListener('click', function (event) {
        var control = event.target.closest('a,button,input[type="submit"]');
        if (!control) return;
        if (control.closest('#partnerRewardForm[data-preview-local-form],#orderRefundDraftForm[data-preview-local-form]')) return;
        if (control.matches('.sidebar-toggle,[data-toggle="dropdown"],[data-toggle="collapse"],[data-toggle="tab"],[data-toggle="modal"],[data-dismiss]')) return;
        if (control.dataset.previewBlocked || control.matches('button:not([type="button"]),input[type="submit"]')) explain(event);
    }, true);
}());
