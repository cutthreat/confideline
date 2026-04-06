<?php

namespace custom\controllers;

use app\base\Controller;
use app\models\ExpertApplication;
use Yii;
use yii\web\NotFoundHttpException;

class ExpertsController extends Controller
{
    public function actionApply()
    {
        $pageSettings = $this->getPageSettings();
        if (!$pageSettings['enabled']) {
            throw new NotFoundHttpException();
        }

        $model = Yii::createObject(ExpertApplication::class);
        $model->scenario = ExpertApplication::SCENARIO_FRONTEND;
        $model->status = ExpertApplication::STATUS_NEW;

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->session->setFlash('success', $pageSettings['submitSuccessMessage']);
            return $this->refresh();
        }

        return $this->render('apply', [
            'model' => $model,
            'pageSettings' => $pageSettings,
        ]);
    }

    protected function getPageSettings()
    {
        return [
            'enabled' => (bool) Yii::$app->settings->get('expert.page', 'enabled', true),
            'heroTitle' => Yii::$app->settings->get('expert.page', 'heroTitle', 'Помогайте людям как эксперт в спокойной и доверительной среде Confideline.'),
            'heroLead' => Yii::$app->settings->get('expert.page', 'heroLead', 'Мы ищем специалистов, которые умеют слышать, бережно вести диалог и давать сильную профессиональную опору. Здесь вы сразу видите формат работы, ожидания и следующий шаг после заявки.'),
            'primaryCtaLabel' => Yii::$app->settings->get('expert.page', 'primaryCtaLabel', 'Оставить заявку'),
            'requirementsTitle' => Yii::$app->settings->get('expert.page', 'requirementsTitle', 'Кого ищем'),
            'processTitle' => Yii::$app->settings->get('expert.page', 'processTitle', 'Как это работает'),
            'faqTitle' => Yii::$app->settings->get('expert.page', 'faqTitle', 'Короткие ответы до контакта'),
            'submitSuccessMessage' => Yii::$app->settings->get('expert.page', 'submitSuccessMessage', Yii::t('app', 'Your application has been submitted. We will contact you after review.')),
            'notificationEmail' => Yii::$app->settings->get('expert.page', 'notificationEmail', ''),
        ];
    }
}
