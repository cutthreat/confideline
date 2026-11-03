(function(){
  'use strict';
  const form=document.querySelector('#versions'),notice=document.querySelector('#save-status');
  const summary=document.querySelector('#combination'),details=document.querySelector('#conflict-detail');
  const refresh=document.querySelector('#refresh-current');
  const saveButton=form.querySelector('button[type=submit]'),resetButton=form.querySelector('button[type=reset]');
  const key='catalog-settings-preview-r3';
  const fields=['filter','cards','guestOnlineOnly'];
  const en=new URL(location.href).searchParams.get('lang')==='en';
  const names=en?{filter:{1:'Horizontal filter',2:'Vertical filter'},cards:{1:'Dating',2:'Spiritual services'},guestOnlineOnly:{true:'On',false:'Off'}}:{filter:{1:'Горизонтальный фильтр',2:'Вертикальный фильтр'},cards:{1:'Знакомства',2:'Эзотерика'},guestOnlineOnly:{true:'Включено',false:'Выключено'}};
  const titles=en?{filter:'Directory filter',cards:'Profile listing',guestOnlineOnly:'Guests: online experts only'}:{filter:'Фильтр каталога',cards:'Выдача анкет',guestOnlineOnly:'Гостям только эксперты онлайн'};
  const text=en?{
    saved:'Saved: ',readonly:'View only. You do not have permission to change directory settings.',cancelled:'Unsaved changes discarded.',
    refreshed:'Saved values refreshed. Your changed fields remain in the draft; other fields are updated.',unchanged:'No changes.',
    unknown:'The save result is not yet confirmed. Check the saved settings before trying again.',check:'Check saved settings',checkFailed:'Could not check the save result. Check again before saving.',checked:'Saved settings checked. Review any remaining draft.',
    error:'Unable to save settings. Previous settings remain active and your selections are preserved. Try again.',
    conflict:'A setting was changed in another window. Nothing was overwritten. Refresh saved values and review your selection.',
    success:'Directory settings saved.',shortError:'Unable to save settings. Previous settings remain active and your selections are preserved.',
    conflictDetail:(title,current,selected)=>`${title}: saved “${current}”, your selection “${selected}”.`
  }:{
    saved:'Сохранено: ',readonly:'Только просмотр. У вас нет права изменять настройки каталога.',cancelled:'Несохранённые изменения отменены.',
    refreshed:'Сохранённые значения обновлены. Ваши изменённые поля остались в черновике; остальные обновлены.',unchanged:'Изменений нет.',
    unknown:'Результат сохранения пока не подтверждён. Проверьте сохранённые настройки перед повтором.',check:'Проверить сохранённые настройки',checkFailed:'Не удалось проверить результат сохранения. Повторите проверку перед сохранением.',checked:'Сохранённые настройки проверены. Проверьте оставшийся черновик.',
    error:'Не удалось сохранить настройки. Прежние значения действуют, ваш выбор оставлен в полях. Повторите сохранение.',
    conflict:'Настройка изменена в другом окне. Ничего не перезаписано. Обновите сохранённые значения и проверьте свой выбор.',
    success:'Настройки каталога сохранены.',shortError:'Не удалось сохранить настройки. Прежние значения действуют, ваш выбор оставлен в полях.',
    conflictDetail:(title,current,selected)=>`${title}: сейчас сохранено «${current}», ваш выбор «${selected}».`
  };
  const requestedScenario=new URL(location.href).searchParams.get('scenario');
  const scenario=['normal','error','conflict','readonly','unknown'].includes(requestedScenario)?requestedScenario:'normal';
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
  let baseline=read(),forcedConflict=false,forcedUnknown=false,unknownPending=false,unknownReadbackFailed=false;
  function message(kind,text){notice.hidden=false;notice.dataset.kind=kind;notice.textContent=text;}
  function value(field){return field==='guestOnlineOnly'?form.elements[field].checked:form.elements[field].value;}
  function setValue(field,v){if(field==='guestOnlineOnly')form.elements[field].checked=v;else form.elements[field].value=v;}
  function render(reset){
    for(const field of fields){
      if(reset)setValue(field,baseline.values[field]);
      document.querySelector('#'+field+'-current').textContent=text.saved+names[field][baseline.values[field]];
    }
    summary.textContent=fields.map(f=>titles[f]+': '+names[f][baseline.values[f]]).join('; ')+'.';
  }
  render(true);
  if(scenario==='readonly'){
    for(const field of fields)form.elements[field].disabled=true;
    form.querySelector('button[type=submit]').disabled=true;form.querySelector('button[type=reset]').disabled=true;
    message('info',text.readonly);
  }
  form.addEventListener('reset',e=>{e.preventDefault();if(unknownPending)return;baseline=read();render(true);details.hidden=true;refresh.hidden=true;message('info',text.cancelled);});
  refresh.addEventListener('click',()=>{
    if(unknownPending&&!unknownReadbackFailed){unknownReadbackFailed=true;message('error',text.checkFailed);return;}
    const changed=new Set(fields.filter(field=>value(field)!==baseline.values[field]));
    baseline=read();for(const field of fields)if(!changed.has(field))setValue(field,baseline.values[field]);
    render(false);details.hidden=true;refresh.hidden=true;
    if(unknownPending){unknownPending=false;saveButton.disabled=false;resetButton.disabled=false;message('info',text.checked);}
    else message('info',text.refreshed);
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();if(scenario==='readonly'||unknownPending)return;
    const next=Object.fromEntries(fields.map(f=>[f,value(f)]));
    const changed=fields.filter(f=>next[f]!==baseline.values[f]);
    if(!changed.length){message('info',text.unchanged);return;}
    if(scenario==='error'){message('error',text.error);return;}
    let current=read();
    if(scenario==='unknown'&&!forcedUnknown){
      for(const field of changed){current.values[field]=next[field];current.revision[field]++;}
      try{localStorage.setItem(key,JSON.stringify(current));}catch{message('error',text.shortError);return;}
      forcedUnknown=true;unknownPending=true;saveButton.disabled=true;resetButton.disabled=true;
      refresh.textContent=text.check;refresh.hidden=false;details.hidden=true;message('conflict',text.unknown);return;
    }
    if(scenario==='conflict'&&!forcedConflict){
      const field=changed[0];current.values[field]=next[field];current.revision[field]++;
      try{localStorage.setItem(key,JSON.stringify(current));}catch{}
      forcedConflict=true;
    }
    const conflicts=changed.filter(f=>current.revision[f]!==baseline.revision[f]||current.values[f]!==baseline.values[f]);
    if(conflicts.length){
      details.textContent=conflicts.map(f=>text.conflictDetail(titles[f],names[f][current.values[f]],names[f][next[f]])).join(' ');
      details.hidden=false;refresh.hidden=false;
      message('conflict',text.conflict);return;
    }
    try{
      for(const f of changed){current.values[f]=next[f];current.revision[f]++;}
      localStorage.setItem(key,JSON.stringify(current));
      baseline=read();render(true);details.hidden=true;refresh.hidden=true;message('success',text.success);
    }catch{message('error',text.shortError);}
  });
  document.querySelector('.sidebar-toggle').addEventListener('click',()=>document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse'));
  for(const a of document.querySelectorAll('a[data-original-route]'))a.addEventListener('click',e=>{
    e.preventDefault();const list=a.parentElement.querySelector(':scope > .treeview-menu');
    if(list){const open=a.getAttribute('aria-expanded')==='true';a.setAttribute('aria-expanded',String(!open));list.style.display=open?'none':'block';}
  });
})();
