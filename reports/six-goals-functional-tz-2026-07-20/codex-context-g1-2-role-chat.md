# Технический контекст для Codex Игоря — G1.2 «Чат по ролям»

## 1. Назначение

Этот файл передаётся Codex вместе с `etalon-tz-g1-2-role-chat.md`. PM-ТЗ определяет желаемое продуктовое поведение. Этот файл даёт навигацию по текущему контексту, обязательным инвариантам и проверке, но не предписывает Игорю архитектуру.

## 2. Паспорт

- Task: `G1.2`
- Priority: `P0`
- Product owner: Nebula
- Required product artifact: `etalon-tz-g1-2-role-chat.md`
- Specification status: `spec_handoff_ready`
- Implementation/runtime status: требует подтверждения на выбранном build
- Public actor: `Эксперт`
- Internal actor: `Агент`
- MVP staff: moderator with support duties; super-admin

## 3. Source truth и граница доказательств

При расхождении источников применяется следующий порядок приоритета:

1. актуальные решения Product Owner и `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-2-role-chat.md` — продуктовые правила G1.2;
2. `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\codex-context-badge-resolver-ru.md` вместе с `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\badge-resolver-rules-ru.csv` — единственный актуальный источник семантики, области действия и совместимости бейджей;
3. `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-1-service-session.md` и `H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20\etalon-tz-g1-3-status-history.md` — границы карточки и lifecycle consultation session;
4. `H:\GPT-Codex\Confideline\reports\admin-chat-stage1-20260804-analysis\EXTENDED_PRODUCTION_SURFACES-RU.md` — приложение с ожидаемыми production-поверхностями admin-макета; названия endpoint, таблиц и сервисов разрешено адаптировать к фактически найденной архитектуре, не меняя наблюдаемого продуктового поведения;
5. `H:\GPT-Codex\Confideline\reports\admin-chat-stage1-20260804-analysis\PANEL-TZ-G1-2-DISCREPANCIES-RU.md` — исторический реестр сверки, а не самостоятельный нормативный источник.

Дополнительный канонический ответный пакет по кнопкам, шаблонам, языку, переводам, переменным и ссылкам: `codex-context-g1-2-actions-templates-answers-ru.md`. Он имеет приоритет над визуальными предположениями макета в перечисленных темах.

Техническая основа HTML-чата и его контрактов передана архивом
`admin-chat-stage1-20260804-handoff.rar`. Для области-за-областью сверки
использовать `G1_ARCHIVE_HTML_CONTRACT_AUDIT_2026-08-14.md`. Архивные
`CHAT_QUEUE_CONTRACT.md`, `CHAT_MESSAGE_DATA_CONTRACT.md` и
`PAID_SESSION_CONTRACT.md` задают hooks, payload и server-authoritative
интеграционные точки. Их demo-значения и разделы `Open Production Decisions`
не являются доказательством runtime-ready.

Файл `H:\GPT-Codex\Confideline\reports\tz-product-g1-2-role-chat-consultation-2026-07-16.md` архивный и заменён настоящим пакетом. Его нельзя использовать для разрешения текущих продуктовых или технических разногласий.

Известные текущие админ-поверхности:

- `/ru/admin/settings/index`
- `/ru/admin/settings/role`
- существующий раздел «Сообщения»

Исторические proof и статические макеты являются навигацией, а не доказательством готового runtime. Перед изменениями нужно подтвердить актуальные controller, permission, message-send, attachment, notification и history contours выбранного build.

## 4. Каноническая продуктовая модель

1. Один постоянный dialogue для пары `client + public expert profile`.
2. Free async messages принадлежат dialogue и не создают billing.
3. Каждая paid consultation — отдельная session внутри dialogue.
4. Client-facing author — public Expert, кроме явных Support Nebula messages.
5. Internal actual actor, assignment and rule version immutable in history.
6. Один Agent может иметь не более одной active `paid`/`balance_pause` session.
7. Reassignment запрещён при active paid/pause и не переписывает историю.
8. Agent accept клиентского request остаётся pre-session и только открывает confirmation card.
9. Для обоих initiation paths exactly one session создаётся только после committed explicit client consent; trial не заменяет consent.

Если текущая система использует другие технические сущности, реализация должна всё равно обеспечить эти наблюдаемые свойства.

## 5. Роли и ACL-инварианты — Invariants и неизменяемые правила

