const fs = require('fs');
const path = require('path');
const analytics = require('../assets/partner-interactions-analytics.js');

const fixturePath = process.argv[2] || path.join(__dirname, '..', 'fixtures', 'partner-interactions.fixture.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const failures = [];
const cases = {};

for (const [name, expected] of Object.entries(fixture.expected || {})) {
  const result = analytics.build(fixture, expected.filters);
  const caseResult = {
    filters: expected.filters,
    summary: result.summary,
    qualitySummary: result.qualitySummary,
    rows: result.rows.map(row => ({
      pair: row.actorId + ':' + row.targetId,
      direction: row.directionKey,
      total: row.total
    }))
  };
  cases[name] = caseResult;

  compareObject(`${name}.summary`, result.summary, expected.summary);
  if (expected.qualitySummary) {
    compareObject(`${name}.qualitySummary`, result.qualitySummary, expected.qualitySummary);
  }

  if (expected.rows) {
    const rowsByPair = new Map(result.rows.map(row => [row.actorId + ':' + row.targetId, row]));
    for (const [pair, expectedRow] of Object.entries(expected.rows)) {
      if (!rowsByPair.has(pair)) {
        failures.push(`${name}.rows.${pair}: missing row`);
        continue;
      }
      const actualRow = rowsByPair.get(pair);
      compareObject(`${name}.rows.${pair}`, actualRow, expectedRow);
    }
    for (const pair of rowsByPair.keys()) {
      if (!expected.rows[pair]) {
        failures.push(`${name}.rows.${pair}: unexpected row`);
      }
    }
  }

  const invalidPairs = result.rows.filter(row => {
    const actorExpert = result.experts.some(expert => expert.id === row.actorId);
    const targetExpert = result.experts.some(expert => expert.id === row.targetId);
    return actorExpert === targetExpert;
  });
  if (invalidPairs.length) {
    failures.push(`${name}: found non client/expert rows: ${invalidPairs.map(row => row.actorId + ':' + row.targetId).join(', ')}`);
  }
}

const output = {
  status: failures.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  caseCount: Object.keys(cases).length,
  failures,
  cases
};

console.log(JSON.stringify(output, null, 2));
if (failures.length) {
  process.exit(1);
}

function compareObject(prefix, actual, expected) {
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    if (actualValue !== expectedValue) {
      failures.push(`${prefix}.${key}: expected ${expectedValue}, got ${actualValue}`);
    }
  }
}
