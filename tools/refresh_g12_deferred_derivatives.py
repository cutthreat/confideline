from pathlib import Path
import re

from docx import Document


ROOT = Path(r"H:\GPT-Codex\Confideline\reports\six-goals-functional-tz-2026-07-20")
HTML = ROOT / "tz-g1-2-for-igor.html"
DOCX = ROOT / "tz-g1-2-for-igor.docx"
CANONICAL = "chat-actions-templates-deferred-2026-08-13.md"

HTML_TEXT = (
    "Поле выбора шаблона и кнопки <code>Needs reply</code>, <code>Assign</code>, "
    "<code>Note</code>, <code>Resolve</code> в текущем HTML-макете являются "
    "визуальными точками действий. Полная логика кнопок отложена отдельным PM-решением. "
    "Каноничны три слоя каталога: системный список super-admin, шаблоны конкретного Эксперта "
    "и личные шаблоны оператора. Стартовый системный набор создаёт и публикует super-admin "
    "в отдельном функционале; после публикации он доступен авторизованным участникам рабочего admin-чата "
    "по permissions только для выбора; публичный Эксперт не является отдельным админским пользователем. Для записи нужны название, "
    "категория/сценарий, ровно одно положение доступности — Пинги (pings), Активный чат (active_chat) или Платный чат (paid_chat) — утверждённые RU/EN и список переменных. Селектор фильтрует каталог по текущему положению, сервер повторно проверяет placement при выборе и отправке. Макет сам по себе набор не утверждает."
)
DOCX_TEXT = (
    "Поле выбора шаблона и кнопки Needs reply, Assign, Note, Resolve в текущем HTML-макете "
    "являются визуальными точками действий. Полная логика кнопок отложена отдельным "
    "PM-решением. Каноничны три слоя каталога: системный список super-admin, шаблоны "
    "конкретного Эксперта и личные шаблоны оператора. Стартовый системный набор создаёт и "
    "публикует super-admin в отдельном функционале; после публикации он доступен авторизованным участникам рабочего admin-чата "
    "по permissions только для выбора; публичный Эксперт не является отдельным админским пользователем. Для записи нужны название, "
    "категория/сценарий, ровно одно положение доступности — Пинги (pings), Активный чат (active_chat) или Платный чат (paid_chat) — утверждённые RU/EN и список переменных. Селектор фильтрует каталог по текущему положению, сервер повторно проверяет placement при выборе и отправке. Макет сам по себе набор не утверждает."
)
LANGUAGE_HTML = (
    "<h3>Язык чата и результирующий язык клиента</h3>"
    "<p>При регистрации язык определяется существующей функцией по предпочтениям браузера и сохраняется в профиле. Клиент может изменить язык в профиле. Чат по умолчанию использует режим <code>AUTO</code> и актуальный язык профиля. Expert/Agent может сохранить результирующий язык для текущего диалога во вкладке Quality; профиль клиента это не меняет. Разовый выбор для одного сообщения не становится языком следующих сообщений. Super-admin может заблокировать изменение и сброс override на странице Настройки чата.</p>"
    "<p>Для каждого шаблона хранятся утверждённые версии RU и EN: при совпадении с эффективным языком выбирается нужная версия, а при её отсутствии в composer вставляется RU. Если текущий текст или доступный перевод не соответствует языку клиента, показывается небольшое модальное предупреждение с предложением перевести. Внешний переводчик запускается только после явного нажатия кнопки; поставщик пока не выбран. Исходный текст автоматически не заменяется, ручное редактирование результата и автоматическая отправка запрещены. Отправка выполняется только отдельной кнопкой <code>Отправить</code>.</p>"
)
VARIABLES_HTML = (
    "<h3>Переменные шаблонов (MVP allowlist)</h3>"
    "<p>Разрешены только <code>{{client_name}}</code>, <code>{{expert_name}}</code>, "
    "<code>{{price_min}}</code> (session snapshot, либо effective price выбранного Эксперта до создания session), <code>{{trial_min}}</code>, "
    "<code>{{consult_date}}</code>, <code>{{consult_time}}</code>, <code>{{timezone}}</code>, "
    "<code>{{consult_link}}</code>, <code>{{topup_link}}</code> и <code>{{support_link}}</code>. "
    "Подстановка выполняется сервером при показе и повторно при явной отправке. Если обязательное значение недоступно, шаблон не предлагается; literal-токены, внутренние ID, имя Агента, платёжные данные, raw balance, контакты, HTML/JS и произвольные URL запрещены. "
    "Ссылки формируются сервером, значения экранируются как обычный текст, а выбор шаблона не отправляет сообщение автоматически.</p>"
)
LANGUAGE_DOCX_HEADING = "Язык чата и результирующий язык клиента"
LANGUAGE_DOCX_TEXT = (
    "При регистрации язык определяется существующей функцией по предпочтениям браузера и сохраняется в профиле. Клиент может изменить язык в профиле. Чат по умолчанию использует режим AUTO и актуальный язык профиля. Expert/Agent может сохранить результирующий язык для текущего диалога во вкладке Quality; профиль клиента это не меняет. Разовый выбор для одного сообщения не становится языком следующих сообщений. Super-admin может заблокировать изменение и сброс override на странице Настройки чата. Для каждого шаблона хранятся утверждённые версии RU и EN: при совпадении с эффективным языком выбирается нужная версия, а при её отсутствии в composer вставляется RU. При несоответствии текущего текста или перевода языку клиента показывается небольшое модальное предложение перевода; запуск выполняется только по явной кнопке, поставщик пока не выбран. Исходный текст автоматически не заменяется, ручное редактирование перевода и автоматическая отправка запрещены. Отправка выполняется только отдельной кнопкой «Отправить»."
)
VARIABLES_DOCX_HEADING = "Переменные шаблонов (MVP allowlist)"
VARIABLES_DOCX_TEXT = (
    "Разрешены только переменные {{client_name}}, {{expert_name}}, "
    "{{price_min}} (session snapshot, либо effective price выбранного Эксперта до создания session), {{trial_min}}, {{consult_date}}, "
    "{{consult_time}}, {{timezone}}, {{consult_link}}, {{topup_link}} и {{support_link}}. "
    "Подстановка выполняется сервером при показе и повторно при явной отправке. Если обязательное значение недоступно, шаблон не предлагается и literal-токен не показывается. "
    "Внутренние ID, имя Агента, платёжные данные, raw balance, контакты, HTML/JS и произвольные URL запрещены; ссылки формируются сервером. Выбор шаблона не отправляет сообщение автоматически."
)

