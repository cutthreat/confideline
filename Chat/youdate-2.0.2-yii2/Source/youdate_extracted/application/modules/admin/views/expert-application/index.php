<?php

use app\helpers\Html;
use app\helpers\Url;
use app\models\ExpertApplication;
use yii\bootstrap\ActiveForm;
use yii\grid\GridView;
use yii\widgets\DetailView;

/** @var $this \yii\web\View */
/** @var $searchModel \app\modules\admin\models\search\ExpertApplicationSearch */
/** @var $dataProvider \yii\data\ActiveDataProvider */
/** @var $selectedModel \app\models\ExpertApplication|null */
/** @var $overview array */
/** @var $selectedRoute array */

$this->title = Yii::t('app', 'Expert applications');
$this->params['breadcrumbs'][] = ['label' => Yii::t('app', 'Administration')];
$this->params['breadcrumbs'][] = $this->title;

$statusLabel = static function (ExpertApplication $model) {
    $class = 'default';
    switch ($model->status) {
        case ExpertApplication::STATUS_NEW:
            $class = 'danger';
            break;
        case ExpertApplication::STATUS_IN_REVIEW:
            $class = 'primary';
            break;
        case ExpertApplication::STATUS_NEEDS_INFO:
            $class = 'warning';
            break;
        case ExpertApplication::STATUS_APPROVED:
            $class = 'success';
            break;
    }

    return Html::tag('span', Html::encode($model->getStatusOptions()[$model->status] ?? $model->status), ['class' => 'label label-' . $class]);
};

$yesNo = static function ($value) {
    return $value ? Yii::t('app', 'Yes') : Yii::t('app', 'No');
};

$selectedParams = Yii::$app->request->get();
unset($selectedParams['r']);
?>

<?= $this->render('/experts/_nav', ['active' => 'applications']) ?>

<?php if ($this->session->hasFlash('success')): ?>
    <div class="alert alert-success">
        <?= Html::encode($this->session->getFlash('success')) ?>
    </div>
<?php endif; ?>

