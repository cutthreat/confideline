import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const confidelineRoot = process.env.CONFIDELINE_PROJECT_ROOT || path.resolve(scriptDir, '..', '..');
const panelRoot = path.join(confidelineRoot, 'web', 'geo-content-panel');
const manifestPath = path.join(panelRoot, 'manifest.json');
const reportRoot = path.join(confidelineRoot, 'reports', 'geo-text-audit');
const reportJsonPath = path.join(reportRoot, 'geo-text-audit.json');
const reportCsvPath = path.join(reportRoot, 'geo-text-audit.csv');
const panelJsonPath = path.join(panelRoot, 'geo-text-audit.json');
const panelCsvPath = path.join(panelRoot, 'geo-text-audit.csv');

const requiredLocales = ['ru-ru', 'en-us', 'es-es', 'it-it', 'de-de', 'pt-br'];
const fieldMarkers = ['Meta Title:', 'Meta Description:', 'H1:', 'Seo Text:'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '') : '';
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function typePlural(type) {
  return type === 'country' ? 'countries' : 'cities';
}

function checkFields(filePath) {
  const issues = [];
  const content = readTextIfExists(filePath);
  if (!content.trim()) {
    return { ok: false, issues: ['empty_or_missing_fields'] };
  }
  for (const marker of fieldMarkers) {
    if (!content.includes(marker)) {
      issues.push(`missing_marker:${marker.replace(':', '')}`);
    }
  }
  if (/<[^>]+>/.test(content)) {
    issues.push('html_tag_in_fields');
  }
  if (content.trim().length < 120) {
    issues.push('fields_too_short');
  }
  return { ok: issues.length === 0, issues };
}

function checkHtml(filePath) {
  const issues = [];
  const content = readTextIfExists(filePath);
  if (!content.trim()) {
    return { ok: false, issues: ['empty_or_missing_html'] };
  }
  if (/<\s*h1\b/i.test(content)) issues.push('forbidden_h1');
  if (/<\s*(script|style|img|html|head|body)\b/i.test(content)) issues.push('forbidden_tag');
  if (/<p>\s*<\/p>/i.test(content)) issues.push('empty_paragraph');
  if (content.trim().length < 500) issues.push('html_too_short');
  return { ok: issues.length === 0, issues };
}

function auditItem(item) {
  const baseDir = path.join(panelRoot, 'files', typePlural(item.type), item.slug);
  const row = {
    type: item.type,
    slug: item.slug,
    name: item.name,
    country: item.country || '',
    directoryExists: fs.existsSync(baseDir),
    expectedFiles: requiredLocales.length * 2,
    existingFiles: 0,
    missingFiles: [],
    issueFiles: [],
    okLocales: 0
  };

  for (const locale of requiredLocales) {
    const fieldsPath = path.join(baseDir, `${item.slug}-${locale}-fields.txt`);
    const htmlPath = path.join(baseDir, `${item.slug}-${locale}-html-description.txt`);
    const fieldsExists = fs.existsSync(fieldsPath);
    const htmlExists = fs.existsSync(htmlPath);
    if (fieldsExists) row.existingFiles += 1;
    if (htmlExists) row.existingFiles += 1;
    if (!fieldsExists) row.missingFiles.push(`${item.slug}-${locale}-fields.txt`);
    if (!htmlExists) row.missingFiles.push(`${item.slug}-${locale}-html-description.txt`);

    const fieldsCheck = checkFields(fieldsPath);
    const htmlCheck = checkHtml(htmlPath);
    if (!fieldsCheck.ok) {
      row.issueFiles.push(`${item.slug}-${locale}-fields.txt:${fieldsCheck.issues.join('|')}`);
    }
    if (!htmlCheck.ok) {
      row.issueFiles.push(`${item.slug}-${locale}-html-description.txt:${htmlCheck.issues.join('|')}`);
    }
    if (fieldsExists && htmlExists && fieldsCheck.ok && htmlCheck.ok) {
      row.okLocales += 1;
    }
  }

  row.ok = row.directoryExists && row.existingFiles === row.expectedFiles && row.missingFiles.length === 0 && row.issueFiles.length === 0;
  return row;
}

function buildCsv(rows) {
  const header = [
    'type', 'slug', 'name', 'country', 'ok', 'directory_exists',
    'expected_files', 'existing_files', 'ok_locales', 'missing_files', 'issue_files'
  ];
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push([
      row.type,
      row.slug,
      row.name,
      row.country,
      row.ok ? '1' : '0',
      row.directoryExists ? '1' : '0',
      row.expectedFiles,
      row.existingFiles,
      row.okLocales,
      row.missingFiles.join(';'),
      row.issueFiles.join(';')
    ].map(csvEscape).join(','));
  }
  return `${lines.join('\n')}\n`;
}

const manifest = readJson(manifestPath);
const rows = manifest.items.map(auditItem);
const countryRows = rows.filter((row) => row.type === 'country');
const cityRows = rows.filter((row) => row.type === 'city');

const summary = {
  generated: new Date().toISOString(),
  pages: rows.length,
  countries: countryRows.length,
  cities: cityRows.length,
  completePages: rows.filter((row) => row.ok).length,
  completeCountries: countryRows.filter((row) => row.ok).length,
  completeCities: cityRows.filter((row) => row.ok).length,
  missingFilePages: rows.filter((row) => row.missingFiles.length > 0).length,
  issuePages: rows.filter((row) => row.issueFiles.length > 0).length,
  expectedFiles: rows.reduce((sum, row) => sum + row.expectedFiles, 0),
  existingFiles: rows.reduce((sum, row) => sum + row.existingFiles, 0)
};

const report = { summary, rows };
fs.mkdirSync(reportRoot, { recursive: true });
fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(reportCsvPath, buildCsv(rows), 'utf8');
fs.writeFileSync(panelJsonPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(panelCsvPath, buildCsv(rows), 'utf8');

console.log(JSON.stringify({
  status: summary.completePages === summary.pages && summary.missingFilePages === 0 && summary.issuePages === 0 ? 'PASS' : 'CHECK',
  reportJsonPath,
  reportCsvPath,
  panelJsonPath,
  panelCsvPath,
  summary
}, null, 2));
