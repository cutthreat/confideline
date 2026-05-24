import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const cdpURL = process.env.CDP_URL || 'http://127.0.0.1:9224';
const reportRoot = process.env.QA_REPORT_ROOT || 'H:/GPT-Codex/Confideline/qa-ba-autonomous-tester/reports/full-live-regression-20260524';
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `email-verification-signup-${stamp}`);

const qaUser = {
  name: `QA Email ${stamp}`,
  username: `QAEmail${stamp.replace(/[^0-9]/g, '')}`,
  email: `qa.email.${stamp.replace(/[^0-9]/g, '')}@example.com`,
  password: `QA-Email-${stamp}!`,
  sex: '1',
  dob: '1992-05-15',
  country: 'US',
  city: '4335045',
  cityName: 'New Orleans',
};

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  baseURL,
  cdpURL,
  outDir,
  status: 'UNKNOWN',
  qaUser: { ...qaUser, password: '[redacted]' },
  baseline: {},
  steps: [],
  checks: [],
  screenshots: {},
  artifacts: {},
  rollback: {
    settingAttempted: false,
    settingRestored: false,
    userDeleteAttempted: false,
    userDeleted: false,
  },
  errors: [],
};

function url(route) {
  return new URL(route, baseURL).toString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clip(text, max = 2400) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function write(name, data) {
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, name), typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf8');
}

function addStep(name, status, evidence = {}) {
  result.steps.push({ name, status, evidence });
  write('email-verification-signup-progress.json', result);
}

function addCheck(id, status, title, evidence = {}, expected = '') {
  result.checks.push({ id, status, title, expected, evidence });
  write('email-verification-signup-progress.json', result);
}

