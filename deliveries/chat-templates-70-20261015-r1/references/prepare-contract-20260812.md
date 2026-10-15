# Customer clarification: shared workflow state and message templates

Date: 2026-08-12  
Source: direct customer clarification supplied in the Chat V2 task.

> **Superseded control semantics (2026-08-14):** the later customer package
> [`G1_2_CUSTOMER_PACKAGE_2026-08-14.md`](package-20260814.md)
> makes `Needs reply`, `Assign`, `Note` and `Resolve` visual-only/deferred for
> the current stage. The implemented shared workflow state must not receive
> new side effects until another explicit PM decision. This page retains the
> former accepted workflow slice as history; its direct RU/EN lean-template
> decision remains compatible where the later package does not replace it.

The customer cited `CHAT_QUEUE_CONTRACT.md`, `PAID_SESSION_CONTRACT.md`, and
`EXTENDED_PRODUCTION_SURFACES-RU.md`. The first two exist locally; the last
source file was not present in `knowledge/new-chat` during this ingest. This
page therefore records the direct clarification as the authoritative addition
until that missing source is supplied.

> **Current template status (2026-08-13):** the later direct product decision
> is a compact two-field RU/EN catalog without template history, provenance or
> Yii translation keys. Historical customer proposals and earlier architecture
> alternatives are retained below for traceability only; the section
> [Accepted simplified template implementation](#accepted-simplified-template-implementation-2026-08-13)
> is authoritative for current code.

## Confirmed ownership rules

- `Needs reply`, `Assign`, and `Resolve` are **shared working states of a
  dialog**, visible to every staff member who is authorized for that dialog.
- They must not be implemented in browser `localStorage`, as a per-operator
  preference, or as an expert ownership (`ChiefUnder`) mutation.
- Personal workspace settings remain personal: compact mode, notification
  sound, local filters, drafts, and display preferences.
- `Note` is not listed by the clarification as a shared dialog state. The
  existing Notes area remains a shared internal client history, not a status
  button, unless a later product rule says otherwise.

### Implementation consequence

The next workflow backend needs a shared, server-authoritative conversation
state plus append-only change audit/realtime projection. `Assign` still needs
its transition semantics specified: assignee picker scope, whether it changes
queue visibility/access or only work ownership, unassign/reassign behavior,
and its relation to the existing expert-to-operator `ChiefUnder` mapping.
`Resolve` likewise needs reopen conditions. Those semantic gaps must not be
filled by changing `ChiefUnder`.

## Confirmed template rules

- One common catalog serves all operators, experts, and teams; no copied
  operator/expert/team catalogs.
- The ten Stage 1 Russian texts are an approved starter set.
- A choice inserts editable text into the composer only. It never sends the
  message by itself and never bypasses censorship, permissions, assignment, or
  paid-session guards.
- The customer handoff asks the sending backend, not browser preview data, to
  resolve canonical text and version by `template_id` and `template_version`,
  and to retain that provenance with the sent message. Its stated metadata
  also includes version and change audit.

### 2026-08-12 interim decision: current catalog, not template revisions

The product decision made on 2026-08-12 is deliberately simpler than the
handoff's audit proposal:

- one current active row is enough for each template;
- choosing it prepares the current server-side text in the editable composer;
- the canonical `message.text` is the historic record of exactly what the
  client received;
- no immutable revision table, per-message template-use table, or normal
  message `template_id`/`template_version` provenance will be introduced;
- the then-existing catalog `version` column was unused by normal Chat V2
  selection/sending; it was subsequently removed by the 2026-08-13 direct
  RU/EN migration.

This retains all visible chat history while avoiding an audit model that has
no confirmed legal, compliance, or reporting use case. If the customer later
confirms such a requirement, it must specify the precise report or dispute
scenario before revisions are designed.

### Historical implementation comparison (2026-08-12)

Already present:

- one global `chat_message_template` catalog;
- category, source language, an existing unused integer version column,
  active/inactive switch and created/updated-by audit fields;
- editable composer insertion through the normal message path;
- a protected server-side prepare endpoint: the browser receives only a
  template id/title, then the backend loads the current active catalog row,
  checks its plain-text policy and allowed variables, and returns rendered
  text.

### Existing administration screen

No additional template-management screen is required for the current model.
It is already available through **Settings → Chat message templates** at
`/admin/chat-message-template/index`:

- `ChatMessageTemplateController` is limited to Settings administrators;
- the list supports creating a template, editing its title/body/category/order,
  and activating/deactivating it;
- deactivation is the intended replacement for deletion, so a template can
  disappear from the composer without removing its configuration record;
- a normal chat operator can select a template but cannot change the common
  catalog.

Not yet implemented and therefore not to be represented as complete:

- explicit `draft`/`active`/`archived`, effective date and usage-right policy;
- any legal/compliance audit requirement that would truly require immutable
  template revisions or per-message provenance;
- approved language variants and language-specific catalog resolution.

### Implemented server preparation slice (2026-08-12)

- Composer HTML no longer exposes `data-template-text` with canonical source
  body. Selecting an item posts only `conversationId` and `templateId` to
  `/admin/chat/v2-template-prepare`.
- The endpoint re-applies regular Chat V2 conversation authorization and loads
  the current active global operator-reply row. It returns an editable
  rendered text draft; it does not send a message.
- A small server renderer accepts only the documented variable allowlist.
  Current starter templates have no variables. Client/expert names, configured
  price/trial and client timezone have safe sources where applicable; session
  dates, pause deadline and protected links remain unavailable until their
  exact product policies are confirmed, so their template never exposes a raw
  placeholder or guessed URL.
- This slice deliberately has no migration and does not claim immutable
  revisions or per-message provenance; those are explicitly out of the current
  product scope. Approved RU/EN variants remain a separate future decision.

## Historical customer language proposal (variant C; superseded)

- The original handoff proposed approved RU/EN variants through existing
  translation keys. That storage approach was rejected: direct `body_ru` and
  `body_en` fields are now the current catalog source of truth.
- The current slice uses the client profile language only (`ru*` -> RU,
  otherwise EN; missing legacy language -> RU). It intentionally has no saved
  dialog direction or manual per-message language override.
- An external translator remains a future manual draft helper only. It is not
  invoked automatically when a template is selected and does not alter the
  catalog.
- The agent sees fully rendered, editable text. The client receives the same
  content. Browser `client_message_preview` is never authoritative.
- A missing selected-language body is not offered and never silently falls
  back to the other language or a raw placeholder.

## Server-only variables

Allowed variables from the clarification:

- `{{client_first_name}}`
- `{{expert_public_name}}`
- `{{consultation_price_credits_per_minute}}`
- `{{trial_minutes}}`
- `{{consultation_date_local}}`
- `{{consultation_time_local}}`
- `{{client_timezone}}`
- `{{pause_deadline_local}}`
- `{{consultation_link}}`
- `{{topup_link}}`
- `{{support_link}}`

The backend must load the selected id, resolve only this allowlist,
validate/escape the rendered text, and block activation/send on an unresolved
variable. Agent/staff IDs and names, payment IDs, external contacts,
Risk/Safe/Skeptic flags, staff comments, arbitrary HTML and raw URLs are
prohibited variables.

The implementation must never expose a placeholder, translation key, internal
ID, or raw protected URL in the composer or client message.

## Implemented first shared workflow slice (2026-08-12)

- `Needs reply` is now the first server-authoritative shared state for a
  normal `Chats` conversation. Its current value is stored directly on the
  canonical `conversation` row as `workflow_status`, version and changed-by/
  changed-at metadata; it is not stored in browser state or in the private
  `chat_operator_conversation_state` table.
- `chat_conversation_workflow_event` is append-only audit history only. The
  normal queue and timeline do not join it. A successful transition locks the
  canonical conversation, checks the expert/client pair and optimistic version,
  then writes one audit event with an idempotency key.
- The exposed status values are `open`, `needs_reply` and `resolved`.
  Automatic message transitions and Resolve behavior are described in the
  completed vertical slices below.
- Current authorized operators of the represented expert receive a narrow
  post-commit WebSocket state hint and refresh only the relevant queue region.
  No message body or audit payload is published to the browser.
- An active Ping is deliberately excluded. Its `Reply`/`Await` state remains
  owned by `ChatLead.response_state`, so the manual control is unavailable for
  that transport.
- The Stage 1 `Note` control opens the existing shared Notes tab. `Resolve`
  is implemented as the shared close-work-item transition. `Assign` remains
  visible but deliberately inactive: the product must decide whether it is
  removed, links to the existing expert-to-operator transfer, or has a new
  meaning that does not duplicate `ChiefUnder` ownership.

## Review of the 2026-08-12 agent-controls handoff

Sources reviewed:

- `knowledge/new-chat/codex-context-agent-chat-controls-ru.md`;
- `knowledge/new-chat/agent-chat-controls-for-igor.docx`.

The DOCX is a concise, human-readable counterpart to the Markdown handoff.
They agree on the intended product behavior. `CHAT_CONTROL_BACKEND_MATRIX.md`
is available locally; the cited
`EXTENDED_PRODUCTION_SURFACES-RU.md` was not found in the local knowledge
base, so it must not be used to invent an endpoint or a lifecycle rule.

### What is sufficiently defined

- `Needs reply`, `Assign`, and `Resolve` are shared **Chats** work state, not
  the 19 queue badge codes and not a mutation of expert ownership.
- `Pings` keep their separate `Reply` / `Await` lifecycle. They must never be
  projected into a Chat as `Needs reply`.
- `Assign` means only `claim_current` of a claimable conversation by the
  authenticated operator. It is not the existing `ChiefUnder` expert-profile
  transfer.
- `Resolve` closes a queue work item, never a conversation, a paid session,
  billing, or client-facing message history.
- Choosing a global template prepares an editable composer draft only; normal
  send guards still apply.
- The client and operator must see the same final recipient-facing text; the
  browser is not authoritative for template source, variable values, or actor.

### Corrections and implementation gaps

1. The sentence in the Markdown handoff under automatic `Needs reply` says
   that after a client message there is no successful **client** response. This
   is internally inconsistent with the following automatic-clear rule and the
   DOCX table. The intended condition must be: no successful outgoing
   **Expert/Agent** response after the meaningful client message.
2. The new handoff requires a mandatory reason and audit when an operator
   manually returns a dialog to `needs_reply`; it describes no manual clear.
   The initial two-way toggle was corrected on 2026-08-12: the manual action
   now records the structured `manual_return_to_queue` reason and cannot clear
   the status from the browser.
3. "Meaningful client message" still needs one concrete predicate across text,
   image, document, and audio messages. System events, read marks, drafts,
   notes, and translation previews are already explicitly excluded. The
   implemented default is non-empty text or a ready attachment of one of these
   media types; a later customer exception can narrow that predicate.
4. The current shared Notes projection is client-wide staff history. The new
   word "private" should be interpreted as staff-only, not personal to one
   operator: this preserves the earlier explicit customer decision that every
   authorized operator working with the client sees the notes. A later change
   to conversation-scoped notes needs an explicit product decision.
5. `Resolve` closes an active work item, while the current `Chats` view is
   also a permanent conversation list. The current implementation keeps a
   resolved row visible with a `Resolved` chip, preserving history. A later
   active-work filter/preset can omit resolved items without removing them
   from permanent chat history; its product behavior still needs specification.
6. `Assign` specifies the behavior but needs one implementation mapping: in
   the current codebase the assignee must be the authenticated admin/operator
   `user_id`; there is no separate canonical Agent entity to invent. Claimable
   pre-consultation states and the exact reassignment/reopen permission need
   to be encoded separately from `ChiefUnder`.

### Completed Needs reply vertical slice (2026-08-12)

- Manual action is now one-way: an authorized operator can only return a
  regular `Chats` conversation to `needs_reply`. The command carries the
  structured audit reason `manual_return_to_queue`; there is no browser-side
  manual clear action.
- A meaningful canonical client message sets/reopens `needs_reply`. A later
  meaningful normal expert/agent message clears it. The decision is made from
  the newest persisted meaningful message, rather than callback arrival order,
  so a delayed WebSocket/HTTP side effect cannot reverse a newer state.
- Meaningful content is non-empty text or at least one ready image, document,
  audio or voice attachment. Globally deleted messages, pending/rejected
  uploads, read marks, drafts, translation previews and rows bound to a paid
  `service_session_id` do not affect the status.
- The same post-commit observer is invoked by both legacy frontend message
  paths and Chat V2 message/attachment paths. It first lets a qualifying
  client reply convert an active Ping; while the Ping remains open, its
  `Reply`/`Await` state remains the sole authority and no Chat workflow event
  is produced.
- The existing canonical `conversation` fields and append-only
  `chat_conversation_workflow_event` are sufficient. Automatic events occur
  only on an actual state change, not on every message, and normal queue and
  timeline reads still do not join the audit table.

### Completed Resolve vertical slice (2026-08-12)

- An authorized operator can open the `Resolve` modal from the composer tools
  drawer, select one mandatory structured reason and add an optional
  staff-only comment. The action resolves the work item only: it does not
  remove the chat, alter messages, delete files, change billing, or complete a
  service session.
- The transition locks the canonical `conversation`, checks the represented
  expert/client pair and optimistic workflow version, and records exactly one
  idempotent append-only `conversation.resolved` event. It uses the existing
  workflow fields and event audit table; no new table or high-churn query is
  introduced.
- Resolve is refused while a related consultation is `connecting`, `active`,
  `paused` or `reconnecting`. The consultation lifecycle controls remain the
  sole way to finish those states.
- A later meaningful client message records
  `conversation.reopened_by_client_message` and sets `needs_reply`. A normal
  expert message alone does not reopen a resolved work item.
- The current all-`Chats` list keeps the conversation in history and displays
  `Resolved` in queue/header/context. This is deliberately distinct from a
  future active-work-only filter.
- `Assign` remains inactive pending the customer decision. In the current
  one-expert/one-operator model it must not silently become a second UI for
  the existing `ChiefUnder` expert transfer.

### Historical template translation assessment

The product goal is sound, but "approved RU/EN variants through the existing
translation keys" is not an implementable storage contract as written.

The current Yii i18n service in `application/config/core.php` is
`yii\\i18n\\DbMessageSource` over generic `language_source` and
`language_translate` rows. Its source language is `en-US` and production
lookups are cached for 24 hours. It has no relation to a template id/version,
no revision immutability, lifecycle (`draft`/`active`/`archived`), effective
date, use-rights policy, approval workflow, or template audit. The current
quick-reply source text is Russian, which also does not match that `en-US`
source-language convention.

Therefore generic UI i18n must not become the canonical store for mutable,
auditable business messages. It may later be a read-only projection or a
reference for a UI label, but a normal composer must not resolve a template by
calling `Yii::t()` on arbitrary source text.

The currently implemented `chat_message_template` is only a useful first
catalog slice:

- it has global rows, Russian starter texts, category, active flag and a
  mutable incrementing version;
- the browser receives only catalog metadata and asks the backend to prepare
  the current source body by template id/version before insertion;
- the normal `ChatV2MessageForm` and `actionV2MessageCreate()` send only final
  text/reply/idempotency, with no template id/version provenance;
- `TranslationPreviewService` is explicitly a transient local mock, not an
  approved-translation resolver.

It does **not** yet meet the approved-template locale, immutable-version or
per-message provenance requirements. The current server preparation endpoint
is only the first source-authority boundary, not a complete approved-template
revision/locale system.

### Earlier high-audit proposal (not the current recommendation)

- Keep `chat_message_template` as the logical global catalog and evolve it
  rather than replacing it.
- Add immutable template revisions and one approved locale variant per
  `revision + language`. A revision owns its source text; a variant owns its
  approved recipient-facing text and review/audit metadata.
- Add a narrow per-message template-use record with `message_id`, revision,
  locale, actor, rendered/base hash, and actual final sent text. It is audit
  data and is not joined by the normal queue/timeline query.
- Evolve the current server prepare endpoint to resolve `conversation +
  template revision + target language`, validate allowed variables, substitute
  and escape values, then return only rendered text. The browser may edit this
  draft. On send, preserve both the selected revision and the actual final
  text; never silently rerender over an operator edit.
- Generate safe consultation/top-up/support links server-side at render time.
  The rule against raw URLs must mean arbitrary operator/template URLs, not
  these controlled server-generated links.
- Treat missing required variables as a template/scenario incompatibility.
  A template requiring `pause_deadline_local`, for example, must not be
  offered for a conversation that has no qualifying paused session.

Before implementing this second template slice, the fallback policy needs one
unambiguous line: for a target language without an approved variant, either
block sending or render the approved source-language text. Earlier customer
clarification recorded the latter, whereas the new handoff says a missing
approved fallback blocks sending; the source language may be intended as that
fallback but it is not stated precisely enough. The language priority
(saved conversation direction vs. client profile language) must also be fixed
and audited when an operator overrides it.

### Customer template update received 2026-08-13

Raw sources reviewed:

- updated `knowledge/new-chat/codex-context-agent-chat-controls-ru.md`;
- `knowledge/new-chat/temaplate-answer-from-customer.txt` (Windows-1251
  source encoding; decoded before review).

The update resolves several prior ambiguities:

- Target language order is now explicit: a saved conversation direction takes
  precedence; otherwise use `profile.language_id` of the client. A manual
  language choice is for one message only and must be auditable. Saving a new
  conversation language is a separate, permission-checked action.
- If an approved target locale is absent, the approved source is shown with a
  visible language marker but cannot be silently sent. The operator must
  either prepare recipient-language final text or explicitly approve sending
  the source language for that one message. A provider is manual-only and its
  draft never changes the approved catalog.
- The catalog is global and administrator-managed. The ten Russian mock texts
  remain the only approved starter set. The customer now explicitly requests
  per-template RU/EN approval, scenario/state and permission constraints,
  allowed variables/link rules, lifecycle status, version and audit.
- Variables are server-rendered only. Required values hide/block a template;
  session links, top-up and support links must be generated at preparation
  time and must not be stored as raw URLs.
- A selected template continues to be only an editable composer draft. The
  final message is subject to normal policies and no template may change a
  consultation, balance, credit or payment state.

### Accepted simplified template implementation (2026-08-13)

The product owner subsequently chose the deliberately lean implementation
over the earlier audit-heavy proposal. This is the current implementation
decision and supersedes earlier references here to template revisions,
per-message template provenance and generic Yii translation keys:

- One global `chat_message_template` row owns one editable `body_ru` and one
  editable `body_en`. The title/category/order/active configuration remains
  global and Settings-admin managed.
- There is no template version, revision/history table, template-use audit row
  or `template_id`/`template_version` stored with a normal sent Message. The
  ordinary final `Message` text is the historic record.
- The selected language is `ru` for a client profile language beginning with
  `ru`; it is `en` for every other known profile language. A profile with no
  language keeps the existing RU behavior. No saved conversation-language
  state or manual language override is introduced in this slice.
- Both content fields are maintained directly in the template catalog. Generic
  Yii `language_source` / `language_translate` rows are not used. A future
  translator service may prepare a manual draft, but it is not called
  automatically when a template is selected and does not modify catalog text.
- A template only prepares an editable composer draft. It does not send,
  create a session, alter billing, or remove ordinary messaging safeguards.
  Free typing is always available.
- Macros are literal `{{name}}` tokens authored in either body. The server
  expands only allowlisted variables at preparation time; it never gives the
  browser raw placeholder text. Presently safe sources cover client/expert
  names, configured price/trial and client timezone. Date/deadline/link
  variables remain safely unavailable until their authoritative server sources
  and policies exist.

Implementation migration:
`m260813_090000_simplify_chat_message_templates_to_ru_en` renames `body` to
`body_ru`, adds `body_en` and removes the obsolete `source_language` and
`version` fields/index. It gives the ten existing starter rows an English
counterpart. A custom legacy template without an English body is not offered
to an English client until an administrator fills that field; it is never
silently sent in Russian.

#### Superseded customer request and remaining deliberate limits

- The prior customer answer requested template/version/language provenance and
  audit. The product owner explicitly declined it on 2026-08-13, so this is
  no longer an open conflict: no such history is implemented. The actual sent
  text remains in `message.text`.
- Generic Yii `language_source` / `language_translate` remains unsuitable as
  the canonical store for approved business-message locales. It is UI i18n
  with `en-US` source semantics and a 24-hour production cache, not a
  template/version/approval model. "Existing translation keys" can at most
  be a later projection; it must not be the preparation source of truth.
- `conversation` has no persisted translation direction. This is intentional
  scope for the two-language catalog: use the client profile language only.
- The handoff labels `trial`, `paid` and `balance_pause` are not literal
  `ServiceSession.status` values in this codebase. The canonical model uses
  statuses such as `connecting`, `active`, `paused`, `reconnecting` plus a
  separate `billing_mode`. This mapping is required only for a template that
  is explicitly state-sensitive (for example a balance-pause or reconnect
  notice). It must never block the free composer or normal operator message:
  generic manual quick replies remain selectable and an operator can always
  write, add to, or replace a message under the normal send guards.
- `consultation_date_local`, `consultation_time_local`, secure consultation
  links, top-up links and support links do not yet have all required
  server-authoritative sources/routes. `pause_expires_at` and locked pricing/
  trial snapshots do exist for a qualifying session. No unavailable macro may
  be guessed or rendered from browser data.
- Existing paid-offer and pause messages belong to the protected
  `ChatPaidSessionCatalog` and can cause lifecycle actions. They must not be
  silently merged with editable normal operator replies. Support/safety
  messages also need a separate staff sender/permission model before they can
  be exposed as ordinary expert messages.

#### Earlier lean implementation recommendation (superseded where it proposes locale relations or template-use audit)

Keep page reads small and avoid a generic rules engine:

1. Keep `chat_message_template` as the global logical catalog. For the normal
   ten templates, resolve one small filtered catalog only when the composer
   region is loaded; never query it per timeline message or per queue row.
2. Store approved language bodies in a dedicated
   `chat_message_template_locale` relation keyed by `(template_id, language)`
   when EN content is actually supplied. A targeted indexed join/read for one
   recipient locale is inexpensive even at many times the current catalog
   size. Do not use generic Yii UI translations as this relation.
3. Prefer one explicit scenario key and an optional existing permission key
   over free-form JSON `availability_rules`. If one template genuinely needs
   several scenarios later, add a tiny indexed relation then; do not create a
   JSON rules evaluator pre-emptively. Apply this filter only to templates
   that declare a special scenario; it is not a restriction on free typing or
   ordinary message sending.
4. Parse placeholders from the approved body at save/prepare time and validate
   them against the allowlist. Do not store a second independently editable
   variable list unless the product needs a formal approval screen for each
   variable; duplicated lists drift and add no runtime value.
5. Resolve target language and any declared special scenario once for the
   selected conversation, then load/render only the selected template on
   click. Fetch profiles, active session and settings once per preparation,
   not once for every template/variable. For session-state templates, use the
   locked session pricing/trial snapshot rather than a later changed global
   setting.
6. If customer audit means only "which template/version/language produced this
   sent message", use a narrow append-only template-use row only on a
   successful template-backed send (`message_id`, template id/version, locale,
   override, actor). Keep actual recipient text in `message.text` and never
   join this audit row in normal timeline/queue reads. Introduce immutable
   revision bodies only if a concrete compliance/dispute report requires them.
7. Implement a saved conversation target language only when its explicit UI
   action is approved. A single nullable field on canonical `conversation`
   plus low-churn audit is sufficient; a separate current-state table is not
   needed. Until then, use `Profile.language_id` as the confirmed fallback.

No migration or catalog behavior change follows from this ingestion alone.
The next implementation decision is whether the customer accepts lean
per-message provenance in place of immutable template revision history, and
which real `ServiceSession` facts enable each requested scenario.

### Historical recommended next implementation order

1. Define the active-work queue filter/preset if product wants resolved work
   hidden from an operational view. Keep the current all-`Chats` history
   behavior intact. Implement `Assign` only after the customer decides whether
   it is distinct from the existing expert-to-operator transfer.
2. Resolve whether customer audit means lean provenance or true historical
   revisions, then evolve the existing quick-reply catalog accordingly. Do
   not wire dynamic chat templates directly to generic Yii translation keys.