- Client: только собственные dialogue/session/history и recipient-safe content.
- Agent: только назначенные expert profiles и history пары current client + assigned profile.
- Moderator: support/safety/quality actions; client-visible author «Поддержка Nebula».
- Super-admin: full audit/config; emergency intervention requires reason.
- UI-ограничение недостаточно: прямой URL, AJAX/API request, retry и stale page должны проходить ту же authorisation.
- Contact, payment data and internal identifiers are hidden from Agent.
- Restricted censored original: MVP super-admin only; every view audited.

## 6. States и transitions

Dialogue mode:

- `free_async`
- `consultation_requested`
- `expert_unavailable`
- `consultation_attached`
- `returned_to_free`

Session states and transitions are owned only by G1.3. G1.1 displays the administrative card. G1.2 renders chat permissions and trial/paid/pause/reconnect/end meanings received from G1.3 without creating a competing lifecycle.

Invalid transitions must fail without message, debit, session, incident or coupon side effects.

## 7. Message contract

Allowed: text, system, emoji, approved images, approved documents.

Forbidden: audio, video, arbitrary/uninspectable file.

Observable delivery states: sending, delivered, read, not sent, retry.

Required properties:

- delivery and retry idempotency;
- conditional edited marker: show it to the Client only when the message had been read before the Expert edit; keep every previous version for super-admin in all cases;
- no physical deletion for consultation messages;
- staff hide with mandatory reason and audit;
- the template picker and `Needs reply`/`Assign`/`Note`/`Resolve` controls are visual action points; button semantics are deferred by PM. The template catalog has three scopes: super-admin system templates, Expert-scoped templates, and personal Operator templates;
- the initial system set is created and published by super-admin in the separate system-template function. Public Expert is not a separate admin user: an assigned Agent/Operator with the template-management permission for that expert profile creates/edits/archives Expert-scoped templates; super-admin has full access, while other assigned operators may use them according to permissions. Personal templates are created/edited/archived only by their operator owner. MVP does not add a template revision history or dedicated template audit. The HTML mock does not auto-approve its ten texts;
- a template record requires a name, category/scenario, exactly one availability placement (`pings`, `active_chat`, or `paid_chat`), approved RU text, approved EN text and the allowlisted variables used by the text;
- if these controls are rendered before the follow-up decision, they must be disabled/feature-flagged and have no server-side side effects;
- no automatic AI/template send; this invariant remains active for any future implementation.

Client-message editing remains disabled/unintroduced until a separate PM decision.

## 8. Censorship contract

Guard directions: Client → Expert and Agent/Expert → Client.

Category policy is admin-managed and versioned. Recipient payload/history/notification/search/reply must contain the safe version only. Sender continues to see original plus a separate warning.

The event must bind:

- original message identity;
- recipient-safe text;
- detected categories;
- actor and role;
- client and public expert profile;
- dialogue/session;
- policy version;
- action and timestamps;
- repeat count.

Do not duplicate the moderation queue in Settings. Monitoring belongs in existing «Сообщения» contour; configuration belongs in `/ru/admin/settings/chat`.

## 9. Attachments

Extension-only validation is insufficient. Implementation must cover:

- permitted MIME/content combinations;
- size and attachment-count limits;
- image/document inspection;
- QR/OCR or equivalent contact-data channel coverage where applicable;
- fail-safe behavior for uninspectable content;
- no delivery before required validation finishes.

Global photo settings should be reused or referenced, not copied into chat settings.

## 10. Reconnect, SLA and idempotency

G1.3/G6 own reconnect and SLA timers, state transitions, technical end and compensation eligibility. G1.2 consumes those facts, renders the correct chat state and guarantees message delivery/idempotency; it must not start those timers, end the session or grant compensation.

Client reconnect grace default is 60 seconds, managed in consultation settings separately from Agent reconnect.

During client grace no new paid minute starts. Timeout gives technical end plus support route and does not auto-grant compensation.

Agent/Expert SLA failure completes only the already-started minute, prevents the next, creates one incident and shows a truthful client message. Compensation minutes may be named only after a linked coupon exists.

Use a stable operation/message identity or equivalent mechanism so repeat delivery cannot duplicate recipient message, warning, incident, coupon, debit or session.

## 11. Persistence, audit and historical readback

Historical readback must recover:

- public Expert;
- actual actor/editor;
- assignment at event time;
- dialogue and session;
- client-visible state;
- original/previous versions under correct access;
- recipient-safe content;
- applied configuration version;
- staff reason/action;
- reconnect/technical end/incident links.

