# G1–G6: аудит остатка до платного теста

Срез источников: 07.09.2026. Выпуск: 08.09.2026, Europe/Minsk. Независимые роли: PM, Антон, Caster. Статус: **план подготовлен; продукт к платному трафику пока не принят**.

## Главный вывод

Ожидание «G1 и G2 уже полностью закончены» не подтверждается рассмотренной приёмкой. Но значительная реализация есть: продвинутый Chat V2, три полных paid lifecycle, межролевая переписка, media/history/reload и sandbox-пополнение. Это стадия «Реализовано. Тестируем», а не разработка с нуля. Отдельно не приняты уведомления/крайние сценарии, точность денег на одну сессию, компенсации/возвраты и начисления сотрудникам.

Support V2 тоже уже работает на сервере. Проверка 04.09 выявила ошибки границ доступа и клиентской проекции. Исправлять нужно конкретные участки; новое ТЗ поддержки не заменяет retest. Доступ G6.7 и минимальный support G4 — сентябрьская работа рядом с G1/G2, а не финальный шестой месяц.

Ни одна из шести целей этим аудитом не принимается целиком. Отсутствие найденного runtime proof не доказывает отсутствие функции. 95 строк Chat RUN-LOG — исторические попытки, не процент готовности. 30/30 задач в реестре — полнота классификации, не 30/30 выполненных задач.

## Что проверено и что осталось

| Цель | Подтверждённый результат | Остаток до запуска |
| --- | --- | --- |
| G1 | Chat paid lifecycle и много межролевых проверок 25–26.08 | Точная текущая сборка; targeted retest CL-UI-005/006 и CL-RT-001; уведомления, reconnect, advanced controls, terminal persistence |
| G2 | Цена, credits, balance, Pay/Transactions; sandbox +500 | Session → billed seconds → debit/ledger → balance; rounding/bonus/pause/low-balance/duplicates; coupon и cash refund отдельно; actual-agent accruals; production provider proof |
| G3 | Layout audit 07.09: 66 pages/330 rows, 89 exact/241 pending; 52 static preview-ready, 13 dependency/route gaps, 1 integrated route | Current canonical integrated route в этом source audit отвечает 404. Полный public host/data binding и весь путь не приняты. Статические экраны переиспользуются, не проектируются заново |
| G4 | Серверная очередь Support, обращения, история/заметки, consultation/payment, Resolved → Closed | Last-known P0: агент видит Support V2, internal report виден клиенту, неверный адресат клиентского статуса; P1: private card/delivery, адресат эксперта, escalation owner. N0 и отдельный moderator требуют проверки |
| G5 | События, dashboard, KPI и допуск рекламы описаны | Реальный сбор, dedupe, privacy, freshness и воспроизводимость расчётов не приняты. Система должна работать до пилота, иначе пилот нельзя оценить |
| G6 | Назначение тестировалось; принят/доставлен R5 product source школы, локальный Moodle и учебная работа существуют | Disposable-DB build/independent review/full runtime/pilot остаются открыты; production admission и его отзыв, роли, SLA/quality/alerts, смены и поддержка |

Источники: [сверка реализации](implementation-audit-2026-09-07.md), [единый реестр 30 задач](implementation-state-2026-09-07.js), независимые [PM](PM-review-2026-09-07.md), [Антон](ANTON-review-2026-09-07.md), [Caster](CASTER-review-2026-09-07.md). Support QA 04.09 — локальный источник `web/qa-reports/support-3-role-rerun-2026-09-04/index.md`; публичная обезличенная сводка дефектов включена в review Антона. Подробные локальные source refs находятся в reviews; source-only и runtime evidence разделены. Сырые QA logs и тестовые идентификаторы не добавляются в публичный payload.

### Свежий публичный readback

Публичные HTTP-страницы прочитаны 07.09 UTC; авторизованные роли, формы и оплаты не запускались:

