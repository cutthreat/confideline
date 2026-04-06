<?php

namespace app\modules\admin\controllers;

use app\base\ActiveDataProvider;
use app\components\Maintenance;
use app\models\Admin;
use app\models\Currency;
use app\base\Model;
use app\models\Price;
use app\models\Profile;
use app\models\Sex;
use app\modules\admin\components\Permission;
use app\modules\admin\components\AppStatus;
use app\settings\SettingsAction;
use app\traits\AjaxValidationTrait;
use Yii;
use yii\caching\FileCache;
use yii\helpers\ArrayHelper;

/**
 * @author Alexander Kononenko <contact@hauntd.me>
 * @package app\modules\admin\controllers
 */
class SettingsController extends \app\modules\admin\components\Controller
{
    use AjaxValidationTrait;

    /**
     * @return array
     */
    public function actions()
    {
        $settings = Yii::$app->params['settings'];
        if (is_callable($settings)) {
            $settings = $settings();
        }

        return [
            'index' => [
                'class' => SettingsAction::class,
                'category' => 'frontend',
                'title' => Yii::t('app', 'Main settings'),
                'viewFile' => 'settings',
                'items' => $settings['main'],
            ],
            'photo' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'Photo settings'),
                'viewFile' => 'settings',
                'items' => $settings['photos'],
            ],
            'payment' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'Payment settings'),
                'viewFile' => 'payment',
                'viewParams' => function() {
                    $currencies = Currency::find()->all();
                    return [
                        'currencies' => count($currencies) ? $currencies : [new Currency()],
                    ];
                },
                'items' => $settings['payment'],
            ],
            'prices' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'Price settings'),
                'viewFile' => 'prices',
                'viewParams' => function() {
                    $prices = Price::find()->orderBy('credits asc')->all();
                    return [
                        'prices' => count($prices) ? $prices : [new Price()],
                    ];
                },
                'items' => $settings['prices'],
            ],
            'social' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'Social auth'),
                'viewFile' => 'settings',
                'items' => $settings['social'],
            ],
            'translator' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'Translator settings'),
                'viewFile' => 'translator',
                'items' => $settings['translator'],
            ],
            'admin' => [
                'class' => SettingsAction::class,
                'category' => 'admin',
                'title' => Yii::t('app', 'Admin area'),
                'viewFile' => 'admin',
                'viewParams' => function() {
                    return [
                        'dataProvider' => new ActiveDataProvider([
                            'query' => Admin::find(),
                            'sort'=> [
                                'defaultOrder' => [
                                    'role' => SORT_ASC,
                                    'created_at' => SORT_DESC,
                                ],
                            ],
                        ])
                    ];
                },
                'items' => $settings['admin'],
            ],
            'license' => [
                'class' => SettingsAction::class,
                'category' => 'common',
                'title' => Yii::t('app', 'License settings'),
                'viewFile' => 'settings',
                'items' => $settings['license'],
            ],
        ];
    }

    /**
     * @return array
     */
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'access' => [
                'class' => Permission::class,
                'roles' => [Admin::ROLE_ADMIN],
            ],
        ]);
    }

    /**
     * @return \yii\web\Response
     * @throws \yii\base\InvalidConfigException
     */
    public function actionSettingsPrices()
    {
        /** @var Price[] $modelsPrices */
        $modelsPrices = Price::find()->all();

        $oldIDs = ArrayHelper::map($modelsPrices, 'id', 'id');
        $modelsPrices = (new Model)->createMultiple(Price::class, $modelsPrices);
        Model::loadMultiple($modelsPrices, $this->request->post());
        $deletedIDs = array_diff($oldIDs, array_filter(ArrayHelper::map($modelsPrices, 'id', 'id')));

        if (Model::validateMultiple($modelsPrices)) {
            if (!empty($deletedIDs)) {
                Price::deleteAll(['id' => $deletedIDs]);
            }
            foreach ($modelsPrices as $currency) {
                $currency->save();
            }
        }

        $this->session->setFlash('success', Yii::t('app', 'Prices have been updated'));
        return $this->redirect(['prices']);
    }

    /**
     * @return \yii\web\Response
     * @throws \yii\base\InvalidConfigException
     */
    public function actionSettingsCurrencies()
    {
        /** @var Currency[] $modelsCurrencies */
        $modelsCurrencies = Currency::find()->all();

        $oldIDs = ArrayHelper::map($modelsCurrencies, 'id', 'id');
        $modelsCurrencies = (new Model)->createMultiple(Currency::class, $modelsCurrencies);
        Model::loadMultiple($modelsCurrencies, $this->request->post());
        $deletedIDs = array_diff($oldIDs, array_filter(ArrayHelper::map($modelsCurrencies, 'id', 'id')));

        if (Model::validateMultiple($modelsCurrencies)) {
            if (!empty($deletedIDs)) {
                Currency::deleteAll(['id' => $deletedIDs]);
            }
            foreach ($modelsCurrencies as $currency) {
                $currency->save();
            }
        }

        $this->session->setFlash('success', Yii::t('app', 'Currencies have been updated'));
        return $this->redirect(['payment']);
    }

    /**
     * @return string
     * @throws \yii\base\InvalidConfigException
     */
    public function actionGenders()
    {
        /** @var Sex[] $genders */
        $genders = Sex::find()->all();
        $gendersArray = count($genders) ? $genders : [new Sex()];

        if ($this->request->isPost) {
            $oldIDs = ArrayHelper::map($genders, 'id', 'id');
            $genders = (new Model)->createMultiple(Sex::class, $genders);
            Model::loadMultiple($genders, $this->request->post());
            $deletedIDs = array_diff($oldIDs, array_filter(ArrayHelper::map($genders, 'id', 'id')));
            $deletedGenders = ArrayHelper::getColumn(Sex::find()->where(['in', 'id', $deletedIDs])->all(), 'sex');
            if (Model::validateMultiple($genders)) {
                if (!empty($deletedIDs)) {
                    Sex::deleteAll(['id' => $deletedIDs]);
                    Profile::updateAll(['sex' => null], ['in', 'sex', $deletedGenders]);
                }
                foreach ($genders as $gender) {
                    $gender->save();
                }
                $this->session->setFlash('success', Yii::t('app', 'Gender options have been updated'));
                return $this->refresh();
            }
        }

        return $this->render('genders', [
            'genders' => $gendersArray,
        ]);
    }

    /**
     * @return string|\yii\web\Response
     */
    public function actionCachedData()
    {
        if ($this->request->isPost) {
            $type = $this->request->get('type');
            $redirect = $this->request->get('redirect');

            if ($type == 'cache') {
                Maintenance::flushCache();
                $this->session->setFlash('success', Yii::t('app', 'Cached data has been deleted'));
            } elseif ($type == 'thumbnails') {
                Maintenance::flushThumbnails();;
                $this->session->setFlash('success', Yii::t('app', 'Photo thumbnails have been deleted'));
            }

            if ($redirect == 'appStatus') {
                return $this->redirect('app-status');
            }

            return $this->refresh();
        }

        return $this->render('cached-data', [
            'isFileCache' => $this->cache instanceof FileCache,
            'cachePath' => Yii::getAlias('@runtime/cache'),
            'bundleAssetsPath' => Yii::getAlias(Yii::$app->assetManager->basePath),
            'thumbnailsPath' => Yii::getAlias(Yii::$app->glide->cachePath),
        ]);
    }

    /**
     * @return string
     */
    public function actionAppStatus()
    {
        AppStatus::resetStatus();
        $appStatus = AppStatus::getStatus();

        return $this->render('app-status', [
            'appChecks' => AppStatus::getAll(),
            'appStatus' => $appStatus,
        ]);
    }
}
