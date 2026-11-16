(() => {
 const url=new URL(location.href);
 url.searchParams.set('demoAgent','kristy');
 url.searchParams.set('scheduleView','agent');
 if(!url.hash)url.hash='#schedule';
 history.replaceState(history.state,'',url);
})();
