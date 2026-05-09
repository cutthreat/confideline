import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');
const timeoutMs = Number(process.env.FULL_SITE_TIMEOUT_MS || 60000);
const actorId = Number(process.env.FULL_SITE_ACTOR_USER_ID || 167);
const targetId = Number(process.env.FULL_SITE_TARGET_USER_ID || 168);
const cdpURL = process.env.FULL_SITE_CDP_URL || process.env.INTERACTIONS_CDP_URL || '';

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `user-interactions-scenario-${stamp}`);

const knownProfiles = {
  166: { username: 'KaelarisDornSchwarz', name: 'Kaelaris Dorn Schwarz' },
  167: { username: 'KaelirTamm', name: 'Kaelir Tamm' },
  168: { username: 'CaelumRastNielsen', name: 'Caelum Rast Nielsen' },
  182: { username: 'OmkarTiwari', name: 'Omkar Tiwari' },
  184: { username: 'OrionEsposito', name: 'Orion Esposito' },
};

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  users: { actorId, targetId, actor: knownProfiles[actorId] || {}, target: knownProfiles[targetId] || {} },
  checks: [],
  findings: [],
  screenshots: {},
  artifacts: {},
  errors: [],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function asUrl(route) {
  return new URL(route, baseURL).toString();
}

function clip(value, max = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function slug(value) {
  return String(value || 'item')
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

function addCheck(id, status, title, evidence = {}, comment = '') {
  result.checks.push({ id, status, title, comment, evidence });
}

function addFinding(id, severity, title, evidence = {}, action = '') {
  result.findings.push({ id, severity, title, action, evidence });
}

async function screenshot(page, key, fileName, label = '') {
  if (label) {
    await page.evaluate((labelText) => {
      const badge = document.createElement('div');
      badge.textContent = labelText;
      badge.style.cssText = [
        'position:fixed',
        'left:12px',
        'top:12px',
        'z-index:2147483647',
        'background:#111827',
        'color:#fff',
        'font:700 16px/1.35 Arial,sans-serif',
        'padding:10px 12px',
        'border-radius:6px',
        'max-width:760px',
      ].join(';');
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
  return filePath;
}

async function saveHtml(page, key, fileName) {
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, await page.content(), 'utf8');
  result.artifacts[key] = filePath;
  return filePath;
}

async function getCsrf(page) {
  return page.evaluate(() => ({
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '',
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
  }));
}

async function postForm(page, targetUrl, fields = {}, ajax = true) {
  const csrf = await getCsrf(page);
  return page.evaluate(async ({ targetUrl, fields, ajax, csrf }) => {
    const body = new URLSearchParams();
    if (csrf.token) body.set(csrf.param || '_csrf', csrf.token);
    for (const [key, value] of Object.entries(fields)) body.set(key, String(value ?? ''));
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-CSRF-Token': csrf.token || '',
    };
    if (ajax) headers['X-Requested-With'] = 'XMLHttpRequest';
    const response = await fetch(targetUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: body.toString(),
      redirect: 'manual',
    });
    const rawText = await response.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(rawText); } catch {}
    return { status: response.status, ok: response.ok, location: response.headers.get('location') || '', rawText: rawText.slice(0, 1800), json };
  }, { targetUrl, fields, ajax, csrf });
}

async function pageFacts(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    h1: document.querySelector('h1')?.innerText?.trim() || '',
    bodyText: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 5000),
    links: [...document.querySelectorAll('a[href], button, input[type="submit"]')]
      .map((node) => ({
        text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim().slice(0, 140),
        href: node.href || '',
        className: typeof node.className === 'string' ? node.className : '',
        id: node.id || '',
        title: node.getAttribute('title') || '',
        data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-') || attr.name.startsWith('ng-')).map((attr) => [attr.name, attr.value])),
      }))
      .slice(0, 180),
    forms: [...document.querySelectorAll('form')].map((form) => ({
      action: form.action,
      method: form.method,
      text: (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600),
      inputs: [...form.querySelectorAll('input, textarea, select')].map((input) => ({
        name: input.name || '',
        id: input.id || '',
        type: input.type || input.tagName,
        value: input.type === 'password' ? '' : String(input.value || '').slice(0, 140),
        checked: Boolean(input.checked),
      })).slice(0, 80),
    })).slice(0, 20),
  }));
}

