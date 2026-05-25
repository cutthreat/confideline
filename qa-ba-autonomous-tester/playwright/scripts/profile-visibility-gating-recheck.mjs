import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const profileUrl = process.env.PROFILE_URL || 'https://confideline.com/ru/profile/OmkarTiwari';
const dashboardUrl = process.env.AUTH_CHECK_URL || 'https://confideline.com/en/dashboard';
const settingsUrl = process.env.SETTINGS_URL || 'https://confideline.com/en/admin/settings/index';
const storageStatePath = process.env.AUTH_STORAGE_STATE ||
  path.resolve('../secrets/admin-storage-state.super-admin.json');
const outDir = process.env.OUT_DIR ||
  path.resolve('../reports/profile-visibility-gating-recheck');

function textSnippet(value, limit = 900) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

async function capturePage(page, url, screenshotName) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null);
  await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true }).catch(() => null);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  return {
    requestedUrl: url,
    finalUrl: page.url(),
    status: response?.status() ?? null,
    title: await page.title().catch(() => ''),
    bodySnippet: textSnippet(bodyText),
  };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  const guestProfile = await capturePage(guestPage, profileUrl, 'guest-profile.png');
  await guestContext.close();

  let authState = {
    storageStatePath,
    exists: fs.existsSync(storageStatePath),
    valid: false,
    reason: 'storage state is missing',
  };
  let authenticatedProfile = null;
  let settingsReadback = null;

  if (authState.exists) {
    const authContext = await browser.newContext({ storageState: storageStatePath });
    const authPage = await authContext.newPage();
    const authCheck = await capturePage(authPage, dashboardUrl, 'auth-check.png');
    authState = {
      ...authState,
      valid: !/\/login\b/i.test(authCheck.finalUrl) && authCheck.status !== 401 && authCheck.status !== 403,
      reason: /\/login\b/i.test(authCheck.finalUrl) ? 'auth check redirected to login' : 'auth check did not redirect to login',
      check: authCheck,
    };

    if (authState.valid) {
      authenticatedProfile = await capturePage(authPage, profileUrl, 'authenticated-profile.png');
      settingsReadback = await capturePage(authPage, settingsUrl, 'admin-settings.png');
      const settingsText = await authPage.locator('body').innerText().catch(() => '');
      settingsReadback.hasProfileGuestSetting =
        /Hide user profiles from guests|Settings\[siteHideUsersFromGuests\]|siteHideUsersFromGuests/i.test(settingsText);
    }

    await authContext.close();
  }

  await browser.close();

  const verdict = authState.valid
    ? (
        authenticatedProfile?.status === 200
          ? 'EXPECTED_GUEST_GATING_OR_GUEST_ERROR_HANDLING_RECHECK'
          : 'CONFIRMED_AUTHENTICATED_PROFILE_FAILURE'
      )
    : 'RETEST_AUTH_STATE_REQUIRED';

  const report = {
    generatedAt: new Date().toISOString(),
    rule: 'For public profile/directory failures, compare guest vs authenticated profile first; only then classify product gating vs runtime defect.',
    profileUrl,
    dashboardUrl,
    settingsUrl,
    verdict,
    guestProfile,
    authState,
    authenticatedProfile,
    settingsReadback,
    codeSettingAlias: 'frontend.siteHideUsersFromGuests',
    screenshots: {
      guestProfile: path.join(outDir, 'guest-profile.png'),
      authCheck: path.join(outDir, 'auth-check.png'),
      authenticatedProfile: authenticatedProfile ? path.join(outDir, 'authenticated-profile.png') : null,
      adminSettings: settingsReadback ? path.join(outDir, 'admin-settings.png') : null,
    },
  };

  fs.writeFileSync(path.join(outDir, 'profile-visibility-gating-recheck.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
