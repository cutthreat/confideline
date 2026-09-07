window.sixGoalsTrafficPlan = {
  asOf:"2026-09-07", target:"2027-01", readinessDecision:"2026-12-21", reserveEnds:"2026-12-31",
  featureFreeze:"2026-11-30", capacityConfirmationDue:"2026-09-11", status:"at_risk_conditional_plan",
  datesAreCommitments:false, launchAuthorized:false,
  pilotEntryGate:"2026-10-30",
  pilotWindow:{start:"2026-11-02",plannedEnd:"2026-11-27",minimumConsecutiveDays:14,lastBlockingFixForDecision:"2026-12-07",lastBlockingFixForYearEnd:"2026-12-17",lineage:["commit/build","config","data schema","policy","provider mode"],restartOn:["P0/P1 fix","billing/consent change","RBAC/privacy change","critical lifecycle/delivery change","critical schema/infrastructure change"],nonRestartRequires:"documented QA/PM impact review and scoped retest"},
  capacityGate:{due:"2026-09-11",confirmed:false,igorTaskRows:24,required:["remaining effort per task","net capacity per owner/week","support and retest allocation","backend dependency sequence","protected reserve","named reallocation or revised forecast on overload"]},
  externalMilestones:[
    ["2026-09-11","Назначить accountable provider/finance/legal владельцев и сроки решений","PM; имена пока не подтверждены"],
    ["2026-09-18","Provider market/service fit, onboarding requirements и срок ответа","Provider/finance owner — не назначен"],
    ["2026-09-30","Onboarding status/блокеры и legal draft","Finance/legal owners — не назначены"],
    ["2026-10-16","Merchant readiness для launch contour","Provider/finance owner — не назначен"],
    ["2026-10-23","Отдельно разрешённый provider checkout/refund proof и утверждённая policy","Finance/legal owners + Алексей по owner decisions"],
    ["2026-10-30","Integration readback; sandbox не заменяет production provider proof","Игорь + QA/finance"]
  ],
  documentHref:"january-traffic-readiness-plan-2026-09-07.md",
  months:[
    {month:"Сентябрь", gate:"2026-09-30", result:"Стабильное ядро и критичный доступ", work:"G1/G2: деньги и lifecycle; G4/G6: P0 доступа и приватности. Параллельно G3 binding, G5 events и набор/школа.", acceptance:"Текущая сборка и точный денежный readback; P0 access retest; подтверждённые владельцы, загрузка и оценки остатка."},
    {month:"Октябрь", gate:"2026-10-30", result:"Интегрированный продукт для закрытого пилота", work:"Public → expert → auth → chat → paid → support; события, dashboard, начисления, документы, SEO. Обучение и допуск состава.", acceptance:"Обязательная функциональность работает в одном контуре; 3–5 допущенных участников; нет блокирующих money/privacy/access дефектов."},
    {month:"Ноябрь", gate:"2026-11-30", result:"Пилот, приёмка и freeze", work:"Целевое окно 02–27.11: минимум две последовательные недели после последнего блокирующего fix, сценарии по ролям, SLA/support/quality и метрики.", acceptance:"Пилот пройден, все критичные сценарии доказаны, release candidate зафиксирован. Малый пилот не доказывает рыночную конверсию."},
    {month:"Декабрь", gate:"2026-12-21", result:"Готовность к январскому тесту трафика", work:"01–18.12: release regression, нагрузка, безопасность, восстановление, merchant/legal и traffic limits; 21.12 GO/NO-GO; 22–31.12 резерв.", acceptance:"Ноль P0/P1, закрыты все launch gates, подтверждены бюджетные пределы и дежурства. В январе не достраиваем обязательные функции."}
  ],
  // Task, target implementation/integration date, acceptance date, proposed owner route, proof focus.
  tasks:[
    ["task-g1-session","2026-09-18","2026-09-30","Игорь → QA/PM","Точная session identity, межролевая карточка и ledger связь"],
    ["task-g1-chat","2026-09-25","2026-10-09","Игорь → QA/PM","Advanced controls, сообщения/медиа/history, guards и исправленные defects"],
    ["task-g1-statuses","2026-09-25","2026-09-30","Игорь → QA/PM","Lifecycle, realtime, reload/reconnect, terminal persistence"],
    ["task-g1-chat-notifications","2026-10-09","2026-10-16","Игорь → QA","Delivery/read/unread, offline и отсутствие дублей"],
    ["task-g2-pricing","2026-09-25","2026-09-30","Игорь + finance → QA/PM","Consent, ставка, bonus boundary, баланс и session debit"],
    ["task-g2-timer","2026-09-25","2026-09-30","Игорь → QA/PM","Seconds/rounding oracle, pause, low-balance, duplicate/reconnect"],
    ["task-g2-refund","2026-10-09","2026-10-16","Игорь + support/finance → QA","Купонная компенсация отдельно от refund; причина, права, идемпотентность"],
    ["task-g2-accruals","2026-10-16","2026-10-30","Игорь + finance → QA/PM","Формула начисления, фактический агент, reversal и сверка"],
    ["task-g3-home","2026-10-09","2026-10-16","Frontend + Игорь → QA/Caster/PM","Launch country/city/topic/home routes, реальные данные и i18n"],
    ["task-g3-catalog","2026-10-09","2026-10-16","Frontend + Игорь → QA/PM","Технический eligibility на fixtures; реальная когорта и повторный readback к 30.10"],
    ["task-g3-profile","2026-10-09","2026-10-16","Frontend + Игорь → QA/Anton","Профиль, цена, доверие, отзывы и старт без staff fields"],
    ["task-g3-quiz","2026-10-16","2026-10-23","Frontend + Игорь → QA/PM","Прямой выбор и рекомендации; нет скрытого назначения/start"],
    ["task-g3-qa","2026-10-30","2026-11-27","QA + PM + Caster/Anton","Сквозной путь с деньгами/support, все launch widths/states"],
    ["task-g3-field-weight","2026-09-25","2026-10-09","Superadmin + PM → Игорь по gap","Обязательные поля, таксономия, eligibility/publish gate"],
    ["task-g3-rotation","2026-10-16","2026-10-23","Игорь + PM → QA","Предсказуемая выдача, доступность и ротация без auto-substitution"],
    ["task-g4-support","2026-09-25","2026-10-16","Игорь + support → QA/PM","P0 ACL до 30.09; полный ticket workflow и правильный owner"],
    ["task-g4-complaints","2026-10-09","2026-10-23","Support + Игорь → QA/PM","Internal/client projection, вопросы, appeal и решение → G2"],
    ["task-g4-docs","2026-10-09","2026-10-30","PM + legal/owner → content/QA","Согласованные тексты, контакты, языки, consent и published readback"],
    ["task-g4-support-notifications","2026-10-16","2026-10-30","Игорь + support → QA","Client notifications и внутренние agent cards в Chat V2"],
    ["task-g5-events","2026-10-16","2026-10-30","Data/PM + Игорь → QA","Сентябрьский dictionary; события, identity/dedupe, privacy, readback"],
    ["task-g5-dashboard","2026-10-23","2026-11-13","Data + Игорь → QA/PM","Source → metric → filter, freshness и staff/test exclusion"],
    ["task-g5-kpi","2026-10-30","2026-11-20","Data/PM + operations","Определения/denominators и воспроизводимый расчёт по пилоту"],
    ["task-g5-marketing-gate","2026-12-11","2026-12-21","Marketing + PM → Алексей","Все 8 gates, кампании/лимиты/остановка; budget authorization отдельно"],
    ["task-g6-assignment","2026-09-25","2026-09-30","Игорь + operations → QA","Assigned/foreign negatives и immutable actual-agent authorship"],
    ["task-g6-sla","2026-10-16","2026-11-13","Operations + Игорь → QA","Очередь, дедлайн, просрочка, escalation и дежурный"],
    ["task-g6-quality","2026-10-23","2026-11-27","Quality/operations + PM","Review консультаций, оценка, спор, разбор и результат исправления"],
    ["task-g6-training","2026-10-23","2026-10-30","Школа + Superadmin → QA/PM","Не локальный mock: прохождение, практика, допуск и 3–5 участников"],
    ["task-g6-team-notifications","2026-10-23","2026-11-13","Игорь + operations → QA","Назначение/SLA/quality → адресат → действие без дублей"],
    ["task-g6-admin-url","2026-09-25","2026-10-09","Игорь → QA","Staff entry/прямые маршруты, нет перехода персонала в client path"],
    ["task-g6-isolated-admin-access","2026-09-25","2026-09-30","Игорь → независимый QA","P0: agent deny Support V2; client/agent/support-moder/super-admin matrix"]
  ],
  launchGates:["Продуктовый путь G1/G3","Точность денег G2","Support, privacy и роли G4/G6","Обученная команда и смены","Закрытый пилот","Измеримость G5","Эксплуатация, нагрузка и восстановление","Коммерческие условия и разрешённый traffic budget"]
};

