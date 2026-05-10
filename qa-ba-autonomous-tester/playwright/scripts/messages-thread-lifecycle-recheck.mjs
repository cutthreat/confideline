import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseURL = process.env.BASE_URL || 'https://confideline.com';
const adminStorageState = process.env.ADMIN_STORAGE_STATE || path.resolve('../secrets/admin-storage-state.super-admin.json');
const senderId = Number(process.env.QA_MESSAGE_SENDER_ID || 167);
const recipientId = Number(process.env.QA_MESSAGE_RECIPIENT_ID || 168);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runId = process.env.QA_RUN_ID || `messages-thread-lifecycle-${stamp}`;
const outDir = path.resolve(process.env.QA_OUT_DIR || `../reports/${runId}`);
const timeoutMs = Number(process.env.QA_TIMEOUT_MS || 60000);

if (!fs.existsSync(adminStorageState)) {
  throw new Error(`Admin storage state is missing: ${adminStorageState}`);
}

fs.mkdirSync(outDir, { recursive: true });

const textMessage = `QA chat lifecycle text ${stamp} sender ${senderId} recipient ${recipientId}`;
const attachmentMessage = `QA chat lifecycle image ${stamp}`;

function url(route) {
  return new URL(route, baseURL).toString();
}

function clip(value, max = 1600) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function writePngFixture(filePath) {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAMgAAAB4CAIAAADp7r9aAAAACXBIWXMAAAsTAAALEwEAmpwYAAABrUlEQVR4nO3bQU7DMAwF0Hn/p7sFhVQV3IR2aLzQkco9m7iTkOAgH+smr+f3AAB8u+c+AABgGmCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCEDEbIYIQMRshghAxGyGCHDnz9DR6b0k+6dAAAAAElFTkSuQmCC';
  fs.writeFileSync(filePath, Buffer.from(pngBase64, 'base64'));
}

async function getCsrf(page) {
  return page.evaluate(() => ({
    param: document.querySelector('meta[name="csrf-param"]')?.content || '_csrf',
    token: document.querySelector('meta[name="csrf-token"]')?.content || document.querySelector('input[name="_csrf"]')?.value || ''
  }));
}

async function postForm(page, route, params) {
  const csrf = await getCsrf(page);
  const payload = new URLSearchParams();
  if (csrf.token) {
    payload.set(csrf.param, csrf.token);
  }
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        payload.append(key, String(item));
      }
    } else {
      payload.set(key, String(value));
    }
  }
  return page.evaluate(async ({ targetUrl, body, csrfToken }) => {
    const response = await fetch(targetUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      contentType: response.headers.get('content-type') || '',
      text: text.slice(0, 2000),
      json
    };
  }, { targetUrl: url(route), body: payload.toString(), csrfToken: csrf.token });
}

async function fetchJson(page, route) {
  return page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl, {
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      contentType: response.headers.get('content-type') || '',
      text: text.slice(0, 2000),
      json
    };
  }, url(route));
}

async function screenshot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => null);
  return file;
}

async function loginAs(browser, userId, label) {
  const context = await browser.newContext({
    storageState: adminStorageState,
    viewport: { width: 1365, height: 900 }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(Math.min(timeoutMs, 30000));
  await page.goto(url(`/en/admin/user/info?id=${userId}`), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  const loginAsLink = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) =>
      /login-as-user/i.test(candidate.getAttribute('href') || '') ||
      /Login as user/i.test(candidate.textContent || '')
    );
    return {
      href: link?.href || '',
      text: (link?.textContent || '').replace(/\s+/g, ' ').trim(),
      method: link?.getAttribute('data-method') || ''
    };
  });
  if (!loginAsLink.href || loginAsLink.method.toLowerCase() !== 'post') {
    throw new Error(`${label}: login-as POST link not found for user ${userId}: ${JSON.stringify(loginAsLink)}`);
  }
  const csrf = await getCsrf(page);
  const loginResult = await page.evaluate(async ({ href, csrfParam, csrfToken }) => {
    const body = new URLSearchParams();
    if (csrfToken) {
      body.set(csrfParam, csrfToken);
    }
    const response = await fetch(href, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-CSRF-Token': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: body.toString(),
      redirect: 'manual'
    });
    return {
      status: response.status,
      url: response.url,
      location: response.headers.get('location') || ''
    };
  }, { href: loginAsLink.href, csrfParam: csrf.param, csrfToken: csrf.token });
  await page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await page.waitForTimeout(1200);
  const identity = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    bodyText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 1200),
    adminLinkSeen: [...document.querySelectorAll('a[href]')].some((a) => /\/en\/admin/.test(a.href))
  }));
  return {
    context,
    page,
    evidence: {
      label,
      userId,
      loginAsLink,
      loginResult,
      identity,
      screenshot: await screenshot(page, `${label}-messages-home`)
    }
  };
}

