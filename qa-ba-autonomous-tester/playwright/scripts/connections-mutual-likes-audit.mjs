import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || '../reports';
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || '../secrets/admin-storage-state.super-admin.json');
const timeoutMs = Number(process.env.FULL_SITE_TIMEOUT_MS || 60000);
const userAId = Number(process.env.MUTUAL_USER_A_ID || 182);
const userBId = Number(process.env.MUTUAL_USER_B_ID || 184);

const knownProfiles = {
  166: { username: 'KaelarisDornSchwarz', name: 'Kaelaris Dorn Schwarz' },
  167: { username: 'KaelirTamm', name: 'Kaelir Tamm' },
  168: { username: 'CaelumRastNielsen', name: 'Caelum Rast Nielsen' },
  182: { username: 'OmkarTiwari', name: 'Omkar Tiwari' },
  184: { username: 'OrionEsposito', name: 'Orion Esposito' },
};

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `connections-mutual-likes-${stamp}`);

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  users: {
    a: { id: userAId, ...(knownProfiles[userAId] || {}) },
    b: { id: userBId, ...(knownProfiles[userBId] || {}) },
  },
  checks: [],
  findings: [],
  screenshots: {},
  facts: {},
  cleanup: [],
  errors: [],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function asUrl(route) {
  return new URL(route, baseURL).toString();
}

function containsUser(text, user) {
  return Boolean(user?.username && text.includes(user.username)) || Boolean(user?.name && text.includes(user.name));
}

function clip(value, max = 2600) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function addCheck(id, status, title, evidence = {}, comment = '') {
  result.checks.push({ id, status, title, comment, evidence });
}

function addFinding(id, severity, title, evidence = {}, action = '') {
  result.findings.push({ id, severity, title, action, evidence });
}

async function pageFacts(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    h1: document.querySelector('h1')?.innerText?.trim() || '',
    bodyText: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 7000),
    links: [...document.querySelectorAll('a[href], button, input[type="submit"]')]
      .map((node) => ({
        text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        href: node.href || '',
        className: typeof node.className === 'string' ? node.className : '',
        id: node.id || '',
        title: node.getAttribute('title') || '',
      }))
      .slice(0, 220),
  }));
}

