import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const storageStatePath = process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json';
const reportRoot = process.env.BAN_CURRENT_REPORT_ROOT || '../reports';
const timeoutMs = Number(process.env.BAN_CURRENT_TIMEOUT_MS || 60000);

const users = {
  shadow: { id: 165, username: 'ZephyronKaelHoffmann', name: 'Zephyron Kael Hoffmann' },
  full: { id: 166, username: 'KaelarisDornSchwarz', name: 'Kaelaris Dorn Schwarz' },
  recipient: { id: 167, username: 'KaelirTamm', name: 'Kaelir Tamm' },
  sender: { id: 168, username: 'CaelumRastNielsen', name: 'Caelum Rast Nielsen' },
};

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `ban-behavior-current-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  users,
  checks: [],
  findings: [],
  screenshots: {},
  cleanup: [],
  errors: [],
};

function route(pathname) {
  return new URL(pathname, baseURL).toString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clip(value, max = 1800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function check(id, status, title, evidence = {}) {
  result.checks.push({ id, status, title, evidence });
}

function finding(id, severity, title, evidence = {}) {
  result.findings.push({ id, severity, title, evidence });
}

async function annotate(page, label, variant = 'info') {
  await page.evaluate(({ label, variant }) => {
    document.querySelectorAll('[data-qa-audit-overlay]').forEach((node) => node.remove());
    const color = variant === 'fail' ? '#d92d20' : variant === 'pass' ? '#16803c' : '#b76b00';
    const wrap = document.createElement('div');
    wrap.setAttribute('data-qa-audit-overlay', '1');
    wrap.style.cssText = [
      'position:fixed',
      'left:18px',
      'top:18px',
      'z-index:2147483647',
      'max-width:520px',
      'padding:12px 14px',
      'background:#fff',
      `border:4px solid ${color}`,
      'box-shadow:0 10px 28px rgba(0,0,0,.18)',
      'font:700 16px/1.35 Arial,sans-serif',
      'color:#132238',
    ].join(';');
    wrap.textContent = label;
    const arrow = document.createElement('div');
    arrow.setAttribute('data-qa-audit-overlay', '1');
    arrow.style.cssText = [
      'position:fixed',
      'left:210px',
      'top:84px',
      'width:340px',
      'height:0',
      `border-top:6px solid ${color}`,
      'transform:rotate(12deg)',
      'transform-origin:left center',
      'z-index:2147483646',
    ].join(';');
    const tip = document.createElement('div');
    tip.setAttribute('data-qa-audit-overlay', '1');
    tip.style.cssText = [
      'position:fixed',
      'left:535px',
      'top:147px',
      'width:0',
      'height:0',
      `border-left:18px solid ${color}`,
      'border-top:11px solid transparent',
      'border-bottom:11px solid transparent',
      'z-index:2147483646',
    ].join(';');
    document.body.append(wrap, arrow, tip);
  }, { label, variant });
}

async function screenshot(page, key, fileName, label, variant = 'info') {
  try {
    if (label) await annotate(page, label, variant);
    const filePath = path.join(outDir, fileName);
    await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
    result.screenshots[key] = filePath;
    return filePath;
  } catch (error) {
    result.errors.push(`screenshot ${key}: ${error?.message || error}`);
    return '';
  }
}

async function getCsrf(page) {
  return page.evaluate(() => ({
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '',
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
  }));
}

async function postForm(page, targetUrl, fields = {}, ajax = false) {
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
    const text = await response.text();
    return { status: response.status, location: response.headers.get('location') || '', text: text.slice(0, 1600) };
  }, { targetUrl, fields, ajax, csrf });
}

async function userData(page, userId) {
  await page.goto(route('/en/admin/ban/create'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  return page.evaluate(async (id) => {
    const response = await fetch(`/en/admin/ban/user-data?id=${encodeURIComponent(id)}`, {
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = { parseError: text.slice(0, 800) }; }
    return { status: response.status, json };
  }, userId);
}

async function releaseBan(page, banId, reason) {
  if (!banId) return { skipped: true };
  const post = await postForm(page, route(`/en/admin/ban/delete?id=${banId}`), {}, false);
  result.cleanup.push({ banId, reason, post });
  return post;
}

async function cleanupUsers(page, reason) {
  for (const user of [users.shadow, users.full, users.recipient, users.sender]) {
    const before = await userData(page, user.id);
    const active = Number(before.json?.active_ban_id || 0);
    if (active) await releaseBan(page, active, `${reason}: ${user.username}`);
  }
}

async function createBan(page, user, mode, comment) {
  const dataBefore = await userData(page, user.id);
  const activeBefore = Number(dataBefore.json?.active_ban_id || 0);
  if (activeBefore) await releaseBan(page, activeBefore, `pre-clean ${user.username}`);

  await page.goto(route('/en/admin/ban/create'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.evaluate(({ user, mode, data, comment }) => {
    const setValue = (selector, value) => {
      const field = document.querySelector(selector);
      if (!field) return;
      field.value = String(value ?? '');
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const select = document.querySelector('select[name="Ban[user_id]"]');
    if (select && ![...select.options].some((option) => option.value === String(user.id))) {
      select.append(new Option(`${user.username} (${user.id})`, String(user.id), true, true));
    }
    setValue('select[name="Ban[user_id]"]', user.id);
    setValue('select[name="Ban[mode]"]', mode);
    setValue('select[name="period_type"]', 'permanent');
    setValue('input[name="ban_date_range"]', '');
    setValue('input[name="Ban[starts_at]"]', '');
    setValue('input[name="Ban[ends_at]"]', '');
    setValue('input[name="Ban[user_email]"]', data.email || '');
    setValue('input[name="Ban[ip]"]', data.ip || '');
    setValue('input[name="Ban[cookie_token]"]', data.cookie_token || '');
    setValue('textarea[name="Ban[comment]"], input[name="Ban[comment]"]', comment);
    const notify = document.querySelector('input[type="checkbox"][name="Ban[notify_user]"]');
    if (notify) {
      notify.checked = false;
      notify.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { user, mode, data: dataBefore.json || {}, comment });

  await screenshot(page, `admin-create-${mode}`, `admin-create-${mode}.png`, `Создание ${mode}-бана: пользователь выбран, критерии подтянуты автоматически`, 'info');
  const submit = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
  await page.evaluate(() => {
    const form = document.querySelector('form[action*="/ban/create"]');
    if (form?.requestSubmit) form.requestSubmit();
    else form?.submit();
  });
  await submit;
  await page.waitForTimeout(1200);

  const dataAfter = await userData(page, user.id);
  const activeAfter = Number(dataAfter.json?.active_ban_id || 0);
  await page.goto(route('/en/admin/ban/index'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.waitForTimeout(800);
  await screenshot(page, `admin-active-${mode}`, `admin-active-${mode}.png`, `${mode}-бан активен: проверяем строку в списке и active_ban_id`, activeAfter ? 'pass' : 'fail');
  if (!activeAfter) {
    throw new Error(`Не удалось создать ${mode}-бан для ${user.id}; before=${JSON.stringify(dataBefore).slice(0, 500)} after=${JSON.stringify(dataAfter).slice(0, 500)}`);
  }
  check(`create-${mode}`, 'PASS', `${mode}-бан создан и подтвержден active_ban_id`, { userId: user.id, activeBanId: activeAfter, dataAfter });
  return { banId: activeAfter, dataBefore, dataAfter };
}

async function loginAs(browser, user) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(route(`/en/admin/user/info?id=${user.id}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  const loginHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
      /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
    );
    return link?.href || '';
  });
  if (!loginHref) throw new Error(`Не найден login-as для ${user.username}`);
  await postForm(page, loginHref, {}, true);
  await page.goto(route('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
  await page.waitForTimeout(900);
  return { context, page };
}

async function sendMessage(browser, sender, recipient, text) {
  const session = await loginAs(browser, sender);
  try {
    const response = await session.page.evaluate(async ({ recipientId, text }) => {
      const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
      const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
      const body = new URLSearchParams();
      if (token) body.set(param, token);
      body.set('contactId', String(recipientId));
      body.set('message', text);
      body.set('pendingMessageId', String(Date.now()));
      const res = await fetch('/en/messages/create', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-Token': token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
      });
      const raw = await res.text();
      let json = null;
      try { json = JSON.parse(raw); } catch {}
      return { status: res.status, ok: res.ok, json, raw: raw.slice(0, 1600) };
    }, { recipientId: recipient.id, text });
    await session.page.goto(route('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1200);
    const body = await session.page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
    await screenshot(session.page, `sender-${sender.id}-to-${recipient.id}-${text.slice(3, 15)}`, `sender-${sender.id}-to-${recipient.id}-${Date.now()}.png`, `Отправитель ${sender.username}: действие выглядит как отправка сообщения`, response.json?.success === true ? 'pass' : 'fail');
    return { sender: sender.id, recipient: recipient.id, text, response, senderSeesExactText: body.includes(text), senderBody: clip(body, 1400) };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function messagesContain(browser, user, text, key, expectedVisible) {
  const session = await loginAs(browser, user);
  try {
    await session.page.goto(route('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(2200);
    const body = await session.page.locator('body').innerText({ timeout: 12000 }).catch(() => '');
    const contains = body.includes(text);
    const variant = contains === expectedVisible ? 'pass' : 'fail';
    await screenshot(
      session.page,
      key,
      `${key}.png`,
      expectedVisible
        ? `Проверяем получателя ${user.username}: точный QA-текст должен быть виден`
        : `Проверяем получателя ${user.username}: точный QA-текст НЕ должен быть виден`,
      variant
    );
    return { userId: user.id, username: user.username, text, contains, body: clip(body, 2200) };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function userPerspective(browser, user, keyPrefix) {
  const session = await loginAs(browser, user);
  const pages = [];
  try {
    for (const item of ['/en', '/en/messages', '/en/settings/profile']) {
      await session.page.goto(route(item), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await session.page.waitForTimeout(900);
      const body = await session.page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
      pages.push({
        route: item,
        url: session.page.url(),
        blockedMarker: /forbidden|access denied|your ip address has been blocked|you have been banned|account has been blocked|you have no access|заблокирован|доступ запрещ/i.test(body),
        loginMarker: /sign in|login|войти/i.test(body),
        text: clip(body, 1200),
      });
    }
    await screenshot(session.page, keyPrefix, `${keyPrefix}.png`, `Проверка состояния пользователя ${user.username}: доступность страниц после бана/снятия`, pages.some((p) => p.blockedMarker) ? 'fail' : 'pass');
    return { userId: user.id, username: user.username, pages };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function postLike(browser, sender, recipient) {
  const session = await loginAs(browser, sender);
  try {
    await session.page.goto(route(`/en/profile/${encodeURIComponent(recipient.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(700);
    const response = await session.page.evaluate(async ({ recipientId }) => {
      const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
      const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
      const body = new URLSearchParams();
      if (token) body.set(param, token);
      const res = await fetch(`/en/connections/toggle-like?toUserId=${encodeURIComponent(recipientId)}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-Token': token,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
      });
      const raw = await res.text();
      let json = null;
      try { json = JSON.parse(raw); } catch {}
      return { status: res.status, ok: res.ok, json, raw: raw.slice(0, 1200) };
    }, { recipientId: recipient.id });
    await screenshot(session.page, `like-${sender.id}-to-${recipient.id}`, `like-${sender.id}-to-${recipient.id}.png`, `Shadow-пользователь ставит лайк: внешне действие должно выглядеть успешным`, response.ok ? 'pass' : 'fail');
    return response;
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function incomingLikesContain(browser, recipient, actor) {
  const session = await loginAs(browser, recipient);
  try {
    await session.page.goto(route('/en/connections/likes?type=to'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1500);
    const body = await session.page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
    const contains = body.includes(actor.username) || body.includes(actor.name);
    await screenshot(session.page, `incoming-likes-${recipient.id}`, `incoming-likes-${recipient.id}.png`, `Проверяем U2 incoming likes: лайк от shadow-пользователя не должен появиться`, contains ? 'fail' : 'pass');
    return { contains, body: clip(body, 2000) };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function writeReport() {
  result.finishedAt = new Date().toISOString();
  const failedChecks = result.checks.filter((item) => item.status === 'FAIL');
  result.status = failedChecks.length || result.findings.length ? 'FAIL' : 'PASS';
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'ban-behavior-current.json'), JSON.stringify(result, null, 2), 'utf8');
  const md = [
    '# Confideline Ban Behavior Current Audit',
    '',
    `- Status: ${result.status}`,
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- Report dir: ${outDir}`,
    '',
    '## Checks',
    '',
    ...result.checks.map((item) => `- ${item.status}: ${item.id} - ${item.title}`),
    '',
    '## Findings',
    '',
    ...(result.findings.length ? result.findings.map((item) => `- ${item.severity}: ${item.id} - ${item.title}`) : ['- none']),
    '',
    '## Cleanup',
    '',
    ...result.cleanup.map((item) => `- ban #${item.banId}: ${item.reason}; status=${item.post?.status}`),
    '',
  ];
  fs.writeFileSync(path.join(outDir, 'ban-behavior-current.md'), md.join('\n'), 'utf8');
}

ensureDir(outDir);

const browser = await chromium.launch({ headless: true });
const adminContext = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1100 } });
const adminPage = await adminContext.newPage();
adminPage.setDefaultTimeout(30000);

try {
  await cleanupUsers(adminPage, 'preflight cleanup');

  const initial = {};
  for (const user of Object.values(users)) initial[user.username] = await userData(adminPage, user.id);
  check('preflight-clean', Object.values(initial).every((item) => !item.json?.active_ban_id) ? 'PASS' : 'FAIL', 'Перед тестом у всех QA-пользователей нет активного бана', initial);

  const runToken = `QA ban current ${stamp}`;

  const preOutbound = `${runToken} pre outbound U1 to U2`;
  result.shadowPreOutboundSend = await sendMessage(browser, users.shadow, users.recipient, preOutbound);
  result.shadowPreOutboundRecipient = await messagesContain(browser, users.recipient, preOutbound, 'pre-shadow-recipient-visible', true);
  check('pre-shadow-message-delivery', result.shadowPreOutboundRecipient.contains ? 'PASS' : 'FAIL', 'До shadow-бана U2 получает сообщение от U1', {
    send: result.shadowPreOutboundSend.response,
    recipientContains: result.shadowPreOutboundRecipient.contains,
  });

  result.shadowCreate = await createBan(adminPage, users.shadow, 'shadow', `${runToken}: shadow behavior current audit`);
  result.shadowPerspective = await userPerspective(browser, users.shadow, 'shadow-user-perspective-active');
  const shadowLooksBlocked = result.shadowPerspective.pages.some((page) => page.blockedMarker || page.loginMarker);
  check('shadow-user-can-use-site', shadowLooksBlocked ? 'FAIL' : 'PASS', 'Shadow-пользователь не видит явного бана и может открыть основные страницы', result.shadowPerspective);

  const shadowOutbound = `${runToken} active shadow outbound U1 to U2`;
  result.shadowOutboundSend = await sendMessage(browser, users.shadow, users.recipient, shadowOutbound);
  result.shadowSenderSeesOwn = result.shadowOutboundSend.senderSeesExactText;
  result.shadowRecipientDuring = await messagesContain(browser, users.recipient, shadowOutbound, 'shadow-recipient-during-hidden', false);
  check('shadow-outbound-hidden-during-ban', !result.shadowRecipientDuring.contains ? 'PASS' : 'FAIL', 'U2 не получает новое сообщение U1 во время shadow-бана', {
    send: result.shadowOutboundSend.response,
    senderSeesOwn: result.shadowSenderSeesOwn,
    recipientContains: result.shadowRecipientDuring.contains,
  });

  const inboundToShadow = `${runToken} inbound U3 to shadow U1`;
  result.inboundToShadowSend = await sendMessage(browser, users.sender, users.shadow, inboundToShadow);
  result.shadowSeesInboundDuring = await messagesContain(browser, users.shadow, inboundToShadow, 'shadow-inbound-during-hidden', false);
  check('shadow-inbound-hidden-during-ban', !result.shadowSeesInboundDuring.contains ? 'PASS' : 'FAIL', 'U1 под shadow-баном не видит новое входящее сообщение от U3', {
    send: result.inboundToShadowSend.response,
    shadowContains: result.shadowSeesInboundDuring.contains,
  });

  result.shadowLike = await postLike(browser, users.shadow, users.recipient);
  result.recipientIncomingLikes = await incomingLikesContain(browser, users.recipient, users.shadow);
  check('shadow-like-hidden-from-recipient', !result.recipientIncomingLikes.contains ? 'PASS' : 'FAIL', 'Лайк U1 во время shadow-бана не появляется у U2 во входящих лайках', {
    like: result.shadowLike,
    recipientContains: result.recipientIncomingLikes.contains,
  });

  await releaseBan(adminPage, result.shadowCreate.banId, 'release shadow after active checks');
  result.shadowAfterReleaseData = await userData(adminPage, users.shadow.id);
  check('shadow-release-clean', !result.shadowAfterReleaseData.json?.active_ban_id ? 'PASS' : 'FAIL', 'Shadow-бан снят, active_ban_id=false', result.shadowAfterReleaseData);

  result.shadowRecipientAfterRelease = await messagesContain(browser, users.recipient, shadowOutbound, 'shadow-recipient-after-release-still-hidden', false);
  check('shadow-during-message-stays-hidden-after-release', !result.shadowRecipientAfterRelease.contains ? 'PASS' : 'FAIL', 'Сообщение, отправленное во время shadow-бана, не должно появляться у U2 после снятия бана', {
    recipientContains: result.shadowRecipientAfterRelease.contains,
  });
  if (result.shadowRecipientAfterRelease.contains) {
    finding('SHADOW-RELEASE-001', 'HIGH', 'Сообщение U1->U2, отправленное во время shadow-бана, становится видимым после снятия бана', {
      text: shadowOutbound,
    });
  }

  const postShadowOutbound = `${runToken} post shadow release U1 to U2`;
  result.postShadowSend = await sendMessage(browser, users.shadow, users.recipient, postShadowOutbound);
  result.postShadowRecipient = await messagesContain(browser, users.recipient, postShadowOutbound, 'post-shadow-release-recipient-visible', true);
  check('post-shadow-release-message-delivery', result.postShadowRecipient.contains ? 'PASS' : 'FAIL', 'После снятия shadow-бана новые сообщения U1->U2 снова доставляются', {
    send: result.postShadowSend.response,
    recipientContains: result.postShadowRecipient.contains,
  });

  result.fullCreate = await createBan(adminPage, users.full, 'full', `${runToken}: full ban behavior current audit`);
  result.fullPerspective = await userPerspective(browser, users.full, 'full-user-perspective-active');
  const fullBlocked = result.fullPerspective.pages.some((page) => page.blockedMarker || page.loginMarker);
  check('full-ban-blocks-user-surface', fullBlocked ? 'PASS' : 'FAIL', 'Full-ban должен явно ограничить вход/основные пользовательские страницы', result.fullPerspective);

  const fullAttempt = `${runToken} full banned U166 attempt to U2`;
  result.fullAttemptSend = await sendMessage(browser, users.full, users.recipient, fullAttempt);
  result.fullRecipientDuring = await messagesContain(browser, users.recipient, fullAttempt, 'full-ban-recipient-during-hidden', false);
  check('full-ban-message-not-delivered', !result.fullRecipientDuring.contains ? 'PASS' : 'FAIL', 'Сообщение full-banned пользователя не доставляется U2', {
    send: result.fullAttemptSend.response,
    recipientContains: result.fullRecipientDuring.contains,
  });

  await releaseBan(adminPage, result.fullCreate.banId, 'release full after active checks');
  result.fullAfterReleaseData = await userData(adminPage, users.full.id);
  check('full-release-clean', !result.fullAfterReleaseData.json?.active_ban_id ? 'PASS' : 'FAIL', 'Full-бан снят, active_ban_id=false', result.fullAfterReleaseData);

  const postFullOutbound = `${runToken} post full release U166 to U2`;
  result.postFullSend = await sendMessage(browser, users.full, users.recipient, postFullOutbound);
  result.postFullRecipient = await messagesContain(browser, users.recipient, postFullOutbound, 'post-full-release-recipient-visible', true);
  check('post-full-release-message-delivery', result.postFullRecipient.contains ? 'PASS' : 'FAIL', 'После снятия full-бана новые сообщения U166->U2 доставляются', {
    send: result.postFullSend.response,
    recipientContains: result.postFullRecipient.contains,
  });
} catch (error) {
  result.errors.push(error?.stack || error?.message || String(error));
  result.status = 'ERROR';
} finally {
  await cleanupUsers(adminPage, 'finally cleanup').catch((error) => result.errors.push(`cleanup: ${error?.message || error}`));
  await writeReport().catch((error) => result.errors.push(`writeReport: ${error?.message || error}`));
  await adminContext.close().catch(() => null);
  await browser.close().catch(() => null);
}

if (result.errors.length) {
  console.error(result.errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: result.status, outDir, checks: result.checks.length, findings: result.findings.length }, null, 2));
}