function findMessage(messagesResponse, marker) {
  const rawMessages = messagesResponse?.json?.messages || [];
  const messages = Array.isArray(rawMessages) ? rawMessages : Object.values(rawMessages);
  return messages.find((message) => {
    const haystack = JSON.stringify(message);
    return haystack.includes(marker);
  }) || null;
}

async function uploadImage(page, targetUserId, filePath) {
  const csrf = await getCsrf(page);
  return page.request.post(url('/en/messages/upload-images'), {
    headers: {
      'X-CSRF-Token': csrf.token || '',
      'X-Requested-With': 'XMLHttpRequest'
    },
    multipart: {
      [csrf.param]: csrf.token || '',
      contactId: String(targetUserId),
      message: attachmentMessage,
      'files[]': {
        name: path.basename(filePath),
        mimeType: 'image/png',
        buffer: fs.readFileSync(filePath)
      }
    }
  }).then(async (response) => {
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return {
      ok: response.ok(),
      status: response.status(),
      contentType: response.headers()['content-type'] || '',
      text: text.slice(0, 2000),
      json
    };
  });
}

const result = {
  runId,
  startedAt: new Date().toISOString(),
  finishedAt: '',
  baseURL,
  users: { senderId, recipientId },
  messages: { textMessage, attachmentMessage },
  status: 'UNKNOWN',
  verdicts: [],
  evidence: {},
  screenshots: {},
  raw: {}
};

const browser = await chromium.launch({ headless: true });

