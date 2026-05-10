import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || process.env.REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');
const viewer = { id: Number(process.env.GROUP_VIEWER_ID || 166), name: 'Kaelaris Dorn Schwarz' };
const postId = Number(process.env.GROUP_POST_ID || 26);
const groupAlias = process.env.GROUP_ALIAS || 'qa-group-hide-visibility-20260510-071523-group';
const postText = process.env.GROUP_POST_TEXT || 'QA group hide visibility 20260510-071523 post';
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `group-posts-reopen-visibility-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  viewer,
  postId,
  groupAlias,
  postText,
  checks: [],
  findings: [],
  screenshots: {},
  errors: [],
};

function asUrl(route) { return new URL(route, baseURL).toString(); }
function addCheck(id, status, title, evidence = {}, comment = '') { result.checks.push({ id, status, title, evidence, comment }); }
function addFinding(id, severity, title, evidence = {}, action = '') { result.findings.push({ id, severity, title, evidence, action }); }

async function screenshot(page, key, label) {
  await page.evaluate((text) => {
    document.querySelectorAll('[data-qa-shot-badge]').forEach((node) => node.remove());
    const badge = document.createElement('div');
    badge.setAttribute('data-qa-shot-badge', '1');
    badge.textContent = text;
    badge.style.cssText = 'position:fixed;left:14px;top:14px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border:3px solid #22c55e;border-radius:6px;max-width:900px;box-shadow:0 8px 22px rgba(0,0,0,.22)';
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
    return { status: response.status, ok: response.ok, url: response.url, rawText: rawText.slice(0, 1600) };
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

async function findAdminPostRow(page) {
  return page.evaluate(({ postId, postText }) => {
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
    return rows.find((row) => row.text.startsWith(`${postId} `) && row.text.includes(postText)) || null;
  }, { postId, postText });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const viewerBefore = await loginAsUser(browser, viewer);
    await viewerBefore.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerBeforeFacts = await pageFacts(viewerBefore.page);
    await screenshot(viewerBefore.page, '01-viewer-before-reopen', 'PASS candidate: до reopen viewer не видит hidden post');
    addCheck('VIEWER-BEFORE-REOPEN-HIDDEN', !viewerBeforeFacts.bodyText.includes(postText) ? 'PASS' : 'FAIL', 'До reopen скрытый пост не виден viewer', { viewerBeforeFacts });
    await viewerBefore.context.close().catch(() => null);

    const admin = await openAdmin(browser);
    await admin.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const rowBefore = await findAdminPostRow(admin.page);
    await screenshot(admin.page, '02-admin-hidden-row-before-reopen', 'PASS candidate: admin видит hidden row с Approve post');
    const approveAction = rowBefore?.links?.find((link) => link.href.includes(`/admin/group/approve-post?id=${postId}`)) || null;
    addCheck('ADMIN-HIDDEN-ROW-HAS-APPROVE', rowBefore?.text.includes('Hidden') && approveAction ? 'PASS' : 'FAIL', 'На hidden row есть Approve post', { rowBefore, approveAction });
    const approveResponse = approveAction ? await postForm(admin.page, approveAction.href, {}, false) : null;
    await admin.page.goto(asUrl('/en/admin/group/posts'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const rowAfter = await findAdminPostRow(admin.page);
    await screenshot(admin.page, '03-admin-row-after-approve-reopen', 'PASS/FAIL: после Approve hidden row должна стать Active');
    addCheck('ADMIN-APPROVE-REOPENS-HIDDEN-POST', rowAfter?.text.includes('Active') && !rowAfter?.text.includes('Hidden') ? 'PASS' : 'FAIL', 'Approve post повторно открывает hidden post в админке', { approveResponse, rowAfter });
    await admin.context.close().catch(() => null);

    const viewerAfter = await loginAsUser(browser, viewer);
    await viewerAfter.page.goto(asUrl(`/en/groups/${encodeURIComponent(groupAlias)}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
    const viewerAfterFacts = await pageFacts(viewerAfter.page);
    await screenshot(viewerAfter.page, '04-viewer-after-reopen', 'PASS/FAIL: после reopen viewer снова должен видеть post');
    addCheck('VIEWER-SEES-REOPENED-POST', viewerAfterFacts.bodyText.includes(postText) ? 'PASS' : 'FAIL', 'После reopen viewer снова видит тот же пост', { viewerAfterFacts });
    await viewerAfter.context.close().catch(() => null);

    const allPass = result.checks.every((check) => check.status === 'PASS');
    if (allPass) {
      addFinding('GROUP-POST-REOPEN-IS-APPROVE', 'info', 'Approve post на hidden row фактически работает как reopen', { postId, groupAlias }, 'Для UX можно переименовать действие на hidden row в Reopen/Показать снова.');
    }
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.checks.some((check) => check.status === 'FAIL') || result.errors.length > 0;
    result.status = hasFail ? 'FAIL' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'group-posts-reopen-visibility.json'), JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(path.join(outDir, 'group-posts-reopen-visibility.md'), [
      '# Group posts reopen visibility recheck',
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
