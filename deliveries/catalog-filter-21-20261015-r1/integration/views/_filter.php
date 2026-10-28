<?php
use app\assets\CatalogFilterAsset;
use yii\helpers\Html;

/** @var yii\web\View $this */
/** @var string $searchUrl Existing catalog search URL, without an obsolete page number. */
/** @var array $selected Applied option keys: areas and topics. */
/** @var int|null $total Number of matching accessible expert profiles. */
/** @var string $id Unique instance id, optional. */
/** @var array $fieldNames Existing search field names, optional. */

CatalogFilterAsset::register($this);
$id = isset($id) ? $id : 'cl-expert-filter';
$fieldNames = isset($fieldNames) ? $fieldNames : ['areas' => 'areas', 'topics' => 'topics'];
$selected = isset($selected) ? $selected : [];
$total = isset($total) ? max(0, (int) $total) : null;
$t = static function ($text, $params = []) { return Yii::t('app', $text, $params); };
$groups = [
    'areas' => [
        'title' => $t('Направление'),
        'options' => ['astrology' => ['Astrology', 'fa-sun-o'], 'mediums' => ['Mediums', 'fa-eye'], 'taro' => ['Taro', 'fa-clone'], 'numerology' => ['Numerology', 'fa-hashtag'], 'palmistry' => ['Palmistry', 'fa-hand-paper-o']],
    ],
    'topics' => [
        'title' => $t('Темы'),
        'options' => ['love' => ['Love', null], 'fortune' => ['Fortune', null], 'career' => ['Career', null], 'life-path' => ['Life Path', null], 'fertility' => ['Fertility', null], 'soulmate' => ['Soulmate', null]],
    ],
];
$labels = ['title' => $t('Фильтры'), 'close' => $t('Закрыть фильтры'), 'reset' => $t('Сбросить фильтр'), 'applied' => $t('Применённые фильтры'), 'remove' => $t('Убрать фильтр {label}'), 'more' => $t('Все выбранные фильтры, ещё {count}'), 'open' => $t('Фильтры, применено: {count}')];
?>
<section class="cl-catalog-filter cl-catalog-vertical" data-catalog-filter data-labels="<?= Html::encode(json_encode($labels, JSON_UNESCAPED_UNICODE)) ?>">
    <div class="cl-results-heading cl-catalog-toolbar">
        <div class="cl-catalog-title">
            <h1><?= Html::encode($t('Эксперты')) ?></h1>
            <?php if ($total !== null): ?><div class="cl-results-count" role="status" aria-live="polite" aria-atomic="true"><?= Html::encode($t('Найдено: {count}', ['count' => $total])) ?></div><?php endif; ?>
        </div>
        <button type="button" class="btn cl-filter-open" data-filter-open aria-haspopup="dialog" aria-controls="<?= Html::encode($id) ?>-drawer" aria-expanded="false"><i class="fa fa-sliders" aria-hidden="true"></i><span data-drawer-label><?= Html::encode($labels['title']) ?></span><span class="cl-selection-count" data-applied-count aria-hidden="true" hidden></span></button>
    </div>
    <div class="cl-applied-filters" data-applied aria-label="<?= Html::encode($labels['applied']) ?>" hidden></div>
    <dialog class="cl-filter-drawer" id="<?= Html::encode($id) ?>-drawer" aria-labelledby="<?= Html::encode($id) ?>-title">
        <header class="cl-drawer-header"><h2 id="<?= Html::encode($id) ?>-title" tabindex="-1"><?= Html::encode($labels['title']) ?></h2><button type="button" class="cl-drawer-close" data-filter-close aria-label="<?= Html::encode($labels['close']) ?>" title="<?= Html::encode($labels['close']) ?>"><i class="fa fa-times" aria-hidden="true"></i></button></header>
        <?= Html::beginForm($searchUrl, 'get', ['class' => 'cl-filter', 'data-filter-form' => '', 'aria-label' => $t('Фильтр экспертов')]) ?>
        <div class="cl-drawer-body">
            <?php foreach ($groups as $group => $definition): ?>
                <?php $values = array_values(array_intersect((array) ($selected[$group] ?? []), array_keys($definition['options']))); ?>
                <fieldset class="cl-filter-group cl-filter-<?= Html::encode($group) ?>"><legend><?= Html::encode($definition['title']) ?><span class="cl-selection-count" data-selection-count="<?= Html::encode($group) ?>" aria-hidden="true" hidden></span></legend><div class="cl-options">
                    <?php foreach ($definition['options'] as $key => $option): ?>
                        <label class="cl-chip"><?= Html::checkbox($fieldNames[$group] . '[]', in_array($key, $values, true), ['value' => $key, 'data-filter-group' => $group, 'uncheck' => null]) ?><span class="cl-option"><?php if ($option[1]): ?><i class="fa cl-area-icon <?= Html::encode($option[1]) ?>" aria-hidden="true"></i><?php endif; ?><span class="cl-option-label"><?= Html::encode($option[0]) ?></span><span class="cl-check" aria-hidden="true"><i class="fa fa-check"></i></span></span></label>
                    <?php endforeach; ?>
                </div></fieldset>
            <?php endforeach; ?>
        </div>
        <div class="cl-filter-actions"><button type="button" class="btn cl-reset" data-filter-reset aria-label="<?= Html::encode($labels['reset']) ?>" title="<?= Html::encode($labels['reset']) ?>"><i class="fa fa-undo" aria-hidden="true"></i><span data-i18n="reset"><?= Html::encode($t('Сбросить')) ?></span></button><button type="submit" class="btn btn-primary"><i class="fa fa-search" aria-hidden="true"></i><span><?= Html::encode($t('Поиск')) ?></span></button></div>
        <?= Html::endForm() ?>
    </dialog>
</section>
