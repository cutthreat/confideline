/* Read-only payout fixtures; processing buttons intentionally have no transport. */
(function () {
    'use strict';
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    var ui = window.AdminBalancePreview;
    if (!ui) return;
    var sample = ui.sample;
    var statuses = { requested: 'Ожидает одобрения', approved: 'Одобрено, перевод не подтверждён',
        paid: 'Выплачено', declined: 'Отклонено, кредиты восстановлены', canceled: 'Отменено, кредиты восстановлены',
        unknown: 'Исход не подтверждён' };
    var header = document.querySelector('.content-header');
    header.replaceChildren(ui.node('h1', 'Выплаты'));
    document.title = 'Выплаты';
    var content = document.querySelector('section.content');
    content.replaceChildren();
    ui.scenarioToolbar(content);
    var toolbar = ui.node('div', null, 'payout-register-toolbar');
    var select = ui.node('select', null, 'form-control');
    select.setAttribute('aria-label', 'Статус выплаты');
    select.appendChild(new Option('Все статусы', ''));
    Object.keys(statuses).forEach(function (status) { select.appendChild(new Option(statuses[status], status)); });
    var owner = ui.node('select', null, 'form-control');
    owner.setAttribute('aria-label', 'Получатель выплаты');
    owner.appendChild(new Option('Все получатели', ''));
    Object.keys(ui.data.accounts).filter(function (id) { return ui.data.accounts[id].role !== 'client'; }).forEach(function (id) {
        owner.appendChild(new Option(ui.data.accounts[id].name, id));
    });
    var requestedFilters = new URL(window.location.href).searchParams;
    var requestedOwner = requestedFilters.get('owner');
    if (ui.data.partnerSnapshot(sample, requestedOwner)) owner.value = requestedOwner;
    var requestedStatus = requestedFilters.get('status');
    if (Object.prototype.hasOwnProperty.call(statuses, requestedStatus)) select.value = requestedStatus;
    var search = ui.node('input', null, 'form-control');
    search.type = 'search'; search.placeholder = 'ID или получатель'; search.setAttribute('aria-label', 'Поиск выплаты');
    search.value = requestedFilters.get('q') || '';
    var summary = ui.node('span'); summary.setAttribute('role', 'status');
    toolbar.append(owner, select, search, summary);
    content.appendChild(toolbar);
    var scroll = ui.node('div', null, 'payout-register-scroll');
    var table = ui.node('table', null, 'table table-outline table-vcenter card-table payout-register');
    var head = ui.node('thead'); var headRow = ui.node('tr');
    ['Заявка', 'Получатель', 'Кредиты', 'Сумма, USD', 'Запрошено (ET)', 'Статус', 'Одобрено (ET)', 'Внешний перевод (ET)', ''].forEach(function (label) {
        var cell = ui.node('th', label); cell.scope = 'col'; headRow.appendChild(cell);
    });
    head.appendChild(headRow); table.appendChild(head);
    var body = ui.node('tbody'); table.appendChild(body); scroll.appendChild(table); content.appendChild(scroll);
    var detail = ui.node('section', null, 'payout-record'); detail.hidden = true; detail.setAttribute('aria-label', 'Карточка выплаты'); content.appendChild(detail);
    function ledgerLink(id) { return id ? ui.link('Операция #' + id, 'transactions.html?state=' + sample.state + '#operation-' + id) : ui.node('span', '—'); }
    function show(payout) {
        detail.hidden = false;
        detail.replaceChildren(ui.node('h2', payout.id));
        var fields = [
            ['Получатель', ui.data.accounts[payout.owner_id].name], ['Статус', statuses[payout.status] || 'Неизвестный статус: ' + payout.status],
            ['Кредиты, списанные при заявке', payout.credits], ['Сумма внешнего перевода, USD', payout.usd_amount || '—'],
            ['Коэффициент, зафиксированный сервером', payout.coefficient || '—'], ['Комиссию оплачивает', 'Компания'],
            ['Дата заявки (ET)', ui.dateText(payout.requested_at)], ['Дата одобрения (ET)', ui.dateText(payout.approved_at)],
            ['Дата подтверждённого внешнего перевода (ET)', ui.dateText(payout.paid_at)], ['Дата отказа или отмены (ET)', ui.dateText(payout.resolved_at)],
            ['Причина', payout.reason || '—'], ['Подтверждение внешнего перевода', payout.transfer_reference || '—']
        ];
        var list = ui.node('dl');
        fields.forEach(function (field) { list.append(ui.node('dt', field[0]), ui.node('dd', field[1])); });
        list.append(ui.node('dt', 'Списание при заявке'), ui.node('dd'), ui.node('dt', 'Восстановление после отказа/отмены'), ui.node('dd'));
        list.children[list.children.length - 3].appendChild(ledgerLink(payout.debit_id));
        list.lastElementChild.appendChild(ledgerLink(payout.restore_id));
        detail.appendChild(list);
        var actions = ui.node('div', null, 'payout-actions');
        var commands = payout.status === 'requested' ? ['Одобрить', 'Отклонить', 'Отменить']
            : payout.status === 'approved' ? ['Подтвердить внешний перевод', 'Отклонить', 'Отменить']
            : payout.status === 'unknown' ? ['Сверить исход'] : [];
        commands.forEach(function (label) {
            var button = ui.node('button', label, 'btn btn-default');
            button.type = 'button'; button.disabled = true;
            button.title = 'Защищённый серверный обработчик и права ещё не подключены';
            actions.appendChild(button);
        });
        detail.appendChild(actions);
    }
    function matchingRows() {
        var query = search.value.trim().toLowerCase();
        return sample.payouts.filter(function (payout) {
            return (!owner.value || payout.owner_id === owner.value) && (!select.value || payout.status === select.value) && (!query ||
                (payout.id + ' ' + ui.data.accounts[payout.owner_id].name).toLowerCase().includes(query));
        });
    }
    function render() {
        body.replaceChildren();
        var rows = matchingRows();
        if (!rows.some(function (payout) { return '#' + payout.id === window.location.hash; })) detail.hidden = true;
        rows.forEach(function (payout) {
            var row = ui.node('tr'); row.id = payout.id;
            var values = [payout.id, ui.data.accounts[payout.owner_id].name, payout.credits, payout.usd_amount || '—',
                ui.dateText(payout.requested_at), statuses[payout.status] || 'Неизвестный статус: ' + payout.status,
                ui.dateText(payout.approved_at), ui.dateText(payout.paid_at)];
            values.forEach(function (value, index) {
                var cell = ui.node('td', value);
                if (index === 5) cell.className = 'payout-status payout-status-' + payout.status;
                row.appendChild(cell);
            });
            var action = ui.node('td'); var button = ui.node('button', 'Просмотр', 'btn btn-default btn-sm');
            button.type = 'button'; button.setAttribute('aria-label', 'Просмотр ' + payout.id);
            button.addEventListener('click', function () { window.location.hash = payout.id; show(payout); });
            action.appendChild(button); row.appendChild(action); body.appendChild(row);
        });
        if (!rows.length) { var row = ui.node('tr'); var cell = ui.node('td', 'Заявки не найдены'); cell.colSpan = 9; row.appendChild(cell); body.appendChild(row); }
        summary.textContent = 'Заявок: ' + rows.length;
    }
    function filterChanged() {
        var url = new URL(window.location.href);
        [['owner', owner.value], ['status', select.value], ['q', search.value]].forEach(function (filter) {
            if (filter[1]) url.searchParams.set(filter[0], filter[1]);
            else url.searchParams.delete(filter[0]);
        });
        // Keep reload and linked-operation return on the same filtered register.
        window.history.replaceState(window.history.state, '', url.href);
        render();
    }
    owner.addEventListener('change', filterChanged); select.addEventListener('change', filterChanged); search.addEventListener('input', filterChanged);
    render();
    var focused = matchingRows().find(function (payout) { return '#' + payout.id === window.location.hash; });
    if (focused) show(focused);
    window.addEventListener('hashchange', function () {
        var payout = matchingRows().find(function (item) { return '#' + item.id === window.location.hash; });
        if (payout) show(payout);
        else detail.hidden = true;
    });
}());
