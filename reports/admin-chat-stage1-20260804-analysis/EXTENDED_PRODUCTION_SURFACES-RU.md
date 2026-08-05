# Admin Agent Chat — production-поверхности для внедрения

## Назначение документа

Этот документ фиксирует backend, persistence, права, audit и приёмку для всех функций, которые уже показаны в утверждённом HTML/CSS/JS-макете, но ещё не подключены к production Yii2. Это не новый дизайн и не набор альтернатив: макет и описанное ниже поведение являются согласованной основой интеграции.

Источник: `admin-chat-stage1-20260804-handoff.rar`, SHA-256 `1D111B27B71060174323BE17278F89BA2680DFB00262B591A52F40A193D605F3`.

## Общие правила интеграции

| Правило | Требование |
|---|---|
| Источник истины | Сервер решает права, назначение анкеты, состояния консультации, billing, цензуру, доставку и таймеры. Browser только отображает серверный snapshot. |
| Авторизация | Каждая запись повторно проверяет текущего actor, роль и назначение `client + expert_profile`. Прямой URL, подмена `conversation_id` или `actor_id` не дают доступ. |
| Идентичность | В клиентском сообщении показывается публичный автор. В staff-audit сохраняются фактический человек, роль, назначенная анкета, причина, время и версия правил. |
| Изоляция | Ответ, событие или optimistic update применяется только к тому `conversation_id`, для которого он был запрошен. Поздний ответ при переключении диалога отбрасывается. |
| Повтор | Каждая мутация получает `idempotency_key` и, где есть состояние, `expected_*_version`. Повтор запроса не создаёт второй message, asset, schedule, debit или audit-факт. |
| Ответ | Успех: `{ok:true,...}`. Ошибка: `{ok:false,code,message,request_id}` плюс свежий релевантный snapshot. Используются 403 (RBAC), 409 (version/idempotency conflict), 422 (policy/state), 503 (dependency). |
| Ошибка UI | Пока запрос выполняется, кнопка заблокирована. При ошибке optimistic state откатывается, пользователь видит понятное сообщение, исходный ввод сохраняется, если это безопасно. |
| Audit | Audit не заменяется логом браузера. Сервер пишет факт до ответа/в одной транзакции с изменяемым объектом; super-admin видит старые и новые значения, actor, причину и request id. |
| Realtime | События имеют стабильный `event_id`/`message_id`; клиент дедуплицирует их. Realtime не обходится для billing, moderation или RBAC. |
| Политика файлов | В MVP разрешены только изображения и документы. Аудио, voice, видео и произвольные файлы запрещены независимо от расширения. |
| AI | AI только помогает внутреннему Агенту. AI не отправляет клиенту сообщение, не меняет session/billing и не обходится через shortcut или package action. |

## Матрица незавершённых production-поверхностей

### 1. Изображения и документы

| Поле | Контракт |
|---|---|
| UI | `#btnUploadPhotoDevice`, `#btnUploadPhoto`, `#btnUploadFile`; один staged preview; device File не восстанавливается после перезагрузки, серверный token — восстанавливается. Источник: `chat-stage1.html:1463-1475`, `agent_chat_custom.js:5657-5709,7238-7290,7607-7688`. |
| Действие | Pre-upload до отправки сообщения: `POST /admin/messages/attachments/preupload` (multipart). |
| Запрос | `conversation_id`, `expert_profile_id`, `kind=image|document`, `file`, `idempotency_key`. Браузер не отправляет в финальном message raw File, URL или имя как доверенный идентификатор. |
| Ответ | `{ok:true,attachment:{id,kind,mime,size,scan_status,preview_url,expires_at},policy_version}`. Допустимый `scan_status`: `pending`, `passed`; `failed` не разрешает отправку. |
| Финальная отправка | Обычный `POST /admin/messages` получает `attachment_ids[]`. Сервер связывает asset с conversation и actor; чужой conversation его не видит. |
| Проверки | Права и assignment; MIME по сигнатуре, а не по расширению; size/count/quota; image/document scan; OCR/QR и chat policy из «Настройки чата». Непроверяемый или запрещённый объект отклоняется. |
| Видимость | До `passed` объект приватен. Получатель видит только разрешённую версию; исходный файл и извлечённые запрещённые данные не восстанавливаются через quote, history, search или notification. |
| Сбой/повтор | Ошибка pre-upload не создаёт message; можно повторить. Один `idempotency_key` даёт один asset и одну доставку. Token с истёкшим `expires_at` требует нового pre-upload. |
| Audit/приёмка | `attachment_scan`, `attachment_rejected`, `message_attachment_created`; actor, policy_version и причина. Положительно: image/document доставляется. Отрицательно: audio/video/arbitrary, замаскированный MIME и непроверяемый файл не создают outgoing message. |

