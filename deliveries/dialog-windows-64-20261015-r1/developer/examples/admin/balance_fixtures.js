/* Synthetic preview data only. Not a financial engine, server schema or configured payout rate. */
(function () {
    'use strict';
    var accounts = {
        'staff-1': { name: 'Анна Волкова', username: 'demo.anna', role: 'agent' },
        'staff-2': { name: 'Михаил Орлов', username: 'demo.mikhail', role: 'expert' },
        'staff-3': { name: 'Елена Соколова', username: 'demo.elena', role: 'expert' },
        'staff-4': { name: 'Павел Кузнецов', username: 'demo.pavel', role: 'expert' },
        'client-1': { name: 'Эмили Уилсон', username: 'demo.emily', role: 'client' },
        'client-2': { name: 'Джеймс Миллер', username: 'demo.james', role: 'client' }
    };
    var profiles = {
        'profile-orion': { name: 'Orion', username: 'demo.orion', account_id: 'staff-1' },
        'profile-luna': { name: 'Luna', username: 'demo.luna', account_id: 'staff-1' }
    };
    var entries = [
        { id: 101, owner_id: 'client-1', amount: '200.00', before: '0.00', date: '2026-09-28T14:00:00Z', type: 'topup', description: 'Пополнение кошелька' },
        { id: 102, owner_id: 'client-1', client_id: 'client-1', profile_id: 'profile-orion', agent_id: 'staff-1', consultation_id: 'DEMO-S001', related_id: 103, amount: '-20.00', before: '200.00', date: '2026-09-29T16:00:00Z', type: 'consultation_debit', description: 'Оплаченная консультация DEMO-S001' },
        { id: 103, owner_id: 'staff-1', client_id: 'client-1', profile_id: 'profile-orion', agent_id: 'staff-1', consultation_id: 'DEMO-S001', related_id: 102, amount: '9.00', before: '0.00', date: '2026-09-29T16:00:00Z', type: 'consultation_accrual', description: 'Начисление по консультации DEMO-S001' },
        { id: 104, owner_id: 'staff-1', amount: '5.00', before: '9.00', date: '2026-09-29T17:00:00Z', type: 'bonus', description: 'Бонус за качество консультации' },
        { id: 105, owner_id: 'client-2', amount: '100.00', before: '0.00', date: '2026-09-30T13:00:00Z', type: 'topup', description: 'Пополнение кошелька' },
        { id: 106, owner_id: 'client-2', client_id: 'client-2', profile_id: 'profile-luna', agent_id: 'staff-1', consultation_id: 'DEMO-S002', related_id: 107, amount: '-10.00', before: '100.00', date: '2026-09-30T18:00:00Z', type: 'consultation_debit', description: 'Оплаченная консультация DEMO-S002' },
        { id: 107, owner_id: 'staff-1', client_id: 'client-2', profile_id: 'profile-luna', agent_id: 'staff-1', consultation_id: 'DEMO-S002', related_id: 106, amount: '4.50', before: '14.00', date: '2026-09-30T18:00:00Z', type: 'consultation_accrual', description: 'Начисление по консультации DEMO-S002' },
        { id: 108, owner_id: 'staff-1', payout_id: 'DEMO-P001', amount: '-18.50', before: '18.50', date: '2026-10-01T14:00:00Z', type: 'payout_request', description: 'Заявка на выплату DEMO-P001' },
        { id: 109, owner_id: 'staff-1', payout_id: 'DEMO-P001', related_id: 108, amount: '18.50', before: '0.00', date: '2026-10-02T14:00:00Z', type: 'payout_restore', description: 'Восстановление кредитов после отказа DEMO-P001' },
        { id: 201, owner_id: 'staff-2', amount: '7.00', before: '0.00', date: '2026-09-25T13:00:00Z', type: 'bonus', description: 'Историческое начисление' },
        { id: 202, owner_id: 'staff-2', payout_id: 'DEMO-P005', amount: '-7.00', before: '7.00', date: '2026-09-27T13:00:00Z', type: 'payout_request', description: 'Заявка на выплату DEMO-P005' },
        { id: 203, owner_id: 'staff-2', payout_id: 'DEMO-P005', related_id: 202, amount: '7.00', before: '0.00', date: '2026-09-27T15:00:00Z', type: 'payout_restore', description: 'Восстановление после отмены DEMO-P005' },
        { id: 208, owner_id: 'staff-2', amount: '3.00', before: '7.00', date: '2026-09-28T13:00:00Z', type: 'bonus', description: 'Исторический бонус' },
        { id: 204, owner_id: 'staff-2', payout_id: 'DEMO-P003', amount: '-10.00', before: '10.00', date: '2026-09-29T13:00:00Z', type: 'payout_request', description: 'Заявка на выплату DEMO-P003' },
        { id: 209, owner_id: 'staff-2', amount: '25.00', before: '0.00', date: '2026-10-03T13:00:00Z', type: 'bonus', description: 'Историческое начисление' },
        { id: 205, owner_id: 'staff-2', payout_id: 'DEMO-P002', amount: '-25.00', before: '25.00', date: '2026-10-04T14:00:00Z', type: 'payout_request', description: 'Заявка на выплату DEMO-P002' },
        { id: 301, owner_id: 'staff-3', amount: '12.00', before: '0.00', date: '2026-10-05T13:30:00Z', type: 'bonus', description: 'Историческое начисление' },
        { id: 206, owner_id: 'staff-3', payout_id: 'DEMO-P004', amount: '-12.00', before: '12.00', date: '2026-10-05T14:00:00Z', type: 'payout_request', description: 'Заявка на выплату DEMO-P004' },
        { id: 401, owner_id: 'staff-4', amount: '8.00', before: '0.00', date: '2026-10-05T14:15:00Z', type: 'bonus', description: 'Историческое начисление' },
        { id: 207, owner_id: 'staff-4', payout_id: 'DEMO-P006', amount: '-8.00', before: '8.00', date: '2026-10-05T14:30:00Z', type: 'payout_request', description: 'Заявка DEMO-P006, исход внешнего перевода не подтверждён' }
    ];
    var negativeEntry = { id: 110, owner_id: 'staff-1', amount: '-20.00', before: '18.50', date: '2026-10-03T14:00:00Z', type: 'penalty', description: 'Историческое депремирование: причина сохранена' };
    var payouts = [
        { id: 'DEMO-P001', owner_id: 'staff-1', credits: '18.50', usd_amount: null, coefficient: null, status: 'declined', requested_at: '2026-10-01T14:00:00Z', approved_at: null, paid_at: null, resolved_at: '2026-10-02T14:00:00Z', reason: 'Неверные реквизиты', debit_id: 108, restore_id: 109, transfer_reference: null },
        { id: 'DEMO-P002', owner_id: 'staff-2', credits: '25.00', usd_amount: null, coefficient: null, status: 'approved', requested_at: '2026-10-04T14:00:00Z', approved_at: '2026-10-05T13:00:00Z', paid_at: null, resolved_at: null, reason: null, debit_id: 205, restore_id: null, transfer_reference: null },
        { id: 'DEMO-P003', owner_id: 'staff-2', credits: '10.00', usd_amount: '3.00', coefficient: null, status: 'paid', requested_at: '2026-09-29T13:00:00Z', approved_at: '2026-09-29T15:00:00Z', paid_at: '2026-09-30T19:00:00Z', resolved_at: null, reason: null, debit_id: 204, restore_id: null, transfer_reference: 'DEMO-TRANSFER-003' },
        { id: 'DEMO-P004', owner_id: 'staff-3', credits: '12.00', usd_amount: null, coefficient: null, status: 'requested', requested_at: '2026-10-05T14:00:00Z', approved_at: null, paid_at: null, resolved_at: null, reason: null, debit_id: 206, restore_id: null, transfer_reference: null },
        { id: 'DEMO-P005', owner_id: 'staff-2', credits: '7.00', usd_amount: null, coefficient: null, status: 'canceled', requested_at: '2026-09-27T13:00:00Z', approved_at: null, paid_at: null, resolved_at: '2026-09-27T15:00:00Z', reason: 'Отменено до внешнего перевода', debit_id: 202, restore_id: 203, transfer_reference: null },
        { id: 'DEMO-P006', owner_id: 'staff-4', credits: '8.00', usd_amount: null, coefficient: null, status: 'unknown', requested_at: '2026-10-05T14:30:00Z', approved_at: null, paid_at: null, resolved_at: null, reason: 'Исход не подтверждён: необходима сверка', debit_id: 207, restore_id: null, transfer_reference: null }
    ];
    var states = ['positive', 'zero', 'negative', 'empty', 'pending', 'unknown', 'below_minimum', 'minimum', 'above_minimum', 'settings_unknown', 'access_denied'];
    function scenario(state) {
        if (!states.includes(state)) state = 'positive';
        var rows = entries.map(function (entry) { return Object.assign({}, entry); });
        var payoutRows = payouts.map(function (payout) { return Object.assign({}, payout); });
        var balance = '18.50';
        if (state === 'zero' || state === 'pending') {
            rows = rows.filter(function (entry) { return entry.id !== 109; });
            payoutRows[0].status = state === 'pending' ? 'requested' : 'paid';
            payoutRows[0].restore_id = null;
            payoutRows[0].resolved_at = null;
            payoutRows[0].reason = null;
            payoutRows[0].approved_at = state === 'zero' ? '2026-10-02T13:00:00Z' : null;
            payoutRows[0].paid_at = state === 'zero' ? '2026-10-02T14:00:00Z' : null;
            payoutRows[0].transfer_reference = state === 'zero' ? 'DEMO-TRANSFER-001' : null;
            balance = '0.00';
        } else if (state === 'negative') {
            rows.push(Object.assign({}, negativeEntry));
            balance = '-1.50';
        } else if (state === 'empty') {
            rows = rows.filter(function (entry) { return entry.owner_id !== 'staff-1' && entry.agent_id !== 'staff-1'; });
            payoutRows = payoutRows.filter(function (payout) { return payout.owner_id !== 'staff-1'; });
            balance = '0.00';
        } else if (state === 'unknown') balance = null;
        var addedBalance = { below_minimum: ['499.99', '481.49'], minimum: ['500.00', '481.50'],
            above_minimum: ['750.50', '732.00'], settings_unknown: ['500.00', '481.50'], access_denied: ['500.00', '481.50'] }[state];
        if (addedBalance) {
            balance = addedBalance[0];
            rows.push({ id: 111, owner_id: 'staff-1', amount: addedBalance[1], before: '18.50', date: '2026-10-07T14:00:00Z',
                type: 'topup', description: 'Синтетическое административное пополнение для проверки порога, не поощрение' });
        }
        return { state: state, owner_id: 'staff-1', balance: balance, pending: state === 'pending', entries: rows, payouts: payoutRows,
            payout_policy: { can_request: state !== 'access_denied', minimum_credits: state === 'settings_unknown' ? null : '500.00',
                usd_per_credit: state === 'settings_unknown' ? null : '0.05', source: 'synthetic_customer_decision_2026_10_07' } };
    }
    function partnerSnapshot(sample, id) {
        if (!Object.prototype.hasOwnProperty.call(accounts, id)) return null;
        var account = accounts[id];
        if (!account || account.role === 'client') return null;
        var history = sample.entries.filter(function (entry) { return entry.owner_id === id; }).sort(function (a, b) {
            return Date.parse(a.date) - Date.parse(b.date) || a.id - b.id;
        });
        var requests = sample.payouts.filter(function (payout) { return payout.owner_id === id; });
        var paid = requests.filter(function (payout) {
            return payout.status === 'paid' && Number.isFinite(Date.parse(payout.paid_at)) &&
                typeof payout.transfer_reference === 'string' && payout.transfer_reference.trim();
        }).sort(function (a, b) { return Date.parse(b.paid_at) - Date.parse(a.paid_at); });
        function units(value) {
            var parts = value.replace('-', '').split('.');
            var amount = BigInt(parts[0]) * 100n + BigInt((parts[1] || '').padEnd(2, '0'));
            return value.startsWith('-') ? -amount : amount;
        }
        var total = history.reduce(function (sum, entry) { return sum + units(entry.amount); }, 0n);
        var magnitude = total < 0n ? -total : total;
        var balance = (total < 0n ? '-' : '') + magnitude / 100n + '.' + String(magnitude % 100n).padStart(2, '0');
        return { id: id, account: account, current_balance: id === sample.owner_id ? sample.balance : balance,
            profiles: Object.keys(profiles).filter(function (key) { return profiles[key].account_id === id; }).map(function (key) {
                return Object.assign({ id: key }, profiles[key]);
            }), history: history, payouts: requests, last_operation_at: history.length ? history[history.length - 1].date : null,
            last_payout: paid.length ? paid[0] : null, payment_details: null, individual_rate: null };
    }
    var data = { accounts: accounts, profiles: profiles, states: states, scenario: scenario, partnerSnapshot: partnerSnapshot };
    if (typeof module !== 'undefined' && module.exports) module.exports = data;
    else window.AdminBalancePreviewFixtures = data;
}());
