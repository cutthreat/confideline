# Nebula training panel v2

Date: 2026-07-17
Status: `training_panel_source_packed_owner_runtime_open`
Scope: MVP обучение и допуск для 5 агентов / 25 expert profiles / 1 moderator / 1 super-admin.

## PM conclusion

Учебный контур не потерян. Видео/уроки и knowledge corpus дают содержание обучения; Trello board `Астрологи` теперь дает доказанную карту источников, тестов, регламентов, Q&A и планов. Следующий шаг - не повторный поиск, а упаковка в G6/Moodle/admin-admission процесс с owner-approved gates.

## Evidence status
| Layer | Artifact | Coverage | Status |
| --- | --- | --- | --- |
| Trello board | API export через авторизованную вкладку | 28 cards / 12 lists / 54 actions / 9 checklists | готово |
| Training cards | training-cards.normalized.json | 21 карточка training/expert/support relevance | готово |
| External links | external-links.inventory.json | 77 ссылок: Forms, Docs, Sheets, Drive, Notion, Trello attachments | готово |
| Local course files | local-training-files.manifest.json | 16/16 файлов найдены и захешированы | готово |
| Zip structure | local-training-zip-listings.json | 11 ZIP архивов читаются, entry counts сняты | готово |
| Google Docs exports | google-source-probes/*.txt | регламент эксперта, план запуска/обучения, support Q&A экспортированы | частично готово |
| Trello attachment download | downloads/dS8scV2H-priority-tasks.pdf | PDF скачан через Trello session; крупные ZIP подтверждены локально | готово с лимитом |

## Course modules
| Module | Name | P0 learning outcome | Open gate |
| --- | --- | --- | --- |
| M0 | Роль и ответственность | границы client / expert profile / agent / moderator / super-admin; запрет выдавать source/reference за утвержденную политику | role dictionary + owner approval |
| M1 | Открытие чата и первый value | приветствие, контекст, первый полезный ответ, отсутствие пустого ожидания | scorecard wording + examples |
| M2 | Структура ответа | прямой ответ, инструмент/логика, баланс уверенности, без манипуляции | approved answer examples |
| M3 | Эмпатия и боль клиента | адаптация к эмоциональному, нервному, разговорчивому и multi-question клиенту | QA rubric wording |
| M4 | Engagement policy | продолжение диалога без давления, страха и скрытого платного перехода | owner/legal prohibited behavior |
| M5 | Trial/free/paid boundaries | free minutes/credits/minutes/top-up/refund/support должны быть прозрачны | billing/legal truth pack |
| M6 | Метрики и качество | response time, useful first answer, CSAT/complaints, first-shift review | numeric thresholds |
| M7 | Astrology foundations | натальная карта, знаки, дома, планеты, аспекты, ограничения интерпретации | domain-owner review |
| M8 | Tarot foundations | старшие/младшие арканы, масти, базовая интерпретация, этичность | domain-owner review |
| M9 | Сложные ситуации | медицина/кризис/опасные обещания/возврат/поддержка: когда остановить и эскалировать | US Trust & Safety route |
| M10 | Допуск и первые смены | курс -> тесты -> экзамен -> пробная консультация -> Ksenia review -> owner approval -> first shifts | runtime/admin proof |

## Core Trello source cards
| Card | List | Evidence | Meaning |
| --- | --- | --- | --- |
| [Материалы по обучению Небула и Орба](https://trello.com/c/qJZrpg7A/29-%D0%BC%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D1%8B-%D0%BF%D0%BE-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8E-%D0%BD%D0%B5%D0%B1%D1%83%D0%BB%D0%B0-%D0%B8-%D0%BE%D1%80%D0%B1%D0%B0) | Материал по обучению (Июнь) | 191 desc chars; 0 attachments; 0 checklists; 0 comments | Drive root Nebula/Orba training materials |
| [Обучение в новом проекте.](https://trello.com/c/ESrylp1q/21-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B2-%D0%BD%D0%BE%D0%B2%D0%BE%D0%BC-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B5) | Задачи на февраль | 167 desc chars; 0 attachments; 0 checklists; 0 comments | new project training Drive root |
| [Ксения. Чек-лист по обучению](https://trello.com/c/qOW5ge0x/7-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D1%87%D0%B5%D0%BA-%D0%BB%D0%B8%D1%81%D1%82-%D0%BF%D0%BE-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8E) | Готово | 334 desc chars; 0 attachments; 1 checklists; 1 comments | training checklist / Google Form |
| [Ксения. Тесты для сотрудников](https://trello.com/c/vmI6mYWM/8-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D1%82%D0%B5%D1%81%D1%82%D1%8B-%D0%B4%D0%BB%D1%8F-%D1%81%D0%BE%D1%82%D1%80%D1%83%D0%B4%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2) | Готово | 194 desc chars; 3 attachments; 1 checklists; 4 comments | lesson tests 1-7 / Forms + Slides |
| [Ксения. Подготовить скрипты готовых формулировок и общения для экспертов](https://trello.com/c/tSNaDjzE/1-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BF%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%B8%D1%82%D1%8C-%D1%81%D0%BA%D1%80%D0%B8%D0%BF%D1%82%D1%8B-%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D1%8B%D1%85-%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%BE%D0%BA-%D0%B8-%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B4%D0%BB%D1%8F-%D1%8D%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%BE%D0%B2) | Готово | 0 desc chars; 1 attachments; 0 checklists; 1 comments | expert scripts / Q&A Notion |
| [регламент работы эксперта](https://trello.com/c/TwXHmxky/25-%D1%80%D0%B5%D0%B3%D0%BB%D0%B0%D0%BC%D0%B5%D0%BD%D1%82-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%8B-%D1%8D%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%B0) | Задачи на март | 215 desc chars; 0 attachments; 0 checklists; 0 comments | expert work regulation Google Doc |
| [План запуска и обучения команды](https://trello.com/c/levvZOrB/26-%D0%BF%D0%BB%D0%B0%D0%BD-%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA%D0%B0-%D0%B8-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%8B) | Задачи на март | 215 desc chars; 0 attachments; 0 checklists; 0 comments | launch and team training plan Google Doc |
| [Ксения. Сервисы для работы](https://trello.com/c/Hs4xSock/5-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B-%D0%B4%D0%BB%D1%8F-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%8B) | Готово | 506 desc chars; 2 attachments; 0 checklists; 1 comments | work services + lesson 6/7 files |
| [Ксения. Помощь с описанием работы агента](https://trello.com/c/d8t7Bupt/4-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C-%D1%81-%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5%D0%BC-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%8B-%D0%B0%D0%B3%D0%B5%D0%BD%D1%82%D0%B0) | Готово | 397 desc chars; 0 attachments; 1 checklists; 1 comments | agent work/chat model source |
| [Ксения. Собрать вопросы-ответы по которым могут обращаться клиенты в тех.поддержку](https://trello.com/c/y5YBr4dd/2-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D1%81%D0%BE%D0%B1%D1%80%D0%B0%D1%82%D1%8C-%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%D1%8B-%D0%BE%D1%82%D0%B2%D0%B5%D1%82%D1%8B-%D0%BF%D0%BE-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D0%BC-%D0%BC%D0%BE%D0%B3%D1%83%D1%82-%D0%BE%D0%B1%D1%80%D0%B0%D1%89%D0%B0%D1%82%D1%8C%D1%81%D1%8F-%D0%BA%D0%BB%D0%B8%D0%B5%D0%BD%D1%82%D1%8B-%D0%B2-%D1%82%D0%B5%D1%85%D0%BF%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%BA%D1%83) | Готово | 154 desc chars; 1 attachments; 0 checklists; 1 comments | support Q&A source |
| [Ксения. Анализ контента Nebula](https://trello.com/c/dS8scV2H/3-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7-%D0%BA%D0%BE%D0%BD%D1%82%D0%B5%D0%BD%D1%82%D0%B0-nebula) | Готово | 254 desc chars; 1 attachments; 1 checklists; 4 comments | content audit / priority tasks |
| [Ксения. Формирование карточек с экспертами](https://trello.com/c/QrclxIBc/12-%D0%BA%D1%81%D0%B5%D0%BD%D0%B8%D1%8F-%D1%84%D0%BE%D1%80%D0%BC%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%87%D0%B5%D0%BA-%D1%81-%D1%8D%D0%BA%D1%81%D0%BF%D0%B5%D1%80%D1%82%D0%B0%D0%BC%D0%B8) | Готово | 663 desc chars; 1 attachments; 1 checklists; 2 comments | expert profile materials |

## Admission path

1. Course assigned and completed.
2. Lesson tests passed.
3. Final exam passed, including hard-fail safety cases.
4. Trial consultation submitted and reviewed.
5. Ksenia review completed or explicit owner override recorded.
6. Owner approval recorded.
7. First shifts under controlled review before unrestricted paid access.

## Forms / tests inventory
| Source card | URL |
| --- | --- |
| DNq6zAsa Ксения. Тестовая форма опроса для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSf7TmHZXRR2zVVCbcteNJ0DZRDnSc3vfDHgLHQeNwn7jYA8dQ/viewform |
| qOW5ge0x Ксения. Чек-лист по обучению | https://docs.google.com/forms/d/e/1FAIpQLScba4Swe7wsiANmb8kvdMTav-gdgzMi9zcmqJCVHaiCddutUw/viewform |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLScba4Swe7wsiANmb8kvdMTav-gdgzMi9zcmqJCVHaiCddutUw/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLScdzXwexeHzMSKfvALyYO1mzSaSiaH8bAuywWc1-YUZOFR2mA/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSclRWYBYgedruM_86FY8I4r7f0E9MbBOpFr2kiOh6M-F0SQ4w/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSdMTXKx7U6tWSc2QwfsoBqtPNli4n1ZU64Zv_l2y6S21yWHgg/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSeB6RPfgPxanFB-1MlRxIQpm_XsGAup6rKMLozuffReD96f8Q/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSebZFfrkPwAZ-xbwFcNnPKVsWIlrgZUCPU9YFk_KENvxw1aVQ/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSeII7wn1lvN9Zk3gZ3YZzIVi7uJ5Esmsv6Cn4VlNuuHMZPtGQ/viewform?usp=sharing&ouid=109420775549921833761 |
| vmI6mYWM Ксения. Тесты для сотрудников | https://docs.google.com/forms/d/e/1FAIpQLSf7TmHZXRR2zVVCbcteNJ0DZRDnSc3vfDHgLHQeNwn7jYA8dQ/viewform |

## Local files inventory
| File | Bytes | Coverage note |
| --- | ---: | --- |
| Урок_1.zip | 3820151 | present + sha256 recorded |
| Урок_1 (2).zip | 3297574 | present + sha256 recorded |
| Урок_2.zip | 4331230 | present + sha256 recorded |
| Урок_3(часть_1).zip | 22065684 | present + sha256 recorded |
| Урок_3(часть_2).zip | 4159157 | present + sha256 recorded |
| урок_4.zip | 15868773 | present + sha256 recorded |
| урок_4 (2).zip | 14865715 | present + sha256 recorded |
| Знайомство з метриками урок 5pptx.pptx | 1459475 | present + sha256 recorded |
| Натальная_карта_Астрология_Урок_6_.pptx | 1212657 | present + sha256 recorded |
| Основы Таро урок 7.zip | 10447063 | present + sha256 recorded |
| astrology obrio.pdf исходник.pdf | 3014347 | present + sha256 recorded |
| Astrology pt1.zip | 194421208 | present + sha256 recorded |
| Старші аркани таро.zip | 1625122204 | present + sha256 recorded |
| Молодші аркани таро .zip | 2063386723 | present + sha256 recorded |
| Чек-лист по сложным ситуациям .pdf | 108837 | present + sha256 recorded |
| Приоритетные задачи.pdf | 57162 | present + sha256 recorded |

## Docs extracted

- Expert regulation: 2897 chars. Key topics: motivation/KPI, Rejected incidents, Ping, check-in, monthly schedule, tails, response/work-time norms.
- Launch/training plan: 2383 chars. Key topics: current team pilot, later hiring, candidate interview, onboarding group, knowledge base, testing, test chat, retrospective.
- Support Q&A: 5435 chars. Useful for support map, but contains leakage requiring filtering: mobile app, subscription, local payments, broad refund language.

## Open decisions
| Priority | Area | Decision needed |
| --- | --- | --- |
| P0 | Drive roots | Сверить `17ql...` и `1qXF...`: дубли, разные версии или дополняющие папки. |
| P0 | Moodle vs Google Forms | Решить: Forms как временный слой или перенос тестов в Moodle как canonical training contour. |
| P0 | Pass/fail thresholds | Утвердить проходной балл, hard-fail вопросы, пересдачи, кто проверяет. |
| P0 | Expert regulation leakage | Регламент содержит Ping, Rejected, прогрессивную оплату и proactive диалоги; нужно решить, что MVP берет, а что откладывает. |
| P0 | Support Q&A leakage | Q&A содержит mobile app/subscription/local payments; это source material, не финальная политика Nebula. |
| P0 | Billing boundary | Обучение должно учить AskNebula/reference credits/min/free minutes/packages/refill/refund, но финальные значения берутся из billing/legal truth. |
| P0 | Domain review | Astrology/Tarot терминология и трактовки требуют domain-owner review до экзамена. |
| P0 | Runtime proof | Админка/Yii2 должна показать блокировку paid access до полного допуска. |

## Next actions

1. Build Moodle/course source structure from modules M0-M10.
2. Convert Google Forms into canonical tests or mark them as temporary source.
3. Write product-only TZ for training/admission board: states, visible gates, paid-access block, review owners.
4. Write product-only TZ for expert regulation subset: only what MVP needs.
5. Filter support Q&A into approved support/legal map, removing subscription/mobile/dating leakage.
6. Run QA walkthrough once Yii2/admin admission states exist.