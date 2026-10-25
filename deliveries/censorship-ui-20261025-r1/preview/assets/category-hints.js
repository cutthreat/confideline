(function(){
 'use strict';
 const root=document.getElementById('date-demo'),$=window.jQuery;
 if(!root||!$||!$.fn.tooltip)return;
 let active=null,message='',anchor=null,pinned=false,openTimer=null,closeTimer=null,dismissed=null,lastPointer='mouse';
 const selector='.category-icon-button';
 root.querySelectorAll(selector).forEach(button=>{
   button.querySelectorAll('i[title]').forEach(icon=>icon.removeAttribute('title'));
   $(button).tooltip({trigger:'manual',animation:false,html:false,container:'#date-demo',placement:'auto top',title:()=>message,viewport:{selector:'body',padding:12}});
 });
 function timers(){clearTimeout(openTimer);clearTimeout(closeTimer);}
 function hide(){timers();if(active)$(active).tooltip('hide');active=null;anchor=null;pinned=false;}
 function position(){
   if(!active||!anchor)return;const tip=$(active).data('bs.tooltip').tip()[0],r=anchor.getBoundingClientRect(),t=tip.getBoundingClientRect();
   const header=document.querySelector('.main-header'),minTop=(header?.getBoundingClientRect().bottom||0)+8,above=r.top-t.height-6>=minTop;
   tip.style.position='fixed';tip.style.left=Math.max(12,Math.min(r.left+r.width/2-t.width/2,innerWidth-t.width-12))+'px';
   tip.style.top=(above?r.top-t.height-6:Math.min(innerHeight-t.height-12,r.bottom+6))+'px';
   tip.classList.remove('top','bottom','left','right');tip.classList.add(above?'top':'bottom');
 }
 function show(button,keepOpen=false){
   if(!$(button).data("bs.tooltip"))$(button).tooltip({trigger:"manual",animation:false,html:false,container:"#date-demo",placement:"auto top",title:()=>message});
   timers();if(dismissed===button&&!keepOpen)return;
   if(active)$(active).tooltip('hide');active=button;message=button.dataset.categoryLabel;anchor=button.querySelector('i')||button;pinned=keepOpen;
   $(button).tooltip('show');const tip=$(button).data('bs.tooltip').tip()[0];tip.dataset.pinned=String(pinned);position();
   tip.onpointerenter=()=>clearTimeout(closeTimer);
   tip.onpointerleave=()=>{if(!pinned)closeTimer=setTimeout(hide,120);};
 }
 root.addEventListener('pointerdown',event=>{lastPointer=event.pointerType||'mouse';});
 root.addEventListener('pointerover',event=>{
   if(event.pointerType==='touch')return;
   const button=event.target.closest(selector);if(!button)return;lastPointer=event.pointerType||'mouse';dismissed=null;timers();
   if(active)show(button);else openTimer=setTimeout(()=>show(button),300);
 });
 root.addEventListener('pointerout',event=>{
   const button=event.target.closest(selector);if(!button||pinned)return;
   if(event.relatedTarget&&button.contains(event.relatedTarget))return;
   if(event.relatedTarget?.closest?.('.tooltip'))return;
   clearTimeout(openTimer);closeTimer=setTimeout(()=>{
     if(document.activeElement===button&&button.matches(':focus-visible')&&dismissed!==button)show(button);else hide();
   },120);
 });
 root.addEventListener('focusin',event=>{const button=event.target.closest(selector);if(button&&button.matches(':focus-visible')&&lastPointer!=='touch')show(button);});
 root.addEventListener('focusout',event=>{const button=event.target.closest(selector);if(!button)return;if(!pinned)hide();if(dismissed===button)dismissed=null;});
 root.addEventListener('click',event=>{
   const button=event.target.closest(selector);if(!button)return;
   const touch=event.pointerType==='touch'||lastPointer==='touch'||matchMedia('(pointer:coarse) and (hover:none)').matches;
   if(touch){event.preventDefault();dismissed=null;if(active===button&&pinned)hide();else show(button,true);}
 });
 document.addEventListener('pointerdown',event=>{if(active&&!active.contains(event.target)&&!event.target.closest('.tooltip'))hide();});
 document.addEventListener('keydown',event=>{if(event.key==='Tab'){lastPointer='keyboard';hide();}if(event.key==='Escape'&&active){dismissed=active;hide();}});
 window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
})();
