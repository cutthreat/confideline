import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.env.CONFIDELINE_PROJECT_ROOT || path.resolve(scriptDir, '..', '..');

function findWorkspaceRoot(startDir) {
  let current = path.resolve(startDir);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, '.ops'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return 'H:\\GPT-Codex';
}

function firstExistingPath(...candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

const workspaceRoot = process.env.WORKSPACE_ROOT || findWorkspaceRoot(projectRoot);
const canonicalConfidelineRoot = path.join(workspaceRoot, 'Confideline');
const sourceRoot = path.join(workspaceRoot, '.ops', 'content-packages', 'all-locations');
const panelRoot = path.join(projectRoot, 'web', 'geo-content-panel');
const panelFilesRoot = path.join(panelRoot, 'files');
const cssPath = path.join(projectRoot, 'web', 'css', 'geo-content-panel.css');
const jsPath = path.join(projectRoot, 'web', 'js', 'geo-content-panel.js');
const photoIndexPath = path.join(projectRoot, 'geo-content-production', 'drive-photo-index.json');
const batchStatusPath = path.join(projectRoot, 'reports', 'geo-source-rewrite-batch', 'batch-status.json');
const pageListPath = firstExistingPath(
  path.join(projectRoot, 'geo-content-production', 'queue', 'page-list.csv'),
  path.join(canonicalConfidelineRoot, 'geo-content-production', 'queue', 'page-list.csv')
);
const countryVerifyCsvPath = firstExistingPath(
  path.join(projectRoot, 'reports', 'geo-countries-bulk-fill', 'bulk-verify-country-content-result.csv'),
  path.join(canonicalConfidelineRoot, 'reports', 'geo-countries-bulk-fill', 'bulk-verify-country-content-result.csv')
);
const cityVerifyCsvCandidates = [
  path.join(projectRoot, 'reports', 'geo-cities-bulk-fill', 'bulk-verify-city-content-result.csv'),
  path.join(canonicalConfidelineRoot, 'reports', 'geo-cities-bulk-fill', 'bulk-verify-city-content-result.csv'),
  path.join(projectRoot, 'reports', 'geo-geonames-bulk-fill', 'bulk-verify-geoname-content-result.csv'),
  path.join(canonicalConfidelineRoot, 'reports', 'geo-geonames-bulk-fill', 'bulk-verify-geoname-content-result.csv'),
  path.join(projectRoot, 'reports', 'geo-geonames-bulk-fill', 'bulk-verify-city-content-result.csv'),
  path.join(canonicalConfidelineRoot, 'reports', 'geo-geonames-bulk-fill', 'bulk-verify-city-content-result.csv')
];
const countryLiveMapPath = firstExistingPath(
  path.join(projectRoot, 'reports', 'geo-countries-bulk-fill', 'live-country-id-map.json'),
  path.join(canonicalConfidelineRoot, 'reports', 'geo-countries-bulk-fill', 'live-country-id-map.json')
);
const countriesSqlPath = firstExistingPath(
  path.join(projectRoot, 'Chat', 'youdate-2.0.2-yii2', 'Source', 'countries.sql'),
  path.join(canonicalConfidelineRoot, 'Chat', 'youdate-2.0.2-yii2', 'Source', 'countries.sql')
);
const geodataSqlPath = firstExistingPath(
  path.join(projectRoot, 'Chat', 'youdate-2.0.2-yii2', 'Source', 'geodata.sql'),
  path.join(canonicalConfidelineRoot, 'Chat', 'youdate-2.0.2-yii2', 'Source', 'geodata.sql')
);

const cmsBase = 'https://confideline.com/ru/admin';
const publicBase = 'https://confideline.com';
const locales = [
  { packageLocale: 'ru-ru', cmsLocale: 'ru-RU', label: 'RU' },
  { packageLocale: 'en-us', cmsLocale: 'en-US', label: 'EN' },
  { packageLocale: 'es-es', cmsLocale: 'es-ES', label: 'ES' },
  { packageLocale: 'it-it', cmsLocale: 'it-IT', label: 'IT' },
  { packageLocale: 'de-de', cmsLocale: 'de-DE', label: 'DE' },
  { packageLocale: 'pt-br', cmsLocale: 'pt-BR', label: 'PT-BR' }
];

const serviceParagraphPatterns = [
  /<p>Такой подход делает страницу полезной[\s\S]*?<\/p>\r?\n?/gi,
  /<p>This structure makes the page useful[\s\S]*?<\/p>\r?\n?/gi,
  /<p>Esta estructura hace que la página[\s\S]*?<\/p>\r?\n?/gi,
  /<p>Questa struttura rende la pagina[\s\S]*?<\/p>\r?\n?/gi,
  /<p>Diese Struktur macht die Seite[\s\S]*?<\/p>\r?\n?/gi,
  /<p>Essa estrutura deixa a página[\s\S]*?<\/p>\r?\n?/gi
];

const countrySlugAliases = new Map([
  ['czech-republic', 'czechia'],
  ['united-states', 'united-states'],
  ['south-korea', 'south-korea']
]);

const cityNameSlugAliases = new Map([
  ['new-york', 'city-of-new-york'],
  ['geneva', 'geneve'],
  ['cologne', 'koln'],
  ['frankfurt', 'frankfurt-am-main'],
  ['odesa', 'odessa'],
  ['rostov-on-don', 'rostov-na-donu'],
  ['seville', 'sevilla'],
  ['bangalore', 'bengaluru'],
  ['bali', 'provinsi-bali'],
  ['monte-carlo', 'monte-carlo-spelugues'],
  ['wroclaw', 'wroclaw'],
  ['grodno', 'hrodna']
]);

const citySlugsWithoutSeparateCmsRecord = new Set([
]);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
}

function readUtf8IfExists(filePath) {
  return fs.existsSync(filePath) ? readUtf8(filePath) : '';
}

function readJsonIfExists(filePath, fallback = null) {
  return fs.existsSync(filePath) ? JSON.parse(readUtf8(filePath)) : fallback;
}

function writeUtf8(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function debugStep(label) {
  if (process.env.GEO_PANEL_DEBUG === '1') {
    console.error(`[geo-panel] ${new Date().toISOString()} ${label}`);
  }
}

function slugifyTitle(title) {
  return String(title || '')
    .replace(/_Astro$/i, '')
    .replace(/[Łł]/g, 'l')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, ''));
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

