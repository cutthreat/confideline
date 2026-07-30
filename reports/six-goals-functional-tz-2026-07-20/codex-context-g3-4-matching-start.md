# Технический контекст G3.4 для Codex Игоря: подбор и переход в consultation flow

## 1. Паспорт задачи

- Task ID: `G3.4`
- Название: «Подбор Эксперта и переход к консультации»
- Фаза: `pilot_minimum`
- Приоритет: `P0`
- Парное PM-ТЗ: `etalon-tz-g3-4-matching-start.md`
- `spec_completeness`: `100%`
- `owner_policy_closure`: `closed`
- `implementation_status`: `code_present_unmapped`
- `runtime_acceptance`: `not_run`
- Владелец продукта: Product Owner / Project Manager Nebula
- Целевые роли: гость, клиент, публичный Эксперт, Агент, super-admin

Статусы реализации консервативны: существующие auth/profile/message и matching-like поверхности не доказывают связный G3.4 flow.

## 2. Краткий контекст

Текущая платформа имеет страницы пользователей, сообщения, profile fields, географические и dating-фильтры. Целевая вертикаль должна показывать только экспертные анкеты и позволять человеку выбрать Эксперта по консультационному запросу.

Главный риск G3.4 — смешать маркетинговый выбор с финансовым стартом. В целевой модели:

- quiz необязателен;
- рекомендация только помогает выбрать;
- «Задать вопрос» открывает бесплатный диалог G1.2;
- consultation request создаётся в G1.3;
- paid начинается только после явного consent и G1/G2/G6 guards.

MVP использует прямой путь и необязательный короткий rule-based flow. AI/predictive matching, глубокая персонализация и коммерческая оптимизация исключены в `post-mvp-backlog-2026-07-29.md`.

## 3. Результат

На одной сборке гость может выбрать тему, пройти или пропустить подбор, получить объяснимый eligible список, сохранить выбранного Эксперта/тему/черновик через auth и открыть один бесплатный диалог либо передать контекст в один request flow без debit, duplicate и раскрытия внутреннего Агента.

## 4. Термины

| Термин | Значение |
|---|---|
| Selection intent | Временный продуктовый контекст выбора до отправки вопроса/request |
| Matching input | Явная тема, ответы optional quiz и применимые фильтры |
| Recommendation | Eligible анкета + применённые публично объяснимые причины |
| Action capability | Разрешённое действие для текущего profile state |
| Free dialogue | Persistent conversation G1.2 |
| Request handoff | Передача контекста в G1.3 без присвоения G3.4 права менять lifecycle |
| Revalidation | Повторная проверка profile/price/state перед действием |

## 5. Scope

### Входит

- optional quiz;
- direct choice без quiz;
- topic/answer capture;
- explainable recommendation;
- сохранение selection intent;
- auth return;
- revalidation;
- open/create free dialogue;
- handoff в G1.3 request flow;
- no-result/busy/offline fallback;
- admin draft/preview/publish/version;
- idempotent intent/action;
- role-safe readback и audit.

### Не входит

- создание/переходы consultation request;
- paid session и timer;
- debit/balance/trial calculation;
- assignment management;
- ranking formula G3.7;
- content полей анкеты;
- платная очередь или async paid consultation;
- AI diagnosis;
- marketing campaign management;
- legal/claims wording ownership.

### Зависимости

- G3.1–G3.3: entry points, catalog/profile data.
- G3.7: eligibility/ranking/explanation factors.
- G1.2: persistent dialogue.
- G1.3: request, consent, lifecycle.
- G2.1/G2.2: price/trial/balance/start guards.
- G6.1/G6.7: assignment и ACL.
- G5.1: safe events.

## 6. Роли и доступ

| Роль | Разрешено | Запрещено | Видимость |
|---|---|---|---|
| Гость | проходить/пропускать quiz, смотреть result/profile | отправлять вопрос, создавать request, начинать paid | public profile data и свой temporary intent |
| Клиент | сохранять intent, открывать free dialogue, создавать request через G1.3 | второй active/pending request, direct paid start | свои intent/dialogue/request |
| Агент | после появления назначенного dialogue/request видеть необходимый context | читать чужой intent, действовать чужой анкетой, менять matching rules | только assigned operational context |
| Super-admin | управлять version, preview, audit | обходить protected money/ACL rules через matching settings | full configuration/readback без секретов |