async function screenshot(page, key, fileName, label = '') {
  if (label) {
    await page.evaluate((labelText) => {
      document.querySelectorAll('[data-qa-badge="audit"]').forEach((node) => node.remove());
      const badge = document.createElement('div');
      badge.dataset.qaBadge = 'audit';
      badge.textContent = labelText;
      badge.style.cssText = [
        'position:fixed',
        'left:12px',
        'top:12px',
        'z-index:2147483647',
        'background:#111827',
        'color:#fff',
        'font:700 15px/1.35 Arial,sans-serif',
        'padding:10px 12px',
        'border-radius:6px',
        'max-width:850px',
      ].join(';');
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        body: body.toString(),
        redirect: 'manual',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const rawText = await response.text().catch(() => '');
    let json = null;
    try { json = JSON.parse(rawText); } catch {}
    return { status: response.status, ok: response.ok, rawText: rawText.slice(0, 1800), json };
  }, { targetUrl, fields, ajax, csrf });
}

async function loginAsUser(browser, userId, label) {
  let lastDiagnostic = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    try {
      await page.goto(asUrl(`/en/admin/user/info?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(async () => {
        await page.waitForTimeout(2500);
      });
      const loginHref = await page.evaluate(() => {
        const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
          /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
        );
        return link?.href || '';
      });
      if (!loginHref) {
        const facts = await pageFacts(page).catch(() => ({}));
        lastDiagnostic = { attempt, url: facts.url, title: facts.title, bodyText: clip(facts.bodyText, 1200) };
        await screenshot(page, `admin-loginas-missing-${label}-${attempt}`, `admin-loginas-missing-${label}-${attempt}.png`, `DIAG: login-as link missing for U${userId}, attempt ${attempt}`).catch(() => null);
        await context.close().catch(() => null);
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        continue;
      }
      const loginPost = await postForm(page, loginHref, {}, true);
      await page.goto(asUrl('/en'), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
      await page.waitForTimeout(650);
      return { context, page, userId, label, loginPost };
    } catch (error) {
      lastDiagnostic = { attempt, error: error?.message || String(error) };
      await context.close().catch(() => null);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw new Error(`login-as-user link not found for ${label} user ${userId}; diagnostic=${JSON.stringify(lastDiagnostic)}`);
}

async function closeSession(session) {
  if (session) await session.context.close().catch(() => null);
}

async function inspectList(browser, viewer, target, type, key, label) {
  const session = await loginAsUser(browser, viewer.id, `${key}-viewer`);
  try {
    await session.page.goto(asUrl(`/en/connections/likes/${type}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    await session.page.waitForTimeout(1200);
    const facts = await pageFacts(session.page);
    const contains = containsUser(facts.bodyText, target);
    result.facts[key] = { contains, url: facts.url, bodyText: clip(facts.bodyText) };
    await screenshot(session.page, key, `${key}.png`, `${label}: ${contains ? 'найден' : 'не найден'} ${target.name || target.username}`);
    return { contains, facts };
  } finally {
    await closeSession(session);
  }
}

async function toggleLike(browser, fromUser, toUser, key, label) {
  const session = await loginAsUser(browser, fromUser.id, `${key}-actor`);
  try {
    await session.page.goto(asUrl(`/en/profile/${encodeURIComponent(toUser.username)}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs }).catch(() => null);
    await session.page.waitForTimeout(900);
    await screenshot(session.page, `${key}-before`, `${key}-before.png`, `${label}: профиль перед toggle-like`);
    const response = await postForm(session.page, `/en/connections/toggle-like?toUserId=${encodeURIComponent(toUser.id)}`, {}, true);
    await session.page.waitForTimeout(900);
    const facts = await pageFacts(session.page);
    await screenshot(session.page, `${key}-after`, `${key}-after.png`, `${label}: ответ liked=${response?.json?.liked}`);
    return { response, facts };
  } finally {
    await closeSession(session);
  }
}

async function ensureNoDirectionalLike(browser, fromUser, toUser, directionLabel) {
  const fromYou = await inspectList(browser, fromUser, toUser, 'from-you', `baseline-${directionLabel}-from-you`, `Baseline ${directionLabel}: исходящие ${fromUser.id}`);
  if (!fromYou.contains) return { alreadyClean: true };
  const off = await toggleLike(browser, fromUser, toUser, `cleanup-${directionLabel}`, `Cleanup ${directionLabel}: снимаем существующий лайк`);
  result.cleanup.push({ phase: 'pre-clean', direction: `${fromUser.id}->${toUser.id}`, response: off.response });
  const verify = await inspectList(browser, fromUser, toUser, 'from-you', `cleanup-${directionLabel}-verify`, `Cleanup verify ${directionLabel}: исходящий лайк должен исчезнуть`);
  return { alreadyClean: false, off, verify };
}

async function cleanupDirectionalLike(browser, fromUser, toUser, directionLabel) {
  const fromYou = await inspectList(browser, fromUser, toUser, 'from-you', `final-cleanup-${directionLabel}-before`, `Rollback ${directionLabel}: проверяем исходящий лайк`);
  if (!fromYou.contains) return { alreadyClean: true };
  const off = await toggleLike(browser, fromUser, toUser, `final-cleanup-${directionLabel}`, `Rollback ${directionLabel}: снимаем тестовый лайк`);
  result.cleanup.push({ phase: 'final-clean', direction: `${fromUser.id}->${toUser.id}`, response: off.response });
  const verify = await inspectList(browser, fromUser, toUser, 'from-you', `final-cleanup-${directionLabel}-verify`, `Rollback verify ${directionLabel}: лайк снят`);
  return { alreadyClean: false, off, verify };
}

function writeReports() {
  result.finishedAt = new Date().toISOString();
  const hasFail = result.errors.length || result.checks.some((check) => check.status === 'FAIL');
  const hasWarn = result.checks.some((check) => check.status === 'WARN');
  result.status = hasFail ? 'FAIL' : hasWarn ? 'PASS_WITH_WARNINGS' : 'PASS';
  fs.writeFileSync(path.join(outDir, 'connections-mutual-likes.json'), JSON.stringify(result, null, 2), 'utf8');
  const lines = [
    '# Confideline Connections Mutual Likes Audit',
    '',
    `- Status: ${result.status}`,
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- User A: U${result.users.a.id} ${result.users.a.name || result.users.a.username}`,
    `- User B: U${result.users.b.id} ${result.users.b.name || result.users.b.username}`,
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
    '## Findings',
    '',
    ...(result.findings.length ? result.findings.flatMap((finding) => [
      `### ${finding.severity.toUpperCase()}: ${finding.title}`,
      '',
      `- ID: ${finding.id}`,
      `- Действие: ${finding.action}`,
      '',
    ]) : ['- Новых подтвержденных багов нет.', '']),
    '## Screenshots',
    '',
    ...Object.entries(result.screenshots).map(([key, filePath]) => `- ${key}: ${filePath}`),
    '',
  ];
  fs.writeFileSync(path.join(outDir, 'connections-mutual-likes.md'), lines.join('\n'), 'utf8');
}

async function main() {
  ensureDir(outDir);
  if (!fs.existsSync(storageStatePath)) throw new Error(`Admin storage state is missing: ${storageStatePath}`);
  const a = result.users.a;
  const b = result.users.b;
  if (!a.username || !b.username) throw new Error(`Known usernames are required for U${a.id} and U${b.id}`);
  const browser = await chromium.launch({ headless: true });
  try {
    const cleanAB = await ensureNoDirectionalLike(browser, a, b, 'a-to-b');
    const cleanBA = await ensureNoDirectionalLike(browser, b, a, 'b-to-a');
    const baselineAIncoming = await inspectList(browser, a, b, 'to-you', 'baseline-a-to-you', 'Baseline: входящие U-A');
    const baselineBIncoming = await inspectList(browser, b, a, 'to-you', 'baseline-b-to-you', 'Baseline: входящие U-B');
    const baselineAMutual = await inspectList(browser, a, b, 'mutual', 'baseline-a-mutual', 'Baseline: mutual U-A');
    const baselineBMutual = await inspectList(browser, b, a, 'mutual', 'baseline-b-mutual', 'Baseline: mutual U-B');

    const baselineClean = !baselineAIncoming.contains && !baselineBIncoming.contains && !baselineAMutual.contains && !baselineBMutual.contains;
    addCheck('CONNECTIONS-MUTUAL-BASELINE', baselineClean ? 'PASS' : 'FAIL', 'Baseline очищен перед проверкой mutual likes', {
      cleanAB,
      cleanBA,
      baselineAIncoming,
      baselineBIncoming,
      baselineAMutual,
      baselineBMutual,
    }, baselineClean
      ? 'Перед тестом между U-A и U-B нет входящих/исходящих/mutual следов.'
      : 'После cleanup остались следы связи; продолжать как строгий тест нельзя.');

    if (!baselineClean) {
      addFinding('CONNECTIONS-MUTUAL-BASELINE-NOT-CLEAN', 'medium', 'Не удалось получить чистую пару для mutual likes', {}, 'Проверить данные лайков и toggle-like cleanup.');
      return;
    }

    const likeAB = await toggleLike(browser, a, b, 'step1-a-likes-b', `Шаг 1: U${a.id} лайкает U${b.id}`);
    const afterAB_AFrom = await inspectList(browser, a, b, 'from-you', 'after-a-like-a-from-you', 'После шага 1: исходящие U-A');
    const afterAB_BIncoming = await inspectList(browser, b, a, 'to-you', 'after-a-like-b-to-you', 'После шага 1: входящие U-B');
    const afterAB_AMutual = await inspectList(browser, a, b, 'mutual', 'after-a-like-a-mutual', 'После шага 1: mutual U-A');
    const afterAB_BMutual = await inspectList(browser, b, a, 'mutual', 'after-a-like-b-mutual', 'После шага 1: mutual U-B');
    const oneWayPass = likeAB.response?.ok && likeAB.response?.json?.liked === true && afterAB_AFrom.contains && afterAB_BIncoming.contains && !afterAB_AMutual.contains && !afterAB_BMutual.contains;
    addCheck('CONNECTIONS-LIKE-ONE-WAY-RECIPIENT', oneWayPass ? 'PASS' : 'FAIL', 'Односторонний лайк доставлен получателю и не стал mutual раньше времени', {
      likeAB,
      afterAB_AFrom,
      afterAB_BIncoming,
      afterAB_AMutual,
      afterAB_BMutual,
    }, oneWayPass
      ? 'U-A видит U-B в исходящих, U-B видит U-A во входящих, mutual еще пустой.'
      : 'Односторонний лайк или состояние mutual работает некорректно.');

    const likeBA = await toggleLike(browser, b, a, 'step2-b-likes-a', `Шаг 2: U${b.id} лайкает U${a.id}`);
    const afterBA_AIncoming = await inspectList(browser, a, b, 'to-you', 'after-b-like-a-to-you', 'После шага 2: входящие U-A');
    const afterBA_BFrom = await inspectList(browser, b, a, 'from-you', 'after-b-like-b-from-you', 'После шага 2: исходящие U-B');
    const afterBA_AMutual = await inspectList(browser, a, b, 'mutual', 'after-b-like-a-mutual', 'После шага 2: mutual U-A');
    const afterBA_BMutual = await inspectList(browser, b, a, 'mutual', 'after-b-like-b-mutual', 'После шага 2: mutual U-B');
    const mutualPass = likeBA.response?.ok && likeBA.response?.json?.liked === true && afterBA_AIncoming.contains && afterBA_BFrom.contains && afterBA_AMutual.contains && afterBA_BMutual.contains;
    addCheck('CONNECTIONS-MUTUAL-BOTH-SIDES', mutualPass ? 'PASS' : 'FAIL', 'Mutual likes доказаны с обеих сторон', {
      likeBA,
      afterBA_AIncoming,
      afterBA_BFrom,
      afterBA_AMutual,
      afterBA_BMutual,
    }, mutualPass
      ? 'После встречного лайка оба пользователя видят друг друга в mutual.'
      : 'После встречного лайка mutual не доказан у одного или обоих пользователей.');

    await cleanupDirectionalLike(browser, b, a, 'b-to-a');
    await cleanupDirectionalLike(browser, a, b, 'a-to-b');
    const rollbackAMutual = await inspectList(browser, a, b, 'mutual', 'rollback-a-mutual', 'Rollback: mutual U-A');
    const rollbackBMutual = await inspectList(browser, b, a, 'mutual', 'rollback-b-mutual', 'Rollback: mutual U-B');
    const rollbackPass = !rollbackAMutual.contains && !rollbackBMutual.contains;
    addCheck('CONNECTIONS-MUTUAL-ROLLBACK', rollbackPass ? 'PASS' : 'WARN', 'Rollback тестовых лайков выполнен', {
      rollbackAMutual,
      rollbackBMutual,
      cleanup: result.cleanup,
    }, rollbackPass
      ? 'Тестовые лайки сняты, mutual связь между выбранной парой очищена.'
      : 'После rollback mutual еще виден; нужно проверить руками или DB.');

    if (!oneWayPass) {
      addFinding('CONNECTIONS-ONE-WAY-LIKE-001', 'high', 'Односторонний лайк не доказан корректно', {}, 'Проверить /connections/toggle-like и списки /connections/likes/from-you|to-you.');
    }
    if (!mutualPass) {
      addFinding('CONNECTIONS-MUTUAL-LIKE-001', 'high', 'Mutual likes не доказаны с обеих сторон', {}, 'Проверить LikeManager::TYPE_MUTUAL query и counters.');
    }
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
    cleanup: result.cleanup.map((item) => ({ phase: item.phase, direction: item.direction, liked: item.response?.json?.liked })),
    errors: result.errors,
  }, null, 2));
  if (result.errors.length || result.checks.some((check) => check.status === 'FAIL')) process.exitCode = 1;
}

main();
