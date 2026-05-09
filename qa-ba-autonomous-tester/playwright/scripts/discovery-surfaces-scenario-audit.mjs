import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const qaRoot = path.resolve(__dirname, '../..');

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || path.join(qaRoot, 'reports');
const storageStatePath = path.resolve(process.env.ADMIN_STORAGE_STATE || path.join(qaRoot, 'secrets/admin-storage-state.super-admin.json'));
const timeoutMs = Number(process.env.DISCOVERY_TIMEOUT_MS || 45000);
const routeTimeoutMs = Number(process.env.DISCOVERY_ROUTE_TIMEOUT_MS || 30000);
const userId = Number(process.env.DISCOVERY_USER_ID || 167);
const cdpURL = process.env.DISCOVERY_CDP_URL || '';

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `discovery-surfaces-${stamp}`);

const routes = [
  { id: 'dashboard', route: '/en/dashboard', title: 'Dashboard' },
  { id: 'home', route: '/en', title: 'Главная авторизованного пользователя' },
  { id: 'browse', route: '/en/browse', title: 'Browse' },
  { id: 'likes-in', route: '/en/connections/likes', title: 'Входящие лайки' },
  { id: 'encounters', route: '/en/connections/encounters', title: 'Encounters' },
  { id: 'countries', route: '/en/countries', title: 'Countries directory' },
  { id: 'groups', route: '/en/groups', title: 'Groups directory' },
];

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  userId,
  checks: [],
  findings: [],
  adviceForAlexey: [],
  screenshots: {},
  rawRoutes: [],
  errors: [],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function asUrl(route) {
  return new URL(route, baseURL).toString();
}

function clip(value, max = 1600) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function slug(value) {
  return String(value || 'route')
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'route';
}

function addCheck(id, status, title, evidence = {}, comment = '') {
  result.checks.push({ id, status, title, comment, evidence });
}

function addFinding(id, severity, title, evidence = {}, action = '') {
  result.findings.push({ id, severity, title, action, evidence });
}

function addAdvice(quadrant, zone, observation, why, advice, owner, verify, evidence = {}) {
  result.adviceForAlexey.push({ quadrant, zone, observation, why, advice, owner, verify, evidence });
}

async function screenshot(page, key, fileName, label = '') {
  if (label) {
    await page.evaluate((text) => {
      const badge = document.createElement('div');
      badge.textContent = text;
      badge.style.cssText = 'position:fixed;left:14px;top:14px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.3 Arial,sans-serif;padding:10px 12px;border-radius:6px;max-width:760px';
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true, timeout: 12000 }).catch(() => page.screenshot({ path: filePath, timeout: 12000 }).catch(() => null));
  result.screenshots[key] = filePath;
  return filePath;
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
    return { status: response.status, location: response.headers.get('location') || '' };
  }, { targetUrl, fields, ajax, csrf });
}

async function gotoBounded(page, route) {
  const response = await page.goto(asUrl(route), { waitUntil: 'commit', timeout: timeoutMs });
  await page.waitForLoadState('domcontentloaded', { timeout: 12000 }).catch(() => null);
  await page.waitForTimeout(1200);
  return response;
}

async function loginAsUser(browser) {
  let context;
  if (cdpURL) {
    context = browser.contexts()[0] || await browser.newContext();
    const state = JSON.parse(fs.readFileSync(storageStatePath, 'utf8'));
    await context.addCookies(state.cookies || []);
  } else {
    context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  }
  const page = await context.newPage();
  await page.setViewportSize({ width: 1365, height: 900 }).catch(() => null);
  page.setDefaultTimeout(25000);
  await gotoBounded(page, `/en/admin/user/info?id=${userId}`);
  const loginHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
      /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || '')
    );
    return link?.href || '';
  });
  if (!loginHref) throw new Error(`login-as-user link not found for user ${userId}`);
  await postForm(page, loginHref, {}, true);
  await gotoBounded(page, '/en');
  return { context, page };
}

