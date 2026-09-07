# Confideline: семь слоёв готовности к январскому платному тесту

Дата: 08.09.2026. Дополнение к единому [плану сентября–декабря](january-traffic-readiness-plan-2026-09-07.md) и [аудиту G1–G6](launch-audit-2026-09-07.md). Все 30 канонических задач сохранены. Семь слоёв и M1–M7 ниже — поперечная декомпозиция их результатов, а не новые G-цели.

**Вердикт:** source review и расширенный план подготовлены; общий запуск, аккаунты, публикации и рекламный бюджет этим документом не разрешаются. Реализация уже работающих частей сохраняет статус «Реализовано. Тестируем». Новый live product/account/runtime тест в этом проходе не выполнялся. Даты — целевые, до подтверждения capacity 11.09 не являются обязательствами исполнителей.

## Что меняется в плане

Техническая готовность сайта, готовность ограниченных рабочих ролей, учебный процесс и возможность привлечь/обслужить аудиторию принимаются раздельно. Маркетинг и каналы не ждут декабря: в сентябре нужны strategy, identity/rights, ownership, production probe и безопасный prelaunch путь. Но первая разрешённая публикация не открывает paid-сервис.

| Слой | Последняя подтверждённая опора | Отдельный результат до пилота 30.10 | Финальная приёмка |
|---|---|---|---|
| Backend | Chat/paid 25–26.08; Support 04.09; sandbox payment evidence | Current build/config; seconds/ledger; provider/refund/accruals; ACL; jobs/events; protected settings | Деньги и side effects сверены; negative/retry/recovery; production provider, load/restore |
| Клиентский frontend | Статические пакеты и частичный live chat; public binding не принят | Полный реальный путь от страницы/эксперта до paid/history/Support, request и offer | Одна release-сборка, реальные данные/локали, пять ширин, error/back/reload и понятные условия |
| Рабочее место агента | Chat V2/assignment использовались в QA | Assigned-only, staff entry, один active paid, private Support cards, busy/alerts/reconnect | Сменный workflow, foreign/revoke negatives, feedback/appeal и backup |
| Остальные админки | Частичный Superadmin Support PASS | Moderator, QA, finance, Ops, content/policy и protected activation выполняют свои операции | Role + object scope + action + persist/readback + audit + negative + rollback |
| Школа и допуск | Локальный Moodle и принятый ограниченно R5 source | Learner/reviewer/course-admin/approver cycle, версии, bridge; 3–5 реально допущенных участников | История attempts, практика/смены, revoke/re-admission, актуальные course/policy versions |
| Маркетинг | Продуктовые, SEO и claims-источники; нет принятого текущего social brief/baseline | Audience/market/offer/claim brief; prelaunch funnel; измеримость и первые проверяемые гипотезы | Ad → landing → услуга совпадают; economics/caps/stop подкреплены данными; бюджет отдельно |
| Каналы и контент | Templates есть; фактическая сеть и throughput не сверены | Паспорта, штатное владение, права, preview/QC, публикационный и DM/support процесс; условная первая/вторая волна | Повторяемый выпуск, актуальные policy/access/rights, готовые creatives и дежурные; не просто возраст аккаунтов |