function cleanContent(content) {
  let cleaned = content;
  for (const pattern of serviceParagraphPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.replace(/\r?\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function listDirectories(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function loadManifestOrder() {
  const manifestPath = path.join(sourceRoot, 'manifest.csv');
  const rows = parseCsv(readUtf8(manifestPath)).map((row) => ({
    type: row.Type,
    name: row.Name,
    slug: row.Slug
  }));
  return {
    country: rows.filter((row) => row.type === 'country'),
    city: rows.filter((row) => row.type === 'city')
  };
}

function loadPageList() {
  if (!fs.existsSync(pageListPath)) return new Map();
  const rows = parseCsv(readUtf8(pageListPath));
  const bySlug = new Map();
  for (const row of rows) {
    bySlug.set(row.slug, {
      type: row.page_type,
      slug: row.slug,
      country: row.country,
      city: row.city,
      sourceDriveTitle: row.source_drive_title,
      sourceDriveUrl: row.source_drive_url,
      photoDriveUrl: row.photo_drive_url,
      notes: row.notes
    });
  }
  return bySlug;
}

function normalizeItems(type, baseDir, manifestItems, pageList) {
  const slugs = new Set(listDirectories(baseDir));
  const fromManifest = manifestItems
    .filter((item) => slugs.has(item.slug))
    .map((item) => ({
      ...item,
      type,
      country: pageList.get(item.slug)?.country || (type === 'country' ? item.name : ''),
      sourceDriveTitle: pageList.get(item.slug)?.sourceDriveTitle || '',
      sourceDriveUrl: pageList.get(item.slug)?.sourceDriveUrl || '',
      notes: pageList.get(item.slug)?.notes || ''
    }));

  const covered = new Set(fromManifest.map((item) => item.slug));
  const remaining = [...slugs]
    .filter((slug) => !covered.has(slug))
    .sort((a, b) => a.localeCompare(b))
    .map((slug) => ({
      type,
      name: pageList.get(slug)?.city || pageList.get(slug)?.country || slug.replace(/-/g, ' '),
      slug,
      country: pageList.get(slug)?.country || '',
      sourceDriveTitle: pageList.get(slug)?.sourceDriveTitle || '',
      sourceDriveUrl: pageList.get(slug)?.sourceDriveUrl || '',
      notes: pageList.get(slug)?.notes || ''
    }));

  return [...fromManifest, ...remaining];
}

function sanitizeSourceAndCopy(items, typePlural) {
  let cleanedCount = 0;
  let copiedCount = 0;
  for (const item of items) {
    const sourceDir = path.join(sourceRoot, typePlural, item.slug);
    const targetDir = path.join(panelFilesRoot, typePlural, item.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    for (const fileName of fs.readdirSync(sourceDir)) {
      if (!fileName.endsWith('.txt')) continue;
      const sourcePath = path.join(sourceDir, fileName);
      const original = readUtf8(sourcePath);
      const cleaned = cleanContent(original);
      if (cleaned !== original) {
        fs.writeFileSync(sourcePath, cleaned, 'utf8');
        cleanedCount += 1;
      }
      writeUtf8(path.join(targetDir, fileName), cleaned);
      copiedCount += 1;
    }
  }
  return { cleanedCount, copiedCount };
}

function fileLink(typePlural, slug, fileName) {
  return `./files/${typePlural}/${encodeURIComponent(slug)}/${encodeURIComponent(fileName)}`;
}

function loadVerifyStatuses(csvPath) {
  if (!csvPath || !fs.existsSync(csvPath)) return { found: false, bySlugLocale: new Map(), path: csvPath || '' };
  const rows = parseCsv(readUtf8(csvPath));
  const bySlugLocale = new Map();
  for (const row of rows) {
    const slug = row.slug || row.Slug;
    const locale = row.locale || row.Locale;
    if (!slug || !locale) continue;
    bySlugLocale.set(`${slug}:${locale}`, row);
  }
  return { found: true, bySlugLocale, path: csvPath };
}

function loadCityVerifyStatuses() {
  const foundPath = cityVerifyCsvCandidates.find((candidate) => fs.existsSync(candidate));
  return loadVerifyStatuses(foundPath || '');
}

function loadCountryIdMap() {
  const result = new Map();
  if (!fs.existsSync(countryLiveMapPath)) return result;
  const data = JSON.parse(readUtf8(countryLiveMapPath));
  for (const row of data.rows || []) {
    const liveSlug = slugifyTitle(row.name);
    result.set(liveSlug, row);
  }
  return result;
}

function loadCountryCodeMap() {
  const text = readUtf8IfExists(countriesSqlPath);
  const result = new Map();
  const regex = /\('([A-Z]{2})','((?:\\'|[^'])*)',(\d+)\)/g;
  let match;
  while ((match = regex.exec(text))) {
    const name = match[2].replace(/\\'/g, "'");
    result.set(slugifyTitle(name), match[1]);
  }
  result.set('united-states', 'US');
  result.set('south-korea', 'KR');
  result.set('czech-republic', 'CZ');
  return result;
}

function loadCityIdMap(cities, countryCodeBySlug) {
  const result = new Map();
  if (!fs.existsSync(geodataSqlPath)) return result;

  const targetsByName = new Map();
  for (const city of cities) {
    const countrySlug = slugifyTitle(city.country);
    const directSlug = slugifyTitle(city.name);
    const target = {
      city,
      nameSlug: cityNameSlugAliases.get(city.slug) || cityNameSlugAliases.get(directSlug) || directSlug,
      countryCode: countryCodeBySlug.get(countrySlug) || ''
    };
    const list = targetsByName.get(target.nameSlug) || [];
    list.push(target);
    targetsByName.set(target.nameSlug, list);
  }

  const text = readUtf8(geodataSqlPath);
  const regex = /\((\d+),'((?:\\'|[^'])*)',[-0-9.]+,[-0-9.]+,'([PA])','([^']+)','([A-Z]{2})',(\d+),/g;
  let match;
  while ((match = regex.exec(text))) {
    const geonameId = match[1];
    const name = match[2].replace(/\\'/g, "'");
    const featureClass = match[3];
    const featureCode = match[4];
    const countryCode = match[5];
    const population = Number.parseInt(match[6] || '0', 10);
    const nameSlug = slugifyTitle(name);
    const targets = targetsByName.get(nameSlug);
    if (!targets) continue;

    for (const target of targets) {
      if (target.countryCode && target.countryCode !== countryCode) continue;
      const slug = target.city.slug;
      const current = result.get(slug);
      const rank = {
        featureClassRank: featureClass === 'P' ? 2 : 1,
        featureCodeRank: featureCode === 'PPLC' ? 5 : featureCode === 'PPLA' ? 4 : featureCode === 'PPLA2' ? 3 : featureCode === 'PPL' ? 2 : 1,
        population
      };
      const better = !current
        || rank.featureClassRank > current.rank.featureClassRank
        || (rank.featureClassRank === current.rank.featureClassRank && rank.featureCodeRank > current.rank.featureCodeRank)
        || (rank.featureClassRank === current.rank.featureClassRank && rank.featureCodeRank === current.rank.featureCodeRank && population > current.population);
      if (better) {
        result.set(slug, { id: geonameId, name, countryCode, population, featureClass, featureCode, rank });
      }
    }
  }
  return result;
}

function getPhotoEntry(item, typePlural, photoIndex) {
  return photoIndex?.[typePlural]?.[item.slug] || null;
}

function buildAdminLink(item, countryIdMap, cityIdMap) {
  if (item.type === 'country') {
    const lookupSlug = countrySlugAliases.get(item.slug) || item.slug;
    const live = countryIdMap.get(lookupSlug) || countryIdMap.get(item.slug);
    return {
      id: live?.id || '',
      url: live?.href || `${cmsBase}/country/index`,
      label: live?.id ? 'Открыть страну' : 'Список стран',
      direct: Boolean(live?.id)
    };
  }
  if (citySlugsWithoutSeparateCmsRecord.has(item.slug)) {
    return {
      id: '',
      url: `${cmsBase}/geoname/index`,
      label: 'Список городов',
      direct: false
    };
  }
  const city = cityIdMap.get(item.slug);
  return {
    id: city?.id || '',
    url: city?.id ? `${cmsBase}/geoname/update?id=${encodeURIComponent(city.id)}` : `${cmsBase}/geoname/index`,
    label: city?.id ? 'Открыть город' : 'Список городов',
    direct: Boolean(city?.id)
  };
}

function buildPublicLink(item) {
  return item.type === 'country'
    ? `${publicBase}/country/${encodeURIComponent(item.slug)}`
    : `${publicBase}/city/${encodeURIComponent(item.slug)}`;
}

function buildPackageStatus(item, typePlural) {
  const dir = path.join(sourceRoot, typePlural, item.slug);
  const byLocale = {};
  let totalExisting = 0;
  for (const locale of locales) {
    const fields = `${item.slug}-${locale.packageLocale}-fields.txt`;
    const html = `${item.slug}-${locale.packageLocale}-html-description.txt`;
    const fieldsPath = path.join(dir, fields);
    const htmlPath = path.join(dir, html);
    const fieldsOk = fs.existsSync(fieldsPath) && fs.statSync(fieldsPath).size > 0;
    const htmlOk = fs.existsSync(htmlPath) && fs.statSync(htmlPath).size > 0;
    if (fieldsOk) totalExisting += 1;
    if (htmlOk) totalExisting += 1;
    byLocale[locale.packageLocale] = {
      fields,
      html,
      fieldsOk,
      htmlOk,
      ok: fieldsOk && htmlOk,
      fieldsLink: fileLink(typePlural, item.slug, fields),
      htmlLink: fileLink(typePlural, item.slug, html)
    };
  }
  return { ok: totalExisting === locales.length * 2, totalExisting, byLocale };
}

function buildUploadStatus(item, verifyStatuses) {
  const byLocale = {};
  let pass = 0;
  let fail = 0;
  let unknown = 0;
  for (const locale of locales) {
    const row = verifyStatuses.bySlugLocale.get(`${item.slug}:${locale.cmsLocale}`);
    if (!verifyStatuses.found || !row) {
      byLocale[locale.packageLocale] = {
        state: 'unknown',
        label: verifyStatuses.found ? 'нет в отчете' : 'не проверено',
        row: null
      };
      unknown += 1;
      continue;
    }
    const ok = String(row.status || '').toUpperCase() === 'PASS';
    byLocale[locale.packageLocale] = {
      state: ok ? 'pass' : 'fail',
      label: ok ? 'загружено' : 'ошибка',
      row
    };
    if (ok) pass += 1;
    else fail += 1;
  }
  return {
    sourcePath: verifyStatuses.path,
    sourceFound: verifyStatuses.found,
    allPass: pass === locales.length && fail === 0 && unknown === 0,
    pass,
    fail,
    unknown,
    byLocale
  };
}

function buildPhotoStatus(entry) {
  const photos = entry?.photos || [];
  return {
    folderUrl: entry?.photoFolderUrl || '',
    photos,
    ok: photos.length >= 2,
    missing: Math.max(0, 2 - photos.length),
    photo1: photos[0] || null,
    photo2: photos[1] || null
  };
}

function buildPageModel(item, typePlural, order, context) {
  const packageStatus = buildPackageStatus(item, typePlural);
  const uploadStatus = buildUploadStatus(
    item,
    item.type === 'country' ? context.countryVerifyStatuses : context.cityVerifyStatuses
  );
  const photoStatus = buildPhotoStatus(getPhotoEntry(item, typePlural, context.photoIndex));
  const admin = buildAdminLink(item, context.countryIdMap, context.cityIdMap);
  const publicUrl = buildPublicLink(item);
  const problems = [];
  if (!packageStatus.ok) problems.push(`TXT: есть ${packageStatus.totalExisting}/12`);
  if (!uploadStatus.allPass) {
    problems.push(uploadStatus.sourceFound ? `CMS: ${uploadStatus.pass}/6 языков PASS` : 'CMS: нет live-проверки');
  }
  if (!photoStatus.ok) problems.push(`Фото: нет ${photoStatus.missing}`);
  if (!admin.direct) problems.push('CMS: нет прямого ID');

  return {
    order,
    ...item,
    typePlural,
    packageStatus,
    uploadStatus,
    photoStatus,
    admin,
    publicUrl,
    overallOk: packageStatus.ok && uploadStatus.allPass && photoStatus.ok && admin.direct,
    problems
  };
}

function renderStatusDot(ok, label, tone = '') {
  const cls = ok ? 'is-ok' : tone === 'unknown' ? 'is-unknown' : 'is-bad';
  return `<span class="geo-cm-dot ${cls}"><span></span>${escapeHtml(label)}</span>`;
}

function renderLanguageRows(page) {
  return locales.map((locale) => {
    const packageLocale = page.packageStatus.byLocale[locale.packageLocale];
    const uploadLocale = page.uploadStatus.byLocale[locale.packageLocale];
    const uploadClass = uploadLocale.state === 'pass' ? 'is-ok' : uploadLocale.state === 'unknown' ? 'is-unknown' : 'is-bad';
    const packageClass = packageLocale.ok ? 'is-ok' : 'is-bad';
    return `
      <div class="geo-cm-lang-row">
        <span class="geo-cm-lang">${locale.label}</span>
        <span class="geo-cm-mini ${packageClass}">TXT</span>
        <span class="geo-cm-mini ${uploadClass}">${escapeHtml(uploadLocale.label)}</span>
        <a href="${escapeAttr(packageLocale.fieldsLink)}" target="_blank">fields</a>
        <a href="${escapeAttr(packageLocale.htmlLink)}" target="_blank">html</a>
      </div>`;
  }).join('');
}

function renderPhotos(page) {
  const { photoStatus } = page;
  const folderLink = photoStatus.folderUrl
    ? `<a class="geo-cm-photo-folder" href="${escapeAttr(photoStatus.folderUrl)}" target="_blank" rel="noopener">Папка фото</a>`
    : `<span class="geo-cm-photo-folder geo-cm-muted">Нет папки</span>`;
  const slots = [photoStatus.photo1, photoStatus.photo2].map((photo, index) => {
    if (!photo) {
      return `<div class="geo-cm-photo-slot is-missing">Фото ${index + 1}: нет</div>`;
    }
    return `<div class="geo-cm-photo-slot">
      <span>${escapeHtml(photo.title || `Фото ${index + 1}`)}</span>
      <a href="${escapeAttr(photo.viewUrl)}" target="_blank" rel="noopener">Открыть</a>
      <a href="${escapeAttr(photo.downloadUrl)}" target="_blank" rel="noopener">Скачать</a>
    </div>`;
  }).join('');

  return `
    <div class="geo-cm-photos">
      <div class="geo-cm-photo-head">
        ${renderStatusDot(photoStatus.ok, photoStatus.ok ? '2 фото есть' : `нет ${photoStatus.missing} фото`)}
        ${folderLink}
      </div>
      <div class="geo-cm-photo-slots">${slots}</div>
    </div>`;
}

function renderPage(page) {
  const indicator = page.overallOk
    ? renderStatusDot(true, 'готово')
    : renderStatusDot(false, 'нужно действие');
  const issueText = page.problems.length ? page.problems.join(' · ') : 'Проблем нет';
  const searchText = [
    page.type,
    page.name,
    page.slug,
    page.country,
    issueText,
    page.overallOk ? 'ready green ok' : 'problem red missing'
  ].join(' ').toLowerCase();

  return `
    <article class="geo-cm-card ${page.overallOk ? 'is-green' : 'is-red'}"
      data-card
      data-type="${escapeAttr(page.type)}"
      data-status="${page.overallOk ? 'ok' : 'problem'}"
      data-photo="${page.photoStatus.ok ? 'ok' : 'missing'}"
      data-upload="${page.uploadStatus.allPass ? 'ok' : page.uploadStatus.sourceFound ? 'partial' : 'unknown'}"
      data-search="${escapeAttr(searchText)}">
      <div class="geo-cm-card-head">
        <div class="geo-cm-order">${page.order}</div>
        <div class="geo-cm-title">
          <div class="geo-cm-title-line">
            <h3>${escapeHtml(page.name)}</h3>
            ${indicator}
          </div>
          <p>${escapeHtml(page.type === 'country' ? 'Страна' : `Город · ${page.country || 'страна не указана'}`)} · ${escapeHtml(page.slug)}</p>
        </div>
        <div class="geo-cm-card-actions">
          <a class="geo-cm-admin" href="${escapeAttr(page.admin.url)}" target="_blank" rel="noopener">${escapeHtml(page.admin.label)}</a>
          <a class="geo-cm-admin is-secondary" href="${escapeAttr(page.publicUrl)}" target="_blank" rel="noopener">Публичная</a>
        </div>
      </div>

      <div class="geo-cm-status-strip">
        ${renderStatusDot(page.packageStatus.ok, `TXT ${page.packageStatus.totalExisting}/12`)}
        ${renderStatusDot(page.uploadStatus.allPass, page.uploadStatus.sourceFound ? `CMS ${page.uploadStatus.pass}/6` : 'CMS не проверено', page.uploadStatus.sourceFound ? '' : 'unknown')}
        ${renderStatusDot(page.photoStatus.ok, page.photoStatus.ok ? 'Фото 2/2' : `Фото ${2 - page.photoStatus.missing}/2`)}
        ${renderStatusDot(page.admin.direct, page.admin.direct ? `ID ${page.admin.id}` : 'ID не найден', page.admin.direct ? '' : 'unknown')}
      </div>

      <div class="geo-cm-problems">${escapeHtml(issueText)}</div>

      <div class="geo-cm-grid">
        <div class="geo-cm-panel">
          <h4>Тексты по языкам</h4>
          <div class="geo-cm-lang-grid">${renderLanguageRows(page)}</div>
        </div>
        <div class="geo-cm-panel">
          <h4>Фото и ссылки</h4>
          ${renderPhotos(page)}
        </div>
      </div>
    </article>`;
}

function renderPanel(countryPages, cityPages, totals, reportSources) {
  const generated = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const allPages = [...countryPages, ...cityPages];
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confideline | Geo-контент: контроль загрузки</title>
  <link rel="stylesheet" href="../css/task-panel-standard.css">
  <link rel="stylesheet" href="../css/geo-content-panel.css">
  <script src="../js/geo-content-panel.js" defer></script>
</head>
<body class="cl-task-standard geo-cm">
  <div class="tp-page">
    <header class="tp-hero geo-cm-hero">
      <div>
        <h1>Geo-контент: тексты, фото и CMS</h1>
        <p>Панель показывает, где готов TXT-пакет, где подтверждена загрузка по языкам, где есть две фотографии, и куда перейти для редактирования страницы.</p>
      </div>
      <div class="geo-cm-actions">
        <a class="tp-btn tp-btn--primary" href="https://confideline.com/ru/admin/country/index" target="_blank" rel="noopener">Страны CMS</a>
        <a class="tp-btn" href="https://confideline.com/ru/admin/geoname/index" target="_blank" rel="noopener">Города CMS</a>
      </div>
    </header>

    <section class="geo-cm-toolbar">
      <div class="geo-cm-metric"><strong>${totals.pages}</strong><span>страниц</span></div>
      <div class="geo-cm-metric"><strong>${totals.ready}</strong><span>полностью зелёных</span></div>
      <div class="geo-cm-metric"><strong>${totals.txtComplete}</strong><span>TXT 12/12</span></div>
      <div class="geo-cm-metric"><strong>${totals.uploadComplete}</strong><span>CMS 6/6 PASS</span></div>
      <div class="geo-cm-metric"><strong>${totals.withTwoPhotos}</strong><span>с 2 фото</span></div>
      <label class="geo-cm-search">
        <span>Поиск</span>
        <input type="search" id="queueSearch" placeholder="Japan, Tokyo, new-york">
      </label>
    </section>

    <section class="geo-cm-filterbar" aria-label="Фильтры">
      <button type="button" class="is-active" data-filter="all">Все</button>
      <button type="button" data-filter="problem">Проблемы</button>
      <button type="button" data-filter="photo-missing">Нет фото</button>
      <button type="button" data-filter="upload-unknown">CMS не проверено</button>
      <button type="button" data-filter="country">Страны</button>
      <button type="button" data-filter="city">Города</button>
    </section>

    <div class="geo-cm-note">
      Зелёный статус ставится только когда есть 12 TXT, live-проверка CMS прошла по 6 языкам, есть 2 фото и найдена прямая ссылка на редактирование. Для городов live-отчёт в локальных артефактах не найден, поэтому их CMS-статус отмечен как “не проверено”.
    </div>

    <main class="geo-cm-layout">
      <aside class="geo-cm-nav">
        <a href="#countries">Страны</a>
        <a href="#cities">Города</a>
        <a href="./admin.html" class="geo-cm-admin-nav">Служебное</a>
      </aside>

      <div class="geo-cm-list">
        <section id="countries">
          <div class="geo-cm-section-head">
            <h2>Страны</h2>
            <p>${countryPages.length} страниц. Источник live-проверки: ${reportSources.country}</p>
          </div>
          ${countryPages.map((page) => renderPage(page)).join('')}
        </section>

        <section id="cities">
          <div class="geo-cm-section-head">
            <h2>Города</h2>
            <p>${cityPages.length} страниц. Источник live-проверки: ${reportSources.city}</p>
          </div>
          ${cityPages.map((page) => renderPage(page)).join('')}
        </section>
      </div>
    </main>

    <footer class="geo-cm-footer">
      Сгенерировано: ${generated}. Служебные SEO/AI-фразы удаляются из HTML-файлов перед сборкой панели. Всего карточек в текущем фильтре: <strong id="visibleCount">${allPages.length}</strong>.
    </footer>
  </div>
</body>
</html>
`;
}

function renderBatchStatus(batchStatus) {
  if (!batchStatus) {
    return `
      <section class="geo-cm-admin-sources">
        <h2>Перегенерация SEO-текстов</h2>
        <p class="geo-cm-muted">Пакетный прогон еще не запускался.</p>
      </section>`;
  }
  const active = batchStatus.active
    ? `${batchStatus.active.type === 'country' ? 'Страна' : 'Город'}: ${batchStatus.active.name || batchStatus.active.slug}`
    : 'нет активной страницы';
  const statusClass = batchStatus.status === 'PASS' ? 'is-ok' : (batchStatus.status === 'RUNNING' ? 'is-unknown' : 'is-bad');
  return `
      <section class="geo-cm-admin-sources">
        <h2>Перегенерация SEO-текстов</h2>
        <div class="geo-cm-batch-status">
          <div class="geo-cm-batch-bar" aria-label="Прогресс ${escapeAttr(batchStatus.progressPercent || 0)}%">
            <span style="width:${Math.max(0, Math.min(100, Number(batchStatus.progressPercent || 0)))}%"></span>
          </div>
          <dl>
            <div><dt>Статус</dt><dd><span class="geo-cm-mini ${statusClass}">${escapeHtml(batchStatus.status || 'UNKNOWN')}</span></dd></div>
            <div><dt>Готово</dt><dd>${escapeHtml(batchStatus.done ?? 0)} из ${escapeHtml(batchStatus.total ?? 0)} (${escapeHtml(batchStatus.progressPercent ?? 0)}%)</dd></div>
            <div><dt>Сейчас</dt><dd>${escapeHtml(active)}</dd></div>
            <div><dt>Ошибки</dt><dd>${escapeHtml(batchStatus.failed ?? 0)}</dd></div>
            <div><dt>Обновлено</dt><dd>${escapeHtml(batchStatus.generatedAt || '')}</dd></div>
          </dl>
        </div>
      </section>`;
}

function renderAdminPanel(totals, reportSources, batchStatus) {
  const generated = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const technicalFiles = [
    {
      title: 'manifest.json',
      href: './manifest.json',
      text: 'Машинная сводка по всем страницам, статусам, ссылкам CMS и фото.'
    },
    {
      title: 'queue.csv',
      href: './content-manager-queue.csv',
      text: 'Полная таблица для выгрузки: страницы, языки, TXT, фото, CMS-ссылки.'
    },
    {
      title: 'photo-index.json',
      href: './drive-photo-index.json',
      text: 'Индекс Google Drive: папки, отдельные фото, download/view ссылки.'
    },
    {
      title: 'country-photo-audit.csv',
      href: './country-photo-audit.csv',
      text: 'Проверка стран: что видит панель, что реально найдено в папке Drive, открываются ли ссылки на фото.'
    },
    {
      title: 'country-photo-audit.json',
      href: './country-photo-audit.json',
      text: 'Машинная версия аудита фото по всем странам.'
    },
    {
      title: 'city-photo-audit.csv',
      href: './city-photo-audit.csv',
      text: 'Проверка городов: что видит панель, что найдено в Drive, открываются ли ссылки на фото.'
    },
    {
      title: 'city-photo-audit.json',
      href: './city-photo-audit.json',
      text: 'Машинная версия аудита фото по всем городам.'
    },
    {
      title: 'geo-text-audit.csv',
      href: './geo-text-audit.csv',
      text: 'Проверка TXT-пакетов: 12 файлов, 6 языков и базовая структура по каждой стране и городу.'
    },
    {
      title: 'geo-text-audit.json',
      href: './geo-text-audit.json',
      text: 'Машинная версия аудита TXT-пакетов по всем страницам.'
    },
    {
      title: 'geo-seo-quality-audit.csv',
      href: './geo-seo-quality-audit.csv',
      text: 'Проверка SEO-полей, HTML-структуры и похожести текстов между страницами.'
    },
    {
      title: 'geo-seo-quality-audit.json',
      href: './geo-seo-quality-audit.json',
      text: 'Машинная версия SEO-аудита: дубли, почти дубли и ошибки SEO-полей.'
    },
    {
      title: 'source-preservation-audit.csv',
      href: './source-preservation-audit.csv',
      text: 'Проверка, что русский SEO-текст сохраняет смысл, тональность и смысловые якоря исходного Astro-документа.'
    },
    {
      title: 'source-preservation-audit.json',
      href: './source-preservation-audit.json',
      text: 'Машинная версия проверки связи готового текста с исходником: source overlap, anchors, страницы с провалом.'
    },
    {
      title: 'source-rewrite-contract.csv',
      href: './source-rewrite-contract.csv',
      text: 'Контрактная проверка контура перегенерации: источники, staged-очередь, зависимости, preflight/final.'
    },
    {
      title: 'source-rewrite-contract.json',
      href: './source-rewrite-contract.json',
      text: 'Машинная версия контракта перегенерации SEO-текстов и текущий статус приемки.'
    },
    {
      title: 'source-rewrite-batch-status.json',
      href: './source-rewrite-batch-status.json',
      text: 'Текущий статус пакетной перегенерации: прогресс, активная страна или город, ошибки.'
    }
  ];

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confideline | Служебные файлы geo-контента</title>
  <link rel="stylesheet" href="../css/task-panel-standard.css">
  <link rel="stylesheet" href="../css/geo-content-panel.css">
</head>
<body class="cl-task-standard geo-cm">
  <div class="tp-page">
    <header class="tp-hero geo-cm-hero">
      <div>
        <h1>Служебные файлы geo-контента</h1>
        <p>Техническая страница для администратора. Основная панель для контент-менеджера остается без JSON/CSV и служебных индексов.</p>
      </div>
      <div class="geo-cm-actions">
        <a class="tp-btn tp-btn--primary" href="./">Вернуться в панель</a>
        <a class="tp-btn" href="./variables.html">Переменные для программиста</a>
      </div>
    </header>

    <section class="geo-cm-toolbar geo-cm-toolbar--admin">
      <div class="geo-cm-metric"><strong>${totals.pages}</strong><span>страниц</span></div>
      <div class="geo-cm-metric"><strong>${totals.txt}</strong><span>TXT-файлов</span></div>
      <div class="geo-cm-metric"><strong>${totals.ready}</strong><span>полностью зелёных</span></div>
      <div class="geo-cm-metric"><strong>${totals.uploadComplete}</strong><span>CMS 6/6 PASS</span></div>
      <div class="geo-cm-metric"><strong>${totals.withTwoPhotos}</strong><span>с 2 фото</span></div>
      <div class="geo-cm-metric"><strong>${totals.cityDirectLinks}</strong><span>прямых ссылок городов</span></div>
    </section>

    <main class="geo-cm-admin-page">
      ${renderBatchStatus(batchStatus)}

      <section class="geo-cm-admin-files">
        ${technicalFiles.map((file) => `
          <a class="geo-cm-admin-file" href="${escapeAttr(file.href)}" target="_blank" rel="noopener">
            <strong>${escapeHtml(file.title)}</strong>
            <span>${escapeHtml(file.text)}</span>
          </a>`).join('')}
      </section>

      <section class="geo-cm-admin-sources">
        <h2>Источники проверки</h2>
        <dl>
          <div>
            <dt>Страны</dt>
            <dd>${escapeHtml(reportSources.country)}</dd>
          </div>
          <div>
            <dt>Города</dt>
            <dd>${escapeHtml(reportSources.city)}</dd>
          </div>
        </dl>
      </section>
    </main>

    <footer class="geo-cm-footer">
      Сгенерировано: ${generated}. Эта страница предназначена для администратора и диагностики.
    </footer>
  </div>
</body>
</html>
`;
}

function renderVariablesPanel() {
  const generated = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const variables = [
    {
      placeholder: '{{siteName}}',
      status: 'Обязательная',
      value: 'Название проекта. Сейчас: Neiro.',
      usage: 'Можно выводить внутри предложений, в Meta Title, Meta Description, H1, Seo Text и Html Description.',
      implementation: 'Брать из существующей настройки siteName и заменять до вывода страницы.'
    },
    {
      placeholder: '{{whatWeOfferBlock}}',
      status: 'Обязательная',
      value: 'Локализованный HTML-блок "Что предлагаем".',
      usage: 'Только целым блоком. Не вставлять внутрь предложения.',
      implementation: 'Рендерить готовый блок на языке текущей страницы.'
    },
    {
      placeholder: '{{geoServiceListBlock}}',
      status: 'Обязательная',
      value: 'Локализованный HTML-блок со списком услуг для geo SEO-страниц.',
      usage: 'Только целым блоком. Не дробить на отдельные названия услуг в тексте.',
      implementation: 'Рендерить список услуг на языке текущей страницы: Tarot, astrology, natal chart, synastry, compatibility, relocation, astrocartography, forecast, online consultation, text chat.'
    },
    {
      placeholder: '{{informationalDisclaimerBlock}}',
      status: 'Обязательная',
      value: 'Локализованный информационный дисклеймер.',
      usage: 'Только целым блоком или абзацем, без вставки в середину предложения.',
      implementation: 'Рендерить стандартный текст о том, что консультации носят информационный характер, не гарантируют результат и не заменяют самостоятельные решения пользователя.'
    },
    {
      placeholder: '{{siteUrl}}',
      status: 'Разрешенная, но сейчас не используется',
      value: 'Канонический URL сайта.',
      usage: 'Только отдельный URL или значение href.',
      implementation: 'Брать из существующей настройки siteUrl. Не подставлять в обычные SEO-предложения.'
    }
  ];
  const blocked = [
    {
      placeholder: '{{countryName}}, {{cityName}}, {{locationName}}',
      reason: 'Не использовать inline: в RU, ES, IT, DE и PT ломаются падежи, артикли, предлоги, род и согласование.'
    },
    {
      placeholder: '{{locationType}}, {{geoType}}',
      reason: 'Не использовать inline: страна, город и тип страницы требуют разной грамматики в разных языках.'
    },
    {
      placeholder: '{{serviceName}}, {{mainService}}, {{consultationFormat}}',
      reason: 'Не использовать inline: названия услуг меняют форму в предложениях. Для услуг нужен целый блок {{geoServiceListBlock}}.'
    }
  ];
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confideline | Переменные geo SEO</title>
  <link rel="stylesheet" href="../css/task-panel-standard.css">
  <link rel="stylesheet" href="../css/geo-content-panel.css">
</head>
<body class="cl-task-standard geo-cm">
  <div class="tp-page geo-cm-dev-page">
    <header class="tp-hero geo-cm-hero">
      <div>
        <h1>Переменные geo SEO для сайта</h1>
        <p>Контракт для программиста: какие плейсхолдеры должны заменяться при выводе страниц стран и городов.</p>
      </div>
      <div class="geo-cm-actions">
        <a class="tp-btn tp-btn--primary" href="./">Панель контента</a>
        <a class="tp-btn" href="./admin.html">Служебное</a>
      </div>
    </header>

    <section class="geo-cm-dev-summary" aria-label="Сводка">
      <div class="geo-cm-metric"><strong>4</strong><span>обязательные переменные</span></div>
      <div class="geo-cm-metric"><strong>1</strong><span>разрешенная резервная</span></div>
      <div class="geo-cm-metric"><strong>0</strong><span>неизвестных переменных в TXT</span></div>
      <div class="geo-cm-metric"><strong>6382</strong><span>вхождения {{siteName}}</span></div>
    </section>

    <main class="geo-cm-dev-layout">
      <section class="geo-cm-admin-sources">
        <h2>Что нужно реализовать</h2>
        <p>При выводе публичных geo-страниц сайт должен заменять переменные в полях Meta Title, Meta Description, H1, Seo Text и Html Description. Замена должна выполняться для стран и городов на всех языках: RU, EN, ES, IT, DE, PT-BR.</p>
        <p>Если переменная блочная, она должна возвращать готовый локализованный HTML-фрагмент. Не нужно вставлять такие переменные внутрь предложения.</p>
      </section>

      <section class="geo-cm-variable-list" aria-label="Разрешенные переменные">
        ${variables.map((variable) => `
          <article class="geo-cm-variable-card">
            <div class="geo-cm-variable-head">
              <code>${escapeHtml(variable.placeholder)}</code>
              <span class="geo-cm-mini is-ok">${escapeHtml(variable.status)}</span>
            </div>
            <dl>
              <div><dt>Что значит</dt><dd>${escapeHtml(variable.value)}</dd></div>
              <div><dt>Где использовать</dt><dd>${escapeHtml(variable.usage)}</dd></div>
              <div><dt>Как настроить</dt><dd>${escapeHtml(variable.implementation)}</dd></div>
            </dl>
          </article>`).join('')}
      </section>

      <section class="geo-cm-admin-sources">
        <h2>Нельзя добавлять как inline-переменные</h2>
        <div class="geo-cm-blocked-list">
          ${blocked.map((item) => `
            <div class="geo-cm-blocked-item">
              <code>${escapeHtml(item.placeholder)}</code>
              <p>${escapeHtml(item.reason)}</p>
            </div>`).join('')}
        </div>
      </section>

      <section class="geo-cm-admin-sources">
        <h2>Критерии приемки</h2>
        <ul class="geo-cm-acceptance">
          <li>На публичной странице не остается сырой строки {{siteName}} вместо названия проекта.</li>
          <li>На публичной странице не остается сырой строки {{whatWeOfferBlock}}, {{geoServiceListBlock}} или {{informationalDisclaimerBlock}}.</li>
          <li>Блочные переменные выводятся на языке текущей страницы.</li>
          <li>HTML-блоки не добавляют запрещенные теги script, style, html, head, body и не ломают структуру описания.</li>
          <li>Существующие тексты стран и городов не переписываются, меняется только рендер переменных.</li>
        </ul>
      </section>
    </main>

    <footer class="geo-cm-footer">
      Сгенерировано: ${generated}. Источник контракта: geo SEO TXT-пакеты и seo-template-variables.json.
    </footer>
  </div>
</body>
</html>
`;
}

function renderCss() {
  return `.geo-cm { background: #f4f7fb; color: #102033; }
.geo-cm .tp-page { max-width: 1360px; }
.geo-cm-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.geo-cm-hero p { max-width: 820px; }
.geo-cm-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.geo-cm-toolbar { display: grid; grid-template-columns: repeat(5, minmax(116px, 1fr)) minmax(240px, 2fr); gap: 12px; margin: 22px 0 12px; }
.geo-cm-metric, .geo-cm-search, .geo-cm-card, .geo-cm-panel, .geo-cm-note { background: #fff; border: 1px solid #d7e0ea; border-radius: 8px; box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
.geo-cm-metric, .geo-cm-search { padding: 14px; }
.geo-cm-metric strong { display: block; font-size: 24px; line-height: 1.1; color: #0f172a; }
.geo-cm-metric span, .geo-cm-search span { display: block; margin-top: 4px; color: #536274; font-size: 13px; }
.geo-cm-search input { width: 100%; margin-top: 8px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 12px; font-size: 15px; }
.geo-cm-filterbar { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 12px; }
.geo-cm-filterbar button { border: 1px solid #cbd5e1; background: #fff; color: #18324f; border-radius: 7px; padding: 9px 12px; font-weight: 800; cursor: pointer; }
.geo-cm-filterbar button.is-active { background: #18324f; border-color: #18324f; color: #fff; }
.geo-cm-note { padding: 12px 14px; margin: 0 0 18px; color: #334155; line-height: 1.45; }
.geo-cm-layout { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 22px; align-items: start; }
.geo-cm-nav { position: sticky; top: 16px; display: grid; gap: 8px; }
.geo-cm-nav a { display: block; padding: 10px 12px; border: 1px solid #d7e0ea; border-radius: 8px; background: #fff; color: #1f3a5f; text-decoration: none; font-weight: 800; }
.geo-cm-nav a.geo-cm-admin-nav { margin-top: 10px; color: #64748b; font-weight: 750; }
.geo-cm-list { display: grid; gap: 28px; }
.geo-cm-section-head { margin: 0 0 12px; }
.geo-cm-section-head h2 { margin: 0; font-size: 26px; }
.geo-cm-section-head p { margin: 4px 0 0; color: #536274; }
.geo-cm-card { padding: 14px; margin: 10px 0; }
.geo-cm-card.is-green { border-left: 6px solid #15803d; }
.geo-cm-card.is-red { border-left: 6px solid #dc2626; }
.geo-cm-card[hidden] { display: none; }
.geo-cm-card-head { display: grid; grid-template-columns: 42px minmax(0, 1fr) auto; gap: 12px; align-items: center; }
.geo-cm-order { width: 34px; height: 34px; border-radius: 8px; background: #e8eef6; color: #18324f; display: grid; place-items: center; font-weight: 900; }
.geo-cm-title-line { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.geo-cm-title h3 { margin: 0; font-size: 19px; line-height: 1.2; }
.geo-cm-title p { margin: 3px 0 0; color: #536274; font-size: 13px; }
.geo-cm-card-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.geo-cm-admin { border: 1px solid #94a3b8; border-radius: 7px; padding: 8px 10px; text-decoration: none; color: #0f172a; font-weight: 850; white-space: nowrap; }
.geo-cm-admin.is-secondary { color: #174ea6; }
.geo-cm-status-strip { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 8px; }
.geo-cm-dot { display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 5px 9px; font-weight: 850; font-size: 12px; border: 1px solid transparent; }
.geo-cm-dot span { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.geo-cm-dot.is-ok { color: #14532d; background: #dcfce7; border-color: #86efac; }
.geo-cm-dot.is-ok span { background: #16a34a; }
.geo-cm-dot.is-bad { color: #7f1d1d; background: #fee2e2; border-color: #fecaca; }
.geo-cm-dot.is-bad span { background: #dc2626; }
.geo-cm-dot.is-unknown { color: #713f12; background: #fef3c7; border-color: #fde68a; }
.geo-cm-dot.is-unknown span { background: #d97706; }
.geo-cm-problems { color: #7f1d1d; background: #fff7f7; border: 1px solid #fecaca; border-radius: 7px; padding: 8px 10px; font-weight: 750; }
.geo-cm-card.is-green .geo-cm-problems { color: #14532d; background: #f0fdf4; border-color: #bbf7d0; }
.geo-cm-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr); gap: 12px; margin-top: 12px; }
.geo-cm-panel { padding: 12px; box-shadow: none; }
.geo-cm-panel h4 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #334155; }
.geo-cm-lang-grid { display: grid; gap: 7px; }
.geo-cm-lang-row { display: grid; grid-template-columns: 58px 48px 96px minmax(74px, 1fr) minmax(74px, 1fr); gap: 7px; align-items: center; padding: 7px; background: #f8fafc; border-radius: 7px; }
.geo-cm-lang { font-weight: 900; color: #0f172a; }
.geo-cm-mini { border-radius: 6px; padding: 4px 6px; font-size: 11px; font-weight: 900; text-align: center; }
.geo-cm-mini.is-ok { color: #14532d; background: #dcfce7; }
.geo-cm-mini.is-bad { color: #7f1d1d; background: #fee2e2; }
.geo-cm-mini.is-unknown { color: #713f12; background: #fef3c7; }
.geo-cm-lang-row a { color: #174ea6; text-decoration: none; font-weight: 800; overflow-wrap: anywhere; }
.geo-cm-photos { display: grid; gap: 8px; }
.geo-cm-photo-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.geo-cm-photo-folder { margin-left: auto; color: #174ea6; font-weight: 850; text-decoration: none; }
.geo-cm-photo-slots { display: grid; gap: 8px; }
.geo-cm-photo-slot { min-height: 38px; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center; padding: 8px 10px; border-radius: 7px; background: #eef6ff; border: 1px solid #bfdbfe; font-weight: 780; }
.geo-cm-photo-slot span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.geo-cm-photo-slot a { color: #174ea6; text-decoration: none; font-weight: 850; }
.geo-cm-photo-slot.is-missing { display: grid; place-items: center; grid-template-columns: 1fr; background: #fee2e2; border-color: #fecaca; color: #7f1d1d; text-transform: uppercase; }
.geo-cm-muted { color: #64748b; }
.geo-cm-toolbar--admin { grid-template-columns: repeat(6, minmax(120px, 1fr)); }
.geo-cm-admin-page { display: grid; gap: 18px; }
.geo-cm-admin-files { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.geo-cm-admin-file { display: grid; gap: 8px; background: #fff; border: 1px solid #d7e0ea; border-radius: 8px; padding: 16px; text-decoration: none; color: #102033; box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
.geo-cm-admin-file strong { color: #174ea6; font-size: 17px; }
.geo-cm-admin-file span { color: #536274; line-height: 1.45; }
.geo-cm-admin-sources { background: #fff; border: 1px solid #d7e0ea; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
.geo-cm-admin-sources h2 { margin: 0 0 12px; font-size: 22px; }
.geo-cm-admin-sources dl { margin: 0; display: grid; gap: 10px; }
.geo-cm-admin-sources div { display: grid; gap: 4px; }
.geo-cm-admin-sources dt { font-weight: 900; color: #0f172a; }
.geo-cm-admin-sources dd { margin: 0; color: #536274; overflow-wrap: anywhere; }
.geo-cm-batch-status { display: grid; gap: 12px; }
.geo-cm-batch-bar { height: 12px; border-radius: 999px; overflow: hidden; background: #e2e8f0; border: 1px solid #cbd5e1; }
.geo-cm-batch-bar span { display: block; height: 100%; background: #2563eb; }
.geo-cm-dev-page { max-width: 1180px; }
.geo-cm-dev-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
.geo-cm-dev-layout { display: grid; gap: 18px; }
.geo-cm-variable-list { display: grid; gap: 12px; }
.geo-cm-variable-card { background: #fff; border: 1px solid #d7e0ea; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
.geo-cm-variable-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.geo-cm-variable-head code, .geo-cm-blocked-item code { display: inline-block; color: #0f172a; background: #eef6ff; border: 1px solid #bfdbfe; border-radius: 7px; padding: 6px 8px; font-weight: 900; overflow-wrap: anywhere; }
.geo-cm-variable-card dl { margin: 0; display: grid; gap: 10px; }
.geo-cm-variable-card div { display: grid; gap: 4px; }
.geo-cm-variable-card dt { font-weight: 900; color: #0f172a; }
.geo-cm-variable-card dd { margin: 0; color: #536274; line-height: 1.45; }
.geo-cm-blocked-list { display: grid; gap: 10px; }
.geo-cm-blocked-item { border: 1px solid #fecaca; background: #fff7f7; border-radius: 8px; padding: 12px; }
.geo-cm-blocked-item p { margin: 8px 0 0; color: #7f1d1d; line-height: 1.45; }
.geo-cm-acceptance { margin: 0; padding-left: 20px; color: #334155; line-height: 1.55; }
.geo-cm-footer { margin: 28px 0 8px; color: #536274; font-size: 13px; }
@media (max-width: 1000px) {
  .geo-cm-hero { display: block; }
  .geo-cm-actions { justify-content: flex-start; margin-top: 14px; }
  .geo-cm-toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .geo-cm-toolbar--admin { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .geo-cm-search { grid-column: 1 / -1; }
  .geo-cm-layout { grid-template-columns: 1fr; }
  .geo-cm-nav { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .geo-cm-grid { grid-template-columns: 1fr; }
  .geo-cm-admin-files { grid-template-columns: 1fr; }
  .geo-cm-dev-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .geo-cm-card-head { grid-template-columns: 36px minmax(0, 1fr); }
  .geo-cm-card-actions { grid-column: 1 / -1; justify-content: flex-start; }
}
@media (max-width: 640px) {
  .geo-cm-toolbar { grid-template-columns: 1fr; }
  .geo-cm-search { grid-column: auto; }
  .geo-cm-lang-row { grid-template-columns: 50px 44px 1fr; }
  .geo-cm-lang-row a { grid-column: span 1; }
  .geo-cm-photo-slot { grid-template-columns: 1fr; }
  .geo-cm-dev-summary { grid-template-columns: 1fr; }
}
`;
}

function renderJs() {
  return `(() => {
  const cards = [...document.querySelectorAll('[data-card]')];
  const search = document.getElementById('queueSearch');
  const visibleCount = document.getElementById('visibleCount');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  let activeFilter = 'all';

  function matchesFilter(card) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'problem') return card.dataset.status === 'problem';
    if (activeFilter === 'photo-missing') return card.dataset.photo === 'missing';
    if (activeFilter === 'upload-unknown') return card.dataset.upload === 'unknown';
    if (activeFilter === 'country' || activeFilter === 'city') return card.dataset.type === activeFilter;
    return true;
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const haystack = card.dataset.search || '';
      const visible = matchesFilter(card) && (!query || haystack.includes(query));
      card.hidden = !visible;
      if (visible) count += 1;
    });
    if (visibleCount) visibleCount.textContent = String(count);
  }

  search?.addEventListener('input', applyFilters);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      applyFilters();
    });
  });

  applyFilters();
})();
`;
}

function buildCsvRows(pages) {
  const headers = [
    'order', 'type', 'name', 'slug', 'country', 'overall_status', 'problems',
    'admin_edit_url', 'public_url', 'photo_folder_url',
    'photo_1_view_url', 'photo_1_download_url', 'photo_2_view_url', 'photo_2_download_url',
    'missing_photo_1', 'missing_photo_2'
  ];
  for (const locale of locales) {
    headers.push(`${locale.packageLocale}_package`, `${locale.packageLocale}_cms`, `${locale.packageLocale}_fields_txt`, `${locale.packageLocale}_html_txt`);
  }

  const rows = [headers.map(csvEscape).join(',')];
  for (const page of pages) {
    const values = [
      page.order,
      page.type,
      page.name,
      page.slug,
      page.country,
      page.overallOk ? 'green' : 'red',
      page.problems.join(' | '),
      page.admin.url,
      page.publicUrl,
      page.photoStatus.folderUrl,
      page.photoStatus.photo1?.viewUrl || '',
      page.photoStatus.photo1?.downloadUrl || '',
      page.photoStatus.photo2?.viewUrl || '',
      page.photoStatus.photo2?.downloadUrl || '',
      page.photoStatus.photo1 ? '0' : '1',
      page.photoStatus.photo2 ? '0' : '1'
    ];
    for (const locale of locales) {
      const packageLocale = page.packageStatus.byLocale[locale.packageLocale];
      const uploadLocale = page.uploadStatus.byLocale[locale.packageLocale];
      values.push(
        packageLocale.ok ? 'ok' : 'missing',
        uploadLocale.state,
        packageLocale.fieldsLink,
        packageLocale.htmlLink
      );
    }
    rows.push(values.map(csvEscape).join(','));
  }
  return rows.join('\n') + '\n';
}

function main() {
  debugStep('start');
  const expectedPanelRoot = path.join(projectRoot, 'web', 'geo-content-panel');
  if (path.resolve(panelRoot) !== path.resolve(expectedPanelRoot)) {
    throw new Error(`Unexpected panel root: ${panelRoot}`);
  }
  fs.mkdirSync(panelFilesRoot, { recursive: true });

  debugStep('load inputs');
  const manifest = loadManifestOrder();
  const pageList = loadPageList();
  const countries = normalizeItems('country', path.join(sourceRoot, 'countries'), manifest.country, pageList);
  const cities = normalizeItems('city', path.join(sourceRoot, 'cities'), manifest.city, pageList);
  const photoIndex = fs.existsSync(photoIndexPath) ? JSON.parse(readUtf8(photoIndexPath)) : { countries: {}, cities: {}, summary: {} };
  const batchStatus = readJsonIfExists(batchStatusPath, null);
  const countryVerifyStatuses = loadVerifyStatuses(countryVerifyCsvPath);
  const cityVerifyStatuses = loadCityVerifyStatuses();
  const countryIdMap = loadCountryIdMap();
  const countryCodeBySlug = loadCountryCodeMap();
  const cityIdMap = loadCityIdMap(cities, countryCodeBySlug);

  debugStep('copy country files');
  const countryResult = sanitizeSourceAndCopy(countries, 'countries');
  debugStep('copy city files');
  const cityResult = sanitizeSourceAndCopy(cities, 'cities');

  debugStep('build models');
  const context = { photoIndex, countryVerifyStatuses, cityVerifyStatuses, countryIdMap, cityIdMap };
  const countryPages = countries.map((item, index) => buildPageModel(item, 'countries', index + 1, context));
  const cityPages = cities.map((item, index) => buildPageModel(item, 'cities', countries.length + index + 1, context));
  const pages = [...countryPages, ...cityPages];
  const totals = {
    pages: pages.length,
    countries: countryPages.length,
    cities: cityPages.length,
    txt: countryResult.copiedCount + cityResult.copiedCount,
    ready: pages.filter((page) => page.overallOk).length,
    txtComplete: pages.filter((page) => page.packageStatus.ok).length,
    uploadComplete: pages.filter((page) => page.uploadStatus.allPass).length,
    withTwoPhotos: pages.filter((page) => page.photoStatus.ok).length,
    countryDirectLinks: countryPages.filter((page) => page.admin.direct).length,
    cityDirectLinks: cityPages.filter((page) => page.admin.direct).length,
    cleanedSourceFiles: countryResult.cleanedCount + cityResult.cleanedCount
  };

  const reportSources = {
    country: countryVerifyStatuses.found ? countryVerifyStatuses.path : 'не найден',
    city: cityVerifyStatuses.found ? cityVerifyStatuses.path : 'не найден'
  };

  const manifestJson = {
    generated: new Date().toISOString(),
    sourceRoot,
    panelRoot,
    reportSources,
    totals,
    items: pages.map((page) => ({
      order: page.order,
      type: page.type,
      name: page.name,
      slug: page.slug,
      country: page.country,
      overallStatus: page.overallOk ? 'green' : 'red',
      problems: page.problems,
      admin: page.admin,
      publicUrl: page.publicUrl,
      package: {
        ok: page.packageStatus.ok,
        totalExisting: page.packageStatus.totalExisting
      },
      upload: {
        allPass: page.uploadStatus.allPass,
        pass: page.uploadStatus.pass,
        fail: page.uploadStatus.fail,
        unknown: page.uploadStatus.unknown,
        sourceFound: page.uploadStatus.sourceFound
      },
      photos: {
        ok: page.photoStatus.ok,
        folderUrl: page.photoStatus.folderUrl,
        missing: page.photoStatus.missing,
        photo1: page.photoStatus.photo1,
        photo2: page.photoStatus.photo2
      }
    }))
  };

  debugStep('write panel files');
  writeUtf8(path.join(panelRoot, 'index.html'), renderPanel(countryPages, cityPages, totals, reportSources));
  writeUtf8(path.join(panelRoot, 'admin.html'), renderAdminPanel(totals, reportSources, batchStatus));
  writeUtf8(path.join(panelRoot, 'variables.html'), renderVariablesPanel());
  writeUtf8(path.join(panelRoot, 'manifest.json'), JSON.stringify(manifestJson, null, 2));
  writeUtf8(path.join(panelRoot, 'content-manager-queue.csv'), buildCsvRows(pages));
  if (batchStatus) {
    writeUtf8(path.join(panelRoot, 'source-rewrite-batch-status.json'), JSON.stringify(batchStatus, null, 2));
  }
  if (fs.existsSync(photoIndexPath)) {
    writeUtf8(path.join(panelRoot, 'drive-photo-index.json'), readUtf8(photoIndexPath));
  }
  writeUtf8(cssPath, renderCss());
  writeUtf8(jsPath, renderJs());

  debugStep('done');
  console.log(JSON.stringify({
    status: 'PASS',
    panel: path.join(panelRoot, 'index.html'),
    totals,
    reportSources
  }, null, 2));
}

main();