### 2. Voice и audio

| Поле | Контракт |
|---|---|
| Текущее UI | `#btnVoiceMessage` и `#btnUploadAudio` существуют для показа состояния, но `voiceMessagesEnabled=false`; voice скрыт/disabled. Источник: `agent_chat_custom.js:77-88,6942-6954,7762-7770`. |
| MVP-правило | Не добавлять production voice/audio transport. Сервер обязан отклонять forged payload или multipart с аудио: `422 ATTACHMENT_TYPE_FORBIDDEN`. |
| Безопасность | Нельзя обойти запрет переименованием, `Content-Type` или прямым вызовом endpoint. Не создаются asset, message, billing, audit-success или notification. В audit сохраняется только policy rejection. |
| Приёмка | Видимый клиенту/Агенту composer не предлагает audio/voice; прямой запрос получает стабильную ошибку без утечки содержимого. Включение в будущем — отдельная change request, а не скрытая часть этой интеграции. |

### 3. Обновление AI summary

| Поле | Контракт |
|---|---|
| UI | `.js-ai-summary-refresh` блокирует себя на запрос; новое входящее сообщение делает summary stale. Источник: `chat-stage1.html:1535-1564`, `agent_chat_custom.js:1092-1175`. |
| Действие | `POST /admin/messages/conversations/{id}/ai/summary`. |
| Запрос | `conversation_id`, `context_version`/`message_cursor`, `requested_from:'ai_summary_refresh'`, `requested_at`, `idempotency_key`. |
| Ответ | Для текущего UI: `202 {ok:true,request_id,job_id,context_json:{apply_sections:['ai'],ai:cached_safe_state}}`. Worker после расчёта публикует canonical `ai` snapshot по realtime. Если backend может ответить быстро, допускается `200` с тем же envelope. |
| Источник данных | Только разрешённые server-moderated messages/context текущей пары и актуальный cursor. AI не получает контакты, платёжные данные и скрытые staff-заметки. |
| Versioning | В generation сохраняются `job_id`, source cursor, output version и actor. Устаревший результат не перезаписывает summary после более нового сообщения. |
| Ошибки | Timeout/dependency оставляет старое summary и показывает stale/error, не очищает безопасный контекст. Повтор с тем же idempotency key не создаёт двойную генерацию. |
| Audit/приёмка | `ai_summary_requested`, `ai_summary_updated`; no client delivery. Положительно: обновляется только открытый диалог. Отрицательно: AI не меняет деньги/session, не раскрывает private note и не отправляет текст клиенту. |

### 4. Использование AI draft

| Поле | Контракт |
|---|---|
| UI | `.js-ai-draft-insert` только вставляет безопасный текст в `#messageInput`, ставит focus и dispatches `input`; send не вызывается. Источник: `agent_chat_custom.js:1118-1132`. |
| MVP действие | Вставка остаётся локальной и обратимой. Допустим необязательный non-blocking telemetry/audit: `POST /admin/messages/conversations/{id}/ai/draft-used` с `generation_id`, `draft_version`, `conversation_id`, `idempotency_key`. |
| Ответ | `{ok:true,audit_id}`. Ошибка telemetry не блокирует редактирование и отправку. |
| Граница | Draft не message, не delivery и не доказательство ответа клиенту. Финальная отправка проходит обычные assignment, censorship, quality/send guard и paid-session проверки. |
| Audit/приёмка | Можно связать финальное сообщение с версией подсказки, но не хранить сырой model context или секреты. Повтор insert не создаёт message и не списывает credits. |