old_html_variants = (
    "<p>Шаблоны ответов являются необязательными редактируемыми подсказками. Агент самостоятельно выбирает или изменяет текст и явно отправляет его. Автоматическая отправка шаблона, AI-подсказки или подготовленного ответа запрещена.</p>",
    "<p>Поле выбора шаблона и кнопки <code>Needs reply</code>, <code>Assign</code>, <code>Note</code>, <code>Resolve</code> в текущем HTML-макете являются визуальными точками будущих действий. Полная логика, модальные окна, права, API, persistence, каталог, язык, перевод и переменные отложены отдельным PM-решением; до него server-side side effects запрещены. Автоматическая отправка будущего шаблона остаётся запрещённой.</p>",
    "<p>Поле выбора шаблона и кнопки <code>Needs reply</code>, <code>Assign</code>, <code>Note</code>, <code>Resolve</code> в текущем HTML-макете являются визуальными точками действий. Полная логика кнопок отложена отдельным PM-решением. Каноничны три слоя каталога: системный список super-admin, шаблоны конкретного Эксперта и личные шаблоны оператора. Стартовый системный набор создаёт и публикует super-admin; после публикации он доступен каждому Эксперту и оператору как базовый только для выбора. Личные шаблоны оператора редактирует только их создатель.</p>",
)
new_html_paragraph = f"<p>{HTML_TEXT}</p>"

