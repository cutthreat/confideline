# Карта полного Trello intake

Дата: 2026-06-04
Доска: Dev Process
URL: https://trello.com/b/84Q9ZqxP/dev-process

## 1. Что снято

- Списки: 34
- Карточки: 291
- Открытые карточки: 243
- Закрытые/архивные карточки: 48
- Комментарии справа: 600
- Карточки с комментариями: 173
- Вложения: 283
- Чек-листы: 175
- Пункты чек-листов: 757
- Все ссылки: 935
- Уникальные ссылки: 825

## 2. Что входит в карту по каждой карточке

Для каждой карточки сохранено:

- список;
- название;
- ссылка на карточку;
- open/closed статус;
- описание;
- метки;
- участники;
- чек-листы и пункты;
- вложения;
- комментарии справа;
- извлеченные ссылки;
- количество комментариев, вложений, чек-листов и ссылок.

## 3. Карта списков по количеству карточек

Крупнейшие списки:

- `Архив (Выполнено)` - 53 карточки;
- `Полка (Когда-нибудь)` - 38;
- `На проверке` - 26;
- `План на февраль` - 18;
- `План на ноябрь` - 18;
- `Стратегия` - 17;
- `Не актуально` - 16;
- `План на апрель` - 14;
- `План на январь` - 13;
- `Фоновые задачи` - 12.

## 4. Карта ссылок

Топ доменов:

- `trello.com` - 367 ссылок;
- `docs.google.com` - 98;
- `freelancehunt.com` - 32;
- `confideline.com` - 24;
- `prnt.sc` - 22;
- `russianhugs.com` - 19;
- `www.figma.com` - 17;
- `cutthreat.github.io` - 15;
- `t.me` - 13;
- `drive.google.com` - 12.

## 5. Проверка внешних ссылок

Проверено внешних ссылок: 457.

Результат:

- Доступны: 319;
- Блокируют доступ: 60;
- Не найдены / 404: 18;
- Ошибка или timeout: 54;
- Server error: 2;
- Unknown: 4.

## 6. Важные блокеры доступа

Сформирован файл `trello-important-link-blockers.csv`.

Типовые блокеры:

- Google Docs/Sheets/Drive: есть закрытые документы и 404;
- Figma: часть ссылок требует доступ или не отвечает;
- Confideline старые `/ru/admin/...` и legal routes дают 404 без актуального route mapping;
- cutthreat.github.io часть ссылок не ответила при проверке;
- отдельные GitHub/внешние ссылки timeout.

## 7. Карточки, которые требуют особого внимания

Найдено 24 пустые/тонкие карточки: нет описания, комментариев, вложений и чек-листов. Они могут быть:

- устаревшими placeholders;
- задачами, смысл которых был в устном контексте;
- карточками, которые нужно закрыть как неинформативные;
- ссылками на работу, которая велась вне Trello.

## 8. Первичная классификация по областям

Keyword-based карта дала:

- general - 148;
- chat-ai-messaging - 62;
- design-frontend - 37;
- nebula-strategy - 20;
- analytics-seo - 7;
- email-crm-notifications - 6;
- legal-docs - 4;
- expert-ops-training - 3;
- finance-payments - 3;
- support-ops - 1.

Эта классификация первичная. Следующий проход должен уточнять ее по смыслу, а не только по словам.

## 9. Артефакты

- `trello-full-intake-summary.json`
- `trello-full-cards-redacted.json`
- `trello-card-scan-map.csv`
- `trello-list-map.csv`
- `trello-link-inventory.csv`
- `trello-unique-links.csv`
- `trello-link-domain-counts.csv`
- `trello-card-counts-by-list.csv`
- `trello-external-link-status.csv`
- `trello-important-link-blockers.csv`
- `trello-important-accessible-links.csv`
- `trello-empty-or-thin-cards.csv`
- `trello-card-area-map.csv`
- `trello-area-counts.csv`
