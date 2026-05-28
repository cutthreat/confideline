<?php

use app\helpers\Url;
use app\models\Geoname;
use yii\helpers\Html;
use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $model app\models\Geoname */
/* @var $country app\models\Country|null */

$this->title = (string)$model->name;
$this->context->layout = 'page-main';
\yii\web\YiiAsset::register($this);
$this->params['seoTitle'] = $model->metaTitle;
$this->params['seoDescription'] = $model->metaDescription;

$breadcrumbs[] = ['label' => Yii::t('custom', 'Home'), 'url' => Url::to(['/'])];
$breadcrumbs[] = ['label' => Yii::t('custom', 'Countries'), 'url' => Url::to(['/country/index'])];
if ($country) {
    $breadcrumbs[] = ['label' => $country->name, 'url' => Url::to(['/country/view', 'slug' => $country->slug])];
    $breadcrumbs[] = ['label' => Yii::t('custom', 'Cities'), 'url' => Url::to(['/city/index', 'country' => $model->country])];
}
$breadcrumbs[] = ['label' => Html::encode($this->title)];

$countryCode = strtoupper(trim((string)$model->country));
$cityName = trim((string)$model->name);
$countryName = $country ? trim((string)$country->name) : '';
$locationLabel = trim($cityName . ($countryName !== '' ? ', ' . $countryName : ''));
$flagUrl = preg_match('/^[A-Z]{2}$/', $countryCode) ? 'https://flagcdn.com/w80/' . strtolower($countryCode) . '.png' : '';
$coverPhoto = isset($model->cover_photo_path) ? (string)$model->getPhotoThumbnail(false) : '';
$mainPhoto = isset($model->main_photo_path) ? (string)$model->getPhotoThumbnail() : '';
$heroPhoto = $coverPhoto !== '' ? $coverPhoto : $mainPhoto;
$descriptionText = trim(strip_tags((string)$model->htmlDescription));
$descriptionLead = StringHelper::truncate($descriptionText, 220, '...');
$seoText = trim((string)$model->seoText);
$pageH1 = trim((string)($model->h1 ?? ''));
if ($pageH1 === '') {
    $pageH1 = (string)$model->name;
}
$heroLead = $seoText !== '' ? $seoText : $descriptionLead;
$latitude = trim((string)$model->latitude);
$longitude = trim((string)$model->longitude);
$hasCoordinates = $latitude !== '' && $longitude !== '';
$population = (int)$model->population > 0 ? number_format((int)$model->population, 0, '.', ' ') : '';
$mapUrl = $hasCoordinates
    ? 'https://www.openstreetmap.org/?mlat=' . rawurlencode($latitude) . '&mlon=' . rawurlencode($longitude) . '#map=11/' . rawurlencode($latitude) . '/' . rawurlencode($longitude)
    : '';
$startConsultationUrl = Url::to(['/registration/register']);

$consultationScenarios = [
    [
        'icon' => 'fe-heart',
        'title' => 'Отношения и выбор',
        'text' => 'Разобрать ситуацию в паре, паузу в общении, расставание или новый контакт без давления и обещаний.',
    ],
    [
        'icon' => 'fe-message-circle',
        'title' => 'Личный текстовый чат',
        'text' => 'Задать вопрос консультанту и получить аккуратный ответ в приватном формате, без публичности.',
    ],
    [
        'icon' => 'fe-star',
        'title' => 'Астрология и совместимость',
        'text' => 'Посмотреть тему через натальную карту, синастрию, прогноз или астрокартографический контекст.',
    ],
    [
        'icon' => 'fe-compass',
        'title' => 'Переезд и городская энергия',
        'text' => 'Использовать город как локальный контекст для вопросов о переменах, адаптации и личном выборе.',
    ],
];
$trustCards = [
    ['title' => 'Человеческий ответ', 'text' => 'консультант отвечает по вашему вопросу, а не по общей заготовке'],
    ['title' => 'Один понятный старт', 'text' => 'без подписки, кредитной путаницы и скрытого автосписания'],
    ['title' => 'Деликатные темы', 'text' => 'отношения, сомнения и личные решения остаются в приватном чате'],
    ['title' => 'Без жестких обещаний', 'text' => 'формулировки остаются поддерживающими, без гарантий и давления'],
];
$nearbyCities = [];
try {
    $nearbyCities = Geoname::find()
        ->cities()
        ->whereCountry($model->country)
        ->andWhere(['<>', 'geoname_id', $model->geoname_id])
        ->orderBy(['population' => SORT_DESC, 'name' => SORT_ASC])
        ->limit(6)
        ->all();
} catch (\Throwable $exception) {
    $nearbyCities = [];
}

