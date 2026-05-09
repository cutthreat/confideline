import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const qaRoot = path.resolve(__dirname, '../..');

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const storageStatePath = process.env.ADMIN_STORAGE_STATE || path.join(qaRoot, 'secrets/admin-storage-state.super-admin.json');
const reportRoot = process.env.SHADOW_EXT_REPORT_ROOT || path.join(qaRoot, 'reports');
const timeoutMs = Number(process.env.SHADOW_EXT_TIMEOUT_MS || 60000);

const users = {
  shadow: { id: 165, username: 'ZephyronKaelHoffmann', name: 'Zephyron Kael Hoffmann' },
  recipient: { id: 167, username: 'KaelirTamm', name: 'Kaelir Tamm' },
  inbound: { id: 168, username: 'CaelumRastNielsen', name: 'Caelum Rast Nielsen' },
  viewer: { id: 166, username: 'KaelarisDornSchwarz', name: 'Kaelaris Dorn Schwarz' },
};

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `shadow-ban-extended-matrix-${stamp}`);
const runToken = `QA shadow-ext ${stamp}`;

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  users,
  runToken,
  checks: [],
  findings: [],
  screenshots: {},
  cleanup: [],
  states: {},
  errors: [],
};

function route(pathname) { return new URL(pathname, baseURL).toString(); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function clip(value, max = 2200) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function slug(value) { return String(value || '').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'page'; }

function check(id, status, title, evidence = {}, comment = '') {
  result.checks.push({ id, status, title, comment, evidence });
}

function finding(id, severity, title, evidence = {}, action = '') {
  result.findings.push({ id, severity, title, action, evidence });
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
      'max-width:620px',
      'padding:12px 14px',
      'background:#fff',
      `border:4px solid ${color}`,
      'box-shadow:0 10px 28px rgba(0,0,0,.18)',
      'font:700 15px/1.35 Arial,sans-serif',
      'color:#132238',
    ].join(';');
    wrap.textContent = label;
    const box = document.createElement('div');
    box.setAttribute('data-qa-audit-overlay', '1');
    box.style.cssText = [
      'position:fixed',
      'left:72px',
      'top:170px',
      'right:72px',
      'height:190px',
      `border:5px solid ${color}`,
      'z-index:2147483646',
      'pointer-events:none',
    ].join(';');
    document.body.append(wrap, box);
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
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': csrf.token || '' };
    if (ajax) headers['X-Requested-With'] = 'XMLHttpRequest';
    const response = await fetch(targetUrl, { method: 'POST', credentials: 'same-origin', headers, body: body.toString(), redirect: 'manual' });
    const text = await response.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: response.status, ok: response.ok, location: response.headers.get('location') || '', json, text: text.slice(0, 1800) };
  }, { targetUrl, fields, ajax, csrf });
}

async function pageFacts(page, max = 7000) {
  return page.evaluate((max) => ({
    url: location.href,
    title: document.title,
    bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, max),
    links: [...document.querySelectorAll('a[href], button, input[type="submit"]')].map((node) => ({
      text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      href: node.href || '',
      className: typeof node.className === 'string' ? node.className : '',
      data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-') || attr.name.startsWith('ng-')).map((attr) => [attr.name, attr.value])),
    })).slice(0, 220),
    forms: [...document.querySelectorAll('form')].map((form) => ({
      action: form.action || '',
      method: form.method || '',
      id: form.id || '',
      inputs: [...form.querySelectorAll('input,select,textarea,button')].map((input) => ({
        name: input.name || '',
        id: input.id || '',
        type: input.type || input.tagName,
        value: input.value || '',
        text: input.textContent || '',
      })).slice(0, 80),
    })).slice(0, 20),
  }), max);
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
  for (const user of Object.values(users)) {
    const before = await userData(page, user.id);
    const active = Number(before.json?.active_ban_id || 0);
    if (active) await releaseBan(page, active, `${reason}: ${user.username}`);
  }
}