Полные помесячные результаты и связи с G-задачами доступны в разделе «Семь слоёв готовности» [мастер-плана](index.html#calendar-plan). Разборы: [PM — первые пять слоёв и 16 admin workflows](readiness-layers-pm-2026-09-08.md), [Антон — доверие, найм и handoff](readiness-layers-anton-2026-09-08.md), [Caster — стратегия, каналы и производство](readiness-layers-caster-2026-09-08.md).

Уровни evidence не складываются в общий процент: требования → реализация → роль/UI → сквозной runtime → работающий процесс с людьми → приёмка владельца. Для content/channel используются соответствующие preview/publication/readback. Для каждого результата хранить версию/дату/источник, владельца, verifier, verdict, residual и следующий шаг; наличие ТЗ не переводит результат на следующую ступень.

## Ролевые и учебные пробелы, которые нельзя потерять

1. Superadmin workflow не доказывает отдельного support-moder. QA/finance/Ops/content — бизнес-функции, а не автоматически созданные новые RBAC-роли. Защищённые решения остаются у Superadmin до явного делегирования.
2. Настройки принимаются как draft → validation → preview → activation → version/readback → audit → rollback. Одна сохранённая цифра не доказывает версионирование или права активации. Уже существующие редакторы переиспользуются.
3. В Moodle learner, reviewer, course-admin/автор, prepare/approve/audit и integration bridge — отдельные проверки. Plain teacher label не даёт review автоматически; важны фактические capabilities. R5 source и локальный preview не заменяют настоящий DB/install/upgrade/concurrency run.
4. Course pass, решение о допуске и server paid permission — разные события. Проверяются identity mapping, версия, retry/duplicate/stale/offline и отзыв. Старый pass не превращается автоматически в pass новой программы.
5. Assignment revoke закрывает чужие объекты; paid admission revoke запрещает платную работу, но сохраняет допустимые обучение/feedback/appeal. Public Expert и actual Agent не смешиваются.
6. Ноябрьские даты приёмки SLA/dashboard/quality/alerts означают наблюдение по пилоту. Технически и операционно они нужны уже к входу в пилот 30.10.
7. G3.7 отдельно связан с frontend и административной приёмкой: eligibility/publish/availability, preview выдачи по конкретной surface и сохранённая версия настройки. KPI influence на rotation в пилоте выключено; рост социальных подписчиков не меняет это решение.

## Рабочие пакеты подготовки маркетинга и каналов

Все сроки ниже — состав результатов действующего календаря, подлежащий оценке и включению в общую загрузку. Эти пакеты не передаются Игорю целиком: разработка нужна только по доказанному техническому пробелу.

| Пакет / цель | Владелец результата | Что сдаём и чем принимаем | Связь |
|---|---|---|---|
| M1 · 11.09 · inventory/capacity | PM + marketing/channel lead + школа | Реестр уже существующих материалов/аккаунтов, подтверждённые часы editor/producer/reviewer/publisher/DM/backup; остаток школы и найма. Августовская нагрузка Ксении не считается сентябрьским обязательством | G5.4/G6.4 |
| M2 · 18.09 · brief и рынок | Marketing + PM + owner/legal | Приоритетная потребность/аудитория/язык, offer/claims/proof, channel roles, organic/branded/Ads market check и конкретные learning questions; неопределённое — hypothesis, не факт | G4.3/G5.4 |
| M3 · 25.09 · паспорта и проба выпуска | Content/channel owners + Caster/Антон | До 20 целевых expert packages; первая когорта с правами; несколько полных source→preview циклов, включая rework; измеренные часы всех обязательных ролей | G3.3/G3.6/G6.4 |
| M4 · 30.09 · первая prelaunch волна | Channel + publisher/community + PM | До 3 экспертных персон после отдельного разрешения и social gate; working destination/opt-out, monitored DM, обычный и sensitive/денежный handoff, backup. Ничего не выдаётся за доступный paid-сервис | G4.3/G4.4/G6.2 |
| M5 · 30.10 · устойчивость/волна до 8 | Marketing/data + editor/publisher | Измеренный throughput, исправленные очереди QC/ответов, privacy-safe UTM/events и baseline. Отдельно business/ad-account verification и допустимость конкретного формата — через штатный разрешённый workflow | G5.1/G5.2/G5.4 |
| M6 · 30.11 · условная сеть до 20 | Marketing/channel lead + PM | Данные по темам/отклику и нагрузке обосновывают масштабирование; ready packs, verified accounts, published profiles, admitted agents и staffed slots считаются отдельно | G3.3/G5.2/G5.4 |
| M7 · 11.12 · январский launch packet | Marketing + PM + finance/Ops | Approved creatives, landing/price/terms match, eligibility, budget/concurrency/stop, attribution, support roster/backup и rollback. Решение 21.12 и разрешение расходов отдельно | G3.5/G4.3/G5.4 |

Пропуск gate волны не запускает следующие аккаунты автоматически. PM в течение двух рабочих дней пересчитывает scope/cadence и capacity. Не обязательно останавливать разработку сайта из-за неполной сети: для малого paid-пилота важны безопасный продукт и реальная команда, не 20/40 страниц.

## 20 страниц: знаменатели и сценарий мощности

Фраза «20 страниц в Instagram и TikTok» ещё не задаёт точную матрицу. Для расчёта принято **20 экспертных пакетов**; при присутствии каждого на обеих площадках получается **до 40 account slots**. Это не подтверждённая команда создавать 40 аккаунтов. Фактическое число уже существующих аккаунтов не сверено; в [шаблоне реестра](social-channel-register-template-2026-09-08.json) actual counts равны `null`, а не 0.

У каждого пакета: persona/site linkage либо prelaunch draft, тема/язык, owner/представитель, source-backed bio/claims, права на media/voice/music, access/publishing/community roles, destination, policy scope, approved preview и следующее действие. В реестр не попадают пароли, токены, коды восстановления, profile internals, raw private messages или чувствительные данные кандидатов.

Сохраняем принятую модель публичной персоны и внутреннего actual Agent. Не придумываем биографию, стаж, квалификацию, отзывы, гарантии или постоянное личное присутствие. Право использовать identity в продукте не является автоматическим platform approval. 20 персон не равны 20 обученным сотрудникам; агент с несколькими профилями по-прежнему имеет один допустимый active paid slot.

**Пример для оценки, не норма платформ и не обещание выпуска:** два оригинальных коротких материала на экспертный пакет в неделю с адаптациями для двух площадок.

| Активные пакеты | Оригиналы / неделю | Platform-адаптации / неделю |
|---|---:|---:|
| 3 | 6 | 12 |
| 8 | 16 | 32 |
| 20 | 40 | 80 |

За четыре недели на полном сценарии — 160 originals и 320 platform variants/placements. Это арифметика объёма, не уже произведённый контент. Нагрузка каждой роли = измеренное время на source/script/record/edit/domain review + адаптации/subtitles/preview QC + публикацию/DM/analytics + rework + согласованный резерв. Ограничитель — самая загруженная обязательная роль и доступность авторов. Пока замера нет, cadence остаётся proposed. Не назначать эту работу автоматически Ксении или Игорю.

Волны 3 → 8 → 20 условны. Начать можно с одной приоритетной площадки, если вторая не прошла policy/capacity; общее число slots пересчитывается. Масштабирование требует свежих rights/policy, принятого контента, достаточных часов и работающей обработки обращений. «Прогрев» означает полезный оригинальный выпуск и реальный отклик, а не накрутки, спам, фиктивные отзывы, обход блокировок или магическое число дней до допуска Ads.

## Минимальный редакционный backlog первой волны

Это предложения тем и пакетов для последующего утверждения; материалы сейчас не создавались и не публиковались. Ранжирование по выручке/CAC не делалось: принятых продаж/маркетингового baseline для него нет. Сезонность и результаты не выдумываем.

| Пакет | Содержательная задача | Приёмка / разрешённый следующий шаг |
|---|---|---|
| Представление экспертного направления | Метод, темы и границы; почему этот профиль отличается | Source-backed claims/identity; prelaunch status; без выдуманного опыта и клиентов |
| Один полезный вопрос | Разобрать обычную тему с самостоятельным выводом для зрителя | Нет гарантированного предсказания, страха или давления покупать; источник/экспертный review |
| Как сформулировать запрос | Подготовить вопрос к будущей консультации | Не собирать личные истории в комментариях/аналитике; privacy-safe next step |
| Как устроена услуга | Выбор, диалог, consent, отдельный operator Start, остановка и история | Не демонстрировать будущую функцию как текущую; money wording по owner answers 18.08 |
| Безопасность и ожидания | Что консультация может/не может обещать, куда идти со сложным вопросом | Approved safety/legal boundaries; без псевдопрофессиональной медицинской/юридической/финансовой помощи |
| Подготовка школы | Обучение, практика и контроль качества | Реальная стадия и согласованные assets; не утверждать несуществующую сертификацию/допуск |
| FAQ и следующий шаг | Цена/доступность после утверждения, prelaunch уведомления, поддержка | Ответ соответствует текущей стадии; работает destination и принимающий owner |

Каждый master: source → outline → produced → domain/rights review → platform preview → approved → отдельно authorized publication → readback → observation/decision. Учитываются версии, сроки прав, музыки и переводов; субтитры/монтаж не теряют ограничения; шаблон не заменяет platform preview и Caster QC.

Действующий `candidate-interview-protocol.md` прямо запрещает маркетинговое использование интервью. Согласие на кандидатскую запись или обучение не переиспользуется как marketing release. Старое sourcing-приглашение «не ранее чем через 6 месяцев» и августовский календарь обновляются перед новым контактом; цели 70 профилей/30–40 контактов/8 интервью не выдаются за выполненную работу.

## Social gate и пользовательский путь до запуска

До публикации конкретного профиля/материала нужны identity/rights, policy по точному режиму и рынку, approved preview, владелец доступа, publisher и DM/backup, измеренная capacity и проверенный честный destination. «Следить за подготовкой», «прочитать» или «получить уведомление» не означают «оплатить сейчас». Waitlist допускается только с принятым privacy/consent/opt-out и действующим обработчиком; неготовую форму не считать результатом.

Проверить normal lead, отказ от контакта, вопрос об оплате при NO-GO, sensitive message, денежную жалобу, unavailable Support, смену ответственного и duplicate handoff. Денежный/safety вопрос не превращается в продажу. Передача завершается принявшим ответственность человеком и понятным пользователю следующим шагом; вымышленного тикета/refund обещания нет. Raw DM и темы консультаций не публикуются и не уходят в marketing analytics.

## Рынок, платформа и рекламный кабинет — отдельные проверки

Проверка официальных источников 08.09.2026:

- TikTok Ads: horoscope/fortune-telling имеет требования по рынкам; США указаны как разрешённый с условиями рынок, Беларусь — как запрещённый для рекламы этой категории. Точные/гарантированные предсказания и окончательные решения не допускаются. Это не общий запрет owned organic. [TikTok: Other Products and Services, August 2026](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-other-products-and-services).
- Branded Content и Ads регулируются раздельно. Нельзя переносить один допуск на другой или объявить весь собственный контент допустимым только потому, что он не куплен как Ads. [TikTok: Branded Content country-specific requirements](https://ads.tiktok.com/resources/help/article/branded-content-policy-country-specific-requirements).
- Креатив и landing должны согласовываться по обещанию и предложению; вводящие в заблуждение claims недопустимы. Для значимых AI-изменений предусмотрены disclosure/label правила; разрешение на likeness проверяется по конкретному материалу. [TikTok: Misleading and false content](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content).
- Музыка для бизнеса требует подходящих прав: TikTok рекомендует CML для коммерческого organic/ads/branded использования; обычная библиотека не означает коммерческую лицензию. [TikTok: Commercial Music Library](https://ads.tiktok.com/resources/help/article/commercial-music-library).
- Не обходить модерацию/ограничения, не искажать business identity; verification/payment prerequisites проверяются штатно после отдельного разрешения. [TikTok: Actor policy](https://ads.tiktok.com/help/article/actor-policy).
- Meta/Instagram: официальный актуальный policy readback не получен — 429. Статус `pending_official_policy_readback`, не PASS. До публикации/рекламы нужна проверка выбранного service/market/identity/claims/distribution scope. [Meta Advertising Standards — источник для следующего gate](https://transparency.meta.com/policies/ad-standards/).

Эти сведения не являются одобрением конкретной кампании или юридическим заключением. До рекламного запуска заново сверить policies, account/business verification, service eligibility, market, destination/domain, роли кабинета, tracking consent/events, creative approval, budget и emergency stop. Юридические документы и payment credentials не собирать в публичный отчёт. Нельзя обещать готовность канала, который не допускает выбранную услугу на нужном рынке; допустим другой разрешённый канал или перенос теста.

## Общий GO и ближайшее действие

Операции, legal/privacy, merchant, эксплуатация/backup/recovery и capacity — сквозные проверки, не потерянный восьмой слой. Сохраняются восемь launch gates действующего календаря, pilot-entry 30.10, 14 последовательных дней наблюдения после последнего blocking fix, feature freeze 30.11, GO/NO-GO 21.12 и резерв до 31.12. Последний blocking fix для 21.12 — 07.12; для 31.12 — 17.12 при подтверждённых сменах. Социальная сеть эти сроки и правила не сокращает.

До 11.09 PM собирает один capacity/ownership packet по семи слоям: текущий backlog, фактические люди/часы, независимый QA, школа/reviewers и отдельная content/community нагрузка. До 18.09 — market/brief/claims и устранение конфликтов старых документов. До 25.09 — измеренный preview cycle и паспорта первой когорты. До 30.09 — core/ACL gate плюс независимое решение по безопасному prelaunch. Принятые O1/O2/O3/O14 не переоткрываются; O4 initial economics и O5 численные traffic параметры остаются owner-gated.

**Граница этого выпуска:** обновлён только план и его опубликованный отчёт. Нет новых социальных аккаунтов, отправленных приглашений, assets, постов, рекламных кампаний, расходов, изменений production или заявленного нового runtime PASS.
