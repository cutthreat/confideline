# Confideline Analytics Runtime Capture

- Generated: 2026-05-21T16:06:26.2005330+03:00
- Overall: **NOT_PROVEN**
- Evidence grade: NO_RUNTIME_EVIDENCE
- Reason: Browser loaded the route but did not capture matched expected analytics events and qualified beacons. Phase: collecting_client_events.
- Playwright exit code: 0
- Output: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\playwright-analytics-runtime-output.txt`
- Observation: `H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\analytics-runtime-observations.json`
- Route: /en?utm_source=qa-runtime&utm_medium=paid&utm_campaign=analytics-runtime-proof&utm_term=starter
- Project: chromium-direct
- Phase: collecting_client_events
- Navigation ms: 4753
- Analytics requests: 1
- Client events: 2
- Matched expected events:
- Expected event order: FAIL
- Qualified event beacons: 0
- Matched runtime events: 0

## Stop Condition

Do not claim runtime analytics conversion truth unless overall is RUNTIME_PROVEN with captured browser evidence.