### 5. Private Notes: Save/Clear

| Поле | Контракт |
|---|---|
| UI | `#tab-notes`, `#contextNoteInput`, `.js-context-note-save`, `.js-context-note-clear`; Save optimistic, Clear очищает только несохранённый textarea. Источник: `agent_chat_custom.js:1891-2042`. |
| Save | `POST /admin/messages/conversations/{id}/context/notes` с `{text,idempotency_key,request_id}`. |
| Ответ | `{ok:true,note:{id,author,actor_id,role,created_at,text,pinned:false},audit_id}`; id и timestamp канонические серверные. |
| Права/видимость | Assigned Agent может создать note; super-admin видит полный audit. Client, Expert front и realtime message stream note не получают. Note не переводится, не появляется в поиске клиента и не участвует в billing. |
| Sanitization | Сервер очищает markup/опасные данные, хранит private note и audit атомарно. Старое значение не удаляется браузером. |
| Сбой/повтор | При API failure optimistic row удаляется, введённый текст возвращается. Retry с тем же key даёт одну note. Ответ после переключения диалога не меняет другую вкладку. |
| Clear | Endpoint не нужен и не должен удалять saved note; только `textarea.value=''` и UI feedback. |

### 6. Follow / postpone

| Поле | Контракт |
|---|---|
| UI | `.js-follow-postpone` на вкладке Follow. Нажатие переносит следующий контакт и само не отправляет клиенту сообщение. Источник: `agent_chat_custom.js:2045-2164`. |
| Действие | `POST /admin/messages/conversations/{id}/follow`. |
| Запрос | `{action:'postpone_until_tomorrow',follow_version,requested_by,idempotency_key}`. |
| Ответ | `{ok:true,follow:{status,next_touch_utc,next_touch_local,timezone,remaining_cycles,reason,eligible_channels,policy_version},audit_id}`. |
| Server policy | Сервер считает timezone, business hours, eligible channel, rate limit, лимиты циклов и актуальный status. Worker позже выполняет допустимый Push/Ping/chat по notification policy; browser не рассчитывает дату. |
| Граница | Click не создаёт client message/Push, не меняет paid/trial/balance, не запускает timer. Отклонение: feature disabled, exhausted limit, version conflict или actor не назначен. |
| Audit/приёмка | Повтор даёт один schedule. Время и причина читаются из server snapshot. Нет доставки вне policy и нет скрытого billing transition. |

### 7. Assign

| Поле | Контракт |
|---|---|
| UI | `.js-chat-control[data-chat-control-action="assign"]` в панели управления composer (`chat-stage1.html:1218-1221`, `agent_chat_custom.js:7552-7604`). В макете нет picker. |
| Смысл MVP | Claim текущей свободной/pre-consult conversation текущим Агентом; это не произвольный transfer и не назначение чужой анкеты. |
| Действие | `POST /admin/messages/conversations/{id}/assignment`. |
| Запрос/ответ | `{action:'claim_current',expected_assignment_version,idempotency_key}` → `{ok:true,assignment:{expert_profile_id,agent_id,status,version,effective_at},audit_id}`. Actor берётся server-side из auth context. |
| Проверки | Agent должен владеть назначенной Expert profile; conversation должна быть claimable. Conflict с другим actor — `409 ASSIGNMENT_CONFLICT`. `paid`, `balance_pause`, `reconnecting` — `422 REASSIGNMENT_BLOCKED_SESSION_ACTIVE`. |
| Граница transfer | Emergency/reassignment — только отдельный super-admin route с обязательной причиной; этой компактной кнопкой не выполняется. Исторические authors, price, debits и quality context не меняются. |
| Приёмка | После claim ровно один разрешённый author; чужой actor и прямой payload не могут отправлять. Повтор не создаёт второе назначение. |

### 8. Note control

