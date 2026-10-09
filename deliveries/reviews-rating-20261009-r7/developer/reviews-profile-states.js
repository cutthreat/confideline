(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./reviews-admin-workflow.js'));
  else root.ReviewProfileStates = factory(root.ReviewAdminWorkflow);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (workflow) {
  'use strict';
  const cases = [
    {id:'published',group:'Анкета',name:'Опубликованные отзывы',expected:'Рейтинг 4.0, 2 голоса, 2 текста. Форма доступна.'},
    {id:'empty',group:'Анкета',name:'Нет оценок и отзывов',expected:'Рейтинга и звёзд нет ни в шапке, ни в блоке. Есть пустое состояние и форма.'},
    {id:'scores-only',group:'Анкета',name:'Оценки без текста',expected:'Рейтинг 4.0, 2 голоса, 0 текстов. Нет вымышленных комментариев.'},
    {id:'base-only',group:'Анкета',name:'Только ручная база',expected:'Рейтинг 4.8, 125 голосов, 0 текстов. Нет авторов и отметок проверки.'},
    {id:'mixed-base',group:'Анкета',name:'Отзывы и ручная база',expected:'Существующие оценки 5 и 3 плюс база 5.0/2: итог 4.5/4, 2 текста.'},
    {id:'zero-base',group:'Анкета',name:'Нулевая база, реальные оценки',expected:'Реальные 4.0/2 остаются видны, база не скрывает их.'},
    {id:'empty-zero-base',group:'Анкета',name:'Нулевая база без оценок',expected:'Рейтинг скрыт без зазора; пустой список.'},
    {id:'anonymous',group:'Анкета',name:'Анонимный отзыв',expected:'Публично нет имени и идентификатора автора. Рейтинг учитывает оценку.'},
    {id:'long-review',group:'Анкета',name:'Длинный текст',expected:'Текст 1000 символов и длинное слово переносятся; страница не расширяется.'},
    {id:'ineligible',group:'Допуск',name:'Нет допуска к оценке',expected:'Блок отзывов доступен для чтения; кнопки и формы отправки нет.'},
    {id:'form',group:'Форма',name:'Пустая форма',expected:'Оценка обязательна; текст и анонимность необязательны. Модерация включена.'},
    {id:'form-rating-only',group:'Форма',name:'Только оценка',expected:'Выбраны 4 звезды, текст пустой. Отправляется одна оценка без комментария.'},
    {id:'form-anonymous',group:'Форма',name:'Анонимная отправка',expected:'Выбраны 5 звёзд, текст и чекбокс анонимности заполнены.'},
    {id:'form-limit',group:'Форма',name:'Предел текста',expected:'1000/1000 символов. Поле не принимает больше; форма помещается на мобильном.'},
    {id:'form-immediate',group:'Форма',name:'Модерация выключена',expected:'Кнопка «Опубликовать»; нет обещания ожидания проверки.'},
    {id:'invalid-rating',group:'Ошибка',name:'Не выбрана оценка',expected:'Ошибка в открытой форме; введённый текст сохранён. Выбор звезды снимает ошибку.'},
    {id:'save-error',group:'Ошибка',name:'Не удалось сохранить',expected:'Форма и введённые данные остаются. Повторная попытка доступна; ложного успеха нет.'},
    {id:'submitting',group:'Отправка',name:'Отправка выполняется',expected:'Кнопка «Отправка…» недоступна. Повторная отправка невозможна.'},
    {id:'pending-text',group:'Результат',name:'Отзыв на проверке',expected:'Подтверждение ожидания. Новый текст и оценка ещё не публичны; повтор запрещён.'},
    {id:'pending-rating',group:'Результат',name:'Оценка на проверке',expected:'Подтверждение для оценки без текста. Итог не изменился; повтор запрещён.'},
    {id:'published-text',group:'Результат',name:'Отзыв опубликован сразу',expected:'Сообщение успеха, новый текст и голос учтены. Связь с консультацией подтверждена; ручная проверка не заявлена.'},
    {id:'published-rating',group:'Результат',name:'Оценка учтена сразу',expected:'Сообщение для оценки без текста. Голосов стало 3, текстов осталось 2.'},
    {id:'rejected',group:'Повтор',name:'Отзыв отклонён',expected:'Нет публичного вклада. Статус у клиента виден; повтор по консультации недоступен.'},
    {id:'hidden',group:'Повтор',name:'Отзыв скрыт',expected:'Нет публичного вклада. Статус у клиента виден; повтор недоступен.'},
    {id:'deleted',group:'Повтор',name:'Отзыв удалён',expected:'Нет публичного вклада. Мягкое удаление не открывает повторную отправку.'},
    {id:'loading',group:'Загрузка',name:'Отзывы загружаются',expected:'Статус загрузки; до ответа нет старого рейтинга, пустого списка или формы.'},
    {id:'load-error',group:'Загрузка',name:'Ошибка загрузки',expected:'Нет ложного рейтинга. Кнопка повторного чтения восстанавливает блок.'},
    {id:'feature-off',group:'Настройки',name:'Отзывы на сайте отключены',expected:'В анкете нет блока, рейтинга, голосов или формы. Данные не удалены.'},
    {id:'rating-hidden',group:'Настройки',name:'Рейтинг скрыт',expected:'Тексты опубликованных отзывов видны, общего рейтинга и голосов нет.'},
    {id:'texts-hidden',group:'Настройки',name:'Тексты скрыты',expected:'Общий рейтинг и голоса видны; текстов и ложного пустого состояния нет.'},
    {id:'submissions-closed',group:'Настройки',name:'Приём новых отзывов закрыт',expected:'Опубликованные отзывы и рейтинг видны. Вместо отправки — статус закрытого приёма.'},
    {id:'anonymous-disabled',group:'Настройки',name:'Анонимность отключена',expected:'У новой формы нет чекбокса анонимности. Старые анонимные отзывы не раскрывают автора.'},
    {id:'text-required',group:'Настройки',name:'Комментарий обязателен',expected:'Поле текста обязательное; отправка пустого текста даёт ошибку, а не голос.'},
    {id:'custom-text-limit',group:'Настройки',name:'Лимит 120 символов',expected:'Счётчик и maxlength равны 120. Лимит применяется к новой отправке.'},
    {id:'anonymous-policy-changed',group:'Настройки',name:'Анонимность отключили при открытой форме',expected:'Выбранная анонимность не снимается молча. Показана ошибка; клиент сам принимает решение.'},
    {id:'text-limit-reduced',group:'Настройки',name:'Лимит уменьшили при открытой форме',expected:'Черновик 180/100 сохранён целиком. Ошибка требует сократить текст; автоматической обрезки нет.'},
    {id:'submissions-closed-form',group:'Настройки',name:'Приём закрыли при открытой форме',expected:'Черновик сохранён; отправка заблокирована, показана причина.'}
  ];
  const catalog = [
    {id:'overview',name:'Отзывы, анонимность и ручная база',action:'Прочитать список и рейтинг; открыть форму.',expected:['Оценки 5 и 3 плюс база 5.0 / 2 дают 4.5, 4 голоса и 2 текста.','Один автор анонимный, второй отображается по имени. Идентификаторы публично не раскрыты.','Отзыв на 1000 символов и длинное слово переносятся без расширения страницы.','Форма открывается пустой; оценка обязательна, комментарий необязателен.']},
    {id:'empty-guest',name:'Пустая анкета без допуска к оценке',action:'Просмотреть блок и шапку.',expected:['Нет рейтинга, звёзд и зазора под отсутствующий агрегат.','Нулевая база не создаёт фиктивные голоса.','Пустой список показан; без допуска к консультации отправки нет.']},
    {id:'rating-closed',name:'Только рейтинг; новый приём закрыт',action:'Просмотреть блок.',expected:['Оценки без комментариев дают 4.0 и 2 голоса.','Настройка показа текстов выключена: нет ни списка, ни ложного пустого состояния.','Закрытый приём не скрывает рейтинг; вместо формы показан статус.']},
    {id:'form-combined',name:'Форма: оценка, анонимность и предел текста',action:'Выбрать звезду и отправить; отдельно проверить отмену/Escape.',expected:['Текст 1000 / 1000 сохранён; длинное слово переносится, форма помещается на мобильном.','Анонимность выбрана явно.','Нет оценки: видна ошибка; выбор звезды снимает её без потери текста.','Модерация выключена: кнопка «Опубликовать», без обещания ожидания проверки.']},
    {id:'restricted-form',name:'Форма: обязательный текст и лимит 120',action:'Заполнить комментарий; закрыть форму и прочитать старый отзыв.',expected:['Обязательный текст пуст: отправка показывает конкретную ошибку.','Счётчик и maxlength равны 120, правило применяется к новой отправке.','Новой анонимной отправки нет, но старый анонимный автор не раскрывается.','Рейтинг скрыт настройкой; тексты опубликованных отзывов остаются.']},
    {id:'save-error',name:'Ошибка сохранения',action:'Повторить отправку или отменить.',expected:['Форма, выбранная оценка и черновик сохранены.','Есть ошибка, но нет ложного успеха.','Повторная попытка доступна; во время отправки повтор блокируется.']},
    {id:'pending-text',name:'Отзыв на проверке',action:'Проверить сообщение, список и повторную отправку.',expected:['Клиент видит ожидание модерации.','Новая оценка и текст ещё не входят в публичные данные: остаются 4.0 / 2 и 2 текста.','Повтор по той же консультации недоступен. Для оценки без текста меняется только сообщение, см. ТЗ.']},
    {id:'published-text',name:'Отзыв опубликован',action:'Прочитать новый отзыв и результат.',expected:['Сообщение соответствует опубликованному статусу, а не ожиданию проверки.','Три оценки дают 4.3, 3 голоса и 3 текста; новый автор анонимный.','Связь с завершённой консультацией подтверждена; ручная проверка не заявлена. Повтор недоступен. Оценка без текста увеличивает только голоса, см. ТЗ.']},
    {id:'rejected',name:'Отклонение: исправление или пересмотр',action:'Прочитать причину; исправить текст либо запросить пересмотр.',expected:['Отклонённая запись не участвует в публичном списке и рейтинге.','В приватном статусе показана клиентская причина, без внутренних заметок.','Исправление сохраняет оценку и консультацию; возвращает ту же запись на проверку.','Пересмотр фиксируется отдельно и не создаёт второй голос. Скрытие и мягкое удаление используют тот же приватный статус, см. ТЗ.']},
    {id:'loading',name:'Загрузка',action:'Дождаться чтения.',expected:['Показан статус загрузки.','До ответа нет старого рейтинга, ложного пустого списка или формы.']},
    {id:'load-error',name:'Ошибка загрузки',action:'Повторить чтение.',expected:['Нет ложного рейтинга и пустого списка.','Кнопка повторного чтения восстанавливает блок.']},
    {id:'feature-off',name:'Отзывы полностью выключены',action:'Просмотреть анкету.',expected:['Нет блока отзывов, рейтинга, голосов и формы.','Данные сохранены: повторное включение возвращает их без изменения статусов.']},
    {id:'anonymous-policy-changed',name:'Анонимность отключили в открытой форме',action:'Самостоятельно снять анонимность или отменить.',expected:['Выбранная анонимность не снимается молча.','Черновик сохранён; ошибка требует явного решения клиента.']},
    {id:'text-limit-reduced',name:'Лимит уменьшили в открытой форме',action:'Сократить текст или отменить.',expected:['Черновик 180 / 100 сохранён целиком, без автоматической обрезки.','Показана ошибка нового лимита; до исправления отправки нет.']},
    {id:'submissions-closed-form',name:'Приём закрыли в открытой форме',action:'Прочитать причину; отменить.',expected:['Черновик сохранён, показана причина отказа.','Новая отправка заблокирована; старые опубликованные данные не пропали.']}
  ];
  function createCase(id) {
    const composite=id;
    const base={overview:'mixed-base','empty-guest':'empty-zero-base','rating-closed':'scores-only','form-combined':'invalid-rating','restricted-form':'text-required'};
    id=base[id]||id;
    if (!cases.some(c => c.id === id)) return null;
    const state=workflow.initialState(),ui={eligible:true,form:false,stars:null,text:'',anonymous:false,error:null,notice:null,phase:null,sending:false};
    if (['empty','base-only','empty-zero-base'].includes(id)) state.reviews=[];
    if (id==='scores-only') state.reviews.forEach(r=>{r.text='';});
    if (id==='base-only') state.overrides['EX-101']={mode:'manual',rating:4.8,votes:125};
    if (id==='mixed-base') state.overrides['EX-101']={mode:'manual',rating:5,votes:2};
    if (['zero-base','empty-zero-base'].includes(id)) state.overrides['EX-101']={mode:'manual',rating:null,votes:0};
    if (id==='anonymous') state.reviews[0].anonymous=true;
    if (id==='long-review') state.reviews[0].text=('Спасибо за консультацию. '.repeat(30)+'Длинноеслово'.repeat(30)).slice(0,1000);
    if (id==='ineligible') ui.eligible=false;
    if (id.startsWith('form') || ['invalid-rating','save-error','submitting'].includes(id)) ui.form=true;
    if (id==='form-rating-only') ui.stars=4;
    if (id==='form-anonymous') {ui.stars=5;ui.text='Спасибо за подробные ответы.';ui.anonymous=true;}
    if (id==='form-limit') {ui.stars=5;ui.text='А'.repeat(1000);}
    if (id==='form-immediate') state.moderationMode='none';
    if (id==='invalid-rating') {ui.text='Этот текст не должен пропасть.';ui.error='stars';}
    if (id==='save-error') {ui.stars=5;ui.text='Этот текст сохранится для повторной попытки.';ui.error='save';}
    if (id==='submitting') {ui.stars=5;ui.text='Спасибо за консультацию.';ui.sending=true;}
    if (['pending-text','pending-rating','published-text','published-rating','rejected','hidden','deleted'].includes(id)) {
      const status=id.startsWith('pending')?'pending':id.startsWith('published-')?'published':id;
      const ratingOnly=id.endsWith('-rating');
      state.reviews.unshift({id:'RV-204',expertId:'EX-101',authorProfileId:'USR-303',author:'Анна',stars:ratingOnly?1:5,text:ratingOnly?'':'Спасибо за подробные ответы.',anonymous:true,status,consultation:'CT-1024',source:'client',consultationVerified:true,verified:false,createdAt:'2026-10-08T12:00:00Z'});
      state.nextId=205;
      if(['rejected','hidden','deleted'].includes(status)){state.reviews[0].version=1;state.reviews[0].decisionId=1;state.reviews[0].clientDecision={code:status==='rejected'?'personal_data':'not_related',message:''};}
      if (status==='published') state.moderationMode='none';
      if (status==='pending' || status==='published') ui.notice=id;
    }
    if (id==='loading') ui.phase='loading';
    if (id==='load-error') ui.phase='error';
    if (id==='feature-off') state.reviewsEnabled=false;
    if (id==='rating-hidden') state.ratingVisible=false;
    if (id==='texts-hidden') state.textReviewsVisible=false;
    if (['submissions-closed','submissions-closed-form'].includes(id)) state.clientSubmissionEnabled=false;
    if (['anonymous-disabled','text-required','custom-text-limit','anonymous-policy-changed','text-limit-reduced','submissions-closed-form'].includes(id)) {ui.form=true;ui.stars=4;}
    if (['anonymous-disabled','anonymous-policy-changed'].includes(id)) {state.anonymousAllowed=false;state.reviews[0].anonymous=true;}
    if (id==='text-required') state.ratingOnlyAllowed=false;
    if (id==='custom-text-limit') {state.maxTextLength=120;ui.text='А'.repeat(100);}
    if (id==='anonymous-policy-changed') {ui.anonymous=true;ui.text='Анонимный черновик остаётся без изменений.';ui.error='anonymous_disabled';}
    if (id==='text-limit-reduced') {state.maxTextLength=100;ui.text='А'.repeat(180);ui.error='text';}
    if (id==='submissions-closed-form') {ui.text='Черновик сохранится после закрытия приёма.';ui.error='submissions_closed';}
    if(composite==='overview'){state.reviews[0].anonymous=true;state.reviews[0].text=('Спасибо за консультацию. '.repeat(30)+'Длинноеслово'.repeat(30)).slice(0,1000);}
    if(composite==='empty-guest')ui.eligible=false;
    if(composite==='rating-closed'){state.textReviewsVisible=false;state.clientSubmissionEnabled=false;}
    if(composite==='form-combined'){ui.text='Длинноеслово'.repeat(100).slice(0,1000);ui.anonymous=true;state.moderationMode='none';}
    if(composite==='restricted-form'){state.anonymousAllowed=false;state.maxTextLength=120;state.ratingVisible=false;state.reviews[0].anonymous=true;ui.error='text_required';}
    return {state,ui};
  }
  const actions={
    'Анкета':'Прочитать рейтинг и список; открыть форму.',
    'Допуск':'Просмотреть блок; проверить отсутствие отправки.',
    'Форма':'Отправить; проверить результат или отменить/Escape.',
    'Ошибка':'Исправить оценку или повторить отправку.',
    'Отправка':'Попробовать повторный submit.',
    'Результат':'Проверить сообщение, счётчики и недоступность повтора.',
    'Повтор':'Проверить статус и отсутствие повторной отправки.',
    'Загрузка':'Проверить отсутствие старых данных; повторить чтение при ошибке.',
    'Настройки':'Проверить отображение, доступность формы и реакцию на изменение политики.'
  };
  return {catalog,cases:cases.map(c=>({...c,action:actions[c.group]})),createCase};
});
