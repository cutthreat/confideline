/* Approved presentation on the existing customer journal; category filters remain unchanged. */
(() => {
 const root=document.querySelector('[data-contact-filter-page="incidents"]');if(!root)return;
 const types={'E-mail':['email','Почта','envelope-o'],'Почта':['email','Почта','envelope-o'],'Ссылка':['url','Ссылка','link'],'Телефон':['phone','Телефон','phone'],'Мессенджер':['messenger','Мессенджер','comments-o']};
 function update(){root.querySelectorAll('tbody tr .cf-category').forEach(cell=>{
  if(cell.dataset.iconsReady)return;const labels=[...cell.querySelectorAll('.cf-pill,.cf-badge')].map(e=>e.textContent.trim());if(!labels.length)return;
  const group=document.createElement('div');group.className='category-summary category-separated';
  ['E-mail','Почта','Ссылка','Телефон','Мессенджер'].forEach(label=>{if(!labels.includes(label))return;const [key,text,icon]=types[label];const button=document.createElement('button');button.type='button';button.className='category-more category-icons category-icon-button';button.dataset.categoryLabel=text;button.setAttribute('aria-label',text);button.innerHTML='<span class="transaction-type" aria-hidden="true"><i class="fa fa-'+icon+'" aria-hidden="true"></i></span>';group.append(button);});
  cell.replaceChildren(group);cell.dataset.iconsReady='true';
 });}
 let pending=false;new MutationObserver(()=>{if(!pending){pending=true;queueMicrotask(()=>{pending=false;update();});}}).observe(root.querySelector('tbody'),{childList:true,subtree:true});update();
})();