| Поле | Контракт |
|---|---|
| UI | `.js-chat-control[data-chat-control-action="note"]` — соседняя кнопка в composer control panel. |
| Смысл | Только открыть/активировать существующую вкладку Notes и сфокусировать `#contextNoteInput`; не создаёт пустую note и не вызывает backend. Сохранение выполняется только по Surface 5. |
| Приёмка | Нажатие не раскрывает note клиенту, не пишет пустую запись, не меняет очередь. Keyboard focus попадает в private textarea. |

### 9. Resolve

| Поле | Контракт |
|---|---|
| UI | `.js-chat-control[data-chat-control-action="resolve"]`; browser сейчас делает optimistic toggle и ожидает canonical control. |
| Смысл | Закрыть только work item/support queue task. Не завершать permanent free dialogue и не менять lifecycle consultation (это владелец G1.3). |
| Действие | `POST /admin/messages/conversations/{id}/controls`. |
| Запрос/ответ | `{action:'resolve',expected_control_version,idempotency_key}` → `{ok:true,control:{action:'resolve',enabled:true},conversation:{work_status:'resolved',queue_visibility,...},audit_id}`. |
| Проверки | Разрешено для eligible free/completed work item; active `connecting`, `trial`, `paid`, `balance_pause`, `reconnecting` блокируются. Нужны assignment и permission. |
| Reopen | Новое входящее client-событие может открыть work item отдельным server event. Это не отменяет завершённую consultation. |
| Запрещено | Нет client message, debit, timer, delete или final consultation completion. При отказе UI откатывает toggle. |

### 10. Package action / Pay

| Поле | Контракт |
|---|---|
| UI | Pay/Package controls (`#btnSendTopUp`, `.js-send-package-link`) используют server-produced `message_html`. Источник: `agent_chat_custom.js:2726-2865`, `chat-stage1.html:1682-1700`. |
| Действие | `POST /admin/messages/conversations/{id}/billing/action`. |
| Запрос/ответ | `{action:'send_package_link',eligible_offer_context_version,idempotency_key}` → `{ok:true,billing_action:{id,status,package_id,package_version,quote_expires_at},message:{message_id,card_type:'billing_offer'},message_html,session_snapshot?}`. |
| Server selection | Сервер выбирает активный admin-configured credit package/coupon offer, проверяет client eligibility, assignment, fraud/safety block и текущую price/discount version. Если вариантов несколько — возвращает selector context; если один — canonical card link. |
| Граница денег | Клик не списывает credits, не меняет цену session и не auto-resume balance pause. Checkout и явное продолжение консультации — отдельные действия клиента. |
| Отображение | В bubble только `message_html` с `data-message-card-type="billing_offer"`; raw checkout URL не вставляется в текст, browser не придумывает production URL. |
| Повтор/audit | Transaction создаёт billing action + canonical card message + audit и realtime event exactly once. Повтор не создаёт второй offer. |

### 11. Compact mode и sound

| Поле | Контракт |
|---|---|
| UI | Header toggles `data-setting="compact_mode|sound"` меняют class/label. Сейчас persistence нет: `chat-stage1.html:81-94`, `global_custom.js:584-623`. |
| Действие | `PATCH /admin/operator/preferences`. |
| Запрос/ответ | `{expected_version,preferences:{compact_mode:boolean,notification_sound:boolean}}` → `{ok:true,preferences:{...},version,updated_at}`. |
| Persistence | Значения хранятся в профиле текущего оператора; local cache допускается только для мгновенного UI и восстановления до server readback. Responsive auto-compact по ширине остаётся отдельным правилом. |
| Права/эффект | Сам оператор меняет свои preference; super-admin может просмотреть/исправить через settings/audit. Нет влияния на conversation, session, price или billing. |
| Сбой/приёмка | Network failure откатывает toggle. После reload/другого устройства состояние совпадает с сервером. Sound не проигрывается при восстановлении старой сессии; он подчиняется правилу paid-session event. |

### 12. Горячие клавиши

