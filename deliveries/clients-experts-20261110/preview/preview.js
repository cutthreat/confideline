'use strict';
const root=document.getElementById('directory-preview');
const clients=root.dataset.list==='clients';
const columns=JSON.parse(document.getElementById('columns').textContent);
const items=clients?users:experts;
const showSnapshot=false;
const showExpertSnapshot=false;
if(showExpertSnapshot){
 const agentFilter=columns.find(([field])=>field==='agent');
 agentFilter[2]=[...new Set(items.map(row=>row.agent||'Не назначен'))];
}
const filters={};
const countries={
 by:'Беларусь', lv:'Латвия', lt:'Литва', pl:'Польша', cz:'Чехия', ee:'Эстония',
 ...(showExpertSnapshot?{es:'Испания',it:'Италия',us:'США',pt:'Португалия'}:{})
};
const places=[
 ...(showExpertSnapshot?[
  {id:'valencia',city:'Валенсия',country:'es'},
  {id:'naples',city:'Неаполь',country:'it'},
  {id:'minster',city:'Minster',country:'us'},
  {id:'porto',city:'Порту',country:'pt'}
 ]:[]),
 {id:'minsk',city:'Минск',country:'by'},
 {id:'vilnius',city:'Вильнюс',country:'lt'},
 {id:'riga',city:'Рига',country:'lv'},
 {id:'warsaw',city:'Варшава',country:'pl'},
 {id:'krakow',city:'Краков',country:'pl'},
 {id:'prague',city:'Прага',country:'cz'},
 {id:'tallinn',city:'Таллин',country:'ee'}
].filter(place=>!showExpertSnapshot||items.some(row=>row.cities.includes(place.id)));
const placesById=new Map(places.map(place=>[place.id,place]));
let countrySelect, citySelect;
const unspecifiedGender='Не указано';
const creditNumber=new Intl.NumberFormat('ru',{minimumFractionDigits:2,maximumFractionDigits:2});
const languageNames={
 RU:'Русский', EN:'Английский', DE:'Немецкий', ES:'Испанский',
 IT:'Итальянский', PT:'Португальский', UK:'Украинский', FR:'Французский',
 ...(clients?{}:Object.fromEntries(expertLanguageOptions))
};
const languageCodes=new Map(Object.entries(languageNames).map(([code,name])=>[name.toLocaleLowerCase('ru'),code]));
function languageCode(value){
 return languageCodes.get(value.toLocaleLowerCase('ru'))||value.toUpperCase();
}
const expandedCities=new Set();
const allCityButtons=[];
const selectedRows=new Set();
const defaultSort=clients?'created':'id';
let page=1, key=defaultSort, order=-1;
const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n};
const id=k=>document.getElementById(k);
function dateDisplay(value){if(!value)return '—';const [date,time]=value.split(' ');return date.split('-').reverse().join('.').replace(/2026$/,'26')+(time?' '+time:'')}
function valueDisplay(value){return Array.isArray(value)?(value.join(', ')||'—'):(value||'—')}
function simpleBtn(text, cls, fn){let b=el('button',cls,text);b.type='button';b.addEventListener('click',fn);return b}
function showDetail(title,content,confirmation){
 const dialog=id('detail');
 const trigger=document.activeElement;
 const form=id('detail-form');
 const button=id('detail-confirm');
 id('detail-heading').textContent=title;
 id('detail-body').replaceChildren(content);
 button.hidden=!confirmation;
 button.textContent=confirmation?.label||'';
 form.onsubmit=event=>{
  if(!confirmation||event.submitter!==button)return;
  event.preventDefault();
  const data=new FormData(form);
  dialog.close();
  confirmation.commit(data);
 };
 dialog.addEventListener('close',()=>{
  const next=trigger?.isConnected?trigger:id('directory-feedback');
  next?.focus();
 },{once:true});
 dialog.showModal();
}
function announce(message){
 id('directory-feedback').textContent=message;
}
function demoRowButton(row,label,kind,open){
 const button=simpleBtn(label,'btn btn-xs btn-'+kind+' directory-row-command',open);
 button.setAttribute('aria-label',label+' · '+row.person);
 return button;
}
function accountStatusButton(row,label,kind,field,value){
 const button=demoRowButton(row,label,kind,()=>{
  const content=document.createDocumentFragment();
  content.append(el('p','',row.person+' · '+row.login));
  if(!clients&&Number(row.id)===512&&field==='blocked'&&value==='Да'&&new URLSearchParams(location.search).get('consultation')==='active'){
   content.append(el('p','','По этой анкете идёт платная консультация. Завершите её, затем заблокируйте анкету.'));
   showDetail('Блокировка недоступна',content,null);return;
  }
  if (field === 'blocked') content.append(el('p','','Вы уверены, что хотите '+label.toLowerCase()+' этого пользователя?'));
  showDetail(label,content,{label,commit:()=>{
   if (!clients && field === 'blocked') {
    try { saveExpertEditor(row.id, {...readExpertEditor(row.id), __blocked: value === 'Да'}); }
    catch { announce('Не удалось изменить статус.'); return; }
   }
   row[field]=value;
   draw();
   announce('Аккаунт «'+row.person+'» обновлён.');
  }});
 });
 if(row.snapshot){
  button.disabled=true;
 }
 return button;
}
function demoField(label,input){
 const wrap=el('label','directory-dialog-field');
 wrap.append(el('span','',label),input);
 return wrap;
}
function openAgentAssignment(row){
 const select=el('select','form-control');
 select.name='agent';
 select.required=true;
 select.append(new Option('Выберите партнёра',''));
 for(const agent of new Set(agentByExpert.filter(Boolean)))select.append(new Option(agent,agent));
 const content=document.createDocumentFragment();
 content.append(el('p','',row.person+' · '+row.login),demoField('Партнёр',select));
 showDetail('Назначить агента',content,{label:'Назначить',commit:data=>{
  const agent=String(data.get('agent'));
  assignDemoAgent(row,agent);
  draw();
  announce('Агент эксперта «'+row.person+'» назначен: '+agent+'.');
 }});
}
function openExpertCreation(){
 const name=el('input','form-control');
 name.name='person';
 name.required=true;
 name.maxLength=80;
 name.addEventListener('input',()=>name.setCustomValidity(name.value&&!name.value.trim()?'Введите имя в анкете.':''));
 const description=el('textarea','form-control');
 description.name='description';
 description.rows=3;
 description.maxLength=500;
 const content=document.createDocumentFragment();
 content.append(demoField('Имя в анкете',name),demoField('Описание',description));
 showDetail('Создать анкету эксперта',content,{label:'Создать',commit:data=>{
  const row=createDemoExpert(String(data.get('person')).trim(),String(data.get('description')).trim());
  resetDirectoryList();
  announce('Анкета эксперта «'+row.person+'» создана.');
 }});
}
function accountStatus(row){
 return row.blocked==null?'':row.blocked==='Да'?'Заблокирован':'Без блокировки';
}
function genderCaption(value){
 return value==='Мужчина'?'М':value==='Женщина'?'Ж':'—';
}
function genderFilterOptions(){
 const values=new Set(items.map(row=>row.gender||unspecifiedGender));
 return ['Мужчина','Женщина',unspecifiedGender].filter(value=>values.has(value));
}
function renderLanguages(cell,languages,selectedLanguage){
 if(!languages?.length){
  cell.append(...inactiveStatus('Языки не указаны'));
  return;
 }
 const codes=languages.map(languageCode);
 const selectedCode=selectedLanguage?languageCode(selectedLanguage):'';
 const names=codes.map(code=>languageNames[code]||code);
 cell.title=names.join(', ');
 cell.setAttribute('aria-label',cell.title);
 for(let start=0;start<codes.length;start+=4){
  const line=el('span','directory-language-line');
  codes.slice(start,start+4).forEach((code,index)=>{
   if(index)line.append(' · ');
   if(code===selectedCode)line.append(el('span','directory-language-selected',code));
   else line.append(code);
  });
  cell.append(line);
 }
}
function inactiveStatus(label){
 const state=el('span','client-status-none','—');
 state.title=label;
 state.setAttribute('aria-hidden','true');
 return [state,el('span','sr-only',label)];
}
function badge(text, kind='default'){return el('span','label label-'+kind+' finance-badge',text)}
const headRow=el('tr'),filterRow=el('tr','filters');
headRow.setAttribute('role','row');
filterRow.setAttribute('role','row');
filterRow.id='directory-filter-row';
const sortDirections={
 id:1, person:1, rating:-1, consultations:-1, created:-1, seen:-1, premium:1, verified:1, credits:-1
};
const headLinks={};
let selectPage, mobilePageSelect, mobileSort, mobileDirection, mobileFilters;
function updateSelection(){
 if(!selectPage)return;
 const rowChecks=[...id('rows').querySelectorAll('[data-row-id]')];
 for(const check of rowChecks){
  check.checked=selectedRows.has(Number(check.dataset.rowId));
  check.closest('tr').classList.toggle('grid-row-selected',check.checked);
 }
 const count=selectedRows.size;
 for(const control of [selectPage,mobilePageSelect].filter(Boolean)){
  control.disabled=rowChecks.length===0;
  control.checked=rowChecks.length>0&&count===rowChecks.length;
  control.indeterminate=count>0&&count<rowChecks.length;
 }
 id('directory-selection-count').textContent=count?'Выбрано: '+count:'';
 id('clear-directory-selection').hidden=count===0;
 id('grid-total').hidden=count>0;
}
function selectCurrentPage(checked){
 selectedRows.clear();
 if(checked)currentRows.forEach(row=>selectedRows.add(row.id));
 updateSelection();
}
function rowCheckbox(label){
 const input=el('input');
 input.type='checkbox';
 input.setAttribute('aria-label',label);
 return input;
}
const filterLabels={
 areas:'Все',
 langs:'Все языки',
 descriptionLanguages:'Все языки',
 agent:'Все',
};
function rowPlaces(row){
 const ids=clients?[row.location]:row.cities;
 return ids.map(placeId=>placesById.get(placeId)).filter(Boolean);
}
function placeLabel(place){
 return countries[place.country]+', '+place.city;
}
function matchesGeography(place){
 return (!filters.country||place.country===filters.country)
  &&(!filters.cities||place.id===filters.cities);
}
function findPlace(value,options=places){
 const byId=options.find(place=>place.id===value);
 if(byId)return byId;
 const byName=options.filter(place=>place.city===value);
 return byName.length===1?byName[0]:null;
}
function updateCityOptions(country,preferred=''){
 citySelect.hidden=!country;
 citySelect.disabled=!country;
 const allowed=country?places.filter(place=>place.country===country)
  .sort((a,b)=>a.city.localeCompare(b.city,'ru')):[];
 citySelect.replaceChildren(new Option('Все города',''));
 for(const place of allowed)citySelect.append(new Option(place.city,place.id));
 citySelect.value=findPlace(preferred,allowed)?.id||'';
 filters.cities=citySelect.value;
}
function geographyFilter(){
 const group=el('div','directory-geo-filters');
 countrySelect=el('select','form-control');
 countrySelect.dataset.key='country';
 countrySelect.setAttribute('aria-label',clients?'Страна':'Страна показа');
 countrySelect.append(new Option('Все страны',''));
 for(const [code,name] of Object.entries(countries).sort((a,b)=>a[1].localeCompare(b[1],'ru'))){
  if(places.some(place=>place.country===code))countrySelect.append(new Option(name,code));
 }
 citySelect=el('select','form-control');
 citySelect.dataset.key='cities';
 citySelect.setAttribute('aria-label',clients?'Город':'Город показа');
 updateCityOptions('');
 countrySelect.addEventListener('change',()=>{
  updateCityOptions(countrySelect.value,citySelect.value);
  applyFilter('country',countrySelect.value);
 });
 citySelect.addEventListener('change',()=>applyFilter('cities',citySelect.value));
 group.append(countrySelect,citySelect);
 return group;
}
function expandableExperts(){
 return items.filter(row=>row.cities.length>1);
}
function syncAllCities(){
 if(clients)return;
 const eligible=expandableExperts();
 const allOpen=eligible.length>0&&eligible.every(row=>expandedCities.has(row.id));
 const label=(allOpen?'Свернуть':'Раскрыть')+' дополнительные города у всех';
 for(const [button,compact] of allCityButtons){
  button.textContent=compact?(allOpen?'−':'+'):label;
  button.setAttribute('aria-pressed',String(allOpen));
  button.setAttribute('aria-label',label);
  button.title=label;
  button.disabled=eligible.length===0;
 }
}
function allCitiesButton(compact){
 const button=simpleBtn('',compact?'directory-header-toggle':'btn btn-sm btn-default finance-reset',()=>{
  const close=button.getAttribute('aria-pressed')==='true';
  expandedCities.clear();
  if(!close)for(const row of expandableExperts())expandedCities.add(row.id);
  draw({preserveSelection:true});
 });
 allCityButtons.push([button,compact]);
 return button;
}
function applyFilter(field,value){
 filters[field]=value.trim().toLocaleLowerCase('ru');
 page=1;
 draw();
}
const dateControls=new Map();
function dateFilter(field,label){
 const wrapper=el('div','finance-date-filter');
 wrapper.dataset.financeDateMode='single';
 const input=el('input','form-control');
 input.type='text';
 input.readOnly=true;
 input.placeholder='ГГГГ-ММ-ДД';
 input.dataset.key=field;
 input.setAttribute('aria-label',label);
 const dateInput=window.jQuery(input);
 const initialDate=users[0][field].slice(0,10);
 dateInput.daterangepicker({
  singleDatePicker:true, autoApply:true, autoUpdateInput:false,
  opens:'left', startDate:initialDate,
  locale:{
   format:'YYYY-MM-DD', firstDay:1,
   daysOfWeek:['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
   monthNames:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  }
 });
 const picker=dateInput.data('daterangepicker');
 picker.container.addClass('finance-date-picker');
 const open=simpleBtn('','finance-date-open',()=>picker.show());
 open.setAttribute('aria-label','Выбрать дату · '+label);
 open.title='Выбрать дату';
 open.append(el('span','fa fa-calendar'));
 const reset=()=>{
  input.value='';
  picker.setStartDate(initialDate);
  picker.setEndDate(initialDate);
  clear.hidden=true;
 };
 const clear=simpleBtn('×','finance-date-clear',()=>{
  reset();
  applyFilter(field,'');
  open.focus();
 });
 clear.setAttribute('aria-label','Очистить дату · '+label);
 clear.title='Очистить дату';
 clear.hidden=true;
 const setDate=(date)=>{
  if(!window.moment(date,'YYYY-MM-DD',true).isValid()){reset();return}
  input.value=date;
  picker.setStartDate(date);
  picker.setEndDate(date);
  clear.hidden=false;
 };
 dateControls.set(field,{reset,setDate});
 dateInput.on('apply.daterangepicker',(_,selected)=>{
  setDate(selected.startDate.format('YYYY-MM-DD'));
  applyFilter(field,input.value);
  open.focus();
 });
 wrapper.append(input,open,clear);
 return wrapper;
}
for(const [field,label,type,cls] of columns){
 const th=el('th',cls);
 th.scope='col';
 th.setAttribute('role','columnheader');
 th.dataset.column=field;
 if(field==='consultations')th.title='Заявленные в анкете количество консультаций и стаж';
 if(field==='pick'){
  selectPage=rowCheckbox('Выбрать всех '+(clients?'клиентов':'экспертов')+' на этой странице');
  selectPage.addEventListener('change',()=>selectCurrentPage(selectPage.checked));
  th.append(selectPage);
 }else if(Object.hasOwn(sortDirections,field)){
  const link=el('a','directory-sort');
  link.href='#';
  link.setAttribute('aria-label',label);
  const indicator=el('span','fa fa-sort directory-sort-icon');
  indicator.setAttribute('aria-hidden','true');
  link.append(el('span','',label),indicator);
  link.addEventListener('click',event=>{
   event.preventDefault();
   order=key===field?-order:sortDirections[field];
   key=field;
   page=1;
   draw();
  });
  headLinks[field]=[link,th,indicator];
  th.append(link);
 }else if(field==='cities'){
  const heading=el('div','directory-city-heading');
  heading.append(el('span','',label),allCitiesButton(true));
  th.append(heading);
 }else th.textContent=label;
 headRow.append(th);
 const td=el('td',cls);
 td.setAttribute('role','cell');
 td.dataset.column=field;
 if(type)td.append(el('span','directory-mobile-filter-label',label));
 if(type==='geography'){
  td.append(geographyFilter());
 }else if(type==='date'){
  td.append(dateFilter(field,label));
 }else if(type){
  let choices=null;
  if(type==='gender-values')choices=genderFilterOptions();
  else if(type==='expert-areas')choices=expertAreaOptions;
  else if(type==='expert-languages')choices=expertLanguageOptions.map(([,label])=>label);
  else if(Array.isArray(type))choices=type;
  const input=el(choices?'select':'input','form-control');
  input.setAttribute('aria-label',label);
  if(choices){
   input.append(new Option(filterLabels[field]||'Все',''));
   for(const choice of choices){
    const [value,caption]=Array.isArray(choice)?choice:[choice,choice];
    const code=field==='descriptionLanguages'||field==='langs'?languageCode(value):'';
    const label=code&&languageNames[code]?code+' · '+languageNames[code]:caption;
    const option=new Option(field==='gender'?genderCaption(value):label,value);
    if(field==='gender')option.setAttribute('aria-label',caption);
    input.append(option);
   }
  }else{
   input.type='text';
   if(field==='id')input.inputMode='numeric';
   input.placeholder=field==='id'?label:'Имя или логин';
  }
  input.dataset.key=field;
  input.addEventListener(choices?'change':'input',()=>applyFilter(field,input.value));
  td.append(input);
 }
 filterRow.append(td);
}
id('head').append(headRow,filterRow);
let currentRows=[];
function renderCities(cell,row){
 const [primary,...additional]=rowPlaces(row);
 if(!primary){
  if(clients&&row.locationLabel){
   const location=el('span','city-primary',row.locationLabel);
   location.title='Местоположение сохранено в анкете. Пара страны и города требует сверки.';
   cell.append(location);
   return;
  }
  cell.append(...inactiveStatus(clients?'Местоположение не указано':'Города показа не указаны'));
  return;
 }
 const line=el('div','city-cell-line');
 line.append(el('span','city-primary',placeLabel(primary)));
 cell.append(line);
 if(!additional.length)return;

 const listId='additional-cities-'+row.id;
 const list=el('ul','city-list');
 list.id=listId;
 list.setAttribute('aria-label','Дополнительные города');
 const geoFiltered=Boolean(filters.country||filters.cities);
 for(const place of additional){
  const item=el('li','',placeLabel(place));
  if(geoFiltered&&matchesGeography(place))item.classList.add('city-list-match');
  list.append(item);
 }
 const match=geoFiltered&&!matchesGeography(primary)?additional.find(matchesGeography):null;
 const matchLabel=match?el('span','city-match','Доп. · '+placeLabel(match)):null;
 const toggle=simpleBtn('','btn btn-xs btn-default city-toggle',()=>{
  if(expandedCities.has(row.id))expandedCities.delete(row.id);
  else expandedCities.add(row.id);
  syncCities();
  syncAllCities();
 });
 toggle.setAttribute('aria-controls',listId);
 function syncCities(){
  const open=expandedCities.has(row.id);
  const label=open?'Свернуть дополнительные города':'Показать дополнительные города';
  toggle.textContent=open?'−':'+'+additional.length;
  toggle.title=label;
  toggle.setAttribute('aria-label',label+' · '+row.person);
  toggle.setAttribute('aria-expanded',String(open));
  list.hidden=!open;
  if(matchLabel)matchLabel.hidden=open;
 }
 line.append(toggle);
 cell.append(list);
 if(matchLabel)cell.append(matchLabel);
 syncCities();
}
function directoryListParams(){
 const params=new URLSearchParams();
 for(const input of filterRow.querySelectorAll('[data-key]')){
  if(input.value)params.set('filter_'+input.dataset.key,input.value);
 }
 params.set('sort',key);
 params.set('order',order);
 params.set('page',page);
 params.set('size',id('page-size').value);
 return params;
}
function expertEditorUrl(row){
 const params = new URLSearchParams({expert: row.id, list: directoryListParams().toString()});
 if (Number(row.id) === 512 && new URLSearchParams(location.search).get('consultation') === 'active') params.set('consultation', 'active');
 return '../expert-editor-draft-20261111/?' + params;
}
function syncListAddress(){
 if(location.protocol!=='http:'&&location.protocol!=='https:')return;
 const url=new URL(location.href);
 const params=directoryListParams();
 if(key===defaultSort&&order===-1){
  params.delete('sort');
  params.delete('order');
 }
 if(page===1)params.delete('page');
 if(params.get('size')==='20')params.delete('size');
 const filterKeys=[...filterRow.querySelectorAll('[data-key]')].map(input=>'filter_'+input.dataset.key);
 for(const param of ['sort','order','page','size',...filterKeys])url.searchParams.delete(param);
 for(const [param,value] of params)url.searchParams.set(param,value);
 if(url.href!==location.href)history.replaceState(history.state,'',url);
}
function directoryRowAction(row, title, icon, href){
 const control = el(href ? 'a' : 'button', 'btn btn-sm btn-default');
 const label = title + ' · ' + row.person;
 control.title = title;
 control.setAttribute('aria-label', label);
 if (href) {
  control.href = href;
 } else {
  control.type = 'button';
  control.disabled = true;
 }
 const glyph = el('span', 'fa ' + icon);
 glyph.setAttribute('aria-hidden', 'true');
 control.append(glyph);
 return control;
}
function restoreDirectoryList(){
 const params=new URLSearchParams(location.search);
 if(countrySelect){
  const requestedCity=params.get('filter_cities')||'';
  const inferredCountry=findPlace(requestedCity)?.country||'';
  countrySelect.value=params.get('filter_country')||inferredCountry;
  filters.country=countrySelect.value;
  updateCityOptions(countrySelect.value,requestedCity);
 }
 for(const input of filterRow.querySelectorAll('[data-key]')){
  if(input===countrySelect||input===citySelect)continue;
  const value=params.get('filter_'+input.dataset.key);
  if(value===null)continue;
  const dateControl=dateControls.get(input.dataset.key);
  if(dateControl)dateControl.setDate(value);
  else input.value=input.dataset.key==='gender'&&value==='Не указан'?unspecifiedGender:value;
  filters[input.dataset.key]=input.value.trim().toLocaleLowerCase('ru');
 }
 const sort=params.get('sort');
 if(Object.hasOwn(headLinks,sort))key=sort;
 if(params.get('order')==='1')order=1;
 const pageNumber=Number(params.get('page'));
 if(Number.isSafeInteger(pageNumber)&&pageNumber>0)page=pageNumber;
 const size=params.get('size');
 if(['10','20','50','100'].includes(size))id('page-size').value=size;
}
function sortRows(a,b){
 if(showSnapshot&&a.snapshot!==b.snapshot)return a.snapshot?-1:1;
 if(key==='credits'||key==='consultations'){
  const first=key==='credits'?a.credits:consultationThreshold(a);
  const second=key==='credits'?b.credits:consultationThreshold(b);
  if(first==null)return second==null?b.id-a.id:1;
  if(second==null)return -1;
  return order*(first-second)||b.id-a.id;
 }
 if(key==='rating'){
  if(!a.rating||!b.rating){
   if(!a.rating&&!b.rating)return b.id-a.id;
   return a.rating?-1:1;
  }
  return order*(a.rating[0]-b.rating[0])||b.id-a.id;
 }
 if(key==='seen'&&(!a.seen||!b.seen)){
  if(!a.seen&&!b.seen)return b.id-a.id;
  return a.seen?-1:1;
 }
 const difference=key==='id'?a.id-b.id:String(a[key]||'').localeCompare(String(b[key]||''),'ru');
 return order*difference||b.id-a.id;
}
function renderCell(k,cls,row,label){
 const td=el('td',cls),val=row[k];
 td.setAttribute('role','cell');
 td.dataset.column=k;
 if(k==='pick'){
  const check=rowCheckbox('Выбрать · '+row.person);
  check.dataset.rowId=row.id;
  check.addEventListener('change',()=>{
   if(check.checked)selectedRows.add(row.id);
   else selectedRows.delete(row.id);
   updateSelection();
  });
  const target=el('label','directory-row-pick');
  target.append(check);
  td.append(target);
 }else if(k==='person'){
  const block=el('div','user-column');
  const avatar=el('img');
  avatar.src='assets/avatar.svg';
  avatar.alt='';
  block.append(avatar);
  const info=el('div','user-info');
  const name=el('span','name',val);
  const login=showSnapshot&&!row.snapshot?row.login+' · Демо':row.login;
  info.append(name,el('div','username',login));
  block.append(info);
  td.append(block);
 }else if(k==='gender'){
  td.textContent=genderCaption(val);
  td.title=val||unspecifiedGender;
  td.setAttribute('aria-label','Пол: '+td.title);
  if(!val)td.classList.add('client-status-none');
 }else if(k==='actions'){
  const actions=el('div','directory-row-actions');
  if (clients) {
   actions.append(directoryRowAction(row, 'Редактировать аккаунт', 'fa-pencil'));
  } else {
   actions.append(directoryRowAction(row, 'Редактировать анкету', 'fa-pencil', expertEditorUrl(row)));
   actions.append(directoryRowAction(row, 'Отзывы эксперта', 'fa-comments-o'));
  }
  actions.append(directoryRowAction(row, 'Корректировка кредитов', 'fa-usd'));
  td.append(actions);
 }else if(k==='rating'){
  if(row.rating){
   const [score,count]=row.rating;
   const number=el('strong','expert-rating-value',ratingNumber.format(score));
   const star=el('span','fa fa-star expert-rating-star');
   star.setAttribute('aria-hidden','true');
   number.append(star);
   const votes=el('span','expert-rating-votes',count+' '+ratingUnits[ratingPlural.select(count)]);
   td.setAttribute('aria-label',ratingText(row.rating));
   td.append(number,votes);
  }else{
   td.textContent='—';
   td.title=row.snapshot?'Рейтинг в снимке не зафиксирован':unrated;
   td.setAttribute('aria-label',td.title);
  }
 }else if(k==='premium'){
  if(val==='Да')td.append(badge('Активен','primary'));
  else td.append(...inactiveStatus('Без премиума'));
 }else if(k==='verified'){
  if(val==null)td.append(...inactiveStatus('Нет данных в снимке'));
  else if(val==='Да')td.append(badge('Да','primary'));
  else td.append(accountStatusButton(row,'Подтвердить','success','verified','Да'));
 }else if(k==='accountStatus'){
  if(row.blocked==null)td.append(...inactiveStatus('Нет данных в снимке'));
  else{
   const blocked=row.blocked==='Да';
   td.append(accountStatusButton(row,blocked?'Разблокировать':'Заблокировать',
    blocked?'success':'danger','blocked',blocked?'Нет':'Да'));
  }
 }else if(k==='descriptionLanguages'||k==='langs'){
  if(row.snapshot&&!val.length)td.append(...inactiveStatus('Языки в снимке не зафиксированы'));
  else renderLanguages(td,val,filters[k]);
 }else if(k==='credits'){
  if(val==null)td.append(...inactiveStatus('Остаток недоступен'));
  else td.textContent=creditNumber.format(val);
 }else if(k==='consultations'){
  const count=consultationThreshold(row), years=experienceThreshold(row);
  const details=el('div','expert-consultations-details');
  if(count==null)details.append(...inactiveStatus(row.snapshot?'Количество в снимке не зафиксировано':'Количество не указано в анкете'));
  else{
   const threshold='более '+count.toLocaleString('ru');
   const caption=el('span','expert-consultations-count','Конс: '+threshold);
   caption.title='Консультаций '+threshold;
   details.append(caption);
  }
  if(years!=null)details.append(el('span','expert-consultations-experience','Опыт: более '+years+(years===1?' года':' лет')));
  td.append(details);
 }else if(k==='cities'||k==='location'){
  td.classList.add('directory-geo-cell');
  renderCities(td,row);
 }else if(k==='agent'){
  if(val)td.textContent=val;
  else td.append(demoRowButton(row,'Назначить','primary',()=>openAgentAssignment(row)));
 }else if(k==='created'||k==='seen')td.textContent=dateDisplay(val);
 else {td.textContent=valueDisplay(val);if(k==='id')td.classList.add('finance-number')}
 if(k!=='pick'&&k!=='person'&&k!=='actions')td.prepend(el('span','directory-mobile-label',label));
 return td;
}
function drawPages(total){
 const pages=id('pages');
 pages.replaceChildren();
 if(total<2)return;
 const add=(target,text,label,control)=>{
  const active=control==='number'&&page===target;
  const disabled=target<1||target>total;
  const li=el('li',active?'active':disabled?'disabled':'');
  const link=el(disabled?'span':'a','',text);
  link.setAttribute('aria-label',label);
  if(disabled)link.setAttribute('aria-disabled','true');
  else{
   link.href='#';
   link.dataset.pageControl=control==='number'?String(target):control;
   if(active)link.setAttribute('aria-current','page');
   link.addEventListener('click',event=>{
    event.preventDefault();
    if(active)return;
    page=target;
    draw();
    const links=[...pages.querySelectorAll('a')];
    (links.find(a=>a.dataset.pageControl===link.dataset.pageControl)
      ||pages.querySelector('[aria-current="page"]'))?.focus({preventScroll:true});
   });
  }
  li.append(link);pages.append(li);
 };
 add(page-1,'‹','Предыдущая страница','previous');
 let numbers;
 if(total<=7)numbers=Array.from({length:total},(_,i)=>i+1);
 else if(page<=4)numbers=[1,2,3,4,5,total];
 else if(page>=total-3)numbers=[1,total-4,total-3,total-2,total-1,total];
 else numbers=[1,page-1,page,page+1,total];
 let previous=0;
 for(const number of numbers){
  if(number-previous>1){
   const gap=el('li','disabled directory-page-gap');
   gap.append(el('span','','…'));
   gap.setAttribute('aria-hidden','true');
   pages.append(gap);
  }
  add(number,number,'Страница '+number,'number');
  previous=number;
 }
 add(page+1,'›','Следующая страница','next');
}
function draw({preserveSelection=false}={}){
 if(!preserveSelection)selectedRows.clear();
 const activeFilters=Object.entries(filters).filter(([key,value])=>value&&key!=='country'&&key!=='cities');
 const geoFiltered=Boolean(filters.country||filters.cities);
 const filtered=items.filter(r=>{
  if(geoFiltered&&!rowPlaces(r).some(matchesGeography))return false;
  return activeFilters.every(([k,v])=>{
   const val=r[k];
   if(Array.isArray(val))return val.some(x=>x.toLowerCase()===v);
   if(k==='id')return String(val)===v;
   if(k==='agent')return (val||'Не назначен').toLocaleLowerCase('ru')===v;
   if(k==='gender')return (val||unspecifiedGender).toLocaleLowerCase('ru')===v;
   if(k==='accountStatus')return accountStatus(r).toLocaleLowerCase('ru')===v;
   if(k==='person')return (val+' '+r.login).toLowerCase().includes(v);
   if(k==='created'||k==='seen')return val.slice(0,10)===v;
   return String(val||'').toLowerCase()===v;
  });
 }).sort(sortRows);
 for(const [field,[link,th,indicator]] of Object.entries(headLinks)){
  const active=key===field;
  const direction=active?-order:sortDirections[field];
  link.title='Сортировать '+(direction===1?'по возрастанию':'по убыванию');
  indicator.className='fa directory-sort-icon '+(active?(order===1?'fa-sort-up':'fa-sort-down'):'fa-sort');
  th.setAttribute('aria-sort',active?(order===1?'ascending':'descending'):'none');
 }
 const size=Number(id('page-size').value);
 const total=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,total);
 const start=(page-1)*size;
 currentRows=filtered.slice(start,start+size);
 const body=id('rows');body.replaceChildren();
 if(!currentRows.length){
  const tr=el('tr','directory-empty-row');
  tr.setAttribute('role','row');
  const td=el('td','finance-empty','По этим фильтрам ничего не найдено.');
  td.setAttribute('role','cell');
  td.colSpan=columns.length;
  tr.append(td);
  body.append(tr);
 }
 for(const row of currentRows){
  const tr=el('tr');
  tr.setAttribute('role','row');
  for(const [field,label,,className] of columns)tr.append(renderCell(field,className,row,label));
  body.append(tr);
 }
 updateSelection();
 id('grid-total').textContent='Найдено: '+filtered.length;
 id('grid-summary').textContent=filtered.length?'Показаны записи '+(start+1)+'–'+(start+currentRows.length)+' из '+filtered.length+'.':'Найдено 0 записей.';
 drawPages(total);
 syncAllCities();
 syncMobileTools(activeFilters.length+Number(Boolean(filters.country))+Number(Boolean(filters.cities)));
 syncListAddress();
}
id('clear-directory-selection')?.addEventListener('click',()=>{
 selectedRows.clear();
 updateSelection();
 (mobilePageSelect?.offsetWidth?mobilePageSelect:selectPage).focus();
});
function resetDirectoryList(){
 for(const field of Object.keys(filters))delete filters[field];
 for(const input of filterRow.querySelectorAll('[data-key]'))input.value='';
 if(citySelect)updateCityOptions('');
 for(const control of dateControls.values())control.reset();
 page=1;
 key=defaultSort;
 order=-1;
 draw();
}
id('reset').addEventListener('click', resetDirectoryList);
id('page-size').addEventListener('change',()=>{page=1;draw()});
if(!clients){
 if(showExpertSnapshot){
  id('create-expert').disabled=true;
  id('create-expert').title='Создание анкеты доступно на демоданных';
 }else id('create-expert').addEventListener('click',openExpertCreation);
}
document.querySelector('.main-header form')?.addEventListener('submit',e=>e.preventDefault());
document.querySelectorAll('a[href="#"]:not(.finance-page a)').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(a.dataset.previewSidebar)document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse')}));
function bindMobileTools(){
 const tools=el('div','directory-mobile-tools');
 const toolbar=el('div','directory-mobile-toolbar');
 mobileFilters=simpleBtn('Фильтры','btn btn-sm btn-default finance-reset',()=>{
  const expanded=root.toggleAttribute('data-mobile-filters-open');
  mobileFilters.setAttribute('aria-expanded',String(expanded));
 });
 mobileFilters.setAttribute('aria-expanded','false');
 mobileFilters.setAttribute('aria-controls',filterRow.id);
 const selection=el('label','directory-mobile-selection');
 mobilePageSelect=rowCheckbox('Выбрать все строки на этой странице');
 mobilePageSelect.addEventListener('change',()=>selectCurrentPage(mobilePageSelect.checked));
 selection.append(mobilePageSelect,el('span','','Выбрать страницу'));
 toolbar.append(mobileFilters,selection);
 const sortRow=el('div','directory-mobile-sort');
 const sortLabel=el('label','directory-mobile-filter-label','Сортировка');
 sortLabel.htmlFor='directory-mobile-sort';
 mobileSort=el('select','form-control');
 mobileSort.id=sortLabel.htmlFor;
 for(const [field,label] of columns){
  if(Object.hasOwn(sortDirections,field))mobileSort.append(new Option(label,field));
 }
 mobileSort.addEventListener('change',()=>{
  key=mobileSort.value;
  order=sortDirections[key];
  page=1;
  draw();
 });
 mobileDirection=simpleBtn('','btn btn-default',()=>{
  order=-order;
  page=1;
  draw();
 });
 sortRow.append(sortLabel,mobileSort,mobileDirection);
 tools.append(toolbar,sortRow);
 if(!clients)tools.append(allCitiesButton(false));
 root.querySelector('.finance-scroll').before(tools);
}
function syncMobileTools(filterCount){
 mobileFilters.textContent=filterCount?'Фильтры ('+filterCount+')':'Фильтры';
 mobileSort.value=key;
 mobileDirection.textContent=order===1?'↑':'↓';
 const direction=order===1?'по убыванию':'по возрастанию';
 mobileDirection.setAttribute('aria-label','Сортировать '+direction);
 mobileDirection.title='Сортировать '+direction;
}
function bindTableScroll(){
 const viewport=root.querySelector('.finance-scroll');
 const table=viewport.querySelector('table');
 const bar=el('div','table-top-scrollbar');
 bar.hidden=true;
 bar.tabIndex=0;
 bar.setAttribute('role','region');
 bar.setAttribute('aria-label','Горизонтальная прокрутка таблицы');
 const spacer=el('div','table-top-scrollbar-spacer');
 spacer.setAttribute('aria-hidden','true');
 bar.append(spacer);
 viewport.before(bar);
 function syncFromTable(){
  if(bar.scrollLeft!==viewport.scrollLeft)bar.scrollLeft=viewport.scrollLeft;
 }
 function update(){
  const width=viewport.clientWidth;
  const contentWidth=viewport.scrollWidth;
  bar.hidden=contentWidth-width<=1;
  bar.style.width=width+'px';
  spacer.style.width=contentWidth+'px';
  syncFromTable();
 }
 bar.addEventListener('scroll',()=>{
  if(!bar.hidden&&viewport.scrollLeft!==bar.scrollLeft)viewport.scrollLeft=bar.scrollLeft;
 },{passive:true});
 viewport.addEventListener('scroll',syncFromTable,{passive:true});
 const observer=new ResizeObserver(update);
 observer.observe(viewport);
 observer.observe(table);
 update();
}
bindMobileTools();
restoreDirectoryList();
draw();
bindTableScroll();