Любой direct action повторяет server-side role и state guards. Скрытая кнопка не является защитой.

## 7. Preconditions и triggers

### Preconditions подбора

- опубликована валидная версия вопросов либо quiz выключен;
- существует хотя бы один доступный прямой fallback в каталог;
- taxonomy и translation для показанного шага доступны;
- client input проходит size/type/content validation.

### Preconditions рекомендации

- передан surface/topic context;
- G3.7 вернул eligible profiles или явный empty result;
- причины рекомендации относятся к применённым факторам;
- public fields не содержат staff-only data.

### Preconditions защищённого действия

- клиент авторизован;
- intent принадлежит клиенту;
- profile revalidated;
- expected action разрешён;
- request concurrency guard пройден.

### Triggers

- CTA «Подобрать Эксперта»;
- выбор темы;
- прямой выбор profile;
- submit quiz step;
- skip quiz;
- auth success;
- «Задать вопрос»;
- «Создать запрос» внутри G1 flow;
- retry после degraded dependency.

## 8. Invariants

1. Quiz необязателен.
2. Selection intent, dialogue, request и session — разные объекты.
3. G3.4 не создаёт paid state/debit/accrual.
4. Consent не считается данным автоматически из CTA.
5. Client question не попадает в analytics payload.
6. Recommendation содержит только G3.7-eligible profiles.
7. Внутренний Agent никогда не попадает в public result.
8. Auth не теряет profile/topic/question/source.
9. Revalidation обязательна после auth и перед protected action.
10. Duplicate/retry не создаёт второй dialogue/request/action.
11. Busy/offline/blocked не получает false paid capability.
12. Missing/invalid configuration не подменяется скрытым default.
13. Платная очередь и async paid route отсутствуют.
14. Recommendation explanation не гарантирует результат.

## 9. Состояния и переходы

Состояния ниже относятся только к selection intent, не к consultation.

| State | Trigger | Guards | Result |
|---|---|---|---|
| `draft` | первый выбор/ответ | valid input | контекст сохраняется |
| `awaiting_auth` | protected CTA гостя | intent valid | фиксируется return action |
| `active` | auth success или auth client | ownership valid | intent доступен клиенту |
| `revalidation_required` | auth/state/config change | — | действие заблокировано до проверки |
| `ready_for_action` | successful revalidation | capability valid | можно открыть dialogue/G1 flow |
| `transferred` | idempotent successful action | auth + ownership | сохраняется ссылка на фактический result |
| `expired` | retention deadline | not transferred | UI предлагает новый выбор |
| `cancelled` | client cancel | ownership | intent не используется дальше |

Запрещено:

- `draft/awaiting_auth -> paid`;
- `expired/cancelled -> transferred` без нового intent;
- `transferred -> transferred` с новым side effect при retry;
- создание request внутри G3.4 в обход G1.3 guards.

## 10. Функциональные сценарии

### S1. Optional quiz

Гость выбирает тему, отвечает на часть вопросов, пропускает остальное и получает eligible result.

### S2. Direct profile

Гость открывает конкретного Эксперта без quiz; intent содержит source/profile и не требует искусственных ответов.

### S3. Auth preservation

Гость вводит вопрос, проходит auth, после чего видит тот же профиль, тему и draft; revalidation выполняется до отправки.

### S4. Free dialogue

Авторизованный клиент нажимает «Задать вопрос»; открывается существующий или создаётся один persistent dialogue без request/debit.

### S5. Request handoff

Клиент из dialogue начинает G1.3 flow; G3.4 передаёт profile/topic/source, но request state записывает владелец G1.3.

### S6. Busy/offline

Result остаётся видимым при допустимом free message/notify, paid capability отсутствует.

### S7. Empty result

Нет eligible profiles; возвращается explicit empty result и catalog/filter alternatives без фиктивных данных.

### S8. Second active request

Client action получает G1.3 conflict; UI предлагает отменить текущий request либо продолжить ожидание, новый не создаётся.

### S9. Stale price/state

После auth profile/price изменились; revalidation возвращает актуальный context и требует осознанного продолжения.

### S10. Duplicate