async function loginAsUser(browser, userId, label) {
  const ownsContext = !cdpURL;
  const context = cdpURL
    ? browser.contexts()[0]
    : await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  if (!context) throw new Error('CDP browser has no persistent context; restart the dedicated QA Chrome profile');
  if (cdpURL) {
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
    await context.addCookies(state.cookies || []);
  }
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(asUrl(`/en/admin/user/info?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.waitForTimeout(500);
  const profileFromAdmin = await page.evaluate(() => {
    const body = document.body.innerText || '';
    const profileLink = [...document.querySelectorAll('a[href*="/profile/"]')].find((link) => /\/en\/profile\//.test(link.href));
    return { body: body.replace(/\s+/g, ' ').slice(0, 1500), profileHref: profileLink?.href || '', profileText: (profileLink?.innerText || '').replace(/\s+/g, ' ').trim() };
  });
  const loginHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
      /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
    );
    return link?.href || '';
  });
  if (!loginHref) throw new Error(`login-as-user link not found for ${label} user ${userId}`);
  const post = await postForm(page, loginHref, {}, true);
  await page.goto(asUrl('/en'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
  await page.waitForTimeout(700);
  return { context, page, ownsContext, userId, label, loginPost: post, profileFromAdmin };
}

async function closeSession(session) {
  if (!session) return;
  if (session.ownsContext) {
    await session.context.close().catch(() => null);
  } else {
    await session.page.close().catch(() => null);
  }
}

function containsUser(text, user) {
  return Boolean(user?.username && text.includes(user.username)) || Boolean(user?.name && text.includes(user.name));
}

async function inspectIncomingLikes(browser, recipient, actor, key) {
  const session = await loginAsUser(browser, recipient.id, `${key}-recipient`);
  try {
    await session.page.goto(asUrl('/en/connections/likes/to-you'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1500);
    const facts = await pageFacts(session.page);
    const contains = containsUser(facts.bodyText, actor);
    await screenshot(session.page, key, `${key}.png`, contains
      ? `Доказательство: во входящих лайках найден ${actor.name || actor.username}`
      : `Проверка: во входящих лайках НЕ найден ${actor.name || actor.username}`);
    return { contains, facts };
  } finally {
    await closeSession(session);
  }
}

async function inspectGuests(browser, recipient, actor, key) {
  const session = await loginAsUser(browser, recipient.id, `${key}-recipient`);
  try {
    await session.page.goto(asUrl('/en/connections/guests'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1500);
    const facts = await pageFacts(session.page);
    const contains = containsUser(facts.bodyText, actor);
    await screenshot(session.page, key, `${key}.png`, contains
      ? `Доказательство: в guests найден визит ${actor.name || actor.username}`
      : `Проверка: в guests НЕ найден ${actor.name || actor.username}`);
    return { contains, facts };
  } finally {
    await closeSession(session);
  }
}

async function performLike(browser, actor, target) {
  const before = await inspectIncomingLikes(browser, target, actor, 'incoming-likes-before');
  if (before.contains) {
    addCheck('USER-LIKE-RECIPIENT-SIDE', 'WARN', 'Лайк U1 -> U2 не выполнялся: пара уже содержит входящий лайк', { before }, 'Для строгого PASS нужна чистая пара, где U2 не видит U1 до действия. Скрипт не нажимает toggle-like, чтобы случайно не снять существующий лайк.');
    return;
  }
  const session = await loginAsUser(browser, actor.id, 'like-actor');
  let response = null;
  let actorFacts = null;
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(target.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(900);
    await screenshot(session.page, 'like-profile-before', 'like-profile-before.png', `U${actor.id} открывает профиль U${target.id} перед лайком`);
    response = await postForm(session.page, `/en/connections/toggle-like?toUserId=${encodeURIComponent(target.id)}`, {}, true);
    await session.page.waitForTimeout(900);
    actorFacts = await pageFacts(session.page);
    await screenshot(session.page, 'like-profile-after', 'like-profile-after.png', `U${actor.id} отправил like в сторону U${target.id}`);
  } finally {
    await closeSession(session);
  }
  const after = await inspectIncomingLikes(browser, target, actor, 'incoming-likes-after');
  const status = response?.ok && after.contains && !before.contains ? 'PASS' : 'FAIL';
  addCheck('USER-LIKE-RECIPIENT-SIDE', status, 'Лайк U1 -> U2 проверен со стороны получателя', { before, response, actorFacts, after }, status === 'PASS'
    ? 'До действия лайка не было, после действия U2 видит U1 во входящих лайках.'
    : status === 'WARN'
      ? 'Лайк отправился и U2 видит U1, но U1 уже был во входящих лайках до действия; нужен ретест на чистой паре для строгого PASS.'
      : 'Лайк не доказан на стороне получателя.');
  if (status === 'FAIL') {
    addFinding('USER-LIKE-DELIVERY-001', 'high', 'Лайк не доказан во входящих лайках получателя', { before, response, after }, 'Проверить toggle-like, список /connections/likes/to-you и состояние пары пользователей.');
  }
}

async function performProfileVisit(browser, actor, target) {
  const before = await inspectGuests(browser, target, actor, 'guests-before');
  const session = await loginAsUser(browser, actor.id, 'visit-actor');
  let actorFacts = null;
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(target.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1800);
    actorFacts = await pageFacts(session.page);
    await screenshot(session.page, 'profile-visit-actor', 'profile-visit-actor.png', `U${actor.id} посетил профиль U${target.id}`);
  } finally {
    await closeSession(session);
  }
  const after = await inspectGuests(browser, target, actor, 'guests-after');
  const status = after.contains && !before.contains ? 'PASS' : after.contains && before.contains ? 'WARN' : 'FAIL';
  addCheck('USER-PROFILE-VISIT-GUESTS', status, 'Визит U1 в профиль U2 проверен через guests у U2', { before, actorFacts, after }, status === 'PASS'
    ? 'До визита U1 не было в guests, после визита U2 видит U1.'
    : status === 'WARN'
      ? 'U2 видит U1 в guests, но след уже был до действия; нужен ретест на чистой паре для строгого PASS.'
      : 'Визит не найден в guests у U2.');
  if (status === 'FAIL') {
    addFinding('USER-VISIT-GUESTS-001', 'medium', 'Визит профиля не доказан в guests получателя', { before, after }, 'Проверить создание ProfileView/notification и страницу /connections/guests.');
  }
}

async function performFavorite(browser, actor, target) {
  const session = await loginAsUser(browser, actor.id, 'favorite-actor');
  let before = null;
  let action = null;
  let response = null;
  let after = null;
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(target.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1000);
    before = await pageFacts(session.page);
    await saveHtml(session.page, 'favorite-profile-html-before', 'favorite-profile-before.html');
    await screenshot(session.page, 'favorite-profile-before', 'favorite-profile-before.png', `Проверка favorite: профиль U${target.id} до действия`);
    action = await session.page.evaluate(() => {
      const nodes = [...document.querySelectorAll('a[href], button, input[type="submit"]')];
      const candidate = nodes.find((node) => /favorite|favourite/i.test(`${node.textContent || node.value || ''} ${node.href || ''} ${node.getAttribute('data-action') || ''} ${node.className || ''}`));
      return candidate ? {
        text: (candidate.textContent || candidate.value || '').replace(/\s+/g, ' ').trim(),
        href: candidate.href || '',
        dataAction: candidate.getAttribute('data-action') || '',
        tag: candidate.tagName,
        className: typeof candidate.className === 'string' ? candidate.className : '',
      } : null;
    });
    const targetUrl = action?.dataAction || action?.href || '';
    if (targetUrl) response = await postForm(session.page, targetUrl, {}, true);
    await session.page.waitForTimeout(1200);
    after = await pageFacts(session.page);
    await screenshot(session.page, 'favorite-profile-after', 'favorite-profile-after.png', response
      ? `Favorite action выполнен: проверяем ответ и состояние профиля`
      : `Favorite action не найден на профиле`);
  } finally {
    await closeSession(session);
  }
  const status = response?.ok ? 'PASS_SURFACE' : action ? 'WARN' : 'NOT_FOUND';
  addCheck('USER-FAVORITE-ACTION-SURFACE', status, 'Favorite проверен как action surface на профиле', { before, action, response, after }, status === 'PASS_SURFACE'
    ? 'Action favorite найден и POST вернул успешный HTTP-ответ. Вторую сторону для favorite проверять не нужно: это локальный список актера.'
    : status === 'WARN'
      ? 'Favorite action найден, но POST не дал успешного доказательства.'
      : 'Favorite action не найден на выбранном профиле; нужен другой fixture/profile.');
}

async function inspectGiftAndPhotoAccessSurfaces(browser, actor, target) {
  const session = await loginAsUser(browser, actor.id, 'surface-actor');
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(target.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1200);
    const facts = await pageFacts(session.page);
    await saveHtml(session.page, 'surfaces-profile-html', 'surfaces-profile.html');
    await screenshot(session.page, 'surfaces-profile', 'surfaces-profile.png', `Gift/photo access surface на профиле U${target.id}`);
    const giftForms = facts.forms.filter((form) => /gift\/send/i.test(form.action) || /gift/i.test(`${form.text} ${JSON.stringify(form.inputs)}`));
    const giftActions = facts.links.filter((link) => /gift/i.test(`${link.text} ${link.href} ${link.className} ${JSON.stringify(link.data)}`));
    const photoAccessActions = facts.links.filter((link) => /photo|private|access/i.test(`${link.text} ${link.href} ${link.className} ${JSON.stringify(link.data)}`));
    const privateMarkers = /private photo|access request|request access|hidden|locked/i.test(facts.bodyText);
    addCheck('USER-GIFT-SURFACE', giftForms.length || giftActions.length ? 'PASS_SURFACE' : 'NOT_FOUND', 'Gift surface найден на профиле', { giftForms, giftActions, bodySnippet: clip(facts.bodyText) }, giftForms.length || giftActions.length
      ? 'Форма/кнопка подарка присутствует. Отправку подарка лучше делать отдельным pass с контролем баланса и duplicate rules.'
      : 'Gift surface не найден на выбранном профиле.');
    addCheck('USER-PHOTO-ACCESS-SURFACE', photoAccessActions.length || privateMarkers ? 'PASS_SURFACE' : 'NOT_FOUND', 'Private photo/photo access surface проверен на профиле', { photoAccessActions, privateMarkers, bodySnippet: clip(facts.bodyText) }, photoAccessActions.length || privateMarkers
      ? 'На профиле есть признаки private/photo access. Нужен отдельный pass на профиле с приватными фото и проверкой входящего request у владельца.'
      : 'На выбранном профиле нет явного private photo/request access surface.');
  } finally {
    await closeSession(session);
  }
}

function writeReports() {
  result.finishedAt = new Date().toISOString();
  const hasFail = result.errors.length || result.checks.some((check) => check.status === 'FAIL');
  const hasWarn = result.checks.some((check) => ['WARN', 'NOT_FOUND'].includes(check.status));
  result.status = hasFail ? 'FAIL' : hasWarn ? 'PASS_WITH_GAPS' : 'PASS';

  fs.writeFileSync(path.join(outDir, 'user-interactions-scenario.json'), JSON.stringify(result, null, 2), 'utf8');
  const lines = [
    '# Confideline User Interactions Scenario',
    '',
    `- Status: ${result.status}`,
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- Actor: U${actorId} ${result.users.actor.name || result.users.actor.username || ''}`,
    `- Target: U${targetId} ${result.users.target.name || result.users.target.username || ''}`,
    '',
    '## Checks',
    '',
    ...result.checks.flatMap((check) => [
      `### ${check.status}: ${check.title}`,
      '',
      `- ID: ${check.id}`,
      `- Комментарий: ${check.comment || 'нет'}`,
      '',
    ]),
    '## Findings для Игоря',
    '',
    ...(result.findings.length ? result.findings.flatMap((finding) => [
      `### ${finding.severity.toUpperCase()}: ${finding.title}`,
      '',
      `- ID: ${finding.id}`,
      `- Действие: ${finding.action}`,
      '',
    ]) : ['- Новых подтвержденных багов в этом проходе нет.', '']),
    '## Screenshots',
    '',
    ...Object.entries(result.screenshots).map(([key, filePath]) => `- ${key}: ${filePath}`),
    '',
  ];
  fs.writeFileSync(path.join(outDir, 'user-interactions-scenario.md'), lines.join('\n'), 'utf8');
}

async function main() {
  ensureDir(outDir);
  if (!fs.existsSync(storageStatePath)) throw new Error(`Admin storage state is missing: ${storageStatePath}`);
  const browser = cdpURL
    ? await chromium.connectOverCDP(cdpURL, { timeout: 30000 })
    : await chromium.launch({ headless: true });
  const actor = { id: actorId, ...(knownProfiles[actorId] || {}) };
  const target = { id: targetId, ...(knownProfiles[targetId] || {}) };
  if (!actor.username || !target.username) throw new Error(`Known usernames are required for actor ${actorId} and target ${targetId}`);

  try {
    await performProfileVisit(browser, actor, target);
    await performLike(browser, actor, target);
    await performFavorite(browser, actor, target);
    await inspectGiftAndPhotoAccessSurfaces(browser, actor, target);
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    writeReports();
  }

  console.log(JSON.stringify({
    status: result.status,
    outDir,
    checks: result.checks.map((check) => ({ id: check.id, status: check.status })),
    findings: result.findings.map((finding) => ({ id: finding.id, severity: finding.severity })),
    errors: result.errors,
  }, null, 2));
  if (result.errors.length || result.checks.some((check) => check.status === 'FAIL')) process.exitCode = 1;
  if (cdpURL) setTimeout(() => process.exit(process.exitCode || 0), 100);
}

main();

