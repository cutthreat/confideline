/* PREVIEW ONLY. No backend, financial submission or browser storage. */
document.addEventListener('click',e=>{if(e.target.closest('[data-preview-inert]'))e.preventDefault();});document.addEventListener('submit',e=>e.preventDefault(),true);
