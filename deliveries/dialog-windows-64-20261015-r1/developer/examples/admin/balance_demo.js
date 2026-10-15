/* Static preview only. Do not deploy this file to the live admin application. */
(function () {
    'use strict';
    if (window.AdminBalancePreview) return;
    var SOURCE_URL = document.currentScript.src; // Resolve the bundled Select2 relative to this file.
    var SELECT2_ASSET = 'assets/vendor/e70e86a900ea-select2.full.min.js'; // Original admin Select2, already downloaded.
    var DEMO_EXPERTS = [ // Fictional preview experts for rows and filters; never real account relations.
        ['demo-expert-1', 'Анна Волкова'],
        ['demo-expert-2', 'Михаил Орлов'],
        ['demo-expert-3', 'Елена Соколова'],
        ['demo-expert-4', 'Алексей Смирнов']
    ];
    var TYPE_LABELS = { bonus: 'Начисление', gift: 'Подарок', premium: 'Премиум',
        boost: 'Поднятие в поиске', spotlight: 'В центре внимания', payout: 'Выплата партнёру',
        paypal: 'PayPal', stripe: 'Stripe', robokassa: 'Робокасса' };


    function setup() {
        if (!window.jQuery || !window.jQuery.fn.select2) return;
        var table = document.querySelector('.balance-grid-view');
        if (!table) return;
        table.querySelectorAll('tbody .balance-col-expert').forEach(function (cell, index) {
            var row = cell.closest('tr');
            if (cell.dataset.demoExpertReady || row.hasAttribute('data-expert-name') ||
                row.hasAttribute('data-expert-username')) return;
            var expert = DEMO_EXPERTS[index % DEMO_EXPERTS.length];
            var person = document.createElement('div');
            person.className = 'user-column';
            var info = document.createElement('div');
            info.className = 'user-info';
            var name = document.createElement('div');
            name.className = 'name';
            name.textContent = expert[1];
            info.appendChild(name);
            person.appendChild(info);
            cell.replaceChildren(person);
            cell.classList.remove('text-muted');
            cell.title = 'Демонстрационный эксперт';
            cell.dataset.demoExpertReady = 'true';
        });
        table.querySelectorAll('.filters select').forEach(function (select) {
            if (select.dataset.demoOptionsReady) return;
            var cell = select.closest('td');
            var placeholder = cell.classList.contains('balance-col-user') ? 'Клиент' :
                cell.classList.contains('balance-col-expert') ? 'Эксперт' : 'Типы';
            // Remove inert exported Select2 markup; initialize the original plugin locally.
            cell.querySelectorAll('.select2-container').forEach(function (node) { node.remove(); });
            Array.from(select.attributes).forEach(function (attribute) {
                if (/^data-(ajax|select2|krajee|s2)/.test(attribute.name)) select.removeAttribute(attribute.name);
            });
            select.classList.remove('select2-hidden-accessible');
            select.removeAttribute('aria-hidden');
            select.removeAttribute('tabindex');
            select.removeAttribute('style');
            select.removeAttribute('title');
            select.disabled = false;
            select.setAttribute('aria-label', placeholder + ' (демо)');
            if (cell.classList.contains('balance-col-user') || cell.classList.contains('balance-col-expert')) {
                select.replaceChildren(new Option('', ''));
                var options = DEMO_EXPERTS;
                if (cell.classList.contains('balance-col-user')) {
                    var users = new Map();
                    table.querySelectorAll('tbody .balance-col-user').forEach(function (userCell) {
                        var name = userCell.querySelector('.name');
                        var login = userCell.querySelector('.username');
                        if (name) {
                            var key = login ? login.textContent.trim() : name.textContent.trim();
                            users.set(key, name.textContent.trim() + (login ? ' · ' + key : ''));
                        }
                    });
                    options = Array.from(users, function (pair, index) { return ['demo-user-' + index, pair[1]]; });
                }
                options.forEach(function (item) { select.appendChild(new Option(item[1], item[0])); });
            } else {
                Array.from(select.options).forEach(function (option) {
                    option.textContent = TYPE_LABELS[option.value] || option.textContent;
                });
            }
            window.jQuery(select).select2({ theme: 'bootstrap', width: '100%',
                placeholder: placeholder, allowClear: true,
                minimumResultsForSearch: 0, closeOnSelect: !select.multiple,
                language: { noResults: function () { return 'Ничего не найдено'; } }
            });
            select.dataset.demoOptionsReady = 'true';
        });
        table.querySelectorAll('.balance-col-amount input').forEach(function (input, index) {
            input.setAttribute('aria-label', index === 0 ? 'Кредиты от' : 'Кредиты до');
        });
    }

    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    if (window.jQuery && window.jQuery.fn.select2) setup();
    else {
        var script = document.createElement('script');
        script.src = new URL(SELECT2_ASSET, SOURCE_URL).href;
        script.onload = setup;
        document.head.appendChild(script);
    }
    if (window.jQuery) window.jQuery(document).on('pjax:end.balanceDemo', setup);
}());