Двойной click/retry возвращает исходный intent/action result.

### S11. Matching unavailable

Quiz/recommendation dependency недоступна; direct catalog/profile route остаётся без paid side effect.

### S12. Unauthorized intent

Другой client передаёт чужой intent identifier; server-side отказ без раскрытия данных.

## 11. Контракт данных

| Data group | Обязательный смысл | Source of truth | Mutable | Visibility/history |
|---|---|---|---|---|
| Intent identity | unique intent, owner/anonymous binding | G3.4 | до transfer | owner + super-admin audit |
| Entry context | surface, source, topic, region/filter | входной flow | да до action | client-safe; historical snapshot |
| Answers | question key/version + answer | client | да до transfer | client; staff only if needed |
| Draft question | client text | client | да до send | client/dialogue roles; no analytics |
| Selected profile | public expert profile | client/G3 result | да до transfer | public/client; historical link |
| Rule versions | quiz + G3.7 version | published configs | immutable per result | super-admin/readback |
| Recommendation reasons | applied public factors | G3.7 result | immutable result | client-safe + full admin |
| Action capability | allowed current actions | current profile/Agent state | recalculated | public/client |
| Auth return | expected action + safe pointer | G3.4/auth handoff | one-use/idempotent | client/system |
| Transfer result | dialogue/request reference | owning module | immutable link | authorized roles |
| Audit | actor, action, before/after, reason/time | system | append-only | super-admin |

Retention времени intent является admin-managed. После expiry содержимое не используется для нового действия; audit transfer/result сохраняется по общей privacy policy.

## 12. Поверхности

### Client

- home/topic CTA;
- optional quiz;
- recommendation cards;
- auth return;
- profile/dialogue/request handoff;
- empty/error/stale-state messages.

### Agent

- source/topic readback только внутри assigned dialogue/request;
- отсутствие доступа к чужим intent/answers.

### Support/moderator

- только ссылка/source context при связанном case и разрешённых permissions;
- полный draft question не раскрывается без необходимости.

### Super-admin

- settings list;
- draft/preview/publish/rollback;
- per-intent/result explanation;
- errors/audit;
- safe aggregate analytics.

### Notifications/readback

G3.4 может создать domain event о фактическом шаге, но delivery принадлежит notification owner. Events не содержат raw question/answers, если это не отдельный privacy-approved event.

## 13. Ошибки и negative behavior

| Ошибка | Expected behavior |
|---|---|
| Unauthorized | отказ; нет intent disclosure/transfer |
| Invalid answer/type/size | field error; state не продвигается |
| Invalid state | conflict + current state; нет side effect |
| Duplicate/retry | исходный result; нет второго dialogue/request |
| Concurrent selected profile change | один последовательный intent version; revalidation |
| Auth callback повторён | one transfer result |
| Profile blocked | capability removed; safe client explanation |
| Price changed | актуальный price context до consent |
| G3.7 unavailable | no fake recommendation; direct fallback |
| Translation missing | last valid version/config incident, no technical key |
| Partial transfer response lost | retry returns committed result |
| Analytics unavailable | business action remains; monitoring record |

## 14. Acceptance matrix

| ID | Given | When | Then | Evidence |
|---|---|---|---|---|
| A01 | guest + valid topic | skips quiz | eligible result shown; no auth/payment state | UI + result readback |
| A02 | guest opens profile directly | clicks ask | auth required; intent saved | before/after + intent |
| A03 | saved profile/topic/draft | auth succeeds | same context restored and revalidated | UI + intent history |
| A04 | auth client + eligible profile | asks question | one free dialogue, zero debit/request | dialogue + ledger absence |
| A05 | existing dialogue | asks again | same dialogue used | dialogue readback |
| A06 | client starts request flow | handoff succeeds | one G1 request with source/profile/topic | request + intent link |
| A07 | busy/offline | client views result | no paid CTA; allowed fallback only | UI + state |
| A08 | blocked profile | recommendations run | profile excluded | preview/public |
| A09 | no eligible profiles | results requested | explicit empty state, no fake rows | UI + result |
| A10 | active pending request exists | second request attempted | conflict/options; no second request | request count + audit |
| A11 | price/state changed after auth | action resumes | current values shown; old action not committed | UI + snapshots |
| A12 | double click/retry | protected action sent twice | one committed result | idempotency/audit |
| A13 | foreign intent ID | direct action | server denial; no disclosure | response + audit |
| A14 | matching dependency down | flow opens | direct catalog fallback, no paid side effect | UI + ledger absence |
| A15 | invalid config draft | publish attempted | publish blocked; current remains | admin readback |
| A16 | published version changed | old result viewed | old version explainable; new action revalidated | version/readback |