html = HTML.read_text(encoding="utf-8")
html_changed = False
if '<span>Версия</span><b><code>2.2</code>' in html:
    html = html.replace('<span>Версия</span><b><code>2.2</code>', '<span>Версия</span><b><code>2.3</code>', 1)
    html = html.replace('<span>Дата</span><b><code>2026-08-09</code>', '<span>Дата</span><b><code>2026-08-13</code>', 1)
    html_changed = True
elif '<span>Версия</span><b><code>2.3</code>' in html:
    html = html.replace('<span>Версия</span><b><code>2.3</code>', '<span>Версия</span><b><code>2.4</code>', 1)
    html_changed = True
elif '<span>Версия</span><b><code>2.4</code>' in html:
    html = html.replace('<span>Версия</span><b><code>2.4</code>', '<span>Версия</span><b><code>2.5</code>', 1)
    html_changed = True
for old in old_html_variants:
    if old in html:
        html = html.replace(old, new_html_paragraph, 1)
        html_changed = True
html, replaced_template_paragraph = re.subn(
    r'<p>Поле выбора шаблона и кнопки .*?</p><h3>Язык чата и результирующий язык клиента</h3>',
    new_html_paragraph + '<h3>Язык чата и результирующий язык клиента</h3>',
    html,
    count=1,
    flags=re.S,
)
html_changed = html_changed or replaced_template_paragraph > 0
html, replaced_language = re.subn(
    r'<h3>Язык чата и результирующий язык клиента</h3>.*?<h3>Переменные шаблонов \(MVP allowlist\)</h3>',
    LANGUAGE_HTML + '<h3>Переменные шаблонов (MVP allowlist)</h3>',
    html,
    count=1,
    flags=re.S,
)
html_changed = html_changed or replaced_language > 0
old_scope = "<li>Ручные шаблоны и системные сообщения внутри чата.</li>"
new_scope = "<li>Визуальный placeholder действий внутри чата; системный каталог super-admin, Expert-scoped шаблоны и личные шаблоны оператора зафиксированы как трёхслойная модель. Каждый активный шаблон имеет ровно одно положение доступности: Пинги (pings), Активный чат (active_chat) или Платный чат (paid_chat); селектор фильтрует по нему, а сервер повторно проверяет placement. Semantics действий и расширенные сценарные правила отложены. MVP-allowlist переменных закреплён отдельным разделом.</li>"
if old_scope in html:
    html = html.replace(old_scope, new_scope, 1)
    html_changed = True
old_derivative_scope = "<li>Визуальный placeholder действий внутри чата; системный каталог super-admin и шаблоны конкретного Эксперта зафиксированы как двухуровневая модель, а semantics действий, язык, переводы и переменные отложены.</li>"
if old_derivative_scope in html:
    html = html.replace(old_derivative_scope, new_scope, 1)
    html_changed = True
html, replaced_scope = re.subn(
    r'<li>Визуальный placeholder действий внутри чата;.*?</li>',
    new_scope,
    html,
    count=1,
    flags=re.S,
)
html_changed = html_changed or replaced_scope > 0
if LANGUAGE_DOCX_HEADING not in html:
    html = html.replace(new_html_paragraph, new_html_paragraph + LANGUAGE_HTML, 1)
    html_changed = True
if "MVP allowlist" not in html:
    html = html.replace('<h2 id="8-цензура-контактов-и-защищённых-данных">', VARIABLES_HTML + '<h2 id="8-цензура-контактов-и-защищённых-данных">', 1)
    html_changed = True
else:
    html, replaced = re.subn(
        r'<h3>Переменные шаблонов \(MVP allowlist\)</h3>.*?<h2 id="8-цензура-контактов-и-защищённых-данных">',
        VARIABLES_HTML + '<h2 id="8-цензура-контактов-и-защищённых-данных">',
        html,
        count=1,
        flags=re.S,
    )
    html_changed = html_changed or replaced > 0
