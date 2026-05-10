import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || process.env.REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');
const owner = { id: Number(process.env.GROUP_OWNER_ID || 184), name: 'Orion Esposito' };
const viewer = { id: Number(process.env.GROUP_VIEWER_ID || 166), name: 'Kaelaris Dorn Schwarz' };
const postId = Number(process.env.GROUP_POST_ID || 26);
const groupAlias = process.env.GROUP_ALIAS || 'qa-group-hide-visibility-20260510-071523-group';
const postText = process.env.GROUP_POST_TEXT || 'QA group hide visibility 20260510-071523 post';
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `group-posts-delete-report-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  owner,
  viewer,
  groupAlias,
  postId,
  postText,
  checks: [],
  findings: [],
  screenshots: {},
  errors: [],
};

function asUrl(route) { return new URL(route, baseURL).toString(); }
function addCheck(id, status, title, evidence = {}, comment = '') { result.checks.push({ id, status, title, evidence, comment }); }
function addFinding(id, severity, title, evidence = {}, action = '') { result.findings.push({ id, severity, title, evidence, action }); }

async function screenshot(page, key, label, color = '#22c55e') {
  await page.evaluate(({ text, color }) => {
    document.querySelectorAll('[data-qa-shot-badge]').forEach((node) => node.remove());
    const badge = document.createElement('div');
    badge.setAttribute('data-qa-shot-badge', '1');
    badge.textContent = text;
    badge.style.cssText = `position:fixed;left:14px;top:14px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border:3px solid ${color};border-radius:6px;max-width:900px;box-shadow:0 8px 22px rgba(0,0,0,.22)`;
    document.body.appendChild(badge);
  }, { text: label, color }).catch(() => null);
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
    return { status: response.status, ok: response.ok, url: response.url, rawText: rawText.slice(0, 1600), json };
  }, { targetUrl, fields, ajax, csrf });
}

async function getRequest(page, targetUrl) {
  return page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl, { method: 'GET', credentials: 'same-origin' });
    const rawText = await response.text().catch(() => '');
    return { status: response.status, ok: response.ok, url: response.url, rawText: rawText.slice(0, 1600) };
  }, targetUrl);
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
    })).slice(0, 320),
  }));
}

async function loginAsUser(browser, user) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 920 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(asUrl(`/en/admin/user/info?id=${user.id}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  const loginHref = await page.evaluate(() => [...document.querySelectorAll('a[href]')].find((candidate) =>
    /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
  )?.href || '');
  if (!loginHref) throw new Error(`login-as-user link not found for user ${user.id}`);
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

