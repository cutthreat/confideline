# Email-marketing review flow-цепочек

Дата: 2026-05-28

## Вывод

Flow-цепочки настроены как поведенческие lifecycle-сценарии, а не как набор независимых писем. Главное правило: delayed email отправляется только после повторной проверки состояния. Если более позднее событие закрыло потребность, письмо отменяется или пропускается.

## Что применено

| Практика | Как применено в пакете |
|---|---|
| Lifecycle flows должны иметь разные цели и шаблоны | Сервисные письма, checkout recovery, чатовые уведомления, support/refund/safety и retention разделены по цепочкам. |
| Timing нужно адаптировать под бизнес-цикл | `payment_init` переведен на +2 часа, а retention разведен на +24/+48/+72 часа. |
| Не перегружать пользователя письмами | Для marketing/lifecycle ветки выдержан минимум 1 день между письмами; refund/safety подавляет retention. |
| Поведение пользователя важнее статичного delay | Оплата, первое сообщение, ответ эксперта, review, refund и safety отменяют связанные pending-письма. |
| Deliverability зависит от релевантности и частоты | Service/security/payment письма не смешиваются с marketing; lifecycle письма respect user settings и unsubscribe. |
| Email-клиенты требуют простого устойчивого HTML | Шаблоны остаются HTML-фрагментами с live text, legal/footer переменными, TXT fallback и без полного `doctype/html/body`. |

## Источники

- Klaviyo Academy: https://academy.klaviyo.com/en-us/best-practices/best-practices-for-flows
- Klaviyo scheduling: https://www.klaviyo.com/blog/how-to-schedule-marketing-emails
- HubSpot deliverability: https://knowledge.hubspot.com/marketing-email/overview-of-email-deliverability
- Litmus accessibility: https://www.litmus.com/blog/ultimate-guide-accessible-emails
- Litmus dark mode: https://www.litmus.com/dark-mode-email-best-practices

## Решения по спорным местам

| Сценарий | Решение | Причина |
|---|---|---|
| `payment_init` | Delay `2` часа | Ближе к норме abandoned checkout 2-4 часа и меньше риск раздражения после начала оплаты. |
| `review_request` | +24 часа | Дает пользователю время после консультации и не мешает service/refund flow. |
| `message_chat_saved` | +48 часов | Мягкий возврат к ценности чата, не одновременно с review. |
| `advisor_followup_offer` | +72 часа | Коммерческое письмо идет последним, после quality/value касаний. |
| `review.left` | Требует проверки или замены на `review.request` | Текущее имя события похоже на факт оставленного отзыва, а не на просьбу оставить отзыв. |
| `message.received` | Требует `direction` | Один event обслуживает два разных письма: сообщение клиента и ответ эксперта. |
| `payment.refund` | Требует `refund_status` | Update и confirmed refund должны вести к разным письмам. |

