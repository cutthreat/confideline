<?php

use app\helpers\Html;
use dosamigos\chartjs\ChartJs;
use yii\helpers\ArrayHelper;

/* @var $this \app\base\View */
/* @var $counters array */
/* @var $info array */
/* @var $charts array */

$this->title = Yii::t('app', 'Дашборд');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Дашборд'), 'url' => ['index']];

$funnelRows = [
    ['Просмотр эксперта / каталога', '2,940', '100%', 'Верх воронки спроса'],
    ['Создан запрос на консультацию', '482', '16.4%', 'Доверие / попадание в оффер'],
    ['Принято экспертом', '291', '60.4%', 'Доступность + SLA'],
    ['Старт бесплатных минут (presales)', '214', '73.5%', 'Первый контакт до оплаты'],
    ['Бесплатные минуты исчерпаны / показан paywall', '178', '83.2%', 'Клиент уперся в точку оплаты'],
    ['Первая оплаченная минута', '129', '72.5%', 'Главная продуктовая конверсия'],
    ['Списанные оплаченные минуты', '4,346', '33.7 / paying session', 'Основная монетизация'],
    ['Повторная платная сессия', '58', '24.6%', 'Сигнал удержания / ценности'],
];

$revenueRows = [
    ['Кредиты из подписки', '$4,200', '28%'],
    ['Пакеты кредитов', '$6,920', '47%'],
    ['Автопополнение', '$2,180', '15%'],
    ['Продление сессии', '$1,560', '10%'],
];

$expertRows = [
    ['Экспертов онлайн сейчас', '17', '10+'],
    ['Медианный первый ответ', '8 мин', 'до 10 мин'],
    ['Запросы без ответа > 10 мин', '5', '< 3'],
    ['Доля принятия', '60.4%', '55%+'],
    ['Конверсия в оплату у сильной когорты экспертов', '68%', 'масштабировать лучшую практику'],
    ['Средний рейтинг после сессии', '4.8 / 5', '4.7+'],
];

$minuteRows = [
    ['Средний расход бесплатных минут', '2.7 мин', 'Контроль presales-плеча'],
    ['Доля сессий, где бесплатные минуты исчерпаны без оплаты', '39.7%', 'Потеря в точке перехода в оплату'],
    ['Средняя длительность платной сессии', '18.4 мин', 'Стабильно'],
    ['От запроса до первой оплаченной минуты', '11.8 мин', 'Ключевой latency-маркер'],
    ['ARPPU', '$115', 'Средняя выручка на paying client'],
    ['Выручка на принятую консультацию', '$51.1', 'Связка SLA и денег'],
    ['GMV за минуту', '$3.42', 'Контроль unit-экономики'],
    ['Доля продлений сессии', '19%', 'Потенциал роста'],
    ['Доля refund / dispute', '1.8%', 'Не допускать роста'],
];

$queueRows = [
    ['Новые запросы без ответа', '23', '19 мин', 'success', 'OK'],
    ['Запросы старше SLA', '5', '14 мин', 'warning', 'Риск потери спроса'],
    ['Показан paywall, но нет первой оплаты', '49', '31 мин', 'warning', 'Теряем переход в оплату'],
    ['Стартовали, но не дошли до списания', '11', '22 мин', 'warning', 'Нужен разбор'],
    ['Повторные попытки payment webhook', '3', '41 мин', 'warning', 'Внимание'],
    ['Эксперты с высоким перекосом free / no-paid', '4', 'за 24 часа', 'warning', 'Разобрать'],
    ['Refund / dispute spikes', '2', 'за 24 часа', 'warning', 'Следить'],
    ['Неуспешные jobs', (string) $info['queueSize'], '15 мин', $info['queueSize'] ? 'warning' : 'success', $info['queueSize'] ? 'Очередь не пуста' : 'OK'],
    ['Нехватка экспертов в пиковые часы', '2', 'пиковые часы', 'warning', 'Следить'],
];

$blockerRows = [
    ['Запросы ждут ответа дольше 10 минут', '5 диалогов', 'Падает шанс старта и выхода в бесплатный пресейл'],
    ['Бесплатные минуты заканчиваются без оплаты', '85 сессий', 'Нужно чинить paywall и продуктовый оффер'],
    ['Конверсия первой оплаты ниже цели', '60.3%', 'Нужно дотянуть до 65%+'],
    ['Платежные ретраи копятся в webhook', '3 события', 'Риск потери автопополнений и продлений'],
];

