<?php

namespace app\modules\admin\controllers;

use app\models\Admin;
use app\models\ExpertApplication;
use app\modules\admin\components\Permission;
use app\modules\admin\models\search\ExpertApplicationSearch;
use Yii;
use yii\db\Expression;
use yii\filters\VerbFilter;
use yii\web\NotFoundHttpException;

class ExpertApplicationController extends \app\modules\admin\components\Controller
{
    public $model = ExpertApplication::class;

    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'permission' => [
                'class' => Permission::class,
                'roles' => [Admin::ROLE_ADMIN, Admin::ROLE_MODERATOR],
                'permission' => Permission::EXPERT_APPLICATIONS,
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'update' => ['get', 'post'],
                ],
            ],
        ]);
    }

    public function actionIndex()
    {
        $searchModel = Yii::createObject(ExpertApplicationSearch::class);
        $dataProvider = $searchModel->search($this->request->get());
        $selectedModel = $this->findSelectedModel($dataProvider);

        if ($selectedModel !== null) {
            $selectedModel->scenario = ExpertApplication::SCENARIO_ADMIN;

            if ($selectedModel->load($this->request->post())) {
                $selectedModel->reviewed_at = time();
                $selectedModel->reviewed_by = $this->getCurrentUser()->id;

                if ($selectedModel->save()) {
                    $this->session->setFlash('success', Yii::t('app', 'Expert application has been updated'));
                    return $this->redirect($this->buildIndexRoute($selectedModel->id));
                }
            }
        }

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'selectedModel' => $selectedModel,
            'overview' => $this->buildOverview(),
            'selectedRoute' => $this->buildIndexRoute($selectedModel ? $selectedModel->id : null),
        ]);
    }

    public function actionUpdate($id)
    {
        /** @var ExpertApplication $model */
        $model = $this->findModel(['id' => $id]);
        $model->scenario = ExpertApplication::SCENARIO_ADMIN;

        if ($model->load($this->request->post())) {
            $model->reviewed_at = time();
            $model->reviewed_by = $this->getCurrentUser()->id;

            if ($model->save()) {
                $this->session->setFlash('success', Yii::t('app', 'Expert application has been updated'));
                return $this->redirect(['index', 'selected' => $model->id]);
            }
        }

        return $this->render('update', [
            'model' => $model,
        ]);
    }

    protected function findSelectedModel($dataProvider)
    {
        $selectedId = $this->request->get('selected');
        if ($selectedId !== null && $selectedId !== '') {
            return $this->findModel(['id' => $selectedId]);
        }

        $models = $dataProvider->getModels();
        if (!empty($models)) {
            return reset($models);
        }

        return null;
    }

    protected function buildOverview()
    {
        $rows = ExpertApplication::find()
            ->select(['status', 'count' => new Expression('COUNT(*)')])
            ->groupBy(['status'])
            ->asArray()
            ->all();

        $counts = array_fill_keys(array_keys((new ExpertApplication())->getStatusOptions()), 0);
        foreach ($rows as $row) {
            $counts[$row['status']] = (int) $row['count'];
        }

        return [
            'total' => array_sum($counts),
            'new' => $counts[ExpertApplication::STATUS_NEW],
            'in_review' => $counts[ExpertApplication::STATUS_IN_REVIEW],
            'approved' => $counts[ExpertApplication::STATUS_APPROVED],
        ];
    }

    protected function buildIndexRoute($selectedId = null)
    {
        $params = $this->request->get();
        unset($params['r']);

        if ($selectedId !== null) {
            $params['selected'] = $selectedId;
        } else {
            unset($params['selected']);
        }

        return array_merge(['index'], $params);
    }

    protected function findModel($condition)
    {
        $modelClass = $this->model;
        $model = $modelClass::findOne($condition);
        if ($model === null) {
            throw new NotFoundHttpException('Expert application not found');
        }

        return $model;
    }
}
