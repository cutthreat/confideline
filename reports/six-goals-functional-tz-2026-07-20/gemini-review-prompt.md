# Gemini independent challenge: Confideline G1-G6 functional TZ

Goal:
Провести независимый challenge-review приложенного канонического комплекта функциональных ТЗ для 30 задач G1.1-G6.7 перед передачей программисту.

Context:
- Product model and owner decisions are already fixed in the attached files.
- The PM does not prescribe architecture, database, API, algorithms, technologies or code. The programmer chooses implementation.
- Static HTML, mockup, code presence or model opinion are not runtime proof.
- Product is currently not runtime verified.
- Scope: 5 agents, up to 25 expert profiles, 1 moderator, 1 super-admin for MVP.
- Public identity/legal question about fictional profiles is explicitly out of scope.

Allowed sources:
- Only the attached files.
- General product reasoning may be used, but any external assumption must be labeled as such.

Forbidden:
- Do not invent current runtime/backend/admin behavior.
- Do not redesign the confirmed product model.
- Do not prescribe implementation method, code, database schema or API.
- Do not reintroduce profile caps, multiple concurrent paid chats or hidden paid transition.

Review questions:
1. Does every Gx.y define a programmer-actionable product outcome and observable acceptance?
2. Are role boundaries, negative cases, money/history attribution and state transitions complete?
3. Are there contradictions between files or owner-confirmed rules?
4. Are there requirements that are too vague to accept or too technical for a PM TZ?
5. Are pilot/public/post-launch phases and dependencies coherent?
6. Which missing edge cases could cause billing, access, support or trust failure?
7. Which owner decisions are genuinely still needed, and which should not block work?

Output schema:

```text
overall_verdict: pass | revise | blocked

cross-cutting findings:
- severity: P0 | P1 | P2
  affected_tasks:
  fact_from_packet:
  gap_or_contradiction:
  product_correction:
  acceptance_correction:

task coverage:
G1.1: pass | revise | blocked - one-sentence reason
...
G6.7: pass | revise | blocked - one-sentence reason

owner questions:
- question:
  blocks: limited_pilot | public_launch | feature_enablement_only

rejected or unnecessary additions:
- item:
  reason:

final top-10 corrections:
1. ...
```

Acceptance criteria:
- All 30 task codes appear exactly once in task coverage.
- Findings separate packet facts from reviewer inference.
- Corrections remain functional/product-level.
- No implementation prescription.

