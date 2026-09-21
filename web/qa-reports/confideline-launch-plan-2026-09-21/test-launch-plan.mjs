import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(here, 'plan-data.js');
const pagePath = path.join(here, 'index.html');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), context, { filename: dataPath });

const plan = context.window.confidelineCurrentPlan;
assert.ok(plan, 'plan-data.js must expose window.confidelineCurrentPlan');
assert.deepEqual([...plan.groups.map(group => group.tasks.length)], [4, 5, 15, 14, 7, 10], 'task count by G1–G6 must remain stable');

const tasks = plan.groups.flatMap(group => group.tasks);
assert.equal(tasks.length, 55, 'panel must contain all 55 current tasks');
assert.equal(new Set(tasks.map(task => task.code)).size, 55, 'task codes must not repeat');
for (const task of tasks) {
  assert.match(task.card, /^https:\/\/trello\.com\/c\/[A-Za-z0-9]+$/, `${task.code}: direct Trello link is required`);
  assert.ok(task.title.trim(), `${task.code}: title is required`);
  assert.ok(task.state.trim(), `${task.code}: honest current state is required`);
  assert.ok(task.next.trim(), `${task.code}: next action is required`);
}

const html = fs.readFileSync(pagePath, 'utf8');
assert.ok(html.includes('План запуска'), 'page heading is required');
assert.ok(html.includes('55 задач'), 'page must state the plan size');
assert.ok(html.includes('Коммерческий запуск не подтвержден'), 'page must not overstate readiness');
assert.ok(!html.includes('nebula-6-goals-master-plan-2026-06-11'), 'standalone panel must not depend on the old plan');

let rendered = '';
const document = { getElementById(id) { assert.equal(id, 'plan'); return { set innerHTML(value) { rendered = value; } }; } };
vm.runInNewContext(html.match(/<script>\s*([\s\S]*?)\s*<\/script>\s*<\/body>/)?.[1] || '', { window: context.window, document }, { filename: pagePath });
assert.ok(rendered.includes('G1') && rendered.includes('G6'), 'all monthly sections must render');
for (const task of tasks) assert.ok(rendered.includes(task.code), `${task.code}: task must render`);
assert.ok(!rendered.includes('undefined') && !rendered.includes('NaN'), 'rendered panel must not contain broken values');

console.log(`PASS: ${tasks.length} tasks across ${plan.groups.length} groups; standalone render verified.`);