try {
  const sender = await loginAs(browser, senderId, 'sender');
  result.evidence.senderLogin = sender.evidence;

  const sendText = await postForm(sender.page, '/en/messages/create', {
    contactId: recipientId,
    message: textMessage,
    pendingMessageId: `qa-${Date.now()}`
  });
  result.raw.sendText = sendText;
  const messageId = sendText?.json?.messageId || null;
  if (!sendText?.json?.success || !messageId) {
    throw new Error(`Text message create failed: ${JSON.stringify(sendText)}`);
  }
  result.verdicts.push({
    id: 'CHAT-TEXT-SEND',
    status: 'PASS',
    title: 'Отправка текстового сообщения',
    actual: `POST /en/messages/create вернул success=true, messageId=${messageId}.`,
    expected: 'Сообщение создается без UI/HTTP ошибки.'
  });

  const senderThreadAfterSend = await fetchJson(sender.page, `/en/messages/messages?contactId=${recipientId}`);
  result.raw.senderThreadAfterSend = senderThreadAfterSend;
  result.evidence.senderTextFound = Boolean(findMessage(senderThreadAfterSend, textMessage));
  await sender.page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await sender.page.waitForTimeout(1200);
  result.screenshots.senderAfterSend = await screenshot(sender.page, 'sender-after-text-send');

  const recipient = await loginAs(browser, recipientId, 'recipient');
  result.evidence.recipientLogin = recipient.evidence;

  const countersBeforeRead = await fetchJson(recipient.page, '/en/messages/new-messages-counters');
  const recipientThreadBeforeRead = await fetchJson(recipient.page, `/en/messages/messages?contactId=${senderId}`);
  const recipientFoundBeforeRead = Boolean(findMessage(recipientThreadBeforeRead, textMessage));
  result.raw.countersBeforeRead = countersBeforeRead;
  result.raw.recipientThreadBeforeRead = recipientThreadBeforeRead;
  result.evidence.recipientTextFoundBeforeRead = recipientFoundBeforeRead;
  await recipient.page.goto(url('/en/messages'), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  await recipient.page.waitForTimeout(1200);
  result.screenshots.recipientBeforeRead = await screenshot(recipient.page, 'recipient-before-read');

  result.verdicts.push({
    id: 'CHAT-RECIPIENT-DELIVERY',
    status: recipientFoundBeforeRead ? 'PASS' : 'FAIL',
    title: 'Доставка получателю',
    actual: recipientFoundBeforeRead
      ? 'Получатель U2 видит точный текст в /en/messages/messages.'
      : 'Получатель U2 не видит точный текст в /en/messages/messages.',
    expected: 'После успешной отправки U2 должен видеть новое сообщение.'
  });

  const readResponse = await postForm(recipient.page, '/en/messages/read-conversation', { contactId: senderId });
  const countersAfterRead = await fetchJson(recipient.page, '/en/messages/new-messages-counters');
  result.raw.readResponse = readResponse;
  result.raw.countersAfterRead = countersAfterRead;
  result.verdicts.push({
    id: 'CHAT-READ-CONVERSATION',
    status: readResponse?.json?.success ? 'PASS' : 'FAIL',
    title: 'Read conversation endpoint',
    actual: `POST /en/messages/read-conversation вернул ${JSON.stringify(readResponse?.json || readResponse).slice(0, 400)}.`,
    expected: 'Endpoint должен успешно пометить диалог прочитанным и сбросить счетчики.'
  });

  const imagePath = process.env.QA_ATTACHMENT_IMAGE && fs.existsSync(process.env.QA_ATTACHMENT_IMAGE)
    ? process.env.QA_ATTACHMENT_IMAGE
    : path.join(outDir, 'qa-message-attachment.png');
  if (imagePath.startsWith(outDir)) {
    writePngFixture(imagePath);
  }
  const uploadResponse = await uploadImage(sender.page, recipientId, imagePath);
  result.raw.uploadResponse = uploadResponse;
  const recipientThreadAfterUpload = await fetchJson(recipient.page, `/en/messages/messages?contactId=${senderId}`);
  result.raw.recipientThreadAfterUpload = recipientThreadAfterUpload;
  const uploadAccepted = Boolean(uploadResponse?.json?.success);
  const attachmentSeenByRecipient = /attachment|attachments|qa-message-attachment|type/i.test(JSON.stringify(recipientThreadAfterUpload?.json || {}));
  result.evidence.uploadAccepted = uploadAccepted;
  result.evidence.attachmentSeenByRecipient = attachmentSeenByRecipient;
  result.screenshots.recipientAfterUpload = await screenshot(recipient.page, 'recipient-after-image-upload');
  result.verdicts.push({
    id: 'CHAT-IMAGE-UPLOAD',
    status: uploadAccepted && attachmentSeenByRecipient ? 'PASS' : uploadAccepted ? 'WARN' : 'FAIL',
    title: 'Загрузка изображения в чат',
    actual: uploadAccepted
      ? `upload-images вернул success=true; recipient thread содержит признаки attachment=${attachmentSeenByRecipient}.`
      : `upload-images не подтвердил success: ${JSON.stringify(uploadResponse).slice(0, 400)}.`,
    expected: 'Изображение должно создаться как сообщение-вложение и быть видно получателю.'
  });

  const deleteResponse = await postForm(sender.page, '/en/messages/delete', { 'messages[]': [messageId] });
  result.raw.deleteResponse = deleteResponse;
  const senderThreadAfterDelete = await fetchJson(sender.page, `/en/messages/messages?contactId=${recipientId}`);
  const recipientThreadAfterSenderDelete = await fetchJson(recipient.page, `/en/messages/messages?contactId=${senderId}`);
  const senderStillSeesDeletedText = Boolean(findMessage(senderThreadAfterDelete, textMessage));
  const recipientStillSeesDeletedText = Boolean(findMessage(recipientThreadAfterSenderDelete, textMessage));
  result.raw.senderThreadAfterDelete = senderThreadAfterDelete;
  result.raw.recipientThreadAfterSenderDelete = recipientThreadAfterSenderDelete;
  result.evidence.senderStillSeesDeletedText = senderStillSeesDeletedText;
  result.evidence.recipientStillSeesDeletedText = recipientStillSeesDeletedText;
  result.screenshots.senderAfterDelete = await screenshot(sender.page, 'sender-after-delete');
  result.screenshots.recipientAfterSenderDelete = await screenshot(recipient.page, 'recipient-after-sender-delete');

  result.verdicts.push({
    id: 'CHAT-SENDER-DELETE',
    status: deleteResponse?.json?.success && !senderStillSeesDeletedText ? 'PASS' : 'FAIL',
    title: 'Удаление сообщения отправителем',
    actual: deleteResponse?.json?.success
      ? `delete success=true; sender sees deleted text=${senderStillSeesDeletedText}; recipient sees deleted text=${recipientStillSeesDeletedText}.`
      : `delete не подтвердил success: ${JSON.stringify(deleteResponse).slice(0, 400)}.`,
    expected: 'По коду Yii2 deleteMessages удаляет сообщение только для текущей стороны; у отправителя текст должен исчезнуть, у получателя может остаться.'
  });

  await sender.context.close();
  await recipient.context.close();

  const hasFail = result.verdicts.some((verdict) => verdict.status === 'FAIL');
  const hasWarn = result.verdicts.some((verdict) => verdict.status === 'WARN');
  result.status = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.error = {
    message: error.message,
    stack: error.stack
  };
} finally {
  result.finishedAt = new Date().toISOString();
  await browser.close().catch(() => null);
  fs.writeFileSync(path.join(outDir, 'messages-thread-lifecycle-recheck.json'), JSON.stringify(result, null, 2), 'utf8');
  const md = [
    '# Messages Thread Lifecycle Recheck',
    '',
    `- Status: ${result.status}`,
    `- Sender: U${senderId}`,
    `- Recipient: U${recipientId}`,
    `- Text: ${textMessage}`,
    '',
    '## Verdicts',
    '',
    ...result.verdicts.map((verdict) => `- ${verdict.status}: ${verdict.id} - ${verdict.actual}`),
    '',
    result.error ? `## Error\n\n${result.error.message}\n` : ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'messages-thread-lifecycle-recheck.md'), md, 'utf8');
}

console.log(JSON.stringify({
  status: result.status,
  outDir,
  verdicts: result.verdicts.map(({ id, status }) => ({ id, status })),
  error: result.error?.message || null
}, null, 2));