$repeatRows = [
    ['Повтор в 7 дней', '18.2%', 'Ранний возврат после первой платной сессии'],
    ['Повтор в 30 дней', '24.6%', 'Основная метрика удержания'],
    ['Доля выручки от повторных клиентов', '36%', 'Качество и глубина продукта'],
    ['Топ-когорта экспертов по повторам', '31%', 'Есть воспроизводимая лучшая практика'],
    ['Клиенты без повтора после первой оплаты', '75.4%', 'Главная зона роста удержания'],
];

$ltvRows = [
    ['LTV D7', '$38', 'Сколько клиент приносит за первые 7 дней после первой оплаты'],
    ['LTV D30', '$92', 'Главный рабочий ориентир для короткого цикла возврата'],
    ['LTV D90', '$146', 'Полная монетизация ядра удержанных клиентов'],
    ['Окупаемость привлечения', '13 дней', 'Когда первая когорта отбивает стоимость привлечения'],
    ['LTV по сильной когорте экспертов', '$171', 'Есть upside за счет качества консультаций'],
    ['LTV по слабой когорте free -> paid', '$54', 'Главная проблемная группа для доработки'],
];

$chartOptions = [
    'options' => [
        'height' => 250,
        'width' => 600,
    ],
    'clientOptions' => [
        'maintainAspectRatio' => false,
        'legend' => [
            'display' => true,
            'position' => 'bottom',
        ],
        'scales' => [
            'yAxes' => [
                [
                    'gridLines' => ['color' => 'rgba(0, 0, 0, 0.05)'],
                    'ticks' => ['suggestedMin' => 0],
                ],
            ],
            'xAxes' => [
                [
                    'gridLines' => ['display' => false],
                ],
            ],
        ],
    ],
];

$this->registerCss(<<<CSS
.dashboard-v2-callout {
    margin-bottom: 15px;
}
.dashboard-v2-statuses .label {
    margin-right: 6px;
    margin-bottom: 6px;
    display: inline-block;
}
.dashboard-v2-actions .btn {
    margin-right: 8px;
    margin-bottom: 8px;
}
.dashboard-v2-summary {
    margin: 8px 0 0;
    color: #666;
}
.dashboard-v2-filters .form-group {
    margin-bottom: 12px;
}
.dashboard-v2-chart {
    height: 260px;
}
.dashboard-chart {
    height: 260px;
}
.dashboard-v2-section {
    margin-top: 6px;
}
.dashboard-v2-section .box,
.dashboard-v2-metrics .small-box,
.dashboard-v2-metrics .info-box {
    margin-bottom: 15px;
}
.dashboard-v2-table th {
    white-space: nowrap;
}
.dashboard-table th {
    white-space: nowrap;
}
.dashboard-v2-risk-list {
    margin: 0;
    padding-left: 18px;
}
.dashboard-v2-risk-list li {
    margin-bottom: 10px;
}
.dashboard-list {
    margin: 0;
    padding-left: 18px;
}
.dashboard-list li {
    margin-bottom: 12px;
}
.dashboard-v2-description .description-block {
    margin: 0;
}
.dashboard-note {
    color: #777;
    font-size: 12px;
    line-height: 1.5;
}
.dashboard-section-title {
    margin: 6px 0 12px;
    color: #666;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
}
.dashboard-grid-row {
    margin-bottom: 5px;
}
CSS);
?>

<?php if ($this->session->hasFlash('updateSuccess')): ?>
    <div class="alert alert-success">
        <?= Html::encode($this->session->getFlash('updateSuccess')) ?>
    </div>
<?php endif; ?>

