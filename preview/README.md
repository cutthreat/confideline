# Preview Publishing

## Назначение
Папка `preview/` хранит статические HTML-превью, которые можно сразу показывать по ссылке без локального сервера.

## Базовый формат
Для каждого нового набора делаем отдельную папку:

- `preview/<slug>/index.html`
- `preview/<slug>/landing.html`
- `preview/<slug>/admin.html`
- `preview/<slug>/assets/...`

## Главное правило
Превью должно открываться и выглядеть достойно даже без выполнения JavaScript.

Это означает:
- ключевой контент должен быть уже пререндерен в HTML;
- локальные картинки и стили должны лежать рядом в `assets/`;
- не использовать ссылки на локальные `127.0.0.1` и файловые пути;
- не полагаться на runtime Yii2 или backend для показа макета.

## Рабочий механизм ссылок
Используем `htmlpreview` поверх `raw.githubusercontent`.

Шаблон:

`https://htmlpreview.github.io/?https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path-to-html>`

Пример:

`https://htmlpreview.github.io/?https://raw.githubusercontent.com/cutthreat/confideline/codex/confideline-expert-runtime/preview/expert-flow/index.html`

## Почему так
- браузер реально рендерит HTML, а не показывает сырой текст;
- не нужен локальный сервер;
- ссылка годится для демонстрации из любого места;
- можно использовать branch-based URL без commit hash.

## Перед отправкой ссылки
Нужно проверить:
- открывается `index.html`;
- открываются дочерние страницы;
- нет битых картинок;
- первый экран выглядит собрано без JS;
- тексты не содержат технического мусора.
