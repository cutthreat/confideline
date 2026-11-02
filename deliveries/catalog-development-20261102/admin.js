(function(){
  'use strict';
  const form=document.querySelector('#versions'),notice=document.querySelector('#save-status');
  const summary=document.querySelector('#combination'),details=document.querySelector('#conflict-detail');
  const refresh=document.querySelector('#refresh-current');
  const key='catalog-settings-preview-r3';
  const names={filter:{1:'Горизонтальный фильтр',2:'Вертикальный фильтр'},cards:{1:'Знакомства',2:'Эзотерика'}};
  const requestedScenario=new URL(location.href).searchParams.get('scenario');
  const scenario=['normal','error','conflict','readonly'].includes(requestedScenario)?requestedScenario:'normal';
  function read(){
    let values={filter:'1',cards:'1'},revision={filter:0,cards:0};
    try{
      const state=JSON.parse(localStorage.getItem(key)),v=state?.values,r=state?.revision;
      if(v&&['1','2'].includes(v.filter)&&['1','2'].includes(v.cards))values=v;
      if(r&&Number.isSafeInteger(r.filter)&&Number.isSafeInteger(r.cards))revision=r;
    }catch{}
    return{values,revision};
  }
  let baseline=read(),forcedConflict=false;
  function message(kind,text){notice.hidden=false;notice.dataset.kind=kind;notice.textContent=text;}
  function render(reset){
    for(const field of ['filter','cards']){
      if(reset)form.elements[field].value=baseline.values[field];
      document.querySelector('#'+(field==='filter'?'filter':'cards')+'-current').textContent='Сохранено: '+names[field][baseline.values[field]];
    }
    summary.textContent=names.filter[baseline.values.filter]+'; '+names.cards[baseline.values.cards]+'.';
  }
  render(true);
  if(scenario==='readonly'){
    for(const field of ['filter','cards'])form.elements[field].disabled=true;
    form.querySelector('button[type=submit]').disabled=true;form.querySelector('button[type=reset]').disabled=true;
    message('info','Только просмотр. У вас нет права изменять настройки каталога.');
  }
  form.addEventListener('reset',e=>{e.preventDefault();baseline=read();render(true);details.hidden=true;refresh.hidden=true;message('info','Несохранённые изменения отменены.');});
  refresh.addEventListener('click',()=>{baseline=read();render(false);details.hidden=true;refresh.hidden=true;message('info','Сохранённые значения обновлены. Ваш выбор оставлен в полях; проверьте его перед сохранением.');});
  form.addEventListener('submit',e=>{
    e.preventDefault();if(scenario==='readonly')return;
    const next={filter:form.elements.filter.value,cards:form.elements.cards.value};
    const changed=['filter','cards'].filter(f=>next[f]!==baseline.values[f]);
    if(!changed.length){message('info','Изменений нет.');return;}
    if(scenario==='error'){message('error','Не удалось сохранить настройки. Прежние значения действуют, ваш выбор оставлен в полях. Повторите сохранение.');return;}
    let current=read();
    if(scenario==='conflict'&&!forcedConflict){
      const field=changed[0];current.values[field]=next[field];current.revision[field]++;
      try{localStorage.setItem(key,JSON.stringify(current));}catch{}
      forcedConflict=true;
    }
    const conflicts=changed.filter(f=>current.revision[f]!==baseline.revision[f]||current.values[f]!==baseline.values[f]);
    if(conflicts.length){
      details.textContent=conflicts.map(f=>(f==='filter'?'Фильтр каталога':'Выдача анкет')+': сейчас сохранено «'+names[f][current.values[f]]+'», ваш выбор «'+names[f][next[f]]+'».').join(' ');
      details.hidden=false;refresh.hidden=false;
      message('conflict','Настройка изменена в другом окне. Ничего не перезаписано. Обновите сохранённые значения и проверьте свой выбор.');return;
    }
    try{
      for(const f of changed){current.values[f]=next[f];current.revision[f]++;}
      localStorage.setItem(key,JSON.stringify(current));
      baseline=read();render(true);details.hidden=true;refresh.hidden=true;message('success','Настройки каталога сохранены.');
    }catch{message('error','Не удалось сохранить настройки. Прежние значения действуют, ваш выбор оставлен в полях.');}
  });
  document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse'));
  for(const a of document.querySelectorAll('a[data-original-route]'))a.addEventListener('click',e=>{
    e.preventDefault();const list=a.parentElement.querySelector(':scope > .treeview-menu');
    if(list){const open=a.getAttribute('aria-expanded')==='true';a.setAttribute('aria-expanded',String(!open));list.style.display=open?'none':'block';}
  });
})();