<div class="callout callout-info dashboard-v2-callout">
    <h4><?= Html::encode(Yii::t('app', 'Дашборд живых консультаций — v2')) ?></h4>
    <p class="dashboard-v2-summary">
        <?= Html::encode(Yii::t('app', 'v1 зафиксирована отдельно. Версия v2 опирается на стандартные компоненты текущего шаблона: callout, small-box, info-box, box, description-block и стандартные таблицы AdminLTE.')) ?>
    </p>
    <div class="dashboard-v2-statuses">
        <span class="label label-success"><?= Html::encode(Yii::t('app', 'Cron: OK')) ?></span>
        <span class="label label-success"><?= Html::encode(Yii::t('app', 'Очередь: OK')) ?></span>
        <span class="label label-warning"><?= Html::encode(Yii::t('app', 'Платежи: внимание')) ?></span>
        <span class="label label-success"><?= Html::encode(Yii::t('app', 'Realtime: OK')) ?></span>
        <span class="label label-default"><?= Html::encode(Yii::t('app', 'Ошибки (5м): 0')) ?></span>
        <span class="label label-primary"><?= Html::encode(Yii::t('app', 'Контур: платные консультации')) ?></span>
        <span class="label label-primary"><?= Html::encode(Yii::t('app', 'Домен: эзотерика / эксперты')) ?></span>
        <span class="label label-default"><?= Html::encode(Yii::t('app', 'Почасовой cron:')) ?> <?= $info['cronHourly'] ? date('Y-m-d H:i', $info['cronHourly']) : Yii::t('app', 'Никогда') ?></span>
    </div>
    <div class="dashboard-v2-actions" style="margin-top:10px;">
        <a class="btn btn-default btn-sm" href="#"><i class="fa fa-refresh"></i> <?= Html::encode(Yii::t('app', 'Обновить')) ?></a>
        <a class="btn btn-default btn-sm" href="#"><i class="fa fa-download"></i> <?= Html::encode(Yii::t('app', 'CSV')) ?></a>
        <a class="btn btn-default btn-sm" href="#"><i class="fa fa-question-circle"></i> <?= Html::encode(Yii::t('app', 'Определения')) ?></a>
    </div>
</div>

<div class="box box-default dashboard-v2-filters">
    <div class="box-header with-border">
        <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Фильтры и период')) ?></h3>
    </div>
    <div class="box-body">
    <div class="row">
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Период')) ?></label>
                <select class="form-control">
                    <option><?= Html::encode(Yii::t('app', 'Последние 7 дней')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Последние 14 дней')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Последние 30 дней')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Последние 60 дней')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Последние 90 дней')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Сегодня')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Вчера')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Кастомный диапазон')) ?></option>
                </select>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Гранулярность')) ?></label>
                <select class="form-control">
                    <option><?= Html::encode(Yii::t('app', 'По дням')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'По неделям')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'По месяцам')) ?></option>
                </select>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Сравнение')) ?></label>
                <select class="form-control">
                    <option><?= Html::encode(Yii::t('app', 'Без сравнения')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'К предыдущему периоду')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'К прошлой неделе')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'К прошлому месяцу')) ?></option>
                </select>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Дата с')) ?></label>
                <input type="text" class="form-control" value="2026-03-15">
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Дата по')) ?></label>
                <input type="text" class="form-control" value="2026-04-13">
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Страна')) ?></label>
                <select class="form-control">
                    <option><?= Html::encode(Yii::t('app', 'Все страны')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'США')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Германия')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Великобритания')) ?></option>
                </select>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="form-group">
                <label><?= Html::encode(Yii::t('app', 'Тип клиента')) ?></label>
                <select class="form-control">
                    <option><?= Html::encode(Yii::t('app', 'Все')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Новые')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Повторные')) ?></option>
                    <option><?= Html::encode(Yii::t('app', 'Платящие')) ?></option>
                </select>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <label>&nbsp;</label>
            <div>
                <a class="btn btn-primary btn-sm" href="#"><?= Html::encode(Yii::t('app', 'Применить')) ?></a>
                <a class="btn btn-default btn-sm" href="#"><?= Html::encode(Yii::t('app', 'Сбросить')) ?></a>
            </div>
        </div>
    </div>
</div>

<div class="callout callout-warning dashboard-v2-callout">
    <strong><?= Html::encode(Yii::t('app', 'Фокус периода:')) ?></strong>
    <?= Html::encode(Yii::t('app', 'главная бизнес-ось этого экрана — сколько диалогов стартует в бесплатных минутах, сколько доходит до первой оплаты и сколько клиентов возвращается в повтор.')) ?>
</div>

