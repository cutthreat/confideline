/* PREVIEW ONLY. Existing live component markup with synthetic leaf values.
   Never install on the live site. No requests, storage or financial calculations. */
(() => {
 'use strict';
 const root=document.querySelector('[data-preview-finance]');
 const table=root?.querySelector('[data-preview-grid]');if(!table)return;
 const rows=[...table.tBodies[0].rows];
 const fields=[...table.querySelectorAll('[data-filter-field]')];
 const normalized=s=>s.replace(/\s/g,'').replace('−','-').replace(',','.').replace(/USD/g,'');
 function filter(){
  let count=0;
  rows.forEach(row=>{
   let visible=true;
   fields.forEach(field=>{
    const key=field.dataset.filterField,cell=row.querySelector('td[data-field="'+key+'"]');if(!cell)return;
    if(field.matches('[data-preview-period]')){
     const from=field.dataset.rangeStart,to=field.dataset.rangeEnd,date=row.dataset.date;
     if(from&&date<from||to&&date>to)visible=false;return;
    }
    const selected=field.tagName==='SELECT'?[...field.selectedOptions].filter(o=>o.value):[];
    const value=field.value.trim();if(!value&&!selected.length)return;
    const text=cell.textContent.toLocaleLowerCase();
    if(field.tagName==='SELECT'){
     const actual=(row.dataset[key]||text).toLocaleLowerCase();
     if(!selected.some(o=>actual.includes(o.textContent.trim().toLocaleLowerCase())||actual===o.value.toLocaleLowerCase()||row.dataset[key+'Id']===o.value))visible=false;
    }else if(/amount_(min|max)/.test(field.name)){
     const n=Number(normalized(text)),limit=Number(value);
     if(field.name.includes('_min')?n<limit:n>limit)visible=false;
    }else if(row.dataset[key+'Id']&&/^\d+$/.test(value)){
     if(row.dataset[key+'Id']!==value)visible=false;
    }else if(!text.includes(value.toLocaleLowerCase()))visible=false;
   });
   row.hidden=!visible;if(visible)count++;
  });
  const summary=root.querySelector('.summary');if(summary)summary.textContent=count?'Показаны записи 1–'+count+' из '+count+'.':'Показано 0 записей.';
 }
 fields.forEach(field=>{field.addEventListener('change',filter);field.addEventListener('input',filter);});
 root.addEventListener('preview:rangechange',filter);
 root.querySelectorAll('[data-preview-reset]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();fields.forEach(f=>{if(f.tagName==='SELECT'){[...f.options].forEach(o=>o.selected=false);if(window.jQuery)jQuery(f).trigger('change.select2');}else f.value='';if(f.matches('[data-preview-period]'))f.dispatchEvent(new Event('preview:reset-period'));});filter();
 }));
 table.querySelectorAll('select').forEach(select=>{
  select.parentElement.querySelectorAll('.select2-container').forEach(e=>e.remove());
  select.classList.remove('select2-hidden-accessible');select.removeAttribute('style');select.removeAttribute('tabindex');select.removeAttribute('aria-hidden');
  if(window.jQuery?.fn.select2&&(select.multiple||select.closest('td')?.dataset.filterField==='customer'||select.closest('td')?.querySelector('[data-filter-field=customer]'))){
   jQuery(select).select2({theme:'bootstrap',width:'100%',placeholder:select.multiple?'Типы':'',allowClear:true}).on('change',filter);
  }
 });
 table.querySelector('thead input[type=checkbox]')?.addEventListener('change',e=>rows.forEach(row=>{const box=row.querySelector('input[type=checkbox]');if(box&&!row.hidden)box.checked=e.target.checked;}));
 table.querySelectorAll('thead [data-sort]').forEach(link=>link.addEventListener('click',e=>{
  e.preventDefault();const key=link.dataset.sort,th=link.closest('th'),descending=th.getAttribute('aria-sort')==='ascending';
  table.querySelectorAll('th[aria-sort]').forEach(t=>t.removeAttribute('aria-sort'));th.setAttribute('aria-sort',descending?'descending':'ascending');
  const numeric=['id','credits','amount','before'].includes(key);
  rows.sort((a,b)=>{const x=a.querySelector('[data-field="'+key+'"]')?.textContent.trim()||'',y=b.querySelector('[data-field="'+key+'"]')?.textContent.trim()||'';return(descending?-1:1)*(numeric?Number(normalized(x))-Number(normalized(y)):x.localeCompare(y,'ru',{numeric:true}));}).forEach(r=>table.tBodies[0].append(r));
 }));
 table.addEventListener('click',async e=>{const button=e.target.closest('[data-finance-copy]');if(!button)return;try{await navigator.clipboard.writeText(button.dataset.financeCopy);button.title='Скопировано';button.setAttribute('aria-label','GUID скопирован');}catch{button.title='Не удалось скопировать';}});
 root.querySelectorAll('.pagination').forEach(p=>p.replaceChildren());
 filter();root.dataset.previewReady='true';
})();