async function routeFacts(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const selectors = {
      profileCards: '.profile-card,.user-card,.directory-item,.encounter-card,[data-user-id],[data-profile-id],.card',
      navTabs: '.nav-tabs a,.nav a,.tabs a',
      emptyStates: '.empty,.empty-state,.alert,.no-results,.list-empty',
      pagination: '.pagination a,.pager a',
    };
    const pick = (selector, max = 30) => [...document.querySelectorAll(selector)].map((node) => ({
      text: (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 500),
      href: node.href || node.querySelector?.('a[href]')?.href || '',
      className: typeof node.className === 'string' ? node.className : '',
      visible: Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length),
    })).filter((item) => item.visible || item.text || item.href).slice(0, max);
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.innerText?.trim() || '',
      text: text.slice(0, 5000),
      textLength: text.length,
      loginMarker: /Sign in|Remember me|Forgot password|Login/i.test(text),
      errorMarker: /^(404|Not Found|Forbidden|Internal Server Error|Bad Request|PHP (Warning|Fatal)|Exception)\b/i.test(text) ||
        /^(Page not found|Bad Request \(#400\)|Not Found \(#404\))/i.test(document.querySelector('h1')?.innerText?.trim() || ''),
      cards: pick(selectors.profileCards, 60),
      navTabs: pick(selectors.navTabs, 40),
      emptyStates: pick(selectors.emptyStates, 20),
      pagination: pick(selectors.pagination, 20),
      forms: [...document.querySelectorAll('form')].map((form) => ({
        id: form.id || '',
        action: form.action || '',
        method: form.method || '',
        text: (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 800),
        fields: [...form.querySelectorAll('input,select,textarea,button')].map((field) => ({
          name: field.getAttribute('name') || '',
          id: field.id || '',
          type: field.getAttribute('type') || field.tagName.toLowerCase(),
          value: field.type === 'password' ? '[redacted]' : String(field.value || '').slice(0, 120),
          placeholder: field.getAttribute('placeholder') || '',
          text: (field.innerText || field.value || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        })).slice(0, 80),
      })).slice(0, 12),
      buttons: [...document.querySelectorAll('button,a.btn,input[type="submit"]')].map((button) => ({
        text: (button.innerText || button.value || button.title || '').replace(/\s+/g, ' ').trim(),
        href: button.href || '',
        className: typeof button.className === 'string' ? button.className : '',
      })).filter((button) => button.text || button.href).slice(0, 80),
    };
  });
}

function classifyRoute(route, facts, responseStatus, error) {
  if (error) return 'FAIL';
  if (responseStatus >= 500 || responseStatus === 404) return 'FAIL';
  if (responseStatus >= 400) return 'WARN';
  if (facts.errorMarker) return 'FAIL';
  if (facts.loginMarker && !/\/login/.test(facts.url)) return 'FAIL';
  if (facts.textLength < 80 && facts.cards.length === 0 && facts.forms.length === 0) return 'WARN';
  if (['home', 'connections', 'likes-in', 'likes-out', 'encounters', 'countries', 'groups'].includes(route.id) &&
      facts.cards.length === 0 &&
      facts.emptyStates.length === 0 &&
      !/No|empty|нет|Nothing|No one|No results/i.test(facts.text)) {
    return 'WARN';
  }
  return 'PASS';
}

async function auditRoute(page, route) {
  const entry = { ...route, status: 'UNKNOWN', responseStatus: 0, facts: null, screenshot: '', error: '' };
  try {
    const response = await Promise.race([
      gotoBounded(page, route.route),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`route timeout after ${routeTimeoutMs}ms`)), routeTimeoutMs)),
    ]);
    entry.responseStatus = response?.status() || 0;
    entry.facts = await routeFacts(page);
    entry.status = classifyRoute(route, entry.facts, entry.responseStatus, '');
    entry.screenshot = await screenshot(page, route.id, `${slug(route.id)}.png`, `${entry.status}: ${route.title}`);
  } catch (error) {
    entry.error = error?.stack || error?.message || String(error);
    entry.status = 'FAIL';
  }
  result.rawRoutes.push(entry);
  addCheck(`DISCOVERY-${route.id.toUpperCase()}`, entry.status, route.title, {
    route: route.route,
    responseStatus: entry.responseStatus,
    finalUrl: entry.facts?.url || '',
    title: entry.facts?.title || '',
    h1: entry.facts?.h1 || '',
    cardsCount: entry.facts?.cards?.length || 0,
    emptyStatesCount: entry.facts?.emptyStates?.length || 0,
    formsCount: entry.facts?.forms?.length || 0,
    screenshot: entry.screenshot,
    error: entry.error,
  }, entry.status === 'PASS'
    ? 'Страница открылась авторизованным пользователем и показала контент, форму или честное пустое состояние.'
    : entry.status === 'WARN'
      ? 'Страница открылась, но доказательство пользовательской ценности слабое: мало контента/нет явного пустого состояния.'
      : 'Страница не дала надежный пользовательский результат.');
}

