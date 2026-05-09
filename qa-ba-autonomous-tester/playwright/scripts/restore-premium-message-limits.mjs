import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const storageStatePath = process.env.ADMIN_STORAGE_STATE || './secrets/admin-storage-state.super-admin.json';
const reportRoot = process.env.REPORT_ROOT || './reports';
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `restore-premium-message-limits-${stamp}`);

const restoreValues = {
  messagesOutPremiumMen: process.env.RESTORE_MESSAGES_OUT_PREMIUM_MEN || '99',
  messagesOutPremiumWomen: process.env.RESTORE_MESSAGES_OUT_PREMIUM_WOMEN || '99',
  messagesOutPeriod: process.env.RESTORE_MESSAGES_OUT_PERIOD || '24',
};

function url(route) {
  return new URL(route, baseURL).toString();
}

async function collectSettings(page) {
  return page.evaluate(() => {
    const settings = {};
    for (const field of document.querySelectorAll('input[name^="Settings["], select[name^="Settings["], textarea[name^="Settings["]')) {
      const match = field.name?.match(/^Settings\[(.+)]$/);
      if (!match) continue;
      const type = (field.getAttribute('type') || field.tagName).toLowerCase();
      if (type === 'checkbox') settings[match[1]] = field.checked ? '1' : '0';
      else if (type === 'radio') {
        if (field.checked) settings[match[1]] = field.value;
      } else {
        settings[match[1]] = field.value;
      }
    }
    return settings;
  });
}

async function submitSettings(page, changes) {
  await page.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  await page.evaluate((patch) => {
    for (const [key, rawValue] of Object.entries(patch)) {
      for (const field of document.querySelectorAll(`[name="Settings[${CSS.escape(key)}]"]`)) {
        const type = (field.getAttribute('type') || field.tagName).toLowerCase();
        if (type === 'checkbox') field.checked = rawValue === true || rawValue === '1' || rawValue === 1;
        else if (type !== 'hidden') field.value = String(rawValue);
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, changes);
  const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
  await page.evaluate(() => {
    const field = document.querySelector('input[name^="Settings["], select[name^="Settings["], textarea[name^="Settings["]');
    const form = field?.closest('form');
    const submitter = form ? [...form.querySelectorAll('button, input[type="submit"]')].find((node) => /save/i.test(node.textContent || node.value || '')) : null;
    if (form?.requestSubmit) form.requestSubmit(submitter || undefined);
    else if (submitter) submitter.click();
    else form?.submit();
  });
  await nav;
  await page.waitForTimeout(900);
}

const result = {
  startedAt: new Date().toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  outDir,
  restoreValues,
  before: {},
  after: {},
  diff: [],
  screenshots: {},
  error: '',
};

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, slowMo: 80 });
const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1200 } });
const page = await context.newPage();
page.setDefaultTimeout(25000);

try {
  await page.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(700);
  result.before = await collectSettings(page);
  const beforeScreenshot = path.join(outDir, 'premium-message-limits-before-restore.png');
  await page.screenshot({ path: beforeScreenshot, fullPage: true });
  result.screenshots.before = beforeScreenshot;

  await submitSettings(page, restoreValues);
  await page.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(700);
  result.after = await collectSettings(page);
  const afterScreenshot = path.join(outDir, 'premium-message-limits-after-restore.png');
  await page.screenshot({ path: afterScreenshot, fullPage: true });
  result.screenshots.after = afterScreenshot;

  result.diff = Object.entries(restoreValues)
    .filter(([key, value]) => String(result.after[key]) !== String(value))
    .map(([key, value]) => ({ key, expected: String(value), actual: String(result.after[key]) }));
  result.status = result.diff.length === 0 ? 'PASS' : 'FAIL';
} catch (error) {
  result.status = 'ERROR';
  result.error = error?.stack || error?.message || String(error);
} finally {
  result.finishedAt = new Date().toISOString();
  await context.close().catch(() => null);
  await browser.close().catch(() => null);
  fs.writeFileSync(path.join(outDir, 'restore-premium-message-limits.json'), JSON.stringify(result, null, 2), 'utf8');
}

console.log(JSON.stringify(result, null, 2));
process.exit(result.status === 'PASS' ? 0 : 2);