async function getAdminBalance(page, userId) {
  await page.goto(route(`/en/admin/user/update-balance?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.waitForTimeout(500);
  const facts = await pageFacts(page);
  const credits = Number((facts.bodyText.match(/Current balance:\s*([\d.,-]+)\s*credits/i)?.[1] || 'NaN').replace(/,/g, ''));
  return { credits, facts };
}

async function addAdminCredits(page, userId, amount, notes) {
  await page.goto(route(`/en/admin/user/update-balance?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  return postForm(page, route(`/en/admin/user/update-balance?id=${userId}`), {
    'BalanceUpdateForm[amount]': amount,
    'BalanceUpdateForm[notes]': notes,
  }, false);
}

async function ensureMinBalance(page, user, minCredits) {
  const before = await getAdminBalance(page, user.id);
  let topUp = null;
  if (!Number.isFinite(before.credits) || before.credits < minCredits) {
    topUp = await addAdminCredits(page, user.id, minCredits, `${runToken}: QA top-up for shadow gift scenario`);
  }
  const after = await getAdminBalance(page, user.id);
  return { before, topUp, after };
}

async function createShadowBan(page, user, comment) {
  const dataBefore = await userData(page, user.id);
  const activeBefore = Number(dataBefore.json?.active_ban_id || 0);
  if (activeBefore) await releaseBan(page, activeBefore, `pre-clean ${user.username}`);
  await page.goto(route('/en/admin/ban/create'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.evaluate(({ user, data, comment }) => {
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
    setValue('select[name="Ban[mode]"]', 'shadow');
    setValue('select[name="period_type"]', 'permanent');
    setValue('input[name="ban_date_range"]', '');
    setValue('input[name="Ban[starts_at]"]', '');
    setValue('input[name="Ban[ends_at]"]', '');
    setValue('input[name="Ban[user_email]"]', data.email || '');
    setValue('input[name="Ban[ip]"]', data.ip || '');
    setValue('input[name="Ban[cookie_token]"]', data.cookie_token || '');
    setValue('textarea[name="Ban[comment]"], input[name="Ban[comment]"]', comment);
    const notify = document.querySelector('input[type="checkbox"][name="Ban[notify_user]"]');
    if (notify) notify.checked = false;
  }, { user, data: dataBefore.json || {}, comment });
  await screenshot(page, 'admin-create-shadow', 'admin-create-shadow.png', 'Создание shadow-ban: критерии подтянуты автоматически', 'info');
  const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
  await page.evaluate(() => {
    const form = document.querySelector('form[action*="/ban/create"]');
    if (form?.requestSubmit) form.requestSubmit();
    else form?.submit();
  });
  await nav;
  await page.waitForTimeout(1200);
  const dataAfter = await userData(page, user.id);
  const activeAfter = Number(dataAfter.json?.active_ban_id || 0);
  await page.goto(route('/en/admin/ban/index'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await screenshot(page, 'admin-shadow-active', 'admin-shadow-active.png', 'Shadow-ban активен: active_ban_id подтвержден', activeAfter ? 'pass' : 'fail');
  if (!activeAfter) throw new Error(`Не удалось создать shadow-ban для ${user.id}`);
  check('SHADOW-CREATE', 'PASS', 'Shadow-ban создан и подтвержден active_ban_id', { userId: user.id, activeBanId: activeAfter, dataAfter });
  return { banId: activeAfter, dataBefore, dataAfter };
}

async function loginAs(browser, user, startRoute = '/en') {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(route(`/en/admin/user/info?id=${user.id}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  const loginHref = await page.evaluate(() => [...document.querySelectorAll('a[href]')].find((candidate) =>
    /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
  )?.href || '');
  if (!loginHref) throw new Error(`Не найден login-as для ${user.username}`);
  await postForm(page, loginHref, {}, true);
  await page.goto(route(startRoute), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
  await page.waitForTimeout(800);
  return { context, page };
}

async function profileVisibleTo(browser, viewer, target, key, expectedVisible) {
  const session = await loginAs(browser, viewer, `/en/profile/${encodeURIComponent(target.username)}`);
  try {
    await session.page.waitForTimeout(1400);
    const facts = await pageFacts(session.page);
    const visible = facts.bodyText.includes(target.name) || facts.bodyText.includes(target.username);
    await screenshot(session.page, key, `${key}.png`, expectedVisible
      ? `Профиль ${target.username} должен быть виден пользователю ${viewer.username}`
      : `Профиль ${target.username} НЕ должен быть публично виден пользователю ${viewer.username} во время shadow-ban`, visible === expectedVisible ? 'pass' : 'fail');
    return { visible, facts };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function sendGift(browser, actor, target, message, keyPrefix) {
  const session = await loginAs(browser, actor, `/en/profile/${encodeURIComponent(target.username)}`);
  try {
    await session.page.waitForTimeout(1200);
    const before = await pageFacts(session.page);
    const giftForm = before.forms.find((form) => /\/gift\/send/i.test(form.action));
    const giftIds = (giftForm?.inputs || []).filter((input) => input.name === 'giftItemId').map((input) => input.value).filter(Boolean);
    let send = null;
    let chosenGiftId = '';
    for (const giftId of giftIds.slice(0, 10)) {
      chosenGiftId = giftId;
      send = await postForm(session.page, route('/en/gift/send'), {
        toUserId: String(target.id),
        giftItemId: giftId,
        message,
        isPrivate: '0',
      }, true);
      if (send.json?.success) break;
      if (!/already sent/i.test(JSON.stringify(send.json || send.text))) break;
    }
    await session.page.waitForTimeout(800);
    await screenshot(session.page, `${keyPrefix}-actor`, `${keyPrefix}-actor.png`, `Gift ${actor.username} -> ${target.username}: action result success=${Boolean(send?.json?.success)}`, send?.json?.success ? 'pass' : 'fail');
    return { chosenGiftId, send, before };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function recipientGiftEvidence(browser, recipient, actor, exactMessage, key, expectedVisible) {
  const session = await loginAs(browser, recipient, '/en/notifications');
  try {
    const pages = [];
    for (const item of ['/en/notifications', `/en/profile/${encodeURIComponent(actor.username)}`]) {
      await session.page.goto(route(item), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await session.page.waitForTimeout(1400);
      const facts = await pageFacts(session.page);
      pages.push({
        route: item,
        containsActor: facts.bodyText.includes(actor.name) || facts.bodyText.includes(actor.username),
        containsMessage: facts.bodyText.includes(exactMessage),
        containsGiftText: /gift|подар/i.test(facts.bodyText),
        facts,
      });
    }
    const exactMessageVisible = pages.some((page) => page.containsMessage);
    const weakGiftVisible = pages.some((page) => page.containsActor && page.containsGiftText);
    const visible = exactMessageVisible;
    await screenshot(session.page, key, `${key}.png`, expectedVisible
      ? `Получатель должен видеть gift-сигнал от ${actor.username}`
      : `Получатель НЕ должен видеть gift-сигнал от shadow-пользователя ${actor.username}`, visible === expectedVisible ? 'pass' : 'fail');
    return { visible, exactMessageVisible, weakGiftVisible, pages };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function requestPhotoAccess(browser, actor, target, keyPrefix) {
  const session = await loginAs(browser, actor, `/en/profile/${encodeURIComponent(target.username)}`);
  try {
    await session.page.waitForTimeout(1000);
    const before = await pageFacts(session.page);
    const request = await postForm(session.page, route(`/en/profile/${encodeURIComponent(target.username)}/request-access`), {}, true);
    await session.page.waitForTimeout(900);
    await screenshot(session.page, `${keyPrefix}-actor`, `${keyPrefix}-actor.png`, `Photo access request ${actor.username} -> ${target.username}: success=${Boolean(request.json?.success)}`, request.json?.success ? 'pass' : 'fail');
    return { before, request };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function ownerPhotoAccessEvidence(browser, owner, actor, key, expectedVisible) {
  const session = await loginAs(browser, owner, '/en/settings/access-requests');
  try {
    const pages = [];
    for (const item of ['/en/settings/access-requests', '/en/notifications']) {
      await session.page.goto(route(item), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await session.page.waitForTimeout(1400);
      const facts = await pageFacts(session.page);
      pages.push({
        route: item,
        containsActor: facts.bodyText.includes(actor.name) || facts.bodyText.includes(actor.username),
        containsAccessText: /photo access|private photos|access request|requested access/i.test(facts.bodyText),
        facts,
      });
    }
    const visible = pages.some((page) => page.containsActor && page.containsAccessText);
    await screenshot(session.page, key, `${key}.png`, expectedVisible
      ? `Владелец должен видеть входящий photo access request от ${actor.username}`
      : `Владелец НЕ должен видеть входящий photo access request от shadow-пользователя ${actor.username}`, visible === expectedVisible ? 'pass' : 'fail');
    return { visible, pages };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function ownerPhotoAccessSnapshot(browser, owner, actor, key) {
  const session = await loginAs(browser, owner, '/en/settings/access-requests');
  try {
    const pages = [];
    const actorNeedles = [actor.username, actor.name].filter(Boolean);
    for (const item of ['/en/settings/access-requests', '/en/notifications']) {
      await session.page.goto(route(item), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await session.page.waitForTimeout(1400);
      const facts = await pageFacts(session.page);
      const actorMentionCount = actorNeedles.reduce((sum, needle) => {
        const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return sum + (facts.bodyText.match(new RegExp(escaped, 'g')) || []).length;
      }, 0);
      pages.push({
        route: item,
        actorMentionCount,
        containsAccessText: /photo access|private photos|access request|requested access/i.test(facts.bodyText),
        facts,
      });
    }
    const totalActorMentions = pages.reduce((sum, page) => sum + page.actorMentionCount, 0);
    await screenshot(session.page, key, `${key}.png`, `Photo access входящие для ${owner.username}: совпадений по ${actor.username} = ${totalActorMentions}`, 'info');
    return { totalActorMentions, pages };
  } finally {
    await session.context.close().catch(() => null);
  }
}

function aliasFromLocation(location) {
  const match = String(location || '').match(/\/groups\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

async function createGroupAndPost(browser, owner, keyPrefix) {
  const session = await loginAs(browser, owner, '/en/group/create');
  const groupTitle = `${runToken} group ${Date.now()}`;
  const groupDescription = `${runToken} group description`;
  const postText = `${runToken} group post ${Date.now()}`;
  try {
    await screenshot(session.page, `${keyPrefix}-create-form`, `${keyPrefix}-create-form.png`, `Создание группы пользователем ${owner.username}`, 'info');
    const create = await submitGroupCreateForm(session.page, groupTitle, groupDescription);
    await session.page.waitForTimeout(1200);
    let alias = aliasFromLocation(create.location || session.page.url());
    if (!alias) {
      await session.page.goto(route('/en/your-groups'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      const facts = await pageFacts(session.page);
      const link = facts.links.find((item) => item.text.includes(groupTitle) || item.href.toLowerCase().includes(slug(groupTitle)));
      alias = aliasFromLocation(link?.href);
    }
    if (alias) await session.page.goto(route(`/en/groups/${encodeURIComponent(alias)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1200);
    const ownerGroupFacts = await pageFacts(session.page);
    const post = await submitVisiblePostForm(session.page, postText);
    if (alias) await session.page.goto(route(`/en/groups/${encodeURIComponent(alias)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(1000);
    const ownerAfterPostFacts = await pageFacts(session.page);
    await screenshot(session.page, `${keyPrefix}-owner-group`, `${keyPrefix}-owner-group.png`, `Shadow owner должен видеть свою группу/пост локально`, ownerGroupFacts.bodyText.includes(groupTitle) ? 'pass' : 'fail');
    return { groupTitle, groupDescription, postText, create, alias, post, ownerGroupFacts, ownerAfterPostFacts };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function submitGroupCreateForm(page, groupTitle, groupDescription) {
  return page.evaluate(async ({ groupTitle, groupDescription }) => {
    const forms = [...document.querySelectorAll('form')].map((form, index) => ({
      index,
      action: form.action || location.href,
      method: (form.method || 'POST').toUpperCase(),
      fields: [...form.querySelectorAll('input,select,textarea')].map((node) => ({
        name: node.name || '',
        id: node.id || '',
        type: node.type || node.tagName,
      })),
    }));
    const selected = forms.find((form) => form.fields.some((field) => /group/i.test(field.name) && /title|description|alias/i.test(field.name)))
      || forms.find((form) => /group\/create/i.test(form.action));
    if (!selected) return { ok: false, status: 0, reason: 'group create form not found', forms };
    if (selected.method === 'GET') return { ok: false, status: 0, reason: 'group create form is GET', form: selected };

    const form = [...document.querySelectorAll('form')][selected.index];
    const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
    const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
    const body = new URLSearchParams();
    if (token) body.set(param, token);
    const alias = groupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    for (const field of [...form.querySelectorAll('input,select,textarea')]) {
      if (!field.name || field.type === 'file' || field.type === 'submit' || field.type === 'button') continue;
      const key = field.name.toLowerCase();
      let value = field.value || '';
      if (key.includes('[title]')) value = groupTitle;
      else if (key.includes('[description]')) value = groupDescription;
      else if (key.includes('[alias]')) value = alias;
      else if (key.includes('[visibility]')) value = value || 'visible';
      body.set(field.name, value);
    }

    const response = await fetch(form.action || location.href, {
      method: selected.method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': token },
      body: body.toString(),
      redirect: 'manual',
    });
    const text = await response.text().catch(() => '');
    return { ok: response.ok || [302, 303].includes(response.status), status: response.status, location: response.headers.get('location') || '', text: text.slice(0, 1800), submitted: Object.fromEntries(body), form: selected };
  }, { groupTitle, groupDescription });
}

async function submitVisiblePostForm(page, text) {
  const postForm = page.locator('form#post-form').first();
  if (await postForm.count().catch(() => 0)) {
    const textarea = postForm.locator('textarea').first();
    if (await textarea.count().catch(() => 0)) {
      await textarea.fill(text);
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null),
        postForm.locator('button[type="submit"],input[type="submit"],button').first().click(),
      ]);
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => null);
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => null);
      let facts = null;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        facts = await pageFacts(page).catch(() => null);
        if (facts) break;
        await page.waitForTimeout(700);
      }
      return { ok: Boolean(facts?.bodyText?.includes(text)), status: 200, method: 'dom-submit', url: page.url(), facts };
    }
  }
  const formInfo = await page.evaluate(() => {
    const forms = [...document.querySelectorAll('form')].map((form, index) => ({
      index,
      action: form.action || '',
      method: form.method || '',
      textareas: [...form.querySelectorAll('textarea')].map((node) => ({ name: node.name || '', id: node.id || '' })),
      inputs: [...form.querySelectorAll('input')].map((node) => ({ name: node.name || '', id: node.id || '', type: node.type || '' })),
      buttons: [...form.querySelectorAll('button,input[type="submit"]')].map((node) => (node.textContent || node.value || '').trim()),
    }));
    return forms.find((form) => form.textareas.length && String(form.method || '').toUpperCase() !== 'GET')
      || forms.find((form) => form.textareas.length)
      || null;
  });
  if (!formInfo) return { ok: false, reason: 'no post form' };
  return page.evaluate(async ({ formIndex, text }) => {
    const form = [...document.querySelectorAll('form')][formIndex];
    const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
    const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
    const body = new URLSearchParams();
    if (token) body.set(param, token);
    for (const field of [...form.querySelectorAll('input,select,textarea')]) {
      if (!field.name || field.type === 'file' || field.type === 'submit' || field.type === 'button') continue;
      body.set(field.name, field.tagName === 'TEXTAREA' ? text : field.value || '');
    }
    const textarea = form.querySelector('textarea');
    if (textarea?.name) body.set(textarea.name, text);
    const method = (form.method || 'POST').toUpperCase();
    if (method === 'GET') {
      return { ok: false, status: 0, reason: 'selected post form is GET', action: form.action || location.href };
    }
    const response = await fetch(form.action || location.href, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': token },
      body: body.toString(),
      redirect: 'manual',
    });
    const raw = await response.text().catch(() => '');
    return { ok: response.ok || [302, 303].includes(response.status), status: response.status, location: response.headers.get('location') || '', raw: raw.slice(0, 1200) };
  }, { formIndex: formInfo.index, text });
}

async function viewerGroupEvidence(browser, viewer, groupData, key, expectedVisible) {
  const session = await loginAs(browser, viewer, '/en/groups');
  try {
    const pages = [];
    for (const item of ['/en/groups', groupData.alias ? `/en/groups/${encodeURIComponent(groupData.alias)}` : '/en/groups']) {
      await session.page.goto(route(item), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await session.page.waitForTimeout(1200);
      const facts = await pageFacts(session.page);
      pages.push({
        route: item,
        containsGroup: facts.bodyText.includes(groupData.groupTitle),
        containsPost: facts.bodyText.includes(groupData.postText),
        facts,
      });
    }
    const visible = pages.some((page) => page.containsGroup || page.containsPost);
    await screenshot(session.page, key, `${key}.png`, expectedVisible
      ? `Viewer должен видеть группу/пост ${groupData.groupTitle}`
      : `Viewer НЕ должен видеть группу/пост shadow-пользователя`, visible === expectedVisible ? 'pass' : 'fail');
    return { visible, pages };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function writeReports() {
  result.finishedAt = new Date().toISOString();
  const failedChecks = result.checks.filter((item) => item.status === 'FAIL');
  const warnChecks = result.checks.filter((item) => item.status === 'WARN');
  result.status = failedChecks.length || result.findings.length ? 'FAIL' : warnChecks.length ? 'WARN' : 'PASS';
  fs.writeFileSync(path.join(outDir, 'shadow-ban-extended-matrix.json'), JSON.stringify(result, null, 2), 'utf8');
  const md = [
    '# Confideline Shadow Ban Extended Matrix',
    '',
    `- Status: ${result.status}`,
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- Report dir: ${outDir}`,
    '',
    '## Checks',
    '',
    ...result.checks.map((item) => `- ${item.status}: ${item.id} - ${item.title}${item.comment ? ` (${item.comment})` : ''}`),
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
  fs.writeFileSync(path.join(outDir, 'shadow-ban-extended-matrix.md'), md.join('\n'), 'utf8');
}

ensureDir(outDir);
const browser = await chromium.launch({ headless: true });
const adminContext = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1100 } });
const adminPage = await adminContext.newPage();
adminPage.setDefaultTimeout(30000);

try {
  await cleanupUsers(adminPage, 'pre-clean shadow extended matrix');
  result.states.shadowBalance = await ensureMinBalance(adminPage, users.shadow, 500);
  check('SHADOW-FIXTURE-BALANCE-READY', result.states.shadowBalance.after.credits >= 500 ? 'PASS' : 'FAIL', 'U1 имеет credits для gift-сценария', {
    before: result.states.shadowBalance.before.credits,
    after: result.states.shadowBalance.after.credits,
    topUp: result.states.shadowBalance.topUp,
  }, result.states.shadowBalance.after.credits >= 500
    ? 'Баланс подготовлен через админку, чтобы не спутать shadow-ban с нехваткой credits.'
    : 'Баланс не удалось подготовить; gift-сценарий нельзя считать доказательным.');

  result.states.profileBefore = await profileVisibleTo(browser, users.viewer, users.shadow, 'profile-before-shadow-visible', true);
  check('SHADOW-PROFILE-BASELINE-VISIBLE', result.states.profileBefore.visible ? 'PASS' : 'WARN', 'До shadow-ban профиль U1 доступен второму пользователю', result.states.profileBefore, result.states.profileBefore.visible
    ? 'Baseline подтвержден.'
    : 'Baseline профиль не найден: дальнейший hidden-check менее доказателен.');

  const baselineGiftMessage = `${runToken} baseline gift`;
  result.states.baselineGift = await sendGift(browser, users.shadow, users.recipient, baselineGiftMessage, 'baseline-gift');
  result.states.baselineGiftRecipient = await recipientGiftEvidence(browser, users.recipient, users.shadow, baselineGiftMessage, 'baseline-gift-recipient', true);
  check('SHADOW-GIFT-BASELINE-RECIPIENT', result.states.baselineGift.send?.json?.success && result.states.baselineGiftRecipient.visible ? 'PASS' : 'WARN', 'До shadow-ban gift U1->U2 имеет recipient-side эффект', {
    send: result.states.baselineGift.send,
    recipientVisible: result.states.baselineGiftRecipient.visible,
  }, result.states.baselineGiftRecipient.visible ? 'Baseline gift виден получателю.' : 'Baseline gift не дал сильного recipient evidence; shadow-check будет оценен осторожно.');

  result.states.baselineGroup = await createGroupAndPost(browser, users.recipient, 'baseline-group');
  const baselineOwnerSeesGroup = result.states.baselineGroup.ownerGroupFacts?.bodyText?.includes(result.states.baselineGroup.groupTitle);
  const baselineOwnerSeesPost = result.states.baselineGroup.ownerAfterPostFacts?.bodyText?.includes(result.states.baselineGroup.postText);
  check('GROUP-POST-BASELINE-OWNER-SEES', baselineOwnerSeesGroup && baselineOwnerSeesPost ? 'PASS' : 'WARN', 'Обычный пользователь видит свою группу и пост до shadow-ban', result.states.baselineGroup, baselineOwnerSeesGroup && baselineOwnerSeesPost
    ? 'Baseline group post работает у обычного пользователя.'
    : 'Baseline group создана, но пост не виден в owner-side feed; shadow group post нельзя оценивать без учета этого дефекта/ограничения.');

  result.shadowCreate = await createShadowBan(adminPage, users.shadow, `${runToken}: extended matrix`);

  result.states.profileDuring = await profileVisibleTo(browser, users.viewer, users.shadow, 'profile-during-shadow-hidden', false);
  check('SHADOW-PROFILE-HIDDEN-FROM-VIEWER', !result.states.profileDuring.visible ? 'PASS' : 'FAIL', 'Во время shadow-ban профиль U1 скрыт/недоступен для U2', result.states.profileDuring);

  const shadowGiftMessage = `${runToken} active shadow gift`;
  result.states.shadowGift = await sendGift(browser, users.shadow, users.recipient, shadowGiftMessage, 'shadow-gift');
  result.states.shadowGiftRecipient = await recipientGiftEvidence(browser, users.recipient, users.shadow, shadowGiftMessage, 'shadow-gift-recipient', false);
  const giftLooksSuccessful = Boolean(result.states.shadowGift.send?.json?.success);
  const giftHidden = !result.states.shadowGiftRecipient.visible;
  check('SHADOW-GIFT-ACTOR-SEES-SUCCESS', giftLooksSuccessful ? 'PASS' : 'FAIL', 'Shadow user отправляет gift без явной ошибки', result.states.shadowGift, giftLooksSuccessful
    ? 'Для U1 действие выглядит успешным.'
    : 'Для U1 gift не выглядит успешным; это может раскрывать ограничение.');
  check('SHADOW-GIFT-HIDDEN-FROM-RECIPIENT', giftHidden ? 'PASS' : 'FAIL', 'Gift от shadow user не виден получателю', result.states.shadowGiftRecipient);

  result.states.shadowPhotoAccessOwnerBefore = await ownerPhotoAccessSnapshot(browser, users.recipient, users.shadow, 'shadow-photo-access-owner-before');
  result.states.shadowPhotoAccess = await requestPhotoAccess(browser, users.shadow, users.recipient, 'shadow-photo-access');
  result.states.shadowPhotoAccessOwnerAfter = await ownerPhotoAccessSnapshot(browser, users.recipient, users.shadow, 'shadow-photo-access-owner-after');
  const requestLooksSuccessful = Boolean(result.states.shadowPhotoAccess.request?.json?.success);
  const photoAccessHidden = result.states.shadowPhotoAccessOwnerAfter.totalActorMentions <= result.states.shadowPhotoAccessOwnerBefore.totalActorMentions;
  check('SHADOW-PHOTO-ACCESS-ACTOR-SEES-SUCCESS', requestLooksSuccessful ? 'PASS' : 'FAIL', 'Shadow user делает photo access request без явной ошибки', result.states.shadowPhotoAccess);
  check('SHADOW-PHOTO-ACCESS-HIDDEN-FROM-OWNER', photoAccessHidden ? 'PASS' : 'FAIL', 'Photo access request от shadow user не создает нового видимого входящего эффекта владельцу', {
    before: result.states.shadowPhotoAccessOwnerBefore,
    after: result.states.shadowPhotoAccessOwnerAfter,
  }, photoAccessHidden
    ? 'После запроса количество совпадений по shadow user у владельца не выросло.'
    : 'После запроса количество совпадений по shadow user у владельца выросло, значит есть видимый входящий эффект.');

  result.states.shadowGroup = await createGroupAndPost(browser, users.shadow, 'shadow-group');
  const ownerSeesGroup = result.states.shadowGroup.ownerGroupFacts?.bodyText?.includes(result.states.shadowGroup.groupTitle);
  const ownerSeesPost = result.states.shadowGroup.ownerAfterPostFacts?.bodyText?.includes(result.states.shadowGroup.postText);
  result.states.shadowGroupViewer = await viewerGroupEvidence(browser, users.viewer, result.states.shadowGroup, 'shadow-group-viewer-hidden', false);
  check('SHADOW-GROUP-OWNER-SEES-OWN', ownerSeesGroup ? 'PASS' : 'FAIL', 'Shadow user видит созданную им группу', result.states.shadowGroup);
  check('SHADOW-GROUP-POST-OWNER-SEES-OWN', ownerSeesPost ? 'PASS' : baselineOwnerSeesPost ? 'FAIL' : 'WARN', 'Shadow user видит/создает пост в своей группе', result.states.shadowGroup, ownerSeesPost
    ? 'Пост виден owner-side.'
    : baselineOwnerSeesPost
      ? 'Baseline post виден обычному пользователю, но shadow owner свой пост не видит.'
      : 'Пост owner-side не найден и у обычного baseline пользователя; это общий group-post gap, не доказанный shadow-ban баг.');
  check('SHADOW-GROUP-HIDDEN-FROM-VIEWER', !result.states.shadowGroupViewer.visible ? 'PASS' : 'FAIL', 'Группа/пост shadow user скрыты от второго пользователя', result.states.shadowGroupViewer);

  await releaseBan(adminPage, result.shadowCreate.banId, 'release shadow after extended matrix');
  result.afterReleaseData = await userData(adminPage, users.shadow.id);
  check('SHADOW-RELEASE-CLEAN-EXTENDED', !result.afterReleaseData.json?.active_ban_id ? 'PASS' : 'FAIL', 'Shadow-ban снят после расширенного прохода', result.afterReleaseData);

  result.states.profileAfterRelease = await profileVisibleTo(browser, users.viewer, users.shadow, 'profile-after-shadow-visible', true);
  check('SHADOW-PROFILE-RESTORED-AFTER-RELEASE', result.states.profileAfterRelease.visible ? 'PASS' : 'FAIL', 'После снятия shadow-ban профиль U1 снова виден U2', result.states.profileAfterRelease);

  for (const item of result.checks.filter((entry) => entry.status === 'FAIL')) {
    finding(`${item.id}-001`, 'HIGH', `${item.title}: FAIL`, item.evidence, 'Проверить shadow-ban фильтрацию именно для этой зоны и ретестить actor+recipient/viewer стороны.');
  }
} catch (error) {
  result.errors.push(error?.stack || error?.message || String(error));
} finally {
  try {
    const active = Number((await userData(adminPage, users.shadow.id)).json?.active_ban_id || 0);
    if (active) await releaseBan(adminPage, active, 'finally cleanup shadow extended matrix');
  } catch (error) {
    result.errors.push(`finally cleanup: ${error?.message || error}`);
  }
  await adminContext.close().catch(() => null);
  await browser.close().catch(() => null);
  await writeReports();
}

console.log(JSON.stringify({
  status: result.status,
  outDir,
  checks: result.checks.map((item) => ({ id: item.id, status: item.status })),
  findings: result.findings.map((item) => ({ id: item.id, severity: item.severity })),
  errors: result.errors,
}, null, 2));

if (result.errors.length || result.status === 'FAIL') process.exitCode = 1;
