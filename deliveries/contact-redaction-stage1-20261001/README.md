# Цензура чата — HTML первого этапа

Откройте `index.html`: из него доступны чат клиента, чат эксперта, журнал и отдельные настройки. Примеры используют вымышленные данные и существующие CSS сайта / админки. Они не отправляют сообщения и не меняют ConfideLine.

Онлайн-макеты: https://cutthreat.github.io/confideline/deliveries/contact-redaction-stage1-20261001/index.html

Архив: https://cutthreat.github.io/confideline/deliveries/contact-redaction-stage1-20261001/confideline-contact-html-stage1.zip

Исходные файлы: https://github.com/cutthreat/confideline/tree/codex/confideline-translator-preview/deliveries/contact-redaction-stage1-20261001

Для тестирования редактируемых правил нужен локальный HTTP-сервер, поскольку обработчик запускается в Web Worker. При установленном Node.js:

```powershell
node serve.cjs
```

Затем откройте `http://127.0.0.1:43161/index.html`. Сервер слушает только localhost. Обычный просмотр HTML и остальные демо работают без Node.js. Проверки детектора: `node test-rules.cjs`.

Настройки и записи аудита в макете существуют до перезагрузки вкладки. Интеграция с Yii2, хранение, RBAC и серверная цензура описаны в `IGOR-HANDOFF.md`. Реальные права доступа нельзя обеспечить статическим HTML.
