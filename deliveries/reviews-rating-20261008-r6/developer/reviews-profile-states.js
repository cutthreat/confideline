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
    {id:'published-text',group:'Результат',name:'Отзыв опубликован сразу',expected:'Сообщение успеха, новый текст и голос учтены. Нет ложной отметки проверки.'},
    {id:'published-rating',group:'Результат',name:'Оценка учтена сразу',expected:'Сообщение для оценки без текста. Голосов стало 3, текстов осталось 2.'},
    {id:'rejected',group:'Повтор',name:'Отзыв отклонён',expected:'Нет публичного вклада. Статус у клиента виден; повтор по консультации недоступен.'},
    {id:'hidden',group:'Повтор',name:'Отзыв скрыт',expected:'Нет публичного вклада. Статус у клиента виден; повтор недоступен.'},
    {id:'deleted',group:'Повтор',name:'Отзыв удалён',expected:'Нет публичного вклада. Мягкое удаление не открывает повторную отправку.'},
    {id:'loading',group:'Загрузка',name:'Отзывы загружаются',expected:'Статус загрузки; до ответа нет старого рейтинга, пустого списка или формы.'},
    {id:'load-error',group:'Загрузка',name:'Ошибка загрузки',expected:'Нет ложного рейтинга. Кнопка повторного чтения восстанавливает блок.'}
  ];
  function createCase(id) {
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
    if (id==='form-immediate') state.moderationRequired=false;
    if (id==='invalid-rating') {ui.text='Этот текст не должен пропасть.';ui.error='stars';}
    if (id==='save-error') {ui.stars=5;ui.text='Этот текст сохранится для повторной попытки.';ui.error='save';}
    if (id==='submitting') {ui.stars=5;ui.text='Спасибо за консультацию.';ui.sending=true;}
    if (['pending-text','pending-rating','published-text','published-rating','rejected','hidden','deleted'].includes(id)) {
      const status=id.startsWith('pending')?'pending':id.startsWith('published-')?'published':id;
      const ratingOnly=id.endsWith('-rating');
      state.reviews.unshift({id:'RV-204',expertId:'EX-101',authorProfileId:'USR-303',author:'Анна',stars:ratingOnly?1:5,text:ratingOnly?'':'Спасибо за подробные ответы.',anonymous:true,status,consultation:'CT-1024',source:'client',verified:false,createdAt:'2026-10-08T12:00:00Z'});
      state.nextId=205;
      if (status==='published') state.moderationRequired=false;
      if (status==='pending' || status==='published') ui.notice=id;
    }
    if (id==='loading') ui.phase='loading';
    if (id==='load-error') ui.phase='error';
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
    'Загрузка':'Проверить отсутствие старых данных; повторить чтение при ошибке.'
  };
  return {cases:cases.map(c=>({...c,action:actions[c.group]})),createCase};
});
