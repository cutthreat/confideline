(function(){
  'use strict';
  const params=new URLSearchParams(location.search),connection=params.get('connection')||'good',status=params.get('operator')||'Online';
  const labels={good:['Подключен','Подкл.','conn-green'],unstable:['Нестабильное соединение','Неста.','conn-yellow'],offline:['Нет соединения','Нет с.','conn-red']};
  const current=labels[connection]||labels.good,label=document.getElementById('connLabel');
  label.textContent=current[0];label.title=current[0];label.dataset.compactLabel=current[1];label.closest('.conn-badge').title=current[0];document.getElementById('connDot').className='conn-dot '+current[2];
  function setStatus(value){const names={Online:'Онлайн',Busy:'Занят',Offline:'Не в сети'},key=Object.hasOwn(names,value)?value:'Online';document.getElementById('operatorStatusLabel').textContent=names[key];document.querySelector('[data-chat-operator-tools]').dataset.operatorStatus=key;document.querySelector('.operator-status-dot').className='fa fa-circle operator-status-dot operator-status-'+key.toLowerCase();document.querySelectorAll('[data-preview-status]').forEach(n=>n.classList.toggle('active',n.dataset.previewStatus===key));}
  setStatus(status);
  function syncPanels(){document.querySelectorAll('#admin-agent-chat .pane-left,#admin-agent-chat .pane-right').forEach(n=>n.classList.toggle('is-collapsed',innerWidth<1000));}
  syncPanels();window.addEventListener('resize',syncPanels);
  document.querySelectorAll('[data-preview-status]').forEach(n=>n.addEventListener('click',e=>{e.preventDefault();setStatus(n.dataset.previewStatus);}));
  document.querySelector('.sidebar-toggle').addEventListener('click',e=>{e.preventDefault();document.body.classList.toggle(innerWidth<768?'sidebar-open':'sidebar-collapse');});
  document.querySelectorAll('form:not(#cl-internal-modal-form)').forEach(n=>n.addEventListener('submit',e=>e.preventDefault()));
  document.querySelectorAll('.main-header [data-chat-modal-open],#btnRefreshChat').forEach(n=>n.addEventListener('click',()=>{if(n.dataset.chatModalOpen==='modalReportProblem'){window.dispatchEvent(new CustomEvent('cl-report-problem',{detail:{conversationId:document.querySelector('#admin-agent-chat .conv-item.active[data-conversation-id]')?.dataset.conversationId||null}}));return;}document.getElementById('cl-internal-feedback').textContent=n.id==='btnRefreshChat'?'Локальный макет: соединение не перезапускается.':'Локальный макет: статус оператора не меняется на сайте.';setTimeout(()=>document.getElementById('cl-internal-feedback').textContent='',2500);}));
})();