<div class="row dashboard-v2-metrics">
    <div class="col-md-3 col-sm-6">
        <div class="small-box bg-blue">
            <div class="inner">
                <h3>214</h3>
                <p><?= Html::encode(Yii::t('app', 'Старт бесплатных минут')) ?></p>
                <small><?= Html::encode(Yii::t('app', '73.5% от принятых запросов')) ?></small>
            </div>
            <div class="icon"><i class="fa fa-comments"></i></div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="small-box bg-aqua">
            <div class="inner">
                <h3>60.3%</h3>
                <p><?= Html::encode(Yii::t('app', 'Конверсия в первую оплату')) ?></p>
                <small><?= Html::encode(Yii::t('app', '129 клиентов дошли до первой оплаченной минуты')) ?></small>
            </div>
            <div class="icon"><i class="fa fa-credit-card"></i></div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="small-box bg-green">
            <div class="inner">
                <h3>24.6%</h3>
                <p><?= Html::encode(Yii::t('app', 'Доля повторных оплат')) ?></p>
                <small><?= Html::encode(Yii::t('app', '58 клиентов вернулись в новую платную сессию')) ?></small>
            </div>
            <div class="icon"><i class="fa fa-repeat"></i></div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="small-box bg-purple">
            <div class="inner">
                <h3>$14,860</h3>
                <p><?= Html::encode(Yii::t('app', 'GMV / чистая выручка')) ?></p>
                <small><?= Html::encode(Yii::t('app', '36% выручки приходит от повторных клиентов')) ?></small>
            </div>
            <div class="icon"><i class="fa fa-line-chart"></i></div>
        </div>
    </div>
</div>

