(function(){
  const ROOT = (() => { const p = location.pathname; if (p.includes('/service-blueprint-v2/')) return p.split('/service-blueprint-v2/')[0] + '/service-blueprint-v2/'; if (p.includes('/blue-panel/docs/')) return p.split('/blue-panel/docs/')[0] + '/blue-panel/'; if (p.includes('/blue-panel/cells/')) return p.split('/blue-panel/cells/')[0] + '/blue-panel/'; if (p.includes('/blue-panel/')) return p.split('/blue-panel/')[0] + '/blue-panel/'; return './'; })();
  const main = document.querySelector('main.wrap') || document.body;
  const navItems = [
    ['Главная', ROOT + 'index.html'],
    ['Стратегия', ROOT + 'docs/strategy-board.html'],
    ['Мастер-план', ROOT + 'cells/cell-pm-master-launch-plan-2026-06-04.html'],
    ['План июня', ROOT + 'docs/june-plan.html'],
    ['Готовность запуска', ROOT + 'docs/launch-readiness-architecture.html'],
    ['Проверка сайта', ROOT + 'docs/evidence.html']
  ];
  function normalizePath(url){try{return new URL(url,location.href).pathname.replace(/\/index\.html$/,'/');}catch(e){return '';}}
  function ensureNav(){
    let nav=document.querySelector('nav.top-nav');
    if(!nav){nav=document.createElement('nav');nav.className='top-nav panel-auto-nav';nav.setAttribute('aria-label','Главная навигация Blue panel');nav.innerHTML=navItems.map(([label,href])=>`<a href="${href}">${label}</a>`).join('');main.insertBefore(nav,main.firstChild);}
    const current=normalizePath(location.href);
    nav.querySelectorAll('a').forEach(a=>{const href=normalizePath(a.href); if(href&&(current===href||current.endsWith('/'+href.split('/').pop()))){a.classList.add('active');a.setAttribute('aria-current','page');}});
  }
  function isInteractive(el){return !!el.closest('a,button,input,textarea,select,summary,details,[role="button"]');}
  function makeClickableCards(){
    const selectors=['.month','.card','.box','.metric','.task','.step','.principle','.outcome','.jstep','.doc-card','.link-row','.route-step','.next-panel','.action-strip','.primary-action','.now-card','.resource-list > a','.service-grid > a','.links > a'];
    document.querySelectorAll(selectors.join(',')).forEach(card=>{
      if(card.matches('a')){card.classList.add('panel-clickable-link');if(!card.matches('.route-step') && !card.querySelector('.panel-card-action')){const badge=document.createElement('span');badge.className='panel-card-action';badge.textContent='↗';card.appendChild(badge);}return;}
      if(card.closest('details')&&!card.matches('.link-row,.links > a')) return;
      const links=Array.from(card.querySelectorAll('a[href]')).filter(a=>!a.closest('details'));
      if(links.length!==1) return;
      const link=links[0];
      card.classList.add('panel-click-card');card.setAttribute('role','link');card.setAttribute('tabindex','0');card.setAttribute('aria-label',(card.querySelector('h2,h3,b,strong')?.textContent||link.textContent||'Открыть').trim());
      if(!card.querySelector('.panel-card-action')){const badge=document.createElement('span');badge.className='panel-card-action';badge.textContent='↗';card.appendChild(badge);}
      card.addEventListener('click',event=>{if(isInteractive(event.target)) return; link.click();});
      card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();link.click();}});
    });
  }
  function markExternalAndFiles(){document.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href')||''; if(/^https?:\/\//.test(href)&&!href.includes(location.host)) a.classList.add('external-link'); if(/\.(md|csv|json|pdf|docx?|xlsx?|png|jpg|jpeg|webp)$/i.test(href)) a.classList.add('file-link');});}
  ensureNav(); makeClickableCards(); markExternalAndFiles();
})();






