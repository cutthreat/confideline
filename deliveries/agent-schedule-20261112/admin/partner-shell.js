(() => {
 const toggle=document.querySelector('.sidebar-toggle');
 toggle?.addEventListener('click',event=>{event.preventDefault();document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse');});
 document.querySelectorAll('[data-preview-action]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
 const actions=document.querySelector('.partner-workspace .partner-actions'),small=matchMedia('(max-width:767px)');
 if(actions){actions.open=!small.matches;small.addEventListener('change',event=>{actions.open=!event.matches;});}
})();