async function screenshot(page, key, label = '') {
  if (label) {
    await page.evaluate((text) => {
      const old = document.querySelector('[data-qa-badge="1"]');
      if (old) old.remove();
      const badge = document.createElement('div');
      badge.setAttribute('data-qa-badge', '1');
      badge.textContent = text;
      badge.style.cssText = 'position:fixed;left:12px;top:12px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border-radius:6px;max-width:760px';
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const file = `${key}.png`;
  await page.screenshot({ path: path.join(outDir, file), fullPage: true }).catch(async () => {
    await page.screenshot({ path: path.join(outDir, file) });
  });
  result.screenshots[key] = file;
  return file;
}

async function saveHtml(page, key) {
  const file = `${key}.html`;
  fs.writeFileSync(path.join(outDir, file), await page.content(), 'utf8');
  result.artifacts[key] = file;
  return file;
}

async function pageFacts(page) {
  return page.evaluate(() => {
    const bodyText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();
    const errorMatch = bodyText.match(/Ошибка \(#(\d+)\)|Error \(#(\d+)\)|Internal Server Error|Fatal error|Parse error|Deprecated:|Warning:|Notice:/i);
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.innerText?.trim() || '',
      bodyText: bodyText.slice(0, 6000),
      hasRuntimeError: !!errorMatch,
      errorNumber: errorMatch ? (errorMatch[1] || errorMatch[2] || '') : '',
      has404: /Not Found \(#404\)|Страница не найдена|Page not found/i.test(bodyText) || document.title.includes('Not Found'),
      alerts: [...document.querySelectorAll('.alert,.help-block,.invalid-feedback,.text-danger,.has-error,.error-summary')]
        .map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, 50),
    };
  });
}

async function collectSettings(page) {
  return page.evaluate(() => {
    const settings = {};
    for (const field of document.querySelectorAll('input[name^="Settings["], select[name^="Settings["], textarea[name^="Settings["]')) {
      const name = field.getAttribute('name') || '';
      const match = name.match(/^Settings\[(.+)]$/);
      if (!match) continue;
      const key = match[1];
      const type = (field.getAttribute('type') || field.tagName).toLowerCase();
      if (type === 'hidden' && document.querySelector(`[name="${CSS.escape(name)}"][type="checkbox"]`)) continue;
      if (type === 'radio' && !field.checked) continue;
      settings[key] = type === 'checkbox' ? (field.checked ? '1' : '0') : String(field.value || '');
    }
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.innerText?.trim() || '',
      settings,
      bodyText: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 3000),
    };
  });
}

async function submitSetting(page, key, value) {
  await page.goto(url('/en/admin/settings/index'), { waitUntil: 'commit', timeout: 90000 }).catch(() => null);
  await page.waitForTimeout(1800);
  await page.evaluate(({ key: settingKey, value: nextValue }) => {
    const fields = [...document.querySelectorAll(`[name="Settings[${CSS.escape(settingKey)}]"]`)];
    for (const field of fields) {
      const type = (field.getAttribute('type') || field.tagName).toLowerCase();
      if (type === 'checkbox') {
        field.checked = nextValue === '1' || nextValue === 1 || nextValue === true;
      } else if (type !== 'hidden') {
        field.value = String(nextValue);
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { key, value });
  const submit = await page.evaluate(() => {
    const field = document.querySelector('input[name^="Settings["], select[name^="Settings["], textarea[name^="Settings["]');
    const form = field?.closest('form');
    if (!form) return { ok: false, reason: 'settings form not found' };
    const submitter = [...form.querySelectorAll('button, input[type="submit"]')]
      .find((node) => /save|сохран/i.test(node.textContent || node.value || '')) ||
      form.querySelector('button[type="submit"], input[type="submit"]');
    if (typeof form.requestSubmit === 'function') form.requestSubmit(submitter || undefined);
    else if (submitter) submitter.click();
    else form.submit();
    return { ok: true, action: form.action || location.href, submitText: (submitter?.textContent || submitter?.value || '').trim() };
  });
  await page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => null);
  await page.waitForTimeout(1000);
  const readback = await collectSettings(page);
  return { submit, readback };
}

async function setSelectize(page, selectSelector, value, label) {
  return page.evaluate(({ selectSelector: selector, value: nextValue, label: nextLabel }) => {
    const select = document.querySelector(selector);
    if (!select) return { ok: false, reason: 'select missing' };
    let option = [...select.options].find((item) => item.value === nextValue);
    if (!option) {
      option = new Option(nextLabel, nextValue, true, true);
      select.add(option);
    }
    select.value = nextValue;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    if (window.jQuery && window.jQuery(select).data('selectize')) {
      window.jQuery(select).data('selectize').addOption({ value: nextValue, text: nextLabel });
      window.jQuery(select).data('selectize').setValue(nextValue, true);
    }
    return { ok: String(select.value) === String(nextValue), value: select.value };
  }, { selectSelector, value, label });
}

async function registerClient(page) {
  await page.goto(url('/en/signup'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await screenshot(page, '01-signup-open', 'Signup form before fill');
  await page.locator(`input[name="register-form[sex]"][value="${qaUser.sex}"]`).check({ force: true });
  await page.fill('input[name="register-form[dob]"]', qaUser.dob);
  await page.fill('input[name="register-form[name]"]', qaUser.name);
  await page.fill('input[name="register-form[username]"]', qaUser.username);
  await page.fill('input[name="register-form[email]"]', qaUser.email);
  await page.fill('input[name="register-form[password]"]', qaUser.password);
  const countrySet = await setSelectize(page, 'select[name="register-form[country]"]', qaUser.country, 'United States');
  await page.waitForTimeout(600);
  const citySet = await setSelectize(page, 'select[name="register-form[city]"]', qaUser.city, qaUser.cityName);
  await screenshot(page, '02-signup-filled', `Signup filled: ${qaUser.email}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null),
    page.locator('form button[type="submit"], form input[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1200);
  const facts = await pageFacts(page);
  await screenshot(page, '03-signup-after-submit', `After signup submit: ${qaUser.email}`);
  addStep('signup', facts.hasRuntimeError ? 'RUNTIME_ERROR' : 'SUBMITTED', { countrySet, citySet, facts });
  return facts;
}

async function logout(page) {
  await page.evaluate(async () => {
    const link = [...document.querySelectorAll('a[href*="logout"]')][0];
    const href = link?.href || '/en/security/logout';
    const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
    const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
    const body = new URLSearchParams();
    if (token) body.set(param, token);
    await fetch(href, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': token },
      body: body.toString(),
      redirect: 'follow',
    });
  });
  await page.goto(url('/en/login'), { waitUntil: 'commit', timeout: 30000 }).catch(() => null);
  await page.waitForTimeout(900);
  await page.waitForTimeout(700);
  return pageFacts(page);
}

async function loginClient(page) {
  await page.goto(url('/en/login'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.fill('input[name="login-form[email]"], input[name="LoginForm[email]"], input[type="email"]', qaUser.email);
  await page.fill('input[name="login-form[password]"], input[name="LoginForm[password]"], input[type="password"]', qaUser.password);
  await screenshot(page, '04-login-filled', `Login filled: ${qaUser.email}`);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null),
    page.locator('form button[type="submit"], form input[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(1200);
  const facts = await pageFacts(page);
  await screenshot(page, '05-after-repeat-login', `After repeat login: ${qaUser.email}`);
  return facts;
}

async function deleteQaUser(adminPage) {
  result.rollback.userDeleteAttempted = true;
  await adminPage.goto(url(`/en/admin/user/index?UserSearch%5Bemail%5D=${encodeURIComponent(qaUser.email)}`), { waitUntil: 'commit', timeout: 90000 }).catch(() => null);
  await adminPage.waitForTimeout(700);
  await screenshot(adminPage, '98-user-search-before-delete', `Admin search before delete: ${qaUser.email}`);
  const row = await adminPage.evaluate((email) => {
    const rows = [...document.querySelectorAll('table tbody tr')].map((tr) => ({
      text: (tr.innerText || '').replace(/\s+/g, ' ').trim(),
      links: [...tr.querySelectorAll('a[href]')].map((a) => ({
        text: (a.innerText || a.title || '').replace(/\s+/g, ' ').trim(),
        href: a.href,
        dataMethod: a.getAttribute('data-method') || '',
        dataConfirm: a.getAttribute('data-confirm') || '',
      })),
    }));
    return rows.find((item) => item.text.includes(email)) || null;
  }, qaUser.email);
  if (!row) {
    addStep('delete-user', 'NO_USER_FOUND', { email: qaUser.email });
    result.rollback.userDeleted = true;
    return;
  }
  const deleteLink = row.links.find((link) => /delete/i.test(link.href) || /удал/i.test(link.text) || /delete|remove/i.test(link.text));
  if (!deleteLink) {
    addStep('delete-user', 'BLOCKED_NO_DELETE_LINK', { row });
    return;
  }
  const post = await adminPage.evaluate(async (href) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '';
    const param = document.querySelector('meta[name="csrf-param"]')?.content || '_csrf';
    const body = new URLSearchParams();
    if (token) body.set(param, token);
    const response = await fetch(href, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-CSRF-Token': token },
      body: body.toString(),
      redirect: 'follow',
    });
    return { status: response.status, ok: response.ok, text: (await response.text()).replace(/\s+/g, ' ').slice(0, 1200) };
  }, deleteLink.href);
  await adminPage.goto(url(`/en/admin/user/index?UserSearch%5Bemail%5D=${encodeURIComponent(qaUser.email)}`), { waitUntil: 'commit', timeout: 90000 }).catch(() => null);
  await adminPage.waitForTimeout(700);
  const readback = await pageFacts(adminPage);
  await screenshot(adminPage, '99-user-search-after-delete', `Admin search after delete: ${qaUser.email}`);
  const stillPresent = readback.bodyText.includes(qaUser.email);
  result.rollback.userDeleted = !stillPresent;
  addStep('delete-user', stillPresent ? 'FAILED_STILL_PRESENT' : 'DELETED', { row, deleteLink, post, readback });
}

function buildMarkdown() {
  const lines = [
    '# Email verification signup audit',
    '',
    `Status: ${result.status}`,
    `Started: ${result.startedAt}`,
    `Finished: ${result.finishedAt}`,
    `QA user: ${result.qaUser.email}`,
    '',
    '## Baseline',
    '',
    `siteRequireEmailVerification before: ${result.baseline.siteRequireEmailVerification}`,
    `siteRequireEmailVerification restored: ${result.rollback.settingRestored}`,
    `QA user deleted: ${result.rollback.userDeleted}`,
    '',
    '## Checks',
    '',
    '| ID | Status | What | Expected |',
    '|---|---|---|---|',
    ...result.checks.map((check) => `| ${check.id} | ${check.status} | ${check.title} | ${clip(check.expected, 300)} |`),
    '',
    '## Screenshots',
    '',
    ...Object.entries(result.screenshots).map(([key, file]) => `- ${key}: ${file}`),
  ];
  return lines.join('\n');
}

ensureDir(outDir);
let browser;
let adminPage;
let clientContext;
try {
  browser = await chromium.connectOverCDP(cdpURL, { timeout: 60000 });
  const adminContext = browser.contexts()[0];
  adminPage = adminContext.pages().find((page) => page.url().includes('/admin')) || adminContext.pages()[0] || await adminContext.newPage();
  await adminPage.setViewportSize({ width: 1365, height: 900 });

  if (!adminPage.url().includes('/en/admin/settings/index')) {
    await adminPage.goto(url('/en/admin/settings/index'), { waitUntil: 'commit', timeout: 90000 }).catch(() => null);
  }
  await adminPage.waitForTimeout(1800);
  const baseline = await collectSettings(adminPage);
  result.baseline = {
    settingsUrl: baseline.url,
    siteRequireEmailVerification: baseline.settings.siteRequireEmailVerification,
  };
  await screenshot(adminPage, '00-admin-settings-baseline', 'Baseline: siteRequireEmailVerification');
  await saveHtml(adminPage, 'admin-settings-baseline');
  addCheck('ADMIN-SETTING-PRESENT', baseline.settings.siteRequireEmailVerification !== undefined ? 'PASS' : 'FAIL', 'Admin main settings expose siteRequireEmailVerification', { baseline }, 'Setting must be visible before mutation.');

  if (baseline.settings.siteRequireEmailVerification === undefined) {
    throw new Error('siteRequireEmailVerification not found on /en/admin/settings/index');
  }

  const disable = await submitSetting(adminPage, 'siteRequireEmailVerification', '0');
  result.rollback.settingAttempted = true;
  await screenshot(adminPage, '00-admin-settings-disabled', 'Email verification disabled for QA');
  addStep('disable-email-verification', disable.readback.settings.siteRequireEmailVerification === '0' ? 'DISABLED' : 'FAILED', disable);
  addCheck('EMAIL-VERIFICATION-DISABLED-READBACK', disable.readback.settings.siteRequireEmailVerification === '0' ? 'PASS' : 'FAIL', 'Readback confirms email verification off before signup', disable, 'siteRequireEmailVerification must read 0.');

  clientContext = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const clientPage = await clientContext.newPage();
  const signupFacts = await registerClient(clientPage);
  addCheck('SIGNUP-SUBMIT-NO-RUNTIME-ERROR', !signupFacts.hasRuntimeError ? 'PASS' : 'FAIL', 'Signup submit has no PHP/Yii runtime error', signupFacts, 'No #500/#8192/PHP warning/notice/fatal after submit.');

  const logoutFacts = await logout(clientPage);
  await screenshot(clientPage, '03b-after-logout', 'After logout');
  addStep('logout', 'DONE', logoutFacts);

  const loginFacts = await loginClient(clientPage);
  const loginSucceeded = /\/login/i.test(loginFacts.url) === false && !/confirm|verification|not verified|подтверд/i.test(loginFacts.bodyText);
  addStep('repeat-login', loginSucceeded ? 'LOGGED_IN' : 'BLOCKED', loginFacts);
  addCheck('REPEAT-LOGIN-WITH-EMAIL-VERIFICATION-OFF', loginSucceeded ? 'PASS' : 'FAIL', 'New signup client can login again after logout when email verification is off', loginFacts, 'Expected: repeat login succeeds without email confirmation because admin setting is off.');

  await deleteQaUser(adminPage);

  result.status = result.checks.some((check) => check.status === 'FAIL') ? 'FAIL' : 'PASS';
} catch (error) {
  result.status = 'ERROR';
  result.errors.push(String(error.stack || error.message || error));
} finally {
  try {
    if (adminPage && result.baseline.siteRequireEmailVerification !== undefined) {
      const restore = await submitSetting(adminPage, 'siteRequireEmailVerification', result.baseline.siteRequireEmailVerification);
      result.rollback.settingRestored = restore.readback.settings.siteRequireEmailVerification === result.baseline.siteRequireEmailVerification;
      addStep('restore-email-verification', result.rollback.settingRestored ? 'RESTORED' : 'FAILED', restore);
      await screenshot(adminPage, '100-admin-settings-restored', 'Email verification restored');
      addCheck('EMAIL-VERIFICATION-RESTORED', result.rollback.settingRestored ? 'PASS' : 'FAIL', 'Admin setting restored to baseline', restore, `Expected restored value: ${result.baseline.siteRequireEmailVerification}`);
    }
  } catch (restoreError) {
    result.errors.push(`restore failed: ${String(restoreError.stack || restoreError.message || restoreError)}`);
  }
  try {
    if (clientContext) await clientContext.close();
  } catch {}
  try {
    if (browser) await browser.close();
  } catch {}
  result.finishedAt = new Date().toISOString();
  write('email-verification-signup.json', result);
  write('email-verification-signup.md', buildMarkdown());
  console.log(JSON.stringify({ status: result.status, outDir, checks: result.checks, rollback: result.rollback, errors: result.errors }, null, 2));
  if (!['PASS'].includes(result.status) || !result.rollback.settingRestored) process.exitCode = 1;
}