## 15. Programmer handoff

Обязательные integration outcomes:

- one logical intent across guest/auth;
- G3.7 recommendation contract;
- auth-safe return without raw secrets in URL;
- idempotent free-dialogue/request handoff;
- revalidation against current profile/price/state;
- server-side ownership/ACL;
- versioned admin configuration and audit;
- safe events without raw question.

Target admin owner route: `/ru/admin/settings/matching`. It is the only editor of G3.4 questions, branching, mappings and explanation templates; taxonomy, eligibility/ranking and paid-start rules remain read-only dependencies.

Current source navigation, не архитектурное предписание:

- public home/dashboard/catalog/profile surfaces;
- auth/signup/login return flow;
- existing message/dialogue surface;
- `/ru/admin/profile-field/index`;
- `/ru/admin/settings/index`;
- `/ru/admin/settings/role`;
- `product-architecture-g1-g6-ownership-map.md`;
- G1.2/G1.3/G2.1/G2.2/G3.7 handoffs;
- current Figma/Oracle screen sources.

На review предоставить: mapped build, impacted surfaces, configuration mapping, positive/negative automated checks, runtime evidence и residuals.

## 16. Definition of Done

- есть build/commit marker;
- PM-ТЗ связано с entry points;
- intent/auth return работает end-to-end;
- positive и negative matrix выполнена;
- unauthorized/duplicate/concurrent доказаны server-side;
- no paid/debit side effect подтверждён;
- admin version/preview/readback/audit доступны;
- persisted links dialogue/request согласованы;
- test fixtures очищены или зарегистрированы;
- PM выдал verdict.

## 17. Proof boundary

Этот документ доказывает полноту контракта, но не реализацию.

Не доказано до runtime:

- фактическое сохранение intent через текущий auth;
- отсутствие дублей;
- ACL;
- актуальная интеграция с G3.7/G1;
- UI parity с Figma;
- admin publish/rollback;
- аналитическая доставка.

Static HTML, найденный handler или текущий matching-like code не являются runtime acceptance.

## 18. Knowledge basis

- `etalon-tz-g3-4-matching-start.md`;
- `functional-tz-quality-standard.md`;
- `product-architecture-g1-g6-ownership-map.md`;
- `owner-decisions.md`;
- `tz-g3-catalog-profile-rotation.md`;
- `tz-product-g3-expert-profile-catalog-2026-07-16.md`;
- эталонные G1.2/G1.3/G2.1/G2.2 документы.

Claim class: current owner decisions + proposed target product contract.

Исключено:

- competitor-required quiz;
- hidden checkout;
- paid waitlist/async consultation;
- guarantees/prediction certainty;
- use of internal Agent KPI as public matching explanation.

## 19. Самооценка

| Критерий | Балл | Обоснование |
|---|---:|---|
| Q1 | 5/5 | цель и наблюдаемый result |
| Q2 | 8/8 | scope/dependencies/non-goals |
| Q3 | 10/10 | roles, ACL, visibility |
| Q4 | 7/7 | preconditions/triggers |
| Q5 | 12/12 | intent states + protected invariants |
| Q6 | 12/12 | direct/quiz/auth/dialogue/request flows |
| Q7 | 12/12 | unauthorized/duplicate/concurrent/degraded |
| Q8 | 8/8 | data/version/history/audit |
| Q9 | 6/6 | client/agent/admin/notifications |
| Q10 | 12/12 | 16 oracle cases |
| Q11 | 5/5 | PM + Codex pair |
| Q12 | 3/3 | DoD и proof boundary |
| **Итого** | **100/100** | |

Hard gates: `pass`.

Blocking specification gaps: нет.

Deferred gates: final visual parity и public traffic O5.

Implementation/runtime gaps: перечислены в Proof boundary.

Verdict: `spec_handoff_ready`.
