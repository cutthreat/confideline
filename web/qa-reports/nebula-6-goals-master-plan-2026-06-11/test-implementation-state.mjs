import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const stateFile = 'implementation-state-2026-09-07.js';
const checks = [];
function check(name, condition) {
  assert.ok(condition, name);
  checks.push(name);
}
function runPage(file, search = '') {
  const nodes = new Map();
  function node() {
    return { innerHTML:'', textContent:'', style:{ setProperty() {} }, dataset:{},
      classList:{ add() {}, remove() {}, toggle() {} }, children:[],
      appendChild(child) { this.children.push(child); }, addEventListener() {},
      setAttribute() {}, removeAttribute() {} };
  }
  const document = {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); },
    createElement:node, querySelectorAll() { return []; }, querySelector() { return null; }
  };
  const context = vm.createContext({ document, window:{ location:{ search, protocol:'file:' } }, URLSearchParams, console });
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const source = script[1].match(/src="([^"]+)"/);
    const code = source ? fs.readFileSync(path.join(root, source[1]), 'utf8') : script[2];
    vm.runInContext(code, context, { filename:source?.[1] || file, timeout:5000 });
  }
  return { nodes, state:context.window.sixGoalsImplementation, plan:context.window.sixGoalsTrafficPlan, audit:context.window.sixGoalsLaunchAudit };
}

