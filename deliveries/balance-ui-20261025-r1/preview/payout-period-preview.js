/* PREVIEW ONLY: initialize the site's bundled daterangepicker; no backend requests. */
(() => {
 if(!window.jQuery?.fn.daterangepicker)return;
 document.querySelectorAll('[data-preview-period]').forEach(input=>{
  if(input.dataset.periodReady)return;input.dataset.periodReady='true';
  const root=input.closest('[data-preview-finance],[data-contact-filter-page]'),wrap=input.closest('.finance-date-filter')||input.parentElement;
  const single=wrap.dataset.financeDateMode==='single';
  const opts={parentEl:'body',opens:'left',autoUpdateInput:false,showDropdowns:true,singleDatePicker:single,startDate:moment('2026-10-15'),endDate:moment('2026-10-19'),locale:{format:'DD.MM.YYYY',separator:' — ',applyLabel:'Применить',cancelLabel:'Очистить',customRangeLabel:'Период',firstDay:1,daysOfWeek:['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],monthNames:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']}};
  const jq=jQuery(input);jq.daterangepicker(opts);const picker=jq.data('daterangepicker');
  picker.container.addClass('finance-date-picker cl-preview-period').attr({role:'dialog','aria-label':'Выбор периода'});
  function apply(start,end){
   input.dataset.rangeStart=start||'';input.dataset.rangeEnd=end||'';
   input.value=start?moment(start).format('DD.MM.YYYY')+(single?'':' — '+moment(end).format('DD.MM.YYYY')):'';
   if(input.dataset.previewCfPeriod){const form=document.querySelector('#contactFilterForm');form.elements.namedItem('date_from').value=start||'';form.elements.namedItem('date_to').value=end||'';form.requestSubmit();}
   input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new CustomEvent('preview:rangechange',{bubbles:true,detail:start?{start,end}:null}));
   const clear=wrap.querySelector('.finance-date-clear');if(clear)clear.hidden=!start;
  }
  jq.on('apply.daterangepicker.v9',(_,p)=>apply(p.startDate.format('YYYY-MM-DD'),p.endDate.format('YYYY-MM-DD')));
  jq.on('cancel.daterangepicker.v9',()=>apply('',''));
  jq.on('show.daterangepicker.v9',()=>{input.setAttribute('aria-expanded','true');const r=picker.container[0].getBoundingClientRect();const header=document.querySelector('.main-header')?.getBoundingClientRect();picker.container.css({position:'fixed',left:Math.max(12,Math.min(input.getBoundingClientRect().right-r.width,innerWidth-r.width-12)),top:Math.max((header?.bottom||0)+8,Math.min(input.getBoundingClientRect().bottom+4,innerHeight-r.height-12))});});
  jq.on('hide.daterangepicker.v9',()=>input.setAttribute('aria-expanded','false'));
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!picker.isShowing)return;const target=e.target;if(target!==input&&!picker.container[0].contains(target))return;e.preventDefault();e.stopPropagation();picker.setStartDate(moment(input.dataset.rangeStart||'2026-10-15'));picker.setEndDate(moment(input.dataset.rangeEnd||'2026-10-19'));input.focus();picker.hide();},true);
  wrap.querySelector('.finance-date-open')?.addEventListener('click',()=>picker.show());
  wrap.querySelector('.finance-date-clear')?.addEventListener('click',()=>apply('',''));
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){picker.hide();input.focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();picker.show();}});
  input.addEventListener('preview:reset-period',()=>{input.dataset.rangeStart='';input.dataset.rangeEnd='';input.value='';const clear=wrap.querySelector('.finance-date-clear');if(clear)clear.hidden=true;});
 });
})();

/* PREVIEW ONLY: the existing picker stays visible after calendar-cell rebuilds. */
(()=>{const root=document.querySelector('#cl-my-payouts'),box=document.querySelector('.cl-preview-period');if(!root||!box)return;function place(){if(getComputedStyle(box).display==='none')return;const input=root.querySelector('#payout-period'),r=box.getBoundingClientRect(),a=input.getBoundingClientRect(),h=document.querySelector('.main-header').getBoundingClientRect();const values={position:'fixed',left:Math.max(12,Math.min(a.right-r.width,innerWidth-r.width-12))+'px',right:'auto',top:Math.max(h.bottom+8,Math.min(a.bottom+4,innerHeight-r.height-12))+'px'};for(const[k,v]of Object.entries(values))if(box.style[k]!==v)box.style[k]=v;}new MutationObserver(place).observe(box,{attributes:true,attributeFilter:['style'],childList:true,subtree:true});})();
