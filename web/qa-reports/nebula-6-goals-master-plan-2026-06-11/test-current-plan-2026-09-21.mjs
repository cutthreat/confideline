import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = process.argv[2];
assert.ok(root, 'exact report root required');
let checks = 0;
const check = (name, condition) => { assert.ok(condition, name); checks++; };
const planPath = path.join(root, 'current-plan-2026-09-21.js');
const planContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(planPath, 'utf8'), planContext, { filename: planPath, timeout: 5000 });
const plan = planContext.window.confidelineCurrentPlan;
const allTasks = plan.groups.flatMap(group => group.tasks);

check('exact six calendar groups', plan.groups.map(group => group.code).join(',') === 'G1,G2,G3,G4,G5,G6');
check('exact current group counts', plan.groups.map(group => group.tasks.length).join(',') === '4,5,15,14,7,10');
check('exact fifty-five unique tasks', allTasks.length === 55 && new Set(allTasks.map(task => task.code)).size === 55);
check('all task cards use direct Trello links', allTasks.every(task => /^https:\/\/trello\.com\/c\/[A-Za-z0-9]+/.test(task.card)));
check('only known work kinds are used', allTasks.every(task => ['existing', 'site', 'decision', 'operational'].includes(task.kind)));
check('every new site function has a required detailed specification package', allTasks.filter(task => task.kind === 'site').every(task => plan.packageByKind.site.includes('отдельное ТЗ для Игоря и Codex')));
check('direct document links are safe https links', allTasks.flatMap(task => task.docs).every(doc => /^https:\/\//.test(doc.href) && doc.label.length > 1));

for (const indexName of ['index.html', 'index-pm-lite-draft.html']) {
  const html = fs.readFileSync(path.join(root, indexName), 'utf8');
  check(indexName + ' loads current plan data', html.includes('current-plan-2026-09-21.js'));
  check(indexName + ' renders detailed package list', html.includes('id="current-tz-list"') && html.includes('renderDetailedPackage'));
  check(indexName + ' labels old planning sections as archive', html.includes('Архив: прежний план'));
  const nodes = new Map();
  const node = () => ({ innerHTML:'', dataset:{}, classList:{ toggle(){} }, addEventListener(){}, setAttribute(){}, getAttribute(){ return null; } });
  const panels = [...html.matchAll(/data-tab-panel="([^"]+)"/g)].map(match => Object.assign(node(), { dataset:{ tabPanel:match[1] } }));
  const buttons = [...html.matchAll(/data-tab-target="([^"]+)"/g)].map(match => Object.assign(node(), { dataset:{ tabTarget:match[1] } }));
  const document = {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); },
    querySelectorAll(selector) { return selector === '[data-tab-panel]' ? panels : selector === '[data-tab-target]' ? buttons : []; }
  };
  const context = vm.createContext({ document, window:{ location:{ hash:'' }, history:{ replaceState(){} }, addEventListener(){} } });
  vm.runInContext(fs.readFileSync(planPath, 'utf8'), context, { filename: planPath, timeout: 5000 });
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  check(indexName + ' has one executable inline renderer', inline.length === 1);
  vm.runInContext(inline[0], context, { filename:indexName, timeout:5000 });
  const goalList = nodes.get('goal-list').innerHTML;
  const detailed = nodes.get('current-tz-list').innerHTML;
  check(indexName + ' renders all fifty-five task codes', allTasks.every(task => goalList.includes(task.code)));
  check(indexName + ' renders all detailed packages', plan.groups.every(group => detailed.includes(group.code + ' — ')));
  check(indexName + ' renderer has no undefined values', !/undefined|NaN/.test(goalList + detailed));
}
console.log(JSON.stringify({ status:'pass', checks, groups:plan.groups.length, tasks:allTasks.length, scope:'current master plan data and native renderer' }));