| Поле | Контракт |
|---|---|
| UI | В меню есть пункт «Горячие клавиши», но transport/control отсутствует (`chat-stage1.html:90-94`). |
| Backend | Endpoint не нужен. Меню открывает локализованное accessibility-modal со списком реально реализованных shortcut. |
| Правила | Shortcut не срабатывает внутри input/textarea/select, активной modal или browser-native контрола, если это конфликтует с вводом. `Esc` только закрывает transient UI. Shortcut вызывает те же handlers/guards, что и видимая кнопка. |
| Безопасность | Shortcut не может сделать действие, недоступное через UI: send lock, censorship, quality guard, assignment и paid-session state всегда обязательны. Нет скрытого auto-send. |
| Audit/приёмка | Отдельный audit не нужен; обычное действие пишет свой audit. Modal доступна с клавиатуры, имеет локализованные labels и не меняет state только от открытия. |

### 13. Copy history (сохранённая функция admin-макета)

| Поле | Контракт |
|---|---|
| UI | Кнопка `Copy history` в Client/Support info. Это не клиентская кнопка и не download/export. |
| Доступ | В MVP только super-admin; позднее staff получают право через существующий permissions-контур. Assigned Agent получает только доступную ему пару; client не получает кнопку или endpoint. |
| Содержимое | Только server-safe текущий dialogue/связанный session-контекст: сообщения и системные события, которые разрешены этому actor. Исключить private Notes, censored originals, payment data, internal IDs и staff comments. |
| Server boundary | Server отдаёт safe copy payload или подписанную версию текущего safe history; browser не собирает скрытые поля из DOM и не раскрывает raw moderation data. |
| Audit | `history_copied` с `conversation_id`, actor, role, scope, timestamp, policy/rule version и result. Повторное копирование не меняет messages/session/billing. |
| Приёмка | Agent не копирует чужую пару; super-admin видит audit; copied text не является публичным экспортом и не содержит данных, запрещённых получателю. |

## Связь с существующими границами

1. **G1.2 role-based chat** владеет ролями, assignment visibility, message/attachment policy, censorship, delivery/edit/read, private notes, safe admin copy и chat-specific settings.
2. **G1.3 consultation lifecycle** единолично владеет trial/paid/pause/reconnect/technical-end состояниями, таймерами, consent и итогом consultation. Resolve не подменяет lifecycle.
3. **G1.1 consultation card** только отображает server snapshot связанной consultation; package/pay использует существующую billing boundary.
4. **G2 credits/payment** владеет ценой, пакетами, coupons, checkout, refund и transaction. Package action отправляет offer-card, но не списывает деньги.
5. **G1.4 notifications** владеет каналами, quiet hours, задержками и worker-доставкой; Follow создаёт намерение, а не отправляет уведомление напрямую.
6. **RBAC/permissions** остаётся существующим контуром `/ru/admin/settings/role`; на странице «Настройки чата» не создаётся новая роль. В MVP весь конфиг/monitoring — super-admin.

## Shared DoD для Игоря

Интеграция считается готовой только после всех пунктов:

- для каждой поверхности есть endpoint/route, серверная авторизация и schema validation;
- positive + negative test проведены в реальном Yii2 transport, а не только в demo preview;
- persisted readback подтверждает asset/message/note/follow/assignment/control/preference и audit;
- повтор одного запроса не создаёт дубликат;
- response после смены conversation не изменяет другой диалог;
- client/assigned Agent/super-admin проверены раздельно по правам и видимости;
- ошибки 403/409/422/503 показываются безопасно и дают свежий snapshot;
- realtime events имеют стабильный id и проходят dedupe;
- запрещённые audio/video/arbitrary files проверены прямым forged request;
- AI не отправляет клиенту текст и не меняет деньги/session;
- screenshot/trace каждого позитивного сценария и negative evidence приложены к приёмке;
- существующие четыре static verifiers остаются зелёными: badge, message, control, paid-session.

## Что не утверждается этим документом

Production integration ещё не выполнена этим проходом. Здесь закрыта спецификация незавершённых surfaces и их границы; сайт, database schema и backend-код не изменялись. Любое отклонение от таблицы требует отдельного согласования и обновления этого контракта до начала разработки.
