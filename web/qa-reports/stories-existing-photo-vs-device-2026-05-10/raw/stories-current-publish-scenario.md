# Confideline Stories Current Publish Scenario

- Status: FAIL
- Author: U184 OrionEsposito
- Viewer: U166 KaelarisDornSchwarz
- Settings: storiesOn=true, mode=postmoderation, allowedTimeNextStory=1

## Checks

### PASS: Текущие настройки stories прочитаны из админки

- ID: STORIES-CURRENT-SETTINGS
- Комментарий: storiesOn=true, mode=postmoderation, allowedTimeNextStory=1.

### PASS: В modal stories есть существующие фото для публикации

- ID: STORIES-EXISTING-PHOTO-MODAL
- Комментарий: Найдено existing photo radio inputs: 2.

### FAIL: Next после выбора существующего фото открывает cropper/preview

- ID: STORIES-EXISTING-PHOTO-NEXT-OPENS-CROPPER
- Комментарий: После выбора photo radio и клика Next modal закрылась, S3 image fetch вернул 200, но cropper/preview не открылся.

### INVALID: Автор видит опубликованную story в carousel

- ID: STORIES-AUTHOR-VISIBILITY-AFTER-PUBLISH
- Комментарий: Visibility не оценивается: existing-photo flow не дошел до publish, поэтому старые story-card нельзя считать доказательством новой публикации.

### INVALID: Второй пользователь видит story автора в carousel

- ID: STORIES-VIEWER-VISIBILITY-AFTER-PUBLISH
- Комментарий: Visibility не оценивается: existing-photo flow не дошел до publish, поэтому проверка второго пользователя не доказывает новую story.

## Findings для Игоря

- high: STORIES-EXISTING-PHOTO-NEXT-001 - Stories existing-photo publish: Next closes modal but does not open cropper/preview

## Screenshots

- author-before: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\author-before.png
- author-modal-open: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\author-modal-open.png
- author-photo-selected: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\author-photo-selected.png
- author-after-next-click: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\author-after-next-click.png
- author-after-home-reload: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\author-after-home-reload.png
- viewer-after-author-attempt: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\stories-current-publish-scenario-20260510-121049\viewer-after-author-attempt.png
