# Video Analysis Index

This folder contains competitor training-video analysis artifacts for the Confideline admin chat workspace research.

## Primary Synthesis

- `INSIGHTORBA_COMPETITOR_WORKFLOW_FULL_DOCUMENTATION_RU.md` - complete Russian-language synthesis with evidence levels, confirmed rules, uncertain points, recommended data contracts, and product conclusions.
- `HANDOFF_TO_CODEX_RU.md` - Russian-language handoff for continuing this work in Codex on another machine.
- `CONVERSATION_STATE_MACHINE_RU.md` - target conversation lifecycle, states, transitions, events, queue mapping, and MVP implementation layers.
- `EXPERT_QA_CHECKLIST_RU.md` - expert quality checklist for free reading, Book Now, objections, paid sessions, reactivation, safety, and cabinet usage.
- `EXPERT_WORK_REGULATION_RU.md` - operational expert work regulation for shifts, chats, free reading, Book Now, paid sessions, objections, reactivation, safety, and handoff.
- `ADMIN_WORKSPACE_BACKLOG_RU.md` - product backlog for `admin-chat-workspace-v2` based on the competitor video analysis.

## Implementation Artifacts

- `DATA_DICTIONARY_RU.md` - target data fields for conversations, clients, free trial, Book Now, paid sessions, objections, coupons, reactivation, safety, pings, experts, and draft provenance.
- `EVENT_TAXONOMY_RU.md` - event taxonomy for funnel analytics, QA timeline, Pings, payment/session events, objections, safety, and workforce events.
- `USER_STORIES_ACCEPTANCE_CRITERIA_RU.md` - user stories and acceptance criteria for experts, mentors, managers, support, analysts, and business owners.
- `UI_BLUEPRINT_RU.md` - functional UI blueprint for queues, Pings, chat header, timeline, composer, Book Now, paid session blocks, right panel, dashboard, and onboarding.
- `RISK_REGISTER_RU.md` - revenue, conversion, safety, operational, and data risks with controls and ownership.

## Per-Video Analysis

| Day | Part | Manual analysis |
|---|---:|---|
| 1 | 1 | `day-1-part-1/INSIGHTORBA_DAY1_PART1_ANALYSIS.md` |
| 1 | 2 | `day-1-part-2/INSIGHTORBA_DAY1_PART2_ANALYSIS.md` |
| 2 | 1 | `day-2-part-1/INSIGHTORBA_DAY2_PART1_ANALYSIS.md` |
| 2 | 2 | `day-2-part-2/INSIGHTORBA_DAY2_PART2_ANALYSIS.md` |
| 3 | 1 | `day-3-part-1/INSIGHTORBA_DAY3_PART1_ANALYSIS.md` |
| 3 | 2 | `day-3-part-2/INSIGHTORBA_DAY3_PART2_ANALYSIS.md` |
| 4 | 1 | `day-4-part-1/INSIGHTORBA_DAY4_PART1_ANALYSIS.md` |
| 4 | 2 | `day-4-part-2/INSIGHTORBA_DAY4_PART2_ANALYSIS.md` |
| 5 | 1 | `day-5-part-1/INSIGHTORBA_DAY5_PART1_ANALYSIS.md` |
| 5 | 2 | `day-5-part-2/INSIGHTORBA_DAY5_PART2_ANALYSIS.md` |
| 6 | 1 | `day-6-part-1/INSIGHTORBA_DAY6_PART1_ANALYSIS.md` |
| 6 | 2 | `day-6-part-2/INSIGHTORBA_DAY6_PART2_ANALYSIS.md` |
| 7 | 1 | `day-7-part-1/INSIGHTORBA_DAY7_PART1_ANALYSIS.md` |
| 7 | 2 | `day-7-part-2/INSIGHTORBA_DAY7_PART2_ANALYSIS.md` |

## Generated Artifacts

Each `day-*` folder may contain:

- `*_fast.md` - transcript with timecodes;
- `*_fast.json` - structured transcript segments;
- `*.srt` and `*.vtt` - subtitle files;
- `frames_index.csv` - extracted frame index;
- `contact_sheets/` - visual summary sheets;
- `frames/` - raw extracted frames, intentionally excluded from git because of size.

The manual analysis and transcript artifacts are the primary evidence base. Contact sheets are useful for UI confirmation. Raw frames can be regenerated from the source videos when needed.
