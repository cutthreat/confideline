const fs = require('fs');
const path = require('path');
const analytics = require('../assets/partner-interactions-analytics.js');
const simulator = require('../assets/partner-interactions-simulator.js');

const fixturePath = process.argv[2] || path.join(__dirname, '..', 'fixtures', 'partner-interactions.fixture.json');
const baseFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const fixture = simulator.cloneFixture(baseFixture);
const rng = simulator.createRng(20260520);
const filters = { partnerId: 15, period: '7d', direction: 'all' };
const before = analytics.build(fixture, filters);
const generated = [];

for (let index = 0; index < 25; index++) {
  generated.push(simulator.generateEvent(fixture, filters, rng));
}
simulator.applyEvents(fixture, generated);
const after = analytics.build(fixture, filters);
const payload = simulator.buildPayload(fixture, filters, after, 'verify-simulator', generated);

const failures = [];
if (fixture.events.length !== baseFixture.events.length + generated.length) {
  failures.push('generated events were not appended to fixture');
}
if (after.summary.actions <= before.summary.actions) {
  failures.push('summary actions did not increase after generated events');
}
if (after.rows.length < before.rows.length) {
  failures.push('row count unexpectedly decreased after generated events');
}
if (JSON.stringify(payload).includes('http://') || JSON.stringify(payload).includes('https://')) {
  failures.push('payload contains an external URL');
}
if (payload.endpoint !== '/admin/partner-interaction/index') {
  failures.push('payload endpoint is not the expected local admin route');
}

const result = {
  status: failures.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  generatedEvents: generated.length,
  beforeSummary: before.summary,
  afterSummary: after.summary,
  samplePayload: payload,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  process.exit(1);
}
