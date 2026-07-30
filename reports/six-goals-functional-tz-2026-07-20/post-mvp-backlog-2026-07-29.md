# Confideline / Nebula — отдельный backlog после MVP

Дата фиксации: 2026-07-29  
Статус: `outside_six_goals / outside_30_tasks / not_in_mvp_deadline`

## Правило

Шесть глобальных целей содержат ровно 30 обязательных задач шестимесячной программы запуска MVP. Каждая из них имеет приоритет `P0`.

Этот backlog:

- не является седьмой целью;
- не входит в 30 канонических задач;
- не влияет на проценты готовности целей или ТЗ;
- не входит в текущий шестимесячный MVP-дедлайн;
- не использует `P1/P2` как скрытую очередь внутри шести целей;
- возвращается в активный план только отдельным решением Product Owner с новой оценкой зависимости, трудоёмкости и риска.

Если часть большой задачи нужна для безопасного запуска, её минимальный рабочий срез остаётся `P0`. В этот список выносится только расширение сверх MVP.

## Отложенные расширения

| ID | Связанная область | Что выполняется после MVP | Что остаётся P0 в MVP | Условие возврата в план |
|---|---|---|---|---|
| PM-01 | G2.1 | Auto-refill, подписка и автоматическое повторное списание | Ручное пополнение credits из разрешённых клиентских точек | Утверждены consent, retry, provider и refund contracts |
| PM-02 | G2.4 | Fixed pay, SLA-pay, оплата дополнительных заданий и автоматизация внешней выплаты | Session ledger, consultation accrual, refund correction, ручная сверка и ручная выплата | Утверждены economics, payroll/legal границы и pilot evidence |
| PM-03 | G2.3/G4.2 | Автоматическое принятие решения о возврате | Ручное решение super-admin, exactly-once возврат и reconciliation | Накоплена выборка решений и утверждены безопасные policy rules |
| PM-04 | G3.4 | Продвинутый AI/predictive matching и глубокая персонализация | Прямой выбор, необязательный короткий подбор и надёжный переход к request/consultation | Есть baseline конверсии, качества и privacy review |
| PM-05 | G3.6 | Автоматический пересчёт полноты анкеты и сложные quality signals | Taxonomy, обязательные поля, ручной completeness input и fail-closed blocker | Доказана стабильность ручной модели и источников данных |
| PM-06 | G3.7/G5.3 | Автоматическое влияние KPI на выдачу, predictive scoring и коммерческие стимулы | Eligibility, ручной порядок, прозрачный KPI readback; KPI influence выключен | Пройден pilot review и принято отдельное owner-решение |
| PM-07 | G4.4/G6.5 | Некритические дайджесты, browser push и дополнительные delivery channels | Критические in-app/email staff/support alerts, owner, дедупликация и escalation | Подтверждены deliverability, quiet-hours и channel ownership |
| PM-08 | G5.2/G5.3 | Full BI, сложные когорты, экспорты, predictive analytics и расширенная атрибуция | Минимальный operational dashboard и KPI-таблица для ручного решения о пилоте | Core events и reconciliation устойчивы на реальном трафике |
| PM-09 | G1.3 | Скачивание и экспорт transcript | Чтение истории консультации в кабинете и административный audit | Завершён legal/privacy review формата и сроков хранения |
| PM-10 | G1/G3 | Платная очередь и асинхронная платная консультация | Бесплатные диалоги, один active/pending request и одна active paid/pause session | Утверждены SLA, pricing, assignment и refund semantics |
| PM-11 | G6.4 | Расширенная автоматизация re-admission, повторного обучения и coaching workflow | Версионированный admission minimum, critical fail и ручной re-admission gate | Минимальный gate доказан на pilot cohort |
| PM-12 | G6 | Полноценный self-service кабинет Эксперта вне текущей модели Agent-operated profiles | Изолированный staff/admin workspace и назначение анкет Агентам | Владелец меняет операционную модель ролей |
| PM-13 | G3/G5 | Массовая SEO-экспансия, генерация country/city/money pages и контентное масштабирование | Technical SEO выпускаемых MVP-страниц и существующие обязательные маршруты | Закрыт public traffic gate и определён content QA capacity |
| PM-14 | i18n | Дополнительные языки вне утверждённого MVP rollout и масштабирование localization workflow | P0 G3.INT.I18N: RU/EN source pair, translation keys и 100% coverage/readback каждой локали, фактически допущенной к MVP Nebula rollout | Утверждены новые рынки вне MVP, редакторы и локализационный QA capacity |
| PM-15 | Privacy | Полный self-service privacy portal: экспорт, удаление и управление расширенными согласиями | Обязательные policy/consent, staff-процедуры и минимальные privacy controls | Завершены legal review и data inventory |

## Границы P0-срезов, которые нельзя потерять

- G2.4 остаётся P0 из-за расчёта consultation accrual и pilot settlement; отложены только дополнительные модели оплаты и automation.
- G3.4 остаётся P0 из-за гарантированного пути выбора и старта; продвинутый matching не блокирует прямой путь.
- G4.4 и G6.5 остаются P0 из-за критических support, SLA, quality и safety alerts; отложены только некритические каналы и дайджесты.
- G5.2 и G5.3 остаются P0 в минимальном operational объёме, без которого запуск будет неуправляемым.
- G3.6/G3.7 остаются P0 как ручной taxonomy, eligibility и ordering contour; автоматическое KPI-влияние выключено.
- G6.4 остаётся P0 как admission/safety prerequisite до допуска к платной консультации.

## Как вернуть элемент после MVP

Для возврата требуется отдельная запись владельца:

1. продуктовая цель и ожидаемый эффект;
2. причина, почему расширение стало актуальным;
3. зависимости и влияние на существующие G1–G6 contracts;
4. изменяемые параметры и место управления в админ-панели;
5. PM-ТЗ и контекст для Codex;
6. positive, negative, retry, ACL и финансовые acceptance cases;
7. owner, срок и новый release gate.

Наличие макета, кода или настройки само по себе не возвращает элемент в активный план.
