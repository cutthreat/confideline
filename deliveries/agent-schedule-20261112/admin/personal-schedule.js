(() => {
 'use strict';
 if(new URLSearchParams(location.search).get('from')==='partner-dashboard-60'){
  document.querySelectorAll('a[href="agent-dashboard.html"]').forEach(a=>{
   a.href='../../partner-dashboard-60-20261116/index.html';
  });
 }
 document.title='Мой график · Confideline';
 const heading=document.querySelector('.content-header h1');
 const breadcrumb=document.querySelector('.content-header .breadcrumb .active');
 if(heading)heading.textContent='Мой график';
 if(breadcrumb)breadcrumb.textContent='Мой график';
 const tabs=document.querySelector('.agent-personal-nav');
 if(!tabs)return;
 const sync=()=>tabs.querySelectorAll('[data-page]').forEach(a=>a.parentElement.classList.toggle('active',a.getAttribute('aria-current')==='page'));
 const observer=new MutationObserver(sync);
 tabs.querySelectorAll('[data-page]').forEach(a=>observer.observe(a,{attributes:true,attributeFilter:['aria-current']}));
 sync();
})();
