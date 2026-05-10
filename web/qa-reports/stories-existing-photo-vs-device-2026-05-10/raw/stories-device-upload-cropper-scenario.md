# Confideline Stories Device Upload Cropper Scenario

- Status: PASS
- Asset: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\photo-stories-moderation-assets\story-postmoderation-attempt-10.jpg
- Author: U184 OrionEsposito
- Viewer: U166 KaelarisDornSchwarz

## Checks

### PASS: Настройки stories прочитаны

- ID: STORIES-CURRENT-SETTINGS
- Комментарий: storiesOn=true, mode=postmoderation, allowed=1.

### PASS: Device upload открывает cropper

- ID: STORIES-DEVICE-CROPPER-OPEN
- Комментарий: cropperReady=true.

### PASS: Cropper Next создает preview/blob

- ID: STORIES-DEVICE-PREVIEW
- Комментарий: previewOpen=true, croppedBlobReady=true.

### PASS: Publish отправляет story на сервер

- ID: STORIES-DEVICE-UPLOAD
- Комментарий: spotlight-submit 2xx=true, balanceChanged=true, balanceBefore=230, balanceAfter=180.

### PASS: Автор видит опубликованную story

- ID: STORIES-AUTHOR-VISIBILITY
- Комментарий: authorSlides=3, carousel=Add me Orion Esposito, 48 Republic of Italy, Palermo Republic of Italy, Palermo Go to profile.

### PASS: Второй пользователь видит story автора

- ID: STORIES-VIEWER-VISIBILITY
- Комментарий: viewerSlides=3, carousel=Add me Orion Esposito, 44 Republic of Italy, Palermo Germany, Munich Go to profile.

## Screenshots

- author-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\author-before.png
- author-cropper-open: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\author-cropper-open.png
- author-preview: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\author-preview.png
- author-after-publish: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\author-after-publish.png
- author-home-after-publish: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\author-home-after-publish.png
- viewer-home-after-publish: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-device-upload-cropper-scenario-20260510-121258\viewer-home-after-publish.png
