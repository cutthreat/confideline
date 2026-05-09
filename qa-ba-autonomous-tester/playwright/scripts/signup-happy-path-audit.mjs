import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const reportRoot = process.env.FULL_SITE_REPORT_ROOT || '../reports';
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `signup-happy-path-${stamp}`);
const testUser = {
  name: `QA Signup ${stamp}`,
  username: `QASignup${stamp.replace(/[^0-9]/g, '')}`,
  email: `qa.signup.${stamp.replace(/[^0-9]/g, '')}@example.com`,
  password: 'QA-Password-12345!',
  sex: '1',
  dob: '1992-05-15',
  country: 'US',
  city: '4335045',
  cityName: 'New Orleans',
};

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  outDir,
  testUser: { ...testUser, password: '[redacted]' },
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
      badge.style.cssText = 'position:fixed;left:12px;top:12px;z-index:2147483647;background:#111827;color:#fff;font:700 16px/1.35 Arial,sans-serif;padding:10px 12px;border-radius:6px;max-width:820px';
      document.body.appendChild(badge);
    }, label).catch(() => null);
  }
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
}

async function pageFacts(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 6000),
    forms: [...document.querySelectorAll('form')].map((form) => ({
      id: form.id || '',
      action: form.action,
      method: form.method,
      text: (form.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1200),
      inputs: [...form.querySelectorAll('input, select, textarea, button')].map((input) => ({
        name: input.name || '',
        id: input.id || '',
        type: input.type || input.tagName,
        value: input.type === 'password' ? '[redacted]' : String(input.value || '').slice(0, 120),
        checked: Boolean(input.checked),
        text: (input.textContent || input.value || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      })).slice(0, 80),
    })).slice(0, 10),
    errors: [...document.querySelectorAll('.help-block, .invalid-feedback, .text-danger, .alert-danger, .has-error')].map((node) =>
      (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim()
    ).filter(Boolean).slice(0, 50),
  }));
}

async function setSelectizeValue(page, selector, value, label) {
  return page.evaluate(({ selector, value, label }) => {
    const select = document.querySelector(selector);
    if (!select) return { ok: false, reason: `select not found: ${selector}` };

    const optionText = label || value;
    if (select.selectize) {
      const selectize = select.selectize;
      if (!selectize.options[value]) {
        selectize.addOption({ value, text: optionText, name: optionText });
      }
      selectize.setValue(value, false);
      selectize.refreshOptions(false);
      selectize.refreshItems();
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return {
        ok: select.value === value,
        value: select.value,
        controlText: selectize.$control?.text?.()?.replace(/\s+/g, ' ').trim() || '',
      };
    }

    if (![...select.options].some((option) => option.value === value)) {
      select.add(new Option(optionText, value, true, true));
    }
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: select.value === value, value: select.value };
  }, { selector, value, label });
}

