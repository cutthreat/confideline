<?php
use app\assets\CatalogFilterAsset;
use yii\helpers\Html;

/**
 * The application supplies its existing, trusted server-rendered search form.
 * It owns field names, premium permissions, values, reset and request handling.
 * Do not pass user-generated HTML. Adapt the existing widgets before using this shell.
 */
if (!isset($existingFilterForm) || !is_string($existingFilterForm) || trim($existingFilterForm) === '') {
    throw new \InvalidArgumentException('The existing server-rendered filter form is required');
}
CatalogFilterAsset::register($this);
$id = isset($id) ? $id : 'cl-catalog-filter';
?>
<section class="cl-catalog-filter cl-catalog-vertical" data-catalog-filter>
    <button type="button" class="btn cl-filter-open" data-filter-open aria-haspopup="dialog" aria-controls="<?= Html::encode($id) ?>-drawer" aria-expanded="false">
        <i class="fa fa-sliders" aria-hidden="true"></i><span><?= Html::encode(Yii::t('app', 'Filters')) ?></span>
    </button>
    <dialog class="cl-filter-drawer" id="<?= Html::encode($id) ?>-drawer" aria-labelledby="<?= Html::encode($id) ?>-title">
        <header class="cl-drawer-header">
            <h2 id="<?= Html::encode($id) ?>-title" tabindex="-1"><?= Html::encode(Yii::t('app', 'Filters')) ?></h2>
            <button type="button" class="cl-drawer-close" data-filter-close aria-label="<?= Html::encode(Yii::t('app', 'Close filters')) ?>"><i class="fa fa-times" aria-hidden="true"></i></button>
        </header>
        <?= $existingFilterForm ?>
    </dialog>
</section>
