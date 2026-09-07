/* One factual state for the master plan and task readiness, separate from specifications. */
window.sixGoalsImplementation = {
  reviewedAt: "2026-09-07",
  runtimeEvidenceThrough: "2026-09-04",
  liveRecheck: "pending_internal_browser_recovery",
  reportHref: "implementation-audit-2026-09-07.md",
  evidence: {
    qa: "RUN-LOG.csv, 95 записей за 25–26.08; IGOR-CHAT-V2-FIX-PACKET-20260828.md",
    architecture: "new-chat-architecture.md, архив документации Игоря от 13.08; описание реализации, не новый runtime-тест",
    public: "Public HTTP readback 07.09 UTC: YouDate на root, /en/page/how-it-works 404, Terms dating/subscription; не browser E2E. Layout source audit 07.09: 66 pages/330 rows, 89 exact; 52 static preview-ready, binding не принят",
    support: "support-3-role-rerun-2026-09-04/index.md: серверный Support V2, три стороны, PASS/FAIL/NOT TESTED; не только прототип",
    team: "Назначение и локальный Moodle; Support V2 access retest от 04.09 выявил доступ агента к полной support-очереди"
  },
  runLog: { rows:95, PASS:59, WARN:20, RETEST:10, FAIL:6, unit:"execution_rows_not_unique_tests" },
  features: [
    ["Платная консультация", "Проверено в runtime", "Три цикла offer / accept / start / pause / resume / complete; завершение и межролевой readback", "SES-01, SES-13, SES-16, SES-17; строки 10–18, 22, 31, 39, 92–94"],
    ["Переписка по ролям", "Проверено в runtime", "Клиент и оператор, текст, переносы строк, сохранение после reload, duplicate-send guard", "AUTH-01–04, TXT-01/02, NET-01, MSG-04"],
    ["Unicode и редактор", "Проверено частично", "Emoji transport PASS, picker и whitespace guard; отдельный дефект Unicode в превью очереди", "TXT-08-TRANSPORT, UX-EMOJI-01/02, TXT-17; CL-UI-006"],
    ["Вложения", "Проверено частично", "MP3/PDF/DOCX и ответы с вложением; active-paid forged MIME и oversize отклонены без ghost message", "ATT-07/08/12, MSG-REPLY-ATTACH-01/02, ATT-ACTIVE-FORGED-01, ATT-ACTIVE-OVERSIZE-01"],
    ["История и поиск", "Проверено частично", "Диапазон дат, Show all, Load older и поиск; очистка поиска остаётся открытым дефектом последнего прогона", "MSG-HIST-01, HIST-OLDER-01, ADM-HIST-RANGE-01; CL-UI-005"],
    ["Рабочее место оператора", "Проверено частично", "Очередь, вкладки и фильтры; Partner edit/save/reload; контекст клиента и privacy readback", "ADM-QUEUE-01–04, CTX-PARTNER-01, ADM-CONTEXT-01, ADM-PRIVACY-01"],
    ["Цена и платёжный контекст", "Проверено частично", "Credits, balance, Transactions и Pay panel; агрегаты не доказывают точный debit отдельной сессии", "FIN-READBACK-01/02, SES-BILL-ORACLE-02"],
    ["Пополнение кошелька", "Sandbox подтверждён", "Баланс 190 → 690 и строка Transactions +500 в описательном readback; не production checkout и не low-balance test", "FIN-SANDBOX-TOPUP-01, строка 95"],
    ["Realtime и восстановление", "Проверено частично", "Reload/refresh подтверждены; клиентский Resume/Complete stale в последнем прогоне; фактический disconnect/reconnect не воспроизведён", "NET-REFRESH-01, RT-LIFECYCLE-PUSH-01; CL-RT-001, NET-RECONNECT-01 RETEST_ENV"],
    ["Расширения Chat V2", "Описаны разработчиком", "Atomic gallery 1–5 + caption, voice recording, operator favorite/pin, Report, soft-hide, typing, heartbeat и BadgeResolver", "new-chat-architecture.md; для этих возможностей нужен отдельный функциональный readback, наличие описания не равно PASS"]
  ],
  tasks: {
    "task-g1-session": { code:"G1.1", title:"Карточка консультации", stage:"Реализовано. Тестируем", basis:"qa", done:"Платная service_session и три полных lifecycle уже существуют и прошли межролевую проверку. Это не будущая сущность.", next:"Зафиксировать текущую build/config и session id, сверить связь с ledger; повторить release edges." },
    "task-g1-chat": { code:"G1.2", title:"Чат по ролям", stage:"Реализовано. Тестируем", basis:"qa", done:"Переписка по ролям, медиа, ответы, очередь, контекст клиента, история, reload и guards проверены по отдельным сценариям. Расширения из архитектуры перечислены отдельно от runtime PASS.", next:"Проверить оставшиеся advanced controls; подтвердить исправления CL-UI-005/006 и ACL на текущей сборке." },
    "task-g1-statuses": { code:"G1.3", title:"Статусы и история", stage:"Реализовано. Тестируем", basis:"qa", done:"Start/pause/resume/complete, terminal state и история проверены. CL-RT-001 относится к проекции lifecycle у клиента, а не к отсутствию state machine.", next:"Повторить client Resume/Complete realtime, reconnect и terminal persistence на текущей сборке." },
    "task-g1-chat-notifications": { code:"G1.4", title:"Уведомления консультации", stage:"Частичная доставка; приёмка открыта", basis:"qa", done:"Есть сообщения/очередь/unread readback и описанный realtime. Полная матрица адресатов, событий и доставки не принята.", next:"Проверить delivery/read/unread по ролям, подавление дублей, offline и пропущенные события." },
    "task-g2-pricing": { code:"G2.1", title:"Цена, credits и баланс", stage:"Реализовано. Тестируем", basis:"qa", done:"Цена, credits, balance, Transactions и Pay panel доступны; sandbox +500 подтверждён строкой 95. Общая приёмка денег этим не закрыта.", next:"Сверить цену и списание по конкретной session, версии ставки и billed seconds; отдельно production checkout." },
    "task-g2-timer": { code:"G2.2", title:"Таймер и остановка", stage:"Реализовано. Тестируем", basis:"qa", done:"Paid lifecycle и управление временем работают. Нулевой видимый delta короткого интервала не доказывает ошибку биллинга без ожидаемого расчёта.", next:"Billing oracle: timestamps, billed seconds, debit, rounding; отдельно low-balance/hard-stop и disconnect fixture." },
    "task-g2-refund": { code:"G2.3", title:"Возвраты", stage:"Контур описан; денежная приёмка открыта", basis:"architecture", done:"Ledger/refund-контур зафиксирован в реализации и handoff. В 95 строках нет достаточного доказательства конкретного возврата и его идемпотентности.", next:"Сверить session → debit → refund с причиной, правами, повтором и audit trail." },
    "task-g2-accruals": { code:"G2.4", title:"Начисления / ЗП сотрудников", stage:"Требования; факт выплат не подтверждён", basis:"architecture", done:"Отдельный пакет начислений сотрудникам существует; Pay panel клиента не является доказательством начисления агенту.", next:"Зафиксировать формулу, получателя, basis, округление, reversal и сверить один расчёт." },
    "task-g3-home": { code:"G3.1", title:"Витрина", stage:"Дизайн подготовлен; binding не принят", basis:"public", done:"Есть Oracle/Nebula source и integration package; layout audit 07.09: 52 static preview-ready. Public HTTP readback 07.09 UTC всё ещё показывает YouDate; это не 52 работающих страницы продукта.", next:"Принять launch host/data binding, актуальность содержания/цены и полный клиентский путь на текущей сборке." },
    "task-g3-catalog": { code:"G3.2", title:"Каталог", stage:"Дизайн/контракт; runtime не принят", basis:"public", done:"Каталог входит в integration package; полный runtime readback expert-only query не предъявлен.", next:"Проверить список, фильтры, экспертный состав, пагинацию и переход в профиль." },
    "task-g3-profile": { code:"G3.3", title:"Карточка эксперта", stage:"Макет/пакет; public profile не принят", basis:"public", done:"Подготовлен профиль эксперта. Partner panel внутри работающего чата не заменяет public expert profile.", next:"Связать профиль, отзывы, цену и оба пути начала консультации." },
    "task-g3-quiz": { code:"G3.4", title:"Подбор и старт", stage:"Контракт; подбор не проверен", basis:"public", done:"Сценарий подбора и старта описан; отдельного исполнения с реальными результатами нет в рассмотренном QA-реестре.", next:"Пройти ответы → подбор → эксперт → start и ветку пустого результата." },
    "task-g3-qa": { code:"G3.5", title:"Проверка клиентского пути", stage:"Chat E2E есть; полный путь открыт", basis:"qa", done:"95 записей относятся к chat QA, а не к полному покрытию G3 или каталогу из 121 запланированного теста.", next:"Принять public → expert → paid → history → support/refund по одной версии сборки." },
    "task-g3-field-weight": { code:"G3.6", title:"Полнота и таксономия анкеты", stage:"Операционный пакет; внедрение не проверено", basis:"public", done:"Полнота и таксономия анкеты определены в документах; runtime-критерии отдельно не подтверждены.", next:"Проверить обязательность полей, тематическую таксономию и публикационный gate." },
    "task-g3-rotation": { code:"G3.7", title:"Выдача и ротация анкет", stage:"Требования; алгоритм не принят", basis:"public", done:"Есть пакет выдачи и ротации; работа admin chat queue не доказывает ротацию публичных экспертных анкет.", next:"Сверить выдачу, fairness и изменение позиции на воспроизводимом наборе анкет." },
    "task-g4-support": { code:"G4.1", title:"Поддержка", stage:"Реализовано. Тестируем", basis:"support", done:"Live Support V2 проверен 04.09: рабочая очередь супер-админа, клиентские обращения, история, заметки, вопросы, escalation, связь с consultation/payment; Resolved → Closed и запрет ответа после Closed. Трёхролевая приёмка FAIL, это не отсутствие backend.", next:"Закрыть P0 ACL агента и утечку внутреннего тикета клиенту; retest статусов/адресации, отдельной роли support-moder и N0 internal-only report." },
    "task-g4-complaints": { code:"G4.2", title:"Жалобы и возвраты", stage:"Частично реализовано. Тестируем", basis:"support", done:"Внутренний репорт и клиентское обращение существуют на сервере, контекст consultation/payment сохранён. Есть дефекты клиентской проекции, адресата эксперта и передачи владельца при эскалации. Возвраты не выполнялись.", next:"Разделить internal/client projection, исправить ownership/адресата; денежный refund принять отдельно без автоматического повышения по наличию тикета." },
    "task-g4-docs": { code:"G4.3", title:"Документы", stage:"Документы подготовлены; публикация не сверена", basis:"support", done:"Policy/content пакет есть; актуальность опубликованных правил и согласий требует readback.", next:"Сверить утверждённые редакции, ссылки, языки и точки согласия." },
    "task-g4-support-notifications": { code:"G4.4", title:"Уведомления поддержки", stage:"Частично реализовано. Тестируем", basis:"support", done:"Клиентские уведомления отмечены как работающие в live QA 04.09. Адресованный Kristy внутренний вопрос не появляется в Chat V2; SMTP/IMAP и guest цепочка не проверялись.", next:"Исправить agent question card/delivery в Chat V2; проверить адресатов, private projection, retry и дубли." },
    "task-g5-events": { code:"G5.1", title:"События воронки", stage:"Схема событий; runtime proof открыт", basis:"public", done:"Пакет событий воронки собран. Chat lifecycle сам по себе не доказывает поступление аналитических событий.", next:"Event dictionary и readback для одного сквозного пилотного пути." },
    "task-g5-dashboard": { code:"G5.2", title:"Дашборд", stage:"План; данные не сверены", basis:"public", done:"Есть требования dashboard; актуальный источник, freshness и точность цифр не приняты.", next:"Сверить показатели с первичными событиями/транзакциями." },
    "task-g5-kpi": { code:"G5.3", title:"Таблица показателей", stage:"Методика; расчёт не принят", basis:"public", done:"Показатели и требования подготовлены; контрольный runtime-расчёт не предъявлен.", next:"Утвердить denominator, периоды и контрольные значения KPI." },
    "task-g5-marketing-gate": { code:"G5.4", title:"Допуск рекламы", stage:"Запуск не принят", basis:"public", done:"SEO и marketing gate оформлены отдельными пакетами. Это не факт настройки аналитики или допуска рекламы.", next:"Проверить public path, качество, поддержку, деньги и telemetry перед решением GO." },
    "task-g6-assignment": { code:"G6.1", title:"Назначение", stage:"Реализовано. Тестируем", basis:"team", done:"Назначение тестовой анкеты проверено. В сохранённом прогоне агент открывал чужой профиль и страницу назначений.", next:"Сейчас, не в месяце 6: assigned PASS, foreign profile/dialog/send DENY; подтвердить исправление старого P0." },
    "task-g6-sla": { code:"G6.2", title:"Сроки реакции", stage:"Правила; server SLA не принят", basis:"team", done:"Сроки реакции описаны; SLA-элемент прототипа не доказывает исполнение серверных правил.", next:"Проверить дедлайн, просрочку, эскалацию и назначенного адресата." },
    "task-g6-quality": { code:"G6.3", title:"Контроль качества", stage:"Scorecard; рабочая оценка не принята", basis:"team", done:"QA-методика и критерии существуют; приёмка регулярного review процесса не предъявлена.", next:"Пройти выборку консультаций, оценку, спор и контроль результата." },
    "task-g6-training": { code:"G6.4", title:"Обучение и регламенты", stage:"Локальный Moodle stage", basis:"team", done:"R5 product source принят и доставлен; есть локальный Moodle и учебный корпус. Disposable-DB build, independent review, full runtime/pilot и production admission отдельно открыты.", next:"Принять build/роли/практику, server deny paid до admission и его отзыв/re-admission; подготовить 3–5 допущенных участников и смены." },
    "task-g6-team-notifications": { code:"G6.5", title:"Командные уведомления", stage:"Требования; доставка не проверена", basis:"team", done:"Командные события описаны; проверенного контура фактической доставки нет в рассмотренном пакете.", next:"Сверить события назначения/SLA/качества, адресатов и отсутствие дублей." },
    "task-g6-admin-url": { code:"G6.6", title:"Админка на отдельном URL", stage:"Admin surface есть; изоляция не принята", basis:"team", done:"Admin chat реально использовался в QA. Наличие /admin URL не доказывает отдельный staff-only вход и отсутствие клиентского фронта.", next:"Проверить штатный вход, прямые маршруты и запрет перехода персонала на клиентский контур." },
    "task-g6-isolated-admin-access": { code:"G6.7", title:"Изолированный доступ в админку", stage:"Реализовано частично. Есть P0", basis:"team", done:"Live 04.09: клиенту закрыт admin Support (403), изоляция двух клиентов PASS. Но Chat V2 агент открывает полную support-очередь/внутренние инструменты, что даёт P0. На 07.09 исправление ещё не перепроверено.", next:"Запретить агенту Support V2 server-side, оставив безопасный Report и внутренние вопросы в Chat V2; отдельно проверить support-moder против super-admin." }
  }
};