- [Главная](https://confideline.com/) всё ещё позиционируется как YouDate/dating. Это текущий public binding gap, не отрицание готовности закрытого чата.
- Связанная [How it works](https://confideline.com/en/page/how-it-works) возвращает 404.
- [Terms and Conditions](https://confideline.com/en/page/terms-and-conditions) описывают dating/subscription и содержат противоречащие друг другу age statements 18/21. Это наблюдение содержания, не юридическое заключение: редакцию для согласованного рынка утверждает ответственный legal/owner.
- [Contact Support](https://confideline.com/en/support/contact) доступен. Наличие страницы не доказывает доставку обращения или SLA.

Не нужно снова исправлять закрытый emoji transport CL-UI-003. CL-UI-006 относится к queue preview. Reconnect без фактического disconnect и low-balance без fixture — непроверенные сценарии, не подтверждённые баги. Last-known defects могут быть уже исправлены разработчиком; закрытие требует current-build retest.

## Сначала синхронизировать ТЗ, а не расширять их количество

**До 18.09 — один согласованный execution baseline**, PM + Игорь + независимый QA:

1. Поздние owner answers G2/G3 от 18.08 и master-bank 07.09: посекундный расчёт, consent отдельно от operator Start, coupon minutes отдельно от денежного refund. Старые started-minute/автоматический paid в G3.5, G4.3, G5.1 и части G6/owner-decisions не являются действующей нормой только потому, что файл называется ТЗ.
2. Создать delta-map «решение → потребитель → правка → проверка»: Codex/Игорь ТЗ, consent/тексты и чек, events/KPI, support resolution, обучение, QA fixtures и billing oracle. Сохранить старые документы как историю; обновить активные потребители и ссылки. Этот аудит задаёт работу; массовое изменение ТЗ и продуктового кода им не выполняется.
3. В денежном oracle назвать session id, фактического агента, price/policy version, секунды, timestamps, rounding и ledger ids. Сверить bonus → paid, pause без списания, stop/low balance, duplicate/out-of-order, late top-up и reconnect. Спорные grace/округления разрешать по точному позднему owner источнику, а не переносом старой формулы.
4. Не переоткрывать принятые O1/O2/O3: 60 секунд paid accept/first response, 15 минут support в рабочих часах; 80/100 с critical override; 30-дневное KPI-окно, 20 completed paid и 5 QA-reviewed на агента для будущего влияния, **KPI→rotation disabled** в пилоте. Точные timers/admin versions проверяются в runtime.
5. O4 (начальная commission/eligible base и ещё не утверждённые численные settings) и O5 (численные traffic limits после baseline) остаются решениями. O14 weekly/manual settlement и correction/audit уже приняты и не переоткрываются. Auto-refill, fixed-SLA-pay, task-pay и включение KPI-driven rotation без нового разрешения — post-MVP, не основание задерживать обязательный pilot scope.

## Дополнения к G4–G6

В [машинном приложении аудита](launch-audit-2026-09-07.js) и вкладке «План до января» добавлены acceptance-пакеты для **всех 15 существующих задач G4–G6**. Владельцы и даты берутся из [единственного календаря](traffic-readiness-plan-2026-09-07.js), а не копируются вторым независимым расписанием.

Наиболее важные изменения относительно прежнего плана:

- **G4.1/G6.7:** положительная и отрицательная server-side матрица client/agent/support-moder/super-admin. Агент вообще не получает Support V2; скрыть меню или отфильтровать очередь недостаточно. Доступ к своей переписке в Chat V2 сохраняется.
- **G4.2/G4.4:** отдельно N0 internal-only и N1 явный client channel; private Moderator → Agent card → reply → Moderator readback. Неверный адресат статуса не должен требовать действия клиента. Эскалация имеет одного ответственного и историю.
- **G4.2/G2.3/G2.4:** один полный incident → decision → coupon либо exceptional cash result → client notification → accrual adjustment; отдельно retry, отказ и partial failure. Тикет не показывается успешно решённым по наличию кнопки или неисполненному финансовому решению.
- **G4.3/G3:** версия правил и существенные условия согласованы с услугой/объявлением и доступны до consent на launch-языках; опубликованные ссылки, age/brand/refund/privacy/retention и merchant согласованы.
- **G5.1–G5.3:** словарь и приборы в сентябре/октябре, а не после пилота. Events/ledger и dashboard сверяются; staff/test/sandbox отделены, no-data/stale видимы, тексты консультаций в marketing analytics не уходят. KPI не включает автоматическую ротацию.
- **G6.1/G6.2/G6.5:** реальный автор, один active paid на агента и race-test start; deadlines, смена, владелец, acknowledgement и резервный дежурный. Уведомление считается работающим после подтверждённой доставки и действия.
- **G6.3/G6.4:** критичный провал действительно снимает paid admission; возврат требует correction/training/retest/trial/review. Принятый учебный source и local Moodle не заменяют этот server gate.
- **G5.4:** одна подписанная карточка ограниченного теста, реальные caps, остановка новых paid starts/привлечения при инциденте и безопасное завершение уже начатого. Масштабирование — отдельное решение по данным.

Связи между задачами — общие контракты, не требование ждать последовательного завершения циклических пар G4/G6. В сентябре согласуются DTO/events/роль-модель и fixtures, после этого consumers реализуются параллельно. PM не бронирует одного backend-владельца как несколько независимых команд.

## Сентябрь–декабрь: путь к ограниченному тесту в январе

| Период | Что должно быть получено | Контроль |
| --- | --- | --- |
| До 11.09 | Owner/capacity, effort остатка по 30 задачам, launch domain/brand/markets/locales/URLs, merchant/legal route и текущая сборка | Имена и net capacity, не только названия ролей; численно проверить загрузку Игоря и резерв |
| Сентябрь | Money/source baseline, targeted G1/G2 regression, G4/G6 P0 fix + retest; параллельно G3 binding, G5 dictionary, набор/школа | 18.09 baseline и early ACL readback; 30.09 стабильное ядро/доступ |
| Октябрь | Интегрированный путь, refunds/accruals, документы, events/dashboard/SLA/quality/alerts, 3–5 допущенных участников | 30.10 pilot-entry gate на одном контуре. Техническая проверка каталога на fixture 16.10 не заменяет реальный состав |
| Ноябрь | Закрытый пилот 02–27.11 без рекламы, работа Support/SLA/quality и независимая сверка денег/метрик | Не менее 14 последовательных дней после блокирующего исправления; 30.11 freeze/RC |
| Декабрь | Regression, безопасность/нагрузка, backup restore/rollback/incident drill, provider/legal proof и готовая traffic card | 18.12 evidence pack; 21.12 GO/NO-GO; 22–31.12 резерв и staffed retest |

Плановый контрольный объём пилота ≥20 завершённых консультаций, из них ≥10 paid, не заменяет принятое O3-условие 20 paid + 5 QA **на агента** и не доказывает рыночную конверсию. Считать sandbox service_session и реальные provider-платежи отдельно. Нужен отдельно разрешённый checkout/refund на launch merchant; данный аудит транзакции не выполняет.

Обязательные G3 launch surfaces проверяются на 1200/992/768/576/320: реальные Figma/source bindings, price/online freshness, busy/no-result/error, auth и consent, paid/pause/reconnect, history/support. Проверяются mobile keyboard, focus/ошибки, доступность текста и CTA, отсутствие переполнения, back/reload. Performance targets и concurrency cap утверждаются после baseline; CSS/DOM проверки сами по себе не являются visual или WCAG acceptance. Подробнее — Caster review.

**Прогноз января условный, не обещание.** Без effort/capacity 11.09 он не подтверждён. Нет стабильного ядра 30.09 или полного пути 30.10 — PM в два рабочих дня пересчитывает ресурс/срок либо согласованную широту запуска. Обязательные money/privacy/security gates не вырезаются. Декабрь — стабилизация и резерв, не первый месяц основной разработки.

## Решение о трафике и proof contract

Сохраняются восемь gates январского плана: продуктовый путь; точность денег; Support/privacy/роли; обученная команда/смены; закрытый пилот; измеримость; эксплуатация/восстановление; коммерческие условия и разрешённый бюджет. Нет любого обязательного proof — **NO-GO**. Нет абсолютной гарантии отсутствия ошибок; речь об ограниченном управляемом эксперименте с наблюдением и остановкой.

Каждая приёмочная запись содержит build/commit, config/policy/provider mode, G-id/case, fixture и роли, ожидаемое/фактическое, дату, evidence, независимого reviewer, verdict и retest по изменённому. Плановая дата не повышает статус. Принятые static bundles, developer source, local stage, sandbox и production проверяются в разных колонках.

Изменение billing/consent, RBAC/privacy, критичного lifecycle/delivery, схемы/инфраструктуры или P0/P1 fix перезапускает 14-дневное окно на развёрнутом кандидате. Последний такой fix для GO 21.12 — 07.12; для готовности 31.12 — 17.12 при staffed праздниках. Fix 18.12 уводит окно до 01.01. Неблокирующий текст/визуал освобождается от рестарта только по документированному QA/PM impact review с scoped retest.

Технический cap, staffed slots и support capacity ограничивают трафик по минимальному значению. Money mismatch/double charge, privacy/access incident, confirmed critical safety, потеря управления paid lifecycle, отсутствие смены/поддержки — остановить привлечение и новые платные старты; safety запрещает и новый оплачиваемый интервал в текущей сессии. Действующие обязательства обслужить безопасно по incident-протоколу. Возобновление после причины, исправления, retest и решения владельцев. Ни рекламный бюджет, ни найм, ни новый автоматический монитор этим планом не запускаются.

## Граница выполненной работы

Этот проход обновляет мастер-план и его evidence-оценку. Продуктовый код/ТЗ массово не переписывались, серверные роли не менялись, реальные платежи/реклама не выполнялись. Нового authenticated E2E и визуальной приёмки нет; прежний неопределённый browser outcome не обходился. Public HTTP observation относится только к перечисленным страницам.

Ранние publication receipts и отчёты 07.09 сохранены как история. Публикация проверяется отдельно: commit ↔ изолированный publication payload ↔ публичные HTTPS hashes, результат сохраняется в локальном `launch-audit-publication-proof-2026-09-08.json`. До успешного receipt публикация не считается подтверждённой. Редакционный репозиторий содержит посторонние незавершённые изменения; они не входят в публикацию этого аудита.
