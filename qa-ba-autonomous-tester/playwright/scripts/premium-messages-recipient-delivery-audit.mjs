import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const cdpURL = process.env.CDP_URL || 'http://127.0.0.1:9224';
const useCdp = process.env.CONFIDELINE_QA_USE_CDP === '1';
const storageStatePath = process.env.ADMIN_STORAGE_STATE || './secrets/admin-storage-state.super-admin.json';
const reportRoot = process.env.PREMIUM_AUDIT_REPORT_ROOT || './reports';
const senderId = Number(process.env.PREMIUM_TEST_USER_ID || 182);
const targets = (process.env.RECIPIENT_TARGET_IDS || '3,6,10')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter(Boolean);
const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `premium-messages-recipient-delivery-audit-${stamp}`);

const changedKeys = ['messagesOutPremiumMen', 'messagesOutPremiumWomen', 'messagesOutPeriod'];

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  baseURL,
  senderId,
  targets,
  outDir,
  baseline: {},
  checks: [],
  findings: [],
  attempts: [],
  screenshots: {},
  rollback: { attempted: false, ok: false, diff: [] },
  errors: [],
};

function url(route) {
  return new URL(route, baseURL).toString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pushCheck(name, status, evidence = {}) {
  result.checks.push({ name, status, evidence });
}

function pushFinding(id, severity, title, evidence = {}) {
  result.findings.push({ id, severity, title, evidence });
}

async function screenshot(page, key, fileName) {
  const filePath = path.join(outDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true }).catch(() => page.screenshot({ path: filePath }));
  result.screenshots[key] = filePath;
  return filePath;
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

async function loginAsUser(browser, userId, label) {
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  await page.goto(url(`/en/admin/user/info?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(500);
  const loginHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
      /login-as-user/i.test(candidate.getAttribute('href') || '') ||
      /Login as user/i.test(candidate.textContent || '')
    );
    return link?.href || '';
  });
  if (!loginHref) throw new Error(`Login-as link not found for ${label} user ${userId}`);
  const csrf = await page.evaluate(() => ({
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '',
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
  }));
  await page.evaluate(async ({ loginHref, csrf }) => {
    const body = new URLSearchParams();
    if (csrf.token) body.set(csrf.param || '_csrf', csrf.token);
    await fetch(loginHref, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': csrf.token || '',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: body.toString(),
      redirect: 'manual',
    });
  }, { loginHref, csrf });
  await page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(800);
  await screenshot(page, `${label}-${userId}-logged-in-messages`, `${label}-${userId}-logged-in-messages.png`);
  return { context, page, userId, label };
}

async function sendMessage(page, contactId, text) {
  await page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await page.waitForTimeout(400);
  const csrf = await page.evaluate(() => ({
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '',
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
  }));
  return page.evaluate(async ({ contactId, text, csrf }) => {
    const body = new URLSearchParams();
    if (csrf.token) body.set(csrf.param || '_csrf', csrf.token);
    body.set('contactId', String(contactId));
    body.set('message', text);
    body.set('pendingMessageId', String(Date.now()));
    const response = await fetch('/en/messages/create', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': csrf.token || '',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: body.toString(),
    });
    const rawText = await response.text();
    let json = null;
    try { json = JSON.parse(rawText); } catch {}
    return { status: response.status, ok: response.ok, rawText: rawText.slice(0, 1800), json };
  }, { contactId, text, csrf });
}

async function inspectRecipient(browser, targetId, text, attemptNo) {
  const session = await loginAsUser(browser, targetId, `recipient-attempt-${attemptNo}`);
  await session.page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => null);
  await session.page.waitForTimeout(2500);
  const bodyText = await session.page.locator('body').innerText({ timeout: 15000 }).catch(() => '');
  const exactTextVisible = bodyText.includes(text);
  await screenshot(session.page, `recipientAttempt${attemptNo}`, `recipient-attempt-${attemptNo}-user-${targetId}.png`);
  await session.context.close().catch(() => null);
  return {
    targetId,
    url: '/en/messages',
    exactTextVisible,
    bodyText: bodyText.replace(/\s+/g, ' ').trim().slice(0, 3500),
  };
}

async function main() {
  ensureDir(outDir);
  const browser = useCdp
    ? await chromium.connectOverCDP(cdpURL)
    : await chromium.launch({ headless: true, slowMo: 80 });
  const adminContext = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1200 } });
  const adminPage = await adminContext.newPage();
  adminPage.setDefaultTimeout(25000);

  try {
    await adminPage.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await adminPage.waitForTimeout(700);
    const baseline = await collectSettings(adminPage);
    result.baseline = Object.fromEntries(changedKeys.map((key) => [key, baseline[key]]));
    await screenshot(adminPage, 'adminBaseline', 'admin-recipient-delivery-baseline.png');

    await submitSettings(adminPage, { messagesOutPremiumMen: '1', messagesOutPremiumWomen: '1', messagesOutPeriod: '1' });
    await adminPage.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await adminPage.waitForTimeout(700);
    const mutated = await collectSettings(adminPage);
    const badReadback = changedKeys.filter((key) => String(mutated[key]) !== '1');
    pushCheck('messagesOutPremium limits set to 1', badReadback.length === 0 ? 'PASS' : 'FAIL', {
      readback: Object.fromEntries(changedKeys.map((key) => [key, mutated[key]])),
      badReadback,
    });
    await screenshot(adminPage, 'adminMutated', 'admin-recipient-delivery-mutated.png');

    const sender = await loginAsUser(browser, senderId, 'sender');
    for (let index = 0; index < targets.length; index += 1) {
      const attemptNo = index + 1;
      const targetId = targets[index];
      const text = `QA recipient delivery ${stamp} attempt ${attemptNo} target ${targetId}`;
      const send = await sendMessage(sender.page, targetId, text);
      await screenshot(sender.page, `senderAttempt${attemptNo}`, `sender-attempt-${attemptNo}-to-${targetId}.png`);
      const recipient = await inspectRecipient(browser, targetId, text, attemptNo);
      result.attempts.push({ attempt: attemptNo, targetId, text, send, recipient });
    }
    await sender.context.close().catch(() => null);

    const sentSuccesses = result.attempts.filter((attempt) => attempt.send.json?.success === true);
    const recipientVisible = result.attempts.filter((attempt) => attempt.recipient.exactTextVisible);
    const senderLimitHits = result.attempts.filter((attempt) =>
      attempt.send.json?.success === false || /limit|premium|exceed|used up/i.test(`${attempt.send.rawText}`)
    );

    pushCheck('sender accepted messages beyond premium limit', senderLimitHits.length === 0 && sentSuccesses.length >= 2 ? 'FAIL' : 'PASS', {
      sentSuccessCount: sentSuccesses.length,
      senderLimitHitCount: senderLimitHits.length,
      attempts: result.attempts.map((attempt) => ({
        attempt: attempt.attempt,
        targetId: attempt.targetId,
        sendStatus: attempt.send.status,
        sendJson: attempt.send.json,
      })),
    });

    const recipientStatus = recipientVisible.length === sentSuccesses.length ? 'FAIL' : recipientVisible.length > 0 ? 'PARTIAL_FAIL' : 'NOT_PROVEN';
    pushCheck('recipient side received exact message text', recipientStatus, {
      sentSuccessCount: sentSuccesses.length,
      recipientVisibleCount: recipientVisible.length,
      recipientEvidence: result.attempts.map((attempt) => ({
        attempt: attempt.attempt,
        targetId: attempt.targetId,
        sendSuccess: attempt.send.json?.success === true,
        exactTextVisible: attempt.recipient.exactTextVisible,
      })),
    });

    if (sentSuccesses.length >= 2) {
      pushFinding(
        'PREMIUM-MESSAGES-OUT-LIMIT-BYPASS-DELIVERED-TO-RECIPIENTS',
        'major',
        'messagesOutPremium limit did not block extra sends; recipient delivery is proven for visible recipient-side messages',
        {
          limit: 1,
          sentSuccessCount: sentSuccesses.length,
          recipientVisibleCount: recipientVisible.length,
          attempts: result.attempts.map((attempt) => ({
            attempt: attempt.attempt,
            targetId: attempt.targetId,
            messageId: attempt.send.json?.messageId || null,
            exactTextVisible: attempt.recipient.exactTextVisible,
          })),
        }
      );
    }

    result.rollback.attempted = true;
    await submitSettings(adminPage, Object.fromEntries(changedKeys.map((key) => [key, baseline[key]])));
    await adminPage.goto(url('/en/admin/settings/premium'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await adminPage.waitForTimeout(700);
    const restored = await collectSettings(adminPage);
    result.rollback.diff = changedKeys.filter((key) => String(restored[key]) !== String(baseline[key]));
    result.rollback.ok = result.rollback.diff.length === 0;
    await screenshot(adminPage, 'adminRollback', 'admin-recipient-delivery-rollback.png');
    pushCheck('rollback messagesOutPremium settings', result.rollback.ok ? 'PASS' : 'FAIL', result.rollback);

    result.status = result.findings.some((finding) => finding.severity === 'major') ? 'FAIL_WITH_ROLLBACK' : 'PASS_WITH_ROLLBACK';
  } catch (error) {
    result.status = 'ERROR';
    result.errors.push(error.stack || String(error));
  } finally {
    result.finishedAt = new Date().toISOString();
    const reportJson = path.join(outDir, 'premium-messages-recipient-delivery-audit.json');
    const reportMd = path.join(outDir, 'premium-messages-recipient-delivery-audit.md');
    fs.writeFileSync(reportJson, JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(reportMd, [
      '# Premium Messages Recipient Delivery Audit',
      '',
      `- Status: ${result.status}`,
      `- Sender: ${senderId}`,
      `- Targets: ${targets.join(', ')}`,
      `- Rollback: ${result.rollback.ok ? 'OK' : 'NOT OK'}`,
      '',
      '## Attempts',
      ...result.attempts.map((attempt) => `- attempt ${attempt.attempt} -> target ${attempt.targetId}: send=${attempt.send.json?.success === true ? 'success' : attempt.send.status}, recipientVisible=${attempt.recipient.exactTextVisible}`),
      '',
      '## Checks',
      ...result.checks.map((check) => `- ${check.status}: ${check.name}`),
      '',
      '## Findings',
      ...(result.findings.length ? result.findings.map((finding) => `- ${finding.severity}: ${finding.id} - ${finding.title}`) : ['- none']),
      '',
      '## Errors',
      ...(result.errors.length ? result.errors.map((error) => `- ${String(error).slice(0, 800)}`) : ['- none']),
    ].join('\n'), 'utf8');
    console.log(JSON.stringify({
      status: result.status,
      outDir,
      reportJson,
      reportMd,
      checks: result.checks,
      findings: result.findings,
      rollback: result.rollback,
      errors: result.errors,
    }, null, 2));
    await adminContext.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
