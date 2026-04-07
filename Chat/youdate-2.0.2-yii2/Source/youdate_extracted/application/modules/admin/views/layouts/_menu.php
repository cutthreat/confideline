<?php

use app\modules\admin\components\Permission;
use app\modules\admin\widgets\Menu;

/** @var \app\base\View $this */

$user = $this->getCurrentUser();
$admin = $user->admin;
$menuItems = [
    [
        'url' => ['default/index'],
        'icon' => 'fa fa-cog',
        'label' => Yii::t('app', 'Dashboard'),
        'active' => ($this->context instanceof app\modules\admin\controllers\DefaultController),
        'order' => 0,
    ],
    [
        'label' => Yii::t('app', 'Content'),
        'options' => ['class' => 'header'],
        'order' => 100,
    ],
    [
        'url' => ['user/index'],
        'icon' => 'fa fa-user',
        'label' => Yii::t('app', 'Users'),
        'active' => ($this->context instanceof app\modules\admin\controllers\UserController),
        'order' => 110,
        'visible' => $user->hasPermission(Permission::USERS),
    ],
    [
        'url' => ['group/index'],
        'icon' => 'fa fa-users',
        'label' => Yii::t('app', 'Groups'),
        'active' => ($this->context instanceof app\modules\admin\controllers\GroupController),
        'order' => 112,
        'visible' => $user->hasPermission(Permission::GROUPS),
    ],
    [
        'url' => ['message/chat'],
        'icon' => 'fa fa-envelope',
        'label' => Yii::t('app', 'Messages'),
        'active' => ($this->context instanceof app\modules\admin\controllers\MessageController),
        'order' => 115,
        'visible' => $user->hasPermission(Permission::MESSAGES),
        'items' => [
            [
                'url' => ['message/chat'],
                'icon' => 'fa fa-circle-o',
                'label' => Yii::t('app', 'Chat shell'),
            ],
            [
                'url' => ['message/expert-preview'],
                'icon' => 'fa fa-circle-o',
                'label' => Yii::t('app', 'Expert CRM preview'),
            ],
        ],
    ],
    [
        'url' => ['photo/index'],
        'icon' => 'fa fa-photo',
        'label' => Yii::t('app', 'Photos'),
        'active' => ($this->context instanceof app\modules\admin\controllers\PhotoController),
        'order' => 120,
        'badge' => $this->params['admin.counters.photosUnverified'] ?? null,
        'badgeClass' => 'success',
        'visible' => $user->hasPermission(Permission::PHOTOS),
    ],
    [
        'url' => ['order/index'],
        'icon' => 'fa fa-money',
        'label' => Yii::t('app', 'Orders'),
        'active' => ($this->context instanceof app\modules\admin\controllers\OrderController),
        'order' => 125,
        'visible' => $user->hasPermission(Permission::ORDERS),
    ],
    [
        'url' => ['page/index'],
        'icon' => 'fa fa-file',
        'label' => Yii::t('app', 'Pages'),
        'active' => ($this->context instanceof app\modules\admin\controllers\PageController),
        'order' => 130,
        'visible' => $user->hasPermission(Permission::PAGES),
    ],
    [
        'url' => ['help/index'],
        'icon' => 'fa fa-question-circle',
        'label' => Yii::t('app', 'Help'),
        'active' => ($this->context instanceof app\modules\admin\controllers\HelpController),
        'order' => 133,
        'visible' => $user->hasPermission(Permission::HELP),
    ],
    [
        'url' => ['news/index'],
        'icon' => 'fa fa-newspaper-o',
        'label' => Yii::t('app', 'News'),
        'active' => ($this->context instanceof app\modules\admin\controllers\NewsController),
        'order' => 135,
        'visible' => $user->hasPermission(Permission::NEWS),
    ],
    [
        'url' => ['language/list'],
        'icon' => 'fa fa-globe',
        'label' => Yii::t('app', 'Languages'),
        'active' => ($this->context instanceof app\modules\admin\controllers\LanguageController),
        'order' => 140,
        'visible' => $user->hasPermission(Permission::LANGUAGES),
    ],
    [
        'url' => ['report/index'],
        'icon' => 'fa fa-flag',
        'label' => Yii::t('app', 'Reports'),
        'active' => ($this->context instanceof app\modules\admin\controllers\ReportController),
        'order' => 150,
        'badge' => $this->params['admin.counters.reportsNew'] ?? null,
        'badgeClass' => 'success',
        'visible' => $user->hasPermission(Permission::REPORTS),
    ],
    [
        'url' => ['verification/index'],
        'icon' => 'fa fa-check-circle',
        'label' => Yii::t('app', 'Verifications'),
        'active' => ($this->context instanceof app\modules\admin\controllers\VerificationController),
        'order' => 160,
        'badge' => $this->params['admin.counters.verificationsNew'] ?? null,
        'badgeClass' => 'success',
        'visible' => $user->hasPermission(Permission::VERIFICATIONS),
    ],
    [
        'url' => ['expert-application/index'],
        'icon' => 'fa fa-id-badge',
        'label' => Yii::t('app', 'Expert applications'),
        'active' => (
            $this->context instanceof app\modules\admin\controllers\ExpertApplicationController ||
            $this->context instanceof app\modules\admin\controllers\ExpertPageController
        ),
        'order' => 165,
        'badge' => $this->params['admin.counters.expertApplicationsNew'] ?? null,
        'badgeClass' => 'danger',
        'visible' => $user->hasPermission(Permission::EXPERT_APPLICATIONS),
    ],
    [
        'url' => ['gift/categories'],
        'icon' => 'fa fa-gift',
        'label' => Yii::t('app', 'Gifts'),
        'active' => ($this->context instanceof app\modules\admin\controllers\GiftController),
        'order' => 170,
        'visible' => $user->hasPermission(Permission::GIFTS),
    ],
    [
        'url' => ['ban/index'],
        'icon' => 'fa fa-ban',
        'label' => Yii::t('app', 'Bans'),
        'active' => ($this->context instanceof app\modules\admin\controllers\BanController),
        'order' => 180,
        'visible' => $user->hasPermission(Permission::BANS),
    ],
];

