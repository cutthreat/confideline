/* Verification examples only. No transport, credentials or persistent mutation. */
(function () {
    'use strict';
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    var STATES = { idle: 'Не верифицирован', verified: 'Верифицирован', denied: 'Нет права подтверждения',
        pending: 'Подтверждение выполняется', failed: 'Подтверждённая ошибка', unknown: 'Результат неизвестен', unavailable: 'Данные недоступны' };
    function init() {
        var content = document.querySelector('.content');
        var cell = content && content.querySelector('td[data-user-verified]');
        if (!cell || !window.AdminUserVerification || content.querySelector('#userVerificationExample')) return;
        var row = cell.closest('tr[data-key]');
        var id = row.getAttribute('data-key');
        var group = document.createElement('div');
        group.className = 'form-group';
        var label = document.createElement('label');
        label.htmlFor = 'userVerificationExample';
        label.textContent = 'Верификация пользователя ' + id + ' (пример)';
        var select = document.createElement('select');
        select.id = 'userVerificationExample';
        select.className = 'form-control';
        Object.keys(STATES).forEach(function (key) {
            var option = document.createElement('option');
            option.value = key; option.textContent = STATES[key];
            if (key === 'idle') option.selected = true;
            select.appendChild(option);
        });
        var note = document.createElement('p');
        note.className = 'text-muted';
        note.textContent = 'Синтетический пример верификации. Состояние аккаунта на сайте не меняется.';
        group.append(label, select, note);
        content.querySelector('.grid-view').before(group);
        function render() {
            window.AdminUserVerification.render(cell, { user_id: id,
                verified: select.value === 'unavailable' ? null : select.value === 'verified',
                state: ['verified', 'unavailable'].includes(select.value) ? 'idle' : select.value,
                can_set_verified: ['idle', 'failed'].includes(select.value) });
        }
        select.addEventListener('change', render);
        cell.addEventListener('admin:userverificationrequest', function () {
            // A local example reply is not evidence of an authorized server set-verification.
            select.value = 'verified';
            render();
            document.dispatchEvent(new CustomEvent('admin:previewnotice', {
                detail: { message: 'Пример: верификация установлена. Запрос на сервер не отправлялся.' }
            }));
        });
        render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    if (window.jQuery) window.jQuery(document).on('pjax:end.userPreview', init);
}());
