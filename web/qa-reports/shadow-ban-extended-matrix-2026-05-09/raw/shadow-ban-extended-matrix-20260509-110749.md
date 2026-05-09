# Confideline Shadow Ban Extended Matrix

- Status: WARN
- Started: 2026-05-09T11:07:49.289Z
- Finished: 2026-05-09T11:13:27.575Z
- Report dir: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\shadow-ban-extended-matrix-20260509-110749

## Checks

- PASS: SHADOW-FIXTURE-BALANCE-READY - U1 имеет credits для gift-сценария (Баланс подготовлен через админку, чтобы не спутать shadow-ban с нехваткой credits.)
- PASS: SHADOW-PROFILE-BASELINE-VISIBLE - До shadow-ban профиль U1 доступен второму пользователю (Baseline подтвержден.)
- WARN: SHADOW-GIFT-BASELINE-RECIPIENT - До shadow-ban gift U1->U2 имеет recipient-side эффект (Baseline gift не дал сильного recipient evidence; shadow-check будет оценен осторожно.)
- WARN: GROUP-POST-BASELINE-OWNER-SEES - Обычный пользователь видит свою группу и пост до shadow-ban (Baseline group создана, но пост не виден в owner-side feed; shadow group post нельзя оценивать без учета этого дефекта/ограничения.)
- PASS: SHADOW-CREATE - Shadow-ban создан и подтвержден active_ban_id
- PASS: SHADOW-PROFILE-HIDDEN-FROM-VIEWER - Во время shadow-ban профиль U1 скрыт/недоступен для U2
- PASS: SHADOW-GIFT-ACTOR-SEES-SUCCESS - Shadow user отправляет gift без явной ошибки (Для U1 действие выглядит успешным.)
- PASS: SHADOW-GIFT-HIDDEN-FROM-RECIPIENT - Gift от shadow user не виден получателю
- PASS: SHADOW-PHOTO-ACCESS-ACTOR-SEES-SUCCESS - Shadow user делает photo access request без явной ошибки
- PASS: SHADOW-PHOTO-ACCESS-HIDDEN-FROM-OWNER - Photo access request от shadow user не создает нового видимого входящего эффекта владельцу (После запроса количество совпадений по shadow user у владельца не выросло.)
- PASS: SHADOW-GROUP-OWNER-SEES-OWN - Shadow user видит созданную им группу
- WARN: SHADOW-GROUP-POST-OWNER-SEES-OWN - Shadow user видит/создает пост в своей группе (Пост owner-side не найден и у обычного baseline пользователя; это общий group-post gap, не доказанный shadow-ban баг.)
- PASS: SHADOW-GROUP-HIDDEN-FROM-VIEWER - Группа/пост shadow user скрыты от второго пользователя
- PASS: SHADOW-RELEASE-CLEAN-EXTENDED - Shadow-ban снят после расширенного прохода
- PASS: SHADOW-PROFILE-RESTORED-AFTER-RELEASE - После снятия shadow-ban профиль U1 снова виден U2

## Findings

- none

## Cleanup

- ban #28: release shadow after extended matrix; status=0
