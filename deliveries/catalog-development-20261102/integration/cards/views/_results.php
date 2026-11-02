<?php
use app\assets\ExpertCardsAsset;
use yii\helpers\Html;

/**
 * Presentation adapter, not a query or authorization implementation.
 * $cards: prepared _expertCard argument arrays for this page only.
 * $paginationControl: trusted rendered application pager, never user input.
 * $recoveryUrl: validated internal URL with the applied search parameters.
 * The host owns the shared heading/count and request lifecycle.
 */
ExpertCardsAsset::register($this);
$cards = $cards ?? [];
$state = $state ?? (count($cards) ? 'ready' : 'empty');
if (!in_array($state, ['ready', 'loading', 'empty', 'error'], true)) {
    throw new \InvalidArgumentException('Invalid result state');
}
$labels = [
    'loading' => Yii::t('app', 'Loading experts...'),
    'empty' => Yii::t('app', 'No matching experts'),
    'error' => Yii::t('app', 'Unable to load experts'),
];
?>
<section class="cl-catalog-results" aria-label="<?= Html::encode(Yii::t('app', 'Expert results')) ?>" aria-busy="<?= $state === 'loading' ? 'true' : 'false' ?>">
<?php if ($state === 'ready'): ?>
    <div class="cl-expert-grid" tabindex="0" role="group" aria-label="<?= Html::encode(Yii::t('app', 'Experts on this page')) ?>">
        <?php foreach ($cards as $params): ?>
            <div class="cl-expert-item"><?= $this->render('_expertCard', $params) ?></div>
        <?php endforeach; ?>
    </div>
    <?= $paginationControl ?? '' ?>
<?php else: ?>
    <div class="cl-results-state" role="<?= $state === 'error' ? 'alert' : 'status' ?>">
        <p><?= Html::encode($labels[$state]) ?></p>
        <?php if ($state !== 'loading' && !empty($recoveryUrl)): ?>
            <?= Html::a(Html::encode(Yii::t('app', $state === 'error' ? 'Retry' : 'Change filters')), $recoveryUrl, ['class' => 'btn btn-primary']) ?>
        <?php endif; ?>
    </div>
<?php endif; ?>
</section>
