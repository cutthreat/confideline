(() => {
  'use strict';
  const root=document.getElementById('expert-editor-demo');
  const form=document.getElementById('ee-form');
  const feedback=document.getElementById('ee-feedback');
  const key='confideline-expert-editor-demo-20261111';
  const languageSelect=document.getElementById('ee-translation-language');
  const translationPanels=Array.from(root.querySelectorAll('[data-translation-panel]'));
  const translationCount=document.getElementById('ee-translation-count');
  const translationWarning=document.getElementById('ee-translation-warning');
  const languageLabels=new Map(Array.from(languageSelect.options).map(option=>[option.value,option.textContent]));
  let savedTranslations={};
  function render(details){
    const target=details.querySelector('.ee-selected');
    const selected=Array.from(details.querySelectorAll('input:checked'));
    target.replaceChildren();
    if(!selected.length){const span=document.createElement('span');span.className='ee-placeholder';span.textContent='Выберите';target.append(span);return;}
    selected.forEach(input=>{const span=document.createElement('span');span.className='ee-tag';span.textContent=input.parentElement.querySelector('span').textContent;target.append(span);});
  }
  const multiples=Array.from(root.querySelectorAll('details[data-multiple]'));
  function positionOptions(detail){
    if(!detail.open)return;
    detail.classList.remove('ee-opens-up');
    const summary=detail.querySelector('summary').getBoundingClientRect();
    const menu=detail.querySelector('.ee-options');
    const header=document.querySelector('.main-header');
    const headerBottom=header?Math.max(0,header.getBoundingClientRect().bottom):0;
    const above=Math.max(0,summary.top-headerBottom-8),below=Math.max(0,innerHeight-summary.bottom-8);
    const up=below<Math.min(220,menu.scrollHeight)&&above>below;
    detail.classList.toggle('ee-opens-up',up);
    menu.style.maxHeight=`${Math.max(60,Math.min(220,up?above:below))}px`;
  }
  try{
    const stored=JSON.parse(localStorage.getItem(key)||'null');
    if(stored){for(const element of form.elements){if(!element.name)continue;if(element.type==='checkbox') element.checked=(stored[element.name]||[]).includes(element.value); else if(element.name in stored) element.value=stored[element.name];}if(languageLabels.has(stored.__translationLanguage))languageSelect.value=stored.__translationLanguage;}
    else {const filled=translationPanels.find(panel=>panel.querySelector('textarea').value.trim());if(filled)languageSelect.value=filled.dataset.translationPanel;}
  }catch(e){}
  function captureSavedTranslations(){return Object.fromEntries(translationPanels.map(panel=>[panel.dataset.translationPanel,panel.querySelector('textarea').value]));}
  savedTranslations=captureSavedTranslations();
  function renderTranslations(){
    let filled=0;
    translationPanels.forEach(panel=>{const code=panel.dataset.translationPanel;const hasText=Boolean(panel.querySelector('textarea').value.trim());if(hasText)filled++;panel.hidden=code!==languageSelect.value;const option=Array.from(languageSelect.options).find(item=>item.value===code);option.textContent=languageLabels.get(code)+(hasText?' ✓':'');});
    translationCount.textContent=`Заполнено: ${filled} из ${translationPanels.length}`;
    const deleting=translationPanels.filter(panel=>Boolean((savedTranslations[panel.dataset.translationPanel]||'').trim())&&!panel.querySelector('textarea').value.trim()).map(panel=>languageLabels.get(panel.dataset.translationPanel));
    translationWarning.hidden=deleting.length===0;
    translationWarning.textContent=deleting.length?`После сохранения будут удалены переводы: ${deleting.join(', ')}.`:'';
  }
  languageSelect.addEventListener('change',renderTranslations);
  translationPanels.forEach(panel=>panel.querySelector('textarea').addEventListener('input',renderTranslations));
  renderTranslations();
  multiples.forEach(detail=>{render(detail);detail.addEventListener('toggle',()=>{if(detail.open){multiples.filter(x=>x!==detail).forEach(x=>x.open=false);positionOptions(detail);}});detail.addEventListener('change',()=>render(detail));detail.addEventListener('keydown',event=>{if(event.key==='Escape' && detail.open){event.preventDefault();detail.open=false;detail.querySelector('summary').focus();}});});
  window.addEventListener('resize',()=>multiples.forEach(positionOptions));
  document.addEventListener('scroll',()=>multiples.forEach(positionOptions),true);
  document.addEventListener('click',event=>{multiples.forEach(detail=>{if(!detail.contains(event.target))detail.open=false;});});
  form.addEventListener('input',()=>feedback.hidden=true);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data={__translationLanguage:languageSelect.value};for(const element of form.elements){if(!element.name)continue;if(element.type==='checkbox'){if(!data[element.name])data[element.name]=[];if(element.checked)data[element.name].push(element.value);}else data[element.name]=element.value;}
    try{localStorage.setItem(key,JSON.stringify(data));savedTranslations=captureSavedTranslations();renderTranslations();feedback.className='alert alert-success ee-feedback';feedback.textContent='Изменения сохранены в макете.';}
    catch(e){feedback.className='alert alert-danger ee-feedback';feedback.textContent='Не удалось сохранить изменения в макете.';}
    feedback.hidden=false;feedback.scrollIntoView({block:'nearest'});
  });
  document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',event=>event.preventDefault()));
  root.querySelectorAll('.nav-pills a[href="#"]').forEach(a=>{a.setAttribute('aria-disabled','true');a.setAttribute('tabindex','-1');a.setAttribute('title','Действие доступно на сайте');});
  document.querySelectorAll('[data-menu-group]').forEach(control=>control.addEventListener('click',()=>{const menu=control.nextElementSibling;const open=control.getAttribute('aria-expanded')==='true';control.setAttribute('aria-expanded',String(!open));if(menu)menu.style.display=open?'none':'block';}));
  const sidebarToggle=document.querySelector('.sidebar-toggle');
  const mobileMenu=matchMedia('(max-width: 767px)');
  function syncSidebar(){if(sidebarToggle)sidebarToggle.setAttribute('aria-expanded',String(mobileMenu.matches?document.body.classList.contains('sidebar-open'):!document.body.classList.contains('sidebar-collapse')));}
  if(sidebarToggle) sidebarToggle.addEventListener('click',()=>{document.body.classList.toggle(mobileMenu.matches?'sidebar-open':'sidebar-collapse');syncSidebar();});
  mobileMenu.addEventListener('change',()=>{document.body.classList.remove('sidebar-open');syncSidebar();});syncSidebar();
  document.addEventListener('click',event=>{if(mobileMenu.matches&&document.body.classList.contains('sidebar-open')&&event.target.closest('.content-wrapper')){event.preventDefault();event.stopPropagation();document.body.classList.remove('sidebar-open');syncSidebar();}},true);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileMenu.matches&&document.body.classList.contains('sidebar-open')){event.preventDefault();document.body.classList.remove('sidebar-open');syncSidebar();sidebarToggle.focus();}});
  const profilePanel=root.querySelector('.ee-profile-panel');const profileToggle=root.querySelector('.ee-profile-toggle');
  if(profilePanel&&profileToggle)profileToggle.addEventListener('click',()=>{const expanded=profilePanel.classList.toggle('ee-profile-expanded');profileToggle.setAttribute('aria-expanded',String(expanded));});
  const headerSearch=document.getElementById('header-search');if(headerSearch)headerSearch.addEventListener('submit',event=>event.preventDefault());
})();
