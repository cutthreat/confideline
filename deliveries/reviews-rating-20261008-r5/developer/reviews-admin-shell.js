(function () {
  'use strict';
  const query = new URLSearchParams(location.search),role = query.get('role') || 'moderator',lang = query.get('lang') === 'en' ? 'en' : 'ru';
  const labels = {
    reviews:['Отзывы','Reviews'],write:['Написать отзыв','Write a Review'],moderation:['Модерация отзывов','Review Moderation'],create:['Новый отзыв','New Review'],reviewSettings:['Настройки отзывов','Review Settings'],textColumn:['Текст отзыва','Review Text'],
    superadmin:['Супер-администратор','Super Administrator'],moderator:['Модератор','Moderator'],client:['Клиент','Client'],forbidden:['Доступ запрещён','Access Denied'],
    all:['Все','All'],pending:['На проверке','Pending'],published:['Опубликован','Published'],hidden:['Скрыт','Hidden'],rejected:['Отклонён','Rejected'],deleted:['Удалён','Deleted'],
    expert:['Эксперт','Expert'],author:['Профиль клиента','Client Profile'],selectAuthor:['Выберите профиль','Select a Profile'],stars:['Оценка','Rating'],text:['Текст отзыва (необязательно)','Review Text (Optional)'],
    anonymous:['Анонимно','Anonymous'],reason:['Причина','Reason'],createReason:['Основание добавления','Reason for Creation'],cancel:['Отмена','Cancel'],confirm:['Подтвердить','Confirm'],save:['Сохранить','Save'],
    submit:['Отправить на проверку','Submit for Review'],publish:['Опубликовать','Publish'],sent:['Отзыв отправлен на проверку. Он появится в анкете после одобрения модератором.','Your review was submitted for moderation. It will appear after approval.'],
    ratingSent:['Оценка отправлена на проверку. Она будет учтена после одобрения модератором.','Your rating was submitted for moderation. It will be counted after approval.'],
    posted:['Отзыв опубликован. Спасибо!','Your review has been published. Thank you!'],ratingPosted:['Оценка учтена. Спасибо!','Your rating has been counted. Thank you!'],
    again:['Написать ещё','Write Another'],queue:['К очереди отзывов','Back to Reviews'],audit:['Закрытый журнал действий','Restricted Audit Log'],noActions:['Действий пока нет.','No Actions Yet.'],
    approve:['Одобрить','Approve'],reject:['Отклонить','Reject'],hide:['Скрыть','Hide'],restore:['Восстановить','Restore'],delete:['Удалить','Delete'],empty:['Отзывы не найдены.','No Reviews Found.'],
    noText:['Без комментария','No Comment'],anonymousPublic:['Анонимный клиент','Anonymous Client'],checked:['Проверен','Verified'],notChecked:['Не проверен','Not Verified'],
    noConsultation:['Не привязана','Not Linked'],date:['Отзыв / дата','Review / Date'],person:['Клиент / эксперт','Client / Expert'],consultation:['Консультация','Consultation'],status:['Статус','Status'],actions:['Действия','Actions'],
    search:['Клиент, отзыв или консультация','Client, Review or Consultation'],reset:['Сбросить фильтры','Reset Filters'],rating:['Рейтинг','Rating'],votes:['Голосов','Votes'],texts:['Текстовых отзывов','Text Reviews'],
    auto:['Автоматический','Automatic'],manual:['Ручной','Manual'],setRating:['Задать рейтинг','Set Rating'],ratingTitle:['Рейтинг эксперта','Expert Rating'],ratingSource:['Источник рейтинга','Rating Source'],
    autoSource:['По опубликованным оценкам','From Published Ratings'],manualSource:['Задать вручную','Set Manually'],manualRating:['Рейтинг','Rating'],manualVotes:['Количество голосов','Vote Count'],ratingReason:['Причина изменения','Reason for Change'],
    settings:['Настройки публикации','Publication Settings'],requireModeration:['Модерация новых отзывов и оценок','Moderate New Reviews and Ratings'],on:['Включена','On'],off:['Выключена','Off'],
    settingsSaved:['Настройка сохранена. Текущая очередь не изменена.','Setting Saved. Existing Queue Unchanged.'],decisionSaved:['Решение сохранено.','Decision Saved.'],ratingSaved:['Рейтинг сохранён.','Rating Saved.'],
    storage:['Не удалось прочитать или сохранить данные. Изменения не выполнены.','Data Could Not Be Read or Saved. No Changes Applied.'],
    error:['Проверьте заполнение полей.','Check the Form Fields.'],authorError:['Выберите действующий профиль клиента.','Select an Active Client Profile.'],starsError:['Выберите оценку от 1 до 5.','Select a Rating from 1 to 5.'],textError:['Текст не должен превышать 1000 символов.','Text Must Not Exceed 1000 Characters.'],reasonError:['Укажите причину до 500 символов.','Enter a Reason of up to 500 Characters.'],
    votesError:['Укажите целое неотрицательное число голосов.','Enter a Non-negative Integer Vote Count.'],ratingError:['Рейтинг: 1.0–5.0, шаг 0.1.','Rating: 1.0–5.0, Step 0.1.'],conflict:['Данные изменились. Обновите список и повторите решение.','Data Changed. Refresh the List Before Retrying.']
  };
  const t = key => labels[key] ? labels[key][lang === 'en' ? 1 : 0] : key;
  const esc = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = file => file + '?role=' + encodeURIComponent(role) + '&lang=' + lang;
  const can = action => ReviewAdminWorkflow.permissions(role).includes(action);
  const page = document.body.dataset.page || 'reviews',isCreate = page === 'create';
  const currentFile = page === 'settings' ? 'settings.html' : isCreate ? 'write-review.html' : 'reviews.html';
  document.documentElement.lang = lang;
  document.querySelector('.main-header').innerHTML = `<a href="profile.html?shared=1&amp;lang=${lang}" class="logo"><span class="logo-mini">YouDate</span><span class="logo-lg">YouDate</span></a><nav class="navbar navbar-static-top" aria-label="Administration"><button class="sidebar-toggle" id="sidebar-toggle" type="button" title="${t('reviews')}" aria-label="Menu" aria-controls="admin-sidebar" aria-expanded="true"></button><div class="navbar-custom-menu"><ul class="nav navbar-nav"><li class="dropdown user user-menu"><button class="review-account-toggle" id="admin-account-toggle" type="button" aria-expanded="false" aria-controls="admin-account-menu"><i class="glyphicon glyphicon-user" aria-hidden="true"></i> ${esc(t(role))} <i class="caret" aria-hidden="true"></i></button><ul class="dropdown-menu" id="admin-account-menu" hidden><li><a href="profile.html?shared=1&amp;lang=${lang}">${t('expert')}</a></li><li><a href="${url(isCreate ? 'write-review.html' : 'reviews.html').replace('lang='+lang,'lang='+(lang==='en'?'ru':'en'))}">${lang === 'en' ? 'Русский' : 'English'}</a></li></ul></li></ul></div></nav>`;
  document.querySelector('.main-sidebar').innerHTML = `<section class="sidebar"><ul class="sidebar-menu"><li><a href="#" aria-disabled="true"><i class="fa fa-dashboard" aria-hidden="true"></i><span>Dashboard</span></a></li><li class="header">Content</li><li><a href="#" aria-disabled="true"><i class="fa fa-user" aria-hidden="true"></i><span>Users</span></a></li><li><a href="#" aria-disabled="true"><i class="fa fa-life-ring" aria-hidden="true"></i><span>Support</span></a></li><li class="${isCreate?'':'active'}"><a href="${url('reviews.html')}" ${isCreate?'':'aria-current="page"'}><i class="fa fa-star-o" aria-hidden="true"></i><span>${t('reviews')}</span></a></li>${can('create')?`<li class="${isCreate?'active':''}"><a href="${url('write-review.html')}" ${isCreate?'aria-current="page"':''}><i class="fa fa-pencil-square-o" aria-hidden="true"></i><span>${t('write')}</span></a></li>`:''}<li><a href="#" aria-disabled="true"><i class="fa fa-users" aria-hidden="true"></i><span>Groups</span></a></li><li><a href="#" aria-disabled="true"><i class="fa fa-picture-o" aria-hidden="true"></i><span>Photos</span></a></li><li><a href="#" aria-disabled="true"><i class="fa fa-flag" aria-hidden="true"></i><span>Reports</span></a></li><li class="header">System</li><li><a href="#" aria-disabled="true"><i class="fa fa-cog" aria-hidden="true"></i><span>Common_settings</span></a></li></ul></section>`;
  document.querySelector('#admin-account-menu li:last-child a').href = url(currentFile).replace('lang='+lang,'lang='+(lang==='en'?'ru':'en'));
  const reviewLink=document.querySelector('.sidebar-menu a[href^="reviews.html"]');
  reviewLink.parentElement.classList.toggle('active',page==='reviews');
  if(page!=='reviews')reviewLink.removeAttribute('aria-current');
  if(can('settings')){
    const item=document.createElement('li');item.classList.toggle('active',page==='settings');
    item.innerHTML='<a href="'+url('settings.html')+'" '+(page==='settings'?'aria-current="page"':'')+'><i class="fa fa-cog" aria-hidden="true"></i><span>'+t('reviewSettings')+'</span></a>';
    document.querySelector('.sidebar-menu a[href^="write-review.html"]').parentElement.after(item);
  }
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  let store;
  try { store = ReviewAdminWorkflow.create(window.localStorage); } catch (_) { store = ReviewAdminWorkflow.create({getItem:()=>{throw new Error('storage');}}); }
  function error(error) { return t(({author:'authorError',stars:'starsError',text:'textError',reason:'reasonError',rating:'ratingError',votes:'votesError',storage:'storage',transition:'conflict',forbidden:'forbidden'})[error.message] || 'error'); }
  const sidebar = document.getElementById('sidebar-toggle'),backdrop = document.getElementById('sidebar-backdrop');
  function menu(open) {
    if (innerWidth <= 767) { document.body.classList.toggle('sidebar-open',open); backdrop.hidden = !open; }
    else { document.body.classList.toggle('sidebar-collapse',!open); backdrop.hidden = true; }
    sidebar.setAttribute('aria-expanded',String(open));
  }
  sidebar.onclick = () => menu(innerWidth<=767 ? !document.body.classList.contains('sidebar-open') : document.body.classList.contains('sidebar-collapse'));
  backdrop.onclick = () => menu(false);
  if (innerWidth <= 767) menu(false);
  const account = document.getElementById('admin-account-toggle'),accountMenu = document.getElementById('admin-account-menu');
  account.onclick = () => { accountMenu.hidden = !accountMenu.hidden; account.setAttribute('aria-expanded',String(!accountMenu.hidden)); };
  document.addEventListener('click',e => { if (!e.target.closest('.user-menu')) { accountMenu.hidden = true; account.setAttribute('aria-expanded','false'); } if (e.target.closest('[aria-disabled="true"]')) e.preventDefault(); });
  document.addEventListener('keydown',e => { if (e.key === 'Escape') { accountMenu.hidden = true; account.setAttribute('aria-expanded','false'); if (document.body.classList.contains('sidebar-open')) { menu(false); sidebar.focus(); } } });
  window.ReviewAdminUI = {role,lang,t,esc,url,can,store,error};
})();
