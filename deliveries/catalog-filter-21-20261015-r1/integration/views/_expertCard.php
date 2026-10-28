<?php
use yii\helpers\Html;

/**
 * Presentation only: pass the site's prepared public values and existing controls.
 * $ratingControl and $favoriteControl are trusted rendered site components, not user HTML.
 */
$areaLabels = array_values(array_unique(array_filter(array_map('trim', array_filter($areaLabels ?? [], 'is_string')), static function ($value) { return $value !== ''; })));
$name = $name ?? '';
$photoUrl = $photoUrl ?? '';
$profileUrl = $profileUrl ?? '';
$chatUrl = $chatUrl ?? '';
$statusLabel = $statusLabel ?? '';
$hasPrice = isset($priceAmount, $priceUnit) && is_numeric($priceAmount) && is_finite((float) $priceAmount) && (float) $priceAmount > 0 && is_string($priceUnit) && trim($priceUnit) !== '';
$hasTrial = $hasPrice && !empty($trialLabel);
$presence = in_array($presence ?? '', ['online', 'busy', 'offline'], true) ? $presence : '';
$tag = static function ($value) { return Html::tag('span', Html::encode($value), ['class' => 'cl-expert-tag']); };
?>
<article class="card cl-expert-card">
    <div class="cl-expert-content"><div class="cl-expert-heading"><div class="cl-expert-avatar">
    <?= Html::a(($photoUrl !== '' ? Html::img($photoUrl, ['class' => 'card-img-top', 'alt' => $name, 'width' => 500, 'height' => 500]) : '') . Html::tag('span', '<i class="fa fa-user" aria-hidden="true"></i>', ['class' => 'cl-expert-photo-fallback', 'aria-hidden' => 'true', 'hidden' => $photoUrl !== '']), $profileUrl, ['class' => 'cl-expert-photo', 'aria-label' => Yii::t('app', 'Profile') . ': ' . $name]) ?>
    <?php if ($statusLabel !== '' && $presence !== ''): ?>
        <details class="cl-expert-presence" data-status="<?= Html::encode($presence) ?>"><summary aria-label="<?= Html::encode($name . ': ' . $statusLabel) ?>"><span aria-hidden="true"></span></summary><span class="cl-expert-presence-label"><?= Html::encode($statusLabel) ?></span></details>
    <?php endif; ?>
    </div>
    <?php if (!empty($favoriteControl)): ?>
        <div class="cl-expert-favorite"><?= $favoriteControl ?></div>
    <?php endif; ?>
    <div class="cl-expert-identity">
        <h2 class="cl-expert-title"><?= Html::a(Html::encode($name), $profileUrl) ?></h2>
        <?php if (!empty($ratingControl)): ?>
            <?= $ratingControl ?>
        <?php endif; ?>
        <?php if (!empty($experienceLabel)): ?>
            <p class="cl-expert-experience"><?= Html::encode($experienceLabel) ?></p>
        <?php endif; ?>
        </div></div><div class="cl-expert-directions">
        <?php if ($areaLabels): ?>
            <div class="cl-expert-areas"><?= implode('', array_map($tag, array_slice($areaLabels, 0, 2))) ?></div>
        <?php endif; ?>
        <?php if (count($areaLabels) > 2): ?>
            <details class="cl-expert-more">
                <summary><span class="cl-expert-more-label"><?= Html::encode(Yii::t('app', '{count} more', ['count' => count($areaLabels) - 2])) ?><span class="sr-only">: <?= Html::encode(Yii::t('app', 'Expertise for {name}', ['name' => $name])) ?></span></span><span class="cl-expert-less-label"><?= Html::encode(Yii::t('app', 'Show less')) ?><span class="sr-only">: <?= Html::encode(Yii::t('app', 'Expertise for {name}', ['name' => $name])) ?></span></span><i class="fa fa-angle-down" aria-hidden="true"></i></summary>
                <div class="cl-expert-areas"><?= implode('', array_map($tag, array_slice($areaLabels, 2))) ?></div>
            </details>
        <?php endif; ?>
        </div><div class="cl-expert-footer">
            <div class="cl-expert-offer">
                <?php if ($hasTrial): ?>
                    <div class="cl-expert-trial"><?= Html::encode($trialLabel) ?></div>
                <?php endif; ?>
                <div class="cl-expert-price">
                    <?php if ($hasPrice): ?>
                        <?php if ($hasTrial): ?><span class="cl-expert-price-prefix"><?= Html::encode(Yii::t('app', 'Then')) ?></span><?php endif; ?>
                        <strong><?= Html::encode($priceAmount) ?></strong><span><?= Html::encode($priceUnit) ?></span>
                    <?php else: ?>
                        <?= Html::encode(Yii::t('app', 'Terms in chat')) ?>
                    <?php endif; ?>
                </div>
            </div>
            <?= Html::a('<i class="fa fa-comment-o" aria-hidden="true"></i>' . Html::encode(Yii::t('app', 'Chat')) . Html::tag('span', ': ' . Html::encode($name), ['class' => 'sr-only']), $chatUrl, ['class' => 'btn btn-primary cl-expert-chat']) ?>
        </div>
    </div>
</article>