Changing a setting or assignment must not rewrite prior events. G1.3/G4.3 own consultation-history availability and retention; the provisional default is 24 months after completion, managed in that lifecycle/privacy contour and pending legal/privacy review. G1.2 must preserve the message/audit data required by that contract and must not expose retention controls on `/admin/settings/chat`.

The accepted admin mock keeps `Copy history`. In MVP it is super-admin only; later staff access is granted through the existing permissions contour. It is never a client export/download. The copied content must come from a server-safe current dialogue/session view and exclude private notes, censored originals, payment data, internal IDs and staff comments. Record `history_copied` audit with actor, role, scope, timestamp and applied policy version.

## 12. Surfaces

### Client

Dialogue mode, Expert identity, consultation boundary, permitted messages, delivery states, censorship warning as sender, safe content as recipient, end summary, read-only «История консультации», support/report/rating routes.

### Agent

Assigned expert identity, current client/case/session, send permission, state, rule version, flags and next action. No hidden contacts/payment/internal IDs.

### Moderator

Complaint/quality/safety context and support authorship. No masquerading as Expert.

### Super-admin

Audit, assignments, actual authorship, censorship attempts, restricted evidence, emergency reason and chat settings.

### Admin settings

New `/ru/admin/settings/chat` under `/ru/admin/settings/index`, after «Основные настройки» and before «Настройки фото». Super-admin only in MVP.

## 13. Settings ownership

Chat page owns:

- message length;
- send-rate count/window;
- document MIME/size/count;
- attachment inspection fallback;
- censorship categories, allowlist, warning, replacement label, repeat threshold and detector version/rollback;
- visual placeholder for in-chat templates/actions; the catalog model is canonical: a shared system list managed by super-admin, Expert-scoped templates for the corresponding Expert workspace, and personal Operator templates; action semantics remain deferred, while the approved RU/EN and MVP variable allowlist below are canonical;
- hide-message reason dictionary;
- chat-specific client messages for delivery, editing, censorship and attachment outcomes.

It does not own RBAC, assignments, price, coupons, payments, generic image policy, premium dating messages, email templates, message monitoring, support queues, general logs, reconnect/request/session timers, balance pause, end-reason dictionaries or consultation-history retention.

All visible labels, errors, aria-labels, system messages, templates and modal copy must use the existing translation-key system. Igor owns the key inventory and RU/EN integration; product/support/legal meaning is not changed during implementation.

## 7.1. Языковой источник чата

- При регистрации язык клиента определяется существующей browser-preference функцией и сохраняется в профиле.
- Изменение языка в профиле клиента меняет профильный источник.
- Для чата значение по умолчанию — `AUTO`: берётся актуальный язык профиля клиента.
- На вкладке `Quality` назначенный Expert/Agent может задать результирующий язык для рабочего диалога. Это сохраняемый dialogue-level override, который не изменяет профиль клиента.
- Override действует для последующих сообщений диалога до изменения или сброса; уже сохранённые сообщения не переписываются.
- Отдельный ручной выбор языка для одного сообщения не сохраняется как язык диалога и не является обязательным MVP-путём.
- Super-admin управляет флагом `allow_expert_language_override` на `/ru/admin/settings/chat`. При выключенном флаге запись и сброс override запрещены, чтение действующего значения разрешено.

## 7.2. Перевод сообщения

- При отсутствии утверждённого перевода показывать утверждённый исходник в composer с указанием языка.
- Повторное нажатие `Перевести` открывает перевод в модальном окне; исходник в composer не заменяется.
- Ручное редактирование текста перевода в модальном окне запрещено на текущем этапе.
- Получение перевода никогда не отправляет сообщение автоматически. Отправка выполняется только отдельной кнопкой `Отправить` и проходит обычные message/ACL/censorship/idempotency guards.
- Если текущий текст или доступный перевод не соответствует effective client language, показать небольшое модальное предупреждение с предложением перевести. Запуск перевода — только после явного клика оператора; это не блокировка отправки.
- Внешний provider пока не выбран. Сделать provider-agnostic adapter boundary и не подключать конкретный сервис без отдельного решения.

## 7.3. Положение доступности шаблона

Каждый активный шаблон обязан иметь ровно одно значение `availability_placement`:

