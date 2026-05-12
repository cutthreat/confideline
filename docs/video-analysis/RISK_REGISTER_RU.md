# Risk Register по итогам видеоанализа конкурента

Документ фиксирует продуктовые, операционные, юридические и revenue-риски, которые проявились в видеоаналитике. Его задача - помочь Confideline строить workspace не только удобным, но и управляемым.

## 1. Шкала

| Уровень | Значение |
|---|---|
| Low | Небольшое влияние, можно контролировать вручную |
| Medium | Влияет на качество или конверсию |
| High | Может приводить к потере денег, жалобам, churn или ошибкам эксперта |
| Critical | Safety/legal/reputation риск или прямой системный revenue loss |

## 2. Revenue risks

### R-01. Free-value leakage

Эксперт дает слишком полный бесплатный ответ и убирает причину покупать paid session.

Impact: High  
Likelihood: High  
Signals:

- много insight до Book Now;
- клиент получил прямой ответ;
- Book Now не отправлен после прогрева;
- previous buyer получает новый полный free reading.

Controls:

- `freeTrial.insightCount`;
- `freeValueLimitReached`;
- composer warning;
- QA чеклист.

### R-02. Future paid content leakage

Клиент купил будущую paid session, но эксперт раскрывает ее содержание до начала.

Impact: Critical  
Likelihood: Medium  
Signals:

- `paid_session_booked_future`;
- эксперт отвечает по promised topic до startsAt;
- клиент отменяет/не приходит.

Controls:

- future content lock;
- composer warning;
- event `paid_content_gating_violation_suspected`;
- mentor review.

### R-03. Paid-session silence / refund risk

Во время оплаченной сессии эксперт долго молчит или отправляет слишком мало сообщений.

Impact: High  
Likelihood: High  
Signals:

- высокий `idleSeconds`;
- низкий `outboundMessageCount`;
- support/refund request.

Controls:

- paid-session timer;
- urgent Ping;
- outbound message count;
- mentor queue.

### R-04. Weak Book Now timing

Book Now отправляется слишком рано, слишком поздно или без обещанных тем.

Impact: High  
Likelihood: Medium  
Signals:

- низкий Book Now -> payment conversion;
- CTA без promised topics;
- много free conversation после готовности к покупке.

Controls:

- stage `intrigue_ready`;
- promised topics required;
- conversion analytics.

### R-05. Coupon misuse

Эксперт обещает недоступный coupon, дает coupon не той платформы или использует discount вместо value.

Impact: Medium/High  
Likelihood: Medium  
Signals:

- coupon expired/already used;
- coupon sent before value;
- coupon does not match platform.

Controls:

- coupon eligibility panel;
- copyable coupon message;
- coupon events.

## 3. Conversion and retention risks

### R-06. Infinite objection pressure

Эксперт слишком долго давит после Book Now.

Impact: Medium/High  
Likelihood: Medium  
Signals:

- objection attempt count > 3-4;
- клиент раздражен;
- нет cooldown/lift.

Controls:

- objection attempt counter;
- stop pressure warning;
- schedule reactivation.

### R-07. No reactivation workflow

Previous buyers и strong-intent clients теряются после сессии или неудачного objection flow.

Impact: High  
Likelihood: High  
Signals:

- нет nextActionAt;
- buyer не в Favorites;
- нет lift due Ping;
- post-session follow-up отсутствует.

Controls:

- reactivation eligibility;
- Pings as follow-up queue;
- Favorites;
- lift outcome analytics.

### R-08. Repeating weak intrigue

Эксперт повторяет одну и ту же интригу, вместо смены угла или перехода к Book Now/cooldown.

Impact: Medium  
Likelihood: Medium  
Signals:

- same theme repeated;
- client ignores;
- no conversion.

Controls:

- intrigue theme tracking;
- QA review;
- composer hint.

### R-09. Poor repeat-client handling

Клиент постоянно возвращается с той же темой, а эксперт стыдит его или игнорирует retention opportunity.

Impact: Medium  
Likelihood: Medium  
Signals:

- repeat topic detected;
- negative tone;
- no new angle.

Controls:

- repeat topic badge;
- client continuity panel;
- tone QA.

## 4. Safety and legal risks

### R-10. Self-harm mishandling

Клиент сообщает о self-harm/suicide, а эксперт продолжает sales-flow или отвечает непрофессионально.

Impact: Critical  
Likelihood: Low/Medium  
Signals:

- self-harm language;
- hopelessness;
- immediate danger.

Controls:

- safety flag;
- sales hints suppressed;
- support escalation;
- approved safety response.

### R-11. Medical/legal overclaim

