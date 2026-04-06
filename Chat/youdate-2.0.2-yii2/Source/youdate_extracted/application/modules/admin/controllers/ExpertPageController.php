<?php

namespace app\modules\admin\controllers;

use app\models\Admin;
use app\modules\admin\components\Permission;
use app\settings\SettingsAction;
use Yii;

class ExpertPageController extends \app\modules\admin\components\Controller
{
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'permission' => [
                'class' => Permission::class,
                'roles' => [Admin::ROLE_ADMIN, Admin::ROLE_MODERATOR],
                'permission' => Permission::EXPERT_APPLICATIONS,
            ],
        ]);
    }

    public function actions()
    {
        return [
            'index' => [
                'class' => SettingsAction::class,
                'category' => 'expert.page',
                'title' => Yii::t('app', 'Expert landing page'),
                'viewFile' => 'settings',
                'items' => $this->getSettings(),
            ],
        ];
    }

    protected function getSettings()
    {
        return [
            'enabled' => [
                'type' => 'checkbox',
                'help' => Yii::t('app', 'Enable expert landing page for frontend route.'),
            ],
            'heroTitle' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Main headline in the first screen.'),
            ],
            'heroLead' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Intro text under the main headline.'),
            ],
            'primaryCtaLabel' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Primary call-to-action label.'),
            ],
            'requirementsTitle' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Title for requirements block.'),
            ],
            'processTitle' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Title for process block.'),
            ],
            'faqTitle' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Title for FAQ block.'),
            ],
            'submitSuccessMessage' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Success message after application submit.'),
            ],
            'notificationEmail' => [
                'type' => 'text',
                'help' => Yii::t('app', 'Email for notifications about new expert applications.'),
            ],
        ];
    }
}
