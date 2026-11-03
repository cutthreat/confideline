<?php
use yii\helpers\Html;

/**
 * Presentation only: pass the site's prepared public values and existing controls.
 * $ratingControl and $favoriteControl are trusted rendered site components, not user HTML.
 */
// The application must resolve these permissions on the server for this viewer.
if (($mayDisplayAreas ?? false) !== true) { $areaLabels = []; }
if (($mayDisplayExperience ?? false) !== true) { $experienceLabel = ''; }
$areaLabels = array_values(array_unique(array_filter(array_map('trim', array_filter($areaLabels ?? [], 'is_string')), static function ($value) { return $value !== ''; })));
$name = $name ?? '';
$photoUrl = $photoUrl ?? '';
$profileUrl = $profileUrl ?? '';
$chatUrl = $chatUrl ?? '';
$statusLabel = $statusLabel ?? '';
$hasPrice = isset($priceAmount, $priceUnit) && is_numeric($priceAmount) && is_finite((float) $priceAmount) && (float) $priceAmount > 0 && is_string($priceUnit) && trim($priceUnit) !== '';
$hasTrial = $hasPrice && !empty($trialLabel);
$presence = in_array($presence ?? '', ['online', 'busy', 'offline'], true) ? $presence : '';
$tag = static function ($value) { return Html::tag('span', Html::encode($value), ['class' => 'cl-expert-tag', 'title' => $value]); };
?>
<article class="card cl-expert-card">
    <?php if ($hasTrial): ?><span class="cl-expert-trial"><i class="fa fa-gift" aria-hidden="true"></i><?= Html::encode($trialLabel) ?></span><?php endif; ?>
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
        <div class="cl-expert-rating-slot">
        <?php if (!empty($ratingControl)): ?>
            <?= $ratingControl ?>
        <?php elseif (!empty($ratingEmptyLabel)): ?>
            <span class="cl-expert-rating-empty"><?= Html::encode($ratingEmptyLabel) ?></span>
        <?php endif; ?>
        </div>
        <?php if (!empty($experienceLabel)): ?>
            <p class="cl-expert-experience"><i class="fa fa-graduation-cap" aria-hidden="true"></i><?= Html::encode($experienceLabel) ?></p>
        <?php endif; ?>
        </div></div><div class="cl-expert-directions">
        <?php if ($areaLabels): ?>
            <div class="cl-expert-areas"><?= implode('', array_map($tag, array_slice($areaLabels, 0, 2))) ?></div>
        <?php endif; ?>
        <?php if (count($areaLabels) > 2): ?>
            <?= Html::a(Html::tag('span', '+' . (count($areaLabels) - 2)), $profileUrl, ['class' => 'cl-expert-more-link', 'aria-label' => Yii::t('app', 'Open profile: {name}, {count} more', ['name' => $name, 'count' => count($areaLabels) - 2])]) ?>
        <?php endif; ?>
        </div><div class="cl-expert-footer">
            <div class="cl-expert-offer">
                <div class="cl-expert-price">
                    <?php if ($hasPrice): ?>
                        <strong><?= Html::encode($priceAmount) ?></strong><span><?= Html::encode($priceUnit) ?></span>
                    <?php else: ?>
                        <?= Html::encode(Yii::t('app', 'Terms in chat')) ?>
                    <?php endif; ?>
                </div>
            </div>
            <?= Html::a('<i class="fa fa-comment-o" aria-hidden="true"></i>' . Html::encode(Yii::t('app', 'Start chat')) . Html::tag('span', ': ' . Html::encode($name), ['class' => 'sr-only']), $chatUrl, ['class' => 'btn btn-primary cl-expert-chat']) ?>
        </div>
    </div>
</article>
