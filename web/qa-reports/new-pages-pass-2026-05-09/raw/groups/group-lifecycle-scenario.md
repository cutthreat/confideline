# Confideline Group Lifecycle Scenario

- Status: PASS
- Owner: U184 Orion Esposito
- Viewer: U166 Kaelaris Dorn Schwarz
- Group title: QA Fullsite Group 20260509-171552
- Alias: qa-fullsite-group-20260509-171552
- Post: QA group lifecycle post 20260509-171552
- Post ID: 25

## Checks

### PASS: Группа создана владельцем

- ID: GROUP-CREATE
- Комментарий: Группа создана и открылась по alias=qa-fullsite-group-20260509-171552.

### PASS: В management включены посты и участники

- ID: GROUP-MANAGEMENT-ENABLE-POSTS-MEMBERS
- Комментарий: После включения allow_post на странице группы появился composer поста.

### PASS: Пост создан и ушел в модерацию

- ID: GROUP-POST-CREATE-PENDING
- Комментарий: После отправки сайт вернул highlightPostId=25; до approve пост не виден в feed, что соответствует pending moderation.

### PASS: Пост попал в админскую очередь модерации

- ID: GROUP-POST-ADMIN-PENDING
- Комментарий: Админка показывает новый пост со статусом Pending moderation.

### PASS: Админ может одобрить пост группы

- ID: GROUP-POST-ADMIN-APPROVE
- Комментарий: После approve админка показывает созданный пост как Active.

### PASS: Группа видна другому пользователю

- ID: GROUP-VISIBILITY-OTHER-USER
- Комментарий: Другой пользователь видит созданную visible-группу в списке или на странице группы.

### PASS: Одобренный пост группы виден другому пользователю

- ID: GROUP-POST-VISIBILITY-OTHER-USER-AFTER-APPROVE
- Комментарий: После approve другой пользователь видит текст поста на странице группы.

### PASS: Страница участников группы открывается

- ID: GROUP-MEMBERS-PAGE
- Комментарий: Страница members открылась и показывает владельца/участника.

## Findings для Игоря

- Новых подтвержденных багов нет.

## Screenshots

- owner-create-form: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\owner-create-form.png
- owner-group-after-create: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\owner-group-after-create.png
- owner-group-after-management: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\owner-group-after-management.png
- owner-group-after-post: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\owner-group-after-post.png
- admin-group-post-pending: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\admin-group-post-pending.png
- admin-group-post-after-approve: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\admin-group-post-after-approve.png
- viewer-groups-list: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\viewer-groups-list.png
- viewer-group-page: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\viewer-group-page.png
- viewer-group-members: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\group-lifecycle-scenario-20260509-171552\viewer-group-members.png
