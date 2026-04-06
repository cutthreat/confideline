<?php

use app\models\ExpertApplication;
use yii\helpers\Html;
use yii\helpers\Url;

/** @var \app\base\View $this */
/** @var ExpertApplication $model */
/** @var array $pageSettings */

$this->context->layout = 'expert-landing';
$this->title = $pageSettings['heroTitle'];

$homeUrl = Url::home();
$logoPng = Url::to('@web/YouDate-last/img/logo.png');
$logoWebp = Url::to('@web/YouDate-last/img/logo.webp');
$logoAvif = Url::to('@web/YouDate-last/img/logo.avif');
$expertPng = Url::to('@web/YouDate-last/img/hero/woman-8.png');
$expertWebp = Url::to('@web/YouDate-last/img/hero/woman-8.webp');
$expertAvif = Url::to('@web/YouDate-last/img/hero/woman-8.avif');
$specializations = ['Таро', 'Астрология', 'Нумерология', 'Отношения', 'Коучинг'];
?>
<div class="cl-wrapper">
    <div class="cl-content">
        <header class="cl-header fixed-top">
            <div class="container">
                <nav class="cl-header__navbar navbar navbar-expand-sm navbar-dark">
                    <a class="navbar-brand" href="<?= Html::encode($homeUrl) ?>">
                        <picture>
                            <source srcset="<?= Html::encode($logoAvif) ?>" type="image/avif">
                            <source srcset="<?= Html::encode($logoWebp) ?>" type="image/webp">
                            <img class="cl-header__logo" src="<?= Html::encode($logoPng) ?>" alt="Confideline">
                        </picture>
                    </a>

                    <button class="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#headerNav" aria-controls="headerNav" aria-expanded="false" aria-label="Переключить навигацию">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse justify-content-end" id="headerNav">
                        <div class="cl-header__nav py-3 py-sm-0 d-flex flex-column flex-sm-row align-items-end align-items-sm-center">
                            <a class="btn btn-outline-light" href="<?= Html::encode($homeUrl) ?>">На сайт</a>
                            <div class="cl-header__nav-buttons d-flex flex-row-reverse flex-sm-row align-items-center justify-content-between">
                                <a class="btn btn-outline-light" href="#apply"><?= Html::encode($pageSettings['primaryCtaLabel']) ?></a>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>

        <main class="cl-page">
            <section class="cl-expert-hero">
                <div class="container">
                    <div class="cl-expert-hero__panel">
                        <div class="row align-items-center">
                            <div class="col-lg-7">
                                <div class="cl-expert-hero__content">
                                    <span class="cl-expert-kicker">Для экспертов</span>
                                    <h1 class="cl-expert-title"><?= Html::encode($pageSettings['heroTitle']) ?></h1>
                                    <p class="cl-expert-lead">
                                        <?= Html::encode($pageSettings['heroLead']) ?>
                                    </p>

                                    <div class="cl-expert-actions">
                                        <a class="btn btn-secondary px-4" href="#apply"><?= Html::encode($pageSettings['primaryCtaLabel']) ?></a>
                                        <a class="btn btn-outline-light px-4" href="#details">Посмотреть требования</a>
                                    </div>

                                    <div class="row cl-expert-hero__metrics">
                                        <div class="col-md-4 mb-3 mb-md-0">
                                            <div class="cl-expert-stat">
                                                <strong>3 этапа</strong>
                                                <span>заявка, знакомство и мягкий старт в команде</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-3 mb-md-0">
                                            <div class="cl-expert-stat">
                                                <strong>1 путь</strong>
                                                <span>понятный процесс без спешки и лишних шагов</span>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="cl-expert-stat">
                                                <strong>0 шума</strong>
                                                <span>только ясные требования, аккуратная форма и бережная коммуникация</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-5">
                                <div class="cl-expert-side">
                                    <div class="cl-expert-preview">
                                        <div class="cl-expert-preview__media">
                                            <picture>
                                                <source srcset="<?= Html::encode($expertAvif) ?>" type="image/avif">
                                                <source srcset="<?= Html::encode($expertWebp) ?>" type="image/webp">
                                                <img src="<?= Html::encode($expertPng) ?>" alt="Профиль эксперта">
                                            </picture>
                                        </div>

                                        <div class="cl-expert-preview__body">
                                            <div class="cl-expert-preview__label">Профиль эксперта</div>
                                            <h3>Аккуратный вход в работу</h3>
                                            <p>Мы внимательно знакомимся с каждым экспертом, чтобы сохранить атмосферу доверия, качества и спокойной коммуникации внутри сервиса.</p>

                                            <ul class="cl-expert-preview__list">
                                                <li>Понятная анкета без перегруза</li>
                                                <li>Внимание к опыту и стилю общения</li>
                                                <li>Бережное знакомство перед стартом</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div class="cl-expert-note">
                                        <span class="cl-expert-note__eyebrow">Важно</span>
                                        <p>Нам важны не только знания, но и тон общения, внутренняя собранность и умение поддержать человека бережно и ясно.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-section" id="details">
                <div class="container">
                    <div class="row align-items-end cl-expert-section__head">
                        <div class="col-lg-5 mb-3 mb-lg-0">
                            <span class="cl-expert-section__eyebrow">Почему это важно</span>
                            <h2>Здесь все собрано так, чтобы эксперт сразу чувствовал уровень и стиль сервиса.</h2>
                        </div>
                        <div class="col-lg-7">
                            <p class="cl-expert-section__lead">Страница помогает с первого экрана понять ожидания, формат общения и сам характер платформы. Это не сухая анкета, а спокойная и уверенная точка входа для сильных специалистов.</p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-lg-4 mb-4">
                            <article class="cl-expert-card">
                                <span class="cl-expert-card__badge">01</span>
                                <h3>Спокойный визуальный тон</h3>
                                <p>Мягкие акценты, чистые карточки и уверенная композиция сразу создают ощущение аккуратного и взрослого сервиса.</p>
                            </article>
                        </div>
                        <div class="col-lg-4 mb-4">
                            <article class="cl-expert-card">
                                <span class="cl-expert-card__badge">02</span>
                                <h3>Понятный путь</h3>
                                <p>Сначала человек видит ценность и формат работы, затем требования, и только после этого спокойно заполняет заявку.</p>
                            </article>
                        </div>
                        <div class="col-lg-4 mb-4">
                            <article class="cl-expert-card">
                                <span class="cl-expert-card__badge">03</span>
                                <h3>Уважение к кандидату</h3>
                                <p>Никакой перегрузки, случайных деталей и ощущения черновика. Все выглядит собранно, уверенно и по делу.</p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-section">
                <div class="container">
                    <div class="cl-expert-process">
                        <div class="row align-items-center">
                            <div class="col-lg-4 mb-4 mb-lg-0">
                                <div class="cl-expert-process__intro">
                                    <span class="cl-expert-section__eyebrow cl-expert-section__eyebrow--light">Этапы</span>
                                    <h3><?= Html::encode($pageSettings['processTitle']) ?></h3>
                                    <p>Мы стараемся сделать путь прозрачным и спокойным: без суеты, с понятным ожиданием на каждом шаге.</p>
                                </div>
                            </div>

                            <div class="col-lg-8">
                                <div class="row">
                                    <div class="col-md-4 mb-3 mb-md-0">
                                        <div class="cl-expert-process-step">
                                            <strong>Шаг 1</strong>
                                            <h4>Заявка</h4>
                                            <p>Вы оставляете контакты, рассказываете о специализации, опыте и том, как обычно работаете с людьми.</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3 mb-md-0">
                                        <div class="cl-expert-process-step">
                                            <strong>Шаг 2</strong>
                                            <h4>Знакомство</h4>
                                            <p>Мы внимательно изучаем анкету, можем задать уточняющие вопросы и возвращаемся с аккуратной обратной связью.</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="cl-expert-process-step">
                                            <strong>Шаг 3</strong>
                                            <h4>Старт</h4>
                                            <p>После согласования мы помогаем спокойно пройти подключение и подготовиться к началу работы на платформе.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-section">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-6 mb-4">
                            <article class="cl-expert-card cl-expert-card--list">
                                <span class="cl-expert-card__badge">Подход</span>
                                <h3><?= Html::encode($pageSettings['requirementsTitle']) ?></h3>
                                <ul>
                                    <li>практикующих экспертов с четкой специализацией и понятной подачей</li>
                                    <li>людей с аккуратной письменной коммуникацией и внятным профилем</li>
                                    <li>кандидатов, готовых к спокойному знакомству и уточняющим вопросам</li>
                                    <li>профили, где есть опыт, метод и человеческое описание, а не пустая заготовка</li>
                                </ul>
                            </article>
                        </div>
                        <div class="col-lg-6 mb-4">
                            <article class="cl-expert-card cl-expert-card--list">
                                <span class="cl-expert-card__badge">Ценности</span>
                                <h3>Что для нас особенно важно</h3>
                                <ul>
                                    <li>бережный и зрелый стиль общения без давления и резких формулировок</li>
                                    <li>умение объяснять сложное спокойно, ясно и с уважением к человеку</li>
                                    <li>внутренняя собранность, ответственность и аккуратность в деталях</li>
                                    <li>желание работать в среде, где качество важнее скорости ради скорости</li>
                                </ul>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-section" id="apply">
                <div class="container">
                    <div class="cl-expert-form-box">
                        <div class="row">
                            <div class="col-lg-4 mb-4 mb-lg-0">
                                <div class="cl-expert-form-box__intro">
                                    <span class="cl-expert-section__eyebrow">Заявка</span>
                                    <h3>Подать заявку</h3>
                                    <p class="cl-expert-form-box__lead">Расскажите о себе коротко и по существу. Этой информации достаточно, чтобы мы поняли ваш профиль, опыт и формат общения.</p>

                                    <div class="cl-expert-form-aside">
                                        <h4>Что лучше указать</h4>
                                        <ul>
                                            <li>контакты и публичное имя</li>
                                            <li>специализацию и язык консультаций</li>
                                            <li>опыт, график и таймзону</li>
                                            <li>описание подхода и внешние ссылки</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div class="col-lg-8">
                                <?php if (Yii::$app->session->hasFlash('success')): ?>
                                    <div class="alert alert-success">
                                        <?= Html::encode(Yii::$app->session->getFlash('success')) ?>
                                    </div>
                                <?php endif; ?>

                                <?= Html::errorSummary($model, ['class' => 'alert alert-danger']) ?>

                                <form action="" method="post">
                                    <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->getCsrfToken() ?>">
                                    <div class="form-row">
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-full_name">Имя и фамилия</label>
                                            <?= Html::activeTextInput($model, 'full_name', ['id' => 'expertapplication-full_name', 'class' => 'form-control', 'placeholder' => 'Анна Петрова']) ?>
                                        </div>
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-display_name">Публичное имя</label>
                                            <?= Html::activeTextInput($model, 'display_name', ['id' => 'expertapplication-display_name', 'class' => 'form-control', 'placeholder' => 'Анна Петрова']) ?>
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-email">Email</label>
                                            <?= Html::activeTextInput($model, 'email', ['id' => 'expertapplication-email', 'class' => 'form-control', 'placeholder' => 'anna@example.com']) ?>
                                        </div>
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-contact">Telegram или WhatsApp</label>
                                            <?= Html::activeTextInput($model, 'contact', ['id' => 'expertapplication-contact', 'class' => 'form-control', 'placeholder' => '@annapetrova']) ?>
                                        </div>
                                    </div>

                                    <fieldset class="cl-expert-fieldset">
                                        <legend>Специализация</legend>
                                        <div class="cl-expert-chip-list">
                                            <?php foreach ($specializations as $specialization): ?>
                                                <label class="cl-expert-chip">
                                                    <?= Html::checkbox('ExpertApplication[specializationsList][]', in_array($specialization, $model->specializationsList, true), ['value' => $specialization]) ?>
                                                    <?= Html::encode($specialization) ?>
                                                </label>
                                            <?php endforeach; ?>
                                        </div>
                                    </fieldset>

                                    <div class="form-row">
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-languages">Языки консультаций</label>
                                            <?= Html::activeTextInput($model, 'languages', ['id' => 'expertapplication-languages', 'class' => 'form-control', 'placeholder' => 'Русский, English']) ?>
                                        </div>
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-experience">Опыт</label>
                                            <?= Html::activeDropDownList($model, 'experience', [
                                                '' => 'Выберите диапазон',
                                                'До 1 года' => 'До 1 года',
                                                '1-3 года' => '1-3 года',
                                                '3-5 лет' => '3-5 лет',
                                                '5+ лет' => '5+ лет',
                                            ], ['id' => 'expertapplication-experience', 'class' => 'custom-select']) ?>
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-country">Страна</label>
                                            <?= Html::activeTextInput($model, 'country', ['id' => 'expertapplication-country', 'class' => 'form-control', 'placeholder' => 'Беларусь']) ?>
                                        </div>
                                        <div class="col-md-6 cl-expert-field">
                                            <label for="expertapplication-timezone">Часовой пояс</label>
                                            <?= Html::activeTextInput($model, 'timezone', ['id' => 'expertapplication-timezone', 'class' => 'form-control', 'placeholder' => 'Europe/Minsk (UTC+3)']) ?>
                                        </div>
                                    </div>

                                    <div class="cl-expert-field">
                                        <label for="expertapplication-availability">График и доступность</label>
                                        <?= Html::activeTextarea($model, 'availability', ['id' => 'expertapplication-availability', 'class' => 'form-control', 'placeholder' => 'Когда готовы работать, сколько времени готовы уделять консультациям и в какие часы вам удобно быть на связи.']) ?>
                                    </div>

                                    <div class="cl-expert-field">
                                        <label for="expertapplication-about">О себе и подходе</label>
                                        <?= Html::activeTextarea($model, 'about', ['id' => 'expertapplication-about', 'class' => 'form-control', 'placeholder' => 'Коротко расскажите о своем опыте, методе работы и темах, с которыми вы помогаете людям.']) ?>
                                        <div class="cl-expert-field__hint">Лучше коротко, ясно и по существу. Нам важно понять ваш стиль, опыт и характер общения.</div>
                                    </div>

                                    <div class="cl-expert-field">
                                        <label for="expertapplication-links">Портфолио, отзывы или социальные сети</label>
                                        <?= Html::activeTextInput($model, 'links', ['id' => 'expertapplication-links', 'class' => 'form-control', 'placeholder' => 'https://..., https://...']) ?>
                                    </div>

                                    <fieldset class="cl-expert-fieldset">
                                        <legend>Подтверждения</legend>
                                        <div class="cl-expert-chip-list">
                                            <label class="cl-expert-chip">
                                                <?= Html::activeCheckbox($model, 'consent_review', ['label' => false]) ?>
                                                Согласен на рассмотрение анкеты
                                            </label>
                                            <label class="cl-expert-chip">
                                                <?= Html::activeCheckbox($model, 'consent_followup', ['label' => false]) ?>
                                                Готов ответить на уточняющие вопросы
                                            </label>
                                            <label class="cl-expert-chip">
                                                <?= Html::activeCheckbox($model, 'consent_data', ['label' => false]) ?>
                                                Подтверждаю достоверность данных
                                            </label>
                                        </div>
                                    </fieldset>

                                    <div class="cl-expert-form-footer">
                                        <div class="cl-expert-form-footer__note">После отправки мы внимательно изучим анкету и вернемся к вам с ответом следующим понятным шагом.</div>
                                        <button class="btn btn-secondary px-4" type="submit"><?= Html::encode($pageSettings['primaryCtaLabel']) ?></button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-section">
                <div class="container">
                    <div class="row align-items-end cl-expert-section__head">
                        <div class="col-lg-4 mb-3 mb-lg-0">
                            <span class="cl-expert-section__eyebrow">Ответы на вопросы</span>
                            <h2><?= Html::encode($pageSettings['faqTitle']) ?></h2>
                        </div>
                        <div class="col-lg-8">
                            <p class="cl-expert-section__lead">Здесь собраны самые частые вопросы, чтобы до подачи заявки было проще понять формат и ожидания.</p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-lg-6 mb-3">
                            <details class="cl-expert-faq-item" open>
                                <summary>Это отдельная страница внутри текущего сайта?</summary>
                                <p>Да. Она продолжает визуальный стиль Confideline и воспринимается как естественная часть сервиса.</p>
                            </details>
                        </div>
                        <div class="col-lg-6 mb-3">
                            <details class="cl-expert-faq-item">
                                <summary>Когда я получу ответ после заявки?</summary>
                                <p>Мы рассматриваем анкеты внимательно и стараемся возвращаться с обратной связью без лишних задержек.</p>
                            </details>
                        </div>
                        <div class="col-lg-6 mb-3 mb-lg-0">
                            <details class="cl-expert-faq-item">
                                <summary>Нужно ли подробно описывать свой подход?</summary>
                                <p>Да, но без перегруза. Лучше коротко и ясно рассказать, как вы работаете, с какими запросами помогаете и чем отличаетесь.</p>
                            </details>
                        </div>
                        <div class="col-lg-6">
                            <details class="cl-expert-faq-item">
                                <summary>Что происходит после согласования?</summary>
                                <p>Мы помогаем пройти следующий шаг спокойно и последовательно, чтобы старт работы был комфортным и понятным.</p>
                            </details>
                        </div>
                    </div>
                </div>
            </section>

            <section class="cl-expert-footer">
                <div class="container">
                    <div class="cl-expert-footer__box">
                        Если вы чувствуете, что ваш опыт и стиль общения совпадают с атмосферой Confideline, оставьте заявку и расскажите о себе.
                    </div>
                </div>
            </section>
        </main>
    </div>
</div>
