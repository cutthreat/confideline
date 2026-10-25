/* Reuse existing site component classes inside the customer feature markup only. */
(() => {
 const roots=[...document.querySelectorAll('.cf-v9-component')];if(!roots.length)return;
 function update(){roots.forEach(root=>{
  const aliases={'.cf-panel-toolbar':'cf-toolbar','.cf-toolbar-actions':'cf-toolbar-actions','.cf-scroll':'cf-table-scroll','.cf-status-tabs':'cf-tabs','.cf-table-footer':'cf-list-footer','.cf-icon-btn':'cf-icon-button','.cf-btn':'cr-button','.cf-badge':'cf-pill','.cf-policy':'cf-policy-row'};
  for(const [selector,cls] of Object.entries(aliases))root.querySelectorAll(selector).forEach(e=>e.classList.add(cls));
  root.querySelectorAll('.cf-btn.btn-primary').forEach(e=>e.classList.add('cr-button-primary'));
  root.querySelectorAll('.cf-btn.btn-danger').forEach(e=>e.classList.add('cr-button-danger'));
  root.querySelectorAll('.cf-policy label').forEach(e=>e.classList.add('cr-check'));
  root.querySelectorAll('.cf-badge.is-enabled').forEach(e=>e.classList.add('cf-enabled'));
  root.querySelectorAll('.cf-badge.is-pending').forEach(e=>e.classList.add('cf-pending'));
  root.querySelectorAll('.cf-badge.is-confirmed').forEach(e=>e.classList.add('cf-confirmed'));
  root.querySelectorAll('.cf-status-tabs a').forEach(e=>{e.classList.add('cf-tab');e.classList.toggle('active',e.getAttribute('aria-current')==='true');});
  root.querySelectorAll('thead .filters').forEach(e=>e.classList.add('cf-filter-row'));
 });}
 let queued=false;roots.forEach(root=>new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;update();});}}).observe(root,{subtree:true,childList:true}));update();
})();
