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
const userId = Number(process.env.DETAIL_USER_ID || 167);
const cdpURL = process.env.DETAIL_CDP_URL || process.env.DISCOVERY_CDP_URL || '';
const timeoutMs = Number(process.env.DETAIL_TIMEOUT_MS || 45000);
const maxPerType = Number(process.env.DETAIL_MAX_PER_TYPE || 3);

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `detail-surfaces-${stamp}`);

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
  raw: { sources: [], details: [] },
  errors: [],
};

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function asUrl(route) { return new URL(route, baseURL).toString(); }
function clip(value, max = 1400) { return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max); }
function slug(value) {
  return String(value || 'item').replace(/^https?:\/\//, '').replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'item';
}
function addCheck(id, status, title, evidence = {}, comment = '') { result.checks.push({ id, status, title, comment, evidence }); }
function addFinding(id, severity, title, evidence = {}, action = '') { result.findings.push({ id, severity, title, action, evidence }); }
function addAdvice(quadrant, zone, observation, why, advice, owner, verify, evidence = {}) {
  result.adviceForAlexey.push({ quadrant, zone, observation, why, advice, owner, verify, evidence });
}

async function screenshot(page, key, fileName, label = '') {
  if (label) {
    await page.evaluate((text) => {
      document.querySelectorAll('[data-qa-run-badge]').forEach((node) => node.remove());
      const badge = document.createElement('div');
      badge.dataset.qaRunBadge = '1';
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
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': csrf.token || '' };
    if (ajax) headers['X-Requested-With'] = 'XMLHttpRequest';
    const response = await fetch(targetUrl, { method: 'POST', credentials: 'same-origin', headers, body: body.toString(), redirect: 'manual' });
    return { status: response.status, location: response.headers.get('location') || '' };
  }, { targetUrl, fields, ajax, csrf });
}

async function gotoBounded(page, routeOrUrl) {
  const url = /^https?:\/\//i.test(routeOrUrl) ? routeOrUrl : asUrl(routeOrUrl);
  const response = await page.goto(url, { waitUntil: 'commit', timeout: timeoutMs });
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
  const loginHref = await page.evaluate(() => [...document.querySelectorAll('a[href]')]
    .find((candidate) => /login-as-user/i.test(candidate.href || '') || /Login as user/i.test(candidate.textContent || ''))?.href || '');
  if (!loginHref) throw new Error(`login-as-user link not found for user ${userId}`);
  await postForm(page, loginHref, {}, true);
  await gotoBounded(page, '/en/dashboard');
  return { context, page };
}

async function pageFacts(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const cyrillic = (text.match(/[А-Яа-яЁё]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    const pick = (selector, max = 40) => [...document.querySelectorAll(selector)].map((node) => {
      const rect = node.getBoundingClientRect();
      return ({
      text: (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 600),
      href: node.href || node.querySelector?.('a[href]')?.href || '',
      className: typeof node.className === 'string' ? node.className : '',
      visible: Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length),
      box: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
      outerHTML: (node.outerHTML || '').replace(/\s+/g, ' ').trim().slice(0, 500),
    });
    }).filter((item) => item.visible || item.text || item.href).slice(0, max);
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.innerText?.trim() || '',
      text: text.slice(0, 6000),
      textLength: text.length,
      cyrillic,
      latin,
      cyrillicRatio: text.length ? cyrillic / text.length : 0,
      loginMarker: /Sign in|Remember me|Forgot password|Login/i.test(text),
      errorMarker: /^(404|Not Found|Forbidden|Internal Server Error|Bad Request|PHP (Warning|Fatal)|Exception)\b/i.test(text) ||
        /^(Page not found|Bad Request \(#400\)|Not Found \(#404\))/i.test(document.querySelector('h1')?.innerText?.trim() || ''),
      cards: pick('.card,.user-card,.profile-card,.directory-item,.group-card,.card-aside,[data-user-id],[data-profile-id]', 80),
      links: pick('a[href]', 120),
      forms: [...document.querySelectorAll('form')].map((form) => ({
        id: form.id || '',
        action: form.action || '',
        method: form.method || '',
        text: (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600),
        fields: [...form.querySelectorAll('input,select,textarea,button')].map((field) => ({
          name: field.getAttribute('name') || '',
          id: field.id || '',
          type: field.getAttribute('type') || field.tagName.toLowerCase(),
          placeholder: field.getAttribute('placeholder') || '',
          text: (field.innerText || field.value || '').replace(/\s+/g, ' ').trim().slice(0, 100),
        })).slice(0, 60),
      })).slice(0, 10),
    };
  });
}

function uniqueByHref(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.href || seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

async function collectLinks(page, sourceRoute, type, matcher) {
  await gotoBounded(page, sourceRoute);
  const facts = await pageFacts(page);
  await screenshot(page, `source-${type}`, `source-${type}.png`, `PASS: source ${sourceRoute}`);
  const links = uniqueByHref(facts.links
    .filter((link) => link.visible && matcher(link))
    .map((link) => ({
      type,
      sourceRoute,
      href: link.href,
      text: link.text,
      className: link.className,
      box: link.box,
      outerHTML: link.outerHTML,
    })))
    .slice(0, maxPerType);
  result.raw.sources.push({
    type,
    sourceRoute,
    links,
    facts: {
      url: facts.url,
      title: facts.title,
      h1: facts.h1,
      text: clip(facts.text, 1200),
      cardsCount: facts.cards.length,
      links: facts.links,
      cyrillicRatio: facts.cyrillicRatio,
    },
  });
  return links;
}

function classifyDetail(item, facts, responseStatus, error) {
  if (error) return 'FAIL';
  if (responseStatus >= 500 || responseStatus === 404) return 'FAIL';
  if (facts.errorMarker || facts.loginMarker) return 'FAIL';
  if (responseStatus >= 400) return 'WARN';
  if (facts.textLength < 180 && facts.cards.length === 0 && facts.forms.length === 0) return 'WARN';
  if (item.type === 'country' && facts.cyrillicRatio > 0.18) return 'WARN';
  return 'PASS';
}

async function auditDetail(page, item, index) {
  const key = `${item.type}-${index + 1}`;
  const entry = { ...item, status: 'UNKNOWN', responseStatus: 0, facts: null, screenshot: '', error: '' };
  try {
    const response = await gotoBounded(page, item.href);
    entry.responseStatus = response?.status() || 0;
    entry.facts = await pageFacts(page);
    entry.status = classifyDetail(item, entry.facts, entry.responseStatus, '');
    entry.screenshot = await screenshot(page, key, `${key}-${slug(entry.facts.title || item.text || item.href)}.png`, `${entry.status}: ${item.type} detail`);
  } catch (error) {
    entry.error = error?.stack || error?.message || String(error);
    entry.status = 'FAIL';
  }
  result.raw.details.push(entry);
  addCheck(`DETAIL-${item.type.toUpperCase()}-${index + 1}`, entry.status, `${item.type}: ${item.text || item.href}`, {
    href: item.href,
    responseStatus: entry.responseStatus,
    finalUrl: entry.facts?.url || '',
    title: entry.facts?.title || '',
    h1: entry.facts?.h1 || '',
    textLength: entry.facts?.textLength || 0,
    cardsCount: entry.facts?.cards?.length || 0,
    formsCount: entry.facts?.forms?.length || 0,
    cyrillicRatio: entry.facts?.cyrillicRatio || 0,
    screenshot: entry.screenshot,
    error: entry.error,
  }, entry.status === 'PASS'
    ? 'Detail-страница открылась и показала полезное содержимое.'
    : entry.status === 'WARN'
      ? 'Detail-страница открылась, но есть UX/content риск.'
      : 'Detail-страница не дала надежный пользовательский результат.');
}

async function main() {
  ensureDir(outDir);
  const browser = cdpURL
    ? await chromium.connectOverCDP(cdpURL, { timeout: 30000 })
    : await chromium.launch({ headless: true });
  try {
    const { context, page } = await loginAsUser(browser);
    await screenshot(page, 'login-proof', 'login-proof.png', `PASS: login as user ${userId}`);
    const profileLinks = await collectLinks(page, '/en/browse', 'profile', (link) => /\/en\/profile(\/|$)/i.test(link.href));
    const countryLinks = await collectLinks(page, '/en/countries', 'country', (link) => /\/en\/country\//i.test(link.href));
    const groupLinks = await collectLinks(page, '/en/groups', 'group', (link) => /\/en\/groups\/[^/?#]+/i.test(link.href));
    const all = [...profileLinks, ...countryLinks, ...groupLinks];
    if (!profileLinks.length) addCheck('DETAIL-PROFILE-SOURCE', 'WARN', 'Profile detail links не найдены в browse', { sourceRoute: '/en/browse' }, 'Browse открылся, но тест не нашел profile detail links для перехода.');
    if (!countryLinks.length) addCheck('DETAIL-COUNTRY-SOURCE', 'WARN', 'Country detail links не найдены', { sourceRoute: '/en/countries' }, 'Countries открылся, но links вида /en/country/... не найдены.');
    if (!groupLinks.length) addCheck('DETAIL-GROUP-SOURCE', 'WARN', 'Group detail links не найдены', { sourceRoute: '/en/groups' }, 'Groups открылся, но links вида /en/group/id не найдены.');
    for (const [index, item] of all.entries()) await auditDetail(page, item, index);
    await context.close().catch(() => null);

    const failed = result.raw.details.filter((entry) => entry.status === 'FAIL');
    const warned = result.raw.details.filter((entry) => entry.status === 'WARN');
    if (failed.length) {
      addFinding('DETAIL-SURFACE-FAIL-001', 'medium', 'Некоторые detail-страницы не открываются корректно', {
        failed: failed.map((entry) => ({ type: entry.type, href: entry.href, responseStatus: entry.responseStatus, title: entry.facts?.title || '', text: clip(entry.facts?.text, 800), error: entry.error })),
      }, 'Проверить Yii2 routes/views для соответствующих detail-страниц и повторить переход из каталога.');
    }
    const cyrillicDetails = result.raw.details.filter((entry) => /\/en\//i.test(entry.href) && (entry.facts?.cyrillicRatio || 0) > 0.18);
    const cyrillicSources = result.raw.sources.filter((entry) => /\/en\//i.test(entry.sourceRoute) && (entry.facts?.cyrillicRatio || 0) > 0.18);
    if (cyrillicDetails.length || cyrillicSources.length) {
      addAdvice(
        'Важно, но не срочно',
        'Контент / локализация EN-разделов',
        'На `/en`-страницах обнаружен заметный русский текст.',
        'Англоязычный route должен давать пользователю ожидаемый язык; смешение языков снижает доверие и ухудшает SEO/маркетинговую подачу.',
        'Разделить контент по языкам или явно определить, что английская версия пока не является приемочным контуром для контентных страниц.',
        'Алексей',
        'На `/en/...` основной контент на английском, либо такие страницы помечены как content backlog и не считаются готовой EN-версией.',
        {
          sourceExamples: cyrillicSources.map((entry) => ({ route: entry.sourceRoute, cyrillicRatio: entry.facts?.cyrillicRatio, screenshot: result.screenshots[`source-${entry.type}`] })),
          detailExamples: cyrillicDetails.map((entry) => ({ href: entry.href, cyrillicRatio: entry.facts?.cyrillicRatio, screenshot: entry.screenshot })),
        }
      );
    }
    if (warned.length && !cyrillicDetails.length) {
      addAdvice(
        'Важно, но не срочно',
        'Detail surfaces',
        'Часть detail-страниц открывается, но доказательство пользовательской ценности слабое.',
        'Переход из каталога должен вести к странице, где понятно, что делать дальше.',
        'Для каждого типа detail определить минимальный стандарт: заголовок, ключевой контент, CTA/следующее действие.',
        'Алексей',
        'Каждая detail-страница имеет заголовок, содержимое и понятный следующий шаг.',
        { warned: warned.map((entry) => ({ type: entry.type, href: entry.href, screenshot: entry.screenshot })) }
      );
    }
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    result.finishedAt = new Date().toISOString();
    const hasFail = result.errors.length || result.checks.some((check) => check.status === 'FAIL');
    const hasWarn = result.checks.some((check) => check.status === 'WARN');
    result.status = hasFail ? 'FAIL' : hasWarn ? 'PASS_WITH_WARNINGS' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'detail-surfaces.json'), JSON.stringify(result, null, 2), 'utf8');
    const md = [
      '# Confideline Detail Surfaces QA',
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
    fs.writeFileSync(path.join(outDir, 'detail-surfaces.md'), md.join('\n'), 'utf8');
    await browser.close().catch(() => null);
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