Эксперт делает диагноз, обещает лечение или дает юридически значимый совет.

Impact: Critical  
Likelihood: Medium  
Signals:

- health/legal terms;
- guaranteed outcome;
- treatment/diagnosis wording.

Controls:

- claim precision flags;
- composer warning;
- mentor review.

### R-12. Pregnancy/paternity certainty

Эксперт выдает рискованные утверждения о беременности/отцовстве как факт.

Impact: High/Critical  
Likelihood: Medium  
Signals:

- pregnancy/paternity topic;
- certainty wording;
- "energy says exactly".

Controls:

- sensitive category flag;
- forbidden certainty phrasing;
- QA escalation.

### R-13. Under-18 / privacy / confidential data

Эксперт работает с запрещенным возрастом или запрашивает лишние конфиденциальные данные.

Impact: Critical  
Likelihood: Low/Medium  
Signals:

- age under 18;
- passport/financial/medical data request;
- off-platform contact.

Controls:

- age/18+ status;
- confidential data warning;
- off-platform warning.

## 5. Operational risks

### R-14. Chat ownership gap

Эксперт взял чат, но не работает его.

Impact: High  
Likelihood: Medium  
Signals:

- assignedAt есть;
- нет expert messages;
- client waiting.

Controls:

- assignment timer;
- client waiting Ping;
- ownership QA.

### R-15. Schedule/availability mismatch

Эксперт offline/break, но есть активная или будущая paid session.

Impact: High  
Likelihood: Medium  
Signals:

- availability `offline`;
- paid session active/starts soon;
- schedule timezone mismatch.

Controls:

- availability warning;
- schedule timezone display;
- paid starts soon Ping.

### R-16. Technical issue handled manually

Button stuck, payment issue, hidden/deleted chat или visibility problem решаются экспертом без support path.

Impact: Medium/High  
Likelihood: Medium  
Signals:

- technical objection;
- "button doesn't work";
- hidden/deleted/banned state.

Controls:

- technical issue category;
- support escalation action;
- event timeline.

### R-17. AI/translator misuse

Эксперт копирует AI/translator output без адаптации, тон становится шаблонным или смысл ошибочным.

Impact: Medium  
Likelihood: High  
Signals:

- template-like messages;
- mismatch with client context;
- repeated phrasing.

Controls:

- draft provenance;
- edited_after_ai flag;
- QA for copy-paste smell.

## 6. Product/data risks

### R-18. Stage inferred only from text

Система не хранит stage явно, поэтому UI, Pings и QA расходятся.

Impact: High  
Likelihood: High if not addressed  
Controls:

- `conversation.stage`;
- transition events;
- stage badges.

### R-19. Payment/session source of truth unclear

UI показывает paid state не из надежного источника.

Impact: Critical  
Likelihood: Medium  
Controls:

- backend/payment source;
- event source field;
- immutable payment events.

### R-20. Duplicate client false positive

Система ошибочно считает клиента duplicate и показывает неверную историю.

Impact: Medium/High  
Likelihood: Medium  
Controls:

- confidence score;
- "suspected" not merged;
- manual verification.

### R-21. Dashboard metric confusion

Эксперты и менеджеры неверно понимают active hours, message count, efficiency, bonus eligibility.

Impact: Medium  
Likelihood: Medium  
Controls:

- metric definitions;
- source and formula labels;
- avoid copying competitor formulas without validation.

## 7. Prioritized controls

P0 controls:

- conversation stage;
- Book Now state;
- paid-session timer;
- paid-session idle Ping;
- future paid content warning;
- safety flags;
- claim precision warnings;
- previous buyer badge.

P1 controls:

- objection attempt counter;
- coupon eligibility;
- free-value leakage warning;
- reactivation due Pings;
- client continuity panel;
- support escalation for technical issues.

P2 controls:

- mentor QA queue;
- draft provenance;
- onboarding state;
- advanced dashboard formulas;
- duplicate client confidence.

## 8. Risk ownership

| Risk family | Primary owner | Secondary owner |
|---|---|---|
| Revenue leakage | Product | Operations |
| Paid-session quality | Operations | Mentor |
| Safety/legal | Legal/Compliance | Product |
| Technical issues | Support | Engineering |
| Data contracts | Engineering | Product |
| Training/onboarding | Operations | Mentor |
| AI usage | Product | Mentor |

## 9. Open questions

- Какие safety responses утверждены юридически?
- Какой threshold для paid-session idle risk принимает бизнес?
- Какие coupons реально доступны и кто их валидирует?
- Какой источник правды для payment/session status?
- Нужно ли блокировать risky messages или достаточно предупреждения?
- Какие dashboard formulas должны быть публичны для эксперта?