async function adminRow(page) {
  return page.evaluate(({ postId, postText }) => {
    const rows = [...document.querySelectorAll('table tbody tr')].map((row) => ({
      text: (row.innerText || '').replace(/\s+/g, ' ').trim(),
      links: [...row.querySelectorAll('a[href], button')].map((node) => ({
        text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim(),
        href: node.href || '',
        title: node.getAttribute('title') || '',
        data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-')).map((attr) => [attr.name, attr.value])),
      })),
    }));
    return rows.find((row) => row.text.startsWith(`${postId} `) && row.text.includes(postText)) || null;
  }, { postId, postText });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const viewerSession = await loginAsUser(browser, viewer);
    await viewerSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerBefore = await pageFacts(viewerSession.page);
    await screenshot(viewerSession.page, '01-viewer-before-delete', 'PASS candidate: viewer видит пост до delete');
    addCheck('VIEWER-SEES-POST-BEFORE-DELETE', viewerBefore.bodyText.includes(postText) ? 'PASS' : 'FAIL', 'До удаления viewer видит post', { viewerBefore });
    await viewerSession.context.close().catch(() => null);

    const admin = await openAdmin(browser);
    await admin.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const rowBefore = await adminRow(admin.page);
    await screenshot(admin.page, '02-admin-row-before-delete', 'PASS candidate: admin видит post row до delete');
    addCheck('ADMIN-ROW-BEFORE-DELETE', rowBefore?.text.includes('Active') ? 'PASS' : 'FAIL', 'До удаления admin видит post row как Active', { rowBefore });
    await admin.context.close().catch(() => null);

    const ownerSession = await loginAsUser(browser, owner);
    await ownerSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const ownerPage = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, '03-owner-post-actions', 'PASS/WARN: owner page actions before delete');
    const deleteLink = ownerPage.links.find((link) => /delete post/i.test(link.text) && String(link.href || '').includes('delete-post'));
    const deleteUrl = deleteLink?.href || asUrl(`/en/group/delete-post?alias=${encodeURIComponent(groupAlias)}&postId=${postId}`);
    const reportUrl = asUrl(`/en/group/report-post?alias=${encodeURIComponent(groupAlias)}&postId=${postId}`);
    const reportGet = await getRequest(ownerSession.page, reportUrl);
    const reportPost = await postForm(ownerSession.page, reportUrl, { postId, reason: `QA report post ${stamp}` }, true);
    const deletePost = await postForm(ownerSession.page, deleteUrl, {}, true);
    await ownerSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const ownerAfterDelete = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, '04-owner-after-delete', 'PASS/FAIL: owner page after delete', deletePost?.json?.success ? '#22c55e' : '#ef4444');

    addCheck('REPORT-POST-ENDPOINT', reportGet.status === 404 || (reportGet.status === 200 && reportGet.rawText.trim() === '' && reportPost.status === 200 && reportPost.rawText.trim() === '')
      ? 'FAIL'
      : 'WARN',
      'Report post endpoint дает полезный результат',
      { reportUrl, reportGet, reportPost, ownerPage },
      'В текущем локальном коде actionReportPost пустой; live endpoint также не показал полезного результата.');
    if (reportGet.status === 404 || (reportGet.status === 200 && reportGet.rawText.trim() === '' && reportPost.status === 200 && reportPost.rawText.trim() === '')) {
      addFinding('GROUP-POST-REPORT-EMPTY-ACTION', 'high', 'Report post endpoint возвращает пустой 200 без эффекта/сообщения', { reportUrl, reportGet, reportPost }, 'Реализовать actionReportPost: form/CSRF, запись жалобы, flash/JSON result, admin queue/notification.');
    }

    addCheck('OWNER-DELETE-POST-AJAX', deletePost?.json?.success === true ? 'PASS' : 'FAIL', 'Owner может удалить свой post через POST/AJAX', { deleteLink, deleteUrl, deletePost }, '');
    addCheck('OWNER-DOES-NOT-SEE-DELETED-POST', !ownerAfterDelete.bodyText.includes(postText) ? 'PASS' : 'FAIL', 'После удаления owner не видит post', { ownerAfterDelete }, '');
    await ownerSession.context.close().catch(() => null);

    const viewerAfterSession = await loginAsUser(browser, viewer);
    await viewerAfterSession.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerAfter = await pageFacts(viewerAfterSession.page);
    await screenshot(viewerAfterSession.page, '05-viewer-after-delete', 'PASS/FAIL: viewer не видит post после delete', !viewerAfter.bodyText.includes(postText) ? '#22c55e' : '#ef4444');
    addCheck('VIEWER-DOES-NOT-SEE-DELETED-POST', !viewerAfter.bodyText.includes(postText) ? 'PASS' : 'FAIL', 'После удаления viewer не видит post', { viewerAfter }, '');
    await viewerAfterSession.context.close().catch(() => null);

    const adminAfter = await openAdmin(browser);
    await adminAfter.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const rowAfter = await adminRow(adminAfter.page);
    await screenshot(adminAfter.page, '06-admin-after-delete', 'PASS/WARN: admin row after delete');
    addCheck('ADMIN-ROW-AFTER-DELETE', rowAfter ? 'WARN' : 'PASS', 'После delete post row отсутствует в admin posts list', { rowAfter }, rowAfter ? 'Запись осталась в админке; нужно проверить статус/ожидание.' : 'Row исчезла из admin posts list.');
    await adminAfter.context.close().catch(() => null);
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.checks.some((check) => check.status === 'FAIL') || result.errors.length > 0;
    const hasWarn = result.checks.some((check) => check.status === 'WARN');
    result.status = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'group-posts-delete-report.json'), JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(path.join(outDir, 'group-posts-delete-report.md'), [
      '# Group posts delete/report recheck',
      '',
      `- Status: ${result.status}`,
      `- Post ID: ${postId}`,
      `- Group alias: ${groupAlias}`,
      `- Post text: ${postText}`,
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
