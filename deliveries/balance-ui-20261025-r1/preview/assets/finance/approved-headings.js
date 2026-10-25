/* Approved text only. The original fields, ordering, classes and sort controls stay intact. */
(() => {
 const root=document.querySelector('[data-preview-finance]');if(!root||root.dataset.previewFinance==='partner')return;
 const en=new URLSearchParams(location.search).get('lang')==='en';
 const labels={id:['ID','ID'],guid:['GUID','GUID'],code:['Код','Code'],owner:['Владелец','Owner','Владелец кошелька','Wallet owner'],customer:['Клиент','Customer'],expert:['Эксперт','Expert'],agent:['Агент','Agent'],credits:['Кредиты','Credits'],amount:['Сумма','Amount'],usd:['USD','USD','Сумма получателю, USD','Recipient amount, USD'],status:['Статус','Status'],created:['Создано','Created','Дата заявки','Request date'],approved:['Одобрено','Approved','Дата одобрения','Approval date'],paid:['Выплачено','Paid','Дата фактической выплаты','Actual payout date'],updated:['Обновлено','Updated','Дата обновления','Last updated'],before:['Было','Before','Баланс до операции','Balance before transaction'],date:['Дата','Date'],description:['Описание','Description','Тип и описание','Type and description'],provider:['Система','Provider','Платёжная система','Payment provider']};
 root.querySelectorAll('thead tr:first-child th[data-field]').forEach(th=>{
  const entry=labels[th.dataset.field];if(!entry)return;const target=th.querySelector('a,button')||th;
  const text=entry[en?1:0],full=entry[en?3:2]||text;
  target.textContent=text;target.setAttribute('lang',en?'en':'ru');target.setAttribute('aria-label',full);
  th.dataset.financeHeading=th.dataset.field;
  if(full!==text){target.tabIndex=0;target.title=full;target.dataset.financeHeadingHint='true';jQuery(target).tooltip({trigger:'hover focus',animation:false,html:false,container:root,placement:'auto top'});}
 });
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.matches('[data-finance-heading-hint]'))jQuery(e.target).tooltip('hide');});
})();
