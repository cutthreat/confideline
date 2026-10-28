<?php
use yii\helpers\Html;

/**
 * Presentation only: pass the site's prepared public values and existing controls.
 * $ratingControl and $favoriteControl are trusted rendered site components, not user HTML.
 */
$areaLabels = array_values(array_unique(array_filter($areaLabels ?? [], static function ($value) {
    return is_string($value) && trim($value) !== '';
})));
$name = $name ?? '';
$photoUrl = $photoUrl ?? '';
$profileUrl = $profileUrl ?? '';
$chatUrl = $chatUrl ?? '';
$statusLabel = $statusLabel ?? '';
$hasPrice = isset($priceAmount, $priceUnit) && (string) $priceAmount !== '' && (string) $priceUnit !== '';
$presence = in_array($presence ?? '', ['online', 'busy', 'offline'], true) ? $presence : '';
$tag = static function ($value) { return Html::tag('span', Html::encode($value), ['class' => 'cl-expert-tag']); };
?>
<article class="card cl-expert-card">
    <?= Html::a(Html::img($photoUrl, ['class' => 'card-img-top', 'alt' => $name, 'width' => 500, 'height' => 500]), $profileUrl, ['class' => 'cl-expert-photo', 'aria-label' => Yii::t('app', 'Profile') . ': ' . $name]) ?>
    <?php if (!empty($favoriteControl)): ?>
        <div class="cl-expert-favorite"><?= $favoriteControl ?></div>
    <?php endif; ?>
    <div class="cl-expert-content">
        <h2 class="cl-expert-title"><?= Html::a(Html::encode($name), $profileUrl) ?></h2>
        <?php if ($statusLabel !== ''): ?>
            <div class="cl-expert-status" data-status="<?= Html::encode($presence) ?>"><i aria-hidden="true"></i><?= Html::encode($statusLabel) ?></div>
        <?php endif; ?>
        <?php if (!empty($ratingControl)): ?>
            <?= $ratingControl ?>
        <?php endif; ?>
        <?php if (!empty($experienceLabel)): ?>
            <p class="cl-expert-experience"><?= Html::encode($experienceLabel) ?></p>
        <?php endif; ?>
        <?php if ($areaLabels): ?>
            <div class="cl-expert-areas"><?= implode('', array_map($tag, array_slice($areaLabels, 0, 2))) ?></div>
        <?php endif; ?>
        <?php if (count($areaLabels) > 2): ?>
            <details class="cl-expert-more">
                <summary><?= Html::encode(Yii::t('app', '{count} more', ['count' => count($areaLabels) - 2])) ?><i class="fa fa-angle-down" aria-hidden="true"></i></summary>
                <div class="cl-expert-areas"><?= implode('', array_map($tag, array_slice($areaLabels, 2))) ?></div>
            </details>
        <?php endif; ?>
        <div class="cl-expert-footer">
            <div class="cl-expert-offer">
                <div class="cl-expert-price">
                    <?php if ($hasPrice): ?>
                        <strong><?= Html::encode($priceAmount) ?></strong><span><?= Html::encode($priceUnit) ?></span>
                    <?php else: ?>
                        <?= Html::encode(Yii::t('app', 'Terms in chat')) ?>
                    <?php endif; ?>
                </div>
                <?php if ($hasPrice && !empty($trialLabel)): ?>
                    <div class="cl-expert-trial"><?= Html::encode($trialLabel) ?></div>
                <?php endif; ?>
            </div>
            <?= Html::a('<i class="fa fa-comment-o" aria-hidden="true"></i>' . Html::encode(Yii::t('app', 'Chat')) . Html::tag('span', ': ' . Html::encode($name), ['class' => 'sr-only']), $chatUrl, ['class' => 'btn btn-primary cl-expert-chat']) ?>
        </div>
    </div>
</article>
