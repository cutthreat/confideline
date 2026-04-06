<?php

namespace app\modules\admin\components;

use app\models\Admin;
use app\traits\CurrentUserTrait;
use app\traits\RequestResponseTrait;
use Yii;
use yii\base\Action;
use yii\base\ActionFilter;
use yii\web\ForbiddenHttpException;

/**
 * @author Alexander Kononenko <contact@hauntd.me>
 * @package app\modules\admin\components
 */
class Permission extends ActionFilter
{
    use CurrentUserTrait, RequestResponseTrait;

    const USERS = 'users';
    const GROUPS = 'groups';
    const MESSAGES = 'messages';
    const PHOTOS = 'photos';
    const ORDERS = 'orders';
    const PAGES = 'pages';
    const HELP = 'help';
    const NEWS = 'news';
    const LANGUAGES = 'languages';
    const REPORTS = 'reports';
    const VERIFICATIONS = 'verifications';
    const EXPERT_APPLICATIONS = 'expert_applications';
    const GIFTS = 'gifts';
    const BANS = 'bans';

    /**
     * @var array
     */
    public $roles = [Admin::ROLE_ADMIN];
    /**
     * @var string
     */
    public $permission = null;

    /**
     * @param Action $action
     * @return bool
     * @throws ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        $user = $this->getCurrentUser();
        if ($user === null) {
            $this->response->redirect('/');
            return false;
        }
        $admin = $user->admin;

        if (in_array($action->id, $this->except)) {
            return true;
        }

        if ($user->isAdmin) {
            return true;
        }

        if ($this->permission === null && in_array($admin->role, $this->roles)) {
            return true;
        }

        if ($this->permission !== null && in_array($admin->role, $this->roles) && $user->hasPermission($this->permission)) {
            return true;
        }

        throw new ForbiddenHttpException(Yii::t('yii', 'You are not allowed to perform this action.'));
    }

    /**
     * @return array
     */
    public static function getPermissionsList()
    {
        return [
            self::USERS => Yii::t('app', 'Users'),
            self::GROUPS => Yii::t('app', 'Groups'),
            self::MESSAGES => Yii::t('app', 'Messages'),
            self::PHOTOS => Yii::t('app', 'Photos'),
            self::ORDERS => Yii::t('app', 'Orders'),
            self::PAGES => Yii::t('app', 'Pages'),
            self::HELP => Yii::t('app', 'Help'),
            self::NEWS => Yii::t('app', 'News'),
            self::LANGUAGES => Yii::t('app', 'Languages'),
            self::REPORTS => Yii::t('app', 'Reports'),
            self::VERIFICATIONS => Yii::t('app', 'Verifications'),
            self::EXPERT_APPLICATIONS => Yii::t('app', 'Expert applications'),
            self::GIFTS => Yii::t('app', 'Gifts'),
            self::BANS => Yii::t('app', 'Bans'),
        ];
    }
}
