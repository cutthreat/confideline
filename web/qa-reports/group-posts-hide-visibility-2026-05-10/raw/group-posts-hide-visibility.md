# Group posts hide visibility recheck

- Status: WARN
- Group: QA group hide visibility 20260510-071523 group
- Alias: qa-group-hide-visibility-20260510-071523-group
- Post ID: 26
- Post: QA group hide visibility 20260510-071523 post

## Checks
- PASS: GROUP-CREATE - Владелец создал видимую группу
- PASS: GROUP-POST-CREATE - Пост создан владельцем группы
- PASS: ADMIN-POST-PENDING - Админ видит новый пост как Pending moderation
- PASS: ADMIN-POST-APPROVE - Админ одобрил пост, статус Active
- PASS: VIEWER-SEES-APPROVED-POST - Второй пользователь видит одобренный пост
- PASS: ADMIN-POST-HIDE - Админ скрывает пост, запись остается Hidden
- WARN: ADMIN-POST-REOPEN-ACTION - В админке есть действие повторного открытия hidden post
- PASS: VIEWER-DOES-NOT-SEE-HIDDEN-POST - Скрытый пост не виден второму пользователю

## Findings
- medium: GROUP-POST-REOPEN-ACTION-MISSING - Для hidden group post не найдено действие повторного открытия

## Errors
- none