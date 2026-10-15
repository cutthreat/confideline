/* Synthetic detail examples only. Never deploy this file with the application. */
(function () {
    'use strict';
    if (!document.querySelector('script[src="assets/preview-only.js"]')) return;
    var ORDER_OPTIONS = { COMPLETED: 'Оплачен', NEW: 'Новый', IN_PROGRESS: 'В обработке', CANCELLED: 'Отменён',
        FAILED: 'Ошибка платежа (планируемый)', DECLINED: 'Отклонён (планируемый)', EXPIRED: 'Истёк (планируемый)', UNMAPPED: 'Неизвестный код' };
    var REFUND_OPTIONS = { none: 'Не запрашивался', requested: 'Запрошен', pending: 'В обработке',
        requires_action: 'Требуется действие', succeeded: 'Выполнен', failed: 'Ошибка возврата', canceled: 'Отменён',
        multiple: 'Два запроса: ошибка и ожидание', unknown: 'Неизвестный статус', unavailable: 'История недоступна' };
    var RETRY_OPTIONS = { idle: 'Доступен', denied: 'Нет права', pending: 'Ожидание результата',
        failed: 'Подтверждённая ошибка', unknown: 'Неизвестный исход', unavailable: 'Не подключён' };
    function refund(state, id) {
        var complete = state === 'succeeded';
        var restored = state === 'failed' || state === 'canceled';
        return { id: id || 'refund-fixture-2', order_id: '15', status: state, amount_decimal: '19.49', currency: 'USD',
            reason: 'По запросу клиента', provider_refund_id: state === 'requested' ? null : 're_fixture_' + state,
            requested_at: '2026-10-03T14:00:00Z', credits_reserved_at: '2026-10-03T14:00:01Z',
            provider_started_at: state === 'requested' ? null : '2026-10-03T14:00:02Z',
            succeeded_at: complete ? '2026-10-03T14:10:00Z' : null,
            failed_at: state === 'failed' ? '2026-10-03T14:10:00Z' : null,
            canceled_at: state === 'canceled' ? '2026-10-03T14:10:00Z' : null,
            credits_restored_at: restored ? '2026-10-03T14:10:01Z' : null,
            credits_debit_id: 'credit-fixture-debit-2', credits_restore_id: restored ? 'credit-fixture-restore-2' : null,
            error: state === 'failed' ? 'Синтетический пример подтверждённой ошибки провайдера' : null };
    }
    function snapshot(orderState, refundState, lowBalance, retryState) {
        retryState = retryState || 'idle';
        var history = refundState === 'none' ? [] : refundState === 'unavailable' ? null :
            [refund(refundState === 'multiple' ? 'pending' : refundState === 'unknown' ? 'provider_unmapped' : refundState)];
        if (refundState === 'multiple') {
            var previous = refund('failed', 'refund-fixture-1');
            previous.requested_at = '2026-10-02T14:00:00Z';
            previous.credits_reserved_at = '2026-10-02T14:00:01Z';
            previous.provider_started_at = '2026-10-02T14:00:02Z';
            previous.failed_at = '2026-10-02T14:10:00Z';
            previous.credits_restored_at = '2026-10-02T14:10:01Z';
            previous.provider_refund_id = 're_fixture_failed_1';
            previous.credits_debit_id = 'credit-fixture-debit-1';
            previous.credits_restore_id = 'credit-fixture-restore-1';
            history.push(previous);
        }
        var active = ['requested', 'pending', 'requires_action', 'multiple'].includes(refundState);
        return { order_id: '15', order_status: orderState, provider: 'stripe', amount_decimal: '19.49', currency: 'USD',
            order_credits: '500.00', balance_credits: active ? '0.00' : refundState === 'succeeded' || lowBalance ? '190.00' : '500.00',
            refunds: history, latest_refund_id: history && history.length ? history[0].id : null,
            retry: { refund_id: history && history.length ? history[0].id : null,
                can_retry: retryState === 'unavailable' ? null : refundState === 'requested' && ['idle', 'failed'].includes(retryState),
                state: retryState === 'unavailable' ? 'unknown' : retryState },
            can_prepare: !lowBalance && ['none', 'failed', 'canceled'].includes(refundState),
            preparation_blocker: lowBalance ? 'Недостаточно кредитов для полного возврата' : 'Возможность возврата не подтверждена' };
    }
    function select(label, options, value) {
        var wrapper = document.createElement('label');
        wrapper.appendChild(document.createTextNode(label));
        var input = document.createElement('select');
        input.className = 'form-control';
        input.setAttribute('aria-label', label);
        Object.keys(options).forEach(function (key) {
            var option = document.createElement('option');
            option.value = key;
            option.textContent = options[key];
            input.appendChild(option);
        });
        input.value = value;
        wrapper.appendChild(input);
        return { wrapper: wrapper, input: input };
    }
    function init() {
        var root = document.querySelector('.order-view-page[data-order-id]');
        if (!root || root.querySelector('.order-scenario-controls') || !window.AdminOrderDetail) return;
        var form = root.querySelector('#orderRefundDraftForm');
        var lowBalance = !!form && form.getAttribute('data-refund-eligibility') === 'insufficient_credits';
        var initial = form ? 'none' : 'succeeded';
        var toolbar = document.createElement('div');
        toolbar.className = 'order-scenario-controls';
        var order = select('Платёж (пример)', ORDER_OPTIONS, 'COMPLETED');
        var state = select('Возврат (пример)', REFUND_OPTIONS, initial);
        var retry = select('Повтор (пример)', RETRY_OPTIONS, 'idle');
        toolbar.append(order.wrapper, state.wrapper, retry.wrapper);
        var note = root.querySelector('.order-scenario-note');
        if (!note) { note = document.createElement('p'); note.className = 'order-scenario-note'; root.prepend(note); }
        var message = 'Синтетический пример. Не фактическое состояние заказа #15. ';
        if (note.firstChild && note.firstChild.nodeType === 3) note.firstChild.textContent = message;
        else note.prepend(document.createTextNode(message));
        note.after(toolbar);
        function render() {
            retry.input.disabled = state.input.value !== 'requested';
            window.AdminOrderDetail.render(root, snapshot(order.input.value, state.input.value, lowBalance, retry.input.value));
        }
        order.input.addEventListener('change', render);
        state.input.addEventListener('change', render);
        retry.input.addEventListener('change', render);
        root.addEventListener('admin:refundretryrequest', function (event) {
            if (event.target !== root) return;
            retry.input.value = 'pending';
            document.dispatchEvent(new CustomEvent('admin:previewnotice', { detail: {
                message: 'Пример: подтверждён повтор существующего запроса ' + event.detail.refund_id + '. Денежный запрос не отправлялся.'
            } }));
        });
        render();
    }
    window.AdminOrderDetailFixtures = { snapshot: snapshot };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    if (window.jQuery) window.jQuery(document).on('pjax:end.orderDetailPreview', init);
}());
