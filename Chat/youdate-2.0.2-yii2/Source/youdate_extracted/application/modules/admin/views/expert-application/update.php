<?php

use app\helpers\Html;
use app\models\ExpertApplication;
use yii\bootstrap\ActiveForm;
use yii\widgets\DetailView;

/** @var $this \yii\web\View */
/** @var $model \app\models\ExpertApplication */

$this->title = Yii::t('app', 'Review expert application');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Experts')];
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Expert applications'), 'url' => ['index']];
$this->params['breadcrumbs'][] = $this->title;

$yesNo = static function ($value) {
    return $value ? Yii::t('app', 'Yes') : Yii::t('app', 'No');
};
?>
<?= $this->render('/experts/_nav', ['active' => 'applications']) ?>
<div class="row">
    <div class="col-md-8">
        <div class="box box-default">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Yii::t('app', 'Application #{0}', $model->id) ?></h3>
            </div>
            <div class="box-body no-padding">
                <?= DetailView::widget([
                    'model' => $model,
                    'options' => ['class' => 'table table-striped detail-view'],
                    'attributes' => [
                        'id',
                        'full_name',
                        'display_name',
                        'email:email',
                        'contact',
                        'specializations:ntext',
                        'languages',
                        'experience',
                        'country',
                        'timezone',
                        'availability:ntext',
                        'about:ntext',
                        'links:ntext',
                        [
                            'attribute' => 'consent_review',
                            'value' => $yesNo($model->consent_review),
                        ],
                        [
                            'attribute' => 'consent_followup',
                            'value' => $yesNo($model->consent_followup),
                        ],
                        [
                            'attribute' => 'consent_data',
                            'value' => $yesNo($model->consent_data),
                        ],
                        [
                            'attribute' => 'created_at',
                            'format' => 'datetime',
                        ],
                        [
                            'attribute' => 'updated_at',
                            'format' => 'datetime',
                        ],
                    ],
                ]) ?>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="box box-primary">
            <?php $form = ActiveForm::begin(); ?>
            <div class="box-header with-border">
                <h3 class="box-title"><?= Yii::t('app', 'Review') ?></h3>
            </div>
            <div class="box-body">
                <?= $form->errorSummary($model) ?>
                <?= $form->field($model, 'status')->dropDownList($model->getStatusOptions(), ['prompt' => '']) ?>
                <?= $form->field($model, 'admin_notes')->textarea(['rows' => 12]) ?>
                <div class="form-group">
                    <label class="control-label"><?= Yii::t('app', 'Reviewed by') ?></label>
                    <div><?= Html::encode($model->reviewedByUser->username ?? Yii::t('app', 'Not reviewed yet')) ?></div>
                </div>
                <div class="form-group">
                    <label class="control-label"><?= Yii::t('app', 'Reviewed at') ?></label>
                    <div><?= $model->reviewed_at ? Yii::$app->formatter->asDatetime($model->reviewed_at) : Yii::t('app', 'Not reviewed yet') ?></div>
                </div>
            </div>
            <div class="box-footer">
                <?= Html::submitButton(Yii::t('app', 'Save'), ['class' => 'btn btn-primary']) ?>
                <?= Html::a(Yii::t('app', 'Back'), ['index'], ['class' => 'btn btn-default']) ?>
            </div>
            <?php ActiveForm::end(); ?>
        </div>
    </div>
</div>
