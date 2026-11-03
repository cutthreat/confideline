(function(){
  'use strict';
  const form=document.querySelector('#versions'),notice=document.querySelector('#save-status');
  const summary=document.querySelector('#combination'),details=document.querySelector('#conflict-detail');
  const refresh=document.querySelector('#refresh-current');
  const key='catalog-settings-preview-r3';
  const fields=['filter','cards','guestOnlineOnly'];
  const names={filter:{1:'Горизонтальный фильтр',2:'Вертикальный фильтр'},cards:{1:'Знакомства',2:'Эзотерика'},guestOnlineOnly:{true:'Включено',false:'Выключено'}};
  const titles={filter:'Фильтр каталога',cards:'Выдача анкет',guestOnlineOnly:'Гостям только эксперты онлайн'};
  const requestedScenario=new URL(location.href).searchParams.get('scenario');
  const scenario=['normal','error','conflict','readonly'].includes(requestedScenario)?requestedScenario:'normal';
  function read(){
    const values={filter:'1',cards:'1',guestOnlineOnly:false},revision={filter:0,cards:0,guestOnlineOnly:0};
    try{
      const state=JSON.parse(localStorage.getItem(key)),v=state?.values,r=state?.revision;
      if(v&&['1','2'].includes(v.filter))values.filter=v.filter;
      if(v&&['1','2'].includes(v.cards))values.cards=v.cards;
      if(typeof v?.guestOnlineOnly==='boolean')values.guestOnlineOnly=v.guestOnlineOnly;
      for(const field of fields)if(Number.isSafeInteger(r?.[field])&&r[field]>=0)revision[field]=r[field];
    }catch{}
    return{values,revision};
  }
  let baseline=read(),forcedConflict=false;
  function message(kind,text){notice.hidden=false;notice.dataset.kind=kind;notice.textContent=text;}
  function value(field){return field==='guestOnlineOnly'?form.elements[field].checked:form.elements[field].value;}
  function setValue(field,v){if(field==='guestOnlineOnly')form.elements[field].checked=v;else form.elements[field].value=v;}
  function render(reset){
    for(const field of fields){
      if(reset)setValue(field,baseline.values[field]);
      document.querySelector('#'+field+'-current').textContent='Сохранено: '+names[field][baseline.values[field]];
    }
    summary.textContent=fields.map(f=>titles[f]+': '+names[f][baseline.values[f]]).join('; ')+'.';
  }
  render(true);
  if(scenario==='readonly'){
    for(const field of fields)form.elements[field].disabled=true;
    form.querySelector('button[type=submit]').disabled=true;form.querySelector('button[type=reset]').disabled=true;
    message('info','Только просмотр. У вас нет права изменять настройки каталога.');
  }
  form.addEventListener('reset',e=>{e.preventDefault();baseline=read();render(true);details.hidden=true;refresh.hidden=true;message('info','Несохранённые изменения отменены.');});
  refresh.addEventListener('click',()=>{baseline=read();render(false);details.hidden=true;refresh.hidden=true;message('info','Сохранённые значения обновлены. Ваш выбор оставлен в полях; проверьте его перед сохранением.');});
  form.addEventListener('submit',e=>{
    e.preventDefault();if(scenario==='readonly')return;
    const next=Object.fromEntries(fields.map(f=>[f,value(f)]));
    const changed=fields.filter(f=>next[f]!==baseline.values[f]);
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
      details.textContent=conflicts.map(f=>titles[f]+': сейчас сохранено «'+names[f][current.values[f]]+'», ваш выбор «'+names[f][next[f]]+'».').join(' ');
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
