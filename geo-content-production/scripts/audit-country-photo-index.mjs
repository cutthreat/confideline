import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const confidelineRoot = path.resolve(scriptDir, '..', '..');
const panelRoot = path.join(confidelineRoot, 'web', 'geo-content-panel');
const manifestPath = path.join(panelRoot, 'manifest.json');
const driveIndexPath = path.join(panelRoot, 'drive-photo-index.json');
const reportRoot = path.join(confidelineRoot, 'reports', 'geo-country-photo-audit');
const reportJsonPath = path.join(reportRoot, 'country-photo-audit.json');
const reportCsvPath = path.join(reportRoot, 'country-photo-audit.csv');
const panelJsonPath = path.join(panelRoot, 'country-photo-audit.json');
const panelCsvPath = path.join(panelRoot, 'country-photo-audit.csv');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function driveFolderId(url) {
  return String(url || '').match(/\/folders\/([^/?#]+)/)?.[1] || '';
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  });
  return {
    ok: response.ok,
    status: response.status,
    text: response.ok ? await response.text() : ''
  };
}

async function checkUrl(url) {
  if (!url) return { ok: false, status: 0 };
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

function driveFileViewUrl(id) {
  return `https://drive.google.com/file/d/${id}/view`;
}

function parseDriveEntries(html) {
  const starts = [];
  const entryRe = /\[\[null,&quot;([^&]+)&quot;\],null,null,null,&quot;([^&]+)&quot;/g;
  let match;
  while ((match = entryRe.exec(html))) {
    starts.push({
      id: match[1],
      mimeType: match[2],
      index: match.index
    });
  }

  const entries = starts.map((entry, index) => {
    const block = html.slice(entry.index, starts[index + 1]?.index || html.length);
    const names = Array.from(block.matchAll(/\[\[\[&quot;([^&]*)&quot;(?:,null,true)?\]\]\]/g))
      .map((nameMatch) => nameMatch[1])
      .filter((name) => name && name !== '-')
      .filter((name) => !['Modified', 'Size not available', 'Image', 'Shared folder', 'Shared'].includes(name))
      .filter((name) => !/^\d+ MB$/.test(name))
      .filter((name) => !/^\d{2}-\d{2}$/.test(name));

    return {
      id: entry.id,
      mimeType: entry.mimeType,
      title: names[0] || ''
    };
  });

  const byId = new Map();
  for (const entry of entries) {
    if (!byId.has(entry.id) && entry.title) {
      byId.set(entry.id, entry);
    }
  }
  return Array.from(byId.values());
}

async function collectImagesFromFolder(folderId, depth = 0) {
  const response = await fetchText(`https://drive.google.com/drive/folders/${folderId}`);
  if (!response.ok) {
    return {
      folderFetchOk: false,
      folderStatus: response.status,
      folderEntries: 0,
      photos: []
    };
  }

  const entries = parseDriveEntries(response.text);
  const photos = entries
    .filter((entry) => entry.mimeType.startsWith('image/'))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      mimeType: entry.mimeType,
      viewUrl: driveFileViewUrl(entry.id)
    }));

  if (photos.length >= 2 || depth >= 1) {
    return {
      folderFetchOk: true,
      folderStatus: response.status,
      folderEntries: entries.length,
      photos: photos.slice(0, 2)
    };
  }

  for (const child of entries.filter((entry) => entry.mimeType === 'application/vnd.google-apps.folder')) {
    const childResult = await collectImagesFromFolder(child.id, depth + 1);
    photos.push(...childResult.photos);
    if (photos.length >= 2) break;
  }

  return {
    folderFetchOk: true,
    folderStatus: response.status,
    folderEntries: entries.length,
    photos: photos.slice(0, 2)
  };
}

function classify(row) {
  if (row.panelPhotoCount >= 2 && row.freshPhotoCount >= 2 && row.fileLinksOk >= 2) return 'ok_confirmed';
  if (row.panelPhotoCount < 2 && row.freshPhotoCount >= 2) return 'panel_missed_drive_photos';
  if (row.panelPhotoCount >= 2 && row.freshPhotoCount < 2 && row.fileLinksOk >= 2) return 'preserved_links_confirmed';
  if (row.panelPhotoCount >= 2 && row.fileLinksOk < 2) return 'panel_has_broken_photo_link';
  if (!row.folderUrl) return 'no_drive_folder';
  if (row.folderFetchOk && row.freshPhotoCount < 2) return 'drive_folder_missing_photos';
  return 'drive_folder_fetch_failed';
}

