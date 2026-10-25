/* PREVIEW ONLY. Same fixed fixtures as the list. */
(() => {
 const root=document.querySelector('.cl-my-payouts');if(!root)return;
 const id=new URLSearchParams(location.search).get('id')||'1043',i=Math.max(0,Math.min(4,Number(id)-1041));
 if(!root.querySelector('#detail-status'))return;
 const statuses=['Отменён','Отклонено','Выплата подтверждена','Одобрено','Заявка создана'],credits=[500,750.5,1200,625,850],date=(15+i)+'.10.26 12:00';
 const statusNode=root.querySelector('#detail-status');if(statusNode)statusNode.className='cl-status cl-status-'+['cancelled','rejected','paid','approved','requested'][i];
 const set=(selector,value)=>{const e=root.querySelector(selector);if(e)e.textContent=value;};
 document.title='Выплата №'+id;set('h1',document.title);set('#detail-status',statuses[i]);set('#detail-created',date);set('#detail-approved',[1,2,3].includes(i)?date:'—');set('#detail-paid',i===2?date:'—');set('#detail-amount',['25,00','37,52','60,00','31,25','42,50'][i]);set('#detail-rate','0,050000');set('#detail-transfer',i===2?'DEMO-TRANSFER-'+id:'—');set('#detail-fee',i===2?'0,00':'—');set('#detail-recipient',i%2===0?'Alex Example':'Partner Demo');set('#detail-wallet','DEMO-WALLET-'+id);
 const totals=root.querySelectorAll('.cl-payout-totals strong');if(totals[0])totals[0].textContent=credits[i].toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
 set('#detail-reason',i===1?'Демонстрационная причина: уточните реквизиты.':'—');
 const timeline=root.querySelector('#payout-timeline');if(timeline){timeline.replaceChildren();const steps=i===2?['Заявка создана','Одобрено','Выплата подтверждена']:i===4?['Заявка создана']:['Заявка создана',statuses[i]];steps.forEach(label=>{const li=document.createElement('li'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=label;span.textContent=date+' · Демо';li.append(strong,span);timeline.append(li);});}
})();
