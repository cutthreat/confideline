# AskNebula pricing benchmark для G2.1

Дата проверки: 2026-07-21  
Статус: `current_public_reference_global_rate_and_starter_package_adopted_discount_grid_open`

## Подтвержденные публичные факты

- Официальная страница AskNebula `https://www.asknebula.com/reviews` указывает базовый пакет от `9.99 USD` и стоимость общения с экспертом от `30 credits` за минуту.
- Та же официальная страница описывает credit-based пополнение и отдельный refill credits.
- Официальный каталог `https://www.asknebula.com/psychic-chat` на момент проверки показывает для большинства видимых экспертов `4.99 USD/min`; это публичный денежный эквивалент/витрина конкурента, а не доказанная таблица конвертации его пакетов в credits.
- Публичная акция нового клиента: `3 minutes free + 80% off`; она является конкурентным promo reference и не становится правилом Nebula без отдельного решения.

## Принятое решение Nebula

- Валюта покупки credit packages: `USD`.
- Global default consultation price: `30 credits/started minute`.
- Значение `30` является начальным active default, но хранится как versioned admin setting, а не hardcoded constant.
- Profile override остается доступен; новая цена применяется только к новым service sessions, active/historical session хранит snapshot.
- Клиентская цена консультации остается в credits/minute. USD показывается только на purchase/payment surface.
- Стартовый Nebula package принят владельцем как `9.99 USD -> 60 credits`. Пакет не продает и не обещает фиксированные минуты.
- Это owned Nebula decision по мотивам benchmark, а не доказанная конвертация AskNebula.

## Граница доказательства

AskNebula публично не показывает достоверную полную таблицу `package USD price -> purchased credits -> bonus credits`. Поэтому:

- `9.99 USD -> 60 credits` является принятым Nebula starter package, но не утверждением о внутренней конвертации AskNebula;
- дополнительные package tiers, discount percentages, bonus quantity, refill/auto-refill и их unit economics остаются открытым owner/economics gate;
- пакет с неполными значениями не активируется;
- нельзя выводить package credits из `$4.99/min` как подтвержденный факт конкурента.

## Класс решения

- AskNebula values: `observed current public reference fact`.
- `USD` и `30 credits/started minute`: `owner decision`, принятый с использованием эталона.
- Любая будущая пакетная сетка: `proposed Nebula rule`, пока отдельно не утверждена.

## Проверка реализации

1. Admin readback показывает global default `30 credits/started minute` и purchase currency `USD`.
2. Profile без override получает `30`; profile с override получает свое значение.
3. Starter package preview показывает `9.99 USD` и `60 credits`; доступные минуты рассчитываются отдельно по effective цене выбранного Эксперта.
4. Изменение default не меняет active/historical session snapshot или уже купленный credit grant.
5. Profile/start/session/history не показывают USD/minute.
6. Package без USD price или credits amount нельзя активировать.
