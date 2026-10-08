'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const css=require('./tooling/node_modules/css-tree');
const {parseHTML}=require('./tooling/node_modules/linkedom');
const root=path.resolve(__dirname,'../developer');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const list=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):[path.join(dir,e.name)]);
const relative=f=>path.relative(root,f).replaceAll('\\','/');
const local=(from,url)=>{if(/^(?:data:|https?:|mailto:|tel:|#)/i.test(url))return null;return path.resolve(path.dirname(from),decodeURIComponent(url.split(/[?#]/)[0]));};
const removed=[];
if(process.argv.includes('--prune'))for(const file of list(root).filter(f=>f.endsWith('.css'))){
 const ast=css.parse(fs.readFileSync(file,'utf8'));
 css.walk(ast,{visit:'Declaration',enter(node,item,parent){
  const missing=[];css.walk(node,n=>{if(n.type==='Url'){const target=local(file,n.value);if(target&&!fs.existsSync(target))missing.push(n.value)}});
  if(missing.length){removed.push({file:relative(file),property:node.property,urls:missing});parent.remove(item)}
 }});
 if(removed.some(row=>row.file===relative(file)))fs.writeFileSync(file,css.generate(ast));
}
const failures=[],refs=[],external=[];
function check(from,url,kind){const target=local(from,url);if(!target){if(/^https?:/i.test(url))external.push({from:relative(from),url,kind});return}const row={from:relative(from),url,kind,target:relative(target)};refs.push(row);if(!target.startsWith(root+path.sep)||!fs.existsSync(target))failures.push(row)}
for(const file of list(root)){
 if(file.endsWith('.css')){const ast=css.parse(fs.readFileSync(file,'utf8'));css.walk(ast,n=>{if(n.type==='Url')check(file,n.value,'css')})}
 if(file.endsWith('.html')){
  const {document}=parseHTML(fs.readFileSync(file,'utf8'));
  for(const el of document.querySelectorAll('[src],[href]'))for(const attr of ['src','href'])if(el.hasAttribute(attr))check(file,el.getAttribute(attr),attr);
 }
}
const result={schema:'confideline_r4_resource_audit.v1',checked_at_utc:new Date().toISOString(),status:failures.length?'fail':'pass',files:list(root).filter(f=>!f.endsWith('.md')&&path.basename(f)!=='manifest.json').map(f=>({path:relative(f),sha256:hash(f)})),reference_count:refs.length,missing:failures,external_references:external,external_network_status:'not_verified_by_static_audit',removed_unused_missing_declarations:removed,scope:'HTML resource/link attributes and complete local stylesheet URL dependency graph; no browser runtime or external-network claim'};
fs.writeFileSync(path.join(__dirname,'resource-audit.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({status:result.status,reference_count:refs.length,missing:failures.length,removed_declarations:removed.length}));
if(failures.length){console.log(JSON.stringify(failures.slice(0,20)));process.exitCode=1}
