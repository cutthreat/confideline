# Group posts delete/report recheck

- Status: FAIL
- Post ID: 26
- Group alias: qa-group-hide-visibility-20260510-071523-group
- Post text: QA group hide visibility 20260510-071523 post

## Checks
- PASS: VIEWER-SEES-POST-BEFORE-DELETE - До удаления viewer видит post
- PASS: ADMIN-ROW-BEFORE-DELETE - До удаления admin видит post row как Active
- FAIL: REPORT-POST-ENDPOINT - Report post endpoint дает полезный результат
- PASS: OWNER-DELETE-POST-AJAX - Owner может удалить свой post через POST/AJAX
- PASS: OWNER-DOES-NOT-SEE-DELETED-POST - После удаления owner не видит post
- PASS: VIEWER-DOES-NOT-SEE-DELETED-POST - После удаления viewer не видит post
- PASS: ADMIN-ROW-AFTER-DELETE - После delete post row отсутствует в admin posts list

## Findings
- high: GROUP-POST-REPORT-EMPTY-ACTION - Report post endpoint возвращает пустой 200 без эффекта/сообщения

## Errors
- none