async function main() {
  ensureDir(outDir);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    page.setDefaultTimeout(30000);
    await page.goto(asUrl('/en/signup'), { waitUntil: 'commit', timeout: 60000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(1200);
    const beforeFacts = await pageFacts(page);
    await screenshot(page, 'signup-form-before', 'signup-form-before.png', 'Signup before fill');

    await page.evaluate((sex) => {
      const input = document.querySelector(`input[name="register-form[sex]"][value="${sex}"]`);
      if (!input) return;
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, testUser.sex);
    await page.fill('input[name="register-form[dob]"]', testUser.dob);
    await page.fill('input[name="register-form[name]"]', testUser.name);
    await page.fill('input[name="register-form[username]"]', testUser.username);
    await page.fill('input[name="register-form[email]"]', testUser.email);
    await page.fill('input[name="register-form[password]"]', testUser.password);
    const countrySet = await setSelectizeValue(page, 'select[name="register-form[country]"]', testUser.country, 'United States');
    await page.waitForTimeout(1000);
    const citySet = await setSelectizeValue(page, 'select[name="register-form[city]"]', testUser.city, testUser.cityName);
    const filledFacts = await pageFacts(page);
    await screenshot(page, 'signup-form-filled', 'signup-form-filled.png', `Signup filled: ${testUser.username}`);

    const filledForm = filledFacts.forms.find((form) => form.id === 'registration-form');
    const filledValues = Object.fromEntries((filledForm?.inputs || []).filter((input) => input.name).map((input) => [input.name, input.value]));
    const requiredValuesReady =
      filledValues['register-form[email]'] === testUser.email &&
      filledValues['register-form[username]'] === testUser.username &&
      filledValues['register-form[country]'] === testUser.country &&
      filledValues['register-form[city]'] === testUser.city;
    if (!requiredValuesReady) {
      addCheck('SIGNUP-FORM-LOAD', beforeFacts.forms.some((form) => form.id === 'registration-form') ? 'PASS' : 'FAIL', 'Форма регистрации открывается', { beforeFacts }, beforeFacts.forms.some((form) => form.id === 'registration-form')
        ? 'Страница /en/signup открылась и содержит registration-form.'
        : 'На /en/signup не найдена registration-form.');
      addCheck('SIGNUP-FORM-FILL', 'FAIL', 'Форма регистрации не приняла подготовленные валидные данные', { filledFacts, countrySet, citySet, filledValues }, 'До submit не удалось надежно заполнить обязательные поля country/city. Это блокер тестового контура или UI-контрола, поэтому submit не выполнялся.');
      addFinding('SIGNUP-TEST-CONTOUR-001', 'medium', 'Signup happy path требует ручной/DOM донастройки country/city selectize', { filledFacts, countrySet, citySet, filledValues }, 'Игорю не считать это продуктовым багом регистрации без повторной проверки через реальный UI; QA-контур должен уметь стабильно выбирать Country/City.');
      return;
    }

    const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
    await page.evaluate(() => {
      const form = document.querySelector('#registration-form');
      if (form?.requestSubmit) form.requestSubmit();
      else form?.submit();
    });
    await nav;
    await page.waitForTimeout(1800);
    const afterFacts = await pageFacts(page);
    await screenshot(page, 'signup-after-submit', 'signup-after-submit.png', `Signup after submit: ${testUser.username}`);

    const formStillVisible = afterFacts.forms.some((form) => form.id === 'registration-form');
    const createdMessage = /account has been created|message with further instructions|created and a message/i.test(afterFacts.bodyText);
    const loggedInSettings = /\/settings\/profile/.test(afterFacts.url);
    const hasValidationErrors = afterFacts.errors.length > 0 || /This .* has already been taken|cannot be blank|is invalid|required/i.test(afterFacts.bodyText);

    addCheck('SIGNUP-FORM-LOAD', beforeFacts.forms.some((form) => form.id === 'registration-form') ? 'PASS' : 'FAIL', 'Форма регистрации открывается', { beforeFacts }, beforeFacts.forms.some((form) => form.id === 'registration-form')
      ? 'Страница /en/signup открылась и содержит registration-form.'
      : 'На /en/signup не найдена registration-form.');
    addCheck('SIGNUP-FORM-FILL', filledFacts.forms.some((form) => form.inputs.some((input) => input.name === 'register-form[email]' && input.value === testUser.email)) ? 'PASS' : 'FAIL', 'Форма принимает заполнение валидными данными', { filledFacts }, 'Заполнены sex, dob, name, username, country, city, email, password.');
    addCheck('SIGNUP-SUBMIT-HAPPY-PATH', (createdMessage || loggedInSettings) && !formStillVisible && !hasValidationErrors ? 'PASS' : 'FAIL', 'Регистрация нового пользователя проходит happy path', { afterFacts, createdMessage, loggedInSettings, formStillVisible, hasValidationErrors }, (createdMessage || loggedInSettings) && !formStillVisible && !hasValidationErrors
      ? 'После submit сайт показал успешное создание аккаунта или перевел пользователя в профиль.'
      : 'После submit пользователь остался на форме или появились ошибки; нужно проверить блокер регистрации.');

    if (result.checks.some((check) => check.status === 'FAIL')) {
      addFinding('SIGNUP-HAPPY-PATH-001', 'high', 'Happy path регистрации не доказан', { beforeFacts, filledFacts, afterFacts }, 'Игорю проверить регистрацию с валидными данными, country/city selector и server-side validation.');
    }
  } catch (error) {
    result.errors.push(error?.stack || error?.message || String(error));
  } finally {
    await browser.close().catch(() => null);
    result.finishedAt = new Date().toISOString();
    const hasFail = result.checks.some((check) => check.status === 'FAIL');
    const hasWarn = result.checks.some((check) => check.status === 'WARN');
    result.status = result.errors.length || hasFail ? 'FAIL' : hasWarn ? 'PASS_WITH_WARNINGS' : 'PASS';
    fs.writeFileSync(path.join(outDir, 'signup-happy-path.json'), JSON.stringify(result, null, 2), 'utf8');
    const md = [
      '# Confideline Signup Happy Path',
      '',
      `- Status: ${result.status}`,
      `- Username: ${testUser.username}`,
      `- Email: ${testUser.email}`,
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
    fs.writeFileSync(path.join(outDir, 'signup-happy-path.md'), md.join('\n'), 'utf8');
  }
  console.log(JSON.stringify({ status: result.status, outDir, checks: result.checks.map((check) => ({ id: check.id, status: check.status })), findings: result.findings, errors: result.errors }, null, 2));
  if (result.errors.length || result.checks.some((check) => check.status === 'FAIL')) process.exitCode = 1;
}

main();
