<?php

use app\helpers\Html;
use app\settings\SettingsForm;

/** @var $settingsManager \app\settings\SettingsManager */
/** @var $settingsModel \app\settings\SettingsModel */
/** @var $this \yii\web\View */
/** @var $title string */

$this->title = Yii::t('app', 'Expert landing page');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Administration')];
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Expert applications'), 'url' => ['expert-application/index']];
$this->params['breadcrumbs'][] = $this->title;

$pageUrl = Yii::$app->urlManager->createAbsoluteUrl(['/experts/apply']);
$enabled = $settingsModel->enabled === null ? true : (bool) $settingsModel->enabled;
$heroTitle = $settingsModel->heroTitle ?: Yii::t('app', 'Помогайте людям как эксперт в спокойной и доверительной среде Confideline.');
$heroLead = $settingsModel->heroLead ?: Yii::t('app', 'Мы ищем специалистов, которые умеют слышать, бережно вести диалог и давать сильную профессиональную опору.');
?>

<?= $this->render('/experts/_nav', ['active' => 'landing']) ?>

<div class="row">
    <div class="col-md-7 col-lg-8">
        <?= SettingsForm::widget([
            'manager' => $settingsManager,
            'model' => $settingsModel,
            'formView' => '@app/modules/admin/views/partials/settings_form',
            'title' => $title,
        ]) ?>
    </div>
    <div class="col-md-5 col-lg-4">
        <div class="box box-info">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Yii::t('app', 'Frontend route') ?></h3>
            </div>
            <div class="box-body">
                <p>
                    <strong><?= Yii::t('app', 'Status') ?>:</strong>
                    <?php if ($enabled): ?>
                        <span class="label label-success"><?= Yii::t('app', 'Enabled') ?></span>
                    <?php else: ?>
                        <span class="label label-default"><?= Yii::t('app', 'Disabled') ?></span>
                    <?php endif; ?>
                </p>
                <p><strong><?= Yii::t('app', 'Public URL') ?>:</strong></p>
                <p><?= Html::a(Html::encode($pageUrl), $pageUrl, ['target' => '_blank']) ?></p>
                <p class="text-muted"><?= Yii::t('app', 'This tab controls the copy for the public expert application page. Styling stays in the theme; this screen only manages content and route state.') ?></p>
            </div>
        </div>

        <div class="box box-default">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Yii::t('app', 'Current preview') ?></h3>
            </div>
            <div class="box-body">
                <p><strong><?= Html::encode($heroTitle) ?></strong></p>
                <p><?= Html::encode($heroLead) ?></p>
                <hr>
                <dl class="dl-horizontal">
                    <dt><?= Yii::t('app', 'Primary CTA') ?></dt>
                    <dd><?= Html::encode($settingsModel->primaryCtaLabel ?: '-') ?></dd>
                    <dt><?= Yii::t('app', 'Requirements') ?></dt>
                    <dd><?= Html::encode($settingsModel->requirementsTitle ?: '-') ?></dd>
                    <dt><?= Yii::t('app', 'Process') ?></dt>
                    <dd><?= Html::encode($settingsModel->processTitle ?: '-') ?></dd>
                    <dt><?= Yii::t('app', 'FAQ') ?></dt>
                    <dd><?= Html::encode($settingsModel->faqTitle ?: '-') ?></dd>
                    <dt><?= Yii::t('app', 'Notifications') ?></dt>
                    <dd><?= Html::encode($settingsModel->notificationEmail ?: '-') ?></dd>
                </dl>
            </div>
        </div>
    </div>
</div>