<div class="row">
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-blue"><i class="fa fa-id-badge"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Yii::t('app', 'All applications') ?></span>
                <span class="info-box-number"><?= (int) $overview['total'] ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-red"><i class="fa fa-inbox"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Yii::t('app', 'New') ?></span>
                <span class="info-box-number"><?= (int) $overview['new'] ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-purple"><i class="fa fa-search"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Yii::t('app', 'In review') ?></span>
                <span class="info-box-number"><?= (int) $overview['in_review'] ?></span>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6 col-xs-12">
        <div class="info-box">
            <span class="info-box-icon bg-green"><i class="fa fa-check"></i></span>
            <div class="info-box-content">
                <span class="info-box-text"><?= Yii::t('app', 'Approved') ?></span>
                <span class="info-box-number"><?= (int) $overview['approved'] ?></span>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-7 col-lg-8">
        <div class="box box-info">
            <div class="box-header with-border">
                <h3 class="box-title"><?= Yii::t('app', 'Applications queue') ?></h3>
                <div class="box-tools pull-right">
                    <span class="label label-default"><?= Yii::t('app', 'Use filters to narrow the queue, then open the selected application on the right.') ?></span>
                </div>
            </div>
            <div class="box-body no-padding">
                <div class="table-responsive">
                    <?= GridView::widget([
                        'dataProvider' => $dataProvider,
                        'filterModel' => $searchModel,
                        'tableOptions' => ['class' => 'table table-hover'],
                        'rowOptions' => static function (ExpertApplication $model) use ($selectedModel) {
                            if ($selectedModel !== null && (int) $selectedModel->id === (int) $model->id) {
                                return ['class' => 'active'];
                            }

                            return [];
                        },
                        'layout' => "{items}\n<div class=\"box-footer clearfix\">{summary}\n{pager}</div>",
                        'columns' => [
                            [
                                'attribute' => 'id',
                                'options' => ['width' => 70],
                                'filterInputOptions' => ['autocomplete' => 'off', 'class' => 'form-control'],
                            ],
                            [
                                'attribute' => 'full_name',
                                'format' => 'raw',
                                'filterInputOptions' => ['autocomplete' => 'off', 'class' => 'form-control'],
                                'value' => static function (ExpertApplication $model) use ($selectedParams) {
                                    $params = $selectedParams;
                                    $params['selected'] = $model->id;
                                    $subtitle = [];
                                    if (!empty($model->display_name)) {
                                        $subtitle[] = Html::encode($model->display_name);
                                    }
                                    if (!empty($model->country)) {
                                        $subtitle[] = Html::encode($model->country);
                                    }

                                    return Html::a(Html::encode($model->full_name), array_merge(['index'], $params), ['data-pjax' => 0]) .
                                        Html::tag('div', implode(' · ', $subtitle), ['class' => 'text-muted']);
                                },
                            ],
                            [
                                'attribute' => 'email',
                                'format' => 'raw',
                                'filterInputOptions' => ['autocomplete' => 'off', 'class' => 'form-control'],
                                'value' => static function (ExpertApplication $model) {
                                    $contact = $model->contact ? Html::tag('div', Html::encode($model->contact), ['class' => 'text-muted']) : '';
                                    return Html::a(Html::encode($model->email), 'mailto:' . $model->email) . $contact;
                                },
                            ],
                            [
                                'attribute' => 'specializations',
                                'filterInputOptions' => ['autocomplete' => 'off', 'class' => 'form-control'],
                            ],
                            [
                                'attribute' => 'status',
                                'format' => 'raw',
                                'filter' => $searchModel->getStatusOptions(),
                                'value' => $statusLabel,
                            ],
                            [
                                'attribute' => 'created_at',
                                'format' => 'datetime',
                                'filter' => false,
                                'options' => ['width' => 170],
                            ],
                        ],
                    ]) ?>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-5 col-lg-4">
        <?php if ($selectedModel === null): ?>
            <div class="box box-default">
                <div class="box-header with-border">
                    <h3 class="box-title"><?= Yii::t('app', 'Review') ?></h3>
                </div>
                <div class="box-body">
                    <p class="text-muted"><?= Yii::t('app', 'No applications match the current filters.') ?></p>
                </div>
            </div>
        <?php else: ?>
            <div class="box box-default">
                <div class="box-header with-border">
                    <h3 class="box-title"><?= Yii::t('app', 'Application #{0}', $selectedModel->id) ?></h3>
                    <div class="box-tools pull-right">
                        <?= $statusLabel($selectedModel) ?>
                    </div>
                </div>
                <div class="box-body no-padding">
                    <?= DetailView::widget([
                        'model' => $selectedModel,
                        'options' => ['class' => 'table table-striped detail-view'],
                        'attributes' => [
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
                                'value' => $yesNo($selectedModel->consent_review),
                            ],
                            [
                                'attribute' => 'consent_followup',
                                'value' => $yesNo($selectedModel->consent_followup),
                            ],
                            [
                                'attribute' => 'consent_data',
                                'value' => $yesNo($selectedModel->consent_data),
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

            <div class="box box-primary">
                <?php $form = ActiveForm::begin(['action' => $selectedRoute]); ?>
                <div class="box-header with-border">
                    <h3 class="box-title"><?= Yii::t('app', 'Review') ?></h3>
                </div>
                <div class="box-body">
                    <?= $form->errorSummary($selectedModel) ?>
                    <?= $form->field($selectedModel, 'status')->dropDownList($selectedModel->getStatusOptions(), ['prompt' => '']) ?>
                    <?= $form->field($selectedModel, 'admin_notes')->textarea(['rows' => 10]) ?>

                    <div class="form-group">
                        <label class="control-label"><?= Yii::t('app', 'Reviewed by') ?></label>
                        <div><?= Html::encode($selectedModel->reviewedByUser->username ?? Yii::t('app', 'Not reviewed yet')) ?></div>
                    </div>
                    <div class="form-group">
                        <label class="control-label"><?= Yii::t('app', 'Reviewed at') ?></label>
                        <div><?= $selectedModel->reviewed_at ? Yii::$app->formatter->asDatetime($selectedModel->reviewed_at) : Yii::t('app', 'Not reviewed yet') ?></div>
                    </div>
                </div>
                <div class="box-footer">
                    <?= Html::submitButton(Yii::t('app', 'Save'), ['class' => 'btn btn-primary']) ?>
                    <?= Html::a(Yii::t('app', 'Open standalone review'), ['update', 'id' => $selectedModel->id], ['class' => 'btn btn-default']) ?>
                </div>
                <?php ActiveForm::end(); ?>
            </div>
        <?php endif; ?>
    </div>
</div>