<div class="row dashboard-v2-metrics">
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-aqua"><i class="fa fa-envelope-open"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Html::encode(Yii::t('app', 'Запросы на консультацию')) ?></span>
                <span class="info-box-number">482</span>
                <span class="progress-description"><?= Html::encode(Yii::t('app', '+12% к предыдущему периоду')) ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-green"><i class="fa fa-check-circle"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Html::encode(Yii::t('app', 'Доля принятия')) ?></span>
                <span class="info-box-number">60.4%</span>
                <span class="progress-description"><?= Html::encode(Yii::t('app', '291 запрос принят экспертами')) ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-yellow"><i class="fa fa-clock-o"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Html::encode(Yii::t('app', 'Медианный первый ответ')) ?></span>
                <span class="info-box-number">8 мин</span>
                <span class="progress-description"><?= Html::encode(Yii::t('app', 'Если хуже 10 мин, падает выход в бесплатный пресейл')) ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-red"><i class="fa fa-exclamation-triangle"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Html::encode(Yii::t('app', 'Потери между free и paid')) ?></span>
                <span class="info-box-number">49</span>
                <span class="progress-description"><?= Html::encode(Yii::t('app', 'Показан paywall, но нет первой оплаты')) ?></span>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'Продуктовый контур')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-8">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Динамика перехода в оплату')) ?></h3>
            </div>
            <div class="box-body">
                <div class="dashboard-chart">
                    <?= ChartJs::widget(ArrayHelper::merge($chartOptions, [
                        'type' => 'line',
                        'data' => [
                            'labels' => ['01 Апр', '03 Апр', '05 Апр', '07 Апр', '09 Апр', '11 Апр', '13 Апр'],
                            'datasets' => [
                                [
                                    'label' => Yii::t('app', 'Запросы'),
                                    'backgroundColor' => 'rgba(60, 141, 188, 0.18)',
                                    'borderColor' => 'rgba(60, 141, 188, 1)',
                                    'pointBackgroundColor' => 'rgba(60, 141, 188, 1)',
                                    'data' => [51, 64, 58, 67, 71, 79, 92],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'Старт бесплатных минут'),
                                    'backgroundColor' => 'rgba(0, 166, 90, 0.18)',
                                    'borderColor' => 'rgba(0, 166, 90, 1)',
                                    'pointBackgroundColor' => 'rgba(0, 166, 90, 1)',
                                    'data' => [22, 26, 25, 28, 31, 34, 38],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'Первая оплаченная минута'),
                                    'backgroundColor' => 'rgba(243, 156, 18, 0.18)',
                                    'borderColor' => 'rgba(243, 156, 18, 1)',
                                    'pointBackgroundColor' => 'rgba(243, 156, 18, 1)',
                                    'data' => [14, 15, 16, 18, 20, 22, 24],
                                    'fill' => false,
                                ],
                            ],
                        ],
                    ])) ?>
                </div>
                <p class="dashboard-note">
                    <?= Html::encode(Yii::t('app', 'Главный график должен отвечать только на одно: сколько диалогов дошло до бесплатного пресейла и сколько из них реально открыло первую оплачиваемую минуту.')) ?>
                </p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Где теряются деньги')) ?></h3>
            </div>
            <div class="box-body">
                <ul class="dashboard-list">
                    <?php foreach ($blockerRows as $row): ?>
                        <li>
                            <strong><?= Html::encode($row[0]) ?> <span class="text-warning"><?= Html::encode($row[1]) ?></span></strong>
                            <span class="dashboard-note"><?= Html::encode($row[2]) ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'Воронка и unit-экономика')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-7">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Воронка консультаций')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Шаг')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Количество')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Конверсия')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Операционный смысл')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($funnelRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td class="text-right"><?= Html::encode($row[2]) ?></td>
                            <td><?= Html::encode($row[3]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-5">
        <div class="box box-warning">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Unit-экономика перехода в оплату')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Показатель')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Значение')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Комментарий')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($minuteRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td><?= Html::encode($row[2]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'Повторы и выручка')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-6">
        <div class="box box-success">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Платящие клиенты и выручка')) ?></h3>
            </div>
            <div class="box-body">
                <div class="dashboard-chart">
                    <?= ChartJs::widget(ArrayHelper::merge($chartOptions, [
                        'type' => 'line',
                        'data' => [
                            'labels' => ['01 Апр', '03 Апр', '05 Апр', '07 Апр', '09 Апр', '11 Апр', '13 Апр'],
                            'datasets' => [
                                [
                                    'label' => Yii::t('app', 'Активные клиенты'),
                                    'backgroundColor' => 'rgba(96, 92, 168, 0.18)',
                                    'borderColor' => 'rgba(96, 92, 168, 1)',
                                    'pointBackgroundColor' => 'rgba(96, 92, 168, 1)',
                                    'data' => [132, 144, 139, 151, 159, 171, 186],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'Платящие клиенты'),
                                    'backgroundColor' => 'rgba(0, 192, 239, 0.18)',
                                    'borderColor' => 'rgba(0, 192, 239, 1)',
                                    'pointBackgroundColor' => 'rgba(0, 192, 239, 1)',
                                    'data' => [82, 88, 87, 95, 104, 117, 129],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'GMV, $'),
                                    'backgroundColor' => 'rgba(96, 92, 168, 0.18)',
                                    'borderColor' => 'rgba(96, 92, 168, 1)',
                                    'pointBackgroundColor' => 'rgba(96, 92, 168, 1)',
                                    'data' => [11200, 11840, 12090, 12780, 13410, 14120, 14860],
                                    'fill' => false,
                                ],
                            ],
                        ],
                    ])) ?>
                </div>
                <p class="dashboard-note">
                    <?= Html::encode(Yii::t('app', 'Здесь видно, как рост paying clients связан с ростом выручки, а не только с длиной одной сессии.')) ?>
                </p>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-success">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Повторы и удержание')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Метрика')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Значение')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Что измеряет')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($repeatRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td><?= Html::encode($row[2]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'LTV и когорты')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'LTV по горизонту')) ?></h3>
            </div>
            <div class="box-body dashboard-v2-description">
                <div class="row">
                    <div class="col-sm-4 col-xs-12">
                        <div class="description-block border-right">
                            <h5 class="description-header">$38</h5>
                            <span class="description-text"><?= Html::encode(Yii::t('app', 'LTV D7')) ?></span>
                        </div>
                    </div>
                    <div class="col-sm-4 col-xs-12">
                        <div class="description-block border-right">
                            <h5 class="description-header">$92</h5>
                            <span class="description-text"><?= Html::encode(Yii::t('app', 'LTV D30')) ?></span>
                        </div>
                    </div>
                    <div class="col-sm-4 col-xs-12">
                        <div class="description-block">
                            <h5 class="description-header">$146</h5>
                            <span class="description-text"><?= Html::encode(Yii::t('app', 'LTV D90')) ?></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Метрика')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Значение')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Что измеряет')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($ltvRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td><?= Html::encode($row[2]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Когортная монетизация')) ?></h3>
            </div>
            <div class="box-body">
                <div class="dashboard-chart">
                    <?= ChartJs::widget(ArrayHelper::merge($chartOptions, [
                        'type' => 'line',
                        'data' => [
                            'labels' => ['Неделя 0', 'Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 6', 'Неделя 8'],
                            'datasets' => [
                                [
                                    'label' => Yii::t('app', 'LTV новой когорты, $'),
                                    'backgroundColor' => 'rgba(60, 141, 188, 0.18)',
                                    'borderColor' => 'rgba(60, 141, 188, 1)',
                                    'pointBackgroundColor' => 'rgba(60, 141, 188, 1)',
                                    'data' => [12, 28, 43, 58, 74, 88, 92],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'LTV сильной когорты, $'),
                                    'backgroundColor' => 'rgba(0, 166, 90, 0.18)',
                                    'borderColor' => 'rgba(0, 166, 90, 1)',
                                    'pointBackgroundColor' => 'rgba(0, 166, 90, 1)',
                                    'data' => [18, 39, 61, 88, 109, 137, 171],
                                    'fill' => false,
                                ],
                            ],
                        ],
                    ])) ?>
                </div>
                <p class="dashboard-note">
                    <?= Html::encode(Yii::t('app', 'LTV живет не внутри воронки, а отдельным когортным слоем: сколько денег приносит клиент после первой оплаты на горизонте 7 / 30 / 90 дней.')) ?>
                </p>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'Драйверы роста')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-6">
        <div class="box box-warning">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Эксперты и SLA')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Метрика')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Значение')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Цель')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($expertRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td><?= Html::encode($row[2]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box box-warning">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Пользователи и спрос')) ?></h3>
            </div>
            <div class="box-body">
                <div class="dashboard-chart">
                    <?= ChartJs::widget(ArrayHelper::merge($chartOptions, [
                        'type' => 'line',
                        'data' => [
                            'labels' => ['01 Апр', '03 Апр', '05 Апр', '07 Апр', '09 Апр', '11 Апр', '13 Апр'],
                            'datasets' => [
                                [
                                    'label' => Yii::t('app', 'Активные клиенты'),
                                    'backgroundColor' => 'rgba(96, 92, 168, 0.18)',
                                    'borderColor' => 'rgba(96, 92, 168, 1)',
                                    'pointBackgroundColor' => 'rgba(96, 92, 168, 1)',
                                    'data' => [132, 144, 139, 151, 159, 171, 186],
                                    'fill' => false,
                                ],
                                [
                                    'label' => Yii::t('app', 'Платящие клиенты'),
                                    'backgroundColor' => 'rgba(0, 192, 239, 0.18)',
                                    'borderColor' => 'rgba(0, 192, 239, 1)',
                                    'pointBackgroundColor' => 'rgba(0, 192, 239, 1)',
                                    'data' => [82, 88, 87, 95, 104, 117, 129],
                                    'fill' => false,
                                ],
                            ],
                        ],
                    ])) ?>
                </div>
                <p class="dashboard-note">
                    <?= Html::encode(Yii::t('app', 'Этот блок нужен как driver-слой: сколько базы входит в живой чат и какой кусок реально доходит до платной консультации.')) ?>
                </p>
            </div>
        </div>
    </div>
</div>

<div class="dashboard-section-title"><?= Html::encode(Yii::t('app', 'Риски и операционка')) ?></div>
<div class="row dashboard-grid-row">
    <div class="col-md-7">
        <div class="box box-danger">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Операции и состояние очереди')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Очередь / инцидент')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'В ожидании')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Самый старый')) ?></th>
                        <th><?= Html::encode(Yii::t('app', 'Статус')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($queueRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td class="text-right"><?= Html::encode($row[2]) ?></td>
                            <td><span class="label label-<?= Html::encode($row[3]) ?>"><?= Html::encode($row[4]) ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-md-5">
        <div class="box box-default">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Html::encode(Yii::t('app', 'Структура выручки')) ?></h3>
            </div>
            <div class="box-body no-padding">
                <table class="table table-striped dashboard-table">
                    <thead>
                    <tr>
                        <th><?= Html::encode(Yii::t('app', 'Категория')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Сумма')) ?></th>
                        <th class="text-right"><?= Html::encode(Yii::t('app', 'Доля')) ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($revenueRows as $row): ?>
                        <tr>
                            <td><?= Html::encode($row[0]) ?></td>
                            <td class="text-right"><?= Html::encode($row[1]) ?></td>
                            <td class="text-right"><?= Html::encode($row[2]) ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <div class="box-footer">
                <span class="dashboard-note"><?= Html::encode(Yii::t('app', 'Структура выручки оставлена внизу как справочный слой, а не как приоритет первого экрана.')) ?></span>
            </div>
        </div>
    </div>
</div>
