# Аудит текущих документов Confideline.com

Дата: 2026-05-01.

## Проверенные публичные URL

- `https://confideline.com/en/page/terms-and-conditions`
- `https://confideline.com/en/page/privacy-policy`
- `https://confideline.com/en/page/cookie-policy`
- `https://confideline.com/en/page/safety`
- `https://confideline.com/en/page/anti-scam`
- `https://confideline.com/en/page/about`

## Факты

1. `Privacy Policy` и `Cookie Policy` на live URL перепутаны:
   - `/en/page/privacy-policy` показывает текст Cookie Policy;
   - `/en/page/cookie-policy` показывает текст Privacy Policy.
2. Terms используют старую entity `ConfideLine Technologies LP`; для EU-компании нужно заменить на `[EU_COMPANY_LEGAL_NAME]`.
3. Terms конфликтуют по возрасту: одновременно встречается `21`, `eighteen` и `under eighteen`.
4. About также фиксирует аудиторию `Users 21+`, но возраст еще должен быть подтвержден юристом.
5. Footer live-страниц содержит `YouDate © 2026`; для публикации нужно заменить на `Confideline.com © 2026`.
6. Текущие Terms в основном про dating/subscription membership, но требования проекта включают кредиты, поминутную оплату, подписки и потенциальную экспертную/entertainment модель.
7. Текущий Privacy текст не выглядит достаточным для EU launch: нужны controller details, legal bases, retention, rights, transfers, processors, complaint authority, cookie/marketing consent, профилирование/модерация.
8. Текущий Cookie текст должен быть связан с реальным consent banner и категориями cookies.
9. Safety и Anti-Scam можно сохранить как основу, но нужно связать с report flow, moderation, payment safety и support.

## Вывод

Текущие документы не нужно точечно “подправлять” в live-форме. Безопаснее заменить пакетно:

- Terms -> новый `terms-of-service.ru.md`;
- Privacy -> новый `privacy-policy.ru.md`;
- Cookie -> новый `cookie-policy.ru.md`;
- About/Safety/Anti-Scam -> обновленные русские версии;
- добавить недостающие payment/refund/community/disclaimer/DSA/contact/consultant документы.

## Блокеры перед публикацией

- юридическое название EU-компании;
- регистрационный номер, адрес, VAT;
- privacy/support/legal emails;
- выбранная юрисдикция и применимое право;
- возрастной порог;
- фактический список платежных провайдеров;
- фактические сроки хранения данных;
- фактическая модель кредитов, подписок, refunds, auto-renewal;
- наличие/отсутствие консультантов на старте;
- список cookies/scripts: Meta Pixel, analytics, payment cookies, session cookies.

