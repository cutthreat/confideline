# Geo Content QA Contract

Canonical workspace contract:

```text
H:\GPT-Codex\.ops\docs\playbooks\CONFIDELINE-GEO-CONTENT-QA-CONTRACT.md
```

## Required Check
Before handoff or publication, run:

```powershell
H:\GPT-Codex\Confideline\geo-content-production\scripts\Invoke-GeoContentQa.ps1
```

After pushing GitHub Pages updates, run:

```powershell
H:\GPT-Codex\Confideline\geo-content-production\scripts\Invoke-GeoContentQa.ps1 -CheckPublic
```

## Hard Blockers
- `panelMissedDrivePhotos > 0`
- `brokenPhotoLinks > 0`
- `driveFolderFetchFailed > 0`
- any Google Docs URL shown as a photo folder
- country count mismatch between `manifest.json` and `country-photo-audit.json`
- city count mismatch between `manifest.json` and `city-photo-audit.json`
- incomplete TXT package in `geo-text-audit.json`
- failed local or public Pages check

## Current Evidence Files
- `web/geo-content-panel/manifest.json`
- `web/geo-content-panel/content-manager-queue.csv`
- `web/geo-content-panel/drive-photo-index.json`
- `web/geo-content-panel/country-photo-audit.csv`
- `web/geo-content-panel/country-photo-audit.json`
- `web/geo-content-panel/city-photo-audit.csv`
- `web/geo-content-panel/city-photo-audit.json`
- `web/geo-content-panel/geo-text-audit.csv`
- `web/geo-content-panel/geo-text-audit.json`
- `reports/geo-content-qa/latest.json`

## Status Semantics
- `ok_confirmed`: panel and fresh Drive scan both confirm 2 photos.
- `preserved_links_confirmed`: panel has 2 working photo links, but Drive listing did not expose them in the fresh scan.
- `drive_folder_missing_photos`: Drive folder exists, but fewer than 2 photos are found.
- `no_drive_folder`: no separate Drive photo folder is known.
- `panel_missed_drive_photos`: blocker.
- `panel_has_broken_photo_link`: blocker.
- `drive_folder_fetch_failed`: blocker.
