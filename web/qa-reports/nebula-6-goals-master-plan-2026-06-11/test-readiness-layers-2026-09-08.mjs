import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = process.argv[2];
assert.ok(root, 'exact report root required');
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; };
const nodes = new Map();
const document = {
  getElementById(id) { if (!nodes.has(id)) nodes.set(id, { innerHTML:'' }); return nodes.get(id); },
  querySelectorAll() { return []; }
};
const c = vm.createContext({window:{},document});
for (const file of ['implementation-state-2026-09-07.js','traffic-readiness-plan-2026-09-07.js','readiness-layers-2026-09-08.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file,timeout:5000});
}
const p = c.window.sixGoalsReadinessLayers, plan = c.window.sixGoalsTrafficPlan, tasks = c.window.sixGoalsImplementation.tasks;
const rendered = nodes.get('readiness-layers-root').innerHTML;
// Read the preserved deep panel: index.html is now the compact public entrypoint.
const html = fs.readFileSync(path.join(root,'index-legacy-deep.html'),'utf8');
const report = fs.readFileSync(path.join(root,p.reportHref),'utf8');
check('exact seven unique layers', p.layers.length === 7 && new Set(p.layers.map(x=>x.id)).size === 7);
check('known ordered seven layers', p.layers.map(x=>x.id).join() === 'backend,client,agent,other_admin,learning,marketing,channels');
check('no runtime/product/spend/publication authorization inferred', !p.runtimeRetested && !p.productAccepted && !p.datesAreCommitments && !p.socialPublishingAuthorized && !p.paidSpendAuthorized);
check('all thirty-three canonical tasks preserved', Object.keys(tasks).length === 33 && plan.tasks.length === 33);
check('all thirty-three covered by acceptance lenses', new Set(p.layers.flatMap(x=>x.tasks)).size === 33);
for (const layer of p.layers) {
  check(layer.id+' maps only known tasks', layer.tasks.length && layer.tasks.every(id=>tasks[id]));
  check(layer.id+' has four dated month outcomes', layer.months.length === 4 && layer.months.every(x=>x.length > 35));
  check(layer.id+' has state source gap owner and acceptance', ['status','evidence','gap','owner','acceptance'].every(key=>layer[key]?.length > 15));
  check(layer.id+' accessible disclosure rendered', rendered.includes('id="layer-'+layer.id+'"') && rendered.includes(layer.title));
}
check('eight final launch gates unchanged', plan.launchGates.length === 8 && plan.readinessDecision === '2026-12-21');
check('pilot and capacity milestones unchanged', plan.pilotEntryGate === '2026-10-30' && !plan.capacityGate.confirmed && plan.capacityGate.due === '2026-09-11');
check('six proof levels without aggregate score', p.proofLevels.length === 6 && /Общий процент готовности не рассчитыва(?:ем|ется)/.test(rendered));
check('social target explicitly unconfirmed', p.social.countBasis === 'planning_scenario_pending_owner_clarification');
check('social arithmetic', p.social.expertPackageTarget * p.social.platforms.length === p.social.pairedAccountScenario);
check('actual counts unknown not zero', Object.values(p.social.actual).every(x=>x === null) && p.social.actualStatus === 'not_verified_not_zero');
check('network not required for paid pilot', p.social.requiredForPaidPilot === false);
check('example not platform cadence or accepted capacity', !p.social.exampleCadence.isPlatformRequirement && !p.social.exampleCadence.capacityConfirmed);
check('conditional waves 3 8 20', p.social.waves.map(w=>w.experts).join() === '3,8,20' && p.social.waves.every(w=>w.gate.length > 80));
check('wave targets remain within preparation window', p.social.waves.every(w=>w.by <= plan.featureFreeze && w.by >= p.asOf));
check('five independent prelaunch gates', p.social.readinessGates.length === 5);
check('separate human staffing, rights and safe CTA', rendered.includes('actual Agent') && rendered.includes('реально допущенных') && rendered.includes('prelaunch CTA') && rendered.includes('права'));
check('seven subpackages not canonical goals', p.workPackages.length === 7 && new Set(p.workPackages.map(x=>x[0])).size === 7);
for (const row of p.workPackages) {
  check(row[0]+' dates and ownership', row[1] >= p.asOf && row[1] <= plan.readinessDecision && row[3].length > 10 && row[4].length > 60);
  check(row[0]+' canonical task mapping', row[5].every(id=>tasks[id]));
}
check('Meta remains pending', p.policy.find(x=>x.name.includes('Meta')).status === 'pending_official_policy_readback');
check('market gate not blanket approval', p.policy[0].status === 'market_specific_not_blanket_approval' && p.policy[0].text.includes('США') && p.policy[0].text.includes('Беларуси'));
check('all cited policy urls official', p.policy.every(x=>/^https:\/\/(ads\.tiktok\.com|transparency\.meta\.com)\//.test(x.url)));
check('one render mount', html.split('id="readiness-layers-root"').length === 2);
check('scripts follow task data and calendar', html.indexOf('src="readiness-layers-2026-09-08.js"') > html.indexOf('src="traffic-readiness-plan-2026-09-07.js"'));
check('responsive source labels', rendered.includes('layer-field-label') && rendered.includes('role="columnheader"') && html.includes('#readiness-layers-root .layer-field-label { display:block;'));
check('render no undefined or NaN', !/undefined|NaN/.test(rendered));
check('no executable data handlers inserted in render', !/onerror=|javascript:|<script/.test(rendered));
for (const [, file] of p.reviewers) check(file+' source exists', fs.existsSync(path.join(root,file)));
for (const match of rendered.matchAll(/href="([^"?#]+)(?:[?#][^"]*)?"/g)) {
  if (!match[1].startsWith('https://')) check('local link '+match[1], fs.existsSync(path.join(root,match[1])));
}
const registry = JSON.parse(fs.readFileSync(path.join(root,p.social.registryHref),'utf8'));
check('registry empty template not false inventory', registry.kind === 'empty_template_not_account_inventory' && registry.records.length === 0);
check('registry unknown counters', Object.entries(registry.actual_counts).filter(([key])=>key !== 'status').every(([,value])=>value === null));
check('registry consistent count assumption', registry.planning_assumption.expert_packages === p.social.expertPackageTarget && registry.planning_assumption.paired_account_scenario === p.social.pairedAccountScenario && !registry.planning_assumption.owner_confirmed);
check('registry separates states and excludes secrets', Object.keys(registry.status_dimensions).length === 5 && registry.rules.some(x=>x.includes('credentials')));
check('MD preserves 14-day rules and milestones', ['14 последовательных','30.10','21.12','07.12','17.12'].every(x=>report.includes(x)));
check('MD preserves accepted owner decisions and open economics', report.includes('O1/O2/O3/O14') && report.includes('O4 initial economics') && report.includes('O5'));
check('MD interview marketing prohibition', report.includes('прямо запрещает маркетинговое использование интервью'));
check('MD no actions performed boundary', report.includes('Нет новых социальных аккаунтов'));
check('G3.7 mapped to client and admin', p.layers.filter(x=>['client','other_admin'].includes(x.id)).every(x=>x.tasks.includes('task-g3-rotation')));
check('rotation settings retain disabled KPI influence', p.layers.find(x=>x.id==='other_admin').acceptance.includes('KPI influence disabled'));
check('no twenty new brands scope', !rendered.includes('брендов'));
function runIndex(hash) {
  const indexNodes = new Map(), events = {};
  function node() {
    return {innerHTML:'',textContent:'',dataset:{},children:[],style:{setProperty(){}},flags:{},
      classList:{add(){},remove(){},toggle(name,value){this[name]=value;}},
      appendChild(child){this.children.push(child);},addEventListener(){},setAttribute(){},removeAttribute(){},scrollIntoView(){}};
  }
  const panels = [...html.matchAll(/data-tab-panel="([^"]+)"/g)].map(match=>Object.assign(node(),{dataset:{tabPanel:match[1]}}));
  const buttons = [...html.matchAll(/data-tab-target="([^"]+)"/g)].map(match=>Object.assign(node(),{dataset:{tabTarget:match[1]}}));
  const doc = {getElementById(id){if(!indexNodes.has(id)) indexNodes.set(id,node());return indexNodes.get(id);},createElement:node,
    querySelectorAll(selector){return selector === '[data-tab-panel]' ? panels : selector === '[data-tab-target]' ? buttons : [];},querySelector(){return null;}};
  const context = vm.createContext({document:doc,window:{location:{hash,search:'',protocol:'file:'},addEventListener(name,handler){events[name]=handler;}},URLSearchParams,console});
  for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = script[1].match(/src="([^"]+)"/);
    vm.runInContext(src ? fs.readFileSync(path.join(root,src[1]),'utf8') : script[2],context,{timeout:5000});
  }
  return {context,indexNodes,events,active:()=>panels.filter(x=>!x.classList['is-hidden']).map(x=>x.dataset.tabPanel).join()};
}
for(const [hash,expected] of [['','customer-summary'],['#unknown','customer-summary'],['#calendar-plan','calendar-plan'],['#six-goals','six-goals'],['#layer-learning','calendar-plan']]) {
  const page = runIndex(hash);
  check('initial navigation '+hash,page.active() === expected);
  if(hash === '#layer-learning') check('exact layer disclosed on deep link',page.indexNodes.get('layer-learning').open === true);
}
const navigation = runIndex('');
navigation.context.window.location.hash = '#layer-channels';
navigation.events.hashchange();
check('hashchange opens exact layer panel',navigation.active() === 'calendar-plan' && navigation.indexNodes.get('layer-channels').open === true);
console.log(JSON.stringify({status:'pass',checks,layers:p.layers.length,month_outcomes:p.layers.reduce((n,x)=>n+x.months.length,0),subpackages:p.workPackages.length,canonical_tasks:plan.tasks.length,visual_acceptance:false,product_runtime_retest:false,scope:'Native JS render with DOM double, data invariants and source references'}));
