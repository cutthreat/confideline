import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');

const owner = { id: 166, username: 'KaelarisDornSchwarz', name: 'Kaelaris Dorn Schwarz' };
const approveActor = { id: 182, username: 'OmkarTiwari', name: 'Omkar Tiwari' };
const rejectActor = { id: 168, username: 'CaelumRastNielsen', name: 'Caelum Rast Nielsen' };
const noRequestActor = { id: 184, username: 'OrionEsposito', name: 'Orion Esposito' };

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `photo-access-action-scenario-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  checks: [],
  findings: [],
  screenshots: {},
  errors: [],
};

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function asUrl(route) { return new URL(route, baseURL).toString(); }
function addCheck(id, status, title, evidence = {}, comment = '') { result.checks.push({ id, status, title, comment, evidence }); }
function addFinding(id, severity, title, evidence = {}, action = '') { result.findings.push({ id, severity, title, action, evidence }); }

async function screenshot(page, key, fileName, label = '') {
  if (label) {
    await page.evaluate((text) => {
      const badge = document.createElement('div');
      badge.textContent = text;
      badge.style.cssText = 'position:fixed;left:12px;top:12px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border-radius:6px;max-width:760px';
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
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
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': csrf.token || '' };
    if (ajax) headers['X-Requested-With'] = 'XMLHttpRequest';
    const response = await fetch(targetUrl, { method: 'POST', credentials: 'same-origin', headers, body: body.toString(), redirect: 'manual' });
    const rawText = await response.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(rawText); } catch {}
    return { status: response.status, ok: response.ok, rawText: rawText.slice(0, 1600), json };
  }, { targetUrl, fields, ajax, csrf });
}

async function loginAsUser(browser, user, label) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(asUrl(`/en/admin/user/info?id=${user.id}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  const loginHref = await page.evaluate(() => [...document.querySelectorAll('a[href]')].find((candidate) =>
    /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
  )?.href || '');
  if (!loginHref) throw new Error(`login-as-user link not found for ${label} user ${user.id}`);
  await postForm(page, loginHref, {}, true);
  await page.goto(asUrl('/en'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(700);
  return { context, page };
}

async function pageFacts(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 6000),
    links: [...document.querySelectorAll('a[href], button, input[type="submit"]')].map((node) => ({
      text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim().slice(0, 140),
      href: node.href || '',
      className: typeof node.className === 'string' ? node.className : '',
      data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-') || attr.name.startsWith('ng-')).map((attr) => [attr.name, attr.value])),
    })).slice(0, 180),
  }));
}

