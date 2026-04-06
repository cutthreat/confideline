<?php

namespace custom\assets;

use yii\web\AssetBundle;

class ExpertLandingAsset extends AssetBundle
{
    public $basePath = '@extendedTheme/static';
    public $baseUrl = '@extendedThemeUrl/static';

    public $css = [
        'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
        '/YouDate-last/css/bootstrap.css',
        '/YouDate-last/css/home.css',
        'css/expert-registration.css',
    ];

    public $js = [
        'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js',
        'js/expert-registration.js',
    ];

    public $depends = [
        'yii\web\YiiAsset',
    ];
}
