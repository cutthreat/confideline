(function () {
  'use strict';
  const query = new URLSearchParams(location.search);
  const previous = new URLSearchParams(query.get('return') || '');
  const en = query.get('lang') === 'en' || previous.get('lang') === 'en';
  document.documentElement.lang = en ? 'en' : 'ru';

  const model = window.CatalogFilterModel;
  if (model && !en) {
    Object.assign(model.profileLabels.areas, {
      astrology: 'Астролог', mediums: 'Медиум', taro: 'Таролог', numerology: 'Нумеролог', palmistry: 'Хиромант', psychic: 'Экстрасенс', clairvoyant: 'Ясновидящий',
      'spiritual-practitioner': 'Духовный практик', 'psychoenergetic-practitioner': 'Психоэнергопрактик', 'energy-healer': 'Энергетический целитель',
      'intuitive-consultant': 'Интуитивный консультант', 'karmic-consultant': 'Кармический консультант', 'spiritual-mentor': 'Духовный наставник',
      'mindfulness-practitioner': 'Практик осознанности', 'subconscious-work-specialist': 'Специалист по подсознанию', empath: 'Эмпат'
    });
    Object.assign(model.profileLabels.topics, {
      love: 'Любовь и отношения', fortune: 'Судьба', career: 'Карьера и призвание', 'life-path': 'Будущее и жизненный путь', fertility: 'Рождение детей',
      soulmate: 'Родственная душа', romance: 'Романтика и знакомства', family: 'Брак и семья', breakups: 'Расставание и развод', partner: 'Поиск партнёра',
      compatibility: 'Совместимость', finances: 'Деньги и финансы', business: 'Бизнес и проекты', decisions: 'Выбор и решения', karmic: 'Кармические связи',
      energy: 'Энергетическая диагностика', growth: 'Личностный рост', balance: 'Эмоциональное равновесие', uncertainty: 'Тревоги и неопределённость',
      blocks: 'Внутренние блоки', confidence: 'Уверенность и самооценка', spiritual: 'Духовное развитие', ancestral: 'Родовые темы', relocation: 'Переезд и перемены'
    });
  }

  const translated = {
    'Каталог экспертов — макет фильтра': 'Expert directory — filter preview', 'Каталог — авторизованный пользователь': 'Directory — signed-in user',
    'Каталог экспертов | Общие настройки': 'Expert directory | General settings', 'Справка': 'Help', 'Уже есть аккаунт?': 'Already have an account?',
    'Войти': 'Sign in', 'У вас пока нет новых уведомлений': 'You have no new notifications', 'Смотреть все': 'View all', 'Профиль': 'Profile',
    'Настройки': 'Settings', 'Уведомления': 'Notifications', 'Баланс': 'Balance', 'Администрация': 'Administration', 'Нужна помощь?': 'Need help?',
    'Новости': 'News', 'Выйти': 'Sign out', 'Главная': 'Home', 'Главное': 'Home', 'Обзор': 'Browse', 'Группы': 'Groups', 'Контакты': 'Contacts', 'Сообщения': 'Messages',
    'Страны': 'Countries', 'Города': 'Cities', 'Фильтры': 'Filters', 'Направление': 'Expertise', 'Темы': 'Topics', 'Сбросить': 'Reset', 'Поиск': 'Search',
    'Эксперты': 'Experts', 'Загрузка…': 'Loading…', 'Для поиска экспертов необходимо включить JavaScript.': 'Enable JavaScript to search for experts.',
    'Приватное пространство для знакомств, общения и личных консультаций.': 'A private space for connections, conversations and personal consultations.',
    'Страны и города': 'Countries and cities', 'Русский': 'English', 'Связаться с поддержкой': 'Contact support', 'Мои обращения в поддержку': 'My support requests',
    'Центр помощи': 'Help center', 'О сайте': 'About', 'Восстановить доступ': 'Recover access', 'Сообщить о нарушении': 'Report a concern',
    'Информация': 'Information', 'Как это работает?': 'How it works', 'Советы против мошенничества': 'Fraud prevention',
    'Советы по безопасности в интернете': 'Online safety', 'Безопасность': 'Safety', 'Использование cookies': 'Cookie policy',
    'Правила и условия': 'Terms and conditions', 'Соглашение приватности': 'Privacy policy', 'География': 'Locations',
    '18+ · Используя сайт, вы соглашаетесь с правилами сообщества.': '18+ · By using this site, you agree to the community rules.',
    'Администратор': 'Administrator', 'Содержимое': 'Content', 'Пользователи': 'Users', 'Партнеры': 'Partners', 'Финансы': 'Finance',
    'Реестр выплат': 'Payouts', 'Заказы': 'Orders', 'Транзакции': 'Transactions', 'Мой баланс': 'My balance', 'Поддержка': 'Support',
    'Цензура': 'Moderation rules', 'Баны': 'Bans', 'Жалобы': 'Reports', 'Диалоги': 'Conversations', 'Взаимодействия пользователей': 'User interactions',
    'Чат': 'Chat', 'Мои шаблоны': 'My templates', 'Шаблоны чата эксперта': 'Expert chat templates', 'Информационные блоки': 'Information blocks',
    'Модерация': 'Moderation', 'Фотографии': 'Photos', 'Верификации': 'Verifications', 'Система': 'System', 'Общие настройки': 'General settings',
    'Настройки чата': 'Chat settings', 'Правила цензуры': 'Moderation settings', 'Платежи и тарифы': 'Payments and pricing', 'Шаблоны писем': 'Email templates',
    'Страницы': 'Pages', 'Языки': 'Languages', 'Настройка темы': 'Theme settings', 'SEO (переводы)': 'SEO translations', 'Поля профиля': 'Profile fields',
    'Категории полей': 'Field categories', 'Плагины': 'Plugins', 'Подарки': 'Gifts', 'Обслуживание': 'Maintenance', 'Логи': 'Logs',
    'Системный журнал': 'System log', 'Журнал действий': 'Activity log', 'Монитор очереди': 'Queue monitor', 'Кеш Redis': 'Redis cache',
    'Монитор WebSocket': 'WebSocket monitor', 'Информация о PHP': 'PHP information', 'Каталог экспертов': 'Expert directory',
    'Основные настройки': 'Basic settings', 'Настройки фото': 'Photo settings', 'Настройки поддержки': 'Support settings', 'Настройки группы': 'Group settings',
    'Настройки историй': 'Story settings', 'HTML-макропеременные': 'HTML variables', 'Социальная аутентификация': 'Social authentication',
    'Гендерные настройки': 'Gender settings', 'Настройки API Cloudflare': 'Cloudflare API settings', 'Кэшированные данные': 'Cached data',
    'Админ панель': 'Admin panel', 'Настройка ролей': 'Role settings', 'Лицензионный ключ': 'License key', 'Статус приложения': 'Application status',
    'Файловое хранилище': 'File storage', 'Настройки Premium (устаревшие)': 'Premium settings (legacy)', 'Фильтр каталога': 'Directory filter',
    'Горизонтальный фильтр': 'Horizontal filter', 'Вертикальный фильтр': 'Vertical filter', 'Выдача анкет': 'Profile listing', 'Знакомства': 'Dating',
    'Эзотерика': 'Spiritual services', 'Показывать гостям только экспертов онлайн': 'Show guests online experts only',
    'Основные настройки | Общие настройки': 'Basic settings | General settings',
    'Название сайта': 'Site name', 'Режим "одна страна"': 'One country mode only',
    'Страна по-умолчанию': 'Default country', '-- Выберите --': '-- Select --',
    'Работает только в режиме "одна страна"': 'Only applies in one-country mode',
    'Язык сайта': 'Site language', 'Автоопределение языка на основе языка браузера пользователя': 'Detect language from the browser',
    'Временная зона сайта': 'Site timezone', 'Мета описание': 'Meta description', 'Мета ключевые слова': 'Meta keywords',
    'Требовать captcha на auth/signup/restore': 'Require CAPTCHA for login, signup and recovery',
    'Требовать подтверждение e-mail при регистрации': 'Require email verification on signup',
    'Искать пользователей с фото по умолчанию': 'Search users with photos by default',
    'Скрывать расширенные поля профиля от неавторизованных пользователей': 'Hide extended profile fields from guests',
    'Скрывать пользовательские профили от гостей': 'Hide user profiles from guests',
    'Дополнительный HTML код (header)': 'Additional HTML code (header)', 'Дополнительный HTML код (footer)': 'Additional HTML code (footer)',
    'Скрыть каталог пользователей от гостей': 'Hide the user directory from guests',
    'Не применяется, пока каталог скрыт от гостей.': 'Does not apply while the directory is hidden from guests.',
    'Сохранить': 'Save', 'Отменить изменения': 'Discard changes', 'Обновить сохранённые значения': 'Refresh saved values',
    'Закрыть фильтры': 'Close filters', 'Фильтр экспертов': 'Expert filters', 'Применённые фильтры': 'Applied filters', 'Страницы каталога': 'Directory pages',
    'Навигация в нижней части страницы': 'Footer navigation', 'Платежные системы': 'Payment methods', 'Поиск в админке': 'Search administration',
    'Свернуть меню': 'Collapse menu'
  };
  if (en) {
    if (translated[document.title]) document.title = translated[document.title];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, value = node.nodeValue.trim();
      if (translated[value] && !node.parentElement.closest('script,style')) node.nodeValue = node.nodeValue.replace(value, translated[value]);
    }
    for (const element of document.querySelectorAll('[aria-label],[title],[placeholder]')) {
      for (const attribute of ['aria-label', 'title', 'placeholder']) {
        const value = element.getAttribute(attribute);
        if (translated[value]) element.setAttribute(attribute, translated[value]);
      }
    }
  }
  const languageLink = document.querySelector('.geo-site-footer__language');
  if (languageLink) {
    const next = new URL(location.href);
    next.searchParams.set('lang', en ? 'ru' : 'en');
    languageLink.href = next.href;
    languageLink.removeAttribute('aria-disabled');
    languageLink.removeAttribute('tabindex');
    languageLink.removeAttribute('data-shell-link');
    languageLink.setAttribute('aria-label', en ? 'Switch to Russian' : 'Переключить на английский');
    const flag = languageLink.querySelector('img');
    if (flag) flag.src = en ? 'assets/images/flags/gb.svg' : 'assets/images/ru.svg';
  }
})();
