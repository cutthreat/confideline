# Confideline Public Accessibility Audit

- Status: FAIL
- Started: 2026-05-09T17:25:37.660Z
- Finished: 2026-05-09T17:30:23.000Z
- Routes: /en, /en/login, /en/signup
- Unique violations: button-name, color-contrast, meta-viewport, select-name, label, link-in-text-block

## Findings для Игоря

### FAIL: /en / desktop

- Нарушений: 4
- Затронутых элементов: 14
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-desktop.png
- critical / button-name: Кнопка без доступного имени: пользователь и скринридер не понимают, что делает элемент.
  Target: button[data-dismiss="alert"]
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: .container > a | .subtitle | .select-group-sex > .select-group-title
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]
- critical / select-name: Select без названия: дата/значение выбирается, но поле не имеет понятной подписи.
  Target: #register-form-dobday | #register-form-dobmonth | #register-form-dobyear

### FAIL: /en/login / desktop

- Нарушений: 2
- Затронутых элементов: 5
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-login-desktop.png
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: a[href$="request"] | button | a[href$="resend"]
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]

### FAIL: /en/signup / desktop

- Нарушений: 4
- Затронутых элементов: 12
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-signup-desktop.png
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: .terms | a[href$="terms-and-conditions"] | a[href$="privacy-policy"]
- critical / label: Input/radio без корректной label-связи: форма выглядит рабочей, но доступность и кликабельность слабые.
  Target: input[value="1"] | input[value="2"]
- serious / link-in-text-block: Ссылка в тексте отличается только цветом: для части пользователей она неочевидна.
  Target: a[href$="terms-and-conditions"] | a[href$="privacy-policy"] | a[href$="cookie-policy"]
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]

### FAIL: /en / mobile

- Нарушений: 4
- Затронутых элементов: 14
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-mobile.png
- critical / button-name: Кнопка без доступного имени: пользователь и скринридер не понимают, что делает элемент.
  Target: button[data-dismiss="alert"]
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: .container > a | .subtitle | .select-group-sex > .select-group-title
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]
- critical / select-name: Select без названия: дата/значение выбирается, но поле не имеет понятной подписи.
  Target: #register-form-dobday | #register-form-dobmonth | #register-form-dobyear

### FAIL: /en/login / mobile

- Нарушений: 2
- Затронутых элементов: 5
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-login-mobile.png
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: a[href$="request"] | button | a[href$="resend"]
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]

### FAIL: /en/signup / mobile

- Нарушений: 4
- Затронутых элементов: 12
- Screenshot: H:\GPT-Codex\Confideline\qa-ba-autonomous-tester\reports\public-accessibility-audit-20260509-172537\en-signup-mobile.png
- serious / color-contrast: Недостаточный контраст текста: часть пользователей хуже читает форму/ссылки.
  Target: .terms | a[href$="terms-and-conditions"] | a[href$="privacy-policy"]
- critical / label: Input/radio без корректной label-связи: форма выглядит рабочей, но доступность и кликабельность слабые.
  Target: input[value="1"] | input[value="2"]
- serious / link-in-text-block: Ссылка в тексте отличается только цветом: для части пользователей она неочевидна.
  Target: a[href$="terms-and-conditions"] | a[href$="privacy-policy"] | a[href$="cookie-policy"]
- moderate / meta-viewport: Viewport запрещает масштабирование или настроен не по стандарту доступности.
  Target: meta[name="viewport"]