(function () {
  const root = document.getElementById("traffic-readiness-root");
  if (!root) return;
  const plan = window.sixGoalsTrafficPlan;
  const facts = window.sixGoalsImplementation.tasks;
  const date = value => value.slice(8,10) + "." + value.slice(5,7);
  const groups = [1,2,3,4,5,6].map(goal => {
    const rows = plan.tasks.filter(row => facts[row[0]].code.startsWith("G" + goal + "."));
    return `<details class="goal-next"><summary>G${goal}: сроки ${rows.length} задач</summary><div class="goal-next-body"><table class="summary-goal-table"><thead><tr><th>Задача / стадия сейчас</th><th>Результат / приёмка</th><th>Ответственность и proof</th></tr></thead><tbody>${rows.map(row => `<tr><td><a href="task-readiness.html?task=${row[0]}">${facts[row[0]].code} ${facts[row[0]].title}</a><br>${facts[row[0]].stage}</td><td>${date(row[1])} / ${date(row[2])}</td><td>${row[3]}<br>${row[4]}</td></tr>`).join("")}</tbody></table></div></details>`;
  }).join("");
  root.innerHTML = `<div class="section-title"><h2>Сентябрь–декабрь 2026</h2><p>К тестовому трафику в январе 2027. Решение о готовности: 21 декабря. Резерв: 22–31 декабря.</p></div>
    <div class="notice"><b>Прогноз PM: январская цель под риском; достижимость не подтверждена.</b> Даты ниже — целевые; ресурсный расчёт нужен до 11.09. Игорь участвует в 24 из 30 строк — это не 24 параллельных потока. Готовность продукта и бюджетное разрешение ещё не получены. <a href="${plan.documentHref}">Полный план и критерии</a>.</div>
    <table class="summary-goal-table"><thead><tr><th>Месяц</th><th>Результат</th><th>Работа и приёмка</th></tr></thead><tbody>${plan.months.map(month => `<tr><td>${month.month}<br>${date(month.gate)}</td><td>${month.result}</td><td>${month.work}<br><b>На выходе:</b> ${month.acceptance}</td></tr>`).join("")}</tbody></table>
    <p><b>Не переносим в декабрь:</b> основную разработку, первый сбор аналитики, набор экспертов и проверку критичных прав. Июль–август — уже затраченное время, не автоматическая приёмка двух этапов.</p>
    <p><b>Правило 14 дней:</b> последний blocking fix для GO 21.12 — 07.12; для готовности 31.12 — 17.12 при подтверждённых сменах. Fix 18.12 переносит окно до 01.01. Календарный резерв не сокращает наблюдение. Build/config/provider lineage сохраняется.</p>
    <p><b>До пилота, 30.10:</b> технически готовы events/dashboard/SLA/quality/alerts и допущена реальная когорта. Приёмка каталога 16.10 на fixtures не заменяет этот gate; ноябрьские даты метрик — проверка по данным пилота.</p>
    <h3>Внешний коммерческий путь</h3><ul>${plan.externalMilestones.map(row => `<li><b>${date(row[0])}:</b> ${row[1]}. ${row[2]}.</li>`).join("")}</ul>
    <h3>Все 30 задач остаются в плане</h3><p>Результат — дата завершения остатка реализации/интеграции; приёмка — дата проверки. Для уже реализованной функции это срок стабилизации, не разработка с нуля. Роли исполнителей требуют подтверждения capacity; календарь сам не меняет статус на «Принято».</p>${groups}
    <h3>Январский запуск допускается только после восьми проверок</h3><ol>${plan.launchGates.map(gate => `<li>${gate}</li>`).join("")}</ol>
    <p><b>Правило срока:</b> нет свежего ядра/ACL proof к 30.09 или интегрированного пути к 30.10 — январский прогноз RED, PM пересчитывает план в течение двух рабочих дней. Нет полного GO после декабрьского резерва — запуск переносится, критерии не ослабляются.</p>`;
})();