async function ensureRequest(browser, actor) {
  const session = await loginAsUser(browser, actor, `ensure-request-${actor.id}`);
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(owner.username)}`), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await session.page.waitForTimeout(800);
    return await postForm(session.page, `/en/profile/${encodeURIComponent(owner.username)}/request-access`, {}, true);
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function ownerAction(browser, actor, action, key) {
  const session = await loginAsUser(browser, owner, `${key}-owner`);
  try {
    await session.page.goto(asUrl('/en/settings/access-requests'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await session.page.waitForTimeout(1000);
    const before = await pageFacts(session.page);
    await screenshot(session.page, `${key}-owner-before`, `${key}-owner-before.png`, `Owner before ${action}: ищем request от ${actor.name}`);
    const actionUrl = `/en/settings/photo-access-action?fromUserId=${actor.id}&action=${action}`;
    const response = await postForm(session.page, actionUrl, {}, true);
    await session.page.waitForTimeout(1000);
    await session.page.goto(asUrl('/en/settings/access-requests'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await session.page.waitForTimeout(1000);
    const after = await pageFacts(session.page);
    await screenshot(session.page, `${key}-owner-after`, `${key}-owner-after.png`, `Owner after ${action}: проверяем очередь access requests`);
    return { before, response, after };
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function actorAfter(browser, actor, key) {
  const session = await loginAsUser(browser, actor, `${key}-actor`);
  try {
    const pages = [];
    for (const route of [`/en/profile/${encodeURIComponent(owner.username)}`, '/en/settings/access-requests', '/en/notifications']) {
      await session.page.goto(asUrl(route), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
      await session.page.waitForTimeout(1000);
      const facts = await pageFacts(session.page);
      const shotKey = `${key}-actor-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()}`;
      await screenshot(session.page, shotKey, `${shotKey}.png`, `${actor.name}: проверка после ${key} на ${route}`);
      pages.push({
        route,
        facts,
        containsOwner: facts.bodyText.includes(owner.name) || facts.bodyText.includes(owner.username),
        containsApproved: /you now have access|approved|access has been changed|private photos/i.test(facts.bodyText),
        containsRejected: /rejected|not have access|access request|private photos/i.test(facts.bodyText),
      });
    }
    return pages;
  } finally {
    await session.context.close().catch(() => null);
  }
}

async function runFlow(browser, actor, action, key, expectedStatus) {
  const request = await ensureRequest(browser, actor);
  const ownerResult = await ownerAction(browser, actor, action, key);
  const actorPages = await actorAfter(browser, actor, key);
  const actionOk = Boolean(ownerResult.response?.json?.success);
  const actorEvidence = actorPages.some((page) => page.facts.bodyText.includes(owner.name) || page.facts.bodyText.includes('Private photos access'));
  const status = actionOk && actorEvidence ? 'PASS' : 'FAIL';
  addCheck(`PHOTO-ACCESS-${expectedStatus}`, status, `Photo access ${expectedStatus.toLowerCase()} выполнен владельцем`, { request, ownerResult, actorPages }, status === 'PASS'
    ? `Owner action=${action} вернул success=true, у actor есть post-action evidence.`
    : `Не доказан полный цикл ${expectedStatus}.`);
  if (status !== 'PASS') {
    addFinding(`PHOTO-ACCESS-${expectedStatus}-001`, 'high', `Photo access ${expectedStatus.toLowerCase()} не доказан`, { request, ownerResult, actorPages }, 'Проверить SettingsController::actionPhotoAccessAction и уведомления PhotoAccessAction.');
  }
}

async function runNoRequestActionProbe(browser) {
  const ownerSession = await loginAsUser(browser, owner, 'no-request-owner');
  try {
    await ownerSession.page.goto(asUrl('/en/settings/access-requests'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await ownerSession.page.waitForTimeout(1000);
    const before = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, 'no-request-owner-before', 'no-request-owner-before.png', `Negative check: в очереди не должно быть request от ${noRequestActor.name}`);
    const hadVisibleRequest = before.bodyText.includes(noRequestActor.name) || before.bodyText.includes(noRequestActor.username);
    const response = await postForm(ownerSession.page, `/en/settings/photo-access-action?fromUserId=${noRequestActor.id}&action=1`, {}, true);
    await ownerSession.page.waitForTimeout(1000);
    await ownerSession.page.goto(asUrl('/en/settings/access-requests'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
    await ownerSession.page.waitForTimeout(1000);
    const after = await pageFacts(ownerSession.page);
    await screenshot(ownerSession.page, 'no-request-owner-after', 'no-request-owner-after.png', `Negative check after invalid action: response success=${Boolean(response.json?.success)}`);

    if (hadVisibleRequest) {
      addCheck('PHOTO-ACCESS-NO-REQUEST-ACTION', 'WARN', 'Негативная проверка action без request пропущена: request уже есть в очереди', { before, response, after }, 'Для строгого FAIL/PASS нужна пара без существующего request.');
      return;
    }

    const status = response.json?.success === true ? 'FAIL' : 'PASS';
    addCheck('PHOTO-ACCESS-NO-REQUEST-ACTION', status, 'Photo access action без существующего request', { before, response, after }, status === 'PASS'
      ? 'Endpoint не сообщает success=true для отсутствующего request.'
      : 'Endpoint вернул success=true, хотя видимого request от actor не было. По коду manager вернул бы false, но controller игнорирует этот результат.');
    if (status === 'FAIL') {
      addFinding('PHOTO-ACCESS-ACTION-NO-REQUEST-SUCCESS-001', 'medium', 'Photo access action отвечает success=true без существующего request', { before, response, after }, 'В SettingsController::actionPhotoAccessAction() учитывать boolean результат PhotoManager::approveOrRejectPhotoAccess(); если request не найден, возвращать ошибку/404, а не success=true.');
    }
  } finally {
    await ownerSession.context.close().catch(() => null);
  }
}

async function main() {
  ensureDir(outDir);
  const browser = await chromium.launch({ headless: true });
  try {
    await runFlow(browser, approveActor, 1, 'approve', 'APPROVE');
    await runFlow(browser, rejectActor, 2, 'reject', 'REJECT');
    await runNoRequestActionProbe(browser);
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.checks.some((check) => check.status === 'FAIL');
    result.status = hasFail ? 'FAIL' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'photo-access-action-scenario.json'), JSON.stringify(result, null, 2), 'utf8');
    const md = [
      '# Confideline Photo Access Action Scenario',
      '',
      `- Status: ${result.status}`,
      `- Owner: U${owner.id} ${owner.name}`,
      `- Approve actor: U${approveActor.id} ${approveActor.name}`,
      `- Reject actor: U${rejectActor.id} ${rejectActor.name}`,
      `- No-request probe actor: U${noRequestActor.id} ${noRequestActor.name}`,
      '',
      '## Checks',
      '',
      ...result.checks.flatMap((check) => [`### ${check.status}: ${check.title}`, '', `- ID: ${check.id}`, `- Комментарий: ${check.comment}`, '']),
      '## Findings для Игоря',
      '',
      ...(result.findings.length ? result.findings.map((finding) => `- ${finding.severity}: ${finding.id} - ${finding.title}`) : ['- Новых подтвержденных багов нет.']),
      '',
      '## Screenshots',
      '',
      ...Object.entries(result.screenshots).map(([key, file]) => `- ${key}: ${file}`),
      '',
    ];
    fs.writeFileSync(path.join(outDir, 'photo-access-action-scenario.md'), md.join('\n'), 'utf8');
  }
  console.log(JSON.stringify({ status: result.status, outDir, checks: result.checks.map((check) => ({ id: check.id, status: check.status })), findings: result.findings, errors: result.errors }, null, 2));
  if (result.errors.length || result.checks.some((check) => check.status === 'FAIL')) process.exitCode = 1;
}

main();
