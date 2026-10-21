/* Local preview identity/navigation only. Do not install in the application. */
(function () {
  'use strict';
  const params=new URLSearchParams(location.search),agent=document.documentElement.dataset.internalView==='agent';
  const person=agent?(params.get('actor')==='sara'?['Sara Morgan','SM']:['Alex Morgan','AM']):(params.get('role')==='superadmin'||params.get('actor')==='admin'?['Admin Admin','AA']:params.get('actor')==='moderator'?['Alexey Saava','AS']:['Chapajev Wasil','CW']);
  const trigger=document.querySelector('.user-menu>.dropdown-toggle');
  const label=trigger?.querySelector('.admin-user-trigger-text')||trigger?.querySelector('span');
  if(label){const text=Array.from(label.childNodes).find(n=>n.nodeType===Node.TEXT_NODE);if(text)text.textContent=person[0]+' ';else label.prepend(document.createTextNode(person[0]+' '));}
  const initial=trigger?.querySelector('.admin-user-trigger-avatar');if(initial)initial.textContent=person[1];
  document.addEventListener('click',e=>{if(e.target.closest('[data-cl-demo-disabled]')){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('submit',e=>{if(!e.target.closest('#cl-internal-drawer,#cl-internal-modal')){e.preventDefault();e.stopImmediatePropagation();}},true);
})();
