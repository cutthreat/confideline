(function(){
  'use strict';
  var root=document.querySelector('[data-cr-page]'); if(!root||root.dataset.crBound)return;root.dataset.crBound='true';
  var page=root.dataset.crPage, channel='consultation';
  var form=document.getElementById('cr-send-form'), draft=document.getElementById('cr-draft'), send=document.getElementById('cr-send'), timeline=document.getElementById('cr-timeline');
  var notice=document.getElementById('cr-notice'), initialHistory=timeline.innerHTML;
  var safeHistories={consultation:initialHistory,support:'<div class="cr-day">Сегодня, 1 октября</div><div class="cr-message"><div class="cr-bubble">Здравствуйте! Чем можем помочь?<time>10:20</time></div></div>'};
  function switchChannel(next){
    safeHistories[channel]=timeline.innerHTML;channel=next;timeline.innerHTML=safeHistories[channel];notice.hidden=true;
    document.getElementById('cr-peer').textContent=next==='support'?'Служба поддержки':(page==='expert'?'Алексей → Serena Moon':'Serena Moon');
    document.getElementById('cr-channel-label').textContent=next==='support'?'Обращение в поддержку':(page==='expert'?'Разговор #32 · консультация':'Эксперт · онлайн');
    document.getElementById('cr-composer-help').textContent=next==='support'?'Переписка со службой поддержки.':'Продолжайте общение в этом чате.';
    document.querySelectorAll('[data-channel]').forEach(function(b){b.classList.toggle('active',b.dataset.channel===next);});
  }
  document.querySelectorAll('[data-channel]').forEach(function(b){b.addEventListener('click',function(){switchChannel(b.dataset.channel);});});
  var help=document.querySelector('[data-switch-support]');if(help)help.addEventListener('click',function(e){e.preventDefault();switchChannel('support');});
  draft.addEventListener('input',function(){send.disabled=!draft.value.trim();});
  document.getElementById('cr-dismiss-notice').addEventListener('click',function(){notice.hidden=true;});
  document.querySelectorAll('.cr-menu-toggle').forEach(function(b){b.addEventListener('click',function(){if(innerWidth<=768)root.classList.toggle('cr-nav-open');else root.classList.toggle('cr-nav-collapsed');});});
  form.addEventListener('submit',function(e){
    e.preventDefault();if(!draft.value.trim())return;
    var requested=new URLSearchParams(location.search).get('sender');
    var author=['client','expert','operator'].indexOf(requested)>=0?requested:(page==='expert'?'expert':'client');
    var result=ContactRules.mask(draft.value,null,{channel:channel,sender:author==='operator'?'expert':author});
    var own=page==='expert'?author!=='client':author==='client';
    var article=document.createElement('article');article.className='cr-message'+(own?' cr-own':'');
    var avatar=document.createElement('span');avatar.className='cr-avatar';avatar.textContent=author==='client'?'АЛ':'СМ';avatar.setAttribute('aria-hidden','true');
    var bubble=document.createElement('div');bubble.className='cr-bubble';
    var text=document.createElement('span');text.className='cr-message-text';text.textContent=result.text;
    var time=document.createElement('time');time.textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Minsk'});
    bubble.append(text,time);article.append(avatar,bubble);timeline.appendChild(article);
    document.getElementById('cr-contact-preview').textContent=result.text;
    notice.hidden=!(result.redacted&&own);draft.value='';send.disabled=true;timeline.scrollTop=timeline.scrollHeight;
  });
})();
