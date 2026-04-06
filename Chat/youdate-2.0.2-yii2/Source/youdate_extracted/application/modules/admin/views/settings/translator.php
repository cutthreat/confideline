<?php

use app\helpers\Html;
use app\helpers\Url;
use yii\bootstrap\ActiveForm;
use yii\bootstrap\Alert;

/** @var $settingsModel \app\settings\SettingsModel */
/** @var $this \yii\web\View */

$title = Yii::t('app', 'Translator settings');
$this->title = $title;
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Settings'), 'url' => ['settings/index']];
$this->params['breadcrumbs'][] = ['label' => $title, 'url' => Url::current()];

$itemsByAlias = [];
foreach ($settingsModel->items as $item) {
    $itemsByAlias[$item['alias']] = $item;
}

$message = Yii::$app->session->getFlash('settings');

$renderField = function (ActiveForm $form, $alias) use ($itemsByAlias, $settingsModel) {
    if (!isset($itemsByAlias[$alias])) {
        return '';
    }

    $element = $itemsByAlias[$alias];
    $type = isset($element['type']) ? $element['type'] : 'text';
    $help = isset($element['help']) ? $element['help'] : null;

    switch ($type) {
        case 'checkbox':
            return $form->field($settingsModel, $alias)->checkbox()->hint($help);
        case 'dropdown':
            $options = is_callable($element['options']) ? $element['options']() : $element['options'];
            return $form->field($settingsModel, $alias)
                ->dropDownList($options, ['prompt' => Yii::t('app', '-- Select --')])
                ->hint($help);
        default:
            return $form->field($settingsModel, $alias)->hint($help);
    }
};

$generalFields = [
    'translatorEnabled',
    'translatorDefaultProvider',
    'translatorAllowProviderFallback',
    'translatorCacheEnabled',
];
$deeplFields = [
    'translatorDeeplEnabled',
    'translatorDeeplApiKey',
    'translatorDeeplUsePro',
];
$googleFields = [
    'translatorGoogleEnabled',
    'translatorGoogleApiKey',
    'translatorGoogleProjectId',
];
$amazonFields = [
    'translatorAmazonEnabled',
    'translatorAmazonAccessKeyId',
    'translatorAmazonSecretAccessKey',
    'translatorAmazonRegion',
];

$this->beginContent('@app/modules/admin/views/settings/_layout.php');
?>

<div class="callout callout-info">
    <h4><?= Html::encode(Yii::t('app', 'Translator integration')) ?></h4>
    <p><?= Html::encode(Yii::t('app', 'This section stores provider credentials for the expert chat translator. DeepL is the primary provider, while Google Cloud Translation and Amazon Translate are prepared as backup integrations.')) ?></p>
</div>

<div class="row">
    <div class="col-sm-4">
        <div class="small-box bg-aqua">
            <div class="inner">
                <h3>DeepL</h3>
                <p><?= Html::encode(Yii::t('app', 'Primary provider for expert chat translations')) ?></p>
            </div>
            <div class="icon"><i class="fa fa-language"></i></div>
        </div>
    </div>
    <div class="col-sm-4">
        <div class="small-box bg-green">
            <div class="inner">
                <h3>Google</h3>
                <p><?= Html::encode(Yii::t('app', 'Optional fallback for Cloud Translation')) ?></p>
            </div>
            <div class="icon"><i class="fa fa-google"></i></div>
        </div>
    </div>
    <div class="col-sm-4">
        <div class="small-box bg-yellow">
            <div class="inner">
                <h3>Amazon</h3>
                <p><?= Html::encode(Yii::t('app', 'Optional fallback for Amazon Translate')) ?></p>
            </div>
            <div class="icon"><i class="fa fa-amazon"></i></div>
        </div>
    </div>
</div>

<div class="box box-primary">
    <div class="box-header with-border">
        <h3 class="box-title"><?= Html::encode($title) ?></h3>
    </div>
    <?php $form = ActiveForm::begin(); ?>
    <div class="box-body">
        <?php if ($message): ?>
            <?= Alert::widget([
                'options' => ['class' => 'alert-success'],
                'body' => $message,
            ]) ?>
        <?php endif; ?>

        <div class="row">
            <div class="col-sm-12">
                <h4><?= Html::encode(Yii::t('app', 'General mode')) ?></h4>
                <p class="text-muted"><?= Html::encode(Yii::t('app', 'Controls how translation behaves in the expert chat and which provider is preferred.')) ?></p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($generalFields as $alias): ?>
                <div class="col-sm-6">
                    <?= $renderField($form, $alias) ?>
                </div>
            <?php endforeach; ?>
        </div>

        <hr>

        <div class="row">
            <div class="col-sm-12">
                <h4>DeepL</h4>
                <p class="text-muted"><?= Html::encode(Yii::t('app', 'Recommended default provider for highest translation quality.')) ?></p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($deeplFields as $alias): ?>
                <div class="col-sm-6">
                    <?= $renderField($form, $alias) ?>
                </div>
            <?php endforeach; ?>
        </div>

        <hr>

        <div class="row">
            <div class="col-sm-12">
                <h4>Google Cloud Translation</h4>
                <p class="text-muted"><?= Html::encode(Yii::t('app', 'Keep disabled until Google credentials are provided and tested.')) ?></p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($googleFields as $alias): ?>
                <div class="col-sm-6">
                    <?= $renderField($form, $alias) ?>
                </div>
            <?php endforeach; ?>
        </div>

        <hr>

        <div class="row">
            <div class="col-sm-12">
                <h4>Amazon Translate</h4>
                <p class="text-muted"><?= Html::encode(Yii::t('app', 'AWS credentials are stored here only for the translator integration path.')) ?></p>
            </div>
        </div>
        <div class="row">
            <?php foreach ($amazonFields as $alias): ?>
                <div class="col-sm-6">
                    <?= $renderField($form, $alias) ?>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="alert alert-warning" style="margin-top: 15px;">
            <?= Html::encode(Yii::t('app', 'Operational note: the chat-side "Translate" button should call the currently selected provider, save the translated text as a derived artifact, and never overwrite the original message body.')) ?>
        </div>
    </div>
    <div class="box-footer">
        <?= Html::submitButton(Yii::t('app', 'Save'), ['class' => 'btn btn-primary']) ?>
    </div>
    <?php ActiveForm::end(); ?>
</div>

<?php $this->endContent(); ?>
