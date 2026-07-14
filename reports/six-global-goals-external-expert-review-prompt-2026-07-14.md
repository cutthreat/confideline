# Independent expert review: Confideline / Nebula six global goals

## Role

Act as an independent senior product architect, marketplace operations expert, payments/chat systems reviewer, QA lead and evidence-quality auditor. Review the product model critically. Do not flatter the owner and do not invent facts.

## Goal

Find material defects, contradictions, missing acceptance cases and unnecessary complexity in the current six-goal plan. Recommend only changes that improve launch readiness, operational clarity, revenue integrity or evidence quality.

## Evidence rules

Every statement must be classified as one of:

- `FACT_FROM_PACKET`
- `INFERENCE`
- `RECOMMENDATION`
- `MISSING_EVIDENCE`

Do not convert an owner statement, static HTML mockup or specification into runtime proof. The programmer has received the specification and started implementation, but the new functionality is not yet runtime-verified.

## Product context

Confideline is the current implementation/admin/QA base. Nebula is the product strategy and six-goal planning contour. Static PM artifacts are stored inside the Confideline repository, but product strategy and runtime evidence must remain separate.

The six goals are:

1. G1: global chat and one-consultation service session.
2. G2: pricing, per-minute billing, refunds and agent compensation.
3. G3: storefront/catalog/profile logic, city filtering, profile completeness and rotation.
4. G4: support, disputes, refunds and operating rules.
5. G5: funnel events, analytics, KPI and launch dashboard.
6. G6: agent assignment, SLA, quality, training and isolated admin access.

## Binding owner facts

### Roles and assignment

- Agent is an internal technical User role and is not visible on the client frontend.
- Expert is a separate User account with a public expert profile.
- One expert profile can be assigned to only one agent at a time.
- One agent can manage many expert profiles; there is no limit on profile count or normal conversations.
- Only super-admin assigns/reassigns profiles.
- Agent works in one cross-profile messaging workspace and sees only assigned profiles and their conversations.
- Reassignment transfers the profile and full history to the new agent, but historical authorship and financial attribution do not change.
- Super-admin must see the actual agent behind each message/action.
- Assignment history is logged.
- Technical direct login to an expert account is possible but is not a normal workflow.

### Conversation and paid chat

- A persistent client-expert dialog may contain multiple separate consultations.
- A service session represents one consultation and contains both trial and paid phases.
- Client accepts paid-chat terms before launch; the timer starts when paid chat starts.
- Available trial time is consumed first, normally three minutes.
- After trial, the same session automatically starts per-minute monetary charging; no second acceptance is required.
- Billing is per started minute; a partial final minute is charged as a full minute.
- If no trial is available, the client tops up and explicitly starts paid chat.
- An agent can have only one simultaneous paid chat across all assigned expert profiles.
- While the agent is in paid chat, other profiles show busy but still accept ordinary asynchronous messages.
- At zero balance, paid chat pauses for five minutes. The agent/session remain reserved. Either side may end the pause early.
- Top-up within five minutes resumes the same session without a new trial. Timeout ends the session; later paid interaction is a new session.
- Profile reassignment is forbidden during an active paid chat.

### Minimal service session

It must restore: client, public expert profile, actual agent, persistent dialog, consultation number, request/start/end times, trial granted/used, paid transition, price snapshot, paid duration, debit, agent accrual, refund/correction, final status, abnormal end reason and key admin audit link. Full chat, support case, QA record and financial ledger remain linked contours, not duplicated inside the session.

### Money and agent compensation

- Financial result is tracked per expert profile and rolled up to the actual agent who managed it during the consultation.
- Agent accrual is created immediately after consultation.
- Later refund creates a negative correction.
- For partial refund, default agent retention is proportional to the refunded portion.
- Super-admin can override calculation base and retention percentage for a case, with reason and history.
- Compensation has three independently configurable components: consultation rate/percentage, fixed amount for schedule/SLA, and accepted additional tasks.
- Applied rules must retain their effective policy/version.

### Public profile, city and online state

- All client-facing identity, reviews, rating, statistics, city/category, price and status belong to expert profile. Agent remains internal.
- Expert profile may belong to multiple cities through admin multi-select.
- Client profile has one city used as a filter. A city-specific view shows only expert profiles assigned to that city.
- Agent sets general online status and can switch individual profiles off with a required reason.
- Individual off state lasts until manual re-enable or next shift. Starting a new shift means setting general status online; all assigned profiles return online except super-admin-blocked profiles.
- During paid chat, profiles show busy while ordinary messages remain available.

### Rotation and KPI

- Rotation is required on every page type and is administered by users with the relevant permission.
- Existing implementation is reported by owner to have profile management, completeness-based weights, pinning, exclusions and preview, but this must be runtime-verified.
- There is no cap on how many profiles of one agent may appear at the top.
- Successful agents should receive higher placement.
- No agent-success KPI currently exists; it must be implemented.
- Initial approved KPI: first-response SLA, accepted/missed paid-chat requests, trial-to-paid, paid minutes and refunds.
- For each KPI, admin chooses immediate use, use after a minimum evidence threshold, or disabled.

### Current proof status

- Owner decisions are complete at functional-plan level.
- Programmer has the specification and implementation has started.
- Runtime proof of the new service session, billing transitions, compensation settings and final rotation/KPI behavior does not yet exist.
- Owner reports existing assignment permissions, actual-agent audit, accrual/refund analytics and rotation controls. Treat these as `owner_confirmed_existing`, not `runtime_verified`, until retested.
- Earlier runtime evidence indicated potential foreign-profile/foreign-assignment access under an agent account. This is a P0 verifier target even though owner says permissions already enforce isolation.

## Required review by goal

For each G1-G6 provide:

1. Verdict: `KEEP`, `CHANGE`, `REMOVE` or `NEEDS_PROOF`.
2. The three most material findings only.
3. Evidence classification for every finding.
4. Concrete functional change, without code or implementation technology.
5. Minimum launch acceptance cases, including at least one negative case.
6. What should remain out of MVP.

## Cross-goal review

Also assess:

- contradictions between role assignment, paid-chat exclusivity, online state and rotation;
- billing/refund edge cases and incentives;
- KPI gaming and cold-start behavior;
- whether five-minute balance pause creates operational abuse;
- reassignment/history/audit integrity;
- whether the minimal service session is too large or too small;
- whether the plan can produce false-ready claims;
- the correct implementation and verification sequence.

## Challenge pass

Answer these explicitly:

1. Where is the owner most likely wrong?
2. Where is the reviewer most likely making an unsupported assumption?
3. Which recommendation would you reject as process theater?
4. What are the five highest-value changes before pilot?

## Output format

Return concise Markdown with sections:

- Executive verdict
- G1 through G6
- Cross-goal risks
- Five changes before pilot
- Claims requiring runtime proof
- Unsupported assumptions in your own answer

Do not browse or add competitor facts in this pass. Use only this packet so the two expert reviews remain directly comparable.
