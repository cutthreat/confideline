/* Local preview adapter: approved labels only. No column, row, filter or sort mutations. */
(function () {
 'use strict';
 const file=location.pathname.split('/').pop();
 const root=document.querySelector('.cl-admin-ui')||(file==='order.html'?document.querySelector('.content-wrapper'):null);
 if(!root||root.dataset.financeHeadingsReady)return;
 root.dataset.financeHeadingsReady='true';
 const locale=new URLSearchParams(location.search).get('lang')==='en'?'en':'ru';
 const labels={
  id:['ID','ID'],guid:['GUID','GUID'],code:['Код','Code'],
  owner:['Владелец','Owner','Владелец кошелька','Wallet owner'],
  customer:['Клиент','Customer'],expert:['Эксперт','Expert'],agent:['Агент','Agent'],
  credits:['Кредиты','Credits'],amount:['Сумма','Amount'],
  usd:['USD','USD','Сумма получателю, USD','Recipient amount, USD'],
  status:['Статус','Status'],
  created:['Создано','Created','Дата заявки','Request date'],
  approved:['Одобрено','Approved','Дата одобрения','Approval date'],
  paid:['Выплачено','Paid','Дата фактической выплаты','Actual payout date'],
  updated:['Обновлено','Updated','Дата обновления','Last updated'],
  before:['Было','Before','Баланс до операции','Balance before transaction'],
  date:['Дата','Date'],description:['Описание','Description','Тип и описание','Type and description'],
  provider:['Система','Provider','Платёжная система','Payment provider']
 };
 const touched=new WeakSet();
 function field(th,index,table){
  if(table.id==='finance-my-payouts-grid')return ['id','credits','usd','status','created','approved','paid'][index];
  if(table.classList.contains('payout-register'))return ['id','owner','credits','usd','created','status','approved','paid'][index];
  if(table.classList.contains('orders-grid-view')){
   for(const [part,key] of Object.entries({user:'customer',guid:'guid',amount:'credits',price:'amount',date:'updated',status:'status',payment:'provider'}))if(th.classList.contains('order-col-'+part))return key;
  }
  if(file==='balance.html'||file==='transactions.html'){
   const prefix=file==='balance.html'?'balance-col-':'tx-col-';
   for(const [part,key] of Object.entries({id:'id',code:'code',user:'customer',expert:'expert',agent:'agent',amount:'credits',before:'before',date:'date',type:'description'})){
    if(th.classList.contains(prefix+part)){
     // Preserve the existing projection: a wallet-owner column is not renamed Customer.
     return part==='user'&&/^(Владелец|Owner)$/.test(th.textContent.trim())?'owner':key;
    }
   }
  }
 }
 function update(){
  root.querySelectorAll('table').forEach(table=>{
   if(!table.tHead)return;
   [...table.tHead.rows[0].cells].forEach((th,index)=>{
    const key=field(th,index,table);if(!key)return;
    const entry=labels[key],short=entry[locale==='en'?1:0],full=entry[locale==='en'?3:2]||short;
    const target=th.querySelector('a,button')||th;
    // Keep the existing sortable anchor/button and its arrow nodes, listeners and attributes.
    let text=target.querySelector('.finance-heading-label');
    if(!text){
     const nodes=[...target.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
     text=document.createElement('span');text.className='finance-heading-label';
     if(nodes.length){nodes[0].replaceWith(text);nodes.slice(1).forEach(n=>n.remove());}
     else target.prepend(text);
    }
    if(text.textContent!==short)text.textContent=short;
    if(target.getAttribute('aria-label')!==full)target.setAttribute('aria-label',full);
    if(target.getAttribute('lang')!==locale)target.setAttribute('lang',locale);
    if(!touched.has(th)){th.style.removeProperty('min-width');touched.add(th);}
    if(full!==short&&!target.matches('a,button'))target.tabIndex=0;
    if(full!==short&&window.jQuery?.fn.tooltip&&!target.dataset.financeHeadingHint){
     target.title=full;target.dataset.financeHeadingHint='true';
     window.jQuery(target).tooltip({trigger:'hover focus',animation:false,html:false,container:root,placement:'auto top',viewport:{selector:'body',padding:12}});
    }
    th.dataset.financeHeading=key;
   });
  });
 }
 let queued=false;
 new MutationObserver(records=>{
  if(!records.some(r=>r.target.nodeType===1&&r.target.closest('thead')||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('table,thead')||n.querySelector('thead')))))return;
  if(!queued){queued=true;queueMicrotask(()=>{queued=false;update();});}
 }).observe(root,{childList:true,subtree:true});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&event.target.closest('[data-finance-heading-hint]'))window.jQuery(event.target).tooltip('hide');});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update);else update();
})();
