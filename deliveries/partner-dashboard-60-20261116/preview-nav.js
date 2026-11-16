(() => {
 'use strict';
 const routes={
  'Заказы':'https://confideline.com/ru/admin/order/index',
  'Транзакции':'https://confideline.com/ru/admin/balance-transaction/index',
  'Мой баланс':'https://confideline.com/ru/admin/balance/index',
  'Цензура':'https://confideline.com/ru/admin/chat-contact-incident/index',
  'Баны':'https://confideline.com/ru/admin/ban/index',
  'Жалобы':'https://confideline.com/ru/admin/report/index',
  'Поддержка':'https://confideline.com/ru/admin/support-v2/index',
  'Чат':'https://confideline.com/ru/admin/chat/v2',
  'Мои шаблоны':'https://confideline.com/ru/admin/chat-personal-message-template/index',
  'Шаблоны чата эксперта':'https://confideline.com/ru/admin/chat-expert-message-template/index',
  'Взаимодействия пользователей':'https://confideline.com/ru/admin/interaction/index'
 };
 document.querySelectorAll('.sidebar-menu > li > a[role="button"]').forEach(toggle=>{
  const list=toggle.parentElement.querySelector(':scope > .treeview-menu'); if(!list)return;
  if(toggle.title==='Диалоги') list.querySelector('a[title="Взаимодействия пользователей"]')?.closest('li')?.remove();
  if(toggle.title==='Финансы') list.querySelector('a[title="Реестр выплат"]')?.closest('li')?.remove();
  list.querySelectorAll('a[title]').forEach(a=>{
   if(routes[a.title])a.href=routes[a.title];
   a.querySelectorAll('.label').forEach(label=>label.remove());
  });
  toggle.addEventListener('click',event=>{
   event.preventDefault();
   const open=toggle.getAttribute('aria-expanded')!=='true';
   toggle.setAttribute('aria-expanded',String(open));
   list.style.display=open?'block':'none';
  });
 });
})();
