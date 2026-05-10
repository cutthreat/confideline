# Group posts reopen visibility recheck

- Status: PASS
- Post ID: 26
- Group alias: qa-group-hide-visibility-20260510-071523-group
- Post text: QA group hide visibility 20260510-071523 post

## Checks
- PASS: VIEWER-BEFORE-REOPEN-HIDDEN - До reopen скрытый пост не виден viewer
- PASS: ADMIN-HIDDEN-ROW-HAS-APPROVE - На hidden row есть Approve post
- PASS: ADMIN-APPROVE-REOPENS-HIDDEN-POST - Approve post повторно открывает hidden post в админке
- PASS: VIEWER-SEES-REOPENED-POST - После reopen viewer снова видит тот же пост

## Findings
- info: GROUP-POST-REOPEN-IS-APPROVE - Approve post на hidden row фактически работает как reopen

## Errors
- none