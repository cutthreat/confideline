/* Presentation only. Category keys, rule patterns and filtering stay in the existing demo. */
(() => {
 'use strict';
 const root=document.querySelector('[data-contact-filter-page="rules"]');
 if(!root)return;
 root.classList.add('admin-icon-badges');
 const catalog={
  email:{icon:'envelope-o',label:'E-mail',full:'Электронная почта'},
  'email-masked':{icon:'envelope-o',modifier:'asterisk',label:'E-mail · маска',full:'Замаскированный e-mail'},
  link:{icon:'link',label:'Ссылка',full:'Ссылки и домены'},
  phone:{icon:'phone',label:'Телефон',full:'Телефонные номера'},
  messenger:{icon:'comments-o',label:'Мессенджер',full:'Аккаунты мессенджеров'}
 };
 function update(){
  const journalLink=document.querySelector('.cl-module-nav a[href="contact-incidents.html"]');
  if(journalLink)journalLink.href='/contact/demo/contact-incidents.html';
  const models=new Map([...root.querySelectorAll('[data-cf-rule-models] script')].map(node=>{const model=JSON.parse(node.textContent);return[String(model.id),model];}));
  root.querySelectorAll('tr[data-rule-id]').forEach(row=>{
   const model=models.get(row.dataset.ruleId),cell=row.querySelector('.cf-category');
   if(!model||!cell)return;
   // Presentation metadata belongs to the rule; the category enum stays unchanged.
   const variant=row.dataset.categoryVariant||model.presentation_variant||model.category;
   const item=catalog[variant];if(!item||cell.dataset.ruleIconVariant===variant)return;
   const group=document.createElement('span');group.className='cf-rule-category';group.title=item.full;
   const badge=document.createElement('span');badge.className='transaction-type'+(item.modifier?' has-mask':'');badge.setAttribute('aria-hidden','true');
   const icon=document.createElement('i');icon.className='fa fa-'+item.icon;badge.append(icon);
   if(item.modifier){const modifier=document.createElement('i');modifier.className='fa fa-'+item.modifier+' cf-rule-category-modifier';badge.append(modifier);}
   const label=document.createElement('span');label.textContent=item.label;
   group.append(badge,label);cell.replaceChildren(group);cell.dataset.ruleIconVariant=variant;
  });
 }
 let queued=false;
 new MutationObserver(records=>{
  if(!records.some(r=>r.target.nodeType===1&&(r.target.closest('tbody,[data-cf-rule-models]'))))return;
  if(!queued){queued=true;queueMicrotask(()=>{queued=false;update();});}
 }).observe(root,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);else update();
})();
