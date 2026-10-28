<?php
namespace app\assets;

use yii\web\AssetBundle;

class CatalogFilterAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/catalog-filter';
    public $css = ['catalog-filter.css'];
    public $js = ['catalog-filter.js'];
    public $depends = ['yii\web\YiiAsset'];
}