async function main() {
  ensureDir(outDir);
  const browser = cdpURL
    ? await chromium.connectOverCDP(cdpURL, { timeout: 30000 })
    : await chromium.launch({ headless: true });
  try {
    const { context, page } = await loginAsUser(browser);
    await screenshot(page, 'login-proof', 'login-proof.png', `PASS: login as user ${userId}`);
    for (const route of routes) {
      await auditRoute(page, route);
    }
    await context.close().catch(() => null);

    const failed = result.rawRoutes.filter((entry) => entry.status === 'FAIL');
    const warned = result.rawRoutes.filter((entry) => entry.status === 'WARN');
    if (failed.length) {
      addFinding('DISCOVERY-SURFACE-FAIL-001', 'medium', 'Некоторые discovery/user surfaces не дают надежный пользовательский результат', {
        failed: failed.map((entry) => ({ id: entry.id, route: entry.route, responseStatus: entry.responseStatus, error: entry.error, text: clip(entry.facts?.text, 800) })),
      }, 'Проверить соответствующие Yii2 routes/views/assets; повторить сценарий авторизованным пользователем и убедиться, что есть контент или честное empty state.');
    }
    if (warned.length) {
      addAdvice(
        'Важно, но не срочно',
        'Discovery / пользовательские списки',
        'Часть discovery-поверхностей открывается, но может показывать слабый контент или неочевидное пустое состояние.',
        'Для dating-продукта пустое/непонятное состояние снижает доверие и мешает пользователю понять следующий шаг.',
        'Для каждого списка явно определить норму: карточки, пустое состояние, CTA, фильтр или объяснение. После этого превратить спорные WARN в точные ТЗ.',
        'Алексей',
        'На каждой discovery-странице пользователь видит либо релевантные карточки, либо понятное empty state с действием.',
        { warned: warned.map((entry) => ({ id: entry.id, route: entry.route, screenshot: entry.screenshot })) }
      );
    }
    addAdvice(
      'Важно, но не срочно',
      'QA/BA evidence',
      'Discovery-поверхности лучше тестировать отдельным продуктовым проходом, а не route inventory.',
      'Route 200 не доказывает, что пользователь понимает страницу и может двигаться дальше.',
      'Для следующих слоев добавлять сценарный критерий пользовательской ценности: что пользователь увидел и что может сделать дальше.',
      'Алексей',
      'В отчете есть отдельные PASS/FAIL и отдельная матрица улучшений, а не только список route status.',
      { report: outDir }
    );
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.errors.length || result.checks.some((check) => check.status === 'FAIL');
    const hasWarn = result.checks.some((check) => check.status === 'WARN');
    result.status = hasFail ? 'FAIL' : hasWarn ? 'PASS_WITH_WARNINGS' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'discovery-surfaces.json'), JSON.stringify(result, null, 2), 'utf8');
    const md = [
      '# Confideline Discovery Surfaces QA',
      '',
      `- Status: ${result.status}`,
      `- User: ${userId}`,
      `- Started: ${result.startedAt}`,
      `- Finished: ${result.finishedAt}`,
      '',
      '## Checks',
      '',
      ...result.checks.flatMap((check) => [`### ${check.status}: ${check.title}`, '', `- ID: ${check.id}`, `- Комментарий: ${check.comment}`, '']),
      '## Findings для Игоря',
      '',
      ...(result.findings.length ? result.findings.map((finding) => `- ${finding.severity}: ${finding.id} - ${finding.title}`) : ['- Подтвержденных дефектов для Игоря нет.']),
      '',
      '## Рекомендации для Алексея',
      '',
      ...(result.adviceForAlexey.length ? result.adviceForAlexey.map((item) => `- ${item.quadrant}: ${item.zone} - ${item.advice}`) : ['- Новых рекомендаций нет.']),
      '',
    ];
    fs.writeFileSync(path.join(outDir, 'discovery-surfaces.md'), md.join('\n'), 'utf8');
  }
  console.log(JSON.stringify({
    status: result.status,
    outDir,
    checks: result.checks.map((check) => ({ id: check.id, status: check.status })),
    findings: result.findings,
    adviceCount: result.adviceForAlexey.length,
    errors: result.errors,
  }, null, 2));
  if (result.status === 'FAIL') process.exitCode = 1;
  if (cdpURL) setTimeout(() => process.exit(process.exitCode || 0), 100);
}

main();