| Code | Интерфейсное название | Когда шаблон доступен |
| --- | --- | --- |
| `pings` | `Пинги` | Открыта вкладка `Pings`; обращение ещё находится в ping/lead-сценарии. |
| `active_chat` | `Активный чат` | Открыта вкладка `Chats`, но для диалога нет consultation session в контексте `connecting`, `trial_active`, `paid_active`, `balance_pause` или `reconnecting`. Это свободный/предсессионный чат. |
| `paid_chat` | `Платный чат` | Диалог имеет consultation session в контексте `connecting`, `trial_active`, `paid_active`, `balance_pause` или `reconnecting`; завершённая session сюда не относится. `trial_active` входит сюда как часть уже созданного consultation workflow, даже если в данный момент списание ещё не идёт. |

Положение доступности — это фильтр каталога, а не право доступа. Поверх него применяются ACL и scope записи: системный шаблон только читается оператором, Expert-scoped доступен в рабочем контуре соответствующего Эксперта, личный шаблон доступен только владельцу. UI показывает записи текущего положения, а сервер повторно проверяет placement при выборе и при отправке. Если шаблон устарел и был выбран из другой вкладки/состояния, операция отклоняется без отправки. Один и тот же текст в нескольких положениях оформляется отдельными записями с отдельными placement.

## 7.4. Языковые поля шаблонов RU/EN

- Каждый системный, Expert-scoped и личный шаблон оператора имеет два утверждённых языковых поля: `text_ru` и `text_en`. Это варианты языка, а не история ревизий.
- Resolver выбора шаблона использует effective dialogue language: профиль клиента в `AUTO` или Quality override.
- При `RU`/`EN` выбирается соответствующее заполненное поле.
- При отсутствии поля для effective language выбирается `text_ru`.
- Отсутствие нужной версии не блокирует выбор шаблона и не запускает автоматический перевод.
- При fallback RU или другом несовпадении с effective language показать то же небольшое модальное предложение перевода. Не заменять composer автоматически и не отправлять автоматически. Это целевое правило; если в текущем runtime такого сигнала ещё нет, это implementation gap, а не основание придумывать другое поведение или автоматически блокировать отправку.

## 7.5. Переменные шаблонов — канонический MVP allowlist

Используется синтаксис `{{variable_name}}`. В системном, Expert-scoped или личном шаблоне оператора хранится список переменных, которые он использует; произвольные имена переменных не принимаются.

| Variable | Server source / rule |
| --- | --- |
| `client_name` | Safe public client name; first name, otherwise approved public display name; if unavailable, template is not offered. |
| `expert_name` | Public Expert profile only; never internal Agent name. |
| `price_min` | Existing session: immutable session price snapshot; before session creation: current effective price of the selected Expert for the offer. Always credits/minute, never USD; once a session starts, later price changes do not apply. |
| `trial_min` | Active trial entitlement for this client; unavailable when no entitlement exists. |
| `consult_date` | Current consultation date, localized for the client. |
| `consult_time` | Current consultation time, localized using the client timezone. |
| `timezone` | Current client/profile/session timezone used for date/time display. |
| `consult_link` | Server-generated authorized link to the current dialogue/session; never a raw template URL. |
| `topup_link` | Server-generated authorized top-up route, only where the action is applicable. |
| `support_link` | Server-generated current support route. |

Resolver rules:

- Resolve on the server for preview and again on the explicit Send action; never trust browser-supplied values.
- If a required variable cannot be resolved, do not offer the template and never expose a literal `{{...}}` token.
- Escape values as plain text; no HTML/JS, arbitrary URLs, internal IDs, payment identifiers, Agent identity, contact data, raw balance or audit secrets.
- Keep normal ACL, censorship, consultation-state, delivery and idempotency checks. Template selection never sends automatically.
- Keep the ordinary sent message history and actor/delivery rules. Do not add
  `template_id`, `template_version`, template provenance or a dedicated
  template audit for the general system/Expert-scoped/personal quick-template
  catalog in MVP. **Exception:** `PAID_SESSION_CONTRACT.md` requires
  immutable `offer_template_id + offer_template_version` and
  `pause_template_id + pause_template_version` snapshots for a particular
  paid-session operation; those fields support canonical server resolution and
  idempotency and are not catalog revision history. Do not put internal source
  data into the client payload.

Fixed rules are not toggles: allowed message families, audio/video ban, delivery indicators, conditional edited-marker rule, idempotent retry and no physical deletion.

## 14. Negative behavior

Mandatory rejection cases:

- unassigned Agent read/send, including direct request;
- second active paid/pause session;
- free message starts billing;
- paid start without required consent;
- moderator/emergency super-admin appears as Expert;
- duplicate/retry creates duplicate side effect;
- unsupported or disguised attachment;
- uninspectable attachment delivered;
- censored original exposed to recipient;
- edit overwrites history;
- unread message edit exposes an «изменено» marker to the Client;
- previously read message edit omits the required «изменено» marker;
- physical delete;
- staff hide/end without reason;
- reassignment during active paid/pause;
- setting change rewrites history;
- partial failure leaves false delivered/coupon/billing state.

## 14A. Acceptance criteria

Runtime acceptance требует подтверждения не только happy path, но и сохранённых данных, ACL, idempotency и отсутствия запрещённых побочных эффектов:

1. Назначенный Agent открывает только разрешённый dialogue/session и отправляет сообщение от публичного Эксперта; фактический actor сохраняется только во внутреннем audit.
2. Неназначенный Agent не читает и не отправляет сообщения через UI, прямой URL, AJAX/API, retry или stale page.
3. Free async message доставляется exactly once и не создаёт consultation, minute или debit.
4. Consultation message следует состоянию G1.3; G1.2 не создаёт второй lifecycle и не запускает billing самостоятельно.
5. Если сообщение было прочитано до редактирования, Client видит актуальный текст и отметку «изменено»; если не было прочитано — актуальный текст без этой отметки. Super-admin в обоих случаях видит все версии и время изменений.
6. При обнаружении запрещённого контента sender видит исходный текст и предупреждение, recipient получает только safe version, а super-admin получает один audit incident с категорией и policy snapshot.
7. Запрещённый, замаскированный или непроверяемый attachment не доставляется и не оставляет ложный статус `delivered`.
8. Duplicate/concurrent send, reconnect или retry возвращает исходный подтверждённый результат и не дублирует message, warning, incident, coupon, debit или session.
9. Изменение assignment или chat policy действует перспективно и не переписывает historical actor, safe content или применённую policy version.
10. Moderator и emergency super-admin отображаются клиенту как «Поддержка Nebula», с обязательной причиной и audit, и никогда не маскируются под Эксперта.

## 15. Integration outcomes

Igor/Codex should return:

1. current code contour map and chosen integration points;
2. implementation/change list;
3. permission matrix and direct-request proof;
4. state/transition and duplicate/concurrency proof;
5. message/attachment/censorship proof;
6. admin settings save, audit, rollback and historical readback proof;
7. client/Agent/moderator/super-admin surface proof;
8. build/commit and rollback plan;
9. residuals explicitly mapped to another G-task or release gate.

## 16. Definition of Done

- build passes;
- positive and negative acceptance cases from PM-ТЗ pass on runtime;
- direct access and send-as attempts are blocked;
- repeat/concurrent actions are idempotent;
- persisted data, audit and historical readback are verified;
- settings are editable by super-admin and keep versioned history;
- client never receives internal identity or censored original;
- consultation messages cannot be physically deleted;
- rollback/cleanup path is demonstrated;
- PM receives proof and issues a separate acceptance verdict.

Static HTML, local document generation or code presence do not satisfy runtime acceptance.

## 17. Knowledge basis

- Scope / affected roles: client, Expert, Agent, moderator/support, super-admin.
- Claim class: owner decisions in PM-ТЗ plus current-system navigation; reference training is contextual evidence only.
- MVP priority: P0 for 5 agents / 25 expert profiles / 1 moderator / 1 super-admin.
- Excluded reference behavior: hidden billing, artificial incompleteness, pressure, fear/dependency and unsupported guarantees.
- Open gates: legal/privacy retention review, G4.3 Trust & Safety wording, mapped runtime/ACL/QA proof.

## 18. Самооценка по Q1–Q12

| Критерий | Балл |
|---|---:|
| Q1 Паспорт и измеримый результат | 5/5 |
| Q2 Scope, non-goals, зависимости | 8/8 |
| Q3 Термины, роли, доступ | 10/10 |
| Q4 Preconditions и triggers | 7/7 |
| Q5 States, transitions, invariants | 12/12 |
| Q6 Functional rules и flow | 12/12 |
| Q7 Edge, security, idempotency | 12/12 |
| Q8 Data, audit, history, readback | 8/8 |
| Q9 Surfaces | 6/6 |
| Q10 Positive/negative acceptance | 12/12 |
| Q11 Двухфайловый handoff | 5/5 |
| Q12 DoD и runtime boundary | 3/3 |
| **Итого** | **100/100** |

Hard-gate verdict: `pass_for_specification`.

Implementation/runtime verdict: `open_until_build_and_runtime_proof`.
