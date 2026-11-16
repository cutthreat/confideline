(function () {
  'use strict';
  const root=document.querySelector('#partner-analytics.paces-preview');
  if(!root)return;
  const links=root.querySelectorAll('.pa-role-nav a');
  if(links.length<2)return;
  const english=new URLSearchParams(location.search).get('lang')==='en';
  const query=english?'?lang=en&v=paces-20261116':'?v=paces-20261116';
  links[0].href='paces-agent.html'+query;
  links[1].href='paces-supervisor.html'+query;
  const demo=root.querySelector('.pa-demo');
  if(demo)demo.textContent=english?'Paces · sample data':'Paces · пример данных';
})();
