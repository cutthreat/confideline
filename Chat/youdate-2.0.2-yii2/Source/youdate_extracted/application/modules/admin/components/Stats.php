<?php

namespace app\modules\admin\components;

use app\models\Log;
use app\models\Photo;
use app\models\ExpertApplication;
use app\models\User;
use app\models\Group;
use app\modules\admin\models\Report;
use app\modules\admin\models\Verification;
use yii\base\Component;
use yii\log\Logger;

/**
 * @author Alexander Kononenko <contact@hauntd.me>
 * @package app\modules\admin\components
 */
class Stats extends Component
{
    /**
     * @var array
     */
    protected $counters;

    /**
     * @return array
     */
    public function getCounters()
    {
        if (isset($this->counters)) {
            return $this->counters;
        }

        $this->counters = [
            'users' => User::find()->count(),
            'usersOnline' => User::find()->online()->count(),
            'photos' => Photo::find()->count(),
            'photosUnverified' => Photo::find()->unverified()->count(),
            'groups' => Group::find()->count(),
            'reportsNew' => Report::find()->newOnly()->count(),
            'verificationsNew' => Verification::find()->newOnly()->count(),
            'expertApplicationsNew' => ExpertApplication::find()->andWhere(['status' => ExpertApplication::STATUS_NEW])->count(),
            'errorLogs' => Log::find()->andWhere(['level' => Logger::LEVEL_ERROR])->count(),
        ];

        return $this->counters;
    }

    /**
     * @param $key
     * @param null $default
     * @return mixed|null
     */
    public function getCount($key, $default = null)
    {
        return $this->counters[$key] ?? $default;
    }
}
