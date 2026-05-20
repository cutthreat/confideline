import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const roots = {
  countries: '1YoOZHnH7lNuFsHFUT4JqOvLG1mjqopsl',
  cities: '1mbsK3pRrUbEN2grjJQs5NgTIh-3FCVOj'
};
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const productionDir = path.resolve(scriptDir, '..');
const projectRoot = path.resolve(scriptDir, '..', '..');
const outputPath = path.join(productionDir, 'drive-photo-index.json');
const panelOutputPath = path.join(projectRoot, 'web', 'geo-content-panel', 'drive-photo-index.json');

function slugifyTitle(title) {
  return title
    .replace(/_Astro$/i, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function driveFolderUrl(id) {
  return `https://drive.google.com/drive/folders/${id}`;
}

function driveFileViewUrl(id) {
  return `https://drive.google.com/file/d/${id}/view`;
}

function driveFileDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

async function fetchDriveFolder(folderId) {
  const response = await fetch(driveFolderUrl(folderId), {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  if (!response.ok) {
    throw new Error(`Drive fetch failed ${response.status} for ${folderId}`);
  }
  return response.text();
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
      .filter((name) => name && name !== '—')
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

function readPreviousIndex() {
  for (const candidate of [outputPath, panelOutputPath]) {
    if (!fs.existsSync(candidate)) continue;
    try {
      return JSON.parse(fs.readFileSync(candidate, 'utf8').replace(/^\uFEFF/, ''));
    } catch {
      continue;
    }
  }
  return null;
}

function mergeSectionWithPrevious(section, previousSection = {}) {
  const merged = { ...previousSection };
  for (const [slug, entry] of Object.entries(section)) {
    const previous = previousSection[slug];
    const currentPhotoCount = entry.photos?.length || 0;
    const previousPhotoCount = previous?.photos?.length || 0;
    merged[slug] = currentPhotoCount >= previousPhotoCount
      ? entry
      : {
          ...entry,
          photos: previous.photos,
          missingPhotoSlots: Math.max(0, 2 - previousPhotoCount)
        };
  }
  return merged;
}

async function collectImagesFromFolder(folderId, depth = 0) {
  const html = await fetchDriveFolder(folderId);
  const entries = parseDriveEntries(html);
  const images = entries
    .filter((entry) => entry.mimeType.startsWith('image/'))
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      mimeType: entry.mimeType,
      viewUrl: driveFileViewUrl(entry.id),
      downloadUrl: driveFileDownloadUrl(entry.id)
    }));

  if (images.length >= 2 || depth >= 1) {
    return images;
  }

  const childFolders = entries.filter((entry) => entry.mimeType === 'application/vnd.google-apps.folder');
  for (const child of childFolders) {
    const childImages = await collectImagesFromFolder(child.id, depth + 1).catch(() => []);
    images.push(...childImages);
    if (images.length >= 2) break;
  }
  return images;
}

async function buildSection(sectionName, folderId) {
  const rootHtml = await fetchDriveFolder(folderId);
  const rootEntries = parseDriveEntries(rootHtml);
  const bySlug = new Map();
  for (const entry of rootEntries) {
    const slug = slugifyTitle(entry.title);
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (!existing || entry.mimeType === 'application/vnd.google-apps.folder') {
      bySlug.set(slug, entry);
    }
  }

  const result = {};
  for (const [slug, entry] of bySlug.entries()) {
    const isFolder = entry.mimeType === 'application/vnd.google-apps.folder';
    const folderUrl = isFolder ? driveFolderUrl(entry.id) : null;
    const sourceUrl = isFolder
      ? folderUrl
      : entry.mimeType === 'application/vnd.google-apps.document'
        ? `https://docs.google.com/document/d/${entry.id}/edit`
        : driveFileViewUrl(entry.id);
    const photos = isFolder ? (await collectImagesFromFolder(entry.id).catch(() => [])) : [];
    result[slug] = {
      type: sectionName === 'countries' ? 'country' : 'city',
      slug,
      title: entry.title,
      sourceId: entry.id,
      sourceMimeType: entry.mimeType,
      sourceUrl,
      photoFolderUrl: folderUrl,
      photos: photos.slice(0, 2),
      missingPhotoSlots: Math.max(0, 2 - photos.length)
    };
  }
  return result;
}

const previousIndex = readPreviousIndex();
const currentCountries = await buildSection('countries', roots.countries);
const currentCities = await buildSection('cities', roots.cities);

const index = {
  generated: new Date().toISOString(),
  roots: {
    countries: driveFolderUrl(roots.countries),
    cities: driveFolderUrl(roots.cities)
  },
  countries: mergeSectionWithPrevious(currentCountries, previousIndex?.countries || {}),
  cities: mergeSectionWithPrevious(currentCities, previousIndex?.cities || {})
};

index.summary = {
  countriesIndexed: Object.keys(index.countries).length,
  citiesIndexed: Object.keys(index.cities).length,
  locationsWithTwoPhotos:
    Object.values(index.countries).filter((item) => item.photos.length >= 2).length +
    Object.values(index.cities).filter((item) => item.photos.length >= 2).length,
  locationsWithOnePhoto:
    Object.values(index.countries).filter((item) => item.photos.length === 1).length +
    Object.values(index.cities).filter((item) => item.photos.length === 1).length,
  locationsWithNoPhotos:
    Object.values(index.countries).filter((item) => item.photos.length === 0).length +
    Object.values(index.cities).filter((item) => item.photos.length === 0).length
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf8');
fs.mkdirSync(path.dirname(panelOutputPath), { recursive: true });
fs.writeFileSync(panelOutputPath, JSON.stringify(index, null, 2), 'utf8');

console.log(JSON.stringify({
  status: 'PASS',
  outputPath,
  panelOutputPath,
  summary: index.summary
}, null, 2));
