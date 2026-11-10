'use strict';

const params = new URLSearchParams(location.search);
const isClient = params.has('client');
const person = (isClient ? users : experts).find(row => String(row.id) === params.get(isClient ? 'client' : 'expert'));
const headings = new Map([
    ['profile', isClient ? 'Карточка клиента' : 'Анкета эксперта'],
    ['edit', isClient ? 'Редактирование аккаунта' : 'Редактирование анкеты'],
    ['credits', 'Корректировка кредитов']
]);
if (!isClient) headings.set('reviews', 'Отзывы эксперта');
const action = headings.has(params.get('action')) ? params.get('action') : 'profile';
const returnParams = new URLSearchParams();
for (const [key, value] of params) {
    if (['page', 'size', 'sort', 'order'].includes(key) || key.startsWith('filter_')) returnParams.set(key, value);
}
if (!(isClient ? clientSnapshot : expertSnapshot)) returnParams.set('data', 'demo');
const list = isClient ? 'clients.html' : 'experts.html';
const back = list + (returnParams.size ? '?' + returnParams : '');

const content = document.getElementById('action-content');
const byId = key => document.getElementById(key);
function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}
function actionLink(label, target) {
    const link = element('a', 'btn btn-sm btn-default', label);
    const linkParams = new URLSearchParams(params);
    linkParams.set('action', target);
    link.href = 'expert-action.html?' + linkParams;
    return link;
}
function demoDescription(row) {
    if (row.snapshot) return 'Описание доступно в анкете на сайте.';
    if (Object.hasOwn(row, 'description')) return row.description || 'Описание пока не заполнено.';
    const mainArea = row.areas[0];
    return mainArea
        ? 'Провожу консультации по направлению «' + mainArea + '». Помогаю сформулировать вопрос и разобрать возможные варианты.'
        : 'Описание пока не заполнено.';
}
function field(label, control) {
    const wrapper = element('div', 'form-group');
    const caption = element('label', '', label);
    caption.append(control);
    wrapper.append(caption);
    return wrapper;
}

const returnLink = byId('expert-return');
returnLink.href = back;
if (isClient) returnLink.lastChild.textContent = ' К клиентам';
const breadcrumb = byId('expert-breadcrumb');
breadcrumb.href = back;
breadcrumb.textContent = isClient ? 'Клиенты' : 'Эксперты';
if (isClient) {
    const other = document.querySelector('.main-sidebar a[href="experts.html"][aria-current]');
    const current = document.querySelector('.main-sidebar a[href="clients.html"]');
    other?.removeAttribute('aria-current');
    other?.closest('li').classList.remove('active');
    current?.setAttribute('aria-current', 'page');
    current?.closest('li').classList.add('active');
}
byId('action-heading').textContent = headings.get(action);
byId('action-crumb').textContent = headings.get(action);
document.title = headings.get(action) + ' · Макет Confideline';

if (!person) {
    byId('action-person').textContent = isClient ? 'Аккаунт не найден' : 'Анкета не найдена';
    content.append(element('p', '', isClient ? 'Выберите клиента в списке.' : 'Выберите эксперта в списке.'));
} else {
    byId('action-person').textContent = person.person + ' · ' + person.login;
    if (person.snapshot) byId('action-source').textContent = 'Макет · снимок от 29.10.2026';
    if (isClient && action === 'profile') {
        const links = element('div', 'expert-action-links');
        links.append(actionLink('Редактировать аккаунт', 'edit'), actionLink('Корректировка кредитов', 'credits'));
        if (person.snapshot) {
            const source = element('a', 'btn btn-sm btn-default', 'Открыть карточку в админке');
            source.href = 'https://confideline.com/ru/admin/user/info?id=' + person.id;
            links.append(source);
        }
        content.append(element('h2', 'h4', 'Аккаунт клиента'),
            element('p', '', 'ID: ' + person.id + ' · Логин: ' + person.login), links);
    } else if (isClient && action === 'edit') {
        for (const [label, value] of [['Имя клиента', person.person], ['Логин', person.login]]) {
            const input = element('input', 'form-control');
            input.value = value;
            input.readOnly = true;
            content.append(field(label, input));
        }
    } else if (action === 'profile') {
        content.append(element('h2', 'h4', 'Описание для клиентов'),
            element('p', '', demoDescription(person)),
            element('p', 'text-muted', person.snapshot && !person.rating ? 'Рейтинг в снимке не зафиксирован.' : ratingText(person.rating)));
        if (person.snapshot) {
            const source = element('a', '', 'Открыть анкету на Confideline');
            source.href = 'https://confideline.com/ru/profile/' + encodeURIComponent(person.login);
            content.append(source);
        }
        const links = element('div', 'expert-action-links');
        links.append(actionLink('Редактировать анкету', 'edit'), actionLink('Отзывы эксперта', 'reviews'));
        content.append(links);
    } else if (action === 'edit') {
        const name = element('input', 'form-control');
        name.value = person.person;
        name.readOnly = true;
        const description = element('textarea', 'form-control');
        description.value = demoDescription(person);
        description.rows = 3;
        description.readOnly = true;
        content.append(field('Имя в анкете', name), field('Описание для клиентов', description));
    } else if (action === 'reviews') {
        content.append(element('p', '', person.snapshot && !person.rating ? 'Рейтинг в снимке не зафиксирован.' : ratingText(person.rating)));
        if (person.rating && !person.snapshot) {
            const example = element('article', 'well well-sm');
            example.append(element('h2', 'h4', 'Пример опубликованного отзыва'),
                element('p', '', '5 из 5'),
                element('p', '', 'Консультация помогла сформулировать вопрос.'));
            content.append(example);
        }
    } else {
        content.append(element('h2', 'h4', 'Аккаунт для корректировки'),
            element('p', '', person.person + ' · ' + person.login));
    }
}

document.querySelector('.main-header form')?.addEventListener('submit', event => event.preventDefault());
document.querySelectorAll('a[href="#"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (link.dataset.previewSidebar) {
        document.body.classList.toggle(innerWidth < 768 ? 'sidebar-open' : 'sidebar-collapse');
    }
}));
