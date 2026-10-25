/* Preview navigation only; never deploy this file. */
document.addEventListener('click',e=>{if(e.target.closest('[data-preview-outside]'))e.preventDefault();});
document.querySelectorAll('.main-header .user-menu a').forEach(a=>a.setAttribute('aria-label','Демонстрационный пользователь'));
