/* Read-only partner fixtures. Application routes and financial writes are not simulated. */
(function () {
    'use strict';
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    var ui = window.AdminBalancePreview;
    if (!ui) return;
    var sample = ui.sample;
    var grid = document.querySelector('#w0');
    // All fixture rows are shown; do not attach the inherited server-pagination controls.
    grid.classList.remove('grid-view');
    var table = grid.querySelector('table');
    var filters = table.querySelector('.filters');
    var body = table.tBodies[0];
    var snapshots = Object.keys(ui.data.accounts).map(function (id) {
        return ui.data.partnerSnapshot(sample, id);
    }).filter(Boolean);
    var tabs = { profile: 'Карточка', payment: 'Реквизиты', accruals: 'Начисления',
        debits: 'Списания', payouts: 'Выплаты', rate: 'Индивидуальная ставка' };
    var statuses = { requested: 'Ожидает одобрения', approved: 'Одобрено, перевод не подтверждён',
        paid: 'Выплачено', declined: 'Отклонено', canceled: 'Отменено', unknown: 'Исход не подтверждён' };
    var visible = [];
    var focusTab = false;
    function partnerHref(id, tab) { return '#partner=' + id + '&tab=' + tab; }
    function ledgerHref(id, operation) {
        return 'transactions.html?state=' + sample.state + '&owner=' + id + (operation ? '#operation-' + operation : '');
    }
    function payoutHref(id, request) {
        return 'payouts.html?state=' + sample.state + '&owner=' + id + (request ? '#' + request : '');
    }
    function iconButton(icon, title) {
        var button = ui.node('button', null, 'btn btn-default btn-sm');
        button.type = 'button'; button.title = title; button.setAttribute('aria-label', title);
        var symbol = ui.node('i', null, 'fa fa-' + icon); symbol.setAttribute('aria-hidden', 'true');
        button.appendChild(symbol);
        return button;
    }
    function unavailableEdit(title) {
        var button = iconButton('pencil', title);
        button.disabled = true; button.title = 'Серверный обработчик и права ещё не подключены';
        return button;
    }
    function fields(parent, values) {
        var list = ui.node('dl', null, 'partner-detail-fields');
        values.forEach(function (field) { list.append(ui.node('dt', field[0]), ui.node('dd', field[1])); });
        parent.appendChild(list);
    }
    function dataTable(parent, headers, rows, emptyText) {
        var scroll = ui.node('div', null, 'table-responsive');
        var result = ui.node('table', null, 'partner-history');
        var head = ui.node('thead'); var titles = ui.node('tr');
        headers.forEach(function (label) { var cell = ui.node('th', label); cell.scope = 'col'; titles.appendChild(cell); });
        head.appendChild(titles); result.appendChild(head);
        var records = ui.node('tbody');
        rows.forEach(function (values) {
            var row = ui.node('tr');
            values.forEach(function (value) { var cell = ui.node('td');
                if (typeof value === 'string') cell.textContent = value;
                else cell.appendChild(value);
                row.appendChild(cell);
            });
            records.appendChild(row);
        });
        if (!rows.length) { var row = ui.node('tr'); var cell = ui.node('td', emptyText); cell.colSpan = headers.length; row.appendChild(cell); records.appendChild(row); }
        result.appendChild(records); scroll.appendChild(result); parent.appendChild(scroll);
    }
    var content = document.querySelector('section.content');
    ui.scenarioToolbar(content);
    var detail = ui.node('section', null, 'partner-detail'); detail.hidden = true;
    detail.setAttribute('aria-label', 'Карточка партнёра');
    grid.closest('.box').appendChild(detail);
    var partnerSelect = filters.querySelector('select[name="PartnerSearch[id]"]');
    partnerSelect.replaceChildren(new Option('Все партнёры', ''));
    partnerSelect.classList.remove('select2-hidden-accessible');
    partnerSelect.removeAttribute('aria-hidden'); partnerSelect.removeAttribute('tabindex');
    Array.from(partnerSelect.attributes).forEach(function (attribute) {
        if (/^data-(ajax|select2)/.test(attribute.name)) partnerSelect.removeAttribute(attribute.name);
    });
    partnerSelect.setAttribute('aria-label', 'Партнёр');
    partnerSelect.parentElement.querySelectorAll('.select2-container').forEach(function (container) { container.remove(); });
    var roleSelect = filters.querySelector('[name="PartnerSearch[role]"]');
    roleSelect.replaceChildren(new Option('Все роли', ''), new Option('agent', 'agent'), new Option('expert', 'expert'));
    var idInput = filters.querySelector('input[name="PartnerSearch[id]"]');
    idInput.setAttribute('aria-label', 'ID партнёра');
    filters.querySelectorAll('.partner-col-login input,.partner-col-blocking select').forEach(function (control) {
        control.disabled = true; control.title = 'Серверный фильтр не подключён';
    });
    table.querySelectorAll('[data-sort]').forEach(function (sort) { sort.title = 'Серверная сортировка не подключена'; });
    var headings = table.tHead.rows[0];
    var legacy = headings.cells[6];
    legacy.setAttribute('data-partner-payout-source', 'legacy_operation');
    legacy.textContent = 'Последняя операция';
    var paidHeading = ui.node('th', 'Последняя выплата');
    paidHeading.setAttribute('data-partner-payout-source', 'confirmed_external');
    headings.insertBefore(paidHeading, legacy);
    filters.insertBefore(ui.node('td'), filters.cells[6]);
    var adjustmentSelect = document.getElementById('partnerRewardPartner');
    adjustmentSelect.replaceChildren();
    snapshots.forEach(function (snapshot) {
        partnerSelect.appendChild(new Option(snapshot.account.name, snapshot.id));
        adjustmentSelect.appendChild(new Option('[' + snapshot.id + '] ' + snapshot.account.name, snapshot.id));
    });
    var reset = document.querySelector('.summary.pull-right a');
    reset.href = 'partner.html?state=' + sample.state;
    function showDetail() {
        var params = new URLSearchParams(window.location.hash.slice(1));
        var id = params.get('partner'); var tab = params.get('tab');
        var snapshot = visible.find(function (item) { return item.id === id; });
        if (!snapshot) { detail.hidden = true; return; }
        if (!Object.prototype.hasOwnProperty.call(tabs, tab)) tab = 'profile';
        detail.hidden = false;
        detail.replaceChildren(ui.node('h2', snapshot.account.name));
        var navigation = ui.node('div', null, 'partner-detail-tabs'); navigation.setAttribute('role', 'tablist');
        Object.keys(tabs).forEach(function (key) {
            var link = ui.link(tabs[key], partnerHref(id, key));
            link.setAttribute('role', 'tab'); link.id = 'partner-tab-' + key;
            link.setAttribute('aria-controls', 'partner-detail-panel');
            link.setAttribute('aria-selected', String(key === tab)); link.tabIndex = key === tab ? 0 : -1;
            link.addEventListener('keydown', function (event) {
                var keys = Object.keys(tabs); var index = keys.indexOf(key);
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault(); focusTab = true;
                var next = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
                window.location.hash = partnerHref(id, keys[next]);
            });
            navigation.appendChild(link);
        });
        detail.appendChild(navigation);
        var panel = ui.node('div', null, 'partner-detail-panel'); panel.id = 'partner-detail-panel';
        panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'partner-tab-' + tab);
        detail.appendChild(panel);
        if (tab === 'profile') {
            fields(panel, [['Аккаунт', snapshot.account.username], ['Внутренняя роль', snapshot.account.role],
                ['Кредитный баланс', snapshot.current_balance === null ? 'Не получен' : snapshot.current_balance + ' кред.'],
                ['Последняя операция (ET)', ui.dateText(snapshot.last_operation_at)],
                ['Последняя фактическая выплата (ET)', ui.dateText(snapshot.last_payout && snapshot.last_payout.paid_at)]]);
            dataTable(panel, ['Анкета эксперта', 'Аккаунт владельца'], snapshot.profiles.map(function (profile) {
                return [profile.name, snapshot.account.username];
            }), 'Анкеты не найдены');
        } else if (tab === 'payment') {
            fields(panel, [['Платёжные реквизиты', 'Не получены'], ['Валюта внешней выплаты', 'USD'],
                ['Комиссию оплачивает', 'Компания']]);
            panel.appendChild(unavailableEdit('Изменить реквизиты'));
        } else if (tab === 'rate') {
            fields(panel, [['Индивидуальная ставка эксперта', 'Не получена']]);
            panel.appendChild(unavailableEdit('Изменить индивидуальную ставку'));
        } else if (tab === 'payouts') {
            panel.appendChild(ui.link('Реестр выплат', payoutHref(id)));
            dataTable(panel, ['Заявка', 'Кредиты', 'Статус', 'Запрошено (ET)', 'Внешний перевод (ET)'], snapshot.payouts.map(function (payout) {
                return [ui.link(payout.id, payoutHref(id, payout.id)), payout.credits, statuses[payout.status],
                    ui.dateText(payout.requested_at), ui.dateText(payout.paid_at)];
            }), 'Заявок на выплату нет');
        } else {
            panel.appendChild(ui.link('Общий журнал партнёра', ledgerHref(id)));
            var entries = snapshot.history.filter(function (entry) { return tab === 'debits' ? entry.amount.startsWith('-') : Number(entry.amount) > 0; }).reverse();
            dataTable(panel, ['Операция', 'Кредиты', 'Остаток до операции', 'Дата (ET)', 'Описание'], entries.map(function (entry) {
                return [ui.link('#' + entry.id, ledgerHref(id, entry.id)), (entry.amount.startsWith('-') ? '' : '+') + entry.amount,
                    entry.before === null ? '—' : entry.before, ui.dateText(entry.date), entry.description];
            }), tab === 'debits' ? 'Списаний нет' : 'Начислений нет');
        }
        if (focusTab) { navigation.querySelector('[aria-selected="true"]').focus(); focusTab = false; }
    }
    function render() {
        visible = snapshots.filter(function (snapshot) {
            return (!idInput.value.trim() || snapshot.id.includes(idInput.value.trim())) &&
                (!partnerSelect.value || snapshot.id === partnerSelect.value) && (!roleSelect.value || snapshot.account.role === roleSelect.value);
        });
        body.replaceChildren();
        visible.forEach(function (snapshot) {
            var row = ui.node('tr'); row.dataset.key = snapshot.id;
            var card = ui.link('', partnerHref(snapshot.id, 'profile')); card.appendChild(ui.person(snapshot.account));
            var values = [snapshot.id, card, snapshot.account.role, '—', '—', snapshot.current_balance === null ? 'Не получен' : snapshot.current_balance,
                ui.dateText(snapshot.last_payout && snapshot.last_payout.paid_at), ui.dateText(snapshot.last_operation_at)];
            values.forEach(function (value, index) { var cell = ui.node('td');
                var column = { 3: 'login', 4: 'plan', 5: 'balance', 6: 'last-payout', 7: 'last-operation' }[index];
                if (column) cell.className = 'partner-col-' + column;
                if (typeof value === 'string') cell.textContent = value;
                else cell.appendChild(value);
                row.appendChild(cell);
            });
            var blocking = ui.node('td', null, 'partner-col-blocking'); var block = iconButton('ban', 'Заблокировать партнёра');
            block.disabled = true; block.title = 'Права и серверный обработчик блокировки не подключены'; blocking.appendChild(block); row.appendChild(blocking);
            var actions = ui.node('td', null, 'partner-col-actions');
            var adjustment = ui.node('button', '$', 'btn btn-sm btn-default js-partner-reward');
            adjustment.type = 'button'; adjustment.setAttribute('data-toggle', 'modal'); adjustment.setAttribute('data-target', '#partnerRewardModal');
            adjustment.setAttribute('data-partner-id', snapshot.id); adjustment.title = 'Корректировка или предупреждение';
            adjustment.setAttribute('aria-label', adjustment.title);
            var view = ui.link('', partnerHref(snapshot.id, 'profile')); view.className = 'btn btn-sm btn-primary';
            view.title = 'Карточка партнёра'; view.setAttribute('aria-label', view.title + ' ' + snapshot.account.name);
            var eye = ui.node('i', null, 'fa fa-eye'); eye.setAttribute('aria-hidden', 'true'); view.appendChild(eye);
            actions.append(adjustment, ' ', view); row.appendChild(actions); body.appendChild(row);
        });
        if (!visible.length) { var row = ui.node('tr'); var cell = ui.node('td', 'Партнёры не найдены'); cell.colSpan = 10; row.appendChild(cell); body.appendChild(row); }
        grid.querySelector(':scope > .summary').textContent = 'Партнёров: ' + visible.length;
        showDetail();
        if (window.AdminTableSelection) window.AdminTableSelection.init();
    }
    partnerSelect.addEventListener('change', render); roleSelect.addEventListener('change', render); idInput.addEventListener('input', render);
    window.addEventListener('hashchange', showDetail);
    render();
}());
