(function(){
  function setupAuthRoute(){
    var openers=document.querySelectorAll('.js-open-free-reading');
    openers.forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var url=btn.getAttribute('data-auth-url')||'signup-step-1.html';
        window.location.href=url;
      });
    });
  }

  function setupOfferPopup(){
    var popup=document.getElementById('offerPopup');
    if(!popup) return;
    var closers=popup.querySelectorAll('[data-close-popup]');
    function open(){popup.classList.add('is-open'); document.body.style.overflow='hidden';}
    function close(){popup.classList.remove('is-open'); document.body.style.overflow='';}
    closers.forEach(function(btn){ btn.addEventListener('click', function(e){ e.preventDefault(); close(); }); });
    popup.addEventListener('click', function(e){ if(e.target===popup){ close(); } });
    if(document.body.hasAttribute('data-open-offer')) open();
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
  }

  function setupVideo(){
    var btn=document.querySelector('.js-video-play');
    if(!btn) return;
    var wrap=document.getElementById('videoIframeWrap');
    btn.addEventListener('click', function(){
      var url=btn.getAttribute('data-video-url');
      wrap.innerHTML='<iframe src="'+url+'" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      wrap.classList.add('is-active');
      btn.style.display='none';
    });
  }

  setupAuthRoute();
  setupOfferPopup();
  setupVideo();
})();
