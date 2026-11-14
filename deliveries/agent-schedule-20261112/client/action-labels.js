(() => {
  const limit = 18;
  const defaults = {
    online: {action: 'chat', label: 'Написать в чат'},
    busy: {action: 'wait', label: 'Уведомить меня'},
    offline: {action: 'booking', label: 'Записаться'}
  };
  const actionLabels = {chat: defaults.online.label, wait: defaults.busy.label, booking: defaults.offline.label, link: 'Подробнее'};
  function isValid(value) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= limit && !/[\r\n\u2028\u2029]/u.test(value);
  }
  window.CatalogActionLabels = {limit, defaults, actionLabels, isValid};
})();