/* Current grouping, approved 08.09. Stable task IDs and historical source codes stay intact. */
(function (state) {
  const goals = [
    {code:"G1", title:"Глобальный чат", tasks:["task-g1-session","task-g1-chat","task-g1-statuses","task-g1-chat-notifications"]},
    {code:"G2", title:"Деньги, жалобы и уведомления", tasks:["task-g2-pricing","task-g2-timer","task-g4-complaints","task-g2-accruals","task-g4-support-notifications"]},
    {code:"G3", title:"Вёрстка и обучающий контур экспертов / агентов", tasks:["task-g3-home","task-g3-catalog","task-g3-profile","task-g3-quiz","task-g3-qa","task-g3-field-weight","task-g3-rotation","task-g6-training"]},
    {code:"G4", title:"Поддержка, возвраты и документы", tasks:["task-g4-support","task-g2-refund","task-g4-docs"]},
    {code:"G5", title:"Маркетинг, аналитика и дашборды", tasks:["task-g5-events","task-g5-dashboard","task-g5-kpi","task-g5-marketing-gate"]},
    {code:"G6", title:"Рабочий контур команды", tasks:["task-g6-assignment","task-g6-sla","task-g6-quality","task-g6-team-notifications","task-g6-admin-url","task-g6-isolated-admin-access"]}
  ];
  const codeAliases = {};
  goals.forEach(goal => goal.tasks.forEach((id, index) => {
    const task = state.tasks[id];
    task.sourceCode = task.code;
    task.code = goal.code + "." + (index + 1);
    task.goalCode = goal.code;
    codeAliases[task.sourceCode] = task.code;
  }));
  state.grouping = {
    updatedAt:"2026-09-08", goals, codeAliases,
    applyMetadata(tasks) {
      Object.entries(tasks).forEach(([id, task]) => {
        const fact = state.tasks[id];
        if (!fact) return;
        task.code = fact.code;
        task.sourceCode = fact.sourceCode;
        task.goal = "Цель " + fact.goalCode.slice(1);
        task.goalCode = fact.goalCode;
      });
    },
    sourceNote(id) {
      const task = state.tasks[id];
      return task && task.code !== task.sourceCode
        ? `Текущий код: ${task.code}. В источниках до перегруппировки 08.09: ${task.sourceCode}. Ссылка и история задачи сохранены.`
        : "";
    }
  };
})(window.sixGoalsImplementation);