$this->registerCssFile('@web/css/home.css', [
    'depends' => [\yii\web\YiiAsset::class],
]);
?>
<?= \app\helpers\SeoHelper::breadCrumb($breadcrumbs, null) ?>
<div class="city-view geo-page geo-page--city">
    <header class="geo-page__hero geo-city-hero">
        <div class="geo-page__hero-copy">
            <div class="geo-page__meta">
                <span>Эзотерическая консультация</span>
                <?php if ($countryCode !== ''): ?>
                    <span><?= Html::encode($countryCode) ?></span>
                <?php endif; ?>
                <?php if ($population !== ''): ?>
                    <span><?= Html::encode($population) ?> жителей</span>
                <?php endif; ?>
            </div>
            <h1 class="geo-page__title"><?= Html::encode($pageH1) ?></h1>
            <?php if ($heroLead !== ''): ?>
                <p class="geo-page__lead"><?= Html::encode($heroLead) ?></p>
            <?php endif; ?>

            <div class="geo-city-hero__actions">
                <?= Html::a('Начать консультацию', $startConsultationUrl, ['class' => 'btn btn-secondary']) ?>
                <?= Html::a('Как это работает', '#city-consultation-flow', ['class' => 'btn btn-outline-light']) ?>
            </div>
        </div>

        <figure class="geo-page__media<?= $heroPhoto === '' ? ' geo-page__media--empty' : '' ?>">
            <?php if ($heroPhoto !== ''): ?>
                <img src="<?= Html::encode($heroPhoto) ?>" class="geo-page__media-img" alt="<?= Html::encode($this->title) ?>" loading="eager">
            <?php else: ?>
                <div class="geo-page__media-fallback">
                    <span><?= Html::encode($countryCode !== '' ? $countryCode : $this->title) ?></span>
                </div>
            <?php endif; ?>
        </figure>
    </header>

    <?= Html::beginForm($startConsultationUrl, 'get', ['class' => 'geo-city-intake']) ?>
        <?= Html::hiddenInput('city', $cityName) ?>
        <?= Html::hiddenInput('country', $countryCode) ?>
        <div class="geo-city-intake__grid">
            <label>
                <span>Тема</span>
                <select class="form-control" name="topic" aria-label="Тема консультации">
                    <option value="relationship">Отношения</option>
                    <option value="compatibility">Совместимость</option>
                    <option value="forecast">Прогноз</option>
                    <option value="relocation">Переезд</option>
                </select>
            </label>
            <label>
                <span>Формат</span>
                <select class="form-control" name="format" aria-label="Формат консультации">
                    <option value="text">Текстовый чат</option>
                    <option value="same-advisor">Тот же консультант</option>
                </select>
            </label>
            <label>
                <span>Город</span>
                <input class="form-control" type="text" name="cityName" value="<?= Html::encode($cityName) ?>" aria-label="Город">
            </label>
            <label>
                <span>Когда удобно</span>
                <select class="form-control" name="timing" aria-label="Когда удобно">
                    <option value="now">Сейчас</option>
                    <option value="later">Позже сегодня</option>
                </select>
            </label>
            <button class="btn btn-primary" type="submit">Подобрать консультанта</button>
        </div>
    <?= Html::endForm() ?>

    <div class="geo-page__layout">
        <main class="geo-page__main">
            <section class="geo-page__section" id="city-consultation-flow">
                <div class="geo-page__section-head">
                    <h2>С чем приходят на консультацию<?= $locationLabel !== '' ? ': ' . Html::encode($locationLabel) : '' ?></h2>
                    <p>Городская структура нужна для ориентации и SEO, но смысл страницы остается в продукте Confideline: приватная эзотерическая консультация по личному вопросу.</p>
                </div>
                <div class="geo-city-ideas">
                    <?php foreach ($consultationScenarios as $idea): ?>
                        <article class="geo-city-idea">
                            <i class="fe <?= Html::encode($idea['icon']) ?>" aria-hidden="true"></i>
                            <h3><?= Html::encode($idea['title']) ?></h3>
                            <p><?= Html::encode($idea['text']) ?></p>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>

            <article class="geo-page__article">
                <?php if (trim((string)$model->htmlDescription) !== ''): ?>
                    <?= $model->htmlDescription ?>
                <?php else: ?>
                    <p class="text-muted mb-0">Описание пока не заполнено.</p>
                <?php endif; ?>
            </article>

            <section class="geo-page__section">
                <div class="geo-page__section-head">
                    <h2>Что важно в первом обращении</h2>
                    <p>Страница должна вести к понятному и безопасному разговору с консультантом, а не к чужой продуктовой механике.</p>
                </div>
                <div class="geo-city-interests">
                    <?php foreach ($trustCards as $card): ?>
                        <article class="geo-city-interest">
                            <h3><?= Html::encode($card['title']) ?></h3>
                            <p><?= Html::encode($card['text']) ?></p>
                        </article>
                    <?php endforeach; ?>
                </div>
            </section>

            <?php if (!empty($nearbyCities)): ?>
                <section class="geo-page__section">
                    <div class="geo-page__section-head">
                        <h2>Другие города этой страны</h2>
                        <p>Внутренняя навигация оставляет локальный SEO-контекст, но не меняет продуктовую механику консультаций.</p>
                    </div>
                    <div class="geo-city-links">
                        <?php foreach ($nearbyCities as $nearbyCity): ?>
                            <?= Html::a(Html::encode($nearbyCity->name), ['/city/view', 'slug' => $nearbyCity->slug], ['class' => 'geo-city-link']) ?>
                        <?php endforeach; ?>
                    </div>
                </section>
            <?php endif; ?>

            <?php if ($seoText !== ''): ?>
                <section class="geo-page__seo">
                    <h2>Коротко о странице</h2>
                    <p><?= Html::encode($seoText) ?></p>
                </section>
            <?php endif; ?>
        </main>

        <aside class="geo-page__aside">
            <h2 class="geo-page__aside-title">Город</h2>

            <?php if ($flagUrl !== ''): ?>
                <div class="geo-page__flag">
                    <img src="<?= Html::encode($flagUrl) ?>" alt="<?= Html::encode($countryCode) ?>" width="28" height="20" loading="lazy">
                    <span><?= Html::encode($countryCode) ?></span>
                </div>
            <?php endif; ?>

            <dl class="geo-page__facts">
                <div>
                    <dt>Страница</dt>
                    <dd><?= Html::encode((string)$model->slug) ?></dd>
                </div>
                <div>
                    <dt>Страна</dt>
                    <dd><?= Html::encode($countryCode !== '' ? $countryCode : '-') ?></dd>
                </div>
                <?php if ($hasCoordinates): ?>
                    <div>
                        <dt>Координаты</dt>
                        <dd><?= Html::encode($latitude) ?>, <?= Html::encode($longitude) ?></dd>
                    </div>
                <?php endif; ?>
            </dl>

            <div class="geo-page__actions">
                <?= Html::a('К списку городов', ['city/index', 'country' => $model->country], ['class' => 'btn btn-outline-secondary btn-sm btn-block']) ?>
                <?php if ($country): ?>
                    <?= Html::a('Открыть страну', ['country/view', 'slug' => $country->slug], ['class' => 'btn btn-primary btn-sm btn-block']) ?>
                <?php endif; ?>
                <?= Html::a('Начать консультацию', $startConsultationUrl, ['class' => 'btn btn-secondary btn-sm btn-block']) ?>
                <?php if ($mapUrl !== ''): ?>
                    <?= Html::a('Открыть на карте', $mapUrl, ['class' => 'btn btn-outline-primary btn-sm btn-block', 'target' => '_blank', 'rel' => 'noopener noreferrer']) ?>
                <?php endif; ?>
            </div>
        </aside>
    </div>
</div>