async function auditCountry(item, driveEntry) {
  const folderUrl = item.photos?.folderUrl || driveEntry?.photoFolderUrl || '';
  const folderId = driveFolderId(folderUrl);
  const panelPhotos = [item.photos?.photo1, item.photos?.photo2].filter(Boolean);
  const fileChecks = await Promise.all(panelPhotos.map((photo) => checkUrl(photo.viewUrl)));

  let folderFetchOk = false;
  let folderStatus = 0;
  let freshPhotos = [];
  let folderEntries = 0;
  if (folderId) {
    const folderResult = await collectImagesFromFolder(folderId);
    folderFetchOk = folderResult.folderFetchOk;
    folderStatus = folderResult.folderStatus;
    folderEntries = folderResult.folderEntries;
    freshPhotos = folderResult.photos;
  }

  const row = {
    slug: item.slug,
    name: item.name,
    statusInPanel: item.overallStatus,
    folderUrl,
    folderFetchOk,
    folderStatus,
    folderEntries,
    panelPhotoCount: panelPhotos.length,
    freshPhotoCount: freshPhotos.length,
    fileLinksOk: fileChecks.filter((check) => check.ok).length,
    panelPhoto1: item.photos?.photo1?.title || '',
    panelPhoto2: item.photos?.photo2?.title || '',
    freshPhoto1: freshPhotos[0]?.title || '',
    freshPhoto2: freshPhotos[1]?.title || '',
    adminUrl: item.admin?.url || '',
    publicUrl: item.publicUrl || ''
  };
  row.auditStatus = classify(row);
  return row;
}

function buildCsv(rows) {
  const header = [
    'slug', 'name', 'audit_status', 'panel_status',
    'panel_photo_count', 'fresh_drive_photo_count', 'file_links_ok',
    'folder_fetch_ok', 'folder_status', 'folder_entries',
    'folder_url', 'panel_photo_1', 'panel_photo_2', 'fresh_photo_1', 'fresh_photo_2',
    'admin_url', 'public_url'
  ];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push([
      row.slug,
      row.name,
      row.auditStatus,
      row.statusInPanel,
      row.panelPhotoCount,
      row.freshPhotoCount,
      row.fileLinksOk,
      row.folderFetchOk ? '1' : '0',
      row.folderStatus,
      row.folderEntries,
      row.folderUrl,
      row.panelPhoto1,
      row.panelPhoto2,
      row.freshPhoto1,
      row.freshPhoto2,
      row.adminUrl,
      row.publicUrl
    ].map(csvEscape).join(','));
  }
  return `${lines.join('\n')}\n`;
}

const manifest = readJson(manifestPath);
const driveIndex = fs.existsSync(driveIndexPath) ? readJson(driveIndexPath) : { countries: {} };
const countries = manifest.items.filter((item) => item.type === 'country');
const rows = [];
for (const item of countries) {
  rows.push(await auditCountry(item, driveIndex.countries?.[item.slug]));
}

const summary = {
  generated: new Date().toISOString(),
  countries: rows.length,
  okConfirmed: rows.filter((row) => row.auditStatus === 'ok_confirmed').length,
  preservedLinksConfirmed: rows.filter((row) => row.auditStatus === 'preserved_links_confirmed').length,
  panelMissedDrivePhotos: rows.filter((row) => row.auditStatus === 'panel_missed_drive_photos').length,
  brokenPhotoLinks: rows.filter((row) => row.auditStatus === 'panel_has_broken_photo_link').length,
  driveFolderMissingPhotos: rows.filter((row) => row.auditStatus === 'drive_folder_missing_photos').length,
  noDriveFolder: rows.filter((row) => row.auditStatus === 'no_drive_folder').length,
  driveFolderFetchFailed: rows.filter((row) => row.auditStatus === 'drive_folder_fetch_failed').length
};

const report = { summary, rows };
fs.mkdirSync(reportRoot, { recursive: true });
fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(reportCsvPath, buildCsv(rows), 'utf8');
fs.writeFileSync(panelJsonPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(panelCsvPath, buildCsv(rows), 'utf8');

console.log(JSON.stringify({
  status: summary.panelMissedDrivePhotos === 0 && summary.brokenPhotoLinks === 0 && summary.driveFolderFetchFailed === 0 ? 'PASS' : 'CHECK',
  reportJsonPath,
  reportCsvPath,
  panelJsonPath,
  panelCsvPath,
  summary
}, null, 2));