if ($user->isAdmin) {
    $menuItems = array_merge($menuItems, [
        [
            'label' => Yii::t('app', 'System'),
            'options' => ['class' => 'header'],
            'order' => 200,
        ],
        [
            'url' => ['settings/index'],
            'icon' => 'fa fa-cog',
            'label' => Yii::t('app', 'Settings'),
            'active' => (
                $this->context instanceof app\modules\admin\controllers\SettingsController &&
                $this->context->action->id !== 'translator'
            ),
            'order' => 210,
        ],
        [
            'url' => ['settings/translator'],
            'icon' => 'fa fa-language',
            'label' => Yii::t('app', 'Translator'),
            'active' => (
                $this->context instanceof app\modules\admin\controllers\SettingsController &&
                $this->context->action->id === 'translator'
            ),
            'order' => 212,
        ],
        [
            'url' => ['theme/settings'],
            'icon' => 'fa fa-cog',
            'label' => Yii::t('app', 'Theme settings'),
            'order' => 215,
        ],
        [
            'url' => ['log/index'],
            'icon' => 'fa fa-file-text-o',
            'label' => Yii::t('app', 'Logs'),
            'active' => ($this->context instanceof app\modules\admin\controllers\LogController),
            'order' => 220,
            'badge' => $this->params['admin.counters.errorLogs'] ?? null,
            'badgeClass' => 'danger',
        ],
        [
            'url' => ['profile-field/index'],
            'icon' => 'fa fa-vcard',
            'label' => Yii::t('app', 'Profile fields'),
            'active' => (
                $this->context instanceof app\modules\admin\controllers\ProfileFieldCategoryController ||
                $this->context instanceof app\modules\admin\controllers\ProfileFieldController
            ),
            'order' => 230,
            'items' => [
                [
                    'url' => ['profile-field/index'],
                    'icon' => 'fa fa-circle-o',
                    'label' => Yii::t('app', 'Profile fields'),
                ],
                [
                    'url' => ['profile-field-category/index'],
                    'icon' => 'fa fa-circle-o',
                    'label' => Yii::t('app', 'Field categories'),
                ],
            ],
        ],
        [
            'url' => ['theme/index'],
            'icon' => 'fa fa-file-code-o',
            'label' => Yii::t('app', 'Themes'),
            'active' => ($this->context instanceof app\modules\admin\controllers\ThemeController),
            'order' => 240,
        ],
        [
            'url' => ['plugin/index'],
            'icon' => 'fa fa-code',
            'label' => Yii::t('app', 'Plugins'),
            'active' => ($this->context instanceof app\modules\admin\controllers\PluginController),
            'order' => 250,
        ],
    ]);
}

echo Menu::widget([
    'sortItems' => true,
    'options' => ['class' => 'sidebar-menu'],
    'items' => $menuItems,
]);
