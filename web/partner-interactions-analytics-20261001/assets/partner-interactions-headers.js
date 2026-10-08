(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PartnerInteractionHeaders = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const definitions = {
    profileViews: { lines: ['Просмотры'], width: 80, compact: 72 },
    favorites: { lines: ['Избранное'], width: 80, compact: 72 },
    newDialogs: { lines: ['Новые', 'Chats'], width: 96, compact: 96 },
    newPings: { lines: ['Новые', 'Pings'], width: 96, compact: 96 },
    clientMessages: { lines: ['Сообщ.', 'клиента'], mark: 'К', width: 88, compact: 72 },
    expertMessages: { lines: ['Сообщ.', 'эксперта'], mark: 'Э', width: 88, compact: 72 },
    paidConsultations: { lines: ['Оплач.', 'консультации'], width: 104, compact: 104 },
    repeatExpert: { lines: ['Повторы', 'с экспертом'], mark: 'Э', width: 104, compact: 104 },
    repeatPlatform: { lines: ['Повторы', 'на платформе'], mark: 'П', width: 112, compact: 104 },
    pairLTV: { lines: ['LTV пары'], mark: 'пара', width: 112, compact: 112 },
    platformLTV: { lines: ['LTV клиента', 'вся платформа'], mark: 'клиент', width: 120, compact: 120 },
    blocks: { lines: ['Блокировки'], width: 88, compact: 72 },
    reports: { lines: ['Жалобы'], width: 80, compact: 72 }
  };
  Object.values(definitions).forEach(value => { Object.freeze(value.lines); Object.freeze(value); });
  Object.freeze(definitions);
  function effectiveMode(preference, capabilities = {}) {
    return preference === 'icons' && !capabilities.narrow && !capabilities.touch && capabilities.hover !== false ? 'icons' : 'labels';
  }
  function width(key, mode = 'labels', cellText = []) {
    const definition = definitions[key];
    if (!definition) throw new Error('Unknown header metric: ' + key);
    // Include full pair references and formatted values; missing-source text can wrap.
    const contentWidth = cellText.reduce((maximum, value) => Math.max(maximum, Math.ceil(String(value).length * 6.8 + 16)), 0);
    return Math.max(mode === 'icons' ? definition.compact : definition.width, contentWidth);
  }
  function tableWidth(keys, mode = 'labels', cellTexts = {}) {
    return keys.length ? 168 * 2 + 118 + keys.reduce((total, key) => total + width(key, mode, cellTexts[key] || []), 0) : 0;
  }
  // Pure lifecycle policy: Escape suppresses an anchor until both focus/hover leave.
  function tooltipState() {
    let hovered = null, focused = null, overTip = false, current = null, preferred = 'focus';
    const dismissed = new Set();
    const desired = () => {
      const candidate = overTip && current ? current : preferred === 'hover' ? hovered || focused : focused || hovered;
      return candidate && !dismissed.has(candidate) ? candidate : null;
    };
    return {
      enter(key, kind) { if (current !== key || kind === 'focus') overTip = false; preferred = kind; if (kind === 'focus') focused = key; else hovered = key; current = desired(); return current; },
      leave(key, kind) { if (kind === 'focus' && focused === key) focused = null; if (kind === 'hover' && hovered === key) hovered = null; if (focused !== key && hovered !== key) dismissed.delete(key); return desired(); },
      tip(value) { overTip = value; if (!value) { for (const key of dismissed) if (focused !== key && hovered !== key) dismissed.delete(key); if (!hovered && !focused) current = null; } return desired(); },
      escape() { const key = desired() || current || focused || hovered; if (key) dismissed.add(key); overTip = false; current = null; return null; },
      desired,
      reset() { hovered = focused = current = null; dismissed.clear(); overTip = false; }
    };
  }
  function position(anchor, size, viewport) {
    const edge = 8, gap = 6;
    const left = Math.max(edge, Math.min(anchor.left + anchor.width / 2 - size.width / 2, viewport.width - size.width - edge));
    const below = anchor.bottom + gap;
    const top = below + size.height <= viewport.height - edge ? below : Math.max(edge, anchor.top - size.height - gap);
    return { left, top };
  }
  return { definitions, effectiveMode, width, tableWidth, tooltipState, position };
});
