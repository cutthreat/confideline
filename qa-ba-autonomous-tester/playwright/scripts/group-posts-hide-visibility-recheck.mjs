import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || process.env.REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');
const owner = { id: Number(process.env.GROUP_OWNER_ID || 184), name: 'Orion Esposito' };
const viewer = { id: Number(process.env.GROUP_VIEWER_ID || 166), name: 'Kaelaris Dorn Schwarz' };
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const marker = `QA group hide visibility ${stamp}`;
const outDir = path.resolve(reportRoot, `group-posts-hide-visibility-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  owner,
  viewer,
  marker,
  group: { title: `${marker} group`, description: `${marker} description`, alias: '' },
  post: { text: `${marker} post`, id: null },
  checks: [],
  findings: [],
  screenshots: {},
  errors: [],
};

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function asUrl(route) { return new URL(route, baseURL).toString(); }
function addCheck(id, status, title, evidence = {}, comment = '') { result.checks.push({ id, status, title, comment, evidence }); }
function addFinding(id, severity, title, evidence = {}, action = '') { result.findings.push({ id, severity, title, action, evidence }); }

async function screenshot(page, key, label) {
  await page.evaluate((text) => {
    document.querySelectorAll('[data-qa-shot-badge]').forEach((node) => node.remove());
    const badge = document.createElement('div');
    badge.setAttribute('data-qa-shot-badge', '1');
    badge.textContent = text;
    badge.style.cssText = 'position:fixed;left:14px;top:14px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border:3px solid #f59e0b;border-radius:6px;max-width:900px;box-shadow:0 8px 22px rgba(0,0,0,.22)';
    document.body.appendChild(badge);
  }, label).catch(() => null);
  const filePath = path.join(outDir, `${key}.png`);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
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
    const response = await fetch(targetUrl, { method: 'POST', credentials: 'same-origin', headers, body: body.toString() });
    const rawText = await response.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(rawText); } catch {}
    return { status: response.status, ok: response.ok, url: response.url, rawText: rawText.slice(0, 1800), json };
  }, { targetUrl, fields, ajax, csrf });
}

async function pageFacts(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 10000),
    links: [...document.querySelectorAll('a[href], button, input[type="submit"]')].map((node) => ({
      text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      href: node.href || '',
      title: node.getAttribute('title') || '',
      className: typeof node.className === 'string' ? node.className : '',
      onclick: node.getAttribute('onclick') || '',
      data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-')).map((attr) => [attr.name, attr.value])),
    })).slice(0, 260),
    forms: [...document.querySelectorAll('form')].map((form) => ({
      action: form.action,
      method: form.method,
      text: (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 900),
      inputs: [...form.querySelectorAll('input, textarea, select')].map((input) => ({ name: input.name || '', id: input.id || '', type: input.type || input.tagName, value: String(input.value || '').slice(0, 200) })).slice(0, 100),
    })).slice(0, 20),
  }));
}

function aliasFromLocation(location) {
  const match = String(location || '').match(/\/groups\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function postIdFromUrl(location) {
  const match = String(location || '').match(/[?&]highlightPostId=(\d+)/);
  return match ? Number(match[1]) : null;
}

async function loginAsUser(browser, user, label) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 920 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(asUrl(`/en/admin/user/info?id=${user.id}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const loginHref = await page.evaluate(() => [...document.querySelectorAll('a[href]')].find((candidate) =>
    /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
  )?.href || '');
  if (!loginHref) throw new Error(`login-as-user link not found for ${label} user ${user.id}`);
  await postForm(page, loginHref, {}, true);
  await page.goto(asUrl('/en/groups'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  return { context, page };
}

async function openAdmin(browser) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  return { context, page };
}

async function submitVisiblePostForm(page, text) {
  const before = await page.evaluate(() => {
    const textarea = document.querySelector('textarea[name="PostForm[content]"]');
    const form = textarea?.closest('form');
    return { hasTextarea: Boolean(textarea), formAction: form?.action || '', formId: form?.id || '' };
  });
  if (!before.hasTextarea) return { ok: false, reason: 'Post textarea not found', before };
  await page.locator('textarea[name="PostForm[content]"]').fill(text);
  const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
  const submit = await page.evaluate(() => {
    const textarea = document.querySelector('textarea[name="PostForm[content]"]');
    const form = textarea?.closest('form');
    if (!form) return { ok: false, reason: 'Post form not found' };
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.submit();
    return { ok: true, action: form.action };
  });
  await nav;
  await page.waitForTimeout(1000);
  return { ...submit, before, afterUrl: page.url() };
}

async function findAdminPostRow(page, text) {
  return page.evaluate((needle) => {
    const rows = [...document.querySelectorAll('table tbody tr')].map((row) => ({
      html: row.innerHTML,
      text: (row.innerText || '').replace(/\s+/g, ' ').trim(),
      links: [...row.querySelectorAll('a[href], button')].map((node) => ({
        tag: node.tagName,
        text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim(),
        href: node.href || '',
        title: node.getAttribute('title') || '',
        className: typeof node.className === 'string' ? node.className : '',
        onclick: node.getAttribute('onclick') || '',
        data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-')).map((attr) => [attr.name, attr.value])),
      })),
    }));
    const row = rows.find((item) => item.text.includes(needle)) || null;
    const id = row?.text.match(/^(\d+)\s+/)?.[1] || '';
    return { row, id: id ? Number(id) : null, rowCount: rows.length, pageText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 6000) };
  }, text);
}

