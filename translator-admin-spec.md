# ТЗ: переводчик в чате экспертной админ-панели

## Result
- В админ-чате эксперта появляется действие `Translate`, которое переводит входящее сообщение через выбранный провайдер.
- В админке появляется системный раздел `Translator settings`, где администратор включает/выключает переводчик и хранит ключи провайдеров.
- Архитектура сразу допускает три провайдера: `DeepL`, `Google Cloud Translation`, `Amazon Translate`.

## Scope
- Контур: Yii2 admin module.
- Точки входа:
  - чат эксперта: `/en/admin/message/chat`
  - настройки: `admin/settings/translator`
- Локальный исходник для разработки:
  - `H:\GPT-Codex\Confideline\Chat\youdate-2.0.2-yii2\Source\youdate_extracted\application`

## Facts
- В проекте уже есть универсальный механизм `SettingsAction` и хранение системных настроек по категориям.
- Чат эксперта уже переведен на shell-интерфейс с отдельными endpoints `conversations`, `messages`, `send`.
- В админке уже есть системный раздел `Settings`, куда логично встраивать переводчик как системную интеграцию.

## Inference
- Переводчик нельзя размещать в разделе `Languages`, потому что это каталог языков сайта, а не runtime-интеграции с внешними API.
- Переводчик нельзя прятать только в чат, потому что учетные данные и режимы работы нужны администратору на уровне всей системы.
- Базовый UX должен быть двухуровневым:
  - отдельный системный пункт меню `Translator`;
  - вкладка `Translator settings` внутри раздела `Settings`.

## Recommendation
- DeepL сделать провайдером по умолчанию.
- Google и Amazon держать как fallback-ready интеграции.
- Исходное сообщение никогда не перезаписывать переводом.
- Перевод хранить как производный артефакт с привязкой к оригинальному `message_id`, провайдеру, языкам и времени запроса.

## Функциональные требования

### 1. Настройки переводчика
- Добавить страницу `Translator settings`.
- Поля страницы:
  - `Enable translator in expert chat`
  - `Default translation provider`
  - `Allow fallback to the next configured provider`
  - `Cache translations for repeated requests`
  - `DeepL enabled`
  - `DeepL API key`
  - `Use DeepL Pro endpoint`
  - `Google Cloud Translation enabled`
  - `Google API key`
  - `Google project ID`
  - `Amazon Translate enabled`
  - `Amazon access key ID`
  - `Amazon secret access key`
  - `Amazon region`
- Доступ: только `Admin`.
- Поведение:
  - если глобальный флаг выключен, кнопка перевода в чате не показывается;
  - если выбранный провайдер не настроен, перевод в чате недоступен и эксперт видит понятную ошибку;
  - если включен fallback, система пробует следующий включенный и сконфигурированный провайдер.

### 2. Перевод в чате эксперта
- Кнопку `Translate` разместить в карточке входящего сообщения.
- Кнопку показывать только для сообщений, где:
  - есть текст;
  - сообщение входящее для текущего эксперта;
  - переводчик глобально включен;
  - есть хотя бы один настроенный провайдер.
- Поведение кнопки:
  - по клику отправляется AJAX-запрос на новый admin-endpoint перевода;
  - на время запроса кнопка блокируется и показывает loading-state;
  - после успеха под оригинальным текстом раскрывается блок перевода.

### 3. Отображение результата перевода
- В карточке сообщения добавить второй блок под оригинальным текстом:
  - заголовок `Translation`;
  - переведенный текст;
  - мета-строка: `provider`, `detected source language`, `target language`, `translated at`.
- Оригинальный текст всегда остается первым и визуально доминирующим.
- Перевод должен быть визуально вторичным:
  - светлый фон;
  - тонкая рамка;
  - меньший мета-текст.

### 4. API и backend-контракт
- Новый endpoint в admin message controller, например `POST /admin/message/translate`.
- Вход:
  - `messageId`
  - опционально `provider`
  - опционально `targetLanguage`
- Выход:
  - `success`
  - `translation`
  - `provider`
  - `sourceLanguage`
  - `targetLanguage`
  - `cached`
  - `translatedAt`
  - `message` при ошибке
- Серверная логика:
  - проверить права admin/moderator на чат;
  - загрузить сообщение;
  - убедиться, что текст не пустой;
  - выбрать провайдера по настройкам;
  - вызвать provider client;
  - сохранить результат в persistent storage;
  - вернуть нормализованный JSON.

## Данные и хранение
- Рекомендуемая таблица: `message_translation`.
- Поля:
  - `id`
  - `message_id`
  - `provider`
  - `source_language`
  - `target_language`
  - `source_text_hash`
  - `translated_text`
  - `raw_response` nullable
  - `created_at`
  - `updated_at`
- Индексы:
  - `message_id`
  - составной индекс `message_id + provider + target_language`
  - индекс по `source_text_hash` для кэша повторных запросов

## Визуализация

### Чат эксперта
```text
+--------------------------------------------------------------+
| Agent chat                                      [Refresh]    |
+----------------------+----------------------+-----------------+
| conversations        | selected dialog      | participants    |
|                      |                      |                 |
|                      | [incoming message]   |                 |
|                      | original text        |                 |
|                      | [Translate]          |                 |
|                      | -------------------  |                 |
|                      | Translation          |                 |
|                      | translated text      |                 |
|                      | DeepL • RU -> EN     |                 |
|                      |                      |                 |
|                      | [outgoing message]   |                 |
+----------------------+----------------------+-----------------+
```

### Настройки переводчика
```text
+--------------------------------------------------------------+
| Translator settings                                          |
+--------------------------------------------------------------+
| General mode                                                 |
| [x] Enable translator in expert chat                         |
| Provider: [DeepL v]                                          |
| [x] Allow fallback                                           |
| [x] Cache translations                                       |
|                                                              |
| DeepL                                                        |
| [x] Enabled                                                  |
| API key: [************************]                           |
| [ ] Use Pro endpoint                                         |
|                                                              |
| Google Cloud Translation                                     |
| [ ] Enabled                                                  |
| API key: [....................]                              |
| Project ID: [................]                               |
|                                                              |
| Amazon Translate                                             |
| [ ] Enabled                                                  |
| Access key ID: [................]                            |
| Secret access key: [................]                        |
| Region: [us-east-1........]                                  |
|                                             [Save]           |
+--------------------------------------------------------------+
```

## Done when
- В админке есть отдельный пункт `Translator`.
- В `Settings` есть вкладка `Translator settings`.
- Настройки сохраняются через штатный Yii2 settings-механизм.
- ТЗ покрывает backend, UI, хранение, права, ошибки и дальнейшую интеграцию кнопки перевода в чате.

## How to verify
- Открыть `admin/settings/translator` под `Admin`.
- Сохранить настройки и убедиться, что значения читаются повторно.
- Проверить наличие нового пункта в левом системном меню.
- Для полной фичи следующего этапа:
  - открыть `/en/admin/message/chat`;
  - убедиться, что на входящих сообщениях появляется `Translate`;
  - выполнить перевод и проверить, что оригинал не изменился.
