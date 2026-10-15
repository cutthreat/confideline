/* Local filter preview only. Do not deploy with the live admin application. */
(function () {
    'use strict';
    var SOURCE_URL = document.currentScript.src; // Resolve the original local Select2 bundle.
    var SELECT2_ASSET = 'assets/vendor/e70e86a900ea-select2.full.min.js'; // Same Select2 as the transaction preview.
    var DEMO_ORDER_STATUSES = { '9': 'NEW', '11': 'IN_PROGRESS', '12': 'FAILED', '10': 'DECLINED', '6': 'EXPIRED' }; // Preview examples only; never persist or deploy these overrides.
    function initDemoStatuses(table) {
        if (!window.AdminOrderStatus) return;
        Object.keys(DEMO_ORDER_STATUSES).forEach(function (id) {
            var cell = table.querySelector('tbody tr[data-key="' + id + '"] .order-col-status');
            if (!cell) return;
            if (!cell.hasAttribute('data-preview-source-status')) cell.dataset.previewSourceStatus = cell.dataset.orderStatus || '';
            window.AdminOrderStatus.render(cell, DEMO_ORDER_STATUSES[id]);
        });
    }
    function decimalUnits(value) {
        var match = String(value).trim().match(/^([+-]?)(\d{1,32})(?:[.,](\d{1,2}))?$/);
        if (!match) return null;
        var units = BigInt(match[2]) * 100n + BigInt((match[3] || '').padEnd(2, '0'));
        return match[1] === '-' ? -units : units;
    }

    function initFilters(table) {
        var inputs = Array.from(table.querySelectorAll('.filters input[name]'));
        var selects = Array.from(table.querySelectorAll('.filters select[name]'));
        var empty = table.querySelector('.order-demo-empty');
        if (!empty) {
            empty = document.createElement('tr');
            empty.className = 'order-demo-empty';
            var message = document.createElement('td');
            empty.appendChild(message);
            table.querySelector('tbody').appendChild(empty);
        }
        empty.firstElementChild.colSpan = table.querySelector('thead tr').children.length;
        var emptyMessage = empty.querySelector('.order-demo-empty-message');
        if (!emptyMessage) {
            emptyMessage = document.createElement('span');
            emptyMessage.className = 'order-demo-empty-message';
            empty.firstElementChild.replaceChildren(emptyMessage);
        }

        function value(name) {
            var input = table.querySelector('.filters [name="' + name + '"]');
            return input ? input.value.trim() : '';
        }
        function apply() {
            var user = value('user_id'), guid = value('guid').toLowerCase();
            var status = value('status'), method = value('payment_method');
            var amount = value('amount') ? decimalUnits(value('amount')) : undefined;
            var price = value('total_price') ? decimalUnits(value('total_price')) : undefined;
            var invalid = false;
            ['amount', 'total_price'].forEach(function (name) {
                var input = table.querySelector('.filters input[name="' + name + '"]');
                if (!input) return;
                var bad = (name === 'amount' ? amount : price) === null || !!(input.validity && input.validity.badInput);
                input.setAttribute('aria-invalid', String(bad));
                invalid = invalid || bad;
            });
            var rows = Array.from(table.querySelectorAll('tbody tr[data-key]'));
            var count = 0;
            rows.forEach(function (row) {
                var code = row.querySelector('.order-col-guid code');
                var credits = row.querySelector('.order-col-amount');
                var cost = row.querySelector('.order-col-price strong');
                var state = row.querySelector('.order-col-status');
                var payment = row.querySelector('.payment-icon');
                var paymentCode = payment && Array.from(payment.classList).find(function (name) { return name.indexOf('payment-icon-') === 0; });
                var match = !invalid && (!user || row.dataset.demoUser === user) &&
                    (!guid || !!code && code.textContent.trim().toLowerCase().includes(guid)) &&
                    (!status || !!state && state.dataset.orderStatus === status) &&
                    (!method || paymentCode === 'payment-icon-' + method) &&
                    (amount === undefined || !!credits && decimalUnits(credits.textContent) === amount) &&
                    (price === undefined || !!cost && decimalUnits(cost.textContent) === price);
                row.hidden = !match;
                if (match) count++;
                var box = row.querySelector('.grid-row-check');
                if (box) box.checked = false;
            });
            empty.hidden = count > 0;
            emptyMessage.textContent = invalid ? 'Некорректная сумма в фильтре' : 'Ничего не найдено';
            var range = table.parentElement.querySelector('.order-range-summary');
            if (range) range.textContent = 'Демо: ' + count + ' из ' + rows.length;
            if (window.AdminTableSelection) window.AdminTableSelection.init();
            table.dispatchEvent(new CustomEvent('admin:selectionchange', { bubbles: true }));
        }

        // Rebind only these local handlers: PJAX re-init must not duplicate a filter/reset action.
        if (table.orderDemoFilterCleanup) table.orderDemoFilterCleanup();
        inputs.forEach(function (input) {
            input.setAttribute('aria-label', (input.name === 'guid' ? 'GUID' : input.name === 'amount' ? 'Кредиты' : 'Стоимость') + ' (демо)');
            if (input.type === 'number') input.step = '0.01';
            input.addEventListener('input', apply);
        });
        selects.forEach(function (select) {
            if (window.jQuery) window.jQuery(select).on('change.ordersDemoFilter', apply);
            else select.addEventListener('change', apply);
        });
        var reset = table.parentElement.querySelector('.order-reset-filters');
        function clear(event) {
            event.preventDefault();
            inputs.concat(selects).forEach(function (control) { control.value = ''; });
            if (window.jQuery) selects.forEach(function (select) { window.jQuery(select).trigger('change.select2'); });
            apply();
        }
        if (reset) reset.addEventListener('click', clear);
        table.orderDemoFilterCleanup = function () {
            inputs.forEach(function (input) { input.removeEventListener('input', apply); });
            selects.forEach(function (select) {
                if (window.jQuery) window.jQuery(select).off('change.ordersDemoFilter', apply);
                else select.removeEventListener('change', apply);
            });
            if (reset) reset.removeEventListener('click', clear);
        };
        apply();
    }

    function initSelects(table) {
        table.querySelectorAll('.filters select').forEach(function (select) {
            var cell = select.closest('td');
            var placeholder = cell.classList.contains('order-col-user') ? 'Пользователь' :
                cell.classList.contains('order-col-status') ? 'Статус' : 'Метод оплаты';
            if (!select.dataset.demoOptionsReady) {
                cell.querySelectorAll('.select2-container').forEach(function (node) { node.remove(); });
                Array.from(select.attributes).forEach(function (attribute) {
                    if (/^data-(ajax|select2|krajee|s2)/.test(attribute.name)) select.removeAttribute(attribute.name);
                });
                select.classList.remove('select2-hidden-accessible');
                select.removeAttribute('aria-hidden');
                select.removeAttribute('tabindex');
                select.removeAttribute('style');
            }
            select.setAttribute('aria-label', placeholder + ' (демо)');
            if (cell.classList.contains('order-col-user')) {
                var users = new Map();
                var selected = select.value;
                table.querySelectorAll('tbody .order-col-user').forEach(function (userCell) {
                    var name = userCell.querySelector('.name');
                    var login = userCell.querySelector('.username');
                    var key = login && login.textContent.trim();
                    userCell.closest('tr').dataset.demoUser = key || '';
                    if (name && key) users.set(key, name.textContent.trim());
                });
                select.replaceChildren(new Option('', ''));
                users.forEach(function (name, key) {
                    select.appendChild(new Option(name, key));
                });
                select.value = users.has(selected) ? selected : '';
            }
            if (window.jQuery && window.jQuery.fn.select2) {
                var field = window.jQuery(select);
                if (!field.data('select2')) field.select2({ theme: 'bootstrap', width: '100%',
                    placeholder: placeholder, allowClear: true,
                    minimumResultsForSearch: 0,
                    language: { noResults: function () { return 'Ничего не найдено'; } }
                });
                else field.trigger('change.select2');
            }
            select.dataset.demoOptionsReady = 'true';
        });
    }

    function setup() {
        var table = document.querySelector('.orders-grid-view');
        if (!table) return;
        initDemoStatuses(table);
        initSelects(table);
        initFilters(table);
    }
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    setup();
    if (window.jQuery && !window.jQuery.fn.select2) {
        var script = document.createElement('script');
        script.src = new URL(SELECT2_ASSET, SOURCE_URL).href;
        script.onload = setup;
        document.head.appendChild(script);
    }
    if (window.jQuery) window.jQuery(document).on('pjax:end.ordersDemo', setup);
}());