async function submitHideModal(page, row, reason) {
  const hideAction = row?.links?.find((link) => /hide post/i.test(`${link.title} ${link.text}`));
  if (!hideAction) return { hideAction: null, modal: null, submit: null };
  const modalMatch = hideAction.onclick.match(/"(\\\/en\\\/admin\\\/group\\\/hide-post-modal\?id=\d+)"/);
  const modalRoute = modalMatch ? modalMatch[1].replaceAll('\\/', '/') : `/en/admin/group/hide-post-modal?id=${row.text.match(/^(\d+)\s+/)?.[1] || ''}`;
  await page.goto(asUrl(modalRoute), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const modal = await pageFacts(page);
  const form = modal.forms[0];
  let submit = null;
  if (form?.action) submit = await postForm(page, form.action, { reason }, false);
  return { hideAction, modalRoute, modal, submit };
}

async function main() {
  ensureDir(outDir);
  const browser = await chromium.launch({ headless: true });
  try {
    const ownerSession = await loginAsUser(browser, owner, 'owner');
    await ownerSession.page.goto(asUrl('/en/group/create'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await screenshot(ownerSession.page, '01-owner-create-form', `PASS candidate: владелец открывает форму создания группы ${result.group.title}`);
    const create = await postForm(ownerSession.page, '/en/group/create', {
      'Group[title]': result.group.title,
      'Group[description]': result.group.description,
      'Group[visibility]': 'visible',
      'Group[allow_post]': '1',
      'Group[allow_see_members]': '1',
    }, false);
    result.group.alias = aliasFromLocation(create.url || create.rawText) || aliasFromLocation(create.location);
    if (!result.group.alias) {
      await ownerSession.page.goto(asUrl('/en/your-groups'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
      const facts = await pageFacts(ownerSession.page);
      const link = facts.links.find((item) => item.text.includes(result.group.title) || item.href.includes('/groups/'));
      result.group.alias = aliasFromLocation(link?.href);
    }
    if (result.group.alias) await ownerSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(result.group.alias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const ownerAfterCreate = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, '02-owner-group-created', `PASS/FAIL: группа создана, alias=${result.group.alias || 'not found'}`);
    addCheck('GROUP-CREATE', result.group.alias && ownerAfterCreate.bodyText.includes(result.group.title) ? 'PASS' : 'FAIL', 'Владелец создал видимую группу', { create, alias: result.group.alias, ownerAfterCreate }, result.group.alias ? 'Группа открылась владельцу.' : 'Не получен alias созданной группы.');

    if (result.group.alias) {
      await postForm(ownerSession.page, `/en/groups/${encodeURIComponent(result.group.alias)}/management`, {
        'Group[title]': result.group.title,
        'Group[description]': result.group.description,
        'Group[visibility]': 'visible',
        'Group[allow_post]': '1',
        'Group[allow_see_members]': '1',
      }, false);
      await ownerSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(result.group.alias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
    const postSubmit = result.group.alias ? await submitVisiblePostForm(ownerSession.page, result.post.text) : null;
    result.post.id = postIdFromUrl(postSubmit?.afterUrl);
    const ownerAfterPost = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, '03-owner-post-submitted', `PASS/FAIL: владелец отправил пост, postId=${result.post.id || 'not found'}`);
    addCheck('GROUP-POST-CREATE', postSubmit?.ok && result.post.id ? 'PASS' : 'FAIL', 'Пост создан владельцем группы', { postSubmit, ownerAfterPost }, result.post.id ? 'Есть highlightPostId после submit.' : 'Нет highlightPostId.');
    await ownerSession.context.close().catch(() => null);

    const adminSession = await openAdmin(browser);
    await adminSession.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const adminBefore = await findAdminPostRow(adminSession.page, result.post.text);
    await screenshot(adminSession.page, '04-admin-post-pending', `PASS/FAIL: админ видит новый пост в очереди, postId=${adminBefore.id || 'not found'}`);
    const approveHref = adminBefore.row?.links?.find((link) => link.href.includes(`/admin/group/approve-post?id=${adminBefore.id}`))?.href || '';
    const approve = approveHref ? await postForm(adminSession.page, approveHref, {}, false) : null;
    await adminSession.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const adminAfterApprove = await findAdminPostRow(adminSession.page, result.post.text);
    await screenshot(adminSession.page, '05-admin-post-approved', `PASS/FAIL: после approve пост должен стать Active`);
    addCheck('ADMIN-POST-PENDING', adminBefore.row?.text.includes('Pending moderation') ? 'PASS' : 'FAIL', 'Админ видит новый пост как Pending moderation', { adminBefore }, '');
    addCheck('ADMIN-POST-APPROVE', adminAfterApprove.row?.text.includes('Active') ? 'PASS' : 'FAIL', 'Админ одобрил пост, статус Active', { approveHref, approve, adminAfterApprove }, '');

    const viewerBeforeHide = await loginAsUser(browser, viewer, 'viewer-before-hide');
    if (result.group.alias) await viewerBeforeHide.page.goto(asUrl(`/en/groups/${encodeURIComponent(result.group.alias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerVisibleFacts = await pageFacts(viewerBeforeHide.page);
    await screenshot(viewerBeforeHide.page, '06-viewer-sees-approved-post', `PASS/FAIL: второй пользователь должен видеть approved post`);
    addCheck('VIEWER-SEES-APPROVED-POST', viewerVisibleFacts.bodyText.includes(result.post.text) ? 'PASS' : 'FAIL', 'Второй пользователь видит одобренный пост', { viewerVisibleFacts }, '');
    await viewerBeforeHide.context.close().catch(() => null);

    const hide = await submitHideModal(adminSession.page, adminAfterApprove.row, `QA hide visibility reason ${stamp}`);
    await adminSession.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const adminAfterHide = await findAdminPostRow(adminSession.page, result.post.text);
    await screenshot(adminSession.page, '07-admin-post-hidden', `PASS/FAIL: после Hide post строка должна остаться и получить Hidden`);
    const reopenAction = adminAfterHide.row?.links?.find((link) => /open|restore|show|reopen/i.test(`${link.title} ${link.text} ${link.href} ${link.onclick}`)) || null;
    result.reopenAction = reopenAction;
    addCheck('ADMIN-POST-HIDE', adminAfterHide.row?.text.includes('Hidden') ? 'PASS' : 'FAIL', 'Админ скрывает пост, запись остается Hidden', { hide, adminAfterHide }, '');
    addCheck('ADMIN-POST-REOPEN-ACTION', reopenAction ? 'PASS' : 'WARN', 'В админке есть действие повторного открытия hidden post', { reopenAction, adminAfterHide }, reopenAction ? 'Reopen/show action найден.' : 'Reopen/show action не найден на hidden row.');

    const viewerAfterHide = await loginAsUser(browser, viewer, 'viewer-after-hide');
    if (result.group.alias) await viewerAfterHide.page.goto(asUrl(`/en/groups/${encodeURIComponent(result.group.alias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerHiddenFacts = await pageFacts(viewerAfterHide.page);
    await screenshot(viewerAfterHide.page, '08-viewer-after-hide', `PASS/FAIL: второй пользователь НЕ должен видеть hidden post`);
    addCheck('VIEWER-DOES-NOT-SEE-HIDDEN-POST', !viewerHiddenFacts.bodyText.includes(result.post.text) ? 'PASS' : 'FAIL', 'Скрытый пост не виден второму пользователю', { viewerHiddenFacts }, '');
    await viewerAfterHide.context.close().catch(() => null);
    await adminSession.context.close().catch(() => null);

    if (!reopenAction) {
      addFinding('GROUP-POST-REOPEN-ACTION-MISSING', 'medium', 'Для hidden group post не найдено действие повторного открытия', { postId: result.post.id, adminAfterHide }, 'Если по ТЗ админ должен повторно открыть скрытый контент, добавить action/button и ретест.');
    }
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.checks.some((check) => check.status === 'FAIL') || result.errors.length > 0;
    const hasWarn = result.checks.some((check) => check.status === 'WARN') || result.findings.length > 0;
    result.status = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'group-posts-hide-visibility.json'), JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(path.join(outDir, 'group-posts-hide-visibility.md'), [
      '# Group posts hide visibility recheck',
      '',
      `- Status: ${result.status}`,
      `- Group: ${result.group.title}`,
      `- Alias: ${result.group.alias || 'not found'}`,
      `- Post ID: ${result.post.id || 'not found'}`,
      `- Post: ${result.post.text}`,
      '',
      '## Checks',
      ...result.checks.map((check) => `- ${check.status}: ${check.id} - ${check.title}`),
      '',
      '## Findings',
      ...(result.findings.length ? result.findings.map((finding) => `- ${finding.severity}: ${finding.id} - ${finding.title}`) : ['- none']),
      '',
      '## Errors',
      ...(result.errors.length ? result.errors.map((error) => `- ${String(error).slice(0, 1200)}`) : ['- none']),
    ].join('\n'), 'utf8');
    console.log(JSON.stringify({ status: result.status, outDir, checks: result.checks.map((check) => ({ id: check.id, status: check.status })), findings: result.findings, errors: result.errors }, null, 2));
    if (hasFail) process.exitCode = 1;
  }
}

main();
