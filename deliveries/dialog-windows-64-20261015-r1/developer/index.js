(() => {
    'use strict';
    const rows = window.DialogInventory || [];
    const list = document.getElementById('window-list');
    const search = document.getElementById('window-search');
    const frame = document.getElementById('window-preview');
    const title = document.getElementById('preview-title');
    const open = document.getElementById('open-window');
    let area = 'client';
    let selected = rows.find(row => row.page === 'account--end-or-stay')?.id;
    const safeHref = value => typeof value === 'string' && /^examples\/(client|admin)\/[a-zA-Z0-9/_-]+\.html(?:\?fixture=1)?$/.test(value);
    const select = row => {
        if (!safeHref(row.href) || row.held) return;
        selected = row.id;
        title.textContent = row.name;
        open.href = row.href;
        frame.src = row.href;
        render();
    };
    function render() {
        const focusId = document.activeElement?.getAttribute('data-window-id');
        const query = search.value.trim().toLocaleLowerCase('ru');
        const visible = rows.filter(row => row.area === area && `${row.name} ${row.page} ${row.component}`.toLocaleLowerCase('ru').includes(query));
        list.replaceChildren();
        for (const row of visible) {
            const item = document.createElement('div'); item.className = 'window-item';
            const button = document.createElement('button'); button.type = 'button'; button.textContent = row.name;
            button.setAttribute('data-window-id', row.id);
            button.disabled = !safeHref(row.href) || row.held;
            button.setAttribute('aria-current', String(row.id === selected));
            button.addEventListener('click', () => select(row));
            const status = document.createElement('small'); status.textContent = `${row.page} · ${row.held ? '#25: на паузе' : row.status}`;
            item.append(button, status); list.append(item);
        }
        if (!visible.length) { const empty = document.createElement('p'); empty.textContent = 'Совпадений нет'; list.append(empty); }
        document.getElementById('window-count').textContent = `Найдено: ${visible.length}`;
        if (focusId) Array.from(list.querySelectorAll('button')).find(button => button.getAttribute('data-window-id') === focusId)?.focus();
    }
    const tabs = Array.from(document.querySelectorAll('[data-area]'));
    tabs.forEach((tab, index) => {
        tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
        tab.addEventListener('click', () => {
        area = tab.dataset.area;
        tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
        const first = rows.find(row => row.area === area && safeHref(row.href) && !row.held);
        if (first) select(first);
        else render();
        });
        tab.addEventListener('keydown', event => {
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
                : event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null;
            if (next === null) return;
            event.preventDefault(); tabs[next].focus(); tabs[next].click();
        });
    });
    search.addEventListener('input', render);
    render();
})();