const main = runPage('index.html');
const state = main.state;
check('canonical task count 33', Object.keys(state.tasks).length === 33);
check('95 execution rows', state.runLog.rows === 95);
check('verdict totals match rows', ['PASS','WARN','RETEST','FAIL'].reduce((n,key) => n + state.runLog[key], 0) === 95);
check('six goal sections rendered', main.nodes.get('goals-grid').children.length === 6);
check('advanced inventory rendered', main.nodes.get('implemented-chat-features').innerHTML.includes('Расширения Chat V2'));
const grid = main.nodes.get('goals-grid').children.map(n => n.innerHTML).join('');
const realized = ['task-g1-session','task-g1-chat','task-g1-statuses','task-g2-pricing','task-g2-timer','task-g4-support','task-g6-assignment'];
for (const [id, factual] of Object.entries(state.tasks)) {
  check(id + ' has factual source', !!state.evidence[factual.basis] && !!factual.done && !!factual.next);
  check(id + ' appears in master', grid.includes(encodeURIComponent(id)) && grid.includes(factual.stage));
  for (const [file, doc] of [['task-readiness.html',''], ['task-tz.html','&doc=igor'], ['task-tz.html','&doc=codex']]) {
    const page = runPage(file, '?task=' + id + doc);
    const rendered = page.nodes.get('content').innerHTML;
    const pmView = file === 'task-tz.html' && doc === '&doc=igor';
    check(file + doc + ':' + id + ' factual status', rendered.includes(factual.stage)
      && (pmView
        ? rendered.includes('Проверяет PM') && rendered.includes('Что проверить на сайте') && !rendered.includes(factual.next)
        : rendered.includes(factual.done)));
    check(file + doc + ':' + id + ' no undefined output', !rendered.includes('undefined'));
  }
}
for (const id of realized) check(id + ' realized status', state.tasks[id].stage === 'Реализовано. Тестируем');
check('unverified refund not auto-promoted', state.tasks['task-g2-refund'].stage !== 'Реализовано. Тестируем');
check('live support promoted from prototype with source', state.tasks['task-g4-support'].basis === 'support' && state.evidence.support.includes('2026-09-04'));
for (const file of ['index.html','task-readiness.html','task-tz.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  check(file + ' shared script before inline', source.indexOf('src="' + stateFile + '"') < source.indexOf('<script>'));
}
const invalid = runPage('task-readiness.html', '?task=unknown');
check('unknown task handled', invalid.nodes.get('content').innerHTML.includes('Задача не найдена'));
check('audit exists', fs.existsSync(path.join(root, state.reportHref)));
if (main.plan) {
  const plan = main.plan;
  check('four calendar months', plan.months.length === 4);
  check('33 scheduled canonical tasks', plan.tasks.length === 33 && new Set(plan.tasks.map(row => row[0])).size === 33);
  check('target January 2027', plan.target === '2027-01' && plan.readinessDecision === '2026-12-21');
  check('capacity and spend not assumed', !plan.datesAreCommitments && !plan.launchAuthorized);
  check('eight launch gates', plan.launchGates.length === 8);
  check('capacity count matches actual owner routes', plan.tasks.filter(row => row[3].includes('Игорь')).length === plan.capacityGate.igorTaskRows);
  check('capacity remains unconfirmed', !plan.capacityGate.confirmed && plan.capacityGate.due === '2026-09-11');
  check('pilot follows integration gate', plan.pilotWindow.start > plan.pilotEntryGate);
  const days = (start, end) => (Date.parse(end) - Date.parse(start)) / 86400000;
  check('decision has full observation window', days(plan.pilotWindow.lastBlockingFixForDecision, plan.readinessDecision) >= plan.pilotWindow.minimumConsecutiveDays);
  check('reserve has full observation window', days(plan.pilotWindow.lastBlockingFixForYearEnd, plan.reserveEnds) >= plan.pilotWindow.minimumConsecutiveDays);
  check('late December fix cannot fit year end', days('2026-12-18', plan.reserveEnds) < plan.pilotWindow.minimumConsecutiveDays);
  check('pilot evidence tied to version and policy', plan.pilotWindow.lineage.length === 5 && plan.pilotWindow.restartOn.length === 5);
  check('external commercial milestones precede pilot', plan.externalMilestones.length === 6 && plan.externalMilestones.every(row => row[0] <= plan.pilotEntryGate));
  for (const row of plan.tasks) {
    check(row[0] + ' calendar binds known task', !!state.tasks[row[0]]);
    check(row[0] + ' ordered dates inside remaining months', row[1] >= plan.asOf && row[1] <= row[2] && row[2] <= plan.readinessDecision);
    check(row[0] + ' named owner and proof', !!row[3] && !!row[4]);
  }
  check('all functional results before pilot except marketing decision', plan.tasks.every(row => row[0] === 'task-g5-marketing-gate' || row[1] <= '2026-10-30'));
  check('calendar rendered with reserve', main.nodes.get('traffic-readiness-root').innerHTML.includes('22–31 декабря'));
  check('plan source exists', fs.existsSync(path.join(root, plan.documentHref)));
}
if (main.audit) {
  const audit = main.audit;
  const rendered = main.nodes.get('launch-audit-root').innerHTML;
  check('audit has six goal verdicts', audit.goals.length === 6 && new Set(audit.goals.map(row => row[0])).size === 6);
  check('audit does not accept product', audit.productAccepted === false);
  // This is the original reviewed slice, not a query against current goal numbers.
  const expected = [
    'task-g4-support','task-g4-complaints','task-g4-docs','task-g4-support-notifications','task-g4-expert-sourcing','task-g4-social-profiles',
    'task-g5-events','task-g5-dashboard','task-g5-kpi','task-g5-marketing-gate','task-g5-notifications',
    'task-g6-assignment','task-g6-sla','task-g6-quality','task-g6-training',
    'task-g6-team-notifications','task-g6-admin-url','task-g6-isolated-admin-access'
  ];
  check('exactly 18 reviewed additions', audit.additions.length === expected.length
    && new Set(audit.additions.map(row=>row[0])).size === expected.length);
  for (const id of expected) {
    check(id + ' audit addition exists', audit.additions.some(row => row[0] === id));
    check(id + ' audit has calendar owner', main.plan.tasks.some(row => row[0] === id));
    check(id + ' audit renders task link', rendered.includes('?task=' + id));
  }
  check('audit does not duplicate dates', audit.additions.every(row => row.length === 4));
  check('audit no undefined output', !rendered.includes('undefined'));
  check('audit preserves request and offer', rendered.includes('client request либо offer'));
  check('audit separates admission and assignment', rendered.includes('сохраняет разрешённые обучение/feedback/appeal'));
  check('audit includes critical safety stop', rendered.includes('confirmed critical safety'));
  check('audit distinguishes final and entry gates', rendered.includes('traffic GO — 21.12'));
  check('audit field labels survive mobile', rendered.includes('audit-field-label') && rendered.includes('role="columnheader"'));
  check('audit report exists', fs.existsSync(path.join(root, audit.reportHref)));
  check('three reviews exist', audit.reviewers.length === 3 && audit.reviewers.every(row => fs.existsSync(path.join(root,row[1]))));
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  check('audit scope has wrapping fix', html.includes('#calendar-plan .summary-goal-table th, #calendar-plan .summary-goal-table td { width:auto; white-space:normal; overflow-wrap:anywhere; }'));
  check('audit has narrow record layout', html.includes('#launch-audit-root .audit-field-label { display:block;'));
}
console.log(JSON.stringify({ status:'pass', checks:checks.length, task_views:90, runtime_browser_observation:false,
  scope:'JavaScript execution with DOM test double; not layout or live product acceptance' }));