if CANONICAL not in html:
    html = html.replace(
        "<body>",
        f'<body><aside class="note"><b>Актуальное решение PM:</b> кнопки действий — visual-only placeholders; каталог имеет системный и экспертный уровни. Полный scope: <a href="{CANONICAL}">{CANONICAL}</a>.</aside>',
        1,
    )
    html_changed = True
HTML.write_text(html, encoding="utf-8")

doc = Document(DOCX)
old_docx = {
    "Шаблоны ответов являются необязательными редактируемыми подсказками. Агент самостоятельно выбирает или изменяет текст и явно отправляет его. Автоматическая отправка шаблона, AI-подсказки или подготовленного ответа запрещена.",
    "Поле выбора шаблона и кнопки Needs reply, Assign, Note, Resolve в текущем HTML-макете являются визуальными точками будущих действий. Полная логика, модальные окна, права, API, persistence, каталог, язык, перевод и переменные отложены отдельным PM-решением; до него server-side side effects запрещены. Автоматическая отправка будущего шаблона остаётся запрещённой.",
    "Поле выбора шаблона и кнопки Needs reply, Assign, Note, Resolve в текущем HTML-макете являются визуальными точками действий. Полная логика кнопок отложена отдельным PM-решением. Каноничны два уровня каталога: системный список super-admin и шаблоны конкретного Эксперта, видимые только этому Эксперту и его назначенным операторам. Десять текстов макета не считаются утверждённым стартовым наполнением.",
}
doc_changed = 0
for paragraph in doc.paragraphs:
    if paragraph.text in old_docx:
        paragraph.text = DOCX_TEXT
        doc_changed += 1
    if paragraph.text == "7.  Визуальный placeholder действий внутри чата; системный каталог super-admin и шаблоны конкретного Эксперта зафиксированы как двухуровневая модель, а semantics действий, язык, переводы и переменные отложены.":
        paragraph.text = "7.  Визуальный placeholder действий внутри чата; системный каталог super-admin, Expert-scoped шаблоны и личные шаблоны оператора зафиксированы как трёхслойная модель. Каждый активный шаблон имеет ровно одно положение доступности: Пинги (pings), Активный чат (active_chat) или Платный чат (paid_chat); селектор фильтрует по нему, а сервер повторно проверяет placement. Semantics действий и расширенные сценарные правила отложены. MVP-allowlist переменных закреплён отдельным разделом."
        doc_changed += 1
    elif paragraph.text.startswith("Поле выбора шаблона и кнопки Needs reply"):
        paragraph.text = DOCX_TEXT
        doc_changed += 1
    if paragraph.text == "Версия: 2.2":
        paragraph.text = "Версия: 2.5"
        doc_changed += 1
    elif paragraph.text == "Версия: 2.4":
        paragraph.text = "Версия: 2.5"
        doc_changed += 1
if not any(LANGUAGE_DOCX_HEADING in paragraph.text for paragraph in doc.paragraphs):
    target = next((paragraph for paragraph in doc.paragraphs if paragraph.text.startswith("8. Цензура")), None)
    if target is not None:
        target.insert_paragraph_before(LANGUAGE_DOCX_TEXT)
        target.insert_paragraph_before(LANGUAGE_DOCX_HEADING)
        doc_changed += 1
if not any(VARIABLES_DOCX_HEADING in paragraph.text for paragraph in doc.paragraphs):
    target = next((paragraph for paragraph in doc.paragraphs if paragraph.text.startswith("8. Цензура")), None)
    if target is not None:
        target.insert_paragraph_before(VARIABLES_DOCX_TEXT)
        target.insert_paragraph_before(VARIABLES_DOCX_HEADING)
        doc_changed += 1
else:
    paragraphs = doc.paragraphs
    for index, paragraph in enumerate(paragraphs):
        if paragraph.text == VARIABLES_DOCX_HEADING and index + 1 < len(paragraphs):
            paragraphs[index + 1].text = VARIABLES_DOCX_TEXT
            doc_changed += 1
            break
doc.save(DOCX)
print(f"updated HTML and DOCX; paragraphs={doc_changed}")
