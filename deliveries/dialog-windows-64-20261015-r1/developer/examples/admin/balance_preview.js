/* Local fixtures and local filtering only. Never include in the real admin application. */
(function () {
    'use strict';
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    var data = window.AdminBalancePreviewFixtures;
    if (!data) return;
    var state = new URL(window.location.href).searchParams.get('state');
    var sample = data.scenario(state);
    var labels = { topup: 'Пополнение', consultation_debit: 'Списание за консультацию',
        consultation_accrual: 'Начисление за консультацию', bonus: 'Бонус',
        payout_request: 'Заявка на выплату', payout_restore: 'Восстановление кредитов', penalty: 'Депремирование' };
    var stateLabels = { positive: 'Положительный баланс', zero: 'Нулевой баланс', negative: 'Отрицательный баланс',
        empty: 'Пустая история', pending: 'Заявка ожидает обработки', unknown: 'Баланс не получен',
        below_minimum: '499.99: ниже минимума', minimum: '500.00: минимум', above_minimum: '750.50: выше минимума',
        settings_unknown: 'Настройки выплаты не получены', access_denied: 'Право на выплату не подтверждено' };
    function node(tag, text, className) {
        var element = document.createElement(tag);
        if (text !== undefined && text !== null) element.textContent = text;
        if (className) element.className = className;
        return element;
    }
    function link(text, href) {
        var element = node('a', text);
        element.href = href;
        return element;
    }
    function dateText(value) {
        return value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat('ru-RU', { timeZone: 'America/New_York',
            dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) + ' ET' : '—';
    }
    function person(person) {
        if (!person) return node('span', '—', 'text-muted');
        var wrap = node('div', null, 'user-column');
        var info = node('div', null, 'user-info');
        info.append(node('div', person.name, 'name'), node('div', person.username, 'username'));
        wrap.appendChild(info);
        return wrap;
    }
    function scenarioToolbar(parent) {
        var bar = node('div', null, 'balance-preview-toolbar');
        var label = node('label', 'Состояние примера');
        var select = node('select', null, 'form-control input-sm');
        select.setAttribute('aria-label', 'Состояние примера');
        data.states.forEach(function (key) { select.appendChild(new Option(stateLabels[key], key, false, key === sample.state)); });
        select.addEventListener('change', function () {
            var url = new URL(window.location.href);
            url.searchParams.set('state', select.value);
            url.hash = '';
            window.location.assign(url.href);
        });
        label.appendChild(select);
        bar.append(label, link('Мой баланс', 'balance.html?state=' + sample.state),
            link('Партнёры', 'partner.html?state=' + sample.state),
            link('Транзакции', 'transactions.html?state=' + sample.state),
            link('Выплаты', 'payouts.html?state=' + sample.state));
        parent.prepend(bar);
        return bar;
    }
    function financialUnits(value) {
        if (!/^-?\d+(\.\d{1,2})?$/.test(value)) return null;
        var parts = value.replace('-', '').split('.');
        var magnitude = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
        return value.startsWith('-') ? -magnitude : magnitude;
    }
    function renderLedger(table) {
        var personal = table.classList.contains('balance-grid-view');
        var header = document.querySelector('.content-header');
        if (personal) {
            header.setAttribute('data-current-balance', sample.balance === null ? '' : sample.balance);
            header.setAttribute('data-owner-id', sample.owner_id);
            header.setAttribute('data-owner-name', data.accounts[sample.owner_id].name);
            header.setAttribute('data-payout-pending', String(sample.pending));
            header.setAttribute('data-payout-can-request', String(sample.payout_policy.can_request));
            header.setAttribute('data-payout-minimum-credits', sample.payout_policy.minimum_credits || '');
            header.setAttribute('data-payout-usd-per-credit', sample.payout_policy.usd_per_credit || '');
        }
        table.setAttribute('data-party-projection', 'true');
        table.dataset.fixtureState = sample.state;
        var entries = sample.entries.filter(function (entry) { return !personal || entry.owner_id === sample.owner_id; });
        var body = table.tBodies[0];
        body.replaceChildren();
        entries.forEach(function (entry) {
            var row = node('tr');
            row.id = 'operation-' + entry.id;
            row.dataset.key = String(entry.id);
            row.dataset.ownerId = entry.owner_id;
            row.dataset.type = entry.type;
            row.dataset.amount = entry.amount;
            row.dataset.date = entry.date;
            var parties = { client: data.accounts[entry.client_id], expert: data.profiles[entry.profile_id], agent: data.accounts[entry.agent_id] };
            Object.keys(parties).forEach(function (role) {
                var party = parties[role];
                row.setAttribute('data-' + role + '-id', entry[role === 'expert' ? 'profile_id' : role + '_id'] || '');
                if (party) {
                    row.setAttribute('data-' + role + '-name', party.name);
                    row.setAttribute('data-' + role + '-username', party.username);
                }
            });
            if (entry.profile_id) row.dataset.expertAccountId = data.profiles[entry.profile_id].account_id;
            var cells = Array.from({ length: 9 }, function () { return node('td'); });
            cells[0].textContent = String(entry.id);
            cells[1].appendChild(person(data.accounts[entry.owner_id]));
            cells[2].textContent = entry.consultation_id || entry.payout_id || '—';
            cells[3].className = 'text-right';
            cells[3].setAttribute('data-credit-amount', entry.amount);
            cells[3].appendChild(node('span', (entry.amount.startsWith('-') ? '' : '+') + entry.amount,
                entry.amount.startsWith('-') ? 'transaction-sub' : 'transaction-add'));
            cells[4].className = 'text-right';
            cells[4].textContent = entry.before === null ? '—' : entry.before;
            cells[5].textContent = '—';
            var time = node('time', dateText(entry.date));
            time.dateTime = entry.date;
            time.title = entry.date;
            cells[6].appendChild(time);
            cells[7].textContent = labels[entry.type] || entry.type;
            cells[8].appendChild(node('span', entry.description));
            if (entry.related_id) cells[8].append(' ', link('Связанная операция #' + entry.related_id,
                'transactions.html?state=' + sample.state + '#operation-' + entry.related_id));
            if (entry.payout_id) cells[8].append(' ', link('Заявка ' + entry.payout_id,
                'payouts.html?state=' + sample.state + '#' + entry.payout_id));
            row.append.apply(row, cells);
            body.appendChild(row);
        });
        if (!entries.length) {
            var empty = node('td', 'Операций пока нет', 'text-muted');
            empty.colSpan = 9;
            var row = node('tr'); row.appendChild(empty); body.appendChild(row);
        }
        table.querySelectorAll('[data-sort]').forEach(function (sort) {
            sort.dataset.previewBlocked = 'true';
            sort.title = 'Серверная сортировка не подключена';
        });
        table.querySelectorAll('.filters [data-ajax--url]').forEach(function (select) { select.removeAttribute('data-ajax--url'); });
        var summary = table.parentElement.querySelector(':scope > .summary');
        if (summary) summary.textContent = 'Операций: ' + entries.length;
        table.parentElement.querySelectorAll('.pagination').forEach(function (pager) { pager.remove(); });
        var reset = document.querySelector('.summary.pull-right a');
        if (reset) reset.href = (personal ? 'balance.html' : 'transactions.html') + '?state=' + sample.state;
        scenarioToolbar(document.querySelector('section.content'));
        return entries;
    }
    function bindFilters(table) {
        var prefix = table.classList.contains('balance-grid-view') ? 'balance' : 'tx';
        var originalRows = Array.from(table.querySelectorAll('tbody tr[data-key]'));
        var controls = Array.from(table.querySelectorAll('.filters select'));
        controls.forEach(function (select) {
            var column = select.closest('td');
            var role = column.classList.contains(prefix + '-col-user')
                ? (prefix === 'balance' ? 'client' : 'owner')
                : ['client', 'expert', 'agent'].find(function (key) { return column.classList.contains(prefix + '-col-' + key); });
            var values = new Map();
            originalRows.forEach(function (row) {
                var key = role ? row.getAttribute('data-' + role + '-id') : row.dataset.type;
                var record = role === 'expert' ? data.profiles[key] : data.accounts[key];
                if (key) values.set(key, role ? record.name : labels[key]);
            });
            select.replaceChildren(new Option('', ''));
            values.forEach(function (name, key) { select.appendChild(new Option(name, key)); });
            select.disabled = false;
            Array.from(select.attributes).forEach(function (attribute) {
                if (/^data-(ajax|select2|krajee|s2)/.test(attribute.name)) select.removeAttribute(attribute.name);
            });
            select.removeAttribute('style');
            select.removeAttribute('aria-hidden');
            select.removeAttribute('tabindex');
            select.classList.remove('select2-hidden-accessible');
            column.querySelectorAll('.select2-container').forEach(function (container) { container.remove(); });
            select.dataset.fixtureRole = role || 'type';
            if (role === 'owner') {
                var requestedOwner = new URL(window.location.href).searchParams.get('owner');
                if (values.has(requestedOwner)) select.value = requestedOwner;
            }
            select.setAttribute('aria-label', role === 'owner' ? 'Владелец' : role === 'client' ? 'Клиент' : role === 'expert' ? 'Эксперт' : role === 'agent' ? 'Агент' : 'Типы');
            select.title = select.getAttribute('aria-label');
        });
        var range = Array.from(table.querySelectorAll('.' + prefix + '-col-amount input'));
        function apply() {
            var bounds = range.map(function (input) { return input.value.trim() ? financialUnits(input.value.trim().replace(',', '.')) : undefined; });
            var invalid = bounds.some(function (value) { return value === null; }) || (bounds[0] !== undefined && bounds[1] !== undefined && bounds[0] > bounds[1]);
            range.forEach(function (input) { input.setAttribute('aria-invalid', String(invalid)); });
            var count = 0;
            originalRows.forEach(function (row) {
                var match = !invalid && controls.every(function (select) {
                    var selected = Array.from(select.selectedOptions, function (option) { return option.value; }).filter(Boolean);
                    var value = select.dataset.fixtureRole === 'type' ? row.dataset.type : row.getAttribute('data-' + select.dataset.fixtureRole + '-id');
                    return !selected.length || selected.includes(value);
                });
                var amount = financialUnits(row.dataset.amount);
                match = match && (bounds[0] === undefined || amount >= bounds[0]) && (bounds[1] === undefined || amount <= bounds[1]);
                row.hidden = !match;
                if (match) count++;
                var box = row.querySelector('.grid-row-check');
                if (box) box.checked = false;
            });
            var summary = table.parentElement.querySelector('.' + prefix + '-range-summary');
            if (summary) summary.textContent = invalid ? 'Некорректный диапазон кредитов' : 'Операций: ' + count;
            if (window.AdminTableSelection) window.AdminTableSelection.init();
            table.dispatchEvent(new CustomEvent('admin:selectionchange', { bubbles: true }));
        }
        controls.forEach(function (select) {
            if (window.jQuery) window.jQuery(select).on('change.balanceFixtures', apply);
            else select.addEventListener('change', apply);
        });
        range.forEach(function (input) { input.addEventListener('input', apply); });
        // In the fixture, unsupported exported date-range controls stay visibly unavailable.
        table.querySelectorAll('.filters .grid-date-cell input').forEach(function (input) { input.disabled = true; input.title = 'Серверный диапазон дат не подключён'; });
        apply();
        function select2() {
            if (!window.jQuery || !window.jQuery.fn.select2) return;
            controls.forEach(function (select) {
                window.jQuery(select).select2({ theme: 'bootstrap', width: '100%', allowClear: true,
                    placeholder: select.getAttribute('aria-label'), minimumResultsForSearch: 0,
                    language: { noResults: function () { return 'Ничего не найдено'; } } });
            });
        }
        if (window.jQuery && window.jQuery.fn.select2) select2();
        else {
            var plugin = document.createElement('script');
            plugin.src = 'assets/vendor/e70e86a900ea-select2.full.min.js';
            plugin.onload = select2;
            document.head.appendChild(plugin);
        }
    }
    window.AdminBalancePreview = { data: data, sample: sample, node: node, link: link, person: person,
        dateText: dateText, scenarioToolbar: scenarioToolbar };
    var owner = data.accounts[sample.owner_id];
    document.querySelectorAll('.admin-user-trigger-text').forEach(function (label) {
        label.textContent = owner.name; label.title = owner.name;
    });
    document.querySelectorAll('.admin-user-trigger-avatar').forEach(function (avatar) { avatar.textContent = 'A'; });
    var userTrigger = document.querySelector('.user-menu > .dropdown-toggle');
    if (userTrigger) {
        userTrigger.href = '#';
        userTrigger.setAttribute('aria-label', 'Меню пользователя ' + owner.name);
    }
    var meta = document.querySelector('.admin-user-meta');
    if (meta) {
        meta.querySelector('strong').textContent = owner.name;
        meta.querySelector('span').textContent = 'Агент';
        meta.querySelector('small').textContent = owner.username;
    }
    var photo = document.querySelector('img.admin-user-avatar');
    if (photo) {
        var avatar = node('span', 'A', 'admin-user-avatar balance-fixture-avatar');
        avatar.setAttribute('aria-hidden', 'true');
        photo.replaceWith(avatar);
    }
    var balanceLink = document.querySelector('a[data-sidebar-route="balance"]');
    if (balanceLink) {
        balanceLink.href = 'balance.html?state=' + sample.state;
        var payoutItem = node('li');
        var payoutLink = link('', 'payouts.html?state=' + sample.state);
        payoutLink.dataset.sidebarRoute = 'payouts';
        var icon = node('i', null, 'fa fa-money'); icon.setAttribute('aria-hidden', 'true');
        payoutLink.append(icon, ' ', node('span', 'Выплаты'));
        payoutItem.appendChild(payoutLink);
        balanceLink.closest('li').after(payoutItem);
        if (document.body.hasAttribute('data-payout-preview')) {
            balanceLink.closest('li').classList.remove('active');
            balanceLink.removeAttribute('aria-current');
            payoutItem.classList.add('active'); payoutLink.setAttribute('aria-current', 'page');
        }
    }
    var table = document.querySelector('.balance-grid-view,.transactions-grid-view');
    if (table && !document.body.hasAttribute('data-payout-preview')) {
        renderLedger(table);
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () {
            // Wait for the inherited adapter's DOMContentLoaded listeners to attach columns.
            setTimeout(function () { bindFilters(table); }, 0);
        });
        else bindFilters(table);
    }
}());
