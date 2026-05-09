import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const cdpURL = process.env.CDP_URL || 'http://127.0.0.1:9224';
const useCdp = process.env.CONFIDELINE_QA_USE_CDP === '1';
const storageStatePath = process.env.ADMIN_STORAGE_STATE || './secrets/admin-storage-state.super-admin.json';
const reportRoot = process.env.REPORT_ROOT || './reports';
const groupId = Number(process.env.GROUP_ID || 10);
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const outDir = path.resolve(reportRoot, `group-posts-moderation-audit-${stamp}`);

const result = {
  startedAt: new Date().toISOString(),
  finishedAt: '',
  status: 'UNKNOWN',
  groupId,
  outDir,
  checks: [],
  findings: [],
  post: null,
  screenshots: {},
  errors: [],
};

function url(route) {
  return new URL(route, baseURL).toString();
}

function pushCheck(name, status, evidence = {}) {
  result.checks.push({ name, status, evidence });
}

function pushFinding(id, severity, title, evidence = {}) {
  result.findings.push({ id, severity, title, evidence });
}

async function screenshot(page, key) {
  const file = path.join(outDir, `${key}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => page.screenshot({ path: file }));
  result.screenshots[key] = file;
}

async function getCsrf(page) {
  return page.evaluate(() => ({
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || '',
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
  }));
}

async function postForm(page, targetUrl, fields = {}) {
  const csrf = await getCsrf(page);
  return page.evaluate(async ({ targetUrl, fields, csrf }) => {
    const body = new URLSearchParams();
    if (csrf.token) body.set(csrf.param || '_csrf', csrf.token);
    for (const [key, value] of Object.entries(fields)) body.set(key, String(value ?? ''));
    const response = await fetch(targetUrl, {
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
    return {
      status: response.status,
      location: response.headers.get('location') || '',
      text: (await response.text()).slice(0, 1200),
    };
  }, { targetUrl, fields, csrf });
}

async function submitAnyForm(page, targetUrl, fields = {}) {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);
  const formInfo = await page.evaluate(() => {
    const form = document.querySelector('form');
    return {
      found: Boolean(form),
      action: form ? new URL(form.getAttribute('action') || location.href, location.href).toString() : '',
      method: (form?.getAttribute('method') || 'post').toLowerCase(),
      fields: form ? [...form.querySelectorAll('input, textarea, select')].map((field) => ({
        name: field.getAttribute('name') || '',
        id: field.id || '',
        tag: field.tagName,
        type: field.getAttribute('type') || '',
        value: field.value || '',
      })) : [],
      text: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 1800),
    };
  });
  if (!formInfo.found) return { formInfo, submit: null };
  const payload = {};
  for (const field of formInfo.fields) {
    if (!field.name || /^_csrf/.test(field.name)) continue;
    payload[field.name] = field.value || '';
  }
  const reasonKey = Object.keys(payload).find((key) => /reason|comment|message|text/i.test(key));
  if (reasonKey) payload[reasonKey] = fields.reason || payload[reasonKey] || `QA moderation reason ${stamp}`;
  const submit = await postForm(page, formInfo.action || targetUrl, payload);
  return { formInfo, payload, submit };
}

async function loadPosts(page, query = `groupId=${groupId}`) {
  await page.goto(url(`/en/admin/group/posts?${query}`), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll('table tbody tr')].map((row) => ({
      html: row.innerHTML,
      text: row.innerText.replace(/\s+/g, ' ').trim(),
      actions: [...row.querySelectorAll('a[href], button')].map((node) => ({
        tag: node.tagName,
        text: (node.textContent || node.value || '').replace(/\s+/g, ' ').trim(),
        href: node.href || '',
        title: node.getAttribute('title') || '',
        className: typeof node.className === 'string' ? node.className : '',
        data: Object.fromEntries([...node.attributes].filter((attr) => attr.name.startsWith('data-') || attr.name.startsWith('ng-')).map((attr) => [attr.name, attr.value])),
        onclick: node.getAttribute('onclick') || '',
      })),
    }));
    return {
      url: location.href,
      text: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 5000),
      rows,
    };
  });
}

function parsePostId(row) {
  const m = row.text.match(/^(\d+)\s+/);
  return m ? Number(m[1]) : null;
}

function parseStatus(row) {
  if (/Pending moderation/i.test(row.text)) return 'Pending moderation';
  if (/\bHidden\b/i.test(row.text)) return 'Hidden';
  if (/\bActive\b/i.test(row.text)) return 'Active';
  return 'Unknown';
}

function findPost(rows, preferredStatus = 'Active') {
  return rows
    .map((row) => ({ ...row, id: parsePostId(row), status: parseStatus(row) }))
    .find((row) => row.id && row.status === preferredStatus && row.actions.some((action) => /hide post/i.test(`${action.title} ${action.text}`))) ||
    rows.map((row) => ({ ...row, id: parsePostId(row), status: parseStatus(row) })).find((row) => row.id);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = useCdp
    ? await chromium.connectOverCDP(cdpURL)
    : await chromium.launch({ headless: true, slowMo: 80 });
  const context = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  try {
    const initial = await loadPosts(page);
    await screenshot(page, 'group-posts-initial');
    pushCheck('group posts page opens with groupId filter', /Manage group posts/i.test(initial.text) && !/Not Found/i.test(initial.text) ? 'PASS' : 'FAIL', {
      url: initial.url,
      rowCount: initial.rows.length,
      text: initial.text.slice(0, 1200),
    });

    const post = findPost(initial.rows, 'Active');
    result.post = post ? { id: post.id, initialStatus: post.status, text: post.text.slice(0, 1200), actions: post.actions } : null;
    if (!post?.id) {
      pushCheck('active group post selected', 'NOT_PROVEN', { reason: 'no selectable post found' });
      result.status = 'NOT_PROVEN';
      return;
    }
    pushCheck('active group post selected', 'PASS', { id: post.id, status: post.status, text: post.text.slice(0, 800) });

    const hideAction = post.actions.find((action) => /hide post/i.test(`${action.title} ${action.text}`));
    pushCheck('hide post action available', hideAction ? 'PASS' : 'FAIL', { hideAction });
    if (!hideAction) {
      pushFinding('GROUP-POST-HIDE-ACTION-MISSING', 'major', 'Active post has no Hide post action in admin UI', { postId: post.id });
      result.status = 'FAIL';
      return;
    }

    const modalMatch = hideAction.onclick.match(/"(\\\/en\\\/admin\\\/group\\\/hide-post-modal\?id=\d+)"/);
    const modalRoute = modalMatch ? modalMatch[1].replaceAll('\\/', '/') : `/en/admin/group/hide-post-modal?id=${post.id}`;
    const hideSubmit = await submitAnyForm(page, url(modalRoute), { reason: `QA hide reason ${stamp}` });
    result.hideEndpointAttempts = [{ candidate: url(modalRoute), response: hideSubmit.submit, formInfo: hideSubmit.formInfo, payload: hideSubmit.payload }];
    const acceptedHide = hideSubmit.submit && hideSubmit.submit.status >= 200 && hideSubmit.submit.status < 400;
    pushCheck('hide post modal form callable', acceptedHide ? 'PASS' : 'NOT_PROVEN', { hideSubmit });

    const afterHide = await loadPosts(page, `groupId=${groupId}`);
    await screenshot(page, 'group-posts-after-hide-attempt');
    const postAfterHide = afterHide.rows.map((row) => ({ ...row, id: parsePostId(row), status: parseStatus(row) })).find((row) => row.id === post.id);
    pushCheck('post still exists after hide attempt', postAfterHide ? 'PASS' : 'FAIL', { postId: post.id, status: postAfterHide?.status || 'missing' });
    if (!postAfterHide) {
      pushFinding('GROUP-POST-HIDE-PHYSICALLY_REMOVED_OR_FILTERED', 'major', 'Post disappeared from current admin list after hide attempt; expected hidden not physical delete', { postId: post.id });
    }
    if (postAfterHide?.status === 'Hidden') {
      pushCheck('post status becomes Hidden', 'PASS', { postId: post.id, text: postAfterHide.text.slice(0, 1000) });
    } else {
      pushCheck('post status becomes Hidden', 'NOT_PROVEN', { postId: post.id, status: postAfterHide?.status || 'missing', hidePosts });
    }

    const hiddenList = await loadPosts(page, `groupId=${groupId}&GroupPostSearch%5Bstatus%5D=hidden`);
    await screenshot(page, 'group-posts-hidden-filter');
    const hiddenPost = hiddenList.rows.map((row) => ({ ...row, id: parsePostId(row), status: parseStatus(row) })).find((row) => row.id === post.id);
    pushCheck('hidden filter can show moderated post', hiddenPost ? 'PASS' : 'NOT_PROVEN', {
      postId: post.id,
      hiddenRows: hiddenList.rows.length,
      hiddenPostStatus: hiddenPost?.status || '',
      text: hiddenList.text.slice(0, 1200),
    });

    if (hiddenPost) {
      const reopenAction = hiddenPost.actions.find((action) => /open|restore|show|reopen/i.test(`${action.title} ${action.text} ${action.href} ${action.onclick}`));
      result.reopenAction = reopenAction || null;
      pushCheck('reopen/show action available for hidden post', reopenAction ? 'PASS' : 'NOT_PROVEN', { reopenAction });
    }

    result.status = result.checks.some((check) => check.status === 'FAIL') || result.findings.some((finding) => finding.severity === 'major')
      ? 'FAIL'
      : 'PASS_WITH_GAPS';
  } catch (error) {
    result.status = 'ERROR';
    result.errors.push(error.stack || String(error));
  } finally {
    result.finishedAt = new Date().toISOString();
    const reportJson = path.join(outDir, 'group-posts-moderation-audit.json');
    const reportMd = path.join(outDir, 'group-posts-moderation-audit.md');
    fs.writeFileSync(reportJson, JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(reportMd, [
      '# Group Posts Moderation Audit',
      '',
      `- Status: ${result.status}`,
      `- Group ID: ${groupId}`,
      `- Post: ${result.post?.id || 'n/a'}`,
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
      post: result.post,
      errors: result.errors,
    }, null, 2));
    await context.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
