/* PREVIEW ONLY. Deterministic local rows; no backend or browser storage. */
(() => {
 const root=document.querySelector('[data-preview-finance]');if(!root)return;
 const page=root.dataset.previewFinance,table=root.querySelector('table[data-preview-grid]');if(!table)return;
 const rows=[...table.tBodies[0].rows],fields=[...table.querySelectorAll('[data-filter-field]')];
 const aliases={'Заявка создана':'pending','Одобрено':'approved','Выплата подтверждена':'paid','Отклонено':'rejected','Отменён':'cancelled'};
 fields.filter(e=>e.tagName==='SELECT').forEach(select=>{[...select.options].forEach(o=>{o.value=aliases[o.textContent]||o.textContent.trim();if(!o.textContent.trim())o.value='';});});
 function filter(){let count=0;const empty=new URLSearchParams(location.search).get('state')==='empty';
  rows.forEach(row=>{let show=!empty;
   fields.forEach(field=>{if(field.matches('[type=checkbox]'))return;const value=field.value.trim();if(field.matches('[data-preview-period]')){const a=field.dataset.rangeStart,b=field.dataset.rangeEnd,d=row.dataset[field.dataset.filterField+'Date']??row.dataset.date;if((a||b)&&!d||a&&d<a||b&&d>b)show=false;return;}if(!value)return;
    const key=field.dataset.filterField,cell=row.querySelector('td[data-field="'+key+'"]');if(!cell)return;
    if(key==='description'&&field.tagName==='SELECT'){if(row.dataset.type!==value)show=false;return;}
    const raw=cell.textContent.trim();if(key==='status'&&field.tagName==='SELECT'){if(row.dataset.status!==value&&raw!==value)show=false;return;}
    if(/amount_(min|max)/.test(field.name)){const n=Number(raw.replace(/\s/g,'').replace(',','.')),v=Number(value);if(field.name.includes('_min')?n<v:n>v)show=false;return;}
    const partyId=row.dataset[key+'Id'];
    if(/^\d+$/.test(value)&&partyId){if(partyId!==value)show=false;return;}
    if(!raw.toLocaleLowerCase().includes(value.toLocaleLowerCase()))show=false;
   });row.hidden=!show;if(show)count++;
  });
  const summary=root.querySelector('.summary');if(summary)summary.textContent=count?'Показаны записи 1–'+count+' из '+count+'.':'Показано 0 записей.';
  let emptyRow=table.querySelector('[data-preview-empty]');if(!emptyRow){emptyRow=document.createElement('tr');emptyRow.dataset.previewEmpty='true';const td=document.createElement('td');td.colSpan=table.tHead.rows[0].cells.length;td.textContent='Нет записей по выбранным условиям.';emptyRow.append(td);table.tBodies[0].append(emptyRow);}emptyRow.hidden=count>0;
 }
 fields.forEach(field=>{field.addEventListener('input',filter);field.addEventListener('change',filter);});
 root.addEventListener('preview:rangechange',filter);
 root.querySelectorAll('[data-preview-reset]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();fields.forEach(f=>{if(!f.matches('[type=checkbox]'))f.value='';if(f.matches('[data-preview-period]'))f.dispatchEvent(new Event('preview:reset-period'));});filter();}));
 root.querySelectorAll('thead a[data-sort],thead button[data-sort]').forEach(button=>button.addEventListener('click',e=>{
  e.preventDefault();const th=button.closest('th'),key=th.dataset.field,desc=th.getAttribute('aria-sort')==='ascending';
  table.querySelectorAll('th[aria-sort]').forEach(h=>h.removeAttribute('aria-sort'));th.setAttribute('aria-sort',desc?'descending':'ascending');
  const numeric=['id','credits','before','amount','usd'].includes(key);rows.sort((a,b)=>{let aa=a.querySelector('[data-field="'+key+'"]')?.textContent.trim()||'',bb=b.querySelector('[data-field="'+key+'"]')?.textContent.trim()||'';const num=s=>Number(s.replace(/\s|USD/g,'').replace(',','.'));return(desc?-1:1)*(numeric?num(aa)-num(bb):aa.localeCompare(bb,'ru',{numeric:true}));}).forEach(row=>table.tBodies[0].insertBefore(row,table.querySelector('[data-preview-empty]')));
 }));
 table.tHead.querySelector('input[type=checkbox]')?.addEventListener('change',e=>rows.forEach(row=>{const box=row.querySelector('input[type=checkbox]');if(box&&!row.hidden)box.checked=e.target.checked;}));
 root.querySelectorAll('.pagination').forEach(p=>{p.innerHTML='<li class="active"><a href="#" aria-current="page">1</a></li>';});
 // Rehydrate only exported Select2 controls; use the original customer library/theme.
 root.querySelectorAll('select.select2-hidden-accessible').forEach(select=>{
  const cell=select.parentElement;cell.querySelectorAll('.select2-container').forEach(n=>n.remove());select.classList.remove('select2-hidden-accessible');select.removeAttribute('style');select.removeAttribute('tabindex');select.removeAttribute('aria-hidden');
  jQuery(select).select2({theme:'bootstrap',width:'100%',minimumResultsForSearch:0,allowClear:true,placeholder:'Все'}).on('change',filter);
 });
 const state=new URLSearchParams(location.search).get('state'),card=root.querySelector('.finance-payout-card');
 if(card){
  const method=card.querySelector('select'),request=card.querySelector('[data-preview-request]');
  if(state==='ready'||state==='error'){card.querySelector('p strong').textContent='2 450,00';card.querySelectorAll('[disabled]').forEach(e=>e.disabled=false);}
  if(request)request.addEventListener('click',()=>{
   if(!method?.selectedIndex){let err=card.querySelector('[data-preview-method-error]');if(!err){err=document.createElement('p');err.className='help-block';err.dataset.previewMethodError='true';err.textContent='Выберите способ выплаты.';method.after(err);}method.focus();return;}
   let modal=document.querySelector('#previewPayoutConfirm');if(!modal){modal=document.createElement('div');modal.id='previewPayoutConfirm';modal.className='modal fade';modal.tabIndex=-1;modal.setAttribute('role','dialog');modal.setAttribute('aria-label','Подтверждение заявки');modal.innerHTML='<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Запросить выплату?</h4></div><div class="modal-body">В заявку войдёт весь доступный баланс. Это локальная демонстрация.</div><div class="modal-footer"><button class="btn btn-default" data-dismiss="modal" type="button">Отмена</button><button class="btn btn-primary" data-preview-confirm-request type="button">Подтвердить</button></div></div></div>';root.append(modal);modal.querySelector('[data-preview-confirm-request]').addEventListener('click',()=>{jQuery(modal).modal('hide');let message=card.querySelector('[role=status]');if(!message){message=document.createElement('p');message.setAttribute('role','status');card.append(message);}message.className='alert '+(state==='error'?'alert-danger':'alert-info');message.textContent=state==='error'?'Не удалось создать заявку. Баланс не изменён. Повторите попытку позже.':'Демонстрация: заявка подготовлена. Реальная выплата не создавалась.';});}
   jQuery(modal).modal('show');
  });
 }
 filter();root.dataset.previewReady='true';
})();
